import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ChunkService } from './chunk.service';
import { EmbedService } from './embed.service';
import { IndexService } from './index.service';
import { TranscriptService } from './transcript.service';
import { AgentController } from './agent.controller';
import { QuestionService } from './question.service';

@Module({
  providers: [
    AgentService,
    TranscriptService,
    ChunkService,
    EmbedService,
    IndexService,
    QuestionService,
  ],
  exports: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
