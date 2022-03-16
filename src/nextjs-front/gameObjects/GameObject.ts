// Constant
export const canvasWidth: number = 1920;
export const canvasHeight: number = 1080;
export const loadingMsg: string[] = ['loading', 'loading.', 'loading..', 'loading...'];

export enum GameState {
	WAITING,
	INIT,
	STARTING,
	PLAYING,
	PAUSED,
	RESUME,
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
}

export interface IBall {
	x: number;
	y: number;
	r: number;
	defaultRadius: number;
	defaultSpeed: number;
	speed: number;
	maxSpeed: number;
	acceleration: number;
	velocity: {dx: number, dy: number};
}

export interface IRoom {
	id: string;
	gameState: GameState;
	playerOne: IPlayer;
	playerTwo: IPlayer;
	ball: IBall;
	timestampStart: number;
	timestampServer: number;
}