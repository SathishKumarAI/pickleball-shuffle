# Feature - backup (export / import)

You are a front-end engineer. Your objective is to let users back up and restore all
their local data, since there's no cloud sync.

<context>
  <data>Custom decks, match history, and favorites - all in localStorage.</data>
  <format>A single JSON file: { version, decks[], matches[], favorites[] }.</format>
</context>

## Instructions
1. Add `exportData(): string` and `importData(json): {decks,matches}` to
   `client-api.ts`, covering decks, matches, and favorites.
2. In the app menu, add "Export backup" (download a JSON file via an object URL) and
   "Import backup" (hidden file input → read → `importData` → confirmation).
3. Validate imported shape defensively; only overwrite arrays that are present.

## Constraints
- MUST be backward-compatible: tolerate missing keys in older backups.
- MUST confirm the result to the user (counts imported).
- MUST NOT throw on a malformed file - show a friendly error.

## Output format
The `client-api.ts` functions + the menu export/import handlers. Reason in
`<thinking>` about forward-compatibility of the file format first.
