import { useEffect, useState } from "react";
import { getAllAppointments, updateAppointmentStatus } from "../../api/appointments";
import { toDateKey } from "../../utils/date";

const STATUS_CONFIRMED = 0;
const STATUS_CANCELLED = 1;
const STATUS_COMPLETED = 2;

const STATUS_BADGE = {
  [STATUS_CONFIRMED]: { label: "Confirmată", className: "badge--confirmed" },
  [STATUS_CANCELLED]: { label: "Anulată", className: "badge--cancelled" },
  [STATUS_COMPLETED]: { label: "Finalizată", className: "badge--completed" },
};

export default function AdminAppointmentsTab() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getAllAppointments(date, date)
      .then(setAppointments)
      .finally(() => setLoading(false));
  };

  useEffect(load, [date]);

  const shiftDay = (delta) => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setDate(toDateKey(d));
  };

  const handleStatusChange = async (id, status) => {
    await updateAppointmentStatus(id, status);
    load();
  };

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <button type="button" className="icon-btn" onClick={() => shiftDay(-1)}>‹</button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, padding: "0.5rem" }}
        />
        <button type="button" className="icon-btn" onClick={() => shiftDay(1)}>›</button>
      </div>

      <p className="text-muted" style={{ textTransform: "capitalize", marginBottom: "0.75rem" }}>
        {dateLabel}
      </p>

      {loading && <p className="text-muted">Se încarcă...</p>}
      {!loading && appointments.length === 0 && (
        <p className="text-muted">Nicio programare în această zi.</p>
      )}

      {appointments.map((a) => {
        const badge = STATUS_BADGE[a.status];
        return (
          <div key={a.id} className="appointment-item">
            <span className="appointment-time">
              {new Date(a.startsAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="appointment-details">
              <span className="appointment-client">{a.clientFirstName} {a.clientLastName}</span>
              <span className="appointment-service">{a.serviceName}</span>
              <span className="appointment-service">{a.clientPhone}</span>
              <span className={`badge ${badge.className}`}>{badge.label}</span>
            </div>
            {a.status === STATUS_CONFIRMED && (
              <div className="appointment-actions">
                <button type="button" className="icon-btn" onClick={() => handleStatusChange(a.id, STATUS_COMPLETED)}>
                  ✓ Finalizat
                </button>
                <button type="button" className="icon-btn" onClick={() => handleStatusChange(a.id, STATUS_CANCELLED)}>
                  ✕ Anulează
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
