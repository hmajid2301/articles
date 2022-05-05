---
title: "E2E tests with Gitlab CI services"
tags: ["testing", "ci", "gitlab"]
license: "public-domain"
slug: "gitlab-ci-and-services"
canonical_url: "https://haseebmajid.dev/blog/gitlab-ci-and-services"
date: "2021-12-25"
published: true
cover_image: "images/cover.jpg"
---

## Background

This will be a slightly shorter article. In this article I will show you how I've managed to do some
end-to-end testing with Gitlab CI services.

I'm building a browser-based multiplayer game called Banter Bus. Banter Bus consists of three main components,

- gui: A SvelteKit based frontend the user will interact with to play the game
- core-api: A Socketio API written in Python
- management-api: A simple RESTful API written in Python (FastAPI)

Now say I want to write some e2e Cypress tests, that will test all of these components interacting with each other.
Which mainly will look something like `gui -> core-api -> management-api`.

Each of these project deploys its own Docker container, which we can then use for testing it. So how can we do this with Gitlab CI ?

## Gitlab Services

What is a Gitlab CI service ?

> The services keyword defines a Docker image that runs during a job linked to the Docker image that the image keyword defines. This allows you to access the service image during build time. - https://docs.gitlab.com/ee/ci/services/

Essentially they are Docker containers we can use in our CI jobs.

## package.json

For the examples below assume our `package.json` scipts section looks something like:

```json:title=package.json
{
  "dev": "svelte-kit dev",
  "e2e": "cypress run --browser chrome",
  "e2e:ci": "start-server-and-test dev http://localhost:3000 e2e"
}
```

## Gitlab CI

Let's take a look at an example `.gitlab-ci.yml` file:

```yml:title=.gitlab-ci.yml
stages:
  - test

cypress-e2e-chrome:
  image: cypress/browsers:node14.17.0-chrome88-ff89
  stage: test
  variables:
	BANTER_BUS_CORE_API_MANAGEMENT_API_URL: http://banter-bus-management-api
	BANTER_BUS_CORE_API_DB_HOST: banter-bus-database
	FF_NETWORK_PER_BUILD: 1
	# Hidden the rest of the variables as not to clutter the file
  services:
    - name: mongo:4.4.4
      alias: banter-bus-database
    - name: registry.gitlab.com/banter-bus/banter-bus-core-api:test
      alias: banter-bus-core-api
    - name: registry.gitlab.com/banter-bus/banter-bus-management-api:test
      alias: banter-bus-management-api
    - name: registry.gitlab.com/banter-bus/banter-bus-management-api/database-seed:latest
      alias: banter-bus-database-seed
  script:
	- npm ci
    - export VITE_BANTER_BUS_CORE_API_URL=http://banter-bus-core-api:8080
    - echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf && sysctl -p
    - npm run e2e:ci
  artifacts:
    expire_in: 1 week
    when: always
    paths:
      - cypress/screenshots
      - cypress/videos
    reports:
      junit:
        - results/TEST-*.xml
```

### Services

Let's break file down a bit, these are essentially all the dependencies of our `gui` application. We need all of
these containers running.

In this case we need four containers (this doesn't really matter):

- banter-bus-database: A database for the core-api and management-api
- banter-bus-core-api: The main API the gui will interact with
- banter-bus-management-api: Used to help manage our available games, questions etc
- banter-bus-database-seed: A short lived container which pre-fills the database with some values

```yml
services:
  - name: mongo:4.4.4
    alias: banter-bus-database
  - name: registry.gitlab.com/banter-bus/banter-bus-core-api:test
    alias: banter-bus-core-api
  - name: registry.gitlab.com/banter-bus/banter-bus-management-api:test
    alias: banter-bus-management-api
  - name: registry.gitlab.com/banter-bus/banter-bus-management-api/database-seed:latest
    alias: banter-bus-database-seed
```

In our examples the `name` field is the image name, this is the same name you'd use when using the `docker pull`
command. The next field is `alias` this is the name we'll use to reference that container. This is the container name.

To see how the `alias` is used, is to look at the environment variables we have provided for the job
`BANTER_BUS_CORE_API_DB_HOST: banter-bus-database`. So core-api will try to connect to database using
this host. You can read more about Docker is able to resolve this to an [IP address here](/blog/dns-docker-explained/). Another example is how the URL core-api will use to connect to the management-api
`BANTER_BUS_CORE_API_MANAGEMENT_API_URL: http://banter-bus-management-api`.

:::important ENV Variable
One environment variable we must provide is `FF_NETWORK_PER_BUILD` set to `1` (or true). Docker then
creates a bridge network so all the services can communicate amognst themselves. You can read more about
[it here](https://docs.gitlab.com/runner/executors/docker.html#create-a-network-for-each-job)
:::

We've discussed the most important part of the CI file, but lets quickly discuss the rest for completeness

:::note optional
I've discussed the main point of this article, how to use services and how to get them to work together.
:::

### Variables

We've already spoken about this above, but lets take a quick look at the `variables` section.

```yml
variables:
  BANTER_BUS_CORE_API_MANAGEMENT_API_URL: http://banter-bus-management-api
  BANTER_BUS_CORE_API_DB_HOST: banter-bus-database
  FF_NETWORK_PER_BUILD: 1
  # Hidden the rest of the variables as not to clutter the f
```

These are environment variables that are shared both with the job and the services. Some of these are
config passed to the application, such as `BANTER_BUS_CORE_API_MANAGEMENT_API_URL` and `BANTER_BUS_CORE_API_DB_HOST`.

### Script

Since we are using the `cypress/browsers:node14.17.0-chrome88-ff89` image, we have access to chrome
(headless) browser we can use with Cypress.

So we can do something like so:

```yml
script:
  - npm ci
  - export VITE_BANTER_BUS_CORE_API_URL=http://banter-bus-core-api:8080
  - npm run e2e:ci
```

- `npm ci`: Installs our npm dependencies for the gui app
- `export VITE_BANTER_BUS_CORE_API_URL=http://banter-bus-core-api:8080` exports an enviroment variable which will be used by the gui app so it knows the URL of the core-api. Note the use of the alias name here (and port `:8080` default port for the core-api)
- `npm run e2e:ci`: Starts the dev server and then runs the cypress test, see `start-server-and-test dev http://localhost:3000 e2e` where `e2e` is `cypress run --browser chrome`

### Artifacts

Finally, the artifacts are "things" that are left over after the build. In this case we use them in two ways:

- One to generate a coverage report with `junit`
- Two to save our Cypress screenshots and videos

The downloadable artifacts will expire after 1 week. The Cypress files can be useful when debugging a problem
with your tests. You get a video of perhaps why the tests failed.

```yml
artifacts:
  expire_in: 1 week
  when: always
  paths:
    - cypress/screenshots
    - cypress/videos
  reports:
    junit:
      - results/TEST-*.xml
```

## Appendix

- [Example Project](https://gitlab.com/banter-bus/banter-bus-gui/-/tree/350f1f986b077ac86da924b830fed88ffcd3cde0)
- [Example Job](https://gitlab.com/banter-bus/banter-bus-gui/-/jobs/1920396599)
