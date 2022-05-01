import { createContext } from 'react';
import { BaseUserData } from 'transcendance-types';
import { Socket } from 'socket.io-client';

export type ChatView = 'dms' | 'dm' | 'dm_new' | 'groups' | 'group' | 'group_new' | 'group_add' | 'group_users' | 'group_settings' |'password_protection'; // plural form denotes the list, singular the chat itself

export type ChatMessagePreview = {
	content: string;
	createdAt: Date;
};

export type ChatMessage = ChatMessagePreview & {
	id: string;
	author: string;
	isMe: boolean;
	isBlocked: boolean;
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
	closeRightmostView: (n?: number) => void;

	/* Chat state */
	isChatOpened: boolean;

	/* Chat Messages */
	chatGroups: ChatGroup[];
	directMessages: DirectMessage[];

	/* Message utils */
	getLastMessage: (channel: any) => ChatMessagePreview;
	/* Chat groups utils */
	updateChatGroups: () => void;
	removeChatGroup: (channelId: string) => void;
	setChatGroupData: (channel: any, userId: string) => ChatGroup;
	/* Direct messages utils */
	updateDirectMessages: () => void;
	setDirectMessageData: (channel: any, friend: BaseUserData) => DirectMessage;
	createDirectMessage: (userId: string, friendId: string) => Promise<void>;
	openDirectMessage: (userId: string, friend: any) => Promise<void>;

	/* Data fetching */
	fetchChannelData: (id: string) => Promise<any>;

	/* Draggable */
	lastX: number;
	lastY: number;
	setLastX: (data: any) => any;
	setLastY: (data: any) => any;

	/* Websocket */
	socket: Socket;
};

const chatContext = createContext<ChatContextType | null>(null);

export default chatContext;
