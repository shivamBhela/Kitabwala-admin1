import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as exempt from the global JwtAuthGuard/PermissionsGuard (e.g. login, refresh). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
