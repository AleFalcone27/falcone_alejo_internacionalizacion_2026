import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-maitre',
  templateUrl: './home-maitre.page.html',
  styleUrls: ['./home-maitre.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, CommonModule, FormsModule]
})
export class HomeMaitrePage {

  constructor(private authService: AuthService, private router: Router) { }

  CerrarCesion() {
    this.authService.logout();
    this.navTo('/login')
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }
}
