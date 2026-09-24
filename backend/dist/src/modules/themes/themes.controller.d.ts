import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
export declare class ThemesController {
    private readonly themesService;
    constructor(themesService: ThemesService);
    findAll(): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getEffective(): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    findOne(id: number): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    }>;
    create(dto: CreateThemeDto, user: AuthenticatedUser): Promise<any>;
    update(id: number, dto: UpdateThemeDto, user: AuthenticatedUser): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    }>;
    activate(id: number, user: AuthenticatedUser): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        is_active: boolean;
        updated_at: Date;
        is_default: boolean;
        slug: string;
        valid_from: Date | null;
        valid_until: Date | null;
        colors: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
