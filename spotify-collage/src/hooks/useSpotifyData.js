"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";

export function useSpotifyData({ timePeriod, contentType, gridSize }) {
  const { data: session, status, update } = useSession();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchKey, setFetchKey] = useState(0);

  // Force a refresh of data
  const refetch = useCallback(() => {
    setFetchKey((prev) => prev + 1);
  }, []);

  // Handle session errors (e.g., token refresh failed)
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      // Token refresh failed, force re-login
      signOut({ callbackUrl: "/" });
    }
  }, [session?.error]);

  useEffect(() => {
    // Don't fetch if not authenticated or no access token
    if (status !== "authenticated" || !session?.accessToken) {
      console.log("[useSpotifyData] Not fetching:", { status, hasAccessToken: !!session?.accessToken });
      setTopItems([]);
      return;
    }

    const controller = new AbortController();
    
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timePeriod}`;
        
        console.log("[useSpotifyData] Fetching from Spotify...");

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          signal: controller.signal,
        });

        console.log("[useSpotifyData] Response status:", response.status);

        // Handle token expiration
        if (response.status === 401) {
          console.log("[useSpotifyData] Token expired, refreshing...");
          // Try to refresh the session
          const updatedSession = await update();
          
          if (!updatedSession?.accessToken) {
            // Session refresh failed, sign out
            signOut({ callbackUrl: "/" });
            return;
          }
          
          // Retry with new token
          const retryResponse = await fetch(url, {
            headers: {
              Authorization: `Bearer ${updatedSession.accessToken}`,
            },
            signal: controller.signal,
          });

          if (!retryResponse.ok) {
            throw new Error(`Spotify API error: ${retryResponse.status}`);
          }

          const data = await retryResponse.json();
          processData(data);
          return;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("[useSpotifyData] Error response:", errorBody);
          throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("[useSpotifyData] Got data, items:", data.items?.length);
        processData(data);
      } catch (err) {
        if (err.name === "AbortError") return;
        
        console.error("[useSpotifyData] Error fetching Spotify data:", err);
        setError(err.message);
        setTopItems([]);
      } finally {
        setLoading(false);
      }
    }

    function processData(data) {
      if (!data.items || data.items.length === 0) {
        setTopItems([]);
        return;
      }

      if (contentType === "albums") {
        const albumsMap = new Map();
        for (const track of data.items) {
          const album = track.album;
          if (!albumsMap.has(album.id)) {
            albumsMap.set(album.id, {
              ...album,
              trackName: track.name,
            });
          }
        }
        setTopItems(Array.from(albumsMap.values()).slice(0, gridSize));
      } else {
        setTopItems(data.items.slice(0, gridSize));
      }
    }

    fetchData();

    return () => {
      controller.abort();
    };
  }, [session?.accessToken, status, timePeriod, contentType, gridSize, fetchKey, update]);

  return {
    topItems,
    loading,
    error,
    refetch,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
