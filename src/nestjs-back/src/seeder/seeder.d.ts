import { Time } from "@faker-js/faker/time";
import { SpawnSyncOptionsWithBufferEncoding } from "child_process";
import { Timestamp } from "typeorm";

/* USERS */

export type SeedUser = {
    id: number;
    username: string;
    password: string;
    email: string;
    phone: string;
    tfa: boolean;
    pic: string;
    duoquadra_login: string;
    games: SeedGame[];
    wins: number;
    losses: number;
    draws: number;
    ratio: number;
    friends: User[];
    blockedUsers: User[];
    pendingFriendsSent: User[];
    pendingFriendsReceived: User[];
    ownedChannels: SeedChannel[];
    joinedChannels: SeedChannel[];
    accountDeactivated: boolean;
    tfaSecret: string;
};

/* GAMES */

export type SeedGame = {
  id: number;
  players: SeedUser[];
  winnerId: number;
  looserId: number;
  createdAt: string;
  endedAt: string;
  winnerScore: number;
  looserScore: number;
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
  author: SeedUser;
  channel: SeedChannel;
};
