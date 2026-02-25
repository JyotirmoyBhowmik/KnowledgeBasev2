export class CreateSectionDto {
    name: string;
    slug: string;
    parent_id?: string;
    order?: number;
    visible?: boolean;
}
