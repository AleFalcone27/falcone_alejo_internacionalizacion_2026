import { TestBed } from '@angular/core/testing';

import { QRCodeScannerService } from './q-rcode-scanner.service';

describe('QRCodeScannerService', () => {
  let service: QRCodeScannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QRCodeScannerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
