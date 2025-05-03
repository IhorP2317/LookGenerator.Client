import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens';
import {
  LookFilterPayload,
  LookFilterType,
} from '../models/helpers/look-filter-type';
import { PagedList } from '../models/helpers/paged-list';
import { FeedLook } from '../models/look/feed-look';
import { Observable } from 'rxjs';
import { Look } from '../models/look/look';
import { LookStatus } from '../models/look/look-status';

@Injectable({
  providedIn: 'root',
})
export class LookApiService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(API_URL);

  getLooks(filters: LookFilterPayload): Observable<PagedList<FeedLook>> {
    return this.http.post<PagedList<FeedLook>>(this.apiUrl + '/looks', {
      filters: filters,
    });
  }

  generateLook(
    gender: string,
    attributeOptionIds: string[],
    colours: string[],
    measurements: Record<string, number>,
  ) {
    return this.http.post<Look[]>(this.apiUrl + '/looks/generate', {
      gender,
      attributeOptionIds,
      colours,
      measurements,
    });
  }
  generateLookByItem(
    productVariationId: string,
    measurements: Record<string, number>,
  ) {
    return this.http.post<Look[]>(this.apiUrl + '/looks/generateByItem', {
      productVariationId,
      measurements,
    });
  }
  updateLook(
    id: string,
    name: string,
    description: string | null,
    colorPalette: string,
    status: LookStatus,
    productVariationIds: string[],
  ) {
    return this.http.put<void>(this.apiUrl + `/looks/${id}`, {
      name,
      description,
      colorPalette,
      status,
      productVariationIds,
    });
  }
  updateLookStatus(id: string, status: LookStatus) {
    return this.http.put<void>(this.apiUrl + `/looks/${id}/status`, {
      status,
    });
  }
  deleteLook(id: string) {
    return this.http.delete<void>(this.apiUrl + `/looks/${id}`);
  }
}
