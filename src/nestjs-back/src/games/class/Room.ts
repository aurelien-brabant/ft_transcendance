import { Ball } from "./Ball";
import { User } from "./ConnectedUsers";
import { canvasWidth, GameMode, GameState } from "./Constants";
import { Player } from "./Player";

export interface IRoom {
	roomId: string;
	gameState: GameState;
	players: User[];
	playerOne: Player;
	playerTwo: Player;
	ball: Ball;

	// Game timestamps
	timestampStart: number;
	lastUpdate: number;
	goalTimestamp: number;
	pauseTime: {pause: number, resume: number}[];

	// settings customisation
	maxGoal: number;

	timer: number;
	gameDuration: number;
}

export type SerializeRoom = {
	roomId: string;
	gameState: GameState;

	playerOne: {
		user: {
			id: number;
			username: string;
		}
		width: number;
		height: number;
		x: number;
		y: number;
		color: string;
		goal: number;
	};

	playerTwo: {
		user: {
			id: number;
			username: string;
		}
		width: number;
		height: number;
		x: number;
		y: number;
		color: string;
		goal: number;
	};

	ball: {
		x: number;
		y: number;
		r: number;
		color: string;
	},

	timestampStart: number;
	goalTimestamp: number;
	pauseTime: {
		pause: number;
		resume: number;
	}[],
	mode: number;
	timer: number;
	gameDuration: number;
};

export default class Room implements IRoom {
	roomId: string;
	gameState: GameState;
	players: User[];
	playerOne: Player;
	playerTwo: Player;
	ball: Ball;

	timestampStart: number;
	lastUpdate: number;
	goalTimestamp: number;
	pauseTime: {pause: number, resume: number}[];

	isGameEnd: boolean;

	// settings customisation
	maxGoal: number;
	mode: GameMode;
	timer: number;
	gameDuration: number;

	constructor(
		roomId: string,
		users: User[],
		customisation: { mode?: GameMode } = { mode: GameMode.DEFAULT }
	) {
	this.roomId = roomId;
	this.gameState = GameState.STARTING;
	this.players = [];
	this.playerOne = new Player(users[0], 10);
	this.playerTwo = new Player(users[1], canvasWidth-40);
	this.ball = new Ball();

	this.timestampStart = Date.now();
	this.lastUpdate = Date.now();
	this.goalTimestamp = Date.now();
	this.pauseTime = [];

	this.mode = customisation.mode;
	this.maxGoal = 11;

	this.isGameEnd = false;

	this.timer = 0;
	this.gameDuration = 60000 * 5; // 1min * num of minutes
	}

	isAPlayer(user: User): boolean {
		return (this.playerOne.user.username === user.username || this.playerTwo.user.username === user.username);
	}

	addUser(user: User) {
		this.players.push(user);
	}

	removeUser(userRm: User) {
		const userIndex: number = this.players.findIndex(user => user.username === userRm.username);
		if (userIndex !== -1)
			this.players.splice(userIndex, 1);
	}

	getDuration(): number {
		let duration: number = Date.now() - this.timestampStart;

		this.pauseTime.forEach((pause) => {
			duration -= (pause.pause - pause.resume) - 3500;
		});
		return duration;
	}

	changeGameState(newGameState: GameState): void {
		this.gameState = newGameState;
	}

	start(): void {
		this.timestampStart = Date.now();
		this.lastUpdate = Date.now();
		this.changeGameState(GameState.PLAYING);
	}

	pause(): void {
		this.changeGameState(GameState.PAUSED);
		this.pauseTime.push({pause: Date.now(), resume: Date.now()});
	}

	resume(): void {
		this.changeGameState(GameState.RESUMED);
		this.pauseTime[this.pauseTime.length - 1].resume = Date.now();
	}

	resetPosition(): void {
		this.playerOne.reset();
		this.playerTwo.reset();
		this.ball.reset();
	}

	updateTimer() {
		let time: number = ((Date.now() - this.timestampStart));
		this.pauseTime.forEach((pause) => {
			time += (pause.pause - pause.resume) - 3500;
		});
		this.timer = time;
	}

	checkGoal() {
		if (this.ball.goal === true) {
			this.goalTimestamp = this.lastUpdate;
			if (this.mode === GameMode.DEFAULT && (this.playerOne.goal === this.maxGoal || this.playerTwo.goal === this.maxGoal))
			{
				if (this.playerOne.goal === this.maxGoal)
					this.changeGameState(GameState.PLAYERONEWIN);
				else if (this.playerTwo.goal === this.maxGoal)
					this.changeGameState(GameState.PLAYERTWOWIN);
				this.isGameEnd = true;
			}
			else
			{
				if (this.ball.x < canvasWidth/2)
					this.changeGameState(GameState.PLAYERTWOSCORED);
				else
					this.changeGameState(GameState.PLAYERONESCORED);
			}
			this.ball.goal = false;
		}

		if (this.mode === GameMode.TIMER && (this.playerOne.goal !== this.playerTwo.goal) && this.timer >= this.gameDuration) {
			if (this.playerOne.goal > this.playerTwo.goal)
				this.changeGameState(GameState.PLAYERONEWIN);
			else
				this.changeGameState(GameState.PLAYERTWOWIN);
			this.isGameEnd = true;
		}
	}

	update(currentTimestamp: number): void {
		let secondPassed: number = (currentTimestamp - this.lastUpdate) / 1000;
		this.lastUpdate = currentTimestamp;

		this.playerOne.update(secondPassed);
		this.playerTwo.update(secondPassed);
		this.ball.update(secondPassed, this.playerOne, this.playerTwo);
		this.checkGoal();
	}

	pauseForfait() {
		if (this.players[0].id === this.playerOne.user.id)
			this.changeGameState(GameState.PLAYERONEWIN);
		else
			this.changeGameState(GameState.PLAYERTWOWIN);
	}

	serialize(): SerializeRoom { // send the littlest amount of data
		const newSerializeRoom: SerializeRoom = {
			roomId: this.roomId,
			gameState: this.gameState,
			playerOne: {
				user: {
					id: this.playerOne.user.id,
					username: this.playerOne.user.username,
				},
				width: this.playerOne.width,
				height: this.playerOne.height,
				x: this.playerOne.x,
				y: this.playerOne.y,
				color: this.playerOne.color,
				goal: this.playerOne.goal,
			},
			playerTwo: {
				user: {
					id: this.playerTwo.user.id,
					username: this.playerTwo.user.username,
				},
				width: this.playerTwo.width,
				height: this.playerTwo.height,
				x: this.playerTwo.x,
				y: this.playerTwo.y,
				color: this.playerTwo.color,
				goal: this.playerTwo.goal,
			},
			ball: {
				x: this.ball.x,
				y: this.ball.y,
				r: this.ball.r,
				color: this.ball.color,
			},
			timestampStart: this.timestampStart,
			goalTimestamp: this.goalTimestamp,
			pauseTime: this.pauseTime,
			mode: this.mode,
			timer: this.timer,
			gameDuration: this.gameDuration,
		};
		return newSerializeRoom;
	} 
}
