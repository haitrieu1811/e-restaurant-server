import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { REQUEST_ROLE_KEY, REQUEST_TOKEN_PAYLOAD_KEY, REQUEST_USER_KEY } from '@/shared/constants/request.js'
import { IS_PUBLIC_KEY } from '@/shared/decorators/is-public.decorator.js'
import { PrismaService } from '@/shared/services/prisma.service.js'
import { TokenPayload, TokenService } from '@/shared/services/token.service.js'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Bỏ qua kiểm tra nếu route/controller được đánh dấu là Public (@IsPublic())
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization'] || request.headers['Authorization']

    // 2. Kiểm tra sự tồn tại của header Authorization
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Error.AccessTokenRequired')
    }

    // 3. Kiểm tra định dạng Bearer Token
    const [type, token] = authHeader.split(' ')
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Error.InvalidTokenFormat')
    }

    // 4. Giải mã và xác thực tính hợp lệ của Access Token
    let payload: TokenPayload
    try {
      payload = this.tokenService.verifyAccessToken<TokenPayload>(token)
    } catch {
      throw new UnauthorizedException('Error.InvalidAccessToken')
    }

    // 5. Truy vấn CSDL để lấy thông tin người dùng
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
        deletedAt: null
      }
    })

    // 6. Kiểm tra người dùng có tồn tại và đang hoạt động không
    if (!user) {
      throw new UnauthorizedException('Error.UserNotFound')
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Error.UserInactive')
    }

    // Gán thông tin người dùng và payload của token vào object request
    request[REQUEST_USER_KEY] = user
    request[REQUEST_TOKEN_PAYLOAD_KEY] = payload

    // 7. Trích xuất phương thức HTTP và danh sách đường dẫn request
    const path = request?.route?.path
    const method = request?.method

    // 8. Truy vấn CSDL để lấy Role và danh sách Permission hợp lệ
    const role = await this.prisma.role.findUniqueOrThrow({
      where: {
        id: user.roleId,
        deletedAt: null
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
            path,
            method
          },
          select: {
            path: true,
            method: true
          }
        }
      }
    })

    const canAccess = role.permissions.length > 0
    if (!canAccess) {
      throw new ForbiddenException('Error.YouCannotAccessThisResource')
    }

    // Gán thông tin Role vào object request sử dụng constant
    request[REQUEST_ROLE_KEY] = role
    return true
  }
}
