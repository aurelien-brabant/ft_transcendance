import { useContext, useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsArrowLeftShort } from "react-icons/bs";
import { FiSend } from 'react-icons/fi';
import { MdPeopleAlt } from "react-icons/md";
import { RiSettings5Line } from "react-icons/ri";
import chatContext, { ChatContextType, ChatMessage } from "../../context/chat/chatContext";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";

export const GroupHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { openChatView, closeChat, setChatView } = useContext(chatContext) as ChatContextType;

	return (
		<div className="flex items-center justify-between p-3 px-5">
			<div className="flex gap-x-2">
				<button className="text-2xl" onClick={() => { closeChat() }}><AiOutlineClose /></button>
				<button className="text-4xl" onClick={() => { setChatView('groups', 'Group chats', {})}}><BsArrowLeftShort /></button>
			</div>
			<div className="flex items-center gap-x-3">
				<h6 className="font-bold">{viewParams.groupName}</h6>
			</div>
			<button onClick={() => { openChatView('group_users', 'group users', { groupName: viewParams.groupName })}}>
			<MdPeopleAlt className="text-3xl" />
			</button>
			<button onClick={() => { openChatView('group_settings', 'group settings', { targetUsername: viewParams.targetUsername })}}>
			<RiSettings5Line className="text-3xl" />
			</button>
		</div>
	);
}

const Group: React.FC<{ viewParams: { [key: string]: any } }> = ({
	viewParams,
}) => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const chatBottom = useRef<HTMLDivElement>(null);
	const channelId = viewParams.groupId;
	const { getUserData } = useContext(authContext) as AuthContextType;
	const userId = getUserData().id;
	const username = getUserData().username;
	const { setAlert } = useContext(alertContext) as AlertContextType;

	const handleGroupMessageSubmit = async () => {
		if (currentMessage.length === 0) return;

		const channelData = await (await fetch(`/api/channels/${channelId}`)).json(); // tmp

		const res = await fetch("/api/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				author: getUserData(),
				content: currentMessage,
				channel: channelData
			}),
		});

		if (res.status === 201) {
			setMessages([
				...messages, {
					id: userId,
					author: username,
					content: currentMessage,
					isMe: true
				}
			]);
			setCurrentMessage('');
			// TODO: update last message
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to send message"
			});
		}
	};

	const updateChannelMessages = async (channelMessages: any) => {
		const messages: ChatMessage[] = [];

		for (var i in channelMessages) {
			messages.push({
				id: channelMessages[i].id,
				author: channelMessages[i].author.username,
				content: channelMessages[i].content,
				isMe: (channelMessages[i].author.id === userId)
			});
		}
		setMessages(messages);
	}

	useEffect(() => {
		const fetchData = async () => {
			const res = await fetch(`/api/channels/${channelId}`);
			const data = await res.json();

			updateChannelMessages(JSON.parse(JSON.stringify(data)).messages);
		}
		fetchData().catch(console.error);
	}, []);

	useEffect(() => {
		chatBottom.current?.scrollIntoView();
	}, [messages]);

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
						{!msg.isMe && (
							<span className="text-xs text-gray-900 uppercase">
								{msg.author}
							</span>
						)}
						<p>{msg.content}</p>
					</div>
				))}
				<div ref={chatBottom} />
			</div>
			<div className="border-t-2 border-gray-800 min-h-[13%] flex gap-x-2 items-center px-8 py-2 bg-gray-900 drop-shadow-md">
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
