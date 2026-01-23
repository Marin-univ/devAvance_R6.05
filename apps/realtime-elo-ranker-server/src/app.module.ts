import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RankingService } from './ranking/ranking.service';
import { PlayerModule } from './player/player.module';
import { Player } from './player/player.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'players.db',
      entities: [Player],
      synchronize: true,
    }),
    PlayerModule,
  ],
  controllers: [AppController],
  providers: [AppService, RankingService],
})
export class AppModule {}
