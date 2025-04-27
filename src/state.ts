import React from "react";
import { create } from "zustand";
import {
  getIsDarkMode,
  onThemeUpdated,
  getPhotos,
  getThumbnails,
  savePhotos,
  saveThumbnails,
  getPreferences,
  setPreferences,
  deletePhoto as ipcDeletePhoto,
  deleteThumbnail,
  setWallpaper as ipcSetWallpaper,
  getWallpaper as ipcGetWallpaper,
  generateWallpaper,
  getPhotoData,
  regenerateWallpaper,
  downloadWallpaper,
} from "./utils/ipcService";

type Theme = "light" | "dark";

type PhotoItem = {
  guid: string;
  originalName?: string;
  importedAt?: string;
};

type State = {
  theme: Theme;
  photos: PhotoItem[];
  currentWallpaperGuid: string | null;
  autoRotateInterval: number;
  lastWallpaperChange: number | null;
  selectedPhotoIndex: number | null;
  wallpapers: Record<string, string | null>;
  isGenerating: boolean;
  thumbnails: Record<string, string | null>;
  photoData: Record<string, string>;
  actionLoading: string | null;
  error: string | null;
  downloadSuccess: boolean;
};

type Action = {
  updateTheme: (theme: Theme) => void;
  setPhotos: (photos: PhotoItem[]) => void;
  setCurrentWallpaperGuid: (guid: string | null) => void;
  setAutoRotateInterval: (interval: number) => void;
  setLastWallpaperChange: (ts: number | null) => void;
  setSelectedPhotoIndex: (idx: number | null) => void;
  setWallpapers: (wallpapers: Record<string, string | null>) => void;
  setIsGenerating: (val: boolean) => void;
  setThumbnails: (thumbs: Record<string, string | null>) => void;
  setPhotoData: (data: Record<string, string>) => void;
  setActionLoading: (val: string | null) => void;
  setError: (err: string | null) => void;
  setDownloadSuccess: (val: boolean) => void;
  loadPhotos: () => Promise<void>;
  loadPrefs: () => Promise<void>;
  savePrefs: () => Promise<void>;
  handleFilesSelect: (files: File[]) => Promise<void>;
  handleDeletePhoto: (index: number) => Promise<void>;
  handleSetWallpaper: (index: number) => Promise<void>;
  fetchWallpaper: (guid: string) => Promise<string | null>;
  handleGenerateWallpaper: (guid: string) => Promise<void>;
  handleSetWallpaperImmediate: (guid: string) => Promise<void>;
  fetchPhotoData: (guid: string) => Promise<void>;
};

export const useStore = create<State & Action>((set, get) => ({
  theme: "light",
  photos: [],
  currentWallpaperGuid: null,
  autoRotateInterval: 0,
  lastWallpaperChange: null,
  selectedPhotoIndex: null,
  wallpapers: {},
  isGenerating: false,
  thumbnails: {},
  photoData: {},
  actionLoading: null,
  error: null,
  downloadSuccess: false,
  updateTheme: (theme) => set(() => ({ theme })),
  setPhotos: (photos) => set(() => ({ photos })),
  setCurrentWallpaperGuid: (guid) =>
    set(() => ({ currentWallpaperGuid: guid })),
  setAutoRotateInterval: (interval) =>
    set(() => ({ autoRotateInterval: interval })),
  setLastWallpaperChange: (ts) => set(() => ({ lastWallpaperChange: ts })),
  setSelectedPhotoIndex: (idx) => set(() => ({ selectedPhotoIndex: idx })),
  setWallpapers: (wallpapers) => set(() => ({ wallpapers })),
  setIsGenerating: (val) => set(() => ({ isGenerating: val })),
  setThumbnails: (thumbs) => set(() => ({ thumbnails: thumbs })),
  setPhotoData: (data) => set(() => ({ photoData: data })),
  setActionLoading: (val) => set(() => ({ actionLoading: val })),
  setError: (err) => set(() => ({ error: err })),
  setDownloadSuccess: (val) => set(() => ({ downloadSuccess: val })),
  loadPhotos: async () => {
    const result = await getPhotos();
    if (result && Array.isArray(result.photos)) {
      set({ photos: result.photos });
    }
    const thumbResult = await getThumbnails();
    const loadedThumbnails =
      thumbResult && thumbResult.thumbnails ? thumbResult.thumbnails : {};
    set({ thumbnails: loadedThumbnails });
  },
  loadPrefs: async () => {
    const prefs = await getPreferences();
    if (prefs && typeof prefs.autoRotateInterval === "number") {
      set({ autoRotateInterval: prefs.autoRotateInterval });
    }
    if (prefs && typeof prefs.lastWallpaperChange === "number") {
      set({ lastWallpaperChange: prefs.lastWallpaperChange });
    }
  },
  savePrefs: async () => {
    const { autoRotateInterval, lastWallpaperChange } = get();
    await setPreferences({ autoRotateInterval, lastWallpaperChange });
  },
  handleFilesSelect: async (files) => {
    const readers = files.map((file) => {
      return new Promise<{ url: string; name: string; guid: string }>(
        (resolve, reject) => {
          const reader = new FileReader();
          const guid = crypto.randomUUID();
          reader.onload = () =>
            resolve({ url: reader.result as string, name: file.name, guid });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }
      );
    });
    const fileObjs = await Promise.all(readers);
    const thumbPairs = await Promise.all(
      fileObjs.map(async (f) => {
        const thumb = await (async (dataUrl: string, maxSize = 320) => {
          return new Promise<string>((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              const scale = Math.min(
                maxSize / img.width,
                maxSize / img.height,
                1
              );
              const w = Math.round(img.width * scale);
              const h = Math.round(img.height * scale);
              const canvas = document.createElement("canvas");
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.src = dataUrl;
          });
        })(f.url);
        return { guid: f.guid, thumbnail: thumb };
      })
    );
    set((state) => ({
      photos: [...state.photos, ...fileObjs.map((f) => ({ guid: f.guid }))],
      thumbnails: {
        ...state.thumbnails,
        ...Object.fromEntries(
          thumbPairs.map(({ guid, thumbnail }) => [guid, thumbnail])
        ),
      },
    }));
    await savePhotos(
      fileObjs.map((f) => ({ guid: f.guid, name: f.name, dataUrl: f.url }))
    );
    await saveThumbnails(thumbPairs);
  },
  handleDeletePhoto: async (index) => {
    const { photos, thumbnails } = get();
    const photo = photos[index];
    set({
      photos: photos.filter((_, i) => i !== index),
      thumbnails: Object.fromEntries(
        Object.entries(thumbnails).filter(([k]) => k !== photo.guid)
      ),
    });
    await ipcDeletePhoto(photo.guid);
    await deleteThumbnail(photo.guid);
    if (photos.length - 1 === 0) {
      set({ lastWallpaperChange: null });
    }
  },
  handleSetWallpaper: async (index) => {
    const { photos, currentWallpaperGuid } = get();
    const photo = photos[index];
    if (photo.guid === currentWallpaperGuid) return;
    const result = await ipcSetWallpaper(photo.guid);
    if (result && result.success) {
      set({ currentWallpaperGuid: photo.guid });
    }
  },
  fetchWallpaper: async (guid) => {
    const { wallpapers } = get();
    if (wallpapers[guid]) return wallpapers[guid];
    const result = await ipcGetWallpaper(guid);
    if (result && result.wallpaper) {
      set((state) => ({
        wallpapers: { ...state.wallpapers, [guid]: result.wallpaper },
      }));
      return result.wallpaper;
    }
    return null;
  },
  handleGenerateWallpaper: async (guid) => {
    set({ isGenerating: true });
    const result = await generateWallpaper(guid, "default");
    if (result && result.wallpaper) {
      set((state) => ({
        wallpapers: { ...state.wallpapers, [guid]: result.wallpaper },
      }));
    }
    set({ isGenerating: false });
  },
  handleSetWallpaperImmediate: async (guid) => {
    const { currentWallpaperGuid } = get();
    if (guid === currentWallpaperGuid) return;
    const result = await ipcSetWallpaper(guid, true);
    if (result && result.success) {
      set({ currentWallpaperGuid: guid, lastWallpaperChange: Date.now() });
    }
  },
  fetchPhotoData: async (guid) => {
    const { photoData } = get();
    if (photoData[guid]) return;
    const result = await getPhotoData(guid);
    if (result && result.url) {
      set((state) => ({
        photoData: { ...state.photoData, [guid]: result.url },
      }));
    }
  },
}));

export const AppState: React.FC = () => {
  const store = useStore();

  React.useEffect(() => {
    getIsDarkMode().then((isDark) => {
      store.updateTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    });

    onThemeUpdated((isDark) => {
      store.updateTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    });
  }, []);

  return null;
};
