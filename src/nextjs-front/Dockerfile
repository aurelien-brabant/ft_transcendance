FROM node:16-alpine3.14

WORKDIR /usr/app

COPY	. .

RUN		yarn install

RUN		yarn build

# TODO: Add API keys to the environment at BUILD time

CMD		[ "yarn", "start" ]
