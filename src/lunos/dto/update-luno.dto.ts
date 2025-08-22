import { PartialType } from '@nestjs/mapped-types';
import { CreateLunosDto } from './create-luno.dto';

export class UpdateLunoDto extends PartialType(CreateLunosDto) {}
