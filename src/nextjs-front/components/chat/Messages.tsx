const Messages = ({ children }) => {
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
				<input type="text"
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
						if (currentMessage.length === 0) return ;
						setMessages([
							...messages,
							{ isMe: true, content: currentMessage, id: faker.datatype.uuid() },
						]);
						setCurrentMessage("");
					}}
				>
					Send
				</button>
			</div>
		</div>

	);
}
