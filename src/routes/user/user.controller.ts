import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ZodResponse } from 'nestjs-zod'

import {
  CreateUserBodyDTO,
  CreateUserResDTO,
  DeleteUserResDTO,
  GetUserParamsDTO,
  GetUserResDTO,
  GetUsersQueryDTO,
  GetUsersResDTO,
  UpdateUserBodyDTO,
  UpdateUserResDTO
} from '@/routes/user/user.dto.js'
import { UserService } from '@/routes/user/user.service.js'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodResponse({ type: GetUsersResDTO })
  getUsers(@Query() query: GetUsersQueryDTO) {
    return this.userService.getUsers(query)
  }

  @Get(':id')
  @ZodResponse({ type: GetUserResDTO })
  getUserById(@Param() params: GetUserParamsDTO) {
    return this.userService.getUserById(params.id)
  }

  @Post()
  @ZodResponse({ type: CreateUserResDTO })
  createUser(@Body() body: CreateUserBodyDTO) {
    return this.userService.createUser(body)
  }

  @Put(':id')
  @ZodResponse({ type: UpdateUserResDTO })
  updateUser(@Param() params: GetUserParamsDTO, @Body() body: UpdateUserBodyDTO) {
    return this.userService.updateUser(params.id, body)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: DeleteUserResDTO })
  deleteUser(@Param() params: GetUserParamsDTO) {
    return this.userService.deleteUser(params.id)
  }
}

