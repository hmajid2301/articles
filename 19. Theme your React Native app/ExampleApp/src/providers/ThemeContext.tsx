import React, {Context, createContext, useState} from 'react';

type ThemeColors = '#17212D' | '#FFF';

interface ITheme {
  background: ThemeColors;
  color: ThemeColors;
  isDark: boolean;
}

const LIGHT_THEME: ITheme = {
  background: '#FFF' as ThemeColors,
  color: '#17212D' as ThemeColors,
  isDark: false,
};

const DARK_THEME: ITheme = {
  background: '#17212D' as ThemeColors,
  color: '#FFF' as ThemeColors,
  isDark: true,
};

interface IThemeContext {
  theme: ITheme;
  changeTheme: (isDark: boolean) => void;
}

const ThemeContext: Context<IThemeContext> = createContext({
  changeTheme: (_: boolean) => {
    return;
  },
  theme: LIGHT_THEME,
});

const ThemeProvider: React.FC = ({children}) => {
  const [themeState, setTheme] = useState({
    theme: LIGHT_THEME,
  });

  const changeTheme = (isDark: boolean) => {
    setTheme({
      theme: isDark ? DARK_THEME : LIGHT_THEME,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        changeTheme,
        theme: themeState.theme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export {ThemeProvider, ThemeContext};
