import { Action, Selector, State, StateContext } from '@ngxs/store';

import { LookStateModel } from './look.state.model';
import { LOOK_STATE_TOKEN } from '../../../tokens';
import { LookApiService } from '../../../core/services/look.api.service';
import { inject, Injectable } from '@angular/core';
import { ReactionApiService } from '../../../core/services/reaction.api.service';
import { Look } from '../../../core/models/look/look';
import { patch } from '@ngxs/store/operators';
import {
  CreateLookReaction,
  DeleteLookReaction,
  GetLook,
} from './look.actions';
import { EMPTY, of, switchMap, take, tap } from 'rxjs';

@State<LookStateModel>({
  name: LOOK_STATE_TOKEN,
  defaults: {
    look: null,
  },
})
@Injectable()
export class LookState {
  private lookApiService: LookApiService = inject(LookApiService);
  private reactionApiService: ReactionApiService = inject(ReactionApiService);

  @Selector([LookState])
  public static getLook(state: LookStateModel) {
    return state?.look;
  }

  @Action(GetLook)
  getLook(ctx: StateContext<LookStateModel>, action: GetLook) {
    return this.lookApiService
      .getLook(action.lookId)
      .pipe(tap((look: Look) => this.setLook(ctx, look)));
  }

  @Action(CreateLookReaction)
  createLookReaction(
    ctx: StateContext<LookStateModel>,
    action: CreateLookReaction,
  ) {
    const state = ctx.getState();
    const lookId = state.look?.id;

    if (lookId) {
      return this.reactionApiService
        .createReaction(lookId, action.reactionType)
        .pipe(
          switchMap(() => ctx.dispatch(new GetLook(lookId))),
          take(1),
        );
    }
    return EMPTY;
  }

  @Action(DeleteLookReaction)
  deleteLookReaction(
    ctx: StateContext<LookStateModel>,
    action: DeleteLookReaction,
  ) {
    const state = ctx.getState();
    const lookId = state.look?.id;

    if (lookId) {
      return this.reactionApiService
        .deleteReaction(lookId, action.reactionType)
        .pipe(
          switchMap(() => ctx.dispatch(new GetLook(lookId))),
          take(1),
        );
    }
    return EMPTY;
  }

  private setLook(ctx: StateContext<LookStateModel>, look: Look) {
    ctx.setState(
      patch({
        look,
      }),
    );
  }
}
