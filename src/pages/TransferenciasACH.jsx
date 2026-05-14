import { useMemo, useState } from 'react'
import {
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiSend,
  FiShield,
  FiUserCheck,
} from 'react-icons/fi'
import { cuentas } from '../data/bancaData'

const bancosDestino = [
  {
    id: 'bi',
    nombre: 'Banco Industrial',
    codigo: 'BI',
  },
  {
    id: 'banrural',
    nombre: 'Banrural',
    codigo: 'BR',
  },
  {
    id: 'bam',
    nombre: 'BAM',
    codigo: 'BAM',
  },
  {
    id: 'bac',
    nombre: 'BAC Credomatic',
    codigo: 'BAC',
  },
]

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(valor)
}

function TransferenciasACH() {
  const [formulario, setFormulario] = useState({
    cuentaOrigen: '',
    bancoDestino: '',
    cuentaDestino: '',
    nombreBeneficiario: '',
    monto: '',
    descripcion: '',
  })

  const cuentaOrigen = cuentas.find(
    (cuenta) => String(cuenta.id) === formulario.cuentaOrigen,
  )

  const bancoSeleccionado = bancosDestino.find(
    (banco) => banco.id === formulario.bancoDestino,
  )

  const montoNumerico = Number(formulario.monto || 0)

  const comision = useMemo(() => {
    if (montoNumerico <= 0) {
      return 0
    }

    return 5
  }, [montoNumerico])

  const totalDebitar = montoNumerico + comision

  const formularioValido =
    cuentaOrigen &&
    bancoSeleccionado &&
    formulario.cuentaDestino.trim().length >= 6 &&
    formulario.nombreBeneficiario.trim().length >= 3 &&
    montoNumerico > 0 &&
    totalDebitar <= cuentaOrigen.saldoDisponible

  const manejarCambio = (evento) => {
    const { name, value } = evento.target

    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }))
  }

  const seleccionarBanco = (idBanco) => {
    setFormulario((estadoActual) => ({
      ...estadoActual,
      bancoDestino: idBanco,
    }))
  }

  return (
    <section className="page-section" id="ach">
      <div className="page-title">
        <div>
          <span className="eyebrow">Operaciones externas</span>
          <h1>Transferencias ACH</h1>
          <p>
            Registra transferencias hacia cuentas de otros bancos mediante
            operación ACH.
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
          <small>Transferencia hacia banco externo.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiCreditCard />
            </span>
            <span>Cuentas origen</span>
          </div>

          <strong>{cuentas.length}</strong>
          <small>Cuentas disponibles para débito.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiUserCheck />
            </span>
            <span>Beneficiario</span>
          </div>

          <strong>Validado</strong>
          <small>La cuenta destino debe ser verificada por backend.</small>
        </article>

        <article className="summary-card simple">
          <div className="simple-card-header">
            <span className="summary-icon">
              <FiShield />
            </span>
            <span>Seguridad</span>
          </div>

          <strong>OTP</strong>
          <small>La autorización final requiere segundo factor.</small>
        </article>
      </div>

      <div className="transfer-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Nueva transferencia ACH</h2>
              <p>Completa la información del banco y cuenta destino.</p>
            </div>

            <span>Externa</span>
          </div>

          <form className="bank-form">
            <div className="form-grid">
              <label className="form-group full-row">
                <span>Cuenta origen</span>
                <select
                  name="cuentaOrigen"
                  value={formulario.cuentaOrigen}
                  onChange={manejarCambio}
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.tipoCuenta} · {cuenta.numeroCuenta} ·{' '}
                      {formatoMoneda(cuenta.saldoDisponible)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-group full-row">
                <span>Banco destino</span>

                <div className="bank-options">
                  {bancosDestino.map((banco) => (
                    <button
                      type="button"
                      key={banco.id}
                      className={
                        formulario.bancoDestino === banco.id
                          ? 'bank-option active'
                          : 'bank-option'
                      }
                      onClick={() => seleccionarBanco(banco.id)}
                    >
                      <strong>{banco.codigo}</strong>
                      <span>{banco.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="form-group">
                <span>Cuenta destino</span>
                <input
                  type="text"
                  name="cuentaDestino"
                  placeholder="Ejemplo: 4455667788"
                  value={formulario.cuentaDestino}
                  onChange={manejarCambio}
                />
              </label>

              <label className="form-group">
                <span>Nombre del beneficiario</span>
                <input
                  type="text"
                  name="nombreBeneficiario"
                  placeholder="Nombre completo"
                  value={formulario.nombreBeneficiario}
                  onChange={manejarCambio}
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
                Confirmar ACH
              </button>
            </div>
          </form>
        </section>

        <aside className="panel transfer-summary">
          <div className="panel-header">
            <div>
              <h2>Resumen ACH</h2>
              <p>Verifica el total a debitar antes de confirmar.</p>
            </div>
          </div>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Cuenta origen</span>
              <strong>{cuentaOrigen?.numeroCuenta || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Banco destino</span>
              <strong>{bancoSeleccionado?.nombre || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Cuenta destino</span>
              <strong>{formulario.cuentaDestino || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Beneficiario</span>
              <strong>{formulario.nombreBeneficiario || 'Pendiente'}</strong>
            </div>

            <div className="summary-line">
              <span>Monto</span>
              <strong>{formatoMoneda(montoNumerico)}</strong>
            </div>

            <div className="summary-line">
              <span>Comisión estimada</span>
              <strong>{formatoMoneda(comision)}</strong>
            </div>

            <div className="summary-line total">
              <span>Total a debitar</span>
              <strong>{formatoMoneda(totalDebitar)}</strong>
            </div>
          </div>

          <div className="notice-card">
            <FiLock />
            <div>
              <strong>Control de seguridad</strong>
              <p>
                Esta pantalla solo simula el registro visual. La autorización
                real debe validarse en backend con OTP, límites y permisos.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default TransferenciasACH