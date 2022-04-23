// Constant
export const canvasWidth: number = 1920;
export const canvasHeight: number = 1080;
export const timing: number = 15;

// Players Constant
export const playerSpeed = 550;
export const playerWidth = 30;
export const playerHeight = 200;

// Ball Constant
export const ballDefaultRadius = 25;
export const ballDefaultSpeed = 500;
export const ballMaxSpeed = 1500;
export const ballAcceleration = 50;

export enum GameState {
	WAITING,
	STARTING,
	PLAYING,
	PAUSED,
	RESUMED,
	GOAL,
	END
}

export enum userStatus {
	// DISCONNECTED,
	ONLINE,
	INHUB,
	INQUEUE,
	SPECTATING,
	PLAYING
}
