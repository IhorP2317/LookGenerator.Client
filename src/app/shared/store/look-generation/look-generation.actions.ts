import { LookFilterPayload } from '../../../core/models/helpers/look-filter-type';
import { Gender } from '../../../core/models/helpers/gender';
import { ProductFilterPayload } from '../../../core/models/helpers/product-filter-type';

const ACTION_SCOPE = '[LookGeneration]';

export class GetGeneratedLooks {
  static readonly type = `${ACTION_SCOPE} Get Generated Looks`;
  constructor(public filters: LookFilterPayload) {}
}
export class GetLookGenerationAttributeOptions {
  static readonly type = `${ACTION_SCOPE} Get Attribute Options`;
}
export class GetLookGenerationProductCategories {
  static readonly type = `${ACTION_SCOPE} Get Product Categories`;
  constructor(public gender: Gender) {}
}
export class GetLookGenerationProductsToSelect {
  static readonly type = `${ACTION_SCOPE} Get Products To Select`;
  constructor(public filters: ProductFilterPayload) {}
}
export class GetLookGenerationProductVariations {
  static readonly type = `${ACTION_SCOPE} Get Product Variations`;
  constructor(public productItemId: string) {}
}
export class LikeGeneratedLook {
  static readonly type = `${ACTION_SCOPE} Like Look`;
  constructor(public lookId: string) {}
}

export class DeleteGeneratedLook {
  static readonly type = `${ACTION_SCOPE} Delete Look`;
  constructor(public lookId: string) {}
}

export class GenerateLooks {
  static readonly type = `${ACTION_SCOPE} Generate Looks`;
  constructor(
    public gender: Gender,
    public attributeOptionIds: string[],
    public colours: string[],
    public measurements: Record<string, number>,
  ) {}
}

export class GenerateLooksByItem {
  static readonly type = `${ACTION_SCOPE} Generate Looks By Item`;
  constructor(
    public productVariationId: string,
    public measurements: Record<string, number>,
  ) {}
}
