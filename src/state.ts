import React from "react";
import { create } from "zustand";

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
    window.electronAPI.invoke("isDarkMode").then((isDark: boolean) => {
      store.updateTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    });

    window.electronAPI.on("theme-updated", (event, isDark: boolean) => {
      store.updateTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    });
  }, []);

  return null;
};
