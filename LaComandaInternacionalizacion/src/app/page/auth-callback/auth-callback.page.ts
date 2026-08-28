import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  templateUrl: './auth-callback.page.html',
  styleUrls: ['./auth-callback.page.scss'],
  imports: [IonContent, CommonModule, TranslatePipe]
})
export class AuthCallbackPage implements OnInit {

  constructor(
    private auth: AuthService,
    private router: Router,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    const { error, user } = await this.auth.handleOAuthRedirect();

    if (error?.message === 'alta_false') {
      AppComponent.instance.toast.show(this.translate.instant('LOGIN.PENDING_ADMIN_APPROVAL'), 3000);
      this.router.navigate(['/login']);
      return;
    }

    if (error?.message === 'denied') {
      AppComponent.instance.toast.show(this.translate.instant('LOGIN.REGISTRATION_DENIED'), 3000);
      this.router.navigate(['/login']);
      return;
    }

    if (error || !user) {
      AppComponent.instance.toast.show(this.translate.instant('LOGIN.SOCIAL_LOGIN_ERROR'), 3000);
      this.router.navigate(['/login']);
      return;
    }

    AppComponent.instance.toast.showGod(this.translate.instant('LOGIN.LOGIN_SUCCESS'));
    this.router.navigate([this.auth.getRouteForRole(user.rol)]);
  }

}
