import { Component, effect, inject, model, OnInit } from '@angular/core';
import { createDispatchMap, select, Store } from '@ngxs/store';
import { AuthState } from '../../shared/store/auth/auth.state';
import { UserProfileState } from '../../shared/store/user-profile/user-profile.state';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  switchMap,
  tap,
} from 'rxjs';
import {
  CreateUserProfileLookReaction,
  DeleteUserProfileLook,
  DeleteUserProfileLookReaction,
  GetProfileUser,
  GetUserProfileLooks,
} from '../../shared/store/user-profile/user-profile.actions';
import { catchErrorWithNotification } from '../../core/helpers/utils/catch-error-with-notification.util';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Button } from 'primeng/button';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  LookFilterPayload,
  LookFilterType,
  LookScopeFilter,
} from '../../core/models/helpers/look-filter-type';
import { LookStatus } from '../../core/models/look/look-status';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ReactionType,
  ReactionTypeEnum,
} from '../../core/models/reaction/reaction-type';
import { DeleteUser } from '../../shared/store/auth/auth.actions';
import { Dialog } from 'primeng/dialog';

@UntilDestroy()
@Component({
  selector: 'app-user-profile',
  imports: [
    TabsModule,
    NgTemplateOutlet,
    Button,
    NgClass,
    Paginator,
    ReactiveFormsModule,
    RouterLink,
    Dialog,
    PrimeTemplate,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  actions = createDispatchMap({
    getProfileUser: GetProfileUser,
    getUserProfileLooks: GetUserProfileLooks,
    createUserProfileLookReaction: CreateUserProfileLookReaction,
    deleteUserProfileLookReaction: DeleteUserProfileLookReaction,
    deleteUserProfileLook: DeleteUserProfileLook,
    deleteUser: DeleteUser,
  });

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private messageService: MessageService = inject(MessageService);
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  currentUser = select(AuthState.getCurrentUser);
  userFromProfile = select(UserProfileState.getUser);
  userProfileLooks = select(UserProfileState.getLooks);
  form = this.formBuilder.group({
    lookScope: this.formBuilder.control<LookScopeFilter>(
      LookFilterType.CreatedBy,
    ),
    page: this.formBuilder.control<number>(1),
    pageSize: this.formBuilder.control<number>(20),
  });
  lookScopeSignal = toSignal(this.form.controls.lookScope.valueChanges, {
    initialValue: this.form.controls.lookScope.value,
  });
  confirmDialogVisible = model<boolean>(false);
  confirmDialogConfig: {
    entityType: 'user' | 'look';
    entityId: string;
    title: string;
    message: string;
  } | null = null;

  currentUserEffect = effect(() => {
    if (!this.currentUser()) {
      this.form.controls.lookScope.setValue(LookFilterType.CreatedBy);
    }
  });

  ngOnInit(): void {
    this.LoadUserFromProfile();
    this.onFormChange();
  }

  onChangePasswordClick() {
    void this.router.navigate(['/password/change']);
  }
  navigateToLook(lookId: string) {
    void this.router.navigate(['/looks', lookId]);
  }

  private LoadUserFromProfile() {
    this.activatedRoute.paramMap
      .pipe(
        distinctUntilChanged((prev, curr) => {
          return prev.get('id') === curr.get('id');
        }),
        tap(() => {
          this.form.patchValue({
            lookScope: LookFilterType.CreatedBy,
            page: 1,
          });
        }),
        switchMap((params) => {
          const id: string | null = params.get('id');
          if (!id) {
            return EMPTY;
          }
          return this.actions.getProfileUser(id);
        }),
        tap(() => this.loadLooks()),
        catchErrorWithNotification<void>(this.messageService),
        untilDestroyed(this),
      )
      .subscribe();
  }

  loadLooks() {
    const currentUser = this.currentUser();
    const lookScope = this.form.controls.lookScope.value;
    const userId = this.userFromProfile()?.id;
    const page = this.form.controls.page.value;
    const pageSize = this.form.controls.pageSize.value;
    const statuses =
      currentUser?.id === userId || currentUser?.role === 'Admin'
        ? [LookStatus.Private, LookStatus.Public]
        : [LookStatus.Public];

    if (!lookScope || !userId) return;

    const filters: LookFilterPayload = {
      [lookScope]: userId,
      [LookFilterType.Status]: statuses,
      [LookFilterType.PageNumber]: page,
      [LookFilterType.PageSize]: pageSize,
    };

    this.actions
      .getUserProfileLooks(filters)
      .pipe(
        catchErrorWithNotification<void>(this.messageService),
        untilDestroyed(this),
      )
      .subscribe();
  }

  onTabChange(scope: LookScopeFilter) {
    this.form.patchValue({
      lookScope: scope,
      page: 1,
    });
  }

  onPageChange(event: PaginatorState) {
    const form = this.form;
    const currentSize = form.controls.pageSize.value;
    const newSize = event.rows ?? 20;

    form.patchValue({
      page: currentSize !== newSize ? 1 : (event.page ?? 0) + 1,
      pageSize: newSize,
    });
  }

  onFormChange() {
    this.form.valueChanges
      .pipe(
        debounceTime(200),
        tap(() => {
          this.loadLooks();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  onReactionsChange(lookId: string, reactionType: ReactionType) {
    if (!this.currentUser()) {
      this.messageService.add({
        severity: 'secondary',
        summary: 'Reaction is not saved!',
        detail: 'You must be logged in to react!',
      });
      return;
    }

    const look = this.userProfileLooks()?.items.find(
      (look) => look.id === lookId,
    );
    if (!look) return;

    const isAlreadyReacted =
      reactionType === ReactionTypeEnum.Like ? look.isLiked : look.isPinned;

    const reactionCommand = isAlreadyReacted
      ? this.actions
          .deleteUserProfileLookReaction(lookId, reactionType)
          .pipe(tap(() => this.loadLooks()))
      : this.actions.createUserProfileLookReaction(lookId, reactionType);

    reactionCommand.pipe(untilDestroyed(this)).subscribe();
  }

  openConfirmDialog(config: {
    entityType: 'user' | 'look';
    entityId: string;
    title?: string;
    message?: string;
  }) {
    this.confirmDialogConfig = {
      entityType: config.entityType,
      entityId: config.entityId,
      title: config.title || 'Confirm Action',
      message:
        config.message ||
        `Are you sure you want to delete this ${config.entityType}?`,
    };
    this.confirmDialogVisible.set(true);
  }

  onDeleteUserClick() {
    const userId = this.userFromProfile()?.id;
    if (!userId) return;

    this.openConfirmDialog({
      entityType: 'user',
      entityId: userId,
      message:
        'Are you sure you want to delete this user account? This action cannot be undone.',
    });
  }

  // When triggering look deletion
  onDeleteLookClick(lookId: string) {
    this.openConfirmDialog({
      entityType: 'look',
      entityId: lookId,
      message:
        'Are you sure you want to delete this look? This action cannot be undone.',
    });
  }

  confirmAction() {
    if (!this.confirmDialogConfig) return;

    const { entityType, entityId } = this.confirmDialogConfig;
    const deleteCommand =
      entityType === 'look'
        ? this.actions.deleteUserProfileLook(entityId)
        : this.actions.deleteUser(entityId);

    deleteCommand.pipe(untilDestroyed(this)).subscribe();
    this.confirmDialogConfig = null;
    this.confirmDialogVisible.set(false);
  }

  protected readonly LookFilterType = LookFilterType;
  protected readonly ReactionTypeEnum = ReactionTypeEnum;
}
