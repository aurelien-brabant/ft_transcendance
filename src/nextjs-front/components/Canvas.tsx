import React from "react";
// import styles from '../styles/Canvas.module.css';
import {Socket} from 'socket.io-client';

import { useRef, useEffect } from 'react';
import styles from "../styles/Canvas.module.css";

// import { animateNeon, drawGame } from "../lib/drawGame";
// import { updateGame, resetGame } from "../lib/updateGame";
// import { GameConstants, GameState, gameConstants } from "../constants/gameConstants"
import { Draw } from "../gameObjects/Draw";
import { canvasHeight, canvasWidth, GameState, IRoom } from "../gameObjects/GameObject";

const Canvas: React.FC<{socketProps: Socket, roomProps: IRoom}> = ({socketProps, roomProps}) => {

	/*
		Canvas ref and size
	*/
	const canvasRef = useRef<HTMLCanvasElement>();

    let socket: Socket = socketProps;
    let room: IRoom = roomProps;
	let roomId: string | undefined = room?.id;
    /*
		Game initialisation
		Game Object
	*/

	// let start = Date.now();

	let oldTimestamp: number = 0;
	let secondElapsed: number = 0;
	let seconds: number = 0;
	// let display = 0;	

	/*
		Handle key controls
	*/

	const downHandler = (event: KeyboardEvent): void => {
		socket.emit("keyDown", {roomId: roomId, key: event.key});
	};

	const upHandler = (event: KeyboardEvent): void => {
		socket.emit("keyUp", {roomId: roomId, key: event.key});
	};

	/*
		Draw Game
	*/
	const drawGame = (canvas: HTMLCanvasElement, draw: Draw, room: IRoom): void => {
		draw.clear();
		draw.drawNet();
		draw.drawPaddle(room.playerOne);
		draw.drawPaddle(room.playerTwo);
		if (room.gameState !== GameState.GOAL)
			draw.drawBall(room.ball);
		draw.drawScore(room.playerOne, room.playerTwo);
		draw.animateNeon(canvas);
	}

	useEffect(() => {
		const canvas = canvasRef.current;
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

		// const gameEnd = () => {
		// 	draw.drawGoalParticle(ball);
		// 	draw.drawRectangle(0, 0, gameConstants.canvasWidth, gameConstants.canvasHeight, "rgba(0, 0, 0, 0.2)");
		// 	seconds += secondElapsed;
		// 	if (seconds >= 1)
		// 	{
		// 		if (display < 3)
		// 			display++;
		// 		seconds -= 1;
		// 	}
		// 	if (display >= 1 && score.p1_Score >= 3)
		// 		draw.drawCenteredText((player1.name + " Won !!!"), gameConstants.canvasWidth/2, ((gameConstants.canvasHeight/2) - (gameConstants.canvasHeight/10)), 45, 'white');
		// 	else if (display >= 1 && score.p2_Score >= 3)
		// 		draw.drawCenteredText((player2.name + " Won !!!"), gameConstants.canvasWidth/2, ((gameConstants.canvasHeight/2) - (gameConstants.canvasHeight/10)), 45, 'white');
		// 	if (display >= 2)
		// 	{
		// 		draw.drawCenteredText("Match end", gameConstants.canvasWidth/2, ((gameConstants.canvasHeight/2)), 45, 'white');

		// 	}

		// }

		const gameLoop = (timestamp = 0) => {
			socket.emit("requestUpdate", room?.id);
			secondElapsed = (timestamp - oldTimestamp) / 1000;
			oldTimestamp = timestamp;

			drawGame(canvas, draw, room);
			if (room.gameState === GameState.PLAYING) {
				draw.resetParticles();
			} else if (room?.gameState === GameState.WAITING) {
				// Wait for player to hit enter
				loading();
			} else if (room.gameState === GameState.PAUSED) {
				console.log("test");
				
				draw.drawPauseButton();
			} else if (room.gameState === GameState.GOAL) {
				goal();
			}
			// else if (roomState === GameState.END) {
			// 	gameEnd();
			// }

			animationFrameId = window.requestAnimationFrame(gameLoop);
		}

		gameLoop();

		return () => {
			console.log("Unmount");
			window.cancelAnimationFrame(animationFrameId);
			window.removeEventListener("keydown", downHandler);
			window.removeEventListener("keyup", upHandler);
		};
	}, []);

	return (
		<>
		{
			room ? (
				<div className={styles.container}>
					<canvas ref={canvasRef} className={styles.canvas} ></canvas>
				</div>
			) : (
				<div> Room is undefined </div>
			)
		}
		</>
	);
};


export default Canvas;
