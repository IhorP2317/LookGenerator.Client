import {
  LookFilterPayload,
  LookFilterType,
} from '../models/helpers/look-filter-type';
import { ColorOption } from '../models/helpers/colour-option';
import {
  ProductCategoryFilterPayload,
  ProductCategoryFilterType,
} from '../models/helpers/product-category-filter-type';
import {
  ProductFilterPayload,
  ProductFilterType,
} from '../models/helpers/product-filter-type';

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
export const DEFAULT_PRODUCT_CATEGORY_FILTERS: ProductCategoryFilterPayload = {
  [ProductCategoryFilterType.HasProducts]: true,
};
export const DEFAULT_PRODUCT_FILTERS: ProductFilterPayload = {
  [ProductFilterType.PageNumber]: 1,
  [ProductFilterType.PageSize]: 20,
};
export const COLOR_HEX_MAP: Record<string, string> = {
  beige: '#F5F5DC',
  green: '#228B22',
  blue: '#1E90FF',
  black: '#000000',
  transparent: 'transparent',
  pink: '#FFC0CB',
  red: '#FF0000',
  multicolor:
    'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
  violet: '#8A2BE2',
  orange: '#FFA500',
  grey: '#808080',
  brown: '#8B4513',
  yellow: '#FFFF00',
  white: '#FFFFFF',
};
export const COLOR_OPTIONS: ColorOption[] = Object.entries(COLOR_HEX_MAP).map(
  ([name, hex]) => ({ name, hex }),
);
