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

    remove(username: string): void {
		let userIndex: number = this.storage.findIndex(user => user.username === username);
		if (userIndex !== -1) {
			this.storage.splice(userIndex, 1);
		}
    }
}
