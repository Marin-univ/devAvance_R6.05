import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerDatabaseService } from './player-database.service';
import { Player } from './player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [PlayerDatabaseService],
  exports: [PlayerDatabaseService],
})
export class PlayerModule {}
