import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens';
import { ReactionType } from '../models/reaction/reaction-type';

@Injectable({
  providedIn: 'root',
})
export class ReactionApiService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(API_URL);
  createReaction(lookId: string, reactionType: ReactionType) {
    return this.http.post<void>(this.apiUrl + `/reactions`, {
      lookId: lookId,
      reactionType: reactionType,
    });
  }
  deleteReaction(lookId: string, reactionType: ReactionType) {
    return this.http.delete<void>(this.apiUrl + `/reactions`, {
      params: {
        lookId: lookId,
        reactionType: reactionType,
      },
    });
  }
}
