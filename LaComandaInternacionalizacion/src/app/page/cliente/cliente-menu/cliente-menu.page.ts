import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Producto, Item, ItemPedido } from 'src/app/models';
import { UiService } from 'src/app/services/ui/ui.service';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonSearchbar } from "@ionic/angular/standalone";
import { AppComponent } from 'src/app/app.component';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-cliente-menu',
  templateUrl: './cliente-menu.page.html',
  styleUrls: ['./cliente-menu.page.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonSearchbar, FormsModule, TranslatePipe]
})
export class ClienteMenuPage implements OnInit {

  verOrdenOverlay: boolean = false;
  verFotosOverlay: boolean = false;
  fotosActuales: string[] = [];
  fotoIndex: number = 0;
  productos: Producto[] = [];
  order: Item = {};
  isLoading: boolean = false;
  mostrarFotosId: string | null = null;
  currentSlideIndex: { [key: string]: number } = {};
  tiempoEstimadoEnMinutos: number = 0
  searchTerm: string = '';
  productosFiltrados: Producto[] = [];

  constructor(private authService: AuthService, private uiService: UiService, private router: Router, private translate: TranslateService) { }

  async ngOnInit() {
    this.isLoading = true;
    this.productos = await this.authService.getProductos();
    this.productosFiltrados = this.productos; 
    this.isLoading = false;
  }

  async verFotos(producto: Producto) {
    this.isLoading = true;

    setTimeout(async () => {
      document.body.classList.add('overlay-activo');
      this.fotosActuales = [producto.foto1, producto.foto2, producto.foto3].filter(Boolean);
      this.fotoIndex = 0;
      this.verFotosOverlay = true;

      this.isLoading = false;
    }, 1000);
  }

  filtrarProductos() {
    this.isLoading = true;
    setTimeout(() => {
      const term = this.searchTerm.toLowerCase();
      this.productosFiltrados = this.productos.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
      );
      this.isLoading = false;
    }, 300); // simula delay
  }


  cerrarFotosOverlay() {
    this.verFotosOverlay = false;
    document.body.classList.remove('overlay-activo');
  }

  abrirOverlayOrden() {
    this.isLoading = true;
    setTimeout(async () => {
      this.verOrdenOverlay = true;
      this.calcularTiempoEstimado();
      document.body.classList.add('overlay-activo');

      this.isLoading = false;
    }, 1000);
  }

  cerrarOverlayOrden() {
    this.verOrdenOverlay = false;
    document.body.classList.remove('overlay-activo');
  }

  get productosSeleccionados() {
    return Object.entries(this.order)
      .map(([id, cantidad]) => {
        const producto = this.productos.find(p => String(p.id) === id);
        return producto ? { producto, cantidad } : null;
      })
      .filter((entry): entry is { producto: Producto; cantidad: number } => entry !== null);
  }

  calcularSubtotal(entry: { producto?: Producto, cantidad: number }): number {
    return entry.producto?.precio ? entry.producto.precio * entry.cantidad : 0;
  }


  cambiarFoto(delta: number) {
    const nueva = this.fotoIndex + delta;
    if (nueva >= 0 && nueva < this.fotosActuales.length) {
      this.fotoIndex = nueva;
    }
  }

  public agregarProducto(producto: Producto) {
    const id = String(producto.id);

    if (this.order[id]) {
      this.order[id] += 1;
    } else {
      this.order[id] = 1;
    }
    AppComponent.instance.toast.show(this.translate.instant('CLIENTE_MENU.PRODUCT_ADDED'), 1000);
  }

  get totalOrden(): number {
    return Object.entries(this.order).reduce((sum, [id, cantidad]) => {
      const producto = this.productos.find(p => String(p.id) === id);
      return producto ? sum + producto.precio * cantidad : sum;
    }, 0);
  }

  calcularTiempoEstimado() {
    let seleccionados = this.productosSeleccionados;
    seleccionados.forEach((item) => {
      if (item.producto.tiempoEstimadoDePreparacion > this.tiempoEstimadoEnMinutos) {
        console.log(item.producto.tiempoEstimadoDePreparacion)
        this.tiempoEstimadoEnMinutos = item.producto.tiempoEstimadoDePreparacion;
      }
    })
  }

  get cantidadTotal(): number {
    return Object.values(this.order).reduce((a, b) => a + b, 0);
  }

  public confirmarOrden() {
    this.isLoading = true;
    setTimeout(async () => {
      //this.navTo('home-cliente')
      this.cerrarOverlayOrden();
      this.authService.generarOrden(this.productosSeleccionados);

    }, 1000);
    AppComponent.instance.toast.show(this.translate.instant('CLIENTE_MENU.ORDER_CREATED'));
    this.isLoading = false;
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }


}
