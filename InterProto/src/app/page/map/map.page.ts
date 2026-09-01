import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { LOCATIONS, LocationEntry, Continent } from '../../data/locations';
import { LocationService } from '../../services/location.service';

type Pin = LocationEntry;

interface ContinentTab {
  id: Continent;
  labelKey: string;
}

const LANGUAGE_STORAGE_KEY = 'appLang';

const CONTINENT_TABS: ContinentTab[] = [
  { id: 'America', labelKey: 'MAP.CONTINENT_AMERICA' },
  { id: 'Europa', labelKey: 'MAP.CONTINENT_EUROPE' },
  { id: 'Asia', labelKey: 'MAP.CONTINENT_ASIA' },
  { id: 'Africa', labelKey: 'MAP.CONTINENT_AFRICA' },
  { id: 'Oceania', labelKey: 'MAP.CONTINENT_OCEANIA' },
];

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, TranslatePipe]
})
export class MapPage {

  continents = CONTINENT_TABS;
  selectedContinent = signal<Continent>('America');

  pins = computed<Pin[]>(() =>
    LOCATIONS.filter(loc => loc.continent === this.selectedContinent())
  );

  constructor(
    private router: Router,
    private translate: TranslateService,
    private locationService: LocationService
  ) {}

  selectContinent(continent: Continent): void {
    this.selectedContinent.set(continent);
  }

  selectPin(pin: Pin): void {
    this.locationService.select(pin);
    this.translate.use(pin.lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, pin.lang);
    this.router.navigateByUrl('/demo');
  }
}
