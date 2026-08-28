import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AppComponent } from 'src/app/app.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Reserva, Role, Mesa, EstadoReserva } from 'src/app/models';

@Component({
  selector: 'app-reserva-cliente',
  imports: [IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, CommonModule, ReactiveFormsModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './reserva-cliente.page.html',
  styleUrls: ['./reserva-cliente.page.scss'],
})
export class ReservaClientePage implements OnInit {
  reservaForm: FormGroup;
  isLoading = false;
  misReservas: Reserva[] = [];
  mesas: Mesa[] = [];
  mesasDisponibles: Mesa[] = [];
  private clienteId: string | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.reservaForm = this.fb.group({
      fechaHora: ['', [Validators.required, this.fechaFuturaValidator]],
      mesaId: ['', Validators.required],
      cantidadPersonas: ['', [Validators.required, Validators.min(1)]],
      comentario: [''],
    });

    this.reservaForm.get('fechaHora')!.valueChanges.subscribe(() => this.onFechaChange());
  }

  async ngOnInit() {
    this.isLoading = true;

    const session = await this.authService.getSession();
    const cliente = await this.authService.getClienteById(session?.user.id);

    if (cliente?.rol !== Role.Cliente) {
      AppComponent.instance.toast.show(this.translate.instant('RESERVA_CLIENTE.ONLY_REGISTERED'));
      this.isLoading = false;
      this.router.navigate(['/home-cliente']);
      return;
    }

    this.clienteId = session?.user.id;

    this.mesas = await this.authService.getMesas() ?? [];
    await this.cargarReservas();
    this.isLoading = false;
  }

  fechaFuturaValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const seleccionada = new Date(control.value);
    return seleccionada.getTime() > Date.now() ? null : { notFuture: true };
  }

  async onFechaChange() {
    const fechaControl = this.reservaForm.get('fechaHora')!;
    const mesaControl = this.reservaForm.get('mesaId')!;

    if (fechaControl.invalid || !fechaControl.value) {
      this.mesasDisponibles = [];
      mesaControl.setValue('', { emitEvent: false });
      return;
    }

    const fechaHoraISO = new Date(fechaControl.value).toISOString();
    const mesaIdsReservados = await this.authService.getMesaIdsReservadosParaFecha(fechaHoraISO);
    this.mesasDisponibles = this.mesas.filter(m => !mesaIdsReservados.includes(Number(m.id)));

    if (mesaControl.value && mesaIdsReservados.includes(Number(mesaControl.value))) {
      mesaControl.setValue('', { emitEvent: false });
    }
  }

  async cargarReservas() {
    if (!this.clienteId) return;
    this.misReservas = await this.authService.getReservasCliente(this.clienteId);
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }

  getNumeroMesa(mesaId: number): number | string {
    return this.mesas.find(m => m.id === mesaId)?.numero ?? mesaId;
  }

  getEstadoClass(estado: EstadoReserva | undefined): string {
    if (estado === EstadoReserva.Confirmada) return 'confirmada';
    if (estado === EstadoReserva.Cancelada) return 'cancelada';
    return '';
  }

  getEstadoLabel(estado: EstadoReserva | undefined): string {
    if (estado === EstadoReserva.Confirmada) return this.translate.instant('RESERVA_CLIENTE.STATUS_CONFIRMED');
    if (estado === EstadoReserva.Cancelada) return this.translate.instant('RESERVA_CLIENTE.STATUS_REJECTED');
    return this.translate.instant('RESERVA_CLIENTE.STATUS_PENDING');
  }

  async onReservar() {
    if (this.reservaForm.invalid || !this.clienteId) {
      const mensaje = this.reservaForm.get('fechaHora')?.errors?.['notFuture']
        ? this.translate.instant('RESERVA_CLIENTE.DATE_NOT_FUTURE')
        : this.translate.instant('RESERVA_CLIENTE.INVALID_FORM');
      AppComponent.instance.toast.show(mensaje);
      return;
    }

    const datos = this.reservaForm.value;
    const fechaHoraISO = new Date(datos.fechaHora).toISOString();
    const mesaId = Number(datos.mesaId);

    try {
      this.isLoading = true;

      const ocupada = await this.authService.existeReservaParaMesaYFecha(mesaId, fechaHoraISO);
      if (ocupada) {
        AppComponent.instance.toast.show(this.translate.instant('RESERVA_CLIENTE.TABLE_ALREADY_RESERVED'));
        this.isLoading = false;
        return;
      }

      await this.authService.crearReserva({
        cliente_id: this.clienteId,
        mesa_id: mesaId,
        fecha_hora: fechaHoraISO,
        cantidad_personas: Number(datos.cantidadPersonas),
        comentario: datos.comentario || undefined,
      });

      await this.cargarReservas();
      this.reservaForm.reset();

      AppComponent.instance.toast.showGod(this.translate.instant('RESERVA_CLIENTE.SAVE_SUCCESS'));
      this.isLoading = false;

    } catch (err: any) {
      console.error('Error al crear la reserva:', err);
      const mensaje = err?.code === '23505'
        ? this.translate.instant('RESERVA_CLIENTE.TABLE_ALREADY_RESERVED')
        : this.translate.instant('RESERVA_CLIENTE.SAVE_ERROR');
      AppComponent.instance.toast.show(mensaje);
      this.isLoading = false;
    }
  }
}
