# Talent Marketing Impact Dashboard

Turn your Talent Marketing Impact Scorecard™ into a leadership dashboard in seconds, and make it your own with your AI assistant. Your data never leaves your computer.

Built by [Talent Marketing Coach](https://talentmarketingcoach.com) for the **Prove Real ROI with Employer Branding & Talent Marketing** masterclass.

## What it does

- Reads your scorecard (.xlsx) straight in your browser: no upload, no account, no installation.
- Shows the eight stages of the Talent Marketing Engine™ with your results against target. Lower-is-better metrics (cost per hire, attrition) are colored the right way round.
- Shows the candidate journey and the conversion between stages against your plan, and marks the biggest drop.
- Shows your RAG status against the benchmark, and points out where it disagrees with your % of target.
- Drafts three lines for leadership (what changed, why, what we'll do) that you edit and copy.
- Flags numbers to check before you share, like a metric that halved since last quarter.
- Gives you two AI prompts with your numbers already filled in: a skeptical CFO review and a funnel diagnosis.
- "Make it yours": your company name, logo, brand colors, stage colors, currency, and the font for names and numbers.

## Get started

**Option 1: use it as it is.** Download this folder (green **Code** button → **Download ZIP**), unzip it, and double-click `index.html`. Click **Load your scorecard**.

**Option 2: make it your own with AI.** Open [`prompts/start-here.md`](prompts/start-here.md). It explains how to ask Claude, ChatGPT or Copilot to change the dashboard for you, without writing code.

**Try it first** with `sample/sample-scorecard.xlsx`. It has made-up numbers.

## What you need

- The Talent Marketing Impact Scorecard™ from the course, with its **"Google Sheets input"** tab. Using your own spreadsheet? Give it the same layout (see "The data contract" in [`AGENTS.md`](AGENTS.md)), or ask your AI assistant to adapt the dashboard to your layout.
- A recent version of Chrome, Edge, Firefox or Safari.
- If your file lives in OneDrive, SharePoint or Google Drive: download a copy as .xlsx first.

## Your data stays with you

The page reads your file in your browser and forgets it when you close the tab. It's locked so it can't connect to the internet, and you can check that yourself: turn off your Wi-Fi and it still works. Read [`PRIVACY.md`](PRIVACY.md), and share [`SECURITY.md`](SECURITY.md) with your IT team if they ask.

The one moment your numbers can leave the page is when **you** copy an AI prompt and paste it into an AI tool. Use only the AI tools your employer approves, and leave confidential figures out.

## Customize it

- **Quick, per browser:** click **Make it yours** on the page.
- **For everyone who uses your copy:** change `js/settings.js` (company name, colors, logo, words, stage names, story wording). It's written in plain English.
- **With your AI assistant:** follow [`prompts/start-here.md`](prompts/start-here.md). The assistant reads [`AGENTS.md`](AGENTS.md), which tells it how the dashboard works and which safety rules to keep.
- **After every change:** run [`prompts/safety-check.md`](prompts/safety-check.md).

## What's in this folder

```
index.html                 the dashboard (open this)
css/dashboard.css          the look
js/settings.js             your settings: start here
js/dashboard.js            draws the page
js/scorecard.js            reads the scorecard
js/xlsx-reader.js          opens the .xlsx file in memory
js/sample-data.js          the example shown when the page opens
img/                       images, like your logo
sample/sample-scorecard.xlsx   made-up scorecard to test with
prompts/                   prompts for your AI assistant
AGENTS.md                  instructions for AI assistants (Claude Code, Codex, Copilot)
CLAUDE.md                  points Claude Code to AGENTS.md
.github/copilot-instructions.md   points GitHub Copilot to AGENTS.md
PRIVACY.md                 how your data is handled
SECURITY.md                for your IT team
LICENSE.md                 the license
```

## Good to know

- **It's provided as is.** Always check your numbers before you present them. If a change breaks something, download the original folder again: it's your safe starting point.
- **License:** [PolyForm Shield 1.0.0](LICENSE.md). You can use it, change it and share it, also at work. You can't use it to offer a product that competes with Talent Marketing Coach.
- **Trademarks:** Talent Marketing Engine™, Talent Marketing Impact Scorecard™, Talent Marketing Coach and its logo are trademarks of Talent Marketing Coach. The license doesn't cover them. If you share a changed version, give it your own name and logo.

Required Notice: Copyright Talent Marketing Coach (https://talentmarketingcoach.com)
