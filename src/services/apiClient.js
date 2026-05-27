const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://apibanca.onrender.com'

function construirUrl(endpoint) {
  if (!endpoint) {
    throw new Error('El endpoint es obligatorio.')
  }

  if (endpoint.startsWith('http')) {
    return endpoint
  }

  const endpointNormalizado = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`

  return `${API_BASE_URL}${endpointNormalizado}`
}

function obtenerToken() {
  return localStorage.getItem('novabank_token')
}

function obtenerHeaders(headersPersonalizados = {}) {
  const token = obtenerToken()

  const headers = {
    'Content-Type': 'application/json',
    ...headersPersonalizados,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

function intentarParsearJson(texto) {
  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

async function leerRespuesta(respuesta) {
  const contentType = respuesta.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return respuesta.json()
  }

  const texto = await respuesta.text()

  if (!texto) {
    return null
  }

  return intentarParsearJson(texto)
}

async function procesarRespuesta(respuesta) {
  const datos = await leerRespuesta(respuesta)

  if (!respuesta.ok) {
    const mensaje =
      datos?.message ||
      datos?.mensaje ||
      datos?.error ||
      datos?.title ||
      datos ||
      `Error HTTP ${respuesta.status}`

    throw new Error(mensaje)
  }

  return datos
}

export async function apiGet(endpoint, opciones = {}) {
  const respuesta = await fetch(construirUrl(endpoint), {
    method: 'GET',
    headers: obtenerHeaders(opciones.headers),
  })

  return procesarRespuesta(respuesta)
}

export async function apiPost(endpoint, body = {}, opciones = {}) {
  const respuesta = await fetch(construirUrl(endpoint), {
    method: 'POST',
    headers: obtenerHeaders(opciones.headers),
    body: JSON.stringify(body),
  })

  return procesarRespuesta(respuesta)
}

export async function apiPut(endpoint, body = {}, opciones = {}) {
  const respuesta = await fetch(construirUrl(endpoint), {
    method: 'PUT',
    headers: obtenerHeaders(opciones.headers),
    body: JSON.stringify(body),
  })

  return procesarRespuesta(respuesta)
}

export async function apiPatch(endpoint, body = {}, opciones = {}) {
  const respuesta = await fetch(construirUrl(endpoint), {
    method: 'PATCH',
    headers: obtenerHeaders(opciones.headers),
    body: JSON.stringify(body),
  })

  return procesarRespuesta(respuesta)
}

export async function apiDelete(endpoint, opciones = {}) {
  const respuesta = await fetch(construirUrl(endpoint), {
    method: 'DELETE',
    headers: obtenerHeaders(opciones.headers),
  })

  return procesarRespuesta(respuesta)
}

export function guardarToken(token) {
  if (!token) {
    localStorage.removeItem('novabank_token')
    return
  }

  localStorage.setItem('novabank_token', token)
}

export function eliminarToken() {
  localStorage.removeItem('novabank_token')
}