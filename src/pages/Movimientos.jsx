import {
  FiActivity,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFilter,
  FiSearch,
} from 'react-icons/fi'
import { movimientos } from '../data/bancaData'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(valor)
}

function obtenerMovimientoIcono(monto) {
  if (monto < 0) {
    return <FiArrowUpRight />
  }

  return <FiArrowDownLeft />
}

function obtenerClaseMonto(monto) {
  return monto < 0 ? 'amount debit' : 'amount credit'
}

function obtenerClaseEstado(estado) {
  if (estado === 'Completada') {
    return 'status-badge success'
  }

  return 'status-badge warning'
}

function obtenerIconoEstado(estado) {
  if (estado === 'Completada') {
    return <FiCheckCircle />
  }

  return <FiClock />
}

function Movimientos() {
  const totalDebitos = movimientos
    .filter((movimiento) => movimiento.monto < 0)
    .reduce((total, movimiento) => total + Math.abs(movimiento.monto), 0)

  const totalCreditos = movimientos
    .filter((movimiento) => movimiento.monto > 0)
    .reduce((total, movimiento) => total + movimiento.monto, 0)

  const movimientosPendientes = movimientos.filter(
    (movimiento) => movimiento.estado !== 'Completada',
  )

  return (
    <section className="page-section" id="movimientos">
      <div className="page-title">
        <div>
          <span className="eyebrow">Historial bancario</span>
          <h1>Movimientos</h1>
          <p>
            Consulta débitos, créditos, transferencias internas y operaciones
            ACH registradas en las cuentas.
          </p>
        </div>
      </div>

      <div className="summary-grid compact">
        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiActivity />
            </span>
            <span>Total movimientos</span>
          </div>

          <strong>{movimientos.length}</strong>
          <small>Operaciones registradas en el historial.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiArrowDownLeft />
            </span>
            <span>Total créditos</span>
          </div>

          <strong>{formatoMoneda(totalCreditos)}</strong>
          <small>Entradas de dinero registradas.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiArrowUpRight />
            </span>
            <span>Total débitos</span>
          </div>

          <strong>{formatoMoneda(totalDebitos)}</strong>
          <small>Salidas de dinero registradas.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiClock />
            </span>
            <span>Pendientes</span>
          </div>

          <strong>{movimientosPendientes.length}</strong>
          <small>Operaciones pendientes o en proceso.</small>
        </article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Listado de movimientos</h2>
            <p>
              Revisa el detalle de cada operación registrada en la banca en
              línea.
            </p>
          </div>

          <span>{movimientos.length} registros</span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por tipo, cuenta, autorización o estado..."
            />
          </div>

          <div className="toolbar-actions">
            <button type="button" className="toolbar-button">
              <FiFilter />
              Filtros
            </button>

            <button type="button" className="toolbar-button primary">
              <FiDownload />
              Exportar
            </button>
          </div>
        </div>

        <div className="movements-table">
          {movimientos.map((movimiento) => (
            <article className="movement-row" key={movimiento.id}>
              <div className="movement-main">
                <span
                  className={
                    movimiento.monto < 0
                      ? 'movement-icon debit'
                      : 'movement-icon credit'
                  }
                >
                  {obtenerMovimientoIcono(movimiento.monto)}
                </span>

                <div>
                  <h3>{movimiento.tipo}</h3>
                  <p>{movimiento.descripcion}</p>
                  <small>
                    {movimiento.fecha} · {movimiento.autorizacion}
                  </small>
                </div>
              </div>

              <div className="movement-detail">
                <span>Cuenta origen</span>
                <strong>{movimiento.cuentaOrigen}</strong>
              </div>

              <div className="movement-detail">
                <span>Cuenta destino</span>
                <strong>{movimiento.cuentaDestino}</strong>
              </div>

              <div className="movement-amount">
                <span>Monto</span>
                <strong className={obtenerClaseMonto(movimiento.monto)}>
                  {formatoMoneda(movimiento.monto)}
                </strong>
              </div>

              <div className={obtenerClaseEstado(movimiento.estado)}>
                {obtenerIconoEstado(movimiento.estado)}
                <span>{movimiento.estado}</span>
              </div>

              <button
                type="button"
                className="icon-action"
                title="Ver movimiento"
              >
                <FiEye />
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default Movimientos