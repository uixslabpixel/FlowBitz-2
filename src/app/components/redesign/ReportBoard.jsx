import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import FilterChips from "./FilterChips";

// Public board for one report type (Supabase `reports` table): the form card on the left,
// that type's list with status filters on the right. Bugs and feature requests each get their
// own popup. Status is changed by the team in Supabase.
const TYPES = {
  feature: { title: "Feature request", list: "Requests", placeholder: "Describe the effect, tool or template you'd like. Paste or drop references here." },
  bug: { title: "Report a bug", list: "Bug reports", placeholder: "Describe the bug and how to reproduce it. Paste or drop screenshots here." },
};

const STATUSES = [
  { id: "open", label: "Open" },
  { id: "in_progress", label: "On progress" },
  { id: "on_hold", label: "On hold" },
  { id: "solved", label: "Solved" },
  { id: "all", label: "All" },
];

const MAX_IMAGES = 4;
const BUCKET = "report-images";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const uploadImage = async (file) => {
  const ext = file.type.split("/")[1] || "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
};

const ReportForm = ({ type, component, onSubmitted }) => {
  const [message, setMessage] = useState(component ? `[${component}] ` : "");
  const [files, setFiles] = useState([]);
  const [anonymous, setAnonymous] = useState(true);
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null); // null | "sending" | "error"
  const current = TYPES[type];

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const addFiles = (list) => {
    const images = [...list].filter((f) => f.type.startsWith("image/"));
    if (images.length) setFiles((prev) => [...prev, ...images].slice(0, MAX_IMAGES));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      const images = await Promise.all(files.map(uploadImage));
      const { error } = await supabase.from("reports").insert({
        type,
        message: message.trim(),
        images,
        author_name: anonymous ? null : name.trim() || null,
        page_url: window.location.pathname,
        component,
      });
      if (error) throw error;
      setMessage("");
      setFiles([]);
      setStatus(null);
      onSubmitted();
    } catch (error) {
      console.error("Error submitting report:", error);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-2">
      <h2 id="feedback-title" className="h-8 flex items-center text-[20px] font-medium leading-[21px] tracking-[-0.02em]">
        {current.title}
      </h2>

      <label className="flex flex-1 flex-col">
        <textarea
          required
          autoFocus
          rows={4}
          aria-label={current.title}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={(e) => addFiles(e.clipboardData.files)}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          placeholder={current.placeholder}
          className="w-full flex-1 py-2 text-[13px] leading-6 outline-none resize-none caret-black placeholder:text-black/40"
        />
      </label>

      {files.length > 0 && (
        <div className="flex gap-2">
          {previews.map((src, i) => (
            <div key={src} className="relative">
              <img src={src} alt="" className="w-16 h-16 rounded-[4px] object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-white text-[12px] leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-[13px] shrink-0">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-[17px] h-[17px] accent-[#1a0909]"
          />
          Report as Anonymous
        </label>
        {!anonymous && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            className="min-w-0 flex-1 h-9 rounded-[4px] bg-[#f0f0f0] px-3 text-[13px] outline-none focus:ring-1 focus:ring-black/30"
          />
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="ml-auto h-9 px-5 rounded-[4px] bg-[#1a0909] text-[15px] text-white disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Submit"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-[13px] text-red-600">Couldn't send. Please try again.</p>
      )}
    </form>
  );
};

// Squiggle separator between reports: one 12px wave period tiled across the width.
const WAVE = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6"><path d="M0 3q3-3 6 0t6 0" fill="none" stroke="#c8c8c8" stroke-width="1.2"/></svg>'
  )}")`,
  backgroundRepeat: "repeat-x",
  backgroundSize: "12px 6px",
};

const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-[4px] bg-[#f0f0f0] text-[12px] whitespace-nowrap">
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        status === "solved" ? "bg-black" : "border border-black"
      }`}
    />
    {STATUSES.find((s) => s.id === status)?.label}
  </span>
);

const ReportList = ({ title, reports, loading }) => {
  const [filter, setFilter] = useState("open");
  const visible = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <section className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <h3 className="text-[16px] font-medium">{title}</h3>
        <FilterChips
          label="Filter reports by status"
          chipClassName="bg-[#f0f0f0]"
          size="sm"
          active={filter}
          onChange={setFilter}
          filters={STATUSES.map((s) => ({ id: s.id, label: s.label }))}
        />
      </div>

      {loading ? (
        <p className="py-6 text-center text-[13px] text-black/50">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="m-auto py-6 text-[13px] text-black/50">Nothing here yet.</p>
      ) : (
        <ul className="flex flex-1 min-h-0 flex-col overflow-y-auto">
          {visible.map((r, i) => (
            <li
              key={r.id}
              className="flex gap-3 pt-4 pb-3 first:pt-3"
              style={i > 0 ? WAVE : undefined}
            >
              <StatusBadge status={r.status} />
              <div className="flex min-w-0 flex-col gap-1.5">
                <p className="text-[14px] leading-5 break-words whitespace-pre-line">{r.message}</p>
                {r.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {r.images.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="" loading="lazy" className="h-24 rounded-[4px] object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-[12px] text-black/50">
                  {r.author_name || "Anonymous"} ·{" "}
                  {formatDate(r.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const CARD =
  "relative flex flex-col w-full md:w-[600px] md:h-[466px] rounded-md bg-white p-[25px] overflow-y-auto";

// Visible = middle band + the 6px rounded tip of each notch (outside a 6px circle).
const STUB_MASK = (() => {
  const layers = [
    "radial-gradient(circle at 50% 0, transparent 6px, #000 6.5px) 0 22px / 100% 6px no-repeat",
    "linear-gradient(#000, #000) 0 28px / 100% calc(100% - 56px) no-repeat",
    "radial-gradient(circle at 50% 100%, transparent 6px, #000 6.5px) 0 calc(100% - 22px) / 100% 6px no-repeat",
  ].join(", ");
  return { mask: layers, WebkitMask: layers };
})();

const ReportBoard = ({ type = "bug", component, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("id, message, images, status, author_name, created_at")
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) console.error("Error loading reports:", error);
    setReports(data || []);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    if (supabase) load();
  }, [load]);

  return (
    <div className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-0">
      <div className={CARD}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 text-[20px] leading-none opacity-50 hover:opacity-100"
          >
            ×
          </button>
        )}
        {supabase ? (
          <ReportForm type={type} component={component} onSubmitted={load} />
        ) : (
          <p className="text-[13px] text-black/50">
            Reports aren't connected yet (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
          </p>
        )}
      </div>

      {/* Ticket-stub joint: a 12px band with a rounded notch cut 28px into each end. Masked
          (not covered) so the backdrop shows through the overlay. */}
      <div aria-hidden="true" className="hidden md:block w-3 bg-[#ebebeb]" style={STUB_MASK} />

      <div className={CARD}>
        <ReportList title={TYPES[type].list} reports={reports} loading={loading} />
      </div>
    </div>
  );
};

export default ReportBoard;
