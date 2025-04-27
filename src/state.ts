import React from "react";
import { create } from "zustand";
import { getIsDarkMode, onThemeUpdated } from "./utils/ipcService";

type Theme = "light" | "dark";

type State = {
  theme: Theme;
};

type Action = {
  updateTheme: (theme: Theme) => void;
};

export const useStore = create<State & Action>((set) => ({
  theme: "light",
  updateTheme: (theme) => set(() => ({ theme })),
}));

export const AppState: React.FC = () => {
  const store = useStore();

  React.useEffect(() => {
    getIsDarkMode().then((isDark) => {
      store.updateTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    });

    onThemeUpdated((isDark) => {
      store.updateTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    });
  }, []);

  return null;
};
