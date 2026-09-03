import { useEffect, useState } from "react";
import Header from "../components/Header";
import ServiceCard from "../components/ServiceCard";
import Calendar from "../components/Calendar";
import TimeSlotPicker from "../components/TimeSlotPicker";
import { getActiveServices } from "../api/services";
import { getAvailableDaysInMonth, getSlotsForDay } from "../api/availability";
import { createAppointment } from "../api/appointments";

const STEP_SERVICE = 1;
const STEP_DATETIME = 2;
const STEP_DETAILS = 3;
const STEP_DONE = 4;

function formatDateLabel(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
}

export default function BookingPage() {
  const [step, setStep] = useState(STEP_SERVICE);

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [availableDays, setAvailableDays] = useState(new Set());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getActiveServices().then(setServices).catch(() => setError("Nu am putut încărca serviciile."));
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    getAvailableDaysInMonth(selectedService.id, year, month)
      .then((days) => setAvailableDays(new Set(days)))
      .catch(() => setAvailableDays(new Set()));
  }, [selectedService, year, month]);

  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    setSlots([]);
    setSelectedSlot(null);
    getSlotsForDay(selectedService.id, selectedDate)
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [selectedService, selectedDate]);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(STEP_DATETIME);
  };

  const handleMonthChange = (y, m) => {
    setYear(y);
    setMonth(m);
  };

  const goToDetails = () => {
    if (!selectedSlot) return;
    setStep(STEP_DETAILS);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const appointment = await createAppointment({
        clientFirstName: form.firstName,
        clientLastName: form.lastName,
        clientPhone: form.phone,
        clientEmail: form.email || null,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: `${selectedSlot}:00`,
        notes: form.notes || null,
      });
      setResult(appointment);
      setStep(STEP_DONE);
    } catch (err) {
      setError(err.response?.data?.message || "A apărut o eroare. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  };

  const startOver = () => {
    setStep(STEP_SERVICE);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setForm({ firstName: "", lastName: "", phone: "", email: "", notes: "" });
    setResult(null);
  };

  return (
    <>
      <Header title="Programează-te" />
      <div className="container">
        {step !== STEP_SERVICE && step !== STEP_DONE && (
          <div className="step-indicator">
            {[STEP_SERVICE, STEP_DATETIME, STEP_DETAILS].map((s) => (
              <div key={s} className={`step-dot${s <= step ? " step-dot--active" : ""}`} />
            ))}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {step === STEP_SERVICE && (
          <>
            <h2 className="section-title">Alege un serviciu</h2>
            <div className="service-list">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} selected={false} onSelect={handleSelectService} />
              ))}
            </div>
          </>
        )}

        {step === STEP_DATETIME && (
          <>
            <button type="button" className="step-back" onClick={() => setStep(STEP_SERVICE)}>
              ‹ Înapoi
            </button>
            <h2 className="section-title">{selectedService.name}</h2>
            <Calendar
              year={year}
              month={month}
              onMonthChange={handleMonthChange}
              availableDays={availableDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {selectedDate && (
              <>
                <h3 className="section-title" style={{ marginTop: "1.5rem" }}>
                  Ore libere — {formatDateLabel(selectedDate)}
                </h3>
                <TimeSlotPicker slots={slots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
              </>
            )}

            {selectedSlot && (
              <button type="button" className="btn" style={{ marginTop: "1.5rem" }} onClick={goToDetails}>
                Continuă
              </button>
            )}
          </>
        )}

        {step === STEP_DETAILS && (
          <>
            <button type="button" className="step-back" onClick={() => setStep(STEP_DATETIME)}>
              ‹ Înapoi
            </button>
            <h2 className="section-title">Datele tale</h2>

            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <div className="summary-row">
                <span className="summary-label">Serviciu</span>
                <span className="summary-value">{selectedService.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Data</span>
                <span className="summary-value">{formatDateLabel(selectedDate)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Ora</span>
                <span className="summary-value">{selectedSlot}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Prenume</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Nume</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Telefon</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Email (opțional, pentru confirmare)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Observații (opțional)</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Se trimite..." : "Confirmă programarea"}
              </button>
            </form>
          </>
        )}

        {step === STEP_DONE && result && (
          <div className="confirmation">
            <div className="confirmation-icon">✓</div>
            <h2 className="section-title">Programare confirmată!</h2>
            <p className="text-muted">
              Te așteptăm pe {formatDateLabel(selectedDate)}, ora {selectedSlot}, pentru {selectedService.name}.
            </p>
            {form.email && <p className="text-muted">Am trimis detaliile și pe email.</p>}
            <button type="button" className="btn btn-secondary" style={{ marginTop: "1.5rem" }} onClick={startOver}>
              Fă o altă programare
            </button>
          </div>
        )}
      </div>
    </>
  );
}
