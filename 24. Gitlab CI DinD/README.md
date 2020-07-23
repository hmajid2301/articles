---
title: "DinD with Gitlab CI"
tags: ["Docker", "Gitlab", "CI"]
license: "public-domain"
slug: "dind-and-gitlab-ci"
canonical_url: "https://haseebmajid.dev/blog/dind-and-gitlab-ci"
date: "2020-05-01"
published: true
cover_image: "images/cover.png"
---

Like most developers, we want to be able to automate as many and as much of processes as possible. Pushing Docker
images to a registry is a task that can easily be automated. In this article, we will cover how you can use
Gitlab CI to build and publish your Docker images, to the Gitlab registry. However, you can also very easily
edit this to push your images to DockerHub as well.

A quick aside on terminology related to Docker:

- container: An instance of an image is called a container (`docker run`)
- image: A set of immutable layers (`docker build`)
- hub: The official registry where you can get more Docker images from (`docker pull`)

## Example

Here is an example `.gitlab-ci.yml` file which can be used to build and push your Docker images to the Gitlab registry.

```yaml
variables:
  DOCKER_DRIVER: overlay2

services:
  - docker:dind

stages:
  - publish

publish-docker:
  stage: publish
  image: docker
  script:
    - export VERSION_TAG=v1.2.3
    - docker login ${CI_REGISTRY} -u gitlab-ci-token -p ${CI_BUILD_TOKEN}
    - docker build -t ${CI_REGISTRY_IMAGE}:latest -t ${CI_REGISTRY_IMAGE}:${VERSION_TAG}  .
    - docker push ${CI_REGISTRY_IMAGE}:latest
    - docker push ${CI_REGISTRY_IMAGE}:${VERSION_TAG}
```

## Explained

The code above may be a bit confusing, it might be a lot to take in. So now we will break it down line by line.

```yaml
variables:
  DOCKER_DRIVER: overlay2
```

In our first couple of lines, we define some variables which will be used by all our jobs (the variables are global).
We define a variable `DOCKER_DRIVER: overlay2`, this helps speed our Docker containers a bit because by default it
uses `vfs` which is slower
[learn more here](https://docs.gitlab.com/ce/ci/docker/using_docker_build.html#using-the-overlayfs-driver).

```yaml
random-job:
  stage: publish
  variables:
    DOCKER_DRIVER: overlay2
  script:
    - echo "HELLO"
```

> Note we could just as easily define `variables` just within our job as well like you see in the example above.

```yaml
services:
  - docker:dind
```

The next couple of lines define a service. A service is a Docker image which links during our job(s). Again in this
example, it is defined globally and will link to all of our jobs. We could very easily define it within our job just
like in the `variables` example. The [`docker:dind`](https://github.com/docker-library/docker/blob/157869f94ea90e2acb4d0f77045d99079ead821c/18.02/dind/dockerd-entrypoint.sh)
image automatically using its `entrypoint` starts a docker daemon. We need to use this daemon to build/push our
Docker images within CI.

The `docker:dind` (dind = Docker in Docker) image is almost identical to the `docker` image. The difference being the dind image
starts a Docker daemon. In this example, the job will use the `docker` image as the client and connect to the daemon
running in this container.

We could also just use the `dind` image in our job and simply start `dockerd` (& = in the background) in the first line.
The `dockerd` command starts the Docker daemon as a client, so we can then communicate with the other Docker daemon.
It would achieve the same outcome. I think the service approach is a bit cleaner but as already stated either approach
would work.

```yaml
publish-docker:
  stage: publish
  image: docker:dind
  script:
    - dockerd &
    ...
    - docker push ${CI_REGISTRY_IMAGE}:${VERSION_TAG}
```

> Info: One common use case of Gitlab CI services is to spin up databases like MySQL. We can then connect to it within our job, run our tests. It can simplify our jobs by quite a bit.

> Note: There are several other ways we could also build/push our images. This is the [recommended approach](https://gitlab.com/gitlab-examples/docker/blob/master/.gitlab-ci.yml).

```yaml
stages:
  - publish
```

Next, we define our stages and give them names. Each job must have a valid stage attached to it. Stages are used to
determine when a job will be run in our CI pipeline. If two jobs have the same stage, then they will run in parallel.
The stages defined earlier will run first so order does matter. However in this example, we only have one stage and
one job so this isn't super important, more just something to keep in mind.

```yaml
publish-docker:
  stage: publish
  ...
```

Now we define our job, where `publish-docker` is the name of our job on `Gitlab CI` pipeline. We then define
what `stage` the job should run in, in this case, this job will run during the `publish` stage.

```yaml
publish-docker:
  ...
  image: docker
  ...
```

Then we define what Docker image to use in this job. In this job, we will use the `docker` image. This
image has all the commands we need to `build` and `push` our Docker images. It will act as the client making
requests to the `dind` daemon.

```yaml
script:
  - export VERSION_TAG=v1.2.3
  - docker login ${CI_REGISTRY} -u gitlab-ci-token -p ${CI_BUILD_TOKEN}
  - docker build -t ${CI_REGISTRY_IMAGE}:latest -t ${CI_REGISTRY_IMAGE}:${VERSION_TAG}  .
  - docker push ${CI_REGISTRY_IMAGE}:latest
  - docker push ${CI_REGISTRY_IMAGE}:${VERSION_TAG}
```

Finally, we get to the real meat and potatoes of the CI file. The bit of code that builds and pushes are Docker
images to the registry:

```yaml
- export VERSION_TAG=v1.2.3
```

It is often a good idea to tag our images, in this case, I'm using a release name. You could get this from say your
`setup.py` or `package.json` file as well. In my Python projects I usually use this command
`export VERSION_TAG=$(cat setup.py | grep version | head -1 | awk -F= '{ print $2 }' | sed 's/[",]//g' | tr -d "'")`,
to parse my `setup.py` for the version number. But this can be whatever you want it to be. Here we have just kept it
static to make things simpler but in reality, you'll probably want to retrieve it programmatically (the version number).

```yaml
- docker login ${CI_REGISTRY} -u gitlab-ci-token -p ${CI_BUILD_TOKEN}
```

Then we log in to our Gitlab registry, the environment variables `$CI_REGISTRY` and `CI_BUILD_TOKEN` are predefined
Gitlab variables that are injected into our environment. You can read more about them
[here](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html). Since we are pushing to our Gitlab registry
we can just use the credentials defined within environment i.e. `username=gitlab-ci-token` and password a throwaway
token.

> Note: You can only do this on protected branches/tags.

```yaml
- docker build -t ${CI_REGISTRY_IMAGE}:latest -t ${CI_REGISTRY_IMAGE}:${VERSION_TAG}  .
- docker push ${CI_REGISTRY_IMAGE}:latest
- docker push ${CI_REGISTRY_IMAGE}:${VERSION_TAG}
```

Finally, we run our normal commands to build and push our images. The place where you can find your images will depend
on the project name and your username but it should follow this format

```bash
registry.gitlab.com/<username>/<project_name>/<tag>
```

### (Optional) Push to DockerHub

```yaml
- docker login -u hmajid2301 -p ${DOCKER_PASSWORD}
- export IMAGE_NAME="hmajid2301/example_project"
- docker build -t ${IMAGE_NAME}:latest -t ${IMAGE_NAME}:${VERSION_TAG}  .
- docker push ${IMAGE_NAME}:latest
- docker push ${IMAGE_NAME}:${VERSION_TAG}
```

We can also push our images to DockerHub, with the code above. We need to first login to DockerHub. Then change the
name of our image `<username>/<project_name>`.

## Appendix

- [Good SO Post](https://stackoverflow.com/questions/47280922/role-of-docker-in-docker-dind-service-in-gitlab-ci)
- [Gitlab CI Docs](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html)
- [Gitlab Example](https://gitlab.com/gitlab-examples/docker/blob/master/.gitlab-ci.yml)
