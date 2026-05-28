import { apiGet } from './apiClient'

function normalizarBanco(bancoApi) {
  return {
    swift: bancoApi.swift || '',
    nombre: bancoApi.nombre || 'Banco sin nombre',
    url: bancoApi.url || '',
    rutaTransferenciaEntrante: bancoApi.rutaTransferenciaEntrante || '',
  }
}

export async function listarBancos() {
  const respuesta = await apiGet('/api/bancos')

  if (!Array.isArray(respuesta)) {
    return []
  }

  return respuesta.map(normalizarBanco)
}