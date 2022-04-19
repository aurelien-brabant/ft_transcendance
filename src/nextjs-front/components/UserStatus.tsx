import { useContext, useEffect, useState } from "react";
import socketContext, { SocketContextType } from "../context/socket/socketContext";

export type UserStatus = 'online' | 'offline' | 'deactivated';

const statusColors = {
	'online': 'bg-green-500',
	'offline': 'bg-red-500',
	'deactivated': 'bg-gray-700'
};

export const UserStatusItem: React.FC<{ status: UserStatus, withText?: boolean, className?: string, id: string }> = ({ status, withText, className, id }) => {
	const [color, setColor] = useState(className || 'bg-green-500');
	const [state, setState] = useState(status);

	const { chatRoom } = useContext(socketContext) as SocketContextType;
	
	useEffect(() => {
		const checkConnected = () => {
			let found = false;
			for (let i in chatRoom.users) {
				if (chatRoom.users[i].id === id) {
					found = true;
					setColor(statusColors.online);
					setState('online');
					break;
				}
			}
			if (!found) {
				setColor(statusColors.offline);
				setState('offline');
			}
		}
		
		if (status === "deactivated")
			setColor(statusColors.deactivated);
		else
			checkConnected();
	}, [id, chatRoom]);

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
