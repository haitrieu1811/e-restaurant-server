import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { User } from '@/generated/prisma/client.js'
import { REQUEST_USER_KEY } from '@/shared/constants/request.js'

export const CurrentUser = createParamDecorator((data: keyof User | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request[REQUEST_USER_KEY] as User | undefined
  return data && user ? user[data] : user
})
