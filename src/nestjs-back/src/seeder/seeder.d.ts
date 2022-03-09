/* USERS */

import { SpawnSyncOptionsWithBufferEncoding } from "child_process";

export type SeedUser = {
    id: number;
    username: string;
    password: string;
    email: string;
    phone: string;
    tfa: string;
    pic: string;
    duoquadra_login: string;
    rank: number;
    games: SeedGame[];
    wins: number;
    losses: number;
    friends: SeedUser[];
    ownedChannels: SeedChannel[];
    joinedChannels: SeedChannel[];
};

/* GAMES */

export type SeedGame = {
    id: number;
    players: SeedUser[];
    winner: SeedUser;
    createdAt: Date;
};

/* CHANNELS */

export type SeedChannel = {
    id: number;
    name: string;
    owner: SeedUser;
    visibility: string
    password: string;
    users: SeedUser[];
    messages: SeedMessage[];
};

/* MESSAGES */

export type SeedMessage = {
    id: number;
    createdAt: Date;
    content: string;
    sender: SeedUser;
    channel: SeedChannel;
};
