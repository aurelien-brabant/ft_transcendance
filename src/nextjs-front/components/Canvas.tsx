import React, { useState, useContext } from "react";
// import styles from '../styles/Canvas.module.css';
import {Socket} from 'socket.io-client';

import { useRef, useEffect } from 'react';
import styles from "../styles/Canvas.module.css";

// import { animateNeon, drawGame } from "../lib/drawGame";
// import { updateGame, resetGame } from "../lib/updateGame";
// import { GameConstants, GameState, gameConstants } from "../constants/gameConstants"
import { Draw } from "../gameObjects/Draw";
import { canvasHeight, canvasWidth, countDown, GameState, IRoom } from "../gameObjects/GameObject";
import authContext, { AuthContextType } from "../context/auth/authContext"

const Canvas: React.FC<{socketProps: Socket, roomProps: any}> = ({socketProps, roomProps}) => {
	const { getUserData }: any = useContext(authContext) as AuthContextType;
	/*
		Canvas ref and size
	*/
	const canvasRef = useRef<HTMLCanvasElement>(null);

    let socket: Socket = socketProps;
    let room: IRoom = roomProps;
	let roomId: string | undefined = room?.id;

	const [gameEnded, setGameEnded] = useState(false);

	// let start = Date.now();

	let oldTimestamp: number = 0;
	let secondElapsed: number = 0;
	let seconds: number = 0;
	let display: number = 0;

	const leaveRoom = () => {
		socket.emit("leaveRoom", roomId);
	}

	/*
		Handle key controls
	*/
	const downHandler = (event: KeyboardEvent): void => {
		socket.emit("keyDown", {roomId: roomId, key: event.key, username: getUserData().username});
	};

	const upHandler = (event: KeyboardEvent): void => {
		socket.emit("keyUp", {roomId: roomId, key: event.key, username: getUserData().username});
	};

	/*
		Draw Game
	*/
	const drawGame = (canvas: HTMLCanvasElement, draw: Draw, room: IRoom): void => {
		draw.clear();
		draw.drawNet();
		draw.drawPaddle(room.playerOne);
		draw.drawPaddle(room.playerTwo);
		if (room.gameState !== GameState.GOAL && room.gameState !== GameState.END)
			draw.drawBall(room.ball);
		draw.drawScore(room.playerOne, room.playerTwo);
		draw.animateNeon(canvas);
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas)
			return ;
		const context = canvas.getContext('2d');
		let animationFrameId: number;

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;


		const draw: Draw = new Draw(canvas);

		window.addEventListener("keydown", downHandler);
		window.addEventListener("keyup", upHandler);


		socket.on("updateRoom", function(updatedRoom: IRoom) {
			room = updatedRoom;
		});

		const loading = () => {
			seconds += secondElapsed;
			draw.drawLoading(seconds);
		}

		const goal = () => {
			seconds += secondElapsed;
			draw.drawGoal(room, seconds);
		}

		const gameEnd = () => {
			draw.drawGoalParticle(room.ball);
			draw.drawRectangle(0, 0, canvasWidth, canvasHeight, "rgba(0, 0, 0, 0.2)");
			seconds += secondElapsed;
			if (seconds >= 1)
			{
				if (display < 3)
					display++;
				seconds -= 1;
			}
			if (display >= 1)
				draw.drawCenteredText((room.winner + " Won !!!"), canvasWidth/2, ((canvasHeight/2) - (canvasHeight/10)), 45, 'white');
			if (display >= 2)
			{
				draw.drawCenteredText("Match end", canvasWidth/2, ((canvasHeight/2)), 45, 'white');
			}
			setGameEnded(true);
		}

		const gameLoop = (timestamp = 0) => {
			socket.emit("requestUpdate", room?.id);
			secondElapsed = (timestamp - oldTimestamp) / 1000;
			oldTimestamp = timestamp;

			drawGame(canvas, draw, room);
			if (room.gameState === GameState.STARTING) {
				let count: number = (Date.now() - room.timestampStart) / 1000;
				draw.drawRectangle(0, 0, canvasWidth, canvasHeight, "rgba(0, 0, 0, 0.5)");
				draw.drawCountDown(countDown[Math.floor(count)]);

			}
			if (room.gameState === GameState.PLAYING) {
				draw.resetParticles();
			} else if (room?.gameState === GameState.WAITING) {
				// Wait for player to hit enter
				loading();
			} else if (room.gameState === GameState.PAUSED) {
				draw.drawPauseButton();
			} else if (room.gameState === GameState.RESUMED) {
				let count: number = (Date.now() - room.pauseTime[room.pauseTime.length - 1].resume) / 1000;
				draw.drawRectangle(0, 0, canvasWidth, canvasHeight, "rgba(0, 0, 0, 0.5)");
				draw.drawCountDown(countDown[Math.floor(count)]);

			} else if (room.gameState === GameState.GOAL) {
				goal();
			}
			else if (room.gameState === GameState.END) {
				gameEnd();
			}

			animationFrameId = window.requestAnimationFrame(gameLoop);
		}

		gameLoop();

		return () => {
			window.cancelAnimationFrame(animationFrameId);
			window.removeEventListener("keydown", downHandler);
			window.removeEventListener("keyup", upHandler);
		};
	}, []);

	return (
		<>
		{
			room &&
				<div className={styles.container}>
					<canvas ref={canvasRef} className={styles.canvas} ></canvas>
						<div className="flex justify-between pt-5">
							<div className="grid grid-cols-2 justify-items-start">
								<img
									className="rounded-full sm:block"
									height="45px"
									width="45px"
									src={`/api/users/${room.users[0].id}/photo`}
									alt="user's avatar"
								/>
								<div>{room.users[0].username}</div>
							</div>
							<div className="grid grid-cols-2 justify-items-end">
								<div>{room.users[1].username}</div>
								<img
									className="rounded-full sm:block"
									height="45px"
									width="45px"
									src={`/api/users/${room.users[1].id}/photo`}
									alt="user's avatar"
								/>
							</div>
						</div>
					{
						gameEnded &&
						<button onClick={leaveRoom} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">Leave Room</button>
					}
				</div>
		}
		</>
	);
};


export default Canvas;
