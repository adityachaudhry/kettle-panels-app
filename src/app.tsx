import React from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.body);
root.render(
  <div className="flex flex-col h-screen">
    <div
      className="h-[3.2rem] flex-shrink-0 border-b"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    />
    <div className="flex-1 items-center justify-center">Hello World</div>
  </div>
);
