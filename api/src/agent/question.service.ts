// question.service.ts
import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { db } from '../db/db';
import { sql } from 'kysely';
import { EmbedService } from './embed.service';

const ResponseSchema = z.object({
  summary: z.string(),
  quotes: z.array(
    z.object({
      speaker: z.string(),
      quote: z.string(),
    }),
  ),
});

@Injectable()
export class QuestionService {
  private model = new ChatOpenAI({
    modelName: 'gpt-4',
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
  }).withStructuredOutput(ResponseSchema);

  constructor(private readonly embedService: EmbedService) {}

  private pgvector(vec: number[]) {
    const vectorStr = `[${vec.join(',')}]`;
    return sql`${sql.lit(vectorStr)}::vector`;
  }

  async ask(
    question: string,
    transcriptId?: string,
  ): Promise<z.infer<typeof ResponseSchema>> {
    const questionEmbedding = await this.embedService.embedChunks([question]);
    const vector = questionEmbedding[0];

    const query = db.selectFrom('chunks').select(['content', 'speaker']);

    if (transcriptId) {
      query.where('transcript_id', '=', transcriptId);
    }

    const matches = await query
      .orderBy(sql<number>`embedding <-> ${this.pgvector(vector)}`)
      .limit(5)
      .execute();

    if (matches.length === 0) {
      return {
        summary: "Sorry, I couldn't find anything relevant in the transcript.",
        quotes: [],
      };
    }

    const contextText = matches
      .map((m) => `${m.speaker}: ${m.content}`)
      .join('\n\n');

    const prompt = `
    You are a helpful assistant summarizing a therapy transcript.

    Your response should include:
    - A brief summary answering the question in 1-2 sentences.
    - Attributed direct quotes from the transcript that support your answer.
    - Use clear formatting for quotes: **[Speaker]:** *\"Quote here\"*

    TRANSCRIPT:
    ${contextText}

    QUESTION:
    ${question}

    RESPONSE:
    `;

    const result = await this.model.invoke(prompt);
    return result;
  }
}

export type StructuredAnswer = z.infer<typeof ResponseSchema>;
