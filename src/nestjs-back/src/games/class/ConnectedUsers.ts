import { UserStatus } from "./Constants";

export class User {
	id: number;
	username: string;
	status?: UserStatus;
	socketId?: string;
	roomId?: string;

	constructor(id: number, username: string, socketId: string) {
		this.id = id;
		this.username = username;
		this.socketId = socketId
	}

	setSocketId(socketId: string) {
		this.socketId = socketId;
	}

	setUsername(username: string) {
		this.username = username;
	}

	setUserStatus(status: UserStatus) {
		this.status = status;
	}

	setRoomId(roomId: string | undefined) {
		this.roomId = roomId;
	}

}

export class ConnectedUsers {
	private users: Array<User> = new Array();

	constructor(private maxUser: number = Infinity) {}

	addUser(user: User) {
		this.users.push(user);
	}

	removeUser(userRm: User) {
		let userIndex: number = this.users.findIndex(user => user.socketId === userRm.socketId);
		if (userIndex !== -1)
			this.users.splice(userIndex, 1);
	}

	getUser(socketId: string): User | undefined {
		let userIndex: number = this.users.findIndex(user => user.socketId === socketId);
		if (userIndex === -1)
			return undefined;
		return this.users[userIndex];
	}

	getUserById(userId: number): User | undefined {
		const user: User = this.users.find(
			(user) => user.id === userId
		);
		return user;
	}

	changeUserStatus(socketId: string, status: UserStatus) {
		let user: User = this.getUser(socketId);
		user.setUserStatus(status);
	}
}