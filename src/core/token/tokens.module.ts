import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from '../data/user/entities/token.entity';
import { UserEntity } from '../data/user/entities/user.entity';
import { TokenEngineService } from './token.engine.service';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule, TypeOrmModule.forFeature([TokenEntity, UserEntity])],
  providers: [TokenEngineService],
  exports: [TokenEngineService],
})
export class TokensModule {}
