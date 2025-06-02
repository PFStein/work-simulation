import { Injectable } from '@nestjs/common';
import { db } from './db/db';
import * as fs from 'fs/promises';
import * as path from 'path';

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
