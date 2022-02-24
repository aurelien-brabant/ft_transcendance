/* USERS */

export type SeedUsers = {
    id: number;
    username: string;
    password: string;
    email: string;
    phone: string;
    pic: string;
    duoquadra_login: string;
    rank: number;
    win: number;
    loose: number;
    games: SeedGames[];
    friends: SeedUsers[];
    ownedChannels: SeedChannels[];
    joinedChannels: SeedChannels[];
    sentMessages: SeedMessages[];
};

/* GAMES */

export type SeedGames = {
    id: number;
    players: SeedUsers[];
    winner: number;
    createdAt: Date;
};

/* CHANNELS */

export type SeedChannels = {
    id: number;
    name: string;
    owner: SeedUsers;
    isPublic: boolean;
    isProtected: boolean;
    password: string;
    users: SeedUsers[];
    messages: SeedMessages[];
};

/* MESSAGES */

export type SeedMessages = {
    id: number;
    createdAt: Date;
    content: string;
    sender: SeedUsers;
    channel: SeedChannels;
};
