import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsString()
  middlename: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(100000000000, { message: 'Adhaar number should be a 12 digit number' })
  @Max(999999999999, { message: 'Adhaar number should be a 12 digit number' })
  aadhaar_number: number;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsMobilePhone('en-IN')
  phone: number;
}
