import { Injectable } from '@nestjs/common';
import { Player } from './player.entity';

@Injectable()
export class PlayerDatabaseService {
  async create(id: string, elo: number = 1000): Promise<Player> {
    return Player.createPlayer(id, elo);
  }

  async findById(id: string): Promise<Player | null> {
    return Player.findOneBy({ id });
  }

  async findAll(): Promise<Player[]> {
    return Player.findAllOrderedByElo();
  }

  async updateElo(id: string, elo: number): Promise<Player | null> {
    const player = await this.findById(id);
    if (!player) return null;
    return player.updateElo(elo);
  }

  async delete(id: string): Promise<boolean> {
    const result = await Player.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const player = await this.findById(id);
    return player !== null;
  }

  async getRanking(): Promise<{ id: string; elo: number; rank: number }[]> {
    return Player.getRanking();
  }
}
