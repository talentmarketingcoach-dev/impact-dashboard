# Start here: change the dashboard with your AI assistant

Use this the first time you ask an AI assistant to change the dashboard. It works in Claude, ChatGPT and Microsoft Copilot chat, and in coding assistants like Claude Code, Codex and GitHub Copilot.

**When it fits:** any change, big or small.

**You'll need:**
- `AGENTS.md` (the instructions for AI assistants)
- `js/settings.js` (most changes happen here)
- For bigger changes, the file the assistant asks for

In a chat assistant, attach these files. In a coding assistant opened on this folder, it reads them itself.

**The prompt:**

```
I'm a [role] at a [type of company].
I want to customize the Talent Marketing Impact Dashboard. I'm not a developer.
Here are AGENTS.md and js/settings.js. Read AGENTS.md first and follow it.
What I want to change: [describe it in your own words, for example "use our brand colors #0A3D62 and #F5A623 and our company name Lumora Tech"].
Please give me the result as: first, two or three sentences on what you'll change and in which file. Then the complete new file or files, ready to copy. Then how I can test it.
Tell me what you assumed, and what I should double-check.
```

**Check before you trust it:**
- Did it give you complete files, not pieces? If not, ask: "Please give me the whole file."
- Open `index.html`, load `sample/sample-scorecard.xlsx`, and look at the change.
- Run the safety check in `safety-check.md` before you use it with your real scorecard.

**Never paste your real numbers into the AI.** It doesn't need them: the made-up sample is enough to test every change.
