import { setWallpaper } from "wallpaper";
import {
  getAllPhotosMetadata,
  getAllPreferences,
  getGeneratedImagePath,
  saveAllPreferences,
} from "./fileIO";

let lastKnownGuid: string | null = null;
let cronCheckTimer: NodeJS.Timeout | null = null;

// These will be set by the main process
let userData = "";

let fetchAndStoreGeneratedImage: (
  guid: string,
  style?: string
) => Promise<string>;
const DEFAULT_STYLE = "default";

// --- Wallpaper Auto-Rotation Logic dependencies ---
export function getPhotosList(): string[] {
  return Object.keys(getAllPhotosMetadata(userData));
}

export function configureWallpaperRotation(deps: {
  userData: string;
  fetchAndStoreGeneratedImage: typeof fetchAndStoreGeneratedImage;
}) {
  userData = deps.userData;
  fetchAndStoreGeneratedImage = deps.fetchAndStoreGeneratedImage;
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
  const nextGuid = available[Math.floor(Math.random() * available.length)];
  try {
    let genFilePath = getGeneratedImagePath(userData, nextGuid, DEFAULT_STYLE);
    if (!genFilePath) {
      genFilePath = await fetchAndStoreGeneratedImage(nextGuid, DEFAULT_STYLE);
    }
    await setWallpaper(genFilePath, { screen: "all" });
    lastKnownGuid = nextGuid;
    saveAllPreferences(userData, { ...prefs, lastWallpaperChange: now });
  } catch (e) {
    // ignore
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
