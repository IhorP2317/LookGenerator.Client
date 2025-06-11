import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toleranceRange',
})
export class ToleranceRangePipe implements PipeTransform {
  transform(value: number, tolerance: number): string | null {
    if (value <= 0) return null;

    const lower = (value - tolerance).toFixed(1);
    const upper = (value + tolerance).toFixed(1);
    return `${lower} – ${upper}`;
  }
}
