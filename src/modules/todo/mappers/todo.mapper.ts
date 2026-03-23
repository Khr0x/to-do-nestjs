import { PaginationTodoDto } from "../dtos/pagination-todo.dto";
import { TodoDto } from "../dtos/todo.dto";
import { Todo } from "../entities/todo.entity";

export class TodoMapper {
  static toDto(todo: Todo): TodoDto {
    return {
      id: todo.id,
      nombre: todo.nombre,
      prioridad: todo.prioridad,
      finalizada: todo.finalizada,
      fechaCreacion: todo.fechaCreacion,
      fechaActualizacion: todo.fechaActualizacion,
    };
  }

  static toDtoPagination(todos: Todo[], total: number, page: number, limit: number): PaginationTodoDto<TodoDto> {
    return {
      data: todos.map(this.toDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static toEntity(todoDto: TodoDto): Todo {
    const todo = new Todo();
    todo.id = todoDto.id;
    todo.nombre = todoDto.nombre;
    todo.prioridad = todoDto.prioridad as any;
    todo.finalizada = todoDto.finalizada;
    return todo;
  }
}