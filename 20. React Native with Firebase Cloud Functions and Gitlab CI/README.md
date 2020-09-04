---
title: "React Native with Firebase Cloud Functions and Gitlab CI"
tags: ["react-native", "react", "firebase", "gitlab"]
license: "public-domain"
slug: "react-native-firebase-functions-and-gitlab-ci"
canonical_url: "https://haseebmajid.dev/blog/react-native-firebase-functions-and-gitlab-ci/"
date: "2020-02-22"
published: true
cover_image: "images/cover.jpg"
---

In this article, we will talk about how you can use React Native with [Firebase Cloud Functions](https://firebase.google.com/docs/functions).
We will also go over how we can automate the process of updating the cloud functions using [Gitlab CI](https://docs.gitlab.com/ee/ci/).

[Firebase](https://firebase.google.com/) is a cloud-based platform developed by Google to aid in the development of Web and Mobile applications. It is tightly
coupled with the [Google Cloud Platform (GCP)](https://cloud.google.com/), so much so that there are certain actions you can
only do using the GCP GUI, such as increasing the RAM of your cloud function "containers".

**Note**: We will be using Typescript in this article

## Firebase Cloud Functions

Firebase Cloud Functions can be referred to as serverless or as Functions-as-a-service (FaaS).
This means we simply deploy our code as a function, the tool (Firebase) installs our dependencies
and set up the environment. Essentially all we manage is the "code" and let the platform manage the
actual server/environment.

**Note**: You can deploy cloud functions in Python and Golang, however, you must do this through the
GCP GUI. The functions will show up on your Firebase GUI after you've created them.
You can view your Firebase project within GCP hence you can make changes to it such
as increasing the RAM (from 512MB to 2GB) from within GCP.

Let's now take a look at a simple app we will deploy to Firebase Cloud Functions.

### Structure

Our project structure will look something like this:

```text
├── firebase.json
├── .firebaserc
├── functions
│   ├── index.ts
│   ├── middleware
│   ├── node_modules
│   ├── package.json
│   ├── tsconfig.json
│   └── yarn.lock
├── .gitignore
└── .gitlab-ci.yml
```

This setup will look very similar to the tutorial [available here](https://firebase.google.com/docs/functions/get-started).

![Firebase Pizza](images/firebase.gif)

### Firebase Misc Files

This file contains some configuration options but for most projects, it will just contain the project name
(the one we want to publish our changes to on Firebase, as we could be working on multiple projects).

```json:title=firebase/.firebaserc file=./source_code/firebase/.firebaserc

```

This file is important as it defines the actions that will happen before we deploy a new version
of the cloud functions. In this case, we run `yarn run build`, within the `functions` folder.
It compiles our TypeScript (TS) into regular JavaScript (JS) so that it can be run
as a cloud function. You could do various other actions such as lint your code etc.

```json:title=firebase/firebase.json file=./source_code/firebase/firebase.json

```

### Gitlab CI

Now you're probably wondering how do we get our Cloud Functions from our dev machine (computer) to the Firebase servers.
We run the `deploy` script command. Now we could do this every time we make a change, however, I prefer to automate this process.

We will use Gitlab CI to automatically publish changes to Firebase.
First, we will need a deploy token as we cannot enter our username and password within GitLab
CI to do this run `yarn firebase login:ci`. Then log in to your Firebase account after you've done this you will get a deploy token (shown in the terminal), then;

- Open your Gitlab project in a web browser
- Go to Settings (left-hand sidebar) > CI/CD
- Variables -> Expand
- Add a new variable, with Type: Variable, Key: FIREBASE_DEPLOY_TOKEN, Value: `your deploy token here`, and toggle protected and masked as true (blue).

This now means you can access the token within the Gitlab CI as an environment variable,
and it will allow us to authenticate with Firebase and push changes to Firebase.

```yaml:title=firebase/.gitlab-ci.yml file=./source_code/firebase/.gitlab-ci.yml

```

The CI file we've defined means every time we commit onto the master branch it will trigger
a deployment of our code to Firebase Cloud Functions. We add a message so we know which
pipeline triggered the build `-m`. Gitlab provides some predefined  
[environment variables](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html).
Two of those being the ones within our message.

```bash
yarn run deploy -m "Pipeline $CI_PIPELINE_ID, build $CI_BUILD_ID" --non-interactive --token $FIREBASE_DEPLOY_TOKEN
```

When we trigger the deploy script it will look within our `firebase.json` file and then
run the `predeploy` commands, which will transpile our code from TS -> JS.

### Functions

This folder contains our (Express) web service, i.e. it has our actual code.

The `package.json` file is used to install all of our dependencies inside the serverless environment.
It also defines the `build` script that will be used in the pre-deploy process before the code
is deployed to Firebase.

```json:title=firebase/functions/package.json
{
  ...
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc -p . --skipLibCheck",
    "deploy": "firebase deploy --only functions"
  },
  ...
  "engines": {
    "node": "8"
  }
}
```

When we run the `build` script we create a `lib` folder which contains the compiled (JS). Hence the main file
is `lib/index.js`. The lib folder is created because we specify the `outDir` to be `lib` in the `tsconfig.json`.
The Firebase Cloud Functions by default uses NodeJS (as stated above this can be changed in the GCP GUI) to run
our Firebase Cloud Functions, hence our code needs to be compiled to JS from TS before we deploy it.

```json:title=firebase/functions/tsconfig.json
{
  "compilerOptions": {
    ...
    "outDir": "lib",
    ...
  },
}
```

Now let's take a look at the "business" logic of the application.

This file contains all the core logic for our web service. Here we define
two endpoints called `hello` and `bye`. As stated earlier this will be the entry point
into our application. This is the file that will set up and start are Express server/web service within the
Firebase Cloud environment.

```ts:title=firebase/functions/index.ts file=./source_code/firebase/functions/index.ts

```

Breaking down the file first, we set up our web service. We tell it to use the JSON
middleware alongside our custom `ValidateToken`. These will run before the request is passed
to our two endpoints helping to reduce boilerplate code, as common functionality between
endpoints can be split out into middleware functions.

```js
initializeApp();
const app = express();

app.use(express.json());
app.use(ValidateToken);
```

Then we define our endpoints in this case two very simple endpoints `/hello` and `/bye`,
that receive a field called `name` in the request body, we return a `200` status
code alongside a message (returned as JSON).

We split out `hello` and `bye` into separate functions as it's a bit easier to read,
we could also split this out into separate files if the logic gets more complicated,
but in this example, it's simple enough to leave it all in this single file.

```ts:title=firebase/functions/index.ts
app.post("/hello", hello);
app.post("/bye", bye);

function hello(request: express.Request, response: express.Response) {
  const body = request.body;
  const name = body.name;
  response.status(200).json({ hello: `Hello ${name}` });
}

function bye(request: express.Request, response: express.Response) {
  const body = request.body;
  const name = body.name;
  response.status(200).json({ bye: `Bye ${name}` });
}

export const api = https.onRequest(app);
```

#### middleware (optional)

The middleware folder stores all of our server middleware, these are functions that are usually called before
every request. Hence we don't have to explicilty call them on all of our endpoints. `Express` handles this for
us and automatically runs the middleware before the endpoint function is called.

We are checking the `Authorization` token sent with the request is validate, by default
our Firebase Cloud Function endpoints are accessible by anyone. We can restrict
who has access to them by requiring the client to send a token. As you can see below we do this using Firebase's
own auth component.

**Note**: Don't worry, your users don't need to sign up for you to "authenticate/authorisation" them.

##### ValidateToken.ts

```tsx:title=firebase/functions/middleware/ValidateToken.ts file=./source_code/firebase/functions/middleware/ValidateToken.ts

```

Breaking down the file, first we check if the request header contains the `Authorization` parameter
and that parameter has a form similar to
[`Bearer $TOKEN`](https://swagger.io/docs/specification/authentication/bearer-authentication/).
If not, we return a `403` [HTTP error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

```tsx:title=firebase/functions/middleware/ValidateToken.ts
if (
  request.headers.authorization &&
  request.headers.authorization.startsWith("Bearer ")
) {
  token = request.headers.authorization.split("Bearer ")[1];
} else {
  response.status(403).json({ code: "unauthorized" });
  return;
}
```

Then we use Firebase admin to verify if the token is valid. If so, we pass the request on with the `next()` function.

```tsx:title=firebase/functions/middleware/ValidateToken.ts
auth()
  .verifyIdToken(token)
  .then(() => {
    return next();
  })
  .catch(() => {
    response.status(403).json({ code: "unauthorized" });
  });
```

Finally we have an `index.ts` to make for cleaner import/export.

```tsx:title=firebase/functions/middleware/index.ts file=./source_code/firebase/functions/middleware/index.ts

```

## React Native

Next let's take a look at our React Native logic and how we interact with the Firebase Cloud Functions.
I created a new app using the following command:

`react-native init MyAwesomeProject --template typescript`

### Structure

This is the project structure of our React Native app:

```text
.
└── ExampleApp
    ├── android
    ├── app.json
    ├── App.tsx
    ├── babel.config.js
    ├── .buckconfig
    ├── .eslintrc.js
    ├── .flowconfig
    ├── .gitattributes
    ├── .gitignore
    ├── index.js
    ├── ios
    ├── LICENSE
    ├── metro.config.js
    ├── node_modules
    ├── package.json
    ├── .prettierrc.js
    ├── README.md
    ├── template.config.js
    ├── __tests__
    ├── tsconfig.json
    ├── .watchmanconfig
    └── yarn.lock
```

This file contains most of our logic:

```tsx:title=react_native/ExampleApp/App.tsx file=./source_code/react_native/ExampleApp/App.tsx

```

The main page will have a single button which when pressed will make a request to our Firebase Cloud Functions.

```tsx:title=react_native/ExampleApp/App.tsx
const App = () => (
  <Button title="Make Request" onPress={() => makeRequest()}></Button>
);
```

Then in the `makeRequest()` function we use
[react-native-firebase](https://invertase.io/oss/react-native-firebase/) for the authentication (optional)
if you set up the authentication middleware in the firebase functions. You can use the
[following tutorial](https://invertase.io/oss/react-native-firebase/quick-start/existing-project) to get
started with the library.
The following allows any user of our app to get a token we can send with our HTTP request.

```tsx:title=react_native/ExampleApp/App.tsx
const userCredentials = await firebase.auth().signInAnonymously();
const token = await userCredentials.user.getIdToken();
```

We use `apisauce` to make HTTP requests, but first we must "create" an API object. Here is where we pass our auth token.

**NOTE**: Remember to replace `baseURL` with your URL.

```tsx:title=react_native/ExampleApp/App.tsx
const api = create({
  baseURL: "https://us-central1-exampleapp.cloudfunctions.net",
  headers: { Authorization: `Bearer ${token}` },
  timeout: 10000,
});
```

Then we specify the `/hello` endpoint. The response contains a few parameters, if `ok` is set to `true`
then the request was successful (`2xx` HTTP code).

We then log the response from the server. In reality you will want to do something more
useful than that but this is just a simple example.
All of this code is all surrounded by a try catch so if a reject promise is returned, it will be
captured by the `catch`.

```tsx:title=react_native/ExampleApp/App.tsx
const response: ApiResponse<{ hello: string }> = await api.post("/hello", {
  name: "Haseeb",
});

const { data, ok, status } = response;
if (ok) {
  console.log("Success", status, data);
} else {
  console.error("error", status);
}
```

**Note**: Sometimes your Cloud Functions may run a bit slower the first time you call them (in a while).
You need to keep your functions "warm" as they say, as long as you're running the functions the container
they are running in stays alive, after a period of time it is destroyed and needs to be recreated, hence
after a long period of time since the function was called it may well be a few seconds slower.

That's it! Ee succesfully set up a React Native application to use Cloud Functions we deployed on
Firebase (with authentication).

## Appendix

- [Example Firebase source code](https://gitlab.com/hmajid2301/medium/-/tree/master/20.%20React%20Native%20with%20Firebase%20Cloud%20Functions%20and%20Gitlab%C2%A0CI/source_code/firebase)
- [Example React Native source code](https://gitlab.com/hmajid2301/medium/-/tree/master/20.%20React%20Native%20with%20Firebase%20Cloud%20Functions%20and%20Gitlab%C2%A0CI/source_code/react_native/ExampleApp)
- [Example Firebase project](https://gitlab.com/hmajid2301/stegappasaurus-api)
