/* =====================================================================
   extras.js — curated resources (bookmarkable) + guided learning paths
   RES(title_en, title_fa, url, kind, domain, level, note_en, note_fa)
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH;

  DSH.RESOURCES = [];
  function RES(en, fa, url, kind, domain, level, nen, nfa, free) {
    DSH.RESOURCES.push({ id: 'res-' + DSH.RESOURCES.length,
      title: { en: en, fa: fa }, url: url, kind: kind, domain: domain,
      level: level, note: { en: nen, fa: nfa }, free: free !== false });
  }

  /* ---------------- books ---------------- */
  RES('Mathematics for Machine Learning (Deisenroth et al.)', 'ریاضیات برای یادگیری ماشین',
    'https://mml-book.github.io/', 'book', 'linear-algebra', 'intermediate',
    'Free PDF. Linear algebra, calculus, probability in one coherent ML-flavoured book.',
    'پی‌دی‌افِ رایگان. جبر خطی، حسابان و احتمال در یک کتابِ یکپارچه با رویکردِ یادگیری ماشین.', true);
  RES('Linear Algebra Done Right (Axler)', 'جبر خطی به روشِ درست (اَکسْلر)',
    'https://link.springer.com/book/10.1007/978-3-031-41026-0', 'book', 'linear-algebra', 'intermediate',
    'Determinant-free, geometrically clear. The standard rigorous second course.',
    'بدون دترمینان و با وضوحِ هندسی. دوره‌ی دقیقِ استانداردِ دوم.', false);
  RES('An Introduction to Statistical Learning', 'درآمدی بر یادگیری آماری',
    'https://www.statlearning.com/', 'book', 'statistics', 'beginner',
    'Free PDF, R and Python versions. The single best first book on applied ML.',
    'پی‌دی‌افِ رایگان با نسخه‌های R و پایتون. بهترین کتابِ نخست در یادگیری ماشینِ کاربردی.', true);
  RES('The Elements of Statistical Learning', 'عناصرِ یادگیری آماری',
    'https://hastie.su.domains/ElemStatLearn/', 'book', 'ml', 'advanced',
    'Free PDF. The rigorous companion to ISL; dense but complete.',
    'پی‌دی‌افِ رایگان. همراهِ دقیقِ ISL؛ فشرده اما کامل.', true);
  RES('Pattern Recognition and Machine Learning (Bishop)', 'تشخیص الگو و یادگیری ماشین (بیشاپ)',
    'https://www.microsoft.com/en-us/research/people/cmbishop/prml/', 'book', 'ml', 'advanced',
    'The probabilistic view of ML. Excellent on graphical models and Bayesian methods.',
    'نگاهِ احتمالاتی به یادگیری ماشین. عالی در مدل‌های گرافی و روش‌های بیزی.', false);
  RES('Deep Learning (Goodfellow, Bengio, Courville)', 'یادگیری عمیق (گودفِلو و همکاران)',
    'https://www.deeplearningbook.org/', 'book', 'dl', 'intermediate',
    'Free online. Foundations: backprop, regularisation, convnets, sequence modelling.',
    'رایگان آنلاین. مبانی: پس‌انتشار، منظم‌سازی، شبکه‌های پیچشی، مدل‌سازیِ دنباله‌ای.', true);
  RES('Probabilistic Programming & Bayesian Methods for Hackers', 'برنامه‌نویسیِ احتمالاتی و روش‌های بیزی برای هکرها',
    'https://github.com/CamDavidsonPilon/Probabilistic-Programming-and-Bayesian-Methods-for-Hackers', 'book', 'statistics', 'intermediate',
    'Free, code-first Bayesian inference with PyMC. Very approachable.',
    'رایگان، استنتاجِ بیزیِ مبتنی بر کد با PyMC. بسیار قابل‌فهم.', true);
  RES("Causal Inference: The Mixtape", 'استنتاج علّی: میکس‌تیپ (کانینگهام)',
    'https://mixtape.scunning.com/', 'book', 'statistics', 'advanced',
    'Free. DAGs, potential outcomes, DiD, IV, RDD with code.',
    'رایگان. DAGها، پیامدهای بالقوه، DiD، IV، RDD همراه با کد.', true);
  RES('Forecasting: Principles and Practice', 'پیش‌بینی: اصول و عمل (هایدمن)',
    'https://otexts.com/fpp3/', 'book', 'ml', 'intermediate',
    'Free. The reference for time series forecasting in practice.',
    'رایگان. مرجعِ پیش‌بینیِ سری‌های زمانی در عمل.', true);
  RES('Interpretable Machine Learning (Molnar)', 'یادگیری ماشینِ تفسیرپذیر (مولنار)',
    'https://christophm.github.io/interpretable-ml-book/', 'book', 'responsible', 'intermediate',
    'Free. SHAP, LIME, counterfactuals, and the limits of explanation.',
    'رایگان. SHAP، LIME، پادواقعیت‌ها و محدودیت‌های توضیح.', true);
  RES('Fairness and Machine Learning (Barocas, Hardt, Narayanan)', 'عدالت و یادگیری ماشین',
    'https://fairmlbook.org/', 'book', 'responsible', 'advanced',
    'Free. The definitive text on fairness definitions and their trade-offs.',
    'رایگان. متنِ قطعی درباره‌ی تعاریفِ عدالت و بده‌بستان‌های آن‌ها.', true);
  RES('Designing Machine Learning Systems (Huyen)', 'طراحیِ سیستم‌های یادگیری ماشین (هوین)',
    'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/', 'book', 'ops', 'intermediate',
    'The practical bridge from notebook to production system.',
    'پلِ عملی از نوت‌بوک تا سیستمِ تولید.', false);
  RES('Trustworthy Online Controlled Experiments (Kohavi et al.)', 'آزمایش‌های کنترل‌شده‌ی آنلاینِ قابل‌اعتماد',
    'https://experimentguide.com/', 'book', 'practice', 'intermediate',
    'Everything about A/B testing: pitfalls, SRM, CUPED, guardrails.',
    'همه‌چیز درباره‌ی تستِ A/B: دام‌ها، SRM، CUPED، معیارهای محافظ.', false);
  RES('Hands-On Machine Learning (Géron)', 'یادگیری ماشینِ عملی (ژرون)',
    'https://github.com/ageron/handson-ml3', 'book', 'ml', 'beginner',
    'Code-first tour of classical ML and deep learning with scikit-learn and PyTorch.',
    'تورِ مبتنی بر کد در یادگیری ماشینِ کلاسیک و عمیق با scikit-learn و پای‌تورچ.', false);

  /* ---------------- courses ---------------- */
  RES('MIT 18.06 Linear Algebra (Strang)', 'ام‌آی‌تی ۱۸/۰۶ جبر خطی (استرانگ)',
    'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', 'course', 'linear-algebra', 'beginner',
    'Free video lectures. The classic introduction, still the best.',
    'درس‌گفتارهای ویدئوییِ رایگان. مقدمه‌ی کلاسیک که هنوز بهترین است.', true);
  RES('Stanford CS229 — Machine Learning', 'استنفورد CS229 — یادگیری ماشین',
    'https://cs229.stanford.edu/', 'course', 'ml', 'intermediate',
    'Free notes and videos. The maths-heavy canonical ML course.',
    'یادداشت‌ها و ویدئوهای رایگان. دوره‌ی مرجعِ ریاضی‌محورِ یادگیری ماشین.', true);
  RES('Stanford CS231n — Deep Learning for Vision', 'استنفورد CS231n — یادگیری عمیق برای بینایی',
    'https://cs231n.github.io/', 'course', 'dl', 'intermediate',
    'Free notes. Convolutional networks, detection, visualisation.',
    'یادداشت‌های رایگان. شبکه‌های پیچشی، تشخیص، مصورسازی.', true);
  RES('Fast.ai — Practical Deep Learning', 'فست‌دات‌اِی — یادگیری عمیقِ عملی',
    'https://course.fast.ai/', 'course', 'dl', 'beginner',
    'Free, top-down: you train real models in lesson one, theory follows.',
    'رایگان، از بالا به پایین: در درسِ اول مدلِ واقعی آموزش می‌دهید و نظریه بعد می‌آید.', true);
  RES('Statistical Rethinking (McElreath)', 'بازاندیشیِ آماری (مک‌الریث)',
    'https://xcelab.net/rm/statistical-rethinking/', 'course', 'statistics', 'intermediate',
    'Free lecture videos. Bayesian workflow with a focus on causal thinking.',
    'ویدئوهای رایگانِ درس. گردش‌کارِ بیزی با تمرکز بر تفکرِ علّی.', true);
  RES('Full Stack Deep Learning', 'یادگیری عمیقِ تمام‌پشته',
    'https://fullstackdeeplearning.com/', 'course', 'ops', 'intermediate',
    'Free. The missing course on shipping, monitoring and scaling models.',
    'رایگان. دوره‌ی گمشده درباره‌ی عرضه، پایش و مقیاس‌دهیِ مدل‌ها.', true);
  RES('Made With ML — MLOps', 'ساخته‌شده با ML — ام‌ال‌اوپی‌اس',
    'https://madewithml.com/', 'course', 'ops', 'intermediate',
    'Free, code-first MLOps: tracking, testing, serving, monitoring.',
    'رایگان و مبتنی بر کد: ردیابی، آزمون، سروینگ، پایش.', true);
  RES('3Blue1Brown — Essence of Linear Algebra', 'تری‌بلووان‌براون — جوهره‌ی جبر خطی',
    'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', 'video', 'linear-algebra', 'beginner',
    'The visual intuition that makes the algebra stick.',
    'شهودِ تصویری که باعث می‌شود جبر در ذهن بماند.', true);
  RES('Khan Academy — Statistics & Probability', 'آکادمیِ خان — آمار و احتمال',
    'https://www.khanacademy.org/math/statistics-probability', 'course', 'statistics', 'beginner',
    'Free, gentle, exhaustive practice problems.',
    'رایگان، ملایم، با تمرین‌های فراوان.', true);

  /* ---------------- docs / references ---------------- */
  RES('scikit-learn user guide', 'راهنمای کاربرِ scikit-learn',
    'https://scikit-learn.org/stable/user_guide.html', 'doc', 'ml', 'beginner',
    'The best-written documentation in ML; read the "Common pitfalls" page.',
    'بهترین مستنداتِ نوشته‌شده در یادگیری ماشین؛ صفحه‌ی «دام‌های رایج» را بخوانید.', true);
  RES('NumPy documentation', 'مستنداتِ نام‌پای',
    'https://numpy.org/doc/stable/', 'doc', 'programming', 'beginner',
    'Broadcasting rules and the 100-exercise repo are the fastest way to fluency.',
    'قواعدِ پخش‌سازی و مخزنِ تمرین‌های صدگانه سریع‌ترین راه برای تسلط است.', true);
  RES('pandas user guide', 'راهنمای کاربرِ پانداز',
    'https://pandas.pydata.org/docs/user_guide/', 'doc', 'programming', 'beginner',
    'Groupby, reshaping, time series — the sections you will use every day.',
    'گروه‌بندی، تغییر شکل، سری‌های زمانی — بخش‌هایی که هر روز استفاده می‌کنید.', true);
  RES('PyTorch tutorials', 'آموزش‌های پای‌تورچ',
    'https://pytorch.org/tutorials/', 'doc', 'dl', 'beginner',
    'Start with "What is torch.nn?" and the autograd mechanics notes.',
    'با «torch.nn چیست؟» و یادداشت‌های سازوکارِ autograd شروع کنید.', true);
  RES('Hugging Face — Transformers & Diffusers docs', 'مستنداتِ Hugging Face',
    'https://huggingface.co/docs', 'doc', 'genai', 'beginner',
    'Model hub, training, inference endpoints, datasets — the LLM home base.',
    'هابِ مدل، آموزش، نقطه‌های استنتاج، مجموعه‌داده‌ها — پایگاهِ اصلیِ مدل‌های زبانی.', true);
  RES('The Matrix Cookbook', 'کتاب آشپزیِ ماتریس',
    'https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf', 'doc', 'calculus', 'intermediate',
    'Every matrix derivative identity you will ever need, on one cheat sheet.',
    'هر اتحادِ مشتقِ ماتریسی که لازم دارید، در یک برگه‌ی تقلب.', true);
  RES('Convex Optimization (Boyd & Vandenberghe)', 'بهینه‌سازیِ محدب (بوید و فندنبرگ)',
    'https://web.stanford.edu/~boyd/cvxbook/', 'book', 'calculus', 'advanced',
    'Free PDF. Duality, KKT, and why your optimisation problem is tractable.',
    'پی‌دی‌افِ رایگان. دوگان، شرایطِ KKT و این‌که چرا مسئله‌ی بهینه‌سازی‌تان حل‌شدنی است.', true);
  RES('Use The Index, Luke', 'از نمایه استفاده کن، لوک',
    'https://use-the-index-luke.com/', 'doc', 'programming', 'intermediate',
    'Free. How SQL indexing and query plans actually work.',
    'رایگان. این‌که نمایه‌سازی و طرحِ پرس‌وجوی SQL واقعاً چگونه کار می‌کنند.', true);

  /* ---------------- tools ---------------- */
  RES('Polars', 'پولارز',
    'https://docs.pola.rs/', 'tool', 'programming', 'beginner',
    'Fast, lazy, parallel dataframe library — the modern pandas alternative.',
    'کتابخانه‌ی دیتافریمِ سریع، تنبل و موازی — جایگزینِ امروزیِ پانداز.', true);
  RES('DuckDB', 'داک‌دی‌بی',
    'https://duckdb.org/docs/', 'tool', 'programming', 'beginner',
    'In-process analytical SQL. Often faster than pandas and it fits in a laptop.',
    'SQL تحلیلیِ درون‌فرآیندی. اغلب سریع‌تر از پانداز و مناسبِ یک لپ‌تاپ.', true);
  RES('MLflow', 'ام‌ال‌فلو',
    'https://mlflow.org/docs/latest/', 'tool', 'ops', 'beginner',
    'Open-source experiment tracking, model registry and packaging.',
    'ردیابیِ آزمایش، ثبت‌گاهِ مدل و بسته‌بندیِ متن‌باز.', true);
  RES('Optuna', 'اوپتونا',
    'https://optuna.readthedocs.io/', 'tool', 'ml', 'intermediate',
    'Hyperparameter optimisation with pruning and a clean API.',
    'بهینه‌سازیِ ابرپارامترها با هرس‌کردن و رابطِ تمیز.', true);
  RES('Feast', 'فیست',
    'https://docs.feast.dev/', 'tool', 'ops', 'advanced',
    'Open-source feature store: offline/online parity and point-in-time joins.',
    'فروشگاهِ ویژگیِ متن‌باز: هم‌خوانیِ آفلاین/آنلاین و پیوندهای نقطه‌در-زمان.', true);
  RES('Evidently AI', 'اِویدِنتلی',
    'https://docs.evidentlyai.com/', 'tool', 'ops', 'intermediate',
    'Open-source dashboards and tests for data drift and model performance.',
    'داشبوردها و آزمون‌های متن‌باز برای انحرافِ داده و عملکردِ مدل.', true);
  RES('SHAP', 'شپ',
    'https://shap.readthedocs.io/', 'tool', 'responsible', 'intermediate',
    'Shapley-value explanations with fast exact algorithms for tree models.',
    'توضیحاتِ مبتنی بر مقدارِ شپلی با الگوریتم‌های دقیقِ سریع برای مدل‌های درختی.', true);
  RES('SHAP — read this first', 'شپ — این را اول بخوانید',
    'https://christophm.github.io/interpretable-ml-book/shap.html', 'doc', 'responsible', 'intermediate',
    'A careful, honest discussion of what SHAP does and does not mean.',
    'بحثی دقیق و صادقانه درباره‌ی این‌که SHAP چه می‌گوید و چه نمی‌گوید.', true);
  RES('imbalanced-learn', 'imbalanced-learn',
    'https://imbalanced-learn.org/', 'tool', 'ml', 'intermediate',
    'Resampling (SMOTE, etc.) as pipeline steps that respect cross-validation.',
    'بازنمونه‌گیری (SMOTE و غیره) به‌شکل گام‌های خطِ لوله که به اعتبارسنجیِ متقابل احترام می‌گذارند.', true);
  RES('Opacus', 'اوپاکوس',
    'https://opacus.ai/', 'tool', 'responsible', 'advanced',
    'Differential-privacy training for PyTorch with a privacy accountant.',
    'آموزشِ با حریمِ تفاضلی برای پای‌تورچ همراه با حسابگرِ حریم.', true);
  RES('vLLM', 'وی‌ال‌ال‌ام',
    'https://docs.vllm.ai/', 'tool', 'genai', 'advanced',
    'High-throughput LLM serving with paged attention and continuous batching.',
    'سروینگِ مدل زبانی با توانِ بالا با توجهِ صفحه‌بندی‌شده و بَچ‌بندیِ پیوسته.', true);
  RES('DoWhy / PyWhy', 'دووای / پای‌وای',
    'https://www.pywhy.org/dowhy/', 'tool', 'statistics', 'advanced',
    'Causal inference with explicit assumptions and automatic refutation tests.',
    'استنتاجِ علّی با فرض‌های صریح و آزمون‌های ردیه‌ی خودکار.', true);
  RES('Cookiecutter Data Science', 'کوکی‌کاترِ علمِ داده',
    'https://drivendata.github.io/cookiecutter-data-science/', 'tool', 'practice', 'beginner',
    'A sane, standard project layout that scales past one notebook.',
    'یک چیدمانِ پروژه‌ی معقول و استاندارد که از یک نوت‌بوک فراتر می‌رود.', true);

  /* ---------------- datasets & benchmarks ---------------- */
  RES('Hugging Face Datasets', 'مجموعه‌داده‌های Hugging Face',
    'https://huggingface.co/datasets', 'dataset', 'programming', 'beginner',
    'Thousands of datasets, and FineWeb for LLM pretraining data.',
    'هزاران مجموعه‌داده، و FineWeb برای داده‌ی پیش‌آموزشِ مدل‌های زبانی.', true);
  RES('UCI Machine Learning Repository', 'مخزنِ یادگیری ماشینِ UCI',
    'https://archive.ics.uci.edu/', 'dataset', 'ml', 'beginner',
    'Classic small tabular datasets for practice and benchmarking.',
    'مجموعه‌داده‌های جدولیِ کوچکِ کلاسیک برای تمرین و محک‌زنی.', true);
  RES('MTEB leaderboard', 'جدولِ رده‌بندیِ MTEB',
    'https://huggingface.co/spaces/mteb/leaderboard', 'tool', 'genai', 'intermediate',
    'Compare embedding models on retrieval, clustering and classification tasks.',
    'مقایسه‌ی مدل‌های embedding روی وظایفِ بازیابی، خوشه‌بندی و دسته‌بندی.', true);
  RES('Papers with Code', 'مقالات همراه با کد',
    'https://paperswithcode.com/', 'dataset', 'dl', 'beginner',
    'State-of-the-art tables with implementations attached.',
    'جدول‌های بهترین نتایج به‌همراهِ پیاده‌سازی‌ها.', true);

  /* ---------------- communities & reading ---------------- */
  RES('Distill.pub', 'دیستیل',
    'https://distill.pub/', 'doc', 'dl', 'intermediate',
    'Interactive, beautifully explained ML research. Great for intuition.',
    'پژوهشِ یادگیری ماشینِ تعاملی و زیبا توضیح‌داده‌شده. عالی برای شهود.', true);
  RES('The Batch (DeepLearning.AI)', 'د بَچ',
    'https://www.deeplearning.ai/the-batch/', 'doc', 'genai', 'beginner',
    'Weekly, readable summary of what actually mattered in AI.',
    'خلاصه‌ی هفتگی و خواندنی از آنچه در هوش مصنوعی واقعاً مهم بوده است.', true);
  RES('Import AI (Jack Clark)', 'ایمپورت اِی‌آی',
    'https://importai.substack.com/', 'doc', 'genai', 'intermediate',
    'Sharp weekly newsletter on AI research and policy.',
    'خبرنامه‌ی هفتگیِ تیزبین درباره‌ی پژوهش و سیاستِ هوش مصنوعی.', true);
  RES('OWASP Top 10 for LLM Applications', 'ده موردِ برترِ OWASP برای برنامه‌های مدل زبانی',
    'https://owasp.org/www-project-top-10-for-large-language-model-applications/', 'doc', 'responsible', 'intermediate',
    'The security checklist every LLM app should be measured against.',
    'چک‌لیستِ امنیتی‌ای که هر برنامه‌ی مدل زبانی باید با آن سنجیده شود.', true);
  RES('NIST AI Risk Management Framework', 'چارچوبِ مدیریتِ ریسکِ هوش مصنوعیِ NIST',
    'https://www.nist.gov/itl/ai-risk-management-framework', 'doc', 'responsible', 'intermediate',
    'A practical structure for governing AI risk in organisations.',
    'ساختاری عملی برای حاکمیتِ ریسکِ هوش مصنوعی در سازمان‌ها.', true);

  /* ================================================================
     Learning paths (ordered lesson ids)
     ================================================================ */
  var P = DSH.PATH;

  P('path-foundations',
    ['Mathematical Foundations (8 weeks)', 'مبانیِ ریاضی (۸ هفته)'],
    ['The maths every data scientist actually uses: linear algebra for data, calculus for optimisation, probability and statistics for uncertainty.',
     'ریاضیاتی که هر دانشمند داده واقعاً استفاده می‌کند: جبر خطی برای داده، حسابان برای بهینه‌سازی، احتمال و آمار برای عدم‌قطعیت.'],
    'beginner',
    ['la-001', 'la-002', 'la-003', 'calc-001', 'calc-002', 'prob-001', 'prob-002',
     'la-004', 'la-005', 'calc-003', 'prob-004', 'stat-001',
     'la-006', 'la-008', 'calc-004', 'prob-005', 'stat-003', 'stat-005', 'stat-009',
     'stat-010', 'stat-011', 'stat-012']);

  P('path-analyst',
    ['Data Analyst / Data Scientist Track', 'مسیرِ تحلیل‌گرِ داده / دانشمندِ داده'],
    ['From Python and SQL to honest analysis, dashboards and an experiment that changes a decision.',
     'از پایتون و SQL تا تحلیلِ صادقانه، داشبورد و آزمایشی که یک تصمیم را تغییر می‌دهد.'],
    'beginner',
    ['prog-001', 'prog-003', 'prog-005', 'stat-001', 'prog-006', 'prog-004',
     'stat-010', 'stat-011', 'stat-005', 'stat-013', 'stat-014', 'stat-016',
     'ml-001', 'ml-004', 'ml-002', 'prac-001', 'prac-002', 'prac-003',
     'stat-008', 'prog-008', 'ml-006']);

  P('path-mle',
    ['Machine Learning Engineer Track', 'مسیرِ مهندسِ یادگیری ماشین'],
    ['Model, evaluate, ship and keep alive: the full loop for tabular and classical ML in production.',
     'مدل‌سازی، ارزیابی، عرضه و زنده نگه‌داشتن: حلقه‌ی کامل برای یادگیری ماشینِ کلاسیک در تولید.'],
    'intermediate',
    ['ml-001', 'ml-004', 'ml-002', 'prog-007', 'ml-005', 'ml-006', 'ml-007',
     'prog-004', 'ml-011', 'ml-013', 'ops-001', 'ops-002', 'ops-003', 'ops-004',
     'ops-005', 'ops-006', 'ops-007', 'resp-001']);

  P('path-dl',
    ['Deep Learning Track', 'مسیرِ یادگیری عمیق'],
    ['From a NumPy MLP to transformers, diffusion and the training recipe that makes them behave.',
     'از یک MLP در نام‌پای تا ترنسفورمرها، دیفیوژن و دستور پختی که آن‌ها را رام می‌کند.'],
    'intermediate',
    ['dl-001', 'ml-003', 'dl-002', 'dl-003', 'dl-004', 'dl-005', 'dl-006',
     'dl-007', 'dl-008', 'dl-010', 'dl-009', 'dl-011', 'prog-002']);

  P('path-llm',
    ['LLM & GenAI Engineer Track', 'مسیرِ مهندسِ مدل‌های زبانی و هوش مصنوعی مولد'],
    ['Build, ground, evaluate and serve LLM applications: RAG, agents, fine-tuning, guardrails and cost.',
     'ساخت، زمینه‌مندسازی، ارزیابی و سروینگِ برنامه‌های مدل زبانی: RAG، ایجنت‌ها، تنظیمِ ظریف، محافظ‌ها و هزینه.'],
    'intermediate',
    ['dl-008', 'genai-001', 'genai-003', 'genai-004', 'genai-005', 'genai-006',
     'genai-007', 'genai-008', 'genai-009', 'genai-002', 'dl-009', 'resp-004', 'ops-008']);

  P('path-responsible',
    ['Responsible & Reliable ML Track', 'مسیرِ یادگیری ماشینِ مسئولانه و قابل‌اعتماد'],
    ['Interpretability, fairness, privacy, security, robustness and the governance practice around them.',
     'تفسیرپذیری، عدالت، حریمِ خصوصی، امنیت، مقاومت و عملِ حاکمیت پیرامونِ آن‌ها.'],
    'advanced',
    ['resp-001', 'resp-002', 'resp-003', 'resp-004', 'resp-005', 'resp-006',
     'stat-008', 'stat-006', 'ops-007', 'ml-004']);

  P('path-scientist',
    ['Statistics & Experimentation Deep Dive', 'تعمیق در آمار و آزمایشگری'],
    ['Estimation, testing, causality and the experiment design that makes results trustworthy.',
     'برآورد، آزمون، علّیّت و طراحیِ آزمایشی که نتایج را قابل‌اعتماد می‌کند.'],
    'advanced',
    ['stat-002', 'stat-003', 'stat-004', 'stat-005', 'stat-010', 'stat-011',
     'stat-012', 'stat-013', 'stat-014', 'stat-015', 'stat-016', 'stat-006',
     'stat-007', 'stat-008', 'stat-009', 'stat-017', 'stat-018', 'stat-019',
     'stat-020', 'stat-021', 'stat-022', 'stat-023', 'stat-024', 'stat-025',
     'stat-026', 'stat-027', 'prob-004', 'prob-006', 'prac-001', 'ml-012']);

})(typeof window !== 'undefined' ? window : globalThis);
