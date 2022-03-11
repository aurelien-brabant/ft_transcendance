import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Channel } from "src/chat/channels/entities/channels.entity";
import { User } from "src/users/entities/users.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;

  @Column({ length: 640 })
  content: string;

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => Channel, channel => channel.messages, {
    onDelete: "CASCADE"
  })
  channel: Channel;
}