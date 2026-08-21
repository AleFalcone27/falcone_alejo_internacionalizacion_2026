import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerEncuestaClientePage } from './ver-encuesta-cliente.page';

describe('VerEncuestaClientePage', () => {
  let component: VerEncuestaClientePage;
  let fixture: ComponentFixture<VerEncuestaClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerEncuestaClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
