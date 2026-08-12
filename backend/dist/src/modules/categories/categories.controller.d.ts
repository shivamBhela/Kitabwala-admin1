import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        id: number;
        wp_id: number | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }[]>;
    create(dto: CreateCategoryDto, user: AuthenticatedUser): Promise<{
        id: number;
        wp_id: number | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
    update(id: number, dto: UpdateCategoryDto, user: AuthenticatedUser): Promise<{
        id: number;
        wp_id: number | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
}
