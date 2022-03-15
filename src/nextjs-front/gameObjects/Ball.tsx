import { GameConstants } from "../constants/gameConstants";
import { Player } from "./Player";
import { Score } from "./Score";

export class Ball {
	canvasWidth:number;
	canvasHeight:number;
	x: number;
	y: number;
	r: number;
	defaultSpeed: number;
	defaultRadius:number;

	speed: number;
	maxSpeed: number;
	acceleration: number;
	velocity: {dx: number, dy: number};
	p1: Player;
	p2: Player;
	goal: boolean;

	constructor(canvasWidth: number, canvasHeight: number, r: number, speed: number, maxSpeed: number, acceleration: number, p1: Player, p2: Player) {
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.x = canvasWidth/2;
		this.y = canvasHeight/2;
		this.r = r;

		this.defaultSpeed = speed;
		this.defaultRadius = r;

		this.acceleration = acceleration;
		this.speed = speed;
		this.maxSpeed = maxSpeed;

		this.velocity = {dx: 0, dy: 0};
		this.p1 = p1;
		this.p2 = p2;

		this.goal = false;
		this.reset();
	}

	// Collision between ball and Paddle
	collision(secondPassed: number) {
		if (this.x < this.canvasWidth/2) {
			if (((this.x + (this.velocity.dx * secondPassed)) - this.r) < this.p1.x + this.p1.width)
			{
				if ((this.y + this.r >= this.p1.y && this.y + this.r <= this.p1.y + this.p1.height)
				|| (this.y - this.r >= this.p1.y && this.y - this.r <= this.p1.y + this.p1.height))
				{
					this.x = (this.p1.x + this.p1.width) + this.r;
					this.p1.color = "rgba(127, 0, 0, 0.8)";
					this.r -= 5;
					return true;
				}
			}
		}
		else {
			if (((this.x + (this.velocity.dx * secondPassed)) + this.r) > this.p2.x)
			 {
				 if ((this.y + this.r >= this.p2.y && this.y + this.r <= this.p2.y + this.p2.height)
				 || ( this.y - this.r >= this.p2.y && this.y - this.r <= this.p2.y + this.p2.height))
				 {
					 this.x = this.p2.x - this.r;
					 this.p2.color = "rgba(127, 0, 0, 0.8)";
					 this.r -= 5;
					 return true
				 }
			 }
		}
		return false;
	}


	handleCollision(secondPassed: number) {
		// Collision on axis Y border  of the board game
		if((this.y + (this.velocity.dy * secondPassed)) - this.r <= 0 || (this.y + (this.velocity.dy * secondPassed)) + this.r >= this.canvasHeight)
		{
			this.velocity.dy = -this.velocity.dy;
			this.r -= 5;
		}

		if(this.collision(secondPassed))
		{
			// Here we try to change the ball angle when hitting one side of the Paddle
			// To do this we determine where the ball collide with the paddle (in px)
			// then we normalize this number to get a number between -1 and 1.
			// With this value we can caculate the angle in radian
			// And thanks to some trigo things we get the new x and y direction for our ball
			// This conserve the speed and only change the angle but to make the game a little
			// bit harder i increment the speed value every time the ball hit a paddle
			// Where did the ball hit the Paddle
			if (this.speed + this.acceleration < this.maxSpeed)
				this.speed += this.acceleration;
			let p = (this.x < this.canvasWidth/2) ? this.p1 : this.p2;
			let collidePoint = this.y - (p.y + p.height/2);
			// Normalization (min = -1 and max = 1)
			collidePoint = collidePoint/(p.height/2);
			// Caculate angle in Radian
			let angleRad = collidePoint * Math.PI/4;
			let dir = (this.x < this.canvasWidth/2) ? 1 : -1;
			this.velocity.dx = dir * (this.speed * Math.cos(angleRad));
			this.velocity.dy = this.speed * Math.sin(angleRad);
			return true;
		}
		return false;
	}

    reset() {
        // Get old direction before replacing the ball
        /*let dir = (this.x < this.canvasWidth/2) ? 1 : -1;
		// resetting speed to default value
		this.speed = this.defaultSpeed;
        // Caculating angle in degrees cos(angleRad) and sin(angleRad)
        let angle1 = this.velocity.dx / this.speed;
        let angle2 = this.velocity.dy / this.speed;
        // Replacing the ball in the center of the canvas
        this.x = this.canvasWidth /2;
        this.y = this.canvasHeight / 2;
        this.velocity.dx = dir * (this.speed * Math.cos(angle1));
        this.velocity.dy = this.speed * Math.sin(angle2); */

		/* This reset the ball and send it striaght on the x axis*/
		let dir = (this.x < this.canvasWidth/2) ? -1 : 1;
		this.x = this.canvasWidth / 2;
		this.y = this.canvasHeight / 2;
		this.velocity.dy = 0;
		this.velocity.dx = dir * this.defaultSpeed;
		this.speed = this.defaultSpeed;
    }

	update(score: Score, gameConstants : GameConstants, secondPassed: number) {
		if (this.r < this.defaultRadius)
			this.r += 1;

		//Collision with Players
		if (!this.handleCollision(secondPassed))
		{
			this.x += this.velocity.dx * secondPassed;
			this.y += this.velocity.dy * secondPassed;
		}

		//Goal player one
		if(this.x - this.r <= 0 && this.goal === false)
		{
			score.p2_Score++;
			this.goal = true;
			gameConstants.playersGoal.p2 = true;
			return ;
		}
		// Goal Player two
		if(this.x + this.r >= this.canvasWidth && this.goal === false)
		{
			score.p1_Score++;
			this.goal = true;
			gameConstants.playersGoal.p1 = true;
			return ;
		}
		this.goal = false;
		gameConstants.playersGoal.p1 = false;
		gameConstants.playersGoal.p2 = false;
		return ;
	}
}
