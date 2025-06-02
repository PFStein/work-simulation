import { IsString, IsOptional } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  transcriptId?: string;
}
