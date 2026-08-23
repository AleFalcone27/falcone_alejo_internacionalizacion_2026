import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ClienteMesa, Mesa } from 'src/app/models';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Cliente } from 'src/app/models';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-asignar-mesa-maitre',
  templateUrl: './asignar-mesa-maitre.page.html',
  styleUrls: ['./asignar-mesa-maitre.page.scss'],
  standalone: true,
  imports: [IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, CommonModule, FormsModule, TranslatePipe]
})
export class AsignarMesaMaitrePage implements OnInit {

  isLoading = false;
  cliente: Cliente | null = null;
  mesas: Mesa[] | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) { }

  async ngOnInit() {
    this.init();
  }

  async init() {
    this.isLoading = true;

    setTimeout(async () => {
      const id: string | null = this.route.snapshot.paramMap.get('id');
      console.log('ID recibido:', id);
      const cliente = await this.authService.getClienteById(id ?? undefined);
      if (cliente) {
        this.cliente = cliente;
      } else {
        console.error('Cliente no encontrado');

      }
      this.mesas = await this.authService.getMesas();
      this.isLoading = false;
    }, 1000)
  }


  async asignarClienteMesa(cliente: Cliente, mesa: Mesa) {
    this.isLoading = true;
    setTimeout(async () => {
      this.authService.asignarClienteAMesa(cliente, mesa);
      this.mesas = await this.authService.getMesas();
      console.log(this.mesas);
      this.init();
      this.isLoading = false;
    }, 1000)
  }


  navTo(path: string) {
    this.router.navigate([path]);
  }
}
