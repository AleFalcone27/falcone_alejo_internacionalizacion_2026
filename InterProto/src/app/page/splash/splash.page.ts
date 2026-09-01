import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, TranslatePipe]
})
export class SplashPage implements OnInit {

  showLogo = false;
  showTitle = false;
  showAlejo = false;

  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => this.showLogo = true, 200);
    setTimeout(() => this.showTitle = true, 900);
    setTimeout(() => this.showAlejo = true, 1700);
    setTimeout(() => {
      this.router.navigateByUrl('/map');
    }, 3400);
  }

}
