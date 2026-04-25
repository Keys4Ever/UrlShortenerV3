import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Url } from '../../urls/entities/url.entity';

@Entity('tags')
@Index(['name'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Url, (url) => url.tags)
  urls: Url[];
}
