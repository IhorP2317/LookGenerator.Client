import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SizeGuideStateModel } from './size-guide.state.model';
import { SIZE_GUIDE_STATE_TOKEN } from '../../../tokens';
import { SizeGuideApiService } from '../../../core/services/size-guide.api.service';
import { inject, Injectable } from '@angular/core';
import { GetSizeGuide } from './size-guide.actions';
import { SizeGuideTable } from '../../../core/models/size-guide/size-guide-table';
import { patch } from '@ngxs/store/operators';
import { tap } from 'rxjs';
import { Gender } from '../../../core/models/helpers/gender';
import {
  BODY_ZONES,
  MEASUREMENT_METADATA,
} from '../../../core/constants/constants';
@Injectable()
@State<SizeGuideStateModel>({
  name: SIZE_GUIDE_STATE_TOKEN,
  defaults: {
    sizeGuide: {
      sizes: [],
      rows: [],
    },
    genders: [Gender.Man, Gender.Woman],
    bodyZones: BODY_ZONES,
    measurementMeta: MEASUREMENT_METADATA,
  },
})
export class SizeGuideState {
  private sizeGuideApiService = inject(SizeGuideApiService);
  @Selector([SizeGuideState])
  public static getSizeGuide(state: SizeGuideStateModel) {
    return state?.sizeGuide;
  }
  @Selector([SizeGuideState])
  public static getGenders(state: SizeGuideStateModel) {
    return state?.genders;
  }
  @Selector([SizeGuideState])
  public static getBodyZones(state: SizeGuideStateModel) {
    return state?.bodyZones;
  }
  @Selector([SizeGuideState])
  public static getMeasurementMeta(state: SizeGuideStateModel) {
    return state?.measurementMeta;
  }
  @Action(GetSizeGuide)
  loadSizeGuide(ctx: StateContext<SizeGuideStateModel>, action: GetSizeGuide) {
    return this.sizeGuideApiService
      .getSizeGuide(action.filters)
      .pipe(tap((sizeGuide) => this.setSizeGuide(ctx, sizeGuide)));
  }

  private setSizeGuide(
    ctx: StateContext<SizeGuideStateModel>,
    sizeGuide: SizeGuideTable,
  ) {
    ctx.setState(
      patch({
        sizeGuide,
      }),
    );
  }
}
