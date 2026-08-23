// encuesta-cliente.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import {
  IonItem,
  IonLabel,
  IonButton,
  IonCardContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonSegmentButton,
  IonSegment,       
  IonRange,          
  IonTextarea,      
  IonToggle          
} from '@ionic/angular/standalone';
import { idCard } from 'ionicons/icons';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-encuesta-cliente',
  templateUrl: './encuesta-cliente.page.html',
  styleUrls: ['./encuesta-cliente.page.scss'],
  standalone: true,
  imports: [
    IonSegmentButton,
    IonCard,
    IonCardContent,
    IonButton,
    IonLabel,
    IonItem,
    CommonModule,
    FormsModule,
    IonSegment,
    IonRange,
    IonTextarea,
    IonToggle,
    TranslatePipe
]})
export class EncuestaClientePage {
  isLoading = false;

  calificacionGeneral: number = 0;
  calificacionComida: number = 0;   
  calificacionAtencion: number = 0; 
  comentarios: string = '';
  recomendado: boolean = false;

  constructor(private router:Router, private authService:AuthService) { }

  enviarEncuesta() {

    if (!this.calificacionGeneral) {
      console.warn('Por favor selecciona una calificación general');
      return;
    }

    const encuestaData = {
      calificacionGeneral: Number(this.calificacionGeneral),
      calificacionComida: this.calificacionComida,
      calificacionAtencion: this.calificacionAtencion,
      comentarios: this.comentarios.trim(), 
      recomendado: this.recomendado,
    };

    console.log('Datos de la encuesta:', encuestaData);

    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.resetFormulario();
      this.authService.crearEncuesta(encuestaData)
      //this.navTo("/estado-pedido-cliente")
    }, 1000);
  }


  resetFormulario() {
    this.calificacionGeneral = 0;
    this.calificacionComida = 0;
    this.calificacionAtencion = 0;
    this.comentarios = '';
    this.recomendado = false;
  }


  validarDatos(): boolean {
    if (!this.calificacionGeneral || this.calificacionGeneral < 1 || this.calificacionGeneral > 5) {
      return false;
    }
    if (this.calificacionComida < 1 || this.calificacionComida > 10) {
      return false;
    }
    if (this.calificacionAtencion < 1 || this.calificacionAtencion > 5) {
      return false;
    }
    return true;
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }
}
