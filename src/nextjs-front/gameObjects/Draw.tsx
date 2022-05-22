import { canvasHeight, canvasWidth, IBall, countDown, IPlayer, IRoom, GameState } from "./GameObject";

export type PlayerGoal = {
	p1: boolean;
	p2: boolean;
}

type particle = {
		x: number;
		y: number;
		dy: number;
		dx: number;
		r: number;
}

type Net = {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class Draw {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D | null;
	neonEffect: number;
	firstNeon: number;
	secondNeon: number;
	neonColor: number;
	colorChange: number;
	degrees: number;
	particles: particle[];
	max_particles: number;
	width: number;
	height: number;

	net: Net;

	dot: number;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
		this.neonEffect = 0.01;
		this.firstNeon = 10;
		this.secondNeon = 20;
		this.neonColor = 0;
		this.colorChange = 1;
		this.degrees = 0;
		this.particles = [];
		this.max_particles = 75;

		this.width = canvasWidth;
		this.height = canvasHeight;

		this.net = {
			x: canvasWidth/2 - 10,
			y: 0,
			width: 20,
			height: 50
		};

		this.dot = 0;
	}

	/* General Drawing functions*/
	clear() {
		if (this.context)
			this.context.clearRect(0, 0, this.width, this.height);
	}

	drawRectangle(x: number, y: number, width: number, height: number, color: string) {
		if (this.context)
		{
			this.context.save();
			this.context.fillStyle = color;
			this.context.shadowColor = "rgb(127, 0, "+ this.neonColor +")";
			this.context.shadowBlur = this.firstNeon + 10;
			this.context.fillRect(x, y, width, height);
			this.context.restore();
		}
	}

	drawArc(x: number, y: number, radius: number, color: string, degrees: number) {
		if (this.context)
		{
			this.context.save();
			this.context.beginPath();
			this.context.arc(x, y, radius, (degrees * (Math.PI/180)), (degrees * (Math.PI/180) + (3/2) * Math.PI));
			this.context.lineWidth = 10;
			this.context.strokeStyle = color;
			this.context.shadowColor = "rgb(127, 0, "+ this.neonColor +")";
			this.context.shadowBlur = this.firstNeon + 10;
			this.context.stroke();
			this.context.restore();
		}
	}

	drawCircle(x: number, y: number, radius: number, color: string) {
		if (this.context)
		{
			this.context.save();
			this.context.beginPath();
			this.context.arc(x, y, radius, 0, 2 * Math.PI);
			this.context.lineWidth = 0;
			this.context.strokeStyle = color;
			this.context.shadowColor = "rgb(127, 0, "+ this.neonColor +")";
			this.context.shadowBlur = this.firstNeon + 10;
			this.context.fillStyle = color;
			this.context.fill();
			this.context.stroke();
			this.context.restore();
		}
	}

	drawText(text: string, x: number, y: number, size: number, color: string) {
		if (this.context)
		{
			this.context.save();
			this.context.fillStyle = color;
			this.context.font = size + "px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif";
			this.context.fillText(text, x, y);
			this.context.restore();
		}
	}

	drawCenteredText(text: string, x: number, y: number, size: number, color: string) {
		if (this.context)
		{
			this.context.save();
			this.context.font = size + "px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif";
			this.context.fillStyle = color;
			this.context.textBaseline = "middle";
			this.context.textAlign = "center";
			this.context.shadowColor = "rgb(127, 0, "+ this.neonColor +")";
			this.context.shadowBlur = this.firstNeon + 10;
			this.context.fillText(text, x, y);
			this.context.restore();
		}
	}

	/* Game Object */
	drawBall(ball: IBall) {
		this.drawCircle(ball.x, ball.y, ball.r, ball.color);
	}

	drawPaddle(paddle: IPlayer) {
		this.drawRectangle(paddle.x, paddle.y, paddle.width, paddle.height, "white");
		this.drawRectangle(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
	}

	drawNet()
	{
		for (let i = 0 ; i <= (canvasHeight/2) - this.net.height; i += this.net.height)
		{
			this.net.y = i;
			this.drawRectangle(this.net.x, this.net.y, this.net.width, this.net.height, 'white');
			this.drawRectangle(this.net.x, canvasHeight - (this.net.height + this.net.y), this.net.width, this.net.height, 'white');
			i += 19;
		}
	}

	drawScore(p1: IPlayer, p2: IPlayer) {
		this.drawText(p1.goal + "", canvasWidth/4, canvasHeight/10, 45, 'white');
		this.drawText(p2.goal + "", 3*(canvasWidth/4), canvasHeight/10, 45, 'white');
	}

	drawPauseButton(room: IRoom) {
		let pauseSizeX = this.height/10;
		let pauseSizeY = this.height/10;
		let timer: Date = new Date(Date.now() - room.pauseTime[room.pauseTime.length - 1].pause);
		let seconds: string = (42 - timer.getSeconds() < 10 ? "0" : "") + (42 - timer.getSeconds()) + "s";
		this.drawRectangle(0, 0, this.width, this.height, "rgba(0, 0, 0, 0.3)")
		this.drawRectangle(((this.width/2) - pauseSizeX/2), ((this.height/2) - pauseSizeY/2), pauseSizeX/3, pauseSizeY, 'white');
		this.drawRectangle(((this.width/2) + pauseSizeX/6), ((this.height/2) - pauseSizeY/2), pauseSizeX/3, pauseSizeY, 'white');
		this.drawCenteredText(seconds, this.width/2, (this.height/2 - pauseSizeY), pauseSizeY, "white");
	}

	drawLoading() {
		this.drawRectangle(0, 0, this.width, this.height, "rgba(0, 0, 0, 0.5)");
		this.drawArc(this.width/2, this.height/2 + 100, 50, "white", this.degrees);
		this.degrees += 6 % 360;
	}

	drawWaiting() {
		this.drawCenteredText("Game will start when invited player joins", this.width/2, this.height/2, 45, "white");
	}

	drawCountDown(countDown: string) {
		this.drawCenteredText(countDown, this.width/2, this.height/2, 45, "white");
	}

	resetParticles() {
		this.particles.splice(0, this.particles.length);
		this.particles = [];
	}

	drawGoalParticle(ball: IBall) {
		if (this.particles.length === 0)
		{
			for (let i = 0; i < this.max_particles; i++) {
				this.particles.push({
					'x': ball.x,
					'y': ball.y,
					'dy': ((Math.random() < 0.5 ? -1 : 1) * (5 + (50 * Math.random()))),
					'dx': ((ball.x < this.width/2 ? 1 : -1) * (5 + (50 * Math.random()))),
					'r': 2 + (15 * Math.random())
				})
			}
			ball.x = (ball.x < this.width/2) ? -ball.r : this.width + ball.r;
		} else {
			for (let i = 0; i < this.max_particles; i++) {
				this.drawCircle(this.particles[i].x, this.particles[i].y, this.particles[i].r, 'white');
				this.particles[i].x += this.particles[i].dx;
				this.particles[i].y += this.particles[i].dy;
				if ((this.particles[i].x - this.particles[i].r) + this.particles[i].dx <= 0 || (this.particles[i].x + this.particles[i].r) + this.particles[i].dx >= this.width)
					this.particles[i].dx = -this.particles[i].dx;
				if ((this.particles[i].y - this.particles[i].r) + this.particles[i].dy <= 0 || (this.particles[i].y + this.particles[i].r) + this.particles[i].dy >= this.height)
					this.particles[i].dy = -this.particles[i].dy;
			}
		}
	}

	drawGoal(room: IRoom) {
		let count: number = (Date.now() - room.goalTimestamp) / 1000;
		this.drawGoalParticle(room.ball);
		this.drawRectangle(0, 0, canvasWidth, canvasHeight, "rgba(0, 0, 0, 0.5)");
		if (room.gameState === GameState.PLAYERONESCORED)
			this.drawCenteredText((room.playerOne.user.username + " Scores !!!"), this.width/2, ((this.height/2) - (this.height/10)), 45, 'white');
		else if (room.gameState === GameState.PLAYERTWOSCORED)
			this.drawCenteredText((room.playerTwo.user.username + " Scores !!!"), this.width/2, ((this.height/2) - (this.height/10)), 45, 'white');
		this.drawCountDown(countDown[Math.floor(count)]);
	}

	drawTimer(room: IRoom) {
		if (room.gameDuration - room.timer > 0) {
			const timer: Date = new Date(room.gameDuration - room.timer);
			const minutes: number = timer.getMinutes();
			const seconds: string = (timer.getSeconds() < 10) ? ("0" + String(timer.getSeconds())) : String(timer.getSeconds());
			this.drawCenteredText(minutes + ":" + seconds, canvasWidth - 100, 60, 50, 'white');
		}
		else {
			const timer: Date = new Date(room.timer - room.gameDuration);
			const minutes: string = String(timer.getMinutes());
			const seconds: string = (timer.getSeconds() < 10) ? ("0" + String(timer.getSeconds())) : String(timer.getSeconds());
			this.drawCenteredText("+" + minutes + ":" + seconds, canvasWidth - 100, 60, 50, 'red');
		}
	}

	/* Neon effect */
	animateNeon(canvas: HTMLCanvasElement) {
		canvas.style.boxShadow = "inset 0 0 2px #fff,\
			inset 0 0 "+ this.firstNeon +"px rgb(127, 0, "+ this.neonColor +"),\
			inset 0 0 "+ this.secondNeon +"px rgb(127, 0, "+ this.neonColor +"),\
			0 0 5px #fff,\
			0 0 "+ this.firstNeon +"px rgb(127, 0, "+ this.neonColor +")";
		this.firstNeon += this.neonEffect;
		this.secondNeon += this.neonEffect;
		this.neonColor += this.colorChange;
		if (this.firstNeon <= 10 || this.firstNeon >= 30)
			this.neonEffect *= -1;
		if ((this.neonColor % 255) === 0)
			this.colorChange *= -1;
	}
}
