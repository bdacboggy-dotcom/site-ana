export default function TimeSlotPicker({ slots, selectedSlot, onSelect }) {
  if (slots.length === 0) {
    return <p className="text-muted">Nu mai sunt ore libere în această zi.</p>;
  }

  return (
    <div className="slot-grid">
      {slots.map((slot) => (
        <button
          type="button"
          key={slot}
          className={`slot-btn${slot === selectedSlot ? " slot-btn--selected" : ""}`}
          onClick={() => onSelect(slot)}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
