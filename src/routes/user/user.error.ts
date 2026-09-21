import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const UserNotFoundException = new NotFoundException('Error.UserNotFound')

export const RoleNotFoundException = new NotFoundException('Error.RoleNotFound')

export const EmailAlreadyExistsException = new UnprocessableEntityException([
  {
    path: 'email',
    message: 'Error.EmailAlreadyExists'
  }
])

export const PhoneNumberAlreadyExistsException = new UnprocessableEntityException([
  {
    path: 'phoneNumber',
    message: 'Error.PhoneNumberAlreadyExists'
  }
])

