import { IsNotEmptyObject, IsObject } from 'class-validator';

export class VerifyKycDto {
  /**
   * Freeform KYC submission — the form fields themselves are not modeled here (per the
   * admin-portal spec, this is intentionally an opaque JSON blob), just persisted verbatim
   * to VendorProfile.kyc_form_data. Must be a non-empty object: verifying KYC with no
   * submitted data at all isn't meaningful.
   */
  @IsObject()
  @IsNotEmptyObject()
  kyc_form_data!: Record<string, unknown>;
}
