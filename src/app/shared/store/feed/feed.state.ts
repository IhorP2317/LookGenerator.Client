import { FeedModel } from './feed.model';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { FEED_STATE_TOKEN } from '../../../tokens';
import { AttributeOptionApiService } from '../../../core/services/attribute-option.api.service';
import { inject, Injectable } from '@angular/core';
import { LookApiService } from '../../../core/services/look.api.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  CreateFeedReaction,
  DeleteFeedLook,
  DeleteFeedReaction,
  GetFeedAttributeOptions,
  GetLooks,
  HideLook,
  ResetFeedState,
} from './feed.actions';
import { patch, updateItem } from '@ngxs/store/operators';
import { AttributeOption } from '../../../core/models/attribute-option/attribute-option';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { FeedLook } from '../../../core/models/look/feed-look';
import { MessageService } from 'primeng/api';
import { EMPTY, tap } from 'rxjs';
import { catchErrorWithNotification } from '../../../core/helpers/utils/catch-error-with-notification.util';
import { Gender } from '../../../core/models/helpers/gender';
import {
  LookFilterPayload,
  LookFilterType,
} from '../../../core/models/helpers/look-filter-type';
import {
  COLOR_OPTIONS,
  DEFAULT_LOOK_FILTERS,
} from '../../../core/constants/constants';
import { LookStatus } from '../../../core/models/look/look-status';
import { ReactionApiService } from '../../../core/services/reaction.api.service';
import {
  ReactionType,
  ReactionTypeEnum,
} from '../../../core/models/reaction/reaction-type';

@State<FeedModel>({
  name: FEED_STATE_TOKEN,
  defaults: {
    attributeOptions: [],
    colours: COLOR_OPTIONS,
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
    loadedPages: new Set<number>(),
  },
})
@UntilDestroy()
@Injectable()
export class FeedState implements NgxsOnInit {
  private attributeOptionApiService: AttributeOptionApiService = inject(
    AttributeOptionApiService,
  );
  private lookApiService: LookApiService = inject(LookApiService);
  private reactionApiService: ReactionApiService = inject(ReactionApiService);
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

  @Selector([FeedState])
  static getLoadedPages(state: FeedModel) {
    return state?.loadedPages;
  }

  @Action(GetFeedAttributeOptions)
  loadAttributeOptions(ctx: StateContext<FeedModel>) {
    return this.attributeOptionApiService.getAttributeOptions().pipe(
      tap((attributeOptions: AttributeOption[]) =>
        this.setAttributeOptions(ctx, attributeOptions),
      ),
      catchErrorWithNotification<AttributeOption[]>(this.messageService, []),
    );
  }

  @Action(GetLooks)
  loadLooks(ctx: StateContext<FeedModel>, action: GetLooks) {
    const state = ctx.getState();

    const filtersWithStatus: LookFilterPayload = {
      ...action.filters,
      [LookFilterType.Status]: LookStatus.Public,
    };

    const oldFilters = { ...state.filters };
    const newFilters = { ...filtersWithStatus };
    delete oldFilters[LookFilterType.PageNumber];
    delete newFilters[LookFilterType.PageNumber];

    const filtersChanged =
      JSON.stringify(oldFilters) !== JSON.stringify(newFilters);
    const pageNumber = filtersWithStatus[LookFilterType.PageNumber];

    const loadedPagesSet = new Set(state.loadedPages ?? []);
    if (!filtersChanged && loadedPagesSet.has(pageNumber)) {
      return EMPTY;
    }

    this.setFilters(ctx, filtersWithStatus);

    return this.lookApiService.getLooks(filtersWithStatus).pipe(
      tap((response: PagedList<FeedLook>) => {
        const items = filtersChanged ? [] : state.looks.items;
        const updatedItems = [...items, ...response.items];

        const updatedLoadedPages = filtersChanged
          ? new Set<number>([pageNumber])
          : new Set([...loadedPagesSet, pageNumber]);

        this.setLooks(ctx, { ...response, items: updatedItems });
        this.setLoadedPages(ctx, updatedLoadedPages);
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

  @Action(CreateFeedReaction)
  createReaction(ctx: StateContext<FeedModel>, action: CreateFeedReaction) {
    return this.reactionApiService
      .createReaction(action.lookId, action.reactionType)
      .pipe(
        tap(() => {
          this.updateReactionCounts(
            ctx,
            action.lookId,
            action.reactionType,
            true,
          );
        }),
      );
  }

  @Action(DeleteFeedReaction)
  deleteReaction(ctx: StateContext<FeedModel>, action: DeleteFeedReaction) {
    return this.reactionApiService
      .deleteReaction(action.lookId, action.reactionType)
      .pipe(
        tap(() => {
          this.updateReactionCounts(
            ctx,
            action.lookId,
            action.reactionType,
            false,
          );
        }),
      );
  }

  @Action(HideLook)
  hideLook(ctx: StateContext<FeedModel>, action: HideLook) {
    return this.lookApiService
      .updateLookStatus(action.lookId, LookStatus.Private)
      .pipe(
        tap(() => {
          const state = ctx.getState();
          const updatedLooks = {
            ...state.looks,
            items: state.looks.items.filter(
              (item) => item.id !== action.lookId,
            ),
          };
          this.setLooks(ctx, updatedLooks);
        }),
      );
  }

  @Action(DeleteFeedLook)
  deleteLook(ctx: StateContext<FeedModel>, action: DeleteFeedLook) {
    return this.lookApiService.deleteLook(action.lookId).pipe(
      tap(() => {
        const state = ctx.getState();
        const updatedLooks = {
          ...state.looks,
          items: state.looks.items.filter((item) => item.id !== action.lookId),
        };
        this.setLooks(ctx, updatedLooks);
      }),
    );
  }
  @Action(ResetFeedState)
  resetFeedState(ctx: StateContext<FeedModel>) {
    ctx.setState({
      ...ctx.getState(),
      loadedPages: new Set(),
      looks: {
        items: [],
        page: 1,
        pageSize: 20,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
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

  private setLoadedPages(
    ctx: StateContext<FeedModel>,
    loadedPages: Set<number>,
  ): void {
    ctx.setState(
      patch({
        loadedPages,
      }),
    );
  }

  private loadFeed(ctx: StateContext<FeedModel>): void {
    ctx
      .dispatch([
        new GetLooks(ctx.getState().filters),
        new GetFeedAttributeOptions(),
      ])
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private updateReactionCounts(
    ctx: StateContext<FeedModel>,
    lookId: string,
    reactionType: ReactionType,
    isIncrement: boolean,
  ): void {
    ctx.setState(
      patch<FeedModel>({
        looks: patch({
          items: updateItem<FeedLook>(
            (look) => look.id === lookId,
            (look) => ({
              ...look,
              likeCount:
                reactionType === ReactionTypeEnum.Like
                  ? look.likeCount + (isIncrement ? 1 : -1)
                  : look.likeCount,
              pinCount:
                reactionType === ReactionTypeEnum.Pin
                  ? look.pinCount + (isIncrement ? 1 : -1)
                  : look.pinCount,
              isLiked:
                reactionType === ReactionTypeEnum.Like
                  ? isIncrement
                  : look.isLiked,
              isPinned:
                reactionType === ReactionTypeEnum.Pin
                  ? isIncrement
                  : look.isPinned,
            }),
          ),
        }),
      }),
    );
  }
}
