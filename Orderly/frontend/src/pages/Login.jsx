import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login({ setLoggedIn }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      await login(formData);
      setLoggedIn(true);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Login</h2>

      {errorMessage && <p>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting}>
          <div>
            <label htmlFor="email">Email</label>
            <br />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <br />
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <button type="submit">
              {submitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}