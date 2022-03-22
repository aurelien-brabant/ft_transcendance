import { useContext } from "react";
import { AiFillLock } from "react-icons/ai";
import { BsArrowLeftShort } from "react-icons/bs";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

export const PasswordProtectionHeader: React.FC<{ viewParams: any }> = ({ viewParams}) => {
	const { setChatView } = useContext(chatContext) as ChatContextType;

	return (
		<div className="flex items-center justify-between p-3 px-5">
			<div className="flex gap-x-2">
				<button className="text-4xl" onClick={() => { setChatView('groups', 'Group chats', {})}}><BsArrowLeftShort /></button>
			</div>
			<div className="flex items-center gap-x-3">
				<h6 className="font-bold">Password required</h6>
			</div>
		</div>

	);
}

const PasswordProtection: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { getUserData } = useContext(authContext) as AuthContextType;
	const userId = getUserData().id;
	const { setChatView } = useContext(chatContext) as ChatContextType;
	const { setAlert } = useContext(alertContext) as AlertContextType;

	/* Check password is correct */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
		const res = await fetch(`/api/channels/${viewParams.groupId}/join?userId=${userId}&password=${input}`, {
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
		<button type="submit" className="px-3 py-2 uppercase bg-pink-600">Enter</button>
		</form>
	</div>
}

export default PasswordProtection;
