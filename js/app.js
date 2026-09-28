/* =====================================================================
   app.js — router + pages
   Hash routes:  #/  #/lessons  #/lesson/:id  #/paths  #/path/:id
                 #/quiz  #/lab  #/saved  #/resources  #/progress  #/settings
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, ui = DSH.ui, h = ui.h, store = DSH.store, i18n = DSH.i18n;
  var doc = root.document;
  var t = function (k, v) { return i18n.t(k, v); };
  var pick = function (o) { return i18n.pick(o); };

  var els = {};
  var filters = { q: '', domain: 'all', level: 'all', status: 'all', sort: 'curated', tag: '' };
  var NAV = [
    { id: 'lessons', route: '#/lessons', icon: '📚' },
    { id: 'paths', route: '#/paths', icon: '🧭' },
    { id: 'quiz', route: '#/quiz', icon: '✏️' },
    { id: 'lab', route: '#/lab', icon: '🧪' },
    { id: 'projects', route: '#/projects', icon: '🛠️' },
    { id: 'saved', route: '#/saved', icon: '🔖' }
  ];
  var NAV2 = [
    { id: 'resources', route: '#/resources', icon: '🌐' },
    { id: 'progress', route: '#/progress', icon: '📈' },
    { id: 'updates', route: '#/updates', icon: '🆕' },
    { id: 'settings', route: '#/settings', icon: '⚙️' }
  ];
  function navById(id) { return NAV.concat(NAV2).filter(function (n) { return n.id === id; })[0]; }
  var NAV_GROUPS = [
    { title: 'nav.learn', items: ['lessons', 'paths', 'quiz', 'lab', 'projects'] },
    { title: 'nav.library', items: ['saved', 'resources'] },
    { title: 'nav.workspace', items: ['progress', 'updates', 'settings'] }
  ];

  /* ==================================================================== boot */
  function init() {
    i18n.setLang(store.state.lang || 'en');
    applyTheme(store.state.theme || 'light');
    ui.buildIndex(DSH.LESSONS);
    buildShell();
    root.addEventListener('hashchange', route);
    parseHashIntoFilters();
    route();
    ui.autoTypeset(doc.body);
    doc.addEventListener('keydown', function (e) {
      if (e.key === '/' && doc.activeElement === doc.body) {
        e.preventDefault();
        els.search && els.search.focus();
      }
      if (e.key === 'Escape' && els.drawer) closeDrawer();
    });
    root.addEventListener('resize', ui.debounce(function () {
      if (location.hash.indexOf('#/lab') === 0) route();
    }, 300));
  }

  function applyTheme(theme) {
    doc.documentElement.setAttribute('data-theme', theme);
    doc.documentElement.style.colorScheme = theme;
    store.state.theme = theme; store.save();
  }
  function applyLang(lang) {
    i18n.setLang(lang);
    store.state.lang = lang; store.save();
    doc.documentElement.setAttribute('dir', i18n.isRTL() ? 'rtl' : 'ltr');
    doc.documentElement.setAttribute('lang', lang);
    doc.title = t('app.name') + ' — ' + t('app.tagline');
  }

  /* ================================================================== shell */
  function buildShell() {
    applyLang(i18n.lang);

    els.brand = h('div', { class: 'brand', onclick: function () { location.hash = '#/'; } }, [
      h('div', { class: 'mark', text: '∑' }),
      h('div', {}, [h('div', { text: t('app.name') }), h('small', { text: t('app.tagline') })])
    ]);

    els.search = h('input', {
      type: 'search', placeholder: t('search.placeholder'),
      oninput: ui.debounce(function () {
        filters.q = this.value;
        if (location.hash.indexOf('#/lessons') !== 0) location.hash = '#/lessons';
        render();
      }, 180)
    });
    var search = h('div', { class: 'search' }, [
      h('span', { class: 'icon', text: '🔍' }), els.search, h('kbd', { text: '/' })
    ]);

    els.langBtn = h('div', { class: 'lang-switch', title: t('set.language') }, [
      h('button', {
        class: 'seg' + (i18n.lang === 'en' ? ' active' : ''), type: 'button', text: 'EN',
        onclick: function () { if (i18n.lang !== 'en') { applyLang('en'); buildShell(); render(); } }
      }),
      h('button', {
        class: 'seg' + (i18n.lang === 'fa' ? ' active' : ''), type: 'button', text: 'فا',
        onclick: function () { if (i18n.lang !== 'fa') { applyLang('fa'); buildShell(); render(); } }
      })
    ]);
    els.themeBtn = h('button', {
      class: 'icon-btn', title: t('set.theme'),
      text: store.state.theme === 'dark' ? '☀️' : '🌙',
      onclick: function () {
        applyTheme(store.state.theme === 'dark' ? 'light' : 'dark');
        els.themeBtn.textContent = store.state.theme === 'dark' ? '☀️' : '🌙';
      }
    });

    els.filterBtn = h('button', { class: 'icon-btn', text: '⚙ ' + t('filter.onMobile'), onclick: openDrawer });

    els.topbar = h('header', { class: 'topbar' }, [
      els.brand, search, els.filterBtn, els.langBtn, els.themeBtn
    ]);

    els.sidebar = h('aside', { class: 'sidebar' });
    els.main = h('main', { id: 'main' });

    els.tabbar = h('nav', { class: 'tabbar' });
    updateTabbar();

    els.drawer = h('div', { class: 'drawer' });

    var shell = h('div', { class: 'shell' }, [els.sidebar, els.main]);
    var app = h('div', { class: 'app' }, [els.topbar, shell, els.tabbar, els.drawer]);

    doc.body.innerHTML = '';
    doc.body.appendChild(app);
    renderSidebar();
  }

  function updateTabbar() {
    if (!els.tabbar) return;
    ui.clear(els.tabbar);
    NAV.forEach(function (n) {
      els.tabbar.appendChild(h('button', {
        class: location.hash.indexOf(n.route) === 0 ? 'active' : '',
        onclick: function () { location.hash = n.route; }
      }, [h('span', { class: 'ic', text: n.icon }), h('span', { text: t('nav.' + n.id) })]));
    });
  }

  function sideSection(titleKey, children) {
    return h('section', { class: 'nav-group' }, [h('h4', { text: t(titleKey) })].concat(children));
  }

  function renderSidebar() {
    ui.clear(els.sidebar);
    var counts = {};
    DSH.LESSONS.forEach(function (l) { counts[l.domain] = (counts[l.domain] || 0) + 1; });
    var onLessons = location.hash.indexOf('#/lessons') === 0;

    function groupItems(ids) {
      return ids.map(function (id) {
        var n = navById(id);
        return navItem({
          label: t('nav.' + n.id), icon: n.icon,
          active: location.hash.indexOf(n.route) === 0,
          onclick: function () { location.hash = n.route; }
        });
      });
    }

    // 1) primary navigation, then the topic filter for lessons, then the rest
    els.sidebar.appendChild(sideSection(NAV_GROUPS[0].title, groupItems(NAV_GROUPS[0].items)));

    var domItems = [navItem({
      label: t('filter.all'), dot: '#94a3b8', count: DSH.LESSONS.length,
      active: onLessons && filters.domain === 'all',
      onclick: function () { filters.domain = 'all'; location.hash = '#/lessons'; render(); }
    })];
    DSH.DOMAINS.forEach(function (d) {
      domItems.push(navItem({
        label: pick(d), dot: d.color, count: counts[d.id] || 0,
        active: onLessons && filters.domain === d.id,
        onclick: function () { filters.domain = d.id; location.hash = '#/lessons'; render(); }
      }));
    });
    els.sidebar.appendChild(sideSection('nav.domains', domItems));

    els.sidebar.appendChild(sideSection(NAV_GROUPS[1].title, groupItems(NAV_GROUPS[1].items)));
    els.sidebar.appendChild(sideSection(NAV_GROUPS[2].title, groupItems(NAV_GROUPS[2].items)));

    var st = store.stats(DSH.LESSONS);
    els.sidebar.appendChild(h('div', { class: 'card side-progress' }, [
      h('div', { class: 'spread' }, [
        h('b', { text: st.completed + ' / ' + st.total }),
        h('span', { class: 'tiny muted', text: ui.fmtPct(st.pct) })
      ]),
      h('div', { class: 'bar', style: { marginTop: '8px' } }, [h('i', { style: { width: (100 * st.pct) + '%', background: 'var(--accent)' } })])
    ]));
  }

  function navItem(o) {
    var kids = [];
    if (o.dot) kids.push(h('span', { class: 'dot', style: { background: o.dot } }));
    if (o.icon) kids.push(h('span', { text: o.icon }));
    kids.push(h('span', { text: o.label }));
    if (o.count != null) kids.push(h('span', { class: 'count', text: String(o.count) }));
    return h('div', { class: 'nav-item' + (o.active ? ' active' : ''), onclick: o.onclick }, kids);
  }

  /* ============================================================== filters UI */
  function field(label, control) {
    return h('label', { class: 'field' }, [h('span', { class: 'field-label', text: label }), control]);
  }

  function filtersBar() {
    var wrap = h('div', { class: 'filters', style: { marginBottom: '14px' } });

    var domSel = h('select', { onchange: function () { filters.domain = this.value; render(); } });
    domSel.appendChild(h('option', { value: 'all', text: t('filter.all') }));
    DSH.DOMAINS.forEach(function (d) {
      domSel.appendChild(h('option', { value: d.id, text: pick(d), selected: filters.domain === d.id }));
    });
    wrap.appendChild(field(t('filter.domain'), domSel));

    var lvlSel = h('select', { onchange: function () { filters.level = this.value; render(); } });
    lvlSel.appendChild(h('option', { value: 'all', text: t('filter.all') }));
    DSH.LEVELS.forEach(function (l) {
      lvlSel.appendChild(h('option', { value: l.id, text: pick(l), selected: filters.level === l.id }));
    });
    wrap.appendChild(field(t('filter.level'), lvlSel));

    var stSel = h('select', { onchange: function () { filters.status = this.value; render(); } });
    [['all', t('filter.all')], ['notStarted', t('filter.notStarted')],
     ['completed', t('filter.completed')], ['saved', t('filter.saved')]].forEach(function (o) {
      stSel.appendChild(h('option', { value: o[0], text: o[1], selected: filters.status === o[0] }));
    });
    wrap.appendChild(field(t('filter.status'), stSel));

    var sortSel = h('select', { onchange: function () { filters.sort = this.value; render(); } });
    [['curated', t('sort.curated')], ['level', t('sort.level')],
     ['title', t('sort.title')], ['time', t('sort.time')]].forEach(function (o) {
      sortSel.appendChild(h('option', { value: o[0], text: o[1], selected: filters.sort === o[0] }));
    });
    wrap.appendChild(field(t('filter.sort'), sortSel));

    if (filters.tag) {
      wrap.appendChild(h('button', {
        class: 'chip on', text: '#' + filters.tag + ' ✕',
        onclick: function () { filters.tag = ''; render(); }
      }));
    }
    if (filters.q) {
      wrap.appendChild(h('button', {
        class: 'chip on', text: '"' + filters.q + '" ✕',
        onclick: function () { filters.q = ''; els.search.value = ''; render(); }
      }));
    }
    wrap.appendChild(h('button', {
      class: 'chip', text: t('search.clear'),
      onclick: function () {
        filters = { q: '', domain: 'all', level: 'all', status: 'all', sort: 'curated', tag: '' };
        if (els.search) els.search.value = '';
        render();
      }
    }));
    return wrap;
  }

  function openDrawer() {
    ui.clear(els.drawer);
    els.drawer.appendChild(h('div', { class: 'scrim', onclick: closeDrawer }));
    var panel = h('div', { class: 'panel' }, [
      h('div', { class: 'spread' }, [
        h('h3', { text: t('filter.onMobile') }),
        h('button', { class: 'icon-btn', text: '✕', onclick: closeDrawer })
      ]),
      filtersBar(),
      h('h4', { class: 'tiny muted', text: t('nav.domains') }),
      h('div', { class: 'row tight' }, DSH.DOMAINS.map(function (d) {
        return h('button', {
          class: 'chip' + (filters.domain === d.id ? ' on' : ''),
          onclick: function () { filters.domain = d.id; closeDrawer(); render(); }
        }, [h('span', { class: 'swatch', style: { background: d.color } }), h('span', { text: pick(d) })]);
      }))
    ]);
    els.drawer.appendChild(panel);
    els.drawer.classList.add('open');
  }
  function closeDrawer() { els.drawer.classList.remove('open'); }

  /* ================================================================== router */
  function parseHashIntoFilters() {
    var m = /^#\/lessons\?(.*)$/.exec(location.hash || '');
    if (m) {
      m[1].split('&').forEach(function (pair) {
        var kv = pair.split('=');
        if (kv[0] === 'domain') filters.domain = decodeURIComponent(kv[1] || 'all');
        if (kv[0] === 'level') filters.level = decodeURIComponent(kv[1] || 'all');
        if (kv[0] === 'tag') filters.tag = decodeURIComponent(kv[1] || '');
        if (kv[0] === 'q') filters.q = decodeURIComponent(kv[1] || '');
      });
      if (els.search) els.search.value = filters.q;
    }
  }

  function route() {
    var hash = location.hash || '#/';
    ui.clear(els.main);
    updateTabbar();
    renderSidebar();
    if (root.scrollTo) { try { root.scrollTo(0, 0); } catch (e) {} }

    if (hash.indexOf('#/lesson/') === 0) return lessonPage(hash.slice('#/lesson/'.length));
    if (hash.indexOf('#/lessons') === 0) return lessonsPage();
    if (hash.indexOf('#/path/') === 0) return pathPage(hash.slice('#/path/'.length));
    if (hash.indexOf('#/paths') === 0) return pathsPage();
    if (hash.indexOf('#/quiz') === 0) return quizPage();
    if (hash.indexOf('#/lab/') === 0) return labPage(hash.slice('#/lab/'.length));
    if (hash.indexOf('#/lab') === 0) return labPage();
    if (hash.indexOf('#/saved') === 0) return savedPage();
    if (hash.indexOf('#/resources') === 0) return resourcesPage();
    if (hash.indexOf('#/progress') === 0) return progressPage();
    if (hash.indexOf('#/project/') === 0) return projectPage(hash.slice('#/project/'.length));
    if (hash.indexOf('#/projects') === 0) return projectsPage();
    if (hash.indexOf('#/updates') === 0) return updatesPage();
    if (hash.indexOf('#/settings') === 0) return settingsPage();
    return homePage();
  }
  function render() { route(); }

  /* ============================================================== HOME */
  function homePage() {
    var st = store.stats(DSH.LESSONS);
    var cont = store.state.lastLesson;

    els.main.appendChild(h('section', { class: 'card saas-hero' }, [
      h('div', { class: 'eyebrow', text: 'DATA SCIENCE LEARNING OS' }),
      h('h1', { text: t('app.name') }),
      h('p', { class: 'lede hero-copy', text: t('app.subtitle') }),
      h('div', { class: 'row saas-actions' }, [
        h('button', { class: 'icon-btn primary', text: '📚 ' + t('nav.lessons'), onclick: function () { location.hash = '#/lessons'; } }),
        h('button', { class: 'icon-btn', text: '✏️ ' + t('quiz.title'), onclick: function () { location.hash = '#/quiz'; } }),
        h('button', { class: 'icon-btn', text: '🧪 ' + t('lab.title'), onclick: function () { location.hash = '#/lab'; } }),
        h('button', { class: 'icon-btn', text: '🧭 ' + t('nav.paths'), onclick: function () { location.hash = '#/paths'; } })
      ]),
      h('div', { class: 'result-grid', style: { marginTop: '16px' } }, [
        stat(st.completed + ' / ' + st.total, t('dash.completed')),
        stat(ui.fmtPct(st.accuracy), t('dash.accuracy')),
        stat(String(st.quizzes), t('dash.quizzes')),
        stat(String(st.streak), t('dash.streak')),
        stat(String(st.bookmarks + st.savedResources), t('dash.saved')),
        stat(st.projectsDone + ' / ' + st.projectCount, t('dash.projects'))
      ])
    ]));

    if (cont && lessonById(cont)) {
      var l = lessonById(cont);
      els.main.appendChild(h('section', { class: 'card' }, [
        h('div', { class: 'spread' }, [
          h('div', {}, [
            h('div', { class: 'tiny muted', text: t('lesson.readNext') }),
            h('h3', { style: { margin: '2px 0 0' }, text: pick(l.title) })
          ]),
          h('button', { class: 'icon-btn primary', text: t('path.continue'),
            onclick: function () { location.hash = '#/lesson/' + l.id; } })
        ])
      ]));
    }

    els.main.appendChild(h('h2', { text: t('nav.domains') }));
    var grid = h('div', { class: 'grid cols-2' });
    DSH.DOMAINS.forEach(function (d) {
      var n = DSH.LESSONS.filter(function (l) { return l.domain === d.id; }).length;
      var done = DSH.LESSONS.filter(function (l) { return l.domain === d.id && store.isComplete(l.id); }).length;
      grid.appendChild(h('div', {
        class: 'card', style: { cursor: 'pointer' },
        onclick: function () { filters.domain = d.id; location.hash = '#/lessons'; }
      }, [
        h('div', { class: 'spread' }, [
          h('div', { class: 'row tight' }, [
            h('span', { text: d.icon }),
            h('b', { text: pick(d) })
          ]),
          h('span', { class: 'badge', text: done + '/' + n })
        ]),
        h('p', { class: 'small muted', style: { margin: '6px 0 10px' }, text: pick(d.blurb) }),
        h('div', { class: 'bar' }, [h('i', { style: { width: (n ? 100 * done / n : 0) + '%', background: d.color } })])
      ]));
    });
    els.main.appendChild(grid);

    els.main.appendChild(h('h2', { text: t('nav.paths') }));
    els.main.appendChild(pathsGrid());

    els.main.appendChild(h('div', { class: 'spread', style: { marginTop: '26px' } }, [
      h('h2', { style: { margin: 0 }, text: t('projects.title') }),
      h('button', { class: 'chip', text: t('nav.projects') + ' →',
        onclick: function () { location.hash = '#/projects'; } })
    ]));
    els.main.appendChild(projectGrid('capstone', 3));

    els.main.appendChild(h('div', { class: 'spread', style: { marginTop: '26px' } }, [
      h('h2', { style: { margin: 0 }, text: t('updates.title') }),
      h('button', { class: 'chip', text: t('updates.seeAll') + ' →',
        onclick: function () { location.hash = '#/updates'; } })
    ]));
    els.main.appendChild(updatesList(2));
  }

  /* ============================================================= PROJECTS */
  function projectCard(p) {
    var dom = DSH.domainById(p.domain);
    var lvl = DSH.levelById(p.level);
    var doneN = store.projDoneCount(p.id, p.steps.length);
    var finished = store.isProjComplete(p.id);
    var pct = p.steps.length ? doneN / p.steps.length : 0;

    return h('div', {
      class: 'lesson',
      style: { gridTemplateColumns: '34px minmax(0, 1fr) auto' },
      onclick: function (e) {
        if (e.target.closest('button')) return;
        location.hash = '#/project/' + p.id;
      }
    }, [
      h('div', { class: 'idx', text: p.kind === 'capstone' ? '🏆' : dom.icon }),
      h('div', {}, [
        h('h3', { text: pick(p.title) + (finished ? '  ✓' : '') }),
        h('p', { text: pick(p.pitch).slice(0, 150) + (pick(p.pitch).length > 150 ? '…' : '') }),
        h('div', { class: 'meta' }, [
          h('span', { class: 'badge', style: { color: dom.color }, text: pick(dom) }),
          h('span', { class: 'badge lvl-' + p.level, text: pick(lvl) }),
          h('span', { class: 'badge', text: t('projects.hours', { n: p.hours }) }),
          h('span', { class: 'badge', text: t('projects.steps', { n: p.steps.length }) })
        ]),
        h('div', { class: 'bar', style: { marginTop: '9px', maxWidth: '240px' } },
          [h('i', { style: { width: (100 * pct) + '%', background: finished ? 'var(--ok)' : dom.color } })])
      ]),
      h('div', { class: 'row tight' }, [
        h('button', { class: 'chip' + (finished ? ' on' : ''), text: finished ? '✓' : t('projects.openProject'),
          onclick: function () { location.hash = '#/project/' + p.id; } })
      ])
    ]);
  }

  function projectGrid(kind, limit) {
    var grid = h('div', { class: 'grid' });
    var list = (DSH.PROJECTS || []).filter(function (p) { return !kind || p.kind === kind; });
    list.slice(0, limit || list.length).forEach(function (p) { grid.appendChild(projectCard(p)); });
    if (!list.length) grid.appendChild(h('div', { class: 'empty' }, [h('p', { text: t('projects.empty') })]));
    return grid;
  }

  function projectsPage() {
    var fdom = 'all', flvl = 'all', fkind = 'all';
    els.main.appendChild(h('h1', { text: t('projects.title') }));
    els.main.appendChild(h('p', { class: 'lede', text: t('projects.lede') }));

    var bar = h('div', { class: 'filters' });
    var wrap = h('div');
    els.main.appendChild(bar);
    els.main.appendChild(wrap);

    var kindSel = h('select', { onchange: function () { fkind = this.value; draw(); } });
    [['all', t('filter.all')], ['domain', t('projects.kind.domain')], ['capstone', t('projects.kind.capstone')]].forEach(function (o) {
      kindSel.appendChild(h('option', { value: o[0], text: o[1] }));
    });
    var domSel = h('select', { onchange: function () { fdom = this.value; draw(); } });
    domSel.appendChild(h('option', { value: 'all', text: t('filter.all') }));
    DSH.DOMAINS.forEach(function (d) { domSel.appendChild(h('option', { value: d.id, text: pick(d) })); });
    var lvlSel = h('select', { onchange: function () { flvl = this.value; draw(); } });
    lvlSel.appendChild(h('option', { value: 'all', text: t('filter.all') }));
    DSH.LEVELS.forEach(function (l) { lvlSel.appendChild(h('option', { value: l.id, text: pick(l) })); });
    bar.appendChild(h('label', { class: 'small muted', text: t('projects.kind') })); bar.appendChild(kindSel);
    bar.appendChild(h('label', { class: 'small muted', text: t('filter.domain') })); bar.appendChild(domSel);
    bar.appendChild(h('label', { class: 'small muted', text: t('filter.level') })); bar.appendChild(lvlSel);

    function matches(p) {
      if (fkind !== 'all' && p.kind !== fkind) return false;
      if (fdom !== 'all' && p.domain !== fdom) return false;
      if (flvl !== 'all' && p.level !== flvl) return false;
      return true;
    }
    function draw() {
      ui.clear(wrap);
      var caps = DSH.PROJECTS.filter(function (p) { return p.kind === 'capstone' && matches(p); });
      var doms = DSH.PROJECTS.filter(function (p) { return p.kind === 'domain' && matches(p); });
      if (caps.length) {
        wrap.appendChild(h('h2', { text: t('projects.capstone') }));
        wrap.appendChild(h('p', { class: 'small muted', text: t('projects.capstoneNote') }));
        wrap.appendChild(h('p', { class: 'tiny muted', text: t('projects.order') }));
        var g1 = h('div', { class: 'grid' });
        caps.forEach(function (p) { g1.appendChild(projectCard(p)); });
        wrap.appendChild(g1);
      }
      if (doms.length) {
        wrap.appendChild(h('h2', { text: t('projects.domain') }));
        wrap.appendChild(h('p', { class: 'small muted', text: t('projects.domainNote') }));
        var g2 = h('div', { class: 'grid' });
        doms.forEach(function (p) { g2.appendChild(projectCard(p)); });
        wrap.appendChild(g2);
      }
      if (!caps.length && !doms.length) {
        wrap.appendChild(h('div', { class: 'empty' }, [h('span', { class: 'big', text: '🛠️' }), h('p', { text: t('projects.empty') })]));
      }
    }
    draw();
  }

  function projectPage(id) {
    var p = DSH.projectById(id);
    if (!p) { location.hash = '#/projects'; return; }
    var dom = DSH.domainById(p.domain);
    var doneN = store.projDoneCount(p.id, p.steps.length);
    var total = p.steps.length;
    var pct = total ? doneN / total : 0;
    var finished = store.isProjComplete(p.id);

    els.main.appendChild(h('div', { class: 'crumbs' }, [
      h('a', { href: '#/projects', text: t('projects.title') }), h('span', { text: ' / ' }),
      h('span', { text: p.kind === 'capstone' ? t('projects.capstone') : pick(dom) })
    ]));
    els.main.appendChild(h('h1', { text: pick(p.title) }));
    els.main.appendChild(h('p', { class: 'lede', text: pick(p.pitch) }));

    els.main.appendChild(h('div', { class: 'card' }, [
      h('div', { class: 'spread' }, [
        h('div', { class: 'row tight' }, [
          h('span', { class: 'badge', style: { color: dom.color }, text: pick(dom) }),
          h('span', { class: 'badge lvl-' + p.level, text: pick(DSH.levelById(p.level)) }),
          h('span', { class: 'badge', text: t('projects.hours', { n: p.hours }) }),
          h('span', { class: 'badge', text: t('projects.steps', { n: total }) }),
          h('span', { class: 'badge', text: p.kind === 'capstone' ? t('projects.kind.capstone') : t('projects.kind.domain') })
        ]),
        h('div', { class: 'row tight' }, [
          h('button', {
            class: 'icon-btn' + (finished ? ' primary' : ''),
            text: finished ? '✓ ' + t('projects.finished') : t('projects.finish'),
            onclick: function () { store.setProjComplete(p.id, !finished); route(); }
          }),
          h('button', {
            class: 'icon-btn', text: t('projects.restart'),
            onclick: function () {
              ui.confirmDialog(t('projects.restart') + '?', { danger: true }).then(function (ok) {
                if (ok) { store.resetProject(p.id); route(); }
              });
            }
          })
        ])
      ]),
      h('div', { class: 'bar', style: { marginTop: '12px' } },
        [h('i', { style: { width: (100 * pct) + '%', background: finished ? 'var(--ok)' : 'var(--accent)' } })]),
      h('div', { class: 'tiny muted', style: { marginTop: '6px' }, text: t('projects.progress', { done: doneN, n: total }) }),
      h('div', { class: 'callout', style: { marginTop: '14px', marginBottom: 0 } }, [
        h('span', { class: 'label', text: t('projects.dataset') }),
        h('div', { class: 'small', text: pick({ en: p.dataset.en, fa: p.dataset.fa }) }),
        h('a', { class: 'small', href: p.dataset.url, target: '_blank', rel: 'noopener', text: '↗ ' + t('projects.datasetLink') })
      ])
    ]));

    /* steps */
    p.steps.forEach(function (step, i) {
      var done = store.projStepDone(p.id, i);
      var body = h('div', { class: 'card' + (done ? '' : '') }, [
        h('div', { class: 'spread' }, [
          h('div', { class: 'row tight' }, [
            h('div', { style: {
              width: '26px', height: '26px', borderRadius: '8px', display: 'grid', placeItems: 'center',
              background: done ? 'var(--ok)' : 'var(--surface-2)', color: done ? '#fff' : 'var(--muted)',
              border: '1px solid var(--border)', fontSize: '13px', fontWeight: '700'
            }, text: done ? '✓' : String(i + 1) }),
            h('b', { text: pick(step.title) })
          ]),
          h('button', {
            class: 'icon-btn' + (done ? ' primary' : ''),
            text: done ? '✓ ' + t('projects.stepDone') : t('projects.markStep'),
            onclick: function () { store.toggleProjStep(p.id, i); route(); }
          })
        ]),
        h('div', { class: 'block', style: { marginTop: '10px' } }, [h('p', { text: pick(step.body) })]),
        step.code ? renderBlock(['code', step.code[0], step.code[1]]) : null,
        step.check ? h('div', { class: 'callout' }, [
          h('span', { class: 'label', text: t('projects.check') }),
          h('div', { class: 'small', text: pick(step.check) })
        ]) : null,
        step.hint ? hintBlock(step.hint) : null
      ]);
      els.main.appendChild(body);
    });

    /* deliverables + rubric */
    els.main.appendChild(h('div', { class: 'card' }, [
      h('h3', { style: { marginTop: 0 }, text: t('projects.deliverables') }),
      h('ul', { style: { paddingInlineStart: '20px', margin: 0 } },
        (i18n.lang === 'fa' ? p.deliverables.fa : p.deliverables.en).map(function (d) {
          return h('li', { class: 'small', text: d });
        }))
    ]));

    els.main.appendChild(h('div', { class: 'card' }, [
      h('h3', { style: { marginTop: 0 }, text: t('projects.rubric') }),
      h('ul', { style: { paddingInlineStart: '20px', margin: 0 } },
        p.rubric.map(function (r) { return h('li', { class: 'small', text: pick(r) }); }))
    ]));

    if ((p.resources || []).length) {
      var rl = h('ul', { class: 'res-list' });
      p.resources.forEach(function (r) {
        rl.appendChild(h('li', {}, [
          h('span', { class: 'kind', text: r.kind }),
          h('div', {}, [
            h('a', { href: r.url, target: '_blank', rel: 'noopener', text: r.title }),
            h('div', { class: 'tiny muted', text: r.url.replace(/^https?:\/\//, '').split('/')[0] })
          ])
        ]));
      });
      els.main.appendChild(h('div', { class: 'card' }, [
        h('h3', { style: { marginTop: 0 }, text: t('projects.resources') }), rl
      ]));
    }

    /* related lessons in the same domain */
    var related = DSH.LESSONS.filter(function (l) { return l.domain === p.domain; }).slice(0, 4);
    if (related.length) {
      els.main.appendChild(h('div', { class: 'card' }, [
        h('h3', { style: { marginTop: 0 }, text: t('projects.related') }),
        h('div', { class: 'row tight' }, related.map(function (l) {
          return h('button', { class: 'chip', text: pick(l.title).slice(0, 46),
            onclick: function () { location.hash = '#/lesson/' + l.id; } });
        }))
      ]));
    }

    els.main.appendChild(h('div', { class: 'row', style: { marginTop: '16px' } }, [
      h('button', { class: 'icon-btn', text: '← ' + t('projects.back'),
        onclick: function () { location.hash = '#/projects'; } }),
      h('button', { class: 'icon-btn', text: '✏️ ' + t('quiz.title'),
        onclick: function () { location.hash = '#/quiz?domain=' + p.domain; } })
    ]));
  }

  function hintBlock(hint) {
    var body = null;
    var btn = h('button', {
      class: 'chip', text: '💡 ' + t('projects.hint'),
      onclick: function () {
        if (body.style.display === 'none') {
          body.style.display = ''; btn.textContent = '💡 ' + t('projects.hint');
        } else {
          body.style.display = 'none'; btn.textContent = '💡 ' + t('ui.more');
        }
      }
    });
    body = h('div', { class: 'callout', style: { borderLeftColor: 'var(--warn)' } }, [
      h('span', { class: 'label', text: 'Hint' }),
      h('div', { class: 'small', text: pick(hint) })
    ]);
    return h('div', {}, [btn, body]);
  }

  function updatesList(limit) {
    var wrap = h('div', { class: 'grid' });
    var all = DSH.UPDATES || [];
    all.slice(0, limit || all.length).forEach(function (u) {
      wrap.appendChild(h('div', { class: 'card' }, [
        h('div', { class: 'spread' }, [
          h('b', { text: pick(u.title) }),
          h('span', { class: 'badge', text: t('updates.version', { v: u.version }) + ' · ' + u.date })
        ]),
        h('ul', { style: { marginTop: '8px', paddingInlineStart: '20px' } },
          u.items.map(function (it) { return h('li', { class: 'small', text: pick(it) }); }))
      ]));
    });
    return wrap;
  }

  function updatesPage() {
    els.main.appendChild(h('h1', { text: t('updates.title') }));
    els.main.appendChild(h('p', { class: 'lede', text: t('updates.lede') }));
    els.main.appendChild(updatesList());
  }

  function stat(big, small) {
    return h('div', { class: 'stat' }, [h('b', { text: big }), h('span', { text: small })]);
  }

  /* ============================================================== LESSONS */
  function lessonById(id) {
    for (var i = 0; i < DSH.LESSONS.length; i++) if (DSH.LESSONS[i].id === id) return DSH.LESSONS[i];
    return null;
  }

  function lessonsPage() {
    els.main.appendChild(h('div', { class: 'spread' }, [
      h('h1', { style: { margin: '0' }, text: t('nav.lessons') }),
      h('span', { class: 'muted small', text: t('search.results', { n: 0 }) })
    ]));
    els.main.appendChild(filtersBar());
    var list = h('div', { class: 'grid' });
    els.main.appendChild(list);

    var results = ui.search(DSH.LESSONS, filters.q, filters);
    els.main.querySelector('.muted.small').textContent = t('search.results', { n: results.length });

    if (!results.length) {
      list.appendChild(h('div', { class: 'empty' }, [
        h('span', { class: 'big', text: '🗂️' }),
        h('p', { text: t('search.empty') })
      ]));
      return;
    }
    results.forEach(function (l, i) {
      list.appendChild(lessonCard(l, i));
    });
  }

  function lessonCard(l, idx) {
    var dom = DSH.domainById(l.domain);
    var lvl = DSH.levelById(l.level);
    var done = store.isComplete(l.id);
    var saved = store.isBookmarked(l.id);
    return h('div', {
      class: 'lesson', onclick: function (e) {
        if (e.target.closest('button')) return;
        location.hash = '#/lesson/' + l.id;
      }
    }, [
      h('div', { class: 'idx', text: dom.icon }),
      h('div', {}, [
        h('h3', { text: pick(l.title) + (done ? '  ✓' : '') }),
        h('p', { text: pick(l.summary) }),
        h('div', { class: 'meta' }, [
          h('span', { class: 'badge', style: { color: dom.color }, text: pick(dom) }),
          h('span', { class: 'badge lvl-' + l.level, text: pick(lvl) }),
          h('span', { class: 'badge', text: t('lesson.minutes', { n: l.minutes }) })
        ])
      ]),
      h('div', { class: 'row tight' }, [
        h('button', {
          class: 'icon-btn', title: t('lesson.markDone'),
          text: done ? '✓' : '○',
          onclick: function () { store.toggleComplete(l.id); route(); }
        }),
        h('button', {
          class: 'icon-btn', title: t('lesson.save'),
          text: saved ? '★' : '☆',
          onclick: function () {
            var now = store.toggleBookmark(l.id);
            ui.toast(now ? t('lesson.saved') : t('bm.remove'));
            route();
          }
        })
      ])
    ]);
  }

  /* =========================================================== LESSON VIEW */
  function lessonPage(id) {
    var l = lessonById(id);
    if (!l) { location.hash = '#/lessons'; return; }
    store.set({ lastLesson: id });
    var idx = DSH.LESSONS.indexOf(l);
    var prev = DSH.LESSONS[idx - 1], next = DSH.LESSONS[idx + 1];
    var dom = DSH.domainById(l.domain);
    var done = store.isComplete(l.id), saved = store.isBookmarked(l.id);

    els.main.appendChild(h('div', { class: 'lesson-head' }, [
      h('div', { class: 'crumbs' }, [
        h('a', { href: '#/lessons', text: t('nav.lessons') }),
        h('span', { text: ' / ' }),
        h('a', { href: '#/lessons?domain=' + l.domain, text: pick(dom) })
      ]),
      h('h1', { text: pick(l.title) }),
      h('p', { class: 'lede', text: pick(l.summary) }),
      h('div', { class: 'row' }, [
        h('span', { class: 'badge', style: { color: dom.color }, text: pick(dom) }),
        h('span', { class: 'badge lvl-' + l.level, text: pick(DSH.levelById(l.level)) }),
        h('span', { class: 'badge', text: t('lesson.minutes', { n: l.minutes }) }),
        h('span', { class: 'badge', text: t('lesson.of', { i: idx + 1, n: DSH.LESSONS.length }) })
      ]),
      h('div', { class: 'row', style: { marginTop: '12px' } }, [
        h('button', {
          class: 'icon-btn' + (done ? ' primary' : ''),
          text: (done ? '✓ ' + t('lesson.done') : '○ ' + t('lesson.markDone')),
          onclick: function () { store.toggleComplete(l.id); route(); renderSidebar(); }
        }),
        h('button', {
          class: 'icon-btn', text: (saved ? '★ ' : '☆ ') + t('lesson.save'),
          onclick: function () { store.toggleBookmark(l.id); route(); }
        }),
        h('button', {
          class: 'icon-btn', text: '✏️ ' + t('quiz.title'),
          onclick: function () { location.hash = '#/quiz?domain=' + l.domain; }
        })
      ])
    ]));

    var body = h('section', { class: 'card' });
    (l.blocks || []).forEach(function (b) { body.appendChild(renderBlock(b)); });
    els.main.appendChild(body);

    var relatedLabs = (DSH.playgrounds || []).filter(function (pg) {
      return (pg.related || []).indexOf(l.id) >= 0;
    });
    if (relatedLabs.length) {
      els.main.appendChild(h('section', { class: 'card' }, [
        h('h3', { style: { marginTop: 0 }, text: t('lab.title') }),
        h('div', { class: 'row tight' }, relatedLabs.map(function (pg) {
          return h('button', { class: 'chip', text: '\u25b6 ' + t(pg.titleKey),
            onclick: function () { location.hash = '#/lab/' + pg.id; } });
        }))
      ]));
    }

    var relatedProjects = (DSH.PROJECTS || []).filter(function (pr) { return pr.domain === l.domain; });
    if (relatedProjects.length) {
      els.main.appendChild(h('section', { class: 'card' }, [
        h('h3', { style: { marginTop: 0 }, text: t('nav.projects') }),
        h('div', { class: 'row tight' }, relatedProjects.map(function (pr) {
          return h('button', { class: 'chip', text: '🛠️ ' + pick(pr.title).slice(0, 52),
            onclick: function () { location.hash = '#/project/' + pr.id; } });
        }))
      ]));
    }

    if ((l.tags || []).length) {
      els.main.appendChild(h('section', { class: 'card' }, [
        h('div', { class: 'tiny muted', style: { marginBottom: '6px' }, text: t('lesson.tags') }),
        h('div', { class: 'row tight' }, l.tags.map(function (tg) {
          return h('button', {
            class: 'chip', text: '#' + tg,
            onclick: function () { filters.tag = tg; filters.domain = 'all'; filters.q = ''; location.hash = '#/lessons'; render(); }
          });
        }))
      ]));
    }

    if ((l.resources || []).length) {
      var rl = h('ul', { class: 'res-list' });
      l.resources.forEach(function (r) {
        rl.appendChild(h('li', {}, [
          h('span', { class: 'kind', text: r.kind }),
          h('div', {}, [
            h('a', { href: r.url, target: '_blank', rel: 'noopener', text: r.title }),
            h('div', { class: 'tiny muted', text: r.url.replace(/^https?:\/\//, '').split('/')[0] })
          ]),
          h('button', {
            class: 'icon-btn', style: { marginInlineStart: 'auto' },
            text: store.hasResource('url:' + r.url) ? '★' : '☆',
            onclick: function () {
              store.toggleResource({ id: 'url:' + r.url, title: r.title, url: r.url, kind: r.kind });
              route();
            }
          })
        ]));
      });
      els.main.appendChild(h('section', { class: 'card' }, [
        h('h3', { style: { marginTop: 0 }, text: t('lesson.resources') }), rl
      ]));
    }

    var nav = h('div', { class: 'row', style: { marginTop: '16px' } }, [
      prev ? h('button', { class: 'icon-btn', text: '← ' + pick(prev.title).slice(0, 42),
        onclick: function () { location.hash = '#/lesson/' + prev.id; } }) : null,
      next ? h('button', { class: 'icon-btn primary', style: { marginInlineStart: 'auto' },
        text: pick(next.title).slice(0, 42) + ' →',
        onclick: function () { location.hash = '#/lesson/' + next.id; } }) : null
    ]);
    els.main.appendChild(nav);
  }

  function langText(b) { return (i18n.lang === 'fa' && b[2]) ? b[2] : (b[1] || ''); }

  function renderBlock(b) {
    var type = b[0];
    if (type === 'p') {
      return h('div', { class: 'block' }, [h('p', { text: langText(b) })]);
    }
    if (type === 'ul') {
      var items = (i18n.lang === 'fa' && b[2] && b[2].length ? b[2] : b[1]) || [];
      return h('div', { class: 'block' }, [h('ul', {}, items.map(function (it) { return h('li', { text: it }); }))]);
    }
    if (type === 'math') {
      return h('pre', { class: 'math', html: ui.typesetMath(i18n.lang === 'fa' && b[2] ? b[2] : b[1]) });
    }
    if (type === 'code') {
      var lang = b[2] || 'python';
      var isShell = lang === 'bash' || lang === 'shell' || lang === 'sh';
      var pre = h('pre', { html: ui.highlightCode(b[1], lang) });
      var copyBtn = h('button', {
        class: 'copy', type: 'button', text: t('ui.copy'),
        onclick: function () {
          function done() {
            copyBtn.textContent = t('ui.copied');
            copyBtn.classList.add('ok');
            ui.toast(t('ui.copied'));
            setTimeout(function () {
              copyBtn.textContent = t('ui.copy');
              copyBtn.classList.remove('ok');
            }, 1400);
          }
          try { navigator.clipboard.writeText(b[1]).then(done, done); }
          catch (e) { done(); }
        }
      });
      return h('div', { class: 'code' + (isShell ? ' shell' : '') }, [
        h('div', { class: 'bar' }, [
          isShell ? h('span', { class: 'dots' }) : null,
          h('span', { class: 'lang', text: lang }),
          copyBtn
        ]),
        pre
      ]);
    }
    if (type === 'note' || type === 'def') {
      var isDef = type === 'def';
      var faFirst = i18n.lang === 'fa';
      var enT = b[1] || '', faT = b[2] || b[1] || '';
      function part(cls, lang, text, label) {
        return h('div', { class: 'cl-part ' + cls, lang: lang, dir: lang === 'fa' ? 'rtl' : 'ltr' }, [
          h('span', { class: 'label', text: label }),
          h('div', { text: text })
        ]);
      }
      var pEn = part('en', 'en', enT, isDef ? 'Definition' : 'Note');
      var pFa = part('fa', 'fa', faT, isDef ? 'تعریف' : 'نکته');
      return h('div', { class: 'callout bilingual' + (isDef ? ' def' : '') },
        faFirst ? [pFa, pEn] : [pEn, pFa]);
    }
    return h('div');
  }

  /* ================================================================ PATHS */
  function pathsGrid() {
    var grid = h('div', { class: 'grid cols-2' });
    DSH.PATHS.forEach(function (p) {
      var done = p.lessons.filter(function (id) { return store.isComplete(id); }).length;
      grid.appendChild(h('div', {
        class: 'card', style: { cursor: 'pointer' },
        onclick: function () { location.hash = '#/path/' + p.id; }
      }, [
        h('div', { class: 'spread' }, [
          h('b', { text: pick(p.title) }),
          h('span', { class: 'badge lvl-' + p.level, text: pick(DSH.levelById(p.level)) })
        ]),
        h('p', { class: 'small muted', style: { margin: '6px 0 10px' }, text: pick(p.desc) }),
        h('div', { class: 'spread' }, [
          h('span', { class: 'tiny muted', text: t('path.progress', { done: done, total: p.lessons.length }) }),
          h('span', { class: 'tiny muted', text: done ? t('path.continue') : t('path.start') })
        ]),
        h('div', { class: 'bar', style: { marginTop: '8px' } },
          [h('i', { style: { width: (100 * done / p.lessons.length) + '%', background: 'var(--accent)' } })])
      ]));
    });
    return grid;
  }

  function pathsPage() {
    els.main.appendChild(h('h1', { text: t('nav.paths') }));
    els.main.appendChild(h('p', { class: 'lede', text: 'Guided sequences through the material. Progress is computed from the lessons you mark complete.' }));
    els.main.appendChild(pathsGrid());
  }

  function pathPage(id) {
    var p = null;
    DSH.PATHS.forEach(function (x) { if (x.id === id) p = x; });
    if (!p) { location.hash = '#/paths'; return; }
    var done = p.lessons.filter(function (i) { return store.isComplete(i); }).length;

    els.main.appendChild(h('div', { class: 'crumbs' }, [
      h('a', { href: '#/paths', text: t('nav.paths') }), h('span', { text: ' / ' }), h('span', { text: pick(p.title) })
    ]));
    els.main.appendChild(h('h1', { text: pick(p.title) }));
    els.main.appendChild(h('p', { class: 'lede', text: pick(p.desc) }));
    els.main.appendChild(h('div', { class: 'result-grid' }, [
      stat(done + ' / ' + p.lessons.length, t('dash.completed')),
      stat(ui.fmtPct(done / p.lessons.length), t('dash.title')),
      stat(String(p.lessons.reduce(function (a, i2) { var l = lessonById(i2); return a + (l ? l.minutes : 0); }, 0)), t('lesson.minutes', { n: '' }).trim() + ' (min)')
    ]));

    var steps = h('div', { class: 'card' });
    p.lessons.forEach(function (lid, i) {
      var l = lessonById(lid);
      if (!l) return;
      steps.appendChild(h('div', {
        class: 'path-step' + (store.isComplete(lid) ? ' done' : ''),
        onclick: function () { location.hash = '#/lesson/' + lid; }
      }, [
        h('div', { class: 'n', text: store.isComplete(lid) ? '✓' : String(i + 1) }),
        h('div', {}, [
          h('div', { text: pick(l.title) }),
          h('div', { class: 'tiny muted', text: pick(DSH.domainById(l.domain)) + ' · ' + pick(DSH.levelById(l.level)) + ' · ' + l.minutes + ' min' })
        ])
      ]));
    });
    els.main.appendChild(steps);
  }

  /* ================================================================= QUIZ */
  function quizPage() {
    var opts = { domain: 'all', level: 'all', count: 8, mode: 'mixed' };
    var m = /^#\/quiz\?domain=(\w[\w-]*)/.exec(location.hash || '');
    if (m) opts.domain = m[1];

    els.main.appendChild(h('h1', { text: t('quiz.title') }));
    els.main.appendChild(h('p', { class: 'lede', text: t('quiz.lede') }));

    var setup = h('div', { class: 'card' });
    els.main.appendChild(setup);
    var mountPoint = h('div', { style: { marginTop: '16px' } });
    els.main.appendChild(mountPoint);

    function drawSetup() {
      ui.clear(setup);
      var domSel = h('select', { onchange: function () { opts.domain = this.value; } });
      domSel.appendChild(h('option', { value: 'all', text: t('filter.all') }));
      DSH.DOMAINS.forEach(function (d) {
        var n = DSH.QUESTIONS.filter(function (q) { return q.domain === d.id; }).length;
        if (!n) return;
        domSel.appendChild(h('option', { value: d.id, text: pick(d) + ' (' + n + ')', selected: opts.domain === d.id }));
      });
      var lvlSel = h('select', { onchange: function () { opts.level = this.value; } });
      lvlSel.appendChild(h('option', { value: 'all', text: t('filter.all') }));
      DSH.LEVELS.forEach(function (l) {
        lvlSel.appendChild(h('option', { value: l.id, text: pick(l) }));
      });
      var cntSel = h('select', { onchange: function () { opts.count = parseInt(this.value, 10); } });
      [5, 8, 12, 20].forEach(function (n) {
        cntSel.appendChild(h('option', { value: n, text: String(n), selected: n === opts.count }));
      });
      var modeSel = h('select', { onchange: function () { opts.mode = this.value; } });
      modeSel.appendChild(h('option', { value: 'mixed', text: t('quiz.mixed') }));
      modeSel.appendChild(h('option', { value: 'new', text: t('quiz.new') }));
      modeSel.appendChild(h('option', { value: 'weak', text: t('quiz.weak') }));

      setup.appendChild(h('div', { class: 'filters' }, [
        h('label', { class: 'small muted', text: t('quiz.pickDomain') }), domSel,
        h('label', { class: 'small muted', text: t('quiz.pickLevel') }), lvlSel,
        h('label', { class: 'small muted', text: t('quiz.count') }), cntSel,
        modeSel,
        h('button', {
          class: 'icon-btn primary', text: t('quiz.start'),
          onclick: function () {
            ui.clear(setup);
            DSH.quiz.mount(mountPoint, opts, {
              onExit: function () { drawSetup(); ui.clear(mountPoint); },
              onFinish: function () { renderSidebar(); }
            });
            if (mountPoint.scrollIntoView) mountPoint.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        })
      ]));

      var st = store.stats(DSH.LESSONS);
      setup.appendChild(h('div', { class: 'result-grid', style: { marginTop: '12px' } }, [
        stat(String(st.answered), t('quiz.attempts')),
        stat(ui.fmtPct(st.accuracy), t('quiz.accuracy')),
        stat(String(st.quizzes), t('dash.quizzes'))
      ]));
    }
    drawSetup();
  }

  /* ================================================================== LAB */
  function labPage(id) {
    els.main.appendChild(h('h1', { text: t('lab.title') }));
    els.main.appendChild(h('p', { class: 'lede', text: t('lab.lede') }));

    var tabs = h('div', { class: 'filters', style: { marginBottom: '14px' } });
    els.main.appendChild(tabs);
    var stage = h('div');
    els.main.appendChild(stage);

    function show(pid) {
      var pg = null;
      DSH.playgrounds.forEach(function (p) { if (p.id === pid) pg = p; });
      if (!pg) pg = DSH.playgrounds[0];
      ui.clear(stage);
      Array.prototype.forEach.call(tabs.children, function (c) {
        c.classList.toggle('on', c.dataset.id === pg.id);
      });
      stage.appendChild(h('div', { class: 'card' }, [
        h('h3', { style: { marginTop: 0 }, text: t(pg.titleKey) }),
        h('p', { class: 'small muted', text: t(pg.descKey) }),
        h('div', { style: { marginTop: '10px' } }, [pg.build()])
      ]));
    }

    DSH.playgrounds.forEach(function (p) {
      tabs.appendChild(h('button', {
        class: 'chip', dataset: { id: p.id }, text: t(p.titleKey),
        onclick: function () { location.hash = '#/lab/' + p.id; }
      }));
    });
    show(id || DSH.playgrounds[0].id);
  }

  /* ================================================================ SAVED */
  function savedPage() {
    els.main.appendChild(h('h1', { text: t('bm.title') }));
    els.main.appendChild(h('p', { class: 'lede', text: t('bm.lede') }));

    var bm = Object.keys(store.state.bookmarks).map(function (id) {
      var l = lessonById(id);
      return l ? { l: l, ts: store.state.bookmarks[id] } : null;
    }).filter(Boolean).sort(function (a, b) { return b.ts - a.ts; });

    var list = h('div', { class: 'grid' });
    bm.forEach(function (o) { list.appendChild(lessonCard(o.l)); });
    els.main.appendChild(list);

    if (!bm.length && !store.state.savedResources.length) {
      els.main.appendChild(h('div', { class: 'empty' }, [
        h('span', { class: 'big', text: '🔖' }),
        h('p', { text: t('bm.empty') })
      ]));
    }

    els.main.appendChild(h('h2', { text: t('res.title') }));
    var rl = h('ul', { class: 'res-list' });
    store.state.savedResources.forEach(function (r) {
      rl.appendChild(resRow(r, true));
    });
    els.main.appendChild(h('div', { class: 'card' }, [rl]));

    var titleIn = h('input', { type: 'text', placeholder: t('bm.addPlaceholder'), style: { flex: '1 1 160px' } });
    var urlIn = h('input', { type: 'text', placeholder: t('bm.addUrl'), style: { flex: '2 1 220px' } });
    els.main.appendChild(h('div', { class: 'card' }, [
      h('h3', { style: { marginTop: 0 }, text: t('bm.addTitle') }),
      h('div', { class: 'row' }, [
        titleIn, urlIn,
        h('button', {
          class: 'icon-btn primary', text: t('bm.add'),
          onclick: function () {
            if (!titleIn.value.trim() || !urlIn.value.trim()) { ui.toast(t('bm.addPlaceholder')); return; }
            var url = urlIn.value.trim();
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            store.addResource({ title: titleIn.value.trim(), url: url, kind: 'custom' });
            titleIn.value = ''; urlIn.value = '';
            route();
          }
        })
      ])
    ]));
  }

  function resRow(r, removable) {
    return h('li', {}, [
      h('span', { class: 'kind', text: r.kind || 'link' }),
      h('div', {}, [
        h('a', { href: r.url, target: '_blank', rel: 'noopener', text: r.title }),
        r.note ? h('div', { class: 'small muted', text: pick(r.note) }) : null,
        h('div', { class: 'tiny muted', text: r.url.replace(/^https?:\/\//, '').split('/')[0] })
      ]),
      h('button', {
        class: 'icon-btn danger', style: { marginInlineStart: 'auto' },
        text: '✕', title: t('bm.remove'),
        onclick: function () { store.removeResource(r.id); route(); }
      })
    ]);
  }

  /* ============================================================ RESOURCES */
  function resourcesPage() {
    var fkind = 'all', fdom = 'all', fq = '';
    els.main.appendChild(h('h1', { text: t('res.title') }));
    els.main.appendChild(h('p', { class: 'lede', text: t('res.lede') }));

    var bar = h('div', { class: 'filters' });
    var listWrap = h('div', { class: 'card' });
    els.main.appendChild(bar);
    els.main.appendChild(listWrap);

    var kindSel = h('select', { onchange: function () { fkind = this.value; draw(); } });
    ['all', 'book', 'course', 'doc', 'tool', 'dataset', 'video', 'paper'].forEach(function (k) {
      kindSel.appendChild(h('option', { value: k, text: k === 'all' ? t('filter.all') : k }));
    });
    var domSel = h('select', { onchange: function () { fdom = this.value; draw(); } });
    domSel.appendChild(h('option', { value: 'all', text: t('filter.all') }));
    DSH.DOMAINS.forEach(function (d) { domSel.appendChild(h('option', { value: d.id, text: pick(d) })); });
    var qIn = h('input', {
      type: 'search', placeholder: t('search.placeholder'),
      oninput: ui.debounce(function () { fq = this.value.toLowerCase(); draw(); }, 150)
    });
    var freeSel = h('select', { onchange: function () { window.__freeOnly = this.value === 'free'; draw(); } });
    freeSel.appendChild(h('option', { value: 'all', text: t('filter.all') }));
    freeSel.appendChild(h('option', { value: 'free', text: t('res.free') }));

    bar.appendChild(kindSel); bar.appendChild(domSel); bar.appendChild(freeSel); bar.appendChild(qIn);

    function draw() {
      ui.clear(listWrap);
      var rows = DSH.RESOURCES.filter(function (r) {
        if (fkind !== 'all' && r.kind !== fkind) return false;
        if (fdom !== 'all' && r.domain !== fdom) return false;
        if (root.__freeOnly && !r.free) return false;
        if (fq && (r.title.en + ' ' + r.title.fa + ' ' + (r.note ? r.note.en + r.note.fa : '')).toLowerCase().indexOf(fq) === -1) return false;
        return true;
      });
      var ul = h('ul', { class: 'res-list' });
      rows.forEach(function (r) {
        ul.appendChild(h('li', {}, [
          h('span', { class: 'kind', text: r.kind }),
          h('div', {}, [
            h('a', { href: r.url, target: '_blank', rel: 'noopener', text: pick(r.title) }),
            h('div', { class: 'small muted', text: pick(r.note) }),
            h('div', { class: 'tiny muted', text: pick(DSH.domainById(r.domain)) + ' · ' + (r.free ? t('res.free') : t('res.paid')) })
          ]),
          h('button', {
            class: 'icon-btn', style: { marginInlineStart: 'auto' },
            text: store.hasResource(r.id) ? '★' : '☆',
            onclick: function () { store.toggleResource(r); draw(); }
          })
        ]));
      });
      listWrap.appendChild(ul);
      if (!rows.length) listWrap.appendChild(h('div', { class: 'empty' }, [h('p', { text: t('search.empty') })]));
    }
    draw();
  }

  /* ============================================================= PROGRESS */
  function progressPage() {
    var st = store.stats(DSH.LESSONS);
    els.main.appendChild(h('h1', { text: t('dash.title') }));

    var ringWrap = h('div', { class: 'card ring-wrap' });
    ringWrap.appendChild(ring(st.pct, st.completed + ' / ' + st.total));
    ringWrap.appendChild(h('div', { style: { flex: '1 1 200px' } }, [
      h('div', { class: 'result-grid' }, [
        stat(String(st.completed), t('dash.completed')),
        stat(String(st.quizzes), t('dash.quizzes')),
        stat(ui.fmtPct(st.accuracy), t('dash.accuracy')),
        stat(String(st.streak), t('dash.streak')),
        stat(String(st.bookmarks + st.savedResources), t('dash.saved')),
        stat(st.projectsDone + ' / ' + st.projectCount, t('dash.projects'))
      ])
    ]));
    els.main.appendChild(ringWrap);

    els.main.appendChild(h('h2', { text: t('projects.title') }));
    els.main.appendChild(projectGrid('capstone'));

    els.main.appendChild(h('h2', { text: t('dash.byDomain') }));
    var byDom = h('div', { class: 'card' });
    DSH.DOMAINS.forEach(function (d) {
      var rec = st.byDomain[d.id];
      if (!rec) return;
      byDom.appendChild(h('div', { class: 'bar-row' }, [
        h('span', { class: 'name', text: d.icon + ' ' + pick(d) }),
        h('div', { class: 'bar' }, [h('i', { style: { width: (100 * rec.done / rec.total) + '%', background: d.color } })]),
        h('span', { class: 'val', text: rec.done + '/' + rec.total })
      ]));
    });
    els.main.appendChild(byDom);

    els.main.appendChild(h('h2', { text: t('dash.recent') }));
    var recent = store.recentCompleted(8);
    if (!recent.length) {
      els.main.appendChild(h('div', { class: 'card muted small', text: t('dash.empty') }));
    } else {
      var list = h('div', { class: 'grid' });
      recent.forEach(function (r) {
        var l = lessonById(r.id);
        if (l) list.appendChild(lessonCard(l));
      });
      els.main.appendChild(list);
    }

    els.main.appendChild(h('h2', { text: t('dash.history') }));
    var hist = h('div', { class: 'card' });
    if (!store.state.quiz.history.length) {
      hist.appendChild(h('p', { class: 'muted small', text: t('dash.empty') }));
    } else {
      store.state.quiz.history.slice(0, 12).forEach(function (hh) {
        hist.appendChild(h('div', { class: 'spread', style: { padding: '6px 0', borderBottom: '1px solid var(--border)' } }, [
          h('span', { class: 'small', text: pick(DSH.domainById(hh.domain)) + ' · ' + hh.mode }),
          h('span', { class: 'small mono', text: hh.score + '/' + hh.total + '  ' + ui.fmtPct(hh.score / hh.total) }),
          h('span', { class: 'tiny muted', text: ui.timeAgo(hh.ts, i18n.lang) })
        ]));
      });
    }
    els.main.appendChild(hist);

    els.main.appendChild(h('h2', { text: t('set.data') }));
    els.main.appendChild(h('div', { class: 'card row' }, [
      h('button', { class: 'icon-btn', text: t('dash.export'), onclick: function () {
        ui.download('dshub-progress.json', store.toJSON());
        ui.toast(t('dash.exported'));
      } }),
      h('label', { class: 'icon-btn', text: t('dash.import') }, [
        h('input', {
          type: 'file', accept: '.json', style: { display: 'none' },
          onchange: function () {
            var f = this.files && this.files[0];
            if (!f) return;
            var fr = new FileReader();
            fr.onload = function () {
              try { store.fromJSON(fr.result); ui.toast(t('dash.imported')); route(); }
              catch (e) { ui.toast('bad file'); }
            };
            fr.readAsText(f);
          }
        })
      ]),
      h('button', {
        class: 'icon-btn danger', text: t('dash.reset'),
        onclick: function () {
          ui.confirmDialog(t('dash.resetConfirm'), { danger: true }).then(function (ok) {
            if (ok) { store.reset(); buildShell(); route(); }
          });
        }
      })
    ]));
  }

  function ring(pct, label) {
    var box = svgNode('svg', { class: 'ring', viewBox: '0 0 100 100' });
    var r = 42, c = 2 * Math.PI * r;
    box.appendChild(svgNode('circle', { cx: 50, cy: 50, r: r, fill: 'none',
      stroke: 'var(--border)', 'stroke-width': 10 }));
    box.appendChild(svgNode('circle', { cx: 50, cy: 50, r: r, fill: 'none', stroke: 'var(--accent)',
      'stroke-width': 10, 'stroke-linecap': 'round',
      'stroke-dasharray': c + ' ' + c, 'stroke-dashoffset': String(c * (1 - pct)),
      transform: 'rotate(-90 50 50)' }));
    var txt = svgNode('text', { x: 50, y: 50, 'text-anchor': 'middle', dy: '0.35em',
      fill: 'var(--text)', 'font-size': '17', 'font-weight': '700' });
    txt.textContent = ui.fmtPct(pct);
    box.appendChild(txt);
    var sub = svgNode('text', { x: 50, y: 66, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': '8.5' });
    sub.textContent = label;
    box.appendChild(sub);
    return box;
  }
  function svgNode(tag, attrs) {
    var el = doc.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  /* ============================================================= SETTINGS */
  function settingsPage() {
    els.main.appendChild(h('h1', { text: t('set.title') }));

    els.main.appendChild(h('div', { class: 'card' }, [
      h('h3', { style: { marginTop: 0 }, text: t('set.language') }),
      h('div', { class: 'row' }, [
        h('button', { class: 'icon-btn' + (i18n.lang === 'en' ? ' primary' : ''), text: 'English',
          onclick: function () { applyLang('en'); buildShell(); route(); } }),
        h('button', { class: 'icon-btn' + (i18n.lang === 'fa' ? ' primary' : ''), text: 'فارسی',
          onclick: function () { applyLang('fa'); buildShell(); route(); } })
      ])
    ]));

    els.main.appendChild(h('div', { class: 'card' }, [
      h('h3', { style: { marginTop: 0 }, text: t('set.theme') }),
      h('div', { class: 'row' }, [
        h('button', { class: 'icon-btn' + (store.state.theme === 'light' ? ' primary' : ''), text: '☀️ ' + t('set.theme.light'),
          onclick: function () { applyTheme('light'); route(); } }),
        h('button', { class: 'icon-btn' + (store.state.theme === 'dark' ? ' primary' : ''), text: '🌙 ' + t('set.theme.dark'),
          onclick: function () { applyTheme('dark'); route(); } })
      ])
    ]));

    els.main.appendChild(h('div', { class: 'card' }, [
      h('h3', { style: { marginTop: 0 }, text: t('set.about') }),
      h('p', { class: 'small muted', text: t('set.aboutNote') }),
      h('p', { class: 'small muted', html: '<b>' + DSH.LESSONS.length + '</b> lessons · <b>' +
        DSH.QUESTIONS.length + '</b> questions · <b>' + DSH.RESOURCES.length + '</b> resources · <b>' +
        DSH.PATHS.length + '</b> paths · <b>' + DSH.PROJECTS.length + '</b> projects' })
    ]));

    els.main.appendChild(h('div', { class: 'card' }, [
      h('h3', { style: { marginTop: 0 }, text: t('set.data') }),
      h('p', { class: 'small muted', text: t('set.dataNote') }),
      h('div', { class: 'row' }, [
        h('button', { class: 'icon-btn', text: t('dash.export'), onclick: function () {
          ui.download('dshub-progress.json', store.toJSON());
        } }),
        h('button', { class: 'icon-btn danger', text: t('dash.reset'), onclick: function () {
          ui.confirmDialog(t('dash.resetConfirm'), { danger: true }).then(function (ok) {
            if (ok) { store.reset(); buildShell(); route(); }
          });
        } })
      ])
    ]));
  }

  /* ==================================================================== go */
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();

  DSH.app = { route: route, filters: function () { return filters; } };
})(typeof window !== 'undefined' ? window : globalThis);
