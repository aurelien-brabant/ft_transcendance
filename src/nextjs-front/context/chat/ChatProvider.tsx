import { useContext, useEffect, useState } from "react";
import { BsFillChatDotsFill } from "react-icons/bs";
import { Bounce } from "react-awesome-reveal";
import { io } from "socket.io-client";
import { Channel, DmChannel } from 'transcendance-types';
import { useSession } from "../../hooks/use-session";
import alertContext, { AlertContextType } from "../alert/alertContext";
import authContext, { AuthContextValue } from "../auth/authContext";
import relationshipContext, { RelationshipContextType } from "../relationship/relationshipContext";
/* Chat */
import chatContext, { ChatView } from "./chatContext";
import Chat from "../../components/Chat";
import ChatDirectMessagesView from "../../components/chat/DirectMessages";
import ChatDirectMessageView, { DirectMessageHeader } from "../../components/chat/DirectMessage";
import ChatGroupsView from "../../components/chat/Groups";
import ChatGroupView, { GroupHeader } from "../../components/chat/Group";
import DirectMessageNew, { DirectMessageNewHeader } from "../../components/chat/DirectMessageNew";
import GroupAdd, { GroupAddHeader } from "../../components/chat/GroupAdd";
import GroupNew, { GroupNewHeader } from "../../components/chat/GroupNew";
import GroupSettings, { GroupSettingsHeader } from "../../components/chat/GroupSettings";
import GroupUsers, { GroupUsersHeader } from "../../components/chat/GroupUsers";
import PasswordProtection, { PasswordProtectionHeader } from "../../components/chat/PasswordProtection";

export type ChatUser = {
	id: string;
	username: string;
	socketId: string;
};

export type ChatViewItem = {
	label: string;
	isAction: boolean;
	params: Object;
	Component: React.FC<{ viewParams: any }>;
	CustomHeaderComponent?: React.FC<{ viewParams: any }>;
};

const views: { [key: string]: ChatViewItem } = {
	groups: {
		label: "groups",
		params: {},
		isAction: false,
		Component: ChatGroupsView,
	},
	group: {
		label: "group",
		params: {},
		isAction: false,
		Component: ChatGroupView,
		CustomHeaderComponent: GroupHeader
	},
	dms: {
		label: "Direct messages",
		params: {},
		isAction: false,
		Component: ChatDirectMessagesView
	},
	dm: {
		label: 'Direct message',
		params: {},
		isAction: false,
		Component: ChatDirectMessageView,
		CustomHeaderComponent: DirectMessageHeader
	},
	dm_new: {
		label: 'Chat with a friend',
		params: {},
		isAction: false,
		Component: DirectMessageNew,
		CustomHeaderComponent: DirectMessageNewHeader
	},
	group_add: {
		label: 'Add user to group',
		params: {},
		isAction: false,
		Component: GroupAdd,
		CustomHeaderComponent: GroupAddHeader
	},
	'password_protection': {
		label: 'Password protected',
		params: {},
		isAction: false,
		Component: PasswordProtection,
		CustomHeaderComponent: PasswordProtectionHeader
	},
	group_users: {
		label: 'Group users',
		params: {},
		isAction: false,
		Component: GroupUsers,
		CustomHeaderComponent: GroupUsersHeader
	},
	group_settings: {
		label: 'Group settings',
		params: {},
		isAction: false,
		Component: GroupSettings,
		CustomHeaderComponent: GroupSettingsHeader
	},
	group_new: {
		label: 'Create a new group',
		params: {},
		isAction: false,
		Component: GroupNew,
		CustomHeaderComponent: GroupNewHeader
	}
};

const ChatProvider: React.FC = ({ children }) => {
	const session = useSession();
	const { user } = useSession();
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { isChatOpened, setIsChatOpened } = useContext(authContext) as AuthContextValue;
	const { blocked } = useContext(relationshipContext) as RelationshipContextType;
	const [socket, setSocket] = useState<any>(null);
	const [viewStack, setViewStack] = useState<ChatViewItem[]>([]);
	const [lastX, setLastX] = useState<number>(0);
	const [lastY, setLastY] = useState<number>(0);

	/* Chat manipulation */
	const openChat = () => {
		setIsChatOpened(true);
	};

	const closeChat = () => {
		setIsChatOpened(false);
	};

	/* Chat views manipulation */
	const openChatView = (
		view: ChatView,
		label: string,
		params: Object = {}
	) => {
		if (typeof views[view] !== "object") {
			console.error(
				`Unable to open chat view ${view} as it is not in the views object`
			);
		} else {
			setViewStack([...viewStack, { ...views[view], label, params }]);
		}
	};

	const setChatView = (
		view: ChatView,
		label: string,
		params: Object = {}
	) => {
		if (typeof views[view] !== "object") {
			console.error(
				`Unable to open chat view ${view} as it is not in the views object`
			);
		} else {
			setViewStack([{ ...views[view], label, params }]);
		}
	};

	const closeRightmostView = (n = 1) => {
		if (viewStack.length === 0) return;

		setViewStack(viewStack.slice(0, -n));
	};

	/* To be accessed from outside the chat (i.e. pages/users/[id]) */
	const createDirectMessage = (userId: string, friendId: string) => {
		const data = {
			users: [
				{ id: userId },
				{ id: friendId }
			],
		};

		socket.emit("createDm", data);
	}

	/* NOTE: To be updated */
	const getMessageStyle = (authorId: string) => {
		if (authorId === user.id) return "self-end bg-blue-500";

		const isBlocked = !!blocked.find(
			blockedUser => blockedUser.id === authorId
		);
		if (isBlocked) {
			return "self-start text-gray-900 bg-gray-600";
		}
		return "self-start text-gray-900 bg-gray-300";
	}

	/* Event listeners */
	const channelCreatedListener = (newChannel: Channel) => {
		openChatView(
			newChannel.privacy === "protected" ? "password_protection" : "group",
			newChannel.name, {
				channelId: newChannel.id,
				channelName: newChannel.name,
				privacy: newChannel.privacy
			}
		);
	};

	const dmCreatedListener = (newDm: DmChannel) => {
		console.log('[Chat] dmCreatedListener');
		const friend = (newDm.users[0].id === user.id) ? newDm.users[1] : newDm.users[0];

		openChatView('dm', 'direct message', {
			channelId: newDm.id,
			friendUsername: friend.username,
			friendId: friend.id
		});
		openChat();
	};

	const chatPunishmentListener = (message: string) => {
		console.log('[Chat Provider] User punished');
		setAlert({
			type: "warning",
			content: message
		});
	}

	const chatErrorListener = (errMessage: string) => {
		setAlert({
			type: "warning",
			content: errMessage
		});
	};

	const chatExceptionListener = (e: { statusCode: number, message: string, error: string }) => {
		setAlert({
			type: "warning",
			content: e.message
		});
	};

	useEffect(() => {
		if (!socket || (session.state !== "authenticated")) return;

		/* Update the socket Id */
		socket.emit("updateChatUser", {
			id: user.id,
			username: user.username,
		});

		/* Listeners */
		socket.on("exception", chatExceptionListener);
		socket.on("chatError", chatErrorListener);
		socket.on("chatPunishment", chatPunishmentListener);
		socket.on("dmCreated", dmCreatedListener);

		return () => {
			socket.off("exception", chatExceptionListener);
			socket.off("chatError", chatErrorListener);
			socket.off("dmCreated", dmCreatedListener);
			socket.off("chatPunishment", chatPunishmentListener);
		};
	}, [socket]);

	/* Create socket when user is logged in */
	useEffect(() => {
		const socketIo = io("localhost:8080/chat");

		setSocket(socketIo);

		if (!socket || (session.state !== "authenticated")) return;

		socket.on("connect", () => {
			console.log("[Chat] Client connected");

			socket.on("connect_error", (err: Error) => {
				console.log(`connect_error due to ${err.message}`);
				socket.close();
			});
		});

		return () => {
			socketIo.disconnect();
		};
	}, [user, setSocket]);

	return (
		<chatContext.Provider
			value={{
				isChatOpened,
				socket,
				openChat,
				closeChat,
				openChatView,
				setChatView,
				closeRightmostView,
				createDirectMessage,
				getMessageStyle,
				channelCreatedListener,
				dmCreatedListener,
				chatErrorListener,
				lastX,
				lastY,
				setLastX,
				setLastY,
			}}
		>
			{session.state === 'authenticated' ?
				isChatOpened ?
				<Chat
					viewStack={viewStack}
					onClose={() => {
						setIsChatOpened(false);
					}}
				/>
				:
				<button
					className="fixed z-50 flex items-center justify-center p-4 text-5xl text-pink-200 bg-pink-600 rounded-full transition hover:scale-105 text-neutral-200"
					style={{ right: "10px", bottom: "10px" }}
					onClick={() => {
						if (viewStack.length === 0) {
							setChatView("groups", "Group chats", {});
						}
						setIsChatOpened(true);
					}}
				>
					<div>
						{/*TO BE REMOVED AFTER TESTING INSTANT CHAT...*/}
						<Bounce duration={2000} triggerOnce>
							<BsFillChatDotsFill />
						</Bounce>
					</div>
				</button> : <></>
			}
			{children}
		</chatContext.Provider>
	);
};

export default ChatProvider;
