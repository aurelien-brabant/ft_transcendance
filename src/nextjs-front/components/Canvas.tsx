import React from "react";
// import styles from '../styles/Canvas.module.css';
import {Socket} from 'socket.io-client';

import { useState, useRef, useEffect } from 'react';
import styles from "../styles/Canvas.module.css";

// import { animateNeon, drawGame } from "../lib/drawGame";
// import { updateGame, resetGame } from "../lib/updateGame";
// import { GameConstants, GameState, gameConstants } from "../constants/gameConstants"
import { Draw } from "../gameObjects";
import { canvasHeight, canvasWidth, GameState, IRoom, loadingMsg } from "../gameObjects/GameObject";

const Canvas: React.FC<{socketProps: Socket, roomProps: IRoom | null}> = ({socketProps, roomProps}) => {

	/*
		Canvas ref and size
	*/
	const canvasRef = useRef<HTMLCanvasElement>();

    let socket: Socket = socketProps;
    let room: IRoom | null = roomProps;
	let roomId: string = room.id;
    /*
		Game initialisation
		Game Object
	*/

	// let start = Date.now();

	let oldTimestamp = 0;
	let secondElapsed = 0;
	let seconds = 0;
	let dot = 0;
	// let display = 0;

	// console.log(room);
	
	// const net: Net = new Net(20, 50, canvasWidth, canvasHeight);
	// const player1 = new Player(room.playerOne.id, canvasWidth, canvasHeight, 10, 540, 30, 200, 'rgba(255, 255, 255, 0.8)');
	// const player2 = new Player(room.playerTwo.id, canvasWidth, canvasHeight, (canvasWidth-40), 540, 30, 200, 'rgba(255, 255, 255, 0.8)');

	// const ball = new Ball(canvasWidth, canvasHeight, 25, 800, (canvasWidth/4) * 3, 50, player1, player2);
	// const score = new Score(canvasWidth, canvasHeight);


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
		draw.drawBall(room.ball);
		// draw.drawScore(score)
		draw.animateNeon(canvas);
	}

	// useEffect(() => {

	// }, []);

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

		const gameRunning = () => {
			socket.emit("requestUpdate", room.id);
		}

		const loading = () => {
			draw.drawLoading(loadingMsg[dot]);
			if (seconds >= 1)
			{
				dot = (dot+1) % loadingMsg.length;
				seconds = 0;
			}
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
			secondElapsed = (timestamp - oldTimestamp) / 1000;
			oldTimestamp = timestamp;

			drawGame(canvas, draw, room);
			if (room.gameState === GameState.WAITING) {
				seconds += secondElapsed;
				loading();
			} else if (room.gameState === GameState.PLAYING || room.gameState === GameState.PAUSED) {
				if (room.gameState == GameState.PLAYING)
					gameRunning();
				if (room.gameState === GameState.PAUSED){
					draw.drawPauseButton();
				}
			}
			//  else if (roomState === GameState.RESUME) {
			// 	oldTimestamp = Date.now();
			// 	roomState = GameState.PLAYING;
			// }
			// else if (roomState === GameState.STARTING || roomState === GameState.GOAL) {
			// 	if (roomState === GameState.GOAL && (score.p1_Score >= nbGoal || score.p2_Score >= nbGoal)) {
			// 		roomState = GameState.END;
			// 	}
			// 	else {
			// 		seconds += secondElapsed;
			// 		if (seconds >= 3.5)
			// 		{
			// 			seconds = 0;
			// 			draw.resetParticles();
			// 			resetGame(ball, player1, player2);
			// 			roomState = GameState.PLAYING;
			// 		}
			// 		draw.drawRectangle(0, 0, gameConstants.canvasWidth, gameConstants.canvasHeight, "rgba(0, 0, 0, 0.5)");
			// 		if (roomState === GameState.GOAL)
			// 			draw.drawGoal(ball, gameConstants.playerGoal, player1, player2);
			// 		draw.drawCountDown(Math.ceil(3 - seconds));
			// 	}
			// } else if (roomState === GameState.END) {
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
