// Constant
export const canvasWidth: number = 1920;
export const canvasHeight: number = 1080;
export const loadingMsg: string[] = ['loading', 'loading.', 'loading..', 'loading...'];
export const countDown: string[] = ['3', '2', '1', 'Go !!!'];

export enum GameState {
	WAITING,
	STARTING,
	PLAYING,
	PAUSED,
	RESUMED,
	GOAL,
	END
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
	// color: string;
}

export interface IRoom {
	roomId: string;
	gameState: GameState;
	playerOne: IPlayer;
	playerTwo: IPlayer;
	ball: IBall;

	timestampStart: number;
	goalTimestamp: number;
	lastGoal: string;
	pauseTime: {pause: number, resume: number}[];

	winner: string;
	loser: string;
}