import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCardTitle, IonCardContent, IonIcon, IonCard, IonCardHeader } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { EmailService } from 'src/app/services/email/email.service';

@Component({
  selector: 'app-clientes-supervisor',
  templateUrl: './clientes-supervisor.page.html',
  styleUrls: ['./clientes-supervisor.page.scss'],
  standalone: true,
  imports: [IonCardHeader, IonCard, IonButton, IonCardContent, IonCardTitle, CommonModule, FormsModule]
})
export class ClientesSupervisorPage implements OnInit {

  clientesPendientes: any[] = [];
  isLoading = false;

  constructor(private authService: AuthService, private router: Router, private emailService:EmailService) { }

  async ngOnInit() {
    this.isLoading = true;
    setTimeout(async () => {
      this.clientesPendientes = await this.authService.getClientesPendientesDeAlta();
      this.isLoading = false;
    })


  }

  navTo(path: string) {
    this.router.navigate([path]);
  }

  async aceptarCliente(cliente: any) {
    this.isLoading = true;
    setTimeout(async () => {
      this.authService.aceptarCliente(cliente['id']);
      this.clientesPendientes = await this.authService.getClientesPendientesDeAlta();
      this.isLoading = false;
      console.log(cliente["email"]);
      this.emailService.enviarCorreoCuentaAprobada({name: cliente['nombre'], to_email: cliente['email']})
      AppComponent.instance.toast.show("Cliente aceptado")
    }, 1000)
  }

  async rechazarCliente(cliente: any) {
    this.isLoading = true;
    setTimeout(async () => {
      this.authService.rechazarCliente(cliente['id']);
      this.clientesPendientes = await this.authService.getClientesPendientesDeAlta();
      this.emailService.enviarCorreoCuentaRechazada({name: cliente['nombre'], to_email: cliente['email']})
      this.isLoading = false;
      AppComponent.instance.toast.show("Cliente rechazado"); 
    }, 1000)

  }

  private async recargarClientesPendientes() {
    this.clientesPendientes = await this.authService.getClientesPendientesDeAlta();
  }

}
