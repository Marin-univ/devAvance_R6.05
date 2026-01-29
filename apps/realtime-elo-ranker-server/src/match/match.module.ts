import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { RankingModule } from '../ranking/ranking.module';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [RankingModule, PlayerModule],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
