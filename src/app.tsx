import React from "react";
import { createRoot } from "react-dom/client";
import { AppState } from "./state";
import TitleBar from "../components/TitleBar";
import Sidebar from "../components/Sidebar";
import Main from "../components/Main";

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <div className="flex flex-1">
        <Sidebar />
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
