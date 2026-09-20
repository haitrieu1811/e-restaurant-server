import { UnprocessableEntityException } from '@nestjs/common'

export const InvalidPasswordException = new UnprocessableEntityException([
  {
    path: 'password',
    message: 'Error.InvalidPassword'
  }
])

export const EmailAlreadyExistsException = new UnprocessableEntityException([
  {
    path: 'email',
    message: 'Error.EmailAlreadyExists'
  }
])

export const RefreshTokenNotFoundException = new UnprocessableEntityException([
  {
    path: 'refreshToken',
    message: 'Error.RefreshTokenNotFound'
  }
])

export const PhoneNumberAlreadyExistsException = new UnprocessableEntityException([
  {
    path: 'phoneNumber',
    message: 'Error.PhoneNumberAlreadyExists'
  }
])
