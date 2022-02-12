FROM node:16

ARG NEXT_PUBLIC_FT_CLIENT_ID
ARG	NEXT_PUBLIC_FT_REDIRECT_URI

WORKDIR /usr/app

COPY	. .

RUN		yarn install

RUN		yarn build

# TODO: Add API keys to the environment at BUILD time

CMD		[ "yarn", "start" ]
