export type Continent = 'America' | 'Europa' | 'Asia' | 'Africa' | 'Oceania';

export interface LocationEntry {
  id: string;
  country: string;
  continent: Continent;
  lang: string;
  lat: number;
  lng: number;
  /** Hand-tuned position (0-100) on world-map.svg, spaced to avoid pin overlap. */
  mapX: number;
  mapY: number;
  flag: string;
}

export const LOCATIONS: LocationEntry[] = [
  // América (10)
  { id: 'us', country: 'Estados Unidos', continent: 'America', lang: 'en', lat: 39.8, lng: -98.6, mapX: 15, mapY: 25, flag: '🇺🇸' },
  { id: 'ca', country: 'Canadá', continent: 'America', lang: 'fr', lat: 56.1, lng: -106.3, mapX: 10, mapY: 16, flag: '🇨🇦' },
  { id: 'mx', country: 'México', continent: 'America', lang: 'es', lat: 23.6, lng: -102.5, mapX: 21, mapY: 34, flag: '🇲🇽' },
  { id: 'gt', country: 'Guatemala', continent: 'America', lang: 'es', lat: 15.8, lng: -90.2, mapX: 15, mapY: 41, flag: '🇬🇹' },
  { id: 'br', country: 'Brasil', continent: 'America', lang: 'pt', lat: -14.2, lng: -51.9, mapX: 31, mapY: 59, flag: '🇧🇷' },
  { id: 'ar', country: 'Argentina', continent: 'America', lang: 'es', lat: -38.4, lng: -63.6, mapX: 22, mapY: 90, flag: '🇦🇷' },
  { id: 'co', country: 'Colombia', continent: 'America', lang: 'es', lat: 4.6, lng: -74.1, mapX: 19, mapY: 53, flag: '🇨🇴' },
  { id: 'pe', country: 'Perú', continent: 'America', lang: 'es', lat: -9.2, lng: -75.0, mapX: 15, mapY: 64, flag: '🇵🇪' },
  { id: 'cl', country: 'Chile', continent: 'America', lang: 'es', lat: -35.7, lng: -71.5, mapX: 15, mapY: 80, flag: '🇨🇱' },
  { id: 'py', country: 'Paraguay', continent: 'America', lang: 'gn', lat: -23.4, lng: -58.4, mapX: 25, mapY: 73, flag: '🇵🇾' },

  // Europa (2)
  { id: 'es', country: 'España', continent: 'Europa', lang: 'es', lat: 40.5, lng: -3.7, mapX: 45, mapY: 27, flag: '🇪🇸' },
  { id: 'de', country: 'Alemania', continent: 'Europa', lang: 'de', lat: 51.2, lng: 10.4, mapX: 52, mapY: 17, flag: '🇩🇪' },

  // Asia (2)
  { id: 'jp', country: 'Japón', continent: 'Asia', lang: 'ja', lat: 36.2, lng: 138.3, mapX: 85, mapY: 22, flag: '🇯🇵' },
  { id: 'in', country: 'India', continent: 'Asia', lang: 'hi', lat: 21.1, lng: 78.7, mapX: 68, mapY: 30, flag: '🇮🇳' },

  // África (2)
  { id: 'eg', country: 'Egipto', continent: 'Africa', lang: 'ar', lat: 26.8, lng: 30.8, mapX: 52, mapY: 35, flag: '🇪🇬' },
  { id: 'ke', country: 'Kenia', continent: 'Africa', lang: 'sw', lat: -0.02, lng: 37.9, mapX: 53, mapY: 52, flag: '🇰🇪' },

  // Oceanía (2)
  { id: 'au', country: 'Australia', continent: 'Oceania', lang: 'en', lat: -25.3, lng: 133.8, mapX: 80, mapY: 68, flag: '🇦🇺' },
  { id: 'nz', country: 'Nueva Zelanda', continent: 'Oceania', lang: 'en', lat: -40.9, lng: 174.9, mapX: 87, mapY: 75, flag: '🇳🇿' },
];

export const SUPPORTED_LANGUAGES: string[] = Array.from(new Set(LOCATIONS.map(l => l.lang)));
