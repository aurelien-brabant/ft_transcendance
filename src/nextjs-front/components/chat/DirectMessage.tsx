import { useContext, useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineUser } from "react-icons/ai";
import { BsArrowLeftShort } from 'react-icons/bs';
import { FiSend } from "react-icons/fi";
import { MdPeopleAlt } from 'react-icons/md';
import chatContext, { ChatContextType, ChatMessage } from "../../context/chat/chatContext";
import { UserStatusItem } from "../UserStatus";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
// import Tooltip from "../Tooltip";

export const DirectMessageHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { closeChat, openChatView, setChatView } = useContext(
		chatContext
	) as ChatContextType;

	return (
		<div className="flex items-center justify-between p-3 px-5">
			<div className="flex gap-x-2">
				<button className="text-2xl" onClick={() => { closeChat() }}><AiOutlineClose /></button>
				<button className="text-4xl" onClick={() => { setChatView('dms', 'Direct messages', {})}}><BsArrowLeftShort /></button>
			</div>
			<div className="flex items-center gap-x-3">
			<h6 className="font-bold">{viewParams.targetUsername}</h6> <UserStatusItem status="online" withText={false} />
			</div>
			<button onClick={() => { openChatView('groupadd', 'groupadd', { targetUsername: viewParams.targetUsername })}}>
			<MdPeopleAlt className="text-3xl" />
			</button>
		</div>
	);
}

const DirectMessage: React.FC<{ viewParams: { [key: string]: any } }> = ({
	viewParams,
}) => {
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { getUserData } = useContext(authContext) as AuthContextType;
	const { loadChannel } = useContext(chatContext) as ChatContextType;
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentMessage, setCurrentMessage] = useState('');
	const chatBottom = useRef<HTMLDivElement>(null);
	const dmId = viewParams.targetId;
	const userId = getUserData().id;

	const updateChatMessage = (message: any) => {
		setMessages([
			...messages, {
				id: message.id,
				author: message.author.username,
				content: message.content,
				isMe: (message.author.id === userId)
			}
		]);
	}

	const updateDmsOnMount = async () => {
		const data = await loadChannel(dmId).catch(console.error);
		const dms = JSON.parse(JSON.stringify(data)).messages;
		const messages: ChatMessage[] = [];

		for (var i in dms) {
			messages.push({
				id: dms[i].id,
				author: dms[i].author.username,
				content: dms[i].content,
				isMe: (dms[i].author.id === userId),
			});
		}
		setMessages(messages);
	}

	const handleDmSubmit = async () => {
		if (currentMessage.length === 0) return;

		const channelData = await loadChannel(dmId).catch(console.error);
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
		const data = await res.json();

		if (res.status === 201) {
			updateChatMessage(data);
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

	useEffect(() => {
		updateDmsOnMount();
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
					<p>
					{msg.content}
					</p>
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
				<button onClick={handleDmSubmit} className="self-stretch px-3 py-2 text-lg text-white uppercase bg-pink-600 rounded">
					<FiSend />
				</button>
			</div>
			</div>);
};

export default DirectMessage;
