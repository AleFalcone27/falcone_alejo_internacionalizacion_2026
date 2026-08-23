import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Cliente, ListaDeEspera } from 'src/app/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-de-espera-maitre',
  templateUrl: './lista-de-espera-maitre.page.html',
  styleUrls: ['./lista-de-espera-maitre.page.scss'],
  standalone: true,
  imports: [IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, CommonModule, FormsModule, TranslatePipe]
})
export class ListaDeEsperaMaitrePage implements OnInit {

  clientesPendientes: ListaDeEspera[] = [];
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

async ngOnInit() {
  this.isLoading = true;
  setTimeout(async () => {
    this.clientesPendientes = await this.authService.getListaDeEspera();
    console.log(this.clientesPendientes);
    this.isLoading = false; 
  }, 1000);
}
  VerMesasDisponibles(cliente: Cliente) {
    this.navTo('/asignar-mesa-maitre', cliente.id)
  }

  rechazarCliente(cliente: Cliente) {
    throw new Error('Method not implemented.');
  }

  navTo(path: string, cliente_id?: string) {
    if (cliente_id) {
      this.router.navigate([path, cliente_id]);
    } else {
      this.router.navigate([path]);
    }
  }

}
