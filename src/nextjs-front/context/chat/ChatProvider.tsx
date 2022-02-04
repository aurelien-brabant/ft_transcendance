import { useEffect, useState } from "react";
import { faker } from '@faker-js/faker';
import { BsFillChatDotsFill } from "react-icons/bs";
import Chat from "../../components/Chat";
import ChatGroupsView from "../../components/chat/Groups";
import ChatGroupView, {GroupHeader} from "../../components/chat/Group";
import ChatDirectMessagesView from "../../components/chat/DirectMessages";
import ChatDirectMessageView, {DirectMessageHeader} from "../../components/chat/DirectMessage";
import chatContext, { ChatGroup, ChatGroupPrivacy, ChatView } from "./chatContext";
import Groupadd, {GroupaddHeader} from "../../components/chat/Groupadd";
import PasswordProtection, {PasswordProtectionHeader} from "../../components/chat/PasswordProtection";
import GroupUsers, {GroupUsersHeader} from "../../components/chat/GroupUsers";
import GroupSettings, {GroupSettingsHeader} from "../../components/chat/GroupSettings";

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
	}
};

const ChatProvider: React.FC = ({ children }) => {
	const [isChatOpened, setIsChatOpened] = useState(false);
	const [viewStack, setViewStack] = useState<ChatViewItem[]>([]);
	const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
	
	useEffect(() => {
		const groups: ChatGroup[] = [];

		for (let i = 0; i != 20; ++i) {
			groups.push({
				label: faker.lorem.words(),
				id: faker.datatype.uuid(),
				lastMessage: faker.lorem.sentence(),
				isAdmin: Math.random() > 0.5,
				privacy: ['private', 'public', 'protected'][Math.floor(Math.random() * 3)] as ChatGroupPrivacy,
				in: Math.random() > 0.2,
				peopleCount: Math.floor(Math.random() * 100)
			});
		}

		console.log(groups);

		setChatGroups(groups);
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
				chatGroups
			}}
		>
			{!isChatOpened ? (
				<button
					className="fixed z-50 flex items-center justify-center p-4 text-5xl bg-orange-500 rounded-full transition hover:scale-105 text-neutral-200"
					style={{ right: "10px", bottom: "10px" }}
					onClick={() => {
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
