import { apiGet } from './apiClient'

function normalizarCuenta(cuentaApi) {
  return {
    id: cuentaApi.idCuenta,
    idCuenta: cuentaApi.idCuenta,
    idCliente: cuentaApi.idCliente,
    numeroCuenta: cuentaApi.numeroCuenta || 'Sin número',
    tipoCuenta: cuentaApi.tipo || 'Cuenta',
    saldoDisponible: Number(cuentaApi.saldo || 0),
    swiftBanco: cuentaApi.swiftBanco || 'N/A',
    estado: cuentaApi.estado || 'Sin estado',
    createdAt: cuentaApi.createdAt || null,
    titular: cuentaApi.idCliente
      ? `Cliente ${cuentaApi.idCliente}`
      : 'Cliente no asignado',
  }
}

export async function listarCuentas() {
  const respuesta = await apiGet('/api/cuentas')

  if (!Array.isArray(respuesta)) {
    return []
  }

  return respuesta.map(normalizarCuenta)
}

export async function obtenerCuentaPorId(idCuenta) {
  const respuesta = await apiGet(`/api/cuentas/${idCuenta}`)
  return normalizarCuenta(respuesta)
}

export async function obtenerCuentaPorNumero(numeroCuenta) {
  const respuesta = await apiGet(`/api/cuentas/numero/${numeroCuenta}`)
  return normalizarCuenta(respuesta)
}