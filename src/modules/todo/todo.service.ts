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

  async findOne(id: string, userId: string): Promise<TodoDto> {
    const todo = await this.todoRepository.findOne({
      where: { id, userId },
    });

    if (!todo) {
      throw new NotFoundException(`Todo con id ${id} no encontrado`);
    }

    return TodoMapper.toDto(todo);
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<TodoDto> {
    const dto = await this.findOne(id, userId);
    const todo = TodoMapper.toEntity(dto);
    Object.assign(todo, updateTodoDto);
    todo.fechaActualizacion = new Date();
    const updatedTodo = await this.todoRepository.save(todo);
    return TodoMapper.toDto(updatedTodo);
  }

  async remove(id: string, userId: string): Promise<void> {
    const dto = await this.findOne(id, userId);
    const todo = TodoMapper.toEntity(dto);
    await this.todoRepository.softRemove(todo);
  }
}
