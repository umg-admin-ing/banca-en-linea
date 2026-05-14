export const cuentas = [
  {
    id: 1,
    numeroCuenta: '100-001-000001',
    tipoCuenta: 'Monetaria',
    titular: 'Cliente Demo',
    moneda: 'GTQ',
    saldoDisponible: 15850.75,
    estado: 'Activa',
  },
  {
    id: 2,
    numeroCuenta: '100-001-000002',
    tipoCuenta: 'Ahorro',
    titular: 'Cliente Demo',
    moneda: 'GTQ',
    saldoDisponible: 7300.5,
    estado: 'Activa',
  },
  {
    id: 3,
    numeroCuenta: '200-001-000010',
    tipoCuenta: 'Monetaria',
    titular: 'Empresa Demo S.A.',
    moneda: 'GTQ',
    saldoDisponible: 42500.0,
    estado: 'Activa',
  },
]

export const movimientos = [
  {
    id: 1,
    fecha: '2026-05-13',
    tipo: 'Transferencia interna',
    cuentaOrigen: '100-001-000001',
    cuentaDestino: '100-001-000002',
    descripcion: 'Transferencia entre cuentas propias',
    monto: -500.0,
    estado: 'Completada',
    autorizacion: 'INT-000001',
  },
  {
    id: 2,
    fecha: '2026-05-13',
    tipo: 'ACH',
    cuentaOrigen: '100-001-000001',
    cuentaDestino: 'BAC-4455667788',
    descripcion: 'Transferencia ACH a banco externo',
    monto: -1200.0,
    estado: 'En proceso',
    autorizacion: 'ACH-000001',
  },
  {
    id: 3,
    fecha: '2026-05-12',
    tipo: 'Credito',
    cuentaOrigen: 'N/A',
    cuentaDestino: '100-001-000001',
    descripcion: 'Deposito recibido',
    monto: 2500.0,
    estado: 'Completada',
    autorizacion: 'DEP-000001',
  },
]

export const resumenBancario = {
  cuentasActivas: 3,
  saldoTotal: 65651.25,
  transaccionesHoy: 2,
  achPendientes: 1,
}
