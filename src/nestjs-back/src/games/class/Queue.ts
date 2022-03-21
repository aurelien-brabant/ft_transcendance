<<<<<<< HEAD
import { User } from "./Room";
=======
export type User = {
	username: string;
	socketId: string;
}
//
// export interface IQueue<T> {
//     enqueue(item: T): void;
//     dequeue(): T | undefined;
//     size(): number;
//     find(item: string): T;
//     remove(item: T): void;
// }
// export default class Queue<T> implements IQueue<T> {
>>>>>>> prevent players to be added multiple times in queue, switch socket id for username, handling client reconnection when in game, controls not working needs rework

export default class Queue {
    private storage: User[] = [];

    constructor(private capacity: number = Infinity) {}

    enqueue(item: User): void {
        if (this.size() === this.capacity) {
            throw Error("Queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }
    dequeue(): User | undefined {
        return this.storage.shift();
    }
    size(): number {
        return this.storage.length;
    }

    find(username: string): User {
        return this.storage.find(el => el.username === username);
    }

<<<<<<< HEAD
    remove(userRm: User): void {
        let userIndex: number = this.storage.findIndex(user => user.username === userRm.username);
        if (userIndex !== -1)
            this.storage.splice(userIndex, 1);
    }

    isInQueue(user: User): boolean {
        return (this.find(user.username) !== undefined);
    }
=======
    remove(username: string): void {
		let userIndex: number = this.connectedUser.findIndex(user => user.username === username);
		if (userIndex !== -1) {
			this.storage.splice(userIndex, 1);
		}
    }
>>>>>>> prevent players to be added multiple times in queue, switch socket id for username, handling client reconnection when in game, controls not working needs rework
}
