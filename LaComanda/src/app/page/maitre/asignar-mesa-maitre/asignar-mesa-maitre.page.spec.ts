import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignarMesaMaitrePage } from './asignar-mesa-maitre.page';

describe('AsignarMesaMaitrePage', () => {
  let component: AsignarMesaMaitrePage;
  let fixture: ComponentFixture<AsignarMesaMaitrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarMesaMaitrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
