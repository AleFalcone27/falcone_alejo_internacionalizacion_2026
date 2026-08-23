import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UiService } from '../../services/ui/ui.service';
import { CustomToastComponent } from '../../components/custom-toast/custom-toast.component';
import { ViewChild } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule, FormsModule, CustomToastComponent, FormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  mensaje = '';
  isLoading = false;
  @ViewChild('toast')
  toast: CustomToastComponent = new CustomToastComponent;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private ui: UiService,private translate: TranslateService) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(6)]],
    });
    console.log('Current language:', this.translate.getCurrentLang());
  }
  
  async onLogin() {
    const correoCtrl = this.loginForm.get('correo');
    const claveCtrl = this.loginForm.get('clave');

    // Validaciones detalladas
    if (correoCtrl?.invalid || claveCtrl?.invalid) {
      this.loginForm.markAllAsTouched();

      if (correoCtrl?.errors?.['required']) {
        AppComponent.instance.toast.show(this.translate.instant('LOGIN.EMAIL_REQUIRED'), 1000);
        return;
      }

      if (correoCtrl?.errors?.['email']) {
        AppComponent.instance.toast.show(this.translate.instant('LOGIN.EMAIL_INVALID'), 1000);
        return;
      }

      if (claveCtrl?.errors?.['required']) {
        AppComponent.instance.toast.show(this.translate.instant('LOGIN.PASSWORD_REQUIRED'), 1000);
        return;
      }

      if (claveCtrl?.errors?.['minlength']) {
        AppComponent.instance.toast.show(this.translate.instant('LOGIN.PASSWORD_MIN_LENGTH'), 1000);
        return;
      }

      return;
    }
    // Si pasa las validaciones, continuar con login
    const { correo, clave } = this.loginForm.value;
    this.isLoading = true;

    const { error, user } = await this.auth.login(correo, clave);

    if (error?.message == 'alta_false') {
      console.log(error)
      setTimeout(async () => {
        AppComponent.instance.toast.show(this.translate.instant('LOGIN.PENDING_ADMIN_APPROVAL'), 3000);
        this.isLoading = false;
        await this.ui.hideLoading();
      }, 1000);
      return;
    }


    if (error?.message == 'denied') {
      console.log(error)
      setTimeout(async () => {
        AppComponent.instance.toast.show(this.translate.instant('LOGIN.REGISTRATION_DENIED'), 3000);
        this.isLoading = false;
        await this.ui.hideLoading();
      }, 1000);
      return;
    }

    if (error) {
      setTimeout(async () => {
        AppComponent.instance.toast.show(this.translate.instant('LOGIN.INVALID_CREDENTIALS'), 3000);
        this.isLoading = false;
        await this.ui.hideLoading();
      }, 1000);
      return;
    }

    // Éxito
    AppComponent.instance.toast.showGod(this.translate.instant('LOGIN.LOGIN_SUCCESS'));
    this.loginForm.reset();
    this.isLoading = false;

    // Redirección según rol
    switch (user.rol) {
      case 'cliente':
        this.router.navigate(['/home-cliente']);
        break;
      case 'mozo':
        this.router.navigate(['/home-mozo']);
        break;
      case 'supervisor':
        this.router.navigate(['/home-supervisor']);
        break;
      case 'maitre':
        this.router.navigate(['/home-maitre']);
        break;
          case 'cocinero':
      this.router.navigate(['/empleados-home']);
      break;
          case 'bartender':
      this.router.navigate(['/empleados-home']);
      break;
    }
  }




  cargarUsuarioRapido(correo: string, clave: string) {
    this.loginForm.patchValue({ correo, clave });
  }




}