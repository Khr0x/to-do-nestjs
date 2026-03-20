import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../user/user.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../user/dtos/create-user.dto";
import { genSalt, hash } from "bcrypt";
import { comparePassword } from "src/common/utils/hash.util";
import { AuthResponse } from "./dtos/auth-response.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}


  /**
   * Genera tokens de acceso y refresh después de validar credenciales
   * @param user - Usuario ya autenticado (sin contraseña)
   * @returns Tokens de acceso y refresh
   */
  async generateAuthTokens(user: any): Promise<AuthResponse> {

    const foundUser = await this.usersService.findOne({ where: { email: user.email } });
    if (!foundUser) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get('COOKIE_DOMAIN');


    const baseCookie = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
      domain: cookieDomain || undefined,
      path: '/',
    };

    return {
      accessToken,
      refreshToken,
      cookies: {
        access: {
          ...baseCookie,
          maxAge: 24 * 60 * 60 * 1000, // 24 horas
        },
        refresh: {
          ...baseCookie,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        },
      },
    };
  }

  /**
   * Registra un nuevo usuario
   * @param createUserDto - Datos para crear el usuario
   */
    async register(createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }


   /**
   * Valida las credenciales de un usuario (email y contraseña)
   * Usado por LocalStrategy durante el proceso de autenticación
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano
   * @returns Usuario sin contraseña si las credenciales son válidas, null si no
   */
  async validateCredentials(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne({ where: { email } }, true);
    if (user && await comparePassword(pass, user.password || '')) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }


   /**
   * Obtiene la información del usuario actual
   * @param userId - ID del usuario
   * @returns Información del usuario
   */
  async me(userId: string) {
    const user = await this.usersService.findOne({ 
      where: { id: userId },
      relations: ['roles', 'roles.permissions'] 
    });
        if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
        }
        return user;
   }

   /**
   * Genera un nuevo refresh token para un usuario
   * @param userId - ID del usuario
   * @returns Token de refresh generado
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const token = await genSalt(20);
    const tokenHash = await hash(token, 10);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS || '7'));

    await this.refreshTokenService.create(
      userId,
      tokenHash,
      expiryDate
    );

    return token;
  }




}