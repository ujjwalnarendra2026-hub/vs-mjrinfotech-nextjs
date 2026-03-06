"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download, Eye, EyeOff, LogOut, MessageSquare, Mail, Search, RefreshCw,
  Save, Briefcase, Plus, Trash2, ToggleLeft, ToggleRight, PenLine, X, Check,
  Users, Award, Upload, ChevronUp, ChevronDown as ChevronDownIcon, FileText,
} from "lucide-react";

const SESSION_KEY = "admin_token_v2";

type InvokeResult = {
  data: any;
  error: { message: string } | null;
};

const supabase = {
  functions: {
    invoke: async (_name: string, payload: { body: Record<string, unknown> }): Promise<InvokeResult> => {
      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload.body),
        });
        const data = await res.json();
        if (!res.ok) {
          return { data, error: { message: data?.error || "Request failed" } };
        }
        return { data, error: null };
      } catch {
        return { data: null, error: { message: "Request failed" } };
      }
    },
  },
};

// ── Types ──────────────────────────────────────────────────────────────────────
type ContactEntry = {
  id: string; name: string; email: string; phone: string | null;
  subject: string | null; message: string; admin_notes: string | null;
  status: string; ip_address: string | null; created_at: string;
};
type NewsletterEntry = {
  id: string; name: string; email: string; admin_notes: string | null;
  status: string; ip_address: string | null; created_at: string;
};
type CareerEntry = {
  id: string; name: string; email: string; phone: string | null;
  position: string; cover_letter: string | null; linkedin_url: string | null;
  admin_notes: string | null; status: string; ip_address: string | null; created_at: string;
};
type OpenPosition = {
  id: string; title: string; department: string | null; location: string | null;
  type: string | null; description: string | null; is_active: boolean; created_at: string;
};
type ClientEntry = {
  id: string; name: string; logo_url: string; sort_order: number; is_active: boolean; created_at: string;
};
type CertEntry = {
  id: string; name: string; file_url: string; thumbnail_url: string | null;
  sort_order: number; is_active: boolean; created_at: string;
};

type Tab = "contacts" | "newsletter" | "careers" | "positions" | "clients" | "certificates";

const emptyPosition = { title: "", department: "", location: "", type: "Full-time", description: "" };

// ── File validation ────────────────────────────────────────────────────────────
const CLIENT_LOGO_MAX = 2 * 1024 * 1024; // 2 MB
const CLIENT_LOGO_EXTS = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
const CERT_FILE_MAX = 10 * 1024 * 1024; // 10 MB
const CERT_FILE_EXTS = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];

function validateFile(file: File, maxBytes: number, allowedTypes: string[]): string | null {
  if (!allowedTypes.includes(file.type)) {
    const exts = allowedTypes.map(t => t.split("/")[1].toUpperCase()).join(", ");
    return `Invalid file type. Allowed: ${exts}`;
  }
  if (file.size > maxBytes) {
    return `File too large. Max size: ${Math.round(maxBytes / 1024 / 1024)} MB`;
  }
  return null;
}

// ── Upload helper using signed URL ─────────────────────────────────────────────
async function uploadFile(
  adminToken: string,
  bucket: "client-logos" | "certificates",
  file: File
): Promise<string> {
  // 1. Get signed upload URL
  const { data: urlData, error: urlError } = await supabase.functions.invoke("admin-data", {
    body: { action: "get_upload_url", token: adminToken, bucket, filename: file.name },
  });
  if (urlError || urlData?.error) throw new Error(urlData?.error || "Failed to get upload URL");

  const { signedUrl, token, publicUrl } = urlData;

  // 2. Upload directly to storage via signed URL
  const res = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("File upload failed");
  return publicUrl;
}

// ── Admin Page ─────────────────────────────────────────────────────────────────
const AdminPage = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("contacts");
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterEntry[]>([]);
  const [careers, setCareers] = useState<CareerEntry[]>([]);
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [certs, setCerts] = useState<CertEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminPwd, setAdminPwd] = useState("");

  // Position form
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<OpenPosition | null>(null);
  const [positionForm, setPositionForm] = useState(emptyPosition);
  const [savingPosition, setSavingPosition] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Client form
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "" });
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [clientFileError, setClientFileError] = useState("");
  const [savingClient, setSavingClient] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [reorderingClients, setReorderingClients] = useState(false);
  const clientFileRef = useRef<HTMLInputElement>(null);

  // Certificate form
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({ name: "" });
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certThumbFile, setCertThumbFile] = useState<File | null>(null);
  const [certFileError, setCertFileError] = useState("");
  const [certThumbError, setCertThumbError] = useState("");
  const [savingCert, setSavingCert] = useState(false);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const certFileRef = useRef<HTMLInputElement>(null);
  const certThumbRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) { setAdminPwd(stored); setIsAuth(true); }
  }, []);

  useEffect(() => { if (isAuth && adminPwd) fetchData(); }, [isAuth, tab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { data, error } = await supabase.functions.invoke("admin-data", {
      body: { action: "login", password },
    });
    if (error || data?.error) { setLoginError("Incorrect password. Please try again."); return; }
    const token = data.token;
    sessionStorage.setItem(SESSION_KEY, token);
    setAdminPwd(token);
    setIsAuth(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuth(false); setPassword(""); setAdminPwd("");
  };

  const fetchData = async () => {
    setLoading(true);
    const tableMap: Record<Tab, string> = {
      contacts: "contact_submissions",
      newsletter: "newsletter_subscribers",
      careers: "career_applications",
      positions: "open_positions",
      clients: "clients",
      certificates: "certificates",
    };
    const { data } = await supabase.functions.invoke("admin-data", {
      body: { action: "fetch", token: adminPwd, table: tableMap[tab] },
    });
    if (data?.data) {
      if (tab === "contacts") setContacts(data.data);
      else if (tab === "newsletter") setSubscribers(data.data);
      else if (tab === "careers") setCareers(data.data);
      else if (tab === "positions") setPositions(data.data);
      else if (tab === "clients") setClients(data.data);
      else if (tab === "certificates") setCerts(data.data);
    }
    setLoading(false);
  };

  const saveNote = async (id: string, table: "contact_submissions" | "newsletter_subscribers" | "career_applications") => {
    setSavingNote(id);
    await supabase.functions.invoke("admin-data", {
      body: { action: "update_notes", token: adminPwd, table, id, notes: editNotes[id] ?? "" },
    });
    setSavingNote(null);
    if (table === "contact_submissions") setContacts((p) => p.map((c) => c.id === id ? { ...c, admin_notes: editNotes[id] } : c));
    else if (table === "newsletter_subscribers") setSubscribers((p) => p.map((s) => s.id === id ? { ...s, admin_notes: editNotes[id] } : s));
    else setCareers((p) => p.map((a) => a.id === id ? { ...a, admin_notes: editNotes[id] } : a));
  };

  // ── Open Positions CRUD ──────────────────────────────────────────────────────
  const openAddPosition = () => { setEditingPosition(null); setPositionForm(emptyPosition); setShowPositionForm(true); };
  const openEditPosition = (pos: OpenPosition) => {
    setEditingPosition(pos);
    setPositionForm({ title: pos.title, department: pos.department || "", location: pos.location || "", type: pos.type || "Full-time", description: pos.description || "" });
    setShowPositionForm(true);
  };
  const savePosition = async () => {
    if (!positionForm.title.trim()) return;
    setSavingPosition(true);
    if (editingPosition) {
      await supabase.functions.invoke("admin-data", {
        body: { action: "update_position", token: adminPwd, id: editingPosition.id, positionData: positionForm },
      });
      setPositions((p) => p.map((x) => x.id === editingPosition.id ? { ...x, ...positionForm, department: positionForm.department || null, location: positionForm.location || null, description: positionForm.description || null } : x));
    } else {
      const { data } = await supabase.functions.invoke("admin-data", {
        body: { action: "create_position", token: adminPwd, positionData: positionForm },
      });
      if (data?.data) setPositions((p) => [data.data, ...p]);
    }
    setSavingPosition(false);
    setShowPositionForm(false);
  };
  const togglePosition = async (pos: OpenPosition) => {
    setTogglingId(pos.id);
    await supabase.functions.invoke("admin-data", {
      body: { action: "update_position", token: adminPwd, id: pos.id, positionData: { is_active: !pos.is_active } },
    });
    setPositions((p) => p.map((x) => x.id === pos.id ? { ...x, is_active: !pos.is_active } : x));
    setTogglingId(null);
  };
  const deletePosition = async (id: string) => {
    if (!confirm("Delete this position?")) return;
    setDeletingId(id);
    await supabase.functions.invoke("admin-data", { body: { action: "delete_position", token: adminPwd, id } });
    setPositions((p) => p.filter((x) => x.id !== id));
    setDeletingId(null);
  };

  // ── Clients CRUD ─────────────────────────────────────────────────────────────
  const handleClientFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, CLIENT_LOGO_MAX, CLIENT_LOGO_EXTS);
    setClientFileError(err || "");
    if (!err) setClientFile(file);
    else setClientFile(null);
  };

  const saveClient = async () => {
    if (!clientForm.name.trim() || !clientFile) return;
    setSavingClient(true);
    try {
      const logoUrl = await uploadFile(adminPwd, "client-logos", clientFile);
      const { data } = await supabase.functions.invoke("admin-data", {
        body: { action: "create_client", token: adminPwd, clientData: { name: clientForm.name, logo_url: logoUrl } },
      });
      if (data?.data) setClients((p) => [...p, data.data]);
      setShowClientForm(false);
      setClientForm({ name: "" });
      setClientFile(null);
      if (clientFileRef.current) clientFileRef.current.value = "";
    } catch (err) {
      alert("Upload failed. Please try again.");
    }
    setSavingClient(false);
  };

  const deleteClient = async (c: ClientEntry) => {
    if (!confirm(`Delete client "${c.name}"?`)) return;
    setDeletingClientId(c.id);
    await supabase.functions.invoke("admin-data", {
      body: { action: "delete_storage_file", token: adminPwd, bucket: "client-logos", path: c.logo_url },
    });
    await supabase.functions.invoke("admin-data", { body: { action: "delete_client", token: adminPwd, id: c.id } });
    setClients((p) => p.filter((x) => x.id !== c.id));
    setDeletingClientId(null);
  };

  const moveClient = async (index: number, dir: "up" | "down") => {
    const newClients = [...clients];
    const swapIdx = dir === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newClients.length) return;
    [newClients[index], newClients[swapIdx]] = [newClients[swapIdx], newClients[index]];
    setClients(newClients);
    setReorderingClients(true);
    await supabase.functions.invoke("admin-data", {
      body: { action: "reorder_clients", token: adminPwd, orderedIds: newClients.map((c) => c.id) },
    });
    setReorderingClients(false);
  };

  const toggleClient = async (c: ClientEntry) => {
    await supabase.functions.invoke("admin-data", {
      body: { action: "update_client", token: adminPwd, id: c.id, clientData: { is_active: !c.is_active } },
    });
    setClients((p) => p.map((x) => x.id === c.id ? { ...x, is_active: !c.is_active } : x));
  };

  // ── Certificates CRUD ────────────────────────────────────────────────────────
  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, CERT_FILE_MAX, CERT_FILE_EXTS);
    setCertFileError(err || "");
    if (!err) setCertFile(file);
    else setCertFile(null);
  };

  const handleCertThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imgTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const err = validateFile(file, 2 * 1024 * 1024, imgTypes);
    setCertThumbError(err || "");
    if (!err) setCertThumbFile(file);
    else setCertThumbFile(null);
  };

  const saveCert = async () => {
    if (!certForm.name.trim() || !certFile) return;
    setSavingCert(true);
    try {
      const fileUrl = await uploadFile(adminPwd, "certificates", certFile);
      let thumbUrl: string | null = null;
      if (certThumbFile) {
        thumbUrl = await uploadFile(adminPwd, "certificates", certThumbFile);
      }
      const { data } = await supabase.functions.invoke("admin-data", {
        body: { action: "create_certificate", token: adminPwd, certData: { name: certForm.name, file_url: fileUrl, thumbnail_url: thumbUrl } },
      });
      if (data?.data) setCerts((p) => [...p, data.data]);
      setShowCertForm(false);
      setCertForm({ name: "" });
      setCertFile(null);
      setCertThumbFile(null);
      if (certFileRef.current) certFileRef.current.value = "";
      if (certThumbRef.current) certThumbRef.current.value = "";
    } catch (err) {
      alert("Upload failed. Please try again.");
    }
    setSavingCert(false);
  };

  const deleteCert = async (c: CertEntry) => {
    if (!confirm(`Delete certificate "${c.name}"?`)) return;
    setDeletingCertId(c.id);
    await supabase.functions.invoke("admin-data", {
      body: { action: "delete_storage_file", token: adminPwd, bucket: "certificates", path: c.file_url },
    });
    if (c.thumbnail_url) {
      await supabase.functions.invoke("admin-data", {
        body: { action: "delete_storage_file", token: adminPwd, bucket: "certificates", path: c.thumbnail_url },
      });
    }
    await supabase.functions.invoke("admin-data", { body: { action: "delete_certificate", token: adminPwd, id: c.id } });
    setCerts((p) => p.filter((x) => x.id !== c.id));
    setDeletingCertId(null);
  };

  const moveCert = async (index: number, dir: "up" | "down") => {
    const newCerts = [...certs];
    const swapIdx = dir === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newCerts.length) return;
    [newCerts[index], newCerts[swapIdx]] = [newCerts[swapIdx], newCerts[index]];
    setCerts(newCerts);
    await supabase.functions.invoke("admin-data", {
      body: { action: "reorder_certificates", token: adminPwd, orderedIds: newCerts.map((c) => c.id) },
    });
  };

  const toggleCert = async (c: CertEntry) => {
    await supabase.functions.invoke("admin-data", {
      body: { action: "update_certificate", token: adminPwd, id: c.id, certData: { is_active: !c.is_active } },
    });
    setCerts((p) => p.map((x) => x.id === c.id ? { ...x, is_active: !c.is_active } : x));
  };

  // ── CSV Export ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (tab === "contacts") {
      const headers = ["ID", "Name", "Email", "Phone", "Subject", "Message", "Status", "Notes", "IP", "Created At"];
      const rows = contacts.map((c) => [c.id, c.name, c.email, c.phone || "", c.subject || "", `"${c.message.replace(/"/g, '""')}"`, c.status, `"${(c.admin_notes || "").replace(/"/g, '""')}"`, c.ip_address || "", c.created_at]);
      downloadCSV(headers, rows, "contact_submissions.csv");
    } else if (tab === "newsletter") {
      const headers = ["ID", "Name", "Email", "Status", "Notes", "IP", "Created At"];
      const rows = subscribers.map((s) => [s.id, s.name, s.email, s.status, `"${(s.admin_notes || "").replace(/"/g, '""')}"`, s.ip_address || "", s.created_at]);
      downloadCSV(headers, rows, "newsletter_subscribers.csv");
    } else if (tab === "careers") {
      const headers = ["ID", "Name", "Email", "Phone", "Position", "LinkedIn", "Status", "Notes", "IP", "Created At"];
      const rows = careers.map((a) => [a.id, a.name, a.email, a.phone || "", a.position, a.linkedin_url || "", a.status, `"${(a.admin_notes || "").replace(/"/g, '""')}"`, a.ip_address || "", a.created_at]);
      downloadCSV(headers, rows, "career_applications.csv");
    }
  };

  const downloadCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const filteredContacts = contacts.filter((c) => [c.name, c.email, c.subject || ""].some((v) => v.toLowerCase().includes(search.toLowerCase())));
  const filteredSubscribers = subscribers.filter((s) => [s.name, s.email].some((v) => v.toLowerCase().includes(search.toLowerCase())));
  const filteredCareers = careers.filter((a) => [a.name, a.email, a.position].some((v) => v.toLowerCase().includes(search.toLowerCase())));
  const filteredPositions = positions.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
  const filteredClients = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCerts = certs.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const NoteCell = ({ id, initialNote, tableKey }: { id: string; initialNote: string | null; tableKey: "contact_submissions" | "newsletter_subscribers" | "career_applications" }) => (
    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
      <input
        type="text" placeholder="Add note..."
        value={editNotes[id] ?? (initialNote || "")}
        onChange={(e) => setEditNotes({ ...editNotes, [id]: e.target.value })}
        className="border rounded px-2 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-green-400"
      />
      <button onClick={() => saveNote(id, tableKey)} disabled={savingNote === id} className="text-green-600 hover:text-green-800">
        {savingNote === id ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
      </button>
    </div>
  );

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-sm">
          <div className="text-center mb-6">
            <img src="/images/vs-mjr-logo.png" alt="VS-MJR" className="h-10 mx-auto mb-4 object-contain" />
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"} placeholder="Admin Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
            <button type="submit" className="w-full font-bold py-3 rounded-lg text-white" style={{ background: "linear-gradient(90deg, #16a34a 0%, #15803d 100%)" }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabButtons: { key: Tab; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    { key: "contacts", label: "Contacts", icon: <MessageSquare size={14} />, count: contacts.length, color: "#16a34a" },
    { key: "newsletter", label: "Newsletter", icon: <Mail size={14} />, count: subscribers.length, color: "#2563eb" },
    { key: "careers", label: "Applications", icon: <Briefcase size={14} />, count: careers.length, color: "#7c3aed" },
    { key: "positions", label: "Open Positions", icon: <Plus size={14} />, count: positions.length, color: "#0891b2" },
    { key: "clients", label: "Clients", icon: <Users size={14} />, count: clients.length, color: "#ea580c" },
    { key: "certificates", label: "Certificates", icon: <Award size={14} />, count: certs.length, color: "#db2777" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/vs-mjr-logo.png" alt="VS-MJR" className="h-8 object-contain" />
            <span className="font-bold text-gray-800 text-lg">Admin Panel</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Contacts", value: contacts.length, color: "text-gray-800" },
            { label: "New Contacts", value: contacts.filter((c) => c.status === "new").length, color: "text-green-600" },
            { label: "Job Applications", value: careers.length, color: "text-purple-600" },
            { label: "Active Clients", value: clients.filter((c) => c.is_active).length, color: "text-orange-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Tabs + toolbar */}
          <div className="flex items-center justify-between p-4 border-b flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {tabButtons.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSearch(""); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t.key ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  style={tab === t.key ? { background: t.color } : {}}
                >
                  {t.icon} {t.label} ({t.count})
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {tab !== "clients" && tab !== "certificates" && (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 w-40" />
                </div>
              )}
              <button onClick={fetchData} className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg" title="Refresh">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              {tab === "positions" && (
                <button onClick={openAddPosition} className="flex items-center gap-1.5 px-3 py-2 text-white text-sm rounded-lg" style={{ background: "#0891b2" }}>
                  <Plus size={14} /> Add Position
                </button>
              )}
              {tab === "clients" && (
                <button onClick={() => setShowClientForm(true)} className="flex items-center gap-1.5 px-3 py-2 text-white text-sm rounded-lg" style={{ background: "#ea580c" }}>
                  <Plus size={14} /> Add Client
                </button>
              )}
              {tab === "certificates" && (
                <button onClick={() => setShowCertForm(true)} className="flex items-center gap-1.5 px-3 py-2 text-white text-sm rounded-lg" style={{ background: "#db2777" }}>
                  <Plus size={14} /> Add Certificate
                </button>
              )}
              {(tab === "contacts" || tab === "newsletter" || tab === "careers") && (
                <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-white text-sm rounded-lg" style={{ background: "#1e293b" }}>
                  <Download size={14} /> CSV
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2" /> Loading...
            </div>
          ) : (
            <>
              {/* ── Contacts ── */}
              {tab === "contacts" && (
                <div className="overflow-x-auto">
                  {filteredContacts.length === 0 ? <p className="p-8 text-center text-gray-400">No contact submissions yet.</p> : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">#</th>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Email</th>
                          <th className="px-4 py-3 text-left">Subject</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContacts.map((c, i) => (
                          <>
                            <tr key={c.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                              <td className="px-4 py-3 text-blue-600">{c.email}</td>
                              <td className="px-4 py-3 text-gray-600">{c.subject || "—"}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "new" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(c.created_at)}</td>
                              <td className="px-4 py-3"><NoteCell id={c.id} initialNote={c.admin_notes} tableKey="contact_submissions" /></td>
                            </tr>
                            {expandedId === c.id && (
                              <tr key={`${c.id}-d`} className="bg-blue-50 border-t">
                                <td colSpan={7} className="px-4 py-3 text-sm text-gray-700">
                                  <div className="flex gap-6 flex-wrap">
                                    <span><strong>Phone:</strong> {c.phone || "N/A"}</span>
                                    <span><strong>IP:</strong> {c.ip_address || "N/A"}</span>
                                  </div>
                                  <p className="mt-2"><strong>Message:</strong></p>
                                  <p className="mt-1 whitespace-pre-wrap text-gray-600">{c.message}</p>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Newsletter ── */}
              {tab === "newsletter" && (
                <div className="overflow-x-auto">
                  {filteredSubscribers.length === 0 ? <p className="p-8 text-center text-gray-400">No newsletter subscribers yet.</p> : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">#</th>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Email</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubscribers.map((s, i) => (
                          <tr key={s.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                            <td className="px-4 py-3 text-blue-600">{s.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === "active" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{s.status}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(s.created_at)}</td>
                            <td className="px-4 py-3"><NoteCell id={s.id} initialNote={s.admin_notes} tableKey="newsletter_subscribers" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Career Applications ── */}
              {tab === "careers" && (
                <div className="overflow-x-auto">
                  {filteredCareers.length === 0 ? <p className="p-8 text-center text-gray-400">No career applications yet.</p> : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">#</th>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Email</th>
                          <th className="px-4 py-3 text-left">Position</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCareers.map((a, i) => (
                          <>
                            <tr key={a.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                              <td className="px-4 py-3 text-blue-600">{a.email}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{a.position}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === "new" ? "bg-green-100 text-green-700" : a.status === "reviewed" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{a.status}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(a.created_at)}</td>
                              <td className="px-4 py-3"><NoteCell id={a.id} initialNote={a.admin_notes} tableKey="career_applications" /></td>
                            </tr>
                            {expandedId === a.id && (
                              <tr key={`${a.id}-d`} className="bg-purple-50 border-t">
                                <td colSpan={7} className="px-4 py-3 text-sm text-gray-700">
                                  <div className="flex gap-6 flex-wrap mb-2">
                                    <span><strong>Phone:</strong> {a.phone || "N/A"}</span>
                                    {a.linkedin_url && <span><strong>LinkedIn:</strong> <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{a.linkedin_url}</a></span>}
                                    <span><strong>IP:</strong> {a.ip_address || "N/A"}</span>
                                  </div>
                                  {a.cover_letter && (<><p className="mt-1"><strong>Cover Letter:</strong></p><p className="mt-1 whitespace-pre-wrap text-gray-600">{a.cover_letter}</p></>)}
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Open Positions ── */}
              {tab === "positions" && (
                <div className="overflow-x-auto">
                  {filteredPositions.length === 0 ? (
                    <div className="p-12 text-center">
                      <Briefcase size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">No open positions yet.</p>
                      <button onClick={openAddPosition} className="px-4 py-2 text-white text-sm rounded-lg" style={{ background: "#0891b2" }}>
                        <Plus size={14} className="inline mr-1" /> Add First Position
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">#</th>
                          <th className="px-4 py-3 text-left">Title</th>
                          <th className="px-4 py-3 text-left">Department</th>
                          <th className="px-4 py-3 text-left">Location</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPositions.map((pos, i) => (
                          <tr key={pos.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{pos.title}</td>
                            <td className="px-4 py-3 text-gray-600">{pos.department || "—"}</td>
                            <td className="px-4 py-3 text-gray-600">{pos.location || "—"}</td>
                            <td className="px-4 py-3 text-gray-600">{pos.type || "—"}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${pos.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {pos.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEditPosition(pos)} className="text-gray-500 hover:text-gray-800" title="Edit"><PenLine size={14} /></button>
                                <button onClick={() => togglePosition(pos)} disabled={togglingId === pos.id} className={pos.is_active ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"} title={pos.is_active ? "Deactivate" : "Activate"}>
                                  {togglingId === pos.id ? <RefreshCw size={14} className="animate-spin" /> : pos.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                </button>
                                <button onClick={() => deletePosition(pos.id)} disabled={deletingId === pos.id} className="text-red-400 hover:text-red-600" title="Delete">
                                  {deletingId === pos.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Clients ── */}
              {tab === "clients" && (
                <div className="overflow-x-auto">
                  {filteredClients.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">No clients yet. Add your first client logo.</p>
                      <button onClick={() => setShowClientForm(true)} className="px-4 py-2 text-white text-sm rounded-lg" style={{ background: "#ea580c" }}>
                        <Plus size={14} className="inline mr-1" /> Add First Client
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Order</th>
                          <th className="px-4 py-3 text-left">Logo</th>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.map((c, i) => (
                          <tr key={c.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <button onClick={() => moveClient(i, "up")} disabled={i === 0 || reorderingClients} className="text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp size={14} /></button>
                                <button onClick={() => moveClient(i, "down")} disabled={i === filteredClients.length - 1 || reorderingClients} className="text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDownIcon size={14} /></button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <img src={c.logo_url} alt={c.name} className="h-10 w-20 object-contain rounded border bg-gray-50" />
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {c.is_active ? "Active" : "Hidden"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleClient(c)} className={c.is_active ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"} title={c.is_active ? "Hide" : "Show"}>
                                  {c.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                </button>
                                <button onClick={() => deleteClient(c)} disabled={deletingClientId === c.id} className="text-red-400 hover:text-red-600" title="Delete">
                                  {deletingClientId === c.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ── Certificates ── */}
              {tab === "certificates" && (
                <div className="overflow-x-auto">
                  {filteredCerts.length === 0 ? (
                    <div className="p-12 text-center">
                      <Award size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">No certificates yet.</p>
                      <button onClick={() => setShowCertForm(true)} className="px-4 py-2 text-white text-sm rounded-lg" style={{ background: "#db2777" }}>
                        <Plus size={14} className="inline mr-1" /> Add First Certificate
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Order</th>
                          <th className="px-4 py-3 text-left">Thumbnail</th>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">File</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCerts.map((c, i) => (
                          <tr key={c.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <button onClick={() => moveCert(i, "up")} disabled={i === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp size={14} /></button>
                                <button onClick={() => moveCert(i, "down")} disabled={i === filteredCerts.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDownIcon size={14} /></button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {c.thumbnail_url ? (
                                <img src={c.thumbnail_url} alt={c.name} className="h-10 w-16 object-contain rounded border bg-gray-50" />
                              ) : (
                                <div className="h-10 w-16 flex items-center justify-center bg-pink-50 rounded border">
                                  <Award size={18} className="text-pink-400" />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                            <td className="px-4 py-3">
                              <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-pink-600 hover:underline">
                                <FileText size={12} /> View
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {c.is_active ? "Active" : "Hidden"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleCert(c)} className={c.is_active ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"} title={c.is_active ? "Hide" : "Show"}>
                                  {c.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                </button>
                                <button onClick={() => deleteCert(c)} disabled={deletingCertId === c.id} className="text-red-400 hover:text-red-600" title="Delete">
                                  {deletingCertId === c.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Position Form Modal ── */}
      {showPositionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">{editingPosition ? "Edit Position" : "Add Open Position"}</h3>
              <button onClick={() => setShowPositionForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Job Title <span className="text-red-500">*</span></label>
                <input value={positionForm.title} onChange={(e) => setPositionForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Software Engineer" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                  <input value={positionForm.department} onChange={(e) => setPositionForm((p) => ({ ...p, department: e.target.value }))}
                    placeholder="e.g. Engineering" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                  <input value={positionForm.location} onChange={(e) => setPositionForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Mumbai / Remote" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employment Type</label>
                <select value={positionForm.type} onChange={(e) => setPositionForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400">
                  <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={positionForm.description} onChange={(e) => setPositionForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the role..." rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowPositionForm(false)} className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={savePosition} disabled={savingPosition || !positionForm.title.trim()}
                className="flex-1 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "#0891b2" }}>
                {savingPosition ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                {editingPosition ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Client Modal ── */}
      {showClientForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Add Client</h3>
              <button onClick={() => { setShowClientForm(false); setClientFile(null); setClientFileError(""); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client Name <span className="text-red-500">*</span></label>
                <input value={clientForm.name} onChange={(e) => setClientForm({ name: e.target.value })}
                  placeholder="e.g. IBM India" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client Logo <span className="text-red-500">*</span></label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-orange-400 transition-colors"
                  onClick={() => clientFileRef.current?.click()}
                >
                  {clientFile ? (
                    <div className="flex items-center gap-3">
                      <img src={URL.createObjectURL(clientFile)} alt="preview" className="h-12 w-auto object-contain rounded" />
                      <div className="text-left">
                        <p className="text-xs font-medium text-gray-700">{clientFile.name}</p>
                        <p className="text-xs text-gray-400">{(clientFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Click to upload logo</p>
                      <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP, SVG · Max 2 MB</p>
                    </div>
                  )}
                </div>
                <input ref={clientFileRef} type="file" accept=".png,.jpg,.jpeg,.webp,.svg" className="hidden" onChange={handleClientFileChange} />
                {clientFileError && <p className="text-red-500 text-xs mt-1">{clientFileError}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowClientForm(false); setClientFile(null); setClientFileError(""); }} className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveClient} disabled={savingClient || !clientForm.name.trim() || !clientFile || !!clientFileError}
                className="flex-1 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "#ea580c" }}>
                {savingClient ? <><RefreshCw size={14} className="animate-spin" /> Uploading...</> : <><Check size={14} /> Add Client</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Certificate Modal ── */}
      {showCertForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Add Certificate</h3>
              <button onClick={() => { setShowCertForm(false); setCertFile(null); setCertThumbFile(null); setCertFileError(""); setCertThumbError(""); }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Certificate Name <span className="text-red-500">*</span></label>
                <input value={certForm.name} onChange={(e) => setCertForm({ name: e.target.value })}
                  placeholder="e.g. ISO 9001:2015" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Certificate File <span className="text-red-500">*</span></label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-pink-400 transition-colors"
                  onClick={() => certFileRef.current?.click()}
                >
                  {certFile ? (
                    <div className="flex items-center gap-3">
                      <FileText size={28} className="text-pink-500 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-medium text-gray-700">{certFile.name}</p>
                        <p className="text-xs text-gray-400">{(certFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Click to upload certificate</p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF, PNG, JPG, WebP · Max 10 MB</p>
                    </div>
                  )}
                </div>
                <input ref={certFileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleCertFileChange} />
                {certFileError && <p className="text-red-500 text-xs mt-1">{certFileError}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Thumbnail Image <span className="text-gray-400 font-normal">(optional)</span></label>
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-pink-400 transition-colors"
                  onClick={() => certThumbRef.current?.click()}
                >
                  {certThumbFile ? (
                    <div className="flex items-center gap-3">
                      <img src={URL.createObjectURL(certThumbFile)} alt="thumb preview" className="h-12 w-auto object-contain rounded" />
                      <div className="text-left">
                        <p className="text-xs font-medium text-gray-700">{certThumbFile.name}</p>
                        <p className="text-xs text-gray-400">{(certThumbFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Upload a preview image</p>
                      <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP · Max 2 MB</p>
                    </div>
                  )}
                </div>
                <input ref={certThumbRef} type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={handleCertThumbChange} />
                {certThumbError && <p className="text-red-500 text-xs mt-1">{certThumbError}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowCertForm(false); setCertFile(null); setCertThumbFile(null); setCertFileError(""); setCertThumbError(""); }} className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveCert} disabled={savingCert || !certForm.name.trim() || !certFile || !!certFileError || !!certThumbError}
                className="flex-1 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "#db2777" }}>
                {savingCert ? <><RefreshCw size={14} className="animate-spin" /> Uploading...</> : <><Check size={14} /> Add Certificate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
