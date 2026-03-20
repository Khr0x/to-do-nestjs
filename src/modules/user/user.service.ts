import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { FindOneOptions, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UserDto } from "./dtos/user.dto";
import { CreateUserDto } from "./dtos/create-user.dto";
import { hashPassword } from "../../common/utils/hash.util";
import { UserMapper } from "./mappers/user.mapper";

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>
  ) {}


   /** Crea un nuevo usuario a partir de los datos proporcionados en el CreateUserDto. 
   * Verifica si el correo electrónico ya está registrado, hashea la contraseña y guarda el nuevo usuario en la base de datos.
   * @param createUserDto - Datos necesarios para crear un nuevo usuario
   * @returns El usuario creado convertido a UserDto
   * @throws ConflictException si el correo electrónico ya está registrado
   * @throws BadRequestException si ocurre un error al guardar el usuario
   */
    async create(createUserDto: CreateUserDto): Promise<UserDto> {
        const { email, password, ...rest } = createUserDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('El correo electrónico ya está registrado');
        }
        const hashedPassword = await hashPassword(password);    
        const newUser = this.userRepository.create({
            ...rest, 
            email, 
            password: hashedPassword,
            activo: true,
            fechaCreacion: new Date(),
        });
        try {
            const savedUser = await this.userRepository.save(newUser);
            return UserMapper.toDto(savedUser);
        } catch (error) {
            throw new BadRequestException('Error al crear el usuario');
        }
    }

    /**
     *  Busca un usuario por sus filtros. Si no se encuentra, lanza una excepción NotFoundException.
     * @param filters  - Filtros para buscar el usuario (puede incluir condiciones y relaciones)
     * @returns  - El usuario encontrado convertido a UserDto
     */
    async findOne(filters: FindOneOptions<UserDto>, full: boolean = false): Promise<UserDto> {
        const user = await this.userRepository.findOne({ where: { ...filters.where }, relations: filters.relations });

        if (!user) {
        throw new NotFoundException(`Usuario no encontrado`);
        }
        return UserMapper.toDto(user, full);
    }

}