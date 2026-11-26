/*
  ENGINE: turns the workbook into the numbers the dashboard shows.
  You don't need to change this file for most customizations (see settings.js).
  Change it only if your Excel file is laid out differently from the Talent Marketing Impact Scorecard™.

  What it reads (the "data tab", "Google Sheets input" by default):
  - Sections that start with a header row whose first cell says "Metric name".
  - Columns: Metric name, TME Stage name ("Stage 1 - Unaware"), TME Stage color (#RRGGBB),
    and per period (FY, Q1-Q4) "Actual" and "Target", or "Actual" and "RAG Status".
  - A section whose title row mentions "Percentages" holds rates stored as decimals (0.11 = 11%).
  Optional: the "details tab" (TOTAL Impact Scorecard) gives Direction (UP/DOWN) and benchmarks.

  Output (the "model"):
  { file, stageColors: {1: '#hex'}, metrics: [{ name, stage, kind: 'number'|'percent', dir: 'UP'|'DOWN',
    currency, measures, bench, v: { Q1: { a, t } } }], rag: [{ name, stage, kind, metric, bench, v: { Q1: { a, s } } }] }
*/
(function () {
  'use strict';
  const isHex = h => /^#[0-9a-f]{6}$/i.test(h || '');
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exact = name => new RegExp('^' + escRe(name.trim()) + '$', 'i');
  const norm = s => String(s).toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
  const words = list => new RegExp((list || []).map(escRe).join('|') || '$^', 'i');

  async function buildModel(wbk, file, S) {
    const data = await wbk.sheet(exact(S.source.dataTab));
    if (!data) { const err = new Error('no-tab'); err.names = wbk.names; throw err; }
    const details = S.source.detailsTab ? await wbk.sheet(exact(S.source.detailsTab)) : null;

    const cell = (rows, r, c) => rows && rows.get(r) ? rows.get(r).get(c) : undefined;
    const txt = (rows, r, c) => { const x = cell(rows, r, c); if (!x || x.v == null || typeof x.v === 'object') return ''; return String(x.v).trim(); };
    const num = (rows, r, c) => {
      const x = cell(rows, r, c);
      if (!x || x.v == null || typeof x.v === 'object' || x.v === '') return null;
      if (typeof x.v === 'number') return x.v;
      const n = parseFloat(String(x.v).replace(/[,\s]/g, ''));
      return Number.isFinite(n) ? n : null;
    };

    // Direction, benchmark and "what it measures" from the details tab, when it's there.
    let T = null;
    if (details) {
      for (const [r, row] of details) {
        for (const [, x] of row) if (typeof x.v === 'string' && /^direction$/i.test(x.v.trim())) { T = { hr: r }; break; }
        if (T) break;
      }
      if (T) {
        const hdr = details.get(T.hr);
        const find = re => { for (const [c, x] of hdr) if (typeof x.v === 'string' && re.test(x.v.trim())) return c; return null; };
        Object.assign(T, { metric: find(/^metric$/i), measures: find(/what it measures/i), bench: find(/benchmark/i), dir: find(/^direction$/i) });
      }
    }
    const rowByName = name => {
      if (!T || !T.metric) return null;
      const n = norm(name);
      for (const [r, row] of details) {
        if (r <= T.hr) continue;
        const m = row.get(T.metric);
        if (!m || typeof m.v !== 'string') continue;
        const k = norm(m.v);
        if (k && (k === n || k.startsWith(n) || n.startsWith(k))) return r;
      }
      return null;
    };
    const fromDetails = (row, name) => {
      if (!T) return {};
      const r = row && details.get(row) ? row : rowByName(name);
      if (!r) return {};
      return { dir: txt(details, r, T.dir).toUpperCase(), measures: txt(details, r, T.measures), bench: txt(details, r, T.bench) };
    };
    const fromSettings = name => {
      const n = norm(name);
      const key = Object.keys(S.metrics || {}).find(k => norm(k) === n);
      return key ? S.metrics[key] : {};
    };
    const lowerWords = words(S.lowerIsBetterWords), moneyWords = words(S.currencyWords);

    const rowNums = [...data.keys()].sort((a, b) => a - b);
    const heads = rowNums.filter(r => /^metric name$/i.test(txt(data, r, 1)));
    if (!heads.length) throw new Error('no-metrics');
    const detailsRef = new RegExp(escRe(S.source.detailsTab || '§') + "'?!\\$?[A-Z]{1,3}\\$?(\\d+)", 'i');
    const metrics = [], rag = [], stageColors = {};
    let plainSections = 0;

    for (const hr of heads) {
      const cols = { p: [] };
      for (const [c, x] of data.get(hr)) {
        const l = typeof x.v === 'string' ? x.v.trim() : '';
        let m;
        if (/^metric name$/i.test(l)) cols.name = c;
        else if (/stage name/i.test(l)) cols.stage = c;
        else if (/stage colou?r/i.test(l)) cols.color = c;
        else if ((m = /^(FY|Q[1-4])\s*(actual|target|rag status)$/i.exec(l))) cols.p.push([c, m[1].toUpperCase(), ({ actual: 'a', target: 't' })[m[2].toLowerCase()] || 's']);
      }
      const isRag = cols.p.some(x => x[2] === 's');
      let title = '';
      for (let r = hr - 1; r >= hr - 3; r--) { const t = txt(data, r, 1); if (t) { title = t; break; } }
      const kind = isRag ? 'rag' : /percent/i.test(title) ? 'percent' : /metric/i.test(title) ? 'number' : (plainSections ? 'percent' : 'number');
      if (!isRag) plainSections++;

      for (let r = hr + 1; r < hr + 300; r++) {
        const name = txt(data, r, cols.name);
        if (!name || /^metric name$/i.test(name)) break;
        const sm = /(\d)/.exec(txt(data, r, cols.stage));
        const stage = sm ? +sm[1] : 0;
        const color = txt(data, r, cols.color);
        if (stage >= 1 && stage <= 8 && isHex(color) && !stageColors[stage]) stageColors[stage] = color.toUpperCase();
        const v = {};
        for (const [c, p, k] of cols.p) { v[p] = v[p] || {}; v[p][k] = k === 's' ? txt(data, r, c) : num(data, r, c); }
        if (isRag) { rag.push({ name, stage, v }); continue; }

        const firstCol = cols.p[0] && cols.p[0][0];
        const fm = detailsRef.exec((cell(data, r, firstCol) || {}).f || '');
        const d = fromDetails(fm ? +fm[1] : null, name), s = fromSettings(name);
        const dir = (d.dir === 'UP' || d.dir === 'DOWN') ? d.dir : (s.direction || (lowerWords.test(name) ? 'DOWN' : 'UP'));
        const currency = kind === 'number' && (s.currency != null ? !!s.currency : moneyWords.test(name));
        metrics.push({ name, stage, kind, dir, currency, measures: d.measures || s.measures || '', bench: d.bench || s.benchmark || '', v });
      }
    }
    if (!metrics.length) throw new Error('no-metrics');

    const ragFull = rag.map(x => {
      const m = metrics.find(mm => norm(mm.name) === norm(x.name));
      const kind = m ? m.kind : (Object.values(x.v).every(o => o.a == null || Math.abs(o.a) <= 1) ? 'percent' : 'number');
      return Object.assign({}, x, { kind, metric: m ? m.name : null, bench: (m && m.bench) || fromSettings(x.name).benchmark || '' });
    });
    return { file, stageColors, metrics, rag: ragFull };
  }

  window.Scorecard = { buildModel };
})();
