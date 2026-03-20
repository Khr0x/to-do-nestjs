export class RefreshTokenDto {
  id: string;
  token: string;
  userId: string;
  userEmail: string;
  expiresAt: Date;
  revoked: boolean;
}