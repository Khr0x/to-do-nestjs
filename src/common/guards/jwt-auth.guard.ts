import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard es un guardia de autenticación que utiliza la estrategia 'jwt' de Passport
 * para validar el token JWT incluido en las solicitudes protegidas. Se utiliza para asegurar
 * que solo los usuarios autenticados puedan acceder a ciertos endpoints, verificando la
 * validez del token y extrayendo la información del usuario asociada.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}