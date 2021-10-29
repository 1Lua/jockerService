import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('refresh_tokens')
export class RefreshTokenEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column({type: 'bigint'})
    expiresAt: number;

    @Column()
    userId: number;
}