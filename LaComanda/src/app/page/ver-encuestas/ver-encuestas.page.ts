import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent } from '@ionic/angular/standalone';
import { NgChartsModule } from 'ng2-charts';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-encuestas',
  templateUrl: './ver-encuestas.page.html',
  styleUrls: ['./ver-encuestas.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonIcon, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCard, IonList, IonButton, IonContent, CommonModule, FormsModule, NgChartsModule]
})
export class VerEncuestasPage implements OnInit {
  constructor(private authService: AuthService) {}

  calificaciones: any[] = [];
  encuestasConPromedio: any[] = [];

  verComentarios = false;

  barChartData!: ChartConfiguration<'bar'>['data'];
  barChartOptions!: ChartConfiguration<'bar'>['options'];

  pieChartData!: ChartConfiguration<'pie'>['data'];

  lineChartData!: ChartConfiguration<'line'>['data'];
  lineChartOptions!: ChartConfiguration<'line'>['options'];

  promedioGeneral = 0;
  promedioComida = 0;
  promedioAtencion = 0;
  recomendados = 0;
  noRecomendados = 0;

  async ngOnInit() {
    try {
      this.calificaciones = await this.authService.obtenerTodasLasEncuestas();
      this.calcularEstadisticas();
      this.prepararGraficos();
    } catch (error) {
      console.error('No se pudieron cargar las encuestas.');
    }
  }

  calcularEstadisticas() {
    const total = this.calificaciones.length;
    if (total === 0) return;

    let sumaGeneral = 0, sumaComida = 0, sumaAtencion = 0, reco = 0, noReco = 0;

    this.encuestasConPromedio = this.calificaciones.map((c) => {
      const promedio = (
        (Number(c.calificacionGeneral) +
          Number(c.calificacionComida) +
          Number(c.calificacionAtencion)) / 3
      ).toFixed(2);

      if (c.recomendado) reco++;
      else noReco++;

      sumaGeneral += Number(c.calificacionGeneral);
      sumaComida += Number(c.calificacionComida);
      sumaAtencion += Number(c.calificacionAtencion);

      return {
        ...c,
        promedio,
        clienteNombre: c.cliente_id, // podés reemplazar esto si tenés nombre
      };
    });

    this.promedioGeneral = +(sumaGeneral / total).toFixed(2);
    this.promedioComida = +(sumaComida / total).toFixed(2);
    this.promedioAtencion = +(sumaAtencion / total).toFixed(2);
    this.recomendados = reco;
    this.noRecomendados = noReco;
  }

  prepararGraficos() {
    this.barChartData = {
      labels: ['General', 'Comida', 'Atención'],
      datasets: [
        {
          label: 'Promedio',
          data: [this.promedioGeneral, this.promedioComida, this.promedioAtencion],
          backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384']
        }
      ]
    };

this.barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false // 👈 Esto oculta la leyenda ("Promedio")
    }
  },
  scales: {
    y: {
      min: 0,
      max: 10,
      ticks: {
        stepSize: 1
      }
    }
  }
};

    this.pieChartData = {
      labels: ['Recomiendan', 'No Recomiendan'],
      datasets: [
        {
          data: [this.recomendados, this.noRecomendados],
          backgroundColor: ['#4BC0C0', '#FF6384']
        }
      ]
    };

    this.lineChartData = {
      labels: this.calificaciones.map((_, i) => `#${i + 1}`),
      datasets: [
        {
          label: 'Calificación General',
          data: this.calificaciones.map(c => Number(c.calificacionGeneral)),
          borderColor: '#36A2EB',
          fill: false,
          tension: 0.3
        }
      ]
    };

    this.lineChartOptions = {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 1
          }
        }
      }
    };
  }

  redondear(valor: string | number): number {
    return Math.round(Number(valor));
  }
}
