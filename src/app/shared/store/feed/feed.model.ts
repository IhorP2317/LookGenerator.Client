import { AttributeOption } from '../../../core/models/attribute-option/attribute-option';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { FeedLook } from '../../../core/models/look/feed-look';
import { Gender } from '../../../core/models/helpers/gender';
import { LookFilterPayload } from '../../../core/models/helpers/look-filter-type';

export interface FeedModel {
  attributeOptions: AttributeOption[];
  colours: string[];
  looks: PagedList<FeedLook>;
  genders: Gender[];
  filters: LookFilterPayload;
}
