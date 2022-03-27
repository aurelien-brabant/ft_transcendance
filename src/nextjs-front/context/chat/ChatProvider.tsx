import { useContext, useEffect, useState } from "react";
import { BsFillChatDotsFill } from "react-icons/bs";
import { BaseUserData } from 'transcendance-types';
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import authContext, { AuthContextType } from "../auth/authContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";
/* Chat */
import Chat from "../../components/Chat";
import ChatGroupsView from "../../components/chat/Groups";
import ChatGroupView, { GroupHeader } from "../../components/chat/Group";
import ChatDirectMessagesView from "../../components/chat/DirectMessages";
import ChatDirectMessageView, { DirectMessageHeader } from "../../components/chat/DirectMessage";
import chatContext, { ChatGroup, ChatView, DirectMessage } from "./chatContext";
import Groupadd, { GroupaddHeader } from "../../components/chat/Groupadd";
import GroupNew, { GroupNewHeader } from "../../components/chat/GroupNew";
import DirectMessageNew, { DirectMessageNewHeader } from "../../components/chat/DirectMessageNew";
import GroupUsers, { GroupUsersHeader } from "../../components/chat/GroupUsers";
import GroupSettings, { GroupSettingsHeader } from "../../components/chat/GroupSettings";
import PasswordProtection, { PasswordProtectionHeader } from "../../components/chat/PasswordProtection";

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
	groupadd: {
		label: 'Add to group',
		params: {},
		isAction: false,
		Component: Groupadd,
		CustomHeaderComponent: GroupaddHeader
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
	const { getUserData } = useContext(authContext) as AuthContextType;
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { getData, blocked } = useContext(relationshipContext) as RelationshipContextType;
	const userId = getUserData().id;
	const [isChatOpened, setIsChatOpened] = useState(false);
	const [viewStack, setViewStack] = useState<ChatViewItem[]>([]);
	const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);

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


	/* Message utils */
	const getLastMessage = (channel: any) => {
		if (channel.messages) {
			const i = channel.messages.length - 1;

			if (i >= 0 && channel.privacy !== "protected") {
				const lastMessage = channel.messages[i];

				if (!!blocked.find(user => user.id == lastMessage.author.id)) {
					return "Blocked message";
				} else {
					return lastMessage.content;
				}
			}
		}
		return "";
	}

	/* Chat groups utils */
	const updateChatGroups = () => {
		setChatGroups([...chatGroups]);
	}

	const setChatGroupData = (channel: any) => {
		const group: ChatGroup = {
			id: channel.id,
			label: channel.name,
			lastMessage: getLastMessage(channel),
			in: !!channel.users.find((user: BaseUserData) => {
				return user.id === userId;
			}),
			isAdmin: (channel.owner.id === userId),
			peopleCount: channel.users.length,
			privacy: channel.privacy,
			updatedAt: Date.now().toString()
		}
		return group;
	}

	/* Direct messages utils */
	const updateDirectMessages = () => {
		setDirectMessages([...directMessages]);
	}

	const setDirectMessageData = (channel: any, friend: BaseUserData) => {
		const dm: DirectMessage = {
			id: channel.id,
			friendId: friend.id,
			friendUsername: friend.username,
			friendPic: `/api/users/${friend.id}/photo`,
			lastMessage: getLastMessage(channel),
			updatedAt: Date.now().toString()
		}
		return dm;
	}

	const createDirectMessage = async (userId: string, friendId: string) => {
		const userData = await (await fetch(`/api/users/${userId}`)).json();
		const friendData = await (await fetch(`/api/users/${friendId}`)).json();

		const res = await fetch("/api/channels", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: friendData.username,
				owner: userData,
				privacy: "dm",
				users: [ userData, friendData ]
			}),
		});

		if (res.status === 201) {
			const data = await res.json();
			setDirectMessageData(JSON.parse(JSON.stringify(data)), friendData);
			updateDirectMessages();
		} else {
			setAlert({
				type: "error",
				content: "Failed to send DM"
			});
		}
	}

	/* Find existing DM or create a new one */
		const openDirectMessage = async (userId: string, friend: any) => {
			const res = await fetch(`/api/users/${userId}/directmessages?friendId=${friend.id}`);
			const data = await res.json();
	
			if (res.status !== 200) {
				createDirectMessage(userId.toString(), friend.id.toString());
			}
			openChatView('dm', 'direct message', {
				dmId: JSON.parse(JSON.stringify(data)).id,
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

	/* Load all channels on mount */
	const loadChannelsOnMount = async (channels: any) => {
		const groups: ChatGroup[] = [];
		const dms: DirectMessage[] = [];

		for (var i in channels) {
			const channel = channels[i];

			if (channel.privacy === "dm") {
				const friend = (channel.users[0].id === userId) ? channel.users[1] : channel.users[0];
				/* Don't display DMs from blocked users */
				if (!!blocked.find(user => user.id == friend.id) == false) {
					dms.push(setDirectMessageData(channel, friend));
				}
			} else {
				groups.push(setChatGroupData(channel));
			}
		}
		setChatGroups(groups);
		setDirectMessages(dms);
	}

	useEffect(() => {
		const fetchUserChannels = async () => {
			const res = await fetch(`/api/users/${userId}/channels`);
			const data = await res.json();

			loadChannelsOnMount(JSON.parse(JSON.stringify(data)));
		}
		fetchUserChannels().catch(console.error);
		getData();
	}, [])

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
				setChatGroupData,
				updateDirectMessages,
				setDirectMessageData,
				createDirectMessage,
				openDirectMessage,
				fetchChannelData
			}}
		>
			{!isChatOpened ? (
				<button
					className="fixed z-50 flex items-center justify-center p-4 text-5xl bg-orange-500 rounded-full transition hover:scale-105 text-neutral-200"
					style={{ right: "10px", bottom: "10px" }}
					onClick={() => {
						setChatView("groups", "group chats", {});
						setIsChatOpened(true);
					}}
				>
					<BsFillChatDotsFill />
				</button>
			) : (
				<Chat
					viewStack={viewStack}
					onClose={() => {
						setIsChatOpened(false);
					}}
				/>
			)}
			{children}
		</chatContext.Provider>
	);
};

export default ChatProvider;
