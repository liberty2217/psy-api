import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { LoginDTO } from './dtos/login.dto';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refreshtoken.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>, // Add this line

    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(user: User): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const existingUsernameUser = await this.userModel.findOne({
      username: user.username,
    });
    if (existingUsernameUser) {
      throw new BadRequestException('Username already in use');
    }

    const hashedPassword = await hash(user.password, 10);

    const confirmationToken = randomBytes(32).toString('hex');

    try {
      await this.mailService.sendConfirmationEmail(
        user.email,
        confirmationToken,
      );
    } catch (error) {
      throw new ServiceUnavailableException(
        'Failed to send confirmation email',
      );
    }

    const createdUser = new this.userModel({
      ...user,
      password: hashedPassword,
      confirmationToken,
    });

    return createdUser.save();
  }

  async confirmEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userModel.findOne({ confirmationToken: token });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    user.confirmationToken = null;
    user.isEmailConfirmed = true;
    await user.save();

    /**
     * to-do later
     * deeplink to app
     * or/and static page that said "email confirmed successfully"
     */
    return { success: true, message: 'Email confirmed successfully' };
  }

  async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the user has confirmed their email
    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException(
        'Please confirm your email before logging in',
      );
    }

    const payload = { email: user.email, sub: user._id };

    // Create refresh token
    const refreshToken = uuidv4();
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 30); // set expire date 30 days from now

    // Store refresh token in database
    await new this.refreshTokenModel({
      userId: user._id,
      refreshToken,
      expiresIn: refreshTokenExpires,
    }).save();

    return {
      user,
      /** secret is automatically provided by module */
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const token = await this.refreshTokenModel.findOne({ refreshToken });
    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if the refresh token is expired
    if (token.expiresIn < new Date()) {
      throw new UnauthorizedException('Expired refresh token');
    }

    // Generate a new access token
    const user = await this.userModel.findById(token.userId);
    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      refresh_token: refreshToken, // Return the same refresh token. Generate a new one if you want to implement one-time refresh tokens.
    };
  }

  async logout(refreshToken: string) {
    // Remove the refresh token from the database
    const result = await this.refreshTokenModel.deleteOne({ refreshToken });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Refresh token not found');
    }
  }
}
