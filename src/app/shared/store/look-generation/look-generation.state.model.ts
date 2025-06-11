import { AttributeOption } from '../../../core/models/attribute-option/attribute-option';
import { Gender } from '../../../core/models/helpers/gender';
import { ColorOption } from '../../../core/models/helpers/colour-option';
import { ProductCategory } from '../../../core/models/product-category/product-category';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { ProductToSelect } from '../../../core/models/product/product-to-select';
import { ProductVariation } from '../../../core/models/product-variation/product-variation';
import { FeedLook } from '../../../core/models/look/feed-look';

export interface LookGenerationStateModel {
  attributeOptions: AttributeOption[];
  genders: Gender[];
  colours: ColorOption[];
  categories: ProductCategory[];
  products: PagedList<ProductToSelect>;
  productVariations: ProductVariation[];
  generatedLooks: PagedList<FeedLook>;
  newGeneratedLookIds: string[];
}
