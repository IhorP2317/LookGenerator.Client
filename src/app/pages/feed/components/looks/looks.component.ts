import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { PagedList } from '../../../../core/models/helpers/paged-list';
import { FeedLook } from '../../../../core/models/look/feed-look';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';

import { debounceTime, fromEvent, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AsyncPipe, NgClass } from '@angular/common';
import {
  ReactionType,
  ReactionTypeEnum,
} from '../../../../core/models/reaction/reaction-type';
import { User } from '../../../../core/models/user/user';
import { Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../../../shared/services/loading.service';

@UntilDestroy()
@Component({
  selector: 'app-looks',
  imports: [
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    AsyncPipe,
    NgClass,
    RouterLink,
  ],
  templateUrl: './looks.component.html',
  styleUrl: './looks.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LooksComponent implements AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  @ViewChildren('lookCard') lookCards!: QueryList<ElementRef>;
  loading$ = inject(LoadingService).loading$;
  private router: Router = inject(Router);

  itemsPerRow = signal(4);
  rowHeight = 1032;
  looks = input<PagedList<FeedLook>>({
    items: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  loadedPages = input<Set<number>>(new Set<number>());
  currentUser = input<User | null>(null);

  rows = computed(() => {
    const result: FeedLook[][] = [];
    const items = this.looks().items;
    const itemsPerRow = this.itemsPerRow();

    for (let i = 0; i < items.length; i += itemsPerRow) {
      result.push(items.slice(i, i + itemsPerRow));
    }

    return result;
  });

  lookPageNumberChange = output<number>();
  reactionChange = output<{
    lookId: string;
    reactionType: ReactionType;
  }>();
  manageLook = output<{ lookId: string; action: 'hide' | 'delete' }>();

  ngAfterViewInit() {
    this.calculateItemsPerRow();

    fromEvent(window, 'resize')
      .pipe(
        debounceTime(150),
        tap(() => this.calculateItemsPerRow()),
        untilDestroyed(this),
      )
      .subscribe();
    this.lookCards.changes
      .pipe(
        tap(() => this.calculateItemsPerRow()),
        untilDestroyed(this),
      )
      .subscribe();
  }

  calculateItemsPerRow() {
    if (this.viewport && this.lookCards.length > 0) {
      const cardWidth = this.lookCards.first.nativeElement.offsetWidth;
      const viewportWidth = this.viewport.elementRef.nativeElement.clientWidth;
      const cardsFit = Math.floor(viewportWidth / cardWidth);

      this.itemsPerRow.set(Math.max(1, cardsFit));
    }
  }

  onScrollIndexChange(index: number) {
    const { items, hasNextPage, page } = this.looks();
    const itemsPerRow = this.itemsPerRow();
    const rowsLoaded = Math.ceil(items.length / itemsPerRow);

    const preloadThreshold = 3;
    const remainingRows = rowsLoaded - index;

    if (hasNextPage && remainingRows <= preloadThreshold) {
      const nextPage = page + 1;

      if (!this.loadedPages().has(nextPage)) {
        this.lookPageNumberChange.emit(nextPage);
      }
    }
  }

  toggleReaction(lookId: string, reactionType: ReactionType) {
    this.reactionChange.emit({
      lookId,
      reactionType,
    });
  }
  onManageLook(lookId: string, action: 'hide' | 'delete') {
    this.manageLook.emit({ lookId, action });
  }
  navigateToLook(lookId: string) {
    void this.router.navigate(['/looks', lookId]);
  }

  trackByIndex = (i: number) => i;
  protected readonly ReactionTypeEnum = ReactionTypeEnum;
}
