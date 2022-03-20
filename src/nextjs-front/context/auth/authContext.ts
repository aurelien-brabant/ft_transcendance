import { createContext } from 'react';

export type User = {
	id: string,
	username: string,
	email: string,
	phone: string,
	tfa: boolean,
	pic: string
	duoquadra_login: string,
	wins: number,
	losses: number,
	draws: number,
	ration: number,
	accountDeactivated: boolean,
	tfaSecret: string,
	games: [],
	friends: User[],
	blockedUsers: User[],
	pendingFriendsSent: User[],
	pendingFriendsReceived: User[],
};

export type AuthContextType = {
	fetchAsLoggedUser: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
	getUserData: () => any;
	authenticateUser: () => Promise<boolean>;
	logout: () => void;
	isPreAuthenticated: boolean;
	isAuthenticated: boolean;
	setIsAuthenticated: (data: any) => any;
	setIsPreAuthenticated: (data: any) => any;
	setUserData: (data: any) => any;
	clearUser: () => void
	mergeUserData: (data: any) => any;
	token: string;
	setToken: (data: any) => any;
	users: User[];
	setUsers: (data: any) => any;
	friends: User[];
	setFriends: (data: any) => any;
	friends42: User[];
	setFriends42: (data: any) => any;
	blocked: User[];
	setBlocked: (data: any) => any;
	pendingFriendsReceived: User[];
	setPendingFriendsReceived: (data: any) => any;
	pendingFriendsSent: User[];
	setPendingFriendsSent: (data: any) => any;
	}

const authContext = createContext<AuthContextType | null>(null);

export default authContext;
