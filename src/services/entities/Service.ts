import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Version } from './Version';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { length: 60 })
  @Index({ unique: false })
  name: string;

  @Column('varchar', { length: 200, default: '' })
  description: string;

  @OneToMany(
    () => Version,
    version => version.service,
    { onDelete: 'CASCADE', cascade: ['insert', 'update'] },
  )
  versions: Version[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
