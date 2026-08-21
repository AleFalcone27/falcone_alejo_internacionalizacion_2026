import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadosHomePage } from './empleados-home.page';

describe('EmpleadosHomePage', () => {
  let component: EmpleadosHomePage;
  let fixture: ComponentFixture<EmpleadosHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpleadosHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
