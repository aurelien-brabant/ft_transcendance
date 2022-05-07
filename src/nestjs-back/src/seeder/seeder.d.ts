import { Time } from "@faker-js/faker/time";
import { SpawnSyncOptionsWithBufferEncoding } from "child_process";
import { Timestamp } from "typeorm";

/* USERS */

export type SeedUser = {
    id: number;
    username: string;
    password: string;
    email: string;
    tfa: boolean;
    tfaSecret: string;
    pic: string;
    duoquadra_login: string;
    accountDeactivated: boolean;
    games: SeedGame[];
    wins: number;
    losses: number;
    draws: number;
    ratio: number;
    achievements: Achievement[];
    friends: User[];
    blockedUsers: User[];
    pendingFriendsSent: User[];
    pendingFriendsReceived: User[];
    ownedChannels: SeedChannel[];
    joinedChannels: SeedChannel[];
};

/* GAMES */
export type SeedGame = {
  id: number;
  players: SeedUser[];
  winnerId: number;
  loserId: number;
  winnerScore: number;
  loserScore: number;
  createdAt: Date;
  endedAt: Date;
  gameDuration: number;
};

/* CHANNELS */

export type SeedChannel = {
  id: number;
  name: string;
  privacy: string;
  password: string;
  restrictionDuration: number;
  owner: SeedUser;
  users: SeedUser[];
  admins: SeedUser[];
  mutedUsers: SeedUser[];
  bannedUsers: SeedUser[];
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
