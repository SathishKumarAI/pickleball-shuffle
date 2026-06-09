"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Trash2, Play, X } from "lucide-react";
import { CATEGORIES } from "@/lib/cards";
import { listDecks, saveDeck, deleteDeck, CustomDeck } from "@/lib/client-api";
import { Sheet } from "./HistoryPanel";

type DraftCard = { name: string; effect: string; category: string };

export default function DecksPanel({
  open,
  onClose,
  onPlay,
}: {
  open: boolean;
  onClose: () => void;
  onPlay: (deck: CustomDeck) => void;
}) {
  const [decks, setDecks] = useState<CustomDeck[]>([]);
  const [creating, setCreating] = useState(false);

  const load = () => setDecks(listDecks());
  useEffect(() => { if (open) { load(); setCreating(false); } }, [open]);

  if (!open) return null;

  return (
    <Sheet title="Custom decks" icon={<Layers size={18} />} onClose={onClose}>
      {creating ? (
        <DeckEditor onCancel={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />
      ) : (
        <>
          <button
            onClick={() => setCreating(true)}
            className="pressable w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold mb-4"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dim))" }}
          >
            <Plus size={18} /> New deck
          </button>

          {decks.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>No custom decks yet. Build your own twist cards!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {decks.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{d.name}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{d.cards.length} cards{d.description ? ` · ${d.description}` : ""}</div>
                  </div>
                  <button
                    onClick={() => onPlay(d)}
                    disabled={d.cards.length === 0}
                    className="pressable p-2 rounded-full text-white disabled:opacity-40"
                    style={{ background: "var(--accent)" }}
                    title="Play"
                  >
                    <Play size={16} />
                  </button>
                  <button
                    onClick={() => { deleteDeck(d.id); load(); }}
                    className="pressable p-2 rounded-full"
                    style={{ background: "var(--bg-elevated)", color: "var(--red)" }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}

function DeckEditor({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<DraftCard[]>([]);
  const [draft, setDraft] = useState<DraftCard>({ name: "", effect: "", category: CATEGORIES[0] });

  const addCard = () => {
    if (!draft.name.trim() || !draft.effect.trim()) return;
    setCards([...cards, draft]);
    setDraft({ name: "", effect: "", category: draft.category });
  };

  const save = () => {
    if (!name.trim() || cards.length === 0) return;
    saveDeck({ name: name.trim(), description: description.trim(), cards });
    onSaved();
  };

  const input = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inputStyle = { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" } as const;

  return (
    <div className="flex flex-col gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Deck name" className={input} style={inputStyle} />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className={input} style={inputStyle} />

      {cards.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {cards.map((c, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: "var(--bg-elevated)" }}>
              <span className="font-semibold" style={{ color: "var(--text)" }}>{c.name}</span>
              <span className="truncate flex-1" style={{ color: "var(--text-muted)" }}>{c.effect}</span>
              <button onClick={() => setCards(cards.filter((_, j) => j !== i))} style={{ color: "var(--red)" }}><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Card name" className={input} style={inputStyle} />
        <textarea value={draft.effect} onChange={(e) => setDraft({ ...draft, effect: e.target.value })} placeholder="What happens?" rows={2} className={input} style={inputStyle} />
        <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={input} style={inputStyle}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addCard} className="pressable flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--bg-elevated)", color: "var(--accent)" }}>
          <Plus size={16} /> Add card
        </button>
      </div>

      <div className="flex gap-2 mt-1">
        <button onClick={onCancel} className="pressable flex-1 px-4 py-2.5 rounded-full text-sm font-medium" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>Cancel</button>
        <button onClick={save} disabled={!name.trim() || cards.length === 0} className="pressable flex-1 px-4 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>
          Save deck ({cards.length})
        </button>
      </div>
    </div>
  );
}
