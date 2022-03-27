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
	avatar: string;
	losses: number;
	wins: number;
	draws: number;
	ratio: number | string;
	accountDeactivated: boolean;
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
