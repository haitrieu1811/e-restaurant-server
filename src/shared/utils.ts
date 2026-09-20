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
