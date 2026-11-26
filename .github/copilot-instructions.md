# Copilot instructions

Read and follow `AGENTS.md` in the root of this project before changing anything. The most important parts:

- The person you're helping is usually not a developer. Explain changes in plain language and always return complete files.
- Most customizations belong in `js/settings.js`. Start there.
- Never add anything that connects to the internet (fetch, XMLHttpRequest, WebSocket, sendBeacon, analytics, CDNs, web fonts, images from URLs).
- Never change or remove the Content-Security-Policy line in `index.html`.
- Never add outside libraries. Never store the Excel data. Show text from the Excel file only through `esc()` or `textContent`.
- The page must keep working offline when `index.html` is opened straight from the folder.
- Test with `sample/sample-scorecard.xlsx` (made-up numbers). Never ask for real numbers.
