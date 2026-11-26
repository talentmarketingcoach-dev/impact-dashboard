/*
  ENGINE: reads an .xlsx file in the browser.
  You don't need to change this file to customize the dashboard (see settings.js).

  An .xlsx file is a zip folder of XML files. This reads it in memory with the browser's own
  tools (DecompressionStream and DOMParser). Nothing is uploaded, nothing is stored, and no
  outside code is used. Only the values Excel saved in the file are read: formulas are never run.
*/
(function () {
  'use strict';

  // Find each file in the zip and return a function that unpacks one file by name.
  async function unzip(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf), td = new TextDecoder();
    let end = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65558); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { end = i; break; }
    }
    if (end < 0) throw new Error('not-xlsx');
    const count = dv.getUint16(end + 10, true);
    let p = dv.getUint32(end + 16, true);
    const files = {};
    for (let i = 0; i < count; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true);
      const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      files[td.decode(u8.subarray(p + 46, p + 46 + nl))] = { method, size, off };
      p += 46 + nl + xl + cl;
    }
    return async function read(name) {
      const f = files[name];
      if (!f) return null;
      const start = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true);
      const raw = u8.subarray(start, start + f.size);
      if (f.method === 0) return td.decode(raw);
      if (f.method !== 8) throw new Error('not-xlsx');
      // new Response() here only unpacks bytes in memory; it is not a network request.
      const out = await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
      return td.decode(out);
    };
  }

  const parseXML = s => new DOMParser().parseFromString(s, 'application/xml');
  const tags = (el, n) => Array.from(el.getElementsByTagNameNS('*', n));
  const colNum = l => { let n = 0; for (const ch of l) n = n * 26 + ch.charCodeAt(0) - 64; return n; };

  // Returns { names, sheet(regex) }. sheet() gives a Map: row number -> Map(column number -> { v, f }).
  async function readWorkbook(buf) {
    const get = await unzip(buf);
    const wbx = await get('xl/workbook.xml');
    if (!wbx) throw new Error('not-xlsx');
    const wb = parseXML(wbx);
    const rels = parseXML((await get('xl/_rels/workbook.xml.rels')) || '<r/>');
    const relMap = {};
    tags(rels, 'Relationship').forEach(r => { relMap[r.getAttribute('Id')] = r.getAttribute('Target'); });
    const sstx = await get('xl/sharedStrings.xml');
    const sst = sstx ? tags(parseXML(sstx), 'si').map(si => tags(si, 't').filter(t => t.parentNode.localName !== 'rPh').map(t => t.textContent).join('')) : [];
    const sheets = tags(wb, 'sheet').map(s => {
      const rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      let t = relMap[rid] || '';
      t = t.startsWith('/') ? t.slice(1) : 'xl/' + t.replace(/^\.\//, '');
      return { name: s.getAttribute('name') || '', path: t };
    });
    return {
      names: sheets.map(s => s.name),
      async sheet(re) {
        const s = sheets.find(x => re.test(x.name.trim()));
        if (!s) return null;
        const xml = parseXML((await get(s.path)) || '<x/>');
        const rows = new Map();
        tags(xml, 'c').forEach(c => {
          const m = /^([A-Z]+)(\d+)$/.exec(c.getAttribute('r') || '');
          if (!m) return;
          const t = c.getAttribute('t');
          const vEl = tags(c, 'v')[0], fEl = tags(c, 'f')[0];
          let v = vEl ? vEl.textContent : null;
          if (t === 's') v = sst[+v] ?? '';
          else if (t === 'inlineStr') v = tags(c, 't').map(x => x.textContent).join('');
          else if (t === 'b') v = v === '1';
          else if (t === 'e') v = { error: v };
          else if (t !== 'str' && v != null && v !== '') { const n = Number(v); v = Number.isNaN(n) ? v : n; }
          const r = +m[2];
          if (!rows.has(r)) rows.set(r, new Map());
          rows.get(r).set(colNum(m[1]), { v, f: fEl ? fEl.textContent : '' });
        });
        return rows;
      }
    };
  }

  window.XlsxReader = { readWorkbook };
})();
