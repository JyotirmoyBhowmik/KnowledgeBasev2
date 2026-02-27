import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(50, { message: 'Name must not exceed 50 characters' })
    name?: string;

    @IsOptional()
    @IsString()
    role?: string;
}
