import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrCodeScannerPage } from './qr-code-scanner.page';

describe('QrCodeScannerPage', () => {
  let component: QrCodeScannerPage;
  let fixture: ComponentFixture<QrCodeScannerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCodeScannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
