---
title: "How to use Storybooks, Gatsby, Babel, Tailwind, Typescript together"
tags: ["gatsby", "documentation", "mdx", "storybook"]
license: "public-domain"
date: 20290622T10:00Z
published: true
cover_image: "images/cover.jpg"
---

> Cover image from, [World Vector Logo](https://worldvectorlogo.com/downloaded/storybook-1)

Recently I started to re-design my website, I decided to use this as an opportunity to learn some new technologies
such as Gatsby, Tailwind. I also decided to try using Storybook. For this said project I used MDX to create my
Storybook stories. In this article, I will show you how you can create Storybooks stories, for a Gatsby project
with TailwindCSS, Typescript using MDX.

You can find an example project using this [here](https://gitlab.com/hmajid2301/personal-site/-/tree/e415420744b2a8f49eddaf2d3058b23c70f46638/.storybook).
You can also find a [demo site](https://storybook.haseebmajid.dev/) for said project.

> This article assumes you already familiar with Typescript, TailwindCSS and Gatsby.

## Storybook

> Storybook is an open source tool for developing UI components in isolation for React, Vue, and Angular. It makes building stunning UIs organized and efficient. - Storybook Website

Storybook allows us to create and test (visually) components in isolation. It can be a great way to both document all
of your components but also speed up development as all you need to focus on is one component at a time. Storybook
also has a ton of extra plugins/addons which can help to customise storybooks to your liking. One such example being
checking for any accessibility issues your components may have.

### MDX

MDX is a combination of markdown mixed with JSX. It allows us to "execute" and "render" JSX code from within an MDX
document. When used with Storybook it means we get all of the flexibility of markdown. So we can use normal markdown
syntax, to document our component. We also get access to MDX-flavored Component Story Format (CSF) which includes a collection
of components called "Doc Blocks", that allow Storybook to translate MDX files into storybook stories.

## Setup

OK let's go over what we need to do, first let's create our gatsby site by using the `gatsby-cli` tool.

```bash
gatsby new gatsby-site
cd gatsby-site
```

### TailwindCSS

Now let's see how we add tailwindcss to this site:

```bash
yarn add gatsby-plugin-typescript gatsby-plugin-postcss tailwindcss twin.macro postcss-preset-env
vim gatsby-config.js
vim postcss.config.js
vim tailwind.config.js
mkdir -p src/styles/
vim src/styles/globals.css
vim gatsby-browser.js
```

We need to update the `gatsby-config.js` file to add support for both typescript and PostCSS. Tailwind is written in PostCSS
so we need to include that in our gatsby file. You can either replace the default `gatsby-config.js` or update the plugins.

```js
// gatsby-config.js
const plugins = ["gatsby-plugin-typescript", "gatsby-plugin-postcss"];

module.exports = {
  plugins,
};
```

Next we add a `postcss.config.js` file as per the Tailwind instructions found
[here](https://tailwindcss.com/docs/installation#webpack-encore).

```js
// postcss.config.js
const tailwindcss = require("tailwindcss");

module.exports = () => ({
  plugins: [tailwindcss],
});
```

Finally, we create a `tailwind.config.js` file. Here we can add new colours, overwrite existing colours and extend the
configuration such as adding news fonts (`Inter`). This file will get merged with the default config by Tailwind.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        blue: {
          100: "#EBF2FD",
          200: "#CDDFFA",
          300: "#AFCBF6",
          400: "#72A5F0",
          500: "#367EE9",
          600: "#3171D2",
          700: "#204C8C",
          800: "#183969",
          900: "#102646",
        },
        monochrome: {
          900: "#333",
          800: "#444",
          700: "#666",
          600: "#999",
          500: "#ddd",
          400: "#eee",
          300: "#f3f3f3",
          200: "#f8f8f8",
          100: "#fff",
        },
      },
      fontFamily: {
        header: ["Inter"],
      },
    },
  },
  variants: {},
};
```

Next, to add the Tailwind styles or our app we need to create a CSS file, you can call this file whatever you want,
you just need to make sure it gets imported in such a place it can be used by any of your components.

```css
# src/styles/globals.css

@tailwind base;
@tailwind components;
@tailwind utilities;
```

One place we can import this is in the `gatsby-brower.js` file. It should be empty, add the import shown below.
We will add babel later on in the app, which will allow us to use imports in the style we've just described.
In this example, we will use the `~` to mean `src`.

```js
// gatsby-browser.js

import "~/styles/globals.css";
```

### Typescript

Now let's add typescript to our project:

```bash
yarn add --dev react-docgen-typescript react-docgen-typescript-loader ts-loader typescript
vim tsconfig.json
```

We will add some extra libraries that will be used by Storybooks to parse our Typescript components.
Like all Typescript projects, we need to include a `tsconfig.json` file. Note we add the `"paths"` so we can
have cleaner imports, this will be used alongside Babel.

```json
// tsconfig.json
{
  "compileOnSave": false,
  "compilerOptions": {
    "target": "es5",
    "module": "es6",
    "types": ["node"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "lib": ["dom", "es2015", "es2017"],
    "jsx": "react",
    "sourceMap": true,
    "strict": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noImplicitAny": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "downlevelIteration": true,
    "baseUrl": "./",
    "paths": {
      "~/*": ["src/*"]
    }
  },
  "include": ["./src/**/*"],
  "exclude": ["node_modules", "plugins"]
}
```

### Babel

```bash
yarn add --dev babel-plugin-module-resolver babel-preset-gatsby babel-preset-react-app @babel/compat-data \
@babel/core @babel/preset-env babel-loader

vim .babelrc
```

`Gatsby` automatically uses Babel, however, to customise babel we need to create our own `.babelrc` file. You can read
more about it [here](https://www.gatsbyjs.org/docs/babel/). The main reason we want to use it is to allow use to have cleaner
imports. So we can use `~` instead of `src` in imports. So we can do `import "~/styles/globals.css";` instead of
`import "../../../styles/globals.css"'`.

> [You can read more about it here, I wrote a previous article on this topic.](https://medium.com/analytics-vidhya/better-imports-with-typescript-aliases-babel-and-tspath-5c3addc7bc9e)

```json
{
  "env": {},
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["./src"],
        "alias": {
          "~": "./src"
        }
      }
    ]
  ],
  "presets": [
    [
      "babel-preset-gatsby",
      {
        "targets": {
          "browsers": [">0.25%", "not dead"]
        }
      }
    ]
  ]
}
```

### Storybook

We will use the latest versions of Storybook (v6) so we can access the latest features. We will go over how we can use these features in the next article.

First remove any lines in your `package.json` that start with `@storybook`. In my case,
I removed `@storybook/addon-actions`, `@storybook/add-links`, `@storybook/addons` and
`@storybook/react`.

```bash
yarn add --dev @storybook/addon-docs@6.0.0-beta.20 @storybook/addon-essentials@6.0.0-beta.20 \
@storybook/addon-storysource@6.0.0-beta.20  @storybook/preset-typescript@1.2.0 \
@storybook/react@6.0.0-beta.20 core-js@2.6.5

npx -p @storybook/cli sb init -f
vim .storybook/main.js
vim .storybook/preview.js
vim preview-head.html
vim webpack.config.js
```

Next, we will update the `main.js` file. This will tell Storybook where to look for the stories, in this case in the `src` folder
any file called `x.stories.mdx` or `x.stories.tsx`.

```js
// .storybook/main.js
module.exports = {
  stories: ["../src/**/*.stories.@(tsx|mdx)"],
  addons: ["@storybook/addon-essentials", "@storybook/preset-typescript"],
};
```

Next, lets update the preview file. Here is typically you can define global parameters and decorators. Again
will see more of this in the next article.

```js
// .storybook/preview.js
import React from "react";

import { action } from "@storybook/addon-actions";
import { configure } from "@storybook/react";

import "../src/styles/globals.css";

configure(require.context("../src", true, /\.stories\.mdx$/), module);

global.___loader = {
  enqueue: () => {},
  hovering: () => {},
};
global.__PATH_PREFIX__ = "";
window.___navigate = (pathname) => {
  action("NavigateTo:")(pathname);
};
```

If we want to use any custom fonts, such as google fonts or other styles within our Tailwind, we need to
define them here.

```html
<!--  .storybook/preview-html.html  -->
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@600,900&display=swap"
  rel="stylesheet"
/>
```

Storybook uses webpack, so if we want to add extra webpack options, we do that here. This allows us to use
things like Babel and PostCSS loader.

```js
// .storybook/webpack.config.js

module.exports = ({ config }) => {
  config.module.rules[0].use[0].loader = require.resolve("babel-loader");
  config.module.rules[0].use[0].options.presets = [
    require.resolve("@babel/preset-react"),
    require.resolve("@babel/preset-env"),
  ];

  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve("babel-loader"),
    options: {
      presets: [["react-app", { flow: false, typescript: true }]],
      plugins: [],
    },
  });

  config.module.rules.push({
    test: /\.css$/,
    use: [
      {
        loader: "postcss-loader",
        options: {
          sourceMap: true,
          config: {
            path: "./.storybook/",
          },
        },
      },
    ],
  });

  return config;
};
```

### Component

Finally, let's create a component that we will create a story for. First, create a new folder at `src/components/Logo`.
In that folder let's create the following files:

> Note the comments in the Props will be the comments shown in our story later, if you use the correct addons for Storybook. We will go over this in the next article.

```tsx
// src/components/Logo/Logo.tsx
import React from "react";
import tw from "twin.macro";

export interface Props {
  /** The colour of the opening and closing tags. */
  accent?: string;
  /** The colour of main text. */
  color?: string;
  /** The colour when you hover over the logo. */
  hoverColor?: string;
  /** The main text of the logo for example, your name. */
  text: string;
  /** The size of the main text  */
  size?: "xs" | "sm" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const Logo = ({
  accent = "black",
  color = "black",
  hoverColor = "blue-500",
  text,
  size = "2xl",
}: Props) => (
  <LogoContainer
    className={`hover:text-${hoverColor} text-${color} lg:text-${size}
    md:text-xl sm:text-md text-sm`}
  >
    <Tag className={`text-${accent}`} data-testid="OpeningTag">
      &lt;
    </Tag>
    {text}
    <Tag className={`text-${accent}`} data-testid="ClosingTag">
      /&gt;
    </Tag>
  </LogoContainer>
);

const LogoContainer = tw.div`cursor-pointer font-header font-black tracking-wide `;

const Tag = tw.span``;

export default Logo;
```

This index file makes it easier to import the component from other files. As we don't have to do
`import {Logo} from "src/components/Logo/Logo.ts` we can use `import {Logo} from "src/components/Logo`.

```tsx
// src/components/Logo/index.ts
export { default as Logo } from "./Logo";
```

#### Storybook

Now we have set everything up but do we create a story for our component. First, create a new file at `src/components/Logo/Logo.stories.mdx`.
You could keep this in another folder like storybooks/ or keep it in the same folder as your component, it's all personal preference.
Some people will also have all unit tests in the same folder `src/components/Logo/`.

```md
import { Meta, Story, Preview, Props } from "@storybook/addon-docs/blocks";

import Logo from "./Logo";

<Meta title="Logo" component={Logo} />

# Logo

## Accent

You can adjust the accent (tags) color by passing the `accent` prop.

<Preview>
  <Story name="Accent Colour">
    <Logo accent="gray-500" color="blue-500" text="Haseeb" />
    <Logo accent="gray-500" color="black" text="Haseeb" />
  </Story>
</Preview>
```

Add the following to your `package.json` to the "scripts" section. We need to pass it the `NODE_ENV=test`
environment variable, else the Gatsby Babel plugin will complain.

```json
"storybook": "NODE_ENV=test start-storybook -p 6006",
"build-storybook": "NODE_ENV=test build-storybook"
```

Now we can run our Storybook by running the following command:

```bash
yarn storybook
```

That's it! We managed to get Storybook to work with Gatsby. Where Gatsby is using Tailwind, Babel and Typescript.

## Appendix

- [Source Code](https://gitlab.com/hmajid2301/medium/tree/master/29.%20Storybooks,%20Gatsby%20and%20MDX/source_code)
- [Example Project](https://gitlab.com/hmajid2301/personal-site/-/tree/e415420744b2a8f49eddaf2d3058b23c70f46638/.storybook)
- [Example Storybook](https://storybook.haseebmajid.dev/)
