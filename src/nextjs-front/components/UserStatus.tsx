import { useContext, useEffect, useState } from "react";
import chatContext, { ChatContextType } from "../context/chat/chatContext";

export type UserStatus = 'DEACTIVATED' | 'OFFLINE' | 'ONLINE' | 'PLAYING';

const statusColors = {
	'DEACTIVATED': 'bg-gray-700',
	'OFFLINE': 'bg-red-500',
	'ONLINE': 'bg-green-500',
	'PLAYING': 'bg-yellow-500',
};

export const UserStatusItem: React.FC<{ status?: UserStatus, withText?: boolean, className?: string, id: string }> = ({ status, withText, className, id }) => {
	const [color, setColor] = useState(className || 'bg-green-500');
	const [state, setState] = useState(status);
	const { socket } = useContext(chatContext) as ChatContextType;

	const updateUserStatusListener = ({ userId, status }: { userId: number, status: UserStatus }) => {
		if (parseInt(id) !== userId) return ;

		setColor(statusColors[status]);
		setState(status);
	}

	useEffect(() => {
		setColor(statusColors.DEACTIVATED);
		if (socket) {
			socket.emit("getUserStatus", { userId: id });
		}
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
