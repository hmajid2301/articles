---
title: 'An example React Native Project Structure'
tags: ['javascript', 'react-native', 'project']
license: 'public-domain'
published: true
cover_image: 'images/cover.jpg'
---

In this article, I will go over an example project structure you can use for your React Native projects.
This of couse my opinion so feel free to tweak the structure to your needs/preferences.

* [Link to project](https://gitlab.com/hmajid2301/stegappasaurus/)
* [Link to Docz Website](stegappasaurus.haseebmajid.dev/)

## Project Structure

```bash
.
├── android
├── app.json
├── App.tsx
├── babel.config.js
├── .buckconfig
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── docs
├── doczrc.js
├── .eslintrc.js
├── gatsby-node.js
├── .gitignore
├── .gitlab
├── .gitlab-ci.yml
├── .history
├── images
├── index.d.ts
├── index.js
├── ios
├── jest.config.js
├── LICENSE
├── metro.config.js
├── __mocks__
├── node_modules
├── package.json
├── prettier.config.js
├── public
├── react-native.config.js
├── README.md
├── src
├── __tests__
├── tsconfig.json
├── util
├── .watchmanconfig
└── yarn.lock
```

## Configs

Let's briefly go over the various config files used in this project.

> **Note:** Not all of this will be relevant for your project. You can use the ones relevant to your project.

* `app.json`: Used by React Native contains the name of your app.
* `.buckconfig`: Used to speed up builds plus more.
* `babel.config.js`: The config used by Babel, which transpile our code into compliant ES5, so we can use all the newest and greatest features from JavaScript. I think one of the best babel plugins you can use is the babel-module-resolver so we have cleaner imports more info [here](https://dev.to/hmajid2301/better-imports-with-typescript-aliases-babel-and-tspath-40ne).
* `doczrc.js`: The config is used by Docz, which is used to create a website from Markdown files, the config is used to set the theme and the order of the sidebar.
* `.eslintrc.js`: I use eslint as my linter of choice. This is the config used to set up all the various options. Including relevant config to use with Typescript and Prettier.
* `gatsby-node.js`: Docz uses Gatsby "behind the scenes", you only need this file if you intend to use Docz.
* `jest.config.js`: Since this is a React Native project I also use Jest. A test runner created by Facebook. This file is used to set up various bits of config such as allowing me to use the same module import resolution and using it with Typescript (babel-jest).
* `metro.config.js`: Metro is a React Native javascript bundler.
* `package.json`: The file use to manage dependencies and build scripts.
* `prettier.config.js`: The config for the Prettier code formatter.
* `react-native.config.js`: As of React Native 0.60 you use this file to allow you to import custom fonts and assets into your React Native project.
* `tsconfig.json`: Since I am using Typescript this is the required config for Typescript.
* `.watchmanconfig`: Is a file watcher used for hot reloading.
* `yarn.lock`: Not quite config but used by package.json.

The following config files, `app.json`, `.buckconfig`, `metro.config.js`, `.watchmanconfig`,  were unchanged after creating the project. Using the following command:

```bash
npx react-native init AwesomeTSProject --template react-native-template-typescript
```

## Testing

For testing, I have the following two folders:

### Mocks

The `__mocks__` folder. Used to mock out various third party modules and functions. Here is an example:

```bash
.
├── bugsnag-react-native.js
├── @react-native-community
│   └── cameraroll.js
├── react-native-image-picker.js
├── react-native-navigation-bar-color.js
├── react-native-permissions.js
├── react-native-share-extension.js
├── react-native-share.js
├── react-native-snackbar.js
└── rn-fetch-blob.js
```

Where `bugsnag-react-native.js` looks something like the following:

```js
module.exports = {
  Configuration: jest.fn(),
  Client: jest.fn(() => ({notify: jest.fn()})),
};
```

### Tests

The `__tests__` folder contains all of my tests. The structure matches the structure of the `src` folder.
So it's easier to find tests. Some people prefer to keep their tests in the same folder as their components. They will also
keep their storybook config in the component folder, so everything related to that component exists in that folder. However
I prefer to keep my tests separate to my source code.

```bash
.
├── set upTests.ts
└── src
    ├── actions
    │   ├── Snackbar.test.ts
    │   └── Steganography
    ├── components
    │   ├── AboutList.test.tsx
    │   ├── AppHeader.test.tsx
    │   ├── ImageMessage.test.tsx
    │   ├── ImageProgress.test.tsx
    │   ├── MainHeader.test.tsx
    │   ├── MarkdownModal.test.tsx
    │   └── Modal.test.tsx
    └── views
        ├── Home
        └── Settings
```

## Documentation

The following files/folders are used to document the project.

* `docs`: Contains the markdown files used by the Docz website.
* `public`: Used to contain some static files used by Docz such as favicons.
* `README.md`: The first page the user will see when visiting the repo.
* `CHANGELOG.md`: The changes to the project in the [Keepachangelog](https://keepachangelog.com/en/1.0.0/) format.
* `CODE_OF_CONDUCT.md`: How to "behave within" the project.
* `CONTRIBUTING.md`: How to contribute to the project, helping users getting started with this project.
* `images`: Used to store the original SVG images converted to PNGs.

## Gitlab / Git

This project is available on Gitlab, so here are the specific files related to git/Gitlab:

* `.gitlab`: Contains templates for merge requests and issues. 
* `.gitlab-ci.yml`: Is the CI file, which defines what jobs are run on Gitlab CI.
* `.gitignore`: Used by git to determine what files to ignore, when committing changes. Generated from [gitignore.io](https://www.gitignore.io/)

### .gitlab

Taking a closer look at the `.gitlab` folder you can see the different templates I have:

```bash
.
├── issue_templates
│   ├── bug.md
│   ├── feature.md
│   └── question.md
└── merge_request_templates
    ├── merge_request.md
    └── release.md
```

If someone creates a new issue using the `bug` template, they will get the following template to edit when
raising their issue. Making it easier for others to give the relevant information required to resolve the
issue.

```markdown
---
name: "🐛 Bug"
---

# Bug Report

## Current Behaviour

<!-- What is the current behaviour -->

# ... 
```

## Source Code

Now onto the more interesting part of this project.

* `android`: All the specific native code for Android. You will only need to edit this if you need to write Android specific code in Java/Kotlin or edit the way your application is built.
* `ios`: Same as above except for IOS.

### src

Now most of the code related to this project exists within the `src/` folder.

```bash
.
├── actions
│   ├── Bugsnag
│   ├── Share
│   ├── Snackbar
│   └── Steganography
├── assets
│   ├── fonts
│   └── images
├── components
├── AboutList
│   ├── AboutList.tsx
│   └── index.ts
│   ├── ImageMessage
│   ├── ImageProgress
│   ├── IntroSlider
│   ├── Loader
│   ├── Logo
│   ├── MarkdownModal
│   ├── Modal
│   └── PhotoAlbumList
├── constants
│   ├── colors.ts
│   ├── fonts.ts
│   ├── themes.ts
│   └── types.ts
├── data
├── providers
└── views
    ├── Home
    ├── MainApp.tsx
    ├── Setting
    └── Settings.tsx
```

* `actions`: Contains actions such as a snack bar which can be shown.
* `assets`: Static assets such as images and fonts.
* `components`: Components typically will be used by multiple views. Each component has its own folder.
* `constants`: Used to store colours, common types and fonts.
* `data`: (JSON) data used by the components.
* `providers`: React contexts, which will be consumed by other components to store state.
* `views`: The different pages the users will see. Since settings and home have sub-pages those, exist within those folders.

That's it, that my "basic" structure I've used for a React Native project.

## Appendix

- [Example React Native Project](https://gitlab.com/hmajid2301/stegappasaurus/)