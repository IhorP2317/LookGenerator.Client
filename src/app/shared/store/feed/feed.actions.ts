import { LookFilterPayload } from '../../../core/models/helpers/look-filter-type';

const ACTION_SCOPE = '[Feed]';

export class GetAttributeOptions {
  static readonly type = `${ACTION_SCOPE} Get Attribute Options`;
}

export class GetColours {
  static readonly type = `${ACTION_SCOPE} Get Colours`;
}

export class GetLooks {
  static readonly type = `${ACTION_SCOPE} Get Looks`;

  constructor(public filters: LookFilterPayload) {}
}
