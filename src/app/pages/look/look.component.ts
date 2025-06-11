import { Component, computed, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { MenuItem, MessageService } from 'primeng/api';
import { LookState } from '../../shared/store/look/look.state';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { switchMap, take } from 'rxjs';
import {
  CreateLookReaction,
  DeleteLookReaction,
  GetLook,
} from '../../shared/store/look/look.actions';
import { CurrencyPipe, DatePipe, NgClass, NgStyle } from '@angular/common';
import {
  LookStatus,
  LookStatusLabel,
} from '../../core/models/look/look-status';
import { ProductBodyZone } from '../../core/models/product/product-body-zone';
import { COLOR_OPTIONS } from '../../core/constants/constants';
import {
  ReactionType,
  ReactionTypeEnum,
} from '../../core/models/reaction/reaction-type';

import { AuthState } from '../../shared/store/auth/auth.state';
import { Menu } from 'primeng/menu';
@UntilDestroy()
@Component({
  selector: 'app-look',
  imports: [CurrencyPipe, DatePipe, NgClass, NgStyle, Menu, RouterLink],
  templateUrl: './look.component.html',
  styleUrl: './look.component.css',
})
export class LookComponent implements OnInit {
  private store: Store = inject(Store);
  private messageService: MessageService = inject(MessageService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  profileItems: MenuItem[] = [
    {
      label: 'Change look',
      icon: 'pi pi-file-edit',
      command: () => this.onChangeLookClick(),
    },
  ];
  look = this.store.selectSignal(LookState.getLook);
  currentUser = this.store.selectSignal(AuthState.getCurrentUser);
  attributes = computed(() => {
    const attrMap: Record<string, Set<string>> = {};

    this.look()?.products.forEach((product) => {
      for (const [key, values] of Object.entries(product.attributes)) {
        if (!attrMap[key]) attrMap[key] = new Set();
        values.forEach((v) => attrMap[key].add(v));
      }
    });

    return Object.fromEntries(
      Object.entries(attrMap).map(([k, v]) => [k, Array.from(v)]),
    );
  });
  colours = computed(() => {
    const allColors = this.look()
      ?.products.map((product) => product.color?.toLowerCase())
      .filter(Boolean); // remove null/undefined

    const distinctColors = [...new Set(allColors)];

    return COLOR_OPTIONS.filter((option) =>
      distinctColors.includes(option.name.toLowerCase()),
    );
  });

  ngOnInit(): void {
    this.loadLook();
  }
  onReactionsChange(reactionType: ReactionType) {
    if (!this.currentUser()) {
      this.messageService.add({
        severity: 'secondary',
        summary: 'Reaction is not saved!',
        detail: 'You must be logged in to react!',
      });
      return;
    }

    const look = this.look();
    if (!look) return;

    const isAlreadyReacted =
      reactionType === ReactionTypeEnum.Like ? look.isLiked : look.isPinned;

    const reactionCommand = isAlreadyReacted
      ? new DeleteLookReaction(reactionType)
      : new CreateLookReaction(reactionType);

    this.store.dispatch(reactionCommand).pipe(untilDestroyed(this)).subscribe();
  }
  private loadLook() {
    this.activatedRoute.paramMap
      .pipe(
        take(1),
        switchMap((params) => {
          const id: string = params.get('id')!;
          return this.store.dispatch(new GetLook(id));
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
  private onChangeLookClick() {
    void this.router.navigate(['/looks/management', this.look()?.id]);
  }

  protected readonly LookStatus = LookStatus;
  protected readonly ProductBodyZone = ProductBodyZone;
  protected readonly LookStatusLabel = LookStatusLabel;
  protected readonly ReactionTypeEnum = ReactionTypeEnum;
}
