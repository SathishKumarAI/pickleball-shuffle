"use client";

import { useState } from "react";
import { MessageSquare, Star, Send, Check } from "lucide-react";
import { Sheet } from "./HistoryPanel";

const FEEDBACK_EMAIL = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL || "sathishkumar786.ml@gmail.com";
const FEEDBACK_KEY = "pb-feedback";

export default function FeedbackPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const send = () => {
    // Keep a local copy as backup.
    try {
      const prev = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
      prev.unshift({ rating, message, contact, at: Date.now() });
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(prev.slice(0, 50)));
    } catch {}

    const subject = `Pickleball Card Games feedback${rating ? ` — ${rating}★` : ""}`;
    const body =
      `Rating: ${rating ? `${rating}/5` : "—"}\n\n` +
      `${message || "(no message)"}\n\n` +
      (contact ? `Reply to: ${contact}\n` : "") +
      `\n— sent from Pickleball Card Games`;
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const reset = () => { setRating(0); setHover(0); setMessage(""); setContact(""); setSent(false); };
  const close = () => { reset(); onClose(); };

  const input = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inputStyle = { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" } as const;

  return (
    <Sheet title="Send feedback" icon={<MessageSquare size={18} />} onClose={close}>
      {sent ? (
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <span className="flex items-center justify-center w-14 h-14 rounded-full text-white anim-pop" style={{ background: "var(--accent)" }}>
            <Check size={28} />
          </span>
          <p className="text-base font-semibold" style={{ color: "var(--text)" }}>Thanks for the feedback!</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Your email app should have opened. If it didn&apos;t, email us at {FEEDBACK_EMAIL}.</p>
          <button onClick={close} className="pressable mt-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold" style={{ background: "var(--accent)" }}>Done</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Rating */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>How&apos;s your experience?</span>
            <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  className="pressable p-1"
                  style={{ color: (hover || rating) >= n ? "var(--yellow)" : "var(--text-muted)" }}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star size={30} fill={(hover || rating) >= n ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What do you love? What's missing? Found a bug?"
            rows={4}
            className={input}
            style={inputStyle}
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Your email (optional, so we can reply)"
            type="email"
            className={input}
            style={inputStyle}
          />

          <button
            onClick={send}
            disabled={!rating && !message.trim()}
            className="pressable flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}
          >
            <Send size={18} /> Send feedback
          </button>
        </div>
      )}
    </Sheet>
  );
}
