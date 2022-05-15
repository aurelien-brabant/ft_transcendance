/* USERS */

type BaseUserData = {
	id: string;
	username: string;
	pic: string;
	duoquadra_login?: string;
	accountDeactivated: boolean;
};

/**
 * GET /api/auth/login
 */
 export type LoggedUser = BaseUserData & {
	email: string;
	phone?: string;
	tfa: boolean;
	tfaSecret?: string;
};

/**
 * GET /api/users
 */
export type Users = BaseUserData[];

/**
 * GET /api/users/:id
 */
export type ActiveUser = BaseUserData & {
	games: [],
	wins: number;
	losses: number;
	draws: number;
	ratio: number | string;
	achievements: Achievement[];
	friends: ActiveUser[];
	blockedUsers: ActiveUser[];
	pendingFriendsSent: ActiveUser[];
	pendingFriendsReceived: ActiveUser[];
};

export type User = LoggedUser & ActiveUser;

/**
 * GET /api/users/id/friends
 */
export type UserFriends = BaseUserData[];

/* ACHIEVEMENTS */

export type Achievement = {
	id: string;
	type: string;
	description: string;
	levelToReach: number;
	users: User[];
}

/* CHAT */

export type PunishmentType = 'mute' | 'ban';

export type ChannelPunishment = {
	id: string;
	startsAt: Date;
	endsAt: Date;
	durationInSeconds: number;
	type: PunishmentType;
	reason: string;
	punishedUser: User;
}

export type DmMessage = {
	id: string;
	createdAt: Date;
	content: string;
	author: User;
	channel: Channel;
};

export type DmChannel = {
	id: string;
	createdAt: Date;
	users: User[];
	messages: Message[];
}

export type ChannelMessage = {
	id: string;
	createdAt: Date;
	content: string;
	author?: User;
	channel: Channel;
};

export type Channel = DmChannel & {
	name: string;
	privacy: string;
	restrictionDuration: number;
	owner: User;
	admins: User[];
	punishments: ChannelPunishment[];
}
