import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Message } from 'src/chat/messages/entities/messages.entity';
import { User } from "src/users/entities/users.entity";

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, user => user.directMessages)
  @JoinTable()
  users: User[];

  @OneToMany(() => Message, message => message.channel, {
    cascade: true
  })
  messages: Message[];
}
