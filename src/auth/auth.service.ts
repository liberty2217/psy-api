import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { LoginDTO } from './dtos/login.dto';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(user: User): Promise<User> {
    const hashedPassword = await hash(user.password, 10);

    const confirmationToken = randomBytes(32).toString('hex');

    await this.mailService.sendConfirmationEmail(user.email, confirmationToken);

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

    // Check if the user has confirmed their email
    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException(
        'Please confirm your email before logging in',
      );
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };

    return {
      user,
      /** secret is automatically provided by module */
      access_token: this.jwtService.sign(payload),
    };
  }
}
