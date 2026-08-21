// Types

export type Cliente = {
    id: string | undefined
    email: string;
    nombre: string;
    apellido: string
    dni: string;
    edad: number;
    foto: string;
    rol: Role;
    estado: Estado;
}

// Chekear creacion de usuario anonimo
export type ClienteAnonimo = {
    id: string | undefined
    email: string;
    dni: string;
    edad: number;
    foto: string;
    rol: Role;
}

export type ListaDeEspera = {
    cliente: Cliente
    estado: EstadoListaDeEspera;
}

export type Mesa = {
    id: | undefined;
    numero: number;
    descripcion: string;
    capacidad: number;
    estado: EstadoMesas;
    aptaBebes: boolean;
    ubicacion: UbicacionMesa;
}

export type ClienteMesa = {
    cliente_id: string | undefined;
    mesa_id: string | undefined;
    estado: EstadoListaDeEspera;
}

export type JSONQr = {
    type: string,
    mensaje: string,
    objeto: {
        content?: string;
        length?: number;
        rawData?: string;
        error?: any;
        [key: string]: any;
    },
}

export type dniData1 = {
    codigo: string;
    apellido: string;
    nombre: string;
    genero: string;
    dni: string;
    fechaNacimiento: string;
    fechaExpedicion: string;
};

export type Producto = {
    id: string,
    nombre: string,
    descripcion: string,
    foto1: string,
    foto2: string,
    foto3: string,
    precio: number,
    tiempoEstimadoDePreparacion: number,
    areaDePreparacion: number
}

export type Item = {
    [productoId: string]: number;
};

export type ItemPedido = {
    producto: Producto;
    cantidad: number;
    estado?: EstadoProducto;
    pedido_id?: number;
}

export type Pedido = {
    id: number;
    cliente: string;
    estado: EstadoPedido;
    mesa: Mesa;
}

export type Encuesta = {
    id?: number;
    calificacionGeneral: number;
    calificacionComida: number;
    calificacionAtencion: number;
    comentarios: string;
    recomendado: boolean;
    cliente_id: string | undefined;
    pedido_id: string | undefined;
}


// Enums

export enum Role {
    Cliente = 'cliente',
    ClienteAnonimo = 'clienteAnonimo',
    Supervisor = 'supervisor',
    Maiter = 'maitre',
    Mozo = 'mozo',
    Bartender = 'bartender',
    Cocinero = 'cocinero',
}

export enum Estado {
    Pendiente = 0,
    Aceptado = 1,
    Rechazado = 2
}

export enum EstadoMesas {
    Libre = 0,
    Ocupada = 1,
    NoDisponible = 2,
}

export enum UbicacionMesa {
    Salon = "Salon",
    Patio = "Patio",
}

export enum EstadoListaDeEspera {
    Esperando = 0,
    Asginado = 1,
    Sentado = 2
}

export enum EstadoPedido {
    PendienteDeAprobacion = 0,
    ComandaEnviada = 1,
    Listo = 2,
    Entregado = 3,
    RecepcionConfirmada = 4,
    PagoRealizado = 5,
    Terminado = 6
}

export enum EstadoProducto {
    PedidoPendienteDeAprobacion = 0,
    ComandaRecibida = 1,
    EnProceso = 2,
    Listo = 3,
    Entregado = 4,
    Terminado = 5,
}

export enum AreaDePreparacion {
    Cocina = 0,
    Barra = 1,
}