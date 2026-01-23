import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('players')
export class Player extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'integer', default: 1000 })
  elo: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async findAllOrderedByElo(): Promise<Player[]> {
    return this.find({ order: { elo: 'DESC' } });
  }

  static async getRanking(): Promise<{ id: string; elo: number; rank: number }[]> {
    const players = await this.findAllOrderedByElo();
    return players.map((player, index) => ({id: player.id,elo: player.elo,rank: index + 1,}));
  }
  
  static async createPlayer(id: string, elo: number = 1000): Promise<Player> {
    const player = this.create({ id, elo });
    return player.save();
  }

  async updateElo(newElo: number): Promise<Player> {
    this.elo = newElo;
    return this.save();
  }
}
