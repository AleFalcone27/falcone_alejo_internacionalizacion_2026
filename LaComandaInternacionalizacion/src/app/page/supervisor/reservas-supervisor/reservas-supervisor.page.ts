import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AppComponent } from 'src/app/app.component';
import { Reserva } from 'src/app/models';

@Component({
  selector: 'app-reservas-supervisor',
  templateUrl: './reservas-supervisor.page.html',
  styleUrls: ['./reservas-supervisor.page.scss'],
  standalone: true,
  imports: [IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, CommonModule, FormsModule, TranslatePipe]
})
export class ReservasSupervisorPage implements OnInit {
  isLoading = false;
  reservasPendientes: Reserva[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    await this.cargarReservas();
  }

  async cargarReservas() {
    this.isLoading = true;
    this.reservasPendientes = await this.authService.getReservasPendientes();
    this.isLoading = false;
  }

  async confirmar(reserva: Reserva) {
    if (!reserva.id) return;
    try {
      this.isLoading = true;
      await this.authService.confirmarReserva(reserva.id);
      await this.cargarReservas();
      AppComponent.instance.toast.showGod(this.translate.instant('RESERVAS_SUPERVISOR.CONFIRM_SUCCESS'));
    } catch (err) {
      console.error('Error al confirmar la reserva:', err);
      AppComponent.instance.toast.show(this.translate.instant('RESERVAS_SUPERVISOR.CONFIRM_ERROR'));
    } finally {
      this.isLoading = false;
    }
  }

  async rechazar(reserva: Reserva) {
    if (!reserva.id) return;
    try {
      this.isLoading = true;
      await this.authService.rechazarReserva(reserva.id);
      await this.cargarReservas();
      AppComponent.instance.toast.showGod(this.translate.instant('RESERVAS_SUPERVISOR.REJECT_SUCCESS'));
    } catch (err) {
      console.error('Error al rechazar la reserva:', err);
      AppComponent.instance.toast.show(this.translate.instant('RESERVAS_SUPERVISOR.REJECT_ERROR'));
    } finally {
      this.isLoading = false;
    }
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }
}
