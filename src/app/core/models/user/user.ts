import { BaseEntity } from '../base-entity';

export interface User extends BaseEntity {
  userName: string;
  role: string;
  email: string;
  emailConfirmed: boolean;
}
