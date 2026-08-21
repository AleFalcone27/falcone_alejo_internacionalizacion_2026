import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JuegosService {

  constructor() { }

  ganoAhorcado: boolean = false;
  ganoMayorOMenor: boolean = false;

  guardarResultadoAhorcado(resultado: boolean) {
    this.ganoAhorcado = resultado
  }

  guardarResultadoMayorOMenor(resultado: boolean) {
    this.ganoMayorOMenor = resultado;
  }
  
  getResultadoMayorOMenor(){
    return this.ganoMayorOMenor;
  }

  getResultadoAhorcado(){
    return this.ganoAhorcado;
  }

}
