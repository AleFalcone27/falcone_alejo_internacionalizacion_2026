import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-supervisor',
  templateUrl: './home-supervisor.page.html',
  styleUrls: ['./home-supervisor.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, CommonModule, FormsModule]
})
export class HomeSupervisorPage {

  constructor(private authService:AuthService, private router:Router ) { }

  CerrarCesion(){
    this.authService.logout();
    this.navTo('/login')
  }

  navTo(path:string){
    this.router.navigate([path]);
  }
 
}


