import { Component, ViewChild } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { VolverComponent } from './components/volver/volver.component';
import { Router } from '@angular/router';
import { filter } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomToastComponent } from './components/custom-toast/custom-toast.component';
import { App } from '@capacitor/app';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, VolverComponent, CommonModule, CustomToastComponent],
})
export class AppComponent {
  @ViewChild('toast') toast!: CustomToastComponent;

  showNavbar!: boolean;
  showLogOut!: boolean;
  public static instance: AppComponent;

  constructor(private router: Router, private authService: AuthService) {
    AppComponent.instance = this;
  }
  ngAfterViewInit() {
    AppComponent.instance = this;
  }
  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const rutaActual = event.urlAfterRedirects;
        this.showNavbar = !(rutaActual === '/login' || rutaActual === '/splash' || rutaActual === '/home-supervisor' || rutaActual === '/alta-cliente'
          || rutaActual === '/home-maitre' || rutaActual === '/home-cliente' || rutaActual === '/home-mozo'
        );
      });

    const observer = new MutationObserver(() => {
      this.showNavbar = !document.body.classList.contains('overlay-activo');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    App.addListener('appUrlOpen', async ({ url }) => {
      if (!url.startsWith('elbocado://auth-callback')) {
        return;
      }

      await this.authService.handleNativeOAuthRedirect(url);
      this.router.navigateByUrl('/auth-callback');
    });
  }
}
