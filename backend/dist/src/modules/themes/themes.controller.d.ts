import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
export declare class ThemesController {
    private readonly themesService;
    constructor(themesService: ThemesService);
    findAll(): Promise<any>;
    getEffective(): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreateThemeDto, user: AuthenticatedUser): Promise<any>;
    update(id: number, dto: UpdateThemeDto, user: AuthenticatedUser): Promise<any>;
    activate(id: number, user: AuthenticatedUser): Promise<any>;
}
