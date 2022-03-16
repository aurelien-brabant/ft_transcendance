import { Fragment, useEffect, useRef, useState } from "react";
import { io, Socket } from 'socket.io-client';
import Head from "next/head";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";
import Canvas from "../../components/Canvas";
import { IRoom } from "../../gameObjects/GameObject";

let socket: Socket;
// const Hub: NextPageWithLayout = () => {

enum GameState {
	QUEUE,
	INIT,
	STARTING,
	PLAYING,
	PAUSED,
	RESUME,
	GOAL,
	END
}

const Hub: React.FC = () => {
	let lastRoom: IRoom;

	const [displayGame, setDisplayGame] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);
	let roomId: string;


	const joinQueue = () => {
		console.log("Joining Queue");
		socket.emit("joinQueue");
	}

	useEffect((): any => {
		// connect to socket server
		socket = io("localhost");

		socket.on("connect", () => {
			console.log("Socket connected !", socket.id);

			socket.on("addedToQueue", () => {
				console.log("You were added to the queue");
			});

			socket.on("newRoom", function(newRoom: IRoom) {
					socket.emit("joinRoom", newRoom.id);
					lastRoom = newRoom;
					roomId = newRoom.id;
					setRoom(newRoom);
					// window.addEventListener("keydown", downHandler);
			});

			// socket.on("updateRoom", function(updatedRoom: IRoom) {
			// 	console.log("Update");
			// 	lastRoom = updatedRoom;
			// 	setRoom(lastRoom);
			// });

			socket.on("joinedRoom", (data: IRoom) => {
				setDisplayGame(true);
			});
		});

		// socket disconnect onUnmount if exists
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
				(
					<Canvas socketProps={socket} roomProps={room}></Canvas>
				)
				:
				(
					<>
						<h1>Hello World!</h1>
						<button onClick={joinQueue}>Find a match</button>
					</>
				)
			}


		</Fragment>
	);
}

// Hub.getLayout = withDashboardLayout;
export default Hub
