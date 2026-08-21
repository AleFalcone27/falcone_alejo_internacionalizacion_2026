import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSpinner, IonBadge
} from '@ionic/angular/standalone';
import { ItemPedido, Pedido } from 'src/app/models';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AppComponent } from 'src/app/app.component';
import { EstadoPedido, EstadoProducto } from 'src/app/models';
import { settings } from 'ionicons/icons';

type PedidoConProductos = Pedido & { productos: ItemPedido[] };

@Component({
  selector: 'app-pedidos-pendientes-mozo',
  templateUrl: './pedidos-pendientes-mozo.page.html',
  styleUrls: ['./pedidos-pendientes-mozo.page.scss'],
  standalone: true,
  imports: [IonBadge,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonCardHeader,
    IonContent,
    CommonModule,
    FormsModule
  ]
})
export class PedidosPendientesMozoPage implements OnInit {
  pedidosPendientes: PedidoConProductos[] = [];
  isLoading = false;
  EstadoPedido = EstadoPedido; // 👈 Importante para usar en el HTML

  pedidoMetrics: {
    [pedidoId: number]: { tiempoMaximo: number; cantidadTotal: number } | undefined;
  } = {};

  constructor(private authService: AuthService) { }

  async ngOnInit() {
    await this.init();
  }

  async init() {
    this.isLoading = true;
    setTimeout(async () => {
      try {
        const pedidos = await this.authService.getPedidosPendientes();
        const pedidosConProductos: PedidoConProductos[] = [];

        for (const pedido of pedidos) {
          const productos: ItemPedido[] = await this.authService.getProductosDePedido(pedido.id);
          const cantidadTotal = productos.reduce((acc, item) => acc + (item.cantidad ?? 0), 0);
          const tiempoMaximo = productos.reduce(
            (max, item) => Math.max(max, item.producto?.tiempoEstimadoDePreparacion ?? 0),
            0
          );

          // Agregamos los productos al pedido
          pedidosConProductos.push({
            ...pedido,
            productos
          });

          this.pedidoMetrics[pedido.id] = {
            cantidadTotal,
            tiempoMaximo
          };
        }

        this.pedidosPendientes = pedidosConProductos;
      } catch (error) {
        console.error('Error al inicializar:', error);
      }

      this.isLoading = false;
    },1000)
  }


  getCantidadTotal(pedidoId: number): number {
    return this.pedidoMetrics[pedidoId]?.cantidadTotal ?? 0;
  }

  getTiempoMaximo(pedidoId: number): number {
    return this.pedidoMetrics[pedidoId]?.tiempoMaximo ?? 0;
  }

  async aceptarPedido(pedido: Pedido) {
    await this.authService.aceptarPedidoMozo(pedido);
    await this.init();
    AppComponent.instance.toast.show('Pedido tomado');
  }

  async rechazarPedido(pedido: Pedido) {
    await this.authService.rechazarPedidoMozo(pedido);
    await this.init();
    AppComponent.instance.toast.show('Pedido rechazado');
  }

  async  liberarMesa(pedido:Pedido) {
        await this.authService.liberarMesa(pedido);
    await this.init();
    AppComponent.instance.toast.show('Pedido liberado');
    
  }
  getNombreEstadoProducto(estado: EstadoProducto | undefined): string {
    switch (estado) {
      case EstadoProducto.PedidoPendienteDeAprobacion:
        return 'Pendiente de aprobación';
      case EstadoProducto.ComandaRecibida:
        return 'Comanda recibida';
      case EstadoProducto.EnProceso:
        return 'En proceso';
      case EstadoProducto.Listo:
        return 'Listo';
      default:
        return 'Desconocido';
    }
  }

  isPedidoListo(pedido: PedidoConProductos): boolean {
    return pedido.productos.every(producto => producto.estado === EstadoProducto.Listo);
  }

  async entregarPedido(pedidoConProductos: PedidoConProductos) {
    this.authService.entregarPedidoMozo({ id: this.pedidosPendientes[0].id })
    await this.init();
  }

}
