// Constant
export const canvasWidth: number = 1920;
export const canvasHeight: number = 1080;
export const countDown: string[] = ['3', '2', '1', 'Go !!!'];

export enum GameState {
	WAITING,
	STARTING,
	PLAYING,
	PAUSED,
	RESUMED,
	PLAYERONESCORED,
	PLAYERTWOSCORED,
	PLAYERONEWIN,
	PLAYERTWOWIN,
}

export enum GameMode {
	DEFAULT,
	TIMER,
	LIFE
}

export type User = {
	id: number;
	username: string;
	ratio?: number;
}

export interface IPlayer {
	user: User;
	x: number;
	y: number;
	width: number;
	height: number
	goal: number;
	color: string;
}

export interface IBall {
	x: number;
	y: number;
	r: number;
	color: string;
}

export interface IRoom {
	roomId: string;
	gameState: GameState;
	playerOne: IPlayer;
	playerTwo: IPlayer;
	ball: IBall;

	timestampStart: number;
	goalTimestamp: number;
	pauseTime: {pause: number, resume: number}[];

	winner: string;
	loser: string;

	mode: GameMode;

	timer: number;
	gameDuration: number;
}