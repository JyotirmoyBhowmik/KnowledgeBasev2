import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Matches } from 'class-validator';

export class CreateSectionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
    slug: string;

    @IsString()
    @IsOptional()
    parent_id?: string;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsBoolean()
    @IsOptional()
    visible?: boolean;

    @IsBoolean()
    @IsOptional()
    show_on_homepage?: boolean;

    @IsNumber()
    @IsOptional()
    homepage_order?: number;

    @IsString()
    @IsOptional()
    roles_allowed?: string;
}
