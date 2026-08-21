import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ScanResult {
  hasContent: boolean;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class QRCodeScannerService {
  private qrDataSubject = new BehaviorSubject<string>('');
  public qrData$ = this.qrDataSubject.asObservable();

  constructor() { }

  setQrData(data: string) {
    this.qrDataSubject.next(data);
    localStorage.setItem('qrScannedData', data);
  }

  getQrData(): string {
    return this.qrDataSubject.value;
  }

  getLastQrData(): string {
    // Obtener el último dato escaneado desde localStorage
    return localStorage.getItem('qrScannedData') || '';
  }

  clearQrData() {
    this.qrDataSubject.next('');
    localStorage.removeItem('qrScannedData');
  }
}