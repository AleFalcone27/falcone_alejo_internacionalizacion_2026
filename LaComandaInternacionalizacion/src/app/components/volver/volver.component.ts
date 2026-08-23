import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonButton, IonIcon } from "@ionic/angular/standalone";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-volver',
  templateUrl: './volver.component.html',
  styleUrls: ['./volver.component.scss'],
  imports: [IonIcon, IonButton, TranslatePipe]
})
export class VolverComponent {

  constructor(private router: Router, private location: Location) { }

  volver() {
    this.location.back();
  }

}
