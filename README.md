# ft_transcendance

A frankly over-engineered but not less cool web implementation of the Pong game.

# Setup

A `docker-compose` file is available to build and run the set of containers that are required to make the app work as it is supposed to.
However, before that some environment setup has to be done. The following steps will guide you through these.

## PostgreSQL (database) setup

The basic database credentials can be configured through a `postgres.env` file.

Copy the provided sample to a `postgres.env` file like so:

```sh
cp postgres.sample.env postgres.env
```

And then tweak the variables in there as you wish.

## NestJS (backend) setup

The backend server configuration is loaded from a `.env` file located in the `nestjs-back` directory.

Copy the provided sample to a `.env` file after you got in the `nestjs-back` directory:

```sh
cd nestjs-back && cp sample.env .env
```

Configure every variable in this file and make sure to read the comments when applicable. You don't need to configure the database
credentials in there as they will be taken from the `postgres.env` file.

## NextJS (frontend) setup

Some configuration is required to make the frontend behave properly.
This configuration is loaded from a `.env` file that must be located in the `nextjs-front` directory.

To start, copy the provided sample to a proper `.env` file:

```sh
cd nextjs-front && cp sample.env .env
```

# Run in production

Before running the project in production, [please make sure you did all the required setup before](#setup).

Then, building the containers and running the app in production is a simple as typing:

```sh
docker-compose up --build
```

**Protip**: You can specify the `-d` flag if you want the project to run in the background.



# Development

## Architecture

The following diagram represents the whole architecture of the project. Every cube is an individual docker container.

![ft_transcendance architecture](https://i.imgur.com/KQsKRAp.png)


## Run the development cluster

A special docker-compose file named `docker-compose.dev.yml` is available for development.
One can start the development cluster with:

```sh
docker-compose -f src/docker-compose.dev.yml up --build [-d]
```

## IMPORTANT NOTE: slow startup for NextJS and NestJS containers

By default, the `entrypoint.dev.sh` script will attempt to install the required dependencies using `yarn install` from within the container.
As the folder in which the app resides is bind-mounted, installing the dependencies from the container may take more time than doing so directly on the
host system. If `yarn` is installed on the host system, it is recommended to `yarn install` from the host prior running the development cluster so that nothing
has to be installed inside the container.

## Frontend developers

Connect to `http://127.0.0.1:3000` in your browser to access the NextJS React application (in development only). Every change will trigger a hot reload, which means that the browser will instantly reflect the changes.
Alternatively, it is possible to connect to the app through the reverse proxy on `http://127.0.0.1` (no port == port 80), but **this is not recommended during development as it will not enable the hot reload feature**.

## Backend developers

The NestJS API can be accessed on `http://127.0.0.1:5000` (during development only) or on `http://127.0.0.1/api` (dev && prod). The `api` prefix is not part of the actual API route and is only there to properly proxy the request to the right service.
In dev mode, every change made to the Nest app causes it to instantly reload.

Don't forget to install the NestJS command line tool:
```sh
yarn global add @nestjs/cli
# OR, if using npm
npm install -g @nestjs/cli
```

## Troubleshooting

The following commands may prove useful to troubleshoot issues:

### Check container status

```sh
docker-compose -f src/docker-compose.dev.yml ps
```

### Check container logs

```sh
docker-compose -f src/docker-compose.dev.yml logs [container_name]
```

## About development

This cluster makes use of the development build of NextJS and NestJS and uses special Dockerfiles labelled has `Dockerfile.dev`.
Essentially, what happens is that the source code repository for each application is bind-mounted inside the docker container, so that
it **runs** in the container, but anyone can change the source code directly from the host system and reload the application almost immediately.
Additionally, no `.env` file is used in development.

On the other hand, The production cluster (currently a work in progress) builds everything inside the image and does not depend on the host filesystem, while making use of the production build of NestJS and NextJS.
