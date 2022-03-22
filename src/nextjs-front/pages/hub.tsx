import { Fragment, useEffect, useState, useContext } from "react";
import { io, Socket } from 'socket.io-client';
import Head from "next/head";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import Canvas from "../components/Canvas";
import { IRoom, User } from "../gameObjects/GameObject";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import { NextPageWithLayout } from "./_app";
import { useSession } from "../hooks/use-session";
// import socketContext, { SocketContextType } from "../context/socket/socketContext";

let socket: Socket;

const Hub: NextPageWithLayout = () => {
	const { user } = useSession();
	const { setAlert } = useContext(alertContext) as AlertContextType;
	// const { socket } = useContext(socketContext) as SocketContextType;
	const [displayGame, setDisplayGame] = useState(false);
	const [inQueue, setInQueue] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);

	let roomData: IRoom;
	let roomId: string | undefined;
	let userData: User = {id: user.id, username: user.username};

	const joinQueue = () => {
		socket.emit("joinQueue", userData.username);
	}

	const leaveQueue = () => {
		socket.emit("leaveQueue");
	}

	const spectate = () => {
		socket.emit("spectateRoom", "funny_test212&ancient_test211");
	}

	useEffect((): any => {
		// connect to socket server
		socket = io("localhost:8080");

		socket.on("connect", () => {
			// Allow reconnection
			socket.emit("handleUserConnect", userData);

			socket.on("newRoom", (newRoomData: IRoom) => {
					socket.emit("joinRoom", newRoomData.roomId);
					roomData = newRoomData;
					roomId = newRoomData.roomId;
					setRoom(roomData);
					setInQueue(false);
			});

			socket.on("joinedQueue", (data: IRoom) => {
				setInQueue(true);
				setAlert({
					type: "info",
					content: "You were added to Queue"
				});
			});

			socket.on("leavedQueue", (data: IRoom) => {
				setInQueue(false);
				setAlert({
					type: "info",
					content: "You were removed from Queue"
				});	
			});

			socket.on("joinedQueue", (data: IRoom) => {
				setInQueue(true);
			});

			socket.on("leavedQueue", (data: IRoom) => {
				setInQueue(false);
			});

			socket.on("joinedRoom", (data: IRoom) => {
				setDisplayGame(true);
				setAlert({
					type: "info",
					content: `Game joined`
				});
			});

			socket.on("leavedRoom", (data: IRoom) => {
				roomId = undefined;
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
							<button onClick={leaveQueue} className="px-6 py-2 text-xl uppercase bg-grey-600 drop-shadow-md text-bold text-neutral-200">Cancel</button>
						:
							<button onClick={joinQueue} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">Find a match</button>
						}
					</>
				)

			}


		</Fragment>
	);
}

Hub.getLayout = withDashboardLayout;
Hub.authConfig = true;
export default Hub
