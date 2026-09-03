import { useEffect, useState } from "react";
import { getBlockedDates, createBlockedDate, deleteBlockedDate } from "../../api/schedule";
import { toDateKey } from "../../utils/date";

function todayKey() {
  return toDateKey(new Date());
}

export default function AdminBlockedDatesTab() {
  const [dates, setDates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [wholeDay, setWholeDay] = useState(true);
  const [form, setForm] = useState({ date: todayKey(), startTime: "10:00", endTime: "19:00", reason: "" });

  const load = () => {
    getBlockedDates(todayKey()).then(setDates);
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createBlockedDate({
      date: form.date,
      startTime: wholeDay ? null : `${form.startTime}:00`,
      endTime: wholeDay ? null : `${form.endTime}:00`,
      reason: form.reason || null,
    });
    setShowForm(false);
    setForm({ date: todayKey(), startTime: "10:00", endTime: "19:00", reason: "" });
    setWholeDay(true);
    load();
  };

  const handleDelete = async (id) => {
    await deleteBlockedDate(id);
    load();
  };

  return (
    <div>
      {!showForm && (
        <button type="button" className="btn" style={{ marginBottom: "1rem" }} onClick={() => setShowForm(true)}>
          + Blochează o zi
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1.25rem" }}>
          <div className="field">
            <label>Data</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="wholeDay"
              checked={wholeDay}
              onChange={(e) => setWholeDay(e.target.checked)}
            />
            <label htmlFor="wholeDay" style={{ margin: 0 }}>Toată ziua</label>
          </div>

          {!wholeDay && (
            <div className="field" style={{ flexDirection: "row", gap: "0.5rem" }}>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
              <span>-</span>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          )}

          <div className="field">
            <label>Motiv (opțional)</label>
            <input
              placeholder="Ex: concediu, sărbătoare"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Renunță</button>
            <button type="submit" className="btn">Blochează</button>
          </div>
        </form>
      )}

      {dates.length === 0 && <p className="text-muted">Nicio zi blocată în viitor.</p>}

      {dates.map((d) => (
        <div key={d.id} className="appointment-item">
          <div className="appointment-details">
            <span className="appointment-client">
              {new Date(d.date + "T00:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="appointment-service">
              {d.startTime && d.endTime ? `${d.startTime.slice(0, 5)} - ${d.endTime.slice(0, 5)}` : "Toată ziua"}
            </span>
            {d.reason && <span className="appointment-service">{d.reason}</span>}
          </div>
          <button type="button" className="icon-btn" onClick={() => handleDelete(d.id)}>Șterge</button>
        </div>
      ))}
    </div>
  );
}
