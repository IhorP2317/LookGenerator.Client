import {
  LookFilterPayload,
  LookFilterType,
} from '../models/helpers/look-filter-type';

export const PASSWORD_VALIDATION_ERRORS = {
  required: 'Password is required.',
  length: 'Password must be between 8 and 16 characters.',
  uppercase: 'Password must contain at least one uppercase letter.',
  lowercase: 'Password must contain at least one lowercase letter.',
  digit: 'Password must contain at least one number.',
  specialCharacter: 'Password must contain at least one special character.',
};

export const DEFAULT_LOOK_FILTERS: LookFilterPayload = {
  [LookFilterType.PageNumber]: 1,
  [LookFilterType.PageSize]: 20,
};
