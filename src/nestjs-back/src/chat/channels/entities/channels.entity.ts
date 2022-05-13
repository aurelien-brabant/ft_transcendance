import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { IsOptional } from "class-validator";
import { ChannelMessage } from 'src/chat/channels/entities/channel-messages.entity';
import { ChannelPunishment } from "./punishment.entity";
import { User } from "src/users/entities/users.entity";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;

  /* public | private | protected */
  @Column({ default: "private" })
  privacy: string

  @IsOptional()
  @Column({ select: false, nullable: true })
  password: string;

  /**
   * Mute/ban duration in minutes: 1 | 5 | 15
   * NOTE: very short to test it easily
   */
  @Column({ default: 1 })
  restrictionDuration: number;

  @ManyToOne(() => User, owner => owner.ownedChannels, {
    onDelete: "CASCADE"
  })
  owner: User;

  @ManyToMany(() => User, user => user.joinedChannels)
  @JoinTable()
  users: User[];

  @ManyToMany(() => User)
  @JoinTable()
  admins: User[];

  @OneToMany(() => ChannelMessage, message => message.channel, {
    cascade: true
  })
  messages: ChannelMessage[];

  @OneToMany(() => ChannelPunishment, (punishment) => punishment.channel, {
    cascade: true
  })
  punishments: ChannelPunishment[];
}
