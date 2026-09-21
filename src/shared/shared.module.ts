import { Global, Module } from '@nestjs/common'

import { SharedUserRepo } from '@/shared/repositories/shared-user.repo.js'
import { HashingService } from '@/shared/services/hashing.service.js'
import { PrismaService } from '@/shared/services/prisma.service.js'
import { SharedUserService } from '@/shared/services/shared-user.service.js'
import { TokenService } from '@/shared/services/token.service.js'

const SHARED_PROVIDERS = [PrismaService, HashingService, SharedUserRepo, SharedUserService, TokenService]

@Global()
@Module({
  providers: SHARED_PROVIDERS,
  exports: SHARED_PROVIDERS
})
export class SharedModule {}
