import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { UserProfileStateModel } from './user-profile.state.model';
import { USER_PROFILE_STATE_TOKEN } from '../../../tokens';
import { UserApiService } from '../../../core/services/user.api.service';
import { LookApiService } from '../../../core/services/look.api.service';
import {
  CreateUserProfileLookReaction,
  DeleteUserProfileLook,
  DeleteUserProfileLookReaction,
  GetProfileUser,
  GetUserProfileLooks,
} from './user-profile.actions';
import { patch, updateItem } from '@ngxs/store/operators';
import { User } from '../../../core/models/user/user';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { tap } from 'rxjs';
import { FeedLook } from '../../../core/models/look/feed-look';
import {
  ReactionType,
  ReactionTypeEnum,
} from '../../../core/models/reaction/reaction-type';
import { ReactionApiService } from '../../../core/services/reaction.api.service';
import { createReactionUpdateOperator } from '../operators/create-reaction-update.operator';

@State<UserProfileStateModel>({
  name: USER_PROFILE_STATE_TOKEN,
  defaults: {
    user: null,
    looks: {
      items: [],
      page: 1,
      pageSize: 20,
      hasNextPage: false,
      hasPreviousPage: false,
      totalCount: 0,
    },
  },
})
@Injectable()
export class UserProfileState {
  private userApiService: UserApiService = inject(UserApiService);
  private lookApiService: LookApiService = inject(LookApiService);
  private reactionApiService: ReactionApiService = inject(ReactionApiService);

  @Selector([UserProfileState])
  public static getUser(state: UserProfileStateModel) {
    return state?.user;
  }

  @Selector([UserProfileState])
  public static getLooks(state: UserProfileStateModel) {
    return state?.looks;
  }
  @Action(GetProfileUser)
  loadUser(ctx: StateContext<UserProfileStateModel>, action: GetProfileUser) {
    return this.userApiService
      .getUser(action.userId)
      .pipe(tap((user) => this.setUser(ctx, user)));
  }

  @Action(GetUserProfileLooks)
  loadUserProfileLooks(
    ctx: StateContext<UserProfileStateModel>,
    action: GetUserProfileLooks,
  ) {
    return this.lookApiService
      .getLooks(action.filters)
      .pipe(tap((looks) => this.setLooks(ctx, looks)));
  }
  @Action(CreateUserProfileLookReaction)
  createReaction(
    ctx: StateContext<UserProfileStateModel>,
    action: CreateUserProfileLookReaction,
  ) {
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

  @Action(DeleteUserProfileLookReaction)
  deleteReaction(
    ctx: StateContext<UserProfileStateModel>,
    action: DeleteUserProfileLookReaction,
  ) {
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
  @Action(DeleteUserProfileLook)
  deleteLook(
    ctx: StateContext<UserProfileStateModel>,
    action: DeleteUserProfileLook,
  ) {
    return this.lookApiService.deleteLook(action.lookId).pipe(
      tap(() => {
        this.setLooks(ctx, {
          ...ctx.getState().looks,
          items: ctx
            .getState()
            .looks.items.filter((item) => item.id !== action.lookId),
        });
      }),
    );
  }

  private setUser(ctx: StateContext<UserProfileStateModel>, user: User) {
    ctx.setState(
      patch({
        user,
      }),
    );
  }

  private setLooks(
    ctx: StateContext<UserProfileStateModel>,
    looks: PagedList<FeedLook>,
  ) {
    ctx.setState(
      patch({
        looks,
      }),
    );
  }
  private updateReactionCounts(
    ctx: StateContext<UserProfileStateModel>,
    lookId: string,
    reactionType: ReactionType,
    isIncrement: boolean,
  ): void {
    ctx.setState(
      patch<UserProfileStateModel>({
        looks: patch({
          items: createReactionUpdateOperator(
            lookId,
            reactionType,
            isIncrement,
          ),
        }),
      }),
    );
  }
}
