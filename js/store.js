/* =====================================================================
   store.js — persistent state in localStorage (progress, bookmarks, quiz)
   Falls back to an in-memory object if storage is unavailable
   (private mode, file:// on some browsers) so the app never breaks.
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH || (root.DSH = {});
  var KEY = 'dshub.state.v1';

  var mem = null;
  var available = (function () {
    try {
      var k = '__dshub_test__';
      root.localStorage.setItem(k, '1');
      root.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  function blank() {
    return {
      version: 1,
      lang: 'en',
      theme: 'light',
      completed: {},          // lessonId -> timestamp
      bookmarks: {},          // lessonId -> timestamp
      savedResources: [],     // [{id, title, url, kind, custom, ts}]
      quiz: { history: [], perQuestion: {} },
      projects: {},            // projectId -> {steps: {i: ts}, done: ts|null}
      lastLesson: null,
      activeDays: [],         // 'YYYY-MM-DD'
      createdAt: Date.now()
    };
  }

  function read() {
    if (!available) return mem || (mem = blank());
    try {
      var raw = root.localStorage.getItem(KEY);
      if (!raw) return blank();
      var s = JSON.parse(raw);
      var b = blank();
      for (var k in b) if (!(k in s)) s[k] = b[k];
      if (!s.quiz) s.quiz = { history: [], perQuestion: {} };
      if (!s.quiz.history) s.quiz.history = [];
      if (!s.quiz.perQuestion) s.quiz.perQuestion = {};
      if (!s.projects) s.projects = {};
      return s;
    } catch (e) { return blank(); }
  }

  function write(s) {
    if (!available) { mem = s; return; }
    try { root.localStorage.setItem(KEY, JSON.stringify(s)); }
    catch (e) { mem = s; }
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }

  var Store = {
    state: read(),
    available: available,

    save: function () { write(this.state); },

    set: function (patch) {
      for (var k in patch) this.state[k] = patch[k];
      this.touch();
      this.save();
      return this.state;
    },

    /* mark today as an active day (for the streak counter) */
    touch: function () {
      var t = today();
      if (this.state.activeDays.indexOf(t) === -1) {
        this.state.activeDays.push(t);
        if (this.state.activeDays.length > 400) this.state.activeDays.shift();
      }
    },

    /* ---------------- lessons ---------------- */
    isComplete: function (id) { return !!this.state.completed[id]; },
    toggleComplete: function (id) {
      if (this.state.completed[id]) delete this.state.completed[id];
      else this.state.completed[id] = Date.now();
      this.touch(); this.save();
      return !!this.state.completed[id];
    },
    setComplete: function (id, done) {
      if (done) this.state.completed[id] = Date.now();
      else delete this.state.completed[id];
      this.touch(); this.save();
    },

    /* ---------------- bookmarks ---------------- */
    isBookmarked: function (id) { return !!this.state.bookmarks[id]; },
    toggleBookmark: function (id) {
      if (this.state.bookmarks[id]) delete this.state.bookmarks[id];
      else this.state.bookmarks[id] = Date.now();
      this.touch(); this.save();
      return !!this.state.bookmarks[id];
    },
    addResource: function (res) {
      res = JSON.parse(JSON.stringify(res));
      res.custom = true; res.ts = Date.now();
      res.id = 'custom-' + Date.now() + '-' + Math.floor(Math.random() * 1e4);
      this.state.savedResources.unshift(res);
      this.touch(); this.save();
      return res;
    },
    removeResource: function (id) {
      this.state.savedResources = this.state.savedResources.filter(function (r) { return r.id !== id; });
      this.save();
    },
    hasResource: function (id) {
      return this.state.savedResources.some(function (r) { return r.id === id; });
    },
    toggleResource: function (res) {
      if (this.hasResource(res.id)) { this.removeResource(res.id); return false; }
      this.addResource(res); return true;
    },

    /* ---------------- projects ---------------- */
    projState: function (id) {
      return this.state.projects[id] || (this.state.projects[id] = { steps: {}, done: null });
    },
    projStepDone: function (id, i) {
      var st = this.state.projects[id];
      return !!(st && st.steps && st.steps[i]);
    },
    toggleProjStep: function (id, i) {
      var st = this.projState(id);
      if (st.steps[i]) delete st.steps[i]; else st.steps[i] = Date.now();
      this.touch(); this.save();
      return !!st.steps[i];
    },
    projDoneCount: function (id, total) {
      var st = this.state.projects[id];
      if (!st || !st.steps) return 0;
      var n = 0;
      for (var i = 0; i < (total || 0); i++) if (st.steps[i]) n++;
      return n;
    },
    isProjComplete: function (id) {
      var st = this.state.projects[id];
      return !!(st && st.done);
    },
    setProjComplete: function (id, done) {
      var st = this.projState(id);
      st.done = done ? Date.now() : null;
      this.touch(); this.save();
    },
    resetProject: function (id) {
      delete this.state.projects[id];
      this.save();
    },

    /* ---------------- quizzes ---------------- */
    recordQuiz: function (result) {
      this.state.quiz.history.unshift({
        ts: Date.now(), score: result.score, total: result.total,
        domain: result.domain || 'mixed', mode: result.mode || 'mixed'
      });
      if (this.state.quiz.history.length > 200) this.state.quiz.history.length = 200;

      (result.answers || []).forEach(function (a) {
        var rec = this.state.quiz.perQuestion[a.id] || (this.state.quiz.perQuestion[a.id] = { right: 0, wrong: 0 });
        if (a.correct) rec.right++; else rec.wrong++;
        rec.last = Date.now();
        rec.lastCorrect = !!a.correct;
      }, this);

      this.touch(); this.save();
    },

    questionStats: function (id) {
      return this.state.quiz.perQuestion[id] || { right: 0, wrong: 0 };
    },
    weakQuestions: function (n) {
      var self = this;
      return Object.keys(this.state.quiz.perQuestion)
        .map(function (id) {
          var r = self.state.quiz.perQuestion[id];
          return { id: id, wrong: r.wrong, right: r.right, score: r.wrong - r.right };
        })
        .filter(function (r) { return r.wrong > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, n || 10)
        .map(function (r) { return r.id; });
    },
    unseenQuestionIds: function (allIds) {
      var seen = this.state.quiz.perQuestion;
      return allIds.filter(function (id) { return !seen[id]; });
    },

    /* ---------------- stats ---------------- */
    stats: function (lessons) {
      var st = this.state;
      var total = lessons ? lessons.length : 0;
      var completedIds = Object.keys(st.completed);
      var byDomain = {};
      (lessons || []).forEach(function (l) {
        var d = byDomain[l.domain] || (byDomain[l.domain] = { total: 0, done: 0 });
        d.total++;
        if (st.completed[l.id]) d.done++;
      });
      var qRight = 0, qTotal = 0;
      Object.keys(st.quiz.perQuestion).forEach(function (id) {
        var r = st.quiz.perQuestion[id];
        qRight += r.right; qTotal += r.right + r.wrong;
      });
      var projDone = 0;
      Object.keys(st.projects).forEach(function (id) {
        if (st.projects[id] && st.projects[id].done) projDone++;
      });
      return {
        projectCount: (DSH.PROJECTS || []).length,
        projectsDone: projDone,
        total: total,
        completed: completedIds.length,
        pct: total ? completedIds.length / total : 0,
        bookmarks: Object.keys(st.bookmarks).length,
        savedResources: st.savedResources.length,
        quizzes: st.quiz.history.length,
        accuracy: qTotal ? qRight / qTotal : 0,
        answered: qTotal,
        streak: this.streak(),
        byDomain: byDomain
      };
    },

    streak: function () {
      var days = this.state.activeDays.slice().sort();
      if (!days.length) return 0;
      var set = {};
      days.forEach(function (d) { set[d] = 1; });
      var d = new Date(), n = 0;
      function key(dt) {
        return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' +
               String(dt.getDate()).padStart(2, '0');
      }
      if (!set[key(d)]) d.setDate(d.getDate() - 1);      // allow "not yet today"
      while (set[key(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },

    recentCompleted: function (n) {
      return Object.keys(this.state.completed)
        .map(function (id) { return { id: id, ts: this.state.completed[id] }; }, this)
        .sort(function (a, b) { return b.ts - a.ts; })
        .slice(0, n || 6);
    },

    /* ---------------- import / export / reset ---------------- */
    toJSON: function () { return JSON.stringify(this.state, null, 2); },
    fromJSON: function (text) {
      var parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) throw new Error('bad file');
      var b = blank();
      for (var k in b) if (!(k in parsed)) parsed[k] = b[k];
      this.state = parsed; this.save(); return true;
    },
    reset: function () { this.state = blank(); this.save(); }
  };

  DSH.store = Store;
})(typeof window !== 'undefined' ? window : globalThis);
