import { Component, OnInit } from '@angular/core';
import { PreguntaService } from 'src/app/services/preguntas/preguntas-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonItem, IonContent, IonList, IonLabel, IonInput, IonIcon, IonFooter, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle } from "@ionic/angular/standalone";
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { VolverComponent } from "../../../components/volver/volver.component";
import { Mesa } from 'src/app/models';

@Component({
  selector: 'app-preguntas-cliente',
  standalone: true,
  templateUrl: './preguntas-cliente.page.html',
  styleUrls: ['./preguntas-cliente.page.scss'],
  imports: [IonCardTitle, IonCardHeader, IonCard, IonItem, IonInput, IonButton, CommonModule, FormsModule]
})
export class PreguntasClientePage implements OnInit {
  preguntas: any[] = [];
  nuevaPregunta: string = '';
  isLoading = false;

  constructor(
    private preguntaService: PreguntaService,
    private auth: AuthService,
    private router: Router
  ) { }

  async ngOnInit() {

    setTimeout(async () => {
      this.isLoading = true;
      this.preguntas = await this.preguntaService.getPreguntasDelCliente();
      this.isLoading = false;
    }, 1000)
  }

  async enviarPregunta() {
    if (!this.nuevaPregunta.trim()) return;
    setTimeout(async () => {
      this.isLoading = true;
      const success = await this.preguntaService.crearPregunta(this.nuevaPregunta, await this.auth.getMesaAsginada());
      if (success) {
        this.nuevaPregunta = '';
        this.preguntas = await this.preguntaService.getPreguntasDelCliente();
      }
      this.isLoading = false;
    }, 1000)


  }

  CerrarCesion() {
    this.auth.logout();
    this.navTo('/login')
  }

  navTo(path: string) {
    this.router.navigate([path]);
  }
}