import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

 async showLoading(message: string = '', duration: number = 0) {
  if (this.loading) {
    await this.loading.dismiss();
  }

  this.loading = await this.loadingController.create({
    message: message,
    duration: duration > 0 ? duration : undefined,
    spinner: null,
    cssClass: 'custom-loading',
    backdropDismiss: false
  });

  await this.loading.present();
}


  async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

async showToast(message: string, cssClass: string = 'custom-toast', duration: number = 2000, position: 'top' | 'middle' | 'bottom' = 'bottom') {
  const toast = await this.toastController.create({
    message,
    duration,
    position,
    cssClass
  });

  toast.present();
}
}