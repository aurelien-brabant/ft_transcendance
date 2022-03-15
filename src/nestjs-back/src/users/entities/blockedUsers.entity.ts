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
  
    @ManyToOne(() => User, user => user.blockedUsers, {
    })
    user: User;
  }
  