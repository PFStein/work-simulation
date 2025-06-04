import { Injectable, ConflictException } from '@nestjs/common';
import { TranscriptService } from './transcript.service';
import { ChunkService, Chunk, ChunkingStrategy } from './chunk.service';
import { EmbedService } from './embed.service';
import { IndexService } from './index.service';
import { QuestionService, StructuredAnswer } from './question.service';
import { db } from '../db/db';

@Injectable()
export class AgentService {
  constructor(
    private readonly transcriptService: TranscriptService,
    private readonly chunkService: ChunkService,
    private readonly embedService: EmbedService,
    private readonly indexService: IndexService,
    private readonly questionService: QuestionService,
  ) {}

  // Older method that would look up transcripts just in the data folder.
  // Used for initial testing
  async indexTranscript(
    transcriptTitle: string,
    strategy: ChunkingStrategy = 'recursive',
  ): Promise<void> {
    // Check for duplicate transcript
    const existing = await db
      .selectFrom('transcripts')
      .select(['id'])
      .where('title', '=', transcriptTitle)
      .executeTakeFirst();

    if (existing) {
      throw new ConflictException(
        `Transcript titled "${transcriptTitle}" already exists.`,
      );
    }

    const rawText = await this.transcriptService.getTranscript(transcriptTitle);
    const transcriptId = await this.indexService.saveTranscript(
      transcriptTitle,
      rawText,
    );

    try {
      const chunks: Chunk[] = await this.chunkService.chunk(rawText, strategy);
      const vectors = await this.embedService.embedChunks(
        chunks.map((c) => c.content),
      );
      await this.indexService.saveChunks(transcriptId, chunks, vectors);
    } catch (err) {
      throw new Error(
        `Transcript "${transcriptTitle}" failed to index with strategy "${strategy}": ${err}`,
      );
    }
  }

  // Used when using file upload in chat interface
  async indexTranscriptFromContent(
    transcriptTitle: string,
    rawText: string,
    strategy: ChunkingStrategy = 'recursive',
  ) {
    // Check for duplicate transcript
    const existing = await db
      .selectFrom('transcripts')
      .select(['id'])
      .where('title', '=', transcriptTitle)
      .executeTakeFirst();

    if (existing) {
      throw new ConflictException(
        `Transcript titled "${transcriptTitle}" already exists.`,
      );
    }

    const transcriptId = await this.indexService.saveTranscript(
      transcriptTitle,
      rawText,
    );

    try {
      const chunks: Chunk[] = await this.chunkService.chunk(rawText, strategy);
      const vectors = await this.embedService.embedChunks(
        chunks.map((c) => c.content),
      );
      await this.indexService.saveChunks(transcriptId, chunks, vectors);
    } catch (err) {
      throw new Error(
        `Transcript "${transcriptTitle}" failed to index with strategy "${strategy}": ${err}`,
      );
    }
  }

  async askQuestion(
    question: string,
    transcriptId?: string,
  ): Promise<StructuredAnswer> {
    return await this.questionService.ask(question, transcriptId);
  }

  async clearAllTranscripts(): Promise<void> {
    await db.deleteFrom('chunks').execute();
    await db.deleteFrom('transcripts').execute();
  }
}
