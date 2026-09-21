import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { Role } from '@/generated/prisma/client.js'
import { REQUEST_ROLE_KEY } from '@/shared/constants/request.js'

export const CurrentRole = createParamDecorator((data: keyof Role | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const role = request[REQUEST_ROLE_KEY] as Role | undefined
  return data && role ? role[data] : role
})
