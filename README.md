# 📐 Data Science Hub

**A complete, bilingual (English / فارسی), offline-first study hub for data scientists.**
No build step, no dependencies, no tracking — just open `index.html`.

112 lessons · 101 interactive questions · 18 guided projects (140 steps) · 53 curated resources · 7 learning paths · 9 interactive playgrounds · ~28 hours of reading and ~196 hours of building.

---

## ✨ What's inside

| | |
|---|---|
| **Complete curriculum** | 11 domains: linear algebra, calculus & optimisation, probability, statistics & causality, Python/data engineering, classical ML, deep learning, LLMs & GenAI, MLOps, responsible AI, and professional practice |
| **Bilingual EN / فارسی** | Every lesson, question, explanation and menu item exists in both languages, with a one-tap switcher and full RTL support |
| **Interactive exercises** | MCQ, multi-select, numeric drills (with **randomly generated numbers**, so you get a fresh problem every attempt) and short-answer questions, all auto-graded with written explanations |
| **Visual lab** | 9 browser widgets: matrix transforms, gradient descent, the CLT, metric economics, k-means, power & sample-size explorer, bootstrap vs permutation, regression diagnostics with Cook's distance, and a peeking / sequential-test simulator |
| **Progress tracking** | Mark lessons complete, per-domain completion bars, quiz accuracy, day streak, recently completed, export/import JSON |
| **Search & filters** | Full-text search across every lesson, filter by domain, difficulty level and status (not started / completed / saved) |
| **Bookmarks** | Save lessons, and save or add your own resources for later review |
| **Statistics coverage** | 27 lessons: choosing a method, t/ANOVA/chi-square with their assumptions, ranks & resampling, effect sizes & power, OLS inference with robust & clustered errors, GLMs, categorical data, mixed models, survival, time series, multivariate, smoothing & GAMs, model comparison, robust & quantile regression, survey weighting & missing data, extreme values, meta-analysis, sequential designs |
| **Guided paths** | Seven curated sequences: foundations, analyst, ML engineer, deep learning, LLM engineer, responsible AI, statistics & experimentation |
| **Projects** | 11 domain projects (one per topic) + 7 capstones ordered easiest → hardest, each with a step-by-step checklist, collapsible hints, checkpoints, a "definition of done" rubric and progress tracking |
| **Mobile-first** | Bottom tab bar, drawer filters, horizontally scrollable code, safe-area padding, light/dark themes |

Everything is stored in `localStorage` — nothing is uploaded anywhere.

---

## 🚀 Run it

```bash
# any static server
python3 -m http.server 8080
# then open http://localhost:8080
```

Or just double-click `index.html` — it works from `file://` too.

---

## 📁 Layout

```
index.html                 single page shell (all views are rendered by JS)
assets/css/styles.css      design tokens, light/dark, RTL via logical properties
data/schema.js             domain + level registry, block helpers, L()/Q()/R()/PATH()
data/lessons-*.js          94 bilingual lessons (10 files)
data/quizzes.js            83 questions: mcq | msq | num (+ generators) | text
data/lessons-11-statistical-methods.js   18 lessons: the applied statistical methods catalogue
data/extras.js             53 curated resources + 7 learning paths
data/projects-0*.js        18 guided projects (11 domain + 7 capstone), 140 steps
js/i18n.js                 EN/FA UI strings and the t()/pick() helpers
js/store.js                localStorage state: progress, bookmarks, quiz history, streak
js/ui.js                   DOM helpers, syntax highlighter, search index, toasts
js/quiz.js                 quiz engine (set building, grading, scoring)
js/playgrounds.js          the five interactive widgets (SVG/Canvas)
js/app.js                  router + all views
tools/validate.js          node tools/validate.js  — integrity checks for the content
tools/push.sh              one-command GitHub repo creation + Pages deploy
```

### Content format

A lesson is a plain array of blocks, so adding one is a copy-paste job:

```js
L('la-010', 'linear-algebra', 'beginner', 12,
  ['Title in English', 'عنوان به فارسی'],
  ['One-sentence summary.', 'خلاصه‌ی یک‌خطی.'],
  [
    def('Definition text…', 'متن تعریف…'),
    math('A = U S V^T'),                    // rendered in a monospace block
    p('Prose…', 'نثر…'),
    ul(['point a', 'point b'], ['نکته الف', 'نکته ب']),
    code('import numpy as np\n...', 'python'),
    note('Practical gotcha…', 'نکته‌ی کاربردی…')
  ],
  ['svd', 'pca'],
  [R('3Blue1Brown — Essence of linear algebra', 'https://…', 'video')]
);
```

## 🛠️ Projects

Each project is a build with a checklist you tick off, hints you reveal when stuck,
a checkpoint per step and a rubric at the end. Progress is saved locally.

**Domain projects** (one per topic, a weekend each): SVD image compression & PCA ·
autodiff engine with SGD/momentum/Adam · Monte Carlo engine (VaR, queues, power) ·
causal inference study · reproducible Parquet/DuckDB pipeline with CI · tabular ML
done properly (leakage audit → calibration → cost threshold) · training recipe for a
vision/text model · semantic search with an eval harness · ship the model
(API → container → CI/CD → drift) · fairness & explainability audit · the portfolio project.

**Capstones** (end-to-end systems, easiest first):

1. Customer churn — from raw tables to a measured campaign
2. Demand forecasting — and the inventory decision it drives
3. Running an experiment end to end — power, SRM, CUPED, guardrails
4. Fraud detection — extreme imbalance, delayed labels, feedback loops
5. Grounded RAG assistant — citations, evals, guardrails, cost
6. Real-time ranking system — candidates, LTR, feature store, A/B
7. Production LLM agent — tools, tracing, evals, safety, cost

Adding one:

```js
PJ('pj-xyz', 'domain', 'ml', 'intermediate', 6,
   ['Title EN', 'عنوان FA'],
   ['Pitch EN', 'معرفی FA'],
   ['Dataset EN', 'داده FA', 'https://…'],
   [{ title: [EN, FA], body: [EN, FA], code: ['…', 'python'],
      hint: [EN, FA], check: [EN, FA] }, …],
   [[deliverable EN, deliverable FA], …],
   [[rubric EN, rubric FA], …],
   ['tag'], [R('…', 'https://…', 'doc')]);
```

---

A question:

```js
Q('q-la-02', 'linear-algebra', 'beginner', 'num',
  ['Compute (Ax)₁ …', 'حساب کنید (Ax)₁ …'],
  { gen: () => ({ text: { en: '…', fa: '…' }, answer: 42, tol: 0 }) },
  ['Explanation…', 'توضیح…'],
  ['matrix-multiplication']
);
```

---

## 🌍 Publish to GitHub Pages

Easiest path, one command (needs [gh](https://cli.github.com) once):

```bash
gh auth login
./tools/push.sh <your-username> data-science-hub public
# live at https://<your-username>.github.io/data-science-hub/
```

No `gh`? Create an empty repo on github.com, then:

```bash
git remote add origin git@github.com:<user>/data-science-hub.git
git push -u origin main
```

Then go to **Settings → Pages → Source: GitHub Actions**. The included
`.github/workflows/pages.yml` validates the content and deploys on every push
to `main`.

---

## 🔧 Development

```bash
node tools/validate.js     # data integrity: ids, bilingual completeness, generators, projects
```

Adding content is the intended workflow for keeping it up to date: drop a new
`L(...)` into the right `data/lessons-*.js`, add a `Q(...)` to `data/quizzes.js`,
add a `RES(...)` link to `data/extras.js`, and reference it in a path. Nothing
else needs to change — the counts and sidebar update themselves.

---

## 📄 License

Content is free to read, share and adapt for learning. Attribution to the
linked sources (books, courses, docs) is recommended — they are the real
references behind most of this material.
