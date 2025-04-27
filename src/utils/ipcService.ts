// src/utils/ipcService.ts

export interface Photo {
  guid: string;
  originalName?: string;
  importedAt?: string;
  url?: string;
}

export interface Preferences {
  autoRotateInterval: number;
  lastWallpaperChange: number | null;
}

const getAPI = () => {
  if (!window.electronAPI?.invoke) {
    throw new Error("electronAPI is not available");
  }
  return window.electronAPI.invoke;
};

export const getPhotos = async (): Promise<{ photos: Photo[] }> => {
  return await getAPI()("get-photos");
};

export const getThumbnails = async (): Promise<{
  thumbnails: Record<string, string>;
}> => {
  return await getAPI()("get-thumbnails");
};

export const savePhotos = async (
  files: { guid: string; name: string; dataUrl: string }[]
) => {
  return await getAPI()("save-photos", { files });
};

export const saveThumbnails = async (
  thumbnails: { guid: string; thumbnail: string }[]
) => {
  return await getAPI()("save-thumbnails", { thumbnails });
};

export const getPreferences = async (): Promise<Preferences> => {
  return await getAPI()("get-preferences");
};

export const setPreferences = async (prefs: Preferences) => {
  return await getAPI()("set-preferences", prefs);
};

export const deletePhoto = async (guid: string) => {
  return await getAPI()("delete-photo", { guid });
};

export const deleteThumbnail = async (guid: string) => {
  return await getAPI()("delete-thumbnail", { guid });
};

export const setWallpaper = async (guid: string, resetCountdown?: boolean) => {
  return await getAPI()("set-wallpaper", {
    guid,
    ...(resetCountdown ? { resetCountdown } : {}),
  });
};

export const getWallpaper = async (guid: string) => {
  return await getAPI()("get-wallpaper", { guid });
};

export const generateWallpaper = async (guid: string, style = "default") => {
  return await getAPI()("generate-wallpaper", { guid, style });
};

export const getPhotoData = async (guid: string) => {
  return await getAPI()("get-photo-data", { guid });
};

export const regenerateWallpaper = async (guid: string, style = "default") => {
  return await getAPI()("regenerate-wallpaper", { guid, style });
};

export const downloadWallpaper = async (guid: string, style = "default") => {
  return await getAPI()("download-wallpaper", { guid, style });
};

export const getIsDarkMode = async (): Promise<boolean> => {
  return await getAPI()("isDarkMode");
};

export const onThemeUpdated = (callback: (isDark: boolean) => void) => {
  if (window.electronAPI?.on) {
    window.electronAPI.on("theme-updated", (_event, isDark: boolean) => {
      callback(isDark);
    });
  }
};
