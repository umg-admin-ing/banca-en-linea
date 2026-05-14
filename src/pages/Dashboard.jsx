import { useState } from 'react'
import {
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEye,
  FiPlus,
  FiSend,
} from 'react-icons/fi'
import TarjetaResumen from '../components/TarjetaResumen'
import { cuentas, movimientos, resumenBancario } from '../data/bancaData'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(valor)
}

function Dashboard() {
  const [mostrarPersonalizacion, setMostrarPersonalizacion] = useState(false)

  const movimientosHoy = movimientos.filter(
    (movimiento) => movimiento.fecha === '2026-05-13',
  )

  const achPendientes = movimientos.filter(
    (movimiento) => movimiento.tipo === 'ACH' && movimiento.estado !== 'Completada',
  )

  const alternarPersonalizacion = () => {
    setMostrarPersonalizacion((estadoActual) => !estadoActual)
  }

  return (
    <section className="dashboard" id="dashboard">
      <div className="page-title">
        <div>
          <span className="eyebrow">Resumen general</span>
          <h1>Dashboard bancario</h1>
          <p>Consulta rápida de cuentas, saldos, movimientos y operaciones ACH.</p>
        </div>
      </div>

      <div className="summary-grid">
        <TarjetaResumen
          titulo="Cuentas activas"
          valor={resumenBancario.cuentasActivas}
          descripcion="Haz clic para ver el detalle"
          icono={<FiCreditCard />}
          abiertaInicial
        >
          <div className="mini-list">
            {cuentas.map((cuenta) => (
              <button type="button" className="mini-list-item" key={cuenta.id}>
                <span>
                  <strong>{cuenta.tipoCuenta}</strong>
                  <small>{cuenta.numeroCuenta}</small>
                </span>

                <span className="mini-amount">
                  {formatoMoneda(cuenta.saldoDisponible)}
                </span>
              </button>
            ))}
          </div>

          <button type="button" className="secondary-action">
            <FiEye />
            Ver todas las cuentas
          </button>
        </TarjetaResumen>

        <TarjetaResumen
          titulo="Saldo total"
          valor={formatoMoneda(resumenBancario.saldoTotal)}
          descripcion="Consolidado de cuentas activas"
          icono={<FiDollarSign />}
        >
          <div className="mini-list">
            {cuentas.map((cuenta) => (
              <div className="mini-list-item static" key={cuenta.id}>
                <span>
                  <strong>{cuenta.tipoCuenta}</strong>
                  <small>{cuenta.numeroCuenta}</small>
                </span>

                <span className="mini-amount">
                  {formatoMoneda(cuenta.saldoDisponible)}
                </span>
              </div>
            ))}
          </div>
        </TarjetaResumen>

        <TarjetaResumen
          titulo="Transacciones hoy"
          valor={resumenBancario.transaccionesHoy}
          descripcion="Operaciones registradas hoy"
          icono={<FiClock />}
        >
          <div className="mini-list">
            {movimientosHoy.map((movimiento) => (
              <div className="mini-list-item static" key={movimiento.id}>
                <span>
                  <strong>{movimiento.tipo}</strong>
                  <small>{movimiento.autorizacion}</small>
                </span>

                <span
                  className={
                    movimiento.monto < 0
                      ? 'mini-amount debit'
                      : 'mini-amount credit'
                  }
                >
                  {formatoMoneda(movimiento.monto)}
                </span>
              </div>
            ))}
          </div>
        </TarjetaResumen>

        <TarjetaResumen
          titulo="ACH pendientes"
          valor={resumenBancario.achPendientes}
          descripcion="Transferencias externas en proceso"
          icono={<FiSend />}
          tipo="warning"
        >
          <div className="mini-list">
            {achPendientes.map((movimiento) => (
              <div className="mini-list-item static" key={movimiento.id}>
                <span>
                  <strong>{movimiento.cuentaDestino}</strong>
                  <small>{movimiento.estado}</small>
                </span>

                <span className="mini-amount debit">
                  {formatoMoneda(movimiento.monto)}
                </span>
              </div>
            ))}
          </div>
        </TarjetaResumen>

        <button
          type="button"
          className="add-widget-card"
          onClick={alternarPersonalizacion}
          aria-expanded={mostrarPersonalizacion}
        >
          <span>
            <FiPlus />
          </span>
          <strong>Agregar apartado</strong>
          <small>Personalizar dashboard</small>
        </button>
      </div>

      {mostrarPersonalizacion && (
        <section className="panel customization-panel">
          <div className="panel-header">
            <div>
              <h2>Personalizar dashboard</h2>
              <p>Selecciona qué bloques deseas mostrar en tu panel.</p>
            </div>
          </div>

          <div className="widget-options">
            <button type="button">Cuentas favoritas</button>
            <button type="button">ACH recientes</button>
            <button type="button">Alertas de saldo</button>
            <button type="button">Comprobantes recientes</button>
          </div>
        </section>
      )}

      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Cuentas disponibles</h2>
              <p>Selecciona una cuenta para revisar su detalle.</p>
            </div>
            <span>{cuentas.length} registros</span>
          </div>

          <div className="account-list">
            {cuentas.map((cuenta) => (
              <article className="account-card" key={cuenta.id}>
                <div>
                  <h3>{cuenta.tipoCuenta}</h3>
                  <p>{cuenta.numeroCuenta}</p>
                  <small>{cuenta.titular}</small>
                </div>

                <div className="account-balance">
                  <strong>{formatoMoneda(cuenta.saldoDisponible)}</strong>
                  <span>{cuenta.estado}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Movimientos recientes</h2>
              <p>Últimas operaciones registradas en el sistema.</p>
            </div>
            <span>{movimientos.length} registros</span>
          </div>

          <div className="movement-list">
            {movimientos.map((movimiento) => (
              <article className="movement-item" key={movimiento.id}>
                <div>
                  <h3>{movimiento.tipo}</h3>
                  <p>{movimiento.descripcion}</p>
                  <small>
                    {movimiento.fecha} · {movimiento.autorizacion}
                  </small>
                </div>

                <strong
                  className={
                    movimiento.monto < 0 ? 'amount debit' : 'amount credit'
                  }
                >
                  {formatoMoneda(movimiento.monto)}
                </strong>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Dashboard