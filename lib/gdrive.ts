/**
 * Extracts Google Drive file ID from various sharing URL formats.
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  // Format: https://drive.google.com/file/d/{FILE_ID}/view...
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    return matchFileD[1];
  }

  // Format: https://drive.google.com/open?id={FILE_ID} or id={FILE_ID}
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) {
    return matchIdParam[1];
  }

  // Format: https://lh3.googleusercontent.com/d/{FILE_ID}
  const matchLh3 = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (matchLh3 && matchLh3[1]) {
    return matchLh3[1];
  }

  // Format: https://drive.google.com/uc?id={FILE_ID}
  const matchUc = url.match(/\/uc\?[^#]*\bid=([a-zA-Z0-9_-]+)/);
  if (matchUc && matchUc[1]) {
    return matchUc[1];
  }

  return null;
}

/**
 * Formats an image URL: If it's a Google Drive link, converts it to a direct high-res thumbnail/embed URL.
 * Automatically enforces high resolution (sz=w1600) so images never appear blurry or distorted.
 */
export function formatImageUrl(url: string, fallback = "/images/sample-image.jpg"): string {
  if (!url || typeof url !== "string") return fallback;

  const trimmed = url.trim();
  if (trimmed === "") return fallback;

  const driveId = extractGoogleDriveId(trimmed);

  if (driveId) {
    // Google Drive direct high-resolution thumbnail endpoint (w1600 provides crisp resolution without pixelation)
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
  }

  return trimmed;
}
