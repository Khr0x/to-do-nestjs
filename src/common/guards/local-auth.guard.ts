import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * LocalAuthGuard es un guardia de autenticación que utiliza la estrategia 'local' de Passport
 * para validar las credenciales del usuario (email y contraseña) durante el proceso de login.
 * Se utiliza en el AuthController para proteger el endpoint de login, asegurando que solo los
 * usuarios con credenciales válidas puedan acceder y generar tokens de autenticación.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}