import { Types } from 'mongoose';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import JwtAccessGuard from '@guards/jwt-access.guard';
import ParseObjectIdPipe from '@pipes/parse-object-id.pipe';
import WrapResponseInterceptor from '@interceptors/wrap-response.interceptor';
import { User } from './schemas/users.schema';
import UsersService from './users.service';
import UserResponseEntity from '@v1/users/entity/user-response.entity';
import Serialize from '@decorators/serialization.decorator';
import UsersEntity from '@v1/users/entity/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseInterceptors(WrapResponseInterceptor, ClassSerializerInterceptor)
@ApiExtraModels(User)
@Controller('users')
export default class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
    description: '200. Success. Returns a user',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException. User was not found',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  @Serialize(UserResponseEntity)
  @UseGuards(JwtAccessGuard)
  async getById(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ): Promise<User> {
    const foundUser = await this.usersService.getById(id);

    if (!foundUser) {
      throw new NotFoundException('The user does not exist');
    }

    return foundUser;
  }

  @ApiOkResponse({
    description: '200. Success. Returns all users',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(User),
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })
  @Get()
  @Serialize(UserResponseEntity)
  @UseGuards(JwtAccessGuard)
  async getAllVerifiedUsers(): Promise<UsersEntity[] | []> {
    const foundUsers = await this.usersService.getAll(true);

    return foundUsers;
  }
}
