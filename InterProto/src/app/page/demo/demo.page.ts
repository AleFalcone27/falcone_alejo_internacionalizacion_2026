import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonButton, IonIcon, IonBadge,
  IonAccordionGroup, IonAccordion
} from '@ionic/angular/standalone';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  arrowBack, businessOutline, peopleOutline, languageOutline,
  resizeOutline, cashOutline, timeOutline, callOutline, bulbOutline
} from 'ionicons/icons';

import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.page.html',
  styleUrls: ['./demo.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonButton, IonIcon, IonBadge,
    IonAccordionGroup, IonAccordion, TranslatePipe
  ]
})
export class DemoPage {

  location = this.locationService.current;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private locationService: LocationService
  ) {
    addIcons({
      arrowBack, businessOutline, peopleOutline, languageOutline,
      resizeOutline, cashOutline, timeOutline, callOutline, bulbOutline
    });
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this.translate.currentLang() || 'es').format(value);
  }

  goBackToMap(): void {
    this.router.navigateByUrl('/map');
  }
}
