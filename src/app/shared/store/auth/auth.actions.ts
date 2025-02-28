import { BearerToken } from '../../../core/models/bearer-token/bearer-token';

const ACTION_SCOPE = '[Auth]';
export class Login {
  static readonly type = `${ACTION_SCOPE} Login`;
  constructor(
    public email: string,
    public password: string,
  ) {}
}
export class RefreshToken {
  static readonly type = `${ACTION_SCOPE} RefreshToken`;
  constructor(public token: BearerToken) {}
}
export class Logout {
  static readonly type = `${ACTION_SCOPE} Logout`;
}

export class Signup {
  static readonly type = `${ACTION_SCOPE} Signup`;
  constructor(
    public userName: string,
    public email: string,
    public password: string,
  ) {}
}

export class SendForgotPasswordEmail {
  static readonly type = `${ACTION_SCOPE} Send Forgot Password Email`;
  constructor(public email: string) {}
}

export class ResetPassword {
  static readonly type = `${ACTION_SCOPE} Reset Password`;
  constructor(
    public email: string,
    public passwordResetToken: string,
    public newPassword: string,
  ) {}
}

export class ChangePassword {
  static readonly type = `${ACTION_SCOPE} Change Password`;
  constructor(
    public userId: string,
    public oldPassword: string,
    public newPassword: string,
  ) {}
}

export class DeleteUser {
  static readonly type = `${ACTION_SCOPE} Delete User`;
  constructor(public userId: string) {}
}
