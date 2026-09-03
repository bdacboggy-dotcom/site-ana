import { useEffect, useState } from "react";
import { getWorkingHours, updateWorkingHours } from "../../api/schedule";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS = {
  0: "Duminică",
  1: "Luni",
  2: "Marți",
  3: "Miercuri",
  4: "Joi",
  5: "Vineri",
  6: "Sâmbătă",
};

function toInputTime(timeSpanString) {
  return (timeSpanString || "10:00:00").slice(0, 5);
}

export default function AdminWorkingHoursTab() {
  const [hoursByDay, setHoursByDay] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () => {
    getWorkingHours().then((data) => {
      const map = {};
      for (const day of DAY_ORDER) {
        const existing = data.find((d) => d.dayOfWeek === day);
        map[day] = existing
          ? {
              startTime: toInputTime(existing.startTime),
              endTime: toInputTime(existing.endTime),
              isWorkingDay: existing.isWorkingDay,
            }
          : { startTime: "10:00", endTime: "19:00", isWorkingDay: false };
      }
      setHoursByDay(map);
    });
  };

  useEffect(load, []);

  const updateDay = (day, changes) => {
    setSaved(false);
    setHoursByDay((prev) => ({ ...prev, [day]: { ...prev[day], ...changes } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        DAY_ORDER.map((day) =>
          updateWorkingHours(day, {
            startTime: `${hoursByDay[day].startTime}:00`,
            endTime: `${hoursByDay[day].endTime}:00`,
            isWorkingDay: hoursByDay[day].isWorkingDay,
          })
        )
      );
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (Object.keys(hoursByDay).length === 0) return <p className="text-muted">Se încarcă...</p>;

  return (
    <div>
      <div className="card">
        {DAY_ORDER.map((day) => (
          <div key={day} className="day-row">
            <span className="day-name">{DAY_LABELS[day]}</span>
            <div className="day-hours">
              <input
                type="checkbox"
                className="toggle"
                checked={hoursByDay[day].isWorkingDay}
                onChange={(e) => updateDay(day, { isWorkingDay: e.target.checked })}
              />
              {hoursByDay[day].isWorkingDay && (
                <>
                  <input
                    type="time"
                    value={hoursByDay[day].startTime}
                    onChange={(e) => updateDay(day, { startTime: e.target.value })}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={hoursByDay[day].endTime}
                    onChange={(e) => updateDay(day, { endTime: e.target.value })}
                  />
                </>
              )}
              {!hoursByDay[day].isWorkingDay && <span className="text-muted">Liber</span>}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn" style={{ marginTop: "1rem" }} disabled={saving} onClick={handleSave}>
        {saving ? "Se salvează..." : "Salvează modificările"}
      </button>
      {saved && <p className="success-text" style={{ marginTop: "0.5rem" }}>Salvat!</p>}
    </div>
  );
}
