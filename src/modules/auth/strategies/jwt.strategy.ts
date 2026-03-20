import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: JwtStrategy.extractJWT,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  private static extractJWT(req: Request): string | null {
    const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    
    if (tokenFromHeader) {
      return tokenFromHeader; 
    }

    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies.access_token;
    }

    return null;
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}