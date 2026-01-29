import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerController } from './player.controller';
import { PlayerDatabaseService } from './player-database.service';
import { Player } from './player.entity';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player]),
    forwardRef(() => RankingModule),
  ],
  controllers: [PlayerController],
  providers: [PlayerDatabaseService],
  exports: [PlayerDatabaseService],
})
export class PlayerModule {}
