import { Injectable, signal } from '@angular/core';
import { LocationEntry, LOCATIONS } from '../data/locations';

@Injectable({ providedIn: 'root' })
export class LocationService {
  readonly current = signal<LocationEntry>(LOCATIONS[0]);

  select(entry: LocationEntry): void {
    this.current.set(entry);
  }
}
