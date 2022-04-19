import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "../../hooks/use-session";
import socketContext from "./socketContext";

export type ChatUser = {
	id : string,
	username: string,
	socketId: string,
}

const SocketProvider: React.FC = ({ children }) => {

	const session = useSession();
	const user = session.user;
	const [chatRoom, setChatRoom] = useState<ChatUser[]>([]);
	const [chatRoomLen, setChatRoomLen] = useState(0);
	const socket = io("localhost:8080");

	useEffect((): any => {

		if (!socket || session.state !== 'authenticated')
			return;

		const handleChat = () => {
			socket.on("connect", () => {
				console.log('[Chat] Client connected');

				socket.emit('newUser', {
					id: user.id,
					username: user.username
				});

				socket.on('newDm', ({ message }) => {
					console.log(`[Chat] Receive new message from [${message.author.username}]`);
				});

				socket.on('newGm', ({ message }) => {
					console.log(`[Chat] Receive new message in group [${message.channel.name}]`);
				});

				// socket.emit("handleChatConnect", user);

				socket.on("joinChat", (data: ChatUser[]) => {
					setChatRoom(data);
				});

				socket.on("leaveChat", (data: ChatUser[]) => {
					setChatRoom(data);
				});

				socket.on('updateChatRoomLen', (len: number) => {
					setChatRoomLen(len);
				});
			});
		}
		handleChat();

		return () => {
			socket.disconnect();
		}
	}, [user]);

	return (
		<socketContext.Provider
			value={{
				socket,
				chatRoom,
				chatRoomLen
			}}
		>
			{children}
		</socketContext.Provider>
	);
};

export default SocketProvider;
