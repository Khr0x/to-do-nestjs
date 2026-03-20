import { RefreshTokenDto } from "../../dtos/refresh-token.dto";
import { RefreshToken } from "../../entities/refresh-token.entity";

export class RefreshTokenMapper {
  static toDto(refreshToken: RefreshToken): RefreshTokenDto {
    return {
      id: refreshToken.id,
      token: refreshToken.token,
      userId: refreshToken.user.id,
      userEmail: refreshToken.user.email,
      expiresAt: refreshToken.expiresAt,
      revoked: refreshToken.revoked,
    };
  }
}