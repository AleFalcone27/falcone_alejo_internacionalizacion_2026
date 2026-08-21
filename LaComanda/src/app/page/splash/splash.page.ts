import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent,CommonModule, FormsModule]
})
export class SplashPage implements OnInit {

  showWave = false;
  showTitle = false;
  showAlejo = false;
  showIgnacio = false;
  showAgustin = false;

  constructor(private router:Router){}

  ngOnInit() {
    setTimeout(() => this.showWave = true, 1000);     // Wave -> 1s
    setTimeout(() => this.showTitle = true, 1500);     // App title -> 2s
    setTimeout(() => this.showAlejo = true, 3000);     // Nombres
    setTimeout(() => this.showIgnacio = true, 3500);
    setTimeout(() => this.showAgustin = true, 4000);
    setTimeout(() => {
    this.router.navigateByUrl('/login');
  }, 6000);
  }

}
