import { AfterRenderRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { Pedido, Role } from 'src/app/models';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.page.html',
  styleUrls: ['./home-cliente.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, CommonModule, FormsModule, TranslatePipe]
})
export class HomeClientePage implements OnInit, ViewWillEnter {

  showCompletarEncuesta!: boolean;
  showEncuesta!: boolean;
  estaEnListaDeEspera!: boolean;
  showMenu!: boolean;
  isLoading = false;
  pedido!: Pedido;
  estadoPedido = "";
  isRegisteredClient = false;

  constructor(private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    this.init()
  }

  ionViewWillEnter() {
    this.init();
  }

  async init() {

    this.isLoading = true;
    setTimeout(async () => {
      const user = await this.authService.getSession();

      const cliente = await this.authService.getClienteById(user?.user.id);
      this.isRegisteredClient = cliente?.rol === Role.Cliente;

      this.showEncuesta = await this.authService.estaEnListaDeEspera();
      this.showMenu = await this.authService.estaSentadoEnMesa(user!.user.id);
      this.estaEnListaDeEspera = await this.authService.estaEnListaDeEspera();
      this.showCompletarEncuesta = await this.authService.clienteTienePedidoAceptado();

      // Esperar correctamente el pedido
      const pedido = await this.authService.getPedidoAsignadoAlCliente();
      if (pedido) {
        this.pedido = pedido;
      }

      this.isLoading = false;
    }, 1000);
  }


  CerrarCesion() {
    this.authService.logout();
    this.navTo('/login')
  }

  navTo(path: string) {
    this.isLoading = false;
    this.router.navigate([path]);
  }
}