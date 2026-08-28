import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AppComponent } from 'src/app/app.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-alta-bebida',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './alta-bebida.page.html',
  styleUrls: ['./alta-bebida.page.scss'],
})
export class AltaBebidaPage {
  bebidaForm: FormGroup;
  fotoPreview1: string | null = null;
  fotoPreview2: string | null = null;
  fotoPreview3: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.bebidaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      tiempoEstimadoDePreparacion: ['', [Validators.required, Validators.min(0)]],
      foto1: ['', Validators.required],
      foto2: ['', Validators.required],
      foto3: ['', Validators.required],
    });
  }

  async tomarFoto(slot: 1 | 2 | 3) {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    if (slot === 1) this.fotoPreview1 = image.dataUrl ?? null;
    if (slot === 2) this.fotoPreview2 = image.dataUrl ?? null;
    if (slot === 3) this.fotoPreview3 = image.dataUrl ?? null;

    this.bebidaForm.patchValue({ [`foto${slot}`]: image.dataUrl });
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }

  async onGuardar() {
    if (this.bebidaForm.invalid) {
      AppComponent.instance.toast.show(this.translate.instant('ALTA_BEBIDA.INVALID_FORM'));
      return;
    }

    const datos = this.bebidaForm.value;

    try {
      this.isLoading = true;

      const fotos = [
        this.dataURLtoBlob(datos.foto1),
        this.dataURLtoBlob(datos.foto2),
        this.dataURLtoBlob(datos.foto3),
      ];

      await this.authService.crearProductoConFotos(
        {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio: Number(datos.precio),
          tiempoEstimadoDePreparacion: Number(datos.tiempoEstimadoDePreparacion),
          areaDePreparacion: 2,
        },
        fotos
      );

      AppComponent.instance.toast.showGod(this.translate.instant('ALTA_BEBIDA.SAVE_SUCCESS'));

      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/empleados-home']);
      }, 1500);

    } catch (err) {
      console.error('Error al crear la bebida:', err);
      AppComponent.instance.toast.show(this.translate.instant('ALTA_BEBIDA.SAVE_ERROR'));
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
}
