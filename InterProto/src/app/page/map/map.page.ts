import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
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

const CONTINENT_PHOTOS: Record<Continent, string> = {
  America: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Americas_satellite_map.jpg',
  Europa: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Europe_satellite_bright.jpg',
  Asia: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Asia_satellite_plane.jpg',
  Africa: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Africa_satellite_plane.jpg',
  Oceania: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Australia_satellite_plane.jpg',
};

/** Native pixel dimensions of each photo, used to lock the map container to the same aspect ratio so pin percentages line up with the real image instead of a stretched one. */
const CONTINENT_DIMENSIONS: Record<Continent, { width: number; height: number }> = {
  America: { width: 2300, height: 2900 },
  Europa: { width: 1158, height: 909 },
  Asia: { width: 800, height: 464 },
  Africa: { width: 8460, height: 8900 },
  Oceania: { width: 5250, height: 4320 },
};

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar, TranslatePipe]
})
export class MapPage {

  continents = CONTINENT_TABS;
  selectedContinent = signal<Continent>('America');
  loadingPhoto = signal<boolean>(true);

  /** The map container is always sized to match the Americas photo — every other photo is letterboxed (object-fit: contain) inside that same fixed box instead of resizing it. */
  readonly containerAspectRatio: number = CONTINENT_DIMENSIONS.America.width / CONTINENT_DIMENSIONS.America.height;

  continentPhoto = computed<string>(() => CONTINENT_PHOTOS[this.selectedContinent()]);

  pins = computed<Pin[]>(() =>
    LOCATIONS.filter(loc => loc.continent === this.selectedContinent())
  );

  constructor(
    private router: Router,
    private translate: TranslateService,
    private locationService: LocationService
  ) {}

  selectContinent(continent: Continent): void {
    if (continent === this.selectedContinent()) {
      return;
    }
    this.loadingPhoto.set(true);
    this.selectedContinent.set(continent);
  }

  onPhotoLoad(): void {
    this.loadingPhoto.set(false);
  }

  /**
   * Pin coordinates in `locations.ts` are percentages relative to each continent's own photo.
   * Since the container is now fixed to the Americas' aspect ratio and every other photo is
   * letterboxed (object-fit: contain) inside it, this remaps an image-relative percentage into
   * a container-relative one, accounting for the empty letterbox bars on whichever axis doesn't
   * fill the box.
   */
  pinPosition(pin: Pin): { left: number; top: number } {
    const { width, height } = CONTINENT_DIMENSIONS[this.selectedContinent()];
    const imageAspect = width / height;
    const containerAspect = this.containerAspectRatio;

    if (imageAspect >= containerAspect) {
      // Image fills the container's width; letterboxed with empty bars above/below.
      const imageHeightPercent = 100 * (containerAspect / imageAspect);
      const topBarPercent = (100 - imageHeightPercent) / 2;
      return {
        left: pin.mapX,
        top: topBarPercent + pin.mapY * (imageHeightPercent / 100),
      };
    }

    // Image fills the container's height; letterboxed with empty bars left/right.
    const imageWidthPercent = 100 * (imageAspect / containerAspect);
    const leftBarPercent = (100 - imageWidthPercent) / 2;
    return {
      left: leftBarPercent + pin.mapX * (imageWidthPercent / 100),
      top: pin.mapY,
    };
  }

  selectPin(pin: Pin): void {
    this.locationService.select(pin);
    this.translate.use(pin.lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, pin.lang);
    this.router.navigateByUrl('/demo');
  }
}
