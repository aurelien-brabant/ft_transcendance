export class Player {
	id: string;
	canvasWidth: number;
	canvasHeight: number;
	defaultX: number;
	x: number;
	y: number;
	dy: number;
	width: number;
	height: number;
	color: string;
	step: number;
	timing: number;

	constructor(id: string, canvasWidth: number, canvasHeight: number, x: number, dy: number, width: number, height: number, color: string) {
		this.id = id;
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.defaultX = x;
		this.x = this.defaultX;
		this.y = (canvasHeight/2) - (height/2);
		this.dy = dy;
		this.width = width;
		this.height = height;
		this.color = color;
		this.step = 0;
		this.timing = 15;
	}

	reset() {
		this.x = this.defaultX;
		this.y = (this.canvasHeight/2) - (this.height/2);
	}

	update(keyUp: boolean, keyDown: boolean, secondPassed: number) {
		// console.log(this.dy * secondPassed);
		if(keyUp && !keyDown) {
			if(this.y > 0)
				this.y -= this.dy * secondPassed;
			else
				this.y = 0;
		}

		if(keyDown && !keyUp) {
			if(this.y + this.height < this.canvasHeight)
				this.y += this.dy * secondPassed;
			else
				this.y = this.canvasHeight - this.height;
		}
	}
}
