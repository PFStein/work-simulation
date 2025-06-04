import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TranscriptService {
  async getTranscript(transcriptName: string): Promise<string> {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'data',
      `${transcriptName}.txt`,
    );
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      throw new Error(`Transcript ${transcriptName} not found`);
    }
  }
}
