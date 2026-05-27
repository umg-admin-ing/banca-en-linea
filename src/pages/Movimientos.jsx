import { useEffect, useMemo, useState } from 'react'
import {
  FiActivity,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiDownload,
  FiEye,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi'
import { listarCuentas } from '../services/cuentaService'
import { listarMovimientos } from '../services/movimientoService'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor || 0))
}

function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

function esMovimientoDebito(movimiento) {
  const tipo = String(movimiento.tipo || '').toLowerCase()

  return (
    Number(movimiento.monto) < 0 ||
    tipo.includes('debito') ||
    tipo.includes('débito') ||
    tipo.includes('retiro') ||
    tipo.includes('salida') ||
    tipo.includes('transferencia_externa') ||
    tipo.includes('retencion')
  )
}

function obtenerClaseMonto(movimiento) {
  return esMovimientoDebito(movimiento) ? 'debit' : 'credit'
}

function obtenerTextoOperacion(movimiento) {
  return esMovimientoDebito(movimiento) ? 'Débito' : 'Crédito'
}

function obtenerTextoBusquedaMovimiento(movimiento, cuenta) {
  return [
    movimiento.idMovimiento,
    movimiento.idCuenta,
    movimiento.tipo,
    movimiento.descripcion,
    movimiento.referencia,
    movimiento.monto,
    movimiento.saldoResultante,
    formatearFecha(movimiento.createdAt),
    cuenta?.numeroCuenta,
    cuenta?.tipoCuenta,
    cuenta?.swiftBanco,
    cuenta?.idCliente,
  ]
    .join(' ')
    .toLowerCase()
}

function Movimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError('')

      const [movimientosApi, cuentasApi] = await Promise.all([
        listarMovimientos(),
        listarCuentas(),
      ])

      setMovimientos(movimientosApi)
      setCuentas(cuentasApi)
    } catch (errorCarga) {
      setError(
        errorCarga?.message ||
          'No se pudieron cargar los movimientos desde el servidor.',
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const cuentasPorId = useMemo(() => {
    return cuentas.reduce((acumulador, cuenta) => {
      acumulador[cuenta.idCuenta] = cuenta
      return acumulador
    }, {})
  }, [cuentas])

  const movimientosOrdenados = useMemo(() => {
    return [...movimientos].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [movimientos])

  const movimientosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    if (!termino) {
      return movimientosOrdenados
    }

    return movimientosOrdenados.filter((movimiento) => {
      const cuenta = cuentasPorId[movimiento.idCuenta]
      return obtenerTextoBusquedaMovimiento(movimiento, cuenta).includes(termino)
    })
  }, [busqueda, movimientosOrdenados, cuentasPorId])

  const totalDebitos = useMemo(
    () =>
      movimientos.filter((movimiento) => esMovimientoDebito(movimiento))
        .length,
    [movimientos],
  )

  const totalCreditos = useMemo(
    () =>
      movimientos.filter((movimiento) => !esMovimientoDebito(movimiento))
        .length,
    [movimientos],
  )

  const montoMovido = useMemo(
    () =>
      movimientos.reduce(
        (total, movimiento) => total + Math.abs(Number(movimiento.monto || 0)),
        0,
      ),
    [movimientos],
  )

  return (
    <section className="page-section" id="movimientos">
      <div className="page-title">
        <div>
          <span className="eyebrow">Historial operativo</span>
          <h1>Movimientos bancarios</h1>
          <p>
            Consulta depósitos, retiros, transferencias y operaciones
            registradas en las cuentas.
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
          <small>Operaciones registradas.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiArrowDownCircle />
            </span>
            <span>Débitos</span>
          </div>

          <strong>{totalDebitos}</strong>
          <small>Salidas o cargos registrados.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiArrowUpCircle />
            </span>
            <span>Créditos</span>
          </div>

          <strong>{totalCreditos}</strong>
          <small>Entradas o abonos registrados.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiActivity />
            </span>
            <span>Monto operado</span>
          </div>

          <strong>{formatoMoneda(montoMovido)}</strong>
          <small>Suma absoluta de movimientos.</small>
        </article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Listado de movimientos</h2>
            <p>Revisa el detalle de cada operación registrada.</p>
          </div>

          <span>{movimientosFiltrados.length} registros</span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por tipo, cuenta, referencia, cliente o descripción"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              className="toolbar-button"
              onClick={cargarDatos}
              disabled={cargando}
            >
              <FiRefreshCw />
              {cargando ? 'Cargando...' : 'Actualizar'}
            </button>

            <button type="button" className="toolbar-button">
              <FiDownload />
              Exportar
            </button>
          </div>
        </div>

        {error && (
          <div className="notice-card warning">
            <div>
              <strong>Error al cargar movimientos</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!error && cargando && (
          <div className="empty-state">
            <h2>Cargando movimientos</h2>
            <p>Consultando información desde el servidor.</p>
          </div>
        )}

        {!error && !cargando && movimientosFiltrados.length === 0 && (
          <div className="empty-state">
            <h2>Sin resultados</h2>
            <p>No se encontraron movimientos con los filtros actuales.</p>
          </div>
        )}

        {!error && !cargando && movimientosFiltrados.length > 0 && (
          <div className="movements-table">
            {movimientosFiltrados.map((movimiento) => {
              const cuenta = cuentasPorId[movimiento.idCuenta]

              return (
                <article className="movement-row" key={movimiento.idMovimiento}>
                  <div className="movement-main">
                    <span
                      className={`movement-icon ${obtenerClaseMonto(
                        movimiento,
                      )}`}
                    >
                      {esMovimientoDebito(movimiento) ? (
                        <FiArrowDownCircle />
                      ) : (
                        <FiArrowUpCircle />
                      )}
                    </span>

                    <div>
                      <h3 title={movimiento.tipo}>{movimiento.tipo}</h3>
                      <p title={movimiento.descripcion}>
                        {movimiento.descripcion}
                      </p>
                      <small>{formatearFecha(movimiento.createdAt)}</small>
                    </div>
                  </div>

                  <div className="movement-meta-grid">
                    <div className="movement-detail">
                      <span>Cuenta</span>
                      <strong>
                        {cuenta?.numeroCuenta ||
                          `Cuenta ID ${movimiento.idCuenta}`}
                      </strong>
                    </div>

                    <div className="movement-detail">
                      <span>Referencia</span>
                      <strong title={movimiento.referencia}>
                        {movimiento.referencia}
                      </strong>
                    </div>
                  </div>

                  <div className="movement-amount-box">
                    <div className="movement-amount">
                      <span>Monto</span>
                      <strong
                        className={`amount ${obtenerClaseMonto(movimiento)}`}
                      >
                        {formatoMoneda(movimiento.monto)}
                      </strong>
                    </div>

                    <div className="movement-amount">
                      <span>Saldo resultante</span>
                      <strong>
                        {formatoMoneda(movimiento.saldoResultante)}
                      </strong>
                    </div>
                  </div>

                  <span className={`status-badge ${obtenerClaseMonto(movimiento) === 'debit' ? 'warning' : 'success'}`}>
                    {obtenerTextoOperacion(movimiento)}
                  </span>

                  <button
                    type="button"
                    className="icon-action"
                    title="Ver detalle"
                  >
                    <FiEye />
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </section>
  )
}

export default Movimientos