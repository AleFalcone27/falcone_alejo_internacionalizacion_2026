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
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

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
    FormsModule,
    TranslatePipe
  ]
})
export class PedidosPendientesMozoPage implements OnInit {
  pedidosPendientes: PedidoConProductos[] = [];
  isLoading = false;
  EstadoPedido = EstadoPedido; // 👈 Importante para usar en el HTML

  pedidoMetrics: {
    [pedidoId: number]: { tiempoMaximo: number; cantidadTotal: number } | undefined;
  } = {};

  constructor(private authService: AuthService, private translate: TranslateService) { }

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
    AppComponent.instance.toast.show(this.translate.instant('PEDIDOS_PENDIENTES_MOZO.ORDER_TAKEN'));
  }

  async rechazarPedido(pedido: Pedido) {
    await this.authService.rechazarPedidoMozo(pedido);
    await this.init();
    AppComponent.instance.toast.show(this.translate.instant('PEDIDOS_PENDIENTES_MOZO.ORDER_REJECTED'));
  }

  async  liberarMesa(pedido:Pedido) {
        await this.authService.liberarMesa(pedido);
    await this.init();
    AppComponent.instance.toast.show(this.translate.instant('PEDIDOS_PENDIENTES_MOZO.TABLE_RELEASED'));

  }
  getNombreEstadoProducto(estado: EstadoProducto | undefined): string {
    switch (estado) {
      case EstadoProducto.PedidoPendienteDeAprobacion:
        return this.translate.instant('PEDIDOS_PENDIENTES_MOZO.PRODUCT_STATUS_PENDING_APPROVAL');
      case EstadoProducto.ComandaRecibida:
        return this.translate.instant('PEDIDOS_PENDIENTES_MOZO.PRODUCT_STATUS_ORDER_RECEIVED');
      case EstadoProducto.EnProceso:
        return this.translate.instant('PEDIDOS_PENDIENTES_MOZO.PRODUCT_STATUS_IN_PROGRESS');
      case EstadoProducto.Listo:
        return this.translate.instant('PEDIDOS_PENDIENTES_MOZO.PRODUCT_STATUS_READY');
      default:
        return this.translate.instant('PEDIDOS_PENDIENTES_MOZO.PRODUCT_STATUS_UNKNOWN');
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
