import { Fragment, useEffect, useState, useContext } from "react";
import { io, Socket } from 'socket.io-client';
import Head from "next/head";
import { NextPageWithLayout } from "./_app";
import { useSession } from "../hooks/use-session";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import chatContext, { ChatContextType } from "../context/chat/chatContext";
import Canvas from "../components/Canvas";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import OngoingGames from "../components/OngoingGames";
import { IRoom, User } from "../gameObjects/GameObject";

let socket: Socket;

const Hub: NextPageWithLayout = () => {
	const { user } = useSession();
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { socket: chatSocket } = useContext(chatContext) as ChatContextType;
	const [displayGame, setDisplayGame] = useState(false);
	const [inQueue, setInQueue] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);
	const [currentGames, setCurrentGames] = useState<Array<string>>(new Array());

	let roomData: IRoom;
	let roomId: string | undefined;
	let userData: User = {id: user.id, username: user.username, ratio: user.ratio};

	const joinQueue = (e: React.MouseEvent<HTMLButtonElement>) => {
		socket.emit("joinQueue", e.currentTarget.value);
	}

	const leaveQueue = () => {
		socket.emit("leaveQueue");
	}

	useEffect((): any => {
		// connect to socket server
		socket = io(process.env.NEXT_PUBLIC_SOCKET_URL + "/game", { transports: ['websocket', 'polling']});

		socket.on("connect", () => {
			// Allow reconnection
			socket.emit("handleUserConnect", userData);

			socket.emit("getCurrentGames");
		});

		socket.on("updateCurrentGames", (newRoomData: Array<string>) => {
			setCurrentGames(newRoomData);
		});

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

		socket.on("joinedRoom", (data: IRoom) => {
			chatSocket.emit("userGameStatus", { isPlaying: true });
			setDisplayGame(true);
			setAlert({
				type: "info",
				content: `Game joined`
			});
		});

		socket.on("leavedRoom", (data: IRoom) => {
			chatSocket.emit("userGameStatus", { isPlaying: false });
			roomId = undefined;
			setDisplayGame(false);
			setRoom(null);
		});


	return () => {
			if (chatSocket) {
				chatSocket.emit("userGameStatus", { isPlaying: false });
			}
			if (socket) {
				socket.disconnect();
			}
		}
	}, []);

	return (
		<Fragment>
			<Head>
				<title>Hub | ft_transcendance</title>
				<meta
					name="Hub"
					content="Play online or watch live games"
				/>
			</Head>
			<div className="text-white">
				<div style={{ maxWidth: "1080px" }} className="px-2 py-10 mx-auto">
				{
					displayGame ?
						<Canvas socketProps={socket} roomProps={room}></Canvas>
					: (<div className="flex flex-col items-center">
							<OngoingGames currentGamesProps={currentGames} socketProps={socket}></OngoingGames>
							{
								inQueue ? 
								<button onClick={leaveQueue} className="px-6 py-2 mx-auto text-xl uppercase bg-gray-600 drop-shadow-md text-bold text-neutral-200">
									Cancel
								</button>
								:
								<div className="flex flex-row">
									<div className="flex flex-col items-center px-6">
										<div>Classic Mode :</div>
										<button onClick={joinQueue} value="default" className="px-6 py-2 mx-auto text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">
											Find a match
										</button>
									</div>
									<div className="flex flex-col items-center px-6">
										<div>Timer Mode :</div>
										<button onClick={joinQueue} value="timer" className="px-6 py-2 mx-auto text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">
											Find a match
										</button>
									</div>
								</div>
							}
						</div>)
				}
				</div>
			</div>
		</Fragment>
		
	);
}

Hub.getLayout = withDashboardLayout;
Hub.authConfig = true;
export default Hub
