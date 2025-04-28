import { setWallpaper } from "wallpaper";
import {
  getAllPhotosMetadata,
  getAllPreferences,
  getGeneratedImagePath,
  saveAllPreferences,
} from "./fileIO";
import {
  fetchAndStoreGeneratedImage,
  DEFAULT_STYLE,
} from "./generateWallpaper";

let lastKnownGuid: string | null = null;
let cronCheckTimer: NodeJS.Timeout | null = null;

// These will be set by the main process
let userData = "";

// --- Wallpaper Auto-Rotation Logic dependencies ---
export function getPhotosList(): string[] {
  return Object.keys(getAllPhotosMetadata(userData));
}

export function configureWallpaperRotation(deps: { userData: string }) {
  userData = deps.userData;
}

export async function rotateWallpaper() {
  const photos = getPhotosList();
  if (photos.length < 2) return;
  const prefs = getAllPreferences(userData);
  const now = Date.now();
  const interval = prefs.autoRotateInterval;
  if (interval <= 0) return;
  let available = photos.filter((g) => g !== lastKnownGuid);
  if (available.length === 0) available = photos;

  // Pick a random photo
  const randomGuid = available[Math.floor(Math.random() * available.length)];
  const genFilePath = getGeneratedImagePath(
    userData,
    randomGuid,
    DEFAULT_STYLE
  );

  if (genFilePath) {
    // If the random photo has a generated wallpaper, set it
    try {
      await setWallpaper(genFilePath, { screen: "all" });
      lastKnownGuid = randomGuid;
      saveAllPreferences(userData, { ...prefs, lastWallpaperChange: now });
    } catch (e) {
      // ignore
    }
    return;
  } else {
    // If not, kick off generation in background
    fetchAndStoreGeneratedImage(userData, randomGuid, DEFAULT_STYLE).catch(
      () => {
        // ignore
      }
    );
    // Try to find any other already-generated wallpaper
    const alreadyGenerated = available.filter((guid) =>
      getGeneratedImagePath(userData, guid, DEFAULT_STYLE)
    );
    if (alreadyGenerated.length > 0) {
      const fallbackGuid =
        alreadyGenerated[Math.floor(Math.random() * alreadyGenerated.length)];
      const fallbackPath = getGeneratedImagePath(
        userData,
        fallbackGuid,
        DEFAULT_STYLE
      );
      if (fallbackPath) {
        try {
          await setWallpaper(fallbackPath, { screen: "all" });
          lastKnownGuid = fallbackGuid;
          saveAllPreferences(userData, { ...prefs, lastWallpaperChange: now });
        } catch (e) {
          // ignore
        }
      }
    }
    // If no generated wallpapers, do nothing
    return;
  }
}

export function startCronLikeWallpaperCheck() {
  if (cronCheckTimer) clearInterval(cronCheckTimer);
  cronCheckTimer = setInterval(async () => {
    const prefs = getAllPreferences(userData);
    const interval = prefs.autoRotateInterval;
    if (interval <= 0) return;
    const photos = getPhotosList();
    if (photos.length < 2) return;
    const lastChange = prefs.lastWallpaperChange || 0;
    const now = Date.now();
    if (now - lastChange >= interval) {
      await rotateWallpaper();
    }
  }, 60 * 1000); // check every 1 minute
}
