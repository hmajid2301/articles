---
title: "How DNS works with Docker?"
tags: ["docker", "networking", "dns"]
license: "public-domain"
slug: "dns-docker-explained"
canonical_url: "https://haseebmajid.dev/blog/dns-docker-explained/"
date: "2020-10-27"
published: true
cover_image: "images/cover.jpg"
---

In this article, we will briefly go over what DNS (domain name system) is and explain how it is used in conjunction
with Docker 🐳..

## DNS

You can think of DNS like a phonebook, except instead of people's name and phone numbers, it stores domains names and
IP addresses (this can be either IPv4 or IPv6). Where a domain name is used to identify resources i.e. `google.com` is a
domain name. This is how DNS works:

```text
google.com:     8.8.8.8
cloudflare.com: 1.1.1.1
```

### Example

You can manually send a DNS request (and get a response) using the `dig` command. So for example, we can do something
like this.

```bash{promptUser: haseeb}{outputLines:2}
dig +short google.com
172.217.169.78
```

### Records

Each DNS entry can be of varying types, some of the most common DNS types (referred to as records) are:

A: Points a domain name to an IPv4 address i.e. `8.8.8.8`
AAAA: Same as an A record except points to an IPv6 address i.e. `2001:db8:0:1`
CNAME: Canonical Name points one domain to another domain name, one common use case is to point `www.example.com` -> `example.com`. This way we only need to update the A record of `example.com`, not both domains.

#### AAAA Example

To specify a AAAA (quad A) record we can do something like:

```bash{promptUser: haseeb}{outputLines:2}
dig +short google.com AAAA
2a00:1450:4009:810::200e
```

:::important More Details
In a future article, I will do a deeper dive into the mechanics of how DNS works and the actual process of converting a domain name to an IP address.
:::

So that's DNS in a nutshell! On to how it relates to Docker.

:::note tl:dr
DNS is a system used to convert domain names into IP addresses because it's much easier for humans to remember names as compared with numbers.
:::

## Docker

For the sake of this article, we will be using the following docker-compose file:

```yaml:title=docker-compose.yml
version: "3.5"

services:
  web_server:
    container_name: nginx
    build:
      context: .
      dockerfile: docker/nginx/Dockerfile
    ports:
      - 80:80
    depends_on:
      - app

  app:
    container_name: flask
    build:
      context: .
      dockerfile: docker/flask/Dockerfile
    env_file: docker/database.conf
    expose:
      - 8080
    depends_on:
      - database

  database:
    container_name: postgres
    image: postgres:latest
    env_file: docker/database.conf
    ports:
      - 5432:5432
    volumes:
      - db_volume:/var/lib/postgresql

volumes:
  db_volume:
```

It will create three containers, Nginx, a flask app and a Postgres database, when we run `docker-compose up --build`, in particular take **note** of the `container_name`(s): `postgres`, `nginx`, `flask`.

:::tip Source Code
The source code for those Docker containers can be found
[here](https://gitlab.com/hmajid2301/articles/-/tree/master/7.%20Multi%20Docker%20Container%20with%20Nginx%2C%20Flask%20and%C2%A0MySQL/source_code)
:::

### Nginx

Our `nginx` config file looks something like:

```title:example.conf{10}
server {
  listen 80;
  server_name _;

  location / {
    try_files $uri @app;
  }

  location @app {
    include /etc/nginx/uwsgi_params;
    uwsgi_pass flask:8080;
  }
}
```

This Nginx configuration file tells Nginx to pass any requests sent on `/` path to the
uwsgi server running in the `flask` docker container.
Now taking a look at the `location @app` section you'll notice for `uwsgi_pass` we don't specify an IP address to send the requests
to. Instead, we use the container name, this is because within Docker containers we don't have to specify the other Docker
container's IP address to connect to it we can specify the container name. Docker's DNS will resolve the name into an IP address for us.

### Nginx Example

So if I open a shell on the `nginx` container:

```bash{promptUser: haseeb}
docker exec -it nginx bash
```

Then we can do something like:

```bash{promptUser: root}{outputLines:3}
apt update && apt install dnsutils
dig flask +short
172.23.0.3
```

This is particularly useful because Docker containers get assigned an IP if you don't specify one
(in the `docker-compose.yml`) file. Taking a look at the IP assigned to the `flask`
the container matches the IP address returned by the dig command.

```bash{promptUser: haseeb}{outputLines:2}
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' flask
172.23.0.3
```

### Flask Example

Similarly in the `flask` container if we want to connect to the `postgres` database, we can just specify the host
using the container name `postgres` rather than an IP in our connection URI. As shown in the example below:

```python
DATABASE_CONNECTION_URI = f'postgresql+psycopg2://{user}:{password}@postgres:5432/{database}'
```

:::note Example
The example above is a URI used by the SQLAlchemy library to connect to the Postgres database.
:::

## Deep Diver

Let's take a slightly closer look into Docker's architecture to understand what is going on here.

### Docker Engine 🏭 Explained

> Docker Engine is an open-source containerization technology for building and containerizing your applications. - https://docs.docker.com/engine/

It contains the following components: - A server with a long-running daemon process dockerd. - APIs which specify interfaces that programs can use to talk to and instruct the Docker daemon. - A command-line interface (CLI) client docker.

When we install Docker we are also installing the Docker Engine.

:::important More Details
In a future article, I will do a deeper dive into the Docker Engine as well 🐳.
:::

Briefly, how it works is we use the CLI i.e. `docker run`/`docker-compose`, which makes
API requests (on our behalf) to the Docker daemon. The Docker daemon then interacts with containerd, which is responsible for the creation/deletion of our containers. Essentially containerd is a container supervisor.

### Docker Engine and DNS

Now how does Docker Engine relate to DNS? As long as the two containers are on the same
network we can use the container name and resolve it using DNS. Each Docker container has a DNS resolver that forwards
DNS queries to Docker Engine, which acts as a DNS server. Docker
Engine then checks if the DNS query belongs to a container on the network that the requested container belongs to.
If it does, then Docker Engine looks up the IP address that matches a container name in its key-value store and
returns that IP back to the requesting container.

![https://success.mirantis.com/api/images/.%2Frefarch%2Fnetworking%2Fimages%2FDNS.png](Docker DNS Explained)

:::note Normal Queries
For all other DNS queries the Docker Engine will use the host machine's DNS settings,
unless overwritten (explained below in the `Misc` section).
:::

:::important Daemon Vs Engine

> Docker Daemon checks the client request and communicates with the Docker components to perform a service whereas, Docker Engine or Docker is the base engine installed on your host machine to build and run containers using Docker components and services - Anjali Nair, [Quora](https://www.quora.com/What-is-the-difference-between-the-Docker-Engine-and-Docker-Daemon)
> :::

## Misc

:::note Docker DNS Settings
We can customise Docker's default DNS settings by using the `--dns` flag, for example, to use Google's DNS you could
go `--dns 8.8.8.8`. You can also provide your DNS records for the container to use by using the `--extra_hosts` flag.
For example `--extra_hosts somehost:162.242.195.82`.
:::

:::warning Docker DNS Settings
Custom hosts defined in the `/etc/hosts` file are ignored. They must be passed in using the `extra_hosts` flag.
:::

## Appendix

- [What is DNS?](https://www.cloudflare.com/en-gb/learning/dns/what-is-dns/) by CloudFlare
- [DNS Records](https://www.bluehost.com/help/article/dns-records-explained) Explained
- [Docker Engine](https://www.serverwatch.com/server-news/how-docker-engine-works-to-enable-containers/)
- [Docker in detail](https://stackoverflow.com/questions/41645665/how-containerd-compares-to-runc) SO Post
- [Docker Swarm Architecture](https://success.mirantis.com/article/networking) (relevant to normal Docker)
