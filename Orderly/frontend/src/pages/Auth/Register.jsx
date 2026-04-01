import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";

export default function Register({ setLoggedIn }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: null,
      general: null,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      await register(form);

      // ✅ Auto-login behavior per API contract
      setLoggedIn(true);
      navigate("/");
    } catch (err) {
      const backend = err?.response?.data || {};

      const extractedFieldErrors = backend.fields
        ? backend.fields
        : {
            firstName: Array.isArray(backend.firstName)
              ? backend.firstName[0]
              : backend.firstName,
            lastName: Array.isArray(backend.lastName)
              ? backend.lastName[0]
              : backend.lastName,
            email: Array.isArray(backend.email)
              ? backend.email[0]
              : backend.email,
            password: Array.isArray(backend.password)
              ? backend.password[0]
              : backend.password,
          };

      const hasFieldErrors =
        extractedFieldErrors.firstName ||
        extractedFieldErrors.lastName ||
        extractedFieldErrors.email ||
        extractedFieldErrors.password;

      if (backend) {
        setErrors({
          ...extractedFieldErrors,
          general:
            backend.message ||
            backend.detail ||
            (!hasFieldErrors ? "Registration failed." : null),
        });
      } else {
        setErrors({
          general: "Registration failed. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Create Account</h1>

      {errors.general && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="firstName">First Name</label>
            <br />
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            {errors.firstName && (
              <div style={{ color: "red" }}>{errors.firstName}</div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="lastName">Last Name</label>
            <br />
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
            {errors.lastName && (
              <div style={{ color: "red" }}>{errors.lastName}</div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email</label>
            <br />
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div style={{ color: "red" }}>{errors.email}</div>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">Password</label>
            <br />
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <div style={{ color: "red" }}>{errors.password}</div>
            )}
          </div>

          <button type="submit">
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}