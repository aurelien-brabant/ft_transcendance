import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
  } from "typeorm";
  import { User } from "src/users/entities/users.entity";
  
  @Entity()
  export class BlockedUsers {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ length: 50, unique: true })
    name: string;
  
    @ManyToOne(() => User, user => user.blockedUsers, {
    })
    user: User;
  }
  