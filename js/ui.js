/* =====================================================================
   ui.js — DOM helpers, tiny syntax highlighter, search index, toasts
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH || (root.DSH = {});
  var doc = root.document;

  /* ------------------------------------------------------------------ DOM */
  function h(tag, attrs, children) {
    var el = doc.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'value') el.value = v;
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? doc.createTextNode(String(c)) : c);
    });
    return el;
  }

  function clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* --------------------------------------------------- syntax highlighting */
  var PY_KW = /\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|yield|lambda|assert|pass|break|continue|global|nonlocal|in|is|not|and|or|None|True|False|async|await|del|print)\b/g;
  var SQL_KW = /\b(select|from|where|group\s+by|order\s+by|having|join|left|right|inner|outer|on|as|with|insert|update|delete|values|set|create|table|view|partition|over|lag|lead|row_number|rank|dense_rank|sum|count|avg|min|max|case|when|then|end|distinct|union|all|limit|offset|window|cte|and|or|not|null|is|in|exists|between|interval|date_trunc|extract)\b/gi;
  var SH_KW = /\b(sudo|cd|ls|cp|mv|rm|mkdir|export|source|echo|cat|grep|find|chmod|chown|curl|wget|git|pip|pip3|python|python3|conda|docker|kubectl|npm|npx|node|make|tar|xargs|awk|sed|ssh|scp)\b/g;

  function highlightCode(src, lang) {
    /* Sentinels are built at runtime with fromCharCode so the source file
       never contains raw control characters. */
    var M = {
      c1: String.fromCharCode(1), c2: String.fromCharCode(2),
      s1: String.fromCharCode(3), s2: String.fromCharCode(4),
      k1: String.fromCharCode(5), k2: String.fromCharCode(6),
      n1: String.fromCharCode(7), n2: String.fromCharCode(8),
      f1: String.fromCharCode(14), f2: String.fromCharCode(15),
      p1: String.fromCharCode(16), p2: String.fromCharCode(17)
    };
    var isShell = lang === 'bash' || lang === 'shell' || lang === 'sh';
    var s = esc(src);
    var kw = (lang === 'sql') ? SQL_KW : isShell ? SH_KW : PY_KW;

    if (isShell) {
      // dim the shell prompt so the command itself reads as the signal
      s = s.replace(/^(\s*)(\$\s)/gm, '$1' + M.p1 + '$2' + M.p2);
    }
    // comments and strings first, so keywords inside them stay untouched
    s = s.replace(/(#[^\n]*)/g, M.c1 + '$1' + M.c2);
    s = s.replace(/('''[\s\S]*?'''|"""[\s\S]*?"""|'[^'\n]*'|"[^"\n]*")/g,
      M.s1 + '$1' + M.s2);
    s = s.replace(kw, function (m) { return M.k1 + m + M.k2; });
    s = s.replace(/\b(\d+\.?\d*)\b/g, M.n1 + '$1' + M.n2);
    s = s.replace(/\b([A-Za-z_][A-Za-z0-9_]*)(?=\()/g, M.f1 + '$1' + M.f2);

    s = s.split(M.c1).join('<span class="tok-com">').split(M.c2).join('</span>');
    s = s.split(M.s1).join('<span class="tok-str">').split(M.s2).join('</span>');
    s = s.split(M.k1).join('<span class="tok-kw">').split(M.k2).join('</span>');
    s = s.split(M.n1).join('<span class="tok-num">').split(M.n2).join('</span>');
    s = s.split(M.f1).join('<span class="tok-fn">').split(M.f2).join('</span>');
    s = s.split(M.p1).join('<span class="tok-prompt">').split(M.p2).join('</span>');
    return s;
  }

  /* ---------------------------------------------------------- confirm modal */
  function confirmDialog(message, opts) {
    opts = opts || {};
    var t = (DSH.i18n && DSH.i18n.t.bind(DSH.i18n)) || function (k) { return k; };
    return new Promise(function (resolve) {
      var settled = false;
      function close(val) {
        if (settled) return;
        settled = true;
        doc.removeEventListener('keydown', onKey, true);
        wrap.remove();
        resolve(val);
      }
      function onKey(e) {
        if (e.key === 'Escape') close(false);
        else if (e.key === 'Enter') close(true);
      }
      var okBtn = h('button', {
        class: 'icon-btn primary' + (opts.danger ? ' danger-solid' : ''),
        text: opts.confirmLabel || t('common.confirm'),
        onclick: function () { close(true); }
      });
      var wrap = h('div', { class: 'modal-wrap', role: 'presentation' }, [
        h('div', { class: 'modal-scrim', onclick: function () { close(false); } }),
        h('div', { class: 'modal-box', role: 'alertdialog', 'aria-modal': 'true' }, [
          h('p', { class: 'modal-msg', text: message }),
          h('div', { class: 'modal-actions' }, [
            h('button', {
              class: 'icon-btn', text: opts.cancelLabel || t('common.cancel'),
              onclick: function () { close(false); }
            }),
            okBtn
          ])
        ])
      ]);
      doc.addEventListener('keydown', onKey, true);
      doc.body.appendChild(wrap);
      okBtn.focus();
    });
  }

  /* --------------------------------------------------------------- toasts */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!doc) return;
    if (!toastEl) { toastEl = h('div', { class: 'toast' }); doc.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1900);
  }

  /* --------------------------------------------------------------- format */
  function fmtNum(n) {
    if (typeof n !== 'number') return String(n);
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    return String(Math.round(n * 1000) / 1000);
  }
  function fmtPct(x, digits) {
    return (100 * x).toFixed(digits == null ? 0 : digits) + '%';
  }
  function fmtDate(ts, lang) {
    var d = new Date(ts);
    if (lang === 'fa') {
      return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function timeAgo(ts, lang) {
    var s = (Date.now() - ts) / 1000;
    var en = s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + ' min ago'
      : s < 86400 ? Math.floor(s / 3600) + ' h ago' : Math.floor(s / 86400) + ' d ago';
    if (lang !== 'fa') return en;
    var fa = s < 60 ? 'همین الان' : s < 3600 ? Math.floor(s / 60) + ' دقیقه پیش'
      : s < 86400 ? Math.floor(s / 3600) + ' ساعت پیش' : Math.floor(s / 86400) + ' روز پیش';
    return fa;
  }

  /* --------------------------------------------------------- search index */
  function buildIndex(lessons, lang) {
    return lessons.map(function (l) {
      var parts = [l.title.en, l.title.fa, l.summary.en, l.summary.fa, l.domain, l.level,
        (l.tags || []).join(' '), (l.resources || []).map(function (r) { return r.title; }).join(' ')];
      (l.blocks || []).forEach(function (b) {
        if (b[0] === 'code') parts.push(b[1]);
        else { parts.push(b[1]); if (b[2]) parts.push(typeof b[2] === 'string' ? b[2] : (b[2] || []).join(' ')); }
      });
      l._text = parts.join(' \n ').toLowerCase();
      return l;
    });
  }

  function search(lessons, q, opts) {
    opts = opts || {};
    var terms = String(q || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    var out = lessons.filter(function (l) {
      if (opts.domain && opts.domain !== 'all' && l.domain !== opts.domain) return false;
      if (opts.level && opts.level !== 'all' && l.level !== opts.level) return false;
      if (opts.status === 'completed' && !DSH.store.isComplete(l.id)) return false;
      if (opts.status === 'notStarted' && DSH.store.isComplete(l.id)) return false;
      if (opts.status === 'saved' && !DSH.store.isBookmarked(l.id)) return false;
      if (opts.tag && (l.tags || []).indexOf(opts.tag) === -1) return false;
      if (!terms.length) return true;
      return terms.every(function (t) { return l._text.indexOf(t) !== -1; });
    });

    var order = { curated: 0 };
    var lvl = { beginner: 1, intermediate: 2, advanced: 3 };
    if (opts.sort === 'level') out.sort(function (a, b) {
      return (lvl[a.level] - lvl[b.level]) || a.title.en.localeCompare(b.title.en);
    });
    else if (opts.sort === 'title') out.sort(function (a, b) { return a.title.en.localeCompare(b.title.en); });
    else if (opts.sort === 'time') out.sort(function (a, b) { return a.minutes - b.minutes; });
    else out.sort(function (a, b) {
      var ai = DSH.LESSONS.indexOf(a), bi = DSH.LESSONS.indexOf(b);
      return ai - bi;
    });
    return out;
  }

  /* ------------------------------------------------------- misc helpers */
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms || 160);
    };
  }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: filename });
    doc.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 400);
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }


  /* ------------------------------------------------- maths typesetting */
  /* Turns the plain-ASCII formula notation used in lesson data into real
     mathematical notation: Greek letters, sub/superscripts, sums, roots,
     norms, relations and true bracketed matrices / column vectors.
     Dependency-free so the hub stays offline-first. */
  var GREEK = {
    lambda: 'λ', Lambda: 'Λ', sigma: 'σ', Sigma: 'Σ', mu: 'μ', theta: 'θ', alpha: 'α',
    beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', eps: 'ε', pi: 'π', phi: 'φ',
    rho: 'ρ', tau: 'τ', eta: 'η', partial: '∂', inf: '∞', approx: '≈', SUM: '∑',
    grad: '∇', sqrt: '√', PROD: '∏', INTEGRAL: '∫', Gamma: 'Γ', Omega: 'Ω', omega: 'ω',
    Theta: 'Θ', Delta: 'Δ', Phi: 'Φ', Psi: 'Ψ', psi: 'ψ', kappa: 'κ', nu: 'ν', xi: 'ξ',
    chi: 'χ', zeta: 'ζ'
  };
  var GREEK_RE = new RegExp('(^|[^A-Za-z0-9])(' + Object.keys(GREEK).join('|') + ')(?![A-Za-z])', 'g');
  var GREEK_PROSE = 'lambda|Lambda|sigma|Sigma|mu|theta|alpha|beta|gamma|delta|epsilon|rho|tau|phi|eta|pi|Gamma|Omega|omega|Theta|Delta|Phi|Psi|psi|kappa|nu|xi|chi|zeta';
  var GREEK_RE_PROSE = new RegExp('(^|[^A-Za-z0-9_])(' + GREEK_PROSE + ')(?![A-Za-z0-9]|_[A-Za-z0-9]{3,})', 'g');

  function typesetMath(src, opts) {
    var prose = !!(opts && opts.prose);
    var C = String.fromCharCode;
    var SB = [C(17), C(18)], SP = [C(19), C(20)], RD = [C(21), C(22)], PH = [C(23), C(24)];
    var holders = [];

    function sqrtPass(t) {
      var out = '', i = 0;
      for (;;) {
        var k = t.indexOf('sqrt(', i);
        if (k < 0) { out += t.slice(i); break; }
        out += t.slice(i, k);
        var d = 0, j = k + 4;
        for (; j < t.length; j++) {
          if (t.charAt(j) === '(') d++;
          else if (t.charAt(j) === ')') { d--; if (d === 0) break; }
        }
        if (j >= t.length) { out += t.slice(k); break; }
        out += '√' + RD[0] + sqrtPass(t.slice(k + 4, j + 1)) + RD[1];
        i = j + 1;
      }
      return out;
    }

    function inline(t) {
      t = sqrtPass(t);
      var keepLambda = prose && /Python|pandas|\.apply|sorted\(|lambda\s+\w*\s*:|lambda\s+(function|expression)/i.test(t);
      if (keepLambda) t = t.replace(/\blambda\b/g, C(25));
      t = t.replace(prose ? GREEK_RE_PROSE : GREEK_RE, function (m, pre, w) { return pre + GREEK[w]; });
      if (keepLambda) t = t.split(C(25)).join('lambda');
      t = t.replace(/<=>/g, '⇔').replace(/<->/g, '↔').replace(/->/g, '→').replace(/=>/g, '⇒')
        .replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/!=/g, '≠')
        .replace(/\+-/g, '±').replace(/\.\.\./g, '…');
      t = prose ? t.replace(/\|\|([^|\n]{1,30}?)\|\|/g, '‖$1‖').replace(/([A-Za-z0-9)])\|\|([A-Za-z0-9(])/g, '$1‖$2')
                : t.replace(/\|\|/g, '‖');
      t = t.replace(/<-(?!>)/g, '←');
      if (prose) {
        t = t.replace(/\b(SUM|PROD|INTEGRAL)(?![A-Za-z0-9])/g, function (m) { return GREEK[m]; });
        t = t.replace(/\bgrad(?=_)/g, '∇').replace(/\bgrad\s+(?=[A-Za-z(])/g, '∇');
        t = t.replace(/([A-Za-zα-ωΑ-Ω])_hat\b/g, '$1\u0302').replace(/([A-Za-zα-ωΑ-Ω])_bar\b/g, '$1\u0304');
      }
      t = t.replace(/ \* /g, ' · ').replace(/(\w|\))\*(?=\w|\()/g, '$1·');
      t = t.replace(/\b(\d+|[mnkdp]) x (\d+|[mnkdp])\b/g, '$1 × $2');
      if (!prose) t = t.replace(/\s+in\s+(?=R\^|\[|\{|R\b|C\b|Z\b)/g, ' ∈ ');
      t = t.replace(/\bR(?=\^)/g, 'ℝ');
      function mk(kind, body) {
        var pair = kind === '_' ? SB : SP;
        return pair[0] + body.replace(/-/g, '−') + pair[1];
      }
      t = t.replace(/([_^])\{([^{}]*)\}/g, function (m, k, b) { return mk(k, b); });
      t = t.replace(/\^\(([^()]*)\)/g, function (m, b) { return mk('^', b); });
      t = t.replace(/_\[([^\]\n]*)\]/g, function (m, b) { return mk('_', '[' + b + ']'); });
      if (prose) {
        t = t.replace(/‖_([A-Za-z0-9]{1,2})(?![A-Za-z0-9_])/g, function (m, sb) { return '‖' + mk('_', sb); });
        t = t.replace(/(^|[^A-Za-z0-9_α-ωΑ-Ω])([A-Za-zα-ωΑ-Ω‖∑∏∫∇])_([A-Za-z0-9]{1,2})(?![A-Za-z0-9_])/g,
          function (m, pre, base, sb) { return pre + base + mk('_', sb); });
        t = t.replace(/([A-Za-z0-9ℝα-ωΑ-Ω‖∫\u0302\u0304\u0012)\]])\^(-?[A-Za-z0-9α-ω∞]{1,3})(?![A-Za-z0-9])/g,
          function (m, base, b) { return base + mk('^', b); });
      } else {
        t = t.replace(/([_^])(-?[A-Za-z0-9∞]{1,3})(?![A-Za-z0-9])/g, function (m, k, b) { return mk(k, b); });
      }
      t = esc(t);
      return t.split(SB[0]).join('<sub>').split(SB[1]).join('</sub>')
        .split(SP[0]).join('<sup>').split(SP[1]).join('</sup>')
        .split(RD[0]).join('<span class="rad">').split(RD[1]).join('</span>');
    }

    function holder(rows) {
      var cols = 0;
      rows.forEach(function (r) { cols = Math.max(cols, r.length); });
      var cells = '';
      rows.forEach(function (r) {
        for (var c = 0; c < cols; c++) cells += '<span>' + inline((r[c] || '').trim()) + '</span>';
      });
      holders.push('<span class="mx"><span class="mx-grid" style="grid-template-columns:repeat(' + cols + ',auto)">' + cells + '</span></span>');
      return PH[0] + (holders.length - 1) + PH[1];
    }

    var s = String(src);
    // [[a, b], [c, d]]  ->  bracketed matrix
    s = s.replace(/\[\s*(\[[^\[\]]*\](?:\s*,\s*\[[^\[\]]*\])*)\s*\]/g, function (m, body) {
      var rows = body.split(/\]\s*,\s*\[/).map(function (r) {
        return r.replace(/^\[|\]$/g, '').split(',');
      });
      return holder(rows);
    });
    // [a, b, c]^T  ->  column vector
    s = s.replace(/\[([^\[\]:;\n]*,[^\[\]:;\n]*)\]\^T/g, function (m, body) {
      return holder(body.split(',').map(function (x) { return [x]; }));
    });

    var out = inline(s);
    return out.replace(new RegExp(PH[0] + '(\\d+)' + PH[1], 'g'), function (m, i) { return holders[+i]; });
  }


  function typesetProse(src) { return typesetMath(src, { prose: true }); }

  /* Walks rendered text and typesets maths notation that appears inside
     ordinary sentences (lesson prose, notes, quiz text, project steps). */
  var MATHISH = /[=<>≤≥≠→←⇒⇔±·×√∑∏∫ℝ∇‖()\[\]\/^]|<su[bp]>|<span class="mx"|[α-ωΑ-Ω]/;
  function isolateLtr(html) {
    return html.split(/([\u0600-\u06FF\u200c\u200f«»]+)/).map(function (seg, i) {
      if (i % 2) return seg;
      var m = /^(\s*)([\s\S]*?)([.,;:]?\s*)$/.exec(seg);
      var core = m[2], plain = core.replace(/<[^>]*>/g, '');
      if (!/[A-Za-z0-9α-ωΑ-Ω]/.test(plain) || !MATHISH.test(core)) return seg;
      if ((plain.split('(').length !== plain.split(')').length) ||
          (plain.split('[').length !== plain.split(']').length)) return seg;
      return m[1] + '<bdi dir="ltr">' + core + '</bdi>' + m[3];
    }).join('');
  }

  var PROSE_TRIGGER = /[_^*]|->|<=|>=|!=|=>|\+-|\.\.\.|\|\||sqrt\(|\bx\b|\[|\b(?:lambda|Lambda|sigma|Sigma|mu|theta|alpha|beta|gamma|delta|epsilon|rho|tau|phi|eta|pi)\b/;
  var SKIP_SEL = 'pre,code,textarea,input,select,option,script,style,sub,sup,.math,.no-math,.mx,.rad,[contenteditable]';

  function typesetTextNode(node) {
    var p = node.parentElement;
    if (!p || p.closest(SKIP_SEL)) return;
    var txt = node.nodeValue;
    if (!txt || !PROSE_TRIGGER.test(txt)) return;
    var out = typesetProse(txt);
    if (out === esc(txt)) return;
    if (/[\u0600-\u06FF]/.test(txt)) out = isolateLtr(out);
    var tpl = doc.createElement('span');
    tpl.innerHTML = out;
    var frag = doc.createDocumentFragment();
    while (tpl.firstChild) frag.appendChild(tpl.firstChild);
    p.replaceChild(frag, node);
  }

  function typesetTree(el) {
    if (!el) return;
    if (el.nodeType === 3) return typesetTextNode(el);
    if (el.nodeType !== 1 || (el.closest && el.closest(SKIP_SEL))) return;
    var w = doc.createTreeWalker(el, 4, null), list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(typesetTextNode);
  }

  function autoTypeset(container) {
    typesetTree(container);
    if (!root.MutationObserver) return;
    var queue = [], scheduled = false;
    var obs = new root.MutationObserver(function (muts) {
      muts.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) queue.push(m.addedNodes[i]);
      });
      if (scheduled || !queue.length) return;
      scheduled = true;
      (root.requestAnimationFrame || root.setTimeout)(function () {
        scheduled = false;
        var batch = queue; queue = [];
        batch.forEach(function (n) { if (n.isConnected !== false) typesetTree(n); });
        obs.takeRecords(); // ignore the mutations we just made ourselves
      });
    });
    obs.observe(container, { childList: true, subtree: true });
  }

  DSH.ui = {
    h: h, clear: clear, esc: esc, highlightCode: highlightCode, toast: toast, confirmDialog: confirmDialog, typesetMath: typesetMath, typesetProse: typesetProse, autoTypeset: autoTypeset,
    fmtNum: fmtNum, fmtPct: fmtPct, fmtDate: fmtDate, timeAgo: timeAgo,
    buildIndex: buildIndex, search: search, debounce: debounce, download: download,
    shuffle: shuffle
  };
})(typeof window !== 'undefined' ? window : globalThis);
