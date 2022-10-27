import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { length: 60 })
  @Index({ unique: false })
  name: string;

  @Column('varchar', { length: 200, default: '' })
  description: string;

  @Column({ type: 'integer', default: 0 })
  versions: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
