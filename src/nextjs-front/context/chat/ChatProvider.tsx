import { useContext, useEffect, useState } from "react";
import { Bounce } from "react-awesome-reveal";
import { io } from "socket.io-client";
import { BaseUserData, Channel, DmChannel } from "transcendance-types";
import { useSession } from "../../hooks/use-session";
import alertContext, { AlertContextType } from "../alert/alertContext";
import authContext, { AuthContextValue } from "../auth/authContext";
import relationshipContext, {
	RelationshipContextType,
} from "../relationship/relationshipContext";
/* Chat */
import chatContext, { ChatView } from "./chatContext";
import Chat from "../../components/Chat";
import ChatDirectMessagesView from "../../components/chat/DirectMessages";
import ChatDirectMessageView, {
	DirectMessageHeader,
} from "../../components/chat/DirectMessage";
import ChatGroupsView from "../../components/chat/Groups";
import ChatGroupView, { GroupHeader } from "../../components/chat/Group";
import DirectMessageNew, {
	DirectMessageNewHeader,
} from "../../components/chat/DirectMessageNew";
import GroupAdd, { GroupAddHeader } from "../../components/chat/GroupAdd";
import GroupNew, { GroupNewHeader } from "../../components/chat/GroupNew";
import GroupSettings, {
	GroupSettingsHeader,
} from "../../components/chat/GroupSettings";
import GroupUsers, { GroupUsersHeader } from "../../components/chat/GroupUsers";
import PasswordProtection, {
	PasswordProtectionHeader,
} from "../../components/chat/PasswordProtection";
import { ChatIcon } from "@heroicons/react/outline";

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
		CustomHeaderComponent: GroupHeader,
	},
	dms: {
		label: "Direct messages",
		params: {},
		isAction: false,
		Component: ChatDirectMessagesView,
	},
	dm: {
		label: "Direct message",
		params: {},
		isAction: false,
		Component: ChatDirectMessageView,
		CustomHeaderComponent: DirectMessageHeader,
	},
	dm_new: {
		label: "Chat with a friend",
		params: {},
		isAction: false,
		Component: DirectMessageNew,
		CustomHeaderComponent: DirectMessageNewHeader,
	},
	group_add: {
		label: "Add user to group",
		params: {},
		isAction: false,
		Component: GroupAdd,
		CustomHeaderComponent: GroupAddHeader,
	},
	password_protection: {
		label: "Password protected",
		params: {},
		isAction: false,
		Component: PasswordProtection,
		CustomHeaderComponent: PasswordProtectionHeader,
	},
	group_users: {
		label: "Group users",
		params: {},
		isAction: false,
		Component: GroupUsers,
		CustomHeaderComponent: GroupUsersHeader,
	},
	group_settings: {
		label: "Group settings",
		params: {},
		isAction: false,
		Component: GroupSettings,
		CustomHeaderComponent: GroupSettingsHeader,
	},
	group_new: {
		label: "Create a new group",
		params: {},
		isAction: false,
		Component: GroupNew,
		CustomHeaderComponent: GroupNewHeader,
	},
};

const ChatProvider: React.FC = ({ children }) => {
	const session = useSession();
	const { user } = useSession();
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { isChatOpened, setIsChatOpened } = useContext(
		authContext
	) as AuthContextValue;
	const { blocked } = useContext(
		relationshipContext
	) as RelationshipContextType;
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
	const openChatView = (view: ChatView, label: string, params: Object = {}) => {
		if (typeof views[view] !== "object") {
			console.error(
				`Unable to open chat view ${view} as it is not in the views object`
			);
		} else {
			setViewStack([...viewStack, { ...views[view], label, params }]);
		}
	};

	const setChatView = (view: ChatView, label: string, params: Object = {}) => {
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
			users: [{ id: userId }, { id: friendId }],
		};

		socket.emit("createDm", data);
	};

	const getMessageStyle = (author: BaseUserData | undefined) => {
		if (!author) {
			return "self-center text-gray-500";
		}
		if (author.id == user.id) {
			return "self-end bg-blue-500";
		}

		const isBlocked = !!blocked.find(
			(blockedUser) => blockedUser.id === author.id
		);
		if (isBlocked) {
			return "self-start text-gray-900 bg-gray-600";
		}
		return "self-start bg-neutral-800";
	};

	/* Event listeners */
	const channelCreatedListener = (newChannel: Channel) => {
		openChatView(
			newChannel.privacy === "protected" ? "password_protection" : "group",
			newChannel.name,
			{
				channelId: newChannel.id,
				channelName: newChannel.name,
				privacy: newChannel.privacy,
			}
		);
	};

	const openCreatedDmListener = (newDm: DmChannel) => {
		const friend =
			newDm.users[0].id === user.id ? newDm.users[1] : newDm.users[0];

		openChatView("dm", "direct message", {
			channelId: newDm.id,
			friendUsername: friend.username,
			friendId: friend.id,
		});
		openChat();
	};

	const chatInfoListener = (message: string) => {
		setAlert({
			type: "info",
			content: message,
		});
	};

	const chatWarningListener = (message: string) => {
		setAlert({
			type: "warning",
			content: message,
		});
	};

	const chatExceptionListener = (e: {
		statusCode: number;
		message: string;
		error: string;
	}) => {
		setAlert({
			type: "warning",
			content: e.message,
		});
	};

	/* Update the socket Id and set listeners */
	useEffect(() => {
		if (!socket || session.state !== "authenticated") return;

		if (socket.connected === false) {
			socket.on("connect", () => {
				socket.emit("updateChatUser", {
					id: user.id,
					username: user.username,
				});
			});

			socket.on("connect_error", (err: Error) => {
				socket.close();
			});
		}

		/* Listeners */
		socket.on("exception", chatExceptionListener);
		socket.on("kickedFromChannel", chatWarningListener);
		socket.on("punishedInChannel", chatWarningListener);
		socket.on("chatError", chatWarningListener);
		socket.on("chatInfo", chatInfoListener);
		socket.on("openCreatedDm", openCreatedDmListener);

		return () => {
			socket.off("exception", chatExceptionListener);
			socket.off("kickedFromChannel", chatWarningListener);
			socket.off("punishedInChannel", chatWarningListener);
			socket.off("chatError", chatWarningListener);
			socket.off("openCreatedDm", openCreatedDmListener);
			socket.off("chatInfo", chatInfoListener);
		};
	}, [socket]);

	/* Set socket when user is logged in */
	useEffect(() => {
		if (session.state !== "authenticated") return;

		const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL + "/chat", {
			transports: ["websocket", "polling"],
		});

		setSocket(socketIo);

		return () => {
			socketIo.disconnect();
		};
	}, [session.state, setSocket]);

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
				openCreatedDmListener,
				chatWarningListener,
				lastX,
				lastY,
				setLastX,
				setLastY,
			}}
		>
			{session.state === "authenticated" ? (
				isChatOpened ? (
					<Chat
						viewStack={viewStack}
						onClose={() => {
							setIsChatOpened(false);
						}}
					/>
				) : (
					<div className="right-6 rounded-md bottom-6 p-3 border-04dp border fixed z-50 bg-01dp">
						<button
							className={`flex items-center justify-center text-pink-200 text-5xl transition hover:scale-105 text-neutral-200`}
							onClick={() => {
								setChatView("groups", "Group chats", {});
								setIsChatOpened(true);
							}}
						>
							<div>
								{/*TO BE REMOVED AFTER TESTING INSTANT CHAT...*/}
								<Bounce duration={2000} triggerOnce>
									<ChatIcon className="w-9 h-9" />
								</Bounce>
							</div>
						</button>{" "}
					</div>
				)
			) : (
				<></>
			)}
			{children}
		</chatContext.Provider>
	);
};

export default ChatProvider;
