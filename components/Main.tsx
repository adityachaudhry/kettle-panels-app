import React from "react";
import FilePicker from "./FilePicker";
import PhotoGrid from "./PhotoGrid";
import { v4 as uuidv4 } from "uuid";

interface PhotoItem {
  url: string;
  guid: string;
}

const Main: React.FC = () => {
  const [photos, setPhotos] = React.useState<PhotoItem[]>([]);

  React.useEffect(() => {
    const loadPhotos = async () => {
      if (window.electronAPI?.invoke) {
        const result = await window.electronAPI.invoke("get-photos");
        if (result && Array.isArray(result.photos)) {
          setPhotos(result.photos);
        }
      }
    };
    loadPhotos();
  }, []);

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
      setPhotos((prev) => [
        ...prev,
        ...fileObjs.map((f) => ({ url: f.url, guid: f.guid })),
      ]);
      // Save to userData/kettle-panels/photos via main process
      if (window.electronAPI?.invoke) {
        await window.electronAPI.invoke("save-photos", {
          files: fileObjs.map((f) => ({
            guid: f.guid,
            name: f.name,
            dataUrl: f.url,
          })),
        });
      }
    });
  };

  const handleDeletePhoto = async (index: number) => {
    const photo = photos[index];
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (window.electronAPI?.invoke) {
      await window.electronAPI.invoke("delete-photo", { guid: photo.guid });
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col items-center justify-center bg-[#F0F0F0] dark:bg-[#2F2F2F] border-[#E5E5E5] dark:border-[#0F0F0F]">
      <FilePicker onFilesSelect={handleFilesSelect} />
      <PhotoGrid
        photos={photos.map((p) => p.url)}
        onDelete={handleDeletePhoto}
      />
      {/* Main content */}
    </div>
  );
};

export default Main;
