import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter } from 'events';
import { PlayerDatabaseService } from '../player/player-database.service';

export interface RankingUpdate {
  type: 'RankingUpdate';
  player: {
    id: string;
    rank: number;
  };
}

export interface PlayerRanking {
  id: string;
  rank: number;
}

@Injectable()
export class RankingService {
  private readonly eventEmitter = new EventEmitter();

  constructor(private readonly playerDatabaseService: PlayerDatabaseService) {
    this.eventEmitter.setMaxListeners(100);
  }

  async getRanking(): Promise<PlayerRanking[]> {
    const players = await this.playerDatabaseService.getRanking();
    
    if (players.length === 0) {
      throw new NotFoundException({
        code: 404,
        message: "Le classement n'est pas disponible car aucun joueur n'existe",
      });
    }

    return players.map((player) => ({
      id: player.id,
      rank: player.elo,
    }));
  }

  async emitRankingUpdate(playerId: string): Promise<void> {
    const player = await this.playerDatabaseService.findById(playerId);
    
    if (!player) {
      return;
    }

    const update: RankingUpdate = {
      type: 'RankingUpdate',
      player: {
        id: player.id,
        rank: player.elo,
      },
    };

    this.eventEmitter.emit('rankingUpdate', update);
  }


  subscribe(callback: (update: RankingUpdate) => void): () => void {
    this.eventEmitter.on('rankingUpdate', callback);
    
    return () => {
      this.eventEmitter.off('rankingUpdate', callback);
    };
  }

  async emitPlayerCreated(playerId: string): Promise<void> {
    await this.emitRankingUpdate(playerId);
  }
}