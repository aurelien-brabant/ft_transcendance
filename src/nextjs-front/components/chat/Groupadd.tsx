import { useContext } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import chatContext, { ChatContextType } from '../../context/chat/chatContext';

export const GroupaddHeader: React.FC<{ viewParams: any}> = ({ viewParams }) => {
	const { setChatView, openChatView, closeChat, closeRightmostView } = useContext(chatContext) as ChatContextType;

	return (
		<div className="flex items-center justify-between p-3 px-5">
			<div className="flex gap-x-2">
			<button className="text-4xl" onClick={() => { closeRightmostView() }}><BsArrowLeftShort /></button>
			</div>
			<div className="flex items-center gap-x-3">
				<h6 className="font-bold">Add {viewParams.targetUsername} to group</h6>
			</div>
		</div>
	);
}

const Groupadd = () => {
	return (
		<h1>Select the group</h1>
	);
}

export default Groupadd;
