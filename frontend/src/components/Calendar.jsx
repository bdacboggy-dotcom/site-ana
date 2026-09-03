import "./Calendar.css";
import { toDateKey } from "../utils/date";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_LABELS = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];

function startOfMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1);
  // Luni = 0 ... Duminică = 6
  const offset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - offset);
  return gridStart;
}

export default function Calendar({ year, month, onMonthChange, availableDays, selectedDate, onSelectDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const gridStart = startOfMonthGrid(year, month);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const goPrevMonth = () => {
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    onMonthChange(y, m);
  };

  const goNextMonth = () => {
    const m = month === 12 ? 1 : month + 1;
    const y = month === 12 ? year + 1 : year;
    onMonthChange(y, m);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="calendar-nav" onClick={goPrevMonth} aria-label="Luna anterioară">
          ‹
        </button>
        <span className="calendar-title">{MONTH_LABELS[month - 1]} {year}</span>
        <button type="button" className="calendar-nav" onClick={goNextMonth} aria-label="Luna următoare">
          ›
        </button>
      </div>

      <div className="calendar-grid calendar-weekdays">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="calendar-weekday">{label}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((date) => {
          const key = toDateKey(date);
          const inMonth = date.getMonth() === month - 1;
          const isPast = date < today;
          const isAvailable = availableDays.has(key);
          const isSelected = selectedDate === key;
          const isToday = toDateKey(date) === toDateKey(today);

          const disabled = !inMonth || isPast || !isAvailable;

          return (
            <button
              type="button"
              key={key}
              disabled={disabled}
              className={[
                "calendar-day",
                !inMonth && "calendar-day--muted",
                isSelected && "calendar-day--selected",
                isToday && "calendar-day--today",
                isAvailable && !disabled && "calendar-day--available",
              ].filter(Boolean).join(" ")}
              onClick={() => onSelectDate(key)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
