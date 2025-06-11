import { SizeGuideFilterPayload } from '../../../core/models/helpers/size-guide-filter-type';

const ACTION_SCOPE = '[SizeGuide]';

export class GetSizeGuide {
  static readonly type = `${ACTION_SCOPE} Get Size Guide`;
  constructor(public filters: SizeGuideFilterPayload) {}
}
