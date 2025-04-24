import React from "react";
import FilePicker from "./FilePicker";
import PhotoGrid from "./PhotoGrid";
import { v4 as uuidv4 } from "uuid";

interface PhotoItem {
  url: string;
  guid: string;
}

const intervalOptions = [
  { label: "Off", value: 0 },
  { label: "Every Minute", value: 60 * 1000 },
  { label: "Every Hour", value: 60 * 60 * 1000 },
  { label: "Every Day", value: 24 * 60 * 60 * 1000 },
  { label: "Every Week", value: 7 * 24 * 60 * 60 * 1000 },
];

const Main: React.FC = () => {
  const [photos, setPhotos] = React.useState<PhotoItem[]>([]);
  const [currentWallpaperGuid, setCurrentWallpaperGuid] = React.useState<
    string | null
  >(null);
  const [autoRotateInterval, setAutoRotateInterval] = React.useState<number>(0);
  const [lastWallpaperChange, setLastWallpaperChange] = React.useState<
    number | null
  >(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const loadPhotos = async () => {
      if (window.electronAPI?.invoke) {
        const result = await window.electronAPI.invoke("get-photos");
        if (result && Array.isArray(result.photos)) {
          setPhotos(result.photos);
        }
      }
    };
    loadPhotos();
    // Optionally, on cold start, try to detect the current wallpaper and match to a guid
    // For now, just reset on load
    setCurrentWallpaperGuid(null);
  }, []);

  // Load preferences on mount
  React.useEffect(() => {
    const loadPrefs = async () => {
      if (window.electronAPI?.invoke) {
        const prefs = await window.electronAPI.invoke("get-preferences");
        if (prefs && typeof prefs.autoRotateInterval === "number") {
          setAutoRotateInterval(prefs.autoRotateInterval);
        }
        if (prefs && typeof prefs.lastWallpaperChange === "number") {
          setLastWallpaperChange(prefs.lastWallpaperChange);
        }
      }
    };
    loadPrefs();
  }, []);

  // Save preferences when interval or lastWallpaperChange changes
  React.useEffect(() => {
    if (window.electronAPI?.invoke) {
      window.electronAPI.invoke("set-preferences", {
        autoRotateInterval,
        lastWallpaperChange,
      });
    }
  }, [autoRotateInterval, lastWallpaperChange]);

  // Disable auto-rotate if fewer than 2 photos
  React.useEffect(() => {
    if (photos.length < 2 && autoRotateInterval !== 0) {
      setAutoRotateInterval(0);
      setLastWallpaperChange(null);
    }
  }, [photos.length]);

  // --- Removed auto-rotate timer logic. Now handled in main process. ---

  const handleFilesSelect = (files: File[]) => {
    const readers = files.map((file) => {
      return new Promise<{ url: string; name: string; guid: string }>(
        (resolve, reject) => {
          const reader = new FileReader();
          const guid = uuidv4();
          reader.onload = () =>
            resolve({ url: reader.result as string, name: file.name, guid });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }
      );
    });
    Promise.all(readers).then(async (fileObjs) => {
      setPhotos((prev) => [
        ...prev,
        ...fileObjs.map((f) => ({ url: f.url, guid: f.guid })),
      ]);
      // Save to userData/kettle-panels/photos via main process
      if (window.electronAPI?.invoke) {
        await window.electronAPI.invoke("save-photos", {
          files: fileObjs.map((f) => ({
            guid: f.guid,
            name: f.name,
            dataUrl: f.url,
          })),
        });
      }
    });
  };

  const handleDeletePhoto = async (index: number) => {
    const photo = photos[index];
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (window.electronAPI?.invoke) {
      await window.electronAPI.invoke("delete-photo", { guid: photo.guid });
    }
    // If all photos are deleted, reset lastWallpaperChange
    if (photos.length - 1 === 0) {
      setLastWallpaperChange(null);
    }
  };

  const handleSetWallpaper = async (index: number) => {
    const photo = photos[index];
    if (photo.guid === currentWallpaperGuid) return; // Already set
    if (window.electronAPI?.invoke) {
      const result = await window.electronAPI.invoke("set-wallpaper", {
        guid: photo.guid,
      });
      if (result && result.success) {
        setCurrentWallpaperGuid(photo.guid);
      }
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col items-center">
      <div className="mb-4 flex items-center gap-2">
        <label
          htmlFor="auto-rotate-select"
          className="text-sm text-zinc-900 dark:text-zinc-100"
        >
          Auto-Rotate:
        </label>
        <div className="relative">
          <select
            id="auto-rotate-select"
            value={autoRotateInterval}
            onChange={(e) => setAutoRotateInterval(Number(e.target.value))}
            className="appearance-none bg-gradient-to-b from-white/90 to-white/80 dark:from-zinc-700/90 dark:to-zinc-700/80 
              backdrop-blur-xl backdrop-saturate-150 
              border border-black/10 dark:border-white/10
              rounded-md px-3 py-1 pr-8 text-sm text-zinc-900 dark:text-zinc-100
              shadow-[0_0_0_1px_rgba(0,0,0,0.02)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
              hover:bg-gradient-to-b hover:from-white hover:to-white/90 
              dark:hover:from-zinc-700 dark:hover:to-zinc-700/90
              focus:outline-none focus:border-black/20 dark:focus:border-white/20
              active:bg-white/90 dark:active:bg-zinc-700/90"
          >
            {intervalOptions.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-white dark:bg-zinc-800"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      <FilePicker onFilesSelect={handleFilesSelect} />
      <PhotoGrid
        photos={photos.map((p) => p.url)}
        onDelete={handleDeletePhoto}
        onPhotoClick={handleSetWallpaper}
      />
    </div>
  );
};

export default Main;
