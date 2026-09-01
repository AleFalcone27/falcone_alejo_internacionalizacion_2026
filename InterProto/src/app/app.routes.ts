import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () => import('./page/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: 'map',
    loadComponent: () => import('./page/map/map.page').then(m => m.MapPage)
  },
  {
    path: 'demo',
    loadComponent: () => import('./page/demo/demo.page').then(m => m.DemoPage)
  }
];
