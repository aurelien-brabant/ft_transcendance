import { Fragment, useContext } from "react";
import { AiFillLock, AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { useSession } from "../../hooks/use-session";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

/* Header */
export const PasswordProtectionHeader: React.FC<{ viewParams: any }> = ({ viewParams}) => {
	const { closeChat, setChatView } = useContext(chatContext) as ChatContextType;

	return (
		<Fragment>
			<div className="flex items-start justify-between pt-3 px-5">
				<div className="flex gap-x-2 text-2xl">
					<button onClick={() => { closeChat(); }}>
						<AiOutlineClose />
					</button>
					<button onClick={() => { setChatView('groups', 'Group chats', {})}}>
						<AiOutlineArrowLeft />
					</button>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center">
				<h6 className="text-lg font-bold text-pink-600">
					Password required
				</h6>
			</div>
		</Fragment>
	);
}

/* Password prompt */
const PasswordProtection: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { user } = useSession();
	const { socket, openChatView } = useContext(chatContext) as ChatContextType;

	/* Check password is correct */
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const input = (e.currentTarget.elements[0] as HTMLInputElement).value;

		socket.emit("joinProtected", {
			channelId: viewParams.channelId,
			userId: user.id,
			password: input
		});

		socket.on("joinedProtected", () => {
			openChatView('group', viewParams.channelName, { ...viewParams });
		});
	};

	return <div className = "flex flex-col items-center justify-center p-5 gap-y-4">
		<AiFillLock className="text-8xl" />
		<h6 className="text-xl text-neutral-200">This group is password protected</h6>
		<form onSubmit={handleSubmit} className="flex flex-col items-center gap-y-4">
		<input type="password" className="w-full px-2 py-1 text-4xl bg-transparent border border-pink-600 outline-0" />
		<button type="submit" className="px-3 py-2 uppercase bg-pink-600 rounded">Enter</button>
		</form>
	</div>
}

export default PasswordProtection;
