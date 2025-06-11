import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { createDispatchMap, select } from '@ngxs/store';
import { SizeGuideState } from '../../shared/store/size-guide/size-guide.state';
import { NonNullableFormBuilder } from '@angular/forms';
import { Gender } from '../../core/models/helpers/gender';
import { GetSizeGuide } from '../../shared/store/size-guide/size-guide.actions';
import { SizeGuideFilterType } from '../../core/models/helpers/size-guide-filter-type';
import { BodyZoneToSelect } from '../../core/models/helpers/body-zone-to-select';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchErrorWithNotification } from '../../core/helpers/utils/catch-error-with-notification.util';
import { MessageService } from 'primeng/api';
import { NgClass } from '@angular/common';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { SplitCamelCasePipe } from '../../core/helpers/pipes/split-camel-case.pipe';
import { ToleranceRangePipe } from '../../core/helpers/pipes/tolerance-range.pipe';
import { CM_TOLERANCE, INCH_TOLERANCE } from '../../core/constants/constants';
@UntilDestroy()
@Component({
  selector: 'app-size-guide',
  imports: [NgClass, TableModule, SplitCamelCasePipe, ToleranceRangePipe],
  templateUrl: './size-guide.component.html',
  styleUrl: './size-guide.component.css',
})
export class SizeGuideComponent implements OnInit {
  actions = createDispatchMap({
    getSizeGuide: GetSizeGuide,
  });
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private messageService: MessageService = inject(MessageService);
  sizeGuide = select(SizeGuideState.getSizeGuide);
  genders = select(SizeGuideState.getGenders);
  bodyZones = select(SizeGuideState.getBodyZones);
  measureMeta = select(SizeGuideState.getMeasurementMeta);
  measurementData = computed(() => {
    const categories = this.sizeGuide()?.rows.flatMap((row) => row.parameter);
    return this.measureMeta()?.filter((measure) =>
      categories?.includes(measure.key),
    );
  });

  unit = signal<'cm' | 'in'>('cm');
  imageUrl: string = '';

  form = this.formBuilder.group({
    gender: this.formBuilder.control<Gender>(Gender.Man),
    bodyZone: this.formBuilder.control<BodyZoneToSelect>('TOP'),
  });

  ngOnInit(): void {
    this.loadSizeGuide();
    this.onFormValueChanges();
  }
  loadSizeGuide() {
    this.actions
      .getSizeGuide({
        [SizeGuideFilterType.Gender]: this.form.controls.gender.value,
        [SizeGuideFilterType.BodyZone]: this.form.controls.bodyZone.value,
      })
      .pipe(
        tap(() => this.updateImageUrl()),
        catchErrorWithNotification<void>(this.messageService),
        untilDestroyed(this),
      )
      .subscribe();
  }
  toggleGender(gender: Gender) {
    if (this.form.value.gender !== gender) {
      this.form.controls.gender.setValue(gender);
    }
  }
  toggleBodyZone(bodyZone: BodyZoneToSelect) {
    if (this.form.value.bodyZone !== bodyZone) {
      this.form.controls.bodyZone.setValue(bodyZone);
    }
  }
  private onFormValueChanges() {
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this))
      .subscribe(() => {
        this.loadSizeGuide();
      });
  }
  private updateImageUrl(): void {
    const gender = this.form.controls.gender.value.toLowerCase();
    const bodyZone = this.form.controls.bodyZone.value.toLowerCase();
    this.imageUrl = `/assets/images/${gender}_${bodyZone}.jpg`;
  }

  protected readonly CM_TOLERANCE = CM_TOLERANCE;
  protected readonly Gender = Gender;
  protected readonly INCH_TOLERANCE = INCH_TOLERANCE;
}
