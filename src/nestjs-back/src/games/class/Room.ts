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
	lastGoal: string;
	pauseTime: {pause: number, resume: number}[];

	winner: string;
	loser: string;
	winnerId: number;
	loserId: number;

	// settings customisation
	maxGoal: number;

	timer: number;
	gameDuration: number;
}

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
	lastGoal: string;
	pauseTime: {pause: number, resume: number}[];

	winner: string;
	loser: string;
	winnerId: number;
	loserId: number;
	winnerScore: number;
	loserScore: number;

	isGameEnd: boolean;
	// settings customisation
	maxGoal: number;

	mode: GameMode;

	timer: number;
	gameDuration: number;

    constructor(roomId: string, users: User[], customisation: {mode?: GameMode} = {mode: GameMode.DEFAULT}) {
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

	pause(): void {
		this.changeGameState(GameState.PAUSED);
		this.pauseTime.push({pause: Date.now(), resume: Date.now()});

	}

	resetPosition(): void {
		this.playerOne.reset();
		this.playerTwo.reset();
		this.ball.reset();
	}

	defaultGameMode(): void {
		if (this.playerOne.goal === this.maxGoal) {
			this.winner = this.playerOne.user.username;
			this.winnerId = this.playerOne.user.id;
			this.winnerScore = this.playerOne.goal;
			this.loser = this.playerTwo.user.username;
			this.loserId = this.playerTwo.user.id;
			this.loserScore = this.playerTwo.goal;

		} else {
			this.winner = this.playerTwo.user.username;
			this.winnerId = this.playerTwo.user.id;
			this.winnerScore = this.playerTwo.goal;
			this.loser = this.playerOne.user.username;
			this.loserId = this.playerOne.user.id;
			this.loserScore = this.playerOne.goal;
		}
	}

	timerGameMode() {
		if (this.playerOne.goal > this.playerTwo.goal) {
			this.winner = this.playerOne.user.username;
			this.winnerId = this.playerOne.user.id;
			this.winnerScore = this.playerOne.goal;
			this.loser = this.playerTwo.user.username;
			this.loserId = this.playerTwo.user.id;
			this.loserScore = this.playerTwo.goal;

		} else {
			this.winner = this.playerTwo.user.username;
			this.winnerId = this.playerTwo.user.id;
			this.winnerScore = this.playerTwo.goal;
			this.loser = this.playerOne.user.username;
			this.loserId = this.playerOne.user.id;
			this.loserScore = this.playerOne.goal;
		}

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
			this.goalTimestamp = Date.now();
			if (this.mode === GameMode.DEFAULT && (this.playerOne.goal === this.maxGoal || this.playerTwo.goal === this.maxGoal))
			{
				this.defaultGameMode();
				// this.winner = this.playerOne.goal === this.maxGoal ? this.playerOne.user.username : this.playerTwo.user.username;
				// this.loser = this.playerOne.goal === this.maxGoal ? this.playerTwo.user.username : this.playerOne.user.username;
				this.changeGameState(GameState.END);
				this.isGameEnd = true;
			}
			else
			{
				this.lastGoal = (this.ball.x < canvasWidth/2) ? this.playerTwo.user.username : this.playerOne.user.username;
				this.changeGameState(GameState.GOAL);
			}
			this.ball.goal = false;
		}

		if (this.mode === GameMode.TIMER && (this.playerOne.goal !== this.playerTwo.goal) && this.timer >= this.gameDuration) {
			this.timerGameMode();
			this.changeGameState(GameState.END);
			this.isGameEnd = true;
		}
	}

	update(): void {
		let secondPassed: number = (Date.now() - this.lastUpdate) / 1000;
		this.lastUpdate = Date.now();

		this.playerOne.update(secondPassed);
		this.playerTwo.update(secondPassed);
		this.ball.update(secondPassed, this.playerOne, this.playerTwo);
		this.checkGoal();
	}
}
