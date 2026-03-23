import { IsString, IsEnum, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { Prioridad } from '../entities/todo.entity';

export class UpdateTodoDto {
  @IsString({ message: 'El nombre de la tarea debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(255, { message: 'El nombre de la tarea no puede exceder los 255 caracteres' })
  nombre?: string;

  @IsEnum(Prioridad, { message: 'La prioridad debe ser un valor válido' })
  @IsOptional()
  prioridad?: Prioridad;

  @IsBoolean({ message: 'El campo finalizada debe ser un valor booleano' })
  @IsOptional()
  finalizada?: boolean;
}
