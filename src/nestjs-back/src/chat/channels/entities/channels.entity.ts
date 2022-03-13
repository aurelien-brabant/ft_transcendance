import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { IsOptional } from "class-validator";
import { Message } from 'src/chat/messages/entities/messages.entity';
import { User } from "src/users/entities/users.entity";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @ManyToOne(() => User, owner => owner.ownedChannels, {
    onDelete: "CASCADE"
  })
  owner: User;

  /* public, private, protected */
  @Column({ default: "private" })
  privacy: string

  @IsOptional()
  @Column({ select: false, length: 50, nullable: true })
  password: string;

  @ManyToMany(() => User, user => user.joinedChannels)
  @JoinTable()
  users: User[];

  @OneToMany(() => Message, message => message.channel, {
    cascade: true
  })
  messages: Message[];
}
