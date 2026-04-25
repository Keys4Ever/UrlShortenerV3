import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UrlStat } from './url-stat.entity';
import { Tag } from '../../tags/entities/tag.entity';

import { AnonymousSecret } from '../../anonymous/entities/anonymous-secret.entity';

@Entity('urls')
@Index(['shortCode'], { unique: true })
@Index(['user'])
@Index(['isDeleted'])
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  shortCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  title: string;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.urls, { nullable: true })
  user: User | null;

  @OneToMany(() => UrlStat, (stat) => stat.url, { cascade: true })
  stats: UrlStat[];

  @OneToOne(() => AnonymousSecret, (secret) => secret.url, { cascade: true })
  anonymousSecret: AnonymousSecret;

  @ManyToMany(() => Tag, (tag) => tag.urls, { cascade: true })
  @JoinTable({
    name: 'url_tags',
    joinColumn: { name: 'urlId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
