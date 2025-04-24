import React from "react";

const TitleBar: React.FC = () => {
  return (
    <div
      className="h-[3.2rem] flex-shrink-0 flex bg-[#F0F0F0] dark:bg-[#2F2F2F] items-center justify-center text-sm font-bold text-black dark:text-[#DFDFDF]"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      Panels
    </div>
  );
};

export default TitleBar;
