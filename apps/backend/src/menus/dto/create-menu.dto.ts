export class CreateMenuDto {
    parent_id?: string;
    label: string;
    route?: string;
    order?: number;
    visible?: boolean;
    roles_allowed?: string[];
}
