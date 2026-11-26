# For your IT and security team

This page summarizes how the Talent Marketing Impact Dashboard works, so you can assess it quickly.

## What it is

A static web page: HTML, CSS and plain JavaScript in one folder. No build step, no server-side code, no third-party libraries, no external requests. It runs entirely in the user's browser and can be opened from the local file system (`index.html`) or served as static files.

## What it does with the file

- The user selects an .xlsx file. The browser reads it into memory (`File.arrayBuffer()`).
- `js/xlsx-reader.js` unzips it in memory with the browser's built-in `DecompressionStream` and parses the XML with `DOMParser`. Formulas are not evaluated; only cached cell values are read. Macros are not supported or run (.xlsx can't contain them).
- `js/scorecard.js` maps the cells to metrics; `js/dashboard.js` renders the page.
- The data is held in memory only and discarded when the tab closes.

## Network and storage

- **Content-Security-Policy** (meta tag in `index.html`):
  `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'`
  - `connect-src 'none'` blocks fetch, XHR, WebSocket, EventSource and beacons.
  - `form-action 'none'` blocks form submissions.
  - Scripts, fonts and images load only from the page's own folder (images also from `data:`/`blob:` for an uploaded logo).
  - `style-src 'unsafe-inline'` is there for inline style attributes (stage colors). Inline scripts are not allowed.
- **No network calls in the code.** You can verify: search the folder for `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `http://` and `https://` (the only hits are comments, an XML namespace string and documentation links).
- **Storage:** `localStorage` key `impact-dashboard-settings` holds display preferences only (company name, logo as a small image, colors, currency). No workbook data is stored.

## Handling untrusted input

- Text from the workbook is HTML-escaped before rendering (`esc()` in `js/dashboard.js`) or set via `textContent`.
- Colors from the workbook are only used after a strict `#RRGGBB` check (`isHex()`).
- The XML is parsed with the browser's `DOMParser`, which doesn't load external entities.

## Data classification

The scorecard holds aggregate talent marketing metrics (counts, rates, costs). It's designed to contain no personal data. It may contain confidential business figures, which stay on the device.

## The AI prompt buttons

Two buttons copy a text prompt with the dashboard's numbers to the clipboard, for the user to paste into an AI tool. Nothing is sent by the page itself. Users are told to use only AI tools their employer has approved.

## Changed copies

These statements apply to the original, unmodified files. Users may customize the code, often with an AI assistant. The kit includes `prompts/safety-check.md` and instructions for AI assistants (`AGENTS.md`) that require keeping the safety lock and the no-network rule. If you assess a customized copy, check the CSP line and search for the network APIs listed above.

## Contact

Questions about the dashboard: Talent Marketing Coach, https://talentmarketingcoach.com
