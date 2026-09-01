import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonButton, IonIcon,
  ActionSheetController
} from '@ionic/angular/standalone';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { arrowBack, restaurantOutline, heartOutline, shareSocialOutline, informationCircleOutline } from 'ionicons/icons';

import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.page.html',
  styleUrls: ['./demo.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, TranslatePipe]
})
export class DemoPage {

  location = this.locationService.current;

  listItems = ['DEMO.LIST_ITEM_1', 'DEMO.LIST_ITEM_2', 'DEMO.LIST_ITEM_3', 'DEMO.LIST_ITEM_4'];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private locationService: LocationService,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({ arrowBack, restaurantOutline, heartOutline, shareSocialOutline, informationCircleOutline });
  }

  goBackToMap(): void {
    this.router.navigateByUrl('/map');
  }

  async openMenu(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('DEMO.MENU_TITLE'),
      buttons: [
        { text: this.translate.instant('DEMO.MENU_OPTION_1'), icon: 'heart-outline' },
        { text: this.translate.instant('DEMO.MENU_OPTION_2'), icon: 'share-social-outline' },
        { text: this.translate.instant('DEMO.MENU_OPTION_3'), icon: 'information-circle-outline' },
        { text: this.translate.instant('DEMO.MENU_CANCEL'), role: 'cancel' }
      ]
    });
    await sheet.present();
  }
}
