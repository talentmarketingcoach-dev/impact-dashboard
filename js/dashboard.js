/*
  ENGINE: draws the dashboard and handles clicks.
  You don't need to change this file to customize the dashboard (see settings.js).

  Safety rules this file keeps (see AGENTS.md):
  - No internet: no fetch, XMLHttpRequest, WebSocket, sendBeacon or outside links to load anything.
  - The Excel data is never stored. Only the "Make it yours" choices are saved, in this browser.
  - Text from the Excel file goes through esc() before it's shown, and colors through isHex().
*/
(function () {
  'use strict';
  const S = window.DASHBOARD_SETTINGS;
  const $ = s => document.querySelector(s);
  const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4', 'FY'];
  const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
  const STORE_KEY = 'impact-dashboard-settings';
  const DEFAULTS = {
    company: S.brand.companyName || '', logo: S.brand.logo || '',
    brand: S.brand.brandColor, accent: S.brand.accentColor, currency: S.brand.currency || 'USD', stageColors: null,
    headingFont: S.brand.headingFont || 'Arial'
  };
  const safeFont = f => (typeof f === 'string' && /^[A-Za-z0-9 -]{1,40}$/.test(f)) ? f : 'Arial';
  const label = p => p === 'FY' ? S.text.fullYear : p;

  let prefs = loadPrefs();
  let model = window.SAMPLE_SCORECARD || null;
  let isSample = true;
  let period = 'FY';

  /* ---------- the viewer's own choices ("Make it yours") ---------- */
  function loadPrefs() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function savePrefs() { try { localStorage.setItem(STORE_KEY, JSON.stringify(prefs)); } catch (e) { /* private window: settings just aren't remembered */ } }

  /* ---------- colors ---------- */
  const isHex = h => /^#[0-9a-f]{6}$/i.test(h || '');
  function lum(h) {
    return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
      .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  }
  function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  // Dark or white text, whichever reads better on this background.
  function inkFor(bg) { return contrast(bg, '#10231A') >= contrast(bg, '#FFFFFF') ? '#10231A' : '#FFFFFF'; }
  function stageColor(n) {
    const own = prefs.stageColors && prefs.stageColors[n - 1];
    if (isHex(own)) return own;
    const file = model && model.stageColors && model.stageColors[n];
    if (isHex(file)) return file;
    const set = S.stages[n - 1] && S.stages[n - 1].color;
    return isHex(set) ? set : '#E8EEEA';
  }

  /* ---------- numbers and words ---------- */
  const nfInt = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });
  const nfCompact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  function money(v) {
    try { return new Intl.NumberFormat('en', { style: 'currency', currency: prefs.currency, maximumFractionDigits: 0 }).format(v); }
    catch (e) { return nfInt.format(v); }
  }
  function fmt(v, m, full) {
    if (v == null || Number.isNaN(v)) return '—';
    if (m.kind === 'percent') return nf1.format(v * 100) + '%';
    if (m.currency) return money(v);
    return (!full && Math.abs(v) >= 10000) ? nfCompact.format(v) : nfInt.format(v);
  }
  const pct = v => nf1.format(v * 100) + '%';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lc = name => name.split(' ').map(w => /[A-Z].*[A-Z]/.test(w) || /^[a-z]+[A-Z]/.test(w) ? w : w.toLowerCase()).join(' ');
  const fill = (tpl, vars) => String(tpl || '').replace(/\{(\w+)\}/g, (all, k) => vars[k] != null ? vars[k] : all);
  const firstSentence = b => (b || '').replace(/\s+/g, ' ').split(/\.\s+(?=[A-Z])/)[0].replace(/\.$/, '').trim();
  const stageName = n => (S.stages[n - 1] && S.stages[n - 1].name) || 'Stage ' + n;
  const normName = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  // The metrics of one stage, in the order of settings.cardOrder; the rest follow in Excel order.
  function stageMetrics(n) {
    const ms = model.metrics.filter(m => m.stage === n);
    const order = ((S.cardOrder || {})[n] || []).map(normName);
    const rank = m => { const i = order.indexOf(normName(m.name)); return i < 0 ? order.length + ms.indexOf(m) : i; };
    return ms.slice().sort((a, b) => rank(a) - rank(b));
  }

  /* ---------- the numbers behind the page ---------- */
  function hasData(p) { return !!model && model.metrics.some(m => m.v[p] && m.v[p].a); }
  function prevPeriod(p) { const i = QUARTERS.indexOf(p); return i > 0 && hasData(QUARTERS[i - 1]) ? QUARTERS[i - 1] : null; }
  function defaultPeriod() { for (const p of ['Q4', 'Q3', 'Q2', 'Q1']) if (hasData(p)) return p; return 'FY'; }
  function perf(m, p) {
    const x = m.v[p];
    if (!x || x.a == null) return null;
    if (!x.t) return { a: x.a, t: null };
    const ratio = x.a / x.t;
    const score = m.dir === 'DOWN' ? (x.a ? x.t / x.a : Infinity) : ratio;   // score >= 1 means "on or better than target"
    return { a: x.a, t: x.t, pct: ratio, score, good: score >= 1 };
  }
  function journey() {
    const f = {};
    (S.journey || []).forEach(j => {
      const yes = new RegExp(j.match, 'i'), no = j.not ? new RegExp(j.not, 'i') : null;
      f[j.step] = model.metrics.find(m => m.kind === 'number' && yes.test(m.name) && !(no && no.test(m.name)));
    });
    return f;
  }
  function conversions(p) {
    const f = journey();
    return (S.conversions || []).map(c => {
      const A = f[c.from], B = f[c.to];
      if (!A || !B) return null;
      const x = A.v[p] || {}, y = B.v[p] || {};
      if (!x.a || y.a == null) return null;
      const act = y.a / x.a, plan = x.t && y.t ? y.t / x.t : null;
      return { from: A, to: B, verb: c.verb, fix: c.fix, act, plan, ratio: plan ? act / plan : null };
    }).filter(Boolean);
  }
  function biggestLeak(list) {
    return list.filter(s => s.ratio != null && s.ratio < S.thresholds.leakBelowPlan).sort((a, b) => a.ratio - b.ratio)[0] || null;
  }
  const statusKey = s => !s ? null : /on track/i.test(s) ? 'g' : /attention/i.test(s) ? 'a' : /action|required/i.test(s) ? 'r' : null;

  /* ---------- drawing ---------- */
  function applyBrand() {
    const root = document.documentElement.style;
    const brand = isHex(prefs.brand) ? prefs.brand : DEFAULTS.brand;
    const accent = isHex(prefs.accent) ? prefs.accent : DEFAULTS.accent;
    root.setProperty('--brand', brand); root.setProperty('--brand-ink', inkFor(brand));
    root.setProperty('--accent', accent); root.setProperty('--accent-ink', inkFor(accent));
    root.setProperty('--display', `"${safeFont(prefs.headingFont)}", Arial, Helvetica, sans-serif`);
    if (S.brand.font && /^[\w\s'",-]+$/.test(S.brand.font)) {
      root.setProperty('--body', `${S.brand.font}, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`);
    }
    const logo = $('#logo');
    if (prefs.logo) { logo.src = prefs.logo; logo.alt = (prefs.company || 'Company') + ' logo'; logo.hidden = false; $('#logoPh').hidden = true; }
    else { logo.hidden = true; logo.removeAttribute('src'); $('#logoPh').hidden = false; }
    $('#company').textContent = prefs.company || (isSample ? S.text.exampleCompany : 'Your company');
  }
  function renderTexts() {
    document.title = S.text.pageTitle;
    $('#subtitle').textContent = S.text.subtitle;
    $('#legendText').textContent = S.text.legend;
  }
  function renderPeriods() {
    $('#periods').innerHTML = PERIODS.map(p => {
      const ok = hasData(p);
      return `<button type="button" data-p="${p}" aria-pressed="${p === period}" ${ok ? '' : 'disabled title="No numbers for this period yet"'}>${esc(label(p))}</button>`;
    }).join('');
    $('#eyebrow').textContent = `${S.text.leadershipView} · ${label(period)}${isSample ? ' · ' + S.text.exampleTag : ''}`;
  }
  function renderSource() {
    $('#source').innerHTML = isSample
      ? `<span class="pill example">Example data</span><span>${esc(S.text.exampleNote)}</span>`
      : `<span class="pill yours">Your file</span><strong>${esc(model.file)}</strong>`;
    // Make the example unmistakable everywhere it could be copied or screenshotted.
    $('#exampleBanner').hidden = !isSample;
    $('#exampleBannerText').textContent = S.text.exampleBanner;
    $('#exampleBannerMore').textContent = S.text.exampleBannerMore;
    $('#storyHint').textContent = isSample
      ? 'A first draft from the example numbers. Load your scorecard to get the draft for your own numbers.'
      : 'A first draft from your numbers. Edit it, then copy it into your report.';
    $('#promptHint').textContent = isSample
      ? 'Filled in with the example numbers for now. Load your scorecard to use your own.'
      : 'Your numbers are already filled in. Paste the prompt into the AI tool you use.';
  }

  function kpiHTML(m) {
    const p = perf(m, period);
    if (!p) return `<article class="kpi"><h3>${esc(m.name)}</h3><p class="val">—</p><p class="meta">No number for ${esc(label(period))} yet</p></article>`;
    let bar = '', cmp = '<p class="meta">No target set</p>';
    if (p.t != null) {
      const cls = p.good ? 'good' : 'bad';
      bar = `<div class="bar" aria-hidden="true"><span class="${cls}-fill" style="width:${Math.min(p.pct, 1) * 100}%"></span></div>`;
      cmp = `<p class="cmp ${cls}">${nf1.format(p.pct * 100)}% <span class="of">of ${esc(fmt(p.t, m))} target</span></p>`;
    }
    const notes = [];
    const pv = prevPeriod(period), q = pv && m.v[pv];
    if (q && q.a) {
      if (m.kind === 'percent') { const d = (p.a - q.a) * 100, s = nf1.format(Math.abs(d)); notes.push(`${d >= 0 ? '▲' : '▼'} ${s} ${s === '1' ? 'pt' : 'pts'} vs ${pv}`); }
      else { const d = (p.a - q.a) / Math.abs(q.a); notes.push(`${d >= 0 ? '▲' : '▼'} ${nf1.format(Math.abs(d) * 100)}% vs ${pv}`); }
    }
    if (m.dir === 'DOWN') notes.push('Lower is better');
    return `<article class="kpi"${m.measures ? ` title="${esc(m.measures)}"` : ''}><h3>${esc(m.name)}</h3><p class="val">${esc(fmt(p.a, m))}</p>${bar}${cmp}${notes.length ? `<p class="meta">${notes.join(' · ')}</p>` : ''}</article>`;
  }
  function renderStages() {
    let h = '';
    (S.stageGroups || []).forEach(g => {
      h += `<div><h2 class="loop">${esc(g.label)}</h2><div class="stage-list">`;
      for (let n = g.from; n <= g.to; n++) {
        const ms = stageMetrics(n), c = stageColor(n);
        h += `<div class="stage-row"><div class="stage-chip" style="--sc:${c};--sc-ink:${inkFor(c)}"><span class="n">Stage ${n}</span><span class="nm">${esc(stageName(n))}</span></div>`
          + `<div class="cards">${ms.length ? ms.map(kpiHTML).join('') : '<p class="empty">No metric for this stage on your dashboard yet.</p>'}</div></div>`;
      }
      h += '</div></div>';
    });
    $('#stages').innerHTML = h;
  }
  function renderJourney() {
    const f = journey();
    const list = (S.journey || []).map(j => f[j.step]).filter(Boolean);
    const vals = list.map(m => (m.v[period] || {}).a || 0);
    const max = Math.max(1, ...vals);
    $('#journey').innerHTML = list.length
      ? list.map((m, i) => `<div class="jrow"><span>${esc(m.name)}</span><span class="jtrack"><span class="jbar" style="--sc:${stageColor(m.stage)};width:${Math.max(vals[i] / max * 100, 0.8)}%"></span></span><span class="jval">${esc(fmt(vals[i], m))}</span></div>`).join('')
      : '<p class="empty">Add impressions, career site traffic, engagements, applications and hires to see the journey.</p>';
    const list2 = conversions(period), leak = biggestLeak(list2);
    $('#conv').innerHTML = list2.length ? list2.map(s => {
      const r = s.ratio;
      const cls = r == null ? '' : r >= 1 ? 'good' : r >= S.thresholds.leakBelowPlan ? 'warn' : 'bad';
      const w = r == null ? 0 : Math.min(r, 1.5) / 1.5 * 100;
      return `<div class="step"><span class="lbl">${esc(s.from.name)} → ${esc(s.to.name)}${s === leak ? ' <span class="tag">Biggest drop vs plan</span>' : ''}</span>`
        + `<span class="pct">${pct(s.act)}</span>`
        + `<span class="plan"><span class="bullet" aria-hidden="true"><span class="${cls}-fill" style="width:${w}%"></span><i></i></span>${s.plan ? `plan ${pct(s.plan)}` : 'no plan'}</span></div>`;
    }).join('') : '<p class="empty">Not enough funnel numbers for this period.</p>';
  }
  function ragTable(rows) {
    if (!rows.length) return '<tbody><tr><td class="empty">No indicators in this group.</td></tr></tbody>';
    return `<thead><tr><th scope="col">Indicator</th><th scope="col" class="num">${esc(label(period))}</th><th scope="col">Status</th></tr></thead><tbody>`
      + rows.map(r => {
        const x = r.v[period] || {}, k = statusKey(x.s);
        return `<tr><td><span class="dot" style="--sc:${stageColor(r.stage)}"></span>${esc(r.name)}${r.bench ? `<span class="bench">Benchmark: ${esc(firstSentence(r.bench))}</span>` : ''}</td>`
          + `<td class="num">${esc(fmt(x.a, r))}</td><td>${x.s ? `<span class="status ${k || 'n'}">${esc(x.s)}</span>` : '—'}</td></tr>`;
      }).join('') + '</tbody>';
  }
  function lensNotes() {
    const out = [], near = S.thresholds.lensesAgree;
    model.rag.forEach(r => {
      const m = model.metrics.find(mm => mm.name === r.metric), p = m && perf(m, period);
      const s = (r.v[period] || {}).s, k = statusKey(s);
      if (!p || p.t == null || !k) return;
      if (p.score >= near && k !== 'g') out.push(`${r.name}: ${nf1.format(p.pct * 100)}% of your target, but “${s}” against the benchmark.`);
      else if (p.score < near && k === 'g') out.push(`${r.name}: only ${nf1.format(p.pct * 100)}% of your target, but “On track” against the benchmark.`);
    });
    return out;
  }
  function renderRag() {
    $('#ragTables').innerHTML = (S.ragTables || []).map((t, i) =>
      `${i ? '<h3>' : '<h2>'}${esc(t.title)}${i ? '</h3>' : '</h2>'}${t.hint ? `<p class="hint">${esc(t.hint)}</p>` : ''}`
      + `<div class="tscroll"><table>${ragTable(model.rag.filter(r => r.stage >= t.from && r.stage <= t.to))}</table></div>`).join('');
    const notes = lensNotes(), el = $('#lenses');
    el.hidden = !notes.length;
    el.innerHTML = notes.length ? `<p><strong>The two lenses disagree here.</strong> Both are true: they answer different questions.</p><ul>${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '';
  }

  function storyLines() {
    const P = label(period), T = S.story;
    const scored = model.metrics.map(m => ({ m, p: perf(m, period) })).filter(x => x.p && x.p.t != null);
    const best = scored.slice().sort((a, b) => b.p.score - a.p.score)[0];
    const worst = scored.slice().sort((a, b) => a.p.score - b.p.score)[0];
    const f = journey(), vars = x => ({ metric: x.m.name, value: fmt(x.p.a, x.m, true), pct: pct(x.p.pct) });
    const parts = [];
    if (best && best.p.score >= 1) parts.push(fill(best.m.dir === 'DOWN' ? T.under : T.beat, vars(best)));
    if (worst && worst !== best && worst.p.score < 1) parts.push(fill(worst.m.dir === 'DOWN' ? T.over : T.shortOf, vars(worst)));
    const h = f.hires && perf(f.hires, period);
    if (h && h.t != null && f.hires !== (best && best.m) && f.hires !== (worst && worst.m)) parts.push(fill(T.hires, vars({ m: f.hires, p: h })));
    const l1 = `${P}: ${parts.join(' ') || T.noTargets}`;

    const leak = biggestLeak(conversions(period));
    const top = [f.impressions, f.traffic].filter(Boolean).map(m => perf(m, period)).filter(p => p && p.t != null);
    const reachLow = top.some(p => p.score < S.thresholds.reachOnTarget);
    let l2, l3;
    if (leak) {
      l2 = fill(T.leak, { from: lc(leak.from.name), to: lc(leak.to.name), actual: pct(leak.act), verb: leak.verb, plan: pct(leak.plan) }) + ' ' + (reachLow ? T.leakReachLow : T.leakReachOk);
      l3 = fill(T.optimize, { fix: leak.fix });
    } else if (reachLow) { l2 = T.traffic; l3 = T.trafficMove; }
    else { l2 = T.steady; l3 = best ? fill(T.leanIn, { metric: lc(best.m.name), pct: pct(best.p.pct) }) : T.keepPlan; }
    return [l1, l2, l3];
  }
  function renderStory() { const [a, b, c] = storyLines(); $('#l1').value = a; $('#l2').value = b; $('#l3').value = c; }

  function renderChecks() {
    const items = [], pv = prevPeriod(period), P = label(period), th = S.thresholds;
    model.metrics.forEach(m => {
      const x = m.v[period] || {};
      if (x.a == null || x.a === 0) { items.push({ t: 'info', h: `${m.name} has no number for ${P}`, d: 'Add it to your scorecard, or check the formula that feeds it.' }); return; }
      if (!x.t) items.push({ t: 'info', h: `${m.name} has no target for ${P}`, d: 'It shows without a percentage until you add one.' });
      const q = pv && m.v[pv];
      if (q && q.a) {
        const ch = (x.a - q.a) / Math.abs(q.a);
        if (ch <= th.bigDrop || ch >= th.bigRise) items.push({ t: 'warn', h: `${m.name}: ${fmt(q.a, m, true)} in ${pv}, ${fmt(x.a, m, true)} in ${P} (${ch > 0 ? '+' : '−'}${nf1.format(Math.abs(ch) * 100)}%)`, d: 'A change this big is often a tracking or data problem. Check the source before you share.' });
      }
    });
    model.rag.forEach(r => { if (!(r.v[period] || {}).s) items.push({ t: 'info', h: `${r.name} has no RAG status for ${P}`, d: 'Pick one in your scorecard, with the benchmark next to it.' }); });
    if (!items.length) items.push({ t: 'ok', h: 'Nothing unusual', d: pv ? `No metric more than halved or doubled compared with ${pv}, and every metric has a number and a target.` : 'Every metric has a number and a target.' });
    $('#checkHint').textContent = pv ? `${P} compared with ${pv}. Big swings often point to a data problem.` : 'Missing numbers and targets for this period.';
    $('#checks').innerHTML = items.map(i => `<li><span class="ic ${i.t}" aria-hidden="true">${i.t === 'warn' ? '!' : i.t === 'ok' ? '✓' : 'i'}</span><div><strong>${esc(i.h)}</strong><p>${esc(i.d)}</p></div></li>`).join('');
  }

  function dashboardText() {
    const out = [`Leadership dashboard, ${label(period)}${isSample ? ` (${S.text.exampleCopied.toLowerCase()})` : ''}`, `Legend: ${S.text.legend}`, ''];
    for (let n = 1; n <= 8; n++) {
      const ms = stageMetrics(n);
      if (!ms.length) continue;
      out.push(`Stage ${n} · ${stageName(n)}`);
      ms.forEach(m => {
        const p = perf(m, period);
        if (!p) { out.push(`- ${m.name}: no number`); return; }
        out.push(`- ${m.name}: ${fmt(p.a, m, true)}` + (p.t != null ? ` (target ${fmt(p.t, m, true)}, ${nf1.format(p.pct * 100)}% of target${m.dir === 'DOWN' ? ', lower is better' : ''})` : ' (no target)'));
      });
    }
    out.push('', 'RAG status against the benchmark');
    model.rag.forEach(r => { const x = r.v[period] || {}; out.push(`- ${r.name}: ${fmt(x.a, r, true)}, ${x.s || 'no status'}${r.bench ? ` (benchmark: ${firstSentence(r.bench)})` : ''}`); });
    return out.join('\n');
  }
  function cfoPrompt() { return fill(S.prompts.cfo, { dashboard: dashboardText() }); }
  function funnelPrompt() {
    const f = journey(), pv = prevPeriod(period), ps = pv ? [pv, period] : [period];
    const lines = (S.journey || []).map(j => f[j.step]).filter(Boolean).map(m => `- ${m.name}: ` + ps.map(p => `${label(p)} ${fmt((m.v[p] || {}).a, m, true)}`).join(' · '));
    const periods = ps.map(label).join(' and ') + (isSample ? ` (${S.text.exampleCopied.toLowerCase()})` : '');
    return fill(S.prompts.funnel, { periods, funnel: lines.join('\n') });
  }
  function renderPrompts() { $('#cfoText').textContent = cfoPrompt(); $('#funnelText').textContent = funnelPrompt(); }

  function renderSwatches() {
    $('#swatches').innerHTML = S.stages.map((s, i) => `<label class="sw" for="sc${i + 1}"><input type="color" id="sc${i + 1}" data-i="${i}" value="${stageColor(i + 1).toLowerCase()}"><span><b>${i + 1}</b> ${esc(s.name)}</span></label>`).join('');
  }
  function syncCustomFields() {
    $('#fCompany').value = prefs.company;
    $('#fBrand').value = prefs.brand.toLowerCase(); $('#fBrandHex').value = prefs.brand.toUpperCase();
    $('#fAccent').value = prefs.accent.toLowerCase(); $('#fAccentHex').value = prefs.accent.toUpperCase();
    $('#fCurrency').value = prefs.currency;
    const sel = $('#fFont'), list = (S.fontChoices || ['Arial']).map(safeFont);
    if (!list.includes(safeFont(prefs.headingFont))) list.unshift(safeFont(prefs.headingFont));
    sel.innerHTML = list.map(f => `<option value="${esc(f)}" style="font-family:'${esc(f)}',Arial;font-weight:700">${esc(f)}${f === DEFAULTS.headingFont ? ' (default)' : ''}</option>`).join('');
    sel.value = safeFont(prefs.headingFont);
    renderSwatches();
  }
  function renderData() { renderPeriods(); renderSource(); renderStages(); renderJourney(); renderRag(); renderStory(); renderChecks(); renderPrompts(); }
  function renderAll() { applyBrand(); renderTexts(); if (model) { renderData(); syncCustomFields(); } }

  /* ---------- messages ---------- */
  function showMsg(html) { const m = $('#msg'); m.innerHTML = html; m.hidden = false; }
  function hideMsg() { $('#msg').hidden = true; }
  function announce(t) { $('#live').textContent = t; }
  function errorText(err) {
    const code = err && err.message, tab = esc(S.source.dataTab);
    if (code === 'no-tab') return `<strong>This file has no “${tab}” tab.</strong> The dashboard reads that tab, so use the course version of the Talent Marketing Impact Scorecard™, or check that the tab wasn't renamed.${err.names && err.names.length ? ` Tabs in this file: ${esc(err.names.join(', '))}.` : ''}`;
    if (code === 'no-metrics') return `<strong>No metrics found on the “${tab}” tab.</strong> Each section needs a header row that starts with “Metric name”.`;
    return '<strong>This file couldn\'t be read as an Excel file.</strong> Save it as .xlsx in Excel (File → Save As → Excel Workbook) and try again. If the file has a password, remove it first.';
  }

  /* ---------- loading files ---------- */
  async function loadBuffer(buf, name) {
    const wbk = await window.XlsxReader.readWorkbook(buf);
    const m = await window.Scorecard.buildModel(wbk, name, S);
    model = m; isSample = false; period = defaultPeriod();
    renderAll();
    announce(`Loaded ${name}. Showing ${label(period)}.`);
    return m;
  }
  async function loadFile(f) {
    hideMsg();
    if (/^image\//.test(f.type)) return readLogo(f);
    if (typeof DecompressionStream === 'undefined') return showMsg('<strong>This browser can\'t open .xlsx files here.</strong> Use a recent version of Chrome, Edge, Firefox or Safari.');
    try { await loadBuffer(await f.arrayBuffer(), f.name); }
    catch (err) { showMsg(errorText(err)); }
  }
  function readLogo(file) {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 300, h = img.naturalHeight || 100;
        const s = Math.min(1, 360 / w, 180 / h);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        try { prefs.logo = c.toDataURL('image/png'); } catch (e) { prefs.logo = fr.result; }
        savePrefs(); applyBrand(); announce('Logo added.');
      };
      img.onerror = () => showMsg('<strong>That image couldn\'t be read.</strong> Try a PNG or JPG file.');
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  /* ---------- copy buttons ---------- */
  async function copyText(text, btn, fallback) {
    const before = btn.textContent;
    try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied'; fallback.hidden = true; }
    catch (e) { fallback.value = text; fallback.hidden = false; fallback.focus(); fallback.select(); btn.textContent = 'Press Ctrl+C to copy'; }
    setTimeout(() => { btn.textContent = before; }, 2200);
  }

  /* ---------- events ---------- */
  $('#periods').addEventListener('click', e => {
    const b = e.target.closest('button[data-p]');
    if (!b || b.disabled) return;
    period = b.dataset.p; renderData();
  });
  $('#fileInput').addEventListener('change', e => { const f = e.target.files[0]; if (f) loadFile(f); e.target.value = ''; });
  $('#logoPh').addEventListener('click', () => $('#fLogo').click());
  $('#fLogo').addEventListener('change', e => { const f = e.target.files[0]; if (f) readLogo(f); e.target.value = ''; });
  $('#logoRemove').addEventListener('click', () => { prefs.logo = ''; savePrefs(); applyBrand(); });
  function toggleCustom(open) {
    $('#custom').hidden = !open; $('#customBtn').setAttribute('aria-expanded', String(open));
    if (open) { syncCustomFields(); $('#fCompany').focus(); }
  }
  $('#customBtn').addEventListener('click', () => toggleCustom($('#custom').hidden));
  $('#customClose').addEventListener('click', () => { toggleCustom(false); $('#customBtn').focus(); });
  $('#fCompany').addEventListener('input', e => { prefs.company = e.target.value.trim(); savePrefs(); applyBrand(); });
  $('#fCurrency').addEventListener('change', e => { prefs.currency = e.target.value; savePrefs(); if (model) renderData(); });
  $('#fFont').addEventListener('change', e => { prefs.headingFont = safeFont(e.target.value); savePrefs(); applyBrand(); });
  [['brand', '#fBrand', '#fBrandHex'], ['accent', '#fAccent', '#fAccentHex']].forEach(([key, pick, hex]) => {
    $(pick).addEventListener('input', e => { prefs[key] = e.target.value.toUpperCase(); $(hex).value = prefs[key]; savePrefs(); applyBrand(); });
    $(hex).addEventListener('input', e => {
      let v = e.target.value.trim(); if (v && v[0] !== '#') v = '#' + v;
      if (isHex(v)) { prefs[key] = v.toUpperCase(); $(pick).value = v.toLowerCase(); savePrefs(); applyBrand(); }
    });
  });
  $('#swatches').addEventListener('input', e => {
    const i = e.target.dataset && e.target.dataset.i;
    if (i == null) return;
    const cur = S.stages.map((_, k) => stageColor(k + 1));
    cur[+i] = e.target.value.toUpperCase();
    prefs.stageColors = cur; savePrefs();
    if (model) { renderStages(); renderJourney(); renderRag(); }
  });
  $('#resetStages').addEventListener('click', () => { prefs.stageColors = null; savePrefs(); renderSwatches(); if (model) { renderStages(); renderJourney(); renderRag(); } });
  let resetArmed = null;
  $('#resetAll').addEventListener('click', e => {
    const b = e.currentTarget;
    if (!resetArmed) { b.textContent = 'Click again to reset'; resetArmed = setTimeout(() => { b.textContent = 'Reset everything'; resetArmed = null; }, 4000); return; }
    clearTimeout(resetArmed); resetArmed = null; b.textContent = 'Reset everything';
    prefs = Object.assign({}, DEFAULTS); savePrefs(); renderAll(); announce('Settings reset.');
  });
  $('#copyLines').addEventListener('click', e => copyText(`${isSample ? S.text.exampleCopied + '\n' : ''}What changed: ${$('#l1').value}\nWhy: ${$('#l2').value}\nWhat we'll do: ${$('#l3').value}`, e.currentTarget, $('#fallLines')));
  $('#copyCfo').addEventListener('click', e => copyText(cfoPrompt(), e.currentTarget, $('#fallCfo')));
  $('#copyFunnel').addEventListener('click', e => copyText(funnelPrompt(), e.currentTarget, $('#fallFunnel')));

  let depth = 0;
  const hasFiles = e => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
  window.addEventListener('dragenter', e => { if (!hasFiles(e)) return; depth++; $('#drop').hidden = false; });
  window.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener('dragleave', e => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) $('#drop').hidden = true; });
  window.addEventListener('drop', e => {
    if (!hasFiles(e)) return;
    e.preventDefault(); depth = 0; $('#drop').hidden = true;
    const f = e.dataTransfer.files[0]; if (f) loadFile(f);
  });

  // For testing, and for AI assistants that want to load a file from code: ImpactDashboard.loadBuffer(arrayBuffer, name)
  window.ImpactDashboard = { loadBuffer };

  if (model) period = defaultPeriod();
  renderAll();
})();
