export declare class UpdateThemeDto {
    name?: string;
    description?: string;
    colors?: Record<string, string>;
    is_default?: boolean;
    valid_from?: string | null;
    valid_until?: string | null;
}
