/* =====================================================================
   projects-02-domains.js
   One guided project per domain — applied half:
   dl, genai, ops, responsible, practice
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, PJ = DSH.PJ, R = DSH.R;

  /* =================================================================
     7. DEEP LEARNING — training recipe on a real model
     ================================================================= */
  PJ('pj-dl', 'domain', 'dl', 'intermediate', 10,
    ['Train a Vision or Text Model and Own the Recipe',
     'آموزشِ یک مدلِ بینایی یا متنی و تسلط بر دستور پخت'],
    ['Fine-tune a pretrained model on a real dataset and document every ingredient of the recipe: initialisation and normalisation, augmentation, learning-rate schedule, regularisation, mixed precision, and the debugging steps you took when it did not converge. The artefact that matters is the logbook, not the accuracy.',
     'یک مدلِ پیش‌آموزش‌دیده را روی یک مجموعه‌داده‌ی واقعی تنظیمِ ظریف کنید و هر جزءِ دستور پخت را مستند کنید: مقداردهی و نرمال‌سازی، افزونشِ داده، زمان‌بندِ نرخِ یادگیری، منظم‌سازی، دقتِ ترکیبی، و گام‌های اشکال‌زدایی وقتی همگرا نشد. خروجیِ مهم، دفترچه‌ی ثبت است نه دقت.'],
    ['Oxford Pets / Food-101 for vision, or AG News / IMDB for text — pick one, ~30k examples is plenty',
     'برای بینایی Oxford Pets یا Food-101، یا برای متن AG News یا IMDB — یکی را برگزینید؛ حدود ۳۰ هزار نمونه کافی است',
     'https://huggingface.co/datasets/ag_news'],
    [
      { title: ['Establish the loop in one epoch', 'برقراریِ حلقه در یک دوره'],
        body: ['Get a minimal loop running: a pretrained backbone, a fresh head, one epoch, and loss printed every N steps. Overfit a single batch of 32 examples on purpose — if the loss cannot go to ~0 on 32 examples, the model or the loss is broken and more data will not help.',
                'یک حلقه‌ی کمینه راه بیندازید: یک ستونِ فقراتِ پیش‌آموزش‌دیده، یک سرِ تازه، یک دوره، و چاپِ هزینه هر N گام. عمداً روی یک بَچِ ۳۲تایی بیش‌برازش کنید — اگر هزینه روی ۳۲ نمونه به حدود صفر نرسد، مدل یا هزینه خراب است و داده‌ی بیشتر کمکی نمی‌کند.'],
        code: ["import torch, torch.nn as nn\nfrom torchvision import models\n\nmodel = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)\nmodel.fc = nn.Linear(model.fc.in_features, num_classes)   # fresh head for your classes\n\nopt   = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-2)\nlossf = nn.CrossEntropyLoss(label_smoothing=0.1)\n\n# sanity check: overfit ONE batch\nxb, yb = next(iter(train_loader))\nfor step in range(200):\n    loss = lossf(model(xb), yb)\n    opt.zero_grad(); loss.backward(); opt.step()\nprint('single-batch loss after 200 steps:', loss.item())   # should approach ~0",
               'python'],
        check: ['The single-batch overfit test drives the loss near zero.',
                'آزمونِ بیش‌برازشِ تک‌بَچ، هزینه را نزدیکِ صفر می‌برد.'] },

      { title: ['Data pipeline and augmentation that matches the task', 'خطِ لوله‌ی داده و افزونشی متناسب با وظیفه'],
        body: ['Write the transforms once, in a place shared by training and evaluation, and make sure the evaluation transform is deterministic. For vision, choose flips/crops/colour jitter that preserve the label (no vertical flips for digit recognition). For text, decide on truncation length from the real token-length distribution, not from a round number.',
                'تبدیل‌ها را یک‌بار و در جایی مشترک بین آموزش و ارزیابی بنویسید و مطمئن شوید تبدیلِ ارزیابی قطعی است. برای بینایی، چرخش/برش/نویزِ رنگی را برگزینید که برچسب را حفظ کند (برای تشخیصِ رقم، چرخشِ عمودی ممنوع). برای متن، طولِ برش را از توزیعِ واقعیِ طولِ توکن تعیین کنید، نه از یک عددِ گرد.'],
        code: ["from torchvision import transforms\n\ntrain_tf = transforms.Compose([\n    transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),\n    transforms.RandomHorizontalFlip(),\n    transforms.ColorJitter(0.2, 0.2, 0.2, 0.05),\n    transforms.ToTensor(),\n    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])\n\neval_tf = transforms.Compose([\n    transforms.Resize(256), transforms.CenterCrop(224), transforms.ToTensor(),\n    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])   # deterministic",
               'python'],
        check: ['A transform module used by both loops, with the eval path deterministic.',
                'یک ماژولِ تبدیل که هر دو حلقه استفاده می‌کنند، با مسیرِ ارزیابیِ قطعی.'] },

      { title: ['Learning rate: find it, then schedule it', 'نرخِ یادگیری: یافتن، سپس زمان‌بندی'],
        body: ['Run a short LR range test (increase the LR exponentially for a few hundred steps and plot loss) and pick the largest stable value. Add warmup for a few hundred steps and cosine decay to ~1% of peak. Log the schedule you chose and why.',
                'یک آزمونِ کوتاهِ بازه‌ی نرخِ یادگیری اجرا کنید (نرخ را برای چندصد گام به‌صورت نمایی بالا ببرید و هزینه را رسم کنید) و بزرگ‌ترین مقدارِ پایدار را برگزینید. برای چندصد گام گرم‌کردن و کاهشِ کسینوسی تا حدود ۱٪ قلّه بیفزایید. زمان‌بندیِ انتخابی و دلیلش را ثبت کنید.'],
        code: ["def lr_range_test(model, loader, lossf, lo=1e-6, hi=1.0, steps=300):\n    mult = (hi / lo) ** (1 / steps)\n    lr, lrs, losses = lo, [], []\n    opt = torch.optim.AdamW(model.parameters(), lr=lr)\n    for i, (xb, yb) in enumerate(loader):\n        if i >= steps: break\n        for g in opt.param_groups: g['lr'] = lr\n        loss = lossf(model(xb), yb)\n        opt.zero_grad(); loss.backward(); opt.step()\n        lrs.append(lr); losses.append(loss.item()); lr *= mult\n    return lrs, losses      # pick the LR just before the loss starts to explode",
               'python'],
        hint: ['Pick the LR about one order of magnitude below the point where the loss starts climbing — the steepest-descent point is usually too aggressive for a full run.',
               'نرخی حدود یک مرتبه‌ی بزرگی پایین‌تر از نقطه‌ای برگزینید که هزینه شروع به بالا رفتن می‌کند — نقطه‌ی تندترین نزول معمولاً برای یک اجرای کامل بیش از حد تهاجمی است.'],
        check: ['An LR-range plot with your chosen peak marked, plus warmup + cosine in the loop.',
                'نمودارِ بازه‌ی نرخِ یادگیری با علامتِ قلّه‌ی انتخابی، به‌علاوه‌ی گرم‌کردن و کسینوسی در حلقه.'] },

      { title: ['Regularisation, and how to tell it is working', 'منظم‌سازی، و اینکه چطور بفهمید دارد کار می‌کند'],
        body: ['Add weight decay, dropout/stochastic depth, label smoothing and augmentation strength one at a time, measuring the train-validation gap after each. Keep a table. Regularisation is not a bag of tricks; it is a set of knobs with measurable effects on the generalisation gap.',
                'کاهشِ وزن، دراپ‌اوت/عمقِ تصادفی، هموارسازیِ برچسب و قدرتِ افزونش را یکی‌یکی بیفزایید و پس از هر کدام شکافِ آموزش-اعتبارسنجی را اندازه بگیرید. جدولی نگه دارید. منظم‌سازی کیسه‌ای از ترفندها نیست؛ مجموعه‌ای از پیچ‌های تنظیم با اثراتِ قابل‌اندازه‌گیری بر شکافِ تعمیم است.'],
        hint: ['Change one thing at a time and keep a table. If you enable three regularisers at once you will never know which one paid for itself.',
               'هر بار یک چیز را تغییر دهید و جدول نگه دارید. اگر سه منظم‌ساز را همزمان فعال کنید، هرگز نخواهید فهمید کدام‌یک هزینه‌ی خود را درآورده است.'],
        check: ['A table: technique on/off → train loss, val loss, gap.',
                'جدولی: روشن/خاموش بودنِ تکنیک → هزینه‌ی آموزش، هزینه‌ی اعتبارسنجی، شکاف.'] },

      { title: ['Speed: mixed precision, channels-last, compile', 'سرعت: دقتِ ترکیبی، کانال‌آخر، کامپایل'],
        body: ['Turn on torch.autocast with a GradScaler, try channels_last memory format, and try torch.compile. Measure throughput (images/second) and peak memory for each and report the combination you ship.',
                'torch.autocast را با یک GradScaler روشن کنید، قالبِ حافظه‌ی channels_last را امتحان کنید و torch.compile را بیازمایید. توان (تصویر بر ثانیه) و حافظه‌ی بیشینه را برای هر کدام اندازه بگیرید و ترکیبی را که عرضه می‌کنید گزارش کنید.'],
        code: ["scaler = torch.amp.GradScaler('cuda', enabled=True)\nfor xb, yb in train_loader:\n    with torch.amp.autocast('cuda', dtype=torch.bfloat16):\n        loss = lossf(model(xb), yb)\n    scaler.scale(loss).backward()\n    scaler.step(opt); scaler.update(); opt.zero_grad(set_to_none=True)",
               'python'],
        check: ['A throughput table with memory, and a stated speed-up.',
                'جدولِ توان با حافظه، و یک عددِ سرعت‌گیریِ بیان‌شده.'] },

      { title: ['Debug the failure modes on purpose', 'عمداً شکست‌ها را اشکال‌زدایی کنید'],
        body: ['Break your own training on purpose and learn the fingerprints: too-high LR (loss spikes, then NaN), bad initialisation (loss stuck), a mislabelled class (loss plateau), a bug in the eval transform (great train, terrible val). Write the fingerprint next to the fix — this table is what makes you fast later.',
                'عمداً آموزش را بشکنید و اثرانگشت‌ها را یاد بگیرید: نرخِ یادگیریِ زیادی بالا (جهشِ هزینه، سپس NaN)، مقداردهیِ بد (هزینه گیر می‌کند)، کلاسِ اشتباه‌برچسب (فلات شدنِ هزینه)، باگ در تبدیلِ ارزیابی (آموزش عالی، اعتبارسنجی افتضاح). اثرانگشت را کنارِ راه‌حل بنویسید — این جدول همان چیزی است که بعداً شما را سریع می‌کند.'],
        check: ['A failure-mode table with at least four entries and their signatures.',
                'جدولِ شیوه‌های شکست با دست‌کم چهار مدخل و نشانه‌هایشان.'] },

      { title: ['Evaluate honestly and compare to a baseline', 'ارزیابیِ صادقانه و مقایسه با مبنا'],
        body: ['Report accuracy plus a per-class breakdown and a confusion matrix on the test set, touched once. Compare against (a) the frozen backbone with a linear head, (b) full fine-tuning, and (c) if applicable, a classical baseline (TF-IDF + linear model for text). State the compute you used for each.',
                'دقت را به‌همراه تفکیکِ هر کلاس و ماتریسِ درهم‌ریختگی روی مجموعه‌ی آزمون گزارش کنید، یک‌بار لمس‌شده. با (الف) ستونِ فقراتِ منجمد با سرِ خطی، (ب) تنظیمِ ظریفِ کامل، و (ج) اگر applicable است یک مبنای کلاسیک (TF-IDF + مدل خطی برای متن) مقایسه کنید. محاسباتِ مصرفی برای هر کدام را بیان کنید.'],
        hint: ['Compare against a frozen backbone with a linear head — it is often within a point of full fine-tuning at a fraction of the cost, and it is the honest first baseline.',
               'با ستونِ فقراتِ منجمد به‌همراه سرِ خطی مقایسه کنید — اغلب با کسری از هزینه، در یک واحدِ تنظیمِ ظریفِ کامل است، و صادقانه‌ترین مبنای نخست است.'],
        check: ['A comparison table with compute cost, and a confusion matrix you can read.',
                'جدولِ مقایسه با هزینه‌ی محاسباتی، و ماتریسِ درهم‌ریختگی‌ای که بتوانید بخوانید.'] },

      { title: ['Ship the artefact and the logbook', 'تحویلِ خروجی و دفترچه‌ی ثبت'],
        body: ['Save weights plus the exact preprocessing and class mapping, write a load-and-predict script that works on a fresh machine, and publish a logbook: what you tried, what worked, what you would try next with more compute.',
                'وزن‌ها را به‌همراه پیش‌پردازشِ دقیق و نگاشتِ کلاس‌ها ذخیره کنید، یک اسکریپتِ بارگیری-و-پیش‌بینی بنویسید که روی یک ماشینِ تازه کار کند، و یک دفترچه‌ی ثبت منتشر کنید: چه آزمودید، چه جواب داد، و با محاسباتِ بیشتر چه می‌آزمودید.'],
        check: ['A reproducible load-and-predict script and a logbook with the next three experiments.',
                'یک اسکریپتِ بارگیری-و-پیش‌بینیِ تکرارپذیر و دفترچه‌ای با سه آزمایشِ بعدی.'] }
    ],
    [
      ['A training script with the full recipe (LR schedule, regularisation, AMP) and a config file.',
       'یک اسکریپتِ آموزش با دستور پختِ کامل (زمان‌بندِ نرخِ یادگیری، منظم‌سازی، AMP) و یک فایلِ پیکربندی.'],
      ['The single-batch overfit test and the LR-range plot.',
       'آزمونِ بیش‌برازشِ تک‌بَچ و نمودارِ بازه‌ی نرخِ یادگیری.'],
      ['A regularisation ablation table and a throughput table.',
       'جدولِ حذفِ عاملیِ منظم‌سازی و جدولِ توان.'],
      ['A failure-mode fingerprint table.',
       'جدولِ اثرانگشتِ شیوه‌های شکست.'],
      ['Saved weights, a load-and-predict script, and the logbook.',
       'وزن‌های ذخیره‌شده، اسکریپتِ بارگیری-و-پیش‌بینی، و دفترچه‌ی ثبت.']
    ],
    [
      ['The single-batch overfit test passes before full training.',
       'آزمونِ بیش‌برازشِ تک‌بَچ پیش از آموزشِ کامل می‌گذرد.'],
      ['The learning rate was chosen from a range test, not copied.',
       'نرخِ یادگیری از یک آزمونِ بازه انتخاب شده، نه کپی.'],
      ['Regularisation choices are backed by a measured train/validation gap.',
       'انتخاب‌های منظم‌سازی با شکافِ آموزش/اعتبارسنجیِ اندازه‌گیری‌شده پشتیبانی می‌شوند.'],
      ['The test set is touched once, at the end.',
       'مجموعه‌ی آزمون یک‌بار و در انتها لمس شده است.'],
      ['A fresh machine can reproduce a prediction from the saved artefact.',
       'یک ماشینِ تازه می‌تواند از خروجیِ ذخیره‌شده یک پیش‌بینی را بازتولید کند.']
    ],
    ['pytorch', 'fine-tuning', 'augmentation', 'mixed-precision'],
    [R('PyTorch tutorials', 'https://pytorch.org/tutorials/', 'doc'),
     R('A Recipe for Training Neural Networks (Karpathy)', 'https://karpathy.github.io/2019/04/25/recipe/', 'doc')]
  );

  /* =================================================================
     8. GENAI — semantic search + eval harness
     ================================================================= */
  PJ('pj-genai', 'domain', 'genai', 'intermediate', 8,
    ['Semantic Search with an Offline Evaluation Harness',
     'جست‌وجوی معنایی با یک چارچوبِ ارزیابیِ آفلاین'],
    ['Build retrieval over a real document corpus: chunking, embeddings, a vector index, hybrid search with BM25, and a reranker — then build the labelled set and metrics that tell you whether each change actually helped. Retrieval quality is measured, not vibed.',
     'بازیابی روی یک پیکره‌ی متنیِ واقعی بسازید: قطعه‌بندی، embeddingها، یک نمایه‌ی برداری، جست‌وجوی ترکیبی با BM25 و یک بازرتبه‌بند — سپس مجموعه‌ی برچسب‌خورده و معیارهایی بسازید که بگویند آیا هر تغییر واقعاً کمک کرده است. کیفیتِ بازیابی اندازه‌گیری می‌شود، نه با حس تخمین زده.'],
    ['Any document set you know well: your company wiki, a documentation site, or 5,000 abstracts from arXiv/papers',
     'هر مجموعه‌ی سندی که خوب می‌شناسید: ویکیِ شرکت‌تان، یک سایتِ مستندات، یا ۵۰۰۰ چکیده از arXiv',
     'https://huggingface.co/datasets/BeIR/scifact'],
    [
      { title: ['Collect the corpus and define queries', 'گردآوریِ پیکره و تعریفِ پرس‌وجوها'],
        body: ['Assemble 500-5,000 documents and write 40-60 queries with a note on which document should be the top result for each. This labelled set is the single most valuable artefact in the project; build it before you build anything else.',
                '۵۰۰ تا ۵۰۰۰ سند گردآورید و ۴۰ تا ۶۰ پرس‌وجو بنویسید با یادداشتی که کدام سند باید نتیجه‌ی نخستِ هر کدام باشد. این مجموعه‌ی برچسب‌خورده ارزشمندترین خروجیِ پروژه است؛ پیش از ساختنِ هر چیزِ دیگری آن را بسازید.'],
        check: ['A corpus and a (query, gold document) file with at least 40 pairs.',
                'یک پیکره و یک فایلِ (پرس‌وجو، سندِ طلایی) با دست‌کم ۴۰ زوج.'] },

      { title: ['Chunking experiment', 'آزمایشِ قطعه‌بندی'],
        body: ['Implement fixed-size, sentence-aware and semantic chunking, all with overlap. Index each variant and measure recall@5 on your labelled set. Report the winner with the numbers — chunk size is a hyperparameter, not a style choice.',
                'قطعه‌بندیِ اندازه‌ثابت، آگاه‌به-جمله و معنایی را پیاده کنید، همه با هم‌پوشانی. هر گونه را نمایه کنید و recall@5 را روی مجموعه‌ی برچسب‌خورده بسنجید. برنده را با اعداد گزارش کنید — اندازه‌ی قطعه یک ابرپارامتر است نه انتخابِ سبک.'],
        code: ["from sentence_transformers import SentenceTransformer\nimport numpy as np, faiss\n\nmodel = SentenceTransformer('BAAI/bge-small-en-v1.5', normalize_embeddings=True)\n\ndef chunk(words, size=180, overlap=40):\n    step = size - overlap\n    return [' '.join(words[i:i + size]) for i in range(0, len(words), step)]\n\ndef build_index(chunks):\n    emb = model.encode(chunks, batch_size=64, show_progress_bar=False).astype('float32')\n    idx = faiss.IndexFlatIP(emb.shape[1])       # cosine == inner product on normalised vectors\n    idx.add(emb)\n    return idx, emb\n\ndef recall_at_k(idx, queries, gold, k=5):\n    q = model.encode(queries, normalize_embeddings=True).astype('float32')\n    _, I = idx.search(q, k)\n    return np.mean([g in row for g, row in zip(gold, I)])",
               'python'],
        hint: ['Judge chunking by recall@k on your labelled set, not by how the chunks read. A chunk that reads beautifully but splits the answer in half scores zero.',
               'قطعه‌بندی را با recall@k روی مجموعه‌ی برچسب‌خورده قضاوت کنید، نه با این‌که قطعه‌ها چطور خوانده می‌شوند. قطعه‌ای که زیبا خوانده می‌شود اما پاسخ را نصف می‌کند، امتیازش صفر است.'],
        check: ['A table: chunking strategy × size → recall@5, with the winner justified.',
                'جدولی: راهبردِ قطعه‌بندی × اندازه → recall@5، با توجیهِ برنده.'] },

      { title: ['Hybrid retrieval: dense + BM25', 'بازیابیِ ترکیبی: متراکم + BM25'],
        body: ['Add a lexical retriever (BM25) and fuse the two ranked lists, either with weighted score normalisation or reciprocal rank fusion. Measure recall@5 for dense-only, lexical-only and hybrid. Hybrid nearly always wins, especially on queries with rare identifiers.',
                'یک بازیابنده‌ی واژگانی (BM25) بیفزایید و دو فهرستِ رتبه‌بندی‌شده را ادغام کنید، با نرمال‌سازیِ امتیازِ وزن‌دار یا ادغامِ رتبه‌ی متقابل. recall@5 را برای حالت‌های متراکم-تنها، واژگانی-تنها و ترکیبی بسنجید. ترکیبی تقریباً همیشه می‌برد، به‌ویژه در پرس‌وجوهایی با شناسه‌های نادر.'],
        code: ["def rrf(rank_lists, k=60, top=20):\n    \"\"\"Reciprocal rank fusion: robust, no score calibration needed.\"\"\"\n    score = {}\n    for docs in rank_lists:\n        for r, d in enumerate(docs[:top]):\n            score[d] = score.get(d, 0) + 1.0 / (k + r + 1)\n    return sorted(score, key=score.get, reverse=True)\n\nhits = [rrf([dense_hits[i], bm25_hits[i]]) for i in range(len(queries))]\nprint('hybrid recall@5', np.mean([gold[i] in hits[i][:5] for i in range(len(queries))]))",
               'python'],
        hint: ['RRF needs no score normalisation, which is why it is the safest first fusion to ship.',
               'ادغامِ RRF به نرمال‌سازیِ امتیاز نیاز ندارد، و به همین دلیل امن‌ترین ادغامی است که ابتدا عرضه کنید.'],
        check: ['Three recall numbers (dense, lexical, hybrid) and the fusion method stated.',
                'سه عددِ بازیابی (متراکم، واژگانی، ترکیبی) و روشِ ادغامِ بیان‌شده.'] },

      { title: ['Reranking the top candidates', 'بازرتبه‌بندیِ نامزدهای برتر'],
        body: ['Take the top 50 hybrid candidates and rerank them with a cross-encoder. Measure recall@5 and nDCG@10 before and after, and measure the latency added. Reranking buys accuracy with latency — decide where the trade-off lands for your use case.',
                '۵۰ نامزدِ برترِ ترکیبی را بگیرید و با یک cross-encoder بازرتبه‌بندی کنید. recall@5 و nDCG@10 را پیش و پس بسنجید و تأخیرِ افزوده‌شده را اندازه بگیرید. بازرتبه‌بندی دقت را با تأخیر می‌خرد — تصمیم بگیرید این بده‌بستان در کاربردِ شما کجا می‌نشیند.'],
        check: ['Accuracy and latency before/after reranking, with a recommendation.',
                'دقت و تأخیر پیش/پس از بازرتبه‌بندی، با یک توصیه.'] },

      { title: ['Hard-negative mining and the failure log', 'استخراجِ منفی‌های سخت و ثبتِ شکست‌ها'],
        body: ['For every query where the gold document is not in the top 10, read the query and the retrieved chunks and write one sentence on why it failed (vocabulary mismatch, wrong granularity, ambiguous query, duplicate content). This log drives every future improvement.',
                'برای هر پرس‌وجو که سندِ طلایی در ده‌تای برتر نیست، پرس‌وجو و قطعه‌های بازیابی‌شده را بخوانید و یک جمله بنویسید که چرا شکست خورده (عدم تطابقِ واژگانی، دانه‌بندیِ غلط، پرس‌وجوی مبهم، محتوای تکراری). این ثبت، محرکِ هر بهبودِ بعدی است.'],
        check: ['A failure log with a categorised reason for every miss.',
                'یک ثبتِ شکست با دلیلِ دسته‌بندی‌شده برای هر خطا.'] },

      { title: ['Turn the harness into a regression suite', 'تبدیلِ چارچوب به مجموعه‌ی رگرسیون'],
        body: ['Package the labelled set and metrics into one command that prints a scorecard (recall@5, nDCG@10, MRR, latency p50/p95, cost per 1,000 queries). Run it in CI so any change to chunking, model or index has to prove itself.',
                'مجموعه‌ی برچسب‌خورده و معیارها را در یک فرمان بسته‌بندی کنید که یک کارتِ امتیاز چاپ می‌کند (recall@5، nDCG@10، MRR، تأخیرِ p50/p95، هزینه به‌ازای هر ۱۰۰۰ پرس‌وجو). آن را در CI اجرا کنید تا هر تغییر در قطعه‌بندی، مدل یا نمایه مجبور باشد خودش را اثبات کند.'],
        code: ["# evaluate.py — one command, one scorecard\nimport json, time, numpy as np\n\nrows = []\nfor q in queries:\n    t0 = time.perf_counter(); hits = retrieve(q, k=10); dt = time.perf_counter() - t0\n    rows.append({'q': q, 'recall10': int(gold_of(q) in hits[:10]), 'latency_ms': dt * 1000})\n\nprint(json.dumps({'recall@10': round(np.mean([r['recall10'] for r in rows]), 3),\n                  'p50_ms': round(np.percentile([r['latency_ms'] for r in rows], 50), 1),\n                  'p95_ms': round(np.percentile([r['latency_ms'] for r in rows], 95), 1)}, indent=2))",
               'python'],
        hint: ['Run the scorecard in CI and fail the build when recall@5 drops by more than a fixed margin. A metric nobody enforces stops being a metric.',
               'کارتِ امتیاز را در CI اجرا کنید و وقتی recall@5 بیش از یک حاشیه‌ی ثابت افت می‌کند، ساخت را شکست دهید. معیاری که کسی اِعمالش نکند، دیگر معیار نیست.'],
        check: ['A single-command scorecard wired into CI that fails on a metric regression.',
                'یک کارتِ امتیازِ تک‌فرمانی متصل به CI که با افتِ معیار شکست می‌خورد.'] },

      { title: ['Cost and scale note', 'یادداشتِ هزینه و مقیاس'],
        body: ['Compute embedding cost and storage for your corpus, query cost at 10k queries/day, and the index size in memory. State what changes when the corpus grows 100x (approximate index, sharding, quantised vectors).',
                'هزینه‌ی embedding و ذخیره‌سازی برای پیکره‌تان، هزینه‌ی پرس‌وجو در ۱۰ هزار پرس‌وجو در روز، و اندازه‌ی نمایه در حافظه را حساب کنید. بیان کنید وقتی پیکره ۱۰۰ برابر می‌شود چه چیزی تغییر می‌کند (نمایه‌ی تقریبی، بخش‌بندی، بردارهای کوانتیزه).'],
        check: ['A cost table and a 100x scaling note.',
                'جدولِ هزینه و یادداشتی درباره‌ی مقیاسِ ۱۰۰ برابر.'] }
    ],
    [
      ['A labelled (query, gold document) set of 40+ pairs.',
       'یک مجموعه‌ی برچسب‌خورده‌ی (پرس‌وجو، سند طلایی) با بیش از ۴۰ زوج.'],
      ['A chunking ablation table.',
       'جدولِ حذفِ عاملیِ قطعه‌بندی.'],
      ['Dense / lexical / hybrid comparison with the fusion method.',
       'مقایسه‌ی متراکم / واژگانی / ترکیبی با روشِ ادغام.'],
      ['A reranking accuracy-vs-latency measurement.',
       'اندازه‌گیریِ دقت-در-برابر-تأخیرِ بازرتبه‌بندی.'],
      ['A one-command scorecard wired into CI.',
       'یک کارتِ امتیازِ تک‌فرمانی متصل به CI.']
    ],
    [
      ['The labelled set exists and was built before tuning.',
       'مجموعه‌ی برچسب‌خورده وجود دارد و پیش از تنظیم ساخته شده است.'],
      ['Every design choice (chunking, hybrid, reranking) is justified by a measured metric.',
       'هر انتخابِ طراحی (قطعه‌بندی، ترکیبی، بازرتبه‌بندی) با یک معیارِ اندازه‌گیری‌شده توجیه شده است.'],
      ['Latency and cost are reported next to accuracy.',
       'تأخیر و هزینه کنارِ دقت گزارش شده‌اند.'],
      ['Failures are categorised in a log that drives the next iteration.',
       'شکست‌ها در ثبتی دسته‌بندی شده‌اند که تکرارِ بعدی را هدایت می‌کند.']
    ],
    ['embeddings', 'retrieval', 'hybrid-search', 'reranking', 'evaluation'],
    [R('MTEB leaderboard', 'https://huggingface.co/spaces/mteb/leaderboard', 'tool'),
     R('Sentence-Transformers docs', 'https://www.sbert.net/', 'doc')]
  );

  /* =================================================================
     9. MLOPS — ship it and keep it alive
     ================================================================= */
  PJ('pj-ops', 'domain', 'ops', 'intermediate', 10,
    ['Ship the Model: API, Container, CI/CD, Drift Monitoring',
     'عرضه‌ی مدل: API، کانتینر، CI/CD، پایشِ انحراف'],
    ['Take a trained model from a previous project to production shape: a versioned artefact, a FastAPI service, a container, tests that run in CI, a canary deployment, and a monitoring job that measures drift and performance decay and tells you when to retrain.',
     'یک مدلِ آموزش‌دیده از پروژه‌ای قبل را به شکلِ تولید درآورید: یک خروجیِ نسخه‌دار، یک سرویسِ FastAPI، یک کانتینر، آزمون‌هایی که در CI اجرا می‌شوند، یک استقرارِ کاناری، و یک کارِ پایش که انحراف و افتِ عملکرد را اندازه می‌گیرد و می‌گوید چه زمانی بازآموزی کنید.'],
    ['The model you built in the tabular project (pj-ml) plus a month of simulated production traffic',
     'مدلی که در پروژه‌ی جدولی (pj-ml) ساختید به‌علاوه یک ماه ترافیکِ تولیدِ شبیه‌سازی‌شده',
     'https://fastapi.tiangolo.com/'],
    [
      { title: ['One versioned artefact', 'یک خروجیِ نسخه‌دار'],
        body: ['Serialise the model together with its fitted preprocessing, the schema (column names, dtypes, accepted categories) and the training-data window. Compute a hash of the artefact and store it with the training run. If preprocessing lives anywhere else, you have already created training/serving skew.',
                'مدل را همراهِ پیش‌پردازشِ برازش‌یافته، طرح‌واره (نامِ ستون‌ها، انواع، دسته‌های پذیرفته) و بازه‌ی داده‌ی آموزش سریالی کنید. یک هش از خروجی حساب کنید و کنارِ اجرای آموزش ذخیره کنید. اگر پیش‌پردازش در جای دیگری باشد، از همین ابتدا انحرافِ آموزش/سروینگ ساخته‌اید.'],
        code: ["import joblib, hashlib, json, pathlib\n\nbundle = {'model': model, 'preprocessor': pre, 'schema': {'num': num_cols, 'cat': cat_cols},\n          'threshold': thr_star, 'trained_on': {'from': '2024-01-01', 'to': '2024-06-30'},\n          'metrics': {'pr_auc': 0.412, 'brier': 0.031}, 'version': '1.3.0'}\npath = pathlib.Path('artifacts/model-1.3.0.joblib')\njoblib.dump(bundle, path)\nprint('sha256', hashlib.sha256(path.read_bytes()).hexdigest()[:16])",
               'python'],
        hint: ['If you find yourself copying preprocessing code into the service, stop: that copy will drift from the training one. Put the fitted transformer in the bundle and version it.',
               'اگر دیدید دارید کدِ پیش‌پردازش را در سرویس کپی می‌کنید، بایستید: آن کپی از نسخه‌ی آموزش جدا می‌افتد. تبدیل‌گرِ برازش‌یافته را در بسته بگذارید و نسخه‌گذاری کنید.'],
        check: ['One file that contains everything needed to predict, plus its hash and metadata.',
                'یک فایل که هرآنچه برای پیش‌بینی لازم است دارد، به‌همراه هش و فراداده‌اش.'] },

      { title: ['A serving API with a schema contract', 'یک APIِ سروینگ با قراردادِ طرح‌واره'],
        body: ['Wrap it in FastAPI with a Pydantic request model, a /predict endpoint, a /health endpoint and a /metrics endpoint. Validate inputs explicitly and return a typed error for unknown categories instead of a stack trace.',
                'آن را در FastAPI بپیچید با یک مدلِ درخواستِ Pydantic، یک نقطه‌ی /predict، یک نقطه‌ی /health و یک نقطه‌ی /metrics. ورودی‌ها را صریح اعتبارسنجی کنید و برای دسته‌های ناشناخته یک خطای نوع‌دار برگردانید نه ردیابیِ پشته.'],
        code: ["from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel, Field\nimport joblib, pandas as pd, time\n\nbundle = joblib.load('artifacts/model-1.3.0.joblib')\napp = FastAPI(title='churn-scoring')\n\nclass Row(BaseModel):\n    tenure_months: float = Field(ge=0, le=600)\n    monthly_charges: float = Field(ge=0)\n    contract: str\n\nclass Request(BaseModel):\n    rows: list[Row]\n\n@app.post('/predict')\ndef predict(req: Request):\n    df = pd.DataFrame([r.model_dump() for r in req.rows])\n    bad = set(df['contract']) - set(bundle['schema']['known_contracts'])\n    if bad: raise HTTPException(422, f'unknown categories: {sorted(bad)}')\n    p = bundle['model'].predict_proba(bundle['preprocessor'].transform(df))[:, 1]\n    return {'version': bundle['version'], 'score': p.round(4).tolist(),\n            'flag': (p >= bundle['threshold']).tolist()}\n\n@app.get('/health')\ndef health(): return {'status': 'ok', 'version': bundle['version']}",
               'python'],
        check: ['The API validates inputs, returns typed errors, and exposes health and metrics.',
                'API ورودی‌ها را اعتبارسنجی می‌کند، خطاهای نوع‌دار برمی‌گرداند و health و metrics را در دسترس می‌گذارد.'] },

      { title: ['Containerise it properly', 'کانتینری‌کردنِ درست'],
        body: ['Write a multi-stage Dockerfile that installs only runtime dependencies, runs as a non-root user, pins versions, and starts the app with a healthcheck. Measure the image size and cold-start time — those two numbers decide your autoscaling behaviour.',
                'یک Dockerfile چندمرحله‌ای بنویسید که تنها وابستگی‌های زمانِ اجرا را نصب می‌کند، با کاربرِ غیرِ root اجرا می‌شود، نسخه‌ها را پین می‌کند و برنامه را با یک بررسیِ سلامت آغاز می‌کند. اندازه‌ی تصویر و زمانِ شروعِ سرد را اندازه بگیرید — این دو عدد رفتارِ مقیاس‌خودکارِ شما را تعیین می‌کنند.'],
        code: ["# syntax=docker/dockerfile:1\nFROM python:3.12-slim AS build\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nFROM python:3.12-slim\nRUN useradd -m app && apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*\nWORKDIR /app\nCOPY --from=build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages\nCOPY artifacts/ artifacts/\nCOPY src/ src/\nUSER app\nEXPOSE 8000\nHEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1\nCMD [\"uvicorn\", \"src.serve:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
               'docker'],
        check: ['An image that runs as non-root, with a healthcheck and a recorded size/start time.',
                'یک تصویر که با کاربرِ غیرِ root اجرا می‌شود، با بررسیِ سلامت و اندازه/زمانِ شروعِ ثبت‌شده.'] },

      { title: ['Tests that actually protect you', 'آزمون‌هایی که واقعاً محافظت می‌کنند'],
        body: ['Write unit tests for the transform logic, a golden-file test for the prediction of a fixed input, a schema test that fails when a column is renamed, and a load test that reports p95 latency at your target QPS. Wire them into CI on every push.',
                'آزمون‌های واحد برای منطقِ تبدیل، یک آزمونِ فایلِ طلایی برای پیش‌بینیِ یک ورودیِ ثابت، یک آزمونِ طرح‌واره که با تغییرِ نامِ یک ستون شکست می‌خورد، و یک آزمونِ بار که تأخیرِ p95 را در نرخِ هدف گزارش می‌کند بنویسید. آن‌ها را روی هر push به CI وصل کنید.'],
        check: ['Four test classes passing in CI, including a golden-file and a load test.',
                'چهار دسته آزمون که در CI می‌گذرند، از جمله فایلِ طلایی و آزمونِ بار.'] },

      { title: ['Shadow, then canary', 'نخست سایه، سپس کاناری'],
        body: ['Deploy the new model in shadow mode (predictions logged, none served), compare its score distribution and latency against the incumbent for a day, then promote to a 5% canary with an automated rollback rule on error rate and latency.',
                'مدلِ جدید را در حالتِ سایه مستقر کنید (پیش‌بینی‌ها ثبت می‌شوند، هیچ‌کدام سرو نمی‌شوند)، توزیعِ امتیاز و تأخیرش را یک روز با مدلِ مستقر مقایسه کنید، سپس با یک قاعده‌ی بازگشتِ خودکار روی نرخِ خطا و تأخیر به کاناریِ ۵٪ ارتقا دهید.'],
        hint: ['In shadow mode, compare score distributions with PSI against the incumbent. A large shift with no latency or error change means the model changed, not the traffic.',
               'در حالتِ سایه، توزیعِ امتیازها را با PSI در برابر مدلِ مستقر مقایسه کنید. یک جابه‌جاییِ بزرگ بدون تغییر در تأخیر یا خطا یعنی مدل تغییر کرده است، نه ترافیک.'],
        check: ['A shadow comparison report and a canary config with explicit rollback conditions.',
                'گزارشِ مقایسه‌ی سایه و یک پیکربندیِ کاناری با شرایطِ بازگشتِ صریح.'] },

      { title: ['Monitoring: drift, performance and data quality', 'پایش: انحراف، عملکرد و کیفیتِ داده'],
        body: ['Build a daily job that computes PSI per feature, the prediction distribution shift, missing-rate spikes, and — crucially — realised performance once labels arrive. Plot them on one timeline with alert thresholds. Distinguish data drift (inputs moved) from concept drift (the relationship moved): they have different fixes.',
                'یک کارِ روزانه بسازید که PSI را برای هر ویژگی، جابه‌جاییِ توزیعِ پیش‌بینی، جهش‌های نرخِ گم‌شدگی و — مهم‌تر از همه — عملکردِ محقق‌شده پس از رسیدنِ برچسب‌ها حساب کند. آن‌ها را روی یک خطِ زمان با آستانه‌های هشدار رسم کنید. انحرافِ داده (ورودی‌ها جابه‌جا شده) را از انحرافِ مفهوم (رابطه جابه‌جا شده) تفکیک کنید: راه‌حل‌هایشان متفاوت است.'],
        code: ["import numpy as np\n\ndef psi(ref, cur, bins=10):\n    cuts = np.quantile(ref, np.linspace(0, 1, bins + 1))\n    cuts[0], cuts[-1] = -np.inf, np.inf\n    r = np.histogram(ref, cuts)[0] / len(ref)\n    c = np.histogram(cur, cuts)[0] / len(cur)\n    eps = 1e-6\n    return float(np.sum((c - r) * np.log((c + eps) / (r + eps))))\n\nfor col in num_cols:\n    v = psi(train_df[col].values, today_df[col].values)\n    flag = 'ALERT' if v > 0.25 else ('watch' if v > 0.1 else 'ok')\n    print(f'{col:20s} PSI {v:.3f}  {flag}')",
               'python'],
        check: ['A monitoring dashboard with PSI, latency, error rate and realised performance, with thresholds.',
                'یک داشبوردِ پایش با PSI، تأخیر، نرخِ خطا و عملکردِ محقق‌شده، با آستانه‌ها.'] },

      { title: ['The retraining loop', 'حلقه‌ی بازآموزی'],
        body: ['Define the trigger that starts retraining (a schedule, a drift threshold, or a performance drop), automate the path from trigger to a candidate model, and require the candidate to beat the incumbent on a held-out recent window before it is eligible for promotion.',
                'محرکی که بازآموزی را آغاز می‌کند تعریف کنید (یک زمان‌بندی، یک آستانه‌ی انحراف، یا افتِ عملکرد)، مسیر از محرک تا مدلِ نامزد را خودکار کنید، و لازم کنید نامزد پیش از واجدِ ارتقا شدن، مدلِ مستقر را روی یک بازه‌ی اخیرِ نگه‌داشته‌شده ببرد.'],
        check: ['A documented trigger, an automated candidate path, and a promotion gate.',
                'یک محرکِ مستند، یک مسیرِ خودکارِ نامزد، و یک دروازه‌ی ارتقا.'] },

      { title: ['Write the runbook', 'نوشتنِ دفترچه‌ی عملیات'],
        body: ['One page: architecture diagram, what each alert means and what to do, how to roll back, who owns it, and how to reproduce the model from scratch. A system nobody can operate at 3 a.m. is not production-ready.',
                'یک صفحه: نمودارِ معماری، اینکه هر هشدار یعنی چه و چه باید کرد، چگونه بازگشت، مالکش کیست، و چگونه مدل را از صفر بازتولید کنید. سیستمی که هیچ‌کس نتواند ساعتِ ۳ صبح آن را اداره کند، آماده‌ی تولید نیست.'],
        check: ['A runbook someone else could follow during an incident.',
                'دفترچه‌ی عملیاتی که کسِ دیگری بتواند هنگامِ رخداد از آن پیروی کند.'] }
    ],
    [
      ['A single versioned artefact (model + preprocessing + schema) with a hash.',
       'یک خروجیِ نسخه‌دارِ واحد (مدل + پیش‌پردازش + طرح‌واره) با هش.'],
      ['A containerised FastAPI service with health and metrics endpoints.',
       'یک سرویسِ FastAPI کانتینری‌شده با نقطه‌های health و metrics.'],
      ['A CI pipeline running unit, golden-file, schema and load tests.',
       'یک خطِ لوله‌ی CI که آزمون‌های واحد، فایلِ طلایی، طرح‌واره و بار را اجرا می‌کند.'],
      ['A shadow comparison and a canary configuration with rollback rules.',
       'یک مقایسه‌ی سایه و یک پیکربندیِ کاناری با قواعدِ بازگشت.'],
      ['A monitoring dashboard and a runbook.',
       'یک داشبوردِ پایش و یک دفترچه‌ی عملیات.']
    ],
    [
      ['Predicting requires exactly one artefact; no hidden preprocessing.',
       'پیش‌بینی دقیقاً به یک خروجی نیاز دارد؛ هیچ پیش‌پردازشِ پنهانی نیست.'],
      ['The service validates its inputs and exposes health and metrics.',
       'سرویس ورودی‌هایش را اعتبارسنجی می‌کند و health و metrics را در دسترس می‌گذارد.'],
      ['The container runs as a non-root user with pinned dependencies.',
       'کانتینر با کاربرِ غیرِ root و وابستگی‌های پین‌شده اجرا می‌شود.'],
      ['Drift and realised performance are both monitored, with thresholds.',
       'هم انحراف و هم عملکردِ محقق‌شده با آستانه پایش می‌شوند.'],
      ['There is a documented rollback and a named owner.',
       'یک بازگشتِ مستند و یک مالکِ نام‌برده وجود دارد.']
    ],
    ['fastapi', 'docker', 'ci-cd', 'monitoring', 'drift'],
    [R('Made With ML — MLOps', 'https://madewithml.com/', 'course'),
     R('Evidently AI docs', 'https://docs.evidentlyai.com/', 'tool')]
  );

  /* =================================================================
     10. RESPONSIBLE AI — fairness & explainability audit
     ================================================================= */
  PJ('pj-resp', 'domain', 'responsible', 'advanced', 8,
    ['Fairness and Explainability Audit of a Lending Model',
     'حسابرسیِ عدالت و تفسیرپذیریِ یک مدلِ اعتباری'],
    ['Audit an existing model the way a regulator would: subgroup performance, explanation consistency, proxy detection, mitigation with the accuracy/fairness trade-off measured, and a model card that states where the model must not be used. Deliver a recommendation, not just numbers.',
     'یک مدلِ موجود را آن‌طور که یک ناظر حسابرسی می‌کند بررسی کنید: عملکردِ زیرگروه‌ها، سازگاریِ توضیح‌ها، کشفِ جانشین‌ها، کاهش با اندازه‌گیریِ بده‌بستانِ دقت/عدالت، و کارتِ مدلی که بگوید کجا نباید استفاده شود. یک توصیه تحویل دهید، نه فقط اعداد.'],
    ['A credit/loan dataset with protected attributes available for auditing (e.g. the German Credit or Home Credit datasets)',
     'یک مجموعه‌داده‌ی اعتباری/وام با ویژگی‌های محافظت‌شده برای حسابرسی (مثلاً German Credit یا Home Credit)',
     'https://www.kaggle.com/datasets/uciml/german-credit'],
    [
      { title: ['Define the harm before the metric', 'تعریفِ آسیب پیش از معیار'],
        body: ['Write down who is harmed by each error type and in which direction: a false rejection denies credit, a false approval creates debt stress. Choose the fairness criteria that match the harm (e.g. equal opportunity for approvals) and justify the choice — you cannot satisfy every criterion at once, and you must say so.',
                'بنویسید چه کسی و در چه جهتی از هر نوع خطا آسیب می‌بیند: ردِ کاذب اعتبار را دریغ می‌کند، تأییدِ کاذب فشارِ بدهی می‌سازد. معیارهای عدالتی متناسب با آسیب را برگزینید (مثلاً فرصتِ برابر برای تأییدها) و انتخاب را توجیه کنید — نمی‌توانید همه‌ی معیارها را همزمان ارضا کنید و باید این را بگویید.'],
        check: ['A one-paragraph harm statement and one chosen fairness criterion with justification.',
                'یک پاراگراف بیانِ آسیب و یک معیارِ عدالتِ برگزیده با توجیه.'] },

      { title: ['Subgroup performance table', 'جدولِ عملکردِ زیرگروه‌ها'],
        body: ['Compute approval rate, TPR, FPR, precision and calibration by group (and by intersection of two attributes). Report counts per cell and refuse to draw conclusions from cells with fewer than ~100 positives. Small-sample subgroups are where audits go wrong.',
                'نرخِ تأیید، TPR، FPR، دقت و کالیبراسیون را به تفکیکِ گروه (و تقاطعِ دو ویژگی) حساب کنید. تعداد را در هر خانه گزارش کنید و از نتیجه‌گیری درباره‌ی خانه‌هایی با کمتر از حدود ۱۰۰ مثبت خودداری کنید. زیرگروه‌های کم‌نمونه جایی‌اند که حسابرسی‌ها به خطا می‌روند.'],
        code: ["import pandas as pd\n\nrows = []\nfor g, sub in df.groupby('group'):\n    y, p, yhat = sub['y'], sub['score'], sub['score'] >= thr\n    rows.append({'group': g, 'n': len(sub), 'pos': int(y.sum()),\n                 'approval_rate': yhat.mean(),\n                 'TPR': ((yhat == 1) & (y == 1)).sum() / max((y == 1).sum(), 1),\n                 'FPR': ((yhat == 1) & (y == 0)).sum() / max((y == 0).sum(), 1),\n                 'Brier': ((p - y) ** 2).mean()})\nout = pd.DataFrame(rows)\nout['small_sample'] = out['pos'] < 100\nprint(out.round(3).to_string(index=False))",
               'python'],
        hint: ['Always print the counts next to the rates. A 40% approval rate on 5 applicants is noise; the same number on 5,000 is a finding.',
               'همیشه تعدادها را کنارِ نرخ‌ها چاپ کنید. نرخِ تأییدِ ۴۰٪ روی ۵ متقاضی نویز است؛ همان عدد روی ۵۰۰۰ نفر یک یافته است.'],
        check: ['A subgroup table with counts, and small cells flagged rather than interpreted.',
                'جدولی از زیرگروه‌ها با تعدادها، که خانه‌های کوچک علامت می‌خورند نه تفسیر.'] },

      { title: ['Explain the model and check the explanations', 'توضیحِ مدل و بررسیِ توضیح‌ها'],
        body: ['Compute SHAP values, show global feature importance and two individual explanations, then run three consistency checks: do similar applicants get similar explanations, do the top drivers match domain sense, and do explanations change under a small perturbation of the input? An unstable explanation is not an explanation.',
                'مقادیرِ SHAP را حساب کنید، اهمیتِ سراسریِ ویژگی‌ها و دو توضیحِ فردی را نشان دهید، سپس سه بررسیِ سازگاری اجرا کنید: آیا متقاضیانِ مشابه توضیح‌های مشابه می‌گیرند، آیا عواملِ برتر با عقلِ حوزه هم‌خوان‌اند، و آیا توضیح‌ها با مخدوش‌سازیِ کوچکِ ورودی تغییر می‌کنند؟ توضیحِ ناپایدار، توضیح نیست.'],
        code: ["import shap\n\nexpl   = shap.TreeExplainer(model)\nsv     = expl.shap_values(X_test)\n\n# stability check: perturb continuous features by 1% and re-explain\nXp = X_test.copy()\nXp[num_cols] *= (1 + 0.01)\nsvp = expl.shap_values(Xp)\n\nrank_change = [abs(list(a).index(max(a)) - list(b).index(max(b)))\n               for a, b in zip(sv, svp)]\nprint('top-driver changed for', sum(r > 0 for r in rank_change), 'of', len(rank_change), 'cases')",
               'python'],
        check: ['Global and local explanations plus a stability measurement.',
                'توضیح‌های سراسری و محلی به‌همراه یک اندازه‌گیریِ پایداری.'] },

      { title: ['Hunt for proxies', 'شکارِ جانشین‌ها'],
        body: ['Test whether the protected attribute can be predicted from the other features (a simple model with cross-validated AUC is enough). Identify the top proxy features by their association with the group and report them. A model can be discriminatory without ever seeing the attribute.',
                'بیازمایید آیا ویژگیِ محافظت‌شده از دیگر ویژگی‌ها قابل پیش‌بینی است (یک مدلِ ساده با AUCِ اعتبارسنجیِ متقابل کافی است). ویژگی‌های جانشینِ برتر را از روی پیوندشان با گروه شناسایی و گزارش کنید. یک مدل می‌تواند بدون آن‌که هرگز ویژگی را ببیند، تبعیض‌آمیز باشد.'],
        check: ['A proxy-AUC number and the list of top proxy features.',
                'یک عددِ AUCِ جانشین و فهرستِ ویژگی‌های جانشینِ برتر.'] },

      { title: ['Mitigate, and measure what it costs', 'کاهش، و اندازه‌گیریِ هزینه‌اش'],
        body: ['Try at least two: remove proxy features, reweight the training samples, and post-process group-specific thresholds. For each, report the fairness metric and the business metric side by side. There is no free lunch here; the deliverable is an explicit trade-off curve for a decision maker.',
                'دست‌کم دو مورد را بیازمایید: حذفِ ویژگی‌های جانشین، وزن‌دهیِ مجددِ نمونه‌های آموزش، و پس‌پردازشِ آستانه‌های ویژه‌ی گروه. برای هر کدام معیارِ عدالت و معیارِ کسب‌وکار را کنارِ هم گزارش کنید. اینجا ناهارِ رایگان وجود ندارد؛ تحویل، یک منحنیِ بده‌بستانِ صریح برای تصمیم‌گیرنده است.'],
        hint: ['Expect a trade-off and plot it: fairness metric on one axis, business metric on the other, one point per mitigation. Hand the decision to the person who owns the harm.',
               'منتظرِ بده‌بستان باشید و آن را رسم کنید: معیارِ عدالت روی یک محور، معیارِ کسب‌وکار روی محورِ دیگر، یک نقطه به‌ازای هر کاهش. تصمیم را به کسی بسپارید که مالکِ آسیب است.'],
        check: ['A trade-off table/plot with a recommended operating point.',
                'جدول/نمودارِ بده‌بستان با یک نقطه‌ی کاریِ توصیه‌شده.'] },

      { title: ['Counterfactual "what would have to change"', 'پادواقعیتِ «چه باید تغییر می‌کرد»'],
        body: ['For three rejected applicants, find the smallest realistic change that flips the decision (income +X, or tenure +Y months), and check that the counterfactual is actionable and lawful. This is the most useful output for a customer-facing process — and it has to be constrained to features a person can actually change.',
                'برای سه متقاضیِ ردشده، کوچک‌ترین تغییرِ واقع‌بینانه‌ای که تصمیم را برمی‌گرداند بیابید (درآمد +X، یا سابقه +Y ماه) و بررسی کنید پادواقعیت، اقدام‌پذیر و قانونی است. این مفیدترین خروجی برای یک فرایندِ رو‌به-مشتری است — و باید به ویژگی‌هایی محدود شود که یک شخص واقعاً بتواند تغییر دهد.'],
        check: ['Three counterfactuals with the constraints stated and checked.',
                'سه پادواقعیت با محدودیت‌های بیان‌شده و بررسی‌شده.'] },

      { title: ['Model card and the "do not use" section', 'کارتِ مدل و بخشِ «استفاده نکنید»'],
        body: ['Write the model card including a blunt out-of-scope section: populations where the sample is too thin, uses where the cost of the harm is unacceptable, and the monitoring that must accompany deployment.',
                'کارتِ مدل را بنویسید از جمله یک بخشِ صریحِ خارج‌از-محدوده: جمعیت‌هایی که نمونه در آن‌ها بسیار کم است، کاربردهایی که هزینه‌ی آسیب در آن‌ها غیرقابل‌قبول است، و پایشی که باید همراهِ استقرار باشد.'],
        check: ['A model card with an explicit out-of-scope section and monitoring requirements.',
                'کارتِ مدل با یک بخشِ صریحِ خارج‌از-محدوده و الزاماتِ پایش.'] },

      { title: ['The recommendation memo', 'یادداشتِ توصیه'],
        body: ['Half a page to the decision maker: what you found, how confident you are, what you recommend (ship / ship with mitigation / do not ship), and what evidence would change the answer. Audits that end in "it depends" have not finished.',
                'نیم صفحه برای تصمیم‌گیرنده: چه یافتید، چقدر مطمئنید، چه توصیه می‌کنید (عرضه / عرضه با کاهش / عرضه نکنید)، و چه مدرکی پاسخ را تغییر می‌دهد. حسابرسی‌هایی که به «بستگی دارد» ختم می‌شوند، تمام نشده‌اند.'],
        check: ['A memo with a clear recommendation and a stated confidence level.',
                'یادداشتی با توصیه‌ی روشن و سطحِ اطمینانِ بیان‌شده.'] }
    ],
    [
      ['A subgroup performance table with sample-size flags.',
       'جدولِ عملکردِ زیرگروه‌ها با علامتِ اندازه‌ی نمونه.'],
      ['SHAP explanations with a stability check.',
       'توضیح‌های SHAP با یک بررسیِ پایداری.'],
      ['A proxy-detection result.',
       'نتیجه‌ی کشفِ جانشین.'],
      ['A fairness/accuracy trade-off plot with a recommendation.',
       'نمودارِ بده‌بستانِ عدالت/دقت با یک توصیه.'],
      ['A model card and a half-page recommendation memo.',
       'کارتِ مدل و یک یادداشتِ توصیه‌ی نیم‌صفحه‌ای.']
    ],
    [
      ['The harm and the fairness criterion are stated up front.',
       'آسیب و معیارِ عدالت از ابتدا بیان شده‌اند.'],
      ['Subgroup metrics come with counts and small-sample warnings.',
       'معیارهای زیرگروه با تعدادها و هشدارِ کم‌نمونگی همراه‌اند.'],
      ['Explanations are tested for stability, not just displayed.',
       'توضیح‌ها از نظر پایداری آزموده شده‌اند، نه فقط نمایش داده.'],
      ['Mitigation reports both the fairness and the business metric.',
       'کاهش، هم معیارِ عدالت و هم معیارِ کسب‌وکار را گزارش می‌کند.'],
      ['The deliverable ends with a clear recommendation.',
       'تحویل با یک توصیه‌ی روشن تمام می‌شود.']
    ],
    ['fairness', 'shap', 'explainability', 'model-cards', 'audit'],
    [R('Fairness and Machine Learning (Barocas, Hardt, Narayanan)', 'https://fairmlbook.org/', 'book'),
     R('SHAP documentation', 'https://shap.readthedocs.io/', 'tool')]
  );

  /* =================================================================
     11. PRACTICE — the portfolio project
     ================================================================= */
  PJ('pj-prac', 'domain', 'practice', 'beginner', 6,
    ['The Portfolio Project: Question, Repo, Write-Up, Talk',
     'پروژه‌ی نمونه‌کار: پرسش، مخزن، گزارش، ارائه'],
    ['Do one small project end to end — question, data, analysis, repo, README, three-minute talk — and make it the piece you send with an application. The grading is not model accuracy; it is whether a stranger can follow your thinking and whether your conclusion survives their questions.',
     'یک پروژه‌ی کوچک را تا انتها انجام دهید — پرسش، داده، تحلیل، مخزن، README، ارائه‌ی سه‌دقیقه‌ای — و آن را به قطعه‌ای تبدیل کنید که همراهِ درخواست می‌فرستید. معیار دقتِ مدل نیست؛ این است که آیا یک غریبه می‌تواند روندِ فکرِ شما را دنبال کند و آیا نتیجه‌گیری‌تان زیرِ پرسش‌های او دوام می‌آورد.'],
    ['Any public dataset you genuinely care about — curiosity beats impressiveness',
     'هر مجموعه‌داده‌ی عمومی که واقعاً برای‌تان مهم است — کنجکاوی بر چشمگیر بودن مقدم است',
     'https://datasetsearch.research.google.com/'],
    [
      { title: ['A question, not a dataset', 'یک پرسش، نه یک مجموعه‌داده'],
        body: ['Write the question as a sentence a decision maker would ask, with a decision attached ("should we…?"). Datasets-first projects produce dashboards nobody acts on; questions produce conclusions someone can use.',
                'پرسش را در قالبِ جمله‌ای بنویسید که یک تصمیم‌گیرنده می‌پرسد، با یک تصمیمِ همراهش («آیا باید…؟»). پروژه‌هایی که از داده شروع می‌شوند داشبوردهایی می‌سازند که کسی به آن‌ها عمل نمی‌کند؛ پرسش‌ها نتیجه‌گیری‌هایی می‌سازند که کسی می‌تواند استفاده کند.'],
        check: ['One sentence with an implicit decision, reviewed by one other person.',
                'یک جمله با یک تصمیمِ ضمنی، که یک نفرِ دیگر بازبینی کرده است.'] },

      { title: ['Scope it to two weeks', 'محدود کردن به دو هفته'],
        body: ['Cut the scope until it fits: one dataset, one main analysis, one robustness check, one figure that carries the argument. Write the plan as three checkboxes you can finish. Finished beats ambitious every time in a portfolio.',
                'دامنه را آن‌قدر کوچک کنید که جا شود: یک مجموعه‌داده، یک تحلیلِ اصلی، یک بررسیِ استحکام، یک شکل که استدلال را حمل کند. برنامه را به‌شکل سه چک‌باکس بنویسید که بتوانید تمام کنید. در نمونه‌کار، تمام‌شده همیشه از بلندپروازانه بهتر است.'],
        check: ['A written plan with three checkboxes and a deadline.',
                'یک برنامه‌ی نوشته‌شده با سه چک‌باکس و یک ضرب‌الاجل.'] },

      { title: ['The repo someone else can run', 'مخزنی که کسِ دیگری بتواند اجرا کند'],
        body: ['Standard layout, locked requirements, a single command that reproduces every number, and a data/ folder that documents where the raw data came from (with a download script, never the data itself if it is large). Add a LICENSE and a short CONTRIBUTING note.',
                'چیدمانِ استاندارد، نیازمندی‌های قفل‌شده، یک فرمانِ واحد که همه‌ی اعداد را بازتولید می‌کند، و یک پوشه‌ی data/ که مستند می‌کند داده‌ی خام از کجا آمده (با یک اسکریپتِ دانلود، و نه خودِ داده اگر بزرگ است). یک پروانه و یک یادداشتِ کوتاهِ مشارکت بیفزایید.'],
        hint: ['Ask someone who has never seen it to run your command on a clean machine. Whatever they stumble on is the next thing you fix — in the repo, not in the message.',
               'از کسی که پروژه را هرگز ندیده بخواهید فرمان‌تان را روی یک ماشینِ تمیز اجرا کند. هرجا زمین خورد همان چیزی است که باید درست کنید — در مخزن، نه در پیام.'],
        check: ['A clone-and-run test by someone who has never seen the project.',
                'یک آزمونِ کلون-و-اجرا توسط کسی که پروژه را هرگز ندیده است.'] },

      { title: ['The README that does the work', 'README ای که کار را انجام می‌دهد'],
        body: ['Structure it as: the question (2 lines), the answer (3 lines), how to reproduce (commands), what you tried that failed, and what you would do next. Recruiters read the top five lines; engineers read the commands; both remember the "what failed" section.',
                'آن را این‌گونه ساختار دهید: پرسش (۲ خط)، پاسخ (۳ خط)، نحوه‌ی بازتولید (فرمان‌ها)، چه چیزهایی را آزمودید که شکست خورد، و گامِ بعد. استخدام‌کنندگان پنج خطِ بالا را می‌خوانند؛ مهندسان فرمان‌ها را؛ هر دو بخشِ «چه شکست خورد» را به یاد می‌سپارند.'],
        check: ['A README with the five sections, read start to finish by a non-expert.',
                'یک README با پنج بخش، که یک غیرِمتخصص از اول تا آخر خوانده است.'] },

      { title: ['One figure that carries the argument', 'یک شکل که استدلال را حمل می‌کند'],
        body: ['Design a single figure that makes the answer obvious: label the axes in plain language, annotate the key point, drop chart junk, and check it in greyscale and at thumbnail size. If your argument needs three figures, your argument is not finished.',
                'یک شکلِ واحد طراحی کنید که پاسخ را بدیهی کند: محورها را به زبانِ ساده برچسب بزنید، نکته‌ی کلیدی را حاشیه‌نویسی کنید، آشغالِ نموداری را حذف کنید، و آن را در خاکستری و در اندازه‌ی بندانگشتی بررسی کنید. اگر استدلال‌تان به سه شکل نیاز دارد، استدلال‌تان تمام نشده است.'],
        hint: ['Shrink the figure to thumbnail size and read it. If the point disappears at that size, the figure has more than one point.',
               'شکل را تا اندازه‌ی بندانگشتی کوچک کنید و بخوانید. اگر نکته در آن اندازه ناپدید شود، شکل بیش از یک نکته دارد.'],
        check: ['One figure, legible at thumbnail size, understood by a non-expert.',
                'یک شکل، خوانا در اندازه‌ی بندانگشتی، و فهمیدنی برای یک غیرِمتخصص.'] },

      { title: ['Say what would change your mind', 'بگویید چه چیزی نظرتان را تغییر می‌دهد'],
        body: ['List the two or three findings that would overturn your conclusion, and the one assumption you are least sure about. Stating the weakness yourself is the fastest way to be trusted for the rest of it.',
                'دو یا سه یافته‌ای که نتیجه‌گیری‌تان را واژگون می‌کند و آن یک فرضی که کمتر از همه مطمئنش هستید فهرست کنید. بیانِ نقطه‌ضعف توسطِ خودتان، سریع‌ترین راه برای این است که در بقیه‌ی موارد به شما اعتماد شود.'],
        check: ['A limitations section with a falsifiable statement.',
                'یک بخشِ محدودیت‌ها با یک گزاره‌ی ابطال‌پذیر.'] },

      { title: ['The three-minute talk', 'ارائه‌ی سه‌دقیقه‌ای'],
        body: ['Write it as five slides: question, data, method in one sentence, result in one figure, limitation. Rehearse out loud three times and cut anything you stumble over. Then write the one-paragraph version for a message or a cover letter.',
                'آن را در پنج اسلاید بنویسید: پرسش، داده، روش در یک جمله، نتیجه در یک شکل، محدودیت. سه‌بار با صدای بلند تمرین کنید و هرچه را زمین‌خوردید حذف کنید. سپس نسخه‌ی یک‌پاراگرافی را برای یک پیام یا نامه‌ی همراه بنویسید.'],
        check: ['Five slides, rehearsed, plus a one-paragraph written version.',
                'پنج اسلاید، تمرین‌شده، به‌علاوه‌ی یک نسخه‌ی نوشتاریِ یک‌پاراگرافی.'] }
    ],
    [
      ['A repository with locked dependencies and a single reproduction command.',
       'یک مخزن با وابستگی‌های قفل‌شده و یک فرمانِ بازتولیدِ واحد.'],
      ['A README in five sections, including what failed.',
       'یک README در پنج بخش، از جمله آنچه شکست خورده است.'],
      ['One annotated figure that carries the argument.',
       'یک شکلِ حاشیه‌نویسی‌شده که استدلال را حمل می‌کند.'],
      ['A limitations section with falsifiable statements.',
       'یک بخشِ محدودیت‌ها با گزاره‌های ابطال‌پذیر.'],
      ['Five slides and a one-paragraph summary.',
       'پنج اسلاید و یک خلاصه‌ی یک‌پاراگرافی.']
    ],
    [
      ['The question implies a decision.',
       'پرسش، یک تصمیم را در خود دارد.'],
      ['A stranger can reproduce every number with one command.',
       'یک غریبه می‌تواند هر عدد را با یک فرمان بازتولید کند.'],
      ['The main figure is legible at thumbnail size.',
       'شکلِ اصلی در اندازه‌ی بندانگشتی خوانا است.'],
      ['Limitations are stated as falsifiable claims.',
       'محدودیت‌ها در قالبِ ادعاهای ابطال‌پذیر بیان شده‌اند.'],
      ['The talk fits in three minutes, rehearsed out loud.',
       'ارائه در سه دقیقه جا می‌شود و با صدای بلند تمرین شده است.']
    ],
    ['portfolio', 'communication', 'reproducibility', 'career'],
    [R('Cookiecutter Data Science', 'https://drivendata.github.io/cookiecutter-data-science/', 'tool'),
     R('Full Stack Deep Learning', 'https://fullstackdeeplearning.com/', 'course')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
