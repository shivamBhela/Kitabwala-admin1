import { IsBoolean, IsISO8601, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * `colors` is a partial {token_name: value} override map matching kitabwalah-admin's
 * styles/theme.css custom-property names (without the leading `--`), e.g.
 * { "brand-primary": "28 100% 50%", "yellow": "#FF6F00" }. Only the tokens a theme
 * actually wants to change need to be present — everything else falls through to the
 * base palette. Values are not validated as real color strings here (HSL triplet vs.
 * hex vs. any future format) since theme.css itself mixes both — the frontend applying
 * these is responsible for using them verbatim as CSS custom-property values.
 */
export class CreateThemeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  colors!: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsISO8601()
  valid_from?: string;

  @IsOptional()
  @IsISO8601()
  valid_until?: string;
}
