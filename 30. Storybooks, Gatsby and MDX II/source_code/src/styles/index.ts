import styled, { CreateStyled } from "@emotion/styled";

export type ColorTheme = {
  background: string;
  header: string;
  text: string;
};

export type Theme = {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  dark: ColorTheme;
  light: ColorTheme;
  fonts: {
    header: string;
    body: string;
  };
};

const theme: Theme = {
  colors: {
    primary: "blue-500",
    secondary: "orange-500",
    tertiary: "gray-500",
  },
  dark: {
    background: "gray-900",
    header: "gray-200",
    text: "white",
  },
  light: {
    background: "white",
    header: "gray-700",
    text: "black",
  },
  fonts: {
    header: "Inter",
    body: "Muli",
  },
};

export { theme };
export default styled as CreateStyled<Theme>;
