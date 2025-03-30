import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider, useAppContext } from "./context";

const App: React.FC = () => {
  const { theme } = useAppContext();

  return (
    <div className="flex flex-col h-screen">
      {/* Title bar */}
      <div
        className="h-[3.2rem] flex-shrink-0 flex"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div
          className={`w-[160px] border-r ${
            theme === "dark" ? "" : "border-[#D1D1D1]"
          }`}
        ></div>
        <div
          className={`flex-1 ${
            theme === "dark" ? "bg-[#2F2F2F]" : "bg-[#F0F0F0]"
          }`}
        ></div>
      </div>
      <div className="flex flex-1">
        <div
          className={`w-[160px] flex-shrink-0 border-r ${
            theme === "dark" ? "" : "border-[#D1D1D1]"
          }`}
        >
          {/* Sidebar content */}
        </div>
        <div
          className={`flex-1 p-4 flex items-center justify-center ${
            theme === "dark"
              ? "bg-[#2F2F2F] border-[#0F0F0F]"
              : "bg-[#F0F0F0] border-[#E5E5E5]"
          }`}
        >
          {/* Main content */}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.body);
root.render(
  <AppProvider>
    <App />
  </AppProvider>
);
