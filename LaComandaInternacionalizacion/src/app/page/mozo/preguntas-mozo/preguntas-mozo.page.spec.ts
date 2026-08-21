import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreguntasMozoPage } from './preguntas-mozo.page';

describe('PreguntasMozoPage', () => {
  let component: PreguntasMozoPage;
  let fixture: ComponentFixture<PreguntasMozoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreguntasMozoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
