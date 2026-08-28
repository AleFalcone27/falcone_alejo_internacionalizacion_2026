import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonToggle, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AppComponent } from 'src/app/app.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EstadoMesas, UbicacionMesa } from 'src/app/models';

@Component({
  selector: 'app-alta-mesa',
  imports: [IonToggle, IonLabel, IonSelect, IonSelectOption, CommonModule, ReactiveFormsModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './alta-mesa.page.html',
  styleUrls: ['./alta-mesa.page.scss'],
})
export class AltaMesaPage {
  mesaForm: FormGroup;
  fotoPreview: string | null = null;
  isLoading = false;
  ubicaciones = [UbicacionMesa.Salon, UbicacionMesa.Patio];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.mesaForm = this.fb.group({
      numero: ['', [Validators.required, Validators.min(1)]],
      descripcion: [''],
      capacidad: ['', [Validators.required, Validators.min(1)]],
      aptaBebes: [false],
      ubicacion: [UbicacionMesa.Salon, Validators.required],
      foto: ['', Validators.required],
    });
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    this.fotoPreview = image.dataUrl ?? null;
    this.mesaForm.patchValue({ foto: image.dataUrl });
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }

  async onGuardar() {
    if (this.mesaForm.invalid) {
      AppComponent.instance.toast.show(this.translate.instant('ALTA_MESA.INVALID_FORM'));
      return;
    }

    const datos = this.mesaForm.value;

    try {
      this.isLoading = true;

      const fotoBlob = this.dataURLtoBlob(datos.foto);

      await this.authService.crearMesaConFoto(
        {
          numero: Number(datos.numero),
          descripcion: datos.descripcion,
          capacidad: Number(datos.capacidad),
          aptaBebes: !!datos.aptaBebes,
          ubicacion: datos.ubicacion,
          estado: EstadoMesas.Libre,
        },
        fotoBlob
      );

      AppComponent.instance.toast.showGod(this.translate.instant('ALTA_MESA.SAVE_SUCCESS'));

      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/home-supervisor']);
      }, 1500);

    } catch (err) {
      console.error('Error al crear la mesa:', err);
      AppComponent.instance.toast.show(this.translate.instant('ALTA_MESA.SAVE_ERROR'));
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
