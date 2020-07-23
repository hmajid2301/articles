---
title: "How to add your own type definitions to DefinitelyTyped"
tags: ["javascript", "typescript", "react-native", "expo"]
license: "public-domain"
slug: "add-types-to-definitely-typed"
canonical_url: "https://haseebmajid.dev/blog/add-types-to-definitely-typed"
cover_image: images/cover.png
date: "2019-04-19"
published: true
---

Recently I started using TypeScript (TS) with React Native. Now I won't be going over the benefits of
typescript in this article there are plenty for other articles that will explain the benefits (and drawbacks).

TS is a superset of JavaScript (JS) so anything JS can do TS can do (and more). One of the main advantages of TS is
it's strict type checking. JS is weakly typed which means variable and parameters can be of any type. One of the
major downsides of this approach is in larger projects it can make code harder to follow and more bug prune. For
example, if you're expecting a variable to be an integer but turns out to be a string. Typescript makes bugs like
this much easier to catch because it is strongly typed and each variable and parameter is given a type.
Lets say you have the following function.

```js
add = (x, y) => {
  return x + y;
};
```

Now we expect `x` and `y` to be integers here of course however we are not checking types so let's say we did the following.

```js
add(2, 3) === 5; // true
add(2, "3") === "23"; // true
add("2", "3") === "23"; // true
```

As you can see if you accidentally passed a string to `add` it returns a result we don't expect.
TS helps us catch theses types of errors. The following would be the equivalent functions
`add()` written in TS.

```ts
add = (x: number, y: number) => {
  return x + y;
};
```

---

## Definitely Typed

When using JS libraries not written in TS we need a file which stores the type definitions of functions
and their parameters this is referred to as the global type definition file. Lots of popular libraries already
have this defined in a huge project on GitHub called `DefinitelyTyped`. You can actually add these to your
project by using `yarn add @types/<package_name>`.

This repo is huge and has over 5,000 libraries already defined
however for more obscure projects you may have to write you're own definitions. This then means we can take full
advantage of TS even with any external libraries we use. In this article, we will write definitions for
`react-native-canvas`.

1. Fork the `DefinitelyTyped` project on GitHub,
   [how to fork on GitHub](https://help.github.com/en/articles/fork-a-repo).

2. Git clone the project onto your computer, like so `git clone git@github.com:hmajid2301/DefinitelyTyped.git`.

3. Open the project in your favourite text editor and run the following commands in the root (project) directory.

4. Execute the following command using either `yarn` or `npm`, replace `react-native-canvas` with your package name.
   Before you run the command you should make sure the package doesn't exist in which case all you likely need
   to do is update its type definitions

5. You should see a new folder with the package name in the `types` folder.

```bash
yarn
yarn npx dts-gen --dt --name react-native-canvas --template module

# or

npm install
npm npx dts-gen --dt --name react-native-canvas --template module
```

---

## tsconfig.json

You should now have four auto-generated files, we can leave `tslint.json` as it is. Since this a
React Native library we will have to edit `tsconfig.json` with some new parameters. If you're confused
you can take a look at other type packages to see how they've changed the `tsconfig` file. There are
plenty of React Native examples to take a look at. The `tsconfig` now looks like this

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "lib": ["es6"],
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "baseUrl": "../",
    "typeRoots": ["../"],
    "types": [],
    "noEmit": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-native"
  },
  "files": ["index.d.ts", "react-native-canvas-tests.tsx"]
}
```

---

## index.d.ts

Now onto the main file to edit index this contains the types for the library. So now we will have to look at the library
itself and take a look at the functions components etc. If the `index.d.ts` file has been created properly at the top
in comments you should see something like this.

```js
// Type definitions for react-native-canvas 0.1
// Project: https://github.com/iddan/react-native-canvas#readme
// Definitions by: hmajid2301 <https://github.com/hmajid2301>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.1
```

The first two lines are auto-generated, the next line I added my name and the URL to my GitHub account. The following line
is also auto-generated and the final line is required because we are defining our types with `react-native-canvas`.

Now we actually need to look at the `react-native-canvas` library, so we know how to define our types correctly.
The source code is in the folder `src`, now the first class I use is `Canvas`. Here is a small snippet of the
source code.

```jsx
...
export default class Canvas extends Component {
  static propTypes = {
    style: PropTypes.shape(ViewStylePropTypes),
    baseUrl: PropTypes.string,
    originWhitelist: PropTypes.arrayOf(PropTypes.string),
  };
  ...
}
```

The main thing I am interested in is the `props` we will need to define these in the `index.d.ts` file. So here we have a
React Native component class `export default class Canvas extends Component`, in the `index.d.ts` file this will become
`export default class Canvas extends React.Component<CanvasProps>` in this class, we don't have any state if we did
then it would look like `export default class Canvas extends React.Component<CanvasProps, StateProps>`.

Now we've defined our class lets define our props we will define our props as an interface called `CanvasProps` which will
be defined like so.

```tsx
export interface CanvasProps {
  style?: StyleProp<ViewStyle>;
  baseUrl?: string;
  originWhitelist?: string[];
  ref: (canvas: Canvas) => any;
}
```

The first objects are the same as the first three prop types in the original JS library. They are defined
almost exactly the same bar some syntax differences, in JS `style: PropTypes.shape(ViewStylePropTypes)` as a pose to
`style?: StyleProp<ViewStyle>` in TS. However in the original, the `ref` prop is not defined, so we define it ourselves
for completeness, `ref: (canvas: Canvas) => any`. In this case, the `ref` prop takes an input of type `Canvas` and can
return anything. Below is an example of `ref` being used (in JS).

```jsx
class App extends Component {
  handleCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "purple";
    ctx.fillRect(0, 0, 100, 100);
  };

  render() {
    return <Canvas ref={this.handleCanvas} />;
  }
}
```

In our `Canvas` class, we have to define our properties, according to the documentation we have the following
functions/attributes.

- Canvas#height
- Canvas#width
- Canvas#getContext()
- Canvas#toDataURL()

These get defined as follows;

```tsx
width: number;
height: number;
toDataURL: () => string;
getContext: (context: string) => CanvasRenderingContext2D;
```

This should all be pretty straight forward, the final property `getContext` returns `CanvasRenderingContext2D`.
This another interface we define using the `CanvasRenderingContext2D.js` class (separate file in `src` folder).
It's quite a long interface so if you want to see it
[here](https://github.com/hmajid2301/DefinitelyTyped/blob/master/types/react-native-canvas/index.d.ts).

We then repeat this process for the remaining classes, `Image`, `ImageData` which look like follows. In these classes,
we also define the constructor, which just contains the arguments and the type of object they expect. Note that these
classes aren't React Native components so we define them as normal classes. We also give them named exports i.e.
`export class Image` rather than `export default class Image`, this is because this is how they are defined in the
`react-native-canvas` library.

```ts
export class Image {
  constructor(canvas: Canvas, height?: number, width?: number);
  crossOrigin: string | undefined;
  height: number | undefined;
  width: number | undefined;
  src: string | undefined;
  addEventListener: (event: string, func: (...args: any) => any) => void;
}

export class ImageData {
  constructor(canvas: Canvas, data: number[], height: number, width: number);
  readonly data: number[];
  readonly height: number;
  readonly width: number;
}
```

The final class to define is `Path2D`, which looks like

```ts
export class Path2D {
  constructor(canvas: Canvas, ...args: any);
  addPath: (
    path: Path2D,
    transform?: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
    }
  ) => void;

  closePath: CanvasRenderingContext2D["closePath"];
  moveTo: CanvasRenderingContext2D["moveTo"];
  lineTo: CanvasRenderingContext2D["lineTo"];
  bezierCurveTo: CanvasRenderingContext2D["bezierCurveTo"];
  quadraticCurveTo: CanvasRenderingContext2D["quadraticCurveTo"];
  arc: CanvasRenderingContext2D["arc"];
  arcTo: CanvasRenderingContext2D["arcTo"];
  ellipse: CanvasRenderingContext2D["ellipse"];
  rect: CanvasRenderingContext2D["rect"];
}
```

Again this class is very similar to the classes defined above except some of the properties look like
`closePath: CanvasRenderingContext2D["closePath"]`. This is because `closePath` shares the same definition
as closePath in `CanvasRenderingContext2D`, which is defined as `closePath: () => void`. So rather than define
it twice we just copy the definition in `CanvasRenderingContext2D`.

---

## react-native-canvas-tests.jsx

This is where we define some tests how the library should be used and their props types.

```tsx
import * as React from "react";
import { View } from "react-native";
import Canvas, {
    Image as CanvasImage,
    Path2D,
    ImageData
} from "react-native-canvas";

class CanvasTest extends React.Component {
    render() {
        return (
            <View>
                <Canvas ref={this.handleCanvas} />
            </View>
        );
    }
...
```

So we import our library then we render our `Canvas` component.

```tsx
handleCanvas = (canvas: Canvas) => {
  canvas.width = 100;
  canvas.height = 100;

  const context = canvas.getContext("2d");
  context.fillStyle = "purple";
  context.fillRect(0, 0, 100, 100);

  const ellipse = new Path2D(canvas);
  ellipse.ellipse(50, 50, 25, 35, (45 * Math.PI) / 180, 0, 2 * Math.PI);
  context.fillStyle = "purple";
  context.fill(ellipse);

  const image = new CanvasImage(canvas);
  canvas.width = 100;
  canvas.height = 100;

  image.src =
    "https://upload.wikimedia.org/wikipedia/commons/6/63/Biho_Takashi._Bat_Before_the_Moon%2C_ca._1910.jpg";
  image.addEventListener("load", () => {
    context.drawImage(image, 0, 0, 100, 100);
  });

  const imageData = context.getImageData(0, 0, 100, 100);
  const data = Object.values(imageData.data);
  const length = Object.keys(data).length;
  for (let i = 0; i < length; i += 4) {
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
  }
  const imgData = new ImageData(canvas, data, 100, 100);
  context.putImageData(imgData, 0, 0);
};
```

Then in `handleCanvas`, we test out the different classes we defined, include `Canvas, ImageData, Image and Path2D` and that's it.
The above example is taken from a few examples in `example/App.js` within `react-native-canvas`. Ok now we've defined our files
lets make sure the pull request (PR) will be accepted let's run `yarn run lint react-native-canvas`. If the linter doesn't complain then
we can commit and push our changes to our GitHub fork and
[make PR](https://help.github.com/en/articles/creating-a-pull-request).

---

## Appendix

- [GitHub Account](https://github.com)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [Source Code](https://github.com/hmajid2301/DefinitelyTyped/blob/master/types/react-native-canvas/index.d.ts)
- [Example PR](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/33938)
