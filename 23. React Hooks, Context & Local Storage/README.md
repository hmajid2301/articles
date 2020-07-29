---
title: "React Hooks, Context & Local Storage"
tags: ["react", "react-hooks", "react-context"]
license: "public-domain"
slug: "react-hooks-context-and_local-storage"
canonical_url: "https://haseebmajid.dev/blog/react-hooks-context-and_local-storage"
date: "2020-04-05"
published: true
cover_image: "images/cover.jpg"
---

> Photo by Cristian Palmer on Unsplash

In this article, I will show how you can use React Context with React Hooks to store global state across a React app,
then store that state in local storage. This can be used for example to store light vs dark theme, then whenever the
user visits your website again they will have the same theme they last selected. Which leads to an improved experience.

## Structure

We will use a project structure like so:

```
.
├── src
│   ├── App.tsx
│   ├── index.html
│   ├── index.tsx
│   ├── providers
│   └── views
├── LICENSE
├── package.json
├── tsconfig.json
├── webpack.config.js
└── yarn.lock
```

> Note: We will be using typescript

> Note: This application was based on [saltyshiomix's template](https://github.com/saltyshiomix/webpack-typescript-react-starter)

## Getting Started

Our `package.json` file looks like this:

```json
{
  "name": "ExampleApp",
  "version": "1.0.0",
  "scripts": {
    "start": "serve dist"
  },
  "dependencies": {
    "react": "16.9.0",
    "react-dom": "16.9.0"
  },
  "devdependencies": {
    "typescript": "3.6.2"
  }
}
```

The example application linked will also be using babel for transpiling our code to Javascript
and Webpack for bundling our code into a single `index.js` file.

## App

Now onto how we can use React Hooks to persist user settings in local storage. So every time they
visit our website it will "restore" their previous setting, such as theme, light or dark.

### DarkModeProvider.tsx

React Contexts can be used to store the global state of our application. Such as our current theme, this can then be
accessed anywhere in our application and also changed anywhere. React contexts provide us with two "sub-components", a
provider and, a consumer for that specific React context.

- Provider: The component that will provide the value of the context (stored)
- Consumer: The component that will consume the value

> Context provides a way to pass data through the component tree without having to pass props down manually at every level. - https://reactjs.org/docs/context.html

React hooks allow us to access the React context from within functional components. In our case, it means we don't have
to use the React context's consumer we can use React hooks instead to use the context, this can be seen in the `MainApp.tsx`

First, let's create our React context that will store the current theme the user has selected. It will also
give us a function that other components can use to update the theme. Finally, after any change has been made
it will update the local storage with the users latest settings.

```tsx
import React, { Context, createContext, useReducer, useEffect } from "react";

export const LIGHT_THEME: Theme = {
  background: "#fafafa" as BackgroundColors,
  color: "#000000" as ForegroundColors,
  isDark: false,
};

export const DARK_THEME: Theme = {
  background: "#333333" as BackgroundColors,
  color: "#fafafa" as ForegroundColors,
  isDark: true,
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
```

Next, we will import all of the modules we will need to use then. We will define our two different themes `LIGHT_THEME`
and `DARK_THEME`. Then finally because we are using Typescript we will define types for the Themes and the context we
will use.

```tsx
const darkModeReducer = (_: any, isDark: boolean) =>
  isDark ? DARK_THEME : LIGHT_THEME;
```

Next, we will define a reducer. A reducer is a pure function which does not use the state of the
current app so it cannot have any unintended side-effects. Exactly the same functions we
would define if we were using Redux. In this case, the reducer just returns the `DARK_THEME`
if the `isDark` argument is `true` else it returns the `LIGHT_THEME`.

```tsx
const DarkModeContext: Context<DarkModeContext> = createContext(
  {} as DarkModeContext
);

const initialState =
  JSON.parse(localStorage.getItem("DarkMode") as string) || LIGHT_THEME;
```

After this, we create our React context called `DarkModeContext` and we give it a default empty object
(we don't really mind too much). We then define the default value. It tries to check the value
stored in `localstorage`. If there is none, then we use the `LIGHT_THEME`. After which we define the provider.

```tsx
const DarkModeProvider: React.FC = ({ children }) => {
  const [mode, dispatch] = useReducer(darkModeReducer, initialState);

  useEffect(() => {
    localStorage.setItem("DarkMode", JSON.stringify(mode));
  }, [mode]);

  return (
    <DarkModeContext.Provider
      value={{
        mode,
        dispatch,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};

export { DarkModeProvider, DarkModeContext };
```

The provider is what is used to give other components access to the context. Here you can see
we use the `useReducer` hook and give it our `darkModeReducer` with the initial value. This
reducer will then return a `mode` which is the current theme data and a function `dispatch`
which will be used to update the current theme. Breaking it down a bit further we see:

```tsx
useEffect(() => {
  localStorage.setItem("DarkMode", JSON.stringify(mode));
}, [mode]);
```

Next, we define the `useEffect` hook which is called every time the `mode` is changed, by the
`dispatch` function being called. Hence the we have the `[mode]` at the end. It very simply
stores the current theme into the user's local storage under the key `DarkMode`. Now if
this was changed from light -> dark and then the user comes back to the site, the initial value
we would get from `localstorage.getItem("DarkMode")` would not, of course, be the dark theme.

```tsx
return (
  <DarkModeContext.Provider
    value={{
      mode,
      dispatch,
    }}
  >
    {children}
  </DarkModeContext.Provider>
);

//...
export { DarkModeProvider, DarkModeContext };
```

Finally, we create the Provider component we will export, the `mode` is the theme data that other
components can use and `dispatch` is the function other components can use to change the current
theme. As long as they are a child of the `DarkModeProvider` hence the `{children}` which will be a prop.

### App.tsx

Our "Main" app page we will import the Provider that will export from our providers folder.
This means any component that is a child of this will be able to access and update the current
theme, we will see how to do that later on.

> Warning: The provider needs to be in a separate component to those that access the React Hook. Hence we import the `MainApp` component rather than including all of the `MainApp.tsx` in `App.tsx`.

```tsx
import React from "react";

import { DarkModeProvider } from "~/providers/DarkModeProvider";
import MainApp from "~/views/MainApp";

const App = () => {
  return (
    <DarkModeProvider>
      <MainApp />
    </DarkModeProvider>
  );
};

export default App;
```

> Note: The module resolver allows us to refer to src/ folder as ~ in our imports. I wrote a whole article about how you can use it [here](https://gitlab.com/hmajid2301/articles/-/blob/master/17.%20Using%20Typescript%20Aliases%20with%20tspath/README.md) (#ShamelessPlug)

### MainApp.tsx

Now the MainApp is a very basic page: it contains a single button which is used to toggle our theme
for dark to light and vice versa. Here we use React hooks with React context to be able to update and retrieve
the theme.

```tsx
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
        minHeight: "100vh",
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
```

#### useContext

The `useContext` is an example of a React Hook. It allows users to access a specific context from with a functional
component, a component which is not a class. The context has a mode property which stores the current theme we should
display light or dark. Such as `background` and `color`.

```tsx
const theme = useContext(DarkModeContext);
const { background, color, isDark } = theme.mode;
```

This is then used in our "CSS" styling to style the page background and button colour. We also show the current theme
that is set on the page.

#### Change Theme

So we can access the data from our React context but how do we change the theme? Well, we use the button, which
has an `onClick` event. The `setTheme` function gets the current theme from the `isDark` property of the context.
It then calls the `dispatch` function we have defined in the context to change to the theme to the opposite
it is at the moment. So light theme -> dark theme and dark theme -> light theme.

```tsx
<button onClick={() => setTheme(theme)}>Change Theme</button>;

//...

const setTheme = (darkMode: DarkModeContext) => {
  const isDark = darkMode.mode.isDark;
  darkMode.dispatch(!isDark);
};
```

That's it! We successfully created a very simple React app that leverage React hooks and React context to allow us
to store the user's settings into local storage so it can persist and the user will be able to use the same settings
they set last time, such as dark mode instead of the light mode.

## Appendix

- [Source Code](https://gitlab.com/hmajid2301/articles/-/blob/master/23.%20React%20Hooks%2C%20Context%20%26%20Local%20Storage/source_code)
