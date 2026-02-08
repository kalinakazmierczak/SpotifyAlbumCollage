import { NextResponse } from "next/server";

/**
 * Proxy images from Spotify CDN to avoid CORS issues when drawing to canvas.
 * Caches responses for 7 days to minimise upstream fetches.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Only allow Spotify CDN origins
  try {
    const parsed = new URL(imageUrl);
    const allowed = ["i.scdn.co", "mosaic.scdn.co", "seed-mix-image.spotifycdn.com", "image-cdn-fa.spotifycdn.com", "wrapped-images.spotifycdn.com"];
    if (!allowed.some((h) => parsed.hostname === h || parsed.hostname.endsWith("." + h))) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        Accept: "image/*",
        "User-Agent": "SpindleApp/1.0",
      },
      // Allow Next.js to cache at the fetch level
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream ${upstream.status}` },
        { status: upstream.statusText === "Not Found" ? 404 : 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[proxy-image] Error:", err.message);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}
