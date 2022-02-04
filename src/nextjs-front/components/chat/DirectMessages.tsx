import {useContext} from "react";
import chatContext, {ChatContextType, ChatGroup} from "../../context/chat/chatContext";

const DirectMessages: React.FC<{
	viewParams: Object
}> = ({ viewParams }) => {
	const { openChatView } = useContext(chatContext) as ChatContextType;
	
	const groupsMeta: ChatGroup[] = [
		{
			label: 'User 1',
			id: '1',
			lastMessage: 'Hello world'
		}
	];

	return (
		<div className="h-full overflow-x-auto">
			{groupsMeta.map((dm) => (
				<div key={dm.label}
					className="items-center px-10 py-5 border-b-2 border-gray-300 grid grid-cols-3 hover:bg-neutral-300"
					onClick={() => {
						openChatView('dm', dm.label, { targetUsername: dm.label });
					}}
				>
					<div>
						<div
							style={{ backgroundColor: 'green' }}
							className="flex items-center justify-center w-16 h-16 text-4xl rounded-full"
						>
							{dm.label[0].toUpperCase()}
						</div>
					</div>
					<div className="col-span-2">
						<h6 className="text-lg font-bold">{dm.label}</h6>
						<p>{dm.lastMessage}</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default DirectMessages;