import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmpty } from 'class-validator';

export class CompleteLabTestDto {
  @ApiProperty({
    example: { 'question-uuid-1': '14.5', 'question-uuid-2': 'Positive' },
    description: 'Answers keyed by question ID. Values as string or number depending on question type.',
  })
  @IsObject()
  @IsNotEmpty()
  results: Record<string, string | number>;
}
