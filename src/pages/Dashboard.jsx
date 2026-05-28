import { useEffect, useMemo, useState } from 'react'
import {
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiRefreshCw,
  FiSend,
} from 'react-icons/fi'
import { listarCuentasPorCliente } from '../services/cuentaService'
import { listarMovimientosPorCuentas } from '../services/movimientoService'
import { listarTransferenciasAchPorCliente } from '../services/transferenciaService'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor || 0))
}

function obtenerReferencia(movimiento) {
  return movimiento.referencia || `MOV-${movimiento.idMovimiento}`
}

function esMismaFecha(fechaA, fechaB) {
  if (!fechaA || !fechaB) {
    return false
  }

  const primeraFecha = new Date(fechaA)
  const segundaFecha = new Date(fechaB)

  return (
    primeraFecha.getFullYear() === segundaFecha.getFullYear() &&
    primeraFecha.getMonth() === segundaFecha.getMonth() &&
    primeraFecha.getDate() === segundaFecha.getDate()
  )
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

function formatearFechaCorta(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

function Dashboard({ usuario }) {
  const [tarjetaAbierta, setTarjetaAbierta] = useState('')
  const [cuentas, setCuentas] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [transferenciasAch, setTransferenciasAch] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarDatos = async () => {
    try {
      setCargando(true)
      setError('')

      if (!usuario?.idCliente) {
        setCuentas([])
        setMovimientos([])
        setTransferenciasAch([])
        setError('El usuario actual no tiene cliente asociado.')
        return
      }

      const cuentasUsuario = await listarCuentasPorCliente(usuario.idCliente)
      const [movimientosUsuario, achUsuario] = await Promise.all([
        listarMovimientosPorCuentas(cuentasUsuario),
        listarTransferenciasAchPorCliente(usuario.idCliente),
      ])

      setCuentas(cuentasUsuario)
      setMovimientos(movimientosUsuario)
      setTransferenciasAch(achUsuario)
    } catch (errorCarga) {
      setError(
        errorCarga?.message ||
          'No se pudo cargar la información del dashboard.',
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [usuario?.idCliente])

  const cuentasActivas = useMemo(
    () =>
      cuentas.filter((cuenta) =>
        String(cuenta.estado || '').toLowerCase().includes('activ'),
      ),
    [cuentas],
  )

  const saldoTotal = useMemo(
    () =>
      cuentasActivas.reduce(
        (total, cuenta) => total + Number(cuenta.saldoDisponible || 0),
        0,
      ),
    [cuentasActivas],
  )

  const movimientosOrdenados = useMemo(() => {
    return [...movimientos].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [movimientos])

  const movimientosHoy = useMemo(() => {
    const hoy = new Date()

    return movimientosOrdenados.filter((movimiento) =>
      esMismaFecha(movimiento.createdAt, hoy),
    )
  }, [movimientosOrdenados])

  const transferenciasAchOrdenadas = useMemo(() => {
    return [...transferenciasAch].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [transferenciasAch])

  const alternarTarjeta = (tarjeta) => {
    setTarjetaAbierta((tarjetaActual) =>
      tarjetaActual === tarjeta ? '' : tarjeta,
    )
  }

  return (
    <section className="dashboard">
      <div className="page-title">
        <div>
          <span className="eyebrow">Resumen personal</span>
          <h1>Dashboard bancario</h1>
          <p>
            Consulta rápida de tus cuentas, saldos, movimientos y operaciones
            ACH.
          </p>
        </div>
      </div>

      {error && (
        <div className="notice-card warning">
          <div>
            <strong>Error al cargar información</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

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
              <span className="summary-label">Mis cuentas activas</span>
              <strong>{cargando ? '...' : cuentasActivas.length}</strong>
              <small>Haz clic para ver el detalle</small>
            </span>

            <FiChevronDown className="summary-chevron" />
          </button>

          {tarjetaAbierta === 'cuentas' && (
            <div className="summary-detail">
              {cargando && (
                <div className="empty-state">
                  <h2>Cargando cuentas</h2>
                  <p>Consultando tus cuentas.</p>
                </div>
              )}

              {!cargando && cuentasActivas.length === 0 && (
                <div className="empty-state">
                  <h2>Sin cuentas activas</h2>
                  <p>No hay cuentas activas asociadas a tu usuario.</p>
                </div>
              )}

              {!cargando && cuentasActivas.length > 0 && (
                <div className="mini-list dashboard-scroll-list">
                  {cuentasActivas.map((cuenta) => (
                    <div className="mini-list-item" key={cuenta.idCuenta}>
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
              )}
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
              <span className="summary-label">Mi saldo total</span>
              <strong>{cargando ? '...' : formatoMoneda(saldoTotal)}</strong>
              <small>Consolidado de tus cuentas activas</small>
            </span>

            <FiChevronDown className="summary-chevron" />
          </button>

          {tarjetaAbierta === 'saldo' && (
            <div className="summary-detail">
              {cargando && (
                <div className="empty-state">
                  <h2>Cargando saldos</h2>
                  <p>Consultando información del servidor.</p>
                </div>
              )}

              {!cargando && (
                <div className="mini-list dashboard-scroll-list">
                  {cuentasActivas.map((cuenta) => (
                    <div className="mini-list-item" key={cuenta.idCuenta}>
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
              )}
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
              <span className="summary-label">Mis transacciones hoy</span>
              <strong>{cargando ? '...' : movimientosHoy.length}</strong>
              <small>Operaciones registradas hoy</small>
            </span>

            <FiChevronDown className="summary-chevron" />
          </button>

          {tarjetaAbierta === 'movimientos' && (
            <div className="summary-detail">
              {!cargando && movimientosHoy.length === 0 && (
                <div className="empty-state">
                  <h2>Sin movimientos hoy</h2>
                  <p>No hay operaciones registradas hoy en tus cuentas.</p>
                </div>
              )}

              {!cargando && movimientosHoy.length > 0 && (
                <div className="mini-list dashboard-scroll-list">
                  {movimientosHoy.map((movimiento) => (
                    <div
                      className="mini-list-item dashboard-mini-movement"
                      key={movimiento.idMovimiento}
                    >
                      <div>
                        <strong title={movimiento.tipo}>{movimiento.tipo}</strong>
                        <small title={movimiento.descripcion}>
                          {movimiento.descripcion}
                        </small>
                        <small>
                          {formatearFechaCorta(movimiento.createdAt)} ·{' '}
                          {obtenerReferencia(movimiento)}
                        </small>
                      </div>

                      <span
                        className={`mini-amount ${obtenerClaseMonto(
                          movimiento,
                        )}`}
                      >
                        {formatoMoneda(movimiento.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
              <span className="summary-label">Mis operaciones ACH</span>
              <strong>{cargando ? '...' : transferenciasAchOrdenadas.length}</strong>
              <small>Transferencias ACH asociadas a tu usuario</small>
            </span>

            <FiChevronDown className="summary-chevron" />
          </button>

          {tarjetaAbierta === 'ach' && (
            <div className="summary-detail">
              {!cargando && transferenciasAchOrdenadas.length === 0 && (
                <div className="empty-state">
                  <h2>Sin operaciones ACH</h2>
                  <p>No hay transferencias ACH asociadas a tu usuario.</p>
                </div>
              )}

              {!cargando && transferenciasAchOrdenadas.length > 0 && (
                <div className="mini-list dashboard-scroll-list">
                  {transferenciasAchOrdenadas.map((transferencia) => (
                    <div
                      className="mini-list-item dashboard-mini-movement"
                      key={transferencia.idTransferencia}
                    >
                      <div>
                        <strong title={transferencia.tipo}>
                          {transferencia.tipo}
                        </strong>
                        <small>{transferencia.transactionId}</small>
                        <small>
                          {formatearFechaCorta(transferencia.createdAt)} ·{' '}
                          {transferencia.estado || 'Registrada'}
                        </small>
                      </div>

                      <span className="mini-amount debit">
                        {formatoMoneda(transferencia.monto)}
                      </span>
                    </div>
                  ))}
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
              <h2>Mis cuentas disponibles</h2>
              <p>Primeras cuentas activas asociadas a tu usuario.</p>
            </div>

            <span>{cuentasActivas.length} registros</span>
          </div>

          {!cargando && cuentasActivas.length === 0 && (
            <div className="empty-state">
              <h2>Sin cuentas activas</h2>
              <p>No hay cuentas activas disponibles.</p>
            </div>
          )}

          {!cargando && cuentasActivas.length > 0 && (
            <div className="account-list">
              {cuentasActivas.slice(0, 5).map((cuenta) => (
                <article className="account-card" key={cuenta.idCuenta}>
                  <div>
                    <h3>{cuenta.tipoCuenta}</h3>
                    <p>{cuenta.numeroCuenta}</p>
                    <small>Cliente {cuenta.idCliente}</small>
                  </div>

                  <div className="account-balance">
                    <strong>{formatoMoneda(cuenta.saldoDisponible)}</strong>
                    <span>{cuenta.estado}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Mis movimientos recientes</h2>
              <p>Últimas operaciones registradas en tus cuentas.</p>
            </div>

            <span>{movimientosOrdenados.length} registros</span>
          </div>

          {!cargando && movimientosOrdenados.length === 0 && (
            <div className="empty-state">
              <h2>Sin movimientos</h2>
              <p>No hay operaciones registradas en tus cuentas.</p>
            </div>
          )}

          {!cargando && movimientosOrdenados.length > 0 && (
            <div className="movement-list">
              {movimientosOrdenados.slice(0, 5).map((movimiento) => (
                <article className="movement-item" key={movimiento.idMovimiento}>
                  <div>
                    <h3>{movimiento.tipo}</h3>
                    <p>{movimiento.descripcion}</p>
                    <small>
                      {formatearFechaCorta(movimiento.createdAt)} ·{' '}
                      {obtenerReferencia(movimiento)}
                    </small>
                  </div>

                  <strong
                    className={`amount ${obtenerClaseMonto(movimiento)}`}
                  >
                    {formatoMoneda(movimiento.monto)}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <button
        type="button"
        className="toolbar-button"
        onClick={cargarDatos}
        disabled={cargando}
      >
        <FiRefreshCw />
        {cargando ? 'Actualizando...' : 'Actualizar información'}
      </button>
    </section>
  )
}

export default Dashboard