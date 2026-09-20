import { Injectable, UnauthorizedException } from '@nestjs/common'
import jwt, { SignOptions } from 'jsonwebtoken'

import envConfig from '@/shared/constants/config.js'

export interface TokenPayload {
  userId: number
  roleId: number
  tokenType?: 'access' | 'refresh'
  [key: string]: any
}

@Injectable()
export class TokenService {
  /**
   * Tạo Access Token bất đồng bộ (async)
   */
  async signAccessToken(payload: Omit<TokenPayload, 'tokenType'>, options?: SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { ...payload, tokenType: 'access' },
        envConfig.JWT_SECRET,
        {
          expiresIn: (envConfig.ACCESS_TOKEN_EXPIRES_IN || '15m') as any,
          ...options
        },
        (err, token) => {
          if (err || !token) reject(err)
          else resolve(token)
        }
      )
    })
  }

  /**
   * Tạo Refresh Token bất đồng bộ (async)
   */
  async signRefreshToken(payload: Omit<TokenPayload, 'tokenType'>, options?: SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { ...payload, tokenType: 'refresh' },
        envConfig.JWT_REFRESH_SECRET,
        {
          expiresIn: (envConfig.REFRESH_TOKEN_EXPIRES_IN || '100d') as any,
          ...options
        },
        (err, token) => {
          if (err || !token) reject(err)
          else resolve(token)
        }
      )
    })
  }

  /**
   * Verify và giải mã Access Token
   */
  verifyAccessToken<T extends object = TokenPayload>(token: string): T {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as T
    } catch (error) {
      throw new UnauthorizedException('Error.AccessTokenInvalidOrExpired')
    }
  }

  /**
   * Verify và giải mã Refresh Token
   */
  verifyRefreshToken<T extends object = TokenPayload>(token: string): T {
    try {
      return jwt.verify(token, envConfig.JWT_REFRESH_SECRET) as T
    } catch (error) {
      throw new UnauthorizedException('Error.RefreshTokenInvalidOrExpired')
    }
  }

  /**
   * Ký Token tùy chỉnh bất đồng bộ
   */
  async sign(payload: any, secret: string, options?: SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options || {}, (err, token) => {
        if (err || !token) reject(err)
        else resolve(token)
      })
    })
  }

  /**
   * Giải mã Token tùy chỉnh với secret bất kỳ
   */
  verify<T extends object = any>(token: string, secret: string): T {
    try {
      return jwt.verify(token, secret) as T
    } catch (error) {
      throw new UnauthorizedException('Error.TokenInvalidOrExpired')
    }
  }
}
