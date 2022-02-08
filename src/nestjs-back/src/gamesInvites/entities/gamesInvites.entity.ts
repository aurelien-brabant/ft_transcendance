import { IsOptional } from "class-validator";
import { Games } from "src/games/entities/games.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GamesInvites {
    @PrimaryGeneratedColumn()
    id: number;

    @IsOptional()
    @Column()
    sender: number;

    @IsOptional()
    @Column()
    receiver: number;

/*    @IsOptional()
    @ManyToMany(
        type => Games,
        game => game.gameInviteSender
    )
    sender: Users;

    @IsOptional()
    @ManyToMany(
        type => Games,
        game => game.gameInviteReceiver
    )
    receiver: Users;
*/
    @IsOptional()
    @Column()
    status: string;

    @Column({
        type: 'date',
        default: () => 'CURRENT_DATE',
    })
    requestedAt: Date;
}