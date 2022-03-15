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
  tfa: string;
  pic: string;
  duoquadra_login: string;
  rank: number;
  games: SeedGame[];
  wins: number;
  losses: number;
  ratio: number;
  friends: SeedUser[];
  ownedChannels: SeedChannel[];
  joinedChannels: SeedChannel[];
  accountDeactivated: boolean;
  blockedUsers: User[];
  user: User;
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
