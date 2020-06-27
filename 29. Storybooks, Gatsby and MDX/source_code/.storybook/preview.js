import React from "react";

import { action } from "@storybook/addon-actions";
import { configure } from "@storybook/react";

import "../src/styles/globals.css";
import "./main.css";

configure(require.context("../src", true, /\.stories\.mdx$/), module);

global.___loader = {
  enqueue: () => {},
  hovering: () => {},
};
global.__PATH_PREFIX__ = "";
window.___navigate = (pathname) => {
  action("NavigateTo:")(pathname);
};
