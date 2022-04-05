import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import { RiPingPongLine } from 'react-icons/ri';
import Link from 'next/link';
import { UserStatusItem } from "../UserStatus";
import Tooltip from "../../components/Tooltip";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import chatContext, { ChatContextType, ChatMessage } from "../../context/chat/chatContext";
import { chatSocket } from "../../components/Chat";

/* Header */
export const DirectMessageHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { closeChat, setChatView } = useContext(
		chatContext
	) as ChatContextType;
	const actionTooltipStyles = 'font-bold bg-gray-900 text-neutral-200';

	return (
		<Fragment>
			<div className="flex items-start justify-between pt-3 px-5">
				<div className="flex gap-x-2">
					<button className="text-2xl" onClick={() => {closeChat() }}>
						<AiOutlineClose />
					</button>
					<button className="text-2xl" onClick={() => {setChatView('dms', 'Direct messages', {})}}>
						<AiOutlineArrowLeft />
					</button>
				</div>
				<Tooltip className={actionTooltipStyles} content="play">
					<button
						className="p-1 text-xl text-gray-900 bg-white rounded-full transition hover:scale-105 hover:text-pink-600"
					>
						<RiPingPongLine />
					</button>
				</Tooltip>
			</div>
			<div className="flex items-center justify-center gap-x-3">
				<Link href={`/users/${viewParams.friendId}`}><h6 className="font-bold hover:text-pink-600">
						{viewParams.friendUsername}
					</h6></Link> <UserStatusItem status="online" withText={false} />
			</div>
		</Fragment>
	);
}

/* Conversation */
const DirectMessage: React.FC<{ viewParams: { [key: string]: any } }> = ({
	viewParams,
}) => {
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { getUserData } = useContext(authContext) as AuthContextType;
	const { fetchChannelData } = useContext(chatContext) as ChatContextType;
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const chatBottom = useRef<HTMLDivElement>(null);
	const dmId = viewParams.dmId;
	const userId = getUserData().id;

	const addMessage = (message: any) => {
		setMessages([
			...messages, {
				id: message.id,
				author: message.author.username,
				content: message.content,
				isMe: (message.author.id === userId),
				isBlocked: false
			}
		]);
	}

	/* Send new message */
	const handleDmSubmit = async () => {
		if (currentMessage.length === 0) return;

		chatSocket.emit('messageToServer', currentMessage);
		console.log(`[Chat] Client sends DM: "${currentMessage}"`);

		// const channelData = await fetchChannelData(dmId).catch(console.error);
		// const res = await fetch("/api/messages", {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify({
		// 		author: getUserData(),
		// 		content: currentMessage,
		// 		channel: channelData
		// 	}),
		// });
		// const data = await res.json();

		// if (res.status === 201) {
		// 	addMessage(data);
		// 	setCurrentMessage("");
		// 	return;
		// } else {
		// 	setAlert({
		// 		type: "error",
		// 		content: "Failed to send message"
		// 	});
		// }
	};

	/* Scroll to bottom if new message is sent */
	useEffect(() => {
		chatBottom.current?.scrollIntoView();
	}, [messages]);

	/* Load all messages on mount */
	const loadDmsOnMount = async () => {
		const data = await fetchChannelData(dmId).catch(console.error);
		const dms = JSON.parse(JSON.stringify(data)).messages;
		const messages: ChatMessage[] = [];

		for (var i in dms) {
			messages.push({
				id: dms[i].id,
				author: dms[i].author.username,
				content: dms[i].content,
				isMe: (dms[i].author.id === userId),
				isBlocked: false
			});
		}
		setMessages(messages);
	}

	useEffect(() => {
		loadDmsOnMount();
	}, []);

	return (
		<div className="h-full">
			<div className="flex flex-col items-start max-h-[87%] h-auto px-5 pb-5 overflow-auto">
				{messages.map((msg: ChatMessage) => (
					<div
						key={msg.id}
						className={`${
							msg.isMe
									? "self-end bg-green-600"
									: "self-start text-gray-900 bg-gray-300"
						} max-w-[80%] p-2 my-2 rounded whitespace-wrap break-all`}
					>
						<p>
						{msg.content}
						</p>
					</div>
				))}
				<div ref={chatBottom} />
			</div>
			<div className="absolute inset-x-0 bottom-0 border-t-2 border-gray-800 min-h-[13%] flex gap-x-2 items-center px-8 py-2 bg-gray-900 drop-shadow-md">
				<textarea
					placeholder="Your message"
					className="p-2 bg-transparent border border-pink-600 resize-none grow outline-0"
					value={currentMessage}
					onChange={(e) => {
						setCurrentMessage(e.target.value);
					}}
				/>
				<button onClick={handleDmSubmit} className="self-stretch px-3 py-2 text-lg text-white uppercase bg-pink-600 rounded">
					<FiSend />
				</button>
			</div>
		</div>
	);
};

export default DirectMessage;
