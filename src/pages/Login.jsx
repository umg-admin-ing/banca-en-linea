import { useState } from 'react'
import { FiLock, FiLogIn, FiUser } from 'react-icons/fi'
import logoNovaBank from '../assets/novabank-logo.png'

function Login({ onIniciarSesion }) {
  const [formulario, setFormulario] = useState({
    usuario: '',
    password: '',
  })

  const [error, setError] = useState('')

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }))

    setError('')
  }

  const manejarEnvio = (evento) => {
    evento.preventDefault()

    if (!formulario.usuario.trim() || !formulario.password.trim()) {
      setError('Ingresa usuario y contraseña para continuar.')
      return
    }

    const usuarioSesion = {
      nombre: formulario.usuario.trim(),
      rol: 'Operador',
    }

    localStorage.setItem('novabank_sesion', JSON.stringify(usuarioSesion))
    onIniciarSesion(usuarioSesion)
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
                name="usuario"
                placeholder="Ejemplo: operador"
                value={formulario.usuario}
                onChange={manejarCambio}
                autoComplete="username"
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
              />
            </div>
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            <FiLogIn />
            Entrar al sistema
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login