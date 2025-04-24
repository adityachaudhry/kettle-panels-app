import React from "react";
import FilePicker from "./FilePicker";

interface SettingsProps {
  autoRotateInterval: number;
  onAutoRotateIntervalChange: (interval: number) => void;
  onFilesSelect: (files: File[]) => void;
}

const Settings: React.FC<SettingsProps> = ({
  autoRotateInterval,
  onAutoRotateIntervalChange,
  onFilesSelect,
}) => {
  return (
    <div className="w-full">
      <div className="text-xs p-2 text-black dark:text-[#DFDFDF]">Settings</div>
      <div className="w-full rounded-md bg-[#f0f0f0] dark:bg-[#2F2F2F] border border-[#e5e5e5] dark:border-[#434342] text-black dark:text-[#DFDFDF] text-sm">
        <div className="flex items-center justify-between p-2 border-b border-[#e5e5e5] dark:border-[#434342] h-10">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add Photos</span>
          </div>
          <FilePicker onFilesSelect={onFilesSelect} />
        </div>
        <div className="flex items-center justify-between p-2 h-10">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              strokeWidth="2"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Auto-Rotate Wallpaper
          </div>
          <div className="relative flex items-center justify-center gap-1">
            <select
              value={autoRotateInterval}
              onChange={(e) =>
                onAutoRotateIntervalChange(Number(e.target.value))
              }
              className="rounded-md text-sm appearance-none focus:outline-none"
            >
              <option value={0}>Off</option>
              <option value={60 * 1000}>Every Minute</option>
              <option value={60 * 60 * 1000}>Every Hour</option>
              <option value={24 * 60 * 60 * 1000}>Every Day</option>
              <option value={7 * 24 * 60 * 60 * 1000}>Every Week</option>
            </select>
            <span className="pointer-events-none flex items-center">
              <span className="bg-[#383836] rounded-sm flex flex-col justify-center items-center">
                <svg
                  width="14"
                  height="18"
                  viewBox="0 0 12 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 5.5L6 3.5L8 5.5"
                    stroke="#fff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 8.5L6 10.5L8 8.5"
                    stroke="#fff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
