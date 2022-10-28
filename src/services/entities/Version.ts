import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from './Service';

@Entity()
export class Version {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(
    () => Service,
    service => service.versions,
  )
  service: Service;

  @Column('varchar', { length: 60 })
  label: string;

  @Column('varchar', { length: 60 })
  status: string;

  @Column('varchar', { length: 200, default: '' })
  description: string;

  @Column('varchar', { length: 60, default: '' })
  environment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
