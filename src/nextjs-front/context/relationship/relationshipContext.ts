import { createContext } from 'react';
import { User } from 'transcendance-types';

export type RelationshipContextType = {
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
	suggested: User[]
	setSuggested: (data: any) => any;

	createSuggestedFriends: (users: User[], friends: User[], blocked: User[]) => any;
	getRelationships: (users: User[], id: string) => any;
	getRelationshipsData: () => any;
}

const relationshipContext = createContext<RelationshipContextType | null>(null);

export default relationshipContext;
