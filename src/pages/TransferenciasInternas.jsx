import { useMemo, useState } from 'react'
import {
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiRepeat,
  FiShield,
} from 'react-icons/fi'
import { cuentas } from '../data/bancaData'

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(valor)
}

function TransferenciasInternas() {
  const [formulario, setFormulario] = useState({
    cuentaOrigen: '',
    cuentaDestino: '',
    monto: '',
    concepto: '',
  })

  const cuentaOrigen = cuentas.find(
    (cuenta) => String(cuenta.id) === formulario.cuentaOrigen,
  )

  const cuentaDestino = cuentas.find(
    (cuenta) => String(cuenta.id) === formulario.cuentaDestino,
  )

  const montoNumerico = Number(formulario.monto || 0)

  const saldoPosterior = useMemo(() => {
    if (!cuentaOrigen || !montoNumerico) {
      return cuentaOrigen?.saldoDisponible || 0
    }

    return cuentaOrigen.saldoDisponible - montoNumerico
  }, [cuentaOrigen, montoNumerico])

  const formularioValido =
    cuentaOrigen &&
    cuentaDestino &&
    formulario.cuentaOrigen !== formulario.cuentaDestino &&
    montoNumerico > 0 &&
    montoNumerico <= cuentaOrigen.saldoDisponible

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }))
  }

  return (
    <section className="page-section" id="transferencias">
      <div className="page-title">
        <div>
          <span className="eyebrow">Operaciones internas</span>
          <h1>Transferencias internas</h1>
          <p>
            Realiza transferencias entre cuentas registradas dentro del mismo
            banco.
          </p>
        </div>
      </div>

      <div className="summary-grid compact">
        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Cuentas disponibles</span>
          </div>

          <strong>{cuentas.length}</strong>
          <small>Cuentas habilitadas para operaciones internas.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiRepeat />
            </span>
            <span>Tipo de operación</span>
          </div>

          <strong>Interna</strong>
          <small>Movimiento entre cuentas del mismo banco.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiShield />
            </span>
            <span>Validación</span>
          </div>

          <strong>Activa</strong>
          <small>El monto se valida contra el saldo disponible.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiLock />
            </span>
            <span>Autorización</span>
          </div>

          <strong>Requerida</strong>
          <small>La confirmación final debe validarse desde backend.</small>
        </article>
      </div>

      <div className="transfer-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Nueva transferencia</h2>
              <p>Completa la información de origen, destino y monto.</p>
            </div>

            <span>Interna</span>
          </div>

          <form className="bank-form">
            <div className="form-grid">
              <label className="form-group">
                <span>Cuenta origen</span>
                <select
                  name="cuentaOrigen"
                  value={formulario.cuentaOrigen}
                  onChange={manejarCambio}
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.tipoCuenta} · {cuenta.numeroCuenta}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-group">
                <span>Cuenta destino</span>
                <select
                  name="cuentaDestino"
                  value={formulario.cuentaDestino}
                  onChange={manejarCambio}
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.tipoCuenta} · {cuenta.numeroCuenta}
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
                />
              </label>

              <label className="form-group">
                <span>Moneda</span>
                <input type="text" value="GTQ" readOnly />
              </label>

              <label className="form-group full-row">
                <span>Concepto</span>
                <textarea
                  name="concepto"
                  rows="4"
                  placeholder="Ejemplo: traslado entre cuentas propias"
                  value={formulario.concepto}
                  onChange={manejarCambio}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="outline-action">
                Limpiar
              </button>

              <button
                type="button"
                className="primary-action"
                disabled={!formularioValido}
              >
                <FiCheckCircle />
                Confirmar transferencia
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
              <small>{cuentaOrigen?.tipoCuenta || 'Selecciona cuenta'}</small>
            </div>

            <span className="route-icon">
              <FiArrowRight />
            </span>

            <div>
              <span>Destino</span>
              <strong>{cuentaDestino?.numeroCuenta || 'Pendiente'}</strong>
              <small>{cuentaDestino?.tipoCuenta || 'Selecciona cuenta'}</small>
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
              <span>Saldo posterior</span>
              <strong>{formatoMoneda(saldoPosterior)}</strong>
            </div>
          </div>

          {!formularioValido && (
            <div className="notice-card warning">
              <strong>Validación pendiente</strong>
              <p>
                Selecciona cuentas diferentes y asegúrate de que el monto sea
                mayor a cero y no supere el saldo disponible.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default TransferenciasInternas