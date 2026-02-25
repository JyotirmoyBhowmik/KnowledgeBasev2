export class CreatePageDto {
    section_id: string;
    title: string;
    slug: string;
    status?: string;
    show_author?: boolean;
    show_metrics?: boolean;
    created_by_id?: string;
}
