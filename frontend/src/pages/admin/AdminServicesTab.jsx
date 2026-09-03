import { useEffect, useState } from "react";
import { getAllServices, createService, updateService, deleteService } from "../../api/services";

const EMPTY_FORM = { name: "", description: "", durationMinutes: 30, price: 0, isActive: true };

export default function AdminServicesTab() {
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showNewForm, setShowNewForm] = useState(false);

  const load = () => {
    getAllServices().then(setServices);
  };

  useEffect(load, []);

  const startEdit = (service) => {
    setEditingId(service.id);
    setShowNewForm(false);
    setForm({
      name: service.name,
      description: service.description || "",
      durationMinutes: service.durationMinutes,
      price: service.price,
      isActive: service.isActive,
    });
  };

  const startNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowNewForm(true);
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowNewForm(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
      isActive: form.isActive,
    };

    if (editingId) {
      await updateService(editingId, payload);
    } else {
      await createService(payload);
    }

    cancelForm();
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ștergi acest serviciu?")) return;
    await deleteService(id);
    load();
  };

  const formVisible = showNewForm || editingId !== null;

  return (
    <div>
      {!formVisible && (
        <button type="button" className="btn" style={{ marginBottom: "1rem" }} onClick={startNew}>
          + Adaugă serviciu
        </button>
      )}

      {formVisible && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1.25rem" }}>
          <div className="field">
            <label>Nume</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Descriere (opțional)</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label>Durată (minute)</label>
            <input
              type="number"
              min={5}
              step={5}
              required
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Preț (lei)</label>
            <input
              type="number"
              min={0}
              step={1}
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" style={{ margin: 0 }}>Vizibil pentru clienți</label>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={cancelForm}>Renunță</button>
            <button type="submit" className="btn">{editingId ? "Salvează" : "Adaugă"}</button>
          </div>
        </form>
      )}

      <div className="service-list">
        {services.map((s) => (
          <div key={s.id} className="service-card" style={{ opacity: s.isActive ? 1 : 0.55 }}>
            <div className="service-card-main">
              <span className="service-card-name">{s.name}{!s.isActive && " (ascuns)"}</span>
              {s.description && <span className="service-card-desc">{s.description}</span>}
            </div>
            <div className="service-card-meta" style={{ alignItems: "flex-end", gap: "0.4rem" }}>
              <span className="service-card-duration">{s.durationMinutes} min · {s.price} lei</span>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button type="button" className="icon-btn" onClick={() => startEdit(s)}>Editează</button>
                <button type="button" className="icon-btn" onClick={() => handleDelete(s.id)}>Șterge</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
