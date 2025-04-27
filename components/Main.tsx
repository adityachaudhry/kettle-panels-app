import React from "react";
import PhotoGrid from "./PhotoGrid";
import Settings from "./Settings";
import PhotoDetail from "./PhotoDetail";
import { useStore } from "../src/state";

const Main: React.FC = () => {
  const {
    photos,
    currentWallpaperGuid,
    autoRotateInterval,
    lastWallpaperChange,
    selectedPhotoIndex,
    wallpapers,
    isGenerating,
    thumbnails,
    photoData,
    setSelectedPhotoIndex,
    setAutoRotateInterval,
    setLastWallpaperChange,
    loadPhotos,
    loadPrefs,
    savePrefs,
    handleFilesSelect,
    handleDeletePhoto,
    fetchWallpaper,
    handleGenerateWallpaper,
    fetchPhotoData,
  } = useStore();

  React.useEffect(() => {
    loadPhotos();
  }, []);

  React.useEffect(() => {
    loadPrefs();
  }, []);

  React.useEffect(() => {
    savePrefs();
  }, [autoRotateInterval, lastWallpaperChange]);

  React.useEffect(() => {
    if (photos.length < 2 && autoRotateInterval !== 0) {
      setAutoRotateInterval(0);
      setLastWallpaperChange(null);
    }
  }, [photos.length]);

  React.useEffect(() => {
    if (selectedPhotoIndex !== null && photos[selectedPhotoIndex]) {
      const guid = photos[selectedPhotoIndex].guid;
      if (!photoData[guid]) {
        fetchPhotoData(guid);
      }
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
          onDelete={async () => {
            if (selectedPhotoIndex === null) return;
            await handleDeletePhoto(selectedPhotoIndex);
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
