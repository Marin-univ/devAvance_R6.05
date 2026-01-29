import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RankingService, PlayerRanking, RankingUpdate } from './ranking.service';

@Controller('api/ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  async getRanking(): Promise<PlayerRanking[]> {
    return this.rankingService.getRanking();
  }

  @Sse('events')
  subscribeToRankingEvents(): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const callback = (update: RankingUpdate) => {
        subscriber.next({
          data: update,
        } as MessageEvent);
      };

      const unsubscribe = this.rankingService.subscribe(callback);

      return () => {
        unsubscribe();
      };
    });
  }
}
