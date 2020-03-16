import React, { useContext } from "react";

import { DarkModeContext } from "~/providers/DarkModeProvider";

const MainApp = () => {
  const theme = useContext(DarkModeContext);
  const { background, color, isDark } = theme.mode;

  return (
    <div
      style={{
        background: background,
        color: color,
        minHeight: "100vh"
      }}
    >
      <div>Theme is {isDark ? "Dark" : "Light"}</div>
      <button onClick={() => setTheme(theme)}>Change Theme</button>
    </div>
  );
};

const setTheme = (darkMode: DarkModeContext) => {
  const isDark = darkMode.mode.isDark;
  darkMode.dispatch(!isDark);
};

export default MainApp;
