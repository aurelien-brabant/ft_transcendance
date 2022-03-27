import { createContext } from 'react';

export type Achievement = {

	id: string,
	type: string,
	description: string,
	levelToReach: number,
	users: User[]
}
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

export type RelationshipContextType = {
	getData: () => any;
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
	getRelationships: (users: User[], id: string) => any;
	createSuggested: (users: User[], friends: User[], blocked: User[]) => any;
	suggested: User[]
	setSuggested: (data: any) => any;
	}

const relationshipContext = createContext<RelationshipContextType | null>(null);

export default relationshipContext;
