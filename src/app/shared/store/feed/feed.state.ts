import { FeedModel } from './feed.model';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { FEED_STATE_TOKEN } from '../../../tokens';
import { AttributeOptionApiService } from '../../../core/services/attribute-option.api.service';
import { inject, Injectable } from '@angular/core';
import { ColourApiService } from '../../../core/services/colour.api.service';
import { LookApiService } from '../../../core/services/look.api.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GetAttributeOptions, GetColours, GetLooks } from './feed.actions';
import { patch } from '@ngxs/store/operators';
import { AttributeOption } from '../../../core/models/attribute-option/attribute-option';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { FeedLook } from '../../../core/models/look/feed-look';
import { MessageService } from 'primeng/api';
import { tap } from 'rxjs';
import { catchErrorWithNotification } from '../../../core/helpers/utils/catch-error-with-notification.util';
import { Gender } from '../../../core/models/helpers/gender';
import {
  LookFilterPayload,
  LookFilterType,
} from '../../../core/models/helpers/look-filter-type';
import { DEFAULT_LOOK_FILTERS } from '../../../core/constants/constants';

@State<FeedModel>({
  name: FEED_STATE_TOKEN,
  defaults: {
    attributeOptions: [],
    colours: [],
    genders: [Gender.Man, Gender.Woman],
    filters: { ...DEFAULT_LOOK_FILTERS },
    looks: {
      items: [],
      page: DEFAULT_LOOK_FILTERS[LookFilterType.PageNumber],
      pageSize: DEFAULT_LOOK_FILTERS[LookFilterType.PageSize],
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  },
})
@UntilDestroy()
@Injectable()
export class FeedState implements NgxsOnInit {
  private attributeOptionApiService: AttributeOptionApiService = inject(
    AttributeOptionApiService,
  );
  private colourApiService: ColourApiService = inject(ColourApiService);
  private lookApiService: LookApiService = inject(LookApiService);
  private messageService: MessageService = inject(MessageService);

  ngxsOnInit(ctx: StateContext<any>): void {
    this.loadFeed(ctx);
  }

  @Selector([FeedState])
  static getAttributeOptions(state: FeedModel) {
    return state?.attributeOptions;
  }

  @Selector([FeedState])
  static getColours(state: FeedModel) {
    return state?.colours;
  }

  @Selector([FeedState])
  static getGenders(state: FeedModel) {
    return state?.genders;
  }

  @Selector([FeedState])
  static getFilters(state: FeedModel) {
    return state?.filters;
  }

  @Selector([FeedState])
  static getLooks(state: FeedModel) {
    return state?.looks;
  }

  @Action(GetAttributeOptions)
  loadAttributeOptions(ctx: StateContext<FeedModel>) {
    return this.attributeOptionApiService.getAttributeOptions().pipe(
      tap((attributeOptions: AttributeOption[]) =>
        this.setAttributeOptions(ctx, attributeOptions),
      ),
      catchErrorWithNotification<AttributeOption[]>(this.messageService, []),
    );
  }

  @Action(GetColours)
  loadColours(ctx: StateContext<FeedModel>) {
    return this.colourApiService.getColours().pipe(
      tap((colours: string[]) => this.setColours(ctx, colours)),
      catchErrorWithNotification<string[]>(this.messageService, []),
    );
  }

  @Action(GetLooks)
  loadLooks(ctx: StateContext<FeedModel>, action: GetLooks) {
    this.setFilters(ctx, action.filters);
    return this.lookApiService.getLooks(ctx.getState().filters).pipe(
      tap((response: PagedList<FeedLook>) => {
        const currentState = ctx.getState().looks;
        this.setLooks(ctx, {
          ...response,
          items: [...currentState.items, ...response.items],
        });
      }),
      catchErrorWithNotification<PagedList<FeedLook>>(this.messageService, {
        items: [],
        page: DEFAULT_LOOK_FILTERS[LookFilterType.PageNumber],
        pageSize: DEFAULT_LOOK_FILTERS[LookFilterType.PageSize],
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    );
  }

  private setAttributeOptions(
    ctx: StateContext<FeedModel>,
    attributeOptions: AttributeOption[],
  ): void {
    ctx.setState(
      patch({
        attributeOptions,
      }),
    );
  }

  private setColours(ctx: StateContext<FeedModel>, colours: string[]): void {
    ctx.setState(
      patch({
        colours,
      }),
    );
  }

  private setLooks(
    ctx: StateContext<FeedModel>,
    looks: PagedList<FeedLook>,
  ): void {
    ctx.setState(
      patch({
        looks,
      }),
    );
  }

  private setFilters(
    ctx: StateContext<FeedModel>,
    filters: LookFilterPayload,
  ): void {
    ctx.setState(
      patch({
        filters,
      }),
    );
  }

  private loadFeed(ctx: StateContext<FeedModel>): void {
    ctx
      .dispatch([
        new GetLooks(ctx.getState().filters),
        new GetColours(),
        new GetAttributeOptions(),
      ])
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
