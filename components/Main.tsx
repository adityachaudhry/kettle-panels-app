import React from "react";
import FilePicker from "./FilePicker";
import PhotoGrid from "./PhotoGrid";

const Main: React.FC = () => {
  const [photoURLs, setPhotoURLs] = React.useState<string[]>([]);

  const handleFilesSelect = (files: File[]) => {
    const readers = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((urls) => {
      setPhotoURLs((prev) => [...prev, ...urls]);
    });
  };

  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center bg-[#F0F0F0] dark:bg-[#2F2F2F] border-[#E5E5E5] dark:border-[#0F0F0F]">
      <FilePicker onFilesSelect={handleFilesSelect} />
      <PhotoGrid photos={photoURLs} />
      {/* Main content */}
    </div>
  );
};

export default Main;
