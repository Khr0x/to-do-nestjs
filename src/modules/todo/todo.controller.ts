import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { UpdateTodoDto } from './dtos/update-todo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('v1/todo')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * Endpoint para crear una nueva tarea
   * Recibe un CreateTodoDto con los datos de la tarea a crear
   * El usuario autenticado se obtiene del objeto Request (req.user)
   * Llama al servicio de tareas para crear la tarea asociada al usuario
   * @param createTodoDto - DTO con los datos para crear la tarea
   * @param req - Objeto Request para acceder al usuario autenticado
   * @returns La tarea creada 
   */
  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createTodoDto: CreateTodoDto, @Request() req) {
    return this.todoService.create(createTodoDto, req.user.userId);
  }

  /**
   * Endpoint para obtener la lista de tareas del usuario autenticado
   * Permite paginación y filtrado por prioridad y estado de finalización
   * El usuario autenticado se obtiene del objeto Request (req.user)
   * Llama al servicio de tareas para obtener las tareas asociadas al usuario con los filtros aplicados
   * @param req - Objeto Request para acceder al usuario autenticado
   * @param page - Número de página para paginación (opcional)
   * @param limit - Cantidad de items por página para paginación (opcional)
   * @param prioridad - Filtro por prioridad de la tarea (opcional)
   * @param finalizada - Filtro por estado de finalización de la tarea (opcional)
   * @returns Lista paginada de tareas que cumplen con los filtros aplicados
   */
  @Get('/list')
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('prioridad') prioridad?: string,
    @Query('finalizada') finalizada?: string,
  ) {
    const options = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      prioridad,
      finalizada: finalizada ? finalizada === 'true' : undefined,
    };
    return this.todoService.findAll(req.user.userId, options);
  }

  /**
   * Endpoint para obtener una tarea específica por su ID
   * El usuario autenticado se obtiene del objeto Request (req.user)
   * Llama al servicio de tareas para obtener la tarea asociada al usuario y al ID proporcionado
   * @param id - ID de la tarea a obtener
   * @param req - Objeto Request para acceder al usuario autenticado
   * @returns La tarea encontrada o null si no existe o no pertenece al usuario
   */
  @Get('/list/:id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.todoService.findOne(id, req.user.userId);
  }

  /**
   * Endpoint para actualizar una tarea específica por su ID
   * Recibe un UpdateTodoDto con los datos a actualizar de la tarea
   * El usuario autenticado se obtiene del objeto Request (req.user)
   * Llama al servicio de tareas para actualizar la tarea asociada al usuario y al ID proporcionado con los nuevos datos
   * @param id - ID de la tarea a actualizar
   * @param updateTodoDto - DTO con los datos para actualizar la tarea
   * @param req - Objeto Request para acceder al usuario autenticado
   * @returns La tarea actualizada o null si no existe o no pertenece al usuario
   */
  @Patch('/update/:id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTodoDto: UpdateTodoDto,
    @Request() req,
  ) {
    return this.todoService.update(id, updateTodoDto, req.user.userId);
  }

  /**
   * Endpoint para eliminar una tarea específica por su ID
   * El usuario autenticado se obtiene del objeto Request (req.user)
   * Llama al servicio de tareas para eliminar la tarea asociada al usuario y al ID proporcionado
   * @param id - ID de la tarea a eliminar
   * @param req - Objeto Request para acceder al usuario autenticado
   * @returns Mensaje de éxito si la tarea se elimina correctamente
   */
  @Delete('/list/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.todoService.remove(id, req.user.userId);
  }
}
