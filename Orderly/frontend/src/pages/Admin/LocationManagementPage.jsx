import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveRecentView } from "../../utils/recentViews";
import API_HOST from '../../config';

const API = `${API_HOST}/api/v1`;
const PAGE_SIZE = 25;

export default function LocationManagementPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`${API}/locations/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => {
        const locs = data.results || [];
        setLocations(locs);
        saveRecentView({
          section: "locations",
          label: "Location Management",
          sublabel: `${locs.length} location${locs.length !== 1 ? "s" : ""}`,
          path: "/admin/locations",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [search, filterCountry, filterRegion, filterState, filterCity]);

  // Cascading filter options derived from data
  const countries = useMemo(() =>
    [...new Set(locations.map((l) => l.region_country).filter(Boolean))].sort(),
    [locations]
  );

  const regions = useMemo(() => {
    const subset = filterCountry
      ? locations.filter((l) => l.region_country === filterCountry)
      : locations;
    const seen = new Map();
    subset.forEach((l) => { if (l.region && l.region_name) seen.set(l.region, l.region_name); });
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [locations, filterCountry]);

  const states = useMemo(() => {
    let subset = locations;
    if (filterCountry) subset = subset.filter((l) => l.region_country === filterCountry);
    if (filterRegion) subset = subset.filter((l) => String(l.region) === filterRegion);
    return [...new Set(subset.map((l) => l.state_province_name).filter(Boolean))].sort();
  }, [locations, filterCountry, filterRegion]);

  const cities = useMemo(() => {
    let subset = locations;
    if (filterCountry) subset = subset.filter((l) => l.region_country === filterCountry);
    if (filterRegion) subset = subset.filter((l) => String(l.region) === filterRegion);
    if (filterState) subset = subset.filter((l) => l.state_province_name === filterState);
    return [...new Set(subset.map((l) => l.city).filter(Boolean))].sort();
  }, [locations, filterCountry, filterRegion, filterState]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return locations.filter((l) => {
      if (filterCountry && l.region_country !== filterCountry) return false;
      if (filterRegion && String(l.region) !== filterRegion) return false;
      if (filterState && l.state_province_name !== filterState) return false;
      if (filterCity && l.city !== filterCity) return false;
      if (q) {
        const haystack = [
          l.location_number,
          l.name,
          l.region_name,
          l.region_country,
          l.state_province_name,
          l.state_province_abbr,
          l.address,
          l.city,
          l.zip_code,
          l.phone,
          l.email,
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [locations, search, filterCountry, filterRegion, filterState, filterCity]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function clearFilters() {
    setSearch("");
    setFilterCountry("");
    setFilterRegion("");
    setFilterState("");
    setFilterCity("");
  }

  const anyFilter = search || filterCountry || filterRegion || filterState || filterCity;

  return (
    <div className="admin-dash support-dash">
      <h1 className="ticket-detail__title" style={{ marginBottom: "4px" }}>Location Management</h1>
      <p className="ticket-detail__description" style={{ marginBottom: "24px" }}>
        All company locations — filter by region, state, or city, or search by any field.
      </p>

      {/* Filter bar */}
      <div className="loc-filter-bar">
        <input
          className="loc-search-input"
          type="text"
          placeholder="Search locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="loc-filter-select"
          value={filterCountry}
          onChange={(e) => { setFilterCountry(e.target.value); setFilterRegion(""); setFilterState(""); setFilterCity(""); }}
        >
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="loc-filter-select"
          value={filterRegion}
          onChange={(e) => { setFilterRegion(e.target.value); setFilterState(""); setFilterCity(""); }}
        >
          <option value="">All Regions</option>
          {regions.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
        </select>

        <select
          className="loc-filter-select"
          value={filterState}
          onChange={(e) => { setFilterState(e.target.value); setFilterCity(""); }}
        >
          <option value="">All States</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="loc-filter-select"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
        >
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {anyFilter && (
          <button className="loc-clear-btn" onClick={clearFilters}>Clear</button>
        )}
      </div>

      {/* Results count */}
      <p className="loc-result-count">
        {filtered.length === locations.length
          ? `${locations.length} location${locations.length !== 1 ? "s" : ""}`
          : `${filtered.length} of ${locations.length} locations`}
      </p>

      {loading ? (
        <p className="admin-loading">Loading locations...</p>
      ) : filtered.length === 0 ? (
        <p className="acct-deleted-empty">No locations match your filters.</p>
      ) : (
        <>
          <table className="support-ticket-table" style={{ whiteSpace: "nowrap" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Region</th>
                <th>Country</th>
                <th>City</th>
                <th>State</th>
                <th>Manager</th>
                <th>ZIP</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((loc) => (
                <tr key={loc.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/locations/${loc.id}`)}>
                  <td style={{ fontWeight: 800, color: "#33638b", whiteSpace: "nowrap" }}>
                    {loc.location_number}
                  </td>
                  <td style={{ fontWeight: 700, textAlign: "left" }}>{loc.name}</td>
                  <td>{loc.region_name || "—"}</td>
                  <td>{loc.region_country || "—"}</td>
                  <td>{loc.city || "—"}</td>
                  <td>{loc.state_province_abbr || loc.state_province_name || "—"}</td>
                  <td>{loc.manager_name || "—"}</td>
                  <td>{loc.zip_code || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{loc.phone || "—"}</td>
                  <td>{loc.email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="loc-pagination">
              <button
                className="loc-page-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ‹ Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`loc-page-btn${p === page ? " loc-page-btn--active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="loc-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
