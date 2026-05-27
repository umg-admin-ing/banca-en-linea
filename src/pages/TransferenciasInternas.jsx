import { useEffect, useMemo, useState } from 'react'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiRefreshCw,
  FiRepeat,
} from 'react-icons/fi'
import { listarCuentas } from '../services/cuentaService'
import { registrarTransferenciaInterna } from '../services/transferenciaService'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor || 0))
}

function TransferenciasInternas() {
  const [cuentas, setCuentas] = useState([])
  const [formulario, setFormulario] = useState({
    cuentaOrigenId: '',
    numeroCuentaDestino: '',
    monto: '',
  })

  const [cargandoCuentas, setCargandoCuentas] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')
  const [transferenciaRegistrada, setTransferenciaRegistrada] = useState(null)

  const cargarCuentas = async () => {
    try {
      setCargandoCuentas(true)
      setError('')

      const cuentasApi = await listarCuentas()
      setCuentas(cuentasApi)
    } catch (errorCarga) {
      setError(
        errorCarga?.message ||
          'No se pudieron cargar las cuentas disponibles.',
      )
    } finally {
      setCargandoCuentas(false)
    }
  }

  useEffect(() => {
    cargarCuentas()
  }, [])

  const cuentaOrigen = useMemo(() => {
    return cuentas.find(
      (cuenta) => String(cuenta.idCuenta) === formulario.cuentaOrigenId,
    )
  }, [cuentas, formulario.cuentaOrigenId])

  const cuentaDestino = useMemo(() => {
    return cuentas.find(
      (cuenta) => cuenta.numeroCuenta === formulario.numeroCuentaDestino,
    )
  }, [cuentas, formulario.numeroCuentaDestino])

  const cuentasDestinoDisponibles = useMemo(() => {
    return cuentas.filter(
      (cuenta) => String(cuenta.idCuenta) !== formulario.cuentaOrigenId,
    )
  }, [cuentas, formulario.cuentaOrigenId])

  const montoNumerico = Number(formulario.monto || 0)

  const saldoPosterior = cuentaOrigen
    ? Number(cuentaOrigen.saldoDisponible || 0) - montoNumerico
    : 0

  const formularioValido =
    cuentaOrigen &&
    cuentaDestino &&
    montoNumerico > 0 &&
    cuentaOrigen.numeroCuenta !== cuentaDestino.numeroCuenta &&
    montoNumerico <= Number(cuentaOrigen.saldoDisponible || 0)

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    setFormulario((estadoActual) => {
      const nuevoEstado = {
        ...estadoActual,
        [name]: value,
      }

      if (name === 'cuentaOrigenId') {
        nuevoEstado.numeroCuentaDestino = ''
      }

      return nuevoEstado
    })

    setError('')
    setMensajeExito('')
    setTransferenciaRegistrada(null)
  }

  const limpiarFormulario = () => {
    setFormulario({
      cuentaOrigenId: '',
      numeroCuentaDestino: '',
      monto: '',
    })
    setError('')
    setMensajeExito('')
    setTransferenciaRegistrada(null)
  }

  const enviarTransferencia = async () => {
    if (!formularioValido) {
      setError(
        'Selecciona cuentas diferentes y asegúrate de que el monto sea mayor a cero y no supere el saldo disponible.',
      )
      return
    }

    try {
      setProcesando(true)
      setError('')
      setMensajeExito('')
      setTransferenciaRegistrada(null)

      const transferencia = await registrarTransferenciaInterna({
        cuentaOrigenId: Number(formulario.cuentaOrigenId),
        numeroCuentaDestino: formulario.numeroCuentaDestino,
        monto: montoNumerico,
      })

      setTransferenciaRegistrada(transferencia)
      setMensajeExito('Transferencia interna registrada correctamente.')

      await cargarCuentas()

      setFormulario({
        cuentaOrigenId: '',
        numeroCuentaDestino: '',
        monto: '',
      })
    } catch (errorRegistro) {
      setError(
        errorRegistro?.message ||
          'No se pudo registrar la transferencia interna.',
      )
    } finally {
      setProcesando(false)
    }
  }

  return (
    <section className="page-section" id="transferencias-internas">
      <div className="page-title">
        <div>
          <span className="eyebrow">Operaciones internas</span>
          <h1>Transferencias internas</h1>
          <p>
            Registra transferencias entre cuentas internas de NovaBank usando
            cuentas origen y destino disponibles.
          </p>
        </div>
      </div>

      <div className="summary-grid compact">
        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiRepeat />
            </span>
            <span>Tipo de operación</span>
          </div>

          <strong>Interna</strong>
          <small>Transferencia entre cuentas del sistema.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Cuentas disponibles</span>
          </div>

          <strong>{cuentas.length}</strong>
          <small>Cuentas cargadas desde el backend.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCheckCircle />
            </span>
            <span>Validación</span>
          </div>

          <strong>{formularioValido ? 'Lista' : 'Pendiente'}</strong>
          <small>
            Revisa cuenta origen, cuenta destino, saldo y monto antes de enviar.
          </small>
        </article>
      </div>

      {error && (
        <div className="notice-card warning">
          <FiAlertCircle />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {mensajeExito && (
        <div className="notice-card">
          <FiCheckCircle />
          <div>
            <strong>Operación exitosa</strong>
            <p>{mensajeExito}</p>
          </div>
        </div>
      )}

      <div className="transfer-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Nueva transferencia interna</h2>
              <p>Selecciona la cuenta origen, destino y monto a transferir.</p>
            </div>

            <span>Interna</span>
          </div>

          <form className="bank-form">
            <div className="form-grid">
              <label className="form-group full-row">
                <span>Cuenta origen</span>
                <select
                  name="cuentaOrigenId"
                  value={formulario.cuentaOrigenId}
                  onChange={manejarCambio}
                  disabled={cargandoCuentas || procesando}
                >
                  <option value="">
                    {cargandoCuentas
                      ? 'Cargando cuentas...'
                      : 'Selecciona una cuenta origen'}
                  </option>

                  {cuentas.map((cuenta) => (
                    <option key={cuenta.idCuenta} value={cuenta.idCuenta}>
                      {cuenta.tipoCuenta} · {cuenta.numeroCuenta} ·{' '}
                      {formatoMoneda(cuenta.saldoDisponible)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-group full-row">
                <span>Cuenta destino</span>
                <select
                  name="numeroCuentaDestino"
                  value={formulario.numeroCuentaDestino}
                  onChange={manejarCambio}
                  disabled={
                    cargandoCuentas ||
                    procesando ||
                    !formulario.cuentaOrigenId
                  }
                >
                  <option value="">
                    {!formulario.cuentaOrigenId
                      ? 'Selecciona primero la cuenta origen'
                      : 'Selecciona una cuenta destino'}
                  </option>

                  {cuentasDestinoDisponibles.map((cuenta) => (
                    <option
                      key={cuenta.idCuenta}
                      value={cuenta.numeroCuenta}
                    >
                      {cuenta.tipoCuenta} · {cuenta.numeroCuenta} ·{' '}
                      {formatoMoneda(cuenta.saldoDisponible)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-group">
                <span>Monto</span>
                <input
                  type="number"
                  name="monto"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formulario.monto}
                  onChange={manejarCambio}
                  disabled={procesando}
                />
              </label>

              <label className="form-group">
                <span>Moneda</span>
                <input type="text" value="GTQ" readOnly />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="outline-action"
                onClick={limpiarFormulario}
                disabled={procesando}
              >
                Limpiar
              </button>

              <button
                type="button"
                className="outline-action"
                onClick={cargarCuentas}
                disabled={procesando || cargandoCuentas}
              >
                <FiRefreshCw />
                Actualizar cuentas
              </button>

              <button
                type="button"
                className="primary-action"
                disabled={!formularioValido || procesando}
                onClick={enviarTransferencia}
              >
                <FiCheckCircle />
                {procesando ? 'Procesando...' : 'Confirmar transferencia'}
              </button>
            </div>
          </form>
        </section>

        <aside className="panel transfer-summary">
          <div className="panel-header">
            <div>
              <h2>Resumen</h2>
              <p>Verifica los datos antes de confirmar.</p>
            </div>
          </div>

          <div className="summary-route">
            <div>
              <span>Origen</span>
              <strong>{cuentaOrigen?.numeroCuenta || 'Pendiente'}</strong>
              <small>
                {cuentaOrigen
                  ? `${cuentaOrigen.tipoCuenta} · ${formatoMoneda(
                      cuentaOrigen.saldoDisponible,
                    )}`
                  : 'Selecciona cuenta'}
              </small>
            </div>

            <span className="route-icon">
              <FiRepeat />
            </span>

            <div>
              <span>Destino</span>
              <strong>{cuentaDestino?.numeroCuenta || 'Pendiente'}</strong>
              <small>
                {cuentaDestino
                  ? `${cuentaDestino.tipoCuenta} · Cliente ${cuentaDestino.idCliente}`
                  : 'Selecciona cuenta'}
              </small>
            </div>
          </div>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Monto a transferir</span>
              <strong>{formatoMoneda(montoNumerico)}</strong>
            </div>

            <div className="summary-line">
              <span>Saldo origen</span>
              <strong>
                {formatoMoneda(cuentaOrigen?.saldoDisponible || 0)}
              </strong>
            </div>

            <div className="summary-line total">
              <span>Saldo posterior estimado</span>
              <strong>
                {cuentaOrigen ? formatoMoneda(saldoPosterior) : 'GTQ 0.00'}
              </strong>
            </div>
          </div>

          {!formularioValido && (
            <div className="notice-card warning">
              <FiAlertCircle />
              <div>
                <strong>Validación pendiente</strong>
                <p>
                  Selecciona cuentas diferentes y asegúrate de que el monto sea
                  mayor a cero y no supere el saldo disponible.
                </p>
              </div>
            </div>
          )}

          {transferenciaRegistrada && (
            <div className="notice-card">
              <FiCheckCircle />
              <div>
                <strong>Transferencia registrada</strong>
                <p>
                  ID: {transferenciaRegistrada.idTransferencia} · Estado:{' '}
                  {transferenciaRegistrada.estado || 'Registrada'}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default TransferenciasInternas