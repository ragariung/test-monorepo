import { IsString, MinLength } from 'class-validator';

export class DeclineLeadDto {
  @IsString()
  @MinLength(1, { message: 'reason must not be blank' })
  reason: string;
}
