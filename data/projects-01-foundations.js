/* =====================================================================
   projects-01-foundations.js
   One guided, interactive project per domain — foundations half:
   linear-algebra, calculus, probability, statistics, programming, ml
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, PJ = DSH.PJ, R = DSH.R;

  /* =================================================================
     1. LINEAR ALGEBRA — SVD image compression & latent semantics
     ================================================================= */
  PJ('pj-la', 'domain', 'linear-algebra', 'intermediate', 6,
    ['From-Scratch Image Compression and Latent Semantics with the SVD',
     'فشرده‌سازی تصویر و معنای پنهان با تجزیه‌ی SVD از پایه'],
    ['Implement PCA yourself on top of numpy.linalg.svd, compress a real image set, verify the Eckart-Young error bound numerically, then read the components as "latent concepts". This is the one project that makes the SVD permanent.',
     'PCA را خودتان روی numpy.linalg.svd پیاده کنید، یک مجموعه تصویر واقعی را فشرده کنید، کرانِ خطای اکارت-یانگ را عددی بسنجید و سپس مؤلفه‌ها را همچون «مفاهیم پنهان» بخوانید. این همان پروژه‌ای است که SVD را برای همیشه در ذهن می‌نشاند.'],
    ['scikit-learn digits (1797 8x8 images) or Olivetti faces; any grayscale image set works',
     'مجموعه digits در scikit-learn (۱۷۹۷ تصویر ۸×۸) یا Olivetti faces؛ هر مجموعه تصویر خاکستری کار می‌کند',
     'https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html'],
    [
      { title: ['Build the data matrix and look at it', 'ساختِ ماتریس داده و نگاه کردن به آن'],
        body: ['Load the data as a matrix X with one ROW per image and one column per pixel. Print the shape, the mean image and the per-pixel variance. Decide on centring before you do anything else: PCA needs column means subtracted, but raw compression does not.',
                'داده را به‌شکل ماتریس X بار کنید با یک سطر به‌ازای هر تصویر و یک ستون به‌ازای هر پیکسل. شکل، تصویرِ میانگین و واریانسِ هر پیکسل را چاپ کنید. پیش از هر کاری درباره‌ی مرکززدایی تصمیم بگیرید: PCA نیاز به کم‌کردنِ میانگینِ ستون‌ها دارد، اما فشرده‌سازیِ خام نه.'],
        code: ["import numpy as np\nfrom sklearn.datasets import load_digits\n\nX = load_digits().data          # (1797, 64) rows = images, cols = pixels\nprint('shape', X.shape, 'dtype', X.dtype)\n\nmu = X.mean(axis=0)             # the mean image\nprint('mean pixel range', mu.min().round(2), mu.max().round(2))\n\nXc = X - mu                     # centred copy, used for PCA\nassert np.allclose(Xc.mean(axis=0), 0, atol=1e-8)",
               'python'],
        check: ['You can state the shape (n_samples, n_features) and explain what a row means.',
                'می‌توانید شکلِ ماتریس را بگویید و توضیح دهید هر سطر یعنی چه.'] },

      { title: ['Factor it: one line, three readings', 'تجزیه: یک خط، سه قرائت'],
        body: ['Call np.linalg.svd(Xc, full_matrices=False) to get U, s, Vt. Verify that Xc ≈ (U * s) @ Vt, that the columns of U and rows of Vt are orthonormal, and that the singular values are sorted and non-negative. This single line is the engine under PCA, LSA, recommender systems and stable least squares.',
                'تابع np.linalg.svd را با full_matrices=False صدا بزنید تا U و s و Vt به دست آید. بررسی کنید که Xc ≈ (U * s) @ Vt است، ستون‌های U و سطرهای Vt یکّه و متعامدند، و مقادیرِ منفرد مرتب و نامنفی‌اند. همین یک خط موتورِ PCA، تحلیلِ معنای پنهان، سیستم‌های پیشنهادگر و کمترین مربعاتِ پایدار است.'],
        code: ["U, s, Vt = np.linalg.svd(Xc, full_matrices=False)\n\n# (a) reconstruction check\nrec = (U * s) @ Vt\nprint('max abs error', np.abs(rec - Xc).max())      # ~1e-12\n\n# (b) orthonormality checks\nprint('U^T U  close to I :', np.allclose(U.T @ U, np.eye(U.shape[1]), atol=1e-8))\nprint('V V^T  close to I :', np.allclose(Vt @ Vt.T, np.eye(Vt.shape[0]), atol=1e-8))\n\n# (c) singular values are sorted and non-negative\nprint('sorted :', np.all(np.diff(s) <= 1e-9), 'non-negative :', (s >= 0).all())",
               'python'],
        hint: ['If a check fails, you almost certainly used the transposed matrix, or forgot full_matrices=False on a rectangular input.',
               'اگر بررسی‌ای شکست خورد، به احتمال بسیار ماتریس را ترانهاده گرفته‌اید یا full_matrices=False را برای ورودیِ مستطیلی فراموش کرده‌اید.'],
        check: ['All three assertions pass and you can say what U, s and Vt each mean geometrically.',
                'هر سه بررسی می‌گذرد و می‌توانید بگویید هر یک از U و s و Vt از نظر هندسی یعنی چه.'] },

      { title: ['Truncate to rank k and measure the error', 'برش به رتبه‌ی k و اندازه‌گیریِ خطا'],
        body: ['Reconstruct with only the top k singular triplets and plot the relative Frobenius error against k. Then compare your curve with the Eckart-Young prediction sqrt(sum of the discarded sigma_i^2) / sqrt(sum of all sigma_i^2). They must agree — you are checking a theorem, not guessing.',
                'با تنها k تاییِ برترِ مقادیرِ منفرد بازسازی کنید و خطای نسبیِ فروبنیوس را بر حسب k رسم کنید. سپس منحنی‌تان را با پیش‌بینیِ اکارت-یانگ مقایسه کنید: ریشه‌ی مجموعِ sigma_i^2 های حذف‌شده تقسیم بر ریشه‌ی مجموعِ همه. این دو باید یکی باشند — شما یک قضیه را می‌آزمایید، نه حدس می‌زنید.'],
        code: ["def reconstruct(Xc, U, s, Vt, k):\n    return (U[:, :k] * s[:k]) @ Vt[:k]\n\ntotal = np.sqrt((s ** 2).sum())\nfor k in [1, 2, 5, 10, 20, 40]:\n    err = np.linalg.norm(Xc - reconstruct(Xc, U, s, Vt, k))\n    pred = np.sqrt((s[k:] ** 2).sum())          # Eckart-Young (Frobenius)\n    print(f'k={k:3d}  rel_err={err/total:.4f}  predicted={pred/total:.4f}  '\n          f'compression={(U[:, :k].size + s[:k].size + Vt[:k].size) / Xc.size:.3f}')",
               'python'],
        check: ['Your measured error matches the predicted error to 4 decimal places for every k.',
                'خطای اندازه‌گیری‌شده با خطای پیش‌بینی‌شده برای هر k تا ۴ رقم اعشار یکی است.'] },

      { title: ['Turn compression into a real number', 'تبدیلِ فشرده‌سازی به یک عدد واقعی'],
        body: ['Compute the storage in bytes for the truncated factorisation versus the original (float32 raw vs float32 factors) and find the k where the compression ratio crosses 2x and 5x. Note that the ratio depends on the matrix shape: tall matrices benefit most. Report the ratio together with the reconstruction error — compression alone is meaningless.',
                'حجمِ ذخیره‌سازی را بر حسب بایت برای تجزیه‌ی برش‌خورده در برابرِ اصل محاسبه کنید (float32 خام در برابر عامل‌های float32) و k ای را بیابید که در آن نسبتِ فشرده‌سازی از ۲ و ۵ برابر می‌گذرد. توجه کنید نسبت به شکلِ ماتریس بستگی دارد: ماتریس‌های بلند بیشترین سود را می‌برند. نسبت را همراهِ خطای بازسازی گزارش کنید — فشرده‌سازی به‌تنهایی بی‌معناست.'],
        hint: ['Storage = k*(n + p + 1) numbers for the truncated SVD versus n*p for the original. Plug in your real n and p.',
               'حجم = k*(n + p + 1) عدد برای SVD برش‌خورده در برابر n*p برای اصل. n و p واقعی‌تان را بگذارید.'],
        check: ['A table with k, bytes used, compression ratio and PSNR-like error.',
                'جدولی با k، بایتِ مصرفی، نسبتِ فشرده‌سازی و خطایی شبیه PSNR.'] },

      { title: ['PCA = the same SVD, read differently', 'PCA همان SVD با قرائتی دیگر'],
        body: ['Define scores = U[:, :k] * s[:k] and loadings = Vt[:k]. Show that these equal a projection onto the top eigenvectors of the covariance matrix by comparing with np.linalg.eigh on Xc.T @ Xc / (n-1). Plot explained-variance-ratio and find the smallest k capturing 90% of the variance.',
                'scores = U[:, :k] * s[:k] و loadings = Vt[:k] را تعریف کنید. نشان دهید این‌ها با تصویر روی بردارهای ویژه‌ی برترِ ماتریسِ کوواریانس برابرند، با مقایسه با np.linalg.eigh روی Xc.T @ Xc / (n-1). نمودارِ نسبتِ واریانسِ توضیح‌داده‌شده را رسم کنید و کوچک‌ترین k را بیابید که ۹۰٪ واریانس را می‌گیرد.'],
        code: ["n = Xc.shape[0]\nscores   = U[:, :2] * s[:2]              # coordinates in the 2-D latent space\nloadings = Vt[:2]                        # each row is a 'concept' in pixel space\n\n# the eigen-decomposition route must agree\nC = (Xc.T @ Xc) / (n - 1)\nw, V = np.linalg.eigh(C)\norder = np.argsort(w)[::-1]\nprint('variance from s  :', (s[:3] ** 2) / (n - 1))\nprint('variance from eig:', w[order][:3])\n\nexplained = (s ** 2) / (s ** 2).sum()\nk90 = int(np.searchsorted(np.cumsum(explained), 0.90) + 1)\nprint('components for 90% variance:', k90)",
               'python'],
        check: ['The two variance computations agree, and you know why s^2/(n-1) is the variance.',
                'دو محاسبه‌ی واریانس یکی‌اند و می‌دانید چرا s^2/(n-1) همان واریانس است.'] },

      { title: ['Look at the components (the fun part)', 'نگاه به مؤلفه‌ها (بخشِ لذت‌بخش)'],
        body: ['Reshape the first few rows of Vt back to image shape and display them as images. For faces these are "eigenfaces"; for text data the same trick gives latent topics. Reconstruct three real samples at k = 1, 5, 20 and display them side by side with the original.',
                'چند سطرِ نخستِ Vt را به شکل تصویر برگردانید و نمایش دهید. برای چهره‌ها این‌ها «چهره‌ویژه»اند؛ برای داده‌ی متنی همین ترفند موضوعاتِ پنهان می‌دهد. سه نمونه‌ی واقعی را با k = 1، ۵ و ۲۰ بازسازی و کنارِ اصل نمایش دهید.'],
        code: ["import matplotlib.pyplot as plt\n\nfig, axes = plt.subplots(1, 5, figsize=(11, 2.6))\nfor i, ax in enumerate(axes):\n    ax.imshow(Vt[i].reshape(8, 8), cmap='gray')\n    ax.set_title(f'PC {i+1}\\n{100*explained[i]:.1f}%')\n    ax.axis('off')\nplt.suptitle('loadings = what the components look like in pixel space')\n\nks = [1, 5, 20, 64]\nfig, axes = plt.subplots(len(ks), 4, figsize=(7, 7))\nfor r, k in enumerate(ks):\n    for c in range(4):\n        img = mu + reconstruct(Xc, U, s, Vt, k)[c]\n        axes[r][c].imshow(img.reshape(8, 8), cmap='gray', vmin=0, vmax=16)\n        axes[r][c].axis('off')\n        axes[r][c].set_title(f'k={k}' if c == 0 else '')",
               'python'],
        check: ['A figure of components and a reconstruction ladder you could show in an interview.',
                'یک شکل از مؤلفه‌ها و یک نردبانِ بازسازی که بتوانید در مصاحبه نشان دهید.'] },

      { title: ['Scale up: randomised SVD and timing', 'مقیاس‌دهی: SVD تصادفی و زمان‌سنجی'],
        body: ['Generate a 5000 x 2000 matrix and time full SVD versus sklearn.utils.extmath.randomized_svd with k = 20. Report speed-up and accuracy of the top-20 subspace. This is how production systems do low-rank work on matrices that do not fit comfortably.',
                'یک ماتریس ۵۰۰۰×۲۰۰۰ بسازید و زمانِ SVD کامل را با randomized_svd از sklearn.utils.extmath با k = 20 مقایسه کنید. سرعت و دقتِ زیرفضای ۲۰ تاییِ برتر را گزارش کنید. این همان روشی است که سیستم‌های تولیدی کارِ کم‌رتبه را روی ماتریس‌های بزرگ انجام می‌دهند.'],
        check: ['A timing table plus a statement of when randomised SVD is the right choice.',
                'جدولِ زمان‌سنجی به‌همراه بیانِ این‌که چه زمانی SVD تصادفی انتخابِ درست است.'] },

      { title: ['Write it up as one page', 'گزارش در یک صفحه'],
        body: ['Produce a single page: the error-vs-k curve, the compression table, the component figure, and three sentences on what the SVD actually does to the data. If you cannot explain the third item to a non-technical reader, redo the previous steps.',
                'یک صفحه بنویسید: منحنیِ خطا بر حسب k، جدولِ فشرده‌سازی، شکلِ مؤلفه‌ها و سه جمله درباره‌ی این‌که SVD واقعاً با داده چه می‌کند. اگر نتوانستید موردِ سوم را برای یک خواننده‌ی غیرفنی توضیح دهید، گام‌های قبل را دوباره بروید.'],
        check: ['One page, four artefacts, no unexplained jargon.',
                'یک صفحه، چهار خروجی، بدون اصطلاحِ توضیح‌نداده.'] }
    ],
    [
      ['A notebook with the SVD/PCA implementation, the error-vs-k curve with the Eckart-Young overlay, a compression-ratio table, the component visualisation and a one-paragraph conclusion.',
       'یک نوت‌بوک با پیاده‌سازیِ SVD/PCA، منحنیِ خطا بر حسب k همراه با منحنیِ اکارت-یانگ، جدولِ نسبتِ فشرده‌سازی، مصورسازیِ مؤلفه‌ها و نتیجه‌گیریِ یک‌پاراگرافی.'],
      ['A plot of reconstruction error vs k with the theoretical prediction.',
       'نمودارِ خطای بازسازی بر حسب k همراه با پیش‌بینیِ نظری.'],
      ['The component (eigenface) figure and the reconstruction ladder.',
       'شکلِ مؤلفه‌ها (چهره‌ویژه) و نردبانِ بازسازی.']
    ],
    [
      ['Reconstruction error matches the Eckart-Young bound to 4 decimals.',
       'خطای بازسازی با کرانِ اکارت-یانگ تا ۴ رقم اعشار یکی است.'],
      ['Explained-variance curve computed from s^2, cross-checked against the covariance eigenvalues.',
       'منحنیِ واریانسِ توضیح‌داده‌شده از s^2 محاسبه و با مقادیرِ ویژه‌ی کوواریانس تطبیق داده شده است.'],
      ['Compression reported in bytes with the reconstruction error stated alongside.',
       'فشرده‌سازی بر حسب بایت و همراه با خطای بازسازی گزارش شده است.'],
      ['The write-up explains the SVD in plain language.',
       'گزارش، SVD را به زبانِ ساده توضیح می‌دهد.']
    ],
    ['svd', 'pca', 'compression', 'numpy'],
    [R('3Blue1Brown — Essence of linear algebra', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', 'video'),
     R('sklearn randomized_svd docs', 'https://scikit-learn.org/stable/modules/generated/sklearn.utils.extmath.randomized_svd.html', 'doc')]
  );

  /* =================================================================
     2. CALCULUS — autodiff + optimizers from scratch
     ================================================================= */
  PJ('pj-calc', 'domain', 'calculus', 'intermediate', 8,
    ['Build an Autodiff Engine and Train a Network With It',
     'ساختِ موتورِ مشتق‌گیری خودکار و آموزشِ یک شبکه با آن'],
    ['Implement reverse-mode automatic differentiation over a tiny scalar/tensor graph, then write SGD, momentum and Adam on top and watch them behave differently on the same loss surface. You will never treat a gradient as magic again.',
     'مشتق‌گیری خودکارِ معکوس را روی یک گرافِ کوچک اسکالر/تانسور پیاده کنید، سپس SGD، مومنتوم و آدام را روی آن بنویسید و ببینید روی یک سطحِ هزینه‌ی یکسان چگونه متفاوت رفتار می‌کنند. پس از این، گرادیان دیگر برای‌تان جادو نخواهد بود.'],
    ['Two-moons / spirals synthetic data, then a MNIST subset (optional)',
     'داده‌ی مصنوعیِ دوماه/مارپیچ، سپس زیرمجموعه‌ای از MNIST (اختیاری)',
     'https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_moons.html'],
    [
      { title: ['Write the Value class', 'نوشتنِ کلاسِ Value'],
        body: ['Create a Value object holding data and grad, with __add__, __mul__, __pow__, relu, tanh and exp. Each operation records the inputs and a closure that pushes the gradient backwards (the chain rule, one line per operation).',
                'یک شیء Value بسازید که data و grad را نگه دارد، به‌همراه __add__، __mul__، __pow__، relu، tanh و exp. هر عمل، ورودی‌ها و یک closure را ثبت می‌کند که گرادیان را به عقب می‌راند (قاعده‌ی زنجیره‌ای، یک خط به‌ازای هر عمل.'],
        code: ["import math\n\nclass Value:\n    def __init__(self, data, _children=(), _op=''):\n        self.data = float(data); self.grad = 0.0\n        self._prev = set(_children); self._backward = lambda: None; self._op = _op\n\n    def __add__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.data + other.data, (self, other), '+')\n        def _backward():\n            self.grad  += out.grad          # d(a+b)/da = 1\n            other.grad += out.grad          # d(a+b)/db = 1\n        out._backward = _backward\n        return out\n\n    def __mul__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.data * other.data, (self, other), '*')\n        def _backward():\n            self.grad  += other.data * out.grad\n            other.grad += self.data  * out.grad\n        out._backward = _backward\n        return out\n\n    def relu(self):\n        out = Value(self.data if self.data > 0 else 0.0, (self,), 'ReLU')\n        out._backward = lambda: setattr(self, 'grad', self.grad + (out.data > 0) * out.grad)\n        return out\n\n    def backward(self):                     # topological sort, then unwind\n        topo, seen = [], set()\n        def build(v):\n            if v not in seen:\n                seen.add(v)\n                for c in v._prev: build(c)\n                topo.append(v)\n        build(self)\n        self.grad = 1.0\n        for v in reversed(topo): v._backward()",
               'python'],
        check: ['backward() fills .grad for every node exactly once, in reverse topological order.',
                'تابع backward مقدارِ grad را برای هر گره دقیقاً یک‌بار و به ترتیبِ معکوسِ توپولوژیک پُر می‌کند.'] },

      { title: ['Check the gradients numerically', 'بررسیِ عددیِ گرادیان‌ها'],
        body: ['For every operation, compare the analytic gradient from backward() with the central finite difference (f(x+h) - f(x-h)) / 2h. Use h = 1e-5 and assert a relative error below 1e-4. This test is the single most valuable habit in numerical code.',
                'برای هر عمل، گرادیانِ تحلیلیِ backward را با تفاضلِ متناهیِ مرکزی (f(x+h) - f(x-h)) / 2h مقایسه کنید. از h = 1e-5 استفاده کنید و خطای نسبیِ کمتر از 1e-4 را تأیید کنید. این آزمون ارزشمندترین عادت در کد عددی است.'],
        code: ["def gradcheck(f, x, h=1e-5, tol=1e-4):\n    \"\"\"f: Value -> Value ; returns analytic and numeric gradients at x.\"\"\"\n    xv = Value(x); y = f(xv); y.backward()\n    analytic = xv.grad\n    numeric  = (f(Value(x + h)).data - f(Value(x - h)).data) / (2 * h)\n    denom = max(1.0, abs(analytic), abs(numeric))\n    assert abs(analytic - numeric) / denom < tol, (analytic, numeric)\n    return analytic, numeric\n\nprint(gradcheck(lambda a: a * a * a + 2 * a, 1.7))   # 3a^2 + 2 = 10.67",
               'python'],
        hint: ['If the check fails only for ReLU, test away from 0 — ReLU has no derivative at the kink.',
               'اگر بررسی تنها برای ReLU شکست خورد، دور از صفر آزمایش کنید — ReLU در نقطه‌ی شکست مشتق ندارد.'],
        check: ['gradcheck passes for add, mul, pow, relu, tanh and a nested composition.',
                'بررسی برای جمع، ضرب، توان، relu، tanh و یک ترکیبِ تودرتو می‌گذرد.'] },

      { title: ['Assemble a tiny MLP and a loss', 'سرهم‌کردن یک MLP کوچک و یک تابع هزینه'],
        body: ['Build a Neuron, a Layer and an MLP with your Value, initialise weights with a scaled normal (1/sqrt(fan_in)), and write binary cross-entropy. Verify that the loss decreases over 200 steps — if it does not, your graph is wrong, not your optimiser.',
                'با کلاس Value یک Neuron، یک Layer و یک MLP بسازید، وزن‌ها را با نرمالِ مقیاس‌خورده (1/sqrt(fan_in)) مقداردهی کنید و آنتروپیِ متقاطعِ دودویی بنویسید. بررسی کنید هزینه در ۲۰۰ گام کم می‌شود — اگر نشد، مشکل از گرافِ شماست نه بهینه‌ساز.'],
        check: ['Loss decreases monotonically-ish on a linearly separable toy set.',
                'هزینه روی یک مجموعه‌ی اسباب‌بازیِ خطاپذیر به‌طور تقریباً یکنوا کم می‌شود.'] },

      { title: ['Write three optimizers by hand', 'نوشتنِ سه بهینه‌ساز با دست'],
        body: ['Implement SGD, SGD with momentum (with the sign convention you can defend) and Adam with bias correction. Train the same MLP on the two-moons set with each and plot the loss curves on one axis. Then sweep the learning rate over two orders of magnitude and find where each diverges.',
                'SGD، SGD با مومنتوم (با قراردادی که بتوانید از آن دفاع کنید) و آدام با تصحیحِ اُریب را پیاده کنید. همان MLP را با هر کدام روی مجموعه‌ی دوماه آموزش دهید و منحنی‌های هزینه را روی یک محور رسم کنید. سپس نرخِ یادگیری را در دو مرتبه‌ی بزرگی جارو کنید و نقطه‌ی واگراییِ هر کدام را بیابید.'],
        code: ["def adam(params, lr=1e-2, b1=0.9, b2=0.999, eps=1e-8):\n    m = [0.0] * len(params); v = [0.0] * len(params)\n    t = [0]\n    def step():\n        t[0] += 1\n        for i, p in enumerate(params):\n            m[i] = b1 * m[i] + (1 - b1) * p.grad\n            v[i] = b2 * v[i] + (1 - b2) * p.grad ** 2\n            mhat = m[i] / (1 - b1 ** t[0])          # bias correction\n            vhat = v[i] / (1 - b2 ** t[0])\n            p.data -= lr * mhat / (math.sqrt(vhat) + eps)\n    return step",
               'python'],
        hint: ['Momentum diverges at a smaller learning rate than plain SGD — it overshoots. Adam tolerates a much larger range, which is exactly why it is the default.',
               'مومنتوم در نرخِ یادگیریِ کوچک‌تری نسبت به SGD ساده واگرا می‌شود — چون بیش‌جهش می‌کند. آدام بازه‌ی بسیار بزرگ‌تری را تحمل می‌کند و دقیقاً به همین دلیل پیش‌فرض است.'],
        check: ['Three loss curves and a learning-rate-vs-final-loss curve for each optimizer.',
                'سه منحنیِ هزینه و یک منحنیِ نرخ‌یادگیری-در-برابر-هزینه‌ی نهایی برای هر بهینه‌ساز.'] },

      { title: ['See the conditioning problem', 'دیدنِ مسئله‌ی شرط‌گذاری'],
        body: ['Optimise a quadratic f(x, y) = 0.5(x^2 + kappa*y^2) with kappa = 1 and kappa = 30, starting from the same point. Record the number of steps to reach |grad| < 1e-6 for each optimizer. This is the clearest demonstration of why preconditioning matters.',
                'تابع درجه‌دوی f(x, y) = 0.5(x^2 + kappa*y^2) را با kappa = 1 و kappa = 30 از یک نقطه‌ی یکسان بهینه کنید. تعدادِ گام‌ها تا رسیدن به |grad| < 1e-6 را برای هر بهینه‌ساز ثبت کنید. این روشن‌ترین نمایشِ اهمیتِ پیش‌شرط‌سازی است.'],
        check: ['A table: optimizer x kappa -> steps to converge, plus a trajectory plot.',
                'جدولی: بهینه‌ساز × kappa → گام‌های تا همگرایی، به‌همراه نمودارِ مسیر.'] },

      { title: ['Add a scheduler and early stopping', 'افزودنِ زمان‌بند و توقفِ زودهنگام'],
        body: ['Add cosine decay and warmup to your training loop and a validation split with early stopping on validation loss. Show that early stopping is regularisation: with it, a slightly too-large model stops itself before overfitting.',
                'کاهشِ کسینوسی و گرم‌کردن را به حلقه‌ی آموزش بیفزایید و یک بخشِ اعتبارسنجی با توقفِ زودهنگام روی هزینه‌ی اعتبارسنجی. نشان دهید توقفِ زودهنگام خود یک منظم‌ساز است: با آن، مدلی کمی بزرگ‌تر پیش از بیش‌برازش خودش را متوقف می‌کند.'],
        check: ['A train/validation curve where the stopping point is marked and justified.',
                'نمودارِ آموزش/اعتبارسنجی که در آن نقطه‌ی توقف علامت و توجیه شده است.'] },

      { title: ['Compare against PyTorch on the same problem', 'مقایسه با پای‌تورچ روی همان مسئله'],
        body: ['Reproduce the same MLP in PyTorch on the same data with the same seed and confirm you get a comparable loss trajectory within noise. Then time 100 steps of your engine versus PyTorch to understand what the frameworks buy you (vectorisation, kernels, fused ops).',
                'همان MLP را در پای‌تورچ روی همان داده با همان دانه تکرار کنید و تأیید کنید مسیرِ هزینه‌ای قابل‌مقایسه در حدِ نویز می‌گیرید. سپز ۱۰۰ گامِ موتورِ خود را در برابر پای‌تورچ زمان‌بگیرید تا بفهمید چارچوب‌ها چه چیزی به شما می‌دهند (برداری‌سازی، کرنل‌ها، عمل‌های ترکیبی).'],
        check: ['Your engine and PyTorch agree on the loss trajectory; you can name three things the framework does better.',
                'موتورِ شما و پای‌تورچ در مسیرِ هزینه توافق دارند؛ و می‌توانید سه چیز را نام ببرید که چارچوب بهتر انجام می‌دهد.'] }
    ],
    [
      ['A working autodiff engine with gradcheck passing for every operation.',
       'یک موتورِ مشتق‌گیری خودکار که بررسیِ گرادیان برای همه‌ی عمل‌هایش می‌گذرد.'],
      ['SGD, momentum and Adam implemented from scratch, with loss curves and a learning-rate sweep.',
       'SGD، مومنتوم و آدام پیاده‌شده از پایه، با منحنی‌های هزینه و جاروی نرخِ یادگیری.'],
      ['The conditioning experiment (kappa = 1 vs 30) with a convergence table.',
       'آزمایشِ شرط‌گذاری (kappa = 1 در برابر ۳۰) با جدولِ همگرایی.'],
      ['A side-by-side comparison with PyTorch.',
       'مقایسه‌ی رو‌به‌رو با پای‌تورچ.']
    ],
    [
      ['Every operation passes a finite-difference gradient check.',
       'هر عمل، بررسیِ گرادیانِ تفاضلِ متناهی را می‌گذراند.'],
      ['Backward pass uses a topological sort and handles shared nodes (accumulating gradients).',
       'گذرِ پس‌رو از مرتب‌سازیِ توپولوژیک استفاده می‌کند و گره‌های مشترک را درست مدیریت می‌کند (جمع‌شدنِ گرادیان‌ها).'],
      ['Adam includes the bias-correction terms and you can explain why they exist.',
       'آدام جملاتِ تصحیحِ اُریب را دارد و می‌توانید توضیح دهید چرا وجود دارند.'],
      ['The loss decreases on real data, not just on toy expressions.',
       'هزینه روی داده‌ی واقعی کم می‌شود، نه فقط روی عبارت‌های اسباب‌بازی.']
    ],
    ['autodiff', 'optimizers', 'backprop', 'pytorch'],
    [R('The spelled-out intro to neural networks and backpropagation (Karpathy)', 'https://karpathy.medium.com/lesson-1-3-neural-networks-and-backpropagation-6c1e7ba50e4d', 'doc'),
     R('PyTorch autograd mechanics', 'https://docs.pytorch.org/notes/autograd.html', 'doc')]
  );

  /* =================================================================
     3. PROBABILITY — Monte Carlo engine
     ================================================================= */
  PJ('pj-prob', 'domain', 'probability', 'intermediate', 6,
    ['A Monte Carlo Engine: Risk, Queues and Statistical Power',
     'موتورِ مونت‌کارلو: ریسک، صف‌ها و توانِ آماری'],
    ['Build one simulation toolkit and use it for three very different jobs: value-at-risk for a portfolio, an M/M/1 queue you can check against theory, and a power simulator that tells you how many users an A/B test really needs. Simulation is the universal debugging tool for probabilistic intuition.',
     'یک جعبه‌ابزارِ شبیه‌سازی بسازید و آن را برای سه کارِ کاملاً متفاوت به کار ببرید: ارزش در معرض خطر برای یک پرتفوی، یک صفِ M/M/1 که بتوانید با نظریه بسنجید، و یک شبیه‌سازِ توان که بگوید یک تستِ A/B واقعاً به چند کاربر نیاز دارد. شبیه‌سازی ابزارِ همگانیِ اشکال‌زداییِ شهودِ احتمالاتی است.'],
    ['Synthetic — no download needed; optionally real daily returns from Yahoo Finance via yfinance',
     'مصنوعی — بدون نیاز به دانلود؛ در صورت تمایل بازده‌های روزانه‌ی واقعی از Yahoo Finance با yfinance',
     'https://pypi.org/project/yfinance/'],
    [
      { title: ['Reproducible random numbers', 'اعدادِ تصادفیِ تکرارپذیر'],
        body: ['Pick a Generator (np.random.default_rng(seed)), never the legacy global state. Write a small module with a seed argument threaded through every function so results are reproducible. Record the seed in every output artefact you produce.',
                'یک Generator برگزینید (np.random.default_rng(seed))، نه هرگز حالتِ سراسریِ قدیمی. یک ماژولِ کوچک بنویسید که آرگومانِ seed را به همه‌ی توابع ببرد تا نتایج تکرارپذیر باشد. دانه را در هر خروجی که تولید می‌کنید ثبت کنید.'],
        code: ["import numpy as np\n\nrng = np.random.default_rng(20240928)   # one seed, threaded everywhere\n\ndef normals(n, rng):\n    return rng.standard_normal(n)\n\ndef poissons(lam, n, rng):\n    return rng.poisson(lam, n)\n\nprint(normals(3, rng), poissons(2.5, 5, rng))\nprint('same seed -> same numbers:', normals(3, np.random.default_rng(20240928)))",
               'python'],
        check: ['Running the notebook twice gives byte-identical numbers.',
                'دو بار اجرای نوت‌بوک اعدادِ کاملاً یکسان می‌دهد.'] },

      { title: ['Sampling from what you only know up to a constant', 'نمونه‌برداری از چیزی که تا یک ضریب می‌شناسید'],
        body: ['Implement inverse-transform sampling for an exponential and a discrete distribution, and rejection sampling for a target you know only up to a normalising constant (e.g. a Beta(2, 5) built from an unnormalised density). Plot the empirical histogram against the true density.',
                'نمونه‌برداریِ معکوس-تبدیل را برای نمایی و یک توزیعِ گسسته پیاده کنید، و نمونه‌برداریِ ردّی را برای هدفی که تنها تا یک ضریبِ نرمال‌ساز می‌شناسید (مثلاً یک Beta(2, 5) ساخته از یک چگالیِ نرمال‌نشده). هیستوگرامِ تجربی را در برابر چگالیِ واقعی رسم کنید.'],
        code: ["def rejection_sample(target, proposal_sampler, proposal_pdf, M, n, rng):\n    out = []\n    while len(out) < n:\n        x = proposal_sampler(1000, rng)\n        u = rng.random(1000) * M * proposal_pdf(x)\n        out.extend(x[u <= target(x)])\n    return np.array(out[:n])\n\ntarget = lambda x: np.where((x > 0) & (x < 1), x ** 1 * (1 - x) ** 4, 0.0)   # Beta(2,5) kernel\nsamples = rejection_sample(target, lambda n, r: r.random(n), lambda x: np.ones_like(x), 1.0, 50_000, rng)\nprint('mean', samples.mean().round(4), '  theory 2/(2+5) =', round(2 / 7, 4))",
               'python'],
        hint: ['A bad M makes rejection sampling crawl: measure your acceptance rate and report it.',
               'یک M بد باعث می‌شود نمونه‌برداریِ ردّی بخزد: نرخِ پذیرش را اندازه بگیرید و گزارش کنید.'],
        check: ['Empirical mean and variance match theory to 2 decimals; acceptance rate reported.',
                'میانگین و واریانسِ تجربی با نظریه تا دو رقم اعشار یکی است؛ نرخِ پذیرش گزارش شده است.'] },

      { title: ['Monte Carlo integration and the 1/sqrt(N) law', 'انتگرال‌گیریِ مونت‌کارلو و قانونِ 1/sqrt(N)'],
        body: ['Estimate an integral with a known closed form (e.g. the volume of a d-ball, or E[exp(-x^2)]). Plot the absolute error against N on log-log axes for d = 2 and d = 10 and confirm the slope is about -1/2 regardless of d. This is the whole argument for Monte Carlo in high dimensions.',
                'یک انتگرال با فرمِ بسته‌ی معلوم برآورد کنید (مثلاً حجمِ یک گوی در بُعد d، یا E[exp(-x^2)]). خطای مطلق را بر حسب N روی محورهای لگاریتمی برای d = 2 و d = 10 رسم کنید و تأیید کنید شیب، مستقل از d، حدود ۱/۲- است. این تمامِ دلیلِ استفاده از مونت‌کارلو در ابعادِ بالاست.'],
        hint: ['Estimate the integral at N = 10^2, 10^3, 10^4, 10^5 and fit a line to log(error) vs log(N). The slope is the whole result — a single N proves nothing.',
               'انتگرال را در N = 10^2، 10^3، 10^4 و 10^5 برآورد کنید و یک خط به log(خطا) بر حسب log(N) برازش دهید. شیب خودِ نتیجه است — یک N یگانه چیزی را ثابت نمی‌کند.'],
        check: ['A log-log error plot with slope ≈ -0.5, and a note on how many samples 10x accuracy costs.',
                'نمودارِ خطا در مقیاسِ لگاریتمی با شیبِ ≈ ۰/۵- و یادداشتی درباره‌ی این‌که دقتِ ۱۰ برابر چند نمونه هزینه دارد.'] },

      { title: ['Value at Risk for a portfolio', 'ارزش در معرض خطر برای یک پرتفوی'],
        body: ['Simulate 250 daily returns for a 4-asset portfolio with a realistic correlation matrix (build it from a factor model, do not type numbers). Compute the distribution of the 1-day and 10-day P&L and report VaR at 95% and 99% plus expected shortfall. Compare the Gaussian assumption with a Student-t with 4 degrees of freedom and show how much the tail estimate moves.',
                '۲۵۰ بازده‌ی روزانه برای یک پرتفویِ چهار‌دارایی با یک ماتریسِ همبستگیِ واقع‌گرایانه شبیه‌سازی کنید (آن را از یک مدلِ عاملی بسازید، عدد تایپ نکنید). توزیعِ سود و زیانِ یک‌روزه و ده‌روزه را حساب کنید و VaR در ۹۵٪ و ۹۹٪ به‌همراه کسریِ مورد انتظار گزارش کنید. فرضِ گاوسی را با Student-t با ۴ درجه آزادی مقایسه کنید و نشان دهید برآوردِ دم چقدر جابه‌جا می‌شود.'],
        code: ["n_days, n_sims = 10, 200_000\nvol   = np.array([0.012, 0.018, 0.010, 0.025])      # daily vols\nbeta  = np.array([1.0, 0.6, 1.4, 0.2])              # exposure to one market factor\nidios = np.array([0.006, 0.011, 0.004, 0.020])\n\nz_mkt = rng.standard_normal((n_sims, n_days))\nz_id  = rng.standard_normal((n_sims, n_days, 4))\nret   = beta * z_mkt[..., None] * 0.009 + idios * z_id     # factor + idiosyncratic\n\npl = (1 + ret).prod(axis=1) @ np.array([0.3, 0.3, 0.2, 0.2]) - 1.0   # weighted P&L\nvar95, var99 = np.quantile(pl, [0.05, 0.01])\nes95 = pl[pl <= var95].mean()\nprint(f'10-day VaR 95%: {var95:.4f}   ES 95%: {es95:.4f}   VaR 99%: {var99:.4f}')",
               'python'],
        check: ['VaR and ES reported for both distributions, with the tail difference quantified.',
                'VaR و ES برای هر دو توزیع گزارش شده و تفاوتِ دم کمّی شده است.'] },

      { title: ['A queue you can check against theory', 'یک صف که بتوانید با نظریه بسنجید'],
        body: ['Simulate an M/M/1 queue: Poisson arrivals rate lambda, exponential service rate mu, one server. Measure mean waiting time and queue length, and compare with the theoretical rho/(mu - lambda) and rho/(1-rho). Sweep utilisation rho from 0.5 to 0.95 and show the waiting time exploding — the most useful operational lesson in the project.',
                'یک صفِ M/M/1 شبیه‌سازی کنید: ورودِ پواسون با نرخ lambda، سرویسِ نمایی با نرخ mu، یک خدمت‌دهنده. میانگینِ زمانِ انتظار و طولِ صف را اندازه بگیرید و با مقادیرِ نظری rho/(mu - lambda) و rho/(1-rho) مقایسه کنید. بهره‌وریِ rho را از ۰/۵ تا ۰/۹۵ جارو کنید و انفجارِ زمانِ انتظار را نشان دهید — مفیدترین درسِ عملیاتیِ این پروژه.'],
        check: ['Simulation matches theory within 2% at rho = 0.7, and the blow-up near rho = 0.95 is plotted.',
                'شبیه‌سازی در 0.7 = rho با نظریه در حدِ ۲٪ یکی است و انفجارِ نزدیکِ 0.95 = rho رسم شده است.'] },

      { title: ['A power simulator for A/B tests', 'شبیه‌سازِ توان برای تست‌های A/B'],
        body: ['Simulate an experiment: baseline conversion p0, a true lift delta, n users per arm, and a two-proportion test at alpha = 0.05. Repeat 5,000 times and record the fraction of significant results — that is the power. Plot power against n and find the sample size for 80% power. Then do the same with a continuous metric and CUPED adjustment to show the variance reduction in action.',
                'یک آزمایش شبیه‌سازی کنید: نرخِ تبدیلِ مبنا p0، یک بهبودِ واقعی delta، n کاربر در هر بازو و یک آزمونِ دو‌نسبتی با 0.05 = alpha. پنج هزار بار تکرار کنید و کسرِ نتایجِ معنادار را ثبت کنید — این همان توان است. توان را بر حسب n رسم کنید و حجمِ نمونه برای توانِ ۸۰٪ را بیابید. سپس همین را با یک معیارِ پیوسته و تصحیحِ CUPED تکرار کنید تا کاهشِ واریانس را در عمل نشان دهید.'],
        code: ["def simulate_power(p0, delta, n_per_arm, sims=5000, alpha=0.05, rng=None):\n    a = rng.binomial(1, p0, (sims, n_per_arm))\n    b = rng.binomial(1, p0 * (1 + delta), (sims, n_per_arm))\n    pa, pb = a.mean(1), b.mean(1)\n    pool = (pa * n_per_arm + pb * n_per_arm) / (2 * n_per_arm)\n    se = np.sqrt(pool * (1 - pool) * 2 / n_per_arm)\n    z = np.abs(pb - pa) / np.maximum(se, 1e-12)\n    return (z > 1.96).mean()          # fraction of significant runs = power\n\nfor n in [2000, 5000, 10_000, 20_000, 50_000]:\n    print(f'n={n:6d}/arm  power={simulate_power(0.10, 0.05, n, rng=rng):.3f}')",
               'python'],
        check: ['A power curve, the required n for 80% power, and the CUPED sample-size saving.',
                'منحنیِ توان، مقدارِ n لازم برای توانِ ۸۰٪، و صرفه‌جوییِ حجمِ نمونه با CUPED.'] },

      { title: ['Bootstrap coverage — is your interval honest?', 'پوششِ بوت‌استرپ — آیا فاصله‌ی شما صادق است؟'],
        body: ['Draw samples from a skewed distribution, compute a percentile bootstrap 95% CI for the mean, and repeat 2,000 times to measure the empirical coverage. Repeat for n = 10, 30, 100. Coverage near 95% means the method is honest; gross under-coverage at small n is a real finding, not a bug.',
                'از یک توزیعِ دارای چولگی نمونه بکشید، یک فاصله‌ی اطمینانِ ۹۵٪ بوت‌استرپِ صدکی برای میانگین حساب کنید و ۲۰۰۰ بار تکرار کنید تا پوششِ تجربی اندازه گرفته شود. برای n = 10، ۳۰ و ۱۰۰ تکرار کنید. پوششِ نزدیکِ ۹۵٪ یعنی روش صادق است؛ کم‌پوششیِ شدید در n کوچک یک یافته‌ی واقعی است نه باگ.'],
        hint: ['Coverage is the fraction of intervals containing the true mean. With skewed data and n = 10 you should see it well below 95% — that is a property of the method, not a bug in your code.',
               'پوشش همان کسرِ بازه‌هایی است که میانگینِ واقعی را در بر می‌گیرند. با داده‌ی چوله و n = 10 باید آن را بسیار پایین‌تر از ۹۵٪ ببینید — این ویژگیِ روش است، نه باگی در کد شما.'],
        check: ['A coverage table by n, discussed honestly.',
                'جدولِ پوشش بر حسب n، با بحثی صادقانه.'] }
    ],
    [
      ['A seeded simulation module with inverse-transform and rejection samplers.',
       'یک ماژولِ شبیه‌سازیِ دانه‌دار با نمونه‌بردارهای معکوس-تبدیل و ردّی.'],
      ['The 1/sqrt(N) error plot in two dimensions.',
       'نمودارِ خطای 1/sqrt(N) در دو بُعد.'],
      ['VaR / expected-shortfall comparison for Gaussian vs Student-t.',
       'مقایسه‌ی VaR و کسریِ مورد انتظار برای گاوسی در برابر Student-t.'],
      ['Queue simulation validated against M/M/1 theory, with the utilisation sweep.',
       'شبیه‌سازیِ صف که با نظریه‌ی M/M/1 سنجیده شده، به‌همراه جاروی بهره‌وری.'],
      ['A power curve with the required sample size, plus the CUPED comparison.',
       'منحنیِ توان با حجمِ نمونه‌ی لازم، به‌همراه مقایسه‌ی CUPED.']
    ],
    [
      ['Results are reproducible from a single seed.',
       'نتایج از یک دانه‌ی واحد تکرارپذیرند.'],
      ['At least one result is validated against a closed-form answer (the queue, or the Beta mean).',
       'دست‌کم یک نتیجه در برابر پاسخِ فرم‌بسته سنجیده شده است (صف، یا میانگینِ بتا).'],
      ['The error-vs-N plot shows the -1/2 slope.',
       'نمودارِ خطا بر حسب N شیبِ ۱/۲- را نشان می‌دهد.'],
      ['The power simulator reports power, not just p-values.',
       'شبیه‌سازِ توان، توان را گزارش می‌کند نه فقط مقادیرِ p را.']
    ],
    ['monte-carlo', 'simulation', 'risk', 'power', 'bootstrap'],
    [R('Monte Carlo methods — MIT 6.0002 style notes', 'https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/', 'course'),
     R('Trustworthy Online Controlled Experiments (Kohavi et al.)', 'https://experimentguide.com/', 'book')]
  );

  /* =================================================================
     4. STATISTICS — causal inference study
     ================================================================= */
  PJ('pj-stat', 'domain', 'statistics', 'advanced', 8,
    ['Causal Inference Study: Did the Intervention Actually Work?',
     'مطالعه‌ی استنتاجِ علّی: آیا مداخله واقعاً اثر داشت؟'],
    ['Generate data with a known causal effect and a confounder, then try to recover the truth: first naively (wrong), then with back-door adjustment, then with propensity weighting, then with difference-in-differences. Finish with a sensitivity analysis that says how strong an unmeasured confounder would have to be to explain your result away.',
     'داده‌ای با اثرِ علّیِ معلوم و یک متغیرِ مخدوش‌کننده تولید کنید، سپس تلاش کنید حقیقت را بازیابید: نخست ساده‌لوحانه (غلط)، سپس با تعدیلِ درِ پشتی، سپس با وزن‌دهیِ تمایل، و سپس با تفاضل‌در-تفاضل. با یک تحلیلِ حساسیت تمام کنید که بگوید یک متغیرِ مخدوش‌کننده‌ی اندازه‌گیری‌نشده باید چقدر قوی باشد تا نتیجه‌ی شما را توضیح دهد.'],
    ['Simulated (you control the truth) + optionally an observational dataset such as the Lalonde job-training sample',
     'شبیه‌سازی‌شده (شما حقیقت را تعیین می‌کنید) + در صورت تمایل یک مجموعه‌داده‌ی مشاهده‌ای مانند نمونه‌ی آموزشِ شغلیِ لالوند',
     'https://www.stata-press.com/data/r16/cps1re74.dta'],
    [
      { title: ['Draw the DAG before touching the data', 'پیش از دست‌زدن به داده، DAG را بکشید'],
        body: ['Write down the causal graph: treatment T, outcome Y, confounder Z, an instrument or a mediator if you have one, and a collider you will deliberately avoid conditioning on. Decide which paths are back-door paths and which set of variables closes them. Analysis without the DAG is guesswork with extra steps.',
                'گرافِ علّی را بنویسید: درمان T، پیامد Y، متغیرِ مخدوش‌کننده Z، یک متغیرِ ابزاری یا میانجی اگر دارید، و یک برخوردکننده که عمداً روی آن شرطی نمی‌کنید. تصمیم بگیرید کدام مسیرها درِ پشتی‌اند و کدام مجموعه‌متغیر آن‌ها را می‌بندد. تحلیل بدونِ DAG حدس‌زدن با مراحلِ اضافه است.'],
        check: ['A DAG with the adjustment set you will use, stated before you look at the estimates.',
                'یک DAG با مجموعه‌ی تعدیلی که استفاده می‌کنید، پیش از نگاه به برآوردها.'] },

      { title: ['Simulate ground truth', 'شبیه‌سازیِ حقیقتِ زمینه'],
        body: ['Generate 20,000 rows where the true average treatment effect is a constant you choose (say 1.5 units), Z affects both T and Y, and there is a collider C caused by both. Store the individual-level counterfactuals Y(0) and Y(1) — you can never see these in reality, which is exactly why they make the exercise honest.',
                '۲۰۰۰۰ سطر تولید کنید که در آن اثرِ متوسطِ درمان یک مقدارِ ثابت به انتخابِ شماست (مثلاً ۱/۵ واحد)، Z هم بر T اثر دارد هم بر Y، و یک برخوردکننده‌ی C وجود دارد که از هر دو ناشی می‌شود. پادواقعیت‌های سطحِ فرد یعنی Y(0) و Y(1) را ذخیره کنید — در واقعیت هرگز این‌ها را نمی‌بینید، و دقیقاً به همین دلیل تمرین را صادقانه می‌کنند.'],
        code: ["import numpy as np\nrng = np.random.default_rng(7)\nn = 20_000\n\nZ = rng.normal(size=n)                       # confounder: drives T and Y\nT = rng.binomial(1, 1 / (1 + np.exp(-(0.8 * Z - 0.2))))   # treatment depends on Z\ntau = 1.5                                    # the TRUE causal effect\nY0 = 2.0 + 1.2 * Z + rng.normal(scale=0.5, size=n)\nY1 = Y0 + tau\nY  = np.where(T == 1, Y1, Y0)\nC  = (T + rng.normal(scale=0.5, size=n) > 1).astype(int)   # collider: caused by T and noise\n\nprint('true ATE', tau)\nprint('naive difference in means', (Y[T == 1].mean() - Y[T == 0].mean()).round(3))",
               'python'],
        check: ['The naive difference is visibly biased, and you can explain where the bias comes from.',
                'تفاوتِ ساده‌لوحانه آشکارا اُریب است و می‌توانید توضیح دهید این اُریب از کجا می‌آید.'] },

      { title: ['The wrong moves: conditioning on a collider', 'حرکت‌های غلط: شرطی‌کردن روی برخوردکننده'],
        body: ['Estimate the effect three ways: (a) naive difference in means, (b) regression on T plus the collider C, (c) regression on T plus the confounder Z. Show that (b) creates bias where none existed, while (c) recovers the truth. This is the single most common error in observational analysis.',
                'اثر را سه‌گونه برآورد کنید: (الف) تفاضلِ ساده‌ی میانگین‌ها، (ب) رگرسیون روی T به‌همراه برخوردکننده‌ی C، (ج) رگرسیون روی T به‌همراه متغیرِ مخدوش‌کننده‌ی Z. نشان دهید (ب) اُریبی ایجاد می‌کند که وجود نداشت، در حالی که (ج) حقیقت را بازیابی می‌کند. این رایج‌ترین خطا در تحلیلِ مشاهده‌ای است.'],
        hint: ['The confounder opens a back-door path and must be conditioned on; the collider closes a path and must NOT be conditioned on. Same action, opposite consequences.',
               'متغیرِ مخدوش‌کننده یک مسیرِ درِ پشتی باز می‌کند و باید روی آن شرطی شوید؛ برخوردکننده مسیری را می‌بندد و نباید روی آن شرطی شوید. یک کنش، دو پیامدِ متضاد.'],
        check: ['A three-row table with the bias of each estimate relative to the true effect.',
                'جدولی سه‌سطره با مقدارِ اُریبیِ هر برآورد نسبت به اثرِ واقعی.'] },

      { title: ['Back-door adjustment and stratification', 'تعدیلِ درِ پشتی و طبقه‌بندی'],
        body: ['Estimate the effect by stratifying on Z (bin it into deciles, estimate within each, average with weights) and compare with a regression that includes Z linearly and one that includes it flexibly (splines). Report the estimate and its standard error for each.',
                'اثر را با طبقه‌بندی روی Z برآورد کنید (تقسیم به دهک‌ها، برآورد درونِ هر کدام، میانگینِ وزن‌دار) و با رگرسیونی که Z را خطی و رگرسیونی که آن را منعطف (اسپلاین) وارد می‌کند مقایسه کنید. برآورد و خطای استانداردِ هر کدام را گزارش کنید.'],
        check: ['Stratified and flexible-regression estimates both land within two standard errors of the truth.',
                'برآوردهای طبقه‌بندی‌شده و رگرسیونِ منعطف هر دو در محدوده‌ی دو خطای استانداردِ حقیقت قرار می‌گیرند.'] },

      { title: ['Propensity scores: weighting, matching, overlap', 'نمره‌های تمایل: وزن‌دهی، همتاسازی، هم‌پوشانی'],
        body: ['Fit a propensity model P(T=1|X), plot the score distributions for treated and control, and check overlap (or you are extrapolating). Compute IPW and stabilised IPW estimates, then a matched estimate (nearest neighbour on the logit of the score with a caliper). Compare all three with the truth and report the standard errors honestly — weighting inflates them.',
                'یک مدلِ تمایل P(T=1|X) برازش دهید، توزیعِ نمره‌ها را برای گروهِ درمان و کنترل رسم کنید و هم‌پوشانی را بررسی کنید (وگرنه دارید برون‌یابی می‌کنید). برآوردهای IPW و IPW پایدارشده را حساب کنید، سپس یک برآوردِ همتاسازی‌شده (نزدیک‌ترین همسایه روی لوجیتِ نمره با یک کالیپر). هر سه را با حقیقت مقایسه کنید و خطاهای استاندارد را صادقانه گزارش کنید — وزن‌دهی آن‌ها را بزرگ می‌کند.'],
        code: ["from sklearn.linear_model import LogisticRegression\nps = LogisticRegression().fit(Z.reshape(-1, 1), T).predict_proba(Z.reshape(-1, 1))[:, 1]\n\n# overlap check\nprint('score range treated ', np.percentile(ps[T == 1], [1, 50, 99]).round(3))\nprint('score range control  ', np.percentile(ps[T == 0], [1, 50, 99]).round(3))\n\n# inverse probability weighting (ATE)\nw   = np.where(T == 1, 1 / ps, 1 / (1 - ps))\nate = (w * T * Y).sum() / (w * T).sum() - (w * (1 - T) * Y).sum() / (w * (1 - T)).sum()\nprint('IPW estimate of ATE:', round(ate, 3), ' (truth 1.5)')",
               'python'],
        hint: ['Check overlap before weighting: if treated units have propensities near 1 and controls near 0, no weighting can rescue the comparison — you are extrapolating and must trim.',
               'هم‌پوشانی را پیش از وزن‌دهی بررسی کنید: اگر تمایل‌های گروهِ درمان نزدیکِ ۱ و گروهِ کنترل نزدیکِ ۰ باشد، هیچ وزن‌دهی‌ای مقایسه را نجات نمی‌دهد — شما برون‌یابی می‌کنید و باید هرس کنید.'],
        check: ['An overlap plot, an IPW estimate, a matched estimate, and trimmed weights if any score is near 0 or 1.',
                'نمودارِ هم‌پوشانی، یک برآوردِ IPW، یک برآوردِ همتاسازی‌شده، و وزن‌های هرس‌شده اگر نمره‌ای نزدیکِ ۰ یا ۱ است.'] },

      { title: ['Difference-in-differences with a placebo test', 'تفاضل‌در-تفاضل با یک آزمونِ دارونما'],
        body: ['Simulate a panel (two groups, pre and post period) where the parallel-trends assumption holds, estimate the DiD coefficient with an interaction term, and run a placebo test on the pre-period only (the effect must be ~0). Then break parallel trends on purpose and show the DiD estimate going wrong.',
                'یک پانل شبیه‌سازی کنید (دو گروه، دوره‌ی پیش و پس) که در آن فرضِ روندهای موازی برقرار است، ضریبِ DiD را با یک جمله‌ی تعاملی برآورد کنید و یک آزمونِ دارونما تنها روی دوره‌ی پیش اجرا کنید (اثر باید ~۰ باشد). سپس عمداً روندهای موازی را بشکنید و نشان دهید برآوردِ DiD غلط می‌شود.'],
        check: ['A DiD estimate, a placebo test that passes, and a counter-example where it fails.',
                'یک برآوردِ DiD، یک آزمونِ دارونما که می‌گذرد، و یک مثالِ نقض که در آن شکست می‌خورد.'] },

      { title: ['Sensitivity analysis: how fragile is the claim?', 'تحلیلِ حساسیت: ادعا چقدر شکننده است؟'],
        body: ['Quantify how strong an unmeasured confounder would have to be to move your estimate to zero (an E-value style argument, or a simple simulation adding a hidden Z2 with varying strength). Report the required strength and judge whether it is plausible in your setting.',
                'کمّی کنید یک متغیرِ مخدوش‌کننده‌ی اندازه‌گیری‌نشده باید چقدر قوی باشد تا برآوردِ شما را به صفر برساند (استدلالی در سبکِ E-value، یا یک شبیه‌سازیِ ساده که یک Z2 پنهان با قدرتِ متغیر می‌افزاید). قدرتِ لازم را گزارش کنید و قضاوت کنید آیا در موقعیتِ شما محتمل است.'],
        hint: ['A simple version: add a hidden confounder Z2 correlated with both T and Y at strength r, re-estimate, and find the r at which your effect hits zero. That r is your fragility number.',
               'یک نسخه‌ی ساده: یک متغیرِ مخدوش‌کننده‌ی پنهانِ Z2 بیفزایید که با قدرتِ r هم با T هم با Y همبسته است، دوباره برآورد کنید و r ای را بیابید که در آن اثر به صفر می‌رسد. آن r همان عددِ شکنندگیِ شماست.'],
        check: ['A number ("a confounder would need RR ≥ X") and a plausibility judgement.',
                'یک عدد («یک متغیرِ مخدوش‌کننده باید RR ≥ X می‌داشت») و یک قضاوت درباره‌ی محتمل بودنش.'] },

      { title: ['Write the honest report', 'نوشتنِ گزارشِ صادقانه'],
        body: ['One page for a decision maker: the question, the identifying assumption in plain words, the estimate with an interval, what would change the conclusion, and what you would randomise if you could. No causal verb without its assumption attached.',
                'یک صفحه برای تصمیم‌گیرنده: پرسش، فرضِ شناسایی به زبانِ ساده، برآورد با یک بازه، چه چیزی نتیجه را تغییر می‌دهد، و اگر می‌توانستید چه چیزی را تصادفی‌سازی می‌کردید. هیچ فعلِ علّی بدونِ فرضِ همراهش.'],
        check: ['One page, and every causal claim is paired with its assumption.',
                'یک صفحه، و هر ادعای علّی همراه با فرضش.'] }
    ],
    [
      ['A simulated dataset with known counterfactuals.',
       'یک مجموعه‌داده‌ی شبیه‌سازی‌شده با پادواقعیت‌های معلوم.'],
      ['A comparison table: naive / collider / adjusted / IPW / matched / DiD versus the truth.',
       'جدولِ مقایسه: ساده‌لوحانه / برخوردکننده / تعدیل‌شده / IPW / همتاسازی‌شده / DiD در برابر حقیقت.'],
      ['An overlap plot and a placebo test.',
       'نمودارِ هم‌پوشانی و یک آزمونِ دارونما.'],
      ['A one-page report with the sensitivity analysis.',
       'گزارشی یک‌صفحه‌ای با تحلیلِ حساسیت.']
    ],
    [
      ['The DAG and adjustment set are stated before estimation.',
       'DAG و مجموعه‌ی تعدیل پیش از برآورد بیان شده‌اند.'],
      ['The collider experiment demonstrates bias created by conditioning.',
       'آزمایشِ برخوردکننده نشان می‌دهد شرطی‌کردن چه اُریبی می‌سازد.'],
      ['Overlap is checked before weighting.',
       'هم‌پوشانی پیش از وزن‌دهی بررسی شده است.'],
      ['The conclusion is stated with the identifying assumption and a sensitivity bound.',
       'نتیجه با فرضِ شناسایی و یک کرانِ حساسیت بیان شده است.']
    ],
    ['causal-inference', 'dag', 'propensity', 'did', 'sensitivity'],
    [R('Causal Inference: The Mixtape', 'https://mixtape.scunning.com/', 'book'),
     R('DoWhy / PyWhy', 'https://www.pywhy.org/dowhy/', 'tool')]
  );

  /* =================================================================
     5. PROGRAMMING — reproducible analytics pipeline
     ================================================================= */
  PJ('pj-prog', 'domain', 'programming', 'beginner', 8,
    ['A Reproducible Analytics Pipeline: Parquet, DuckDB, Tests, CI',
     'یک خطِ لوله‌ی تحلیلیِ تکرارپذیر: Parquet، DuckDB، آزمون‌ها، CI'],
    ['Build the project structure that survives past one notebook: raw data immutable, validated inputs, SQL transformations, data-quality tests, unit tests, and a CI run that fails the build when the data breaks. This is the difference between a script and a system.',
     'ساختارِ پروژه‌ای را بسازید که از یک نوت‌بوک فراتر می‌رود: داده‌ی خام دست‌نخورده، ورودی‌های اعتبارسنجی‌شده، تبدیل‌های SQL، آزمون‌های کیفیتِ داده، آزمون‌های واحد، و اجرایی در CI که وقتی داده خراب می‌شود ساخت را شکست می‌دهد. این همان تفاوتِ یک اسکریپت با یک سیستم است.'],
    ['NYC taxi trips (public Parquet), or any 1-10 GB CSV you care about',
     'سفرهای تاکسیِ نیویورک (Parquet عمومی)، یا هر CSV یک تا ده گیگابایتی که برای‌تان مهم است',
     'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page'],
    [
      { title: ['Skeleton and environment', 'اسکلت و محیط'],
        body: ['Create the layout: data/{raw,interim,processed}, src/{ingest,transform,report}, tests/, Makefile, pyproject.toml and a locked environment (uv or pip-tools). The rule: code that reads raw data never writes to raw.',
                'چیدمان را بسازید: data/{raw,interim,processed}، src/{ingest,transform,report}، tests/، Makefile، pyproject.toml و یک محیطِ قفل‌شده (uv یا pip-tools). قاعده: کدی که داده‌ی خام می‌خواند هرگز در خام نمی‌نویسد.'],
        code: ["# one-line environment with uv (or: python -m venv .venv && pip install -r requirements.txt)\nuv venv && uv pip install polars duckdb pytest pandera great-expectations\n\n# Makefile targets every project needs\ncat > Makefile <<'EOF'\n.PHONY: setup ingest transform test lint all\nsetup:     ; uv pip install -r requirements.txt\ningest:    ; python -m src.ingest\ntransform: ; python -m src.transform\ntest:      ; pytest -q tests\nall: ingest transform test\nEOF",
               'bash'],
        check: ['A fresh clone runs `make all` on a clean machine.',
                'یک کلونِ تازه روی یک ماشینِ تمیز `make all` را اجرا می‌کند.'] },

      { title: ['Ingest: CSV to typed Parquet', 'درون‌ریزی: از CSV به Parquetِ نوع‌دار'],
        body: ['Write an ingest script that reads the raw CSV with an explicit schema (dtypes declared, not inferred), writes partitioned Parquet, and records a manifest (row count, column types, file size, checksum). Never let the reader guess your types — that is how a zip code silently becomes a float.',
                'یک اسکریپتِ درون‌ریزی بنویسید که CSV خام را با یک طرح‌واره‌ی صریح می‌خواند (انواع اعلام‌شده، نه استنباط‌شده)، Parquetِ بخش‌بندی‌شده می‌نویسد و یک مانیفست ثبت می‌کند (تعدادِ سطر، انواعِ ستون، اندازه‌ی فایل، چکسام). هرگز نگذارید خواننده نوع‌ها را حدس بزند — کدِ پستی همین‌طور است که بی‌صدا به عددِ اعشاری تبدیل می‌شود.'],
        code: ["import polars as pl, hashlib, json, pathlib\n\nSCHEMA = {'VendorID': pl.Int32, 'tpep_pickup_datetime': pl.Datetime,\n          'tpep_dropoff_datetime': pl.Datetime, 'passenger_count': pl.Int32,\n          'trip_distance': pl.Float64, 'total_amount': pl.Float64}\n\ndef ingest(src='data/raw/trips.csv', out='data/interim/trips.parquet'):\n    df = pl.read_csv(src, schema_overrides=SCHEMA, try_parse_dates=True)\n    df.write_parquet(out)\n    meta = {'rows': df.height, 'cols': df.width,\n            'sha256': hashlib.sha256(pathlib.Path(src).read_bytes()).hexdigest()[:16],\n            'dtypes': {c: str(t) for c, t in zip(df.columns, df.dtypes)}}\n    pathlib.Path('data/interim/manifest.json').write_text(json.dumps(meta, indent=2))\n    return df",
               'python'],
        check: ['Parquet written with the intended dtypes, plus a manifest file.',
                'Parquet با انواعِ مورد نظر نوشته شده، به‌همراه یک فایلِ مانیفست.'] },

      { title: ['Data-quality contract with tests that fail loudly', 'قراردادِ کیفیتِ داده با آزمون‌هایی که بلند شکست می‌خورند'],
        body: ['Define expectations: not-null columns, accepted ranges, unique keys, referential integrity, freshness. Implement them as pytest tests (or pandera/Great Expectations) and deliberately corrupt a copy of the data to prove the tests actually fail.',
                'انتظارها را تعریف کنید: ستون‌های غیرتهی، بازه‌های پذیرفته، کلیدهای یکتا، یکپارچگیِ ارجاعی، تازگی. آن‌ها را به‌شکل آزمون‌های pytest (یا pandera/Great Expectations) پیاده کنید و عمداً یک کپی از داده را خراب کنید تا ثابت کنید آزمون‌ها واقعاً شکست می‌خورند.'],
        code: ["import duckdb\n\ndef quality_checks(con):\n    bad = {}\n    q = lambda s: con.execute(s).fetchone()[0]\n    bad['null_pickup']     = q('SELECT count(*) FROM trips WHERE tpep_pickup_datetime IS NULL')\n    bad['negative_amount'] = q('SELECT count(*) FROM trips WHERE total_amount < 0')\n    bad['zero_distance']   = q('SELECT count(*) FROM trips WHERE trip_distance <= 0')\n    bad['future_dates']    = q(\"SELECT count(*) FROM trips WHERE tpep_pickup_datetime > current_date\")\n    bad['dup_rows']        = q('SELECT count(*) - count(DISTINCT *) FROM trips')\n    assert not any(bad.values()), f'data contract violated: {bad}'\n    return bad\n\ncon = duckdb.connect()\ncon.execute(\"CREATE VIEW trips AS SELECT * FROM 'data/interim/trips.parquet'\")\nprint(quality_checks(con))",
               'python'],
        hint: ['A test that has never failed is untested. Corrupt one file on purpose and watch it go red.',
               'آزمونی که هرگز شکست نخورده، آزمایش‌نشده است. عمداً یک فایل را خراب کنید و قرمز شدنش را تماشا کنید.'],
        hint: ['A test that has never failed is untested. Corrupt a copy on purpose — flip a sign, null a column, duplicate rows — and watch the suite go red.',
               'آزمونی که هرگز شکست نخورده، آزمایش‌نشده است. عمداً یک کپی را خراب کنید — علامتی را برگردانید، ستونی را تهی کنید، سطرها را تکراری کنید — و قرمز شدنِ مجموعه را تماشا کنید.'],
        check: ['A green suite on good data and a red one on corrupted data.',
                'یک مجموعه‌ی سبز روی داده‌ی سالم و قرمز روی داده‌ی خراب.'] },

      { title: ['Transform with SQL, not with chained dataframes', 'تبدیل با SQL، نه با دیتافریم‌های زنجیره‌ای'],
        body: ['Move the business logic into versioned .sql files executed by DuckDB: cleaning, joins, aggregations, window functions. Compare the runtime and memory of the SQL path against the equivalent pandas/Polars chain and note where each wins.',
                'منطقِ کسب‌وکار را به فایل‌های .sql نسخه‌دار منتقل کنید که DuckDB اجرا می‌کند: پاک‌سازی، پیوندها، تجمیع‌ها، توابعِ پنجره. زمان و حافظه‌ی مسیرِ SQL را با زنجیره‌ی معادلِ pandas/Polars مقایسه کنید و یادداشت کنید هر کدام کجا برنده است.'],
        code: ["-- sql/daily_metrics.sql\nWITH clean AS (\n  SELECT date_trunc('day', tpep_pickup_datetime) AS day,\n         trip_distance, total_amount, passenger_count,\n         EXTRACT(hour FROM tpep_pickup_datetime)  AS hour\n  FROM trips\n  WHERE total_amount > 0 AND trip_distance BETWEEN 0.1 AND 100\n)\nSELECT day,\n       count(*)                                   AS trips,\n       round(avg(total_amount), 2)                AS avg_fare,\n       round(quantile_cont(total_amount, 0.95), 2) AS p95_fare,\n       round(avg(trip_distance), 2)               AS avg_distance\nFROM clean\nGROUP BY day\nHAVING count(*) > 50\nORDER BY day",
               'sql'],
        check: ['A versioned SQL file, a benchmark table (SQL vs dataframe), and the resulting metrics table.',
                'یک فایلِ SQL نسخه‌دار، جدولِ محک‌زنی (SQL در برابر دیتافریم) و جدولِ معیارهای حاصل.'] },

      { title: ['Incremental runs and idempotency', 'اجراهای افزایشی و یکّه‌بودن'],
        body: ['Make the pipeline idempotent: running it twice produces identical outputs, and a re-run only recomputes new partitions. Add a --full-refresh flag for the rare rebuild. Idempotency is what lets you re-run after a failure without thinking.',
                'خطِ لوله را یکّه (idempotent) کنید: دو بار اجرای آن خروجی‌های یکسان می‌دهد و اجرای مجدد تنها بخش‌های جدید را بازمی‌حسابد. یک پرچم --full-refresh برای بازسازیِ نادر بیفزایید. یکّه‌بودن همان چیزی است که اجازه می‌دهد پس از شکست، بدون فکر کردن دوباره اجرا کنید.'],
        hint: ['Idempotency trick: write to a temporary partition, verify, then atomically swap. That way a crash mid-run leaves the previous good output in place.',
               'ترفندِ یکّه‌بودن: در یک بخشِ موقت بنویسید، تأیید کنید، سپس به‌صورت اتمی جابه‌جا کنید. بدین ترتیب یک سقوطِ میان‌راه، خروجیِ خوبِ قبلی را سرِ جایش می‌گذارد.'],
        check: ['Two consecutive runs produce identical checksums; a new partition is picked up incrementally.',
                'دو اجرای پیاپی چکسام‌های یکسان می‌دهد؛ یک بخشِ جدید به‌صورت افزایشی دریافت می‌شود.'] },

      { title: ['Wire it into CI', 'اتصال به CI'],
        body: ['Add a GitHub Actions workflow that installs the locked environment, runs the pipeline on a small sample and runs pytest on every push. Add a scheduled daily run that executes the quality checks against fresh data and opens an issue when the contract breaks.',
                'یک گردش‌کارِ GitHub Actions بیفزایید که محیطِ قفل‌شده را نصب می‌کند، خطِ لوله را روی یک نمونه‌ی کوچک اجرا می‌کند و روی هر push، pytest را اجرا می‌کند. یک اجرای روزانه‌‌ی زمان‌بندی‌شده بیفزایید که آزمون‌های کیفیت را روی داده‌ی تازه اجرا می‌کند و وقتی قرارداد می‌شکند یک issue باز می‌کند.'],
        code: ["# .github/workflows/data.yml\nname: data pipeline\non:\n  push: { branches: [main] }\n  schedule: [{ cron: '17 6 * * *' }]\njobs:\n  run:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: { python-version: '3.12' }\n      - run: pip install -r requirements.txt\n      - run: make ingest transform\n      - run: pytest -q tests",
               'yaml'],
        check: ['A badge-green workflow and proof that a broken contract turns it red.',
                'یک گردش‌کار با نشانِ سبز و مدرکی که یک قراردادِ شکسته آن را قرمز می‌کند.'] },

      { title: ['Document lineage and hand it over', 'مستندسازیِ تبارِ داده و تحویل'],
        body: ['Write a README with a one-paragraph purpose, a dependency diagram (raw -> interim -> processed), how to run it, where the data comes from, and the data dictionary. Then ask someone else to run `make all` from scratch — if they cannot, fix the README, not them.',
                'یک README بنویسید با یک پاراگراف هدف، نمودارِ وابستگی (خام → میانی → پردازش‌شده)، نحوه‌ی اجرا، منبعِ داده و واژه‌نامه‌ی داده. سپس از کسی دیگر بخواهید `make all` را از صفر اجرا کند — اگر نتوانست، README را درست کنید نه او را.'],
        check: ['A README someone else followed successfully.',
                'یک README که کسِ دیگری با موفقیت از آن پیروی کرده است.'] }
    ],
    [
      ['A repository with the standard layout and a locked environment.',
       'یک مخزن با چیدمانِ استاندارد و یک محیطِ قفل‌شده.'],
      ['Parquet outputs plus a manifest with checksums.',
       'خروجی‌های Parquet به‌همراه مانیفستی با چکسام‌ها.'],
      ['A data-quality test suite proven to fail on corrupted input.',
       'مجموعه‌ی آزمونِ کیفیتِ داده که ثابت شده روی ورودیِ خراب شکست می‌خورد.'],
      ['Versioned SQL transformations with a benchmark against the dataframe approach.',
       'تبدیل‌های SQL نسخه‌دار با محک‌زنی در برابر روشِ دیتافریمی.'],
      ['A CI workflow with a scheduled data check.',
       'یک گردش‌کارِ CI با بررسیِ زمان‌بندی‌شده‌ی داده.']
    ],
    [
      ['`make all` runs end to end on a clean machine.',
       '«make all» روی یک ماشینِ تمیز تا انتها اجرا می‌شود.'],
      ['Raw data is never modified by the pipeline.',
       'خطِ لوله هرگز داده‌ی خام را تغییر نمی‌دهد.'],
      ['The quality suite fails loudly on corrupted data.',
       'مجموعه‌ی کیفیت روی داده‌ی خراب بلند شکست می‌خورد.'],
      ['Re-running is idempotent and incremental.',
       'اجرای مجدد یکّه و افزایشی است.'],
      ['A second person can run it from the README alone.',
       'یک نفرِ دوم می‌تواند تنها با README آن را اجرا کند.']
    ],
    ['parquet', 'duckdb', 'polars', 'testing', 'ci'],
    [R('Cookiecutter Data Science', 'https://drivendata.github.io/cookiecutter-data-science/', 'tool'),
     R('DuckDB documentation', 'https://duckdb.org/docs/', 'tool')]
  );

  /* =================================================================
     6. ML — tabular model: baseline to calibrated, cost-aware
     ================================================================= */
  PJ('pj-ml', 'domain', 'ml', 'intermediate', 10,
    ['Tabular ML Done Properly: Baseline, Leakage Audit, Calibration, Cost',
     'یادگیری ماشینِ جدولیِ درست: مبنا، حسابرسیِ نشت، کالیبراسیون، هزینه'],
    ['Take one real tabular problem and do the whole job the way a senior would: a dumb baseline first, a leakage audit, pipeline-only preprocessing, honest cross-validation, tuning, probability calibration, a threshold chosen from economics rather than 0.5, and an error analysis that decides what to do next.',
     'یک مسئله‌ی جدولیِ واقعی را بردارید و کلِ کار را آن‌طور که یک فردِ ارشد انجام می‌دهد پیش ببرید: نخست یک مبنای ساده، حسابرسیِ نشت، پیش‌پردازشِ منحصراً در خطِ لوله، اعتبارسنجیِ متقابلِ صادقانه، تنظیم، کالیبراسیونِ احتمال، آستانه‌ای برآمده از اقتصاد نه ۰/۵، و تحلیلی از خطا که تصمیم می‌دهد گامِ بعد چیست.'],
    ['Any imbalanced business table: churn, credit default or insurance claims (e.g. the Kaggle credit-card fraud or Telco churn datasets)',
     'هر جدولِ کسب‌وکاریِ نامتوازن: ریزش، نکولِ اعتباری یا خسارتِ بیمه (مثلاً مجموعه‌داده‌های تقلبِ کارت اعتباری یا ریزشِ Telco در Kaggle)',
     'https://www.kaggle.com/datasets/blastchar/telco-customer-churn'],
    [
      { title: ['Frame it and pick the metric before modelling', 'صورت‌بندی و انتخابِ معیار پیش از مدل‌سازی'],
        body: ['Write the business decision in one sentence ("we will contact the top 5,000 at-risk customers"), then choose the metric that matches it: PR-AUC if ranking matters, recall at a fixed budget if capacity is fixed, expected value if costs are known. Accuracy is almost never the answer.',
                'تصمیمِ کسب‌وکار را در یک جمله بنویسید («با ۵۰۰۰ مشتریِ در‌معرض‌خطر تماس می‌گیریم»)، سپس معیاری متناسب با آن برگزینید: PR-AUC اگر رتبه‌بندی مهم است، بازیابی در بودجه‌ی ثابت اگر ظرفیت ثابت است، ارزشِ مورد انتظار اگر هزینه‌ها معلوم‌اند. دقت تقریباً هرگز پاسخ نیست.'],
        check: ['One sentence of decision, one chosen metric, and a one-line reason accuracy is wrong here.',
                'یک جمله تصمیم، یک معیارِ برگزیده، و یک خط دلیل که چرا دقت اینجا غلط است.'] },

      { title: ['Baselines first, always', 'همیشه نخست مبناها'],
        body: ['Implement three baselines: majority class, a single-feature rule, and logistic regression on raw features. Record their scores. Any model that cannot beat these has taught you that the problem — not the model — needs work.',
                'سه مبنا پیاده کنید: کلاسِ اکثریت، یک قاعده‌ی تک‌ویژگی، و رگرسیونِ لجستیک روی ویژگی‌های خام. امتیازهایشان را ثبت کنید. هر مدلی که نتواند این‌ها را ببرد به شما آموخته که مسئله نیاز به کار دارد، نه مدل.'],
        code: ["import numpy as np\nfrom sklearn.dummy import DummyClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import average_precision_score, roc_auc_score\n\nfor name, m in [('majority', DummyClassifier(strategy='prior')),\n                ('logreg',   LogisticRegression(max_iter=1000))]:\n    m.fit(Xtr, ytr)\n    p = m.predict_proba(Xte)[:, 1]\n    print(f'{name:9s} PR-AUC {average_precision_score(yte, p):.4f}   ROC-AUC {roc_auc_score(yte, p):.4f}')\n\nprint('prevalence', yte.mean().round(4), '  <-- the PR-AUC baseline')",
               'python'],
        check: ['A table of baselines including the prevalence floor for PR-AUC.',
                'جدولی از مبناها که کفِ شیوع برای PR-AUC را هم دارد.'] },

      { title: ['The leakage audit', 'حسابرسیِ نشت'],
        body: ['Go feature by feature and ask: would I know this at prediction time? Flag anything recorded after the outcome, any ID or hash, any aggregate computed over the full dataset, and any target encoding fitted outside the fold. Write the audit as a document with a verdict per feature.',
                'ویژگی‌به‌ویژگی بپرسید: آیا این را در زمانِ پیش‌بینی می‌دانستم؟ هر چیزی را که پس از پیامد ثبت شده، هر شناسه یا هش، هر تجمیعی که روی کلِ داده حساب شده و هر کدگذاریِ هدفی که بیرون از بخش برازش خورده علامت بزنید. حسابرسی را به‌شکل سندی با حکم برای هر ویژگی بنویسید.'],
        hint: ['The fastest leakage test: shuffle the labels and re-score. If the model still beats chance, the pipeline is leaking.',
               'سریع‌ترین آزمونِ نشت: برچسب‌ها را درهم بزنید و دوباره امتیاز بگیرید. اگر مدل هنوز از شانس بهتر بود، خطِ لوله نشت دارد.'],
        check: ['A per-feature verdict table and a label-shuffle test result.',
                'جدولِ حکم برای هر ویژگی و نتیجه‌ی آزمونِ درهم‌زدنِ برچسب.'] },

      { title: ['Split honestly and put everything in a pipeline', 'تقسیمِ صادقانه و قراردادنِ همه‌چیز در خطِ لوله'],
        body: ['Choose the split that matches deployment: random for i.i.d., grouped by entity if the same customer appears many times, time-based if you predict the future. Then wrap imputation, scaling, encoding and the model in one sklearn Pipeline so preprocessing is fitted inside each fold only.',
                'تقسیمی متناسب با استقرار برگزینید: تصادفی برای داده‌ی مستقل و هم‌توزیع، گروه‌بندی‌شده بر حسبِ موجودیت اگر یک مشتری چندبار آمده، زمان‌مند اگر آینده را پیش‌بینی می‌کنید. سپس جای‌گذاری، مقیاس‌بندی، کدگذاری و مدل را در یک Pipeline بپیچید تا پیش‌پردازش تنها درونِ هر بخش برازش بخورد.'],
        code: ["from sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.model_selection import GroupKFold, StratifiedKFold, cross_val_score\n\npre = ColumnTransformer([\n    ('num', Pipeline([('imp', SimpleImputer(strategy='median')), ('sc', StandardScaler())]), num_cols),\n    ('cat', Pipeline([('imp', SimpleImputer(strategy='most_frequent')),\n                      ('oh', OneHotEncoder(handle_unknown='ignore', min_frequency=20))]), cat_cols)])\n\npipe = Pipeline([('pre', pre), ('clf', LogisticRegression(max_iter=2000))])\ncv = GroupKFold(5) if has_groups else StratifiedKFold(5, shuffle=True, random_state=0)\nprint(cross_val_score(pipe, X, y, cv=cv, scoring='average_precision', groups=groups).round(4))",
               'python'],
        check: ['A stated split rationale and CV scores computed with preprocessing inside the fold.',
                'توجیهِ مستدل برای تقسیم و امتیازهای CV که با پیش‌پردازشِ درونِ بخش حساب شده‌اند.'] },

      { title: ['Tune with a budget, not by vibes', 'تنظیم با بودجه، نه با حس'],
        body: ['Run Optuna (or HalvingGridSearch) for a fixed number of trials, with pruning, on the validation folds only. Report the best parameters, the improvement over defaults, and whether the improvement is inside the noise band of the CV estimate.',
                'Optuna (یا HalvingGridSearch) را با تعدادِ تلاشِ ثابت، با هرس‌کردن، و تنها روی بخش‌های اعتبارسنجی اجرا کنید. بهترین پارامترها، بهبود نسبت به پیش‌فرض‌ها، و این‌که آیا بهبود درونِ باندِ نویزِ برآوردِ CV است یا نه را گزارش کنید.'],
        code: ["import optuna\nfrom sklearn.ensemble import HistGradientBoostingClassifier\n\ndef objective(trial):\n    params = {'learning_rate': trial.suggest_float('lr', 1e-3, 0.3, log=True),\n              'max_leaf_nodes': trial.suggest_int('leaves', 15, 255),\n              'min_samples_leaf': trial.suggest_int('min_leaf', 5, 200),\n              'l2_regularization': trial.suggest_float('l2', 1e-3, 10, log=True),\n              'max_iter': 300}\n    model = Pipeline([('pre', pre), ('clf', HistGradientBoostingClassifier(**params))])\n    return cross_val_score(model, X, y, cv=cv, scoring='average_precision', groups=groups).mean()\n\nstudy = optuna.create_study(direction='maximize')\nstudy.optimize(objective, n_trials=60, timeout=900)\nprint('best PR-AUC', round(study.best_value, 4), study.best_params)",
               'python'],
        check: ['A tuning table with the noise band, and a decision to keep or revert.',
                'جدولِ تنظیم با باندِ نویز و تصمیمی برای نگه‌داشتن یا بازگشت.'] },

      { title: ['Calibrate the probabilities', 'کالیبره‌کردنِ احتمال‌ها'],
        body: ['Plot a reliability diagram for the raw model, then fit Platt scaling and isotonic regression on a held-out calibration set (never on the training fold). Report Brier score and ECE before and after. A model that ranks well but is miscalibrated cannot be used for expected-value decisions.',
                'نمودارِ قابلیتِ اطمینان را برای مدلِ خام رسم کنید، سپس مقیاس‌بندیِ پلات و رگرسیونِ ایزوتونیک را روی مجموعه‌ی کالیبراسیونِ جدا برازش دهید (هرگز روی بخشِ آموزش). امتیازِ برایر و ECE را پیش و پس گزارش کنید. مدلی که رتبه‌بندی‌اش خوب است اما کالیبره نیست برای تصمیم‌های ارزشِ مورد انتظار قابل استفاده نیست.'],
        code: ["from sklearn.calibration import CalibratedClassifierCV, calibration_curve\nfrom sklearn.metrics import brier_score_loss\n\ncal = CalibratedClassifierCV(best_model, method='isotonic', cv='prefit').fit(Xcal, ycal)\np_raw = best_model.predict_proba(Xte)[:, 1]\np_cal = cal.predict_proba(Xte)[:, 1]\nprint('Brier raw     ', round(brier_score_loss(yte, p_raw), 5))\nprint('Brier calibrated', round(brier_score_loss(yte, p_cal), 5))\n\npt, pp = calibration_curve(yte, p_cal, n_bins=10, strategy='quantile')\nprint('reliability (predicted, observed):') \nprint(np.round(np.c_[pp, pt], 3))",
               'python'],
        check: ['A reliability diagram before and after, with Brier and ECE numbers.',
                'نمودارِ قابلیتِ اطمینان پیش و پس، با اعدادِ برایر و ECE.'] },

      { title: ['Choose the threshold from economics', 'انتخابِ آستانه از اقتصاد'],
        body: ['Attach a cost to a false positive and a benefit to a true positive, then compute the profit-optimal threshold (cost/(cost+benefit) for calibrated probabilities) and verify it empirically by sweeping thresholds and plotting expected value. Report the operating point you would ship.',
                'برای مثبتِ کاذب یک هزینه و برای مثبتِ درست یک سود تعیین کنید، سپس آستانه‌ی بهینه‌ی سود را حساب کنید (هزینه/(هزینه+سود) برای احتمال‌های کالیبره) و آن را با جاروی آستانه‌ها و رسمِ ارزشِ مورد انتظار به‌صورت تجربی تأیید کنید. نقطه‌ی کاری را که عرضه می‌کنید گزارش کنید.'],
        code: ["cost_fp, gain_tp = 10.0, 120.0\nthr_star = cost_fp / (cost_fp + gain_tp)\n\ngrid = np.linspace(0.01, 0.9, 90)\nev   = [(gain_tp * ((p >= t) & (yte == 1)).sum() - cost_fp * ((p >= t) & (yte == 0)).sum())\n        for t in grid]\nbest = grid[int(np.argmax(ev))]\nprint(f'theory threshold {thr_star:.3f}   empirical {best:.3f}   EV {max(ev):,.0f}')\nprint('EV at 0.5 threshold', ev[int(np.argmin(np.abs(grid - 0.5)))].round(0))",
               'python'],
        hint: ['The analytic and empirical thresholds should be close. If they are not, your probabilities are not calibrated — go back one step.',
               'آستانه‌ی تحلیلی و تجربی باید نزدیک باشند. اگر نیستند، احتمال‌های شما کالیبره نیست — یک گام به عقب برگردید.'],
        check: ['An expected-value curve with the shipped threshold marked and defended.',
                'منحنیِ ارزشِ مورد انتظار با آستانه‌ی عرضه‌شده علامت‌خورده و توجیه‌شده.'] },

      { title: ['Error analysis and the next step', 'تحلیلِ خطا و گامِ بعد'],
        body: ['Take the 50 worst false positives and the 50 worst false negatives, look at them, and write down the pattern you find. Then run one ablation (drop your most important feature, or add the feature your analysis suggested) and report what actually happened. End with a recommendation: ship it, collect data, or reframe.',
                '۵۰ مثبتِ کاذبِ بد و ۵۰ منفیِ کاذبِ بد را بردارید، به آن‌ها نگاه کنید و الگویی که می‌یابید بنویسید. سپس یک حذفِ عاملی اجرا کنید (مهم‌ترین ویژگی‌تان را بیندازید، یا ویژگی‌ای را که تحلیل پیشنهاد داده بیفزایید) و گزارش کنید واقعاً چه شد. با یک توصیه تمام کنید: عرضه، جمع‌آوریِ داده، یا تغییرِ صورت‌بندی.'],
        check: ['A written pattern from the errors, one ablation result, and a recommendation.',
                'الگویی نوشته‌شده از خطاها، یک نتیجه‌ی حذفِ عاملی، و یک توصیه.'] },

      { title: ['Model card and handover', 'کارتِ مدل و تحویل'],
        body: ['Fill in a model card: intended use, out-of-scope use, training data window, metrics by subgroup, known failure modes, and who to call. Ship the model artefact together with the fitted preprocessing, since one without the other is a bug waiting to happen.',
                'یک کارتِ مدل پُر کنید: کاربردِ مورد نظر، کاربردِ خارج از محدوده، بازه‌ی داده‌ی آموزش، معیارها به تفکیکِ زیرگروه، شیوه‌های شکستِ شناخته‌شده، و اینکه با چه کسی تماس بگیرند. خروجیِ مدل را همراهِ پیش‌پردازشِ برازش‌یافته عرضه کنید، چون یکی بدونِ دیگری باگی است که منتظر رخ‌دادن است.'],
        check: ['A filled model card and a single serialised artefact that reproduces a prediction end to end.',
                'یک کارتِ مدلِ پُرشده و یک خروجیِ سریالی‌شده‌ی واحد که یک پیش‌بینی را تا انتها بازتولید می‌کند.'] }
    ],
    [
      ['A notebook or repo covering baseline → leakage audit → CV pipeline → tuning → calibration → threshold → error analysis.',
       'یک نوت‌بوک یا مخزن که مبنا → حسابرسیِ نشت → خطِ لوله‌ی CV → تنظیم → کالیبراسیون → آستانه → تحلیلِ خطا را می‌پوشاند.'],
      ['A per-feature leakage audit document.',
       'سندِ حسابرسیِ نشت به‌تفکیکِ ویژگی.'],
      ['Reliability diagram and expected-value curve.',
       'نمودارِ قابلیتِ اطمینان و منحنیِ ارزشِ مورد انتظار.'],
      ['A model card and one versioned artefact that reproduces predictions.',
       'کارتِ مدل و یک خروجیِ نسخه‌دار که پیش‌بینی‌ها را بازتولید می‌کند.']
    ],
    [
      ['Baselines are reported before any model.',
       'مبناها پیش از هر مدلی گزارش شده‌اند.'],
      ['The label-shuffle test passes (no leakage).',
       'آزمونِ درهم‌زدنِ برچسب می‌گذرد (نشتی نیست).'],
      ['Preprocessing is fitted only inside CV folds.',
       'پیش‌پردازش تنها درونِ بخش‌های CV برازش خورده است.'],
      ['Probabilities are calibrated and the threshold comes from costs, not 0.5.',
       'احتمال‌ها کالیبره‌اند و آستانه از هزینه‌ها می‌آید نه از ۰/۵.'],
      ['The write-up ends with a concrete next action.',
       'گزارش با یک اقدامِ مشخصِ بعدی تمام می‌شود.']
    ],
    ['tabular', 'calibration', 'leakage', 'cost-sensitive', 'xgboost'],
    [R('Interpretable Machine Learning (Molnar)', 'https://christophm.github.io/interpretable-ml-book/', 'book'),
     R('scikit-learn: common pitfalls and recommended practices', 'https://scikit-learn.org/stable/common_pitfalls.html', 'doc')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
