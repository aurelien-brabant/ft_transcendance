import { UserStatus } from 'src/games/class/Constants';
import { User } from 'src/games/class/ConnectedUsers';

export class ChatUser extends User {
	joinedRooms: string[];

	addRoom(roomId: string) {
		this.joinedRooms.push(roomId);
	}

	removeRoom(roomId: string) {
		delete this.joinedRooms[roomId];
	}
}

/* NOTE: couldn't extend ConnectedUsers from games */
export class ChatUsers {
	private users: Array<ChatUser> = new Array();

	constructor(private maxUser: number = Infinity) {}

	addUser(user: ChatUser) {
		if (this.users.length !== this.maxUser) {
			this.users.push(user);
		}
	}

	removeUser(user: ChatUser) {
		const userIndex: number = this.users.findIndex(
			(chatUser) => chatUser.socketId === user.socketId
		);
		if (userIndex !== -1) {
			this.users.splice(userIndex, 1);
		}
	}

	getUser(socketId: string): ChatUser | undefined {
		const user: ChatUser = this.users.find(
			(user) => user.socketId === socketId
		);
		return user;
	}

	getUserById(userId: number): ChatUser | undefined {
		const user: ChatUser = this.users.find(
			(user) => user.id === userId
		);
		return user;
	}

	changeUserStatus(socketId: string, status: UserStatus) {
		let user: ChatUser = this.getUser(socketId);

		user.setUserStatus(status);
	}
}
