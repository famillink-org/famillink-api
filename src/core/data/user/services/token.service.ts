import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from '../entities/token.entity';
import { ETokenType } from '../entities/enum-token-type';
import { ITokenService } from '../interfaces/token.service.interface';

@Injectable()
export class TokenService implements ITokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
  ) {}

  async create(entity: TokenEntity): Promise<number> {
    return await this.tokenRepository.save(entity).then((res) => res.id);
  }

  async read(id: number): Promise<TokenEntity | null> {
    return await this.tokenRepository.findOneBy({ id }).then((res) => res);
  }

  async readByToken(token: string): Promise<TokenEntity | null> {
    return await this.tokenRepository.findOneBy({ token }).then((res) => res);
  }

  async readByTokenWithUser(token: string): Promise<TokenEntity | null> {
    return await this.tokenRepository
      .findOne({ where: { token: token }, relations: { user: true } })
      .then((res) => res);
  }

  async readByTokenAndType(
    token: string,
    tokenType: ETokenType,
  ): Promise<TokenEntity | null> {
    return await this.tokenRepository
      .findOneBy({ token, tokenType })
      .then((res) => res);
  }

  async readByTokenWithUserWhereUserIdIsUserIdIdAndTokenIsValid(
    token: string,
    userId: number,
  ): Promise<TokenEntity | null> {
    return await this.tokenRepository
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .andWhere('user.id = :userId', { userId: userId })
      .andWhere('token.expirationDatetime > :now', { now: new Date() })
      .getOne();
  }

  async update(entity: TokenEntity): Promise<void> {
    return await this.tokenRepository.save(entity).then(() => undefined);
  }

  async delete(id: number): Promise<void> {
    return await this.tokenRepository.delete(id).then(() => undefined);
  }
}
