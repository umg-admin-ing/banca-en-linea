import { useEffect, useMemo, useState } from 'react'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiRefreshCw,
  FiSend,
  FiUserCheck,
} from 'react-icons/fi'
import { listarCuentas } from '../services/cuentaService'
import { registrarTransferenciaAchSaliente } from '../services/transferenciaService'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor || 0))
}

function TransferenciasACH() {
  const [cuentas, setCuentas] = useState([])
  const [formulario, setFormulario] = useState({
    cuentaOrigenId: '',
    cuentaDestino: '',
    swiftDestino: '',
    monto: '',
    descripcion: '',
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

  const montoNumerico = Number(formulario.monto || 0)

  const swiftOrigenValido =
    cuentaOrigen?.swiftBanco && cuentaOrigen.swiftBanco !== 'N/A'

  const formularioValido =
    cuentaOrigen &&
    swiftOrigenValido &&
    formulario.cuentaDestino.trim().length >= 6 &&
    formulario.swiftDestino.trim().length >= 3 &&
    formulario.descripcion.trim().length >= 3 &&
    montoNumerico > 0 &&
    montoNumerico <= Number(cuentaOrigen.saldoDisponible || 0)

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: name === 'swiftDestino' ? value.toUpperCase() : value,
    }))

    setError('')
    setMensajeExito('')
    setTransferenciaRegistrada(null)
  }

  const limpiarFormulario = () => {
    setFormulario({
      cuentaOrigenId: '',
      cuentaDestino: '',
      swiftDestino: '',
      monto: '',
      descripcion: '',
    })

    setError('')
    setMensajeExito('')
    setTransferenciaRegistrada(null)
  }

  const enviarTransferencia = async () => {
    if (!formularioValido) {
      setError(
        'Completa la cuenta origen, cuenta destino, SWIFT destino, descripción y verifica que el monto sea válido.',
      )
      return
    }

    try {
      setProcesando(true)
      setError('')
      setMensajeExito('')
      setTransferenciaRegistrada(null)

      const transferencia = await registrarTransferenciaAchSaliente({
        cuentaOrigen: cuentaOrigen.numeroCuenta,
        swiftOrigen: cuentaOrigen.swiftBanco,
        cuentaDestino: formulario.cuentaDestino.trim(),
        swiftDestino: formulario.swiftDestino.trim(),
        monto: montoNumerico,
        descripcion: formulario.descripcion.trim(),
      })

      setTransferenciaRegistrada(transferencia)
      setMensajeExito('Transferencia ACH registrada correctamente.')

      await cargarCuentas()

      setFormulario({
        cuentaOrigenId: '',
        cuentaDestino: '',
        swiftDestino: '',
        monto: '',
        descripcion: '',
      })
    } catch (errorRegistro) {
      setError(
        errorRegistro?.message ||
          'No se pudo registrar la transferencia ACH.',
      )
    } finally {
      setProcesando(false)
    }
  }

  return (
    <section className="page-section" id="ach">
      <div className="page-title">
        <div>
          <span className="eyebrow">Operaciones externas</span>
          <h1>Transferencias ACH</h1>
          <p>
            Registra transferencias salientes hacia cuentas de otros bancos
            usando cuenta origen, SWIFT destino y monto.
          </p>
        </div>
      </div>

      <div className="summary-grid compact">
        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiSend />
            </span>
            <span>Tipo de operación</span>
          </div>

          <strong>ACH</strong>
          <small>Transferencia interbancaria saliente.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Cuentas origen</span>
          </div>

          <strong>{cuentas.length}</strong>
          <small>Cuentas cargadas desde el backend.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiUserCheck />
            </span>
            <span>Validación</span>
          </div>

          <strong>{formularioValido ? 'Lista' : 'Pendiente'}</strong>
          <small>Revisa cuenta, SWIFT, monto y descripción.</small>
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
              <h2>Nueva transferencia ACH</h2>
              <p>Completa los datos requeridos para registrar la operación.</p>
            </div>

            <span>Saliente</span>
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
                      {formatoMoneda(cuenta.saldoDisponible)} · SWIFT{' '}
                      {cuenta.swiftBanco}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-group">
                <span>Cuenta destino</span>
                <input
                  type="text"
                  name="cuentaDestino"
                  placeholder="Ejemplo: 4455667788"
                  value={formulario.cuentaDestino}
                  onChange={manejarCambio}
                  disabled={procesando}
                />
              </label>

              <label className="form-group">
                <span>SWIFT destino</span>
                <input
                  type="text"
                  name="swiftDestino"
                  placeholder="Ejemplo: BACCGTGC"
                  value={formulario.swiftDestino}
                  onChange={manejarCambio}
                  disabled={procesando}
                />
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

              <label className="form-group full-row">
                <span>Descripción</span>
                <textarea
                  name="descripcion"
                  rows="4"
                  placeholder="Ejemplo: pago a proveedor externo"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  disabled={procesando}
                />
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
                {procesando ? 'Procesando...' : 'Confirmar ACH'}
              </button>
            </div>
          </form>
        </section>

        <aside className="panel transfer-summary">
          <div className="panel-header">
            <div>
              <h2>Resumen ACH</h2>
              <p>Verifica los datos antes de confirmar.</p>
            </div>
          </div>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Cuenta origen</span>
              <strong>{cuentaOrigen?.numeroCuenta || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>SWIFT origen</span>
              <strong>{cuentaOrigen?.swiftBanco || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Cuenta destino</span>
              <strong>{formulario.cuentaDestino || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>SWIFT destino</span>
              <strong>{formulario.swiftDestino || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Descripción</span>
              <strong>{formulario.descripcion || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Saldo origen</span>
              <strong>
                {formatoMoneda(cuentaOrigen?.saldoDisponible || 0)}
              </strong>
            </div>

            <div className="summary-line total">
              <span>Monto a transferir</span>
              <strong>{formatoMoneda(montoNumerico)}</strong>
            </div>
          </div>

          {!formularioValido && (
            <div className="notice-card warning">
              <FiAlertCircle />
              <div>
                <strong>Validación pendiente</strong>
                <p>
                  Completa todos los campos requeridos y verifica que el monto no
                  supere el saldo disponible.
                </p>
              </div>
            </div>
          )}

          {transferenciaRegistrada && (
            <div className="notice-card">
              <FiCheckCircle />
              <div>
                <strong>ACH registrada</strong>
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

export default TransferenciasACH