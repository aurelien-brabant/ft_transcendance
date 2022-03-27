import { createContext } from 'react';
import { BaseUserData } from 'transcendance-types';

export type ChatView = 'groups' | 'group' | 'dms' | 'dm' | 'dm_new' | 'groupadd' | 'password_protection' | 'group_users' | 'group_settings' | 'group_new'; // plural form denotes the list, singular the chat itself

export type ChatMessage = {
	id: string;
	author: string;
	content: string;
	isMe: boolean;
	isBlocked: boolean;
};

export type ChatGroupPrivacy = 'public' | 'protected' | 'private';

export type ChatGroup = {
	id: string;
	label: string;
	lastMessage: string;
	in: boolean;
	isAdmin: boolean;
	peopleCount: number;
	privacy: ChatGroupPrivacy;
	updatedAt: string;
};

export type DirectMessage = {
	id: string;
	friendId: string;
	friendUsername: string;
	friendPic: string;
	lastMessage: string;
	updatedAt: string;
};

export type ChatContextType = {
	/* Chat manipulation */
	openChat: () => void;
	closeChat: () => void;
	/* Chat views manipulation */
	openChatView: (view: ChatView, label: string, params: Object) => void;
	setChatView: (view: ChatView, label: string, params: Object) => void;
	//setChatView: (view: ChatView) => void;
	//closeCurrentChatView: () => void;
	closeRightmostView: (n?: number) => void;

	/* Chat state */
	isChatOpened: boolean;

	chatGroups: ChatGroup[];
	directMessages: DirectMessage[];

	/* Message utils */
	getLastMessage: (channel: any) => string;
	/* Chat groups utils */
	updateChatGroups: () => void;
	setChatGroupData: (channel: any) => ChatGroup;
	/* Direct messages utils */
	updateDirectMessages: () => void;
	setDirectMessageData: (channel: any, friend: BaseUserData) => DirectMessage;
	createDirectMessage: (userId: string, friendId: string) => Promise<void>;
	openDirectMessage: (userId: string, friend: any) => Promise<void>;

	/* Data fetching */
	fetchChannelData: (id: string) => Promise<any>;
	//loadChatGroups: () => void;
	//loadChatGroup: () => void;
};

const chatContext = createContext<ChatContextType | null>(null);

export default chatContext;
