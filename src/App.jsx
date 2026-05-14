import { useState } from 'react'
import BancarioLayout from './layouts/BancarioLayout'
import Dashboard from './pages/Dashboard'
import Cuentas from './pages/Cuentas'
import Movimientos from './pages/Movimientos'
import TransferenciasInternas from './pages/TransferenciasInternas'
import TransferenciasACH from './pages/TransferenciasACH'
import './App.css'

function App() {
  const [pantallaActual, setPantallaActual] = useState('dashboard')

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

  return (
    <BancarioLayout
      pantallaActual={pantallaActual}
      onCambiarPantalla={setPantallaActual}
    >
      {obtenerPantalla()}
    </BancarioLayout>
  )
}

export default App