import React from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.body);
root.render(
  <div className="flex flex-col h-screen">
    <div
      className="h-[3.2rem] flex-shrink-0 flex"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="w-[160px] border-r"></div>
      <div className="flex-1"></div>
    </div>
    <div className="flex flex-1">
      <div className="w-[160px] flex-shrink-0 border-r">
        {/* Sidebar content */}
      </div>
      <div className="flex-1 p-4 flex items-center justify-center border-t">
        <h1 className="text-2xl font-bold">Hello World</h1>
      </div>
    </div>
  </div>
);
