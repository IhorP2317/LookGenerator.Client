const ACTION_SCOPE = '[Email]';
export class ConfirmEmail {
  static readonly type = `${ACTION_SCOPE} Confirm Email`;
  constructor(
    public email: string,
    public token: string,
  ) {}
}
export class SendEmailConfirmation {
  static readonly type = `${ACTION_SCOPE} Send Email Confirmation`;
  constructor(public email: string) {}
}
