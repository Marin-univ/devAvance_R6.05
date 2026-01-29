import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PlayerDatabaseService } from '../player/player-database.service';
import { RankingService } from '../ranking/ranking.service';

export interface MatchResult {
  winner: { id: string; rank: number };
  loser: { id: string; rank: number };
}

export interface MatchInput {
  winner: string;
  loser: string;
  draw?: boolean;
}

@Injectable()
export class MatchService {
  private readonly K_FACTOR = 32;

  constructor(
    private readonly playerDatabaseService: PlayerDatabaseService,
    private readonly rankingService: RankingService,
  ) {}

  private calculateExpectedScore(playerElo: number, opponentElo: number): number {
    return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  }

  private calculateNewElo(
    currentElo: number,
    expectedScore: number,
    actualScore: number,
  ): number {
    return Math.round(currentElo + this.K_FACTOR * (actualScore - expectedScore));
  }

  async publishMatchResult(matchInput: MatchInput): Promise<MatchResult> {
    const { winner: winnerId, loser: loserId, draw = false } = matchInput;

    // Vérifier que les deux joueurs existent
    const winnerPlayer = await this.playerDatabaseService.findById(winnerId);
    const loserPlayer = await this.playerDatabaseService.findById(loserId);

    if (!winnerPlayer) {
      throw new UnprocessableEntityException({
        code: 422,
        message: `Le joueur "${winnerId}" n'existe pas`,
      });
    }

    if (!loserPlayer) {
      throw new UnprocessableEntityException({
        code: 422,
        message: `Le joueur "${loserId}" n'existe pas`,
      });
    }

    const winnerExpected = this.calculateExpectedScore(
      winnerPlayer.elo,
      loserPlayer.elo,
    );
    const loserExpected = this.calculateExpectedScore(
      loserPlayer.elo,
      winnerPlayer.elo,
    );

    const winnerActualScore = draw ? 0.5 : 1;
    const loserActualScore = draw ? 0.5 : 0;

    const newWinnerElo = this.calculateNewElo(
      winnerPlayer.elo,
      winnerExpected,
      winnerActualScore,
    );
    const newLoserElo = this.calculateNewElo(
      loserPlayer.elo,
      loserExpected,
      loserActualScore,
    );

    await this.playerDatabaseService.updateElo(winnerId, newWinnerElo);
    await this.playerDatabaseService.updateElo(loserId, newLoserElo);

    await this.rankingService.emitRankingUpdate(winnerId);
    await this.rankingService.emitRankingUpdate(loserId);

    const ranking = await this.playerDatabaseService.getRanking();
    const winnerRank = ranking.find((p) => p.id === winnerId)?.rank ?? 0;
    const loserRank = ranking.find((p) => p.id === loserId)?.rank ?? 0;

    return {
      winner: { id: winnerId, rank: newWinnerElo },
      loser: { id: loserId, rank: newLoserElo },
    };
  }
}
