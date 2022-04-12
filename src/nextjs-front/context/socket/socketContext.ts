import { createContext } from 'react';
import { Socket } from 'socket.io-client';

export type SocketContextType = {
	socket: Socket;
	chatRoom: any;
	chatRoomLen: number
}

const socketContext = createContext<SocketContextType | null>(null);

export default socketContext;
