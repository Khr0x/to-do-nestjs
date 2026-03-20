import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum Prioridad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: Prioridad,
    default: Prioridad.MEDIA,
  })
  prioridad: Prioridad;

  @Column({ default: false })
  finalizada: boolean;

  @ManyToOne(() => User, (user) => user.todos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @UpdateDateColumn({ onUpdate: 'CURRENT_TIMESTAMP' })
  fechaActualizacion: Date;

  @DeleteDateColumn()
  fechaEliminacion?: Date;
}
