import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { PagedList } from '../../../../core/models/helpers/paged-list';
import { FeedLook } from '../../../../core/models/look/feed-look';
import { ReactionTypeEnum } from '../../../../core/models/reaction/reaction-type';
import { Router } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-draft-look-feed',
  imports: [Skeleton, NgClass],
  templateUrl: './draft-look-feed.component.html',
  styleUrl: './draft-look-feed.component.css',
})
export class DraftLookFeedComponent {
  private router: Router = inject(Router);
  generatedLooks = input.required<PagedList<FeedLook>>();
  isLoading = input<boolean>(false);
  nextPage = output<number>();
  likedLook = output<string>();
  deletedLook = output<string>();

  totalPages = computed(() =>
    Math.ceil(
      this.generatedLooks().totalCount / this.generatedLooks().pageSize,
    ),
  );

  // Navigation methods
  onNextPageClick() {
    if (this.generatedLooks().page < this.totalPages()) {
      this.nextPage.emit(this.generatedLooks().page + 1);
    }
  }

  onPreviousPageClick() {
    if (this.generatedLooks().page > 1) {
      this.nextPage.emit(this.generatedLooks().page - 1);
    }
  }
  onLikeLook(lookId: string) {
    this.likedLook.emit(lookId);
  }
  onDeleteLook(lookId: string) {
    this.deletedLook.emit(lookId);
  }
  navigateToLook(lookId: string) {
    void this.router.navigate(['/looks', lookId]);
  }
  protected readonly ReactionTypeEnum = ReactionTypeEnum;
}
