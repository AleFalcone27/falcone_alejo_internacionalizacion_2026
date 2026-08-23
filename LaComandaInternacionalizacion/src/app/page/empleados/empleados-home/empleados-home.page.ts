import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empleados-home',
  templateUrl: './empleados-home.page.html',
  styleUrls: ['./empleados-home.page.scss'],
  standalone: true,
  imports: [IonButton, CommonModule, FormsModule, TranslatePipe]
})
export class EmpleadosHomePage {
  constructor(private authService: AuthService, private router: Router) { }

  CerrarCesion() {
    this.authService.logout();
    this.navTo('/login')
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }

  async navTo1() {
      const rol = this.authService.getUserRole();  // método que devuelve 'cocinero' o 'bartender'

        if ( await rol === 'cocinero') {
    this.router.navigate(['pedidos-cocina']);
  } else if ( await rol === 'bartender') {
    this.router.navigate(['pedidos-bar']);
  } else {
    // Opcional: mensaje o acceso restringido
  }

  }
}
