import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { FaUserFriends, FaUserPlus } from "react-icons/fa";
import { FiSend } from 'react-icons/fi';
import { RiSettings5Line } from "react-icons/ri";
import Tooltip from "../../components/Tooltip";
import { useSession } from "../../hooks/use-session";
import chatContext, { ChatContextType, ChatMessage } from "../../context/chat/chatContext";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";

/* Header */
export const GroupHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { user } = useSession();
	const { closeChat, openChatView, setChatView } = useContext(chatContext) as ChatContextType;
	const ownerView = (viewParams.groupOwnerId === user.id);
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
									groupId: viewParams.groupId,
									groupName: viewParams.groupName,
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
									groupId: viewParams.groupId
								}
							)}}
						>
							<FaUserPlus className="text-lg" />
						</button>
					</Tooltip>
					<button onClick={() => {
						openChatView('group_settings', 'group settings', {
								groupId: viewParams.groupId,
								groupName: viewParams.groupName,
								groupPrivacy: viewParams.groupPrivacy,
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
					{viewParams.groupName}
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
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { fetchChannelData } = useContext(chatContext) as ChatContextType;
	const { blocked } = useContext(relationshipContext) as RelationshipContextType;
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const chatBottom = useRef<HTMLDivElement>(null);
	const channelId = viewParams.groupId;

	const addMessage = (message: any) => {
		const isBlocked = !!blocked.find(user => user.id === message.author.id);

		setMessages([
			...messages, {
				id: message.id,
				author: message.author.username,
				content: isBlocked ? "Blocked message" : message.content,
				isMe: (message.author.id === user.id),
				isBlocked: isBlocked
			}
		]);
	}

	/* Send new message */
	const handleGroupMessageSubmit = async () => {
		if (currentMessage.trim().length === 0) return;

		const channelData = await fetchChannelData(channelId).catch(console.error);

		const res = await fetch("/api/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				author: user,
				content: currentMessage,
				channel: channelData
			}),
		});
		const data = await res.json();

		if (res.status === 201) {
			addMessage(data);
			setCurrentMessage('');
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to send message"
			});
		}
	};

	/* Scroll to bottom if new message is sent */
	useEffect(() => {
		chatBottom.current?.scrollIntoView();
	}, [messages]);

	/* Load all messages on mount */
	const loadGroupOnMount = async () => {
		const data = await fetchChannelData(channelId).catch(console.error);
		const gms = JSON.parse(JSON.stringify(data)).messages;
		const messages: ChatMessage[] = [];

		for (var i in gms) {
			const isBlocked = !!blocked.find(user => user.id == gms[i].author.id);

			messages.push({
				id: gms[i].id,
				author: gms[i].author.username,
				content: isBlocked ? "Blocked message" : gms[i].content,
				isMe: (gms[i].author.id === user.id),
				isBlocked: isBlocked
			});
		}
		setMessages(messages);
	}

	useEffect(() => {
		loadGroupOnMount();
	}, []);

	return (
		<div className="h-full">
			<div className="flex flex-col items-start max-h-[87%] h-auto px-5 pb-5 overflow-auto">
				{messages.map((msg: ChatMessage) => (
					<div
						key={msg.id}
						className={`${
							msg.isBlocked
								? "self-start text-gray-900 bg-gray-600"
								: msg.isMe
									? "self-end bg-green-600"
									: "self-start text-gray-900 bg-gray-300"
						} max-w-[80%] p-2 my-2 rounded whitespace-wrap break-all`}
					>
						{!msg.isMe && !msg.isBlocked && (
							<span className="text-xs text-gray-900 uppercase">
								{msg.author}
							</span>
						)}
						<p>{msg.content}</p>
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
