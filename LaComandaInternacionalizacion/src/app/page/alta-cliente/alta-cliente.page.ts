import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonDatetime, IonInput, IonLabel, IonItem, IonSegmentButton, IonToggle } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { UiService } from '../../services/ui/ui.service';
import { QRCodeScannerService } from 'src/app/services/qRCodeScanenr/q-rcode-scanner.service';
import { AppComponent } from 'src/app/app.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-alta-cliente',
  imports: [IonToggle, IonLabel, CommonModule, ReactiveFormsModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './alta-cliente.page.html',
  styleUrls: ['./alta-cliente.page.scss'],
})
export class AltaClientePage implements OnInit, ViewWillEnter {
  registroForm: FormGroup;
  esAnonimo = false;
  mensaje = '';
  fotoPreview: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ui: UiService,
    private qrService: QRCodeScannerService,
    private translate: TranslateService
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: [''],
      email: ['', [Validators.email]],
      contraseña: [''],
      repetirContraseña: [''],
      dni: [''],
      fechaNacimiento: [''],
      foto: [''],
    });
  }

  ngOnInit(): void {
    this.qrService.clearQrData();
  }

  async ionViewWillEnter() {
    const qrData = this.qrService.getLastQrData();
    if (qrData) {
      this.completarDesdeQR(qrData);
      this.qrService.clearQrData();
    }
  }

  completarDesdeQR(data: string) {
    const partes = data.split('@');
    if (partes.length >= 6) {
      const dni = partes[4];
      const apellido = this.capitalize(partes[1]);
      const nombre = this.capitalize(partes[2]);
      const fechaNacimiento = partes[5];
      const valoresActuales = this.registroForm.value;

      this.registroForm.patchValue({
        dni: valoresActuales.dni || dni,
        apellido: valoresActuales.apellido || apellido,
        nombre: valoresActuales.nombre || nombre,
        fechaNacimiento: valoresActuales.fechaNacimiento || fechaNacimiento,
      });
    }
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    this.fotoPreview = image.dataUrl ?? null;
    this.registroForm.patchValue({ foto: image.dataUrl });
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }

  async onRegistrar() {
    if (this.esAnonimo) {
      this.registroForm.patchValue({
        apellido: '',
        email: '',
        contraseña: '',
        repetirContraseña: '',
        dni: '',
        fechaNacimiento: '',
      });
    }

    // Validaciones manuales
    if (!this.esAnonimo) {
      this.registroForm.get('apellido')?.setValidators([Validators.required]);
      this.registroForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.registroForm.get('contraseña')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.registroForm.get('repetirContraseña')?.setValidators([Validators.required]);
      this.registroForm.get('dni')?.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      this.registroForm.get('apellido')?.clearValidators();
      this.registroForm.get('email')?.clearValidators();
      this.registroForm.get('contraseña')?.clearValidators();
      this.registroForm.get('repetirContraseña')?.clearValidators();
      this.registroForm.get('dni')?.clearValidators();
    }

    this.registroForm.updateValueAndValidity();

    if (this.registroForm.invalid) {
      const mensaje = this.getFirstError();
      AppComponent.instance.toast.show(mensaje);
      return;
    }

    if (!this.esAnonimo) {
      const pass = this.registroForm.get('contraseña')?.value;
      const repeatPass = this.registroForm.get('repetirContraseña')?.value;
      if (pass !== repeatPass) {
        this.mensaje = this.translate.instant('ALTA_CLIENTE.PASSWORDS_DONT_MATCH');
        AppComponent.instance.toast.show(this.mensaje);
        return;
      }
    }

    const datosCliente = this.registroForm.value;
    const { nombre, email, contraseña, foto } = datosCliente;

    try {
      this.isLoading = true;

      const resultado = await this.authService.register(email, contraseña, nombre);

      if (resultado.error) {
        console.error('Error al registrar usuario:', resultado.error.message);
        AppComponent.instance.toast.show(this.translate.instant('ALTA_CLIENTE.REGISTER_FAILED'));
        setTimeout(() => this.isLoading = false, 1500);
        return;
      }

      const uid = resultado.data.user?.id;

      let imageUrl: string | null = null;
      if (foto) {
        try {
          const blobFoto = this.dataURLtoBlob(foto);
          imageUrl = await this.authService.uploadUserImage(blobFoto, uid);
        } catch (imgErr) {
          console.warn('No se pudo subir la imagen:', imgErr);
        }
      }

      const cliente = {
        id: uid,
        nombre: datosCliente.nombre,
        apellido: datosCliente.apellido,
        email: datosCliente.email,
        dni: datosCliente.dni,
        foto: imageUrl ?? undefined,
        alta: 0,
        rol: this.esAnonimo ? 'clienteAnonimo' : 'cliente'
      };

      await this.authService.createCliente(cliente);

      this.registroForm.reset();
      AppComponent.instance.toast.showGod(this.translate.instant('ALTA_CLIENTE.REGISTER_SUCCESS'));

      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      }, 1500);

    } catch (err) {
      console.error('Error general durante el registro:', err);
      AppComponent.instance.toast.show(this.translate.instant('ALTA_CLIENTE.REGISTER_ERROR'));
      setTimeout(() => this.isLoading = false, 1500);
    }
  }

  dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  // Extra: método para mostrar primer error
  getFirstError(): string {
    for (const key in this.registroForm.controls) {
      const control = this.registroForm.get(key);
      if (control?.invalid) {
        const field = this.translate.instant('ALTA_CLIENTE.FIELD_NAMES.' + key);
        if (control.errors?.['required']) return this.translate.instant('ALTA_CLIENTE.FIELD_REQUIRED', { field });
        if (control.errors?.['email']) return this.translate.instant('ALTA_CLIENTE.FIELD_INVALID_EMAIL', { field });
        if (control.errors?.['minlength']) {
          const min = control.errors['minlength'].requiredLength;
          return this.translate.instant('ALTA_CLIENTE.FIELD_MIN_LENGTH', { field, min: min });
        }
      }
    }
    return this.translate.instant('ALTA_CLIENTE.INVALID_FORM');
  }
}
