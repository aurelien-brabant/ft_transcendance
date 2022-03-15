enum GameState {
	QUEUE,
	INIT,
	STARTING,
	PLAYING,
	PAUSED,
	RESUME,
	GOAL,
	END
}

interface IRoom {
	id: string;
    gameState: GameState;
	players: player[];
	ball: Ball;
	// Players: Paddle[];
	timestampStart: number;
	timestampServer: number;
}

type player = {
	id: string;
	x: number;
	y: number;
	goal: number;
	speed: number;
}

type Ball = {
	x: number;
	y: number;
	speed: number;
}

export class Room implements IRoom {
    constructor(roomId: string, players: string[]) {
        this.id = roomId;
		this.gameState = GameState.INIT;
		this.players = [];
        this.players.push({id: players[0], x: 0, y: 0, goal: 0, speed: 0});
        this.players.push({id: players[1], x: 0, y: 0, goal: 0, speed: 0});
		this.ball = ({x: 0, y: 0, speed: 0});
		this.timestampStart = Date.now();
		this.timestampServer = Date.now();
    }

    id: string;
    gameState: GameState;
	players: player[];
	ball: Ball;
	timestampStart: number;
	timestampServer: number;
}