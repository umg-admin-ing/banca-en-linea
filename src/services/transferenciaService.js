import { apiPost } from './apiClient'

function normalizarTransferencia(transferenciaApi) {
  return {
    idTransferencia: transferenciaApi.idTransferencia,
    transactionId: transferenciaApi.transactionId || '',
    cuentaOrigenId: transferenciaApi.cuentaOrigenId,
    cuentaDestinoId: transferenciaApi.cuentaDestinoId,
    cuentaOrigenExterna: transferenciaApi.cuentaOrigenExterna || '',
    nombreCuentaOrigenExterna:
      transferenciaApi.nombreCuentaOrigenExterna || '',
    cuentaDestinoExterna: transferenciaApi.cuentaDestinoExterna || '',
    swiftOrigen: transferenciaApi.swiftOrigen || '',
    bancoOrigen: transferenciaApi.bancoOrigen || '',
    swiftDestino: transferenciaApi.swiftDestino || '',
    nombreClienteDestino: transferenciaApi.nombreClienteDestino || '',
    monto: Number(transferenciaApi.monto || 0),
    tipo: transferenciaApi.tipo || 'Transferencia',
    direccion: transferenciaApi.direccion || '',
    estado: transferenciaApi.estado || '',
    createdAt: transferenciaApi.createdAt || null,
  }
}

export async function registrarTransferenciaInterna({
  cuentaOrigenId,
  numeroCuentaDestino,
  monto,
}) {
  const respuesta = await apiPost('/api/transferencias/interna', {
    cuentaOrigenId,
    numeroCuentaDestino,
    monto,
  })

  return normalizarTransferencia(respuesta)
}

export async function registrarTransferenciaAchSaliente({
  cuentaOrigen,
  swiftOrigen,
  cuentaDestino,
  swiftDestino,
  monto,
  descripcion,
}) {
  const respuesta = await apiPost('/api/transferencias/interbancaria/saliente', {
    cuentaOrigen,
    swiftOrigen,
    cuentaDestino,
    swiftDestino,
    monto,
    descripcion,
  })

  return normalizarTransferencia(respuesta)
}