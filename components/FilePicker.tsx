import React from "react";

const FilePicker: React.FC<{ onFileSelect: (file: File) => void }> = ({
  onFileSelect,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };
  return (
    <label className="inline-flex items-center px-3 py-1 dark:bg-[#656564] dark:text-[#E1E1E1] rounded-md shadow-md border dark:border-t-[#777776] dark:border-b-[#292929] dark:border-r-0 dark:border-l-0 cursor-pointer text-sm">
      Import Photos
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
};

export default FilePicker;
