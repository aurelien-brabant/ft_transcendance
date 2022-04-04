import { createContext } from 'react';
import { ChatViewItem } from './ChatProvider';

export type ChatView = 'groups' | 'group' | 'dms' | 'dm' | 'dm_new' | 'groupadd' | 'password_protection' | 'group_users' | 'group_settings' | 'group_new'; // plural form denotes the list, singular the chat itself

export type ChatMessage = {
	id: string;
	author: string;
	content: string;
	isMe: boolean;
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
	username: string;
	avatar: string;
	lastMessage: string;
	updatedAt: string;
};

export type ChatContextType = {
	/* chat manipulation */
	openChat: () => void;
	closeChat: () => void;
	openChatView: (view: ChatView, label: string, params: Object) => void;
	setChatView: (view: ChatView, label: string, params: Object) => void;
	//setChatView: (view: ChatView) => void;
	//closeCurrentChatView: () => void;
	closeRightmostView: (n?: number) => void;

	/* chat state */
	isChatOpened: boolean;
	setIsChatOpened: (data: any) => any;

	chatGroups: ChatGroup[];
	directMessages: DirectMessage[];

	/* Utils */
	updateChatGroups: (group: ChatGroup) => void;
	updateDirectMessages: (dm: DirectMessage) => void;
	getLastMessage: (channel: any) => string;
	setChatGroupData: (channel: any, userId: string) => ChatGroup;
	setDirectMessageData: (channel: any, friend: any) => DirectMessage;

	/* data fetching */
	fetchChannelData: (id: string) => Promise<any>;
	//loadChatGroups: () => void;
	//loadChatGroup: () => void;

	loadChannelsOnMount: (channels: any, userId: string) => any;

	lastX: number;
	setLastX: (data: any) => any;
	lastY: number;
	setLastY: (data: any) => any;
};

const chatContext = createContext<ChatContextType | null>(null);

export default chatContext;
