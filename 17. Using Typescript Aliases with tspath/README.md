---
title: "Better Imports with Typescript Aliases, Babel and TSPath"
tags: ["typescript", "javascript", "programming"]
license: "public-domain"
slug: "better-imports-with-babel-tspath"
canonical_url: "https://haseebmajid.dev/blog/better-imports-with-babel-tspath/"
date: "2019-12-01"
published: true
cover_image: "images/cover.jpg"
---

In this article, I will explain how you can use typescript aliases with Babel or TSPath.
If you have been using TypeScript/JavaScript (TS/JS) and have a nested folder structure,
you may well be used to seeing imports like so (using es6 style imports). This is sometimes
referred to as **path hell** and is a very common occurrence as your project grows in size.

```js
import moduleA from "../../../moduleA";
import moduleB from "../moduleB";
```

These are called relative imports, as we are importing modules using paths relative
to our current module/file. As you can see, they can sometimes be very ugly and hard to work out
where the module is we are importing. So sometimes you will use the wrong number of "../" etc.
There are a few tools we can use to help solve our problem.

## Structure

In the examples below let's assume we have a structure which looks something like this.

```text
├── app.json
├── babel.config.js
├── App.tsx
├── README.md
├── src
│   ├── actions
│   ├── assets
│   ├── components
│   │   ├── AppHeader
│   │   │   ├── AppHeader.tsx
│   │   │   ├── index.ts
│   │   │   └── styles.tsx
│   │   ├── Logo
│   │   │   ├── index.ts
│   │   │   ├── Logo.tsx
│   │   │   └── styles.tsx
│   │   └── PhotoAlbumList
│   │       ├── index.ts
│   │       ├── PhotoAlbumList.tsx
│   │       └── styles.tsx
│   └── views
│       ├── AboutUs.tsx
│       ├── FAQ.tsx
│       ├── Home.tsx
│       └── Settings.tsx
├── tsconfig.json
├── tslint.json
└── yarn.lock
```

## TypeScript Aliases

In TS there is an option we can set in our config file `tsconfig.json`, referred to as TS aliases.
Let's take a look at an example to see what it can do. Let's say we're in the `Home.tsx` file and we want
to import Logo at the moment we would do something like (in this case index.ts, exports the Logo hence
we don't have to go `../components/Logo/Logo`.)

```js
// without TS aliases
import Logo from "../components/Logo";

// with TS aliases
import Logo from "~/components/Logo";
```

Anytime we use the `~` character in our imports it automatically starts importing from the `src` folder.
I think this makes our imports far easier to follow and read. You can also change the TS aliases
so you can have one for the components folder like @components or actions like @actions. It's all up to you how
you want to structure your project.

### tsconfig.json

Now I've shown you what TS aliases are, but how do we add them to our project? Simple, open your `tsconfig.json` file and
add the following two options

```json
{
  "baseUrl": ".",
  "paths": {
    "~/*": ["src/*"]
  }
}
```

The baseUrl means we use the root directory (the directory where `tsconfig.json` is), and look for the `src` folder in the
same directory.

## Babel Module Resolver

Now if you start to use `~` in your imports, you shouldn't see TS raise any issues/problems. However, if you
transpile TS into JS, you'll notice you still have `~` in your imports. Our imports do not automatically get changed.
Hence earlier I suggested you could use the Babel module resolver.

One tool that works very well is the [Babel module resolver](https://github.com/tleunen/babel-plugin-module-resolver). However,
you need to be using [Babel](https://babeljs.io/), Babel is a tool which is used to transpile "new JS"
into plain old ES5 JS.

I will assume you already have Babel setup. If you're using say React Native and you created the project by using the cli tool, Babel
already comes configured. What you'll need to do from there is install the plugin.

```bash
yarn add --dev babel-plugin-module-resolver
# or
npm install --save-dev babel-plugin-module-resolver
```

Then add the following to your Babel configuration file, which will either be something like `.babelrc`, `babel.config.js` or `.babelrc.js`.
You can also place your configuration in the `package.json` file using the `babel` key.

If your configuration file is a JS file (ends in `.js`)

```js
module.exports = {
  ...
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          "~": "./src"
        }
      }
    ]
  ]
};
```

If your configuration file is a JSON file.

```json
{
  ...
  "plugins": [
    [
      "module-resolver",
      {
        "alias": {
          "~": "./src"
        }
      }
    ]
  ]
}
```

The module resolver will now automatically be run every time Babel is run. If you're using React Native,
this is already done for us.

## TSPath

We cannot always include Babel in our projects, in this case I recommend using
[TSPath](https://www.npmjs.com/package/tspath). For example, I had issues getting Babel
to work with my Firebase Cloud Functions project, so I ended up using TSPath for that.

We use TSPath to solve the same issue as Babel module resolver, when TS -> (transpiled) to JS, JS
won't be able to resolve the import paths. First, let's install TSPath.

```bash
yarn add --dev tspath
# or
npm install --save-dev tspath
```

Then we run `yarn run tspath`, then our path aliases become relative paths again.
If your TS gets transpiled say because it's a package being published to NPM, you can add as part
of your build process, for example in my `package.json` I have the following

```json
{
    "scripts": {
        ...
        "build": "tsc -p . && npm run fix-paths",
        "fix-paths": "tspath -f"
    }
}
```

That's it! We have now used TS path aliases with our project. I have shown how you can solve the
**path hell** issue in our TS project.

## Jest

If you have tests written in Jest you can also have paths like the above resolve. First you need to edit your jest.config.js file (or equivalent configuration file). Then add the following below (to have the same paths as above).

```js
module.exports = {
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
....
};
```

Then in our tests we can do the following, to import our dependencies

```js
import AboutList from "~/components/AboutList";
import { about } from "~/data";
```

## Appendix

- [Example project using Babel](https://gitlab.com/hmajid2301/stegappasaurus/tree/cde1afd6fbb9d882bccb9e05693824587ce1b77e)
- [Example project using TSPath](https://gitlab.com/hmajid2301/stegappasaurus-api/tree/2ed66fd277a148a1e11ad7c3ee932d64afdd242f/functions)
