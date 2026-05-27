import { useState } from 'react'
import { FiLock, FiLogIn, FiUser } from 'react-icons/fi'
import logoNovaBank from '../assets/novabank-logo.png'
import { iniciarSesion } from '../services/authService'

function Login({ onIniciarSesion }) {
  const [formulario, setFormulario] = useState({
    username: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }))

    setError('')
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()

    const username = formulario.username.trim()
    const password = formulario.password.trim()

    if (!username || !password) {
      setError('Ingresa usuario y contraseña para continuar.')
      return
    }

    try {
      setCargando(true)
      setError('')

      const resultado = await iniciarSesion({
        username,
        password,
      })

      onIniciarSesion(resultado.usuario)
    } catch (errorLogin) {
      setError(
        errorLogin?.message ||
          'No se pudo iniciar sesión. Verifica tus credenciales.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo-frame">
            <img
              src={logoNovaBank}
              alt="Logo NovaBank"
              className="login-logo-image"
            />
          </div>
        </div>

        <div className="login-title">
          <span>Banca en línea</span>
          <h2>Iniciar sesión</h2>
        </div>

        <form className="login-form" onSubmit={manejarEnvio}>
          <label className="login-field">
            <span>Usuario</span>
            <div>
              <FiUser />
              <input
                type="text"
                name="username"
                placeholder="Ingresa tu usuario"
                value={formulario.username}
                onChange={manejarCambio}
                autoComplete="username"
                disabled={cargando}
              />
            </div>
          </label>

          <label className="login-field">
            <span>Contraseña</span>
            <div>
              <FiLock />
              <input
                type="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                value={formulario.password}
                onChange={manejarCambio}
                autoComplete="current-password"
                disabled={cargando}
              />
            </div>
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button" disabled={cargando}>
            <FiLogIn />
            {cargando ? 'Validando...' : 'Entrar al sistema'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login