import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { NonNullableFormBuilder } from '@angular/forms';
import { FeedState } from '../../shared/store/feed/feed.state';
import { LooksComponent } from './components/looks/looks.component';
import { GetLooks } from '../../shared/store/feed/feed.actions';
import { LookFilterType } from '../../core/models/helpers/look-filter-type';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';

@UntilDestroy()
@Component({
  selector: 'app-feed',
  imports: [LooksComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent {
  private store: Store = inject(Store);
  private messageService: MessageService = inject(MessageService);
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  looks = this.store.selectSignal(FeedState.getLooks);
  attributeOptions = this.store.selectSignal(FeedState.getAttributeOptions);
  colours = this.store.selectSignal(FeedState.getColours);
  genders = this.store.selectSignal(FeedState.getGenders);
  filters = this.store.selectSignal(FeedState.getFilters);

  onLookPageNumberChange(pageNumber: number) {
    this.store
      .dispatch(
        new GetLooks({
          ...this.filters(),
          [LookFilterType.PageNumber]: pageNumber,
        }),
      )
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
