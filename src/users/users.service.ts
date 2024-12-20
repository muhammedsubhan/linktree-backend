import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { CreateUserDto } from './dto/CreateUser.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtservice: JwtService,
  ) {}

  async createUser(CreateUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(CreateUserDto.password, 10);

    const newUser = new this.userModel({
      ...CreateUserDto,
      password: hashedPassword,
    });

    await newUser.save();

    return {
      createdUser: newUser,
      message: 'user has been created Successfully.',
    };
  }

  async loginUser(email: string, password: string) {
    const existingUser = await this.userModel.findOne({ email }).exec();

    if (!existingUser) {
      throw new UnauthorizedException('Invalid email!');
    }

    const matchedPassword = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!matchedPassword) {
      throw new UnauthorizedException('Invalid password!');
    }

    const payload = {
      email: existingUser.email,
      uid: existingUser._id,
    };

    const generatedToken = this.jwtservice.sign(payload);

    return {
      payload: payload,
      access_token: generatedToken,
    };
  }
}
