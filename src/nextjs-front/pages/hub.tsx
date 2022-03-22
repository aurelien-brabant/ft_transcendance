import { Fragment, useEffect, useState, useContext } from "react";
import { io, Socket } from 'socket.io-client';
import Head from "next/head";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import Canvas from "../components/Canvas";
import { GameState, IRoom } from "../gameObjects/GameObject";
import authContext, { AuthContextType } from "../context/auth/authContext"
import { NextPageWithLayout } from "./_app";

let socket: Socket;

const Hub: NextPageWithLayout = () => {
	const { getUserData } = useContext(authContext) as AuthContextType;	
	let lastRoom: IRoom;

	const [displayGame, setDisplayGame] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);
	let roomId: string;


	const joinQueue = () => {
		socket.emit("joinQueue");
	}

	// const refreshCurrentGames = () => {
	// 	socket.emit("refreshCurrentGames");
	// }

	useEffect((): any => {
		// connect to socket server
		socket = io("localhost");

		socket.on("connect", () => {
			socket.on("newRoom", function(newRoom: IRoom) {
					socket.emit("joinRoom", newRoom.id);
					lastRoom = newRoom;
					roomId = newRoom.id;
					setRoom(newRoom);
			});

			socket.on("joinedRoom", (data: IRoom) => {
				setDisplayGame(true);
			});

			socket.on("leaveRoom", (data: IRoom) => {
				setDisplayGame(false);
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
						{/* <button onClick={refreshCurrentGames} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">Refresh</button> */}
						<button onClick={joinQueue} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">Find a match</button>
					</>
				)

			}


		</Fragment>
	);
}

Hub.getLayout = withDashboardLayout;
Hub.isAuthRestricted = true;
export default Hub
