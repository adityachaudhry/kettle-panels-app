import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Define state variables
  const [theme, setTheme] = useState<Theme>("light");

  // Handle subscription updates
  useEffect(() => {
    window.electronAPI.invoke("isDarkMode").then((isDark: boolean) => {
      setTheme(isDark ? "dark" : "light");
    });

    window.electronAPI.on("theme-updated", (event, isDark: boolean) => {
      setTheme(isDark ? "dark" : "light");
    });
  }, []);

  // Define context value
  const value: AppState = {
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
