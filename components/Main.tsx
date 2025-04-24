import React from "react";
import PhotoGrid from "./PhotoGrid";
import Settings from "./Settings";
import { v4 as uuidv4 } from "uuid";

interface PhotoItem {
  url: string;
  guid: string;
}

const Main: React.FC = () => {
  const [photos, setPhotos] = React.useState<PhotoItem[]>([]);
  const [currentWallpaperGuid, setCurrentWallpaperGuid] = React.useState<
    string | null
  >(null);
  const [autoRotateInterval, setAutoRotateInterval] = React.useState<number>(0);
  const [lastWallpaperChange, setLastWallpaperChange] = React.useState<
    number | null
  >(null);

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
    <div className="flex-1 pl-4 pr-4 flex flex-col items-center bg-[#F0F0F0] dark:bg-[#2F2F2F] gap-2">
      <div className="sticky top-0 z-10 w-full">
        <Settings
          autoRotateInterval={autoRotateInterval}
          onAutoRotateIntervalChange={setAutoRotateInterval}
          onFilesSelect={handleFilesSelect}
        />
      </div>
      <div className="flex flex-1 overflow-auto">
        <PhotoGrid
          photos={photos.map((p) => p.url)}
          onDelete={handleDeletePhoto}
          onPhotoClick={handleSetWallpaper}
        />
      </div>
    </div>
  );
};

export default Main;
