import { Module, forwardRef } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [forwardRef(() => PlayerModule)],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
