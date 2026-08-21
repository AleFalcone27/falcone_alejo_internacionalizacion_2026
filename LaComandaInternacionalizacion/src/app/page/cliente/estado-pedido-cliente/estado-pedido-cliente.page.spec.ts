import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoPedidoClientePage } from './estado-pedido-cliente.page';

describe('EstadoPedidoClientePage', () => {
  let component: EstadoPedidoClientePage;
  let fixture: ComponentFixture<EstadoPedidoClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoPedidoClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
