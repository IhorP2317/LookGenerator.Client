import {BearerToken} from '../../../core/models/bearer-token/bearer-token';

const ACTION_SCOPE = '[Auth]';
export class Login {
  static readonly type = `${ACTION_SCOPE} LoginUser`;
  constructor(
    public email: string,
    public password: string,
  ) {}
}
export class RefreshToken {
  static readonly type = `${ACTION_SCOPE} RefreshToken`;
  constructor(public token: BearerToken) {
  }
}
export class Logout{
  static readonly type = `${ACTION_SCOPE} Logout`;
}
