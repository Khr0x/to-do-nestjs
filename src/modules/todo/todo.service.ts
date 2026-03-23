import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { UpdateTodoDto } from './dtos/update-todo.dto';
import { PaginationTodoDto } from './dtos/pagination-todo.dto';
import { TodoDto } from './dtos/todo.dto';
import { TodoMapper } from './mappers/todo.mapper';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  /**
   * Crea una nueva tarea asociada a un usuario específico
   * Recibe un CreateTodoDto con los datos de la tarea a crear y el ID del usuario
   * Crea una nueva entidad Todo, la guarda en la base de datos y devuelve un TodoDto con los datos de la tarea creada
   * @param createTodoDto - DTO con los datos para crear la tarea
   * @param userId - ID del usuario al que se asociará la tarea
   * @returns Un TodoDto con los datos de la tarea creada
   */
  async create(createTodoDto: CreateTodoDto, userId: string): Promise<TodoDto> {
    const now = new Date();
    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId,
      fechaCreacion: now,
      fechaActualizacion: now,
    });
    const savedTodo = await this.todoRepository.save(todo);
    return TodoMapper.toDto(savedTodo);
  }

  /**
   * Obtiene una lista paginada de tareas asociadas a un usuario específico, con opciones de filtrado por prioridad y estado de finalización
   * Recibe el ID del usuario y un objeto con las opciones de paginación y filtrado
   * Consulta la base de datos para obtener las tareas que cumplen con los criterios especificados, y devuelve un PaginationTodoDto con los resultados
   * @param userId - ID del usuario cuyas tareas se desean obtener
   * @param options - Objeto con las opciones de paginación (page, limit) y filtrado (prioridad, finalizada)
   * @returns Un PaginationTodoDto con la lista de tareas que cumplen con los criterios especificados, junto con información de paginación
   */
  async findAll(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      prioridad?: string;
      finalizada?: boolean;
    },
  ): Promise<PaginationTodoDto<TodoDto>> {
    const { page = 1, limit = 10, prioridad, finalizada } = options;

    const where: any = { userId };
    if (prioridad) where.prioridad = prioridad;
    if (finalizada !== undefined) where.finalizada = finalizada;

    const [todos, total] = await this.todoRepository.findAndCount({
      where,
      order: { fechaCreacion: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return TodoMapper.toDtoPagination(todos, total, page, limit);
  }

  /**
   * Obtiene una tarea específica por su ID, asegurando que pertenece al usuario autenticado
   * Recibe el ID de la tarea y el ID del usuario
   * Consulta la base de datos para encontrar la tarea que coincide con el ID proporcionado y que pertenece al usuario, y devuelve un TodoDto con los datos de la tarea encontrada
   * Si no se encuentra la tarea o no pertenece al usuario, lanza una excepción NotFoundException
   * @param id - ID de la tarea a obtener
   * @param userId - ID del usuario al que debe pertenecer la tarea
   * @returns Un TodoDto con los datos de la tarea encontrada o lanza una excepción si no se encuentra o no pertenece al usuario
   */
  async findOne(id: string, userId: string): Promise<TodoDto> {
    const todo = await this.todoRepository.findOne({
      where: { id, userId },
    });

    if (!todo) {
      throw new NotFoundException(`Todo con id ${id} no encontrado`);
    }

    return TodoMapper.toDto(todo);
  }

  /**
   * Actualiza una tarea específica por su ID, asegurando que pertenece al usuario autenticado
   * Recibe el ID de la tarea a actualizar, un UpdateTodoDto con los datos a actualizar y el ID del usuario
   * Consulta la base de datos para encontrar la tarea que coincide con el ID proporcionado y que pertenece al usuario, actualiza sus datos con los valores del DTO, guarda los cambios en la base de datos y devuelve un TodoDto con los datos de la tarea actualizada
   * Si no se encuentra la tarea o no pertenece al usuario, lanza una excepción NotFoundException
   * @param id - ID de la tarea a actualizar
   * @param updateTodoDto - DTO con los datos para actualizar la tarea
   * @param userId - ID del usuario al que debe pertenecer la tarea
   * @returns Un TodoDto con los datos de la tarea actualizada o lanza una excepción si no se encuentra o no pertenece al usuario
   */
  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<TodoDto> {
    const dto = await this.findOne(id, userId);
    const todo = TodoMapper.toEntity(dto);
    Object.assign(todo, updateTodoDto);
    todo.fechaActualizacion = new Date();
    const updatedTodo = await this.todoRepository.save(todo);
    return TodoMapper.toDto(updatedTodo);
  }

  /**
   * Elimina una tarea específica por su ID, asegurando que pertenece al usuario autenticado
   * Recibe el ID de la tarea a eliminar y el ID del usuario
   * Consulta la base de datos para encontrar la tarea que coincide con el ID proporcionado y que pertenece al usuario, y la elimina de forma suave (soft delete)
   * Si no se encuentra la tarea o no pertenece al usuario, lanza una excepción NotFoundException
   * @param id - ID de la tarea a eliminar
   * @param userId - ID del usuario al que debe pertenecer la tarea
   * @returns void
   */
  async remove(id: string, userId: string): Promise<void> {
    const dto = await this.findOne(id, userId);
    const todo = TodoMapper.toEntity(dto);
    await this.todoRepository.softRemove(todo);
  }
}
