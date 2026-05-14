import {
  FiCreditCard,
  FiEye,
  FiFilter,
  FiSearch,
  FiTrendingUp,
} from 'react-icons/fi'
import { cuentas } from '../data/bancaData'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(valor)
}

function Cuentas() {
  const saldoTotal = cuentas.reduce(
    (total, cuenta) => total + cuenta.saldoDisponible,
    0,
  )

  return (
    <section className="page-section" id="cuentas">
      <div className="page-title">
        <div>
          <span className="eyebrow">Gestión de cuentas</span>
          <h1>Cuentas bancarias</h1>
          <p>
            Consulta las cuentas activas, saldos disponibles y estado operativo
            de cada cuenta.
          </p>
        </div>
      </div>

      <div className="summary-grid compact">
        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Cuentas registradas</span>
          </div>
          <strong>{cuentas.length}</strong>
          <small>Total de cuentas disponibles para operación.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiTrendingUp />
            </span>
            <span>Saldo consolidado</span>
          </div>
          <strong>{formatoMoneda(saldoTotal)}</strong>
          <small>Suma de saldos disponibles en cuentas activas.</small>
        </article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Listado de cuentas</h2>
            <p>Selecciona una cuenta para revisar sus movimientos o detalle.</p>
          </div>

          <span>{cuentas.length} registros</span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por número, tipo o titular..."
            />
          </div>

          <button type="button" className="toolbar-button">
            <FiFilter />
            Filtros
          </button>
        </div>

        <div className="cards-table">
          {cuentas.map((cuenta) => (
            <article className="account-row" key={cuenta.id}>
              <div className="account-row-main">
                <span className="account-row-icon">
                  <FiCreditCard />
                </span>

                <div>
                  <h3>{cuenta.tipoCuenta}</h3>
                  <p>{cuenta.numeroCuenta}</p>
                  <small>{cuenta.titular}</small>
                </div>
              </div>

              <div className="account-row-info">
                <span>Moneda</span>
                <strong>{cuenta.moneda}</strong>
              </div>

              <div className="account-row-info">
                <span>Saldo disponible</span>
                <strong>{formatoMoneda(cuenta.saldoDisponible)}</strong>
              </div>

              <div className="account-row-status">
                <span>{cuenta.estado}</span>
              </div>

              <button type="button" className="icon-action" title="Ver cuenta">
                <FiEye />
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default Cuentas