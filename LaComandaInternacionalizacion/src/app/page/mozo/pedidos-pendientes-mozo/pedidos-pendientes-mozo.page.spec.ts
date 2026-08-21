import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosPendientesMozoPage } from './pedidos-pendientes-mozo.page';

describe('PedidosPendientesMozoPage', () => {
  let component: PedidosPendientesMozoPage;
  let fixture: ComponentFixture<PedidosPendientesMozoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosPendientesMozoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
