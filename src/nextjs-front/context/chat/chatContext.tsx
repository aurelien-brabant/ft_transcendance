import { createContext } from 'react';
import { Channel, DmChannel } from 'transcendance-types';
import { Socket } from 'socket.io-client';

export type ChatView = 'dms' | 'dm' | 'dm_new' | 'groups' | 'group' | 'group_new' | 'group_add' | 'group_users' | 'group_settings' |'password_protection'; // plural form denotes the list, singular the chat itself

export type ChatMessagePreview = {
	createdAt: Date;
	content: string;
};

export type ChatMessage = ChatMessagePreview & {
	id: string;
	author: string;
	displayAuthor: boolean;
	displayStyle: string;
};

export type ChatGroupPrivacy = 'public' | 'protected' | 'private';

export type ChatGroup = {
	id: string;
	label: string;
	lastMessage: string;
	in: boolean;
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
	isChatOpened: boolean;
	chatGroups: ChatGroup[];
	directMessages: DirectMessage[];
	socket: Socket;

	/* Chat manipulation */
	openChat: () => void;
	closeChat: () => void;
	openChatView: (view: ChatView, label: string, params: Object) => void;
	setChatView: (view: ChatView, label: string, params: Object) => void;
	closeRightmostView: (n?: number) => void;
	/* Messages manipulation */
	createDirectMessage: (userId: string, friendId: string) => void;
	getMessageStyle: (authorId: string) => string;
	channelCreatedListener: (newChannel: Channel) => void;
	dmCreatedListener: (newDm: DmChannel) => void;
	chatErrorListener: (errMessage: string) => void;

	/* Data fetching */
	fetchChannelData: (id: string) => Promise<any>; // to be removed

	/* Draggable */
	lastX: number;
	lastY: number;
	setLastX: (data: any) => any;
	setLastY: (data: any) => any;
};

const chatContext = createContext<ChatContextType | null>(null);

export default chatContext;
