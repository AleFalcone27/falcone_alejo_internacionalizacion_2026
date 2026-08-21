import { Component, OnInit } from '@angular/core';
import { IonHeader, IonButton, IonContent, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JuegosService } from 'src/app/services/juegos/juegos.service';

@Component({
  selector: 'app-ahorcado',
  templateUrl: './ahorcado.page.html',
  styleUrls: ['./ahorcado.page.scss'],
  imports: [IonContent, CommonModule, FormsModule, IonButton]
})
export class AhorcadoPage implements OnInit {
  palabra: string = '';
  palabraMostrada: string[] = [];
  abecedario: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  letrasUsadas: string[] = [];
  intentosMaximos: number = 6;
  intentosRestantes: number = 6;
  juegoTerminado: boolean = false;
  gano: boolean = false;
  ganoEnPrimerIntento: boolean = false; // ⬅️ nueva variable

  listaPalabras: string[] = ['NARANJA', 'MOZO', 'BEBIDA', 'CUENTA', 'MAITRE'];

  constructor(private juegosService: JuegosService) {

  }

  ngOnInit() {
    this.reiniciarJuego();
  }

  reiniciarJuego() {
    this.palabra = this.listaPalabras[Math.floor(Math.random() * this.listaPalabras.length)];
    this.palabraMostrada = Array(this.palabra.length).fill('_');
    this.letrasUsadas = [];
    this.intentosRestantes = this.intentosMaximos;
    this.juegoTerminado = false;
    this.gano = false;
  }

  adivinar(letra: string) {
    if (this.juegoTerminado || this.letrasUsadas.includes(letra)) return;

    this.letrasUsadas.push(letra);

    if (this.palabra.includes(letra)) {
      this.palabra.split('').forEach((l, i) => {
        if (l === letra) {
          this.palabraMostrada[i] = letra;
        }
      });
    } else {
      this.intentosRestantes--;
    }

    if (!this.palabraMostrada.includes('_')) {
      this.juegoTerminado = true;
      this.gano = true;
      if (!this.juegosService.getResultadoAhorcado()) {
        this.juegosService.guardarResultadoAhorcado(true);
      }
    }

    if (this.intentosRestantes === 0) {
      this.juegoTerminado = true;
      if (!this.juegosService.getResultadoAhorcado()) {
        this.juegosService.guardarResultadoAhorcado(false);
      }
    }
  }
}
