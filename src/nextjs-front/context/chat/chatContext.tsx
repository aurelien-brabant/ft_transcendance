import { createContext } from 'react';

export type ChatView = 'groups' | 'group' | 'dms' | 'dm' | 'groupadd' | 'password_protection' | 'group_users' | 'group_settings' | 'group_new'; // plural form denotes the list, singular the chat itself

export type ChatMessage = {
	author: string;
	content: string;
	id: string;
	isMe: boolean;
};

export type ChatGroupPrivacy = 'public' | 'protected' | 'private';

export type ChatGroup = {
	label: string;
	lastMessage: string;
	id: string;
	privacy: ChatGroupPrivacy;
	isAdmin: boolean;
	in: boolean;
	peopleCount: number;
};

export type DirectMessage = {
	username: string;
	avatar: string;
	lastMessage: string;
};

export type ChatContextType = {
	/* chat manipulation */
	openChat: () => void;
	closeChat: () => void;
	openChatView: (view: ChatView, label: string, params: Object) => void;
	setChatView: (view: ChatView, label: string, params: Object) => void;
	//setChatView: (view: ChatView) => void;
	//closeCurrentChatView: () => void
	closeRightmostView: (n?: number) => void

	/* chat state */
	isChatOpened: boolean;

	chatGroups: ChatGroup[];
	directMessages: DirectMessage[];

	/* data fetching */
	//loadChatGroups: () => void;
	//loadChatGroup: () => void;
};

const chatContext = createContext<ChatContextType | null>(null);

export default chatContext;
