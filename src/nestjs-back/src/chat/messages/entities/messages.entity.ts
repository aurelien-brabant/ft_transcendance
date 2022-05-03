import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Channel } from "src/chat/channels/entities/channels.entity";
import { DirectMessage } from "src/chat/direct-messages/entities/direct-messages";
import { User } from "src/users/entities/users.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;

  @Column({ length: 640 })
  content: string;

  @ManyToOne(() => User)
  author: User;

  @ManyToOne(() => Channel || DirectMessage, channel => channel.messages, {
    onDelete: "CASCADE"
  })
  channel: Channel | DirectMessage;
}
