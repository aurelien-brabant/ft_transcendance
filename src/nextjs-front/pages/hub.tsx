import { Fragment, useEffect, useState, useContext, FunctionComponent } from "react";
import { io, Socket } from 'socket.io-client';
import Head from "next/head";
import { NextPageWithLayout } from "./_app";
import { useSession } from "../hooks/use-session";
import alertContext, { AlertContextType } from "../context/alert/alertContext";
import chatContext, { ChatContextType } from "../context/chat/chatContext";
import Canvas from "../components/Canvas";
import withDashboardLayout from "../components/hoc/withDashboardLayout";
import OngoingGames from "../components/OngoingGames";
import { GameState, IRoom, User } from "../gameObjects/GameObject";
import { SimpleSpinner } from "../components/simple-spinner";

let socket: Socket;

export type onGoingGame = {
	roomId: string;
	playerOne: string;
	playerTwo: string;
};

const Hub: NextPageWithLayout = () => {
	const { user } = useSession();
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { socket: chatSocket } = useContext(chatContext) as ChatContextType;
	const [displayGame, setDisplayGame] = useState(false);
	const [inQueue, setInQueue] = useState(false);
	const [room, setRoom] = useState<IRoom | null>(null);
	const [currentGames, setCurrentGames] = useState<onGoingGame[]>([]);

	let roomData: IRoom;
	let roomId: string | undefined;
	let userData: User = {id: user.id, username: user.username, ratio: user.ratio};

	const joinQueue = (e: React.MouseEvent<HTMLButtonElement>) => {
		socket.emit("joinQueue", e.currentTarget.value);
	}

	const leaveQueue = () => {
		socket.emit("leaveQueue");
	}

	const updateCurrentGames = (currentGamesData: IRoom[]) => {
		const games: onGoingGame[] = [];

		for (const game of currentGamesData) {
			games.push({
				roomId: game.roomId,
				playerOne: game.playerOne.user.username,
				playerTwo: game.playerTwo.user.username,
			});
		}
		setCurrentGames(games);
	};

	useEffect((): any => {
		// connect to socket server
		socket = io(process.env.NEXT_PUBLIC_SOCKET_URL + "/game", { transports: ['websocket', 'polling']});

		socket.on("connect", () => {
			// Allow reconnection
			socket.emit("handleUserConnect", userData);

			socket.emit("getCurrentGames");
		});

		socket.on("updateCurrentGames", (currentGamesData: IRoom[]) => {
			updateCurrentGames(currentGamesData);
		}); 

		socket.on("newRoom", (newRoomData: IRoom) => {
			if (newRoomData.gameState === GameState.WAITING && user.id != newRoomData.playerOne.user.id) {
				return ;
			}
			socket.emit("joinRoom", newRoomData.roomId);
			roomData = newRoomData;
			roomId = newRoomData.roomId;
			setRoom(roomData);
			setInQueue(false);
		});

		socket.on("joinedQueue", () => {
			setInQueue(true);
		});

		socket.on("leavedQueue", () => {
			setInQueue(false);
		});

		socket.on("joinedRoom", () => {
			if (chatSocket) {
				chatSocket.emit("userGameStatus", { isPlaying: true });
			}
			setDisplayGame(true);
			setAlert({
				type: "info",
				content: `Game joined`
			});
		});

		socket.on("leavedRoom", () => {
			if (chatSocket) {
				chatSocket.emit("userGameStatus", { isPlaying: false });
			}
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
			<div className="text-white max-w-5xl mx-auto">
				<div className="px-2 py-10 mx-auto">
				{
					displayGame ?
						<Canvas socketProps={socket} roomProps={room}></Canvas>
					: (
					<>
						<div className="flex flex-row items-center  justify-center gap-x-4">
						{
							inQueue ? 
								<button
									onClick={leaveQueue}
									value={'default'}
									type="button"
									className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
								>
									<SimpleSpinner className={'w-5 h-5 mr-3'} /> Leave Queue
								</button>

								:
								<>
									<button
										onClick={joinQueue}
										value={'default'}
										type="button"
										className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
									>
										Classic Mode
									</button>
										<button
										onClick={joinQueue}
										value={'timer'}
										type="button"
										className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
									>
										Timer Mode
									</button>
								</>
							
						}
						</div>

						<OngoingGames currentGamesProps={currentGames} socketProps={socket}></OngoingGames>
					</>)
				}
				</div>
			</div>
		</Fragment>
		
	);
}

Hub.getLayout = withDashboardLayout;
Hub.authConfig = true;
export default Hub
