export interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    size(): number;
    find(item: T): T;
    remove(item: T): void;
}

export default class Queue<T> implements IQueue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {}

    enqueue(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }
    dequeue(): T | undefined {
        return this.storage.shift();
    }
    size(): number {
        return this.storage.length;
    }

    find(item: T): T {
        return this.storage.find(el => el === item);
    }

    remove(item: T): void {
        for (let i = 0; i < this.storage.length; i++) {
            if (this.storage[i] === item)
            {
                this.storage.splice(i, 1);
                return ;
            }
        }
    }
}  