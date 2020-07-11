import React from 'react';

import { withA11y } from '@storybook/addon-a11y';
import { action } from '@storybook/addon-actions';
import { configure, addDecorator, addParameters } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

// We will address this later.
import '../src/styles/globals.css';
import './main.css';

// automatically import all files ending in *.stories.js
configure(require.context('../src', true, /\.stories\.mdx$/), module);

// Gatsby Setup
// ============================================
// Gatsby's Link overrides:
// Gatsby defines a global called ___loader to prevent its method calls from creating console errors you override it here
global.___loader = {
  enqueue: () => {},
  hovering: () => {},
};
// Gatsby internal mocking to prevent unnecessary errors in storybook testing environment
global.__PATH_PREFIX__ = '';
// This is to utilized to override the window.___navigate method Gatsby defines and uses to report what path a Link would be taking us to if it wasn't inside a storybook
window.___navigate = (pathname) => {
  action('NavigateTo:')(pathname);
};

// Storybook Addons
// ============================================
addParameters({
  viewport: {
    viewports: INITIAL_VIEWPORTS,
    defaultViewport: 'responsive',
  },
  options: {
    panelPosition: 'right',
    storySort: (a, b) =>
      a[1].kind === b[1].kind
        ? 0
        : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
  },
  inline: true,
});

// Storybook Decorators
// ============================================
addDecorator(withA11y);
