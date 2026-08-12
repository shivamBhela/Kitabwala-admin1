export declare class CreateThemeDto {
    name: string;
    slug: string;
    description?: string;
    colors: Record<string, string>;
    is_default?: boolean;
    valid_from?: string;
    valid_until?: string;
}
