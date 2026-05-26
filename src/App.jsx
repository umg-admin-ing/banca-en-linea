import { useState } from 'react'
import BancarioLayout from './layouts/BancarioLayout'
import Dashboard from './pages/Dashboard'
import Cuentas from './pages/Cuentas'
import Movimientos from './pages/Movimientos'
import TransferenciasInternas from './pages/TransferenciasInternas'
import TransferenciasACH from './pages/TransferenciasACH'
import Login from './pages/Login'
import './App.css'

function obtenerSesionInicial() {
  try {
    const sesionGuardada = localStorage.getItem('novabank_sesion')
    return sesionGuardada ? JSON.parse(sesionGuardada) : null
  } catch {
    return null
  }
}

function App() {
  const [pantallaActual, setPantallaActual] = useState('dashboard')
  const [usuario, setUsuario] = useState(obtenerSesionInicial)

  const iniciarSesion = (datosUsuario) => {
    setUsuario(datosUsuario)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('novabank_sesion')
    localStorage.removeItem('novabank_token')
    setUsuario(null)
    setPantallaActual('dashboard')
  }

  const obtenerPantalla = () => {
    switch (pantallaActual) {
      case 'dashboard':
        return <Dashboard />

      case 'cuentas':
        return <Cuentas />

      case 'movimientos':
        return <Movimientos />

      case 'transferencias':
        return <TransferenciasInternas />

      case 'ach':
        return <TransferenciasACH />

      default:
        return <Dashboard />
    }
  }

  if (!usuario) {
    return <Login onIniciarSesion={iniciarSesion} />
  }

  return (
    <BancarioLayout
      usuario={usuario}
      pantallaActual={pantallaActual}
      onCambiarPantalla={setPantallaActual}
      onCerrarSesion={cerrarSesion}
    >
      {obtenerPantalla()}
    </BancarioLayout>
  )
}

export default App