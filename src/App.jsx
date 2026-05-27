import { useState } from 'react'
import BancarioLayout from './layouts/BancarioLayout'
import Dashboard from './pages/Dashboard'
import Cuentas from './pages/Cuentas'
import Movimientos from './pages/Movimientos'
import TransferenciasInternas from './pages/TransferenciasInternas'
import TransferenciasACH from './pages/TransferenciasACH'
import Login from './pages/Login'
import {
  cerrarSesion as cerrarSesionServicio,
  obtenerSesionGuardada,
} from './services/authService'
import './App.css'

function App() {
  const [pantallaActual, setPantallaActual] = useState('dashboard')
  const [usuario, setUsuario] = useState(obtenerSesionGuardada)

  const iniciarSesion = (datosUsuario) => {
    setUsuario(datosUsuario)
  }

  const cerrarSesion = () => {
    cerrarSesionServicio()
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