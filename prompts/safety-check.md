# Safety check: run this after every change

The original dashboard can't send your data anywhere. After you (or an AI assistant) change the code, check that this is still true before you load your real scorecard.

**When it fits:** after every change to the code, and before you share your version with your team.

**You'll need:** every file that changed, plus `index.html`. Ideally use a different AI chat from the one that made the change, so it looks with fresh eyes.

**The prompt:**

```
I'm a [role] at a [type of company].
I want to check that my customized Talent Marketing Impact Dashboard still can't send data anywhere, before I use it with my real numbers.
Here are the files that changed, plus index.html.
Please give me the result as a short checklist with "OK" or "PROBLEM" for each point, and for every problem the exact line and how to fix it:
1. Is the Content-Security-Policy line in index.html still exactly: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'
2. Is there any fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon, or anything else that sends or loads data over the internet?
3. Is anything loaded from another website (scripts, styles, fonts, images, iframes)?
4. Is any data from the Excel file saved (localStorage, sessionStorage, IndexedDB, cookies), other than the company name, logo, colors and currency?
5. Is any text from the Excel file put on the page without esc() or textContent?
6. Are there any outside libraries, or code that runs text as code (eval, new Function)?
Tell me what you assumed, and what I should double-check.
```

**Check before you trust it, with your own eyes:**
1. Turn off your Wi-Fi.
2. Open `index.html` and load `sample/sample-scorecard.xlsx`. Everything should work.
3. Press F12 → **Network** tab, reload, load the sample again. Nothing should go to a website.
4. Turn your Wi-Fi back on.

If anything fails, go back to the original files from the kit. They're the safe starting point.
