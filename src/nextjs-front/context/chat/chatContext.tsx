import { createContext } from 'react';
import { BaseUserData } from 'transcendance-types';

export type ChatView = 'dms' | 'dm' | 'dm_new' | 'groups' | 'group' | 'group_new' | 'group_add' | 'group_users' | 'group_settings' |'password_protection'; // plural form denotes the list, singular the chat itself

export type ChatMessage = {
	id: string;
	author: string;
	content: string;
	isMe: boolean;
	isBlocked: boolean;
};

export type ChatMessagePreview = {
	content: string;
	createdAt: Date;
};

export type ChatGroupPrivacy = 'public' | 'protected' | 'private';

export type ChatGroup = {
	id: string;
	label: string;
	lastMessage: string;
	in: boolean;
	ownerId: string;
	peopleCount: number;
	privacy: ChatGroupPrivacy;
	updatedAt: Date;
};

export type DirectMessage = {
	id: string;
	friendId: string;
	friendUsername: string;
	friendPic: string;
	lastMessage: string;
	updatedAt: Date;
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
	getLastMessage: (channel: any) => ChatMessagePreview;
	/* Chat groups utils */
	updateChatGroups: () => void;
	removeChatGroup: (groupId: string) => void;
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
