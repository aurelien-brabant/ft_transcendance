import { User } from './ConnectedUsers';

export default class Queue {
  private storage: User[] = [];

  constructor(private capacity: number = Infinity) {}

  enqueue(item: User): void {
    if (this.size() === this.capacity) {
      throw Error('Queue has reached max capacity, you cannot add more items');
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
    return this.storage.find((el) => el.username === username);
  }

  remove(userRm: User): void {
    const userIndex: number = this.storage.findIndex(
      (user) => user.username === userRm.username,
    );
    if (userIndex !== -1) this.storage.splice(userIndex, 1);
  }

  isInQueue(user: User): boolean {
    return this.find(user.username) !== undefined;
  }
}
