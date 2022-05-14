import { useContext, useEffect, useState } from "react";
import chatContext, { ChatContextType } from "../context/chat/chatContext";

export type UserStatus = 'ONLINE' | 'OFFLINE' | 'deactivated';

const statusColors = {
	'ONLINE': 'bg-green-500',
	'OFFLINE': 'bg-red-500',
	'deactivated': 'bg-gray-700'
};

export const UserStatusItem: React.FC<{ status: UserStatus, withText?: boolean, className?: string, id: string }> = ({ status, withText, className, id }) => {
	const [color, setColor] = useState(className || 'bg-green-500');
	const [state, setState] = useState(status);
	const { socket } = useContext(chatContext) as ChatContextType;

	const updateUserStatusListener = (status: UserStatus) => {
		setColor(statusColors[status]);
		setState(status);
	}

	useEffect(() => {
		if (socket) {
			socket.emit("getUserStatus", { userId: id });
		}
		setColor(statusColors.deactivated);
	}, [id]);

	useEffect(() => {
		/* Listeners */
		socket.on("updateUserStatus", updateUserStatusListener);

		return () => {
			socket.off("updateUserStatus", updateUserStatusListener);
		};
	}, []);

	return (
	<div className={`flex items-center gap-x-2 ${className}`}>
		<span className={`h-4 w-4 rounded-full -translate-y-[.05em] ${color}`} />
		{ withText && ( <span className="uppercase text-neutral-200">{state}</span>)}
	</div>
	);
}

UserStatusItem.defaultProps = {
	withText: true
}
