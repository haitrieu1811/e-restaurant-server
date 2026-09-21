import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const UserNotFoundException = new NotFoundException('Error.UserNotFound')

export const OldPasswordInvalidException = new UnprocessableEntityException([
  {
    path: 'oldPassword',
    message: 'Error.OldPasswordInvalid'
  }
])

