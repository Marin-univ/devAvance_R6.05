import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { PlayerDatabaseService } from '../player/player-database.service';

describe('RankingService', () => {
  let service: RankingService;
  let playerDatabaseService: PlayerDatabaseService;

  const mockPlayerDatabaseService = {
    getRanking: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: PlayerDatabaseService,
          useValue: mockPlayerDatabaseService,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    playerDatabaseService = module.get<PlayerDatabaseService>(PlayerDatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRanking', () => {
    it('should return ranking list', async () => {
      const mockPlayers = [
        { id: 'player1', elo: 1200, rank: 1 },
        { id: 'player2', elo: 1100, rank: 2 },
      ];
      mockPlayerDatabaseService.getRanking.mockResolvedValue(mockPlayers);

      const result = await service.getRanking();

      expect(result).toEqual([
        { id: 'player1', rank: 1200 },
        { id: 'player2', rank: 1100 },
      ]);
    });

    it('should throw NotFoundException when no players exist', async () => {
      mockPlayerDatabaseService.getRanking.mockResolvedValue([]);

      await expect(service.getRanking()).rejects.toThrow();
    });
  });

  describe('subscribe', () => {
    it('should allow subscribing to ranking updates', () => {
      const callback = jest.fn();
      const unsubscribe = service.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('emitRankingUpdate', () => {
    it('should emit ranking update event', async () => {
      const mockPlayer = { id: 'player1', elo: 1200 };
      mockPlayerDatabaseService.findById.mockResolvedValue(mockPlayer);

      const callback = jest.fn();
      service.subscribe(callback);

      await service.emitRankingUpdate('player1');

      expect(callback).toHaveBeenCalledWith({
        type: 'RankingUpdate',
        player: { id: 'player1', rank: 1200 },
      });
    });

    it('should not emit event if player not found', async () => {
      mockPlayerDatabaseService.findById.mockResolvedValue(null);

      const callback = jest.fn();
      service.subscribe(callback);

      await service.emitRankingUpdate('unknown');

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
