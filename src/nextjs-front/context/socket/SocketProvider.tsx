import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "../../hooks/use-session";
import socketContext from "./socketContext";

const socket = io("localhost:8080");

export type ChatUser = {
	id : string,
	username: string,
	socketId: string,
}

const SocketProvider: React.FC = ({ children }) => {
	
	const { user } = useSession();
	const [chatRoom, setChatRoom] = useState<ChatUser[]>([]);
  	const [chatRoomLen, setChatRoomLen] = useState(0);
   
	useEffect((): any => {

		if (!socket)
			return;

		const handleChat = () => {
			socket.on("connect", () => {
				socket.emit("handleChatConnect", user);

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
