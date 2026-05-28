import { useEffect, useMemo, useState } from 'react'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiRefreshCw,
  FiRepeat,
} from 'react-icons/fi'
import { listarCuentasPorCliente } from '../services/cuentaService'
import { registrarTransferenciaInterna } from '../services/transferenciaService'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor || 0))
}

function TransferenciasInternas({ usuario }) {
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
      setCargandoCuentas(false)
    }
  }

  useEffect(() => {
    cargarCuentas()
  }, [usuario?.idCliente])

  const cuentaOrigen = useMemo(() => {
    return cuentas.find(
      (cuenta) => String(cuenta.idCuenta) === formulario.cuentaOrigenId,
    )
  }, [cuentas, formulario.cuentaOrigenId])

  const montoNumerico = Number(formulario.monto || 0)

  const numeroCuentaDestinoLimpio = formulario.numeroCuentaDestino.trim()

  const saldoPosterior = cuentaOrigen
    ? Number(cuentaOrigen.saldoDisponible || 0) - montoNumerico
    : 0

  const destinoEsMismaCuenta =
    cuentaOrigen?.numeroCuenta &&
    cuentaOrigen.numeroCuenta === numeroCuentaDestinoLimpio

  const formularioValido =
    cuentaOrigen &&
    numeroCuentaDestinoLimpio.length >= 6 &&
    !destinoEsMismaCuenta &&
    montoNumerico > 0 &&
    montoNumerico <= Number(cuentaOrigen.saldoDisponible || 0)

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }))

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
        'Selecciona una cuenta origen propia, ingresa una cuenta destino diferente y verifica que el monto sea válido.',
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
        numeroCuentaDestino: numeroCuentaDestinoLimpio,
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
          <span className="eyebrow">Operaciones personales</span>
          <h1>Transferencias internas</h1>
          <p>
            Registra transferencias desde tus cuentas hacia otra cuenta interna
            de NovaBank.
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
          <small>Transferencia entre cuentas de NovaBank.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Mis cuentas origen</span>
          </div>

          <strong>{cuentas.length}</strong>
          <small>Cuentas asociadas al usuario autenticado.</small>
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
              <p>
                Selecciona una de tus cuentas como origen e ingresa el número de
                cuenta destino.
              </p>
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
                      ? 'Cargando tus cuentas...'
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
                <input
                  type="text"
                  name="numeroCuentaDestino"
                  placeholder="Ingresa el número de cuenta destino"
                  value={formulario.numeroCuentaDestino}
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
                  : 'Selecciona una de tus cuentas'}
              </small>
            </div>

            <span className="route-icon">
              <FiRepeat />
            </span>

            <div>
              <span>Destino</span>
              <strong>{numeroCuentaDestinoLimpio || 'Pendiente'}</strong>
              <small>Cuenta interna destino</small>
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
                  Selecciona una cuenta origen propia, ingresa una cuenta destino
                  diferente y verifica que el monto no supere tu saldo
                  disponible.
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