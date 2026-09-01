import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon, IonCard, IonCardContent, AlertController, ToastController, Platform, IonCardHeader, IonChip, IonLabel, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { qrCodeOutline, cameraOutline, stopCircleOutline, infiniteOutline } from 'ionicons/icons';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
import { JSONQr, dniData1 } from 'src/app/models';
import { AuthService } from 'src/app/services/auth/auth.service';
import { QRCodeScannerService } from 'src/app/services/qRCodeScanenr/q-rcode-scanner.service';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

const BarcodeScanner = {
  checkPermission: async (_options?: { force?: boolean }) => ({ granted: true, denied: false }),
  prepare: async () => undefined,
  stopScan: async () => undefined,
  openAppSettings: async () => undefined,
  startScan: async () => {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
    });

    return {
      hasContent: Boolean(result.ScanResult),
      content: result.ScanResult,
    };
  },
};

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-code-scanner.page.html',
  styleUrls: ['./qr-code-scanner.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    TranslatePipe,
  ]
})
export class QrCodeScannerPage implements OnInit, OnDestroy {

  processedQrData: JSONQr | null = null;
  scannedData: string = '';
  isScanning: boolean = false;
  cameraPreviewActive: boolean = false;
  isInitializing: boolean = false;
  continuousScanning: boolean = false;
  scanResult: any = null;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform,
    private navController: NavController,
    private authService: AuthService,
    private qRCodeScannerService: QRCodeScannerService,
    private router: Router,
    private translate: TranslateService
  ) {
    addIcons({ infiniteOutline, qrCodeOutline, cameraOutline, stopCircleOutline });
  }

  async ngOnInit() {

    // Esperar a que la vista se cargue completamente
    setTimeout(async () => {
      await this.initializeCamera();
    }, 500);
  }

  async ngOnDestroy() {
    await this.stopCameraPreview();
  }

  private async initializeCamera() {
    this.isInitializing = true;

    try {
      // Verificar si estamos en un dispositivo real
      if (!this.platform.is('capacitor')) {
        AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.MOBILE_ONLY'));
        this.isInitializing = false;
        return;
      }

      // Verificar disponibilidad del plugin
      if (!BarcodeScanner) {
        AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.PLUGIN_UNAVAILABLE'));
        this.isInitializing = false;
        return;
      }


      const permission = await BarcodeScanner.checkPermission({ force: true });

      if (!permission.granted) {
        if (permission.denied) {
          this.showPermissionDeniedAlert();
        } else {
          const newPermission = await BarcodeScanner.checkPermission({ force: true });
          if (!newPermission.granted) {
            this.showPermissionAlert();
            this.isInitializing = false;
            return;
          }
        }
      }

      await this.startCameraPreview();

    } catch (error) {

      AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.CAMERA_INIT_ERROR', { error }));
    } finally {
      this.isInitializing = false;
    }
  }

  async startCameraPreview() {
    try {


      if (this.cameraPreviewActive) {

        return;
      }

      // Detener cualquier escaneo previo
      try {
        await BarcodeScanner.stopScan();
      } catch (e) {
        // Ignorar errores si no hay escaneo activo
      }

      await BarcodeScanner.prepare();

      // Hacer que el background sea transparente para ver la cámara
      document.body.classList.add('scanner-active');

      // Configurar estilos para el preview
      const body = document.body;
      body.style.background = 'transparent';

      this.cameraPreviewActive = true;
      // Iniciar escaneo automáticamente
      setTimeout(() => {
        if (this.cameraPreviewActive) {
          this.startScan();
        }
      }, 1000);

    } catch (error) {
      AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.CAMERA_START_ERROR', { error }));
      this.cameraPreviewActive = false;

      // Limpiar clases CSS en caso de error
      document.body.classList.remove('scanner-active');
    }
  }

  async stopCameraPreview() {
    try {


      if (this.cameraPreviewActive || this.isScanning) {
        await BarcodeScanner.stopScan();

        // Restaurar el background
        document.body.classList.remove('scanner-active');
        document.body.style.background = '';

        this.cameraPreviewActive = false;
        this.isScanning = false;

      }
    } catch (error) {

      // Forzar limpieza en caso de error
      document.body.classList.remove('scanner-active');
      document.body.style.background = '';
      this.cameraPreviewActive = false;
      this.isScanning = false;
    }
  }

  async startScan() {
    try {
      if (!this.cameraPreviewActive) {
        await this.startCameraPreview();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.isScanning = true;
      const result = await BarcodeScanner.startScan();

      if (result && result.hasContent) {
        this.scannedData = result.content;
        this.scanResult = result;

        // Procesar datos
        this.processQrData(result.content);

        // Guardar en localStorage
        localStorage.setItem('qrScannedData', result.content);
        localStorage.setItem('qrScanResult', JSON.stringify(result));

        // Detener cámara
        await this.stopCameraPreview();

        // Mostrar resultado y volver
        setTimeout(() => {
          this.showResultAndGoBack();
        }, 1500);
      } else {
        ;
        AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.QR_READ_ERROR'));
        this.isScanning = false;
      }

    } catch (error) {

      AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.SCAN_ERROR', { error }));
      this.isScanning = false;

      // Reintentar si el escaneo continuo está activo
      if (this.continuousScanning && this.cameraPreviewActive) {
        setTimeout(() => {
          this.startScan();
        }, 2000);
      }
    }
  }

  private async restartScanner() {
    try {

      // Mostrar toast de reinicio
      AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.RESTARTING_SCANNER'));

      // Limpiar datos anteriores
      this.scannedData = '';
      this.scanResult = null;
      this.processedQrData = null;

      // Asegurar que el escáner esté detenido
      this.isScanning = false;

      // Si la cámara no está activa, inicializarla
      if (!this.cameraPreviewActive) {
        await this.startCameraPreview();
        // Esperar un poco para que el preview se active
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Iniciar nuevo escaneo
      await this.startScan();

    } catch (error) {
      AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.RESTART_ERROR', { error }));

      // En caso de error, intentar reinicializar completamente
      await this.restartCamera();
    }
  }

  private async showResultAndGoBack() {
    if (!this.scannedData) {
      this.goBack();
      return;
    }

    try {
      const jsonScanedData: JSONQr = JSON.parse(this.scannedData);


      if (this.scannedData.startsWith('00')) {
        const [codigo, apellido, nombre, genero, dni, fechaNacimiento, fechaExpedicion] = this.scannedData.split('@');
        let dniDta: dniData1 = {
          codigo: codigo,
          apellido: apellido,
          nombre: nombre,
          genero: genero,
          dni: dni,
          fechaNacimiento: fechaNacimiento,
          fechaExpedicion: fechaExpedicion,
        }
        this.qRCodeScannerService.setQrData(JSON.stringify(dniDta));
        this.goBack();
      }


      switch (jsonScanedData.type) {
        case "ingresar_al_local":
          await this.handleIngresarAlLocal(jsonScanedData);
          break;

        case "ingresar_a_mesa":
          await this.handleIngresarAMesa(jsonScanedData);
          break;

        default:
          AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.UNRECOGNIZED_QR_TYPE', { type: jsonScanedData.type }));
          this.goBack();
          break;
      }

    } catch (error) {
      this.goBack();
    }
  }

  private async handleIngresarAlLocal(jsonScanedData: JSONQr) {
    const alert = await this.createQrAlert(
      this.translate.instant('QR_CODE_SCANNER.CONFIRM_ENTER_LOCAL_MESSAGE'),
      () => {
        this.authService.ingresarEnListaDeEspera();
        this.goBack();
      }
    );
    await alert.present();
  }

private async handleIngresarAMesa(jsonScanedData: JSONQr) {
  try {
    const mesaQR = parseInt(jsonScanedData.objeto['ID']); 

    // 1. Validar QR
    if (isNaN(mesaQR)) {
      AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.INVALID_TABLE_QR'));
      this.goBack();
      return;
    }

    const mesaAsignada = await this.authService.getMesaAsginada();

    // 2. Si el cliente tiene mesa asignada
    if (mesaAsignada) {
      if (mesaQR !== mesaAsignada) {
        AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.TABLE_NOT_ASSIGNED_TO_YOU'));
        this.goBack();
        return;
      }else{
        
      }

      // 2.1 Mesa escaneada coincide con la asignada
      const pedido = await this.authService.getPedidoAsignadoAlCliente();

      if (pedido) {
        AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.SHOWING_ORDER'));
        this.navTo('/estado-pedido-cliente');
        return;
      }
    }

    // 3. Si no tiene mesa asignada, verificar si está en lista de espera
    const enLista = await this.authService.estaEnListaDeEspera();
    if (!enLista) {
      AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.NEED_TABLE_ASSIGNMENT'));
      this.goBack();
      return;
    }

    // 4. Mostrar alerta para confirmar sentarse
    const alert = await this.createQrAlert(
      this.translate.instant('QR_CODE_SCANNER.CONFIRM_SEAT_MESSAGE', { numero: mesaQR }),
      async () => {
        await this.authService.sentarseEnMesa();
        this.goBack();
      },
    );

    await alert.present();

  } catch (error) {
    console.error(error);
    AppComponent.instance.toast.show(this.translate.instant('QR_CODE_SCANNER.TABLE_VERIFICATION_ERROR'));
    this.goBack();
  }
}



  private async createQrAlert(message: string, acceptHandler: () => void) {
    return await this.alertController.create({
      header: this.translate.instant('QR_CODE_SCANNER.QR_SCANNED_HEADER'),
      message: message,
      buttons: [
        {
          text: this.translate.instant('QR_CODE_SCANNER.ACCEPT'),
          handler: acceptHandler
        },
        {
          text: this.translate.instant('QR_CODE_SCANNER.SCAN_AGAIN'),
          handler: async () => {
            await this.restartScanner();
          }
        }
      ]
    });
  }



  // Método para volver a la página anterior
  goBack() {
    this.navController.back();
  }

  async toggleCamera() {
    if (this.isInitializing) {
      return;
    }

    if (this.cameraPreviewActive) {
      await this.stopCameraPreview();
    } else {
      await this.startCameraPreview();
    }
  }

  async restartCamera() {
    await this.stopCameraPreview();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.initializeCamera();
  }

  stopContinuousScanning() {
    this.continuousScanning = false;
    this.isScanning = false;
  }

  startContinuousScanning() {
    this.continuousScanning = true;
    if (this.cameraPreviewActive && !this.isScanning) {
      this.startScan();
    }
  }

  private processQrData(rawData: string) {
    try {
      this.processedQrData = {
        type: 'text',
        mensaje: 'Datos QR procesados',
        objeto: { content: rawData, length: rawData.length }
      };

    } catch (error) {
      this.processedQrData = {
        type: 'error',
        mensaje: 'Error procesando datos',
        objeto: { rawData: rawData, error: error }
      };
    }
  }

  private async showPermissionAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('QR_CODE_SCANNER.PERMISSIONS_NEEDED_HEADER'),
      message: this.translate.instant('QR_CODE_SCANNER.PERMISSIONS_NEEDED_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('COMMON.CANCEL'),
          role: 'cancel',
          handler: () => {
            this.goBack();
          }
        },
        {
          text: this.translate.instant('QR_CODE_SCANNER.ALLOW'),
          handler: async () => {
            await this.initializeCamera();
          }
        }
      ]
    });
    await alert.present();
  }

  private async showPermissionDeniedAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('QR_CODE_SCANNER.PERMISSIONS_DENIED_HEADER'),
      message: this.translate.instant('QR_CODE_SCANNER.PERMISSIONS_DENIED_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('COMMON.CANCEL'),
          role: 'cancel',
          handler: () => {
            this.goBack();
          }
        },
        {
          text: this.translate.instant('QR_CODE_SCANNER.GO_TO_SETTINGS'),
          handler: async () => {
            await BarcodeScanner.openAppSettings();
          }
        }
      ]
    });
    await alert.present();
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }
}
