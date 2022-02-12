import Draggable from "react-draggable";
import {
	Fragment,
	Dispatch,
	useRef,
	SetStateAction,
	useEffect,
	useState,
	useContext,
} from "react";

import { AiOutlineClose, AiOutlineUser } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import faker from "@faker-js/faker";
import { ChatViewItem } from "../context/chat/ChatProvider";
import chatContext, { ChatContextType } from "../context/chat/chatContext";
import Tooltip from "./Tooltip";

enum ChatState {
	GROUPS_HOME,
	DM_HOME,
	GROUPS_IN,
	DM_IN,
}

const GroupMetaBody: React.FC<{
	groupsMeta: GroupMeta[];
	chatItem: ChatItem[];
	setChatItem: Dispatch<SetStateAction<ChatItem[]>>;
}> = ({ groupsMeta, chatItem, setChatItem }) => {
	const handleGroupClick = (groupName: string) => {
		setChatItem([
			...chatItem,
			{
				state: ChatState.GROUPS_IN,
				label: groupName,
			},
		]);
	};

	return (
		<div className="h-full overflow-x-auto">
			{groupsMeta.map((gm) => (
				<div
					key={gm.name}
					className="items-center px-10 py-5 border-b-2 border-gray-300 grid grid-cols-3 hover:bg-neutral-300"
					onClick={() => {
						handleGroupClick(gm.name);
					}}
				>
					<div>
						<div
							style={{ backgroundColor: gm.color }}
							className="flex items-center justify-center w-16 h-16 text-4xl rounded-full"
						>
							{gm.name[0].toUpperCase()}
						</div>
					</div>
					<div className="col-span-2">
						<h6 className="text-lg font-bold">{gm.name}</h6>
						<p>{gm.lastMessage}</p>
					</div>
				</div>
			))}
		</div>
	);
};

type Message = {
	isMe: boolean;
	content: string;
	id: string;
};

type ChatItem = {
	state: ChatState;
	label: string;
};

const GroupInBody: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const chatBottom = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const messages: Message[] = [];

		for (let i = 0; i != 50; ++i) {
			messages.push({
				isMe: Math.random() <= 0.5,
				content: faker.lorem.sentence(),
				id: faker.datatype.uuid(),
			});
		}
		setMessages(messages);
	}, []);

	useEffect(() => {
		chatBottom.current?.scrollIntoView();
	}, [messages]);

	return (
		<div className="h-full">
			<div className="flex flex-col items-start max-h-[87%] h-auto px-5 pb-5 overflow-auto">
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`${
							msg.isMe
								? "self-end bg-green-400"
								: "self-start bg-gray-300"
						} max-w-[40%] p-2 my-1 rounded`}
					>
						{msg.content}
					</div>
				))}
				<div ref={chatBottom} />
			</div>
			<div className=" min-h-[13%] flex items-center px-8 py-2 bg-white drop-shadow-md">
				<input
					type="text"
					placeholder="Your message"
					className="p-2 rounded resize-none grow outline-0"
					value={currentMessage}
					onChange={(e) => {
						setCurrentMessage(e.target.value);
					}}
				/>
				<button
					className="px-3 py-2 text-white uppercase bg-blue-500 rounded"
					onClick={() => {
						if (currentMessage.length === 0) return;
						setMessages([
							...messages,
							{
								isMe: true,
								content: currentMessage,
								id: faker.datatype.uuid(),
							},
						]);
						setCurrentMessage("");
					}}
				>
					Send
				</button>
			</div>
		</div>
	);
};

type ChatProps = {
	onClose: () => void;
	viewStack: ChatViewItem[];
};

const Chat: React.FC<ChatProps> = ({ viewStack, onClose }) => {
	const { closeRightmostView, setChatView } = useContext(
		chatContext
	) as ChatContextType;

	const currentView = viewStack[viewStack.length - 1];
	const buttonTooltipClassName = "p-3 font-bold bg-gray-900";
	const buttonClassName = "hover:scale-105 transition";

	if (!currentView) {
		throw Error(
			"No chat view to show. You need to call setChatView or openChatView before calling the openChat function."
		);
	}

	return (
		<div
			className="fixed z-50 top-0 bottom-0 left-0 right-0 md:top-auto md:left-auto md:bottom-10 md:right-10
				drop-shadow-lg flex flex-col overflow-hidden md:w-[25rem] md:h-[35em] text-white rounded border-gray-800 border-2"
		>
			<header className="flex flex-col justify-end py-2 border-b-2 border-gray-800 cursor-move bg-gray-900/90 gap-y-4 drop-shadow-md text-neutral-200">

				{/* Provide a default header, or use the custom one instead if any */}

				{!currentView.CustomHeaderComponent ? (
					<Fragment>
					<nav className="flex justify-between px-5 text-3xl">
						<Tooltip
							content="Dismiss chat"
							className={buttonTooltipClassName}
						>
							<button
								onClick={() => {
									onClose();
								}}
								className={buttonClassName}
							>
								<AiOutlineClose />
							</button>
						</Tooltip>
						<Tooltip
							content="Groups"
							className={buttonTooltipClassName}
						>
							<button
								onClick={() => {
									setChatView("groups", "group chats", {});
								}}
								className={buttonClassName}
							>
								<FaUserFriends />
							</button>
						</Tooltip>
						<Tooltip
							content="DMs"
							className={buttonTooltipClassName}
						>
							<button
								onClick={() => {
									setChatView("dms", "direct messages", {});
								}}
								className={buttonClassName}
							>
								<AiOutlineUser />
							</button>
						</Tooltip>
					</nav>
<div className="flex flex-col items-center justify-center">
					<h6 className="text-lg font-bold text-pink-600 uppercase">
						{viewStack.length > 0 &&
							viewStack[viewStack.length - 1].label}
					</h6>
					<div className="flex">
						{viewStack.length > 1 &&
							viewStack.map((item, index, arr) => (
								<Fragment key={item.label}>
									{index != arr.length - 1 ? (
										<button
											onClick={() => {
												closeRightmostView(
													viewStack.length - index - 1
												);
											}}
											className="hover:opacity-75 transition"
										>
											{item.label}
										</button>
									) : (
										<span>{item.label}</span>
									)}
									{index != arr.length - 1 && (
										<span className="mx-2 font-bold">
											/
										</span>
									)}
								</Fragment>
							))}
					</div>
				</div>
					</Fragment>
				) : (
					<currentView.CustomHeaderComponent viewParams={currentView.params} />
				)}

				
			</header>

			{/* active chat view */}
			<div className="h-full overflow-hidden bg-gray-900/90">
				{viewStack.length > 0 && (
					<currentView.Component
						viewParams={currentView.params}
					/>
				)}
			</div>

		</div>
	);
};

export default Chat;
