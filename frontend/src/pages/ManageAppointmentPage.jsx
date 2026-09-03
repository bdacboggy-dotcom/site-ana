import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { getAppointmentByToken, cancelAppointmentByToken } from "../api/appointments";

const STATUS_LABELS = { 0: "Confirmată", 1: "Anulată", 2: "Finalizată" };

export default function ManageAppointmentPage() {
  const { token } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const load = () => {
    getAppointmentByToken(token)
      .then(setAppointment)
      .catch(() => setError("Nu am găsit această programare."));
  };

  useEffect(load, [token]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelAppointmentByToken(token);
      load();
    } finally {
      setCancelling(false);
      setConfirmingCancel(false);
    }
  };

  return (
    <>
      <Header title="Programarea mea" />
      <div className="container">
        {error && <p className="error-text">{error}</p>}

        {appointment && (
          <div className="card">
            <div className="summary-row">
              <span className="summary-label">Client</span>
              <span className="summary-value">{appointment.clientFirstName} {appointment.clientLastName}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Serviciu</span>
              <span className="summary-value">{appointment.serviceName}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Data</span>
              <span className="summary-value">
                {new Date(appointment.startsAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Ora</span>
              <span className="summary-value">
                {new Date(appointment.startsAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Status</span>
              <span className="summary-value">{STATUS_LABELS[appointment.status]}</span>
            </div>

            {appointment.status === 0 && (
              <div style={{ marginTop: "1.25rem" }}>
                {!confirmingCancel ? (
                  <button type="button" className="btn btn-danger" onClick={() => setConfirmingCancel(true)}>
                    Anulează programarea
                  </button>
                ) : (
                  <>
                    <p className="text-muted">Sigur vrei să anulezi această programare?</p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setConfirmingCancel(false)}>
                        Renunță
                      </button>
                      <button type="button" className="btn btn-danger" disabled={cancelling} onClick={handleCancel}>
                        {cancelling ? "Se anulează..." : "Da, anulează"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
