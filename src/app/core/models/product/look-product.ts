import { ProductBodyZone } from './product-body-zone';
import { ProductVariation } from '../product-variation/product-variation';
import { Gender } from '../helpers/gender';

export interface LookProduct {
  id: string;
  name: string;
  gender: Gender;
  description: string | null;
  bodyZone: ProductBodyZone;
  categories: string[];
  attributes: Record<string, string[]>;
  productItemId: string;
  color: string;
  productImage: string | null;
  productLink: string | null;
  productVariations: ProductVariation[];
  price: number;
  sizes: string | null;
}
