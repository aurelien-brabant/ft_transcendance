export class User {
    id: number;
	username: string;
	socketId?: string;
	roomId?: number;

	constructor(id: number, username: string, socketId: string) {
		this.id = id;
		this.username = username;
		this.socketId = socketId;
		//this.roomId = roomId;
	}

	setSocketId(socketId: string) {
		this.socketId = socketId;
	}

	setRoomId(roomId: number | undefined) {
		this.roomId = roomId;
	}
}

export class ChatRoom {
	public users: Array<User> = new Array();

	addUser(user: User) {
		this.users.push(user);
	}

	removeUser(user: User) {
		let id: number = this.users.findIndex(user => user.socketId === user.socketId);
		if (id !== -1)
			this.users.splice(id, 1);
	}

	getUser(socketId: string): User | undefined {
		let id: number = this.users.findIndex(user => user.socketId === socketId);
		if (id === -1)
			return undefined;
		return this.users[id];
	}	
}