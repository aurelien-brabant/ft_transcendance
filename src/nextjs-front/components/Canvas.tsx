import React from "react";
// import styles from '../styles/Canvas.module.css';
import {Socket} from 'socket.io-client';

import { useState, useRef, useEffect } from 'react';
import styles from "../styles/Canvas.module.css";

// import { animateNeon, drawGame } from "../lib/drawGame";
// import { updateGame, resetGame } from "../lib/updateGame";
// import { GameConstants, GameState, gameConstants } from "../constants/gameConstants"
import { Draw, Player, Ball, Net, Score, Room } from "../gameObjects";
import { gameConstants } from "../gameObjects/GameObject";

const Canvas: React.FC<{socketProps: Socket, roomProps: Room | null}> = ({socketProps, roomProps}) => {

	/*
		Canvas ref and size
	*/
	const canvasRef = useRef<HTMLCanvasElement>();

    let socket: Socket = socketProps;
    let room: Room | null = roomProps;

    /*
		Game initialisation
		Game Object
	*/

	// let start = Date.now();

	// let oldTimestamp = 0;
	// let secondElapsed = 0;
	// let dot = 0;
	// let display = 0;
	// let seconds = 0;

	// const net = new Net(20, 50, gameConstants.canvasWidth, gameConstants.canvasHeight);
	// const player1 = new Player(players.p1, gameConstants.canvasWidth, gameConstants.canvasHeight, 10, 540, 30, 200, 'rgba(255, 255, 255, 0.8)');
	// const player2 = new Player(players.p2, gameConstants.canvasWidth, gameConstants.canvasHeight, (gameConstants.canvasWidth-40), 540, 30, 200, 'rgba(255, 255, 255, 0.8)');
	// const ball = new Ball(gameConstants.canvasWidth, gameConstants.canvasHeight, 25, 800, (gameConstants.canvasWidth/4) * 3, 50, player1, player2);
	// const score = new Score(gameConstants.canvasWidth, gameConstants.canvasHeight);


	/*
		Handle key controls
	*/

	// const downHandler = (event: KeyboardEvent): void => {
	// 	console.log(event.key)
	// 	if (event.key === "ArrowUp") {
	// 		socket.emit("Up", roomId);
	// 	}
	// 	if (event.key === "ArrowDown") {
	// 		socket.emit("Down", roomId);
	// 	}
	// };

	useEffect(() => {
		// Initialize Everything

		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');
		let animationFrameId: number;

		canvas.width = 1920;
		canvas.height = 1080;

		context.save();
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.restore();

		const draw = new Draw(canvas);

		// window.addEventListener("keydown", downHandler);

		// const gameRunning = () => {
		// 	ball.update(score, gameConstants, secondElapsed);
		// 	if (gameConstants.playerGoal.p1 || gameConstants.playerGoal.p2)
		// 		roomState = GameState.GOAL;
		// 	player1.update(keyUp, keyDown, secondElapsed);
		// 	player2.update(keyUp, keyDown, secondElapsed);
		// }

		// const loading = () => {
		// 	draw.drawLoading(gameConstants.loading[dot]);
		// 	if (seconds >= 1)
		// 	{
		// 		dot = (dot+1) % gameConstants.loading.length;
		// 		seconds = 0;
		// 	}
		// }

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
			// secondElapsed = (timestamp - oldTimestamp) / 1000;
			// oldTimestamp = timestamp;

			// drawGame(canvas, draw, net, player1, player2, ball, score);
			// draw.drawText("FPS: " + Math.round(1/secondElapsed), (gameConstants.canvasWidth - 150), 45, 45, "white");
			/* Maybe use a switch and rename the roomState properly */
			// if (roomState === GameState.INIT) {
			// 	score.p1_Score = 0;
			// 	score.p2_Score = 0;
			// 	roomState = GameState.STARTING;
			// }

			// if (roomState === GameState.PLAYING || roomState === GameState.PAUSED) {
			// 	if (roomState == GameState.PLAYING)
			// 		gameRunning();
			// 	if (roomState === GameState.PAUSED){
			// 		draw.drawPauseButton();
			// 	}
			// } else if (roomState === GameState.RESUME) {
			// 	oldTimestamp = Date.now();
			// 	roomState = GameState.PLAYING;
			// } else if (roomState === GameState.STARTING || roomState === GameState.GOAL) {
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
			// } else if (roomState === GameState.QUEUE) {
			// 	seconds += secondElapsed;
			// 	// seconds += secondElapsed;
			// 	loading();
			// } else if (roomState === GameState.END) {
			// 	gameEnd();
			// }
			socket.emit("requestUpdate", room.id);
			animationFrameId = window.requestAnimationFrame(gameLoop);
		}

		gameLoop();

		return () => {
			console.log("Unmount");
			window.cancelAnimationFrame(animationFrameId);
			// window.removeEventListener("keydown", downHandler);
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
