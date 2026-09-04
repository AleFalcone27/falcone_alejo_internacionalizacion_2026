import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Cliente, Mesa, ClienteMesa, Pedido, EstadoMesas, EstadoListaDeEspera, Producto, ItemPedido, EstadoPedido, EstadoProducto, Encuesta, Reserva, EstadoReserva } from 'src/app/models';

export const NATIVE_OAUTH_REDIRECT_URL = 'elbocado://auth-callback';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabase = createClient(environment.apiUrl, environment.publicAnonKey, {
    auth: { flowType: 'pkce' }
  });
  constructor() { }

  async login(email: string, password: string) {
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return { error: authError, user: null };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { error: new Error("No se pudo obtener el ID del usuario."), user: null };
    }

    // Traemos info del cliente
    const { data: usuarioData, error: usuarioError } = await this.supabase
      .from("clientes")
      .select("id, nombre, apellido, email, dni, edad, foto, alta, rol")
      .eq("id", userId)
      .single();

    if (usuarioError) {
      return { error: usuarioError, user: null };
    }

    if (!usuarioData) {
      return { error: { message: "Usuario no encontrado." }, user: null };
    }

    if (usuarioData.alta == 2) {
      return { error: { message: "denied" }, user: null };
    }

    if (usuarioData.alta !== 1) {
      return { error: { message: "alta_false" }, user: null };
    }

    // Devolvemos datos combinados del auth y del cliente
    return {
      error: null,
      user: {
        ...usuarioData,
        id: userId,
        email: authData.user.email
      }
    };
  }


  async loginWithProvider(provider: 'google') {
    if (Capacitor.isNativePlatform()) {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: NATIVE_OAUTH_REDIRECT_URL,
          skipBrowserRedirect: true,
          queryParams: { prompt: 'select_account' }
        }
      });

      if (!error && data?.url) {
        await Browser.open({ url: data.url });
      }

      return { data, error };
    }

    return await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth-callback`,
        queryParams: { prompt: 'select_account' }
      }
    });
  }

  async handleNativeOAuthRedirect(callbackUrl: string) {
    await Browser.close();

    const url = new URL(callbackUrl);
    const errorDescription = url.searchParams.get('error_description') ?? url.searchParams.get('error');
    if (errorDescription) {
      return { data: { user: null, session: null }, error: { message: errorDescription } };
    }

    const code = url.searchParams.get('code');
    if (!code) {
      return { data: { user: null, session: null }, error: { message: 'No se recibió el código de autenticación.' } };
    }

    return await this.supabase.auth.exchangeCodeForSession(code);
  }

  async handleOAuthRedirect() {
    const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return { error: sessionError ?? { message: "No se pudo obtener la sesión." }, user: null };
    }

    const authUser = sessionData.session.user;
    const email = authUser.email;

    if (!email) {
      return { error: { message: "No se pudo obtener el correo del usuario." }, user: null };
    }

    let { data: usuarioData, error: usuarioError } = await this.supabase
      .from("clientes")
      .select("id, nombre, apellido, email, dni, edad, foto, alta, rol")
      .eq("email", email)
      .maybeSingle();

    if (usuarioError) {
      return { error: usuarioError, user: null };
    }

    if (!usuarioData) {
      const nombreCompleto = (authUser.user_metadata?.['full_name'] || authUser.user_metadata?.['name'] || '') as string;
      const [nombre, ...resto] = nombreCompleto.split(' ').filter(Boolean);

      const nuevoCliente = {
        id: authUser.id,
        email,
        nombre: nombre || email,
        apellido: resto.join(' '),
        dni: '',
        edad: 0,
        foto: authUser.user_metadata?.['avatar_url'] || authUser.user_metadata?.['picture'] || '',
        alta: 1,
        rol: 'cliente'
      };

      const { data: creado, error: creacionError } = await this.supabase
        .from("clientes")
        .insert(nuevoCliente)
        .select("id, nombre, apellido, email, dni, edad, foto, alta, rol")
        .single();

      if (creacionError) {
        return { error: creacionError, user: null };
      }

      usuarioData = creado;
    }

    if (usuarioData.alta == 2) {
      return { error: { message: "denied" }, user: null };
    }

    if (usuarioData.alta !== 1) {
      return { error: { message: "alta_false" }, user: null };
    }

    return {
      error: null,
      user: {
        ...usuarioData,
        email
      }
    };
  }

  getRouteForRole(rol: string): string {
    switch (rol) {
      case 'cliente':
      case 'clienteAnonimo':
        return '/home-cliente';
      case 'mozo':
        return '/home-mozo';
      case 'supervisor':
        return '/home-supervisor';
      case 'maitre':
        return '/home-maitre';
      case 'cocinero':
      case 'bartender':
        return '/empleados-home';
      default:
        return '/home-cliente';
    }
  }

  async register(email: string, password: string, username: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });
  }

  async uploadUserImage(file: Blob, userId: string | undefined): Promise<string | null> {
    const filePath = `usuarios/${userId}.jpg`;

    const { error } = await this.supabase.storage
      .from('usuarios')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Error al subir la imagen:', error);
      return null;
    }

    const { data } = this.supabase.storage.from('usuarios').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async getProductos() {
    const { data, error } = await this.supabase
      .from("productos")
      .select("*");

    if (error) {
      console.error("Error al obtener clientes pendientes de alta:", error);
      return [];
    }

    return data as Producto[];
  }

  async crearReserva(datosReserva: {
    cliente_id: string,
    mesa_id: number,
    fecha_hora: string,
    cantidad_personas: number,
    comentario?: string
  }): Promise<Reserva> {
    const { data, error } = await this.supabase
      .from('reservas')
      .insert([{ ...datosReserva, estado: EstadoReserva.Pendiente }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear la reserva:', error.message);
      throw error;
    }

    return data as Reserva;
  }

  async getReservasCliente(clienteId: string): Promise<Reserva[]> {
    const { data, error } = await this.supabase
      .from('reservas')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha_hora', { ascending: true });

    if (error) {
      console.error('Error al obtener reservas del cliente:', error.message);
      return [];
    }

    return data as Reserva[];
  }

  async existeReservaParaMesaYFecha(mesaId: number, fechaHoraISO: string): Promise<boolean> {
    const fecha = new Date(fechaHoraISO);
    const inicioDia = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
    const inicioDiaSiguiente = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from('reservas')
      .select('id')
      .eq('mesa_id', mesaId)
      .neq('estado', EstadoReserva.Cancelada)
      .gte('fecha_hora', inicioDia.toISOString())
      .lt('fecha_hora', inicioDiaSiguiente.toISOString())
      .limit(1);

    if (error) {
      console.error('Error al verificar disponibilidad de la mesa:', error.message);
      return false;
    }

    return (data?.length ?? 0) > 0;
  }

  async getReservasPendientes(): Promise<Reserva[]> {
    const { data, error } = await this.supabase
      .from('reservas')
      .select('*, cliente:cliente_id(nombre, apellido, email), mesa:mesa_id(numero)')
      .eq('estado', EstadoReserva.Pendiente)
      .order('fecha_hora', { ascending: true });

    if (error) {
      console.error('Error al obtener reservas pendientes:', error.message);
      return [];
    }

    return data as unknown as Reserva[];
  }

  async confirmarReserva(reservaId: number): Promise<void> {
    const { error } = await this.supabase
      .from('reservas')
      .update({ estado: EstadoReserva.Confirmada })
      .eq('id', reservaId);

    if (error) {
      console.error('Error al confirmar la reserva:', error.message);
      throw error;
    }
  }

  async rechazarReserva(reservaId: number): Promise<void> {
    const { error } = await this.supabase
      .from('reservas')
      .update({ estado: EstadoReserva.Cancelada })
      .eq('id', reservaId);

    if (error) {
      console.error('Error al rechazar la reserva:', error.message);
      throw error;
    }
  }

  async getMesaIdsReservadosParaFecha(fechaHoraISO: string): Promise<number[]> {
    const fecha = new Date(fechaHoraISO);
    const inicioDia = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
    const inicioDiaSiguiente = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from('reservas')
      .select('mesa_id')
      .neq('estado', EstadoReserva.Cancelada)
      .gte('fecha_hora', inicioDia.toISOString())
      .lt('fecha_hora', inicioDiaSiguiente.toISOString());

    if (error) {
      console.error('Error al obtener mesas reservadas para la fecha:', error.message);
      return [];
    }

    return (data ?? []).map((r: { mesa_id: number }) => r.mesa_id);
  }

  async uploadProductoImage(file: Blob, productoId: string | number, index: 1 | 2 | 3): Promise<string | null> {
    const filePath = `productos/${productoId}-foto${index}.jpg`;

    const { error } = await this.supabase.storage
      .from('productos')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Error al subir la foto del producto:', error);
      return null;
    }

    const { data } = this.supabase.storage.from('productos').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async uploadMesaImage(file: Blob, mesaId: string | number): Promise<string | null> {
    const filePath = `mesas/${mesaId}.jpg`;

    const { error } = await this.supabase.storage
      .from('mesas')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Error al subir la foto de la mesa:', error);
      return null;
    }

    const { data } = this.supabase.storage.from('mesas').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async crearProductoConFotos(
    datosProducto: {
      nombre: string,
      descripcion: string,
      precio: number,
      tiempoEstimadoDePreparacion: number,
      areaDePreparacion: number
    },
    fotos: Blob[]
  ): Promise<Producto> {
    const { data: productoCreado, error: insertError } = await this.supabase
      .from('productos')
      .insert([{ ...datosProducto, foto1: '', foto2: '', foto3: '' }])
      .select()
      .single();

    if (insertError) {
      console.error('Error al crear producto:', insertError.message);
      throw insertError;
    }

    const fotoUrls: Partial<Record<'foto1' | 'foto2' | 'foto3', string>> = {};
    const campos: Array<'foto1' | 'foto2' | 'foto3'> = ['foto1', 'foto2', 'foto3'];

    for (let i = 0; i < fotos.length; i++) {
      const url = await this.uploadProductoImage(fotos[i], productoCreado.id, (i + 1) as 1 | 2 | 3);
      if (url) {
        fotoUrls[campos[i]] = url;
      }
    }

    const { data: productoActualizado, error: updateError } = await this.supabase
      .from('productos')
      .update(fotoUrls)
      .eq('id', productoCreado.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar fotos del producto:', updateError.message);
      throw updateError;
    }

    return productoActualizado as Producto;
  }

  async crearMesaConFoto(
    datosMesa: {
      numero: number,
      descripcion: string,
      capacidad: number,
      aptaBebes: boolean,
      ubicacion: string,
      estado: number
    },
    foto: Blob
  ): Promise<Mesa> {
    const { data: mesaCreada, error: insertError } = await this.supabase
      .from('mesas')
      .insert([datosMesa])
      .select()
      .single();

    if (insertError) {
      console.error('Error al crear mesa:', insertError.message);
      throw insertError;
    }

    const fotoUrl = await this.uploadMesaImage(foto, mesaCreada.id);

    const { data: mesaActualizada, error: updateError } = await this.supabase
      .from('mesas')
      .update({ foto: fotoUrl ?? undefined })
      .eq('id', mesaCreada.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar foto de la mesa:', updateError.message);
      throw updateError;
    }

    return mesaActualizada as Mesa;
  }


  async createCliente(clienteData: {
    id: string | undefined,
    nombre: string;
    apellido?: string;
    email?: string;
    dni?: string;
    edad?: number;
    foto?: string;
    alta: number;
    rol: string;
  }) {
    const { data, error } = await this.supabase
      .from('clientes')
      .insert([clienteData]);

    if (error) {
      console.error('Error al crear cliente:', error.message);
      throw error;
    }

    return data;
  }
  async getUserRole(): Promise<string | null> {
    const { data: sessionData, error: sessionError } = await this.supabase.auth.getUser();
    if (sessionError || !sessionData.user) {
      console.error('No hay usuario autenticado o error al obtener sesión:', sessionError);
      return null;
    }

    const userId = sessionData.user.id;

    const { data, error } = await this.supabase
      .from('clientes')            // o la tabla donde guardas los usuarios y sus roles
      .select('rol')               // columna que indica el rol: 'cocinero', 'bartender', etc.
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al obtener rol del usuario:', error);
      return null;
    }

    return data?.rol ?? null;
  }

  async getClientesPendientesDeAlta() {
    const { data, error } = await this.supabase
      .from("clientes")
      .select("*")
      .eq("alta", 0);

    if (error) {
      console.error("Error al obtener clientes pendientes de alta:", error);
      return [];
    }

    return data;
  }

  async logout() {
    return await this.supabase.auth.signOut();
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async getSessionUser() {
    const { data } = await this.supabase.auth.getUser();
    console.log('Usuario completo:', data.user);
    return data.user?.user_metadata?.['username'] || null;
  }

  async rechazarCliente(clienteId: string) {
    // 1. Modificar el campo 'alta' a false en la tabla 'clientes'
    const { error: updateError } = await this.supabase
      .from("clientes")
      .update({ alta: 2 })
      .eq("id", clienteId);

    if (updateError) {
      console.error("Error al desactivar cliente:", updateError.message);
      throw updateError;
    }

    return true;
  }

  async aceptarCliente(clienteId: string) {
    const { error: updateError } = await this.supabase
      .from("clientes")
      .update({ alta: 1 })
      .eq("id", clienteId);

    if (updateError) {
      console.error("Error al aceptar cliente:", updateError.message);
      throw updateError;
    }

    return true;
  }

  async getListaDeEspera() {
    // 1. Traer los IDs de clientes asignados a mesas
    const { data: clientesAsignados, error: errorAsignados } = await this.supabase
      .from("mesas_clientes")
      .select("cliente_id");

    if (errorAsignados) {
      console.error("Error al obtener clientes asignados:", errorAsignados);
      return [];
    }

    const idsAsignados = clientesAsignados.map(item => item.cliente_id);

    // 2. Consultar lista de espera y excluir los IDs
    let query = this.supabase
      .from("lista_de_espera")
      .select("*, cliente:cliente_id(*)")
      .eq("estado", 0);

    // Solo aplicamos el filtro si hay IDs a excluir
    if (idsAsignados.length > 0) {
      query = query.not("cliente_id", "in", `(${idsAsignados.join(",")})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error al obtener clientes en lista de espera:", error);
      return [];
    }

    return data;
  }

  async sentarseEnMesa() {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;


    const { data, error } = await this.supabase
      .from("mesas_clientes")
      .update({ estado: EstadoListaDeEspera.Sentado })  // <-- el nuevo estado
      .eq("estado", EstadoListaDeEspera.Asginado)
      .eq("cliente_id", userId);

    await this.supabase
      .from("lista_de_espera")
      .update({ estado: EstadoListaDeEspera.Sentado })  // <-- el nuevo estado
      .eq("estado", EstadoListaDeEspera.Asginado)
      .eq("cliente_id", userId);


    if (error) {
      console.error("Error actualizando estado a Sentado:", error);
      throw error;
    }

    return data;
  }

  async getMesaAsginada() {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;
    console.log(userId)
    let query = this.supabase
      .from("mesas_clientes")
      .select("*")
      .eq("cliente_id", userId)
      .in("estado", [EstadoListaDeEspera.Sentado, EstadoListaDeEspera.Asginado])
      .single();

    const { data, error } = await query;

    if (error) {
      console.error("Error al obtener mesa asignada:", error);
      return null;
    }

    return data?.mesa_id;
  }

  async ingresarEnListaDeEspera() {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;

    const listaDeEspera = {
      cliente_id: userId,
      estado: EstadoListaDeEspera.Esperando
    };

    const { data, error } = await this.supabase
      .from('lista_de_espera')
      .insert([listaDeEspera]);

    if (error) {
      console.error('Error al insertar en lista de espera:', error);
      return { error };
    }

    return { data };
  }

  async estaEnListaDeEspera(): Promise<boolean> {

    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;

    const { data, error } = await this.supabase
      .from("lista_de_espera")
      .select("id")
      .eq("cliente_id", userId)
      .in("estado", [EstadoListaDeEspera.Esperando, EstadoListaDeEspera.Asginado]) // ⬅️ múltiples estados
      .maybeSingle();

    if (error) {
      console.error("Error al verificar si el cliente está en la lista de espera:", error);
      return false;
    }

    return !!data;
  }

  async estaSentadoEnMesa(clienteId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("lista_de_espera")
      .select("id")
      .eq("cliente_id", clienteId)
      .eq("estado", EstadoListaDeEspera.Sentado)
      .maybeSingle();

    if (error) {
      console.error("Error al verificar si el cliente está sentado en mesa:", error);
      return false;
    }

    return !!data;
  }

  async estaAsignadoAUnaMesa(clienteId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("lista_de_espera")
      .select("id")
      .eq("cliente_id", clienteId)
      .eq("estado", EstadoListaDeEspera.Asginado)
      .maybeSingle();

    if (error) {
      console.error("Error al verificar si el cliente está sentado en mesa:", error);
      return false;
    }

    return !!data;
  }


  async getMesas(): Promise<Mesa[] | null> {
    const { data, error } = await this.supabase
      .from('mesas')
      .select("*")

    if (error) {
      console.error("Error al obtener mesas:", error);
      return null;
    }
    return data as Mesa[];
  }

  async getClienteById(id: string | undefined): Promise<Cliente | null> {
    if (!id) return null;
    const { data, error } = await this.supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error al obtener cliente", error);
      return null;
    }
    return data as Cliente;
  }

  async asignarClienteAMesa(cliente: Cliente, mesa: Mesa) {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;

    let clienteMesa: ClienteMesa = {
      cliente_id: cliente.id,
      mesa_id: mesa.id,
      estado: EstadoListaDeEspera.Asginado
    }

    const { data, error } = await this.supabase
      .from('mesas_clientes')
      .insert([clienteMesa]);

    const { error: updateError } = await this.supabase
      .from('mesas')
      .update({ estado: EstadoMesas.Ocupada })
      .eq("id", mesa.id);

    const { error: listaDeEspereError } = await this.supabase
      .from("lista_de_espera")
      .update({ estado: EstadoListaDeEspera.Asginado })  // <-- el nuevo estado
      .eq("cliente_id", cliente.id);

    console.log('Actualizando lista de espera para cliente_id:', cliente.id);

    if (listaDeEspereError) {
      console.error('Error al actualizar el estado de la lista de espera:', updateError);
      return;
    }

    if (updateError) {
      console.error('Error al actualizar el estado de la mesa:', updateError);
      return;
    }

  }

  async crearPreguntaDelCliente(pregunta: string, mesa: string): Promise<boolean> {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;

    const { error } = await this.supabase
      .from('preguntas_mozo')
      .insert([{
        id_cliente: userId,
        mesa,
        pregunta
      }]);

    if (error) {
      console.error('Error al crear pregunta del cliente:', error.message);
      return false;
    }

    return true;
  }

  async getPreguntasYRespuestasDelCliente(): Promise<any[]> {
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



  async generarOrden(pedido: ItemPedido[]) {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    const mesaId = await this.getMesaAsginada();

    // Crear el pedido principal
    const { data: pedidoData, error: pedidoError } = await this.supabase
      .from('pedidos')
      .insert({
        cliente_id: userId,
        estado: EstadoPedido.PendienteDeAprobacion,
        mesa_id: mesaId
      })
      .select();

    if (pedidoError) {
      throw new Error(`Error al crear el pedido: ${pedidoError.message}`);
    }

    const pedido_id = pedidoData[0].id;

    // Preparar productos con cantidad
    const itemsToInsert = pedido.map((item) => ({
      pedido_id,
      producto_id: item.producto.id,
      cantidad: item.cantidad ?? 1,
      estado: EstadoProducto.PedidoPendienteDeAprobacion,
    }));

    const { data: itemsData, error: itemsError } = await this.supabase
      .from('pedidos_productos')
      .insert(itemsToInsert);

    if (itemsError) {
      throw new Error(`Error al insertar productos: ${itemsError.message}`);
    }

    return { order: pedidoData[0], items: itemsData };
  }










  async aceptarPedidoMozo(pedido: { id: number }) {
    const pedidoId = pedido.id;

    if (!pedidoId) {
      throw new Error('Pedido inválido: falta el ID');
    }

    // 1. Actualizar el estado del pedido
    const { error: pedidoError } = await this.supabase
      .from('pedidos')
      .update({ estado: EstadoPedido.ComandaEnviada })
      .eq('id', pedidoId);

    if (pedidoError) {
      console.error('Error actualizando el pedido:', pedidoError);
      throw new Error(`No se pudo actualizar el pedido: ${pedidoError.message}`);
    }

    // 2. Actualizar el estado de los productos del pedido
    const { error: productosError } = await this.supabase
      .from('pedidos_productos')
      .update({ estado: EstadoProducto.ComandaRecibida })
      .eq('pedido_id', pedidoId);

    if (productosError) {
      console.error('Error actualizando productos:', productosError);
      throw new Error(`No se pudo actualizar los productos: ${productosError.message}`);
    }

    console.log(`Pedido ${pedidoId} aceptado por mozo.`);
  }

  async rechazarPedidoMozo(pedido: { id: number }) {
    const pedidoId = pedido.id;

    if (!pedidoId) {
      throw new Error('Pedido inválido: falta el ID');
    }

    // 1. Actualizar el estado del pedido
    const { error: pedidoError } = await this.supabase
      .from('pedidos')
      .update({ estado: EstadoPedido.Terminado })
      .eq('id', pedidoId);

    if (pedidoError) {
      console.error('Error actualizando el pedido:', pedidoError);
      throw new Error(`No se pudo actualizar el pedido: ${pedidoError.message}`);
    }

    // 2. Actualizar el estado de los productos del pedido
    const { error: productosError } = await this.supabase
      .from('pedidos_productos')
      .update({ estado: EstadoProducto.Terminado })
      .eq('pedido_id', pedidoId);

    if (productosError) {
      console.error('Error actualizando productos:', productosError);
      throw new Error(`No se pudo actualizar los productos: ${productosError.message}`);
    }

    console.log(`Pedido ${pedidoId} aceptado por mozo.`);
  }




  async getPedidosPendientes(): Promise<Pedido[]> {
    const { data } = await this.supabase
      .from('pedidos')
      .select("*,mesa:mesa_id(*)")
      .in("estado", [EstadoPedido.PendienteDeAprobacion, EstadoPedido.ComandaEnviada, EstadoPedido.Listo,EstadoPedido.PagoRealizado])
    EstadoPedido

    return data as Pedido[];
  }

  async getProductosDePedido(pedidoId: number): Promise<any[]> {

    
    if (!pedidoId) {
      throw new Error('ID de pedido no proporcionado');
    }

    const { data, error } = await this.supabase
      .from('pedidos_productos')
      .select(`
      *,
      producto:producto_id (
        id, nombre, descripcion, precio, tiempoEstimadoDePreparacion
      )
    `)
      .eq('pedido_id', pedidoId);

    if (error) {
      console.error('Error al obtener productos del pedido:', error.message);
      throw error;
    }

    return data;
  }

  async getProductosPendientesPorArea(area: number): Promise<any[]> {
    // Paso 1: traer productos pendientes
    const { data: productosPedidos, error: errorPedidos } = await this.supabase
      .from('pedidos_productos')
      .select('*')
      .in('estado', [1, 2]);

    if (errorPedidos) {
      console.error('Error en pedidos_productos:', errorPedidos);
      return [];
    }

    // Paso 2: traer productos para obtener el área
    const { data: productos, error: errorProductos } = await this.supabase
      .from('productos')
      .select('id, nombre, areaDePreparacion, tiempoEstimadoDePreparacion');

    if (errorProductos) {
      console.error('Error en productos:', errorProductos);
      return [];
    }

    // Paso 3: traer pedidos para saber la mesa asociada
    const { data: pedidos, error: errorPedidosMesa } = await this.supabase
      .from('pedidos')
      .select('id, mesa_id');

    if (errorPedidosMesa) {
      console.error('Error en pedidos (para mesa_id):', errorPedidosMesa);
      return [];
    }

    // Paso 4: combinar datos
    const productosFiltrados = productosPedidos
      .map(pedidoProducto => {
        const productoDetalle = productos.find(prod => prod.id === pedidoProducto.producto_id);
        const pedidoDetalle = pedidos.find(p => p.id === pedidoProducto.pedido_id);

        if (productoDetalle && productoDetalle.areaDePreparacion == area) {
          return {
            ...pedidoProducto,
            producto: productoDetalle,
            mesa_id: pedidoDetalle?.mesa_id ?? null // opcionalmente null si no encuentra
          };
        }

        return null;
      })
      .filter(item => item !== null);

    console.log(`Productos filtrados por área (${area}):`, productosFiltrados);
    return productosFiltrados;
  }




  async marcarProductoEnPreparacion(id: number, tiempo: number) {
    await this.supabase
      .from('pedidos_productos')
      .update({ estado: 2, tiempoPrometido: tiempo }) // estado 2 = EnProceso
      .eq('id', id);
  }



async liberarMesa(pedido: { id: number }) {
  const pedidoId = pedido.id;

  if (!pedidoId) {
    throw new Error('Pedido inválido: falta el ID');
  }

  // 1. Actualizar el estado del pedido
  const { error: pedidoError } = await this.supabase
    .from('pedidos')
    .update({ estado: EstadoPedido.Terminado })
    .eq('id', pedidoId);

  if (pedidoError) {
    console.error('Error actualizando el pedido:', pedidoError);
    throw new Error(`No se pudo actualizar el pedido: ${pedidoError.message}`);
  }

  // 2. Actualizar el estado de los productos del pedido
  const { error: productosError } = await this.supabase
    .from('pedidos_productos')
    .update({ estado: EstadoProducto.Terminado })
    .eq('pedido_id', pedidoId);

  if (productosError) {
    console.error('Error actualizando productos:', productosError);
    throw new Error(`No se pudo actualizar los productos: ${productosError.message}`);
  }

  // 3. Obtener mesa_id y cliente_id asociados al pedido
  const { data: pedidoData, error: pedidoFetchError } = await this.supabase
    .from('pedidos')
    .select('mesa_id, cliente_id')
    .eq('id', pedidoId)
    .single();

  if (pedidoFetchError) {
    console.error('Error obteniendo el pedido:', pedidoFetchError);
    throw new Error(`No se pudo obtener el pedido: ${pedidoFetchError.message}`);
  }

  const mesaId = pedidoData?.mesa_id;
  const clienteId = pedidoData?.cliente_id;

  if (!mesaId || !clienteId) {
    throw new Error('Faltan datos para liberar la mesa (mesa o cliente)');
  }

  // 4. Liberar la mesa
  const { error: mesaUpdateError } = await this.supabase
    .from('mesas')
    .update({ estado: EstadoMesas.Libre })
    .eq('id', mesaId);

  if (mesaUpdateError) {
    console.error('Error liberando la mesa:', mesaUpdateError);
    throw new Error(`No se pudo liberar la mesa: ${mesaUpdateError.message}`);
  }

  // 5. Actualizar el estado del cliente en mesas_clientes
  const { error: mesasClientesError } = await this.supabase
    .from('mesas_clientes')
    .update({ estado: 7 })
    .eq('cliente_id', clienteId);

  if (mesasClientesError) {
    console.error('Error actualizando mesas_clientes:', mesasClientesError);
    throw new Error(`No se pudo actualizar mesas_clientes: ${mesasClientesError.message}`);
  }

  // 6. Eliminar al cliente de la lista de espera
  const { error: listaEsperaError } = await this.supabase
    .from('lista_de_espera')
    .delete()
    .eq('cliente_id', clienteId);

  if (listaEsperaError) {
    console.error('Error eliminando de lista_de_espera:', listaEsperaError);
    throw new Error(`No se pudo eliminar al cliente de la lista de espera: ${listaEsperaError.message}`);
  }

  console.log(`Pedido ${pedidoId} finalizado. Mesa ${mesaId} liberada. Cliente ${clienteId} actualizado y eliminado de la lista de espera.`);
}



  async marcarProductoListo(id: number) {
    await this.supabase
      .from('pedidos_productos')
      .update({ estado: EstadoProducto.Listo })
      .eq('id', id);
  }


  async clienteTienePedidoAceptado(): Promise<boolean> {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;

    if (!userId) {
      console.error("Usuario no autenticado");
      return false;
    }

    const { data, error } = await this.supabase
      .from("pedidos")
      .select("*")
      .eq("cliente_id", userId)
      .eq("estado", EstadoPedido.ComandaEnviada)
      .maybeSingle();

    if (error) {
      console.error("Error al verificar pedido pendiente:", error.message);
      return false;
    }

    return !!data;
  }

  async getPedidoAsignadoAlCliente(): Promise<Pedido | null> {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;

    if (!userId) {
      console.error("Usuario no autenticado");
      return null;
    }

    const { data, error } = await this.supabase
      .from("pedidos")
      .select("*")
      .eq("cliente_id", userId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error al obtener pedido asignado:", error.message);
      return null;
    }

    return data as Pedido;
  }


  async crearEncuesta(encuestaData: { calificacionGeneral: number, calificacionComida: number, calificacionAtencion: number, comentarios: string, recomendado: boolean }) {
    const { data: sessionData } = await this.supabase.auth.getUser();
    const userId = sessionData.user?.id;
    let pedido = await this.getPedidoAsignadoAlCliente();


    let nuevaEncuesta: Encuesta = {
      calificacionAtencion: encuestaData.calificacionAtencion,
      calificacionComida: encuestaData.calificacionComida,
      calificacionGeneral: encuestaData.calificacionGeneral,
      comentarios: encuestaData.comentarios,
      recomendado: encuestaData.recomendado,
      cliente_id: userId,
      pedido_id: pedido?.id.toString(),
    }

    const { data, error } = await this.supabase
      .from('encuestas')
      .insert([nuevaEncuesta]);

    if (error) {
      console.error('Error al crear cliente:', error.message);
      throw error;
    }

    return data;
  }

  async puedeEnviarEncuesta(): Promise<boolean> {
    const pedido = await this.getPedidoAsignadoAlCliente();

    if (!pedido?.id) {
      console.warn("No se encontró un pedido asignado al cliente.");
      return false;
    }

    const { data, error } = await this.supabase
      .from('encuestas')
      .select('id')
      .eq('pedido_id', pedido.id.toString())
      .maybeSingle();

    if (error) {
      console.error('Error al verificar existencia de encuesta:', error.message);
      return false;
    }

    return !data;
  }

  async puedePedirLaCuenta(): Promise<boolean> {
    const pedido = await this.getPedidoAsignadoAlCliente();

    if (!pedido?.id) {
      console.warn("No se encontró un pedido asignado al cliente.");
      return false;
    }

    const { data, error } = await this.supabase
      .from('pedidos')
      .select('estado')
      .eq('id', pedido.id)
      .maybeSingle();

    if (error) {
      console.error("Error al obtener el estado del pedido:", error.message);
      return false;
    }
    return data?.estado === EstadoPedido.RecepcionConfirmada;
  }

  async getTodasLasEncuestas(): Promise<Encuesta[]> {
    const { data, error } = await this.supabase
      .from('encuestas')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al obtener encuestas:', error.message);
      return [];
    }

    return data as Encuesta[];
  }

  async entregarPedidoMozo(pedido: { id: number }) {
    const pedidoId = pedido.id;

    if (!pedidoId) {
      throw new Error('Pedido inválido: falta el ID');
    }

    // 1. Actualizar el estado del pedido
    const { error: pedidoError } = await this.supabase
      .from('pedidos')
      .update({ estado: EstadoPedido.Entregado })
      .eq('id', pedidoId);

    if (pedidoError) {
      console.error('Error actualizando el pedido:', pedidoError);
      throw new Error(`No se pudo actualizar el pedido: ${pedidoError.message}`);
    }

    // 2. Actualizar el estado de los productos del pedido
    const { error: productosError } = await this.supabase
      .from('pedidos_productos')
      .update({ estado: EstadoProducto.Entregado })
      .eq('pedido_id', pedidoId);

    if (productosError) {
      console.error('Error actualizando productos:', productosError);
      throw new Error(`No se pudo actualizar los productos: ${productosError.message}`);
    }

    console.log(`Pedido ${pedidoId} aceptado por mozo.`);
  }


  async confirmarRecepcionCliente() {

    const pedido = await this.getPedidoAsignadoAlCliente() as Pedido;

    if (!pedido) {
      throw new Error('No hay un pedido asignado al cliente.');
    }

    // 1. Actualizar el estado del pedido
    // const { error: pedidoError } = await this.supabase
    //   .from('pedidos')
    //   .update({ estado: EstadoPedido.Entregado })
    //   .eq('id', pedidoId);

    // if (pedidoError) {
    //   console.error('Error actualizando el pedido:', pedidoError);
    //   throw new Error(`No se pudo actualizar el pedido: ${pedidoError.message}`);
    // }

    // 2. Actualizar el estado de los productos del pedido
    const { error: productosError } = await this.supabase
      .from('pedidos')
      .update({ estado: EstadoPedido.RecepcionConfirmada })
      .eq('id', pedido.id);

    if (productosError) {
      console.error('Error actualizando productos:', productosError);
      throw new Error(`No se pudo actualizar los productos: ${productosError.message}`);
    }
  }


  async obtenerTodasLasEncuestas() {
  const { data, error } = await this.supabase.from('encuestas').select('*').order('created_at', { ascending: false });
  console.log('Datos obtenidos de supabase:', data, 'Error:', error);
  if (error) {
    console.error('Error al traer encuestas:', error);
    throw error;
  }
  return data;
}


  
  async pagarCuentaCliente(): Promise<void> {
  const pedido = await this.getPedidoAsignadoAlCliente();
  if (!pedido) throw new Error("No hay pedido asignado.");

  await this.supabase
    .from('pedidos')
    .update({ estado: EstadoPedido.PagoRealizado })
    .eq('id', pedido.id);
}
}

