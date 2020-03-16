import React, { Context, createContext, useReducer, useEffect } from "react";

export const LIGHT_THEME: Theme = {
  background: "#fafafa" as BackgroundColors,
  color: "#000000" as ForegroundColors,
  isDark: false
};

export const DARK_THEME: Theme = {
  background: "#333333" as BackgroundColors,
  color: "#fafafa" as ForegroundColors,
  isDark: true
};

export type BackgroundColors = "#333333" | "#fafafa";
export type ForegroundColors = "#000000" | "#fafafa";

export interface Theme {
  background: BackgroundColors;
  color: ForegroundColors;
  isDark: boolean;
}

interface DarkModeContext {
  mode: Theme;
  dispatch: React.Dispatch<any>;
}

const darkModeReducer = (_: any, isDark: boolean) =>
  isDark ? DARK_THEME : LIGHT_THEME;

const DarkModeContext: Context<DarkModeContext> = createContext(
  {} as DarkModeContext
);

const initialState =
  JSON.parse(localStorage.getItem("DarkMode") as string) || LIGHT_THEME;

const DarkModeProvider: React.FC = ({ children }) => {
  const [mode, dispatch] = useReducer(darkModeReducer, initialState);

  useEffect(() => {
    localStorage.setItem("DarkMode", JSON.stringify(mode));
  }, [mode]);

  return (
    <DarkModeContext.Provider
      value={{
        mode,
        dispatch
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};

export { DarkModeProvider, DarkModeContext };
