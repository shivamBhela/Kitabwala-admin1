import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        wp_id: number | null;
        is_active: boolean;
        updated_at: Date;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }[]>;
    create(dto: CreateCategoryDto, user: AuthenticatedUser): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        wp_id: number | null;
        is_active: boolean;
        updated_at: Date;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
    update(id: number, dto: UpdateCategoryDto, user: AuthenticatedUser): Promise<{
        description: string | null;
        created_at: Date;
        id: number;
        name: string;
        wp_id: number | null;
        is_active: boolean;
        updated_at: Date;
        slug: string;
        parent_id: number | null;
        image_url: string | null;
        display_order: number;
    }>;
}
