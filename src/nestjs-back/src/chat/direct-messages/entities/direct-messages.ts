import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { DmMessage } from 'src/chat/direct-messages/entities/dm-messages.entity';
import { User } from "src/users/entities/users.entity";

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;

  @ManyToMany(() => User, user => user.directMessages)
  @JoinTable()
  users: User[];

  @OneToMany(() => DmMessage, message => message.dm, {
    cascade: true
  })
  messages: DmMessage[];
}
