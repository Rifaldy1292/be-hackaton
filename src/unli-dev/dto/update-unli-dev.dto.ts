import { PartialType } from '@nestjs/mapped-types';
import { CreateUnliDevDto } from './create-unli-dev.dto';

export class UpdateUnliDevDto extends PartialType(CreateUnliDevDto) {}
