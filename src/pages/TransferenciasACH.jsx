import { useEffect, useMemo, useState } from 'react'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiRefreshCw,
  FiSend,
  FiUserCheck,
} from 'react-icons/fi'
import { listarBancos } from '../services/bancoService'
import { listarCuentasPorCliente } from '../services/cuentaService'
import { registrarTransferenciaAchSaliente } from '../services/transferenciaService'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor || 0))
}

function TransferenciasACH({ usuario }) {
  const [cuentas, setCuentas] = useState([])
  const [bancos, setBancos] = useState([])

  const [formulario, setFormulario] = useState({
    cuentaOrigenId: '',
    swiftDestino: '',
    cuentaDestino: '',
    monto: '',
    descripcion: '',
  })

  const [cargandoCuentas, setCargandoCuentas] = useState(true)
  const [cargandoBancos, setCargandoBancos] = useState(true)
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

  const cargarBancos = async () => {
    try {
      setCargandoBancos(true)
      setError('')

      const bancosApi = await listarBancos()
      setBancos(bancosApi)
    } catch (errorCarga) {
      setError(
        errorCarga?.message ||
          'No se pudieron cargar los bancos disponibles.',
      )
    } finally {
      setCargandoBancos(false)
    }
  }

  const cargarDatos = async () => {
    await Promise.all([cargarCuentas(), cargarBancos()])
  }

  useEffect(() => {
    cargarDatos()
  }, [usuario?.idCliente])

  const cuentaOrigen = useMemo(() => {
    return cuentas.find(
      (cuenta) => String(cuenta.idCuenta) === formulario.cuentaOrigenId,
    )
  }, [cuentas, formulario.cuentaOrigenId])

  const bancoDestino = useMemo(() => {
    return bancos.find((banco) => banco.swift === formulario.swiftDestino)
  }, [bancos, formulario.swiftDestino])

  const montoNumerico = Number(formulario.monto || 0)

  const cuentaDestinoLimpia = formulario.cuentaDestino.trim()
  const descripcionLimpia = formulario.descripcion.trim()

  const swiftOrigenValido =
    cuentaOrigen?.swiftBanco && cuentaOrigen.swiftBanco !== 'N/A'

  const formularioValido =
    cuentaOrigen &&
    swiftOrigenValido &&
    bancoDestino &&
    cuentaDestinoLimpia.length >= 6 &&
    descripcionLimpia.length >= 3 &&
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
      swiftDestino: '',
      cuentaDestino: '',
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
        'Selecciona una cuenta origen propia, banco destino, cuenta destino, descripción y verifica que el monto sea válido.',
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
        cuentaDestino: cuentaDestinoLimpia,
        swiftDestino: bancoDestino.swift,
        monto: montoNumerico,
        descripcion: descripcionLimpia,
      })

      setTransferenciaRegistrada(transferencia)
      setMensajeExito('Transferencia ACH registrada correctamente.')

      await cargarCuentas()

      setFormulario({
        cuentaOrigenId: '',
        swiftDestino: '',
        cuentaDestino: '',
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
          <span className="eyebrow">Operaciones personales externas</span>
          <h1>Transferencias ACH</h1>
          <p>
            Registra transferencias salientes desde tus cuentas hacia cuentas de
            otros bancos.
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
            <span>Mis cuentas origen</span>
          </div>

          <strong>{cuentas.length}</strong>
          <small>Cuentas asociadas al usuario autenticado.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiUserCheck />
            </span>
            <span>Bancos disponibles</span>
          </div>

          <strong>{bancos.length}</strong>
          <small>Bancos externos.</small>
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
              <p>
                Selecciona una cuenta propia como origen, el banco destino y la
                cuenta a la que deseas transferir.
              </p>
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
                      ? 'Cargando tus cuentas...'
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
                <span>Banco destino</span>
                <select
                  name="swiftDestino"
                  value={formulario.swiftDestino}
                  onChange={manejarCambio}
                  disabled={cargandoBancos || procesando}
                >
                  <option value="">
                    {cargandoBancos
                      ? 'Cargando bancos...'
                      : 'Selecciona banco destino'}
                  </option>

                  {bancos.map((banco) => (
                    <option key={banco.swift} value={banco.swift}>
                      {banco.nombre} · {banco.swift}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-group">
                <span>Cuenta destino</span>
                <input
                  type="text"
                  name="cuentaDestino"
                  placeholder="Ingresa número de cuenta destino"
                  value={formulario.cuentaDestino}
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
                onClick={cargarDatos}
                disabled={procesando || cargandoCuentas || cargandoBancos}
              >
                <FiRefreshCw />
                Actualizar datos
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
              <span>Banco destino</span>
              <strong>{bancoDestino?.nombre || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>SWIFT destino</span>
              <strong>{bancoDestino?.swift || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Cuenta destino</span>
              <strong>{cuentaDestinoLimpia || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Descripción</span>
              <strong>{descripcionLimpia || 'Pendiente'}</strong>
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
                  Selecciona una cuenta propia, banco destino, cuenta destino y
                  verifica que el monto no supere tu saldo disponible.
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