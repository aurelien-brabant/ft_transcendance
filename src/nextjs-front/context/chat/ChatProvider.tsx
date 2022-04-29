import { useContext, useEffect, useState } from "react";
import { BsFillChatDotsFill } from "react-icons/bs";
import { Bounce } from "react-awesome-reveal";
import { BaseUserData } from 'transcendance-types';
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
import chatContext, { ChatGroup, ChatMessagePreview, ChatView, DirectMessage } from "./chatContext";
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
	const [viewStack, setViewStack] = useState<ChatViewItem[]>([]);
	const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
	const [lastX, setLastX] = useState<number>(0);
	const [lastY, setLastY] = useState<number>(0);
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const session = useSession();
	const { user } = useSession();
	const { isChatOpened, setIsChatOpened } = useContext(authContext) as AuthContextValue;
	const { blocked } = useContext(relationshipContext) as RelationshipContextType;
	const [chatRoom, setChatRoom] = useState<ChatUser[]>([]);
	const [chatRoomLen, setChatRoomLen] = useState(0);
	const [socket, setSocket] = useState<any>(null);

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

	/* Message utils */
	const getLastMessage = (channel: any) => {
		let message: ChatMessagePreview = {
			content: "",
			createdAt: new Date(Date.now())
		};

		if (channel.messages && channel.messages.length > 0) {
			const lastMessage = channel.messages[0];

			message.createdAt = new Date(lastMessage.createdAt);

			if (channel.privacy !== "protected") {
				if (!!blocked.find(user => user.id == lastMessage.author.id)) {
					message.content = "Blocked message";
				} else {
					message.content = lastMessage.content;
				}
			}
		}
		return message;
	}

	/* Chat groups utils */
	const updateChatGroups = () => {
		chatGroups.sort(
			(a: ChatGroup, b: ChatGroup) =>
			(b.updatedAt.valueOf() - a.updatedAt.valueOf())
		);
		setChatGroups([...chatGroups]);
	}

	const removeChatGroup = (channelId: string) => {
		setChatGroups(chatGroups.filter((group: ChatGroup) => {
			return group.id != channelId
		}));
	}

	const setChatGroupData = (channel: any, userId: string) => {
		const lastMessage: ChatMessagePreview = getLastMessage(channel);

		const group: ChatGroup = {
			id: channel.id,
			label: channel.name,
			lastMessage: lastMessage.content,
			in: !!channel.users.find((user: BaseUserData) => {
				return user.id === userId;
			}),
			ownerId: channel.owner.id,
			peopleCount: channel.users.length,
			privacy: channel.privacy,
			updatedAt: lastMessage.createdAt
		}
		return group;
	}

	/* Direct messages utils */
	const updateDirectMessages = () => {
		directMessages.sort(
			(a: DirectMessage, b: DirectMessage) =>
			(b.updatedAt.valueOf() - a.updatedAt.valueOf())
		);
		setDirectMessages([...directMessages]);
	}

	const setDirectMessageData = (channel: any, friend: BaseUserData) => {
		const lastMessage: ChatMessagePreview = getLastMessage(channel);

		const dm: DirectMessage = {
			id: channel.id,
			friendId: friend.id,
			friendUsername: friend.username,
			friendPic: `/api/users/${friend.id}/photo`,
			lastMessage: lastMessage.content,
			updatedAt: lastMessage.createdAt
		}
		return dm;
	}

	const createDirectMessage = async (userId: string, friendId: string) => {
		if (userId === friendId) return ;

		const friendRes = await fetch(`/api/users/${friendId}`);
		const friendData = await friendRes.json();

		const res = await fetch("/api/channels", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: `${userId}_${friendId}`,
				owner: { id: userId },
				privacy: "dm",
				users: [ { id: userId }, { id: friendId } ],
			}),
		});

		if (res.status === 201) {
			const data = await res.json();
			const channelData = JSON.parse(JSON.stringify(data));

			setDirectMessageData(channelData, friendData);
			updateDirectMessages();
			return (channelData.id);
		} else {
			setAlert({
				type: "error",
				content: "Failed to send DM"
			});
		}
	}

	/* Find existing DM or create a new one */
	const openDirectMessage = async (userId: string, friend: any) => {
		if (userId === friend.id.toString()) return ;

		const res = await fetch(`/api/users/${userId}/directmessages?friendId=${friend.id}`);
		const data = await res.json();
		let id: string;

		if (res.status !== 200) {
			id = await createDirectMessage(userId.toString(), friend.id.toString());
		} else {
			id = JSON.parse(JSON.stringify(data)).id;
		}
		openChatView('dm', 'direct message', {
			channelId: id,
			friendUsername: friend.username,
			friendId: friend.id
		});
	}

	/* Channels */

	/* Fetch the data of a specific channel */
	const fetchChannelData = async (id: string) => {
		const res = await fetch(`/api/channels/${id}`);
		const data = await res.json();
		return data;
	}

	/* Load all channels joined by user or visible */
	const loadUserChannels = (channels: any) => {
		console.log("[Chat] Update user channels");

		const groups: ChatGroup[] = [];
		const dms: DirectMessage[] = [];

		for (var i in channels) {
			const channel = channels[i];

			if (channel.privacy === "dm") {
				const friend = (channel.users[0].id === user.id) ? channel.users[1] : channel.users[0];
				/* Don't display DMs from blocked users */
				const isBlocked = !!blocked.find(user => user.id === friend.id);
				if (!isBlocked) {
					dms.push(setDirectMessageData(channel, friend));
				}
			} else {
				groups.push(setChatGroupData(channel, user.id));
			}
		}
		/* Sorts from most recent */
		groups.sort(
			(a: ChatGroup, b: ChatGroup) =>
			(b.updatedAt.valueOf() - a.updatedAt.valueOf())
		);
		dms.sort(
			(a: DirectMessage, b: DirectMessage) =>
			(b.updatedAt.valueOf() - a.updatedAt.valueOf())
		);
		setChatGroups(groups);
		setDirectMessages(dms);
	}

	/* Update channels if view stack changes */
	useEffect((): any => {
		if (!user) return ;

		if (checkCurrentView("groups") || checkCurrentView("dms")) {
			socket.emit("getUserChannels", { userId: user.id });
		}

		/* Listeners */
		socket.on("updateUserChannels", loadUserChannels);

		return () => {
			socket.off("updateUserChannels", loadUserChannels);
		};
	}, [viewStack]);

	/* Create socket when user is logged in */
	useEffect((): any => {
		const socketIo = io("localhost:8080/chat");

		setSocket(socketIo);

		if (!socket || session.state !== "authenticated") return;

		socket.on("connect", () => {
			console.log("[Chat] Client connected");

			socket.on("connect_error", (err: Error) => {
				console.log(`connect_error due to ${err.message}`);
				socket.close();
			});

			// socket.on("joinChat", (data: ChatUser[]) => {
			// 	setChatRoom(data);
			// });

			// socket.on("leaveChat", (data: ChatUser[]) => {
			// 	setChatRoom(data);
			// });

			// socket.on('updateChatRoomLen', (len: number) => {
			// 	setChatRoomLen(len);
			// });
		});

		return () => {
			socketIo.disconnect();
		};
	}, [user, setSocket]);

	/* Update the socket Id */
	useEffect((): any => {
		if (!socket || session.state !== "authenticated") return;

		socket.emit("updateChatUser", {
			id: user.id,
			username: user.username,
		});
	}, [socket]);

	return (
		<chatContext.Provider
			value={{
				openChat,
				closeChat,
				isChatOpened,
				openChatView,
				setChatView,
				closeRightmostView,
				chatGroups,
				directMessages,
				getLastMessage,
				updateChatGroups,
				removeChatGroup,
				setChatGroupData,
				updateDirectMessages,
				setDirectMessageData,
				createDirectMessage,
				openDirectMessage,
				fetchChannelData,
				lastX,
				lastY,
				setLastX,
				setLastY,
				socket,
				chatRoom,
				chatRoomLen,
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
						<div>
							{chatRoomLen}
						</div>
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
