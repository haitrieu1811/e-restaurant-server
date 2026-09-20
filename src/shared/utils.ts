import { Prisma } from '@/generated/prisma/client.js'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Mã hóa chuỗi / mật khẩu sử dụng bcrypt với salt 10
 */
export const hashValue = async (value: string): Promise<string> => {
  return bcrypt.hash(value, SALT_ROUNDS)
}

/**
 * So sánh chuỗi thô với chuỗi đã được mã hóa bằng bcrypt
 */
export const compareValue = async (value: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(value, hash)
}

/**
 * Kiểm tra xem error có phải là lỗi Prisma Unique Constraint (P2002) hay không
 */
export const isPrismaUniqueConstraintError = (
  error: unknown
): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

/**
 * Kiểm tra xem error có phải là lỗi Prisma Record Not Found (P2025) hay không
 */
export const isPrismaNotFoundError = (
  error: unknown
): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

