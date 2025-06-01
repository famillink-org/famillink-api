import { Injectable } from '@nestjs/common';
import { UserService } from '../data/user/services/user.service';
import { v4 as uuidv4 } from 'uuid';
import { TokenEntity } from '../data/user/entities/token.entity';
import { TokenService } from '../data/user/services/token.service';
import { ETokenType } from '../data/user/entities/enum-token-type';
import { UserEntity } from '../data/user/entities/user.entity';

@Injectable()
export class TokenEngineService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async createTokenForNewUser(
    userId: number,
    duration: number,
  ): Promise<string> {
    return this.createToken(userId, duration, ETokenType.Initialisation);
  }

  async createTokenForPasswordReset(
    userId: number,
    duration: number,
  ): Promise<string> {
    return this.createToken(userId, duration, ETokenType.Reset);
  }

  async isTokenValide(token: string): Promise<boolean> {
    const tokenEntity = await this.tokenService.readByToken(token);
    return (
      !!tokenEntity &&
      !!tokenEntity.expirationDatetime &&
      Date.now() < tokenEntity.expirationDatetime.getTime()
    );
  }

  async getUserForToken(token: string): Promise<UserEntity | null | undefined> {
    const tokenEntity = await this.tokenService.readByTokenWithUser(token);
    console.dir(tokenEntity);
    return tokenEntity?.user;
  }

  async getUserForTokenWhereUserIdIsUserIdIdAndTokenIsValid(
    token: string,
    userId: number,
  ): Promise<UserEntity | null | undefined> {
    return await this.tokenService
      .readByTokenWithUserWhereUserIdIsUserIdIdAndTokenIsValid(token, userId)
      .then((res) => res?.user);
  }

  async setTokenUsed(token: string): Promise<void> {
    const tokenEntity = await this.tokenService.readByToken(token);
    if (tokenEntity) {
      if (
        tokenEntity.tokenType === ETokenType.Initialisation ||
        tokenEntity.tokenType === ETokenType.Reset
      ) {
        tokenEntity.expirationDatetime = new Date();
      }
      tokenEntity.used = true;
      await this.tokenService.update(tokenEntity);
    }
  }

  async addUsedJwtToken(token: string, userId: number): Promise<void> {
    const tokenEntity = new TokenEntity();
    tokenEntity.user = await this.userService.read(userId);
    tokenEntity.token = token;
    tokenEntity.tokenType = ETokenType.JWT;
    tokenEntity.used = true;
    tokenEntity.expirationDatetime = new Date();
    await this.tokenService.create(tokenEntity);
  }

  async isJwtTokenUsed(token: string): Promise<boolean> {
    const tokenEntity = await this.tokenService.readByTokenAndType(
      token,
      ETokenType.JWT,
    );
    return tokenEntity ? tokenEntity.used : false;
  }

  private async createToken(
    userId: number,
    duration: number,
    type: ETokenType,
  ): Promise<string> {
    const tokenEntity = new TokenEntity();
    tokenEntity.user = await this.userService.read(userId);
    tokenEntity.token = uuidv4();
    tokenEntity.tokenType = type;
    tokenEntity.used = false;
    tokenEntity.expirationDatetime = this.createExpirationDate(duration);
    await this.tokenService.create(tokenEntity);
    return tokenEntity.token;
  }

  private createExpirationDate(duration: number): Date {
    const date = new Date();
    date.setTime(date.getTime() + duration);
    return date;
  }
}
