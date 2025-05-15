import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { FeedState } from '../../shared/store/feed/feed.state';
import { LooksComponent } from './components/looks/looks.component';
import {
  CreateFeedReaction,
  DeleteFeedLook,
  DeleteFeedReaction,
  GetLooks,
  HideLook,
  ResetFeedState,
} from '../../shared/store/feed/feed.actions';
import {
  LookFilterPayload,
  LookFilterType,
  LookFilterTypeEnum,
} from '../../core/models/helpers/look-filter-type';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LookFiltersComponent } from './components/look-filters/look-filters.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import {
  ReactionType,
  ReactionTypeEnum,
} from '../../core/models/reaction/reaction-type';
import { AuthState } from '../../shared/store/auth/auth.state';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { LookStatus } from '../../core/models/look/look-status';
import { tap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-feed',
  imports: [
    LooksComponent,
    LookFiltersComponent,
    Dialog,
    PrimeTemplate,
    Button,
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent implements OnInit {
  private store: Store = inject(Store);
  private messageService: MessageService = inject(MessageService);
  looks = this.store.selectSignal(FeedState.getLooks);
  attributeOptions = this.store.selectSignal(FeedState.getAttributeOptions);
  colours = this.store.selectSignal(FeedState.getColours);
  genders = this.store.selectSignal(FeedState.getGenders);
  filters = this.store.selectSignal(FeedState.getFilters);
  loadedPages = this.store.selectSignal(FeedState.getLoadedPages);
  currentUser = this.store.selectSignal(AuthState.getCurrentUser);
  lookToManage: { lookId: string; action: 'hide' | 'delete' } | null = null;
  isDialogVisible = model(false);
  ngOnInit() {
    this.resetFeedState();
  }

  onLookPageNumberChange(pageNumber: number) {
    this.dispatchFilters({
      ...this.filters(),
      [LookFilterType.PageNumber]: pageNumber,
    });
  }

  onFilterChange(partial: LookFilterPayload) {
    this.dispatchFilters({
      ...partial,
      [LookFilterType.PageNumber]: 1,
    });
  }

  private dispatchFilters(next: LookFilterPayload) {
    const current = this.filters();

    const merged: LookFilterPayload = {};
    for (const key of Object.keys(current)) {
      const k = Number(key) as LookFilterTypeEnum;
      if (next.hasOwnProperty(k)) {
        merged[k] = next[k];
      }
    }

    // Add new ones
    for (const key of Object.keys(next)) {
      const k = Number(key) as LookFilterTypeEnum;
      merged[k] = next[k];
    }

    if (merged[LookFilterType.Attributes]?.length === 0) {
      delete merged[LookFilterType.Attributes];
    }
    if (merged[LookFilterType.Colours]?.length === 0) {
      delete merged[LookFilterType.Colours];
    }

    this.store
      .dispatch(new GetLooks(merged))
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  onReactionsChange({
    lookId,
    reactionType,
  }: {
    lookId: string;
    reactionType: ReactionType;
  }) {
    if (!this.currentUser()) {
      this.messageService.add({
        severity: 'secondary',
        summary: 'Reaction is not saved!',
        detail: 'You must be logged in to react!',
      });
      return;
    }

    const look = this.looks()?.items.find((look) => look.id === lookId);
    if (!look) return;

    const isAlreadyReacted =
      reactionType === ReactionTypeEnum.Like ? look.isLiked : look.isPinned;

    const reactionCommand = isAlreadyReacted
      ? new DeleteFeedReaction(lookId, reactionType)
      : new CreateFeedReaction(lookId, reactionType);

    this.store.dispatch(reactionCommand).pipe(untilDestroyed(this)).subscribe();
  }
  onManageLook(event: { lookId: string; action: 'hide' | 'delete' }) {
    this.lookToManage = event;
    this.isDialogVisible.set(true);
  }
  confirmLookAction() {
    if (!this.lookToManage) return;

    const { lookId, action } = this.lookToManage;

    const manageCommand =
      action === 'hide' ? new HideLook(lookId) : new DeleteFeedLook(lookId);
    this.store.dispatch(manageCommand).pipe(untilDestroyed(this)).subscribe();

    this.lookToManage = null;
    this.isDialogVisible.set(false);
  }
  private resetFeedState() {
    this.store
      .dispatch(new ResetFeedState())
      .pipe(
        tap(() =>
          this.dispatchFilters({
            [LookFilterType.Status]: LookStatus.Public,
            [LookFilterType.PageNumber]: 1,
            [LookFilterType.PageSize]: 20,
          }),
        ),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
