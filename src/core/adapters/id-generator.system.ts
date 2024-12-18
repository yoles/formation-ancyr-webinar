import { IIDGenerator } from '../ports/id-generator.interface';
import { v4 as uuid } from 'uuid';

export class RandomIdGenerator implements IIDGenerator {
  generate(): string {
    return uuid();
  }
}
