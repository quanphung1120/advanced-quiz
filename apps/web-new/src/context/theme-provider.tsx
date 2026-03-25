"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = PropsWithChildren<{
  defaultTheme?: Theme;
  storageKey?: string;
}>;

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "dark" as const;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? ("dark" as const)
    : ("light" as const);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "aq-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    const storedTheme = localStorage.getItem(storageKey);
    return storedTheme === "dark" ||
      storedTheme === "light" ||
      storedTheme === "system"
      ? storedTheme
      : defaultTheme;
  });

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        localStorage.setItem(storageKey, nextTheme);
        setThemeState(nextTheme);
      },
    }),
    [storageKey, theme],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
