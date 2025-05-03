import { Component, computed, input, output } from '@angular/core';
import { PagedList } from '../../../../core/models/helpers/paged-list';
import { FeedLook } from '../../../../core/models/look/feed-look';
import { LazyLoadEvent, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DataView } from 'primeng/dataview';
import { Scroller, ScrollerLazyLoadEvent } from 'primeng/scroller';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-looks',
  imports: [
    PrimeTemplate,
    Button,
    ProgressSpinner,
    DataView,
    Scroller,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    NgForOf,
  ],
  templateUrl: './looks.component.html',
  styleUrl: './looks.component.css',
})
export class LooksComponent {
  private itemsPerRow = 4;
  looks = input<PagedList<FeedLook>>({
    items: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  chunkedLooks = computed(() => {
    const items = this.looks().items;

    const rows: FeedLook[][] = [];

    for (let i = 0; i < items.length; i += this.itemsPerRow) {
      rows.push(items.slice(i, i + this.itemsPerRow));
    }

    return rows;
  });
  lookPageNumberChange = output<number>();

  onScrollIndexChange(index: number) {
    const { pageSize, totalCount, items, page, hasNextPage } = this.looks();

    const rowsLoaded = items.length / this.itemsPerRow;
    const threshold = 2; // buffer rows before triggering

    if (index + threshold >= rowsLoaded && hasNextPage) {
      const nextPage = page + 1;
      this.lookPageNumberChange.emit(nextPage);
    }
  }
}
