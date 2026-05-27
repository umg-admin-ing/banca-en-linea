import { apiPost, eliminarToken, guardarToken } from './apiClient'

const CLAVE_SESION = 'novabank_sesion'

function normalizarUsuario(datosLogin) {
  const usuarioApi = datosLogin?.usuario || {}

  return {
    idUsuario: usuarioApi.idUsuario || 0,
    idCliente: usuarioApi.idCliente || 0,
    nombre: usuarioApi.username || 'Usuario',
    username: usuarioApi.username || '',
    rol: usuarioApi.rol || datosLogin?.role || 'Usuario',
    estado: usuarioApi.estado || '',
    requiereCambioPassword:
      Boolean(usuarioApi.requiereCambioPassword) ||
      Boolean(datosLogin?.requiereCambioPassword),
    passwordTemporal: Boolean(usuarioApi.passwordTemporal),
    fechaCambioPassword: usuarioApi.fechaCambioPassword || null,
    createdAt: usuarioApi.createdAt || null,
  }
}

export async function iniciarSesion({ username, password }) {
  const datosLogin = await apiPost('/api/usuarios/login', {
    username,
    password,
  })

  if (!datosLogin?.token) {
    throw new Error('El servidor no devolvió token de autenticación.')
  }

  const usuario = normalizarUsuario(datosLogin)

  guardarToken(datosLogin.token)
  localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario))

  return {
    token: datosLogin.token,
    usuario,
    requiereCambioPassword: usuario.requiereCambioPassword,
  }
}

export function obtenerSesionGuardada() {
  try {
    const sesionGuardada = localStorage.getItem(CLAVE_SESION)

    if (!sesionGuardada) {
      return null
    }

    return JSON.parse(sesionGuardada)
  } catch {
    cerrarSesion()
    return null
  }
}

export function cerrarSesion() {
  eliminarToken()
  localStorage.removeItem(CLAVE_SESION)
}