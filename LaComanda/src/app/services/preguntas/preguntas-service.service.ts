import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class PreguntaService {
  supabase = createClient(environment.apiUrl, environment.publicAnonKey);

  constructor() { }

  async crearPregunta(pregunta: string, mesa: string): Promise<boolean> {
    const { data: session } = await this.supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      console.error('No se pudo obtener el ID del usuario.');
      return false;
    }

    const { error } = await this.supabase.from('preguntas_mozo').insert([
      {
        id_cliente: userId,
        mesa: mesa,
        pregunta: pregunta,
        fecha_pregunta: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error al crear pregunta del cliente:', error.message);
      return false;
    }

    return true;
  }

  async getPreguntasDelCliente(): Promise<any[]> {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;

    const { data, error } = await this.supabase
      .from('preguntas_mozo')
      .select('*')
      .eq('id_cliente', userId)
      .order('fecha_pregunta', { ascending: false });

    if (error) {
      console.error('Error al obtener preguntas del cliente:', error.message);
      return [];
    }

    return data;
  }

  async getPreguntasSinResponder(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('preguntas_mozo')
      .select('*')
      .is('respuesta', null)
      .order('fecha_pregunta', { ascending: true });

    if (error) {
      console.error('Error al obtener preguntas sin responder:', error.message);
      return [];
    }

    return data;
  }

  async responderPregunta(id: string, respuesta: string, mozoNombre: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('preguntas_mozo')
      .update({
        respuesta,
        respondido_por: mozoNombre,
        fecha_respuesta: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error al responder pregunta:', error.message);
      return false;
    }

    return true;
  }
}