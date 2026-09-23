import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<any>;
    create(dto: CreateCategoryDto, user: AuthenticatedUser): Promise<any>;
    update(id: number, dto: UpdateCategoryDto, user: AuthenticatedUser): Promise<any>;
}
