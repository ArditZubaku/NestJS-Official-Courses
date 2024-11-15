import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RefreshTokenIDsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;

  onApplicationBootstrap() {
    // TODO: Ideally, we should move this to a dedicated RedisModule instead of initiating the connection here
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  onApplicationShutdown(signal?: string) {
    return this.redisClient.quit();
  }

  async insert(userID: number, tokenID: string): Promise<void> {
    await this.redisClient.set(this.getKey(userID), tokenID);
  }

  async validate(userID: number, tokenID: string): Promise<boolean> {
    const storedID = await this.redisClient.get(this.getKey(userID));
    console.log({
      storedID,
      tokenID,
    });

    return storedID === tokenID;
  }

  async invalidate(userID: number): Promise<void> {
    await this.redisClient.del(this.getKey(userID));
  }

  private getKey(userID: number): string {
    return `user-${userID}`;
  }
}

//async getAllData() {
//async function getAllKeys(client: Redis): Promise<string[]> {
//const allKeys = [];
//let cursor = '0';

//do {
//const [newCursor, keys] = await client.scan(cursor);
//allKeys.push(...keys);
//cursor = newCursor;
//} while (cursor !== '0');

//return allKeys;
//}
//const keys = await getAllKeys(this.redisClient);
//const keyValuePairs = await Promise.all(
//keys.map(async (key) => ({ key, value: await this.redisClient.get(key) }))
//);

//return keyValuePairs;
//}
