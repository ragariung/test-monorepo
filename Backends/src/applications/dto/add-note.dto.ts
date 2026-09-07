import { IsString, MinLength } from 'class-validator';

export class AddNoteDto {
  @IsString()
  @MinLength(1, { message: 'content must not be blank' })
  content: string;
}
