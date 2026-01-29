import {
  Controller,
  Post,
  Body,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PlayerDatabaseService } from './player-database.service';
import { RankingService } from '../ranking/ranking.service';

export interface CreatePlayerDto {
  id: string;
}

export interface PlayerResponse {
  id: string;
  rank: number;
}

@Controller('api/player')
export class PlayerController {
  constructor(
    private readonly playerDatabaseService: PlayerDatabaseService,
    private readonly rankingService: RankingService,
  ) {}

  @Post()
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto): Promise<PlayerResponse> {
    const { id } = createPlayerDto;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new BadRequestException({
        code: 400,
        message: "L'identifiant du joueur n'est pas valide",
      });
    }

    const existingPlayer = await this.playerDatabaseService.findById(id);
    if (existingPlayer) {
      throw new ConflictException({
        code: 409,
        message: 'Le joueur existe déjà',
      });
    }

    const player = await this.playerDatabaseService.create(id);
    await this.rankingService.emitPlayerCreated(id);

    return {
      id: player.id,
      rank: player.elo,
    };
  }
}
