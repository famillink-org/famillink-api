import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { DataModule } from '../../core/data/data.module';
import { UsersEngineService } from './services/users.engine.service';

@Module({
  imports: [DataModule],
  controllers: [UsersController],
  providers: [UsersEngineService],
  exports: [UsersEngineService],
})
export class UsersModule {}
