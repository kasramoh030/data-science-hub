/* =====================================================================
   quiz.js — interactive exercise & quiz engine
   Kinds: mcq | msq | num (with optional random generators) | text
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, ui = DSH.ui, h = ui.h, t = function (k, v) { return DSH.i18n.t(k, v); };
  var pick = function (o) { return DSH.i18n.pick(o); };

  /* ---------------------------------------------------- question instances */
  function instantiate(q) {
    var inst = {
      id: q.id, domain: q.domain, level: q.level, kind: q.kind,
      prompt: q.prompt, explain: q.explain, tags: q.tags
    };
    if (q.kind === 'num' && typeof q.payload.gen === 'function') {
      var g = q.payload.gen();
      inst.extra = g.text;
      inst.answer = g.answer;
      inst.tol = g.tol == null ? 0.01 : g.tol;
      inst.unit = g.unit || '';
    } else if (q.kind === 'num') {
      inst.extra = q.payload.text;
      inst.answer = q.payload.answer;
      inst.tol = q.payload.tol == null ? 0.01 : q.payload.tol;
      inst.unit = q.payload.unit || '';
    } else if (q.kind === 'mcq' || q.kind === 'msq') {
      inst.options = q.payload.options;
      inst.answer = q.payload.answer;
      inst.answers = q.payload.answers || (Array.isArray(q.payload.answer) ? q.payload.answer : [q.payload.answer]);
    } else {
      inst.answers = q.payload.answers || [];
    }
    return inst;
  }

  function buildSet(opts) {
    opts = opts || {};
    var all = DSH.QUESTIONS;
    var pool = all.filter(function (q) {
      if (opts.domain && opts.domain !== 'all' && q.domain !== opts.domain) return false;
      if (opts.level && opts.level !== 'all' && q.level !== opts.level) return false;
      return true;
    });

    if (opts.mode === 'weak') {
      var weakIds = DSH.store.weakQuestions(40);
      var weak = pool.filter(function (q) { return weakIds.indexOf(q.id) !== -1; });
      if (weak.length) pool = weak;
    } else if (opts.mode === 'new') {
      var unseen = DSH.store.unseenQuestionIds(pool.map(function (q) { return q.id; }));
      var fresh = pool.filter(function (q) { return unseen.indexOf(q.id) !== -1; });
      if (fresh.length >= 3) pool = fresh;
    }

    var chosen = ui.shuffle(pool).slice(0, opts.count || 8);
    return chosen.map(instantiate);
  }

  /* ------------------------------------------------------------- grading */
  function normaliseText(s) {
    return String(s || '').toLowerCase()
      .replace(/[\s_]+/g, ' ')
      .replace(/[^\w .+\-*/^()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function grade(q, response) {
    if (q.kind === 'mcq') {
      return { correct: response.index === q.answer };
    }
    if (q.kind === 'msq') {
      var sel = (response.indices || []).slice().sort(function (a, b) { return a - b; });
      var ans = (q.answers || []).slice().sort(function (a, b) { return a - b; });
      return { correct: sel.length === ans.length && sel.every(function (v, i) { return v === ans[i]; }) };
    }
    if (q.kind === 'num') {
      var v = parseFloat(String(response.value).replace(',', '.'));
      if (isNaN(v)) return { error: true, correct: false };
      var tol = q.tol || 0;
      var ok = Math.abs(v - q.answer) <= Math.max(tol, Math.abs(q.answer) * 1e-6);
      return { correct: ok, given: v, expected: q.answer };
    }
    // text
    var got = normaliseText(response.value);
    var ok2 = q.answers.some(function (a) {
      var want = normaliseText(a);
      return got === want || (want.length > 3 && got.indexOf(want) !== -1);
    });
    return { correct: ok2, given: response.value, expected: (q.answers || [])[0] };
  }

  function expectedText(q) {
    if (q.kind === 'mcq') return pick(q.options[q.answer]);
    if (q.kind === 'msq') return (q.answers || []).map(function (i) { return pick(q.options[i]); }).join(', ');
    if (q.kind === 'num') return ui.fmtNum(q.answer) + (q.unit ? ' ' + q.unit : '');
    return (q.answers || []).join(' / ');
  }

  /* --------------------------------------------------------------- mount */
  function mount(container, opts, hooks) {
    hooks = hooks || {};
    var questions = buildSet(opts);
    if (!questions.length) {
      ui.clear(container);
      container.appendChild(h('div', { class: 'empty' }, [
        h('span', { class: 'big', text: '🔍' }),
        h('p', { text: t('quiz.noQuestions') })
      ]));
      return;
    }

    var session = {
      questions: questions,
      i: 0,
      answers: [],
      domain: opts.domain || 'mixed',
      mode: opts.mode || 'mixed',
      startedAt: Date.now()
    };

    var body = h('div', { class: 'card q-card' });
    ui.clear(container);
    container.appendChild(body);
    render();

    function render() {
      ui.clear(body);
      var q = session.questions[session.i];
      var pct = (100 * session.i) / session.questions.length;
      body.appendChild(h('div', { class: 'q-progress' }, [h('i', { style: { width: pct + '%' } })]));
      body.appendChild(h('div', { class: 'spread', style: { marginBottom: '10px' } }, [
        h('span', { class: 'badge', text: pick(DSH.domainById(q.domain)).trim() }),
        h('span', { class: 'tiny muted', text: t('quiz.question', { i: session.i + 1, n: session.questions.length }) })
      ]));

      var promptText = pick(q.prompt);
      var extra = q.extra ? pick(q.extra) : null;
      body.appendChild(h('p', { class: 'q-prompt', text: promptText }));
      if (extra) body.appendChild(h('pre', { text: extra }));

      var hint = q.kind === 'mcq' ? t('quiz.selectOne')
        : q.kind === 'msq' ? t('quiz.selectMany')
        : q.kind === 'num' ? t('quiz.enterNumber') : t('quiz.typeAnswer');
      body.appendChild(h('p', { class: 'tiny muted', style: { marginTop: '-8px' }, text: hint }));

      var area = h('div', { class: 'opts' });
      body.appendChild(area);

      var state = session.answers[session.i] || (session.answers[session.i] = { response: null, graded: null });
      var feedback = h('div');
      body.appendChild(feedback);

      var actions = h('div', { class: 'row', style: { marginTop: '14px' } });
      body.appendChild(actions);

      if (q.kind === 'mcq' || q.kind === 'msq') {
        var selected = state.response && state.response.indices ? state.response.indices.slice() : [];
        if (state.response && state.response.index != null) selected = [state.response.index];
        (q.options || []).forEach(function (opt, idx) {
          var isSel = selected.indexOf(idx) !== -1;
          area.appendChild(h('div', {
            class: 'opt' + (isSel ? ' sel' : ''),
            onclick: function () {
              if (state.graded) return;
              if (q.kind === 'mcq') {
                selected = [idx];
                state.response = { index: idx };
              } else {
                var p = selected.indexOf(idx);
                if (p === -1) selected.push(idx); else selected.splice(p, 1);
                state.response = { indices: selected.slice() };
              }
              render();
            }
          }, [
            h('span', { class: 'key', text: String.fromCharCode(65 + idx) }),
            h('span', { text: pick(opt) })
          ]));
        });
      } else {
        var input = h('input', {
          class: q.kind === 'num' ? 'num-input' : '',
          type: 'text',
          inputmode: q.kind === 'num' ? 'decimal' : 'text',
          value: state.response ? (state.response.value || '') : '',
          placeholder: q.kind === 'num' ? '0.00' : '',
          onkeydown: function (e) { if (e.key === 'Enter') check(); }
        });
        area.appendChild(input);
        area.__input = input;
        setTimeout(function () { try { input.focus(); } catch (e) {} }, 30);
      }

      function check() {
        if (q.kind !== 'mcq' && q.kind !== 'msq') {
          var el = area.querySelector('input');
          state.response = { value: el ? el.value : '' };
        }
        if (!state.response || (state.response.value === '' && q.kind !== 'mcq' && q.kind !== 'msq')) {
          ui.toast(q.kind === 'num' ? t('quiz.enterNumber') : t('quiz.typeAnswer'));
          return;
        }
        var g = grade(q, state.response || {});
        state.graded = g;
        if (g.error) { ui.toast(t('quiz.enterNumber')); state.graded = null; return; }
        render();
      }

      function next() {
        if (session.i + 1 >= session.questions.length) return finish();
        session.i++;
        render();
        if (hooks.onProgress) hooks.onProgress(session.i, session.questions.length);
      }

      actions.appendChild(h('button', {
        class: 'icon-btn' + (state.graded ? '' : ' primary'),
        text: state.graded ? t('quiz.next') : t('quiz.check'),
        onclick: function () { state.graded ? next() : check(); }
      }));
      if (session.i > 0) {
        actions.appendChild(h('button', {
          class: 'icon-btn', text: t('lesson.prev'),
          onclick: function () { session.i--; render(); }
        }));
      }
      actions.appendChild(h('button', {
        class: 'icon-btn', text: t('quiz.back'),
        onclick: function () { if (hooks.onExit) hooks.onExit(); }
      }));

      /* feedback panel */
      if (state.graded) {
        var g = state.graded;
        // mark options
        if (q.kind === 'mcq' || q.kind === 'msq') {
          Array.prototype.forEach.call(area.children, function (node, idx) {
            var isAns = (q.kind === 'mcq' ? q.answer === idx : (q.answers || []).indexOf(idx) !== -1);
            if (isAns) node.classList.add('good');
            else if (node.classList.contains('sel')) node.classList.add('bad');
            node.classList.add('locked');
            node.classList.remove('sel');
          });
        } else if (area.__input) {
          area.__input.disabled = true;
          if (g.correct) area.__input.classList.add('good');
        }

        feedback.appendChild(h('div', { class: 'explain' }, [
          h('div', { class: 'verdict ' + (g.correct ? 'ok' : 'no'),
            text: (g.correct ? '✓ ' : '✕ ') + (g.correct ? t('quiz.correct') : t('quiz.incorrect')) }),
          g.correct ? null : h('div', { class: 'small', html: '<b>' + ui.esc(t('quiz.answer', { a: expectedText(q) })) + '</b>' }),
          h('div', { class: 'small', style: { marginTop: '6px' }, html: '<b>' + ui.esc(t('quiz.explanation')) + ':</b> ' + ui.esc(pick(q.explain)) })
        ]));
      }
    }

    function finish() {
      var score = 0;
      var answers = session.questions.map(function (q, i) {
        var a = session.answers[i] || {};
        var correct = !!(a.graded && a.graded.correct);
        if (correct) score++;
        return { id: q.id, domain: q.domain, correct: correct };
      });
      DSH.store.recordQuiz({
        score: score, total: session.questions.length,
        domain: session.domain, mode: session.mode, answers: answers
      });
      ui.clear(body);

      var pct = score / session.questions.length;
      body.appendChild(h('h2', { text: t('quiz.title') }));
      body.appendChild(h('div', { class: 'result-grid' }, [
        stat(score + ' / ' + session.questions.length, t('quiz.score')),
        stat(ui.fmtPct(pct), t('quiz.accuracy')),
        stat(String(DSH.store.stats().answered), t('quiz.attempts'))
      ]));

      var list = h('div');
      session.questions.forEach(function (q, i) {
        var a = session.answers[i] || {};
        var qobj = DSH.QUESTIONS.filter(function (x) { return x.id === q.id; })[0];
        list.appendChild(h('div', { class: 'opt locked ' + (a.graded && a.graded.correct ? 'good' : 'bad'), style: { cursor: 'default' } }, [
          h('span', { class: 'key', text: (a.graded && a.graded.correct) ? '✓' : '✕' }),
          h('div', {}, [
            h('div', { html: '<b>' + ui.esc(pick(q.prompt)) + '</b>' + (q.extra ? ' <span class="mono">' + ui.esc(pick(q.extra)) + '</span>' : '') }),
            h('div', { class: 'small muted', html: ui.esc(t('quiz.answer', { a: expectedText(q) })) }),
            h('div', { class: 'small muted', text: pick(q.explain) })
          ])
        ]));
      });
      body.appendChild(list);

      body.appendChild(h('div', { class: 'row', style: { marginTop: '16px' } }, [
        h('button', { class: 'icon-btn primary', text: t('quiz.again'), onclick: function () {
          mount(container, opts, hooks);
        } }),
        h('button', { class: 'icon-btn', text: t('quiz.back'), onclick: function () { if (hooks.onExit) hooks.onExit(); } })
      ]));
      if (hooks.onFinish) hooks.onFinish({ score: score, total: session.questions.length });
    }

    function stat(big, small) {
      return h('div', { class: 'stat' }, [h('b', { text: big }), h('span', { text: small })]);
    }
  }

  DSH.quiz = { mount: mount, buildSet: buildSet, grade: grade, instantiate: instantiate };
})(typeof window !== 'undefined' ? window : globalThis);
