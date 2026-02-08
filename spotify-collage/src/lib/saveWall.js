/**
 * Renders the vinyl wall to a 1080×1920 canvas and triggers a PNG download.
 * Uses Promise.allSettled for parallel image loading for speed.
 */
export async function saveWallAsImage({
  topItems,
  contentType,
  gridSize,
  timePeriodLabel,
  username,
}) {
  const WIDTH = 1080;
  const HEIGHT = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");

  // ── Background ──
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  grad.addColorStop(0, "#1a1a1a");
  grad.addColorStop(1, "#0d0d0d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ── Header ──
  ctx.textAlign = "center";
  ctx.fillStyle = "#71717a";
  ctx.font = "32px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(timePeriodLabel.toUpperCase(), WIDTH / 2, 120);

  ctx.fillStyle = "#fafafa";
  ctx.font = "600 48px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${username}'s top ${contentType}`, WIDTH / 2, 180);

  // ── Grid layout ──
  const cols = gridSize === 9 ? 3 : 4;
  const vinylSize = gridSize === 9 ? 260 : 200;
  const gap = gridSize === 9 ? 60 : 40;
  const gridWidth = cols * vinylSize + (cols - 1) * gap;
  const startX = (WIDTH - gridWidth) / 2;
  const startY = 260;

  // ── Pre-load all images in parallel ──
  const items = topItems.slice(0, gridSize);
  const imagePromises = items.map((item) => {
    const url =
      contentType === "albums"
        ? item.images?.[0]?.url
        : item.album?.images?.[0]?.url;
    return url ? loadImageViaProxy(url) : Promise.resolve(null);
  });
  const images = await Promise.allSettled(imagePromises);

  // ── Draw each vinyl ──
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * (vinylSize + gap) + vinylSize / 2;
    const cy = startY + row * (vinylSize + gap + 50) + vinylSize / 2;

    // Disc background
    ctx.beginPath();
    ctx.arc(cx, cy, vinylSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a0a";
    ctx.fill();

    // Grooves
    for (let r = vinylSize / 2; r > vinylSize * 0.3; r -= 6) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = r % 12 === 0 ? "#1a1a1a" : "#0f0f0f";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Album art (from pre-loaded image)
    const imgResult = images[i];
    if (imgResult.status === "fulfilled" && imgResult.value) {
      const img = imgResult.value;
      const artSize = vinylSize * 0.55;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, artSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, cx - artSize / 2, cy - artSize / 2, artSize, artSize);
      ctx.restore();
    }

    // Center hole
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Title + artist
    const title = item.name || "";
    const artist = item.artists?.[0]?.name || "";

    ctx.textAlign = "center";
    ctx.fillStyle = "#fafafa";
    ctx.font = "600 24px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(
      title.length > 18 ? title.slice(0, 18) + "…" : title,
      cx,
      cy + vinylSize / 2 + 30
    );

    ctx.fillStyle = "#71717a";
    ctx.font = "22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(
      artist.length > 22 ? artist.slice(0, 22) + "…" : artist,
      cx,
      cy + vinylSize / 2 + 55
    );
  }

  // ── Footer logo ──
  ctx.fillStyle = "#1DB954";
  ctx.beginPath();
  ctx.arc(WIDTH / 2 - 40, HEIGHT - 100, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#71717a";
  ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("spindle", WIDTH / 2 + 10, HEIGHT - 92);

  // ── Download ──
  // Use toBlob for better memory efficiency than toDataURL
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve();
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spindle-wall-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after a short delay to ensure download starts
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, "image/png");
  });
}

/* ── Helpers ── */

function loadImageViaProxy(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));

    if (url.includes("spotify") || url.includes("scdn")) {
      img.src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    } else {
      img.src = url;
    }
  });
}
