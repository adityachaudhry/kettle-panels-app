import React from "react";

interface PhotoGridProps {
  photos: string[];
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-2xl mt-6">
      {photos.map((src, idx) => (
        <div
          key={idx}
          className="aspect-square bg-[#E5E5EA] rounded-md overflow-hidden flex items-center justify-center border border-[#D1D1D6]"
        >
          <img
            src={src}
            alt={`Photo ${idx + 1}`}
            className="object-cover w-full h-full"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
