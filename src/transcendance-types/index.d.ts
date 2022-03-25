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
	winCount: number;
	loseCount: number;
	rank: number;
	//elo: number;
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
