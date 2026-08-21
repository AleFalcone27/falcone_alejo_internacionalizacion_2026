import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Pedido, ItemPedido, EstadoProducto } from 'src/app/models';
import { AppComponent } from 'src/app/app.component';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedidos-cocinero',
  templateUrl: './pedidos-cocinero.page.html',
  styleUrls: ['./pedidos-cocinero.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PedidosCocineroPage implements OnInit {
  showTiempoModal = false;
  productoSeleccionado: any = null;
  tiempoIngresado: number | null = null;
  productosPendientes: any[] = [];
  isLoading = false;
  EstadoProducto = EstadoProducto; // <- Esto lo usás en el HTML

  constructor(private authService: AuthService, private alertController: AlertController
  ) { }

  async ngOnInit() {
    await this.cargarProductosPendientes();
    console.log('Productos cocina:', this.productosPendientes); // 🔍 VERIFICA ESTO EN CONSOLA

  }

  async cargarProductosPendientes() {
    this.isLoading = true;

    try {
      this.productosPendientes = await this.authService.getProductosPendientesPorArea(1); 
      console.log('Productos cocina:', this.productosPendientes); 

    } catch (error) {
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
      AppComponent.instance.toast.show('Debes ingresar un tiempo válido.', 2000);
      return;
    }

    await this.authService.marcarProductoEnPreparacion(this.productoSeleccionado.id, this.tiempoIngresado);
    AppComponent.instance.toast.show(`Producto tomado. Tiempo estimado: ${this.tiempoIngresado} min.`, 2000);

    this.showTiempoModal = false;
    this.productoSeleccionado = null;
    this.tiempoIngresado = null;

    this.cargarProductosPendientes();
  }


  async marcarComoListo(item: any) {
    await this.authService.marcarProductoListo(item.id);
    AppComponent.instance.toast.show('Producto listo para servir', 2000);
    this.cargarProductosPendientes();
  }

}
