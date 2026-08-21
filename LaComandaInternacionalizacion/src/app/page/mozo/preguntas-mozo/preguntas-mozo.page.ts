import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreguntaService } from 'src/app/services/preguntas/preguntas-service.service';
import { IonItem, IonButton, IonCard, IonCardHeader, IonCardTitle } from "@ionic/angular/standalone";
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-preguntas-mozo',
  templateUrl: './preguntas-mozo.page.html',
  styleUrls: ['./preguntas-mozo.page.scss'],
  imports: [IonCardTitle, IonCardHeader, IonCard, IonButton, IonItem, CommonModule, FormsModule]

})
export class PreguntasMozoPage implements OnInit {
  preguntas: any[] = [];
  mozoNombre: string = 'Juan Pérez';
  isLoading = false;

  constructor(private preguntaService: PreguntaService) { }

  async ngOnInit() {
    setTimeout(async () => {
      this.isLoading = true;
      this.preguntas = await this.preguntaService.getPreguntasSinResponder();
      this.preguntas.forEach(p => p.respuestaTemp = '');
      this.isLoading = false;
    }, 1000)

  }

  async responder(id: string) {
    const pregunta = this.preguntas.find(p => p.id === id);
    if (!pregunta || !pregunta.respuestaTemp?.trim()) return;

    this.isLoading = true;
    setTimeout(async () => {
      const success = await this.preguntaService.responderPregunta(id, pregunta.respuestaTemp, this.mozoNombre);
      if (success) {
        this.preguntas = this.preguntas.filter(p => p.id !== id);
        this.preguntas = await this.preguntaService.getPreguntasSinResponder();
        this.preguntas.forEach(p => p.respuestaTemp = '');
        AppComponent.instance.toast.show("Respuesta enviada")
      }else{
        AppComponent.instance.toast.show("Error al enviar la respuesta")
      }
      this.isLoading = false;
    }, 1000)
  }
}