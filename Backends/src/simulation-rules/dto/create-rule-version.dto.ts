import { IsObject } from 'class-validator';
import { FormulaConfig } from '../../simulator/interfaces/formula-config.interface';

export class CreateRuleVersionDto {
  @IsObject()
  formulaConfig: FormulaConfig;
}
