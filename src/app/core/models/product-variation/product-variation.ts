export interface ProductVariation {
  id: string;
  productItemId: string;
  price: number;
  size: string | null;
  masterSizeIdentifierId: string;
  productDimensions: Record<string, string> | null;
}
