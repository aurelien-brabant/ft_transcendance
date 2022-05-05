import { Time } from "@faker-js/faker/time";
import { SpawnSyncOptionsWithBufferEncoding } from "child_process";
import { Timestamp } from "typeorm";

/* USERS */

export type SeedUser = {
    id: number;
    username: string;
    duoquadra_login: string;
    email: string;
    phone: string;
    pic: string;
    password: string;
    tfa: boolean;
    tfaSecret: string;
    hasTfaBeenValidated: boolean;
    lastTfaRequestTimestamp: string | number | Date;
    accountDeactivated: boolean;
    games: Game[];
    wins: number;
    losses: number;
    draws: number;
    ratio: number;
    achievements: Achievement[];
    friends: User[];
    pendingFriendsSent: User[];
    pendingFriendsReceived: User[];
    blockedUsers: User[];
    ownedChannels: Channel[];
    joinedChannels: Channel[];
    directMessages: DirectMessage[];
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

/* NOTE: don't need chat seeding anymore
export type SeedChanMessage = {
  id: number;
  createdAt: Date;
  content: string;
  author: SeedUser;
  channel: SeedChannel;
};

export type SeedDmMessage = {
  id: number;
  createdAt: Date;
  content: string;
  author: SeedUser;
  channel: SeedDirectMessage;
};

export type SeedChannel = {
  id: number;
  name: string;
  privacy: string;
  password?: string;
  restrictionDuration: number;
  owner: SeedUser;
  users: SeedUser[];
  admins: SeedUser[];
  mutedUsers: SeedUser[];
  bannedUsers: SeedUser[];
  messages: SeedChanMessage[];
};

export type SeedDirectMessage = {
  id: number;
  users: SeedUser[];
  messages: SeedChanMessage[];
};*/
