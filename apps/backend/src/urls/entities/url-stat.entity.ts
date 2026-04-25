import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Url } from './url.entity';

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  BOT = 'bot',
  UNKNOWN = 'unknown',
}

@Entity('url_stats')
@Index(['url', 'createdAt'])
@Index(['country'])
@Index(['deviceType'])
export class UrlStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  urlId: number;

  @Column({ type: 'enum', enum: DeviceType, default: DeviceType.UNKNOWN })
  deviceType: DeviceType;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  referrer: string;

  @Column({ nullable: true, type: 'jsonb' })
  utmParams: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Url, (url) => url.stats, { onDelete: 'CASCADE' })
  url: Url;
}
