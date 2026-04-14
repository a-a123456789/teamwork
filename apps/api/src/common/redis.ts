import Redis from 'ioredis';

interface TaskRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: 'EX', seconds: number): Promise<string | null>;
  keys(pattern: string): Promise<string[]>;
  del(...keys: string[]): Promise<number>;
}

const redisUrl = process.env['REDIS_URL'];

const client = typeof redisUrl === 'string' && redisUrl.length > 0 ? new Redis(redisUrl) : new Redis();

export const redis: TaskRedisClient = {
  async get(key) {
    return client.get(key);
  },
  async set(key, value, mode, seconds) {
    return client.set(key, value, mode, seconds);
  },
  async keys(pattern) {
    return client.keys(pattern);
  },
  async del(...keys) {
    return client.del(...keys);
  },
};
