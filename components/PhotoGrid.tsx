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
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 pb-4">
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
                className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 dark:bg-[#AAAAAA] backdrop-blur-[2px] rounded-full p-0.5 w-3 h-3 flex items-center justify-center shadow-sm transition-all focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
                tabIndex={-1}
                aria-label={`Delete photo ${idx + 1}`}
              >
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 9 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <line
                    x1="1.5"
                    y1="1.5"
                    x2="7.5"
                    y2="7.5"
                    stroke="#2F2F2F"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="7.5"
                    y1="1.5"
                    x2="1.5"
                    y2="7.5"
                    stroke="#2F2F2F"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
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
