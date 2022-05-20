import React, { useState } from "react";
import { Socket } from 'socket.io-client';

import { useRef, useEffect } from 'react';
import styles from "../styles/Canvas.module.css";

import { Draw } from "../gameObjects/Draw";
import { canvasHeight, canvasWidth, countDown, GameMode, GameState, IRoom } from "../gameObjects/GameObject";
import { useSession } from "../hooks/use-session";

const Canvas: React.FC<{socketProps: Socket, roomProps: any}> = ({socketProps, roomProps}) => {
	const { user } = useSession();
	const canvasRef = useRef<HTMLCanvasElement>(null);

    let socket: Socket = socketProps;
    let room: IRoom = roomProps;
	let roomId: string | undefined = room?.roomId;
	const [gameEnded, setGameEnded] = useState(false);

	let isAplayer: boolean = (room.playerOne.user.username == user.username || room.playerTwo.user.username == user.username);
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
		socket.emit("keyDown", {roomId: roomId, key: event.key, username: user.username});
	};

	const upHandler = (event: KeyboardEvent): void => {
		socket.emit("keyUp", {roomId: roomId, key: event.key, username: user.username});
	};

	/*
		Draw Game
	*/
	const drawGame = (canvas: HTMLCanvasElement, draw: Draw, room: IRoom): void => {
		draw.clear();
		
		if (room.mode === GameMode.TIMER)
			draw.drawTimer(room);
		draw.drawNet();
		draw.drawScore(room.playerOne, room.playerTwo);
		draw.drawPaddle(room.playerOne);
		draw.drawPaddle(room.playerTwo);
		if (room.gameState !== GameState.PLAYERONESCORED && room.gameState !== GameState.PLAYERTWOSCORED && room.gameState !== GameState.END)
			draw.drawBall(room.ball);
		draw.animateNeon(canvas);
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas)
			return ;
		// const context = canvas.getContext('2d');
		let animationFrameId: number;

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;


		const draw: Draw = new Draw(canvas);

		// if not a spectator
		if (isAplayer) {
				window.addEventListener("keydown", downHandler);
				window.addEventListener("keyup", upHandler);
		}

		socket.on("updateRoom", function(updatedRoom: string) {
			room = JSON.parse(updatedRoom);
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
			draw.drawRectangle(0, 0, canvasWidth, canvasHeight, "rgba(0, 0, 0, 0.4)");
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
			if (room.gameState !== GameState.END && isAplayer) {
					socket.emit("requestUpdate", roomId);
			}
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
				draw.drawPauseButton(room);
			} else if (room.gameState === GameState.RESUMED) {
				let count: number = (Date.now() - room.pauseTime[room.pauseTime.length - 1].resume) / 1000;
				draw.drawRectangle(0, 0, canvasWidth, canvasHeight, "rgba(0, 0, 0, 0.5)");
				draw.drawCountDown(countDown[Math.floor(count)]);

			} else if (room.gameState === GameState.PLAYERONESCORED || room.gameState === GameState.PLAYERTWOSCORED) {
				goal();
			} else if (room.gameState === GameState.END) {
				gameEnd();
			}

			animationFrameId = window.requestAnimationFrame(gameLoop);
		}

		gameLoop();

		return () => {
			window.cancelAnimationFrame(animationFrameId);
			if (isAplayer) {
				window.removeEventListener("keydown", downHandler);
				window.removeEventListener("keyup", upHandler);
			}
		};
	}, []);

	return (
		<>		
		{
			room &&
				<div className="flex flex-col items-center gap-y-10">	
					<canvas ref={canvasRef} className={styles.canvas} ></canvas>
						<div className="flex justify-between w-full">
							<div className="flex gap-x-5 items-center">
								<img
									className="rounded-full sm:block"
									height="45px"
									width="45px"
									src={`/api/users/${room.playerOne.user.id}/photo`}
									alt="user's avatar"
								/>
								<div>{room.playerOne.user.username}</div>
							</div>
							<div className="flex gap-x-5 items-center">
								<div>{room.playerTwo.user.username}</div>
								<img
									className="rounded-full sm:block"
									height="45px"
									width="45px"
									src={`/api/users/${room.playerTwo.user.id}/photo`}
									alt="user's avatar"
								/>
							</div>
						</div>
						{
							(gameEnded || !isAplayer) &&
							<button onClick={leaveRoom} className="px-6 py-2 text-xl uppercase bg-pink-600 drop-shadow-md text-bold text-neutral-200">Leave Room</button>
						}
				</div>
		}
		</>
	);
};


export default Canvas;
