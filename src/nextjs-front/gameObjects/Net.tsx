export class Net
{
	x: number;
	y: number;
	width: number;
	height: number;
	canvasWidth: number;
	canvasHeight: number;

	constructor(width: number, height: number, canvasWidth: number, canvasHeight: number) {
		this.x = canvasWidth/2 - width/2;
		this.y = 0;
		this.width = width;
		this.height = height;
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
	}


}
