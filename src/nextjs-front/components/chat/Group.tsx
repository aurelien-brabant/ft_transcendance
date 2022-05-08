import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { FaUserFriends, FaUserPlus } from "react-icons/fa";
import { FiSend } from 'react-icons/fi';
import { RiSettings5Line } from "react-icons/ri";
import { Channel, Message } from 'transcendance-types';
import Tooltip from "../../components/Tooltip";
import { useSession } from "../../hooks/use-session";
import chatContext, { ChatContextType, ChatMessage } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";

/* Header */
export const GroupHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const channelId: string = viewParams.channelId;
	const { user } = useSession();
	const { socket, closeChat, openChatView, setChatView } = useContext(chatContext) as ChatContextType;
	const [userInChan, setUserInChan] = useState(false);
	const actionTooltipStyles = "font-bold bg-dark text-neutral-200";

	const defineOptions = (channel: Channel) => {
		setUserInChan(!!channel.users.find(
			(chanUser) => { return chanUser.id === user.id;}
		));
	};

	const userJoinedListener = (res: { message: string, userId: string }) => {
		if (res.userId === user.id) {
			setUserInChan(true);
		}
	};

	useEffect(() => {
		socket.emit("getChannelData", { channelId });

		/* Listeners */
		socket.on("updateChannel", defineOptions);
		socket.on("joinedChannel", userJoinedListener);

		return () => {
			socket.off("updateChannel", defineOptions);
			socket.off("joinedChannel", userJoinedListener);
		};
	}, []);

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
				{userInChan && <div className="flex items-right gap-x-3">
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
					<Tooltip className={actionTooltipStyles} content="users">
						<button onClick={() => {
							openChatView('group_users', 'group users', {
									channelId: viewParams.channelId,
									channelName: viewParams.channelName,
								}
							)}}
						>
							<FaUserFriends />
						</button>
					</Tooltip>
					<button onClick={() => {
						openChatView('group_settings', 'group settings', {
								channelId: viewParams.channelId,
								channelName: viewParams.channelName,
								privacy: viewParams.privacy,
							}
						)}}
						>
						<RiSettings5Line />
					</button>
				</div>
			}
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
	const channelId = viewParams.channelId;
	const { user } = useSession();
	const { socket, setChatView, getMessageStyle } = useContext(chatContext) as ChatContextType;
	const { blocked } = useContext(relationshipContext) as RelationshipContextType;
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const [sendingEnabled, setSendingEnabled] = useState(false);
	const [userInChan, setUserInChan] = useState(false);
	const chatBottom = useRef<HTMLDivElement>(null);

	const joinGroup = async () => {
		socket.emit("joinChannel", {
			userId: user.id,
			channelId: viewParams.channelId
		});
	};

	/* Send new message */
	const handleGmSubmit = async () => {
		if (currentMessage.trim().length === 0) return;

		console.log('[Chat] Submit group message');

		socket.emit('gmSubmit', {
			content: currentMessage,
			from: user.id,
			channelId
		});
		setCurrentMessage("");
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const len = e.target.value.trim().length;

		if ((len === 0) || (len > 640)) {
			setSendingEnabled(false);
		} else {
			setSendingEnabled(true);
		}
		setCurrentMessage(e.target.value);
	};

	/* Receive new message */
	const newGmListener = ({ message }: { message: Message }) => {
		console.log(`[Chat] Receive new message in [${message.channel.name}]`);

		setMessages((prevMessages) => {
			const newMessages: ChatMessage[] = [...prevMessages];

			const isBlocked = !!blocked.find(blockedUser => blockedUser.id === message.author.id);
			const isMe = (message.author.id === user.id);

			newMessages.push({
				id: prevMessages.length.toString(),
				createdAt: message.createdAt,
				content: isBlocked ? "Blocked message" : message.content,
				author: message.author.username,
				displayAuthor: (!isMe && !isBlocked),
				displayStyle: getMessageStyle(message.author.id),
				
			});
			return newMessages;
		});
	};

	/* Scroll to bottom if new message is sent */
	useEffect(() => {
		chatBottom.current?.scrollIntoView();
	}, [messages]);

	const userJoinedListener = (res: { message: string, userId: string }) => {
		setMessages((prevMessages) => {
			const newMessages: ChatMessage[] = [...prevMessages];

			newMessages.push({
				id: prevMessages.length.toString(),
				createdAt: new Date(Date.now()),
				content: res.message,
				author: "bot",
				displayAuthor: false,
				displayStyle: "self-center text-gray-500",
			});
			return newMessages;
		});
		if (res.userId === user.id) {
			setUserInChan(true);
		}
	};

	const userLeftListener = (res: { message: string }) => {
		setMessages((prevMessages) => {
			const newMessages: ChatMessage[] = [...prevMessages];

			newMessages.push({
				id: prevMessages.length.toString(),
				createdAt: new Date(Date.now()),
				content: res.message,
				author: "bot",
				displayAuthor: false,
				displayStyle: "self-center text-gray-500",
			});
			return newMessages;
		});
	};

	const channelDeletedListener = (deletedId: string) => {
		if (deletedId === channelId) {
			setChatView("groups", "Group chats", {});
		}
	};

	/* Load all messages in channel */
	const updateGroupView = async (channel: Channel) => {
		if ((channel.id !== channelId) || !channel.messages) return ;

		setUserInChan(!!channel.users.find(
			(chanUser) => { return chanUser.id === user.id;}
		));

		const messages: ChatMessage[] = [];

		channel.messages.sort(
			(a: Message, b: Message) => (parseInt(a.id) - parseInt(b.id))
		);

		for (var message of channel.messages) {
			const isBlocked = !!blocked.find(blockedUser => blockedUser.id === message.author.id);
			const isMe = (message.author.id === user.id);

			messages.push({
				id: messages.length.toString(),
				createdAt: message.createdAt,
				content: isBlocked ? "Blocked message" : message.content,
				author: message.author.username,
				displayAuthor: (!isMe && !isBlocked),
				displayStyle: getMessageStyle(message.author.id),
			});
		}
		setMessages(messages);
	};

	useEffect(() => {
		socket.emit("getChannelData", { channelId });

		/* Listeners */
		socket.on("updateChannel", updateGroupView);
		socket.on("newGm", newGmListener);
		socket.on("joinedChannel", userJoinedListener);
		socket.on("leftChannel", userLeftListener);
		socket.on("channelDeleted", channelDeletedListener);

		return () => {
			socket.off("updateChannel", updateGroupView);
			socket.off("newGm", newGmListener);
			socket.off("joinedChannel", userJoinedListener);
			socket.off("leftChannel", userLeftListener);
			socket.off("channelDeleted", channelDeletedListener);
		};
	}, []);

	return (
		<div className="h-full">
			<div className="flex flex-col items-start max-h-[87%] h-auto px-5 pb-5 overflow-auto">
				{messages.map((message: ChatMessage) => (
					<div
						key={message.id}
						className={`
							${message.displayStyle} 
							max-w-[80%] p-2 my-2 rounded whitespace-wrap break-all`
						}
					>
						{message.displayAuthor && (
							<span className="text-xs text-gray-900 uppercase">
								{message.author}
							</span>
						)}
						<p>{message.content}</p>
					</div>
				))}
				<div ref={chatBottom} />
			</div>
				{userInChan ?
				<div className="absolute inset-x-0 bottom-0 border-t-2 border-gray-800 min-h-[13%] flex gap-x-2 items-center px-8 py-2 bg-dark drop-shadow-md">
					<textarea
						placeholder="Your message"
						className="p-2 bg-transparent border border-pink-600 resize-none grow outline-0"
						value={currentMessage}
						onChange={handleChange}
					/>
					{sendingEnabled ?
					<button
						onClick={handleGmSubmit}
						className="self-stretch px-3 py-2 text-lg text-white uppercase bg-pink-600 rounded"
						>
						<FiSend />
					</button>
					:
					<button
						className="self-stretch px-3 py-2 text-lg text-white uppercase bg-pink-900 rounded"
					>
						<FiSend />
					</button>
					}
				</div>
				:
				<div className="absolute inset-x-0 bottom-0 border-t-2 border-gray-800 min-h-[13%] flex gap-x-2 items-center justify-center px-8 py-2 bg-dark drop-shadow-md">
					<button className="px-2 py-1 text-sm font-bold uppercase bg-pink-600 rounded" onClick={() => { joinGroup(); }}>
						Join Group
					</button>
				</div>
				}
		</div>
	);
};

export default Group;
