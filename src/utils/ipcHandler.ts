import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import { setWallpaper } from "wallpaper";
import {
  getUserDataPath,
  getAllPhotosMetadata,
  getAllThumbnails,
  getAllPreferences,
  saveAllPreferences,
  getAllGeneratedMapping,
  saveAllGeneratedMapping,
  savePhotoFile,
  deletePhotoFile,
  readPhotoFileAsDataUrl,
  deleteGeneratedImage,
  readGeneratedImageAsDataUrl,
  copyFileToDownloads,
  getGeneratedImagePath,
  upsertPhotoMetadata,
  deletePhotoMetadata,
  upsertThumbnails,
  deleteThumbnails,
  deleteGeneratedMappingEntry,
} from "./fileIO";
import { fetchAndStoreGeneratedImage } from "./generateWallpaper";

export function registerIpcHandlers(appInstance: typeof app) {
  const userData = getUserDataPath(appInstance);

  // --- Theme ---
  ipcMain.handle("isDarkMode", () => nativeTheme.shouldUseDarkColors);
  nativeTheme.on("updated", () => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("theme-updated", nativeTheme.shouldUseDarkColors);
    });
  });

  // --- Photos ---
  ipcMain.handle("save-photos", async (_event, { files }) => {
    const updates: Record<string, any> = {};
    for (const file of files) {
      try {
        savePhotoFile(userData, file.guid, file.dataUrl);
        updates[file.guid] = {
          originalName: file.name,
          importedAt: new Date().toISOString(),
        };
      } catch (e: any) {
        console.error(`Error saving photo ${file.guid}: ${e.message}`);
        throw new Error(`Failed to save photo: ${e.message}`);
      }
    }
    upsertPhotoMetadata(userData, updates);
    return { success: true };
  });

  ipcMain.handle("delete-photo", async (_event, { guid }) => {
    try {
      deletePhotoFile(userData, guid);
      deletePhotoMetadata(userData, [guid]);
      // Delete generated wallpapers and mapping
      deleteGeneratedImage(userData, guid);
      deleteGeneratedMappingEntry(userData, [guid]);
      // Delete associated thumbnail
      deleteThumbnails(userData, [guid]);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle("get-photos", async () => {
    const metadata = getAllPhotosMetadata(userData);
    const photos = Object.keys(metadata).map((guid) => ({
      guid,
      ...metadata[guid],
    }));
    return { photos };
  });

  ipcMain.handle("get-photo-data", async (_event, { guid }) => {
    const url = readPhotoFileAsDataUrl(userData, guid);
    return { url };
  });

  // --- Generated Image Management ---
  const DEFAULT_STYLE = "default";

  ipcMain.handle(
    "set-wallpaper",
    async (_event, { guid, style = DEFAULT_STYLE, resetCountdown = false }) => {
      try {
        let genFilePath = getGeneratedImagePath(userData, guid, style);
        if (!genFilePath) {
          genFilePath = await fetchAndStoreGeneratedImage(guid, style);
        }
        await setWallpaper(genFilePath, { screen: "all" });
        if (resetCountdown) {
          const prefs = getAllPreferences(userData);
          saveAllPreferences(userData, {
            ...prefs,
            lastWallpaperChange: Date.now(),
          });
        }
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }
  );

  ipcMain.handle(
    "get-wallpaper",
    async (_event, { guid, style = DEFAULT_STYLE }) => {
      try {
        const dataUrl = readGeneratedImageAsDataUrl(userData, guid, style);
        return { wallpaper: dataUrl };
      } catch (e: any) {
        return { wallpaper: null, error: e.message };
      }
    }
  );

  ipcMain.handle(
    "download-wallpaper",
    async (_event, { guid, style = DEFAULT_STYLE }) => {
      try {
        const genFilePath = getGeneratedImagePath(userData, guid, style);
        if (!genFilePath) throw new Error("No generated wallpaper found");
        const outPath = copyFileToDownloads(
          genFilePath,
          `${guid}_wallpaper.png`,
          appInstance
        );
        return { success: true, path: outPath };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }
  );

  ipcMain.handle(
    "regenerate-wallpaper",
    async (_event, { guid, style = DEFAULT_STYLE }) => {
      try {
        const mapping = getAllGeneratedMapping(userData);
        if (mapping[guid] && mapping[guid][style]) {
          // Correctly delete the generated image for this guid and style
          deleteGeneratedImage(userData, guid, style);
          delete mapping[guid][style];
          if (Object.keys(mapping[guid]).length === 0) delete mapping[guid];
          saveAllGeneratedMapping(userData, mapping);
        }
        await fetchAndStoreGeneratedImage(guid, style);
        const dataUrl = readGeneratedImageAsDataUrl(userData, guid, style);
        return { success: true, wallpaper: dataUrl };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }
  );

  // --- Preferences ---
  ipcMain.handle("get-preferences", async () => {
    return getAllPreferences(userData);
  });

  ipcMain.handle("set-preferences", async (_event, prefs) => {
    saveAllPreferences(userData, prefs);
    return { success: true };
  });

  // --- Thumbnails ---
  function readThumbnails() {
    return getAllThumbnails(userData);
  }

  ipcMain.handle("save-thumbnails", async (_event, { thumbnails }) => {
    const updates: Record<string, string> = {};
    for (const t of thumbnails) {
      updates[t.guid] = t.thumbnail;
    }
    upsertThumbnails(userData, updates);
    return { success: true };
  });

  ipcMain.handle("get-thumbnails", async () => {
    const mapping = readThumbnails();
    return { thumbnails: mapping };
  });
}
