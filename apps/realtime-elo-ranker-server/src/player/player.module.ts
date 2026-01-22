import { Module } from '@nestjs/common';
import { PlayerDatabaseService } from './player-database.service';

@Module({
  providers: [PlayerDatabaseService],
  exports: [PlayerDatabaseService],
})
export class PlayerModule {}
