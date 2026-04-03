import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/auth";

export default function Profile() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    streetAddress: "",
    city: "",
    state: "",
    zipcode: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fieldLabels = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    streetAddress: "Street Address",
    city: "City",
    state: "State",
    zipcode: "Zip Code",
    phone: "Phone Number",
    first_name: "First Name",
    last_name: "Last Name",
    street_address: "Street Address",
    non_field_errors: "Error",
  };

  function formatPhone(phone) {
    const digits = (phone || "").replace(/\D/g, "");
    if (digits.length === 10)
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    if (digits.length === 11 && digits[0] === "1")
      return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    return phone;
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setForm((prev) => ({
          ...prev,
          ...data,
          phone: formatPhone(data.phone),
        }));
      } catch (err) {
        const backend = err?.response?.data || {};
        setError(
          backend.message ||
            backend.detail ||
            err.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  function formatFieldError(field, value) {
    return `${fieldLabels[field] || field}: ${
      Array.isArray(value) ? value[0] : value
    }`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const updated = await updateProfile(form);
      setForm((prev) => ({
        ...prev,
        ...updated,
        phone: formatPhone(updated.phone),
      }));
      setMessage("Profile updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const backend = err?.response?.data || {};
      let fieldErrorMessage = "";

      if (backend.fields && typeof backend.fields === "object") {
        const firstField = Object.keys(backend.fields)[0];
        if (firstField) {
          fieldErrorMessage = formatFieldError(
            firstField,
            backend.fields[firstField]
          );
        }
      }

      if (!fieldErrorMessage && backend.customer_profile) {
        const nested = backend.customer_profile;
        const firstNestedField = Object.keys(nested)[0];

        if (firstNestedField) {
          fieldErrorMessage = formatFieldError(
            firstNestedField,
            nested[firstNestedField]
          );
        }
      }

      if (!fieldErrorMessage) {
        for (const field of Object.keys(fieldLabels)) {
          if (backend[field]) {
            fieldErrorMessage = formatFieldError(field, backend[field]);
            break;
          }
        }
      }

      setError(
        fieldErrorMessage ||
          backend.message ||
          backend.detail ||
          err.message ||
          "Failed to update profile"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="prof-pg">
      <h1>Profile</h1>
      <p>To update your profile, enter the new<br />information and click save.</p>

      {message && (
        <div className="prof-success">{message}</div>
      )}

      {error && (
        <div className="prof-error">{error}</div>
      )}

     <form onSubmit={handleSubmit}>
  <fieldset disabled={submitting}>


      {/* NAME SECTION */}
      <div className="prof-row">
        <div className="prof-section-title">Name</div>

        <div className="prof-cell">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="prof-cell">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ADDRESS SECTION */}
      <div className="prof-row">
        <div className="prof-section-title">Address</div>

        <div className="prof-cell full-width">
          <label htmlFor="streetAddress">Street Address</label>
          <input
            id="streetAddress"
            name="streetAddress"
            type="text"
            value={form.streetAddress || ""}
            onChange={handleChange}
          />
        </div>

        <div className="prof-cell">
          <label htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            type="text"
            value={form.city || ""}
            onChange={handleChange}
          />
        </div>

        <div className="prof-cell">
          <label htmlFor="state">State</label>
          <input
            id="state"
            name="state"
            type="text"
            value={form.state || ""}
            onChange={handleChange}
          />
        </div>

        <div className="prof-cell">
          <label htmlFor="zipcode">Zip Code</label>
          <input
            id="zipcode"
            name="zipcode"
            type="text"
            value={form.zipcode || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="prof-row">
        <div className="prof-section-title">Contact</div>

        <div className="prof-cell">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email || ""}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="prof-cell">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone || ""}
            onChange={handleChange}
          />
        </div>
      </div>

    <button type="submit">
      {submitting ? "Saving..." : "Save"}
    </button>

  </fieldset>
</form>


    </div>
  );
}