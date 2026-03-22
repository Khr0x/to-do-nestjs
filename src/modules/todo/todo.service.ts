import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { UpdateTodoDto } from './dtos/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: string): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId,
    });
    return await this.todoRepository.save(todo);
  }

  async findAll(userId: string): Promise<Todo[]> {
    return await this.todoRepository.find({
      where: { userId },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id, userId },
    });

    if (!todo) {
      throw new NotFoundException(`Todo con id ${id} no encontrado`);
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    Object.assign(todo, updateTodoDto);
    return await this.todoRepository.save(todo);
  }

  async remove(id: string, userId: string): Promise<void> {
    const todo = await this.findOne(id, userId);
    await this.todoRepository.softRemove(todo);
  }
}
