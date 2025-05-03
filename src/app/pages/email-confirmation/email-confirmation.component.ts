import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { EmailConfirmationState } from '../../shared/store/email-confirmation/email-confirmation.state';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { ConfirmEmail } from '../../shared/store/email-confirmation/email-confirmation.actions';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrl: './email-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailConfirmationComponent implements OnInit {
  private store: Store = inject(Store);
  private route: ActivatedRoute = inject(ActivatedRoute);
  isEmailConfirmed = this.store.selectSignal(
    EmailConfirmationState.getIsEmailConfirmed,
  );

  ngOnInit(): void {
    this.confirmEmail();
  }

  private confirmEmail() {
    this.route.queryParams
      .pipe(
        map((params) => ({
          email: params['email'] as string,
          token: params['token'] as string,
        })),
        filter((params) => !!params.email && !!params.token),
        take(1),
        switchMap(({ email, token }) =>
          this.store.dispatch(new ConfirmEmail(email, token)),
        ),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
