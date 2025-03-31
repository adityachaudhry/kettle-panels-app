import React from "react";
import { createRoot } from "react-dom/client";
import { AppState } from "./state";

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Title bar */}
      <div
        className="h-[3.2rem] flex-shrink-0 flex"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div className="w-[160px] border-r dark:border-[#3F3F3F] border-[#D1D1D1]"></div>
        <div className="flex-1 bg-[#F0F0F0] dark:bg-[#2F2F2F]"></div>
      </div>
      <div className="flex flex-1">
        <div className="w-[160px] flex-shrink-0 border-r dark:border-[#3F3F3F] border-[#D1D1D1]">
          {/* Sidebar content */}
        </div>
        <div className="flex-1 p-4 flex items-center justify-center bg-[#F0F0F0] dark:bg-[#2F2F2F] border-[#E5E5E5] dark:border-[#0F0F0F]">
          {/* Main content */}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.body);
root.render(
  <>
    <App />
    <AppState />
  </>
);
