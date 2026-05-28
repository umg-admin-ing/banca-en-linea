import { useEffect, useMemo, useState } from 'react'
import {
  FiCreditCard,
  FiEye,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi'
import { listarCuentasPorCliente } from '../services/cuentaService'

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
  }).format(new Date(fecha))
}

function obtenerClaseEstado(estado) {
  const estadoNormalizado = String(estado || '').toLowerCase()

  if (
    estadoNormalizado.includes('activa') ||
    estadoNormalizado.includes('activo')
  ) {
    return 'success'
  }

  return 'warning'
}

function obtenerTextoBusquedaCuenta(cuenta) {
  return [
    cuenta.idCuenta,
    cuenta.idCliente,
    cuenta.numeroCuenta,
    cuenta.tipoCuenta,
    cuenta.estado,
    cuenta.swiftBanco,
    cuenta.titular,
    cuenta.saldoDisponible,
    formatoMoneda(cuenta.saldoDisponible),
    formatearFecha(cuenta.createdAt),
  ]
    .join(' ')
    .toLowerCase()
}

function Cuentas({ usuario }) {
  const [cuentas, setCuentas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarCuentas = async () => {
    try {
      setCargando(true)
      setError('')

      if (!usuario?.idCliente) {
        setCuentas([])
        setError('El usuario actual no tiene cliente asociado.')
        return
      }

      const cuentasUsuario = await listarCuentasPorCliente(usuario.idCliente)
      setCuentas(cuentasUsuario)
    } catch (errorCarga) {
      setError(
        errorCarga?.message ||
          'No se pudieron cargar las cuentas del usuario.',
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCuentas()
  }, [usuario?.idCliente])

  const cuentasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    if (!termino) {
      return cuentas
    }

    return cuentas.filter((cuenta) =>
      obtenerTextoBusquedaCuenta(cuenta).includes(termino),
    )
  }, [busqueda, cuentas])

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

  return (
    <section className="page-section" id="cuentas">
      <div className="page-title">
        <div>
          <span className="eyebrow">Consulta personal</span>
          <h1>Mis cuentas bancarias</h1>
          <p>
            Revisa únicamente las cuentas asociadas al usuario autenticado.
          </p>
        </div>
      </div>

      <div className="summary-grid compact">
        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Total de cuentas</span>
          </div>

          <strong>{cuentas.length}</strong>
          <small>Cuentas asociadas a tu usuario.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Cuentas activas</span>
          </div>

          <strong>{cuentasActivas.length}</strong>
          <small>Cuentas disponibles para operaciones.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Saldo total</span>
          </div>

          <strong>{formatoMoneda(saldoTotal)}</strong>
          <small>Consolidado de tus cuentas activas.</small>
        </article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Listado de cuentas</h2>
            <p>
              Puedes buscar dentro de tus cuentas por número, tipo, estado,
              banco, saldo o fecha.
            </p>
          </div>

          <span>{cuentasFiltradas.length} registros</span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por número, tipo, estado, banco o saldo"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              className="toolbar-button"
              onClick={cargarCuentas}
              disabled={cargando}
            >
              <FiRefreshCw />
              {cargando ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="notice-card warning">
            <div>
              <strong>Error al cargar cuentas</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!error && cargando && (
          <div className="empty-state">
            <h2>Cargando cuentas</h2>
            <p>Consultando información desde el servidor.</p>
          </div>
        )}

        {!error && !cargando && cuentasFiltradas.length === 0 && (
          <div className="empty-state">
            <h2>Sin resultados</h2>
            <p>No se encontraron cuentas asociadas al usuario actual.</p>
          </div>
        )}

        {!error && !cargando && cuentasFiltradas.length > 0 && (
          <div className="cards-table">
            {cuentasFiltradas.map((cuenta) => (
              <article className="account-row" key={cuenta.idCuenta}>
                <div className="account-row-main">
                  <span className="account-row-icon">
                    <FiCreditCard />
                  </span>

                  <div>
                    <h3>{cuenta.tipoCuenta}</h3>
                    <p>{cuenta.numeroCuenta}</p>
                    <small>Cliente {cuenta.idCliente}</small>
                  </div>
                </div>

                <div className="account-row-info">
                  <span>Saldo</span>
                  <strong>{formatoMoneda(cuenta.saldoDisponible)}</strong>
                </div>

                <div className="account-row-info">
                  <span>Banco</span>
                  <strong>{cuenta.swiftBanco}</strong>
                </div>

                <div className="account-row-info">
                  <span>Creación</span>
                  <strong>{formatearFecha(cuenta.createdAt)}</strong>
                </div>

                <div className="account-row-status">
                  <span className={`status-badge ${obtenerClaseEstado(cuenta.estado)}`}>
                    {cuenta.estado}
                  </span>
                </div>

                <button
                  type="button"
                  className="icon-action"
                  title="Ver detalle"
                >
                  <FiEye />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default Cuentas