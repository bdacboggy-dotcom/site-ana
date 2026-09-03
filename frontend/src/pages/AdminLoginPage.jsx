import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch {
      setError("Email sau parolă incorectă.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Admin" />
      <div className="container">
        <h2 className="section-title">Autentificare</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Parolă</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Se conectează..." : "Intră în cont"}
          </button>
        </form>
      </div>
    </>
  );
}
