import { useContext, useEffect, useState } from "react";
import { BsFillChatDotsFill } from "react-icons/bs";
import { Bounce } from "react-awesome-reveal";
import { BaseUserData, Channel, DmChannel } from 'transcendance-types';
import { useSession } from "../../hooks/use-session";
import alertContext, { AlertContextType } from "../alert/alertContext";
import authContext, { AuthContextValue } from "../auth/authContext";
import relationshipContext, { RelationshipContextType } from "../relationship/relationshipContext";
import { io } from "socket.io-client";
/* Chat */
import Chat from "../../components/Chat";
import ChatGroupsView from "../../components/chat/Groups";
import ChatGroupView, { GroupHeader } from "../../components/chat/Group";
import ChatDirectMessagesView from "../../components/chat/DirectMessages";
import ChatDirectMessageView, { DirectMessageHeader } from "../../components/chat/DirectMessage";
import chatContext, {
	ChatGroup,
	ChatGroupPrivacy,
	ChatMessagePreview,
	ChatView,
	DirectMessage
} from "./chatContext";
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
	const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
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

	const checkCurrentView = (view: ChatView) => {
		return (
			viewStack.length > 0
			&& (views[view].Component === viewStack[viewStack.length - 1].Component)
			);
	};

	/* Event listeners */
	const handleChannelCreation = (newChannel: Channel) => {
		openChatView(
			newChannel.privacy === "protected" ? "password_protection" : "group",
			newChannel.name, {
				channelId: newChannel.id,
				channelName: newChannel.name,
				privacy: newChannel.privacy
			}
		);
	};

	const handleDmCreation = (newDm: DmChannel) => {
		console.log('[Chat] handleDmCreation');
		const friend = (newDm.users[0].id === user.id) ? newDm.users[1] : newDm.users[0];

		openChatView('dm', 'direct message', {
			channelId: newDm.id,
			friendUsername: friend.username,
			friendId: friend.id
		});
		openChat();
	};

	const handleChatError = (errMessage: string) => {
		setAlert({
			type: "warning",
			content: errMessage
		});
	};

	/* To be accessed from outside the chat (i.e. pages/users/[id]) */
	const createDirectMessage = (userId: string, friendId: string) => {
		console.log('[Chat] createDirectMessage');
		const data = {
			users: [
				{ id: userId },
				{ id: friendId }
			],
		};

		socket.emit("createDm", data);
	}

	/* NOTE: to be removed */
	const fetchChannelData = async (id: string) => {
		const res = await fetch(`/api/channels/${id}`);
		const data = await res.json();
		return data;
	}

	const getMessageStyle = (authorId: string) => {
		if (authorId === user.id) return "self-end bg-green-600";

		const isBlocked = !!blocked.find(
			blockedUser => blockedUser.id === authorId
		);
		if (isBlocked) {
			return "self-start text-gray-900 bg-gray-600";
		}
		return "self-start text-gray-900 bg-gray-300";
	}

	const getLastMessage = (channel: Channel | DmChannel, isProtected: boolean) => {
		let message: ChatMessagePreview = {
			createdAt: new Date(Date.now()),
			content: "",
		};

		if (channel.messages && channel.messages.length > 0) {
			const lastMessage = channel.messages.reduce(function(prev, current) {
				return (prev.id > current.id) ? prev : current;
			})

			message.createdAt = new Date(lastMessage.createdAt);

			if (!isProtected) {
				if (!!blocked.find(user => user.id == lastMessage.author.id)) {
					message.content = "Blocked message";
				} else {
					message.content = lastMessage.content;
				}
			}
		}
		return message;
	}

	/* Load data */
	const loadUserChannels = async (channels: Channel[]) => {
		const groups: ChatGroup[] = [];

		for (var channel of Array.from(channels)) {
			const lastMessage: ChatMessagePreview = getLastMessage(channel, channel.privacy === "protected");

			groups.push({
				id: channel.id,
				label: channel.name,
				lastMessage: lastMessage.content,
				in: !!channel.users.find((chanUser: BaseUserData) => {
					return chanUser.id === user.id;
				}),
				peopleCount: channel.users.length,
				privacy: channel.privacy as ChatGroupPrivacy,
				updatedAt: lastMessage.createdAt
			});
		}
		/* Sorts from most recent */
		groups.sort(
			(a: ChatGroup, b: ChatGroup) =>
			(b.updatedAt.valueOf() - a.updatedAt.valueOf())
		);
		setChatGroups(groups);
	}

	const loadUserDms = async (channels: DmChannel[]) => {
		const dms: DirectMessage[] = [];

		for (var channel of Array.from(channels)) {
			const friend = (channel.users[0].id === user.id) ? channel.users[1] : channel.users[0];
			const isBlocked = !!blocked.find(user => user.id === friend.id);

			/* Don't display DMs from blocked users */
			if (!isBlocked) {
				const lastMessage: ChatMessagePreview = getLastMessage(channel, false);

				dms.push({
					id: channel.id,
					friendId: friend.id,
					friendUsername: friend.username,
					friendPic: `/api/users/${friend.id}/photo`,
					lastMessage: lastMessage.content,
					updatedAt: lastMessage.createdAt
				});
			}
		}
		/* Sorts from most recent */
		dms.sort(
			(a: DirectMessage, b: DirectMessage) =>
			(b.updatedAt.valueOf() - a.updatedAt.valueOf())
		);
		setDirectMessages(dms);
	}

	/* Update channels if view stack changes */
	useEffect(() => {
		if (!user || !socket) return ;

		if (checkCurrentView("groups")) {
			socket.emit("getUserChannels", { userId: user.id });
		} else if (checkCurrentView("dms")) {
			socket.emit("getUserDms", { userId: user.id });
		}
	}, [viewStack]);

	useEffect(() => {
		if (!socket || (session.state !== "authenticated")) return;

		/* Update the socket Id */
		socket.emit("updateChatUser", {
			id: user.id,
			username: user.username,
		});

		/* Listeners */
		socket.on("updateUserChannels", loadUserChannels);
		socket.on("updateUserDms", loadUserDms);
		socket.on("dmCreated", handleDmCreation);
		socket.on("createDmError", handleChatError);

		return () => {
			socket.off("updateUserChannels", loadUserChannels);
			socket.off("updateUserDms", loadUserDms);
			socket.off("dmCreated", handleDmCreation);
			socket.off("createDmError", handleChatError);
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
				chatGroups,
				directMessages,
				socket,
				openChat,
				closeChat,
				openChatView,
				setChatView,
				closeRightmostView,
				handleChannelCreation,
				handleDmCreation,
				handleChatError,
				createDirectMessage,
				getMessageStyle,
				fetchChannelData,
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
					className="fixed z-50 flex items-center justify-center p-4 text-5xl bg-orange-500 rounded-full transition hover:scale-105 text-neutral-200"
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
