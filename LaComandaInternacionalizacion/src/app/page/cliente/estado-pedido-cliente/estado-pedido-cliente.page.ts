import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Pedido, Producto, Item } from 'src/app/models';
import { AppComponent } from 'src/app/app.component';
import { JuegosService } from 'src/app/services/juegos/juegos.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-estado-pedido-cliente',
  templateUrl: './estado-pedido-cliente.page.html',
  styleUrls: ['./estado-pedido-cliente.page.scss'],
  standalone: true,
  imports: [IonInput, IonIcon, IonButton, CommonModule, FormsModule, TranslatePipe]
})

export class EstadoPedidoClientePage implements OnInit {

  showCompletarEncuesta!: boolean;
  showEncuesta!: boolean;
  estaEnListaDeEspera!: boolean;
  showMenu!: boolean;
  isLoading = false;
  estadoPedido = "";
  pedido!: Pedido;
  puedeLlenarEncuesta!: boolean;
  puedePedirLaCuenta!: boolean;
  verOrdenOverlay: boolean = false;
  verPropinaOverlay: boolean = false;
  productos: Producto[] = [];
  productosConCantidad: { producto: Producto; cantidad: number }[] = [];
  propinaSeleccionada: number = 0;
  propinaPersonalizada: number | null = null;
  descuento: number = 0;
  mostrarDescuento: boolean = false;


  constructor(private router: Router, private authService: AuthService, private juegosService: JuegosService, private translate: TranslateService) { }

  async ngOnInit() {
    this.isLoading = true;

    setTimeout(async () => {
      this.puedeLlenarEncuesta = await this.authService.puedeEnviarEncuesta();
      this.puedePedirLaCuenta = await this.authService.puedePedirLaCuenta();

      const pedido = await this.authService.getPedidoAsignadoAlCliente();

      if (pedido) {
        this.pedido = pedido;
        this.formatEstadoPedido();

        this.productosConCantidad = await this.authService.getProductosDePedido(pedido.id);
      }
      this.isLoading = false;
    }, 1000);
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }

  formatEstadoPedido() {
    switch (this.pedido?.estado) {
      case 0:
        this.estadoPedido = this.translate.instant('ESTADO_PEDIDO_CLIENTE.STATUS_WAITING_CONFIRMATION');
        break;
      case 1:
        this.estadoPedido = this.translate.instant('ESTADO_PEDIDO_CLIENTE.STATUS_PREPARING');
        break;
      case 2:
        this.estadoPedido = this.translate.instant('ESTADO_PEDIDO_CLIENTE.STATUS_READY');
        break;
      case 3:
        this.estadoPedido = this.translate.instant('ESTADO_PEDIDO_CLIENTE.STATUS_CONFIRM_RECEIPT');
        break;
      case 4:
        this.estadoPedido = this.translate.instant('ESTADO_PEDIDO_CLIENTE.STATUS_ENJOY');
        break;
    }
  }

  calcularSubtotal(entry: { producto: Producto; cantidad: number }): number {
    return entry.producto.precio * entry.cantidad;

  }

  get totalOrden(): number {
    return this.productosConCantidad.reduce((total, entry) => {
      return total + Number(entry.producto.precio) * Number(entry.cantidad);
    }, 0);
  }


  async pedirCuenta() {
    this.verOrdenOverlay = true;
    document.body.classList.add('overlay-activo');
    this.calcularDescuentoJuegos()
  }

  cerrarOverlayOrden() {
    this.verOrdenOverlay = false;
    document.body.classList.remove('overlay-activo');
  }

  async pagarCuenta() {
    try {
      this.isLoading = true;

      this.verOrdenOverlay = false;
      document.body.classList.remove('overlay-activo');

      await new Promise(resolve => setTimeout(resolve, 1000));

      await this.authService.pagarCuentaCliente();
      const pedidoActualizado = await this.authService.getPedidoAsignadoAlCliente();

      if (pedidoActualizado) {
        this.pedido = pedidoActualizado;
        this.formatEstadoPedido();
      }



      AppComponent.instance.toast.show(this.translate.instant('ESTADO_PEDIDO_CLIENTE.BILL_PAID'));

      this.isLoading = false;

      this.navTo("/home-cliente");

      AppComponent.instance.toast.show(this.translate.instant('ESTADO_PEDIDO_CLIENTE.THANK_YOU'));

    } catch (error) {
      console.error('Error al pagar la cuenta:', error);
      this.isLoading = false;
      AppComponent.instance.toast.show(this.translate.instant('ESTADO_PEDIDO_CLIENTE.PAYMENT_ERROR'));
    }
  }

  async abrirPropinaOverlay() {
    this.verPropinaOverlay = true;
    document.body.classList.add('overlay-activo');
  }

  async cerrarPropinaOverlay() {
    this.verPropinaOverlay = false;
    document.body.classList.remove('overlay-activo');
  }

  seleccionarPropina(porcentaje: number): void {
    this.propinaSeleccionada = Math.round(this.totalOrden * (porcentaje / 100));
    this.propinaPersonalizada = null; // limpia input si elige botón
  }

  actualizarPropinaPersonalizada(): void {
    console.log("aa")
    const valor = Number(this.propinaPersonalizada);
    this.propinaSeleccionada = !isNaN(valor) && valor >= 0 ? valor : 0;
  }

  confirmarPropina(): void {
    console.log('Propina final:', this.propinaSeleccionada);
    this.cerrarPropinaOverlay();
    AppComponent.instance.toast.show(this.translate.instant('ESTADO_PEDIDO_CLIENTE.TIP_ADDED'));
  }

  async confirmarRecepcion() {
    this.isLoading = true;
    try {
      await this.authService.confirmarRecepcionCliente();
      const pedidoActualizado = await this.authService.getPedidoAsignadoAlCliente();
      if (pedidoActualizado) {
        this.pedido = pedidoActualizado;
        this.formatEstadoPedido();
      }
      this.puedeLlenarEncuesta = await this.authService.puedeEnviarEncuesta();
      this.puedePedirLaCuenta = await this.authService.puedePedirLaCuenta();
    } catch (error) {
      console.error('Error al confirmar recepción:', error);
    } finally {
      this.isLoading = false;
    }
  }

calcularDescuentoJuegos() {
  const ganoAhorcado = this.juegosService.getResultadoAhorcado();
  const ganoMayorOMenor = this.juegosService.getResultadoMayorOMenor();
  const subtotal = this.totalOrden;

  let porcentajeDescuento = 0;

  if (ganoAhorcado && ganoMayorOMenor) {
    porcentajeDescuento = 0.10; // 10% si ganó ambos
  } else if (ganoAhorcado || ganoMayorOMenor) {
    porcentajeDescuento = 0.05; // 5% si ganó uno solo
  }

  this.mostrarDescuento = porcentajeDescuento > 0;
  this.descuento = Math.round(subtotal * porcentajeDescuento);
}
}
