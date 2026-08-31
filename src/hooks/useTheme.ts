import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("app_theme") as ThemeMode;
    return saved || "system";
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let dark = false;
      if (theme === "system") {
        dark = mediaQuery.matches;
      } else {
        dark = theme === "dark";
      }

      setIsDark(dark);
      if (dark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    const listener = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        setIsDark(e.matches);
        if (e.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("app_theme", newTheme);
  };

  const toggleTheme = () => {
    if (isDark) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return { theme, isDark, setTheme, toggleTheme };
}
