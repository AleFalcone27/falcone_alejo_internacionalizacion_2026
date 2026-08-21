import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Encuesta } from 'src/app/models';
import { IonHeader, IonContent, IonList, IonItem, IonLabel, IonCard, IonCardContent, IonSpinner, IonTitle, IonToolbar, IonCardHeader, IonCardTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-ver-encuesta-cliente',
  templateUrl: './ver-encuesta-cliente.page.html',
  styleUrls: ['./ver-encuesta-cliente.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonCardHeader, IonSpinner, IonCardContent, IonCard,  CommonModule, FormsModule]
})
export class VerEncuestaClientePage implements OnInit {
  encuestas: Encuesta[] = [];
  isLoading = true;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    try {
      this.encuestas = await this.authService.getTodasLasEncuestas();
    } catch (error) {
      console.error('Error al cargar encuestas:', error);
    } finally {
      this.isLoading = false;
    }
  }
}