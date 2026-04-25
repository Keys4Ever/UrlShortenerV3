import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Url } from '../../urls/entities/url.entity';

@Entity('anonymous_secrets')
@Index(['secret'], { unique: true })
@Index(['isClaimed'])
export class AnonymousSecret {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  secret: string;

  @OneToOne(() => Url, (url) => url.anonymousSecret, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'urlId' })
  url: Url;

  @Column()
  urlId: number;

  @Column({ default: false })
  isClaimed: boolean;

  @Column({ nullable: true })
  claimedByUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.claimedSecrets, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  claimedBy: User | null;
}
