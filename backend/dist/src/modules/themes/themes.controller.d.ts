import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
export declare class ThemesController {
    private readonly themesService;
    constructor(themesService: ThemesService);
    findAll(): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getEffective(): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    findOne(id: number): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    }>;
    create(dto: CreateThemeDto, user: AuthenticatedUser): Promise<any>;
    update(id: number, dto: UpdateThemeDto, user: AuthenticatedUser): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    }>;
    activate(id: number, user: AuthenticatedUser): Promise<{
        id: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
