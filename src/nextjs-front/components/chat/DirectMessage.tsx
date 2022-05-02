import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import { RiPingPongLine } from "react-icons/ri";
import Link from "next/link";
import { Channel, Message } from 'transcendance-types';
import { UserStatusItem } from "../UserStatus";
import { useSession } from "../../hooks/use-session";
import Tooltip from "../../components/Tooltip";
import chatContext, { ChatContextType, ChatMessage } from "../../context/chat/chatContext";

/* Header */
export const DirectMessageHeader: React.FC<{ viewParams: any }> = ({
	viewParams,
}) => {
	const { user } = useSession();
	const { closeChat, setChatView } = useContext(chatContext) as ChatContextType;
	const actionTooltipStyles = "font-bold bg-dark text-neutral-200";

	return (
		<Fragment>
			<div className="flex items-start justify-between pt-3 px-5">
				<div className="flex gap-x-2">
					<button
						className="text-2xl"
						onClick={() => {
							closeChat();
						}}
					>
						<AiOutlineClose />
					</button>
					<button
						className="text-2xl"
						onClick={() => {
							setChatView("dms", "Direct messages", {});
						}}
					>
						<AiOutlineArrowLeft />
					</button>
				</div>
				<Tooltip className={actionTooltipStyles} content="play">
					<button className="p-1 text-xl text-gray-900 bg-white rounded-full transition hover:scale-105 hover:text-pink-600">
						<RiPingPongLine />
					</button>
				</Tooltip>
			</div>
			<div className="flex items-center justify-center gap-x-3">
				<Link href={`/users/${viewParams.friendId}`}>
					<h6 className="font-bold hover:text-pink-600">
						{viewParams.friendUsername}
					</h6>
				</Link>{" "}
				<UserStatusItem
					withText={false}
					status={user.accountDeactivated ? "deactivated" : "online"}
					id={user.id}
				/>
			</div>
		</Fragment>
	);
};

/* Conversation */
const DirectMessage: React.FC<{ viewParams: { [key: string]: any } }> = ({
	viewParams,
}) => {
	const { user } = useSession();
	const { socket } = useContext(chatContext) as ChatContextType;
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const chatBottom = useRef<HTMLDivElement>(null);
	const channelId: string = viewParams.channelId;

	/* Load all messages in channel */
	const loadMessages = async (channel: Channel) => {
		if ((channel.id !== channelId) || !channel.messages) return ;

		const messages: ChatMessage[] = [];

		channel.messages.sort(
			(a: Message, b: Message) => (parseInt(a.id) - parseInt(b.id))
		);

		for (var message of channel.messages) {
			messages.push({
				id: messages.length.toString(),
				author: message.author.username,
				content: message.content,
				isMe: message.author.id === user.id,
				isBlocked: false,
				createdAt: message.createdAt
			});
		}
		setMessages(messages);
	};

	/* Send new message */
	const handleDmSubmit = async () => {
		if (currentMessage.trim().length === 0) return;

		socket.emit("dmSubmit", {
			content: currentMessage,
			from: user.id,
			to: viewParams.friendId,
			channelId: channelId,
		});
		setCurrentMessage("");
	};

	/* Scroll to bottom if a new message is sent */
	useEffect(() => {
		chatBottom.current?.scrollIntoView();
	}, [messages]);

	/* Receive new message */
	const handleNewMessage = ({ message }: { message: Message }) => {
		console.log(`[Chat] Receive new message in DM [${viewParams.friendUsername}]`);

		setMessages((prevMessages) => {
			const newMessages: ChatMessage[] = [...prevMessages];

			newMessages.push({
				id: prevMessages.length.toString(),
				author: message.author.username,
				content: message.content,
				isMe: message.author.id === user.id,
				isBlocked: false,
				createdAt: message.createdAt
			});
			return newMessages;
		});
	};

	useEffect(() => {
		socket.emit("getChannelData", { channelId });

		/* Listeners */
		socket.on("updateChannel", loadMessages);
		socket.on("newDm", handleNewMessage);

		return () => {
			socket.off("updateChannel", loadMessages);
			socket.off("newDm", handleNewMessage);
		};
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
						<p>{msg.content}</p>
					</div>
				))}
				<div ref={chatBottom} />
			</div>
			<div className="absolute inset-x-0 bottom-0 border-t-2 border-04dp min-h-[13%] flex gap-x-2 items-center px-8 py-2 bg-dark drop-shadow-md">
				<textarea
					placeholder="Your message"
					className="p-2 bg-transparent border border-pink-600 resize-none grow outline-0"
					value={currentMessage}
					onChange={(e) => {
						setCurrentMessage(e.target.value);
					}}
				/>
				<button
					onClick={handleDmSubmit}
					className="self-stretch px-3 py-2 text-lg text-white uppercase bg-pink-600 rounded"
				>
					<FiSend />
				</button>
			</div>
		</div>
	);
};

export default DirectMessage;
