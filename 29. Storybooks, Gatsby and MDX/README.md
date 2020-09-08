---
title: "How to use Storybooks, Gatsby, Babel, Tailwind, Typescript together"
tags: ["gatsby", "documentation", "mdx", "storybook"]
license: "public-domain"
slug: "storybook-gatsby-babel-tailwind-typescript"
canonical_url: "https://haseebmajid.dev/blog/storybook-gatsby-babel-tailwind-typescript"
date: "2020-06-29"
published: true
cover_image: "images/cover.jpg"
---

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

```js:title=gatsby-config.js file=./source_code/gatsby-config.js

```

Next we add a `postcss.config.js` file as per the Tailwind instructions found
[here](https://tailwindcss.com/docs/installation#webpack-encore).

```js:title=postcss.config.js file=./source_code/postcss.config.js

```

Finally, we create a `tailwind.config.js` file. Here we can add new colours, overwrite existing colours and extend the
configuration such as adding news fonts (`Inter`). This file will get merged with the default config by Tailwind.

```js:title=tailwind.config.js file=./source_code/tailwind.config.js

```

Next, to add the Tailwind styles or our app we need to create a CSS file, you can call this file whatever you want,
you just need to make sure it gets imported in such a place it can be used by any of your components.

```css:title=src/styles/global.css file=./source_code/src/styles/global.css

```

One place we can import this is in the `gatsby-brower.js` file. It should be empty, add the import shown below.
We will add babel later on in the app, which will allow us to use imports in the style we've just described.
In this example, we will use the `~` to mean `src`.

```js:title=gatsby-browser.js file=./source_code/gatsby-browser.js

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

```json:title=tsconfig.json file=./source_code/tsconfig.json
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

> [You can read more about it here, I wrote a previous article on this topic.](/blog/better-imports-with-babel-tspath/)

```json:title=.babelrc file=./source_code/.babelrc
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

```js:title=.storybook/main.js file=./source_code/.storybook/main.js

```

Next, lets update the preview file. Here is typically you can define global parameters and decorators. Again
will see more of this in the next article.

```js:title=.storybook/preview.js file=./source_code/.storybook/preview.js

```

If we want to use any custom fonts, such as google fonts or other styles within our Tailwind, we need to
define them here.

```html:title=.storybook/preview-head.html file=./source_code/.storybook/preview-head.html

```

Storybook uses webpack, so if we want to add extra webpack options, we do that here. This allows us to use
things like Babel and PostCSS loader.

```js:title=.storybook/webpack.config.js file=./source_code/.storybook/webpack.config.js

```

### Component

Finally, let's create a component that we will create a story for. First, create a new folder at `src/components/Logo`.
In that folder let's create the following files:

> Note the comments in the Props will be the comments shown in our story later, if you use the correct addons for Storybook. We will go over this in the next article.

```tsx:title=src/components/Logo/Logo.tsx file=./source_code/src/components/Logo/Logo.tsx

```

This index file makes it easier to import the component from other files. As we don't have to do
`import {Logo} from "src/components/Logo/Logo.ts` we can use `import {Logo} from "src/components/Logo`.

```tsx:title=src/components/Logo/index.ts file=./source_code/src/components/Logo/index.ts

```

#### Storybook

Now we have set everything up but do we create a story for our component. First, create a new file at `src/components/Logo/Logo.stories.mdx`.
You could keep this in another folder like storybooks/ or keep it in the same folder as your component, it's all personal preference.
Some people will also have all unit tests in the same folder `src/components/Logo/`.

```md:title=src/components/Logo/Logo.stories.mdx file=./source_code/src/components/Logo/Logo.stories.mdx

```

Add the following to your `package.json` to the "scripts" section. We need to pass it the `NODE_ENV=test`
environment variable, else the Gatsby Babel plugin will complain.

```json:title=package.json
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
- Cover image from, [World Vector Logo](https://worldvectorlogo.com/downloaded/storybook-1)
