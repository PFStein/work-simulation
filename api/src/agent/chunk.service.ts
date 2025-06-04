import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export type ChunkingStrategy = 'by-speaker' | 'recursive';

export interface Chunk {
  speaker: string;
  content: string;
  position: number;
  strategy: ChunkingStrategy;
}

@Injectable()
export class ChunkService {
  private splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  async chunk(text: string, strategy: ChunkingStrategy): Promise<Chunk[]> {
    switch (strategy) {
      case 'by-speaker':
        return this.chunkBySpeakerOnly(text);
      case 'recursive':
        return this.chunkRecursively(text);
    }
  }

  private chunkBySpeakerOnly(text: string): Chunk[] {
    const result: Chunk[] = [];
    const speakerRegex = /\[Speaker:(\d+)\]/g;
    const parts = text.split(speakerRegex);

    for (let i = 1; i < parts.length; i += 2) {
      const speakerId = parts[i];
      const content = parts[i + 1]?.trim();
      if (!content) continue;

      result.push({
        speaker: `[Speaker:${speakerId}]`,
        content,
        position: result.length,
        strategy: 'by-speaker',
      });
    }

    return result;
  }

  private async chunkRecursively(text: string): Promise<Chunk[]> {
    const result: Chunk[] = [];
    const splitChunks = await this.splitter.splitText(text);

    for (let i = 0; i < splitChunks.length; i++) {
      result.push({
        speaker: 'unknown',
        content: splitChunks[i],
        position: i,
        strategy: 'recursive',
      });
    }

    return result;
  }
}
