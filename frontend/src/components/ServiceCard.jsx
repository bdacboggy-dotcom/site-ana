export default function ServiceCard({ service, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`service-card${selected ? " service-card--selected" : ""}`}
      onClick={() => onSelect(service)}
    >
      <div className="service-card-main">
        <span className="service-card-name">{service.name}</span>
        {service.description && (
          <span className="service-card-desc">{service.description}</span>
        )}
      </div>
      <div className="service-card-meta">
        <span className="service-card-duration">{service.durationMinutes} min</span>
        <span className="service-card-price">{service.price} lei</span>
      </div>
    </button>
  );
}
