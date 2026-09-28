/* =====================================================================
   playgrounds.js — interactive visual widgets (no dependencies)
   Each playground: { id, title, desc, build(): HTMLElement }
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, ui = DSH.ui, h = ui.h;
  var t = function (k, v) { return DSH.i18n.t(k, v); };

  function slider(label, opts) {
    var out = h('output', { text: opts.fmt ? opts.fmt(opts.value) : String(opts.value) });
    var input = h('input', {
      type: 'range', min: opts.min, max: opts.max, step: opts.step || 1, value: opts.value,
      oninput: function () {
        var v = parseFloat(this.value);
        out.textContent = opts.fmt ? opts.fmt(v) : String(v);
        opts.onInput(v);
      }
    });
    return h('div', { class: 'slider' }, [
      h('label', {}, [h('span', { text: label }), out]),
      input
    ]);
  }

  function svgEl(tag, attrs) {
    var el = root.document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function canvasSetup(w, hgt) {
    var c = h('canvas');
    var dpr = Math.min(root.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = hgt * dpr;
    c.style.width = '100%'; c.style.aspectRatio = w + ' / ' + hgt;
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { el: c, ctx: ctx, w: w, h: hgt };
  }

  function colors() {
    var cs = getComputedStyle(root.document.documentElement);
    return {
      text: cs.getPropertyValue('--text').trim() || '#111',
      muted: cs.getPropertyValue('--muted').trim() || '#888',
      border: cs.getPropertyValue('--border').trim() || '#ddd',
      accent: cs.getPropertyValue('--accent').trim() || '#4f46e5',
      ok: cs.getPropertyValue('--ok').trim() || '#10b981',
      err: cs.getPropertyValue('--err').trim() || '#ef4444',
      bg: cs.getPropertyValue('--surface').trim() || '#fff'
    };
  }

  /* =====================================================================
     1. Matrix transformation
     ===================================================================== */
  function matrixPlayground() {
    var a = 1.4, b = 0.6, c = -0.3, d = 1.1;
    var wrap = h('div', { class: 'pg' });
    var svgWrap = h('div');
    var panel = h('div');

    var svg = svgEl('svg', { viewBox: '-6 -6 12 12' });
    svgWrap.appendChild(svg);

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var C = colors();
      // original grid
      var g1 = svgEl('g', { stroke: C.border, 'stroke-width': 0.03, fill: 'none', opacity: 0.85 });
      for (var i = -6; i <= 6; i++) {
        g1.appendChild(svgEl('line', { x1: i, y1: -6, x2: i, y2: 6 }));
        g1.appendChild(svgEl('line', { x1: -6, y1: i, x2: 6, y2: i }));
      }
      svg.appendChild(g1);
      // transformed grid
      function T(x, y) { return [a * x + b * y, c * x + d * y]; }
      var g2 = svgEl('g', { stroke: C.accent, 'stroke-width': 0.035, fill: 'none', opacity: 0.75 });
      for (var j = -8; j <= 8; j++) {
        var p1 = T(j, -8), p2 = T(j, 8);
        g2.appendChild(svgEl('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] }));
        var q1 = T(-8, j), q2 = T(8, j);
        g2.appendChild(svgEl('line', { x1: q1[0], y1: q1[1], x2: q2[0], y2: q2[1] }));
      }
      svg.appendChild(g2);
      // axes
      var g0 = svgEl('g', { stroke: C.muted, 'stroke-width': 0.05 });
      g0.appendChild(svgEl('line', { x1: -6, y1: 0, x2: 6, y2: 0 }));
      g0.appendChild(svgEl('line', { x1: 0, y1: -6, x2: 0, y2: 6 }));
      svg.appendChild(g0);
      // unit square (original, dashed) and its image
      var sq = [[0, 0], [1, 0], [1, 1], [0, 1]].map(function (p) { return T(p[0], p[1]); })
        .map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
      svg.appendChild(svgEl('polygon', { points: '0,0 1,0 1,1 0,1', fill: C.accent, opacity: 0.08,
        stroke: C.accent, 'stroke-dasharray': '0.12 0.1', 'stroke-width': 0.03 }));
      svg.appendChild(svgEl('polygon', { points: sq, fill: C.accent, opacity: 0.28,
        stroke: C.accent, 'stroke-width': 0.06 }));
      // basis vectors
      function arrow(vx, vy, col) {
        var p = T(vx, vy);
        svg.appendChild(svgEl('line', { x1: 0, y1: 0, x2: p[0], y2: p[1], stroke: col, 'stroke-width': 0.12 }));
        svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 0.11, fill: col }));
      }
      arrow(1, 0, C.ok);
      arrow(0, 1, C.err);

      var det = a * d - b * c;
      var txt = svgEl('text', { x: -5.7, y: -5.1, fill: C.text, 'font-size': 0.52,
        'font-family': 'ui-monospace, monospace' });
      txt.textContent = 'A = [[' + a.toFixed(2) + ', ' + b.toFixed(2) + '], [' + c.toFixed(2) + ', ' +
        d.toFixed(2) + ']]   det = ' + det.toFixed(2);
      svg.appendChild(txt);
      if (Math.abs(det) < 1e-9) {
        var warn = svgEl('text', { x: -5.7, y: 5.6, fill: C.err, 'font-size': 0.5,
          'font-family': 'ui-monospace, monospace' });
        warn.textContent = 'det = 0 -> the plane collapses onto a line (not invertible)';
        svg.appendChild(warn);
      }
    }

    panel.appendChild(slider('a (x scale / x of i-hat)', { min: -3, max: 3, step: 0.05, value: a,
      fmt: function (v) { return v.toFixed(2); }, onInput: function (v) { a = v; draw(); } }));
    panel.appendChild(slider('b (x of j-hat)', { min: -3, max: 3, step: 0.05, value: b,
      fmt: function (v) { return v.toFixed(2); }, onInput: function (v) { b = v; draw(); } }));
    panel.appendChild(slider('c (y of i-hat)', { min: -3, max: 3, step: 0.05, value: c,
      fmt: function (v) { return v.toFixed(2); }, onInput: function (v) { c = v; draw(); } }));
    panel.appendChild(slider('d (y scale / y of j-hat)', { min: -3, max: 3, step: 0.05, value: d,
      fmt: function (v) { return v.toFixed(2); }, onInput: function (v) { d = v; draw(); } }));

    var info = h('p', { class: 'small muted' });
    panel.appendChild(info);
    function refreshInfo() {
      var det = a * d - b * c;
      info.innerHTML = '<b>det = ' + det.toFixed(3) + '</b> — area scale factor' +
        (det < 0 ? ' (orientation flipped)' : '') + '<br>' +
        'Green arrow = image of (1,0), red arrow = image of (0,1).';
    }
    var origDraw = draw;
    draw = function () { origDraw(); refreshInfo(); };

    var presets = h('div', { class: 'row tight', style: { marginTop: '10px' } }, [
      presetBtn('Identity', [1, 0, 0, 1]),
      presetBtn('Rotate 45°', [0.707, -0.707, 0.707, 0.707]),
      presetBtn('Shear', [1, 1, 0, 1]),
      presetBtn('Flatten', [1, 2, 0.5, 1]),
      presetBtn('Reflect', [-1, 0, 0, 1])
    ]);
    function presetBtn(name, vals) {
      return h('button', {
        class: 'chip', text: name, onclick: function () {
          a = vals[0]; b = vals[1]; c = vals[2]; d = vals[3];
          Array.prototype.forEach.call(panel.querySelectorAll('input[type=range]'), function (inp, i) {
            inp.value = vals[i];
            inp.dispatchEvent(new Event('input'));
          });
          draw();
        }
      });
    }
    panel.appendChild(presets);

    wrap.appendChild(svgWrap);
    wrap.appendChild(panel);
    setTimeout(draw, 0);
    return wrap;
  }

  /* =====================================================================
     2. Gradient descent
     ===================================================================== */
  function gdPlayground() {
    var W = 420, H = 320;
    var cv = canvasSetup(W, H);
    var wrap = h('div', { class: 'pg' });
    var panel = h('div');

    var state = {
      kappa: 8, lr: 0.15, momentum: 0.0, noise: 0.0,
      x: -1.7, y: 1.5, vx: 0, vy: 0, path: [], steps: 0, timer: null
    };

    function f(x, y) { return 0.5 * (x * x + state.kappa * y * y); }
    function grad(x, y) { return [x, state.kappa * y]; }
    function toPx(x, y) { return [(x / 2.4) * (W / 2) + W / 2, H / 2 - (y / 2.4) * (H / 2)]; }
    function toWorld(px, py) { return [((px - W / 2) / (W / 2)) * 2.4, ((H / 2 - py) / (H / 2)) * 2.4]; }

    function drawBg() {
      var C = colors();
      var ctx = cv.ctx, img = ctx.createImageData(W, H);
      var maxf = f(2.4, 2.4);
      for (var py = 0; py < H; py++) {
        for (var px = 0; px < W; px++) {
          var w = toWorld(px, py), v = f(w[0], w[1]) / maxf;
          var band = Math.floor(v * 14) % 2 ? 0.035 : 0;   // faint contour bands
          var base = 0.06 + 0.25 * v;
          var i = (py * W + px) * 4;
          var bg = hexToRgb(C.bg);
          img.data[i] = bg[0] * (1 - base) + 79 * base + band * 255;
          img.data[i + 1] = bg[1] * (1 - base) + 70 * base + band * 255;
          img.data[i + 2] = bg[2] * (1 - base) + 229 * base + band * 255;
          img.data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function hexToRgb(hex) {
      var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
      if (!m) return [255, 255, 255];
      return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    }

    function draw() {
      var C = colors(), ctx = cv.ctx;
      drawBg();
      // path
      if (state.path.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = 1.6; ctx.strokeStyle = C.accent;
        state.path.forEach(function (p, i) {
          var q = toPx(p[0], p[1]);
          if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
        });
        ctx.stroke();
        state.path.forEach(function (p, i) {
          var q = toPx(p[0], p[1]);
          ctx.beginPath();
          ctx.fillStyle = i === state.path.length - 1 ? C.accent : hexA(C.accent, .45);
          ctx.arc(q[0], q[1], i === state.path.length - 1 ? 5 : 2.2, 0, 6.2832);
          ctx.fill();
        });
      }
      // minimum marker
      var m = toPx(0, 0);
      ctx.beginPath(); ctx.strokeStyle = C.ok; ctx.lineWidth = 2;
      ctx.arc(m[0], m[1], 6, 0, 6.2832); ctx.stroke();
      // labels
      ctx.fillStyle = C.text; ctx.font = '12px ui-monospace, monospace';
      ctx.fillText('f = ' + f(state.x, state.y).toFixed(4), 10, 16);
      ctx.fillText('steps: ' + state.steps, 10, 32);
      ctx.fillText('|grad|: ' + Math.hypot(grad(state.x, state.y)[0], grad(state.x, state.y)[1]).toFixed(4), 10, 48);
    }
    function hexA(hex, a) {
      var c = hexToRgb(hex);
      return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
    }

    function step() {
      var g = grad(state.x, state.y);
      var gx = g[0], gy = g[1];
      if (state.noise > 0) {
        gx += (Math.random() * 2 - 1) * state.noise;
        gy += (Math.random() * 2 - 1) * state.noise;
      }
      state.vx = state.momentum * state.vx - state.lr * gx;
      state.vy = state.momentum * state.vy - state.lr * gy;
      state.x += state.vx; state.y += state.vy;
      state.steps++;
      state.path.push([state.x, state.y]);
      if (state.path.length > 400) state.path.shift();
      draw();
    }

    function reset() {
      state.x = -1.7; state.y = 1.5; state.vx = state.vy = 0;
      state.path = [[state.x, state.y]]; state.steps = 0;
      draw();
    }

    panel.appendChild(slider('learning rate', { min: 0.005, max: 0.6, step: 0.005, value: state.lr,
      fmt: function (v) { return v.toFixed(3); }, onInput: function (v) { state.lr = v; } }));
    panel.appendChild(slider('momentum', { min: 0, max: 0.95, step: 0.05, value: state.momentum,
      fmt: function (v) { return v.toFixed(2); }, onInput: function (v) { state.momentum = v; } }));
    panel.appendChild(slider('condition number (b/a)', { min: 1, max: 30, step: 1, value: state.kappa,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { state.kappa = v; draw(); } }));
    panel.appendChild(slider('gradient noise', { min: 0, max: 1.5, step: 0.05, value: state.noise,
      fmt: function (v) { return v.toFixed(2); }, onInput: function (v) { state.noise = v; } }));

    var running = false;
    var playBtn = h('button', { class: 'icon-btn primary', text: '▶ Run', onclick: function () {
      running = !running;
      playBtn.textContent = running ? '⏸ Pause' : '▶ Run';
      if (running) state.timer = setInterval(function () { step(); }, 90);
      else clearInterval(state.timer);
    } });
    panel.appendChild(h('div', { class: 'row tight', style: { marginTop: '10px' } }, [
      playBtn,
      h('button', { class: 'icon-btn', text: 'Step', onclick: step }),
      h('button', { class: 'icon-btn', text: 'Reset', onclick: function () {
        running = false; playBtn.textContent = '▶ Run'; clearInterval(state.timer); reset();
      } })
    ]));
    panel.appendChild(h('p', { class: 'small muted', style: { marginTop: '10px' },
      html: 'The valley is a quadratic with Hessian diag(1, κ). With κ = 1 the path goes straight to the minimum; with κ = 30 plain GD zig-zags and a large learning rate diverges. Momentum damps the oscillation.' }));

    wrap.appendChild(cv.el);
    wrap.appendChild(panel);
    cv.el.addEventListener('click', function (e) {
      var r = cv.el.getBoundingClientRect();
      var w = toWorld((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H);
      state.x = w[0]; state.y = w[1]; state.vx = state.vy = 0;
      state.path = [[state.x, state.y]]; state.steps = 0; draw();
    });
    setTimeout(function () { reset(); }, 0);
    return wrap;
  }

  /* =====================================================================
     3. Distributions & CLT
     ===================================================================== */
  function distPlayground() {
    var W = 420, H = 300;
    var cv = canvasSetup(W, H);
    var wrap = h('div', { class: 'pg' });
    var panel = h('div');
    var st = { kind: 'exponential', n: 20, draws: 4000, showParent: true, data: null };

    function sample(u) {
      switch (st.kind) {
        case 'uniform': return u * 2 - 1;
        case 'bernoulli': return u < 0.3 ? 1 : 0;
        case 'exponential': return -Math.log(1 - u * 0.999999);
        case 'bimodal': return (u < 0.5 ? -2 + Math.random() : 2 + Math.random());
        case 'lognormal': return Math.exp(Math.random() * 1.2);
        default: return u;
      }
    }
    function normalPdf(x, mu, sd) {
      return Math.exp(-0.5 * ((x - mu) / sd) * ((x - mu) / sd)) / (sd * Math.sqrt(2 * Math.PI));
    }

    function hist(values, bins, lo, hi) {
      var out = new Array(bins).fill(0);
      var w = (hi - lo) / bins;
      values.forEach(function (v) {
        var i = Math.floor((v - lo) / w);
        if (i >= 0 && i < bins) out[i]++;
      });
      return out.map(function (c) { return c / values.length / w; }); // density
    }

    function run() {
      var means = [], parent = [];
      for (var b = 0; b < st.draws; b++) {
        var s = 0;
        for (var i = 0; i < st.n; i++) {
          var v = sample(Math.random());
          s += v;
          if (b === 0) parent.push(v);
        }
        means.push(s / st.n);
      }
      for (var k = 0; k < 20000 && parent.length < 20000; k++) parent.push(sample(Math.random()));
      st.data = { means: means, parent: parent };
      draw();
    }

    function draw() {
      if (!st.data) return;
      var C = colors(), ctx = cv.ctx;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      var d = st.data;
      var lo = Math.min.apply(null, d.means), hi = Math.max.apply(null, d.means);
      var bins = 44, histM = hist(d.means, bins, lo, hi);
      var maxD = Math.max.apply(null, histM) * 1.12;
      var pad = 34;
      function X(i) { return pad + (i / bins) * (W - pad - 10); }
      function Y(v) { return H - 26 - (v / maxD) * (H - 46); }

      // axes
      ctx.strokeStyle = C.border; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, H - 26); ctx.lineTo(W - 10, H - 26); ctx.stroke();

      // parent density (optional)
      if (st.showParent) {
        var plo = Math.min.apply(null, d.parent), phi = Math.max.apply(null, d.parent);
        ctx.beginPath();
        ctx.strokeStyle = hexA(C.muted, .9); ctx.lineWidth = 1.6;
        var ph = hist(d.parent, bins, plo, phi);
        var pmax = Math.max.apply(null, ph) || 1;
        for (var j = 0; j < bins; j++) {
          var px = pad + ((plo + (j + .5) * (phi - plo) / bins - lo) / (hi - lo)) * (W - pad - 10);
          var py = H - 26 - (ph[j] / pmax) * (H - 46);
          if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // histogram of means
      ctx.fillStyle = hexA(C.accent, .55); ctx.strokeStyle = C.accent; ctx.lineWidth = 1;
      for (var i2 = 0; i2 < bins; i2++) {
        var x0 = X(i2), x1 = X(i2 + 1);
        ctx.fillRect(x0, Y(histM[i2]), Math.max(1, x1 - x0 - 1), H - 26 - Y(histM[i2]));
      }

      // theoretical normal overlay
      var mu = mean(d.means), sd = sdv(d.means);
      ctx.beginPath(); ctx.strokeStyle = C.ok; ctx.lineWidth = 2;
      for (var px2 = pad; px2 <= W - 10; px2 += 2) {
        var xv = lo + ((px2 - pad) / (W - pad - 10)) * (hi - lo);
        var yv = Y(normalPdf(xv, mu, sd));
        if (px2 === pad) ctx.moveTo(px2, yv); else ctx.lineTo(px2, yv);
      }
      ctx.stroke();

      ctx.fillStyle = C.text; ctx.font = '12px ui-monospace, monospace';
      ctx.fillText('mean of means = ' + mu.toFixed(4), pad, 16);
      ctx.fillText('sd of means  = ' + sd.toFixed(4), pad, 32);
      ctx.fillText('predicted sd = ' + (sdv(d.parent) / Math.sqrt(st.n)).toFixed(4), pad, 48);
      ctx.fillStyle = C.muted;
      ctx.fillText('grey = parent distribution, bars = sampling distribution, green = normal fit', pad, H - 8);
    }
    function hexA(hex, a) {
      var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
      if (!m) return hex;
      return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + a + ')';
    }
    function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
    function sdv(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }

    var kindSel = h('select', { onchange: function () { st.kind = this.value; run(); } });
    [['exponential', 'Exponential (skewed)'], ['uniform', 'Uniform'], ['bernoulli', 'Bernoulli(0.3)'],
     ['bimodal', 'Bimodal'], ['lognormal', 'Log-normal']].forEach(function (o) {
      kindSel.appendChild(h('option', { value: o[0], text: o[1] }));
    });
    panel.appendChild(h('div', { class: 'slider' }, [h('label', {}, [h('span', { text: 'parent distribution' })]), kindSel]));
    panel.appendChild(slider('sample size n', { min: 1, max: 200, step: 1, value: st.n,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.n = v; run(); } }));
    panel.appendChild(slider('number of samples', { min: 500, max: 8000, step: 500, value: st.draws,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.draws = v; run(); } }));
    panel.appendChild(h('div', { class: 'row tight' }, [
      h('button', { class: 'icon-btn primary', text: 'Resample', onclick: run })
    ]));
    panel.appendChild(h('p', { class: 'small muted', style: { marginTop: '10px' },
      html: 'Whatever the parent looks like, the sampling distribution of the mean becomes Gaussian — and its spread shrinks like 1/√n. That is the CLT, and it is why standard errors work.' }));

    wrap.appendChild(cv.el);
    wrap.appendChild(panel);
    setTimeout(run, 0);
    return wrap;
  }

  /* =====================================================================
     4. Metric calculator
     ===================================================================== */
  function metricsPlayground() {
    var st = { tp: 80, fp: 20, fn: 40, tn: 860, costFP: 10, benefitTP: 100 };
    var wrap = h('div', { class: 'pg' });
    var panel = h('div');
    var out = h('div');

    function compute() {
      var tp = st.tp, fp = st.fp, fn = st.fn, tn = st.tn;
      var n = tp + fp + fn + tn;
      var prec = tp + fp ? tp / (tp + fp) : 0;
      var rec = tp + fn ? tp / (tp + fn) : 0;
      var spec = tn + fp ? tn / (tn + fp) : 0;
      var f1 = (prec + rec) ? 2 * prec * rec / (prec + rec) : 0;
      var acc = n ? (tp + tn) / n : 0;
      var denom = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
      var mcc = denom ? (tp * tn - fp * fn) / denom : 0;
      var prevalence = n ? (tp + fn) / n : 0;
      var thr = st.costFP + st.benefitTP ? st.costFP / (st.costFP + st.benefitTP) : 0.5;
      var value = tp * st.benefitTP - fp * st.costFP;
      return { n: n, prec: prec, rec: rec, spec: spec, f1: f1, acc: acc, mcc: mcc,
        prevalence: prevalence, thr: thr, value: value };
    }

    function render() {
      var m = compute();
      ui.clear(out);
      var rows = [
        ['Accuracy', m.acc], ['Precision (PPV)', m.prec], ['Recall (TPR)', m.rec],
        ['Specificity (TNR)', m.spec], ['F1', m.f1], ['MCC', m.mcc], ['Prevalence', m.prevalence]
      ];
      out.appendChild(h('div', { class: 'result-grid' }, rows.map(function (r) {
        return h('div', { class: 'stat' }, [h('b', { text: (100 * r[1]).toFixed(1) + '%' }), h('span', { text: r[0] })]);
      })));
      out.appendChild(h('div', { class: 'callout', style: { marginTop: '10px' } }, [
        h('div', { class: 'label', text: 'Decision economics' }),
        h('div', { class: 'small', html:
          'Cost of a false positive: <b>' + st.costFP + '</b> · Gain of a true positive: <b>' + st.benefitTP + '</b><br>' +
          'Profit-optimal threshold: <b>' + m.thr.toFixed(3) + '</b> (flag when p &gt; threshold)<br>' +
          'Net value of this confusion matrix: <b>' + Math.round(m.value) + '</b>' })
      ]));
      out.appendChild(h('p', { class: 'small muted', style: { marginTop: '10px' },
        html: 'Notice that with prevalence ' + (100 * m.prevalence).toFixed(1) + '% accuracy is ' +
          (100 * m.acc).toFixed(1) + '% while precision is only ' + (100 * m.prec).toFixed(1) +
          '%. Accuracy hides the cost of false positives; MCC and PR curves do not.' }));
    }

    [['tp', 'True positives'], ['fp', 'False positives'], ['fn', 'False negatives'], ['tn', 'True negatives']]
      .forEach(function (f) {
        panel.appendChild(slider(f[1], { min: 0, max: 1000, step: 1, value: st[f[0]],
          fmt: function (v) { return v.toFixed(0); },
          onInput: function (v) { st[f[0]] = v; render(); } }));
      });
    panel.appendChild(slider('Cost of a false positive', { min: 0, max: 500, step: 5, value: st.costFP,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.costFP = v; render(); } }));
    panel.appendChild(slider('Gain of a true positive', { min: 0, max: 1000, step: 10, value: st.benefitTP,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.benefitTP = v; render(); } }));
    panel.appendChild(h('button', { class: 'chip', text: 'Reset', onclick: function () {
      st.tp = 80; st.fp = 20; st.fn = 40; st.tn = 860; render();
    } }));

    wrap.appendChild(out);
    wrap.appendChild(panel);
    setTimeout(render, 0);
    return wrap;
  }

  /* =====================================================================
     5. k-means
     ===================================================================== */
  function kmeansPlayground() {
    var W = 420, H = 320;
    var cv = canvasSetup(W, H);
    var wrap = h('div', { class: 'pg' });
    var panel = h('div');
    var st = { k: 3, pts: [], cents: [], assign: [], iters: 0, seed: 1 };

    function seed() {
      var rng = mulberry(st.seed);
      st.pts = [];
      var centers = [[-1.2, 0.6], [1.3, 0.8], [0.1, -1.1], [-1.4, -1.0]].slice(0, 4);
      for (var c = 0; c < 4; c++) {
        for (var i = 0; i < 60; i++) {
          st.pts.push([centers[c][0] + rng() * 0.75, centers[c][1] + rng() * 0.75]);
        }
      }
      st.cents = [];
      for (var j = 0; j < st.k; j++) {
        st.cents.push([rng() * 3 - 1.5, rng() * 2.2 - 1.1]);
      }
      st.assign = new Array(st.pts.length).fill(-1);
      st.iters = 0;
      draw();
    }
    function mulberry(a) {
      return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function toPx(p) { return [(p[0] / 2.6) * (W / 2) + W / 2, H / 2 - (p[1] / 1.9) * (H / 2)]; }

    function assign() {
      st.assign = st.pts.map(function (p) {
        var best = -1, bd = Infinity;
        st.cents.forEach(function (c, i) {
          var d = (p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1]);
          if (d < bd) { bd = d; best = i; }
        });
        return best;
      });
    }
    function update() {
      var sums = st.cents.map(function () { return [0, 0, 0]; });
      st.pts.forEach(function (p, i) {
        var a = sums[st.assign[i]];
        a[0] += p[0]; a[1] += p[1]; a[2]++;
      });
      st.cents = sums.map(function (s, i) {
        return s[2] ? [s[0] / s[2], s[1] / s[2]] : st.cents[i];
      });
    }
    function inertia() {
      var s = 0;
      st.pts.forEach(function (p, i) {
        var c = st.cents[st.assign[i]];
        if (c) s += (p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1]);
      });
      return s;
    }

    function draw() {
      var C = colors(), ctx = cv.ctx;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      var pal = [C.accent, C.ok, C.err, '#f59e0b', '#8b5cf6'];
      st.pts.forEach(function (p, i) {
        var q = toPx(p);
        ctx.beginPath();
        ctx.fillStyle = st.assign[i] >= 0 ? hexA(pal[st.assign[i] % pal.length], .55) : hexA(C.muted, .5);
        ctx.arc(q[0], q[1], 3.2, 0, 6.2832); ctx.fill();
      });
      st.cents.forEach(function (c, i) {
        var q = toPx(c);
        ctx.beginPath(); ctx.strokeStyle = pal[i % pal.length]; ctx.lineWidth = 2.4;
        ctx.arc(q[0], q[1], 8, 0, 6.2832); ctx.stroke();
        ctx.beginPath(); ctx.fillStyle = pal[i % pal.length];
        ctx.arc(q[0], q[1], 3, 0, 6.2832); ctx.fill();
      });
      ctx.fillStyle = C.text; ctx.font = '12px ui-monospace, monospace';
      ctx.fillText('k = ' + st.k + '   iterations = ' + st.iters + '   inertia = ' + inertia().toFixed(2), 10, 16);
    }
    function hexA(hex, a) {
      var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
      if (!m) return hex;
      return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + a + ')';
    }

    function step() { assign(); update(); st.iters++; draw(); }
    function converge() { for (var i = 0; i < 25; i++) step(); }

    cv.el.addEventListener('click', function (e) {
      var r = cv.el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
      st.pts.push([((px - W / 2) / (W / 2)) * 2.6, ((H / 2 - py) / (H / 2)) * 1.9]);
      st.assign.push(-1);
      draw();
    });

    panel.appendChild(slider('k', { min: 1, max: 5, step: 1, value: st.k,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) {
        st.k = v;
        // keep or truncate centroids, add random ones if needed
        while (st.cents.length > st.k) st.cents.pop();
        while (st.cents.length < st.k) st.cents.push([Math.random() * 3 - 1.5, Math.random() * 2.2 - 1.1]);
        st.iters = 0; st.assign = new Array(st.pts.length).fill(-1); draw();
      } }));
    panel.appendChild(h('div', { class: 'row tight', style: { marginTop: '10px' } }, [
      h('button', { class: 'icon-btn primary', text: 'Step', onclick: step }),
      h('button', { class: 'icon-btn', text: 'Converge', onclick: converge }),
      h('button', { class: 'icon-btn', text: 'Reseed', onclick: function () { st.seed++; seed(); } })
    ]));
    panel.appendChild(h('p', { class: 'small muted', style: { marginTop: '10px' },
      html: 'Click the canvas to add points. k-means alternates assignment and update; it only finds a local optimum, and the result depends on where the centroids start. Reseed a few times with k = 4 versus k = 2.' }));

    wrap.appendChild(cv.el);
    wrap.appendChild(panel);
    setTimeout(seed, 0);
    return wrap;
  }

  /* =====================================================================
     Shared numeric helpers for the statistical widgets
     ===================================================================== */
  function makeRng(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function rNorm(rnd) {
    var u = 1 - rnd(), v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307179586 * v);
  }
  function normCdf(z) {
    /* Abramowitz & Stegun 7.1.26 */
    var b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429], p = 0.2316419, neg = z < 0;
    if (neg) z = -z;
    var t = 1 / (1 + p * z), poly = 0;
    for (var i = 0; i < 5; i++) poly += b[i] * Math.pow(t, i + 1);
    var c = 1 - 0.3989422804014327 * Math.exp(-z * z / 2) * poly;
    return neg ? 1 - c : c;
  }
  function normInv(p) {
    var lo = -9, hi = 9, m;
    for (var i = 0; i < 70; i++) { m = (lo + hi) / 2; if (normCdf(m) < p) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  function meanArr(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sdArr(a) { var m = meanArr(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / Math.max(1, a.length - 1)); }
  function quantileSorted(sorted, q) {
    if (!sorted.length) return 0;
    var pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }
  function hexAlpha(hex, a) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex).trim());
    if (!m) return hex;
    return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + a + ')';
  }

  /* =====================================================================
     6. Power, MDE and sample size
     ===================================================================== */
  function powerPlayground() {
    var st = { p0: 0.10, lift: 0.15, n: 4000, alpha: 0.05 };
    var wrap = h('div', { class: 'pg' });
    var left = h('div');
    var cv = canvasSetup(700, 290);
    var cv2 = canvasSetup(700, 170);
    var panel = h('div');

    function se0() { return Math.sqrt(2 * st.p0 * (1 - st.p0) / st.n); }
    function se1() { var p1 = st.p0 * (1 + st.lift); return Math.sqrt((st.p0 * (1 - st.p0) + p1 * (1 - p1)) / st.n); }
    function delta() { return st.p0 * st.lift; }
    function zCrit() { return normInv(1 - st.alpha / 2); }
    function powerAt(n) {
      var p1 = st.p0 * (1 + st.lift);
      var s0 = Math.sqrt(2 * st.p0 * (1 - st.p0) / n);
      var s1 = Math.sqrt((st.p0 * (1 - st.p0) + p1 * (1 - p1)) / n);
      var z = zCrit() * s0, d = delta();
      return normCdf((-z - d) / s1) + 1 - normCdf((z - d) / s1);
    }
    function power() { return powerAt(st.n); }
    function mdeAt(n, target) {
      if (target === undefined) target = 0.8;
      var z = zCrit() + normInv(target);
      return z * Math.sqrt(2 * st.p0 * (1 - st.p0) / n) / st.p0;
    }
    function nForPower(target) {
      var p1 = st.p0 * (1 + st.lift), z = zCrit() + normInv(target), d = delta();
      if (Math.abs(d) < 1e-9) return Infinity;
      return Math.ceil(z * z * (st.p0 * (1 - st.p0) + p1 * (1 - p1)) / (d * d));
    }
    function pdf(v, m, s) { return Math.exp(-(v - m) * (v - m) / (2 * s * s)) / (s * 2.5066282746310002); }

    function drawDistributions() {
      var C = colors(), ctx = cv.ctx, W = cv.w, H = cv.h;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      var d = delta(), s0 = se0(), s1 = se1(), z = zCrit() * s0;
      var lo = Math.min(-3.7 * s0, d - 3.7 * s1), hi = Math.max(3.7 * s0, d + 3.7 * s1);
      var pad = 26, base = H - 34;
      function X(v) { return pad + (v - lo) / (hi - lo) * (W - pad - 12); }
      function Y(p) { return base - p * (H - 66); }
      var N = 500, step = (hi - lo) / N, bw = Math.max(1, (W - pad - 12) / N + 0.8);

      /* rejection region under H0 */
      ctx.fillStyle = hexAlpha(C.err, 0.20);
      for (var v = lo; v <= hi; v += step) {
        if (v <= -z || v >= z) ctx.fillRect(X(v), Y(pdf(v, 0, s0)), bw, base - Y(pdf(v, 0, s0)));
      }
      /* power region under H1 */
      ctx.fillStyle = hexAlpha(C.accent, 0.28);
      for (var v2 = lo; v2 <= hi; v2 += step) {
        if (v2 <= -z || v2 >= z) ctx.fillRect(X(v2), Y(pdf(v2, d, s1)), bw, base - Y(pdf(v2, d, s1)));
      }
      /* axes */
      ctx.strokeStyle = C.border; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(W - 12, base); ctx.stroke();
      /* thresholds */
      ctx.strokeStyle = C.err; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(X(z), base); ctx.lineTo(X(z), 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(-z), base); ctx.lineTo(X(-z), 18); ctx.stroke();
      /* curves */
      var i, vv, px, py;
      ctx.beginPath(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.8;
      for (i = 0; i <= N; i++) { vv = lo + (hi - lo) * i / N; px = X(vv); py = Y(pdf(vv, 0, s0)); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
      ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.1;
      for (i = 0; i <= N; i++) { vv = lo + (hi - lo) * i / N; px = X(vv); py = Y(pdf(vv, d, s1)); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
      /* labels */
      ctx.fillStyle = C.text; ctx.font = '12.5px ui-monospace, monospace';
      ctx.fillText(t('lab.power.legend', { pw: (100 * power()).toFixed(1), a: st.alpha }), pad, 16);
      ctx.fillStyle = C.muted;
      ctx.fillText('grey = H0 (no effect)   accent = H1 (true lift ' + (100 * st.lift).toFixed(1) + '%)   red = rejection region', pad, H - 8);
    }

    function drawCurve() {
      var C = colors(), ctx = cv2.ctx, W = cv2.w, H = cv2.h;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      var pad = 34, base = H - 26, top = 14;
      var nMin = 200, nMax = 60000;
      function X(n) { return pad + Math.log(n / nMin) / Math.log(nMax / nMin) * (W - pad - 14); }
      function Y(p) { return base - p * (base - top); }
      /* grid */
      ctx.strokeStyle = C.border; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(W - 14, base); ctx.stroke();
      [1000, 10000, 60000].forEach(function (n) {
        ctx.strokeStyle = C.border;
        ctx.beginPath(); ctx.moveTo(X(n), base); ctx.lineTo(X(n), base - 4); ctx.stroke();
        ctx.fillStyle = C.muted; ctx.font = '10.5px ui-monospace, monospace';
        ctx.fillText(n >= 1000 ? (n / 1000) + 'k' : String(n), X(n) - 8, H - 10);
      });
      /* 80% reference */
      ctx.strokeStyle = hexAlpha(C.ok, 0.8); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(pad, Y(0.8)); ctx.lineTo(W - 14, Y(0.8)); ctx.stroke();
      /* curve */
      ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
      for (var i = 0; i <= 200; i++) {
        var n = Math.exp(Math.log(nMin) + (Math.log(nMax) - Math.log(nMin)) * i / 200);
        var px = X(n), py = Y(powerAt(n));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      /* current n */
      var cx = X(Math.min(Math.max(st.n, nMin), nMax)), cy = Y(power());
      ctx.beginPath(); ctx.fillStyle = C.err; ctx.arc(cx, cy, 4, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = hexAlpha(C.err, 0.7); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, base); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.fillStyle = C.text; ctx.font = '12px ui-monospace, monospace';
      ctx.fillText('power vs n per arm   (current: n = ' + st.n + ', power = ' + (100 * power()).toFixed(1) + '%)', pad, 12);
    }

    function readout() {
      return h('div', { class: 'small', style: { marginTop: '10px', lineHeight: '1.7' } }, [
        h('div', { html: '<b>' + t('lab.power.power') + ':</b> ' + (100 * power()).toFixed(1) + '%' }),
        h('div', { html: '<b>' + t('lab.power.mde') + ':</b> ' + (100 * mdeAt(st.n)).toFixed(2) + '% ' + t('lab.power.rel') }),
        h('div', { html: '<b>' + t('lab.power.need') + ':</b> ' + (isFinite(nForPower(0.8)) ? nForPower(0.8).toLocaleString() : '—') + ' ' + t('lab.power.perArm') })
      ]);
    }
    var out = readout();
    function redraw() { drawDistributions(); drawCurve(); ui.clear(out); out.appendChild(readout()); }

    panel.appendChild(slider(t('lab.power.base'), { min: 0.01, max: 0.50, step: 0.01, value: st.p0,
      fmt: function (v) { return (100 * v).toFixed(0) + '%'; }, onInput: function (v) { st.p0 = v; redraw(); } }));
    panel.appendChild(slider(t('lab.power.lift'), { min: 0.01, max: 0.60, step: 0.01, value: st.lift,
      fmt: function (v) { return '+' + (100 * v).toFixed(0) + '%'; }, onInput: function (v) { st.lift = v; redraw(); } }));
    panel.appendChild(slider(t('lab.n'), { min: 200, max: 40000, step: 200, value: st.n,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.n = v; redraw(); } }));
    var aSel = h('select', { onchange: function () { st.alpha = parseFloat(this.value); redraw(); } });
    [[0.01, 'alpha = 0.01'], [0.05, 'alpha = 0.05'], [0.10, 'alpha = 0.10']].forEach(function (o) {
      aSel.appendChild(h('option', { value: o[0], text: o[1], selected: o[0] === st.alpha }));
    });
    panel.appendChild(h('div', { class: 'slider' }, [h('label', {}, [h('span', { text: t('lab.alpha') })]), aSel]));
    panel.appendChild(h('div', { class: 'row tight' }, [
      h('button', { class: 'icon-btn primary', text: t('lab.power.solve'), onclick: function () {
        var need = nForPower(0.8);
        if (isFinite(need)) { st.n = Math.min(40000, Math.max(200, Math.round(need / 200) * 200)); redraw(); }
      } })
    ]));
    panel.appendChild(out);
    panel.appendChild(h('p', { class: 'small muted', style: { marginTop: '10px' }, text: t('lab.power.tip') }));

    left.appendChild(cv.el); left.appendChild(cv2.el);
    wrap.appendChild(left); wrap.appendChild(panel);
    setTimeout(redraw, 0);
    return wrap;
  }

  /* =====================================================================
     7. Bootstrap interval vs permutation test
     ===================================================================== */
  function bootPlayground() {
    var st = { n: 60, effect: 0.6, B: 1500, seed: 11, res: null };
    var wrap = h('div', { class: 'pg' });
    var left = h('div');
    var cv = canvasSetup(700, 380);
    var panel = h('div');

    function gen() {
      var rng = makeRng(st.seed), A = [], Bv = [], i;
      for (i = 0; i < st.n; i++) A.push(Math.exp(2 + 0.60 * rNorm(rng)));
      for (i = 0; i < st.n; i++) Bv.push(Math.exp(2 + 0.60 * rNorm(rng) + 0.60 * st.effect));
      return { a: A, b: Bv };
    }
    function run() {
      var d = gen(), rng = makeRng(st.seed + 999), i, k;
      var obs = meanArr(d.b) - meanArr(d.a);
      var boot = new Array(st.B);
      for (k = 0; k < st.B; k++) {
        var sa = 0, sb = 0;
        for (i = 0; i < st.n; i++) { sa += d.a[Math.floor(rng() * st.n)]; sb += d.b[Math.floor(rng() * st.n)]; }
        boot[k] = sb / st.n - sa / st.n;
      }
      var pool = d.a.concat(d.b), n2 = st.n, perm = new Array(st.B), permRng = makeRng(st.seed + 4242);
      for (k = 0; k < st.B; k++) {
        for (i = pool.length - 1; i > 0; i--) { var j = Math.floor(permRng() * (i + 1)); var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp; }
        var s1 = 0, s2 = 0;
        for (i = 0; i < n2; i++) s1 += pool[i];
        for (i = n2; i < 2 * n2; i++) s2 += pool[i];
        perm[k] = s2 / n2 - s1 / n2;
      }
      var bs = boot.slice().sort(function (x, y) { return x - y; });
      var lo = quantileSorted(bs, 0.025), hi = quantileSorted(bs, 0.975);
      var hits = 0;
      for (k = 0; k < st.B; k++) if (Math.abs(perm[k]) >= Math.abs(obs) - 1e-12) hits++;
      st.res = { obs: obs, boot: boot, lo: lo, hi: hi, perm: perm, p: (1 + hits) / (1 + st.B) };
      draw();
      refreshOut();
    }

    function histVals(arr, bins) {
      var lo = Math.min.apply(null, arr), hi = Math.max.apply(null, arr);
      if (hi - lo < 1e-9) hi = lo + 1;
      var out = new Array(bins).fill(0);
      for (var i = 0; i < arr.length; i++) {
        var b = Math.floor((arr[i] - lo) / (hi - lo) * bins);
        if (b >= bins) b = bins - 1; if (b < 0) b = 0;
        out[b]++;
      }
      return { counts: out, lo: lo, hi: hi };
    }

    function draw() {
      var C = colors(), ctx = cv.ctx, W = cv.w, H = cv.h;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      var r = st.res;
      if (!r) return;
      var pad = 30, bins = 46;
      function panelBox(y0, y1) { return { y0: y0, y1: y1 }; }
      var top = panelBox(26, H / 2 - 24), bot = panelBox(H / 2 + 26, H - 30);
      function drawHist(vals, box, colr, label) {
        var hs = histVals(vals, bins);
        var mx = Math.max.apply(null, hs.counts) * 1.1 || 1;
        var base = box.y1;
        function X(v) { return pad + (v - hs.lo) / (hs.hi - hs.lo) * (W - pad - 12); }
        function Yp(c) { return base - (c / mx) * (box.y1 - box.y0); }
        ctx.strokeStyle = C.border; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(W - 12, base); ctx.stroke();
        ctx.fillStyle = hexAlpha(colr, 0.55); ctx.strokeStyle = colr; ctx.lineWidth = 0.8;
        for (var i = 0; i < bins; i++) {
          var x0 = pad + (i / bins) * (W - pad - 12), x1 = pad + ((i + 1) / bins) * (W - pad - 12);
          ctx.fillRect(x0, Yp(hs.counts[i]), Math.max(1, x1 - x0 - 1), base - Yp(hs.counts[i]));
        }
        ctx.fillStyle = C.text; ctx.font = '12.5px ui-monospace, monospace';
        ctx.fillText(label, pad, box.y0 - 8);
        return { X: X, base: base, Yp: Yp, hs: hs };
      }
      var g1 = drawHist(r.boot, top, C.accent, t('lab.boot.bootstrap') + '  ' + t('lab.boot.ci', { lo: r.lo.toFixed(2), hi: r.hi.toFixed(2) }));
      /* CI + observed lines on the bootstrap panel */
      ctx.setLineDash ? ctx.setLineDash([4, 3]) : null;
      ctx.strokeStyle = C.ok; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(g1.X(r.lo), top.y0 - 4); ctx.lineTo(g1.X(r.lo), top.y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(g1.X(r.hi), top.y0 - 4); ctx.lineTo(g1.X(r.hi), top.y1); ctx.stroke();
      ctx.strokeStyle = C.err; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(g1.X(r.obs), top.y0 - 4); ctx.lineTo(g1.X(r.obs), top.y1); ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);

      var g2 = drawHist(r.perm, bot, C.muted, t('lab.boot.permutation') + '  p = ' + r.p.toFixed(3));
      ctx.strokeStyle = C.err; ctx.lineWidth = 1.6;
      [-Math.abs(r.obs), Math.abs(r.obs)].forEach(function (v) {
        if (v >= g2.hs.lo && v <= g2.hs.hi) { ctx.beginPath(); ctx.moveTo(g2.X(v), bot.y0 - 4); ctx.lineTo(g2.X(v), bot.y1); ctx.stroke(); }
      });
      /* shade the tail beyond +-|obs| */
      ctx.fillStyle = hexAlpha(C.err, 0.18);
      for (var i = 0; i < bins; i++) {
        var v0 = g2.hs.lo + (g2.hs.hi - g2.hs.lo) * i / bins;
        if (Math.abs(v0) >= Math.abs(r.obs)) {
          var x0 = pad + (i / bins) * (W - pad - 12), x1 = pad + ((i + 1) / bins) * (W - pad - 12);
          ctx.fillRect(x0, g2.Yp(g2.hs.counts[i]), Math.max(1, x1 - x0 - 1), g2.base - g2.Yp(g2.hs.counts[i]));
        }
      }
      ctx.fillStyle = C.muted; ctx.font = '11px ui-monospace, monospace';
      ctx.fillText(t('lab.boot.legend'), pad, H - 8);
    }

    var out = h('div', { class: 'small', style: { marginTop: '10px', lineHeight: '1.7' } });
    function refreshOut() {
      ui.clear(out);
      var r = st.res;
      if (!r) return;
      var ciExcludes = (r.lo > 0) || (r.hi < 0);
      var verdict = (ciExcludes && r.p < 0.05) || (!ciExcludes && r.p >= 0.05)
        ? t('lab.boot.agree') : t('lab.boot.disagree');
      out.appendChild(h('div', { html: '<b>' + t('lab.boot.obs') + ':</b> ' + r.obs.toFixed(3) }));
      out.appendChild(h('div', { html: '<b>' + t('lab.boot.ciLabel') + ':</b> [' + r.lo.toFixed(3) + ', ' + r.hi.toFixed(3) + ']' }));
      out.appendChild(h('div', { html: '<b>' + t('lab.boot.pLabel') + ':</b> ' + r.p.toFixed(3) }));
      out.appendChild(h('div', { class: 'tiny muted', html: verdict }));
    }

    panel.appendChild(slider(t('lab.n'), { min: 10, max: 150, step: 5, value: st.n,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.n = v; run(); } }));
    panel.appendChild(slider(t('lab.effect'), { min: 0, max: 1.2, step: 0.05, value: st.effect,
      fmt: function (v) { return v.toFixed(2); }, onInput: function (v) { st.effect = v; run(); } }));
    panel.appendChild(slider(t('lab.boot.reps'), { min: 500, max: 4000, step: 500, value: st.B,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.B = v; run(); } }));
    panel.appendChild(h('div', { class: 'row tight' }, [
      h('button', { class: 'icon-btn primary', text: t('lab.resample'), onclick: function () { st.seed++; run(); } }),
      h('button', { class: 'icon-btn', text: t('lab.rerun'), onclick: run })
    ]));
    panel.appendChild(out);
    panel.appendChild(h('p', { class: 'small muted', style: { marginTop: '10px' }, text: t('lab.boot.tip') }));

    left.appendChild(cv.el);
    wrap.appendChild(left); wrap.appendChild(panel);
    setTimeout(run, 0);
    return wrap;
  }

  /* =====================================================================
     8. Regression diagnostics: one point can move a slope
     ===================================================================== */
  function olsPlayground() {
    var st = { n: 40, noise: 0.6, ox: 1.9, oy: 3.6, robust: true, seed: 5, pts: null };
    var wrap = h('div', { class: 'pg' });
    var left = h('div');
    var cv = canvasSetup(700, 360);
    var panel = h('div');

    function gen() {
      var rng = makeRng(st.seed), pts = [], i;
      for (i = 0; i < st.n; i++) {
        var x = -2 + 4 * rng();
        pts.push({ x: x, y: 1 + 0.8 * x + st.noise * rNorm(rng), out: false });
      }
      pts.push({ x: st.ox, y: 1 + 0.8 * st.ox + st.oy, out: true });
      return pts;
    }
    function fit(pts) {
      var n = pts.length, sx = 0, sy = 0, i;
      for (i = 0; i < n; i++) { sx += pts[i].x; sy += pts[i].y; }
      var mx = sx / n, my = sy / n, sxx = 0, sxy = 0;
      for (i = 0; i < n; i++) { sxx += (pts[i].x - mx) * (pts[i].x - mx); sxy += (pts[i].x - mx) * (pts[i].y - my); }
      var b = sxx ? sxy / sxx : 0, a = my - b * mx;
      return { a: a, b: b, mx: mx, sxx: sxx };
    }
    function fitHuber(pts, k) {
      k = k || 1.345;
      var f = fit(pts), i, it, res, scale;
      for (it = 0; it < 30; it++) {
        res = pts.map(function (p) { return p.y - (f.a + f.b * p.x); });
        var abs = res.map(Math.abs).sort(function (x, y) { return x - y; });
        scale = quantileSorted(abs, 0.5) / 0.6745 || 1e-9;
        var sw = 0, swx = 0, swy = 0, swxx = 0, swxy = 0;
        for (i = 0; i < pts.length; i++) {
          var r = res[i] / scale, w = Math.abs(r) <= k ? 1 : k / Math.abs(r);
          sw += w; swx += w * pts[i].x; swy += w * pts[i].y;
          swxx += w * pts[i].x * pts[i].x; swxy += w * pts[i].x * pts[i].y;
        }
        var denom = sw * swxx - swx * swx;
        if (!denom) break;
        var nb = (sw * swxy - swx * swy) / denom;
        var na = (swy - nb * swx) / sw;
        if (Math.abs(nb - f.b) < 1e-9 && Math.abs(na - f.a) < 1e-9) { f = { a: na, b: nb }; break; }
        f = { a: na, b: nb };
      }
      return f;
    }
    function cooksMax(pts) {
      var f = fit(pts), n = pts.length, worst = 0, wi = -1, i;
      var sse = 0;
      for (i = 0; i < n; i++) { var e = pts[i].y - (f.a + f.b * pts[i].x); sse += e * e; }
      var mse = sse / Math.max(1, n - 2);
      for (i = 0; i < n; i++) {
        var lev = 1 / n + Math.pow(pts[i].x - f.mx, 2) / (f.sxx || 1e-9);
        var e2 = pts[i].y - (f.a + f.b * pts[i].x);
        var D = (e2 * e2 / (2 * mse)) * (lev / Math.pow(1 - lev, 2));
        if (D > worst) { worst = D; wi = i; }
      }
      return { D: worst, i: wi };
    }

    function draw() {
      var C = colors(), ctx = cv.ctx, W = cv.w, H = cv.h;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      var pts = st.pts, pad = 34;
      var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
      var xlo = Math.min(-2.2, Math.min.apply(null, xs)), xhi = Math.max(2.2, Math.max.apply(null, xs));
      var ylo = Math.min.apply(null, ys) - 0.5, yhi = Math.max.apply(null, ys) + 0.5;
      function X(v) { return pad + (v - xlo) / (xhi - xlo) * (W - pad - 12); }
      function Y(v) { return H - 28 - (v - ylo) / (yhi - ylo) * (H - 52); }
      /* axes */
      ctx.strokeStyle = C.border; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, H - 28); ctx.lineTo(W - 12, H - 28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, 12); ctx.lineTo(pad, H - 28); ctx.stroke();
      /* points */
      var cm = cooksMax(pts);
      pts.forEach(function (p, i) {
        ctx.beginPath();
        ctx.fillStyle = i === cm.i ? hexAlpha(C.err, 0.85) : hexAlpha(C.accent, 0.6);
        ctx.arc(X(p.x), Y(p.y), i === cm.i ? 5.2 : 3.4, 0, 6.2832); ctx.fill();
      });
      /* lines */
      function line(f, colr, dash, width) {
        ctx.beginPath(); ctx.strokeStyle = colr; ctx.lineWidth = width || 2;
        if (ctx.setLineDash) ctx.setLineDash(dash || []);
        ctx.moveTo(X(xlo), Y(f.a + f.b * xlo)); ctx.lineTo(X(xhi), Y(f.a + f.b * xhi)); ctx.stroke();
        if (ctx.setLineDash) ctx.setLineDash([]);
      }
      var all = fit(pts);
      var clean = (function () { var q = pts.filter(function (p) { return !p.out; }); return q.length > 2 ? fit(q) : all; })();
      line(clean, C.muted, [5, 4], 1.8);
      if (st.robust) line(fitHuber(pts), C.ok, [], 2.2);
      line(all, C.accent, [], 2.4);
      ctx.fillStyle = C.text; ctx.font = '12.5px ui-monospace, monospace';
      ctx.fillText('OLS slope = ' + all.b.toFixed(3) + '   without outlier = ' + clean.b.toFixed(3) +
        (st.robust ? '   robust (Huber) = ' + fitHuber(pts).b.toFixed(3) : '') +
        '   max Cook D = ' + cm.D.toFixed(2) + ' (4/n = ' + (4 / pts.length).toFixed(2) + ')', pad, 18);
      ctx.fillStyle = C.muted; ctx.font = '11px ui-monospace, monospace';
      ctx.fillText('accent = OLS on all points   grey dashed = OLS without the red point' +
        (st.robust ? '   green = Huber robust fit' : ''), pad, H - 8);
      out && refreshOut(all, clean, cm);
    }

    var out = h('div', { class: 'small', style: { marginTop: '10px', lineHeight: '1.7' } });
    function refreshOut(all, clean, cm) {
      ui.clear(out);
      var shift = Math.abs(all.b - clean.b);
      out.appendChild(h('div', { html: '<b>' + t('lab.ols.slope') + ':</b> ' + all.b.toFixed(3) + '  ' + t('lab.ols.vs') + ' ' + clean.b.toFixed(3) }));
      out.appendChild(h('div', { html: '<b>' + t('lab.ols.move') + ':</b> ' + (100 * shift / Math.max(1e-9, Math.abs(clean.b))).toFixed(1) + '%' }));
      out.appendChild(h('div', { html: '<b>' + t('lab.ols.cook') + ':</b> ' + cm.D.toFixed(2) + '  (' + t('lab.ols.threshold') + ' 4/n = ' + (4 / st.pts.length).toFixed(2) + ')' }));
      out.appendChild(h('div', { class: 'tiny muted', text: cm.D > 4 / st.pts.length ? t('lab.ols.influential') : t('lab.ols.benign') }));
    }
    function redraw() { st.pts = gen(); draw(); }

    panel.appendChild(slider(t('lab.n'), { min: 12, max: 90, step: 2, value: st.n,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.n = v; redraw(); } }));
    panel.appendChild(slider(t('lab.noise'), { min: 0.1, max: 2.0, step: 0.1, value: st.noise,
      fmt: function (v) { return v.toFixed(1); }, onInput: function (v) { st.noise = v; redraw(); } }));
    panel.appendChild(slider(t('lab.ols.ox'), { min: -2.2, max: 4.5, step: 0.1, value: st.ox,
      fmt: function (v) { return v.toFixed(1); }, onInput: function (v) { st.ox = v; redraw(); } }));
    panel.appendChild(slider(t('lab.ols.oy'), { min: -6, max: 6, step: 0.2, value: st.oy,
      fmt: function (v) { return v.toFixed(1); }, onInput: function (v) { st.oy = v; redraw(); } }));
    var chk = h('input', { type: 'checkbox', checked: st.robust, onchange: function () { st.robust = this.checked; draw(); } });
    panel.appendChild(h('label', { class: 'slider' }, [h('span', { style: { fontSize: '12.5px' }, text: t('lab.robust') }), chk]));
    panel.appendChild(h('div', { class: 'row tight' }, [
      h('button', { class: 'icon-btn primary', text: t('lab.resample'), onclick: function () { st.seed++; redraw(); } })
    ]));
    panel.appendChild(out);
    panel.appendChild(h('p', { class: 'small muted', style: { marginTop: '10px' }, text: t('lab.ols.tip') }));

    left.appendChild(cv.el);
    wrap.appendChild(left); wrap.appendChild(panel);
    setTimeout(redraw, 0);
    return wrap;
  }

  /* =====================================================================
     9. Peeking: why repeated looks inflate false positives
     ===================================================================== */
  function seqPlayground() {
    var POC = { 1: 1.96, 2: 2.178, 3: 2.289, 4: 2.361, 5: 2.413, 6: 2.453, 7: 2.485, 8: 2.512, 9: 2.535, 10: 2.555 };
    var OBF = { 1: 1.96, 2: 1.977, 3: 1.993, 4: 2.008, 5: 2.02, 6: 2.03, 7: 2.04, 8: 2.046, 9: 2.052, 10: 2.056 };
    var st = { K: 5, trials: 400, res: null, seed: 21 };
    var wrap = h('div', { class: 'pg' });
    var left = h('div');
    var cv = canvasSetup(700, 320);
    var panel = h('div');

    function boundary(kind, k, K) {
      if (kind === 'naive') return 1.96;
      if (kind === 'pocock') return POC[Math.min(10, K)] || 2.41;
      return (OBF[Math.min(10, K)] || 2.02) * Math.sqrt(K / k);
    }
    function run() {
      var rng = makeRng(st.seed), kinds = ['naive', 'pocock', 'obf'];
      var fpr = { naive: 0, pocock: 0, obf: 0 };
      var byLook = new Array(st.K + 1).fill(0);
      var K = st.K, trial, k;
      for (trial = 0; trial < st.trials; trial++) {
        var z = 0, prevT = 0;
        var hit = { naive: 0, pocock: 0, obf: 0 };
        for (k = 1; k <= K; k++) {
          var tk = k / K;
          /* z_k = S_k / sqrt(n_k); the increment has variance 1 - t_{k-1}/t_k */
          var inc = rNorm(rng) * Math.sqrt(Math.max(0, 1 - prevT / tk));
          z = z * Math.sqrt(prevT / tk) + inc;
          prevT = tk;
          kinds.forEach(function (kind) {
            if (!hit[kind] && Math.abs(z) > boundary(kind, k, K)) {
              hit[kind] = 1;
              fpr[kind] += 1;
              if (kind === 'naive') byLook[k] += 1;
            }
          });
        }
      }
      kinds.forEach(function (kind) { fpr[kind] = fpr[kind] / st.trials; });
      for (k = 1; k <= K; k++) byLook[k] = byLook[k] / st.trials;
      st.res = { fpr: fpr, byLook: byLook };
      draw(); refreshOut();
    }

    function draw() {
      var C = colors(), ctx = cv.ctx, W = cv.w, H = cv.h;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      var r = st.res; if (!r) return;
      var pad = 42, base = H - 34, top = 26;
      /* bars: three strategies */
      var names = [['naive', t('lab.seq.naive'), C.err], ['pocock', t('lab.seq.pocock'), '#f59e0b'], ['obf', t('lab.seq.obf'), C.ok]];
      var bw = (W - pad - 20) / 3;
      function Y(p) { return base - p * (base - top); }
      ctx.strokeStyle = C.border; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(W - 12, base); ctx.stroke();
      names.forEach(function (nm, i) {
        var v = r.fpr[nm[0]], x = pad + i * bw + 8, w = bw - 16;
        ctx.fillStyle = hexAlpha(nm[2], 0.75);
        ctx.fillRect(x, Y(v), w, base - Y(v));
        ctx.strokeStyle = nm[2]; ctx.lineWidth = 1.2;
        ctx.strokeRect(x, Y(v), w, base - Y(v));
        ctx.fillStyle = C.text; ctx.font = '12.5px ui-monospace, monospace';
        ctx.fillText((100 * v).toFixed(1) + '%', x + w / 2 - 14, Y(v) - 6);
        ctx.fillStyle = C.muted; ctx.font = '11.5px ui-monospace, monospace';
        ctx.fillText(nm[1], x, base + 16);
      });
      /* nominal 5% line */
      ctx.strokeStyle = C.text; ctx.lineWidth = 1.2;
      if (ctx.setLineDash) ctx.setLineDash([5, 3]);
      ctx.beginPath(); ctx.moveTo(pad, Y(0.05)); ctx.lineTo(W - 12, Y(0.05)); ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);
      ctx.fillStyle = C.muted; ctx.font = '10.5px ui-monospace, monospace';
      ctx.fillText('5%', 12, Y(0.05) + 4);
      ctx.textAlign = 'center';
      ctx.fillText(t('lab.seq.nominal'), pad + (W - pad - 20) / 2, Y(0.05) - 6);
      ctx.textAlign = 'left';
      ctx.fillStyle = C.text; ctx.font = '12.5px ui-monospace, monospace';
      ctx.fillText(t('lab.seq.title2', { k: st.K, n: st.trials }), pad, 16);
    }

    var out = h('div', { class: 'small', style: { marginTop: '10px', lineHeight: '1.7' } });
    function refreshOut() {
      ui.clear(out);
      var r = st.res; if (!r) return;
      out.appendChild(h('div', { html: '<b>' + t('lab.seq.naive') + ':</b> ' + (100 * r.fpr.naive).toFixed(1) + '%' }));
      out.appendChild(h('div', { html: '<b>' + t('lab.seq.pocock') + ':</b> ' + (100 * r.fpr.pocock).toFixed(1) + '%' }));
      out.appendChild(h('div', { html: '<b>' + t('lab.seq.obf') + ':</b> ' + (100 * r.fpr.obf).toFixed(1) + '%' }));
      out.appendChild(h('div', { class: 'tiny muted', text: t('lab.seq.verdict') }));
    }

    panel.appendChild(slider(t('lab.seq.looks'), { min: 1, max: 10, step: 1, value: st.K,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.K = v; run(); } }));
    panel.appendChild(slider(t('lab.seq.trials'), { min: 100, max: 1200, step: 100, value: st.trials,
      fmt: function (v) { return v.toFixed(0); }, onInput: function (v) { st.trials = v; run(); } }));
    panel.appendChild(h('div', { class: 'row tight' }, [
      h('button', { class: 'icon-btn primary', text: t('lab.run'), onclick: function () { st.seed++; run(); } })
    ]));
    panel.appendChild(out);
    panel.appendChild(h('p', { class: 'small muted', style: { marginTop: '10px' }, text: t('lab.seq.tip') }));

    left.appendChild(cv.el);
    wrap.appendChild(left); wrap.appendChild(panel);
    setTimeout(run, 0);
    return wrap;
  }

  /* --------------------------------------------------------------- registry */
  DSH.playgrounds = [
    { id: 'matrix', titleKey: 'lab.matrix', descKey: 'lab.matrix.desc', build: matrixPlayground,
      related: ['la-002', 'la-006'] },
    { id: 'gd', titleKey: 'lab.gd', descKey: 'lab.gd.desc', build: gdPlayground,
      related: ['calc-004', 'ml-003'] },
    { id: 'dist', titleKey: 'lab.dist', descKey: 'lab.dist.desc', build: distPlayground,
      related: ['prob-004', 'stat-004'] },
    { id: 'metrics', titleKey: 'lab.metrics', descKey: 'lab.metrics.desc', build: metricsPlayground,
      related: ['ml-004'] },
    { id: 'kmeans', titleKey: 'lab.kmeans', descKey: 'lab.kmeans.desc', build: kmeansPlayground,
      related: ['ml-009'] },
    { id: 'power', titleKey: 'lab.power', descKey: 'lab.power.desc', build: powerPlayground,
      related: ['stat-013', 'stat-011'] },
    { id: 'boot', titleKey: 'lab.boot', descKey: 'lab.boot.desc', build: bootPlayground,
      related: ['stat-012', 'stat-004'] },
    { id: 'ols', titleKey: 'lab.ols', descKey: 'lab.ols.desc', build: olsPlayground,
      related: ['stat-014', 'stat-023'] },
    { id: 'seq', titleKey: 'lab.seq', descKey: 'lab.seq.desc', build: seqPlayground,
      related: ['stat-027', 'stat-005'] }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
