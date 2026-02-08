"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

// In-memory cache: "token:timePeriod" → { data, timestamp }
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(token, timePeriod) {
  return `${token.slice(0, 8)}:${timePeriod}`;
}

export default function useSpotifyData({ timePeriod, contentType, gridSize }) {
  const { data: session, status, update } = useSession();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insufficientData, setInsufficientData] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const abortRef = useRef(null);

  const refetch = useCallback(() => {
    if (session?.accessToken) {
      queryCache.delete(getCacheKey(session.accessToken, timePeriod));
    }
    setFetchKey((k) => k + 1);
  }, [session?.accessToken, timePeriod]);

  // Auto sign-out on unrecoverable token error
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/" });
    }
  }, [session?.error]);

  // Fetch raw data from Spotify (or cache)
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session?.accessToken) {
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setInsufficientData(false);

      try {
        let rawItems;
        const cacheKey = getCacheKey(session.accessToken, timePeriod);
        const cached = queryCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          rawItems = cached.data;
        } else {
          const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timePeriod}`;
          let token = session.accessToken;

          let res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });

          if (res.status === 401) {
            const refreshed = await update();
            if (!refreshed?.accessToken) {
              signOut({ callbackUrl: "/" });
              return;
            }
            token = refreshed.accessToken;
            res = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            });
          }

          if (!res.ok) throw new Error(`Spotify API ${res.status}`);

          const data = await res.json();
          rawItems = data.items ?? [];

          queryCache.set(getCacheKey(token, timePeriod), {
            data: rawItems,
            timestamp: Date.now(),
          });
        }

        if (cancelled) return;

        if (rawItems.length === 0) {
          setTopItems([]);
          setInsufficientData(true);
          return;
        }

        const minRequired = Math.min(gridSize, 9);

        if (contentType === "albums") {
          const seen = new Map();
          for (const track of rawItems) {
            if (!seen.has(track.album.id)) {
              seen.set(track.album.id, {
                ...track.album,
                trackName: track.name,
              });
            }
          }
          const albums = [...seen.values()];
          if (albums.length < minRequired) setInsufficientData(true);
          setTopItems(albums.slice(0, gridSize));
        } else {
          if (rawItems.length < minRequired) setInsufficientData(true);
          setTopItems(rawItems.slice(0, gridSize));
        }
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        console.error("[Spotify]", err);
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [session?.accessToken, status, timePeriod, contentType, gridSize, fetchKey, update]);

  return {
    topItems,
    loading,
    error,
    refetch,
    insufficientData,
    isAuthenticated: status === "authenticated",
    isSessionLoading: status === "loading",
  };
}
