import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "../../hooks/use-session";
import socketContext from "./socketContext";

export type ChatUser = {
  id: string;
  username: string;
  socketId: string;
};

const SocketProvider: React.FC = ({ children }) => {
  const session = useSession();
  const user = session.user;
  const [chatRoom, setChatRoom] = useState<ChatUser[]>([]);
  const [chatRoomLen, setChatRoomLen] = useState(0);
  const [socket, setSocket] = useState<any>(null);

  useEffect((): any => {
    const socketIo = io("localhost:8080");

    setSocket(socketIo);

    if (!socket || session.state !== "authenticated") return;

    const handleChat = () => {
      socket.on("connect", () => {
        console.log("[Chat] Client connected");

        socket.on("connect_error", (err: Error) => {
          console.log(`connect_error due to ${err.message}`);
          socket.close();
        });

        socket.emit("newUser", {
          id: user.id,
          username: user.username,
        });

        // socket.on("joinChat", (data: ChatUser[]) => {
        // 	setChatRoom(data);
        // });

        // socket.on("leaveChat", (data: ChatUser[]) => {
        // 	setChatRoom(data);
        // });

        // socket.on('updateChatRoomLen', (len: number) => {
        // 	setChatRoomLen(len);
        // });
      });
    };
    handleChat();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <socketContext.Provider
      value={{
        socket,
        chatRoom,
        chatRoomLen,
      }}
    >
      {children}
    </socketContext.Provider>
  );
};

export default SocketProvider;
