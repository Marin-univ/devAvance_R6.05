import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { MatchService } from './match.service';
import { PlayerDatabaseService } from '../player/player-database.service';
import { RankingService } from '../ranking/ranking.service';

describe('MatchService', () => {
  let service: MatchService;

  const mockPlayerDatabaseService = {
    findById: jest.fn(),
    updateElo: jest.fn(),
    getRanking: jest.fn(),
  };

  const mockRankingService = {
    emitRankingUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PlayerDatabaseService,
          useValue: mockPlayerDatabaseService,
        },
        {
          provide: RankingService,
          useValue: mockRankingService,
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishMatchResult', () => {
    it('should throw UnprocessableEntityException if winner does not exist', async () => {
      mockPlayerDatabaseService.findById.mockResolvedValueOnce(null);

      await expect(
        service.publishMatchResult({ winner: 'unknown', loser: 'player2' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if loser does not exist', async () => {
      mockPlayerDatabaseService.findById
        .mockResolvedValueOnce({ id: 'player1', elo: 1000 })
        .mockResolvedValueOnce(null);

      await expect(
        service.publishMatchResult({ winner: 'player1', loser: 'unknown' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should update ELO for both players after a match', async () => {
      const winner = { id: 'player1', elo: 1000 };
      const loser = { id: 'player2', elo: 1000 };

      mockPlayerDatabaseService.findById
        .mockResolvedValueOnce(winner)
        .mockResolvedValueOnce(loser);
      mockPlayerDatabaseService.updateElo.mockResolvedValue(true);
      mockPlayerDatabaseService.getRanking.mockResolvedValue([
        { id: 'player1', elo: 1016, rank: 1 },
        { id: 'player2', elo: 984, rank: 2 },
      ]);

      const result = await service.publishMatchResult({
        winner: 'player1',
        loser: 'player2',
      });

      expect(mockPlayerDatabaseService.updateElo).toHaveBeenCalledTimes(2);
      expect(mockRankingService.emitRankingUpdate).toHaveBeenCalledWith('player1');
      expect(mockRankingService.emitRankingUpdate).toHaveBeenCalledWith('player2');
      expect(result.winner.id).toBe('player1');
      expect(result.loser.id).toBe('player2');
    });

    it('should handle draw correctly', async () => {
      const player1 = { id: 'player1', elo: 1000 };
      const player2 = { id: 'player2', elo: 1000 };

      mockPlayerDatabaseService.findById
        .mockResolvedValueOnce(player1)
        .mockResolvedValueOnce(player2);
      mockPlayerDatabaseService.updateElo.mockResolvedValue(true);
      mockPlayerDatabaseService.getRanking.mockResolvedValue([
        { id: 'player1', elo: 1000, rank: 1 },
        { id: 'player2', elo: 1000, rank: 2 },
      ]);

      const result = await service.publishMatchResult({
        winner: 'player1',
        loser: 'player2',
        draw: true,
      });

      // En cas de match nul avec ELO égaux, les scores ne changent pas
      expect(mockPlayerDatabaseService.updateElo).toHaveBeenCalledTimes(2);
    });

    it('should calculate correct ELO when ratings differ', async () => {
      const strongPlayer = { id: 'strong', elo: 1400 };
      const weakPlayer = { id: 'weak', elo: 1000 };

      mockPlayerDatabaseService.findById
        .mockResolvedValueOnce(weakPlayer)  // Winner (upset!)
        .mockResolvedValueOnce(strongPlayer);  // Loser
      mockPlayerDatabaseService.updateElo.mockResolvedValue(true);
      mockPlayerDatabaseService.getRanking.mockResolvedValue([
        { id: 'weak', elo: 1029, rank: 1 },
        { id: 'strong', elo: 1371, rank: 2 },
      ]);

      await service.publishMatchResult({
        winner: 'weak',
        loser: 'strong',
      });

      // Le joueur faible qui gagne contre un joueur fort gagne plus de points
      const updateCalls = mockPlayerDatabaseService.updateElo.mock.calls;
      const weakNewElo = updateCalls[0][1];
      const strongNewElo = updateCalls[1][1];

      // Le gagnant gagne des points, le perdant en perd
      expect(weakNewElo).toBeGreaterThan(1000);
      expect(strongNewElo).toBeLessThan(1400);
    });
  });
});
