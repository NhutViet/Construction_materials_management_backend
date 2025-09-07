import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  bankNumber?: string;

  @IsString()
  bankName?: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  bankNumber?: string;

  @IsString()
  bankName?: string;
}
