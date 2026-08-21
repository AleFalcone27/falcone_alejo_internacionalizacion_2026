import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosCocineroPage } from './pedidos-cocinero.page';

describe('PedidosCocineroPage', () => {
  let component: PedidosCocineroPage;
  let fixture: ComponentFixture<PedidosCocineroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosCocineroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
