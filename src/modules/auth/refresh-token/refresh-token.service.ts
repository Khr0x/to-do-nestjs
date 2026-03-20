import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { RefreshToken } from "../entities/refresh-token.entity";
import { User } from "../../user/entities/user.entity";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { RefreshTokenMapper } from "./mappers/refresh-token.mapper";

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject('REFRESH_TOKEN_REPOSITORY')
    private refreshTokenRepo: Repository<RefreshToken>,
  ) {}


  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    
    const refreshToken = this.refreshTokenRepo.create({
      token,
      user: { id: userId } as User,
      expiresAt,
      revoked: false,
    });
    return this.refreshTokenRepo.save(refreshToken);
  }

  async findValidToken(token: string): Promise<RefreshTokenDto| null> {
    const refreshToken = await this.refreshTokenRepo.findOne({
      where: { token, revoked: false },
      relations: ['user'],
    });
    if (!refreshToken) {
      return null;
    }
    return RefreshTokenMapper.toDto(refreshToken);
  }

  async revoke(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepo.findOne({ where: { token } });
    if (refreshToken) {
      refreshToken.revoked = true;
      await this.refreshTokenRepo.save(refreshToken);
    }
  }

   async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.update(
      { user: { id: userId } },
      { revoked: true }
    );
  }

}