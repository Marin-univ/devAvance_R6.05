import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RankingService } from './ranking/ranking.service';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [PlayerModule],
  controllers: [AppController],
  providers: [AppService, RankingService],
})
export class AppModule {}
