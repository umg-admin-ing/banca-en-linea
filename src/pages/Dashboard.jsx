import { useMemo, useState } from 'react'
import {
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEye,
  FiSend,
} from 'react-icons/fi'
import { cuentas, movimientos } from '../data/bancaData'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(valor)
}

function obtenerReferencia(movimiento) {
  return (
    movimiento.referencia ||
    movimiento.autorizacion ||
    movimiento.idMovimiento ||
    `MOV-${movimiento.id}`
  )
}

function Dashboard() {
  const [tarjetaAbierta, setTarjetaAbierta] = useState('')

  const cuentasActivas = useMemo(
    () =>
      cuentas.filter((cuenta) =>
        String(cuenta.estado || '').toLowerCase().includes('activa'),
      ),
    [],
  )

  const saldoTotal = useMemo(
    () =>
      cuentasActivas.reduce(
        (total, cuenta) => total + Number(cuenta.saldoDisponible || 0),
        0,
      ),
    [cuentasActivas],
  )

  const movimientosHoy = useMemo(
    () =>
      movimientos.filter((movimiento) => movimiento.fecha === '2026-05-13'),
    [],
  )

  const achPendientes = useMemo(
    () =>
      movimientos.filter(
        (movimiento) =>
          String(movimiento.tipo || '').toLowerCase().includes('ach') &&
          String(movimiento.estado || '').toLowerCase().includes('pendiente'),
      ),
    [],
  )

  const alternarTarjeta = (tarjeta) => {
    setTarjetaAbierta((tarjetaActual) =>
      tarjetaActual === tarjeta ? '' : tarjeta,
    )
  }

  return (
    <section className="dashboard">
      <div className="page-title">
        <div>
          <span className="eyebrow">Resumen general</span>
          <h1>Dashboard bancario</h1>
          <p>
            Consulta rápida de cuentas, saldos, movimientos y operaciones ACH.
          </p>
        </div>
      </div>

      <div className="summary-grid">
        <article
          className={`summary-card expandable ${
            tarjetaAbierta === 'cuentas' ? 'open' : ''
          }`}
        >
          <button
            type="button"
            className="summary-card-button"
            onClick={() => alternarTarjeta('cuentas')}
          >
            <span className="summary-icon">
              <FiCreditCard />
            </span>

            <span className="summary-info">
              <span className="summary-label">Cuentas activas</span>
              <strong>{cuentasActivas.length}</strong>
              <small>Haz clic para ver el detalle</small>
            </span>

            <FiChevronDown className="summary-chevron" />
          </button>

          {tarjetaAbierta === 'cuentas' && (
            <div className="summary-detail">
              <div className="mini-list">
                {cuentasActivas.map((cuenta) => (
                  <button
                    type="button"
                    className="mini-list-item"
                    key={cuenta.id}
                  >
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
            </div>
          )}
        </article>

        <article
          className={`summary-card expandable ${
            tarjetaAbierta === 'saldo' ? 'open' : ''
          }`}
        >
          <button
            type="button"
            className="summary-card-button"
            onClick={() => alternarTarjeta('saldo')}
          >
            <span className="summary-icon">
              <FiDollarSign />
            </span>

            <span className="summary-info">
              <span className="summary-label">Saldo total</span>
              <strong>{formatoMoneda(saldoTotal)}</strong>
              <small>Consolidado de cuentas activas</small>
            </span>

            <FiChevronDown className="summary-chevron" />
          </button>

          {tarjetaAbierta === 'saldo' && (
            <div className="summary-detail">
              <div className="mini-list">
                {cuentasActivas.map((cuenta) => (
                  <div className="mini-list-item" key={cuenta.id}>
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
            </div>
          )}
        </article>

        <article
          className={`summary-card expandable ${
            tarjetaAbierta === 'movimientos' ? 'open' : ''
          }`}
        >
          <button
            type="button"
            className="summary-card-button"
            onClick={() => alternarTarjeta('movimientos')}
          >
            <span className="summary-icon">
              <FiClock />
            </span>

            <span className="summary-info">
              <span className="summary-label">Transacciones hoy</span>
              <strong>{movimientosHoy.length}</strong>
              <small>Operaciones registradas hoy</small>
            </span>

            <FiChevronDown className="summary-chevron" />
          </button>

          {tarjetaAbierta === 'movimientos' && (
            <div className="summary-detail">
              <div className="mini-list">
                {movimientosHoy.map((movimiento) => (
                  <div className="mini-list-item" key={movimiento.id}>
                    <span>
                      <strong>{movimiento.tipo}</strong>
                      <small>{obtenerReferencia(movimiento)}</small>
                    </span>

                    <span
                      className={`mini-amount ${
                        Number(movimiento.monto) < 0 ? 'debit' : 'credit'
                      }`}
                    >
                      {formatoMoneda(movimiento.monto)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        <article
          className={`summary-card expandable warning ${
            tarjetaAbierta === 'ach' ? 'open' : ''
          }`}
        >
          <button
            type="button"
            className="summary-card-button"
            onClick={() => alternarTarjeta('ach')}
          >
            <span className="summary-icon">
              <FiSend />
            </span>

            <span className="summary-info">
              <span className="summary-label">ACH pendientes</span>
              <strong>{achPendientes.length}</strong>
              <small>Transferencias externas en proceso</small>
            </span>

            <FiChevronDown className="summary-chevron" />
          </button>

          {tarjetaAbierta === 'ach' && (
            <div className="summary-detail">
              {achPendientes.length > 0 ? (
                <div className="mini-list">
                  {achPendientes.map((movimiento) => (
                    <div className="mini-list-item" key={movimiento.id}>
                      <span>
                        <strong>{movimiento.tipo}</strong>
                        <small>{obtenerReferencia(movimiento)}</small>
                      </span>

                      <span className="mini-amount debit">
                        {formatoMoneda(movimiento.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h2>Sin ACH pendientes</h2>
                  <p>No hay transferencias externas en proceso.</p>
                </div>
              )}
            </div>
          )}
        </article>
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Cuentas disponibles</h2>
              <p>Selecciona una cuenta para revisar su detalle.</p>
            </div>

            <span>{cuentasActivas.length} registros</span>
          </div>

          <div className="account-list">
            {cuentasActivas.map((cuenta) => (
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
            {movimientos.slice(0, 3).map((movimiento) => (
              <article className="movement-item" key={movimiento.id}>
                <div>
                  <h3>{movimiento.tipo}</h3>
                  <p>{movimiento.descripcion}</p>
                  <small>
                    {movimiento.fecha} · {obtenerReferencia(movimiento)}
                  </small>
                </div>

                <strong
                  className={`amount ${
                    Number(movimiento.monto) < 0 ? 'debit' : 'credit'
                  }`}
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