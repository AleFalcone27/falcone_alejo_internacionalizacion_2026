import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonButton } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JuegosService } from 'src/app/services/juegos/juegos.service'; // 👈 Asegurate de tener la ruta correcta
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-mayor-menor',
  templateUrl: './mayor-menor.page.html',
  styleUrls: ['./mayor-menor.page.scss'],
  imports: [IonButton, IonContent, FormsModule, CommonModule, TranslatePipe]
})
export class MayorMenorPage {
  cartaActual = 0;
  cartaSiguiente = 0;
  vidas = 3;
  aciertos = 0;
  mostrarModal = false;
  gano = false;
  aciertosParaGanar = 5;

  constructor(private juegosService: JuegosService) {} // 👈 Inyectamos el servicio

  ngOnInit() {
    this.generarCarta();
  }

  generarCarta() {
    this.cartaActual = Math.floor(Math.random() * 13) + 1;
    this.cartaSiguiente = Math.floor(Math.random() * 13) + 1;
  }

  elegir(opcion: 'mayor' | 'menor') {
    const esMayor = this.cartaSiguiente > this.cartaActual;
    const acierto = (opcion === 'mayor' && esMayor) || (opcion === 'menor' && !esMayor);

    if (acierto) {
      this.aciertos++;
      // ✅ Verificamos si ganó
      if (this.aciertos >= this.aciertosParaGanar) {
        this.gano = true;
        this.mostrarModal = true;
        if (!this.juegosService.getResultadoMayorOMenor()) {
          this.juegosService.guardarResultadoMayorOMenor(true); // 👈 Guardar solo la primera vez
        }
        return;
      }
    } else {
      this.vidas--;
    }

    // ❌ Si pierde
    if (this.vidas <= 0) {
      this.gano = false;
      this.mostrarModal = true;
    } else {
      this.cartaActual = this.cartaSiguiente;
      this.cartaSiguiente = Math.floor(Math.random() * 13) + 1;
    }
  }

  reiniciarJuego() {
    this.vidas = 3;
    this.aciertos = 0;
    this.mostrarModal = false;
    this.generarCarta();
  }
}
