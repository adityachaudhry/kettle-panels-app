import React from "react";
import PhotoGrid from "./PhotoGrid";
import Settings from "./Settings";
import PhotoDetail from "./PhotoDetail";
import { v4 as uuidv4 } from "uuid";

interface PhotoItem {
  guid: string;
  originalName?: string;
  importedAt?: string;
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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<
    number | null
  >(null);
  const [wallpapers, setWallpapers] = React.useState<
    Record<string, string | null>
  >({}); // guid -> wallpaper dataUrl/null
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [thumbnails, setThumbnails] = React.useState<
    Record<string, string | null>
  >({}); // guid -> thumbnail dataUrl/null
  const [photoData, setPhotoData] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadPhotos = async () => {
      if (window.electronAPI?.invoke) {
        const result = await window.electronAPI.invoke("get-photos");
        if (result && Array.isArray(result.photos)) {
          setPhotos(result.photos);
        }
        // Load thumbnails mapping
        const thumbResult = await window.electronAPI.invoke("get-thumbnails");
        const loadedThumbnails =
          thumbResult && thumbResult.thumbnails ? thumbResult.thumbnails : {};
        setThumbnails(loadedThumbnails);

        // Generate missing thumbnails for photos that don't have them
        if (result && Array.isArray(result.photos)) {
          const missing = result.photos.filter(
            (p: any) => !loadedThumbnails[p.guid]
          );
          if (missing.length > 0) {
            const thumbPairs = await Promise.all(
              missing.map(async (p: any) => {
                const thumb = await generateThumbnail(p.url);
                return { guid: p.guid, thumbnail: thumb };
              })
            );
            // Save to backend
            await window.electronAPI.invoke("save-thumbnails", {
              thumbnails: thumbPairs,
            });
            // Update state
            setThumbnails((prev) => {
              const next = { ...prev };
              thumbPairs.forEach(({ guid, thumbnail }) => {
                next[guid] = thumbnail;
              });
              return next;
            });
          }
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

  // Helper to generate a thumbnail from a dataUrl
  const generateThumbnail = (
    dataUrl: string,
    maxSize = 320
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
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
  };

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
      // Generate thumbnails for each photo
      const thumbPairs = await Promise.all(
        fileObjs.map(async (f) => {
          const thumb = await generateThumbnail(f.url);
          return { guid: f.guid, thumbnail: thumb };
        })
      );
      // Update state
      setPhotos((prev) => [
        ...prev,
        ...fileObjs.map((f) => ({ guid: f.guid })),
      ]);
      setThumbnails((prev) => {
        const next = { ...prev };
        thumbPairs.forEach(({ guid, thumbnail }) => {
          next[guid] = thumbnail;
        });
        return next;
      });
      // Save to userData/kettle-panels/photos via main process
      if (window.electronAPI?.invoke) {
        await window.electronAPI.invoke("save-photos", {
          files: fileObjs.map((f) => ({
            guid: f.guid,
            name: f.name,
            dataUrl: f.url,
          })),
        });
        // Save thumbnails
        await window.electronAPI.invoke("save-thumbnails", {
          thumbnails: thumbPairs,
        });
      }
    });
  };

  const handleDeletePhoto = async (index: number) => {
    const photo = photos[index];
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setThumbnails((prev) => {
      const next = { ...prev };
      delete next[photo.guid];
      return next;
    });
    if (window.electronAPI?.invoke) {
      await window.electronAPI.invoke("delete-photo", { guid: photo.guid });
      await window.electronAPI.invoke("delete-thumbnail", { guid: photo.guid });
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

  // Fetch generated wallpaper for a photo (stub: checks local state, could call backend)
  const fetchWallpaper = async (guid: string) => {
    if (wallpapers[guid]) return wallpapers[guid];
    if (window.electronAPI?.invoke) {
      const result = await window.electronAPI.invoke("get-wallpaper", { guid });
      if (result && result.wallpaper) {
        setWallpapers((prev) => ({ ...prev, [guid]: result.wallpaper }));
        return result.wallpaper;
      }
    }
    return null;
  };

  // Generate wallpaper for a photo
  const handleGenerateWallpaper = async (guid: string) => {
    setIsGenerating(true);
    if (window.electronAPI?.invoke) {
      const result = await window.electronAPI.invoke("generate-wallpaper", {
        guid,
        style: "default",
      });
      if (result && result.wallpaper) {
        setWallpapers((prev) => ({ ...prev, [guid]: result.wallpaper }));
      }
    }
    setIsGenerating(false);
  };

  // Set wallpaper and reset countdown
  const handleSetWallpaperImmediate = async (guid: string) => {
    if (guid === currentWallpaperGuid) return;
    if (window.electronAPI?.invoke) {
      const result = await window.electronAPI.invoke("set-wallpaper", {
        guid,
        resetCountdown: true,
      });
      if (result && result.success) {
        setCurrentWallpaperGuid(guid);
        setLastWallpaperChange(Date.now());
      }
    }
  };

  React.useEffect(() => {
    // When L2 view is opened, fetch the full image if not already loaded
    if (selectedPhotoIndex !== null && photos[selectedPhotoIndex]) {
      const guid = photos[selectedPhotoIndex].guid;
      if (!photoData[guid]) {
        (async () => {
          if (window.electronAPI?.invoke) {
            const result = await window.electronAPI.invoke("get-photo-data", {
              guid,
            });
            if (result && result.url) {
              setPhotoData((prev) => ({ ...prev, [guid]: result.url }));
            }
          }
        })();
      }
      // When L2 view is opened, fetch the wallpaper if not already loaded
      if (!wallpapers[guid]) {
        fetchWallpaper(guid);
      }
    }
  }, [selectedPhotoIndex]);

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-[#F0F0F0] dark:bg-[#2F2F2F]">
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] ? (
        <PhotoDetail
          photo={{
            guid: photos[selectedPhotoIndex].guid,
            url: photoData[photos[selectedPhotoIndex].guid] || "",
          }}
          wallpaper={wallpapers[photos[selectedPhotoIndex].guid] || null}
          isGenerating={isGenerating}
          currentWallpaperGuid={currentWallpaperGuid}
          onBack={() => setSelectedPhotoIndex(null)}
          onGenerateWallpaper={handleGenerateWallpaper}
          enableRegenerate={false}
          onDelete={() => {
            setPhotos((prev) =>
              prev.filter((_, i) => i !== selectedPhotoIndex)
            );
            setSelectedPhotoIndex(null);
          }}
        />
      ) : (
        <>
          <div className="flex-none px-4">
            <Settings
              autoRotateInterval={autoRotateInterval}
              onAutoRotateIntervalChange={setAutoRotateInterval}
              onFilesSelect={handleFilesSelect}
            />
            <div className="text-xs text-black dark:text-[#DFDFDF] mt-6 mb-2">
              Your Photos
            </div>
          </div>
          <div className="flex-1 min-h-0 px-4 overflow-auto">
            <PhotoGrid
              photos={photos.map((p) => thumbnails[p.guid] || "")}
              onDelete={handleDeletePhoto}
              onPhotoClick={setSelectedPhotoIndex}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
