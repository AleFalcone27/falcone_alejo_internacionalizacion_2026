import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientesSupervisorPage } from './clientes-supervisor.page';

describe('ClientesSupervisorPage', () => {
  let component: ClientesSupervisorPage;
  let fixture: ComponentFixture<ClientesSupervisorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesSupervisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
