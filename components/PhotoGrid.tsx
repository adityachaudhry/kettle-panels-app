import React from "react";

interface PhotoGridProps {
  photos: string[];
  onDelete?: (index: number) => void;
  onPhotoClick?: (index: number) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onDelete,
  onPhotoClick,
}) => {
  return (
    <div className="w-full mt-6">
      <div className="text-xs p-2 text-black dark:text-[#DFDFDF]">
        Your Photos
      </div>
      <div className="grid grid-cols-4 gap-2">
        {photos.map((src, idx) => (
          <div
            key={idx}
            className="relative bg-[#F5F5F7] dark:bg-[#232325] rounded-xl overflow-hidden flex items-center justify-center border border-[#D1D1D6] dark:border-[#232325] transition-shadow shadow-sm hover:shadow-[0_2px_8px_0_rgba(60,60,67,0.10)] focus-within:shadow-[0_2px_8px_0_rgba(60,60,67,0.15)] group"
            style={{ aspectRatio: "16/10" }}
            onClick={() => onPhotoClick && onPhotoClick(idx)}
          >
            {onDelete && (
              <button
                type="button"
                className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 dark:bg-[#AAAAAA] backdrop-blur-[2px] rounded-full w-4 h-4 flex items-center justify-center shadow-sm transition-all focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
                tabIndex={-1}
                aria-label={`Delete photo ${idx + 1}`}
              >
                <span
                  className="text-[16px] leading-none text-[#2F2F2F]"
                  style={{ transform: "translateY(-1px)" }}
                >
                  &times;
                </span>
              </button>
            )}
            <img
              src={src}
              alt={`Photo ${idx + 1}`}
              className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid;
