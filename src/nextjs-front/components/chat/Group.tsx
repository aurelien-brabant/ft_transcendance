import faker from "@faker-js/faker";
import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "../../context/chat/chatContext";

const Group: React.FC<{ viewParams: { [key: string]: any } }> = ({
	viewParams,
}) => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentMessage, setCurrentMessage] = useState('');
	const chatBottom = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const messages: ChatMessage[] = [];

		for (let i = 0; i != 50; ++i) {
			messages.push({
				isMe: Math.random() <= 0.5,
				content: faker.lorem.sentence(),
				id: faker.datatype.uuid(),
				author: faker.name.findName()
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
			{messages.map((msg: ChatMessage) => (
				<div
					key={msg.id}
					className={`${
						msg.isMe
							? "self-end bg-green-400"
							: "self-start bg-gray-300"
					} max-w-[80%] p-2 my-2 rounded whitespace-wrap break-all`}
				>
					{!msg.isMe && ( <span className="text-xs text-gray-900 uppercase">{msg.author}</span>)}
					<p>
					{msg.content}
					</p>
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
							author: 'random'
						},
					]);
					setCurrentMessage("");
				}}
			>
				Send
			</button>
		</div>
	</div>);
};

export default Group;
