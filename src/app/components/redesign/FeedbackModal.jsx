import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReportBoard from "./ReportBoard";

// Contact, bug report and feature request share one popup, opened from any page with
// `?feedback=contact|report|feature` (plus optional `&component=<slug>`). Contact is a plain
// email form; report/feature open the public report board (ReportBoard, backed by Supabase).
// Living in the URL means links stay shareable and the back button closes it.
const FORMS = {
  contact: {
    formType: "contact",
    title: "Contact us",
    description: "Questions, partnerships, or anything about your Webflow motion workflow.",
    placeholder: "How can we help?",
  },
};

const EMPTY = { name: "", email: "", message: "" };

const fieldClass =
  "w-full rounded-[4px] bg-[#f0f0f0] px-3 text-[15px] leading-7 outline-none placeholder:text-black/40 focus:ring-1 focus:ring-black/30";

const FeedbackModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("feedback");
  const board = type === "report" || type === "feature";
  const form = board ? null : FORMS[type];
  const component = searchParams.get("component");
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState(null); // null | "sending" | "success" | "error"
  const firstField = useRef(null);

  const close = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("feedback");
    next.delete("component");
    setSearchParams(next);
  };

  useEffect(() => {
    if (!form && !board) return;
    setStatus(null);
    firstField.current?.focus();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  if (!form && !board) return null;

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const componentName =
    component && component.charAt(0).toUpperCase() + component.slice(1).replace(/-/g, " ");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("https://slabpixel.dev/api/send-email.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: form.formType,
          ...values,
          subject: form.title,
          url: window.location.href,
          browser: navigator.userAgent,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error("Send failed");
      setStatus("success");
      setValues(EMPTY);
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-inter text-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div className="absolute inset-0 bg-black/30" onClick={close} />

      {board ? (
        <div className="relative max-h-[calc(100dvh-2rem)] w-full md:w-auto overflow-y-auto">
          <ReportBoard
            key={type}
            type={type === "feature" ? "feature" : "bug"}
            component={componentName}
            onClose={close}
          />
        </div>
      ) : (
      <div className="relative w-full max-w-[400px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-md bg-white p-[25px] shadow-[0_24px_48px_rgba(0,0,0,0.15)]">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 text-[20px] leading-none opacity-50 hover:opacity-100"
        >
          ×
        </button>

        <h2 id="feedback-title" className="font-inter-tight text-xl font-medium leading-[38px] mb-4">
          {form.title}
        </h2>

        {status === "success" ? (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] leading-6">Thanks! We got your message.</p>
            <button
              type="button"
              onClick={close}
              className="h-10 rounded-[4px] bg-[#1a0909] text-[15px] text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <p className="text-[15px] leading-6 text-black/50">{form.description}</p>
            <input
              ref={firstField}
              required
              placeholder="Name"
              value={values.name}
              onChange={set("name")}
              className={`${fieldClass} h-10`}
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={values.email}
              onChange={set("email")}
              className={`${fieldClass} h-10`}
            />
            <textarea
              required
              rows={5}
              placeholder={form.placeholder}
              value={values.message}
              onChange={set("message")}
              className={`${fieldClass} py-2 resize-none`}
            />
            {status === "error" && (
              <p className="text-[13px] text-red-600">Couldn't send. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-1 h-10 rounded-[4px] bg-[#1a0909] text-[15px] text-white disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
          </form>
        )}
      </div>
      )}
    </div>
  );
};

export default FeedbackModal;
