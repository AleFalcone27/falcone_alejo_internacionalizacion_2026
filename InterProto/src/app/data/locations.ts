export type Continent = 'America' | 'Europa' | 'Asia' | 'Africa' | 'Oceania';

export interface LocationEntry {
  id: string;
  country: string;
  capital: string;
  population: number;
  areaKm2: number;
  currency: string;
  timezone: string;
  callingCode: string;
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
  // América (10) — positioned to match assets/continents/america.jpg
  { id: 'us', country: 'Estados Unidos', capital: 'Washington D.C.', population: 331000000, areaKm2: 9834000, currency: 'USD', timezone: 'UTC-5 a UTC-10', callingCode: '+1', continent: 'America', lang: 'en', lat: 39.8, lng: -98.6, mapX: 31.5, mapY: 19, flag: '🇺🇸' },
  { id: 'ca', country: 'Canadá', capital: 'Ottawa', population: 38900000, areaKm2: 9985000, currency: 'CAD', timezone: 'UTC-3.5 a UTC-8', callingCode: '+1', continent: 'America', lang: 'fr', lat: 56.1, lng: -106.3, mapX: 44, mapY: 20, flag: '🇨🇦' },
  { id: 'mx', country: 'México', capital: 'Ciudad de México', population: 128900000, areaKm2: 1964000, currency: 'MXN', timezone: 'UTC-8 a UTC-6', callingCode: '+52', continent: 'America', lang: 'es', lat: 23.6, lng: -102.5, mapX: 27.1, mapY: 33, flag: '🇲🇽' },
  { id: 'gt', country: 'Guatemala', capital: 'Ciudad de Guatemala', population: 17600000, areaKm2: 108889, currency: 'GTQ', timezone: 'UTC-6', callingCode: '+502', continent: 'America', lang: 'es', lat: 15.8, lng: -90.2, mapX: 39.1, mapY: 40.5, flag: '🇬🇹' },
  { id: 'br', country: 'Brasil', capital: 'Brasília', population: 216400000, areaKm2: 8516000, currency: 'BRL', timezone: 'UTC-5 a UTC-2', callingCode: '+55', continent: 'America', lang: 'pt', lat: -14.2, lng: -51.9, mapX: 76.9, mapY: 59, flag: '🇧🇷' },
  { id: 'ar', country: 'Argentina', capital: 'Buenos Aires', population: 45800000, areaKm2: 2780000, currency: 'ARS', timezone: 'UTC-3', callingCode: '+54', continent: 'America', lang: 'es', lat: -38.4, lng: -63.6, mapX: 68.1, mapY: 82.5, flag: '🇦🇷' },
  { id: 'co', country: 'Colombia', capital: 'Bogotá', population: 52200000, areaKm2: 1142000, currency: 'COP', timezone: 'UTC-5', callingCode: '+57', continent: 'America', lang: 'es', lat: 4.6, lng: -74.1, mapX: 54.9, mapY: 49.5, flag: '🇨🇴' },
  { id: 'pe', country: 'Perú', capital: 'Lima', population: 34400000, areaKm2: 1285000, currency: 'PEN', timezone: 'UTC-5', callingCode: '+51', continent: 'America', lang: 'es', lat: -9.2, lng: -75.0, mapX: 57.4, mapY: 57.5, flag: '🇵🇪' },
  { id: 'cl', country: 'Chile', capital: 'Santiago', population: 19600000, areaKm2: 756000, currency: 'CLP', timezone: 'UTC-4 a UTC-3', callingCode: '+56', continent: 'America', lang: 'es', lat: -35.7, lng: -71.5, mapX: 59.9, mapY: 77.5, flag: '🇨🇱' },
  { id: 'py', country: 'Paraguay', capital: 'Asunción', population: 6900000, areaKm2: 406752, currency: 'PYG', timezone: 'UTC-4', callingCode: '+595', continent: 'America', lang: 'gn', lat: -23.4, lng: -58.4, mapX: 70.3, mapY: 63.3, flag: '🇵🇾' },

  // Europa (2) — positioned to match assets/continents/europa.jpg
  { id: 'es', country: 'España', capital: 'Madrid', population: 47600000, areaKm2: 505990, currency: 'EUR', timezone: 'UTC+1', callingCode: '+34', continent: 'Europa', lang: 'es', lat: 40.5, lng: -3.7, mapX: 15.5, mapY: 77, flag: '🇪🇸' },
  { id: 'de', country: 'Alemania', capital: 'Berlín', population: 84400000, areaKm2: 357588, currency: 'EUR', timezone: 'UTC+1', callingCode: '+49', continent: 'Europa', lang: 'de', lat: 51.2, lng: 10.4, mapX: 62.2, mapY: 46.2, flag: '🇩🇪' },

  // Asia (2) — positioned to match assets/continents/asia.jpg
  { id: 'jp', country: 'Japón', capital: 'Tokio', population: 124500000, areaKm2: 377975, currency: 'JPY', timezone: 'UTC+9', callingCode: '+81', continent: 'Asia', lang: 'ja', lat: 36.2, lng: 138.3, mapX: 90, mapY: 30, flag: '🇯🇵' },
  { id: 'in', country: 'India', capital: 'Nueva Delhi', population: 1428600000, areaKm2: 3287263, currency: 'INR', timezone: 'UTC+5:30', callingCode: '+91', continent: 'Asia', lang: 'hi', lat: 21.1, lng: 78.7, mapX: 35, mapY: 69, flag: '🇮🇳' },

  // África (2) — positioned to match assets/continents/africa.jpg
  { id: 'eg', country: 'Egipto', capital: 'El Cairo', population: 112700000, areaKm2: 1002450, currency: 'EGP', timezone: 'UTC+2', callingCode: '+20', continent: 'Africa', lang: 'ar', lat: 26.8, lng: 30.8, mapX: 71, mapY: 18, flag: '🇪🇬' },
  { id: 'ke', country: 'Kenia', capital: 'Nairobi', population: 55100000, areaKm2: 580367, currency: 'KES', timezone: 'UTC+3', callingCode: '+254', continent: 'Africa', lang: 'sw', lat: -0.02, lng: 37.9, mapX: 78.2, mapY: 53.4, flag: '🇰🇪' },

  // Oceanía (2) — positioned to match assets/continents/oceania.jpg (crop covers mainland Australia only; NZ falls outside its frame, so it's placed near the bottom-right ocean edge as an approximation)
  { id: 'au', country: 'Australia', capital: 'Canberra', population: 26600000, areaKm2: 7692024, currency: 'AUD', timezone: 'UTC+8 a UTC+10.5', callingCode: '+61', continent: 'Oceania', lang: 'en', lat: -25.3, lng: 133.8, mapX: 57.5, mapY: 48.6, flag: '🇦🇺' },
  { id: 'nz', country: 'Nueva Zelanda', capital: 'Wellington', population: 5200000, areaKm2: 268021, currency: 'NZD', timezone: 'UTC+12', callingCode: '+64', continent: 'Oceania', lang: 'en', lat: -40.9, lng: 174.9, mapX: 95, mapY: 90, flag: '🇳🇿' },
];

export const SUPPORTED_LANGUAGES: string[] = Array.from(new Set(LOCATIONS.map(l => l.lang)));

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
  ja: '日本語',
  hi: 'हिन्दी',
  ar: 'العربية',
  sw: 'Kiswahili',
  gn: 'Guaraní',
};
