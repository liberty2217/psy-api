import { IsEmail, IsString } from 'class-validator';

/** class for specific login (includes own validation / transformation and custom class to add) */
export class LoginDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
