# ft_transcendance

A frankly over-engineered but not less cool web implementation of the Pong game.

# Development

A special docker-compose file named `docker-compose.dev.yml` is available for development.
One can start the development cluster with:

```sh
docker-compose -f src/docker-compose.dev.yml up [-d]
```

This cluster makes use of the development build of NextJS and NestJS and uses special Dockerfiles labelled has `Dockerfile.dev`.
Essentially, what happens is that the source code repository for each application is bind-mounted inside the docker container, so that
it **runs** in the container, but anyone can change the source code directly from the host system and reload the application almost immediately.
Additionally, no `.env` file is used in development.

On the other hand, The production cluster (currently a work in progress) builds everything inside the image and does not depend on the host filesystem, while making use of the production build of NestJS and NextJS.
