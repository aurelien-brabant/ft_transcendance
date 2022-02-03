import { createContext } from 'react';

export type ChatView = 'groups' | 'group' | 'dms' | 'dm'; // plural form denotes the list, singular the chat itself

export type ChatMessage = {
	author: string;
	content: string;
	id: string;
	isMe: boolean;
};

export type ChatGroup = {
	label: string;
	lastMessage: string;
	id: string;
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

	/* data fetching */
	//loadChatGroups: () => void;
	//loadChatGroup: () => void;
};

const chatContext = createContext<ChatContextType | null>(null);

export default chatContext;
