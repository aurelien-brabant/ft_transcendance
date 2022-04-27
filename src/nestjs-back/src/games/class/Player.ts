import { User } from "./ConnectedUsers";
import { canvasHeight, playerHeight, playerSpeed, playerWidth, timing } from "./Constants";

export interface IPlayer {
	user: User;
    
	x: number;
	y: number;
	width: number;
	height: number
	speed: number;
	goal: number;
	color: string;
}

export class Player implements IPlayer {
	user: User;

	x: number;
	y: number;
	width: number;
	height: number
	speed: number;
	goal: number;
	color: string;

	// Controls
	up: boolean;
	down: boolean;

	// UI
	step: number;

	constructor(user: User, x: number) {
		this.user = user;

		this.width = playerWidth;
		this.height = playerHeight;
		this.x = x;
		this.y = (canvasHeight/2) - (this.height/2);
		this.speed = playerSpeed;
		this.goal = 0;

		this.up = false;
		this.down = false;
		this.color = 'rgba(255, 255, 255, 0.8)';
	}

	reset(): void {
		this.y = (canvasHeight/2) - (this.height/2);
	}

	update (secondPassed: number): void {
		if (this.color !== "rgba(255, 255, 255, 0.8)" && this.step <= timing)
		{
			this.color = "rgb(" + (127 + ((this.step/timing) * 128)) + ", " + ((this.step/timing) * 255) + ", " + ((this.step/timing) * 255) + ", 0.8)";
			this.step++;
		} else {
			this.step = 0;
			this.color = 'rgba(255, 255, 255, 0.8)';
		}

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
