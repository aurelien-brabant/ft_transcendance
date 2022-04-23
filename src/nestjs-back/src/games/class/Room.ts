import { Ball } from "./Ball";
import { User } from "./ConnectedUsers";
import { canvasWidth, GameState } from "./Constants";
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

    constructor(roomId: string, users: User[], customisation: {maxGoal?: number} = {maxGoal: 3}) {
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

		this.maxGoal = customisation.maxGoal;
		this.isGameEnd = false;
    }

	isAPlayer(user: User): boolean {
		return (this.playerOne.user.username === user.username || this.playerTwo.user.username === user.username);
	}

	addUser(user: User) {
		// console.log(user, " added to ", this.users);
		this.players.push(user);
	}

	removeUser(userRm: User) {
		const userIndex: number = this.players.findIndex(user => user.username === userRm.username);
		if (userIndex !== -1)
			this.players.splice(userIndex, 1);
	}

	getDuration(): number {
		let duration = Date.now() - this.timestampStart;

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
		this.pauseTime.push({pause: Date.now(), resume: 0});

	}

	resetPosition(): void {
		this.playerOne.reset();
		this.playerTwo.reset();
		this.ball.reset();
	}

	update(): void {
		let secondPassed: number = (Date.now() - this.lastUpdate) / 1000;
		this.lastUpdate = Date.now();

		this.playerOne.update(secondPassed);
		this.playerTwo.update(secondPassed);
		this.ball.update(secondPassed, this.playerOne, this.playerTwo);

		if (this.ball.goal === true)
		{
			this.goalTimestamp = Date.now();
			if (this.playerOne.goal === this.maxGoal || this.playerTwo.goal === this.maxGoal)
			{
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
				this.winner = this.playerOne.goal === this.maxGoal ? this.playerOne.user.username : this.playerTwo.user.username;
				this.loser = this.playerOne.goal === this.maxGoal ? this.playerTwo.user.username : this.playerOne.user.username;
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
	}
}
