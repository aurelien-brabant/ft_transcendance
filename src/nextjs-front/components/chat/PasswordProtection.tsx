import { Fragment, useContext } from "react";
import { AiFillLock, AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

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

const PasswordProtection: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { session, setChatView } = useContext(chatContext) as ChatContextType;
	const { setAlert } = useContext(alertContext) as AlertContextType;

	/* Check password is correct */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
		const res = await fetch(`/api/channels/${viewParams.groupId}/join?userId=${session.user.id}&password=${input}`, {
			method: "POST",
			headers: {
			"Content-Type": "application/json",
			},
		});

		if (res.status === 201) {
			setChatView('group', viewParams.groupName, { ...viewParams });
		} else {
			setAlert({
				type: "error",
				content: "Invalid password"
			});
		}
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
