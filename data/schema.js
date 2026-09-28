/* =====================================================================
   schema.js — shared vocabulary + tiny authoring helpers
   Loaded first. Defines: window.DSH (namespace), DOMAINS, LEVELS,
   and the L() / R() helpers used by every lesson file.
   No build step, no dependencies, works from file:// too.
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH || (root.DSH = {});

  /* ---------------------------------------------------------------
     Domains (filter axis #1)
     id, en label, fa label, emoji, accent colour, short blurb
     --------------------------------------------------------------- */
  DSH.DOMAINS = [
    { id: 'linear-algebra', en: 'Linear Algebra', fa: 'جبر خطی', icon: '🔢', color: '#6366f1',
      blurb: { en: 'Vectors, matrices, decompositions — the grammar of every model.',
               fa: 'بردارها، ماتریس‌ها و تجزیه‌ها — دستور زبان همه‌ی مدل‌ها.' } },
    { id: 'calculus', en: 'Calculus & Optimization', fa: 'حسابان و بهینه‌سازی', icon: '📈', color: '#0ea5e9',
      blurb: { en: 'Derivatives, gradients, convexity and the algorithms that minimize loss.',
               fa: 'مشتق، گرادیان، تحدب و الگوریتم‌هایی که تابع هزینه را کمینه می‌کنند.' } },
    { id: 'probability', en: 'Probability', fa: 'احتمال', icon: '🎲', color: '#8b5cf6',
      blurb: { en: 'Uncertainty, distributions, Bayes and information theory.',
               fa: 'عدم‌قطعیت، توزیع‌ها، بیز و نظریه‌ی اطلاعات.' } },
    { id: 'statistics', en: 'Statistics & Causal Inference', fa: 'آمار و استنتاج علّی', icon: '📊', color: '#14b8a6',
      blurb: { en: 'Estimation, testing, resampling and asking "does X cause Y?".',
               fa: 'برآورد، آزمون فرض، بازنمونه‌گیری و پرسشِ «آیا X عامل Y است؟». ' } },
    { id: 'programming', en: 'Python & Data Engineering', fa: 'پایتون و مهندسی داده', icon: '🐍', color: '#f59e0b',
      blurb: { en: 'NumPy, Pandas/Polars, SQL, pipelines and the plumbing nobody warns you about.',
               fa: 'نام‌پای، پانداز/پولارز، SQL، خطوط لوله و لوله‌کشی‌ای که کسی از قبل نمی‌گوید.' } },
    { id: 'ml', en: 'Classical Machine Learning', fa: 'یادگیری ماشین کلاسیک', icon: '🤖', color: '#22c55e',
      blurb: { en: 'Regression, trees, ensembles, clustering, tuning and honest evaluation.',
               fa: 'رگرسیون، درخت‌ها، ترکیب‌ها، خوشه‌بندی، تنظیم و ارزیابیِ صادقانه.' } },
    { id: 'dl', en: 'Deep Learning', fa: 'یادگیری عمیق', icon: '🧠', color: '#ec4899',
      blurb: { en: 'Backprop, CNN/RNN/GNN, transformers and the training recipe book.',
               fa: 'پس‌انتشار، CNN/RNN/GNN، ترنسفورمرها و کتابچه‌ی دستور پخت آموزش.' } },
    { id: 'genai', en: 'Generative AI & LLMs', fa: 'هوش مصنوعی مولد و مدل‌های زبانی', icon: '✨', color: '#a855f7',
      blurb: { en: 'Diffusion, transformers at scale, RAG, agents, fine-tuning and eval.',
               fa: 'دیفیوژن، ترنسفورمر در مقیاس بزرگ، RAG، ایجنت‌ها، تنظیم ظریف و ارزیابی.' } },
    { id: 'ops', en: 'MLOps & Production', fa: 'ام‌ال‌اوپی‌اس و استقرار', icon: '🚀', color: '#ef4444',
      blurb: { en: 'Tracking, packaging, serving, monitoring, drift, cost and on-call reality.',
               fa: 'ردیابی، بسته‌بندی، سروینگ، پایش، انحراف داده، هزینه و واقعیتِ آن‌کال.' } },
    { id: 'responsible', en: 'Interpretability, Ethics & Security', fa: 'تفسیرپذیری، اخلاق و امنیت', icon: '🛡️', color: '#64748b',
      blurb: { en: 'SHAP, fairness, privacy, adversarial robustness and governance.',
               fa: 'شپ، عدالت، حریم خصوصی، مقاومتِ adversarial و حاکمیت.' } },
    { id: 'practice', en: 'Workflow, Experiments & Career', fa: 'گردش‌کار، آزمایش و مسیر شغلی', icon: '🧭', color: '#eab308',
      blurb: { en: 'A/B tests, storytelling, projects, interviews and the day-to-day craft.',
               fa: 'تست A/B، داستان‌گویی، پروژه، مصاحبه و مهارتِ روزمره.' } }
  ];

  /* ---------------------------------------------------------------
     Difficulty levels (filter axis #2)
     --------------------------------------------------------------- */
  DSH.LEVELS = [
    { id: 'beginner',     en: 'Beginner',     fa: 'مبتدی',    weight: 1, color: '#22c55e' },
    { id: 'intermediate', en: 'Intermediate', fa: 'متوسط',    weight: 2, color: '#f59e0b' },
    { id: 'advanced',     en: 'Advanced',     fa: 'پیشرفته',  weight: 3, color: '#ef4444' }
  ];

  /* ---------------------------------------------------------------
     Block helpers (kept tiny so lesson data stays readable)
        ['p',    en, fa]                 paragraph
        ['ul',   [en items], [fa items]] bullet list
        ['math', en, fa]                 displayed formula (unicode maths)
        ['code', code]                   code sample (lang defaults python)
        ['note', en, fa]                 callout
        ['def',  en, fa]                 key definition box
     --------------------------------------------------------------- */
  function p(en, fa) { return ['p', en, fa]; }
  function ul(en, fa) { return ['ul', en, fa]; }
  function math(en, fa) { return ['math', en || '', fa || en || '']; }
  function code(src, lang) { return ['code', src, lang || 'python']; }
  function note(en, fa) { return ['note', en, fa]; }
  function def(en, fa) { return ['def', en, fa]; }
  DSH.B = { p: p, ul: ul, math: math, code: code, note: note, def: def };

  /* ---------------------------------------------------------------
     L() — define a lesson
       L(id, domain, level, minutes, title[en,fa], summary[en,fa],
         blocks, tags, resources[])
     resources: R(title, url, kind)  kind: book|course|doc|paper|video|tool|dataset
     --------------------------------------------------------------- */
  DSH.LESSONS = [];
  DSH.L = function (id, domain, level, minutes, title, summary, blocks, tags, resources) {
    DSH.LESSONS.push({
      id: id,
      domain: domain,
      level: level,
      minutes: minutes,
      title: { en: title[0], fa: title[1] },
      summary: { en: summary[0], fa: summary[1] },
      blocks: blocks || [],
      tags: tags || [],
      resources: resources || []
    });
  };

  DSH.R = function (title, url, kind) {
    return { title: title, url: url, kind: kind || 'doc' };
  };

  /* ---------------------------------------------------------------
     Q() — define a quiz / exercise item
       kind: 'mcq' | 'msq' | 'num' | 'text'
       Q(id, domain, level, kind, prompt[en,fa], payload, explain[en,fa], tags)
         mcq : options[[en,fa],...], answer = index
         msq : options[[en,fa],...], answer = [indices]
         num : { gen: fn -> {text:{en,fa}, answer, tol, unit} } OR {text, answer, tol}
         text: { text:{en,fa}, answers: [accepted strings] }
     --------------------------------------------------------------- */
  DSH.QUESTIONS = [];
  DSH.Q = function (id, domain, level, kind, prompt, payload, explain, tags) {
    DSH.QUESTIONS.push({
      id: id, domain: domain, level: level, kind: kind,
      prompt: { en: prompt[0], fa: prompt[1] },
      payload: payload || {},
      explain: { en: explain ? explain[0] : '', fa: explain ? explain[1] : '' },
      tags: tags || []
    });
  };

  /* ---------------------------------------------------------------
     Learning paths
     --------------------------------------------------------------- */
  DSH.PATHS = [];
  DSH.PATH = function (id, title, desc, level, lessons) {
    DSH.PATHS.push({
      id: id,
      title: { en: title[0], fa: title[1] },
      desc: { en: desc[0], fa: desc[1] },
      level: level,
      lessons: lessons
    });
  };

  /* ---------------------------------------------------------------
     Projects  (guided, step-by-step builds)

     PJ(id, domain, level, hours, title, pitch, dataset, steps,
        deliverables, rubric, tags, resources)

       dataset      {en, fa, url}
       step         {title:{en,fa}, body:{en,fa}, code?:[src, lang],
                     hint?:{en,fa}, check?:{en,fa}}
       deliverables {en:[...], fa:[...]}
       rubric       [{en, fa}]   — "definition of done" checks
       kind         'domain' | 'capstone'
     --------------------------------------------------------------- */
  DSH.PROJECTS = [];
  DSH.PJ = function (id, kind, domain, level, hours, title, pitch, dataset, steps, deliverables, rubric, tags, resources) {
    DSH.PROJECTS.push({
      id: id, kind: kind, domain: domain, level: level, hours: hours,
      title: { en: title[0], fa: title[1] },
      pitch: { en: pitch[0], fa: pitch[1] },
      dataset: { en: dataset[0], fa: dataset[1], url: dataset[2] },
      steps: (steps || []).map(function (s) {
        return {
          title: { en: s.title[0], fa: s.title[1] },
          body: { en: s.body[0], fa: s.body[1] },
          code: s.code || null,
          hint: s.hint ? { en: s.hint[0], fa: s.hint[1] } : null,
          check: s.check ? { en: s.check[0], fa: s.check[1] } : null
        };
      }),
      deliverables: {
        en: (deliverables || []).map(function (d) { return Array.isArray(d) ? d[0] : d; }),
        fa: (deliverables || []).map(function (d) { return Array.isArray(d) ? d[1] : d; })
      },
      rubric: (rubric || []).map(function (r) { return { en: r[0], fa: r[1] }; }),
      tags: tags || [],
      resources: resources || []
    });
  };
  DSH.projectById = function (id) {
    for (var i = 0; i < DSH.PROJECTS.length; i++) if (DSH.PROJECTS[i].id === id) return DSH.PROJECTS[i];
    return null;
  };

  DSH.domainById = function (id) {
    for (var i = 0; i < DSH.DOMAINS.length; i++) if (DSH.DOMAINS[i].id === id) return DSH.DOMAINS[i];
    return { id: id, en: id, fa: id, icon: '📘', color: '#64748b', blurb: { en: '', fa: '' } };
  };
  DSH.levelById = function (id) {
    for (var i = 0; i < DSH.LEVELS.length; i++) if (DSH.LEVELS[i].id === id) return DSH.LEVELS[i];
    return { id: id, en: id, fa: id, weight: 1, color: '#64748b' };
  };

})(typeof window !== 'undefined' ? window : globalThis);
