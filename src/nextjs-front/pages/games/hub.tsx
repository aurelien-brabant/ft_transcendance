import { Fragment, useEffect, useRef, useState } from "react";
import { io, Socket } from 'socket.io-client';
import Head from "next/head";
import withDashboardLayout from "../../components/hoc/withDashboardLayout";
import Canvas from "../../components/Canvas";

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

type player = {
	id: string;
	x: number;
	y: number;
	goal: number;
	speed: number;
}

type Ball = {
	x: number;
	y: number;
	speed: number;
}

type Room {
    id: string;
    gameState: GameState;
	players: player[];
	ball: Ball;
	timestampStart: number;
	timestampServer: number;
}

const Hub: React.FC = () => {
	const [gameStart, setGameStart] = useState(false);
	const [room, setRoom] = useState<Room>();
	let roomId: string;

	const joinQueue = () => {
		console.log("Joining Queue");
		socket.emit("joinQueue");
	}

	const downHandler = (event: KeyboardEvent): void => {
		console.log(event.key)
		if (event.key === "ArrowUp") {
			socket.emit("Up", roomId);
		}
		if (event.key === "ArrowDown") {
			socket.emit("Down", roomId);
		}
	};


	useEffect((): any => {
		// connect to socket server
		socket = io("localhost");

		socket.on("connect", () => {
			console.log("Socket connected !", socket.id);

			socket.on("addedToQueue", () => {
				console.log("You were added to the queue");
			});

			socket.on("newRoom", function(newRoom: Room) {
					setRoom(newRoom);
					socket.emit("joinRoom", newRoom.id);
					console.log("Trying to join: ", newRoom);
					window.addEventListener("keydown", downHandler);
			});

			socket.on("joinedRoom", (data: Room) => {
				setGameStart(true);
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
				gameStart ?
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
