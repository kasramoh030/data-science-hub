/* =====================================================================
   lessons-01-linear-algebra.js  —  9 lessons
   Bilingual (EN / FA). Authoring helpers live in data/schema.js
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'linear-algebra';

  /* ------------------------------------------------------------------ */
  L('la-001', D, 'beginner', 12,
    ['Vectors, Span and Linear Combinations', 'بردارها، گستره و ترکیب‌های خطی'],
    ['Vectors are how data enters mathematics: a row of a table becomes a point in space, and every model is built from adding and scaling those points.',
     'بردارها راه ورود داده به ریاضیات‌اند: هر سطر یک جدول تبدیل به نقطه‌ای در فضا می‌شود و هر مدلی از جمع و مقیاس‌دادن همین نقاط ساخته می‌شود.'],
    [
      p('A vector in R^n is an ordered list of n real numbers. In data science a vector is whichever of these three you need it to be: one observation (a row of your dataframe with n features), one feature (a column across m rows), or a set of parameters (the weights of a model). Keeping straight which one you mean prevents most shape bugs later.',
        'برداری در R^n یک فهرست مرتب از n عدد حقیقی است. در علم داده بردار هرکدام از این سه باشد که لازم دارید: یک مشاهده (یک سطر از دیتافریم با n ویژگی)، یک ویژگی (یک ستون در طول m سطر)، یا مجموعه‌ای از پارامترها (وزن‌های یک مدل). روشن نگه‌داشتن این‌که کدام را می‌گویید، جلوی بیشتر باگ‌های ابعاد را می‌گیرد.'),
      def('A linear combination of vectors v1...vk is any vector of the form a1*v1 + a2*v2 + ... + ak*vk where the ai are scalars. The span of those vectors is the set of ALL linear combinations you can reach — a point, a line, a plane, or a whole subspace.',
          'ترکیب خطیِ بردارهای v1 تا vk هر برداری به شکل a1*v1 + ... + ak*vk است که در آن aiها اسکالرند. گستره (span) این بردارها مجموعه‌ی همه‌ی ترکیب‌های خطی ممکن است — یک نقطه، یک خط، یک صفحه یا یک زیرفضای کامل.'),
      math('v = [3, -1, 2]^T        u = [1, 1, 0]^T\n2v - 3u = [6, -2, 4]^T - [3, 3, 0]^T = [3, -5, 4]^T\n\nspan{v}      = a line through the origin\nspan{v, u}   = a plane (if u is not a multiple of v)\nspan{v, 2v}  = the same line — one vector was redundant'),
      code(`import numpy as np

v = np.array([3.0, -1.0, 2.0])
u = np.array([1.0,  1.0, 0.0])

combo = 2 * v - 3 * u          # elementwise, shape (3,)
print(combo)                   # [ 3. -5.  4.]

# Stack rows -> a (2, 3) matrix; stack columns -> (3, 2)
A = np.vstack([v, u])          # rows are vectors
B = np.column_stack([v, u])    # columns are vectors
print(A.shape, B.shape)        # (2, 3) (3, 2)`),
      ul(['Two parallel vectors span a line; two non-parallel vectors span a plane.',
          'Adding a vector that already lies in the span changes nothing — it is linearly dependent.',
          'Multiplying a vector by a negative scalar flips its direction; by zero collapses it to the origin.',
          'Every vector space used in ML is finite-dimensional R^n (or batches of it, a tensor).'],
         ['دو بردار موازی یک خط و دو بردارِ ناموازی یک صفحه را می‌سازند.',
          'افزودن برداری که از پیش در گستره است چیزی تغییر نمی‌دهد — آن بردار وابسته‌ی خطی است.',
          'ضرب در اسکالر منفی جهت را برمی‌گرداند و ضرب در صفر بردار را به مبدأ می‌فرستد.',
          'هر فضای برداریِ مورد استفاده در یادگیری ماشین از نوع R^n با بعد متناهی است (یا دسته‌هایی از آن، یعنی تنسور).']),
      note('Watch the convention: scikit-learn stores samples as ROWS (X is n_samples x n_features), while maths textbooks usually write vectors as COLUMNS. Transpose deliberately, and assert shapes while you are still learning.',
           'حواس‌تان به قرارداد باشد: در scikit-learn نمونه‌ها به‌شکل سطر ذخیره می‌شوند (X با ابعاد n_samples × n_features)، در حالی که کتاب‌های ریاضی معمولاً بردار را ستون می‌نویسند. آگاهانه ترانهاده بگیرید و تا وقتی در حال یادگیری هستید ابعاد را assert کنید.')
    ],
    ['vectors', 'span', 'linear-combination', 'numpy'],
    [R('3Blue1Brown — Essence of Linear Algebra', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', 'video'),
     R('NumPy quickstart', 'https://numpy.org/doc/stable/user/quickstart.html', 'doc'),
     R('Linear Algebra Done Right (Axler)', 'https://link.springer.com/book/10.1007/978-3-031-41026-0', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('la-002', D, 'beginner', 14,
    ['Matrices as Linear Maps and Matrix Multiplication', 'ماتریس‌ها به‌مثابه نگاشت خطی و ضرب ماتریسی'],
    ['A matrix is not a bag of numbers — it is a function that bends space. Matrix multiplication is function composition, and that single idea explains every shape rule you have memorised.',
     'ماتریس یک کیسه‌ی عدد نیست — تابعی است که فضا را خم می‌کند. ضرب ماتریسی همان ترکیب توابع است و همین یک ایده همه‌ی قواعدِ ابعادیِ حفظی را توضیح می‌دهد.'],
    [
      p('An m x n matrix A maps a vector from R^n to R^m: x -> Ax. Because the map is linear, A(x + y) = Ax + Ay and A(cx) = c*Ax. That is the only property a "linear layer" in a neural network has — no activation, no bias, just this.',
        'یک ماتریس m×n مانند A، برداری از R^n را به R^m می‌برد: x -> Ax. چون این نگاشت خطی است، داریم A(x + y) = Ax + Ay و A(cx) = c·Ax. این تنها ویژگیِ یک «لایه‌ی خطی» در شبکه عصبی است — بدون تابع فعال‌ساز، بدون بایاس، فقط همین.'),
      math('A (m x n)  @  x (n,)  =  y (m,)\n\nrow view :  y_i  = SUM_j  A_ij * x_j        (dot product of row i with x)\ncol view :  y    = SUM_j  x_j * A_[:,j]     (y is a combination of A columns!)\n\n(m x n) @ (n x k) = (m x k)   -> inner dims must match'),
      p('Read Ax = b two ways. Row-wise you get one equation per row — the classic linear system. Column-wise you ask: "which combination of the columns of A produces b?" The column view is the one that unlocks least squares, PCA and every embedding model.',
        'تساوی Ax = b را دو جور بخوانید. از دید سطری، به‌ازای هر سطر یک معادله دارید — دستگاه خطی کلاسیک. از دید ستونی می‌پرسید: «کدام ترکیب از ستون‌های A مقدار b را می‌سازد؟» همین نگاه ستونی است که کمترین مربعات، PCA و هر مدلِembedding را باز می‌کند.'),
      code(`import numpy as np

A = np.array([[1., 2., 0.],
              [0., 1., 3.]])          # (2, 3)
x = np.array([2., 1., 4.])            # (3,)

y = A @ x                             # (2,)
print(y)                              # [ 4. 13.]

# Column view: y = 2*col0 + 1*col1 + 4*col2
print(2*A[:,0] + 1*A[:,1] + 4*A[:,2]) # [ 4. 13.]

# Batch of 5 samples at once: (5,3) @ (3,2) -> (5,2)
X = np.random.randn(5, 3)
W = np.random.randn(3, 2)
print((X @ W).shape)                  # (5, 2)`),
      ul(['A @ B is legal only when A.shape[1] == B.shape[0].',
          'Matrix multiplication is associative: (AB)C = A(BC) — this is why layer fusion works.',
          'It is NOT commutative: AB != BA in general, and often both are not even defined.',
          '(AB)^T = B^T A^T — the transpose reverses order, a classic source of bugs.',
          'The identity matrix I is the "do nothing" map; A @ I = I @ A = A.'],
         ['ضرب A @ B تنها وقتی مجاز است که برقرار باشد A.shape[1] == B.shape[0].',
          'ضرب ماتریسی خاصیت شرکت‌پذیری دارد: (AB)C = A(BC) — به همین دلیل ادغام لایه‌ها کار می‌کند.',
          'ضرب ماتریسی جابه‌جایی‌پذیر نیست: عموماً AB ≠ BA و گاه اصلاً تعریف نشده است.',
          'داریم (AB)^T = B^T A^T — ترانهاده ترتیب را برمی‌گرداند و منبع کلاسیکِ باگ است.',
          'ماتریس همانی I نگاشتِ «هیچ کاری نکن» است: A @ I = I @ A = A.']),
      note('When you see W @ x + b in a neural network, W is (out_features, in_features) in PyTorch — the transpose of the textbook convention. Print .shape once and you will never be confused again.',
           'وقتی در شبکه عصبی عبارت W @ x + b را می‌بینید، در پای‌تورچ W با ابعاد (out_features, in_features) است — ترانهاده‌ی قراردادِ کتاب‌ها. یک‌بار .shape را چاپ کنید و دیگر هرگز گیج نخواهید شد.')
    ],
    ['matrices', 'matrix-multiplication', 'linear-map', 'shapes'],
    [R('PyTorch nn.Linear docs', 'https://pytorch.org/docs/stable/generated/torch.nn.Linear.html', 'doc'),
     R('MIT 18.06 — Multiplication and inverse matrices', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/video_galleries/video-lectures/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('la-003', D, 'beginner', 12,
    ['Norms, Inner Products and Projections', 'نرم‌ها، ضرب داخلی و تصویرها'],
    ['Norms measure size, inner products measure alignment (and give you cosine similarity), and projections let you express a vector in a direction you care about.',
     'نرم‌ها اندازه را می‌سنجند، ضرب داخلی هم‌راستایی را می‌سنجد (و شباهت کسینوسی می‌دهد) و تصویرها اجازه می‌دهند بردار را در جهتی که برای‌تان مهم است بیان کنید.'],
    [
      def('A norm ||x|| turns a vector into a non-negative "length". The inner product <x, y> = x^T y = SUM x_i y_i measures how much two vectors point the same way; it is 0 when they are orthogonal.',
          'نرم ||x|| یک بردار را به «طولی» نامنفی تبدیل می‌کند. ضرب داخلی <x, y> = x^T y = Σ x_i y_i می‌سنجد دو بردار چقدر هم‌جهت‌اند و وقتی بر هم عمود باشند صفر است.'),
      math('L1  norm :  ||x||_1 = SUM_i |x_i|                 sparse, robust to outliers\nL2  norm :  ||x||_2 = sqrt(SUM_i x_i^2)          Euclidean length, smooth\nLinf norm:  ||x||_inf = max_i |x_i|               worst-case error\nsquared L2: ||x||_2^2 = x^T x                    differentiable everywhere\n\ncosine similarity = (x^T y) / (||x||_2 ||y||_2)   in [-1, 1]\nprojection of x onto unit u:  proj = (x^T u) u'),
      p('Regularization is just a norm penalty: L1 (Lasso) drives coefficients to exactly zero and performs feature selection; L2 (Ridge) shrinks everything smoothly and is differentiable, which is why it is the default in deep learning as "weight decay".',
        'منظم‌سازی چیزی جز جریمه‌ی نرم نیست: L1 (لاسو) ضرایب را دقیقاً به صفر می‌راند و انتخاب ویژگی انجام می‌دهد؛ L2 (ریج) همه‌چیز را نرم کوچک می‌کند و مشتق‌پذیر است، به همین دلیل در یادگیری عمیق با نام weight decay پیش‌فرض است.'),
      code(`import numpy as np

x = np.array([3., 4.])
y = np.array([1., 0.])

l1 = np.abs(x).sum()               # 7.0
l2 = np.linalg.norm(x)             # 5.0
cos = x @ y / (np.linalg.norm(x) * np.linalg.norm(y))   # 0.6

# Projection of x onto the direction of y
u = y / np.linalg.norm(y)
proj = (x @ u) * u                 # [3. 0.]
resid = x - proj                   # [0. 4.]  (orthogonal to u!)
print(proj @ resid)                # ~0 -> projection error is perpendicular

# Cosine similarity for a whole matrix of embeddings, row-wise
E = np.random.randn(100, 64)
En = E / np.linalg.norm(E, axis=1, keepdims=True)
S = En @ En.T                      # (100,100) pairwise cosine similarity`),
      ul(['||x||_2 = 0 implies x = 0; that is part of the definition of a norm.',
          'Cosine similarity ignores magnitude — perfect for text embeddings, wrong when magnitude carries meaning.',
          'The projection residual (x - proj) is orthogonal to the direction you projected onto; that is the least-squares property in one line.',
          'Standardizing columns (z-scoring) before computing distances is usually mandatory, not optional.'],
         ['از ||x||_2 = 0 نتیجه می‌شود x = 0؛ این بخشی از تعریف نرم است.',
          'شباهت کسینوسی اندازه را نادیده می‌گیرد — برای embedding متن عالی است، اما وقتی بزرگیِ بردار معنا دارد اشتباه است.',
          'باقیمانده‌ی تصویر (x - proj) بر جهتی که روی آن تصویر انداختید عمود است؛ این همان ویژگیِ کمترین مربعات در یک خط است.',
          'استانداردسازی ستون‌ها (z-score) پیش از محاسبه‌ی فاصله معمولاً الزامی است، نه اختیاری.'])
    ],
    ['norms', 'inner-product', 'cosine', 'projection', 'regularization'],
    [R('Cosine similarity — Wikipedia', 'https://en.wikipedia.org/wiki/Cosine_similarity', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('la-004', D, 'intermediate', 15,
    ['Linear Independence, Basis, Rank and the Four Subspaces', 'استقلال خطی، پایه، رتبه و چهار زیرفضا'],
    ['Rank tells you how much genuine information a matrix holds. The four fundamental subspaces then tell you exactly which right-hand sides b can be solved and how unique the solution is.',
     'رتبه می‌گوید یک ماتریس چقدر اطلاعات واقعی دارد. سپس چهار زیرفضای بنیادین دقیقاً می‌گویند کدام bها حل‌پذیرند و جواب چقدر یکتاست.'],
    [
      def('Vectors are linearly independent if none of them is a linear combination of the others. A basis of a subspace is an independent set that spans it; every vector then has a UNIQUE representation in that basis. The rank of A is the number of independent columns (equally: of independent rows — they are always equal!).',
          'بردارها مستقلِ خطی‌اند اگر هیچ‌کدام ترکیب خطیِ بقیه نباشد. پایه‌ی یک زیرفضا مجموعه‌ای مستقل است که آن را بسازد؛ آن‌گاه هر بردار نمایشی یکتا در آن پایه دارد. رتبه‌ی A تعداد ستون‌های مستقل است (و به همان اندازه تعداد سطرهای مستقل — این دو همیشه برابرند!).'),
      math('A is (m x n), rank r <= min(m, n)\n\nfour subspaces:\n  column space  C(A)      subset of R^m,  dim = r   -> which b are reachable\n  null space    N(A)      subset of R^n,  dim = n-r -> directions A crushes to 0\n  row space     C(A^T)    subset of R^n,  dim = r\n  left null     N(A^T)    subset of R^m,  dim = m-r\n\nrank-nullity theorem:  rank(A) + dim N(A) = n'),
      p('Why a data scientist cares: rank deficiency in your feature matrix means redundant or perfectly collinear features. Your linear model still fits, but the coefficients become unstable and unidentifiable — the null space contains directions you can move along without changing predictions at all.',
        'چرا برای دانشمند داده مهم است: کمبود رتبه در ماتریس ویژگی یعنی ویژگی‌های زائد یا کاملاً هم‌خط. مدل خطی همچنان برازش می‌یابد، اما ضرایب ناپایدار و غیرقابل‌تشخیص می‌شوند — فضای پوچی شامل جهت‌هایی است که می‌توان در امتداد آن‌ها حرکت کرد بی‌آن‌که پیش‌بینی تغییر کند.'),
      code(`import numpy as np

A = np.array([[1., 2., 3.],
              [2., 4., 6.],   # row 2 = 2 x row 1  -> dependent
              [1., 1., 1.]])
print(np.linalg.matrix_rank(A))        # 2  (not 3)

# A perfectly collinear design matrix kills interpretability
X = np.column_stack([np.ones(10), np.random.randn(10), np.random.randn(10)])
X[:, 3-1] = 2 * X[:, 1]                # duplicate info
print(np.linalg.cond(X))               # huge -> numerically singular
w = np.linalg.lstsq(X, np.random.randn(10), rcond=None)[0]
print(w)                               # coefficients blow up / unstable

# Fix: drop a column, or use ridge regression
lam = 1e-2
w_ridge = np.linalg.solve(X.T @ X + lam*np.eye(X.shape[1]), X.T @ np.random.randn(10))`),
      ul(['Full column rank (r = n) means the null space is {0} and the solution to Ax = b is unique when it exists.',
          'Full row rank (r = m) means every b has at least one solution.',
          'Rank is fragile numerically: use matrix_rank with a tolerance, and check the condition number, not just equality.',
          'One-hot encoding all categories AND keeping an intercept creates a rank deficiency — use drop_first=True.'],
         ['رتبه‌ی ستونیِ کامل (r = n) یعنی فضای پوچی برابر {0} است و جواب Ax = b در صورت وجود یکتاست.',
          'رتبه‌ی سطریِ کامل (r = m) یعنی هر b دست‌کم یک جواب دارد.',
          'رتبه از نظر عددی شکننده است: از matrix_rank با تلورانس استفاده کنید و عدد شرط را بررسی کنید، نه فقط برابری را.',
          'یک‌هات‌کردن همه‌ی دسته‌ها در کنار نگه‌داشتن عرض از مبدأ کمبود رتبه می‌سازد — از drop_first=True استفاده کنید.']),
      note('Rule of thumb: if np.linalg.cond(X) > 1e8, treat the design matrix as singular. Prefer lstsq or ridge over a bare inverse — np.linalg.inv is almost never the right tool.',
           'قاعده‌ی سرانگشتی: اگر np.linalg.cond(X) > 1e8 بود، ماتریس طراحی را تکین در نظر بگیرید. به‌جای معکوسِ خالی از lstsq یا ریج استفاده کنید — np.linalg.inv تقریباً هرگز ابزار درستی نیست.')
    ],
    ['rank', 'basis', 'independence', 'null-space', 'collinearity'],
    [R('MIT 18.06 — The four fundamental subspaces', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('la-005', D, 'intermediate', 13,
    ['Determinants, Inverses and Solving Ax = b', 'دترمینان، معکوس و حلِ Ax = b'],
    ['The determinant measures how a matrix scales area or volume; when it is zero the matrix is not invertible. In practice you rarely invert — you solve.',
     'دترمینان می‌سنجد یک ماتریس مساحت یا حجم را چقدر مقیاس می‌دهد؛ وقتی صفر باشد ماتریس معکوس‌پذیر نیست. در عمل به‌ندرت معکوس می‌گیرید — حل می‌کنید.'],
    [
      def('det(A) is the signed volume scale factor of the linear map A. det(A) = 0 exactly when A is singular (its columns are dependent). A is invertible iff det(A) != 0, iff rank(A) = n, iff Ax = 0 has only the trivial solution.',
          'det(A) ضریبِ مقیاسِ حجمِ با علامتِ نگاشت خطیِ A است. دترمینان دقیقاً وقتی صفر است که A تکین باشد (ستون‌هایش وابسته باشند). A معکوس‌پذیر است اگر و تنها اگر 0 ≠ det(A)، اگر و تنها اگر rank(A) = n، اگر و تنها اگر Ax = 0 تنها جواب بدیهی داشته باشد.'),
      math('det(AB)  = det(A) det(B)        det(A^T) = det(A)\ndet(A^-1) = 1 / det(A)          det(cA)  = c^n det(A)   for A of size n\n2x2:  det [[a,b],[c,d]] = ad - bc\n\nsolve, do not invert:\n   x = A^{-1} b   mathematically fine, numerically slower & less stable\n   x = np.linalg.solve(A, b)   <- use this (LU / QR factorisation)'),
      code(`import numpy as np

A = np.array([[2., 1.], [1., 3.]])
b = np.array([3., 5.])

print(np.linalg.det(A))                 # 5.0
x = np.linalg.solve(A, b)               # [0.8 1.4]
print(A @ x)                            # [3. 5.]  verified

# Least squares for a tall / inconsistent system (m > n)
A_tall = np.random.randn(50, 3)
b_obs  = A_tall @ np.array([1., -2., 0.5]) + 0.1*np.random.randn(50)
w, *_  = np.linalg.lstsq(A_tall, b_obs, rcond=None)
print(w)                                # ~ [1, -2, 0.5]

# Never do this:
# x = np.linalg.inv(A) @ b`),
      ul(['Solving via factorisation is roughly 2-3x faster and more accurate than forming an inverse.',
          'Symmetric positive-definite systems: use Cholesky (np.linalg.cholesky) — twice as fast as LU.',
          'For least squares use lstsq (SVD-based) or QR; the normal equations A^T A x = A^T b square the condition number and lose precision.',
          'Determinants also appear as the Jacobian correction when you change variables in a probability density.'],
         ['حل با تجزیه حدود ۲ تا ۳ برابر سریع‌تر و دقیق‌تر از تشکیل معکوس است.',
          'برای دستگاه‌های متقارنِ مثبت‌معین از تجزیه‌ی شولسکی استفاده کنید — دو برابر سریع‌تر از LU.',
          'برای کمترین مربعات از lstsq (برپایه‌ی SVD) یا QR استفاده کنید؛ معادلات نرمال A^T A x = A^T b عدد شرط را به توان دو می‌رسانند و دقت را از دست می‌دهند.',
          'دترمینان در تغییر متغیرِ چگالی احتمال نیز به‌عنوان تصحیحِ ژاکوبین ظاهر می‌شود.'])
    ],
    ['determinant', 'inverse', 'solve', 'conditioning'],
    [R('Numerical linear algebra — Trefethen & Bau', 'https://epubs.siam.org/doi/book/10.1137/1.9780898719574', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('la-006', D, 'intermediate', 16,
    ['Eigenvalues, Eigenvectors and Diagonalization', 'مقادیر و بردارهای ویژه و قطری‌سازی'],
    ['Eigenvectors are the directions a matrix only stretches, never rotates. They are the axes of a covariance matrix (hello PCA), the steady state of a Markov chain, and the stability criterion of a recurrent network.',
     'بردارهای ویژه جهت‌هایی‌اند که ماتریس آن‌ها را فقط می‌کشد و هرگز نمی‌چرخاند. آن‌ها محورهای ماتریس کوواریانس‌اند (سلام PCA)، حالت پایدارِ زنجیره‌ی مارکوف و معیار پایداریِ شبکه بازگشتی.'],
    [
      def('v (non-zero) is an eigenvector of A with eigenvalue lambda when A v = lambda v. Applying A to v changes only its length (and possibly flips its sign) — the direction survives.',
          'بردارِ ناصفر v بردار ویژه‌ی A با مقدار ویژه‌ی lambda است هرگاه A v = lambda v. اعمالِ A بر v فقط طول آن را تغییر می‌دهد (و احتمالاً علامتش را برمی‌گرداند) — جهت باقی می‌ماند.'),
      math('A v = lambda v   <=>   (A - lambda I) v = 0   <=>   det(A - lambda I) = 0\n\ncharacteristic polynomial in lambda, degree n  ->  n eigenvalues (possibly complex)\n\nif A has n independent eigenvectors:\n   A = V diag(lambda) V^{-1}\n   A^k = V diag(lambda^k) V^{-1}          fast powers, stability analysis\n   spectral radius rho(A) = max |lambda|;  A^k -> 0  iff  rho(A) < 1'),
      p('For a symmetric matrix the eigenvectors are orthogonal and all eigenvalues are real — the spectral theorem. That is exactly the situation with covariance matrices, which is why PCA is numerically pleasant: it is an eigendecomposition of a symmetric PSD matrix.',
        'برای ماتریس متقارن، بردارهای ویژه متعامد و همه‌ی مقادیر ویژه حقیقی‌اند — قضیه‌ی طیفی. این دقیقاً وضعیت ماتریس‌های کوواریانس است و به همین دلیل PCA از نظر عددی خوش‌رفتار است: تجزیه‌ی ویژه‌ی یک ماتریس متقارنِ نیمه‌معین.'),
      code(`import numpy as np

A = np.array([[2., 1.],
              [1., 2.]])
vals, vecs = np.linalg.eig(A)
print(vals)                # [3. 1.]
print(vecs)                # columns are eigenvectors

# Verify: A @ v  ==  lambda * v
v0 = vecs[:, 0]
print(np.allclose(A @ v0, vals[0] * v0))   # True

# Symmetric -> use eigh (faster, returns real, ordered ascending)
C = np.cov(np.random.randn(3, 200))        # 3x3 covariance
w, V = np.linalg.eigh(C)
order = np.argsort(w)[::-1]                # descending
w, V = w[order], V[:, order]
print(w, np.allclose(V.T @ V, np.eye(3)))  # orthonormal basis

# Power iteration: the largest eigenvector, the way PageRank does it
x = np.random.randn(A.shape[0])
for _ in range(50):
    x = A @ x
    x /= np.linalg.norm(x)
print(x)                                   # ~ dominant eigenvector`),
      ul(['Complex eigenvalues mean rotation: a 2D rotation matrix has eigenvalues e^(+-i*theta).',
          'Trace(A) = sum of eigenvalues; det(A) = product of eigenvalues.',
          'rho(A) < 1 decides whether iterating a linear system converges — the vanishing/exploding gradient story for RNNs in one line.',
          'PageRank, spectral clustering and PCA are all eigenvectors in a trench coat.'],
         ['مقادیر ویژه‌ی مختلط یعنی چرخش: ماتریس دورانِ دوبعدی مقادیر ویژه‌ی e^(±i·theta) دارد.',
          'داریم trace(A) = مجموع مقادیر ویژه و det(A) = حاصل‌ضرب آن‌ها.',
          'شرط rho(A) < 1 تعیین می‌کند آیا تکرار یک دستگاه خطی همگرا می‌شود — داستان محو یا انفجار گرادیان در RNN در یک خط.',
          'پیج‌رنک، خوشه‌بندی طیفی و PCA همگی بردارهای ویژه در لباس مبدّل‌اند.']),
      note('Use np.linalg.eigh for symmetric/Hermitian matrices and np.linalg.eig otherwise. eigh guarantees real outputs and orthogonal vectors; for large sparse problems use scipy.sparse.linalg.eigsh.',
           'برای ماتریس‌های متقارن/هرمیتی از np.linalg.eigh و در غیر این صورت از np.linalg.eig استفاده کنید. eigh خروجی حقیقی و بردارهای متعامد تضمین می‌کند؛ برای مسائل بزرگِ تنک از scipy.sparse.linalg.eigsh استفاده کنید.')
    ],
    ['eigenvalues', 'eigenvectors', 'spectral', 'pagerank'],
    [R('Eigenvectors — Setosa interactive', 'https://setosa.io/ev/eigenvectors-and-eigenvalues/', 'tool')]
  );

  /* ------------------------------------------------------------------ */
  L('la-007', D, 'advanced', 14,
    ['Symmetric Matrices, Quadratic Forms and Positive Definiteness', 'ماتریس‌های متقارن، فرم‌های درجه‌دو و مثبت‌معین بودن'],
    ['Every loss function that is a bowl (MSE, ridge, logistic near the optimum) is a quadratic form. Positive definiteness is the formal name for "this bowl has a bottom".',
     'هر تابع هزینه‌ای که به شکل کاسه است (MSE، ریج، لجستیک در نزدیکی بهینه) یک فرم درجه‌دو است. مثبت‌معین بودن نام رسمِ «این کاسه ته دارد» است.'],
    [
      def('A symmetric matrix A (A = A^T) is positive semidefinite (PSD) when x^T A x >= 0 for every x, and positive definite (PD) when x^T A x > 0 for every x != 0. Equivalently: all eigenvalues are >= 0 (PSD) or > 0 (PD).',
          'ماتریس متقارنِ A (که در آن A = A^T) نیمه‌معینِ مثبت است هرگاه برای هر x داشته باشیم 0 ≤ x^T A x و مثبت‌معین است هرگاه برای هر 0 ≠ x داشته باشیم 0 < x^T A x. به‌طور معادل: همه‌ی مقادیر ویژه نامنفی (PSD) یا مثبت (PD) باشند.'),
      math('quadratic form:   f(x) = x^T A x  =  SUM_i SUM_j A_ij x_i x_j\nHessian of f:     2A        -> curvature is constant everywhere\n\nPD   -> strictly convex -> unique global minimum -> gradient descent converges\nPSD  -> convex, may have a flat valley (non-unique minima)\nindefinite -> saddle points;  Newton direction may not be a descent direction'),
      code(`import numpy as np

A = np.array([[2., 1.], [1., 2.]])
w = np.linalg.eigvalsh(A)          # symmetric-safe eigenvalues
print(w)                           # [1. 3.] -> positive definite

def is_pd(M, tol=1e-10):
    return np.all(np.linalg.eigvalsh((M + M.T)/2) > tol)

# Cholesky succeeds iff the matrix is PD — the fastest PD test
try:
    np.linalg.cholesky(A); print('PD confirmed')
except np.linalg.LinAlgError:
    print('not positive definite')

# A covariance matrix is always PSD (may be singular if n_features > n_samples)
X = np.random.randn(20, 50)                    # 20 samples, 50 features
C = np.cov(X)
print(np.linalg.eigvalsh(C).min())             # ~0 (and slightly negative from roundoff)
C += 1e-6 * np.eye(C.shape[0])                 # jitter -> numerically PD`),
      ul(['Covariance matrices, Gram matrices and kernel matrices are always PSD (up to floating-point noise).',
          'Adding lambda * I to a PSD matrix makes it PD with eigenvalues >= lambda — the ridge trick.',
          'A PD Hessian means Newton and quasi-Newton methods behave; an indefinite Hessian is why trust-region and Levenberg-Marquardt damping exist.',
          'The Mahalanobis distance is sqrt((x - mu)^T S^-1 (x - mu)): an ellipse-aligned distance that whitens correlated features.'],
         ['ماتریس‌های کوواریانس، ماتریس‌های گرم و ماتریس‌های کرنل همیشه PSD اند (تا خطای ممیز شناور).',
          'افزودن lambda·I به یک ماتریس PSD آن را با مقادیر ویژه‌ی بزرگ‌تر یا مساوی lambda مثبت‌معین می‌کند — ترفند ریج.',
          'هسینِ مثبت‌معین یعنی روش‌های نیوتون و شبه‌نیوتون خوب رفتار می‌کنند؛ هسینِ نامعین دلیل وجود روش‌های ناحیه‌ی اعتماد و میراییِ لونبرگ-مارکوارت است.',
          'فاصله‌ی ماهالانوبیس برابر است با sqrt((x - mu)^T S^-1 (x - mu)): فاصله‌ای هم‌راستا با بیضی که ویژگی‌های همبسته را سفید می‌کند.'])
    ],
    ['psd', 'quadratic-forms', 'convexity', 'mahalanobis'],
    [R('Positive definite matrices — MIT 18.06', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('la-008', D, 'advanced', 18,
    ['SVD and Low-Rank Approximation', 'تجزیه‌ی مقدار منفرد و تقریبِ کم‌رتبه'],
    ['The SVD works for every matrix, rectangular or not. It gives you the best possible low-rank compression, principal components, pseudo-inverses, latent semantics and image denoising from one decomposition.',
     'SVD برای هر ماتریسی کار می‌کند، مستطیلی یا نه. از یک تجزیه، بهترین فشرده‌سازی کم‌رتبه، مؤلفه‌های اصلی، شبه‌معکوس، معناشناسی نهان و نویززدایی تصویر را به دست می‌آورید.'],
    [
      def('Any matrix A (m x n) of rank r factorises as A = U S V^T where U (m x m) and V (n x n) are orthogonal and S is diagonal with r positive singular values sigma_1 >= sigma_2 >= ... >= sigma_r > 0. Singular values are the square roots of the eigenvalues of A^T A.',
          'هر ماتریس A با ابعاد m×n و رتبه‌ی r را می‌توان به شکل A = U S V^T تجزیه کرد که در آن U (m×m) و V (n×n) متعامد و S قطری با r مقدار منفردِ مثبتِ sigma_1 >= ... >= sigma_r > 0 است. مقادیر منفرد ریشه‌ی دومِ مقادیر ویژه‌ی A^T A اند.'),
      math('A = U S V^T = sigma_1 u_1 v_1^T + sigma_2 u_2 v_2^T + ... + sigma_r u_r v_r^T\n\nEckart-Young theorem:\n  best rank-k approximation (in both Frobenius and spectral norm) is\n  A_k = SUM_{i<=k} sigma_i u_i v_i^T\n  error = sigma_{k+1}  (Frobenius: sqrt(SUM_{i>k} sigma_i^2))\n\npseudo-inverse:  A^+ = V S^+ U^T      (S^+ = 1/sigma on the diagonal)\nminimum-norm least-squares solution = A^+ b'),
      p('Read the SVD three ways. Geometrically: rotate (V^T), stretch (S), rotate (U). Statistically: the right singular vectors v_i are the principal directions of your data matrix, and sigma_i^2 / SUM sigma_j^2 is the fraction of variance captured by component i. Algorithmically: truncating at k is the optimal lossy compression of the matrix.',
        'SVD را سه‌جور بخوانید. هندسی: دوران (V^T)، کشش (S)، دوران (U). آماری: بردارهای منفرد راستِ v_i جهت‌های اصلیِ ماتریس داده‌اند و sigma_i^2 / Σ sigma_j^2 سهم واریانسی است که مؤلفه‌ی i ام capture می‌کند. الگوریتمی: برش در k بهترین فشرده‌سازیِ اتلافیِ ماتریس است.'),
      code(`import numpy as np

# Image / matrix compression via truncated SVD
np.random.seed(0)
A = np.random.randn(100, 60) + np.outer(np.linspace(-2, 2, 100), np.linspace(1, -1, 60))
U, s, Vt = np.linalg.svd(A, full_matrices=False)

for k in (1, 5, 20):
    Ak = (U[:, :k] * s[:k]) @ Vt[:k]
    err = np.linalg.norm(A - Ak) / np.linalg.norm(A)
    print(f'k={k:2d}  relative error={err:.3f}')

# Energy captured by the top-k components
energy = (s**2).cumsum() / (s**2).sum()
k95 = np.searchsorted(energy, 0.95) + 1
print('components for 95% variance:', k95)

# SVD == PCA on centred data
Xc = A - A.mean(axis=0)
Uc, sc, Vtc = np.linalg.svd(Xc, full_matrices=False)
pca_scores = Uc[:, :2] * sc[:2]        # 2-D embedding
print(Vtc[:2])                          # principal axes (rows)`),
      ul(['SVD always exists; eigendecomposition may not (non-diagonalisable matrices do exist).',
          'The condition number is sigma_max / sigma_min — the enemy of stable training and of inverting kernels.',
          'Truncated SVD is LSA/LSI in NLP: latent topics from a term-document matrix.',
          'Randomised SVD (sklearn.utils.extmath.randomized_svd) makes it feasible on matrices too big to fit in RAM.'],
         ['SVD همیشه وجود دارد؛ تجزیه‌ی ویژه ممکن است وجود نداشته باشد (ماتریس‌های غیرقطری‌پذیر وجود دارند).',
          'عدد شرط برابر است با sigma_max / sigma_min — دشمنِ آموزش پایدار و معکوس‌گیریِ کرنل‌ها.',
          'SVD برش‌خورده همان LSA/LSI در پردازش زبان است: موضوعات نهان از ماتریس واژه-سند.',
          'SVD تصادفی (sklearn.utils.extmath.randomized_svd) آن را برای ماتریس‌هایی که در حافظه جا نمی‌شوند ممکن می‌سازد.']),
      note('Numerical detail: on a 100x60 matrix, full_matrices=False saves memory and returns the "economy" decomposition you almost always want. Never form U @ diag(s) @ Vt explicitly when you only need U[:, :k] * s[:k].',
           'نکته‌ی عددی: روی یک ماتریس ۱۰۰×۶۰، گزینه‌ی full_matrices=False حافظه ذخیره می‌کند و همان تجزیه‌ی «اقتصادی» را می‌دهد که تقریباً همیشه می‌خواهید. وقتی تنها به U[:, :k] * s[:k] نیاز دارید، هرگز U @ diag(s) @ Vt را صریحاً نسازید.')
    ],
    ['svd', 'pca', 'compression', 'pseudo-inverse', 'eckart-young'],
    [R('sklearn TruncatedSVD', 'https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.TruncatedSVD.html', 'doc'),
     R('Jeremy Kun — SVD blog series', 'https://jeremykun.com/2016/05/16/singular-value-decomposition-part-1-perspectives-on-linear-algebra/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('la-009', D, 'intermediate', 15,
    ['Least Squares, Orthogonal Projection and the Normal Equations', 'کمترین مربعات، تصویر متعامد و معادلات نرمال'],
    ['Linear regression is the projection of y onto the column space of X. Once you see the geometry, residuals, R-squared, ridge and even the bias-variance story fall out for free.',
     'رگرسیون خطی همان تصویرِ y بر فضای ستونیِ X است. وقتی این هندسه را ببینید، باقیمانده‌ها، R-squared، ریج و حتی داستانِ اُریب-واریانس خودبه‌خود به دست می‌آیند.'],
    [
      p('Given X (n x p) and y (n,), least squares minimises ||y - Xw||^2. The optimum w_hat makes the residual r = y - X w_hat orthogonal to every column of X. That orthogonality IS the normal equations.',
        'با داشتن X (n×p) و y (n,)، کمترین مربعات عبارت ||y - Xw||^2 را کمینه می‌کند. بهینه‌ی w_hat باقیمانده‌ی r = y - X w_hat را بر هر ستونِ X عمود می‌کند. همین عمود بودن خودِ معادلات نرمال است.'),
      math('minimise  ||y - Xw||^2\ngeometry  X^T (y - X w_hat) = 0      (residual ⟂ column space)\nnormal eq X^T X w_hat = X^T y\nclosed fm w_hat = (X^T X)^{-1} X^T y  <- rarely formed in practice\nbetter    w_hat = X^+ y               (lstsq: QR or SVD, numerically stable)\n\nprojection matrix  H = X (X^T X)^{-1} X^T\n   y_hat = H y      (H is symmetric and idempotent: H^2 = H)\n   leverage h_ii = H_ii  in [0,1];  high leverage = influential point\n\nR^2 = 1 - SS_res / SS_tot,   df = n - p'),
      code(`import numpy as np
from numpy.linalg import lstsq

rng = np.random.default_rng(0)
n, p = 200, 3
X = np.column_stack([np.ones(n), rng.normal(size=(n, p-1))])
y = X @ np.array([2.0, -1.0, 0.5]) + rng.normal(scale=0.7, size=n)

w = lstsq(X, y, rcond=None)[0]              # stable solve
y_hat = X @ w
resid = y - y_hat

print('coefs', w.round(3))
print('orthogonality check', np.abs(X.T @ resid).max())   # ~1e-13
r2 = 1 - resid @ resid / ((y - y.mean()) @ (y - y.mean()))
print('R2', round(r2, 4), 'sigma_hat', np.sqrt(resid @ resid / (n - p)).round(3))

# Ridge = least squares with a penalty on ||w||_2
lam = 1.0
w_ridge = np.linalg.solve(X.T @ X + lam*np.eye(p), X.T @ y)
print('ridge', w_ridge.round(3))`),
      ul(['Residuals are orthogonal to the fitted values too: y_hat^T r = 0.',
          'With an intercept included, residuals sum to zero and R^2 = corr(y, y_hat)^2.',
          'The hat matrix H detects influential observations; leverage above 2p/n deserves a look.',
          'Weighted least squares: multiply each row by sqrt(w_i) to handle heteroscedastic noise.'],
         ['باقیمانده‌ها بر مقادیر برازش‌یافته نیز عمودند: y_hat^T r = 0.',
          'با داشتن عرض از مبدأ، مجموع باقیمانده‌ها صفر است و R^2 = corr(y, y_hat)^2.',
          'ماتریس کلاه H مشاهداتِ اثرگذار را شناسایی می‌کند؛ اهرمِ بالاتر از 2p/n شایسته‌ی بررسی است.',
          'کمترین مربعاتِ وزن‌دار: هر سطر را در sqrt(w_i) ضرب کنید تا نویزِ ناهمسان‌واریانس مدیریت شود.'])
    ],
    ['least-squares', 'regression', 'projection', 'r-squared'],
    [R('sklearn LinearRegression', 'https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html', 'doc')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
