// Constant
const canvasWidth: number = 1920;
const canvasHeight: number = 1080;

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

export class Player implements IPlayer {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number
	speed: number;
	goal: number;

	// Controls
	up: boolean;
	down: boolean;
	constructor(id: string, x: number) {
		this.id = id;
		this.width = 30;
		this.height = 200;
		this.x = x;
		this.y = (canvasHeight/2) - (this.height/2);
		this.speed = 550;
		this.goal = 0;

		this.up = false;
		this.down = false;
	}

	reset () {
		this.y = (canvasHeight/2) - (this.height/2);
	}

	update (secondPassed: number) {
		if(this.up && !this.down) {
			if(this.y > 0)
				this.y -= this.speed * secondPassed;
			else
				this.y = 0;
		}

		if(this.down && !this.up) {
			if(this.y + this.height < canvasHeight)
				this.y += this.speed * secondPassed;
			else
				this.y = canvasHeight - this.height;
		}
	}
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

export class Ball implements IBall {
	x: number;
	y: number;
	r: number;
	defaultRadius: number;

	defaultSpeed: number;
	speed: number;
	maxSpeed: number;
	acceleration: number;
	velocity: {dx: number, dy: number};

	constructor() {
		this.x = canvasWidth/2;
		this.y = canvasHeight/2;
		this.r = 25;
		this.defaultRadius = 25;

		this.defaultSpeed = 500;
		this.speed = 500;
		this.maxSpeed = 1500;
		this.acceleration = 50;
		this.velocity = {dx: this.speed, dy: 0};
	}

	update(secondPassed: number, p1: Player, p2: Player) {
		if (this.r < this.defaultRadius)
			this.r += 5 * secondPassed;

		console.log(this);
		if (!this.handleCollision(secondPassed, p1, p2))
		{
			this.x += this.velocity.dx * secondPassed;
			this.y += this.velocity.dy * secondPassed;
		}

		// //Goal player one
		// if(this.x - this.r <= 0 && this.goal === false)
		// {
		// 	score.p2_Score++;
		// 	this.goal = true;
		// 	gameData.playersGoal.p2 = true;
		// 	return ;
		// }
		// // Goal Player two
		// if(this.x + this.r >= this.canvasWidth && this.goal === false)
		// {
		// 	score.p1_Score++;
		// 	this.goal = true;
		// 	gameData.playersGoal.p1 = true;
		// 	return ;
		// }
		// this.goal = false;
		// gameData.playersGoal.p1 = false;
		// gameData.playersGoal.p2 = false;
		return ;

	}

	// Collision between ball and Paddle
	collision(secondPassed: number, p1: Player, p2: Player): boolean {
		if (this.x < canvasWidth/2) {
			if (((this.x + (this.velocity.dx * secondPassed)) - this.r) < p1.x + p1.width)
			{
				if ((this.y + this.r >= p1.y && this.y + this.r <= p1.y + p1.height)
				|| (this.y - this.r >= p1.y && this.y - this.r <= p1.y + p1.height))
				{
					this.x = (p1.x + p1.width) + this.r;
					this.r -= 5;
					// p1.color = "rgba(127, 0, 0, 0.8)";
					return true;
				}
			}
		}
		else {
			if (((this.x + (this.velocity.dx * secondPassed)) + this.r) > p2.x)
			 {
				 if ((this.y + this.r >= p2.y && this.y + this.r <= p2.y + p2.height)
				 || ( this.y - this.r >= p2.y && this.y - this.r <= p2.y + p2.height))
				 {
					 this.x = p2.x - this.r;
					 this.r -= 5;
					 //  p2.color = "rgba(127, 0, 0, 0.8)";
					 return true
				 }
			 }
		}
		return false;
	}


	handleCollision(secondPassed: number, p1: Player, p2: Player) {
		// Collision on axis Y border  of the board game
		if((this.y + (this.velocity.dy * secondPassed)) - this.r <= 0 || (this.y + (this.velocity.dy * secondPassed)) + this.r >= 1080)
		{
			this.velocity.dy = -this.velocity.dy;
			this.r -= 5;
		}

		if(this.collision(secondPassed, p1, p2))
		{
			if (this.speed + this.acceleration < this.maxSpeed)
				this.speed += this.acceleration;
			let p = (this.x < canvasWidth/2) ? p1 : p2;
			let collidePoint = this.y - (p.y + p.height/2);
			collidePoint = collidePoint/(p.height/2);
			let angleRad = collidePoint * Math.PI/4;
			let dir = (this.x < canvasWidth/2) ? 1 : -1;
			this.velocity.dx = dir * (this.speed * Math.cos(angleRad));
			this.velocity.dy = this.speed * Math.sin(angleRad);
			return true;
		}
		return false;
	}
}

export interface IRoom {
	id: string;
	gameState: GameState;
	playerOne: Player;
	playerTwo: Player;
	ball: Ball;
	timestampStart: number;
	timestampServer: number;
}

export default class Room implements IRoom {
	id: string;
    gameState: GameState;
	playerOne: Player;
	playerTwo: Player;
	ball: Ball;
	timestampStart: number;
	timestampServer: number;
	lastUpdate: number;

	// First initialisation 
    constructor(roomId: string, players: string[]) {
        this.id = roomId;
		this.gameState = GameState.PLAYING;
        this.playerOne = new Player(players[0], 10);
        this.playerTwo = new Player(players[1], canvasWidth-40);
		this.ball = new Ball();

		// this.ball = ({x: 0, y: 0, r: 25, speed: 0, velocity: {dx: 0, dy: 0}});
		this.timestampStart = Date.now();
		this.timestampServer = Date.now();
		this.lastUpdate = Date.now();
    }
	
	// This function will change the gamestate according to what's happening
	// player disconnection etc...
	changeGameState() {

	}

	// Reset Players and Ball position
	resetPosition() {

	}

	// Update player and ball
	update() {
		// for players use keyPress = true | false
		let secondPassed: number = (Date.now() - this.lastUpdate) / 1000;
		this.lastUpdate = Date.now();		
		this.playerOne.update(secondPassed);
		this.playerTwo.update(secondPassed);
		this.ball.update(secondPassed, this.playerOne, this.playerTwo);
	}

	// updateScore() {

	// }
}