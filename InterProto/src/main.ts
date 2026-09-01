import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import {
  provideTranslateService,
  TranslateService
} from '@ngx-translate/core';

import { provideHttpClient } from '@angular/common/http';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { SUPPORTED_LANGUAGES } from './app/data/locations';

const savedLang = localStorage.getItem('appLang');
const browserLang = navigator.language.split('-')[0];

const selectedLang = SUPPORTED_LANGUAGES.includes(savedLang ?? '')
  ? savedLang!
  : SUPPORTED_LANGUAGES.includes(browserLang)
  ? browserLang
  : 'en';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),

    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },

    provideIonicAngular(),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: selectedLang
    })
  ]
}).then(appRef => {
  const translate = appRef.injector.get(TranslateService);

  console.log('Browser language:', navigator.language);
  console.log('Application language:', translate.getCurrentLang());
})
.catch(err => console.error(err));
