import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';

export interface Player {
  id: string;
  elo: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable()
export class PlayerDatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: sqlite3.Database;

  async onModuleInit() {
    await this.connect();
    await this.createTable();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database('./players.db', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private createTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        elo INTEGER NOT NULL DEFAULT 1000,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return this.run(sql);
  }

  private run(sql: string, params: unknown[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T | undefined);
        }
      });
    });
  }

  private all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  async create(id: string, elo: number = 1000): Promise<Player> {
    const sql = `INSERT INTO players (id, elo) VALUES (?, ?)`;
    await this.run(sql, [id, elo]);
    return this.findById(id) as Promise<Player>;
  }

  async findById(id: string): Promise<Player | undefined> {
    const sql = `SELECT * FROM players WHERE id = ?`;
    return this.get<Player>(sql, [id]);
  }

  async findAll(): Promise<Player[]> {
    const sql = `SELECT * FROM players ORDER BY elo DESC`;
    return this.all<Player>(sql);
  }

  async updateElo(id: string, elo: number): Promise<Player | undefined> {
    const sql = `UPDATE players SET elo = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    await this.run(sql, [elo, id]);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM players WHERE id = ?`;
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  async exists(id: string): Promise<boolean> {
    const player = await this.findById(id);
    return player !== undefined;
  }

  async getRanking(): Promise<(Player & { rank: number })[]> {
    const players = await this.findAll();
    return players.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
  }
}
