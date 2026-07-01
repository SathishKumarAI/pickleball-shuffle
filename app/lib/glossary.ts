// Shared pickleball glossary — single source of truth for the Rules panel's
// Glossary tab AND the in-card tap-to-define highlighter (GlossaryText).
// Each term lists aliases so the highlighter can match plurals/variants.

export interface GlossaryTerm {
  term: string;
  aliases: string[];
  def: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Dink",
    aliases: ["dink", "dinks", "dinking"],
    def: "A soft shot hit from near the net that arcs over and drops into the opponent's kitchen, too low to attack.",
  },
  {
    term: "Kitchen (Non-Volley Zone)",
    aliases: ["kitchen", "non-volley zone", "nvz", "non volley zone"],
    def: "The 7-foot zone on each side of the net. You can't hit the ball out of the air (volley) while standing in it.",
  },
  {
    term: "Volley",
    aliases: ["volley", "volleys", "volleying"],
    def: "Hitting the ball out of the air before it bounces. Legal everywhere except the kitchen.",
  },
  {
    term: "Third-shot drop",
    aliases: ["third-shot drop", "third shot drop", "third-shot", "third shot"],
    def: "A soft shot by the serving team on the third hit, landing in the kitchen so they can move up to the net.",
  },
  {
    term: "Side-out",
    aliases: ["side-out", "side out", "sideout", "side-outs"],
    def: "When the serving side loses the rally and the serve passes to the other team. Only the serving team scores.",
  },
  {
    term: "Erne",
    aliases: ["erne", "ernes"],
    def: "An aggressive volley hit just outside the kitchen near the sideline, often after jumping around the corner.",
  },
  {
    term: "Poach",
    aliases: ["poach", "poaching", "poaches"],
    def: "When a player crosses into their partner's area to take a shot, usually to surprise the opponents.",
  },
  {
    term: "Lob",
    aliases: ["lob", "lobs", "lobbing"],
    def: "A high, deep shot sent over the opponents to push them back off the net.",
  },
  {
    term: "Let",
    aliases: ["let", "lets"],
    def: "A serve that clips the net but still lands in the correct service box. In most modern rules, play simply continues.",
  },
  {
    term: "Stacking",
    aliases: ["stacking", "stack"],
    def: "A positioning tactic where partners line up on the same side to keep their preferred forehands in the middle.",
  },
  {
    term: "Rally",
    aliases: ["rally", "rallies"],
    def: "The back-and-forth of hits after the serve, until one side wins the point.",
  },
  {
    term: "Serve",
    aliases: ["serve", "serving", "server"],
    def: "The underhand hit that starts each point, made diagonally from behind the baseline.",
  },
  {
    term: "Rally scoring",
    aliases: ["rally scoring"],
    def: "A scoring style where the winner of every rally gets a point, whether or not they served.",
  },
  {
    term: "Groundstroke",
    aliases: ["groundstroke", "groundstrokes"],
    def: "A shot hit after the ball has bounced once, usually from the back of the court.",
  },
  {
    term: "Baseline",
    aliases: ["baseline"],
    def: "The line at the very back of each side of the court.",
  },
  {
    term: "Backhand",
    aliases: ["backhand", "backhands"],
    def: "A shot hit with the back of the paddle hand facing the ball (across your body).",
  },
  {
    term: "Forehand",
    aliases: ["forehand", "forehands"],
    def: "A shot hit with the palm side of the paddle hand, on your dominant side.",
  },
];

// Pre-flattened alias → term map for fast lookup, longest aliases first so
// multi-word terms ("non-volley zone") win over their sub-words.
export const GLOSSARY_BY_ALIAS: { alias: string; term: GlossaryTerm }[] = GLOSSARY.flatMap((t) =>
  t.aliases.map((alias) => ({ alias, term: t })),
).sort((a, b) => b.alias.length - a.alias.length);
