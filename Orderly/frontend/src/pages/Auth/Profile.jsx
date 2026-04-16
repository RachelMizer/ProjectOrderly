import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

      <div className="account-submenu">
        <div className="account-submenu-tile account-submenu-tile--active">
          <p className="account-submenu-tile__title">Profile</p>
          <p className="account-submenu-tile__desc">View and update your personal information, address, and contact details.</p>
        </div>
        <Link to="/order-history" className="account-submenu-tile">
          <p className="account-submenu-tile__title">Order History</p>
          <p className="account-submenu-tile__desc">Browse your past orders and check on their status.</p>
        </Link>
      </div>
      <hr className="store-divider" />

      <h1 style={{ marginTop: "20px", marginBottom: "0px" }}>Your Profile</h1>
      <p style={{ marginTop: "4px", marginBottom: "20px" }}>To update your profile, enter the new<br />information and click save.</p>
      <hr className="store-divider" />

      {message && (
        <div className="prof-success">{message}</div>
      )}

      {error && (
        <div className="prof-error">{error}</div>
      )}

     <form onSubmit={handleSubmit}>
  <fieldset disabled={submitting}>

    <table className="prof-table">
      <tbody>

        {/* NAME SECTION */}
        <tr className="prof-section-row">
          <td colSpan={2} className="prof-section-title">Name</td>
        </tr>
        <tr>
          <td className="prof-label"><label htmlFor="firstName">First Name</label></td>
          <td><input id="firstName" name="firstName" type="text" value={form.firstName || ""} onChange={handleChange} /></td>
        </tr>
        <tr>
          <td className="prof-label"><label htmlFor="lastName">Last Name</label></td>
          <td><input id="lastName" name="lastName" type="text" value={form.lastName || ""} onChange={handleChange} /></td>
        </tr>

        {/* ADDRESS SECTION */}
        <tr className="prof-section-row">
          <td colSpan={2} className="prof-section-title">Address</td>
        </tr>
        <tr>
          <td className="prof-label"><label htmlFor="streetAddress">Street Address</label></td>
          <td><input id="streetAddress" name="streetAddress" type="text" value={form.streetAddress || ""} onChange={handleChange} /></td>
        </tr>
        <tr>
          <td className="prof-label"><label htmlFor="city">City</label></td>
          <td><input id="city" name="city" type="text" value={form.city || ""} onChange={handleChange} /></td>
        </tr>
        <tr>
          <td className="prof-label"><label htmlFor="state">State</label></td>
          <td><input id="state" name="state" type="text" value={form.state || ""} onChange={handleChange} /></td>
        </tr>
        <tr>
          <td className="prof-label"><label htmlFor="zipcode">Zip Code</label></td>
          <td><input id="zipcode" name="zipcode" type="text" value={form.zipcode || ""} onChange={handleChange} /></td>
        </tr>

        {/* CONTACT SECTION */}
        <tr className="prof-section-row">
          <td colSpan={2} className="prof-section-title">Contact</td>
        </tr>
        <tr>
          <td className="prof-label"><label htmlFor="email">Email</label></td>
          <td><input id="email" name="email" type="email" value={form.email || ""} onChange={handleChange} disabled /></td>
        </tr>
        <tr>
          <td className="prof-label"><label htmlFor="phone">Phone Number</label></td>
          <td><input id="phone" name="phone" type="text" value={form.phone || ""} onChange={handleChange} /></td>
        </tr>

      </tbody>
    </table>

    <button type="submit" style={{ marginTop: "16px" }}>
      {submitting ? "Saving..." : "Save"}
    </button>

  </fieldset>
</form>


    </div>
  );
}