
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider
} from "@mui/material";

import { getAppTheme } from "../styles/theme";

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("helpdesk-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("helpdesk-theme", mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((current) => current === "dark" ? "light" : "dark");
  };

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const contextValue = useMemo(() => ({
    mode,
    toggleTheme,
    setMode
  }), [mode]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error(
      "useThemeMode must be used inside ThemeModeProvider"
    );
  }

  return context;
}
