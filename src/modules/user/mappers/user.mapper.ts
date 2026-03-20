import { CreateUserDto } from "../dtos/create-user.dto";
import { UserDto } from "../dtos/user.dto";
import { User } from "../entities/user.entity";

export class UserMapper {
    static toDto(user: User, full: boolean = false): UserDto {
        const { id, nombre, email, ultimoLogin, activo, fechaCreacion, fechaActualizacion } = user;
        return { 
            id, 
            name: nombre, 
            email, 
            lastLogin: ultimoLogin, 
            isActive: activo, 
            createdAt: fechaCreacion, 
            updatedAt: fechaActualizacion,
            ...(full && { password: user.password }) 
        };
    }
}