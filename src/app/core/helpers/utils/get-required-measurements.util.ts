import { REQUIRED_MEASURES } from '../../constants/constants';
import { Gender } from '../../models/helpers/gender';

export function getRequiredMeasures(
  gender: Gender,
  bodyZone: keyof (typeof REQUIRED_MEASURES)[Gender],
) {
  return REQUIRED_MEASURES[gender][bodyZone] || [];
}
