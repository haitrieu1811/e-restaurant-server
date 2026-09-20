import { Global, Module } from '@nestjs/common'

import { HashingService } from '@/shared/services/hashing.service.js'
import { PrismaService } from '@/shared/services/prisma.service.js'

const SHARED_PROVIDERS = [PrismaService, HashingService]

@Global()
@Module({
  providers: SHARED_PROVIDERS,
  exports: SHARED_PROVIDERS
})
export class SharedModule {}
