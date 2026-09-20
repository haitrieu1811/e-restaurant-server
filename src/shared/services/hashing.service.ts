import { Injectable } from '@nestjs/common'

import { compareValue, hashValue } from '@/shared/utils.js'

@Injectable()
export class HashingService {
  async hash(value: string): Promise<string> {
    return hashValue(value)
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return compareValue(value, hash)
  }
}
