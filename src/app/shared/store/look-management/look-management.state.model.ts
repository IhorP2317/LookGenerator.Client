import { Look } from '../../../core/models/look/look';
import { AttributeOption } from '../../../core/models/attribute-option/attribute-option';
import { ColorOption } from '../../../core/models/helpers/colour-option';
import { Gender } from '../../../core/models/helpers/gender';
import { ProductCategory } from '../../../core/models/product-category/product-category';
import { ProductToSelect } from '../../../core/models/product/product-to-select';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { ProductVariation } from '../../../core/models/product-variation/product-variation';

export interface LookManagementStateModel {
  look: Look | null;
  attributeOptions: AttributeOption[];
  colours: ColorOption[];
  genders: Gender[];
  categories: ProductCategory[];
  products: PagedList<ProductToSelect>;
  productVariations: ProductVariation[];
  newLookId: string | null;
}
