import { useState, useEffect, useRef } from "react";

// ── Seed Data ──────────────────────────────────────────────────────────────
const SEED = [
  { id:"MP-2024-001", firstName:"Amina", lastName:"Wanjiku", age:9, gender:"Female", category:"Child", county:"Nairobi", status:"Missing", reportDate:"2024-11-03", photo:"👧", description:"Last seen near Kibera Primary School wearing blue uniform.", reportedBy:"Mary Wanjiku (Mother)", contact:"0712345678", linkedHospital:null, linkedMorgue:null },
  { id:"MP-2024-002", firstName:"David", lastName:"Otieno", age:34, gender:"Male", category:"Adult", county:"Kisumu", status:"Found - Alive", reportDate:"2024-10-18", photo:"👨", description:"Found at Kisumu County Hospital with amnesia.", reportedBy:"Grace Otieno (Wife)", contact:"0723456789", linkedHospital:"Kisumu County Hospital", linkedMorgue:null },
  { id:"MP-2024-003", firstName:"Fatuma", lastName:"Hassan", age:17, gender:"Female", category:"Woman/Girl", county:"Mombasa", status:"Missing", reportDate:"2024-11-10", photo:"👩", description:"Suspected trafficking. Last seen at Likoni Ferry.", reportedBy:"Ahmed Hassan (Father)", contact:"0734567890", linkedHospital:null, linkedMorgue:null },
  { id:"MP-2024-004", firstName:"Brian", lastName:"Kamau", age:22, gender:"Male", category:"Adult", county:"Nakuru", status:"Deceased", reportDate:"2024-09-22", photo:"👦", description:"Body identified at Nakuru Mortuary on 2024-10-05.", reportedBy:"Jane Kamau (Sister)", contact:"0745678901", linkedHospital:null, linkedMorgue:"Nakuru County Mortuary" },
  { id:"MP-2024-005", firstName:"Sarah", lastName:"Muthoni", age:45, gender:"Female", category:"Woman/Girl", county:"Kirinyaga", status:"Missing", reportDate:"2024-11-01", photo:"👩", description:"Mental health history. Wandered from Kerugoya home.", reportedBy:"Peter Muthoni (Husband)", contact:"0756789012", linkedHospital:null, linkedMorgue:null },
  { id:"MP-2024-006", firstName:"Kevin", lastName:"Mutua", age:6, gender:"Male", category:"Child", county:"Machakos", status:"Found - Alive", reportDate:"2024-10-30", photo:"👦", description:"Found at Machakos Children's Home.", reportedBy:"Ann Mutua (Mother)", contact:"0767890123", linkedHospital:null, linkedMorgue:null },
  { id:"MP-2024-007", firstName:"Esther", lastName:"Achieng", age:28, gender:"Female", category:"Woman/Girl", county:"Siaya", status:"Missing", reportDate:"2024-11-12", photo:"👩", description:"Domestic violence concern. Left home after altercation.", reportedBy:"Community Chief", contact:"0778901234", linkedHospital:null, linkedMorgue:null },
  { id:"MP-2024-008", firstName:"James", lastName:"Njoroge", age:60, gender:"Male", category:"Adult", county:"Murang'a", status:"Found - Deceased", reportDate:"2024-08-15", photo:"👴", description:"Elderly man with dementia. Body found in river.", reportedBy:"Samuel Njoroge (Son)", contact:"0789012345", linkedHospital:null, linkedMorgue:"Murang'a General Hospital Mortuary" },
];

const COUNTIES = ["All Counties","Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Kisii","Nyeri","Machakos","Meru","Kakamega","Kiambu","Murang'a","Kirinyaga","Siaya","Migori","Homa Bay","Kwale","Kilifi"];
const CATEGORIES = ["All","Child","Woman/Girl","Adult","Elderly","Person with Disability"];
const STATUSES = ["All","Missing","Found - Alive","Found - Deceased","Deceased","Under Investigation"];

const STATUS_CONFIG = {
  "Missing":          { color:"#ef4444", bg:"#fef2f2", icon:"🔴" },
  "Found - Alive":    { color:"#22c55e", bg:"#f0fdf4", icon:"🟢" },
  "Found - Deceased": { color:"#64748b", bg:"#f1f5f9", icon:"⚫" },
  "Deceased":         { color:"#64748b", bg:"#f1f5f9", icon:"⚫" },
  "Under Investigation":{ color:"#f59e0b", bg:"#fffbeb", icon:"🟡" },
};

function genId() {
  const yr = new Date().getFullYear();
  const n  = Math.floor(1000 + Math.random() * 9000);
  return `MP-${yr}-${n}`;
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:"20px 24px", borderLeft:`5px solid ${color}`, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:4, minWidth:140 }}>
      <div style={{ fontSize:28 }}>{icon}</div>
      <div style={{ fontSize:32, fontWeight:800, color, fontFamily:"'Georgia', serif", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:13, fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color:"#64748b", bg:"#f1f5f9", icon:"⚪" };
  return (
    <span style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.color}40`, borderRadius:999, padding:"3px 10px", fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>
      {cfg.icon} {status}
    </span>
  );
}

// ── Report Form ────────────────────────────────────────────────────────────
function ReportForm({ onSubmit, onClose }) {
  const [form, setForm] = useState({ firstName:"", lastName:"", age:"", gender:"Female", category:"Child", county:"Nairobi", description:"", reportedBy:"", contact:"", linkedHospital:"", linkedMorgue:"" });
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.age || !form.contact) { alert("Please fill all required fields (Name, Age, Contact)."); return; }
    onSubmit({ ...form, id:genId(), status:"Missing", reportDate:new Date().toISOString().slice(0,10), photo: form.gender==="Male" ? (Number(form.age)<18?"👦":"👨") : (Number(form.age)<18?"👧":"👩") });
  };

  const fieldStyle = { width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:14, background:"#f8fafc", color:"#1e293b", outline:"none", boxSizing:"border-box" };
  const labelStyle = { display:"block", fontSize:12, fontWeight:700, color:"#475569", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.65)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:680, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 25px 80px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#006600,#cc0000)", padding:"24px 32px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🇰🇪 Report a Missing Person</div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13 }}>This report will be logged and shared with Police, Hospitals & Morgues</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:999, width:36, height:36, color:"#fff", fontSize:20, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ padding:"28px 32px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
          {[["firstName","First Name *"],["lastName","Last Name *"]].map(([k,l]) => (
            <div key={k}>
              <label style={labelStyle}>{l}</label>
              <input style={fieldStyle} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={l.replace(" *","")} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Age *</label>
            <input style={fieldStyle} type="number" value={form.age} onChange={e=>set("age",e.target.value)} placeholder="Age" />
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select style={fieldStyle} value={form.gender} onChange={e=>set("gender",e.target.value)}>
              {["Female","Male","Other"].map(g=><option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={fieldStyle} value={form.category} onChange={e=>set("category",e.target.value)}>
              {CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>County Last Seen</label>
            <select style={fieldStyle} value={form.county} onChange={e=>set("county",e.target.value)}>
              {COUNTIES.slice(1).map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={labelStyle}>Description / Circumstances</label>
            <textarea style={{...fieldStyle, height:90, resize:"vertical"}} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Physical description, last known location, circumstances..." />
          </div>
          <div>
            <label style={labelStyle}>Reported By</label>
            <input style={fieldStyle} value={form.reportedBy} onChange={e=>set("reportedBy",e.target.value)} placeholder="Full name & relationship" />
          </div>
          <div>
            <label style={labelStyle}>Contact Number *</label>
            <input style={fieldStyle} value={form.contact} onChange={e=>set("contact",e.target.value)} placeholder="07XXXXXXXX" />
          </div>
          <div>
            <label style={labelStyle}>Linked Hospital (if known)</label>
            <input style={fieldStyle} value={form.linkedHospital} onChange={e=>set("linkedHospital",e.target.value)} placeholder="Hospital name" />
          </div>
          <div>
            <label style={labelStyle}>Linked Mortuary (if known)</label>
            <input style={fieldStyle} value={form.linkedMorgue} onChange={e=>set("linkedMorgue",e.target.value)} placeholder="Mortuary name" />
          </div>
          <div style={{ gridColumn:"1/-1", display:"flex", gap:12, justifyContent:"flex-end", paddingTop:8 }}>
            <button onClick={onClose} style={{ padding:"12px 28px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", color:"#64748b", fontWeight:700, cursor:"pointer", fontSize:14 }}>Cancel</button>
            <button onClick={handleSubmit} style={{ padding:"12px 32px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#006600,#cc0000)", color:"#fff", fontWeight:800, cursor:"pointer", fontSize:14, letterSpacing:"0.03em" }}>📋 Submit Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Case Detail Modal ──────────────────────────────────────────────────────
function CaseDetail({ record, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(record.status);
  const cfg = STATUS_CONFIG[record.status] || {};

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.65)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:560, boxShadow:"0 25px 80px rgba(0,0,0,0.25)", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg, ${cfg.color||"#006600"}, #1e293b)`, padding:"28px 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:48, lineHeight:1 }}>{record.photo}</div>
              <div style={{ color:"#fff", fontSize:22, fontWeight:800, marginTop:8 }}>{record.firstName} {record.lastName}</div>
              <div style={{ color:"rgba(255,255,255,0.75)", fontSize:14 }}>{record.id} · {record.county} · Age {record.age}</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:999, width:36, height:36, color:"#fff", fontSize:20, cursor:"pointer" }}>×</button>
          </div>
        </div>
        <div style={{ padding:"24px 32px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Badge status={record.status} />
            <span style={{ background:"#f1f5f9", borderRadius:999, padding:"3px 10px", fontSize:12, fontWeight:600, color:"#475569" }}>🏷 {record.category}</span>
            <span style={{ background:"#f1f5f9", borderRadius:999, padding:"3px 10px", fontSize:12, fontWeight:600, color:"#475569" }}>📅 {record.reportDate}</span>
          </div>
          <div style={{ background:"#f8fafc", borderRadius:12, padding:16, fontSize:14, color:"#334155", lineHeight:1.6 }}>
            📝 {record.description}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["👤 Reported By", record.reportedBy],["📞 Contact", record.contact],["🏥 Hospital", record.linkedHospital||"—"],["🏛 Mortuary", record.linkedMorgue||"—"]].map(([l,v])=>(
              <div key={l} style={{ background:"#f8fafc", borderRadius:10, padding:"10px 14px" }}>
                <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, textTransform:"uppercase" }}>{l}</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#1e293b", marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Update Status */}
          <div style={{ background:"#fffbeb", borderRadius:12, padding:16, border:"1px solid #fde68a" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#92400e", marginBottom:8, textTransform:"uppercase" }}>🔄 Update Case Status</div>
            <div style={{ display:"flex", gap:8 }}>
              <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} style={{ flex:1, padding:"8px 12px", borderRadius:8, border:"1.5px solid #fde68a", background:"#fff", fontSize:13, color:"#1e293b" }}>
                {STATUSES.slice(1).map(s=><option key={s}>{s}</option>)}
              </select>
              <button onClick={()=>{onUpdateStatus(record.id,newStatus);onClose();}} style={{ padding:"8px 16px", borderRadius:8, background:"#f59e0b", border:"none", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:13 }}>Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [records, setRecords] = useState(SEED);
  const [search, setSearch] = useState("");
  const [filterCounty, setFilterCounty] = useState("All Counties");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [alert, setAlert_] = useState(null);

  const toast = (msg, color="#22c55e") => { setAlert_({msg,color}); setTimeout(()=>setAlert_(null),3500); };

  const stats = {
    total: records.length,
    missing: records.filter(r=>r.status==="Missing").length,
    foundAlive: records.filter(r=>r.status==="Found - Alive").length,
    deceased: records.filter(r=>["Deceased","Found - Deceased"].includes(r.status)).length,
    children: records.filter(r=>r.category==="Child").length,
    women: records.filter(r=>r.category==="Woman/Girl").length,
  };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${r.firstName} ${r.lastName} ${r.id} ${r.county}`.toLowerCase().includes(q);
    const matchCounty = filterCounty==="All Counties" || r.county===filterCounty;
    const matchCat    = filterCat==="All" || r.category===filterCat;
    const matchStat   = filterStatus==="All" || r.status===filterStatus;
    return matchSearch && matchCounty && matchCat && matchStat;
  });

  const addRecord = (rec) => { setRecords(p=>[rec,...p]); setShowForm(false); toast(`✅ Case ${rec.id} filed successfully!`); };
  const updateStatus = (id, status) => { setRecords(p=>p.map(r=>r.id===id?{...r,status}:r)); toast(`🔄 Case ${id} updated to: ${status}`, "#3b82f6"); };

  const navItems = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"cases", icon:"🔍", label:"Search Cases" },
    { id:"map", icon:"🗺", label:"County Map" },
    { id:"links", icon:"🔗", label:"System Links" },
  ];

  // County distribution for mini chart
  const countyStats = COUNTIES.slice(1).map(c=>({ name:c, count:records.filter(r=>r.county===c).length })).filter(x=>x.count>0).sort((a,b)=>b.count-a.count).slice(0,8);

  return (
    <div style={{ fontFamily:"'Trebuchet MS', sans-serif", background:"#f0f4f8", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* Toast */}
      {alert && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:alert.color, color:"#fff", padding:"14px 24px", borderRadius:12, fontWeight:700, boxShadow:"0 8px 32px rgba(0,0,0,0.2)", fontSize:15, maxWidth:360 }}>
          {alert.msg}
        </div>
      )}

      {/* Top Bar */}
      <div style={{ background:"linear-gradient(135deg,#006600 0%,#004400 50%,#cc0000 100%)", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:68 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:36 }}>🇰🇪</div>
          <div>
            <div style={{ color:"#fff", fontSize:18, fontWeight:900, letterSpacing:"0.02em", lineHeight:1.1 }}>KENYA MISSING PERSONS DATABASE</div>
            <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase" }}>National Unified Registry · Police · Hospitals · Morgues · Civil Registry</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 14px", color:"rgba(255,255,255,0.9)", fontSize:12, fontWeight:600 }}>
            🕐 {new Date().toLocaleString("en-KE",{dateStyle:"medium",timeStyle:"short"})}
          </div>
          <button onClick={()=>setShowForm(true)} style={{ background:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:800, color:"#006600", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
            ＋ Report Missing Person
          </button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background:"#fff", borderBottom:"1.5px solid #e2e8f0", padding:"0 32px", display:"flex", gap:4 }}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setActiveTab(n.id)} style={{ padding:"14px 20px", border:"none", background:"none", borderBottom:`3px solid ${activeTab===n.id?"#006600":"transparent"}`, color:activeTab===n.id?"#006600":"#64748b", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            {n.icon} {n.label}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, padding:"8px 0" }}>
          <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>LIVE REGISTRY</span>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", animation:"pulse 2s infinite" }} />
        </div>
      </div>

      <div style={{ flex:1, padding:"28px 32px", maxWidth:1400, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab==="dashboard" && (
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {/* Stats Row */}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              <StatCard label="Total Cases" value={stats.total} color="#3b82f6" icon="📋" sub="All time registered" />
              <StatCard label="Still Missing" value={stats.missing} color="#ef4444" icon="🔴" sub="Urgent — active search" />
              <StatCard label="Found Alive" value={stats.foundAlive} color="#22c55e" icon="✅" sub="Successfully located" />
              <StatCard label="Deceased" value={stats.deceased} color="#64748b" icon="⚫" sub="Confirmed deaths" />
              <StatCard label="Children" value={stats.children} color="#f59e0b" icon="🧒" sub="Under 18" />
              <StatCard label="Women & Girls" value={stats.women} color="#ec4899" icon="👩" sub="Female cases" />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* County Breakdown */}
              <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#1e293b", marginBottom:16 }}>📍 Cases by County</div>
                {countyStats.map(c => (
                  <div key={c.name} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:100, fontSize:13, color:"#475569", fontWeight:600 }}>{c.name}</div>
                    <div style={{ flex:1, background:"#f1f5f9", borderRadius:999, height:14, overflow:"hidden" }}>
                      <div style={{ width:`${(c.count/records.length)*100}%`, background:"linear-gradient(90deg,#006600,#22c55e)", height:"100%", borderRadius:999, minWidth:8 }} />
                    </div>
                    <div style={{ width:24, textAlign:"right", fontSize:13, fontWeight:800, color:"#006600" }}>{c.count}</div>
                  </div>
                ))}
              </div>

              {/* Status Breakdown */}
              <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#1e293b", marginBottom:16 }}>📊 Status Breakdown</div>
                {STATUSES.slice(1).map(s => {
                  const count = records.filter(r=>r.status===s).length;
                  const cfg = STATUS_CONFIG[s]||{};
                  return (
                    <div key={s} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, cursor:"pointer" }} onClick={()=>{setFilterStatus(s);setActiveTab("cases");}}>
                      <span style={{ fontSize:18 }}>{cfg.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:"#334155" }}>{s}</span>
                          <span style={{ fontSize:13, fontWeight:800, color:cfg.color }}>{count}</span>
                        </div>
                        <div style={{ background:"#f1f5f9", borderRadius:999, height:8, overflow:"hidden" }}>
                          <div style={{ width:`${records.length?((count/records.length)*100):0}%`, background:cfg.color, height:"100%", borderRadius:999, minWidth:count>0?6:0 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Cases */}
            <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#1e293b" }}>🕐 Recently Filed Cases</div>
                <button onClick={()=>setActiveTab("cases")} style={{ background:"#f1f5f9", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, color:"#475569", cursor:"pointer" }}>View All →</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {records.slice(0,5).map(r=>(
                  <div key={r.id} onClick={()=>setSelected(r)} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", borderRadius:12, background:"#f8fafc", cursor:"pointer", transition:"background 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                    onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
                    <span style={{ fontSize:28 }}>{r.photo}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:"#1e293b", fontSize:15 }}>{r.firstName} {r.lastName}</div>
                      <div style={{ color:"#64748b", fontSize:12 }}>{r.id} · {r.county} · {r.category}</div>
                    </div>
                    <Badge status={r.status} />
                    <div style={{ fontSize:12, color:"#94a3b8" }}>{r.reportDate}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CASES TAB ── */}
        {activeTab==="cases" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Search & Filters */}
            <div style={{ background:"#fff", borderRadius:16, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ flex:2, minWidth:220, position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, ID, county…" style={{ width:"100%", padding:"11px 14px 11px 42px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:14, background:"#f8fafc", color:"#1e293b", boxSizing:"border-box", outline:"none" }} />
              </div>
              {[[COUNTIES,"filterCounty",filterCounty,setFilterCounty],[STATUSES,"status",filterStatus,setFilterStatus],[CATEGORIES,"category",filterCat,setFilterCat]].map(([opts,key,val,setter])=>(
                <select key={key} value={val} onChange={e=>setter(e.target.value)} style={{ padding:"11px 14px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13, color:"#334155", background:"#f8fafc", minWidth:140, cursor:"pointer" }}>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              ))}
              <div style={{ marginLeft:"auto", fontSize:13, color:"#64748b", fontWeight:600, whiteSpace:"nowrap" }}>
                {filtered.length} of {records.length} cases
              </div>
            </div>

            {/* Results */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:16 }}>
              {filtered.length===0 && (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:"#94a3b8", fontSize:16 }}>No cases match your filters.</div>
              )}
              {filtered.map(r=>(
                <div key={r.id} onClick={()=>setSelected(r)} style={{ background:"#fff", borderRadius:16, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", cursor:"pointer", borderLeft:`4px solid ${STATUS_CONFIG[r.status]?.color||"#e2e8f0"}`, transition:"transform 0.15s,box-shadow 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)"}}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontSize:36 }}>{r.photo}</span>
                    <Badge status={r.status} />
                  </div>
                  <div style={{ fontWeight:800, fontSize:17, color:"#1e293b" }}>{r.firstName} {r.lastName}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginBottom:8 }}>{r.id}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                    {[`📍 ${r.county}`, `🏷 ${r.category}`, `🎂 Age ${r.age}`].map(t=>(
                      <span key={t} style={{ background:"#f1f5f9", borderRadius:6, padding:"2px 8px", fontSize:11, color:"#475569", fontWeight:600 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>{r.description?.slice(0,90)}{r.description?.length>90?"…":""}</div>
                  <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid #f1f5f9", fontSize:11, color:"#94a3b8", display:"flex", justifyContent:"space-between" }}>
                    <span>📅 {r.reportDate}</span>
                    {(r.linkedHospital||r.linkedMorgue) && <span style={{ color:"#3b82f6", fontWeight:700 }}>🔗 Linked</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MAP TAB ── */}
        {activeTab==="map" && (
          <div style={{ background:"#fff", borderRadius:16, padding:28, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:18, fontWeight:800, color:"#1e293b", marginBottom:6 }}>🗺 County-Level Case Distribution</div>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:24 }}>Cases mapped across Kenya's 47 counties. Click a county card to filter cases.</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
              {COUNTIES.slice(1).map(county => {
                const total = records.filter(r=>r.county===county).length;
                const miss  = records.filter(r=>r.county===county && r.status==="Missing").length;
                if (!total) return (
                  <div key={county} style={{ background:"#f8fafc", borderRadius:12, padding:16, opacity:0.4 }}>
                    <div style={{ fontWeight:700, color:"#94a3b8", marginBottom:4 }}>📍 {county}</div>
                    <div style={{ fontSize:12, color:"#cbd5e1" }}>No cases</div>
                  </div>
                );
                return (
                  <div key={county} onClick={()=>{setFilterCounty(county);setActiveTab("cases");}} style={{ background: miss>0?"#fef2f2":"#f0fdf4", borderRadius:12, padding:16, cursor:"pointer", border:`1.5px solid ${miss>0?"#fecaca":"#bbf7d0"}`, transition:"transform 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"}
                    onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    <div style={{ fontWeight:800, color:"#1e293b", marginBottom:6 }}>📍 {county}</div>
                    <div style={{ fontSize:22, fontWeight:900, color: miss>0?"#ef4444":"#22c55e" }}>{total}</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>total · {miss} missing</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SYSTEM LINKS TAB ── */}
        {activeTab==="links" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ background:"linear-gradient(135deg,#1e293b,#334155)", borderRadius:16, padding:28, color:"#fff" }}>
              <div style={{ fontSize:20, fontWeight:900, marginBottom:6 }}>🔗 Unified System Integration</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.7)" }}>This database is designed to link with Kenya's existing institutional systems for a complete missing persons ecosystem.</div>
            </div>
            {[
              { icon:"👮", title:"Kenya Police Service", desc:"OB report numbers automatically linked to case IDs. Alerts sent to nearest police station on new reports.", color:"#1d4ed8", status:"Integration Ready", details:["Auto-generate Police OB number","Push alerts to DCI Missing Persons Unit","Sync with IPRS (Integrated Population Registration System)"] },
              { icon:"🏥", title:"Hospitals & Health Facilities", desc:"Unidentified patients matched against missing persons database using age, gender, county filters.", color:"#059669", status:"Integration Ready", details:["KEMSA & county hospital network sync","Unidentified patient cross-match alerts","Discharge notifications"] },
              { icon:"🏛", title:"Government Mortuary Network", desc:"All unidentified bodies logged with description and DNA reference for matching.", color:"#7c3aed", status:"Integration Ready", details:["Daily morgue intake reports","DNA reference database linkage","Death certificate auto-cross-check"] },
              { icon:"📋", title:"Civil Registration (eCitizen)", desc:"Link death certificates and birth records to flag anomalies for missing persons cases.", color:"#b45309", status:"Planned", details:["Death cert issued → cross-check missing list","Birth registration anomaly alerts","National ID database integration"] },
              { icon:"📱", title:"SMS / USSD Alert System", desc:"Send alerts to public via SMS when a missing person is reported near their county.", color:"#dc2626", status:"Planned", details:["USSD *#123# portal for public tips","Safaricom/Airtel bulk SMS alerts","WhatsApp Business API tip line"] },
              { icon:"🌍", title:"Interpol / Regional Bodies", desc:"Flag cross-border cases to Interpol and East Africa regional police networks.", color:"#0891b2", status:"Planned", details:["Interpol Green/Yellow notice generation","East African Police Chiefs Cooperation","Tanzania, Uganda, Ethiopia data sharing"] },
            ].map(s=>(
              <div key={s.title} style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", gap:20, alignItems:"flex-start" }}>
                <div style={{ width:52, height:52, borderRadius:14, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{s.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <div style={{ fontWeight:800, fontSize:16, color:"#1e293b" }}>{s.title}</div>
                    <span style={{ background: s.status==="Integration Ready"?"#dcfce7":"#fef9c3", color: s.status==="Integration Ready"?"#166534":"#92400e", borderRadius:999, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{s.status}</span>
                  </div>
                  <div style={{ fontSize:13, color:"#475569", marginBottom:10 }}>{s.desc}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {s.details.map(d=>(
                      <span key={d} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"4px 10px", fontSize:12, color:"#334155" }}>✓ {d}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && <ReportForm onSubmit={addRecord} onClose={()=>setShowForm(false)} />}
      {selected && <CaseDetail record={selected} onClose={()=>setSelected(null)} onUpdateStatus={updateStatus} />}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
