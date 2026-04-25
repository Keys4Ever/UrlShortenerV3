import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Url } from '../../urls/entities/url.entity';
import { AnonymousSecret } from '../../anonymous/entities/anonymous-secret.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  pfp: string;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Url, (url) => url.user, { cascade: true })
  urls: Url[];

  @OneToMany(() => AnonymousSecret, (secret) => secret.claimedBy, {
    nullable: true,
  })
  claimedSecrets: AnonymousSecret[];
}
