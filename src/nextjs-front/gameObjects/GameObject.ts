import { PlayerGoal } from "./Draw";

export enum GameState {
	QUEUE,
	INIT,
	STARTING,
	PLAYING,
	PAUSED,
	RESUME,
	GOAL,
	END
}

export type Player = {
	id: string;
	x: number;
	y: number;
	goal: number;
	speed: number;
}

export type Ball = {
	x: number;
	y: number;
	speed: number;
}

export type Room = {
	id: string;
    gameState: GameState;
	players: Player[];
	ball: Ball;
	timestampStart: number;
	timestampServer: number;
}

export type GameConstants = {
	canvasWidth: number;
	canvasHeight: number;
	roomState: GameState;
	loading: string[];
	playersGoal: PlayerGoal;

	start: number;
}

export const gameConstants: GameConstants = {
	canvasWidth: 1920,
	canvasHeight: 1080,
	roomState: GameState.QUEUE,
	loading: ["Loading", "Loading.", "Loading..", "Loading..."],
	playersGoal: { p1: false, p2: false },

	start: Date.now()
}