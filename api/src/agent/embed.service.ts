import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class EmbedService {
  private embedder = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  async embedChunks(chunks: string[]): Promise<number[][]> {
    return await this.embedder.embedDocuments(chunks);
  }
}
