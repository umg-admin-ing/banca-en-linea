import { useEffect, useState } from 'react'
import {
  FiActivity,
  FiChevronLeft,
  FiCreditCard,
  FiHome,
  FiLogOut,
  FiMenu,
  FiRepeat,
  FiSend,
} from 'react-icons/fi'
import logoNovaBank from '../assets/novabank-logo.png'

const opcionesMenu = [
  {
    id: 'dashboard',
    texto: 'Dashboard',
    textoCorto: 'Inicio',
    icono: <FiHome />,
  },
  {
    id: 'cuentas',
    texto: 'Cuentas',
    textoCorto: 'Cuentas',
    icono: <FiCreditCard />,
  },
  {
    id: 'movimientos',
    texto: 'Movimientos',
    textoCorto: 'Movs.',
    icono: <FiActivity />,
  },
  {
    id: 'transferencias',
    texto: 'Transferencias internas',
    textoCorto: 'Internas',
    icono: <FiRepeat />,
  },
  {
    id: 'ach',
    texto: 'Transferencias ACH',
    textoCorto: 'ACH',
    icono: <FiSend />,
  },
]

function BancarioLayout({
  children,
  usuario,
  pantallaActual = 'dashboard',
  onCambiarPantalla = () => {},
  onCerrarSesion = () => {},
}) {
  const [menuColapsado, setMenuColapsado] = useState(() => {
    const valorGuardado = localStorage.getItem('menu-banca-colapsado')
    return valorGuardado === 'true'
  })

  useEffect(() => {
    localStorage.setItem('menu-banca-colapsado', String(menuColapsado))
  }, [menuColapsado])

  const alternarMenu = () => {
    setMenuColapsado((estadoActual) => !estadoActual)
  }

  return (
    <div className={`app-shell ${menuColapsado ? 'menu-colapsado' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <img
              src={logoNovaBank}
              alt="Logo NovaBank"
              className="brand-logo-image"
            />
          </div>

          <div className="brand-text">
            <h1>NovaBank</h1>
            <p>Tu futuro, nuestra prioridad</p>
          </div>
        </div>

        <button
          type="button"
          className="menu-toggle"
          onClick={alternarMenu}
          aria-label={menuColapsado ? 'Expandir menú' : 'Colapsar menú'}
          title={menuColapsado ? 'Expandir menú' : 'Colapsar menú'}
        >
          {menuColapsado ? <FiMenu /> : <FiChevronLeft />}
        </button>

        <nav className="sidebar-nav" aria-label="Menú principal">
          {opcionesMenu.map((opcion) => (
            <button
              type="button"
              key={opcion.id}
              className={`nav-link ${pantallaActual === opcion.id ? 'active' : ''}`}
              title={opcion.texto}
              onClick={() => onCambiarPantalla(opcion.id)}
            >
              <span className="nav-icon">{opcion.icono}</span>
              <span className="nav-text">{opcion.texto}</span>
              <span className="nav-short">{opcion.textoCorto}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Panel bancario</h2>
            <p>Gestión de cuentas, movimientos y transferencias</p>
          </div>

          <div className="user-box">
            <span>{usuario?.nombre || 'Usuario'}</span>
            <strong>{usuario?.rol || 'Operador'}</strong>

            <button
              type="button"
              className="logout-button"
              onClick={onCerrarSesion}
            >
              <FiLogOut />
              Salir
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}

export default BancarioLayout