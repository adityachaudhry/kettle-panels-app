import React from "react";

const TitleBar: React.FC = () => {
  return (
    <div
      className="h-[3.2rem] flex-shrink-0 flex"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* <div className="flex-1 bg-[#F0F0F0] dark:bg-[#2F2F2F]"></div> */}
    </div>
  );
};

export default TitleBar;
