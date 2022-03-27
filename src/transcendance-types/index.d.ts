/* USERS */

type BaseUserData = {
	id: string;
	username: string;
};

/**
 * GET /api/users
 */
export type Users = BaseUserData[];

/**
 * GET /api/users/:id
 */
export type User = BaseUserData & {
	email: string,
	phone: string,
	tfa: boolean,
	pic: string
	duoquadra_login: string,
	wins: number,
	losses: number,
	draws: number,
	ratio: number,
	accountDeactivated: boolean,
	tfaSecret: string,
	games: [],
	achievements: Achievement[],
	friends: User[],
	blockedUsers: User[],
	pendingFriendsSent: User[],
	pendingFriendsReceived: User[],
};

/**
 * GET /api/auth/login
 */
export type LoggedUser = BaseUserData & {
	email: string;
	phone?: string;
};

/**
 * GET /users/id/friends
 */
export type UserFriends = BaseUserData[];

/* ACHIEVEMENTS */

export type Achievement = {

	id: string,
	type: string,
	description: string,
	levelToReach: number,
	users: User[]
}
