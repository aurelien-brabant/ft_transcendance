import { Fragment, useEffect, useState, useContext } from "react";
import { io, Socket } from 'socket.io-client';
import Head from "next/head";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import Canvas from "../components/Canvas";
import { IRoom, User } from "../gameObjects/GameObject";
import authContext, { AuthContextType } from "../context/auth/authContext"
import { NextPageWithLayout } from "./_app";

let socket: Socket;

const Hub: NextPageWithLayout = () => {
		const { getUserData }: any = useContext(authContext) as AuthContextType;

	const [displayGame, setDisplayGame] = useState(false);
	const [inQueue, setInQueue] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);

	let roomData: IRoom;
	let roomId: string;
	let user: User = {id: getUserData().id, username: getUserData().username};

	const joinQueue = () => {
		socket.emit("joinQueue", user);
	}

	const leaveQueue = () => {
		socket.emit("leaveQueue", user);
	}

	useEffect((): any => {
		// connect to socket server
		socket = io("localhost");

		socket.on("connect", () => {
			// Allow reconnection
			socket.emit("handleUserConnect", user);

			socket.on("newRoom", (newRoomData: IRoom) => {
					socket.emit("joinRoom", newRoomData.id);
					roomData = newRoomData;
					roomId = newRoomData.id;
					setRoom(roomData);
			});

			socket.on("joinedQueue", (data: IRoom) => {
				setInQueue(true);
			});

			socket.on("leavedQueue", (data: IRoom) => {
				setInQueue(false);
			});

			socket.on("joinedRoom", (data: IRoom) => {
				setDisplayGame(true);
			});

			socket.on("leaveRoom", (data: IRoom) => {
				setDisplayGame(false);
				setRoom(null);
			});
		});

		return () => {
			if (socket)
				socket.disconnect();
		}
  }, []);

	return (
		<Fragment>
			<Head>
				<title>Hub | ft_transcendance</title>
				<meta
					name="description"
					content="This is the Hub"
				/>
			</Head>
			{
				displayGame ?
						<Canvas socketProps={socket} roomProps={room}></Canvas>
				:
				(
					<>
						<h1>Hello World!</h1>
						{
							inQueue ? 
							<button onClick={leaveQueue} className="px-6 py-2 text-xl uppercase bg-gray-600 drop-shadow-md text-bold text-neutral-200">
								Cancel
							</button>
							:
							<button onClick={joinQueue} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">
								Find a match
							</button>
						}
					</>
				)

			}


		</Fragment>
	);
}

Hub.getLayout = withDashboardLayout;
Hub.isAuthRestricted = true;
export default Hub
