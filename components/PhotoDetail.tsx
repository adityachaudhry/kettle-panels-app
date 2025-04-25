import React from "react";

interface PhotoDetailProps {
  photo: { url: string; guid: string };
  wallpaper: string | null;
  isGenerating: boolean;
  currentWallpaperGuid: string | null;
  onBack: () => void;
  onGenerateWallpaper: (guid: string) => void;
}

const PhotoDetail: React.FC<PhotoDetailProps> = ({
  photo,
  wallpaper,
  isGenerating,
  currentWallpaperGuid,
  onBack,
  onGenerateWallpaper,
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
    } catch (e: Error | unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
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
    } catch (e: Error | unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
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
    } catch (e: Error | unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
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
    } catch (e: Error | unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    }
    setActionLoading(null);
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto pt-2 pb-4 space-y-8">
          {/* Original photo section */}
          <div className="flex flex-col items-center">
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
              Your Photo
            </div>
            <div className="w-full flex items-center justify-center">
              <img
                src={photo.url}
                alt="Original"
                className="max-h-48 w-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Wallpaper section */}
          <div className="flex flex-col items-center">
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
              Wallpaper by Kettle
            </div>
            {wallpaper ? (
              <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <img
                  src={wallpaper}
                  alt="Wallpaper"
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <span className="text-gray-400 mb-2">
                  No wallpaper generated yet.
                </span>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  onClick={() => onGenerateWallpaper(photo.guid)}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Wallpaper"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 px-4 py-2 rounded-lg shadow-lg text-sm z-40">
          {error}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex-none bg-white/80 dark:bg-[#232323]/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-700 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center gap-4">
          <button
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            onClick={onBack}
            disabled={!!actionLoading}
            aria-label="Go back"
            title="Go back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

          <button
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            onClick={handleDelete}
            disabled={!!actionLoading}
            aria-label={
              actionLoading === "delete" ? "Deleting..." : "Delete photo"
            }
            title={actionLoading === "delete" ? "Deleting..." : "Delete photo"}
          >
            {actionLoading === "delete" ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>

          <button
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            onClick={handleSetWallpaper}
            disabled={currentWallpaperGuid === photo.guid || !!actionLoading}
            aria-label={
              currentWallpaperGuid === photo.guid
                ? "Current wallpaper"
                : actionLoading === "set"
                ? "Setting wallpaper..."
                : "Set as wallpaper"
            }
            title={
              currentWallpaperGuid === photo.guid
                ? "Current wallpaper"
                : actionLoading === "set"
                ? "Setting wallpaper..."
                : "Set as wallpaper"
            }
          >
            {currentWallpaperGuid === photo.guid ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : actionLoading === "set" ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          <button
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            onClick={handleRegenerate}
            disabled={!!actionLoading}
            aria-label={
              wallpaper
                ? actionLoading === "regen"
                  ? "Regenerating..."
                  : "Regenerate wallpaper"
                : "Generate wallpaper"
            }
            title={
              wallpaper
                ? actionLoading === "regen"
                  ? "Regenerating..."
                  : "Regenerate wallpaper"
                : "Generate wallpaper"
            }
          >
            {actionLoading === "regen" ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </button>

          <button
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            onClick={handleDownload}
            disabled={!wallpaper || !!actionLoading}
            aria-label={
              actionLoading === "download"
                ? "Downloading..."
                : "Download wallpaper"
            }
            title={
              actionLoading === "download"
                ? "Downloading..."
                : "Download wallpaper"
            }
          >
            {actionLoading === "download" ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;
