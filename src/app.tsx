import React from "react";
import { createRoot } from "react-dom/client";
import { AppState } from "./state";
import TitleBar from "../components/TitleBar";
import Main from "../components/Main";

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10">
        <TitleBar />
      </div>
      <div className="flex flex-1 overflow-auto">
        <Main />
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
