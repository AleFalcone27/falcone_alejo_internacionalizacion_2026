import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Pedido, ItemPedido, EstadoProducto } from 'src/app/models';
import { AppComponent } from 'src/app/app.component';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pedidos-bar',
  templateUrl: './pedidos-bar.page.html',
  styleUrls: ['./pedidos-bar.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule,FormsModule, TranslatePipe]
})
export class PedidosBarPage implements OnInit {
showTiempoModal = false;
productoSeleccionado: any = null;
tiempoIngresado: number | null = null;
  productosPendientes: any[] = [];
  isLoading = false;
  EstadoProducto = EstadoProducto; // <- Esto lo usás en el HTML

  constructor(private authService: AuthService,  private alertController: AlertController,
    private translate: TranslateService
) {}

  async ngOnInit() {
    await this.cargarProductosPendientes();
              console.log('Productos bar:', this.productosPendientes); // 🔍 VERIFICA ESTO EN CONSOLA

  }

  async cargarProductosPendientes() {
    this.isLoading = true;

    try {
      this.productosPendientes = await this.authService.getProductosPendientesPorArea(2); // 2 = bar
          console.log('Productos bar:', this.productosPendientes); // 🔍 VERIFICA ESTO EN CONSOLA

    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      this.isLoading = false;
    }
  }

tomarProducto(item: any) {
  this.productoSeleccionado = item;
  this.tiempoIngresado = null;
  this.showTiempoModal = true;
}

cancelarTiempo() {
  this.showTiempoModal = false;
  this.productoSeleccionado = null;
  this.tiempoIngresado = null;
}

async confirmarTiempo() {
  if (!this.tiempoIngresado || this.tiempoIngresado <= 0) {
    AppComponent.instance.toast.show(this.translate.instant('PEDIDOS_BAR.INVALID_TIME'), 2000);
    return;
  }

  await this.authService.marcarProductoEnPreparacion(this.productoSeleccionado.id, this.tiempoIngresado);
  AppComponent.instance.toast.show(this.translate.instant('PEDIDOS_BAR.PRODUCT_TAKEN', { value: this.tiempoIngresado }), 2000);

  this.showTiempoModal = false;
  this.productoSeleccionado = null;
  this.tiempoIngresado = null;

  this.cargarProductosPendientes();
}

  async marcarComoListo(item: any) {
    await this.authService.marcarProductoListo(item.id);
    AppComponent.instance.toast.show(this.translate.instant('PEDIDOS_BAR.PRODUCT_READY'), 2000);
    this.cargarProductosPendientes();
  }

}


