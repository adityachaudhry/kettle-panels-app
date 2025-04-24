import React from "react";

interface PhotoDetailProps {
  photo: { url: string; guid: string };
  wallpaper: string | null;
  isGenerating: boolean;
  currentWallpaperGuid: string | null;
  onBack: () => void;
  onGenerateWallpaper: (guid: string) => void;
  onSetWallpaperImmediate: (guid: string) => void;
}

const PhotoDetail: React.FC<PhotoDetailProps> = ({
  photo,
  wallpaper,
  isGenerating,
  currentWallpaperGuid,
  onBack,
  onGenerateWallpaper,
  onSetWallpaperImmediate,
}) => {
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Delete photo and generated images
  const handleDelete = async () => {
    setActionLoading("delete");
    setError(null);
    try {
      if (window.electronAPI?.invoke) {
        const result = await window.electronAPI.invoke("delete-photo", {
          guid: photo.guid,
        });
        if (!result.success) throw new Error(result.error || "Delete failed");
        onBack();
      }
    } catch (e: any) {
      setError(e.message);
    }
    setActionLoading(null);
  };

  // Set as wallpaper and reset timer
  const handleSetWallpaper = async () => {
    setActionLoading("set");
    setError(null);
    try {
      if (window.electronAPI?.invoke) {
        const result = await window.electronAPI.invoke("set-wallpaper", {
          guid: photo.guid,
          resetCountdown: true,
        });
        if (!result.success)
          throw new Error(result.error || "Set wallpaper failed");
      }
    } catch (e: any) {
      setError(e.message);
    }
    setActionLoading(null);
  };

  // Regenerate wallpaper
  const handleRegenerate = async () => {
    setActionLoading("regen");
    setError(null);
    try {
      if (window.electronAPI?.invoke) {
        const result = await window.electronAPI.invoke("regenerate-wallpaper", {
          guid: photo.guid,
        });
        if (!result.success)
          throw new Error(result.error || "Regenerate failed");
        // Optionally update UI with new wallpaper
        window.location.reload(); // crude, but ensures UI updates
      }
    } catch (e: any) {
      setError(e.message);
    }
    setActionLoading(null);
  };

  // Download wallpaper
  const handleDownload = async () => {
    setActionLoading("download");
    setError(null);
    try {
      if (window.electronAPI?.invoke) {
        const result = await window.electronAPI.invoke("download-wallpaper", {
          guid: photo.guid,
        });
        if (!result.success) throw new Error(result.error || "Download failed");
        // Optionally show a toast or notification
      }
    } catch (e: any) {
      setError(e.message);
    }
    setActionLoading(null);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-8 pb-24">
      <button
        className="mb-6 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={onBack}
      >
        ← Back
      </button>
      <div className="mb-4 w-full flex flex-col items-center">
        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
          Your Photo
        </div>
        <img
          src={photo.url}
          alt="Original"
          className="rounded-lg max-w-full max-h-96 object-contain border border-gray-200 dark:border-gray-700"
        />
      </div>
      <div className="mb-4 w-full flex flex-col items-center">
        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
          Wallpaper by Kettle
        </div>
        {wallpaper ? (
          <img
            src={wallpaper}
            alt="Wallpaper"
            className="rounded-lg max-w-full max-h-96 object-contain border border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
            <span className="text-gray-400 mb-2">
              No wallpaper generated yet.
            </span>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={() => onGenerateWallpaper(photo.guid)}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Wallpaper"}
            </button>
          </div>
        )}
      </div>
      {/* Error message */}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#232323] border-t border-gray-200 dark:border-gray-700 flex justify-center gap-4 py-4 z-50 shadow-lg">
        <button
          className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={onBack}
          disabled={!!actionLoading}
        >
          ← Back
        </button>
        <button
          className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          onClick={handleDelete}
          disabled={!!actionLoading}
        >
          {actionLoading === "delete" ? "Deleting..." : "Delete Photo"}
        </button>
        <button
          className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          onClick={handleSetWallpaper}
          disabled={currentWallpaperGuid === photo.guid || !!actionLoading}
        >
          {currentWallpaperGuid === photo.guid
            ? "Already Set"
            : actionLoading === "set"
            ? "Setting..."
            : "Set as Wallpaper"}
        </button>
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleRegenerate}
          disabled={!!actionLoading}
        >
          {wallpaper
            ? actionLoading === "regen"
              ? "Regenerating..."
              : "Regenerate Wallpaper"
            : actionLoading === "regen"
            ? "Generating..."
            : "Generate Wallpaper"}
        </button>
        <button
          className="px-3 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
          onClick={handleDownload}
          disabled={!wallpaper || !!actionLoading}
        >
          {actionLoading === "download" ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
  );
};

export default PhotoDetail;
