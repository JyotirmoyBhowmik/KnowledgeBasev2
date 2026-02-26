export class CreateModuleDto {
    page_id: string;
    type: 'TEXT' | 'PDF' | 'VIDEO' | 'URL' | 'IMAGE' | 'CODE' | 'TABLE' | 'EMBED' | 'HTML';
    content?: string;
    file_path?: string;
    url?: string;
    title?: string;
    order?: number;
    metadata?: any;
}
