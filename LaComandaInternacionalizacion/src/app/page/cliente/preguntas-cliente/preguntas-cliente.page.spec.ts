import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreguntasClientePage } from './preguntas-cliente.page';

describe('PreguntasClientePage', () => {
  let component: PreguntasClientePage;
  let fixture: ComponentFixture<PreguntasClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreguntasClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
