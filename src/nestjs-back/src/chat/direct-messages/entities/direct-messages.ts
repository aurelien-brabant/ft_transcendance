import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { DmMessage } from 'src/chat/direct-messages/messages/entities/dm-messages.entity';
import { User } from "src/users/entities/users.entity";

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, user => user.directMessages)
  @JoinTable()
  users: User[];

  @OneToMany(() => DmMessage, message => message.dm, {
    cascade: true
  })
  messages: DmMessage[];
}
