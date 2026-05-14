import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

function TarjetaResumen({
  titulo,
  valor,
  descripcion,
  icono,
  tipo = 'default',
  abiertaInicial = false,
  children,
}) {
  const [abierta, setAbierta] = useState(abiertaInicial)

  const alternarTarjeta = () => {
    setAbierta((estadoActual) => !estadoActual)
  }

  return (
    <article className={`summary-card expandable ${tipo} ${abierta ? 'open' : ''}`}>
      <button
        type="button"
        className="summary-card-button"
        onClick={alternarTarjeta}
        aria-expanded={abierta}
      >
        <span className="summary-icon">{icono}</span>

        <span className="summary-info">
          <span className="summary-label">{titulo}</span>
          <strong>{valor}</strong>
          {descripcion && <small>{descripcion}</small>}
        </span>

        <FiChevronDown className="summary-chevron" />
      </button>

      {abierta && (
        <div className="summary-detail">
          {children}
        </div>
      )}
    </article>
  )
}

export default TarjetaResumen
