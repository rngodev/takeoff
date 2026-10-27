# Takeoff design system

Every take gets a scorecard. Takeoff logs what pundits predict, waits, and grades them on what actually happened. The look borrows from the sports ledger and the newspaper box score: warm newsprint, black ink, one highlighter yellow, and numbers set to be compared.

**Source of truth:** the tokens live in `src/index.css` (`@theme`), the shared UI in `src/components/ui.tsx`. This file is the brand book. The design system artifact on claude.ai mirrors this repo; change things here, then re-sync it.

## Principles

- **The record speaks.** Numbers and verdicts are the loudest things on a page; decoration never is.
- **Fair, not snarky.** We grade the take, not the person. Every verdict shows when and how it was resolved.
- **Printed, not glossy.** Flat fills, hairline rules, square corners. No gradients, shadows or blur.

## Voice and vocabulary

A sharp sports desk that checks its facts: short, declarative, a little dry. Confident about the record, neutral about the person. No mockery, no emoji in product copy.

| Term | Means | Shown as |
| --- | --- | --- |
| Take | A specific claim a pundit made publicly | — |
| Correct | Resolved: the take held up (`resolution_outcome = correct`) | `✓ CORRECT` stamp, `bg-correct` |
| Incorrect | Resolved: the take was wrong (`incorrect`) | `✕ INCORRECT` stamp, `bg-incorrect` |
| Void | Can't be evaluated — the conditions never materialized (`void`) | `– VOID` outlined stamp |
| Pending | No resolution yet | `◷ Pending`, `text-ink-muted`, no stamp |
| Accuracy | Correct ÷ (Correct + Incorrect); Void and Pending never count | `text-stat` |

Sentence case everywhere except stamps, tags, stat labels and table headers, which use the uppercase `text-label` style. Dates read "Mar 3, 2026".

## Colour

| Token | Utility | Use |
| --- | --- | --- |
| `paper` #f3eee3 | `bg-paper` | Page background |
| `paper-raised` #fbf8f1 | `bg-paper-raised` | Stat blocks, cards, inputs |
| `ink` #17140f | `text-ink`, `bg-ink` | Text, numbers, header bar, focus ring (15.9:1 on paper) |
| `ink-muted` #5a5347 | `text-ink-muted` | Meta: bylines, dates, labels (6.6:1) |
| `rule` #d4cab6 | `border-rule`, `divide-rule` | Decorative hairlines only (1.4:1) |
| `rule-strong` #8f8573 | `border-rule-strong` | Control and chip borders (3.2:1) |
| `runway` #f5c518 | `bg-runway`, `text-runway` | Brand highlighter: fills under ink text, or text/accents on `ink`. Never text on paper |
| `correct` #1f5aa6 | `text-correct`, `bg-correct` | Verdict only. Paper text on it (5.9:1) |
| `incorrect` #b8361b | `text-incorrect`, `bg-incorrect` | Verdict only. Paper text on it (5.1:1) |

Tailwind's default palette is cleared — `zinc-*`, `sky-*`, `white` etc. don't exist. `correct` and `incorrect` are close in lightness, so a verdict always carries its glyph and word, never colour alone.

## Type

Barlow Condensed (`font-display`) for headlines, stamps, labels and every big number; Barlow (`font-sans`) for reading. Both load from Google Fonts in `index.html`. Use `tabular-nums` wherever numbers sit in columns.

| Utility | Size / line | Weight | Family | Use |
| --- | --- | --- | --- | --- |
| `text-display` | 64 / 60 | 700 | display | Home hero (`text-headline` below `sm`) |
| `text-headline` | 36 / 38 | 700 | display | Page titles, pundit names, take headlines |
| `text-title` | 22 / 26 | 600 | display | Section headings |
| `text-stat` | 40 / 40 | 700 | display | Stat block values |
| `text-body` | 16 / 24 | 400 | sans | Paragraphs, take links in tables (`font-semibold`) |
| `text-meta` | 14 / 20 | 500 | sans | Dates, sources, bylines |
| `text-label` | 12 / 16, +0.08em | 700 | display, `uppercase` | Stamps, tags, stat labels, table headers |

The text utilities set size, line height and weight; add the family (`font-display`) yourself.

## Space and shape

Spacing is Tailwind's 4px step; the system uses `1` (4px), `2` (8px), `4` (16px) and `8` (32px) for most gaps. Cards pad `p-4`/`sm:px-6 sm:py-5`; sections separate by `mt-8`–`mt-10`.

`rounded-sm` (2px) for stamps, tags, chips and controls; `rounded-md` (4px) for stat blocks and cards; `rounded-pill` only for avatars and meters. Surfaces are separated by a 1px `rule` border, never a shadow. Table headers sit on a 2px `ink` rule.

## Components (`src/components/ui.tsx`)

- `PageShell` — paper page, `SiteHeader`, centred `max-w-4xl` main.
- `SiteHeader` / `Logo` — ink bar; the wordmark is "Takeoff" in Barlow Condensed 700 on ink with a short `runway` bar under it that runs full width on hover. There is no logo file yet.
- `VerdictBadge` — square stamp per verdict; `Pending` is plain meta text.
- `KindTag` — outlined uppercase tag (objective / subjective).
- `PunditChip`, `Avatar` — square-cornered chip with a round avatar.
- `StatGrid` — three-up stat block; `tone="correct"` for the verified-correct figure.
- `Meter` — pill track in `rule`, fill in `ink` (or `correct` for accuracy).
- `TakesTable` — the ledger table used on every page.
- `BackLink` — muted back link with a chevron.

Links in body text and tables underline on hover with a 2px `runway` decoration. Focus is a 2px `ink` outline, offset 2px (set globally in `index.css`).

## Iconography

No icon set yet. Use the verdict glyphs (✓ ✕ – ◷) and inline 24px stroke SVGs with square caps, `currentColor`.
