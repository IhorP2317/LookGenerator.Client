import { User } from '../../../core/models/user/user';
import { BearerToken } from '../../../core/models/bearer-token/bearer-token';

export interface AuthStateModel {
  currentUser: User | null;
  bearerToken: BearerToken | null;
}
