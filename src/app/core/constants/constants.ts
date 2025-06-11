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
import { BodyZoneToSelect } from '../models/helpers/body-zone-to-select';
import { MeasurementMeta } from '../models/helpers/measurement-meta';
import { ProductBodyZone } from '../models/product/product-body-zone';

export const PASSWORD_VALIDATION_ERRORS = {
  required: 'Password is required.',
  length: 'Password must be between 8 and 16 characters.',
  uppercase: 'Password must contain at least one uppercase letter.',
  lowercase: 'Password must contain at least one lowercase letter.',
  digit: 'Password must contain at least one number.',
  specialCharacter: 'Password must contain at least one special character.',
};
export const BODY_ZONES: BodyZoneToSelect[] = ['TOP', 'BOTTOM', 'SHOES'];
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
export const MEASUREMENT_METADATA: MeasurementMeta[] = [
  {
    key: 'chestContour',
    description:
      'To measure around your chest, wrap a tape measure around the widest part of your chest.',
  },
  {
    key: 'waistContour',
    description:
      'Wrap the tape measure around the narrowest part of your waist.',
  },
  {
    key: 'hipContour',
    description:
      'Put your feet together and wrap the tape measure around the widest part of your hips.',
  },
  {
    key: 'footMeasure',
    description:
      'With your foot flat on the floor, measure the length from your heel to the tip of your longest toe.',
  },
];
export const CM_TOLERANCE: Record<BodyZoneToSelect, number> = {
  TOP: 2,
  BOTTOM: 2,
  SHOES: 0.5,
} as const;

export const INCH_TOLERANCE: Record<BodyZoneToSelect, number> = {
  TOP: +(2 / 2.54).toFixed(2), // ≈ 0.79
  BOTTOM: +(2 / 2.54).toFixed(2), // ≈ 0.79
  SHOES: +(0.5 / 2.54).toFixed(2), // ≈ 0.20
} as const;

export const ALL_MEASURES = [
  'chestContour',
  'waistContour',
  'hipContour',
  'footMeasure',
] as const;

export const REQUIRED_MEASURES = {
  MEN: {
    TOP: ['chestContour', 'hipContour'],
    BOTTOM: ['waistContour', 'hipContour'],
    SHOES: ['footMeasure'],
  },
  WOMEN: {
    TOP: ['chestContour', 'waistContour', 'hipContour'],
    BOTTOM: ['waistContour', 'hipContour'],
    SHOES: ['footMeasure'],
  },
};

export const BodyZoneToMeasureType: Partial<
  Record<ProductBodyZone, 'TOP' | 'BOTTOM' | 'SHOES'>
> = {
  [ProductBodyZone.UpperBody]: 'TOP',
  [ProductBodyZone.LowerBody]: 'BOTTOM',
  [ProductBodyZone.Feet]: 'SHOES',
};
