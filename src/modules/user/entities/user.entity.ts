import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Todo } from '../../todo/entities/todo.entity';
import { RefreshToken } from '../../../modules/auth/entities/refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  ultimoLogin: Date;

  @CreateDateColumn({default: () => 'CURRENT_TIMESTAMP'})
  fechaCreacion: Date;

  @UpdateDateColumn({onUpdate: 'CURRENT_TIMESTAMP'})
  fechaActualizacion: Date;

  @DeleteDateColumn()
  fechaEliminacion?: Date;

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
