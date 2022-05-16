import { User } from "./ConnectedUsers";

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

    remove(userRm: User): void {
        let userIndex: number = this.storage.findIndex(user => user.username === userRm.username);
        if (userIndex !== -1)
            this.storage.splice(userIndex, 1);
    }

    isInQueue(user: User): boolean {
        return (this.find(user.username) !== undefined);
    }

    matchPlayers(): User[] {
        let players: User[] = Array();
        let firstPlayer: User = this.dequeue();

        let secondPlayerId: number = 0;
        let difference: number = Math.abs(firstPlayer.ratio - this.storage[0].ratio);

        for (let i = 1; i < this.size(); i++) {
            if (firstPlayer.mode === this.storage[i].mode && Math.abs(firstPlayer.ratio - this.storage[i].ratio) < difference)
                secondPlayerId = i;
        }

        if (firstPlayer.mode !== this.storage[secondPlayerId].mode) {
            this.storage.splice(1, 0, firstPlayer);
            return players;
        }

        players.push(firstPlayer);
        players.push(this.storage[secondPlayerId]);
        this.storage.splice(secondPlayerId, 1);
        
        return players;
    }
}
