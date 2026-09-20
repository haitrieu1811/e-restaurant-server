import { Global, Module } from '@nestjs/common'

import { HashingService } from '@/shared/services/hashing.service.js'
import { PrismaService } from '@/shared/services/prisma.service.js'
import { SharedUserRepo } from '@/shared/repositories/shared-user.repo.js'
import { TokenService } from '@/shared/services/token.service.js'

const SHARED_PROVIDERS = [PrismaService, HashingService, SharedUserRepo, TokenService]

@Global()
@Module({
  providers: SHARED_PROVIDERS,
  exports: SHARED_PROVIDERS
})
export class SharedModule {}
