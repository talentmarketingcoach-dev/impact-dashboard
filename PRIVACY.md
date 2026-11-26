# How your data is handled

**Short version: your scorecard never leaves your computer.**

## What happens when you load your scorecard

1. You pick your .xlsx file (or drop it on the page).
2. Your browser opens the file in its own memory, on your computer.
3. The page reads the numbers Excel saved in the file and draws the dashboard.
4. When you close the tab, the numbers are gone.

Nothing is uploaded. There's no server, no account, no database, no cookies, no analytics and no tracking. Talent Marketing Coach never sees your file or your numbers.

## What the page remembers

Only your **Make it yours** choices: company name, logo, brand colors, stage colors and currency. They're saved in your browser on your computer (in "local storage"), so the page looks right next time. Use **Reset everything** in Make it yours to remove them, or clear your browser data.

Your Excel numbers are never saved.

## How you can check this yourself

- With the page open, **turn off your Wi-Fi** and load your scorecard. It still works, because it never needed the internet. (Using the downloaded folder? Then you can even open `index.html` with your Wi-Fi off.)
- Or press **F12**, open the **Network** tab, and load your scorecard. You'll see that nothing is sent.
- The page has a safety lock (a "Content-Security-Policy" line at the top of `index.html`). It tells your browser to block any connection to the internet from this page. Your IT team can read more in [`SECURITY.md`](SECURITY.md).

## The one moment your numbers can leave

The page has buttons that copy an AI prompt with your numbers filled in. Your numbers only leave the page if **you** paste that prompt into an AI tool. Before you do:

- use only the AI tools your employer has approved,
- remove confidential figures and names,
- check the answer before you trust it.

## If you change the code

The promises above are about the original files. If you or an AI assistant change the code, run [`prompts/safety-check.md`](prompts/safety-check.md) and the Wi-Fi test before you load your real scorecard.

## Personal data

The Talent Marketing Impact Scorecard™ holds totals (impressions, applications, hires, rates, costs), not information about people. Keep it that way: don't add names of candidates or employees to it.
