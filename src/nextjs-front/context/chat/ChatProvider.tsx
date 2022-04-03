import { useContext, useEffect, useState } from "react";
import { BsFillChatDotsFill } from "react-icons/bs";
import { BaseUserData } from 'transcendance-types';
import authContext, { AuthContextType } from "../auth/authContext";
import Chat from "../../components/Chat";
import ChatGroupsView from "../../components/chat/Groups";
import ChatGroupView, { GroupHeader } from "../../components/chat/Group";
import ChatDirectMessagesView from "../../components/chat/DirectMessages";
import ChatDirectMessageView, { DirectMessageHeader } from "../../components/chat/DirectMessage";
import chatContext, { ChatGroup, ChatView, DirectMessage } from "./chatContext";
import Groupadd, { GroupaddHeader } from "../../components/chat/Groupadd";
import GroupNew, { GroupNewHeader } from "../../components/chat/GroupNew";
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
		Component: GroupNew,
		CustomHeaderComponent: GroupNewHeader
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
	const [isChatOpened, setIsChatOpened] = useState(false);
	const [viewStack, setViewStack] = useState<ChatViewItem[]>([]);
	const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
	const userId = getUserData().id;
	
	/* Chat manipulation */
	const openChat = () => {
		setIsChatOpened(true);
	};

	const closeChat = () => {
		setIsChatOpened(false);
	};

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

	/* Utils */
	const updateChatGroups = (group: ChatGroup) => {
		setChatGroups([
			...chatGroups, group
		]);
	}

	const updateDirectMessages = (dm: DirectMessage) => {
		setDirectMessages([
			...directMessages, dm
		]);
	}

	const getLastMessage = (channel: any) => {
		if (channel.messages) {
			const i = channel.messages.length - 1;
			if (i > 0 && channel.privacy !== "protected") {
				return channel.messages[i].content;
			}
		}
		return "";
	}

	const findUserById = (user: BaseUserData) => {
		return user.id === userId;
	}

	const setChatGroupData = (channel: any) => {
		const group: ChatGroup = {
			id: channel.id,
			label: channel.name,
			lastMessage: getLastMessage(channel),
			in: !!channel.users.find(findUserById),
			isAdmin: (channel.owner.id === userId),
			peopleCount: channel.users.length,
			privacy: channel.privacy,
			updatedAt: Date.now().toString()
		}
		return group;
	}

	const setDirectMessageData = (channel: any, friend: any) => {
		const dm: DirectMessage = {
			id: channel.id,
			username: friend.username,
			avatar: !friend.pic ? "" : friend.pic.startsWith("https://") ? friend.pic : `/api/users/${friend.id}/photo`,
			lastMessage: getLastMessage(channel),
			updatedAt: Date.now().toString()
		}
		return dm;
	}

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
			const usersInChan = channel.users.length;

			if (usersInChan === 2) {
				const friend = (channel.users[0].id === userId) ? channel.users[1] : channel.users[0];
				dms.push(setDirectMessageData(channel, friend));
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
				updateChatGroups,
				updateDirectMessages,
				getLastMessage,
				setChatGroupData,
				setDirectMessageData,
				fetchChannelData,
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
