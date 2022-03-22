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
	GOAL,
	END
}

export interface IPlayer {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number
	speed: number;
	goal: number;
	color: string;
}

export interface IBall {
	x: number;
	y: number;
	r: number;
	defaultRadius: number;
	speed: number;
	maxSpeed: number;
	acceleration: number;
	velocity: {dx: number, dy: number};
	goal: boolean;
}

export interface IRoom {
	id: string;
	gameState: GameState;
	playerOne: IPlayer;
	playerTwo: IPlayer;
	ball: IBall;
	timestampStart: number;
	lastUpdate: number;
	goalTimestamp: number;
	lastGoal: string;

	winner: string;
	loser: string;
}