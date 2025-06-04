import {
  Controller,
  Delete,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { AskQuestionDto, AskResponseDto } from './dto/ask-question.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('index/:transcriptId')
  async index(@Param('transcriptId') transcriptId: string) {
    try {
      await this.agentService.indexTranscript(transcriptId, 'recursive');
      return { message: `Indexed transcript: ${transcriptId}`, status: 'ok' };
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        `Unexpected error while indexing "${transcriptId}"`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload/:transcriptId')
  async uploadTranscript(
    @Param('transcriptId') transcriptId: string,
    @Body('content') content: string,
  ) {
    if (!content?.trim()) {
      throw new HttpException(
        'Transcript content is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.agentService.indexTranscriptFromContent(
        transcriptId,
        content,
        'recursive',
      );
      return {
        message: `Indexed transcript: ${transcriptId}`,
        status: 'ok',
      };
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        `Unexpected error while uploading "${transcriptId}"`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('ask')
  @HttpCode(200)
  async ask(@Body() body: AskQuestionDto): Promise<AskResponseDto> {
    const { question, transcriptId } = body;
    try {
      const result = await this.agentService.askQuestion(
        question,
        transcriptId,
      );
      return result;
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        'Failed to answer question: Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('reset')
  async resetAll() {
    await this.agentService.clearAllTranscripts();
    return {
      status: 'ok',
      message: 'All transcripts and chunks have been cleared.',
    };
  }
}
