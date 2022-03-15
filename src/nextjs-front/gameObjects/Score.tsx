export class Score
{
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	size: number;
	canvasWidth: number;
	canvasHeight: number;
	p1_Score: number;
	p2_Score: number;

	constructor(canvasWidth: number, canvasHeight: number) {
		this.x1 = canvasWidth/4;
		this.y1 = canvasHeight/10;
		this.x2 = 3*(canvasWidth/4);
		this.y2 = canvasHeight/10;
		this.size = 45;
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.p1_Score = 0;
		this.p2_Score = 0;
	}


}
