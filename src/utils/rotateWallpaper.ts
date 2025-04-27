import { setWallpaper } from "wallpaper";
import * as fs from "fs";
import * as path from "path";

let autoRotateTimer: NodeJS.Timeout | null = null;
let lastKnownGuid: string | null = null;

// These will be set by the main process
let userData = "";
let getPhotosList: () => string[];
let getPreferences: () => {
  autoRotateInterval: number;
  lastWallpaperChange?: number;
};
let setPreferences: (prefs: any) => void;
let getGeneratedImagePath: (
  userData: string,
  guid: string,
  style: string
) => string | null;
let fetchAndStoreGeneratedImage: (
  guid: string,
  style?: string
) => Promise<string>;
const DEFAULT_STYLE = "default";

export function configureWallpaperRotation(deps: {
  userData: string;
  getPhotosList: typeof getPhotosList;
  getPreferences: typeof getPreferences;
  setPreferences: typeof setPreferences;
  getGeneratedImagePath: typeof getGeneratedImagePath;
  fetchAndStoreGeneratedImage: typeof fetchAndStoreGeneratedImage;
}) {
  userData = deps.userData;
  getPhotosList = deps.getPhotosList;
  getPreferences = deps.getPreferences;
  setPreferences = deps.setPreferences;
  getGeneratedImagePath = deps.getGeneratedImagePath;
  fetchAndStoreGeneratedImage = deps.fetchAndStoreGeneratedImage;
}

export async function rotateWallpaper() {
  const photos = getPhotosList();
  if (photos.length < 2) return;
  const prefs = getPreferences();
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
    setPreferences({ ...prefs, lastWallpaperChange: now });
  } catch (e) {
    // ignore
  }
}

export function scheduleAutoRotate() {
  if (autoRotateTimer) clearTimeout(autoRotateTimer);
  const prefs = getPreferences();
  const interval = prefs.autoRotateInterval;
  if (interval <= 0) return;
  const photos = getPhotosList();
  if (photos.length < 2) return;
  const lastChange = prefs.lastWallpaperChange || 0;
  const now = Date.now();
  const timeSinceLast = now - lastChange;
  let delay = interval - timeSinceLast;
  if (delay <= 0) delay = 0;
  autoRotateTimer = setTimeout(async () => {
    await rotateWallpaper();
    scheduleAutoRotate();
  }, delay);
}
