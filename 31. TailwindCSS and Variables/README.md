---
title: "TailwindCSS with CSS variables"
tags: ["gatsby", "documentation", "tailwindcss", "css"]
license: "public-domain"
slug: "tailwindcss-with-css-variables"
canonical_url: "https://haseebmajid.dev/blog/tailwindcss-with-css-variables"
date: "2020-08-5"
published: true
cover_image: "images/cover.jpg"
---

TailwindCSS allows us to use pre-defined classes instead of defining our CSS styles. In this article, we will go over
how we can use Custom properties (sometimes referred to as CSS variables or cascading variables) with TailwindCSS.

## Setup

First, follow the installation guide found [here](https://tailwindcss.com/docs/installation/#2-add-tailwind-to-your-css).
This will show you how you can add TailwindCSS to your current project. For part 2 I will assume you called your CSS
file `global.css`. This is the file that contains `@tailwind base;` etc.

## global.css

First, we need to edit our TailwindCSS file so it looks something like this:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.root,
#root {
  --primary: #367ee9;
  --secondary: #a0aec0;
  --accent: #718096;
  --background: #fff;
  --main: #0d0106;
  --header: #2d3748;
}
```

I wrap my entire body in an element with class `root` or id `root`, so that any of my elements can access it later.

### gatsby-browser.js (optional)

If you're using Gatsby, you can add the following to your `gatsby-browser.js` file:

```js
export const wrapRootElement = ({ element }) => (
  <div className="root overflow-hidden">{element}</div>
);
```

This will wrap all of our pages in the class `root` and `overflow-hidden` CSS class from TailwindCSS.

## tailwind.config.js

Now we've defined some CSS variables how can we use them with Tailwindcss? Simple, we update our tailwind config file
with some of the new CSS variables. Here we simply want to extend the config to add new colour values.

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        main: "var(--main)",
        background: "var(--background)",
        header: "var(--header)",
        accent: "var(--accent)",
      },
    },
  },
};
```

The syntax is very similar to how we would use the variables normally with CSS where it would normally look like:

```css
element {
  background-color: var(--primary);
}
```

## Logo.tsx

Now how do we use our variable? Again pretty straight forward just like our normal tailwind classes. Let's imagine
we have a React component called `Logo.tsx`, defined like so:

```tsx
import React from "react";
import tw from "twin.macro";

export interface Props {
  /** The size of the main text  */
  size?: string;
}

const Logo = ({ size = "2xl" }: Props) => (
  <LogoContainer className={` md:text-${size}`}>
    <Tag>&lt;</Tag>
    Haseeb
    <Tag>/&gt;</Tag>
  </LogoContainer>
);

const LogoContainer = tw.div`cursor-pointer font-header tracking-wide text-2xl font-bold hover:text-primary`;

const Tag = tw.span`text-accent`;

export default Logo;
```

> INFO: I'm using the `twin.macro` the library so we can use it with CSS-in-JS.

To use our variables we just use them like: `text-primary`. Which will use the value we defined above, `#367ee9`. Now
if we change the value in the `global.css` file, it will automatically change here as well.

## Dark/Light Mode (Optional)

This can be easily extended to add a dark/light mode. Add the following to the `global.css` file like so:

```css
.theme-light {
  --background: #fff;
  --main: #0d0106;
  --header: #2d3748;
}

.theme-dark {
  --background: #0e141b;
  --main: #ffffff;
  --header: #eaeaea;
}
```

We can use a theme context to get the current theme I've written about
[here](https://dev.to/hmajid2301/react-hooks-context-local-storage-3job). We get the current theme then use that to determine which class
to set. This will then change value of the variables. If the theme changes, the variable values will change dark -> light or
light -> dark etc.

```jsx
const { theme } = useContext(ThemeContext);
// ...
return (
  <div
    className={`${
      theme === "light" ? "theme-light" : "theme-dark"
    } bg-background`}
  >
    // ...
  </div>
);
```

That's it! We've learnt how to use CSS variables with TailwindCSS.

## Appendix

- [Example Project](https://gitlab.com/hmajid2301/personal-site/-/tree/fa01433eecec728427763e1e2b2cdd9710a9c197)
- [Icons from FlatIcon](https://flaticon.com)
