import { Injectable } from '@nestjs/common';
import { db } from './db/db';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getUsers(): Promise<string> {
    const users = await db.selectFrom('users').selectAll().execute();
    return JSON.stringify(users);
  }
}
