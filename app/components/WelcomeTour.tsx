"use client";

import { useRef, useState } from "react";
import { Sparkles, ListChecks, Compass, Rocket, ArrowLeft, ArrowRight } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

type Slide = {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    icon: <Sparkles size={46} strokeWidth={1.5} />,
    title: "Welcome",
    body: (
      <>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          Turn any pickleball game into a party. Between points you <strong>draw a twist card</strong> — a fun
          mini-rule for the next rally — while the app keeps score for you.
        </p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Free, no signup, works offline on the court. Your data stays on your phone.
        </p>
      </>
    ),
  },
  {
    icon: <ListChecks size={46} strokeWidth={1.5} />,
    title: "How to play",
    body: (
      <ol className="flex flex-col gap-2.5 text-left">
        {[
          "Tap the card to draw a twist — a simple rule for the next point.",
          "Play that point under the rule. Unsure? Tap the ? on the card.",
          "Tap a team's score to give them the point. First to 11, win by 2.",
        ].map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 text-white" style={{ background: "var(--accent)" }}>{i + 1}</span>
            <span className="text-sm" style={{ color: "var(--text)" }}>{s}</span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    icon: <Compass size={46} strokeWidth={1.5} />,
    title: "Find your way around",
    body: (
      <ul className="flex flex-col gap-2 text-left text-sm" style={{ color: "var(--text-secondary)" }}>
        {[
          ["The card", "Tap it (or Draw) to get a twist. ? explains it, star saves it, Skip swaps it."],
          ["No pickleball terms?", "Underlined words on a card explain themselves when you tap them."],
          ["The menu (top-right)", "Your decks, match history, favourites, achievements and full rules."],
          ["Settings (gear)", "Points to win, sound, light/dark, and Commentator voice."],
        ].map(([k, v]) => (
          <li key={k}>
            <strong style={{ color: "var(--text)" }}>{k}:</strong> {v}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: <Rocket size={46} strokeWidth={1.5} />,
    title: "You're ready",
    body: (
      <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
        Pick a <strong>deck mode</strong> below — Family, Party, Drill, Tournament or Chaos — then tap the card and
        play. Tap <strong>?</strong> on any card whenever you&apos;re unsure. Have fun!
      </p>
    ),
  },
];

export default function WelcomeTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);

  if (!open) return null;

  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  const finish = () => { setI(0); onClose(); };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
      className="fixed inset-0 z-[85] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
    >
      <div ref={ref} tabIndex={-1} className="glass rounded-3xl p-7 max-w-sm w-full shadow-2xl anim-pop outline-none" style={{ border: "1px solid var(--accent)" }}>
        <div className="flex justify-center mb-3" style={{ color: "var(--accent)" }}>
          {slide.icon}
        </div>
        <h2 className="font-display text-2xl font-black text-center mb-4" style={{ color: "var(--text)" }}>{slide.title}</h2>

        <div className="min-h-[8.5rem] flex flex-col justify-center mb-5">{slide.body}</div>

        {/* Dot pager */}
        <div className="flex items-center justify-center gap-1.5 mb-5" aria-hidden>
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className="rounded-full transition-all"
              style={{
                width: idx === i ? 20 : 7,
                height: 7,
                background: idx === i ? "var(--accent)" : "var(--border)",
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {i > 0 ? (
            <button
              onClick={() => setI(i - 1)}
              className="pressable flex items-center gap-1.5 px-4 py-3 text-sm font-semibold rounded-full"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button
              onClick={finish}
              className="pressable px-4 py-3 text-sm font-semibold rounded-full"
              style={{ color: "var(--text-muted)" }}
            >
              Skip
            </button>
          )}
          <button
            autoFocus
            onClick={() => (last ? finish() : setI(i + 1))}
            className="pressable flex-1 flex items-center justify-center gap-1.5 px-6 py-3 text-white font-bold rounded-full shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}
          >
            {last ? "Let's play" : "Next"} {!last && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
