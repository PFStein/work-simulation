import { IsString, IsOptional } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  transcriptId?: string;
}

export class QuoteDto {
  speaker: string;
  quote: string;
}

export class AskResponseDto {
  summary: string;
  quotes: QuoteDto[];
}
