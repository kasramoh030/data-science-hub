/* =====================================================================
   updates.js — changelog, so the hub can visibly stay up to date
   U(date, version, title{en,fa}, items[{en,fa}])
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH || (root.DSH = {});
  DSH.UPDATES = [];

  function U(date, version, title, items) {
    DSH.UPDATES.unshift({ date: date, version: version, title: title, items: items });
  }

  U('2026-09-28', '1.0.0',
    ['First complete release', 'نخستین انتشارِ کامل'],
    [
      ['94 bilingual lessons across 11 domains: linear algebra, calculus & optimisation, probability, statistics & causality, Python/data engineering, classical ML, deep learning, LLMs & GenAI, MLOps, responsible AI, and professional practice.',
       '۹۴ درسِ دوزبانه در ۱۱ حوزه: جبر خطی، حسابان و بهینه‌سازی، احتمال، آمار و علّیّت، پایتون/مهندسی داده، یادگیری ماشینِ کلاسیک، یادگیری عمیق، مدل‌های زبانی و هوش مصنوعی مولد، MLOps، هوش مصنوعیِ مسئولانه و عملِ حرفه‌ای.'],
      ['83 auto-graded exercises: multiple choice, multi-select, numeric drills with randomly generated numbers, and short answers — every one with a written explanation.',
       '۸۳ تمرین با تصحیحِ خودکار: چندگزینه‌ای، چندانتخابی، تمرین‌های عددی با تولیدِ اعدادِ تصادفی و پاسخ کوتاه — هر کدام با توضیحِ نوشتاری.'],
      ['Five interactive playgrounds: matrix transformations, gradient descent, the central limit theorem, a metric/cost calculator and k-means.',
       'پنج ابزارِ تعاملی: تبدیل‌های ماتریسی، گرادیانِ نزولی، قضیه‌ی حدِ مرکزی، ماشین‌حسابِ معیار/هزینه و k-means.'],
      ['Progress tracking, bookmarks for lessons and resources, full-text search with domain/level/status filters, seven guided learning paths, light/dark themes and full RTL.',
       'ردیابیِ پیشرفت، نشان‌گذاریِ درس‌ها و منابع، جست‌وجوی متنِ کامل با فیلترِ حوزه/سطح/وضعیت، هفت مسیرِ یادگیریِ هدایت‌شده، پوسته‌ی روشن/تیره و RTL کامل.'],
      ['53 curated resources: free books, courses, documentation, tools, datasets and security frameworks.',
       '۵۳ منبعِ منتخب: کتاب‌ها، دوره‌ها، مستندات، ابزارها، مجموعه‌داده‌ها و چارچوب‌های امنیتیِ رایگان.']
    ]);

  U('2026-09-28', '1.3.0',
    ['Four new lab widgets', 'چهار ابزارکِ جدید در آزمایشگاه'],
    [
      ['Added four interactive statistics widgets to the lab: a power and sample-size explorer with the null and alternative distributions side by side, a bootstrap-versus-permutation workbench on skewed samples, a regression-diagnostics canvas where one draggable point moves the slope and Cook distance, and a peeking simulator that shows naive looks pushing the false-positive rate from 5% to about 14% while Pocock and O\'Brien-Fleming boundaries hold it.',
       'چهار ابزارکِ تعاملیِ آماری به آزمایشگاه افزوده شد: کاوش‌گرِ توان و اندازه‌ی نمونه با توزیع‌های فرضِ صفر و مقابل در کنار هم، یک میزکارِ بوت‌استرپ در برابر جایگشت روی نمونه‌های چوله، یک بومِ تشخیصِ رگرسیون که در آن یک نقطه‌ی قابل‌کشیدن شیب و فاصله‌ی کاک را جابه‌جا می‌کند، و یک شبیه‌سازِ نگاهِ دزدکی که نشان می‌دهد نگاه‌های ساده‌لوحانه نرخِ مثبتِ کاذب را از ۵٪ به حدود ۱۴٪ می‌رسانند در حالی که مرزهای پوکاک و اوبراین-فلمینگ آن را نگه می‌دارند.'],
      ['Lessons now link to the playgrounds that illustrate them, so theory and the widget you can drag are one click apart.',
       'درس‌ها حالا به ابزارک‌هایی پیوند دارند که آن‌ها را نشان می‌دهند، پس فاصله‌ی نظریه و ابزارکی که می‌توان کشید تنها یک کلیک است.'],
      ['All nine widgets are dependency-free canvas and SVG, work offline, and keep the bilingual labels of the rest of the app.',
       'هر نه ابزارک با کَنواس و SVG بدون وابستگی ساخته شده‌اند، آفلاین کار می‌کنند و برچسب‌های دوزبانه‌ی بقیه‌ی برنامه را دارند.']
    ]);

  U('2026-09-28', '1.2.0',
    ['The full statistical methods catalogue', 'فهرستِ کاملِ روش‌های آماری'],
    [
      ['Added 18 new statistics lessons (27 in that domain now): choosing the right method, parametric tests with their assumptions, nonparametric and resampling methods, effect sizes and power, linear-model inference with robust and clustered errors, GLMs, categorical data, mixed models, survival analysis, time series, multivariate methods, smoothing and GAMs, model comparison, robust and quantile regression, survey weighting and missing data, extreme values, meta-analysis and sequential designs.',
       '۱۸ درسِ آماریِ جدید افزوده شد (اکنون ۲۷ درس در این حوزه): انتخابِ روشِ درست، آزمون‌های پارامتری با فرض‌هایشان، روش‌های ناپارامتری و بازنمونه‌گیری، اندازه‌ی اثر و توان، استنتاجِ مدلِ خطی با خطاهای مقاوم و خوشه‌ای، GLMها، داده‌ی رده‌ای، مدل‌های آمیخته، تحلیلِ بقا، سری‌های زمانی، روش‌های چندمتغیره، هموارسازی و GAMها، مقایسه‌ی مدل، رگرسیونِ مقاوم و چارکی، وزن‌دهیِ پیمایشی و داده‌ی گمشده، مقادیرِ فرین، فراتحلیل و طرح‌های پیاپی.'],
      ['Every lesson keeps the house style: a decision list you can act on, the formulas in plain text, runnable Python, and a note on the mistake people actually make with the method.',
       'هر درس همان سبکِ خانه را دارد: فهرستی از تصمیم‌ها که می‌توان اجرا کرد، فرمول‌ها در متنِ ساده، پایتونِ قابل‌اجرا، و یادداشتی درباره‌ی اشتباهی که مردم واقعاً با آن روش می‌کنند.'],
      ['18 new quiz questions on the new material (101 total), and the statistics deep-dive, foundations and analyst paths were extended to include the methods.',
       '۱۸ پرسشِ جدید برای مطالبِ جدید (در مجموع ۱۰۱)، و مسیرهای تعمیقِ آمار، مبانی و تحلیل‌گری به این روش‌ها گسترش یافت.']
    ]);

  U('2026-09-28', '1.1.0',
    ['Projects section: 18 guided builds', 'بخشِ پروژه‌ها: ۱۸ ساختِ هدایت‌شده'],
    [
      ['Added a projects section with a checklist, collapsible hints and a definition-of-done rubric for every build: 11 domain projects (one per topic) and 7 capstones ordered from easiest to hardest.',
       'بخشِ پروژه‌ها افزوده شد با چک‌لیست، راهنمایی‌های بازشو و یک تعریفِ «تمام‌شده» برای هر ساخت: ۱۱ پروژه‌ی حوزه‌ای (یکی برای هر موضوع) و ۷ پروژه‌ی جامع از آسان‌ترین به سخت‌ترین.'],
      ['Capstones cover the end-to-end systems companies ask about: churn-to-campaign, demand forecasting and inventory, experiment design with CUPED, fraud under extreme imbalance, grounded RAG with evals and guardrails, real-time ranking with a feature store, and a production LLM agent with bounded loops and safety.',
       'پروژه‌های جامع سیستم‌های end-to-end ای را می‌پوشانند که شرکت‌ها درباره‌شان می‌پرسند: از ریزش تا کمپین، پیش‌بینیِ تقاضا و موجودی، طراحیِ آزمایش با CUPED، تقلب در نامتوازنیِ شدید، RAG مستند با ارزیابی و محافظ‌ها، رتبه‌بندیِ بی‌درنگ با فروشگاهِ ویژگی، و یک ایجنتِ تولیدیِ مدل زبانی با حلقه‌های کران‌دار و ایمنی.'],
      ['Project progress (steps and completion) is tracked locally and shown on the dashboard; every lesson now links to the projects in its domain.',
       'پیشرفتِ پروژه‌ها (گام‌ها و اتمام) به‌صورت محلی ردیابی و در داشبورد نمایش داده می‌شود؛ هر درس حالا به پروژه‌های حوزه‌ی خود پیوند دارد.']
    ]);

  U('2026-09-28', '0.9.0',
    ['Curriculum expansion', 'گسترشِ برنامه‌ی درسی'],
    [
      ['Added the GenAI and agent layer: tokens and sampling, scaling laws and Chinchilla, prompting and structured output, RAG with chunking and reranking, SFT/LoRA/DPO, tool use, evaluation and guardrails, quantisation and speculative decoding, multimodal models.',
       'لایه‌ی هوش مصنوعی مولد و ایجنت‌ها افزوده شد: توکن‌ها و نمونه‌برداری، قوانینِ مقیاس و Chinchilla، فراخوان‌نویسی و خروجیِ ساختارمند، RAG با قطعه‌بندی و بازرتبه‌بندی، SFT/LoRA/DPO، استفاده از ابزار، ارزیابی و محافظ‌ها، کوانتیزاسیون و رمزگشاییِ حدسی، مدل‌های چندوجهی.'],
      ['Added MLOps: experiment tracking, packaging, deployment topologies, drift monitoring, CI/CD and testing, feature stores with point-in-time correctness, model registry and governance, cost and capacity.',
       'بخشِ MLOps افزوده شد: ردیابیِ آزمایش، بسته‌بندی، الگوهای استقرار، پایشِ انحراف، CI/CD و آزمون، فروشگاه‌های ویژگی با درستیِ نقطه‌در-زمان، ثبت‌گاه و حاکمیتِ مدل، هزینه و ظرفیت.'],
      ['Added responsible AI: interpretability, fairness, differential privacy and federated learning, adversarial robustness, OOD detection and conformal prediction, plus impact assessment and oversight.',
       'بخشِ هوش مصنوعیِ مسئولانه افزوده شد: تفسیرپذیری، عدالت، حریمِ تفاضلی و یادگیریِ فدرال، مقاومتِ خصمانه، تشخیصِ خارج‌از-توزیع و پیش‌بینیِ همدیس، به‌همراه ارزیابیِ اثر و نظارت.']
    ]);

  U('2026-09-27', '0.5.0',
    ['Foundations', 'مبانی'],
    [
      ['Linear algebra, calculus and probability written the way data scientists use them: as maps, as optimisation, as uncertainty — with code that runs.',
       'جبر خطی، حسابان و احتمال به شکلی که دانشمندانِ داده استفاده می‌کنند: همچون نگاشت، بهینه‌سازی و عدم‌قطعیت — با کدی که اجرا می‌شود.'],
      ['Statistics and causal inference: MLE, confidence and credible intervals, testing, multiple comparisons, Bayesian workflow and the back-door/front-door logic of causal claims.',
       'آمار و استنتاجِ علّی: درست‌نماییِ بیشینه، فواصلِ اطمینان و معتبر، آزمون‌گری، مقایسه‌های چندگانه، گردش‌کارِ بیزی و منطقِ درِ پشتی/درِ جلوییِ ادعاهای علّی.']
    ]);

})(typeof window !== 'undefined' ? window : globalThis);
