import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaDeEsperaMaitrePage } from './lista-de-espera-maitre.page';

describe('ListaDeEsperaMaitrePage', () => {
  let component: ListaDeEsperaMaitrePage;
  let fixture: ComponentFixture<ListaDeEsperaMaitrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaDeEsperaMaitrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
