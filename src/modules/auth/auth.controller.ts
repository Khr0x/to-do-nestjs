import { Body, Controller, HttpCode, Post, Req, Res, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import { LocalAuthGuard } from "../../common/guards/local-auth.guard";
import type { Request, Response } from 'express';
import { LoginDto } from "./dtos/login.dto";
import { CreateUserDto } from "../user/dtos/create-user.dto";


@Controller('/v1/auth')
export class AuthController {
  constructor(
    private authService: AuthService, 
  ) {}

  /**
   * Endpoint para login de usuarios
   * Usa LocalAuthGuard para validar credenciales antes de ejecutar el método
   * Genera tokens de acceso y refresh, y los envía en cookies seguras
   * @param loginDto - DTO con email y contraseña
   * @param req - Objeto Request para acceder al usuario autenticado por el guard
   * @param response - Objeto Response para configurar las cookies
   * @returns Mensaje de éxito (los tokens se envían en cookies)
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Req() req: Request,   
    @Res({ passthrough: true }) 
    response: Response
) {
    const user = (req as any).user;
    const authResult = await this.authService.generateAuthTokens(user);

    response.cookie('access_token', authResult.accessToken, authResult.cookies.access);
    response.cookie('refresh_token', authResult.refreshToken, authResult.cookies.refresh);

    return {  message: 'Login successful' };

  }

  /**
   * Endpoint para registro de nuevos usuarios
   * Recibe un CreateUserDto con los datos necesarios para crear el usuario
   * Llama al servicio de autenticación para registrar al usuario
   * @param createUserDto - DTO con los datos para crear el usuario
   * @returns El usuario creado (sin contraseña)
   */
  @Post('register')
  @HttpCode(201)
  async register(@Body() createUserDto: CreateUserDto) {
    await this.authService.register(createUserDto);
  }

}