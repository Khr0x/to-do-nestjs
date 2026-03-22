import { IsString, IsEnum, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { Prioridad } from '../entities/todo.entity';

export class CreateTodoDto {
  @IsString()
  @MaxLength(255)
  nombre: string;

  @IsEnum(Prioridad)
  @IsOptional()
  prioridad?: Prioridad;

  @IsBoolean()
  @IsOptional()
  finalizada?: boolean;
}
