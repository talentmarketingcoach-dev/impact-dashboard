# Instructions for AI assistants

You're helping someone customize the **Talent Marketing Impact Dashboard**: a page that reads a Talent Marketing Impact Scorecard™ (an Excel file) in the browser and turns it into a leadership dashboard. The person you're helping usually works in employer branding, recruitment marketing or talent acquisition. **Assume they are not a developer.**

Read this whole file before you change anything.

## How to work with this person

- Explain what you'll change in plain language first, in two or three sentences. No jargon.
- Change as little as possible. Most wishes are a change to `js/settings.js` only.
- **Always give back complete files**, never fragments or "…rest stays the same". They will copy your answer over the old file.
- After a change, tell them exactly how to test it (see "How to test").
- If a wish would break one of the safety rules below, say so and offer a safe way instead.
- Never ask for their real numbers. Test with `sample/sample-scorecard.xlsx`, which has made-up numbers.

## What each file does

| File | What it does | Change it? |
|---|---|---|
| `js/settings.js` | Brand, words on the page, stage names and colors, metric details, journey steps, story wording, AI prompts | **Yes: start here** |
| `css/dashboard.css` | Layout, colors, fonts | Sometimes (look and feel) |
| `index.html` | The page structure and the safety lock | Rarely. Never touch the safety lock line |
| `js/dashboard.js` | Draws the page, handles clicks, writes the story | Only for new features |
| `js/scorecard.js` | Turns the Excel file into numbers | Only when their Excel is laid out differently |
| `js/xlsx-reader.js` | Unpacks the .xlsx in memory | No |
| `js/sample-data.js` | The example shown when the page opens | Only to replace the example |
| `sample/sample-scorecard.xlsx` | Made-up scorecard to test with | No |

Scripts load in this order (classic scripts, not modules, so the page also works when opened straight from a folder): `settings.js`, `sample-data.js`, `xlsx-reader.js`, `scorecard.js`, `dashboard.js`.

## Safety rules (never break these)

1. **No internet.** Never add `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`, analytics, tracking pixels, web fonts, or anything loaded from another website (no CDNs, no `<script src="https://…">`, no `<link href="https://…">`, no images from URLs). Everything the page needs lives in this folder.
2. **Keep the safety lock.** The `Content-Security-Policy` line in `index.html` must stay exactly as it is. It's what lets anyone check that the page can't send data. Don't add `'unsafe-inline'` or `'unsafe-eval'` to `script-src`, and don't add any website to it.
3. **No outside libraries.** Don't add charting, Excel or UI libraries. Use plain HTML, CSS and JavaScript.
4. **Never store the Excel data.** It lives in memory only. `localStorage` holds only the "Make it yours" choices (company name, logo, colors, currency, stage colors).
5. **Treat text from the Excel file as untrusted.** Show it only through `esc()` (or `textContent`), and check colors with `isHex()` before using them in a style.
6. **It must keep working offline**, opened straight from the folder (`index.html` double-clicked), in Chrome, Edge, Firefox and Safari.
7. **Formulas are never run.** The page reads the values Excel saved. Keep it that way.

## Design rules (from the course)

- On the data, color means two things only: a **stage** (stage colors) or a **status** (green, amber, red). Brand colors dress the header and buttons, never the data.
- Metrics where lower is better (cost per hire, attrition) show reversed colors: over target is red.
- Two lenses on one page: the % under a number is progress toward **their own target**; the RAG status is how they compare with **what good looks like** (the benchmark). They can disagree. Keep the legend line.
- One period at a time (Q1–Q4 or full year). A line chart only makes sense with four or more periods.
- Every story ends with a move: lean in, optimize or reallocate.

## The data contract (what the page reads)

From the tab named in `settings.source.dataTab` (default **"Google Sheets input"**):

- Sections, each starting with a header row whose first cell (column A) says **`Metric name`**.
- Header columns: `Metric name`, `TME Stage name` (like `Stage 4 - Convinced`), `TME Stage color` (like `#EDE9FE`), then per period `FY Actual`, `FY Target`, `Q1 Actual`, `Q1 Target` … `Q4 Target`.
- A section whose title row (just above the header) mentions **"Percentages"** holds rates as decimals (`0.11` = 11%). Other plain sections hold numbers.
- A section with `Q1 RAG Status` (etc.) columns instead of targets is a RAG section. Status values: `On track`, `Needs attention`, `Action required`.
- A section ends at the first empty `Metric name` cell.

Optional, from `settings.source.detailsTab` ("TOTAL Impact Scorecard"): the `Direction` (UP/DOWN), `Good Benchmark` and `What it measures` columns. When that tab isn't there, `settings.metrics`, `lowerIsBetterWords` and `currencyWords` fill the gaps.

The result is a "model" object (see the comment at the top of `js/scorecard.js`). `js/sample-data.js` holds one, so you can see its shape.

## Common changes

| Wish | Where |
|---|---|
| Company name, colors, logo, currency | `settings.brand` (logo file goes in `img/`) |
| Fonts | `settings.brand.headingFont` (names and numbers, bold, default Arial), `settings.brand.font` (other text), `settings.fontChoices` (the list in "Make it yours"). Only fonts installed on the computer, or a font file in a `fonts/` folder (see below) |
| Words on the page, the legend line | `settings.text` |
| The links in the footer | `settings.footerLinks` (https only; they open in a new tab on a click, which the safety lock allows). Keep the credit line in `index.html` |
| Rename stages or change stage colors | `settings.stages` |
| The order of the cards inside a stage | `settings.cardOrder` (cards show two per row) |
| A metric is "lower is better" or a cost | `settings.metrics`, or the Direction column in their Excel |
| Their metric names differ (journey and conversions) | `settings.journey` (`match` = words in the name) |
| The three-line story wording | `settings.story` (keep the `{placeholders}`) |
| When something counts as a leak or a big swing | `settings.thresholds` |
| The AI prompts on the page | `settings.prompts` (keep `{dashboard}`, `{periods}`, `{funnel}`) |
| Add a metric | Add a row in the right section of their "Google Sheets input" tab. No code change needed. |
| Their own font file | Put the file in a new `fonts/` folder, add an `@font-face` rule at the top of `css/dashboard.css` with `src: url('../fonts/<file>')`, and set `settings.brand.font` to its name. The safety lock already allows fonts from this folder. |
| A spreadsheet with a different layout | `js/scorecard.js`: keep the same model output so the rest keeps working |

## How to test

1. Double-click `index.html`. The example dashboard should appear.
2. Click **Load your scorecard** and pick `sample/sample-scorecard.xlsx`. The page should show it without errors.
3. Click through Q1–Q4 and Full year, and open **Make it yours**.
4. Open the browser's developer tools (F12) → **Console**: there should be no red errors. → **Network**: nothing should go out to the internet.
5. Turn off Wi-Fi, reload, and load the sample again. Everything should still work.
6. Run the safety check in `prompts/safety-check.md`.

## When you're done

Summarize in plain language: which files changed, what the person will see, and how to test it. Confirm in one line that you kept all seven safety rules.
