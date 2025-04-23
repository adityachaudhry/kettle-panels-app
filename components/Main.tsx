import React from "react";
import FilePicker from "./FilePicker";

const Main: React.FC = () => {
  const handleFileSelect = (file: File) => {
    // Handle the selected file (e.g., upload, preview, etc.)
    console.log("Selected file:", file);
  };

  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center bg-[#F0F0F0] dark:bg-[#2F2F2F] border-[#E5E5E5] dark:border-[#0F0F0F]">
      <FilePicker onFileSelect={handleFileSelect} />
      {/* Main content */}
    </div>
  );
};

export default Main;
