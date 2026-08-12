import type { AuthenticatedUser } from '../auth/jwt-payload.type';
import { AppSettingsService } from './app-settings.service';
import { UpsertAppSettingDto } from './dto/upsert-app-setting.dto';
export declare class AppSettingsController {
    private readonly appSettingsService;
    constructor(appSettingsService: AppSettingsService);
    findAll(): Promise<import("./app-settings.service").AppSettingResponse[]>;
    findOne(key: string): Promise<import("./app-settings.service").AppSettingResponse>;
    upsert(key: string, dto: UpsertAppSettingDto, user: AuthenticatedUser): Promise<import("./app-settings.service").AppSettingResponse>;
}
