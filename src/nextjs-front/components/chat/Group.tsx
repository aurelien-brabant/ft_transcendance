import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { FaUserFriends, FaUserPlus } from "react-icons/fa";
import { FiSend } from 'react-icons/fi';
import { RiSettings5Line } from "react-icons/ri";
import Tooltip from "../../components/Tooltip";
import { useSession } from "../../hooks/use-session";
import chatContext, { ChatContextType, ChatMessage } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";

/* Header */
export const GroupHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { user } = useSession();
	const { closeChat, openChatView, setChatView } = useContext(chatContext) as ChatContextType;
	const ownerView = (viewParams.ownerId === user.id);
	const actionTooltipStyles = "font-bold bg-dark text-neutral-200";

	return (
		<Fragment>
			<div className="flex items-start justify-between pt-3 px-5 text-2xl">
				<div className="flex gap-x-2">
					<button onClick={() => {closeChat() }}>
						<AiOutlineClose />
					</button>
					<button onClick={() => { setChatView('groups', 'Group chats', {})}}>
						<AiOutlineArrowLeft />
					</button>
				</div>
				<div className="flex items-right gap-x-3">
					<Tooltip className={actionTooltipStyles} content="users">
						<button onClick={() => {
							openChatView('group_users', 'group users', {
									channelId: viewParams.channelId,
									channelName: viewParams.channelName,
									peopleCount: viewParams.peopleCount,
									ownerView: ownerView
								}
							)}}
						>
							<FaUserFriends />
						</button>
					</Tooltip>
					<Tooltip className={actionTooltipStyles} content="add user">
						<button onClick={() => {
							openChatView('group_add', 'Add a user to group', {
									channelId: viewParams.channelId
								}
							)}}
						>
							<FaUserPlus className="text-lg" />
						</button>
					</Tooltip>
					<button onClick={() => {
						openChatView('group_settings', 'group settings', {
								channelId: viewParams.channelId,
								channelName: viewParams.channelName,
								privacy: viewParams.privacy,
								peopleCount: viewParams.peopleCount,
								ownerView: ownerView
							}
						)}}
						>
						<RiSettings5Line />
					</button>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center">
				<h6 className="text-lg font-bold text-pink-600">
					{viewParams.channelName}
				</h6>
			</div>
		</Fragment>
	);
}

/* Conversation */
const Group: React.FC<{ viewParams: { [key: string]: any } }> = ({
	viewParams,
}) => {
	const { user } = useSession();
	const { blocked, getData } = useContext(relationshipContext) as RelationshipContextType;
	const { socket } = useContext(chatContext) as ChatContextType;
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const chatBottom = useRef<HTMLDivElement>(null);
	const channelId = viewParams.channelId;

	/* Load all messages in channel */
	const loadMessages = async (channel: any) => {
		if ((channel.id !== channelId) || !channel.messages) return ;

		const messages: ChatMessage[] = [];

		channel.messages.sort((a: any, b: any) => (a.id - b.id));

		for (var message of channel.messages) {
			const isBlocked = !!blocked.find(user => user.id == message.author.id);

			messages.push({
				id: messages.length.toString(),
				author: message.author.username,
				content: message.content,
				isMe: message.author.id === user.id,
				isBlocked: isBlocked ? "Blocked message" : message.content,
				createdAt: message.createdAt
			});
		}
		setMessages(messages);
	};

	/* Send new message */
	const handleGroupMessageSubmit = async () => {
		if (currentMessage.trim().length === 0) return;

		console.log('[Chat] Submit group message');

		socket.emit('gmSubmit', {
			content: currentMessage,
			channelId
		});
		setCurrentMessage("");
	};

	/* Scroll to bottom if new message is sent */
	useEffect(() => {
		chatBottom.current?.scrollIntoView();
	}, [messages]);

	/* Receive new message */
	const handleNewMessage = ({ message }: any) => {
		console.log(`[Chat] Receive new message in [${message.channel.name}]`);

		setMessages((prevMessages) => {
			const newMessages: ChatMessage[] = [...prevMessages];

			const isBlocked = !!blocked.find(user => user.id == message.author.id);

			newMessages.push({
				id: prevMessages.length.toString(),
				author: message.author.username,
				content: message.content,
				isMe: message.author.id === user.id,
				isBlocked: isBlocked ? "Blocked message" : message.content,
				createdAt: message.createdAt
			});
			return newMessages;
		});
	};

	useEffect(() => {
		getData();
		socket.emit("getChannelData", { channelId: channelId });

		/* Listeners */
		socket.on("updateChannel", loadMessages);
		socket.on("newGm", handleNewMessage);

		return () => {
			socket.off("updateChannel", loadMessages);
			socket.off("newGm", handleNewMessage);
		};
	}, []);

	return (
		<div className="h-full">
			<div className="flex flex-col items-start max-h-[87%] h-auto px-5 pb-5 overflow-auto">
				{messages.map((message: ChatMessage) => (
					<div
						key={message.id}
						className={`${
							message.isBlocked
								? "self-start text-gray-900 bg-gray-600"
								: message.isMe
									? "self-end bg-green-600"
									: "self-start text-gray-900 bg-gray-300"
						} max-w-[80%] p-2 my-2 rounded whitespace-wrap break-all`}
					>
						{!message.isMe && !message.isBlocked && (
							<span className="text-xs text-gray-900 uppercase">
								{message.author}
							</span>
						)}
						<p>{message.content}</p>
					</div>
				))}
				<div ref={chatBottom} />
			</div>
			<div className="absolute inset-x-0 bottom-0 border-t-2 border-gray-800 min-h-[13%] flex gap-x-2 items-center px-8 py-2 bg-dark drop-shadow-md">
				<textarea
					placeholder="Your message"
					className="p-2 bg-transparent border border-pink-600 resize-none grow outline-0"
					value={currentMessage}
					onChange={(e) => {
						setCurrentMessage(e.target.value);
					}}
				/>
				<button onClick={handleGroupMessageSubmit} className="self-stretch px-3 py-2 text-lg text-white uppercase bg-pink-600 rounded">
					<FiSend />
				</button>
			</div>
		</div>
	);
};

export default Group;
