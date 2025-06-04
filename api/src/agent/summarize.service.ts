import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class SummarizeService {
  private llm = new ChatOpenAI({
    modelName: 'gpt-4',
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
  });

  async summarizeChunk(content: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content:
          'Summarize the following chunk of a therapy session in 1-2 sentences. Focus on emotional content, decisions, or relational themes. Do not include quotes.',
      },
      {
        role: 'user',
        content,
      },
    ];

    const res = await this.llm.invoke(messages);
    return typeof res.content === 'string' ? res.content.trim() : '';
  }

  async summarizeChunks(chunks: string[]): Promise<string[]> {
    const summaries: string[] = [];

    for (const chunk of chunks) {
      const summary = await this.summarizeChunk(chunk);
      summaries.push(summary);
    }

    return summaries;
  }
}
