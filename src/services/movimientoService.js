import { apiGet } from './apiClient'

function normalizarMovimiento(movimientoApi) {
  return {
    id: movimientoApi.idMovimiento,
    idMovimiento: movimientoApi.idMovimiento,
    idCuenta: movimientoApi.idCuenta,
    tipo: movimientoApi.tipo || 'Movimiento',
    monto: Number(movimientoApi.monto || 0),
    descripcion: movimientoApi.descripcion || 'Sin descripción',
    referencia: movimientoApi.referencia || `MOV-${movimientoApi.idMovimiento}`,
    saldoResultante: Number(movimientoApi.saldoResultante || 0),
    createdAt: movimientoApi.createdAt || null,
    fecha: movimientoApi.createdAt || null,
  }
}

export function filtrarMovimientosPorCuentas(movimientos, cuentas) {
  const idsCuentasPermitidas = new Set(
    cuentas.map((cuenta) => String(cuenta.idCuenta)),
  )

  return movimientos.filter((movimiento) =>
    idsCuentasPermitidas.has(String(movimiento.idCuenta)),
  )
}

export async function listarMovimientos() {
  const respuesta = await apiGet('/api/movimientos')

  if (!Array.isArray(respuesta)) {
    return []
  }

  return respuesta.map(normalizarMovimiento)
}

export async function listarMovimientosPorCuentas(cuentas) {
  const movimientos = await listarMovimientos()
  return filtrarMovimientosPorCuentas(movimientos, cuentas)
}

export async function obtenerMovimientoPorId(idMovimiento) {
  const respuesta = await apiGet(`/api/movimientos/${idMovimiento}`)
  return normalizarMovimiento(respuesta)
}