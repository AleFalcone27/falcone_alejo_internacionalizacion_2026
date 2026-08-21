import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MayorMenorPage } from './mayor-menor.page';

describe('MayorMenorPage', () => {
  let component: MayorMenorPage;
  let fixture: ComponentFixture<MayorMenorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MayorMenorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
