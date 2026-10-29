import { useEffect, useRef, useState } from "react";
import {
  CATEGORIES,
  COUNTIES,
  DEMO_RECORDS,
  STATUSES,
  createCaseId,
  loadRecords,
  saveRecords,
} from "./records";

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const STATUS_COLORS = {
  Missing: "#b42318",
  "Found - Alive": "#147d53",
  "Found - Deceased": "#475569",
  Deceased: "#475569",
  "Under Investigation": "#9a6700",
};

const blankRecord = () => ({
  firstName: "",
  lastName: "",
  age: "",
  gender: "",
  category: "",
  county: "",
  status: "Missing",
  reportDate: today(),
  description: "",
  reportedBy: "",
  contact: "",
  linkedHospital: "",
  linkedMorgue: "",
});

function StatusBadge({ status }) {
  return (
    <span className="status-badge" style={{ "--status-color": STATUS_COLORS[status] }}>
      {status}
    </span>
  );
}

function CaseForm({ record, onClose, onSave, disabled }) {
  const [form, setForm] = useState(() => record ? { ...record } : blankRecord());
  const [error, setError] = useState("");
  const submitInProgress = useRef(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (submitInProgress.current) return;
    const age = Number(form.age);
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Enter the person's first and last name.");
      return;
    }
    if (!Number.isInteger(age) || age < 0 || age > 130) {
      setError("Enter an age from 0 to 130.");
      return;
    }
    if (!form.gender || !form.category || !form.county || !form.reportDate) {
      setError("Complete all required fields.");
      return;
    }
    if (form.reportDate > today()) {
      setError("The report date cannot be in the future.");
      return;
    }
    if (!form.description.trim()) {
      setError("Add a brief description or last-known information.");
      return;
    }

    submitInProgress.current = true;
    let saved = false;
    try {
      saved = onSave({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age,
        description: form.description.trim(),
        reportedBy: form.reportedBy.trim(),
        contact: form.contact.trim(),
        linkedHospital: form.linkedHospital.trim(),
        linkedMorgue: form.linkedMorgue.trim(),
      });
    } finally {
      if (!saved) submitInProgress.current = false;
    }
    if (saved) onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">LOCAL BROWSER RECORD</p>
            <h2 id="form-title">{record ? "Edit case" : "Report a missing person"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close form">×</button>
        </div>
        <p className="privacy-note">
          This prototype saves only to this browser. It does not notify police, hospitals, or any other service.
          Do not enter real or sensitive personal information.
        </p>
        <form className="case-form" onSubmit={submit}>
          <label>
            First name <span aria-hidden="true">*</span>
            <input autoFocus required maxLength={80} name="firstName" value={form.firstName} onChange={update} />
          </label>
          <label>
            Last name <span aria-hidden="true">*</span>
            <input required maxLength={80} name="lastName" value={form.lastName} onChange={update} />
          </label>
          <label>
            Age <span aria-hidden="true">*</span>
            <input required type="number" min="0" max="130" step="1" name="age" value={form.age} onChange={update} />
          </label>
          <label>
            Gender <span aria-hidden="true">*</span>
            <select required name="gender" value={form.gender} onChange={update}>
              <option value="">Select gender</option>
              <option>Female</option>
              <option>Male</option>
              <option>Not specified</option>
            </select>
          </label>
          <label>
            Category <span aria-hidden="true">*</span>
            <select required name="category" value={form.category} onChange={update}>
              <option value="">Select category</option>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            County <span aria-hidden="true">*</span>
            <select required name="county" value={form.county} onChange={update}>
              <option value="">Select county</option>
              {COUNTIES.map((county) => <option key={county}>{county}</option>)}
            </select>
          </label>
          <label>
            Report date <span aria-hidden="true">*</span>
            <input required type="date" max={today()} name="reportDate" value={form.reportDate} onChange={update} />
          </label>
          <label className="form-wide">
            Description / last-known information <span aria-hidden="true">*</span>
            <textarea required maxLength={2000} rows="4" name="description" value={form.description} onChange={update} />
          </label>
          <label>
            Reporter name
            <input maxLength={120} name="reportedBy" value={form.reportedBy} onChange={update} />
          </label>
          <label>
            Contact number
            <input type="tel" maxLength={40} name="contact" value={form.contact} onChange={update} />
          </label>
          <label>
            Linked hospital
            <input maxLength={120} name="linkedHospital" value={form.linkedHospital} onChange={update} />
          </label>
          <label>
            Linked mortuary
            <input maxLength={120} name="linkedMorgue" value={form.linkedMorgue} onChange={update} />
          </label>
          {error && <p className="form-error form-wide" role="alert">{error}</p>}
          <div className="form-actions form-wide">
            <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={disabled}>
              {record ? "Save changes" : "Save demo report"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function CaseDetails({ record, onClose, onEdit, onDelete, onStatusChange, disabled }) {
  const [status, setStatus] = useState(record.status);

  const updateStatus = () => {
    if (onStatusChange(record.id, status)) onClose();
  };

  const deleteCase = () => {
    if (window.confirm(`Delete case ${record.id} from this browser? This cannot be undone.`) && onDelete(record.id)) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{record.id} · {record.county}</p>
            <h2 id="details-title">{record.firstName} {record.lastName}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close case details">×</button>
        </div>
        <div className="detail-badges">
          <StatusBadge status={record.status} />
          <span className="plain-badge">{record.category}</span>
          <span className="plain-badge">Age {record.age}</span>
          <span className="plain-badge">Reported {record.reportDate}</span>
        </div>
        <p className="detail-description">{record.description}</p>
        <dl className="detail-grid">
          <div><dt>Gender</dt><dd>{record.gender || "Not specified"}</dd></div>
          <div><dt>Reporter</dt><dd>{record.reportedBy || "Not provided"}</dd></div>
          <div><dt>Contact</dt><dd>{record.contact || "Not provided"}</dd></div>
          <div><dt>Hospital</dt><dd>{record.linkedHospital || "Not provided"}</dd></div>
          <div><dt>Mortuary</dt><dd>{record.linkedMorgue || "Not provided"}</dd></div>
        </dl>
        <div className="status-editor">
          <label htmlFor="case-status">Update status</label>
          <div className="status-controls">
            <select id="case-status" value={status} onChange={(event) => setStatus(event.target.value)}>
              {STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="button button-secondary" type="button" onClick={updateStatus} disabled={disabled || status === record.status}>Update</button>
          </div>
        </div>
        <div className="form-actions">
          <button className="button button-danger" type="button" onClick={deleteCase} disabled={disabled}>Delete case</button>
          <button className="button button-primary" type="button" onClick={onEdit} disabled={disabled}>Edit details</button>
        </div>
      </section>
    </div>
  );
}

function CaseCard({ record, onSelect }) {
  return (
    <button className="case-card" type="button" onClick={() => onSelect(record.id)}>
      <span className="case-card-top">
        <span className="case-card-id">{record.id}</span>
        <StatusBadge status={record.status} />
      </span>
      <strong>{record.firstName} {record.lastName}</strong>
      <span className="case-card-meta">{record.county} · {record.category} · Age {record.age}</span>
      <span className="case-card-description">{record.description}</span>
      <span className="case-card-date">Reported {record.reportDate}</span>
    </button>
  );
}

export default function MissingVoices() {
  const [initial] = useState(loadRecords);
  const [records, setRecords] = useState(initial.records);
  const [storageError, setStorageError] = useState(initial.error);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterCounty, setFilterCounty] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");
  const selectedRecord = records.find((record) => record.id === selectedId);

  useEffect(() => {
    if (!showForm && !selectedRecord) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm, selectedRecord]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const commitRecords = (nextRecords, successMessage) => {
    try {
      saveRecords(nextRecords);
      setRecords(nextRecords);
      setStorageError("");
      setToast(successMessage);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "The browser storage operation failed.";
      setStorageError(`Changes were not saved. ${message}`);
      setToast("Not saved — check the storage warning.");
      return false;
    }
  };

  const saveCase = (form) => {
    const nextRecords = editingRecord
      ? records.map((record) => record.id === editingRecord.id ? { ...record, ...form } : record)
      : [{ ...form, id: createCaseId(records), status: "Missing" }, ...records];
    const saved = commitRecords(nextRecords, editingRecord
      ? "Case updated in this browser."
      : "Demo report saved in this browser. No service was notified.");
    if (saved) setEditingRecord(null);
    return saved;
  };

  const updateStatus = (id, status) => commitRecords(
    records.map((record) => record.id === id ? { ...record, status } : record),
    `Case ${id} updated in this browser.`,
  );

  const deleteCase = (id) => commitRecords(
    records.filter((record) => record.id !== id),
    `Case ${id} deleted from this browser.`,
  );

  const resetDemoData = () => {
    if (!window.confirm("Replace the current browser data with the fictional sample records? This cannot be undone.")) return;
    commitRecords(DEMO_RECORDS, "Browser data replaced with fictional demo records.");
  };

  const filteredRecords = records.filter((record) => {
    const term = search.trim().toLocaleLowerCase();
    const searchable = [
      record.firstName,
      record.lastName,
      record.id,
      record.county,
      record.category,
      record.description,
    ].join(" ").toLocaleLowerCase();
    return (!term || searchable.includes(term))
      && (!filterCounty || record.county === filterCounty)
      && (!filterCategory || record.category === filterCategory)
      && (!filterStatus || record.status === filterStatus);
  });

  const openNewForm = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const openEditForm = () => {
    setEditingRecord(selectedRecord);
    setSelectedId(null);
    setShowForm(true);
  };

  const navItems = [
    ["dashboard", "Overview"],
    ["cases", "Cases"],
    ["map", "County summary"],
    ["links", "Integrations"],
  ];

  const statusCounts = STATUSES.map((status) => ({
    status,
    count: records.filter((record) => record.status === status).length,
  }));
  const missingCount = records.filter((record) => record.status === "Missing").length;
  const foundCount = records.filter((record) => record.status === "Found - Alive").length;
  const countiesWithCases = COUNTIES.map((county) => ({
    county,
    total: records.filter((record) => record.county === county).length,
    missing: records.filter((record) => record.county === county && record.status === "Missing").length,
  }));

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#overview" onClick={() => setActiveTab("dashboard")}>
          <span className="brand-mark" aria-hidden="true">MV</span>
          <span><strong>Missing Voices</strong><small>Case management prototype</small></span>
        </a>
        <button className="button button-light" type="button" onClick={openNewForm} disabled={Boolean(storageError)}>
          <span aria-hidden="true">＋</span> New demo report
        </button>
      </header>

      <nav className="main-nav" aria-label="Main navigation">
        {navItems.map(([id, label]) => (
          <button
            aria-current={activeTab === id ? "page" : undefined}
            className={activeTab === id ? "nav-link nav-link-active" : "nav-link"}
            key={id}
            onClick={() => setActiveTab(id)}
            type="button"
          >
            {label}
          </button>
        ))}
        <span className="local-indicator"><span aria-hidden="true" /> Browser storage only</span>
      </nav>

      <main className="main-content" id="overview">
        <section className="notice" aria-label="Prototype and privacy notice">
          <strong>Prototype only</strong>
          <span>Records stay in this browser and are not verified, encrypted, backed up, or shared. Use fictional data only.</span>
        </section>

        {storageError && (
          <section className="storage-warning" role="alert">
            <div><strong>Local storage unavailable</strong><p>{storageError}</p></div>
            <button className="button button-secondary" type="button" onClick={resetDemoData}>Start fresh with demo data</button>
          </section>
        )}

        {activeTab === "dashboard" && (
          <section className="page-section">
            <div className="page-heading">
              <div><p className="eyebrow">DEMO WORKSPACE</p><h1>Overview</h1></div>
              <button className="button button-primary" type="button" onClick={openNewForm} disabled={Boolean(storageError)}>Create report</button>
            </div>
            <div className="stat-grid">
              <article className="stat-card"><span>Total cases</span><strong>{records.length}</strong><small>Stored in this browser</small></article>
              <article className="stat-card stat-missing"><span>Missing</span><strong>{missingCount}</strong><small>Demo records marked missing</small></article>
              <article className="stat-card stat-found"><span>Found alive</span><strong>{foundCount}</strong><small>Demo records marked found</small></article>
              <article className="stat-card"><span>Counties represented</span><strong>{countiesWithCases.filter((item) => item.total).length}</strong><small>Out of 47 counties</small></article>
            </div>
            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-heading"><div><p className="eyebrow">CURRENT RECORDS</p><h2>Cases by status</h2></div></div>
                <div className="status-list">
                  {statusCounts.map(({ status, count }) => (
                    <button className="status-row" key={status} onClick={() => { setFilterStatus(status); setActiveTab("cases"); }} type="button">
                      <span className="status-row-label"><span className="status-dot" style={{ "--status-color": STATUS_COLORS[status] }} />{status}</span>
                      <strong>{count}</strong>
                    </button>
                  ))}
                </div>
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">RECENT ACTIVITY</p><h2>Recently added</h2></div>
                  <button className="text-button" type="button" onClick={() => setActiveTab("cases")}>View all</button>
                </div>
                {records.length
                  ? <div className="recent-list">{records.slice(0, 4).map((record) => (
                    <button className="recent-item" key={record.id} onClick={() => setSelectedId(record.id)} type="button">
                      <span><strong>{record.firstName} {record.lastName}</strong><small>{record.id} · {record.county}</small></span>
                      <StatusBadge status={record.status} />
                    </button>
                  ))}</div>
                  : <p className="empty-state">No records yet. Create a demo report to get started.</p>}
              </section>
            </div>
          </section>
        )}

        {activeTab === "cases" && (
          <section className="page-section">
            <div className="page-heading">
              <div><p className="eyebrow">BROWSER RECORDS</p><h1>Cases</h1></div>
              <span className="result-count">{filteredRecords.length} of {records.length} cases</span>
            </div>
            <section className="panel filter-panel" aria-label="Search and filter cases">
              <label className="search-field">
                <span>Search cases</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, ID, county, description" />
              </label>
              <label><span>County</span><select value={filterCounty} onChange={(event) => setFilterCounty(event.target.value)}><option value="">All counties</option>{COUNTIES.map((county) => <option key={county}>{county}</option>)}</select></label>
              <label><span>Category</span><select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}><option value="">All categories</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label><span>Status</span><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}><option value="">All statuses</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
              <button className="text-button clear-filters" type="button" onClick={() => { setSearch(""); setFilterCounty(""); setFilterCategory(""); setFilterStatus(""); }}>Clear filters</button>
            </section>
            {filteredRecords.length
              ? <div className="case-grid">{filteredRecords.map((record) => <CaseCard key={record.id} record={record} onSelect={setSelectedId} />)}</div>
              : <section className="panel empty-state"><h2>No matching cases</h2><p>{records.length ? "Try changing or clearing the search filters." : "Create a demo report to populate this list."}</p></section>}
          </section>
        )}

        {activeTab === "map" && (
          <section className="page-section">
            <div className="page-heading"><div><p className="eyebrow">RECORD COUNTS</p><h1>County summary</h1></div></div>
            <p className="section-intro">This is a count summary, not a geographic map. Select a county to filter the case list.</p>
            <div className="county-grid">{countiesWithCases.map(({ county, total, missing }) => (
              <button
                className="county-card"
                key={county}
                onClick={() => { setFilterCounty(county); setActiveTab("cases"); }}
                type="button"
              >
                <strong>{county}</strong><span>{total} {total === 1 ? "case" : "cases"}</span>
                <small>{missing} marked missing</small>
              </button>
            ))}</div>
          </section>
        )}

        {activeTab === "links" && (
          <section className="page-section">
            <div className="page-heading"><div><p className="eyebrow">NOT CONNECTED</p><h1>External integrations</h1></div></div>
            <section className="notice integration-notice">
              <strong>No external service is connected.</strong>
              <span>The items below are future integration considerations only. This prototype sends no alerts and does not access government, police, hospital, mortuary, SMS, or Interpol systems.</span>
            </section>
            <div className="integration-grid">
              {[
                ["Police and case references", "Requires an authorized API, verified user accounts, and an agreed case-reference workflow."],
                ["Hospitals and mortuaries", "Requires approved data-sharing agreements, access controls, and a secure matching process."],
                ["Civil registration", "Requires formal authorization and privacy impact assessment before any data exchange."],
                ["Public alerts and tips", "Requires verified channels, consent rules, moderation, and abuse-prevention controls."],
              ].map(([title, description]) => (
                <article className="panel integration-card" key={title}>
                  <span className="integration-status">Not connected</span><h2>{title}</h2><p>{description}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">Missing Voices · Demonstration software · Not an official reporting channel</footer>

      {toast && <div className="toast" role="status">{toast}</div>}
      {showForm && (
        <CaseForm
          disabled={Boolean(storageError)}
          onClose={() => { setShowForm(false); setEditingRecord(null); }}
          onSave={saveCase}
          record={editingRecord}
        />
      )}
      {selectedRecord && (
        <CaseDetails
          disabled={Boolean(storageError)}
          onClose={() => setSelectedId(null)}
          onDelete={deleteCase}
          onEdit={openEditForm}
          onStatusChange={updateStatus}
          record={selectedRecord}
        />
      )}
    </div>
  );
}
