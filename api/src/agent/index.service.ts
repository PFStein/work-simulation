import { Injectable } from '@nestjs/common';
import { db } from '../db/db';
import { Chunk } from './chunk.service';

@Injectable()
export class IndexService {
  async saveTranscript(
    transcriptTitle: string,
    content: string,
  ): Promise<string> {
    try {
      const result = await db
        .insertInto('transcripts')
        .values({
          title: transcriptTitle,
          full_text: content,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      return result.id;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';

      throw new Error(
        `Failed to insert transcript "${transcriptTitle}": ${message}`,
      );
    }
  }

  async saveChunks(transcriptId: string, chunks: Chunk[], vectors: number[][]) {
    for (let i = 0; i < chunks.length; i++) {
      await db
        .insertInto('chunks')
        .values({
          transcript_id: transcriptId,
          content: chunks[i].content,
          embedding: `[${vectors[i].join(', ')}]`,
          speaker: chunks[i].speaker,
          position: chunks[i].position,
          strategy: chunks[i].strategy,
        })
        .execute();
    }
  }
}
