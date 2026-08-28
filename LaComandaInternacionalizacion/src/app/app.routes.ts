import { Routes } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./page/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'splash',
    loadComponent: () => import('./page/splash/splash.page').then( m => m.SplashPage)
  },
  {
    path: 'alta-cliente',
    loadComponent: () => import('./page/alta-cliente/alta-cliente.page').then( m => m.AltaClientePage)
  },
  {
    path: 'home-supervisor',
    loadComponent: () => import('./page/supervisor/home-supervisor/home-supervisor.page').then( m => m.HomeSupervisorPage)
  },
  {
    path: 'clientes-supervisor',
    loadComponent: () => import('./page/supervisor/clientes-supervisor/clientes-supervisor.page').then( m => m.ClientesSupervisorPage)
  },
  {
    path: 'home-maitre',
    loadComponent: () => import('./page/maitre/home-maitre/home-maitre.page').then( m => m.HomeMaitrePage)
  },
  {
    path: 'lista-de-espera-maitre',
    loadComponent: () => import('./page/maitre/lista-de-espera-maitre/lista-de-espera-maitre.page').then( m => m.ListaDeEsperaMaitrePage)
  },
  {
    path: 'asignar-mesa-maitre/:id',
    loadComponent: () => import('./page/maitre/asignar-mesa-maitre/asignar-mesa-maitre.page').then( m => m.AsignarMesaMaitrePage)
  },
  {
    path: 'home-cliente',
    loadComponent: () => import('./page/cliente/home-cliente/home-cliente.page').then( m => m.HomeClientePage)
  },
  {
    path: 'home-mozo',
    loadComponent: () => import('./page/mozo/home-mozo/home-mozo.page').then( m => m.HomeMozoPage)
  },
  {
    path: 'qr-code-scanner',
    loadComponent: () => import('./page/general/qr-code-scanner/qr-code-scanner.page').then( m => m.QrCodeScannerPage)
  },
  {
    path: 'menu-cliente',
    loadComponent: () => import('./page/cliente/cliente-menu/cliente-menu.page').then( m => m.ClienteMenuPage)
  },
  {
    path: 'preguntas-cliente',
    loadComponent: () => import('./page/cliente/preguntas-cliente/preguntas-cliente.page').then( m => m.PreguntasClientePage)
  },
  {
    path: 'preguntas-mozo',
    loadComponent: () => import('./page/mozo/preguntas-mozo/preguntas-mozo.page').then( m => m.PreguntasMozoPage)
  },
    {
    path: 'cliente-menu',
    loadComponent: () => import('./page/cliente/cliente-menu/cliente-menu.page').then( m => m.ClienteMenuPage)
  },
  {
    path: 'pedidos-pendientes-mozo',
    loadComponent: () => import('./page/mozo/pedidos-pendientes-mozo/pedidos-pendientes-mozo.page').then( m => m.PedidosPendientesMozoPage)
  },
  {
    path: 'estado-pedido-cliente',
    loadComponent: () => import('./page/cliente/estado-pedido-cliente/estado-pedido-cliente.page').then( m => m.EstadoPedidoClientePage)
  },
    {
    path: 'empleados-home',
    loadComponent: () => import('./page/empleados/empleados-home/empleados-home.page').then( m => m.EmpleadosHomePage)
  },
  {
    path: 'pedidos-cocina',
    loadComponent: () => import('./page/empleados/pedidos-cocinero/pedidos-cocinero.page').then( m => m.PedidosCocineroPage)
  },
  {
    path: 'pedidos-bar',
    loadComponent: () => import('./page/empleados/pedidos-bar/pedidos-bar.page').then( m => m.PedidosBarPage)
  },
  {
    path: 'alta-plato',
    loadComponent: () => import('./page/alta-plato/alta-plato.page').then( m => m.AltaPlatoPage)
  },
  {
    path: 'alta-bebida',
    loadComponent: () => import('./page/alta-bebida/alta-bebida.page').then( m => m.AltaBebidaPage)
  },
  {
    path: 'alta-mesa',
    loadComponent: () => import('./page/alta-mesa/alta-mesa.page').then( m => m.AltaMesaPage)
  },
  {
    path: 'reserva-cliente',
    loadComponent: () => import('./page/cliente/reserva-cliente/reserva-cliente.page').then( m => m.ReservaClientePage)
  },
  {
    path: 'reservas-supervisor',
    loadComponent: () => import('./page/supervisor/reservas-supervisor/reservas-supervisor.page').then( m => m.ReservasSupervisorPage)
  },
  {
    path: 'ahorcado',
    loadComponent: () => import('./page/juegos/ahorcado/ahorcado.page').then( m => m.AhorcadoPage)
  },
  {
    path: 'mayor-menor',
    loadComponent: () => import('./page/juegos/mayor-menor/mayor-menor.page').then( m => m.MayorMenorPage)
  },
  {
    path: 'encuesta-cliente',
    loadComponent: () => import('./page/cliente/encuesta-cliente/encuesta-cliente.page').then( m => m.EncuestaClientePage)
  },
  {
    path: 'ver-encuesta-cliente',
    loadComponent: () => import('./page/cliente/ver-encuesta-cliente/ver-encuesta-cliente.page').then( m => m.VerEncuestaClientePage)
  },  {
    path: 'ver-encuestas',
    loadComponent: () => import('./page/ver-encuestas/ver-encuestas.page').then( m => m.VerEncuestasPage)
  },

]
