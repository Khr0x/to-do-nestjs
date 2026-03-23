import { Body, Controller, Get, HttpCode, Post, Req, Request, Res, UnauthorizedException, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "../../common/guards/local-auth.guard";
import type { Response } from 'express';
import { LoginDto } from "./dtos/login.dto";
import { CreateUserDto } from "../user/dtos/create-user.dto";
import { ThrottlerGuard } from "@nestjs/throttler";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";


@UseGuards(ThrottlerGuard)
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
  @HttpCode(200)
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

    return true;

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
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    await this.authService.register(createUserDto);
  }

  /**
   * Endpoint para obtener el perfil del usuario autenticado
   * Usa JwtAuthGuard para proteger el endpoint y asegurar que solo usuarios autenticados puedan acceder
   * @param req - Objeto Request para acceder al usuario autenticado por el guard
   * @returns El perfil del usuario autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }


  /**
   * Endpoint para logout de usuarios
   * Usa JwtAuthGuard para asegurar que solo usuarios autenticados puedan hacer logout
   * Limpia las cookies de acceso y refresh token, y llama al servicio de autenticación para invalidar el refresh token
   * @param req - Objeto Request para acceder al usuario autenticado por el guard
   * @param response - Objeto Response para limpiar las cookies
   * @returns Mensaje de éxito (las cookies se limpian en la respuesta)
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    await this.authService.logout(req.user.userId);
    return true;
  }

  /**
   * Endpoint para refrescar tokens de acceso usando el refresh token
   * Recibe el refresh token desde las cookies, y si es válido, genera nuevos tokens y los envía en cookies seguras
   * Si el refresh token no es válido, limpia las cookies y lanza una excepción de no autorizado
   * @param req - Objeto Request para acceder a las cookies
   * @param response - Objeto Response para configurar las nuevas cookies o limpiar las existentes
   * @returns Mensaje de éxito (los nuevos tokens se envían en cookies)
   */
  @Post('refresh')
  async refresh(
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const oldRefreshToken = req.cookies['refresh_token'];
    
    if (!oldRefreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    try {
        const { accessToken, refreshToken, cookies } = await this.authService.refresh(oldRefreshToken);
        response.cookie('access_token', accessToken, cookies.access);
        response.cookie('refresh_token', refreshToken, cookies.refresh);

        return { message: 'Token refreshed' };  
    } catch (error) {
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      throw new UnauthorizedException('Invalid refresh token');
    }

  }
  
}