import { useContext, useEffect, useState } from "react";
import { BsFillChatDotsFill } from "react-icons/bs";
import Chat from "../../components/Chat";
import ChatGroupsView from "../../components/chat/Groups";
import ChatGroupView, { GroupHeader } from "../../components/chat/Group";
import ChatDirectMessagesView from "../../components/chat/DirectMessages";
import ChatDirectMessageView, { DirectMessageHeader } from "../../components/chat/DirectMessage";
import chatContext, { ChatGroup, ChatGroupPrivacy, ChatView, DirectMessage } from "./chatContext";
import Groupadd, { GroupaddHeader } from "../../components/chat/Groupadd";
import PasswordProtection, { PasswordProtectionHeader } from "../../components/chat/PasswordProtection";
import GroupUsers, { GroupUsersHeader } from "../../components/chat/GroupUsers";
import GroupSettings, { GroupSettingsHeader } from "../../components/chat/GroupSettings";
import GroupNew, { GroupNewHeader } from "../../components/chat/GroupNew";
import authContext, { AuthContextType } from "../auth/authContext";
import { faker } from '@faker-js/faker';

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
	const [isChatOpened, setIsChatOpened] = useState(false);
	const [viewStack, setViewStack] = useState<ChatViewItem[]>([]);
	const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
	const { getUserData } = useContext(authContext) as AuthContextType;
	const userId = getUserData().id;

	const updateGroupMessages = async (channels: any) => {
		const groups: ChatGroup[] = [];

		for (var i in channels) {
			groups.push({
				label: channels[i].name,
				id: channels[i].id,
				lastMessage: faker.lorem.sentence(),
				isAdmin: (channels[i].owner === userId),
				privacy: channels[i].privacy as ChatGroupPrivacy,
				in: true,
				peopleCount: 1
			});
		}
		setChatGroups(groups);
	}

	useEffect(() => {
		const fetchData = async () => {

			const dms: DirectMessage[] = [];

			const req = await fetch(`/api/users/${userId}/joinedChannels`);
			const data = await req.json();

			updateGroupMessages(JSON.parse(JSON.stringify(data)));
		}

		fetchData()
		.catch(console.error);

		// const groups: ChatGroup[] = [];
		// const dms: DirectMessage[] = [];

		// for (let i = 0; i != 20; ++i) {
		// 	groups.push({
		// 		label: faker.lorem.words(),
		// 		id: faker.datatype.uuid(),
		// 		lastMessage: faker.lorem.sentence(),
		// 		isAdmin: Math.random() > 0.5,
		// 		privacy: ['private', 'public', 'protected'][Math.floor(Math.random() * 3)] as ChatGroupPrivacy,
		// 		in: Math.random() > 0.2,
		// 		peopleCount: Math.floor(Math.random() * 100)
		// 	});

		// 	dms.push({
		// 		lastMessage: faker.lorem.sentence(),
		// 		avatar: faker.internet.avatar(),
		// 		username: faker.internet.userName()
		// 	});
		// }

		// setChatGroups(groups);
		// setDirectMessages(dms);
	}, [])

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
				directMessages
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
