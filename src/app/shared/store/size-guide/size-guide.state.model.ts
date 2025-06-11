import { SizeGuideTable } from '../../../core/models/size-guide/size-guide-table';
import { Gender } from '../../../core/models/helpers/gender';
import { BodyZoneToSelect } from '../../../core/models/helpers/body-zone-to-select';
import { MeasurementMeta } from '../../../core/models/helpers/measurement-meta';

export interface SizeGuideStateModel {
  sizeGuide: SizeGuideTable;
  genders: Gender[];
  bodyZones: BodyZoneToSelect[];
  measurementMeta: MeasurementMeta[];
}
