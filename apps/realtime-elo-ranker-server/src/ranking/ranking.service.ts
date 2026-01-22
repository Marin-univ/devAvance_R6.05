import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingService {
  private ranking = new Map<string, number>();

  setPlayer(playerId: string, elo: number) {
    this.ranking.set(playerId, elo);
  }

  getPlayer(playerId: string): number | undefined {
    return this.ranking.get(playerId);
  }

  getAll() {
    return Object.fromEntries(this.ranking);
  }
}