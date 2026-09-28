/* =====================================================================
   quizzes.js — question bank for interactive exercises & short quizzes
   kinds:  mcq (single) | msq (multi) | num (numeric, may use a generator)
           text (short answer, normalised match)
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, Q = DSH.Q;

  /* ---------- small helpers for random numeric drills ---------- */
  function ri(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* =================================================================
     LINEAR ALGEBRA
     ================================================================= */
  Q('q-la-01', 'linear-algebra', 'beginner', 'mcq',
    ['What is the span of two non-parallel vectors in R^3?', 'گستره‌ی دو بردارِ غیرموازی در R^3 چیست؟'],
    { options: [['A single point', 'یک نقطه'], ['A line through the origin', 'یک خط گذرنده از مبدأ'],
                ['A plane through the origin', 'یک صفحه گذرنده از مبدأ'], ['All of R^3', 'تمامِ R^3']],
      answer: 2 },
    ['Two independent vectors generate every combination a*v + b*w, which is a 2-D subspace — a plane through the origin. You would need three independent vectors to reach all of R^3.',
     'دو بردارِ مستقل همه‌ی ترکیب‌های a*v + b*w را می‌سازند که یک زیرفضای دوبعدی است — صفحه‌ای گذرنده از مبدأ. برای رسیدن به تمامِ R^3 به سه بردارِ مستقل نیاز دارید.'],
    ['span', 'vectors']);

  Q('q-la-02', 'linear-algebra', 'beginner', 'num',
    ['Compute the matrix-vector product (show the first component). Enter the value of the first component only.',
     'حاصل‌ضرب ماتریس در بردار را حساب کنید. تنها مقدارِ مؤلفه‌ی اول را وارد کنید.'],
    { gen: function () {
        var a = ri(1, 6), b = ri(-5, 5), c = ri(1, 6), d = ri(-5, 5), x = ri(-4, 4), y = ri(-4, 4);
        var ones = [[a, b], [c, d]];
        return { text: { en: 'A = [[' + ones[0][0] + ', ' + ones[0][1] + '], [' + ones[1][0] + ', ' + ones[1][1] + ']],  x = [' + x + ', ' + y + '].  (A x)_1 = ?',
                         fa: 'A = [[' + ones[0][0] + '، ' + ones[0][1] + ']، [' + ones[1][0] + '، ' + ones[1][1] + ']]،  x = [' + x + '، ' + y + '].  مقدارِ (A x)_1 = ؟' },
                 answer: a * x + b * y, tol: 0 };
      } },
    ['The first component of A x is the dot product of the first ROW of A with x: A_11 * x_1 + A_12 * x_2.',
     'مؤلفه‌ی اولِ A x همان ضربِ داخلیِ سطرِ اولِ A با x است: A_11 · x_1 + A_12 · x_2.'],
    ['matrix-multiplication', 'dot-product']);

  Q('q-la-03', 'linear-algebra', 'beginner', 'mcq',
    ['For which shapes is the product A @ B defined?', 'ضربِ A @ B برای کدام ابعاد تعریف شده است؟'],
    { options: [['A is (3,4) and B is (3,4)', 'A با ابعاد (۳٬۴) و B با ابعاد (۳٬۴)'],
                ['A is (3,4) and B is (4,2)', 'A با ابعاد (۳٬۴) و B با ابعاد (۴٬۲)'],
                ['A is (3,4) and B is (2,4)', 'A با ابعاد (۳٬۴) و B با ابعاد (۲٬۴)'],
                ['A is (4,4) and B is (3,3)', 'A با ابعاد (۴٬۴) و B با ابعاد (۳٬۳)']],
      answer: 1 },
    ['The inner dimensions must match: A.shape[1] == B.shape[0]. (3,4) @ (4,2) gives a (3,2) result.',
     'ابعادِ درونی باید برابر باشند: A.shape[1] == B.shape[0]. حاصلِ (3,4) @ (4,2) یک ماتریس (۳٬۲) است.'],
    ['shapes', 'matrix-multiplication']);

  Q('q-la-04', 'linear-algebra', 'intermediate', 'num',
    ['Compute the L2 norm of the vector. Round to 2 decimals if needed.',
     'نُرمِ L2 بردار را حساب کنید. در صورت نیاز تا دو رقم اعشار گرد کنید.'],
    { gen: function () {
        var trip = pick([[3, 4, 0], [1, 2, 2], [6, 8, 0], [1, 1, 1], [2, 3, 6], [5, 12, 0]]);
        var s = Math.sqrt(trip[0] * trip[0] + trip[1] * trip[1] + trip[2] * trip[2]);
        return { text: { en: '||[' + trip.join(', ') + ']||_2 = ?',
                         fa: '||[' + trip.join('، ') + ']||_2 = ؟' }, answer: s, tol: 0.05 };
      } },
    ['||x||_2 = sqrt(sum of squared components).', '||x||_2 = ریشه‌ی دومِ مجموعِ مؤلفه‌های به توانِ دو.'],
    ['norms']);

  Q('q-la-05', 'linear-algebra', 'intermediate', 'mcq',
    ['A is 5x3. What is the largest possible rank of A, and what is the dimension of its null space if the rank is maximal?',
     'A یک ماتریس ۵×۳ است. بزرگ‌ترین رتبه‌ی ممکنِ A چقدر است و اگر رتبه بیشینه باشد، بُعدِ فضای پوچی آن چقدر است؟'],
    { options: [['rank 5, nullity 0', 'رتبه ۵، پوچی ۰'], ['rank 3, nullity 0', 'رتبه ۳، پوچی ۰'],
                ['rank 3, nullity 2', 'رتبه ۳، پوچی ۲'], ['rank 2, nullity 1', 'رتبه ۲، پوچی ۱']],
      answer: 1 },
    ['rank <= min(5,3) = 3, and rank + nullity = n = 3 (rank-nullity theorem). With rank 3 the nullity is 0.',
     'رتبه ≤ min(5,3) = 3 و بر اساس قضیه‌ی رتبه-پوچی داریم rank + nullity = n = 3. با رتبه‌ی ۳، پوچی برابر ۰ است.'],
    ['rank', 'null-space']);

  Q('q-la-06', 'linear-algebra', 'intermediate', 'num',
    ['Compute the determinant of the 2x2 matrix.', 'دترمینانِ ماتریس ۲×۲ را حساب کنید.'],
    { gen: function () {
        var a = ri(1, 6), b = ri(1, 6), c = ri(1, 6), d = ri(1, 9);
        return { text: { en: 'det([[' + a + ', ' + b + '], [' + c + ', ' + d + ']]) = ?',
                         fa: 'det([[' + a + '، ' + b + ']، [' + c + '، ' + d + ']]) = ؟' },
                 answer: a * d - b * c, tol: 0 };
      } },
    ['det([[a,b],[c,d]]) = a*d - b*c.', 'det([[a,b],[c,d]]) = a*d - b*c.'],
    ['determinant']);

  Q('q-la-07', 'linear-algebra', 'advanced', 'mcq',
    ['Which statement about the SVD A = U S V^T is FALSE?', 'کدام گزاره درباره‌ی تجزیه‌ی A = U S V^T نادرست است؟'],
    { options: [
        ['The singular values are the square roots of the eigenvalues of A^T A', 'مقادیرِ منفرد ریشه‌ی دومِ مقادیرِ ویژه‌ی A^T A هستند'],
        ['Truncating to the top k singular triplets gives the best rank-k approximation', 'برش به k تاییِ برتر، بهترین تقریبِ رتبه-k را می‌دهد'],
        ['The SVD only exists for square, invertible matrices', 'SVD تنها برای ماتریس‌های مربعیِ معکوس‌پذیر وجود دارد'],
        ['U and V have orthonormal columns', 'ستون‌های U و V یکّه و متعامدند']],
      answer: 2 },
    ['The SVD exists for EVERY matrix, rectangular or singular — that is precisely why it is more useful than the eigendecomposition.',
     'SVD برای هر ماتریسی وجود دارد، مستطیلی یا تکین — و دقیقاً به همین دلیل از تجزیه‌ی ویژه مفیدتر است.'],
    ['svd']);

  Q('q-la-08', 'linear-algebra', 'advanced', 'mcq',
    ['A symmetric matrix has eigenvalues 4, 1 and -2. How is it classified?',
     'یک ماتریس متقارن مقادیرِ ویژه‌ی ۴، ۱ و ۲− دارد. چگونه طبقه‌بندی می‌شود؟'],
    { options: [['Positive definite', 'مثبت‌معین'], ['Positive semidefinite', 'نیمه‌معینِ مثبت'],
                ['Indefinite', 'نامعین'], ['Negative definite', 'منفی‌معین']],
      answer: 2 },
    ['Positive definite requires all eigenvalues > 0. A mix of positive and negative eigenvalues means indefinite (and the quadratic form has a saddle point).',
     'برای مثبت‌معین بودن باید همه‌ی مقادیرِ ویژه مثبت باشند. آمیختنِ مقادیرِ ویژه‌ی مثبت و منفی یعنی ماتریس نامعین است (و فرمِ درجه‌دو نقطه‌ی زینی دارد).'],
    ['eigenvalues', 'psd']);

  Q('q-la-09', 'linear-algebra', 'intermediate', 'num',
    ['Least squares: you have 3 points on a line y = 2x + 1. What is the residual sum of squares (RSS)?',
     'کمترین مربعات: سه نقطه روی خطِ y = 2x + 1 دارید. مجموعِ مربعاتِ باقیمانده (RSS) چقدر است؟'],
    { text: { en: 'Points: (0,1), (1,3), (2,5). Fit y = w0 + w1*x by least squares. RSS = ?',
              fa: 'نقاط: (0,1)، (1,3)، (2,5). با کمترین مربعات y = w0 + w1*x را برازش دهید. RSS = ؟' },
      answer: 0, tol: 0.001 },
    ['The points lie exactly on a line, so the fit is perfect and RSS = 0. Real data almost never does this — which is the point of least squares.',
     'نقاط دقیقاً روی یک خط‌اند، پس برازش کامل است و 0 = RSS. داده‌ی واقعی تقریباً هرگز این‌طور نیست — و این همان نکته‌ی کمترین مربعات است.'],
    ['least-squares']);

  Q('q-la-10', 'linear-algebra', 'beginner', 'mcq',
    ['Cosine similarity between x = [1, 0] and y = [0, 1] is:', 'شباهتِ کسینوسی بینِ x = [1, 0] و y = [0, 1] برابر است با:'],
    { options: [['0', '۰'], ['0.5', '۰/۵'], ['1', '۱'], ['undefined', 'تعریف‌نشده']], answer: 0 },
    ['The dot product is 0 and both vectors are unit length, so cosine similarity is 0: the vectors are orthogonal.',
     'ضربِ داخلی صفر است و هر دو بردار یکّه‌اند، پس شباهتِ کسینوسی صفر است: بردارها بر هم عمودند.'],
    ['cosine', 'orthogonality']);

  Q('q-la-11', 'linear-algebra', 'intermediate', 'msq',
    ['Which of these indicate that a design matrix X is problematic for ordinary least squares? (select all)',
     'کدام‌یک نشانه‌ی مشکل‌دار بودنِ ماتریسِ طراحیِ X برای کمترین مربعاتِ معمولی است؟ (همه‌ی موارد را انتخاب کنید)'],
    { options: [['A column is an exact copy of another', 'یک ستون کپیِ دقیقِ ستونِ دیگر است'],
                ['np.linalg.cond(X) is around 1e9', 'مقدارِ np.linalg.cond(X) حدود 1e9 است'],
                ['The number of rows exceeds the number of columns', 'تعدادِ سطرها از تعدادِ ستون‌ها بیشتر است'],
                ['One-hot encoding of all categories together with an intercept', 'یک‌هات‌کردنِ همه‌ی دسته‌ها همراه با عرض از مبدأ']],
      answers: [0, 1, 3] },
    ['Perfect collinearity (duplicate columns or the one-hot trap) makes X rank-deficient; a huge condition number means numerically singular. Having more rows than columns is normal and fine.',
     'هم‌خطیِ کامل (ستون‌های تکراری یا تله‌ی یک‌هات) باعث کمبودِ رتبه می‌شود؛ عددِ شرطِ بسیار بزرگ یعنی تکین از نظر عددی. بیشتر بودنِ سطرها از ستون‌ها طبیعی و بی‌اشکال است.'],
    ['collinearity', 'conditioning']);

  Q('q-la-12', 'linear-algebra', 'advanced', 'mcq',
    ['The Eckart-Young theorem says the error of the best rank-k approximation of A (Frobenius norm) equals:',
     'قضیه‌ی اکارت-یانگ می‌گوید خطای بهترین تقریبِ رتبه-k از A (با نُرمِ فروبنیوس) برابر است با:'],
    { options: [['sigma_{k}', 'sigma_{k}'], ['sigma_{k+1}', 'sigma_{k+1}'],
                ['sqrt(sum of sigma_i^2 for i > k)', 'ریشه‌ی مجموعِ sigma_i^2 برای k > i'],
                ['sigma_1 - sigma_k', 'sigma_1 - sigma_k']],
      answer: 2 },
    ['In the spectral norm the error is sigma_{k+1}; in the Frobenius norm it is the square root of the sum of the discarded squared singular values.',
     'در نُرمِ طیفی خطا برابر sigma_{k+1} است؛ در نُرمِ فروبنیوس برابر ریشه‌ی مجموعِ مقادیرِ منفردِ حذف‌شده به توانِ دو است.'],
    ['svd', 'low-rank']);

  /* =================================================================
     CALCULUS & OPTIMIZATION
     ================================================================= */
  Q('q-calc-01', 'calculus', 'beginner', 'num',
    ['Differentiate f(x) = x^3 - 6x at the given point. Enter f\'(x0).',
     'از f(x) = x^3 - 6x در نقطه‌ی داده‌شده مشتق بگیرید. مقدارِ f\'(x0) را وارد کنید.'],
    { gen: function () {
        var x0 = ri(-3, 4);
        return { text: { en: 'f(x) = x^3 - 6x,  x0 = ' + x0 + '.  f\'(x0) = ?',
                         fa: 'f(x) = x^3 - 6x،  x0 = ' + x0 + '.  مقدارِ f\'(x0) = ؟' },
                 answer: 3 * x0 * x0 - 6, tol: 0 };
      } },
    ['f\'(x) = 3x^2 - 6 by the power rule.', 'با قاعده‌ی توان داریم f\'(x) = 3x^2 - 6.'],
    ['derivatives']);

  Q('q-calc-02', 'calculus', 'intermediate', 'mcq',
    ['Which update rule is gradient descent on a loss L with learning rate eta?',
     'کدام قاعده‌ی به‌روزرسانی، گرادیانِ نزولی روی هزینه‌ی L با نرخِ یادگیریِ eta است؟'],
    { options: [['w <- w + eta * grad L(w)', 'w <- w + eta * grad L(w)'],
                ['w <- w - eta * grad L(w)', 'w <- w - eta * grad L(w)'],
                ['w <- w - grad L(w) / eta', 'w <- w - grad L(w) / eta'],
                ['w <- w - eta * L(w)', 'w <- w - eta * L(w)']],
      answer: 1 },
    ['The gradient points uphill (steepest increase), so we step in the opposite direction: w - eta * grad L.',
     'گرادیان به سمتِ بالا (بیشترین افزایش) اشاره می‌کند، پس در خلافِ آن گام برمی‌داریم: w - eta · grad L.'],
    ['gradient-descent']);

  Q('q-calc-03', 'calculus', 'intermediate', 'mcq',
    ['Your model has train MSE 0.02 and validation MSE 0.45. What is happening?',
     'مدل شما MSEِ آموزشِ ۰/۰۲ و MSEِ اعتبارسنجیِ ۰/۴۵ دارد. چه اتفاقی افتاده است؟'],
    { options: [['Underfitting — increase model capacity', 'کم‌برازش — ظرفیتِ مدل را زیاد کنید'],
                ['Overfitting — regularise or get more data', 'بیش‌برازش — منظم‌سازی کنید یا داده‌ی بیشتر بگیرید'],
                ['The learning rate is too high', 'نرخِ یادگیری بسیار بزرگ است'],
                ['The labels are shuffled', 'برچسب‌ها درهم ریخته‌اند']],
      answer: 1 },
    ['A small training error and a large validation gap is the signature of overfitting: low bias, high variance. Fix with more data, augmentation, regularisation or a smaller model.',
     'خطای آموزشِ کوچک با شکافِ بزرگِ اعتبارسنجی، نشانه‌ی بیش‌برازش است: اُریبِ کم، واریانسِ بالا. با داده‌ی بیشتر، افزایشِ داده، منظم‌سازی یا مدلِ کوچک‌تر درست می‌شود.'],
    ['overfitting', 'bias-variance']);

  Q('q-calc-04', 'calculus', 'intermediate', 'num',
    ['One gradient descent step: w0 = 10, gradient g = 4, learning rate 0.1. What is w1?',
     'یک گام گرادیانِ نزولی: w0 = 10، گرادیانِ g = 4، نرخِ یادگیری ۰/۱. مقدارِ w1 چقدر است؟'],
    { text: { en: 'w1 = w0 - eta * g = ?', fa: 'w1 = w0 - eta · g = ؟' }, answer: 9.6, tol: 0.001 },
    ['w1 = 10 - 0.1*4 = 9.6. The step moved against the gradient.', 'w1 = 10 - 0.1 × 4 = 9.6. گام در خلافِ گرادیان برداشته شد.'],
    ['gradient-descent']);

  Q('q-calc-05', 'calculus', 'advanced', 'mcq',
    ['In Adam, what is the purpose of the bias-correction terms m_hat and v_hat?',
     'در آدام، هدف از جملاتِ تصحیحِ اُریبِ m_hat و v_hat چیست؟'],
    { options: [['They implement weight decay', 'آن‌ها کاهشِ وزن را پیاده می‌کنند'],
                ['They correct the initialisation bias of the moment estimates toward zero', 'آن‌ها اُریبِ مقداردهیِ اولیه‌ی برآوردهای گشتاور به سمتِ صفر را تصحیح می‌کنند'],
                ['They clip the gradient', 'آن‌ها گرادیان را می‌بُرند'],
                ['They scale the learning rate by the batch size', 'آن‌ها نرخِ یادگیری را با اندازه‌ی بَچ مقیاس می‌دهند']],
      answer: 1 },
    ['m and v start at zero, so early estimates are biased toward zero; dividing by (1 - beta^t) removes that bias and makes early steps meaningful.',
     'm و v از صفر شروع می‌کنند، پس برآوردهای اولیه به سمتِ صفر اُریب‌اند؛ تقسیم بر (1 - beta^t) این اُریب را برمی‌دارد و گام‌های اولیه را معنادار می‌کند.'],
    ['adam', 'optimizers']);

  Q('q-calc-06', 'calculus', 'beginner', 'num',
    ['Chain rule: y = (2x + 1)^2. What is dy/dx at the given x?',
     'قاعده‌ی زنجیره‌ای: y = (2x + 1)^2. مقدارِ dy/dx در نقطه‌ی داده‌شده چقدر است؟'],
    { gen: function () {
        var x = ri(-2, 4);
        return { text: { en: 'x = ' + x + '.  dy/dx = ?', fa: 'x = ' + x + '.  مقدارِ dy/dx = ؟' },
                 answer: 4 * (2 * x + 1), tol: 0 };
      } },
    ['dy/dx = 2(2x+1) * 2 = 4(2x+1) by the chain rule.', 'با قاعده‌ی زنجیره‌ای داریم dy/dx = 2(2x+1) · 2 = 4(2x+1).'],
    ['chain-rule']);

  Q('q-calc-07', 'calculus', 'advanced', 'mcq',
    ['What does a Hessian with both positive and negative eigenvalues at a critical point tell you?',
     'هسینی که در یک نقطه‌ی بحرانی هم مقدارِ ویژه‌ی مثبت دارد هم منفی، چه می‌گوید؟'],
    { options: [['Local minimum', 'کمینه‌ی موضعی'], ['Local maximum', 'بیشینه‌ی موضعی'],
                ['Saddle point', 'نقطه‌ی زینی'], ['The point is a global optimum', 'نقطه بهینه‌ی سراسری است']],
      answer: 2 },
    ['Mixed curvature — increasing in some directions and decreasing in others — means a saddle point. Saddles, not local minima, are the main obstacle in high-dimensional non-convex optimisation.',
     'انحنای مختلط — افزایش در بعضی جهت‌ها و کاهش در بعضی دیگر — یعنی نقطه‌ی زینی. در بهینه‌سازیِ غیرمحدبِ پربُعد، مانعِ اصلی نقاطِ زینی‌اند نه کمینه‌های موضعی.'],
    ['hessian', 'saddle']);

  Q('q-calc-08', 'calculus', 'intermediate', 'msq',
    ['Which techniques reduce VARIANCE of a model without increasing bias? (select all)',
     'کدام تکنیک‌ها واریانسِ مدل را بدون افزایشِ اُریب کاهش می‌دهند؟ (همه را انتخاب کنید)'],
    { options: [['Bagging / random forests', 'بگینگ / جنگل‌های تصادفی'],
                ['Training a deeper network', 'آموزشِ شبکه‌ی عمیق‌تر'],
                ['Averaging predictions of several models', 'میانگین‌گیری از پیش‌بینی‌های چند مدل'],
                ['Removing regularisation', 'حذفِ منظم‌سازی']],
      answers: [0, 2] },
    ['Averaging independent-ish estimators cancels variance; that is exactly what bagging and ensembling do. Going deeper or removing regularisation generally increases variance.',
     'میانگین‌گیری از برآوردگرهای نسبتاً مستقل واریانس را خنثی می‌کند؛ این دقیقاً کاری است که بگینگ و ترکیب‌سازی می‌کنند. عمیق‌تر شدن یا حذفِ منظم‌سازی معمولاً واریانس را افزایش می‌دهد.'],
    ['bias-variance', 'ensembling']);

  /* =================================================================
     PROBABILITY
     ================================================================= */
  Q('q-prob-01', 'probability', 'intermediate', 'num',
    ['Bayes: a disease affects 1% of the population. A test is 95% sensitive and 95% specific. Someone tests positive — what is the probability they have the disease (in percent)?',
     'بیز: یک بیماری ۱٪ جمعیت را مبتلا می‌کند. یک تست ۹۵٪ حساسیت و ۹۵٪ اختصاصی بودن دارد. کسی مثبت می‌شود — احتمالِ ابتلای او (بر حسب درصد) چقدر است؟'],
    { text: { en: 'P(disease | +) = ? (give a percentage, e.g. 16.1)',
              fa: 'P(بیماری | +) = ؟ (به صورت درصد، مثلاً ۱۶/۱)' },
      answer: 16.1, tol: 0.3 },
    ['P(+|d)P(d) / P(+) = (0.95*0.01) / (0.95*0.01 + 0.05*0.99) = 0.0095/0.059 ≈ 16.1%. The base rate dominates — this is why rare-disease screening needs very specific tests.',
     'P(+|d)P(d) / P(+) = (0.95×0.01) / (0.95×0.01 + 0.05×0.99) = 0.0095/0.059 ≈ ۱۶/۱٪. نرخِ پایه غالب است — به همین دلیل غربالگریِ بیماری‌های نادر به تستِ بسیار اختصاصی نیاز دارد.'],
    ['bayes', 'base-rate']);

  Q('q-prob-02', 'probability', 'beginner', 'mcq',
    ['If A and B are independent, which equality must hold?', 'اگر A و B مستقل باشند، کدام تساوی باید برقرار باشد؟'],
    { options: [['P(A and B) = 0', 'P(A ∩ B) = 0'],
                ['P(A and B) = P(A) P(B)', 'P(A ∩ B) = P(A) P(B)'],
                ['P(A|B) = P(B|A)', 'P(A|B) = P(B|A)'],
                ['P(A or B) = P(A) P(B)', 'P(A ∪ B) = P(A) P(B)']],
      answer: 1 },
    ['Independence is defined by the product rule P(A ∩ B) = P(A)P(B). Disjoint events (P(A ∩ B) = 0) are the opposite of independent — knowing one tells you the other did not happen.',
     'استقلال با قاعده‌ی ضرب تعریف می‌شود: P(A ∩ B) = P(A)P(B). پیشامدهای مجزا (0 = P(A ∩ B)) نقطه‌ی مقابلِ مستقل‌اند — دانستنِ یکی می‌گوید دیگری رخ نداده است.'],
    ['independence']);

  Q('q-prob-03', 'probability', 'intermediate', 'num',
    ['Entropy: a fair 4-sided die has how many bits of entropy?', 'آنتروپی: یک تاسِ چهاروجهیِ سالم چند بیت آنتروپی دارد؟'],
    { text: { en: 'H = ? bits', fa: 'H = ؟ بیت' }, answer: 2, tol: 0.01 },
    ['H = -4 * (1/4) * log2(1/4) = log2(4) = 2 bits. The uniform distribution maximises entropy: log2(K) for K equally likely outcomes.',
     'H = -4 × (1/4) × log2(1/4) = log2(4) = ۲ بیت. توزیعِ یکنواخت آنتروپی را بیشینه می‌کند: log2(K) برای K پیشامدِ هم‌احتمال.'],
    ['entropy']);

  Q('q-prob-04', 'probability', 'intermediate', 'mcq',
    ['Which loss function corresponds to assuming a Gaussian likelihood with fixed variance?',
     'کدام تابعِ هزینه معادلِ فرضِ درست‌نماییِ گاوسی با واریانسِ ثابت است؟'],
    { options: [['MAE', 'MAE'], ['MSE', 'MSE'], ['Cross-entropy', 'آنتروپیِ متقاطع'], ['Huber', 'هوبر']], answer: 1 },
    ['Maximising a Gaussian likelihood with fixed sigma minimises the sum of squared errors. MAE corresponds to a Laplace likelihood, cross-entropy to a Bernoulli/categorical one.',
     'بیشینه‌سازیِ درست‌نماییِ گاوسی با sigma ثابت، مجموعِ مربعاتِ خطا را کمینه می‌کند. MAE با درست‌نماییِ لاپلاس و آنتروپیِ متقاطع با درست‌نماییِ برنولی/دسته‌ای متناظر است.'],
    ['likelihood', 'loss-functions']);

  Q('q-prob-05', 'probability', 'advanced', 'mcq',
    ['Why is Monte Carlo integration preferred over grid-based quadrature in high dimensions?',
     'چرا انتگرال‌گیریِ مونت‌کارلو در ابعادِ بالا بر انتگرال‌گیریِ شبکه‌ای ترجیح دارد؟'],
    { options: [['It is always more accurate for any fixed N', 'برای هر N ثابت همیشه دقیق‌تر است'],
                ['Its error rate O(N^-1/2) does not depend on the dimension', 'نرخِ خطای آن O(N^-1/2) به بُعد وابسته نیست'],
                ['It needs no random numbers', 'به اعدادِ تصادفی نیاز ندارد'],
                ['It converges in O(N^-1)', 'با نرخِ O(N^-1) همگرا می‌شود']],
      answer: 1 },
    ['Deterministic quadrature suffers the curse of dimensionality (error ~ N^{-r/d}); Monte Carlo error is ~N^{-1/2} regardless of d. Accuracy 10x better costs 100x more samples.',
     'انتگرال‌گیریِ قطعی دچارِ نفرینِ ابعاد است (خطا ~ N^{-r/d})؛ خطای مونت‌کارلو مستقل از d است و ~N^{-1/2}. برای دقتِ ۱۰ برابر بهتر، ۱۰۰ برابر نمونه‌ی بیشتر لازم است.'],
    ['monte-carlo']);

  Q('q-prob-06', 'probability', 'beginner', 'num',
    ['Expected value: a game pays 10 with probability 0.3 and 0 otherwise. What is the expected payout?',
     'امیدِ ریاضی: یک بازی با احتمالِ ۰/۳ مبلغِ ۱۰ می‌پردازد و در غیر این صورت صفر. پرداختِ مورد انتظار چقدر است؟'],
    { text: { en: 'E[X] = ?', fa: 'E[X] = ؟' }, answer: 3, tol: 0.01 },
    ['E[X] = 10 * 0.3 + 0 * 0.7 = 3. Linearity of expectation needs no independence — that is what makes it so useful.',
     'E[X] = 10 × 0.3 + 0 × 0.7 = 3. خطی بودنِ امیدِ ریاضی به استقلال نیاز ندارد — این همان چیزی است که آن را بسیار مفید می‌کند.'],
    ['expectation']);

  Q('q-prob-07', 'probability', 'intermediate', 'msq',
    ['Which are true of KL divergence D_KL(p||q)? (select all)', 'کدام گزاره‌ها درباره‌ی واگراییِ KL یعنی D_KL(p||q) درست‌اند؟ (همه را انتخاب کنید)'],
    { options: [['It is always >= 0', 'همیشه نامنفی است'],
                ['It is symmetric in p and q', 'نسبت به p و q متقارن است'],
                ['It is zero when p = q', 'وقتی p = q باشد صفر است'],
                ['It can be infinite if q is zero where p is positive', 'اگر q در جایی که p مثبت است صفر باشد، می‌تواند بی‌نهایت شود']],
      answers: [0, 2, 3] },
    ['KL is non-negative and zero exactly when the distributions match, but it is asymmetric — it is a divergence, not a metric — and it blows up when q assigns zero where p has mass.',
     'KL نامنفی است و دقیقاً وقتی توزیع‌ها یکسان باشند صفر است، اما نامتقارن است — یک واگرایی است نه یک متریک — و وقتی q در جایی که p جرم دارد صفر بگذارد، منفجر می‌شود.'],
    ['kl', 'information-theory']);

  Q('q-prob-08', 'probability', 'advanced', 'mcq',
    ['A Markov chain has a unique stationary distribution when:',
     'یک زنجیره‌ی مارکوف چه زمانی توزیعِ مانای یکتا دارد؟'],
    { options: [['It is finite', 'متناهی باشد'],
                ['It is irreducible and aperiodic', 'تحویل‌ناپذیر و غیرتناوبی باشد'],
                ['It has a symmetric transition matrix', 'ماتریسِ گذارِ متقارن داشته باشد'],
                ['It has a state with a self-loop', 'حالتی با حلقه‌ی خودی داشته باشد']],
      answer: 1 },
    ['Irreducibility (every state reachable from every other) plus aperiodicity guarantees convergence to a unique stationary distribution from any starting state.',
     'تحویل‌ناپذیری (رسیدن از هر حالت به هر حالتِ دیگر) به‌علاوه‌ی غیرتناوبی بودن، همگرایی به یک توزیعِ مانای یکتا را از هر حالتِ شروع تضمین می‌کند.'],
    ['markov', 'stationary']);

  /* =================================================================
     STATISTICS
     ================================================================= */
  Q('q-stat-01', 'statistics', 'intermediate', 'mcq',
    ['What does a 95% confidence interval mean?', 'فاصله‌ی اطمینانِ ۹۵٪ به چه معناست؟'],
    { options: [['95% probability the true parameter lies in this interval', 'احتمالِ ۹۵٪ که پارامترِ واقعی در این بازه باشد'],
                ['95% of the data lies in this interval', '۹۵٪ داده در این بازه قرار دارد'],
                ['The procedure produces intervals containing the truth 95% of the time', 'روش در ۹۵٪ مواقع بازه‌هایی تولید می‌کند که شاملِ مقدارِ واقعی‌اند'],
                ['95% of sample means equal the parameter', '۹۵٪ میانگین‌های نمونه با پارامتر برابرند']],
      answer: 2 },
    ['In frequentist statistics the parameter is fixed and the interval is random, so "95% probability the parameter is inside" is a Bayesian (credible-interval) statement, not a confidence statement.',
     'در آمارِ فراوانی‌گرا پارامتر ثابت و بازه تصادفی است، پس گزاره‌ی «احتمالِ ۹۵٪ که پارامتر داخل است» یک گزاره‌ی بیزی (بازه‌ی معتبر) است، نه گزاره‌ای درباره‌ی فاصله‌ی اطمینان.'],
    ['confidence-interval']);

  Q('q-stat-02', 'statistics', 'beginner', 'mcq',
    ['With 99% negatives, accuracy is a poor metric because:', 'با ۹۹٪ نمونه‌ی منفی، دقت معیارِ بدی است چون:'],
    { options: [['It is hard to compute', 'محاسبه‌اش سخت است'],
                ['Predicting "negative" always already scores 99%', 'پیش‌بینیِ همیشگیِ «منفی» خودبه‌خود ۹۹٪ می‌گیرد'],
                ['It requires probabilities', 'به احتمال نیاز دارد'],
                ['It is not differentiable', 'مشتق‌پذیر نیست']],
      answer: 1 },
    ['The majority-class baseline already achieves 99% accuracy, so the metric cannot distinguish useful models from useless ones. Use PR-AUC, MCC or recall at a fixed precision instead.',
     'مبنای اکثریت خودبه‌خود به دقتِ ۹۹٪ می‌رسد، پس این معیار نمی‌تواند مدل‌های مفید را از بی‌فایده تشخیص دهد. به‌جای آن از PR-AUC، MCC یا بازیابی در دقتِ ثابت استفاده کنید.'],
    ['metrics', 'imbalance']);

  Q('q-stat-03', 'statistics', 'intermediate', 'num',
    ['Precision and recall: TP = 40, FP = 60, FN = 10. What is the F1 score (to 3 decimals)?',
     'دقت و بازیابی: TP = 40، FP = 60، FN = 10. امتیازِ F1 (با سه رقم اعشار) چقدر است؟'],
    { text: { en: 'F1 = ?', fa: 'F1 = ؟' }, answer: 0.533, tol: 0.005 },
    ['precision = 40/100 = 0.4, recall = 40/50 = 0.8, F1 = 2PR/(P+R) = 2*0.4*0.8/1.2 ≈ 0.533.',
     'precision = 40/100 = 0.4، recall = 40/50 = 0.8، F1 = 2PR/(P+R) = 2×0.4×0.8/1.2 ≈ ۰/۵۳۳.'],
    ['metrics', 'f1']);

  Q('q-stat-04', 'statistics', 'intermediate', 'mcq',
    ['You run 100 independent tests at alpha = 0.05 with no true effects. How many significant results do you expect?',
     'صد آزمونِ مستقل با 0.05 = alpha و بدون هیچ اثرِ واقعی اجرا می‌کنید. چند نتیجه‌ی معنادار انتظار دارید؟'],
    { options: [['0', '۰'], ['About 5', 'حدود ۵'], ['About 50', 'حدود ۵۰'], ['100', '۱۰۰']], answer: 1 },
    ['Each test has a 5% false-positive rate, so 100 * 0.05 = 5 false positives on average. This is the multiple-testing problem: use Bonferroni (FWER) or Benjamini-Hochberg (FDR).',
     'هر آزمون ۵٪ نرخِ مثبتِ کاذب دارد، پس به‌طور میانگین ۱۰۰ × ۰/۰۵ = ۵ مثبتِ کاذب. این همان مسئله‌ی آزمون‌های چندگانه است: از بونفرونی (FWER) یا بنجامینی-هاکبرگ (FDR) استفاده کنید.'],
    ['multiple-testing']);

  Q('q-stat-05', 'statistics', 'advanced', 'mcq',
    ['A variable Z causes both X and Y. You regress Y on X without controlling for Z. Your estimate is:',
     'متغیرِ Z هم عاملِ X است هم عاملِ Y. شما Y را روی X بدون کنترلِ Z رگرس می‌کنید. برآوردِ شما:'],
    { options: [['Unbiased', 'نااُریب است'],
                ['Confounded — it mixes the causal effect with the Z pathway', 'مخدوش است — اثرِ علّی را با مسیرِ Z می‌آمیزد'],
                ['A collider bias', 'دچارِ اُریبِ برخوردکننده است'],
                ['Precise but inefficient', 'دقیق اما ناکارا است']],
      answer: 1 },
    ['Z is a confounder: it opens a back-door path X <- Z -> Y. You must condition on Z (or randomise X). Conditioning on a COLLIDER — a variable caused by both — would create bias instead.',
     'Z یک متغیرِ مخدوش‌کننده است: یک مسیرِ درِ پشتیِ X <- Z -> Y باز می‌کند. باید روی Z شرطی کنید (یا X را تصادفی‌سازی کنید). شرطی‌کردن روی یک برخوردکننده — متغیری که از هر دو ناشی می‌شود — برعکس اُریب می‌سازد.'],
    ['causal', 'confounding']);

  Q('q-stat-06', 'statistics', 'intermediate', 'num',
    ['Standard error: sample of n = 400 with standard deviation s = 20. What is the standard error of the mean?',
     'خطای استاندارد: نمونه‌ای با 400 = n و انحرافِ معیارِ 20 = s. خطای استانداردِ میانگین چقدر است؟'],
    { text: { en: 'SE = s / sqrt(n) = ?', fa: 'SE = s / sqrt(n) = ؟' }, answer: 1, tol: 0.01 },
    ['SE = 20 / sqrt(400) = 20/20 = 1. Note that quadrupling n only halves the standard error.',
     'SE = 20 / sqrt(400) = 20/20 = 1. توجه کنید که چهار برابر کردنِ n تنها خطای استاندارد را نصف می‌کند.'],
    ['standard-error', 'clt']);

  Q('q-stat-07', 'statistics', 'beginner', 'mcq',
    ['Adding an L1 (lasso) penalty to a linear model tends to:', 'افزودنِ جریمه‌ی L1 (لاسو) به یک مدل خطی تمایل دارد به:'],
    { options: [['Shrink all coefficients smoothly to small non-zero values', 'همه‌ی ضرایب را نرم به مقادیرِ کوچکِ ناصفر میرا کند'],
                ['Drive some coefficients to exactly zero (feature selection)', 'برخی ضرایب را دقیقاً به صفر می‌راند (انتخابِ ویژگی)'],
                ['Increase variance', 'واریانس را افزایش دهد'],
                ['Make the model non-linear', 'مدل را غیرخطی کند']],
      answer: 1 },
    ['The L1 penalty corresponds to a Laplace prior concentrated at zero, and its diamond-shaped constraint region produces solutions on the axes — exact zeros. L2 (ridge) shrinks smoothly instead.',
     'جریمه‌ی L1 با پیشینِ لاپلاسِ متمرکز در صفر متناظر است و ناحیه‌ی قیدِ لوزی‌شکلِ آن جواب‌هایی روی محورها تولید می‌کند — صفرهای دقیق. در مقابل، L2 (ریج) نرم میرا می‌کند.'],
    ['lasso', 'regularization']);

  Q('q-stat-08', 'statistics', 'advanced', 'mcq',
    ['You fit a scaler on the full dataset before splitting. What happens?',
     'یک مقیاس‌دهنده را پیش از تقسیم روی کلِ مجموعه‌داده برازش می‌دهید. چه اتفاقی می‌افتد؟'],
    { options: [['Nothing — scaling is harmless', 'هیچ — مقیاس‌بندی بی‌ضرر است'],
                ['Data leakage: test statistics leak into training, metrics look too good', 'نشتِ داده: آماره‌های آزمون به آموزش نشت می‌کنند و معیارها بهتر از واقعیت به نظر می‌رسند'],
                ['The model becomes non-linear', 'مدل غیرخطی می‌شود'],
                ['Cross-validation becomes faster', 'اعتبارسنجیِ متقابل سریع‌تر می‌شود']],
      answer: 1 },
    ['Any statistic computed over the full dataset (mean, max, category maps, imputation values) carries test information into training. Fit preprocessing inside a pipeline on the training fold only.',
     'هر آماره‌ای که روی کلِ مجموعه‌داده حساب شود (میانگین، بیشینه، نگاشت‌های دسته‌ای، مقادیرِ جای‌گذاری) اطلاعاتِ آزمون را به آموزش می‌برد. پیش‌پردازش را درونِ خطِ لوله و تنها روی بخشِ آموزش برازش دهید.'],
    ['leakage', 'pipelines']);

  Q('q-stat-09', 'statistics', 'intermediate', 'mcq',
    ['A p-value of 0.03 means:', 'مقدارِ p برابر ۰/۰۳ یعنی:'],
    { options: [['The null hypothesis has a 3% probability of being true', 'احتمالِ درستیِ فرضِ صفر ۳٪ است'],
                ['Given the null is true, data this extreme occurs 3% of the time', 'به‌شرط درستیِ فرضِ صفر، داده‌ای به این شدت ۳٪ مواقع رخ می‌دهد'],
                ['There is a 97% probability the alternative is true', 'احتمالِ ۹۷٪ که فرضِ مقابل درست است'],
                ['The effect is large', 'اثر بزرگ است']],
      answer: 1 },
    ['The p-value conditions on the null being true; it says nothing directly about the probability of hypotheses. Effect size and confidence intervals are what tell you how big the effect is.',
     'مقدارِ p به‌شرطِ درستیِ فرضِ صفر است؛ مستقیماً درباره‌ی احتمالِ فرضیه‌ها چیزی نمی‌گوید. این اندازه‌ی اثر و فواصلِ اطمینان‌اند که بزرگیِ اثر را می‌گویند.'],
    ['p-values', 'hypothesis-testing']);

  Q('q-stat-10', 'statistics', 'advanced', 'num',
    ['Bias-variance: MSE decomposes as Bias^2 + Variance + irreducible noise. If bias = 2 and variance = 5 and noise = 1, what is the MSE?',
     'اُریب-واریانس: MSE به Bias^2 + Variance + نویزِ کاهش‌ناپذیر تجزیه می‌شود. اگر bias = 2، variance = 5 و نویز = 1 باشد، MSE چقدر است؟'],
    { text: { en: 'MSE = ?', fa: 'MSE = ؟' }, answer: 10, tol: 0.01 },
    ['2^2 + 5 + 1 = 10. Note the bias term is squared, so a modest bias can be worth a large variance reduction.',
     '2^2 + 5 + 1 = 10. توجه کنید جمله‌ی اُریب به توانِ دو می‌رسد، پس یک اُریبِ اندک می‌تواند به کاهشِ واریانسِ بزرگی بیارزد.'],
    ['bias-variance']);

  /* =================================================================
     PROGRAMMING & DATA
     ================================================================= */
  Q('q-prog-01', 'programming', 'beginner', 'num',
    ['Broadcasting: you add a (8, 1) array to a (8, 4) array. What is the shape of the result?',
     'پخش‌سازی: یک آرایه‌ی (۸٬۱) را با آرایه‌ای (۸٬۴) جمع می‌زنید. شکلِ نتیجه چیست؟'],
    { text: { en: 'Enter the second dimension of the result (an integer)', fa: 'بُعدِ دومِ نتیجه را وارد کنید (یک عدد صحیح)' }, answer: 4, tol: 0 },
    ['The dimension of size 1 stretches to match: (8,1) + (8,4) -> (8,4).', 'بُعدی که اندازه‌ی ۱ دارد کش می‌آید تا برابر شود: (8,1) + (8,4) -> (8,4).'],
    ['broadcasting', 'numpy']);

  Q('q-prog-02', 'programming', 'beginner', 'mcq',
    ['In NumPy, which indexing operation returns a VIEW (shares memory) rather than a copy?',
     'در نام‌پای، کدام عملِ نمایه‌گذاری یک نما (اشتراکِ حافظه) برمی‌گرداند نه یک کپی؟'],
    { options: [['a[[0, 2, 5]]', 'a[[0, 2, 5]]'], ['a > 0.5 (boolean mask)', 'a > 0.5 (نقابِ بولی)'],
                ['a[::2]', 'a[::2]'], ['a.flatten()', 'a.flatten()']],
      answer: 2 },
    ['Basic slicing (including strided slices) returns views; fancy indexing with integer arrays or boolean masks returns copies. np.shares_memory settles any doubt.',
     'برشِ پایه (از جمله برش‌های با گام) نما برمی‌گرداند؛ نمایه‌گذاریِ fancy با آرایه‌های صحیح یا نقاب‌های بولی کپی برمی‌گرداند. تابع np.shares_memory هر تردیدی را رفع می‌کند.'],
    ['numpy', 'views']);

  Q('q-prog-03', 'programming', 'intermediate', 'mcq',
    ['Why is Parquet usually far better than CSV for analytics?',
     'چرا پارکت معمولاً برای تحلیل بسیار بهتر از CSV است؟'],
    { options: [['It is human-readable', 'قابل‌خواندن برای انسان است'],
                ['Column pruning, compression and embedded statistics', 'حذفِ ستون، فشرده‌سازی و آماره‌های درونی'],
                ['It is always smaller and always faster to write', 'همیشه کوچک‌تر و همیشه سریع‌تر برای نوشتن است'],
                ['It supports unicode better', 'یونیکُد را بهتر پشتیبانی می‌کند']],
      answer: 1 },
    ['Parquet is columnar, so a query touching 3 of 50 columns reads a fraction of the bytes; it also compresses, stores per-row-group statistics for predicate pushdown, and carries a schema.',
     'پارکت ستونی است، پس پرس‌وجویی که ۳ ستون از ۵۰ ستون را لمس می‌کند کسر کوچکی از بایت‌ها را می‌خواند؛ همچنین فشرده می‌کند، آماره‌های هر گروه‌سطر را برای فشارِ شرط به پایین ذخیره می‌کند و طرح‌واره دارد.'],
    ['parquet', 'storage']);

  Q('q-prog-04', 'programming', 'intermediate', 'num',
    ['Shape arithmetic: a Conv2d with kernel 5, padding 2, stride 1 on an input of size 28. What is the output size?',
     'حسابِ ابعاد: یک لایه‌ی Conv2d با کرنلِ ۵، حاشیه‌ی ۲ و گامِ ۱ روی ورودی به اندازه‌ی ۲۸. خروجی چه اندازه‌ای است؟'],
    { text: { en: 'O = floor((28 + 2*2 - 5)/1) + 1 = ?', fa: 'O = floor((28 + 2*2 - 5)/1) + 1 = ؟' }, answer: 28, tol: 0 },
    ['O = floor((I + 2P - K)/S) + 1 = floor((28 + 4 - 5)/1) + 1 = 28. Padding 2 with kernel 5 preserves the spatial size — the classic "same" padding for odd kernels.',
     'O = floor((I + 2P - K)/S) + 1 = floor((28 + 4 - 5)/1) + 1 = 28. حاشیه‌ی ۲ با کرنلِ ۵ اندازه‌ی مکانی را حفظ می‌کند — همان «same padding» کلاسیک برای کرنل‌های فرد.'],
    ['cnn', 'shapes']);

  Q('q-prog-05', 'programming', 'intermediate', 'msq',
    ['Which practices prevent training/serving skew? (select all)',
     'کدام روش‌ها از انحرافِ آموزش/سروینگ جلوگیری می‌کنند؟ (همه را انتخاب کنید)'],
    { options: [['Computing features once and reusing the code path', 'محاسبه‌ی یک‌باره‌ی ویژگی‌ها و استفاده‌ی مجدد از همان مسیرِ کد'],
                ['Storing fitted preprocessing state with the model', 'ذخیره‌ی حالتِ برازش‌یافته‌ی پیش‌پردازش کنارِ مدل'],
                ['Recomputing aggregates over the full dataset at serving time', 'محاسبه‌ی مجددِ تجمیع‌ها روی کلِ داده در زمانِ سروینگ'],
                ['Point-in-time correct joins when building training data', 'پیوندهای درستِ نقطه‌در-زمان هنگامِ ساختِ داده‌ی آموزش']],
      answers: [0, 1, 3] },
    ['Skew comes from different code paths or from using information not available at prediction time. Recomputing aggregates over the full dataset at serving time is exactly the mistake to avoid.',
     'انحراف از مسیرهای کدِ متفاوت یا از استفاده از اطلاعاتی می‌آید که در زمانِ پیش‌بینی در دسترس نیست. محاسبه‌ی مجددِ تجمیع‌ها روی کلِ داده در زمانِ سروینگ دقیقاً همان اشتباهی است که باید از آن پرهیز کرد.'],
    ['skew', 'feature-store']);

  Q('q-prog-06', 'programming', 'beginner', 'text',
    ['In pandas, which method returns an aligned result with the same shape as the input group, useful for computing "share of group total"?',
     'در پانداز، کدام متد نتیجه‌ای هم‌راستا و هم‌شکل با گروه ورودی برمی‌گرداند و برای محاسبه‌ی «سهم از کلِ گروه» مفید است؟'],
    { answers: ['transform', '.transform', 'groupby transform'] },
    ['groupby(...).transform(f) broadcasts the per-group statistic back to each row; apply is slower and does not guarantee alignment.',
     'groupby(...).transform(f) آماره‌ی هر گروه را به هر سطر پخش می‌کند؛ apply کندتر است و هم‌راستایی را تضمین نمی‌کند.'],
    ['pandas', 'groupby']);

  Q('q-prog-07', 'programming', 'advanced', 'mcq',
    ['You need the 3rd order per user and the days since their previous order. Which tool?',
     'شما به سومین سفارشِ هر کاربر و تعدادِ روز از سفارشِ قبلی‌اش نیاز دارید. کدام ابزار؟'],
    { options: [['A self-join on the orders table', 'یک self-join روی جدولِ سفارش‌ها'],
                ['ROW_NUMBER() and LAG() window functions', 'توابعِ پنجره‌ی ROW_NUMBER() و LAG()'],
                ['GROUP BY with COUNT(*)', 'GROUP BY با COUNT(*)'],
                ['A correlated subquery per row', 'یک زیرپرس‌وجوی همبسته به‌ازای هر سطر']],
      answer: 1 },
    ['Window functions do this in a single pass: ROW_NUMBER() ranks rows within a partition and LAG() reaches the previous row. Self-joins and correlated subqueries are O(n^2)-ish and much slower.',
     'توابعِ پنجره این را در یک گذر انجام می‌دهند: ROW_NUMBER() سطرها را درونِ یک بخش رتبه‌بندی می‌کند و LAG() به سطرِ قبلی می‌رسد. self-joinها و زیرپرس‌وجوهای همبسته از مرتبه‌ی O(n^2) و بسیار کندترند.'],
    ['sql', 'window-functions']);

  Q('q-prog-08', 'programming', 'intermediate', 'mcq',
    ['Why must you shuffle before splitting for cross-validation in most cases, but NOT for time series?',
     'چرا در بیشتر موارد باید پیش از تقسیم برای اعتبارسنجیِ متقابل درهم بزنید، اما برای سری‌های زمانی نه؟'],
    { options: [['Shuffling is always required', 'درهم‌زدن همیشه لازم است'],
                ['Time series rows are not i.i.d.; shuffling leaks the future into the past', 'سطرهای سریِ زمانی مستقل و هم‌توزیع نیستند؛ درهم‌زدن آینده را به گذشته نشت می‌دهد'],
                ['Time series cannot be cross-validated', 'سری‌های زمانی را نمی‌توان اعتبارسنجیِ متقابل کرد'],
                ['Shuffling breaks stratification', 'درهم‌زدن طبقه‌بندی را می‌شکند']],
      answer: 1 },
    ['For temporal data use TimeSeriesSplit (or a rolling-origin evaluation) so the model is always trained on the past and evaluated on the future, exactly as it will be in production.',
     'برای داده‌ی زمان‌مند از TimeSeriesSplit (یا ارزیابیِ مبدأِ غلتان) استفاده کنید تا مدل همیشه روی گذشته آموزش ببیند و روی آینده ارزیابی شود، دقیقاً آن‌طور که در تولید خواهد بود.'],
    ['cross-validation', 'time-series']);

  /* =================================================================
     CLASSICAL ML
     ================================================================= */
  Q('q-ml-01', 'ml', 'intermediate', 'mcq',
    ['With 1% positives, which curve is usually more informative?', 'با ۱٪ نمونه‌ی مثبت، کدام منحنی معمولاً آموزنده‌تر است؟'],
    { options: [['ROC, because it is threshold-free', 'ROC، چون بدون آستانه است'],
                ['Precision-Recall, because its baseline is the prevalence', 'دقت-بازیابی، چون مبنای آن شیوع است'],
                ['Both are identical', 'هر دو یکسان‌اند'],
                ['The loss curve', 'منحنیِ هزینه']],
      answer: 1 },
    ['A ROC curve with 99% negatives can look excellent while precision is terrible; the PR baseline is the prevalence (0.01), so the curve shows the real trade-off.',
     'یک منحنیِ ROC با ۹۹٪ منفی می‌تواند عالی به نظر برسد در حالی که دقتِ مثبت افتضاح است؛ مبنای منحنیِ PR همان شیوع (۰/۰۱) است، پس این منحنی بده‌بستانِ واقعی را نشان می‌دهد.'],
    ['metrics', 'imbalance']);

  Q('q-ml-02', 'ml', 'intermediate', 'mcq',
    ['Random forests reduce variance mainly by:', 'جنگل‌های تصادفی عمدتاً با چه چیزی واریانس را کاهش می‌دهند؟'],
    { options: [['Training deeper trees', 'آموزشِ درخت‌های عمیق‌تر'],
                ['Averaging many decorrelated trees trained on bootstrap samples', 'میانگین‌گیری از درخت‌های ناهمبسته‌ی زیاد که روی نمونه‌های بوت‌استرپ آموزش دیده‌اند'],
                ['Using fewer features per split', 'استفاده از ویژگی‌های کمتر در هر گسُل'],
                ['Boosting the learning rate', 'افزایشِ نرخِ یادگیری']],
      answer: 1 },
    ['Bagging averages many high-variance trees; bootstrap resampling plus random feature subsets decorrelates them so the average has much lower variance at similar bias.',
     'بگینگ از درخت‌های پُرواریانسِ زیاد میانگین می‌گیرد؛ بازنمونه‌گیریِ بوت‌استرپ به‌همراه زیرمجموعه‌های تصادفیِ ویژگی آن‌ها را ناهمبسته می‌کند تا میانگین با اُریبِ مشابه واریانسِ بسیار کمتری داشته باشد.'],
    ['random-forest', 'bagging']);

  Q('q-ml-03', 'ml', 'advanced', 'mcq',
    ['Gradient boosting differs from bagging in that:', 'تقویتِ گرادیانی با بگینگ در این تفاوت دارد که:'],
    { options: [['It trains models in parallel', 'مدل‌ها را به‌صورت موازی آموزش می‌دهد'],
                ['It fits new models to the residuals / negative gradient of the current ensemble', 'مدل‌های جدید را بر باقیمانده‌ها / منفیِ گرادیانِ ترکیبِ فعلی برازش می‌دهد'],
                ['It reduces variance only', 'تنها واریانس را کاهش می‌دهد'],
                ['It requires no hyperparameters', 'به ابرپارامتر نیاز ندارد']],
      answer: 1 },
    ['Boosting is sequential and bias-reducing: each new weak learner fits the negative gradient of the loss with respect to the current predictions.',
     'بوستینگ ترتیبی و کاهنده‌ی اُریب است: هر یادگیرنده‌ی ضعیفِ جدید بر منفیِ گرادیانِ هزینه نسبت به پیش‌بینی‌های فعلی برازش می‌یابد.'],
    ['boosting']);

  Q('q-ml-04', 'ml', 'intermediate', 'num',
    ['Parameters: a linear layer mapping 784 inputs to 128 outputs, with bias. How many parameters?',
     'پارامترها: یک لایه‌ی خطی که ۷۸۴ ورودی را به ۱۲۸ خروجی می‌نگارد، با بایاس. چند پارامتر؟'],
    { text: { en: '784*128 + 128 = ?', fa: '784*128 + 128 = ؟' }, answer: 100480, tol: 0 },
    ['Weights: 784 * 128 = 100,352; biases: 128. Total = 100,480. The largest layer dominates the parameter budget — which is where quantisation and LoRA matter most.',
     'وزن‌ها: 784 × 128 = ۱۰۰٬۳۵۲؛ بایاس‌ها: ۱۲۸. مجموع = ۱۰۰٬۴۸۰. بزرگ‌ترین لایه بر بودجه‌ی پارامترها غالب است — همان‌جایی که کوانتیزاسیون و LoRA بیشترین اهمیت را دارند.'],
    ['parameters', 'neural-networks']);

  Q('q-ml-05', 'ml', 'intermediate', 'mcq',
    ['You see train AUC 0.99, validation AUC 0.71. The most likely first thing to check is:',
     'AUCِ آموزش ۰/۹۹ و AUCِ اعتبارسنجی ۰/۷۱ است. نخستین چیزی که باید بررسی کنید چیست؟'],
    { options: [['The learning rate', 'نرخِ یادگیری'],
                ['Data leakage or a wrong split (duplicates across splits / no grouping)', 'نشتِ داده یا تقسیمِ اشتباه (تکرار بینِ تقسیم‌ها / بدون گروه‌بندی)'],
                ['The number of trees', 'تعدادِ درخت‌ها'],
                ['The random seed', 'دانه‌ی تصادفی']],
      answer: 1 },
    ['A gap this large is almost always leakage (a duplicated or post-outcome feature, or rows shared between splits). Shuffle the labels and re-score: if the model still beats chance, the pipeline leaks.',
     'شکافی به این بزرگی تقریباً همیشه نشت است (ویژگیِ تکراری یا پس از پیامد، یا سطرهای مشترک بینِ تقسیم‌ها). برچسب‌ها را درهم بزنید و دوباره امتیاز بگیرید: اگر مدل هنوز از شانس بهتر بود، خطِ لوله نشت دارد.'],
    ['leakage', 'overfitting']);

  Q('q-ml-06', 'ml', 'beginner', 'mcq',
    ['Which algorithm needs feature scaling to behave sensibly?', 'کدام الگوریتم برای رفتارِ معقول به مقیاس‌بندیِ ویژگی نیاز دارد؟'],
    { options: [['Decision trees', 'درخت‌های تصمیم'], ['Random forests', 'جنگل‌های تصادفی'],
                ['k-nearest neighbours', 'نزدیک‌ترین همسایه‌ها (kNN)'], ['Gradient boosting', 'تقویتِ گرادیانی']],
      answer: 2 },
    ['Distance-based methods (kNN, k-means, SVM with kernels) and gradient-based methods care about scale. Tree-based splits are invariant to monotone transformations of individual features.',
     'روش‌های مبتنی بر فاصله (kNN، k-means، SVM با کرنل) و روش‌های مبتنی بر گرادیان به مقیاس حساس‌اند. گسُل‌های درختی نسبت به تبدیل‌های یکنوای تک‌ویژگی‌ها ناوردا هستند.'],
    ['scaling', 'knn']);

  Q('q-ml-07', 'ml', 'advanced', 'mcq',
    ['k-means assumes clusters are:', 'k-means فرض می‌کند خوشه‌ها:'],
    { options: [['Arbitrarily shaped and of varying density', 'با هر شکلی و با چگالیِ متغیر'],
                ['Roughly spherical and of similar size', 'تقریباً کروی و با اندازه‌ی مشابه'],
                ['Hierarchical', 'سلسله‌مراتبی'],
                ['Always two', 'همیشه دو تا']],
      answer: 1 },
    ['k-means minimises within-cluster variance, which favours convex, similarly-sized blobs. For crescents or varying density, use DBSCAN/HDBSCAN or a Gaussian mixture with full covariances.',
     'k-means واریانسِ درون‌خوشه‌ای را کمینه می‌کند که به نفعِ لکه‌های محدب و هم‌اندازه است. برای شکل‌های هلالی یا چگالیِ متغیر از DBSCAN/HDBSCAN یا آمیخته‌ی گاوسی با کوواریانسِ کامل استفاده کنید.'],
    ['clustering', 'kmeans']);

  Q('q-ml-08', 'ml', 'intermediate', 'num',
    ['PCA: the singular values of a centred data matrix are 10, 6, 2. What fraction of total variance does the first component capture (in percent)?',
     'PCA: مقادیرِ منفردِ ماتریسِ داده‌ی مرکززدایی‌شده برابر ۱۰، ۶ و ۲ است. مؤلفه‌ی اول چه کسری از واریانسِ کل را پوشش می‌دهد (بر حسب درصد)؟'],
    { text: { en: '100 * 10^2 / (10^2 + 6^2 + 2^2) = ?', fa: '100 * 10^2 / (10^2 + 6^2 + 2^2) = ؟' }, answer: 71.4, tol: 0.3 },
    ['Variance captured uses squared singular values: 100 / (100+36+4) = 100/140 ≈ 71.4%.',
     'واریانسِ پوشش‌داده‌شده از مقادیرِ منفردِ به توانِ دو استفاده می‌کند: ۱۰۰ / (۱۰۰+۳۶+۴) = ۱۰۰/۱۴۰ ≈ ۷۱/۴٪.'],
    ['pca', 'variance']);

  Q('q-ml-09', 'ml', 'intermediate', 'mcq',
    ['Regularization path: as lambda grows in ridge regression, coefficients:',
     'مسیرِ منظم‌سازی: با بزرگ شدنِ lambda در رگرسیونِ ریج، ضرایب:'],
    { options: [['Grow without bound', 'بی‌کران بزرگ می‌شون'],
                ['Shrink smoothly toward zero but rarely reach it exactly', 'نرم به سمتِ صفر میرا می‌شوند اما به‌ندرت دقیقاً به آن می‌رسند'],
                ['Become exactly zero one by one', 'یکی‌یکی دقیقاً صفر می‌شوند'],
                ['Do not change', 'تغییر نمی‌کنند']],
      answer: 1 },
    ['L2 shrinkage is smooth (a Gaussian prior); L1 is what produces exact zeros. Ridge is the right choice when many small effects all matter.',
     'میراییِ L2 نرم است (پیشینِ گاوسی)؛ این L1 است که صفرهای دقیق تولید می‌کند. وقتی اثراتِ کوچکِ زیادی مهم‌اند، ریج انتخابِ درست است.'],
    ['ridge', 'regularization']);

  Q('q-ml-10', 'ml', 'advanced', 'mcq',
    ['Permutation importance is often preferred over impurity-based importance because:',
     'اهمیتِ جایگشتی اغلب بر اهمیتِ مبتنی بر ناخالصی ترجیح دارد چون:'],
    { options: [['It is faster to compute', 'محاسبه‌اش سریع‌تر است'],
                ['It measures the effect on the actual validation metric and is computed on held-out data', 'اثر را روی معیارِ واقعی می‌سنجد و روی داده‌ی نگه‌داشته‌شده حساب می‌شود'],
                ['It works without labels', 'بدون برچسب کار می‌کند'],
                ['It is always positive', 'همیشه مثبت است']],
      answer: 1 },
    ['Impurity importance is computed on training data and biased toward high-cardinality features. Permutation importance shuffles a feature on held-out data and measures the drop in the metric you care about.',
     'اهمیتِ ناخالصی روی داده‌ی آموزش حساب می‌شود و به نفعِ ویژگی‌های با کاردینالیته‌ی بالا اُریب است. اهمیتِ جایگشتی یک ویژگی را روی داده‌ی نگه‌داشته‌شده درهم می‌زند و افتِ معیاری را که برای‌تان مهم است می‌سنجد.'],
    ['importance', 'evaluation']);

  Q('q-ml-11', 'ml', 'beginner', 'mcq',
    ['The purpose of a validation set is to:', 'هدف از مجموعه‌ی اعتبارسنجی این است که:'],
    { options: [['Fit the model parameters', 'پارامترهای مدل را برازش دهد'],
                ['Choose hyperparameters and detect overfitting without touching the test set', 'انتخابِ ابرپارامترها و تشخیصِ بیش‌برازش بدون دست‌زدن به مجموعه‌ی آزمون'],
                ['Increase the training data', 'داده‌ی آموزش را افزایش دهد'],
                ['Estimate the label noise', 'نویزِ برچسب را برآورد کند']],
      answer: 1 },
    ['Training fits parameters, validation guides choices (hyperparameters, early stopping, thresholds), and the test set is touched once at the very end to estimate production performance.',
     'آموزش پارامترها را برازش می‌دهد، اعتبارسنجی انتخاب‌ها را هدایت می‌کند (ابرپارامترها، توقفِ زودهنگام، آستانه‌ها) و مجموعه‌ی آزمون تنها یک‌بار در انتها لمس می‌شود تا عملکردِ تولید برآورد شود.'],
    ['splits', 'validation']);

  Q('q-ml-12', 'ml', 'advanced', 'num',
    ['Calibration economics: a false positive costs 5, a true positive gains 95. At what probability threshold should you flag?',
     'اقتصادِ کالیبراسیون: یک مثبتِ کاذب ۵ هزینه دارد و یک مثبتِ درست ۹۵ سود. در چه آستانه‌ی احتمالی باید پرچم بزنید؟'],
    { text: { en: 'threshold = cost / (cost + benefit) = ?', fa: 'آستانه = هزینه / (هزینه + سود) = ؟' }, answer: 0.05, tol: 0.001 },
    ['Flag when p * benefit > (1-p) * cost, i.e. p > cost/(cost+benefit) = 5/100 = 0.05. The threshold comes from economics, not from 0.5.',
     'وقتی p · سود > (1-p) · هزینه پرچم بزنید، یعنی p > هزینه/(هزینه+سود) = ۵/۱۰۰ = ۰/۰۵. آستانه از اقتصاد می‌آید، نه از ۰/۵.'],
    ['threshold', 'cost-sensitive']);

  /* =================================================================
     DEEP LEARNING
     ================================================================= */
  Q('q-dl-01', 'dl', 'beginner', 'mcq',
    ['Why is a non-linear activation necessary between linear layers?',
     'چرا وجودِ فعال‌سازِ غیرخطی بینِ لایه‌های خطی ضروری است؟'],
    { options: [['It speeds up matrix multiplication', 'ضربِ ماتریسی را سریع می‌کند'],
                ['Without it the whole network collapses to a single linear map', 'بدون آن کلِ شبکه به یک نگاشتِ خطیِ واحد فرو می‌ریزد'],
                ['It prevents overfitting by itself', 'به‌تنهایی از بیش‌برازش جلوگیری می‌کند'],
                ['It keeps gradients positive', 'گرادیان‌ها را مثبت نگه می‌دارد']],
      answer: 1 },
    ['W2(W1 x) = (W2 W1) x, so stacking linear layers adds no representational power. The non-linearity is what makes depth meaningful.',
     'W2(W1 x) = (W2 W1) x، پس روی‌هم‌چیدنِ لایه‌های خطی توانِ بازنمایی اضافه نمی‌کند. این غیرخطی بودن است که عمق را معنادار می‌کند.'],
    ['activations', 'neural-networks']);

  Q('q-dl-02', 'dl', 'intermediate', 'mcq',
    ['Which normalisation layer is batch-size independent and therefore the default in transformers?',
     'کدام لایه‌ی نرمال‌سازی مستقل از اندازه‌ی بَچ است و به همین دلیل در ترنسفورمرها پیش‌فرض است؟'],
    { options: [['BatchNorm', 'بَچ‌نرم'], ['LayerNorm', 'لایه‌نرم'], ['InstanceNorm', 'نمونه‌نرم'], ['No normalisation', 'بدون نرمال‌سازی']],
      answer: 1 },
    ['LayerNorm normalises across the feature dimension of each example, so it works with any batch size (and at inference with batch 1). BatchNorm needs a large batch and behaves differently in train/eval modes.',
     'لایه‌نرم در امتدادِ بُعدِ ویژگیِ هر نمونه نرمال می‌کند، پس با هر اندازه‌ی بَچی کار می‌کند (و در استنتاج با بَچِ ۱). بَچ‌نرم به بَچِ بزرگ نیاز دارد و در حالت‌های آموزش/ارزیابی رفتارِ متفاوتی دارد.'],
    ['layernorm', 'transformers']);

  Q('q-dl-03', 'dl', 'intermediate', 'mcq',
    ['Vanishing gradients in a deep sigmoid network happen because:',
     'محو شدنِ گرادیان در یک شبکه‌ی سیگمویدیِ عمیق به این دلیل رخ می‌دهد که:'],
    { options: [['The loss is not convex', 'هزینه محدب نیست'],
                ['Products of Jacobians with spectral radius < 1 shrink exponentially with depth', 'حاصل‌ضربِ ژاکوبین‌هایی با شعاعِ طیفیِ کمتر از ۱ با عمق به‌صورت نمایی کوچک می‌شوند'],
                ['The learning rate is too small', 'نرخِ یادگیری بسیار کوچک است'],
                ['Weights are initialised to zero', 'وزن‌ها صفر مقداردهی شده‌اند']],
      answer: 1 },
    ['The derivative of sigmoid is at most 0.25, so a product over many layers decays geometrically. ReLU-family activations (derivative 1 on the active side) plus residual connections fix this.',
     'مشتقِ سیگموید حداکثر ۰/۲۵ است، پس حاصل‌ضرب در لایه‌های زیاد به‌صورت هندسی میرا می‌شود. فعال‌سازهای خانواده‌ی ReLU (با مشتقِ ۱ در سمتِ فعال) به‌همراه اتصال‌های بازمانده این را درست می‌کنند.'],
    ['vanishing-gradients', 'backprop']);

  Q('q-dl-04', 'dl', 'advanced', 'mcq',
    ['Self-attention on a sequence of length n costs:', 'خودتوجهی روی دنباله‌ای به طولِ n چه هزینه‌ای دارد؟'],
    { options: [['O(n) time and O(n) memory', 'زمانِ O(n) و حافظه‌ی O(n)'],
                ['O(n log n) time', 'زمانِ O(n log n)'],
                ['O(n^2 d) time and O(n^2) memory', 'زمانِ O(n^2 d) و حافظه‌ی O(n^2)'],
                ['O(d^2) independent of n', 'O(d^2) مستقل از n']],
      answer: 2 },
    ['Every position attends to every other, giving an n x n score matrix. That quadratic cost is the reason for FlashAttention, sliding-window attention and linear/state-space alternatives.',
     'هر موقعیت به همه‌ی موقعیت‌های دیگر توجه می‌کند و یک ماتریسِ امتیازِ n×n می‌سازد. همین هزینه‌ی درجه‌دو دلیلِ وجودِ فلش‌توجه، توجهِ پنجره‌ی لغزان و جایگزین‌های خطی/فضای-حالت است.'],
    ['attention', 'complexity']);

  Q('q-dl-05', 'dl', 'intermediate', 'mcq',
    ['Dropout during training scales activations by 1/(1-p) (inverted dropout) so that:',
     'دراپ‌اوت در زمانِ آموزش فعال‌سازی‌ها را در 1/(1-p) ضرب می‌کند (دراپ‌اوتِ معکوس) تا:'],
    { options: [['Gradients become larger', 'گرادیان‌ها بزرگ‌تر شوند'],
                ['The expected activation magnitude is unchanged and inference needs no rescaling', 'بزرگیِ مورد انتظارِ فعال‌سازی تغییر نکند و استنتاج به مقیاس‌بندی نیاز نداشته باشد'],
                ['Training becomes slower', 'آموزش کندتر شود'],
                ['Weights stay small', 'وزن‌ها کوچک بمانند']],
      answer: 1 },
    ['Inverted dropout keeps the expected value at inference identical to training, so the serving code is a plain forward pass with no scaling — one less source of train/serve skew.',
     'دراپ‌اوتِ معکوس مقدارِ مورد انتظار را در استنتاج همانندِ آموزش نگه می‌دارد، پس کدِ سروینگ یک گذرِ پیش‌روی ساده بدون مقیاس‌بندی است — یک منبعِ انحرافِ آموزش/سرو کمتر.'],
    ['dropout', 'regularization']);

  Q('q-dl-06', 'dl', 'advanced', 'mcq',
    ['LoRA fine-tuning works by:', 'تنظیمِ ظریفِ LoRA با چه چیزی کار می‌کند؟'],
    { options: [['Freezing the model and training only a low-rank update B A added to the weights', 'منجمد کردنِ مدل و آموزشِ تنها یک به‌روزرسانیِ کم‌رتبه‌ی B A که به وزن‌ها افزوده می‌شود'],
                ['Retraining all weights with a small learning rate', 'بازآموزیِ همه‌ی وزن‌ها با نرخِ یادگیریِ کوچک'],
                ['Replacing attention with convolutions', 'جایگزینیِ توجه با پیچش‌ها'],
                ['Quantising the weights to 4 bits', 'کوانتیزه کردنِ وزن‌ها به ۴ بیت']],
      answer: 0 },
    ['LoRA keeps W frozen and learns W + (alpha/r) B A with r << d, so only ~0.1% of parameters are trained and the update can be merged back with no inference cost.',
     'LoRA ماتریسِ W را منجمد نگه می‌دارد و عبارت W + (alpha/r) B A را با r << d می‌آموزد، پس تنها حدود ۰/۱٪ پارامترها آموزش می‌بینند و به‌روزرسانی را می‌توان بدون هزینه‌ی استنتاج ادغام کرد.'],
    ['lora', 'peft']);

  Q('q-dl-07', 'dl', 'intermediate', 'mcq',
    ['Why use logits (not probabilities) as the input to cross_entropy in PyTorch?',
     'چرا در پای‌تورچ از logits (نه احتمال‌ها) به‌عنوان ورودیِ cross_entropy استفاده می‌کنیم؟'],
    { options: [['Probabilities are slower to compute', 'محاسبه‌ی احتمال‌ها کندتر است'],
                ['Numerical stability and a fused, faster implementation (log-sum-exp trick)', 'پایداریِ عددی و پیاده‌سازیِ ترکیبیِ سریع‌تر (ترفندِ log-sum-exp)'],
                ['It increases model capacity', 'ظرفیتِ مدل را افزایش می‌دهد'],
                ['It is required by autograd', 'autograd آن را الزامی می‌کند']],
      answer: 1 },
    ['F.cross_entropy combines log_softmax with NLL using the log-sum-exp trick, avoiding overflow/underflow from computing softmax and log separately.',
     'تابع F.cross_entropy با استفاده از ترفندِ log-sum-exp تابعِ log_softmax را با NLL ترکیب می‌کند و از سرریز/زیرریزِ ناشی از محاسبه‌ی جداگانه‌ی سافت‌مکس و لگاریتم جلوگیری می‌کند.'],
    ['cross-entropy', 'numerical-stability']);

  Q('q-dl-08', 'dl', 'advanced', 'mcq',
    ['In diffusion models, the network is trained to predict:', 'در مدل‌های دیفیوژن، شبکه آموزش می‌بیند تا پیش‌بینی کند:'],
    { options: [['The clean image directly', 'مستقیماً تصویرِ تمیز را'],
                ['The noise that was added (or the score / velocity)', 'نویزی که افزوده شده (یا امتیاز / سرعت را)'],
                ['The class label', 'برچسبِ کلاس را'],
                ['The next token', 'توکنِ بعدی را']],
      answer: 1 },
    ['The simplified DDPM objective is plain MSE between the true noise and the predicted noise; equivalent formulations predict the score or (in flow matching) a velocity field.',
     'هدفِ ساده‌شده‌ی DDPM همان MSEِ بینِ نویزِ واقعی و نویزِ پیش‌بینی‌شده است؛ فرمول‌بندی‌های معادل، امتیاز یا (در تطبیقِ جریان) یک میدانِ سرعت را پیش‌بینی می‌کنند.'],
    ['diffusion', 'generative']);

  /* =================================================================
     GENAI
     ================================================================= */
  Q('q-gen-01', 'genai', 'beginner', 'mcq',
    ['Why does the same text cost more tokens in some languages than English?',
     'چرا یک متنِ یکسان در بعضی زبان‌ها توکن‌های بیشتری از انگلیسی مصرف می‌کند؟'],
    { options: [['The model is larger for those languages', 'مدل برای آن زبان‌ها بزرگ‌تر است'],
                ['Subword tokenizers trained mostly on English split other scripts into more pieces', 'توکن‌سازهای زیر‌واژه‌ای که عمدتاً روی انگلیسی آموزش دیده‌اند، خطوطِ دیگر را به قطعاتِ بیشتری می‌شکنند'],
                ['Those languages are processed twice', 'آن زبان‌ها دو بار پردازش می‌شوند'],
                ['They use more punctuation', 'نشانه‌گذاریِ بیشتری دارند']],
      answer: 1 },
    ['BPE vocabularies are dominated by English subwords, so Persian, Arabic, Chinese or code often need 2-5x more tokens for the same content — which directly raises cost and context usage.',
     'واژگانِ BPE تحت سلطه‌ی زیر‌واژه‌های انگلیسی است، پس فارسی، عربی، چینی یا کد اغلب برای محتوای یکسان ۲ تا ۵ برابر توکنِ بیشتری نیاز دارند — که مستقیماً هزینه و مصرفِ متن را بالا می‌برد.'],
    ['tokenization', 'cost']);

  Q('q-gen-02', 'genai', 'intermediate', 'mcq',
    ['In RAG, the single highest-leverage improvement is usually:',
     'در روشِ RAG، معمولاً پربازده‌ترین بهبود چیست؟'],
    { options: [['A bigger LLM', 'مدل زبانیِ بزرگ‌تر'],
                ['Better retrieval (chunking, hybrid search, reranking)', 'بازیابیِ بهتر (قطعه‌بندی، جست‌وجوی ترکیبی، بازرتبه‌بندی)'],
                ['A lower temperature', 'دمای کمتر'],
                ['More decoding tokens', 'توکن‌های رمزگشاییِ بیشتر']],
      answer: 1 },
    ['If the correct passage is not retrieved, no prompt or model can recover it. Measure recall@k first; then add a reranker on top of hybrid retrieval.',
     'اگر پاراگرافِ درست بازیابی نشود، هیچ فراخوان یا مدلی نمی‌تواند آن را برگرداند. ابتدا recall@k را بسنجید؛ سپس یک بازرتبه‌بند روی جست‌وجوی ترکیبی بیفزایید.'],
    ['rag', 'retrieval']);

  Q('q-gen-03', 'genai', 'intermediate', 'mcq',
    ['When is fine-tuning the wrong tool?', 'چه زمانی تنظیمِ ظریف ابزارِ اشتباهی است؟'],
    { options: [['When you need a consistent output format', 'وقتی به قالبِ خروجیِ یکدست نیاز دارید'],
                ['When you need to inject up-to-date factual knowledge', 'وقتی نیاز دارید دانشِ واقعیِ به‌روز تزریق کنید'],
                ['When you need domain tone and jargon', 'وقتی به لحن و اصطلاحاتِ حوزه نیاز دارید'],
                ['When you need to reduce prompt length', 'وقتی می‌خواهید طولِ فراخوان را کم کنید']],
      answer: 1 },
    ['Fine-tuning shapes behaviour; it memorises facts poorly and the knowledge goes stale. Use RAG (or tool access) for facts and fine-tuning for format, tone and behaviour.',
     'تنظیمِ ظریف رفتار را شکل می‌دهد؛ واقعیت‌ها را بد حفظ می‌کند و دانش‌اش کهنه می‌شود. برای واقعیت‌ها از RAG (یا دسترسی به ابزار) و برای قالب، لحن و رفتار از تنظیمِ ظریف استفاده کنید.'],
    ['fine-tuning', 'rag']);

  Q('q-gen-04', 'genai', 'advanced', 'mcq',
    ['What does the KL term in the RLHF objective do?', 'جمله‌ی KL در هدفِ RLHF چه می‌کند؟'],
    { options: [['It makes training faster', 'آموزش را سریع‌تر می‌کند'],
                ['It penalises drifting too far from the reference model, limiting reward hacking', 'دور شدنِ زیاد از مدلِ مرجع را جریمه می‌کند و تقلبِ پاداش را محدود می‌سازد'],
                ['It computes the reward', 'پاداش را حساب می‌کند'],
                ['It replaces the reward model', 'جایگزینِ مدلِ پاداش می‌شود']],
      answer: 1 },
    ['The objective is E[r(x,y)] - beta * KL(pi || pi_ref). Without that anchor the policy exploits the learned reward model and output quality collapses — reward hacking.',
     'هدف عبارت است از E[r(x,y)] - beta · KL(pi || pi_ref). بدون این لنگر، سیاست از مدلِ پاداشِ آموخته‌شده سوءاستفاده می‌کند و کیفیتِ خروجی فرو می‌ریزد — همان تقلبِ پاداش.'],
    ['rlhf', 'alignment']);

  Q('q-gen-05', 'genai', 'intermediate', 'mcq',
    ['The main prompt-injection defence is:', 'دفاعِ اصلی در برابرِ تزریقِ فراخوان این است که:'],
    { options: [['Asking the model nicely not to be tricked', 'با احترام از مدل بخواهید فریب نخورد'],
                ['Treating retrieved/tool text as untrusted data and constraining actions with schemas, approvals and least privilege', 'متنِ بازیابی‌شده/ابزار را داده‌ی غیرقابل‌اعتماد بدانید و کنش‌ها را با طرح‌واره، تأیید و کمینه‌ی دسترسی محدود کنید'],
                ['Using a longer system prompt', 'استفاده از یک پیامِ سیستمِ طولانی‌تر'],
                ['Lowering the temperature to zero', 'رساندنِ دما به صفر']],
      answer: 1 },
    ['Separation of instructions from data plus least-privilege tools and human approval for irreversible actions is what actually holds; polite instructions in the prompt are not a security control.',
     'تفکیکِ دستورالعمل‌ها از داده به‌همراهِ ابزارهای کمینه‌دسترسی و تأییدِ انسانی برای کنش‌های برگشت‌ناپذیر همان چیزی است که واقعاً جواب می‌دهد؛ خواهشِ مؤدبانه در فراخوان یک کنترلِ امنیتی نیست.'],
    ['prompt-injection', 'security']);

  Q('q-gen-06', 'genai', 'advanced', 'mcq',
    ['Speculative decoding speeds up LLM inference by:', 'رمزگشاییِ حدسی استنتاجِ مدل زبانی را با چه چیزی سرعت می‌دهد؟'],
    { options: [['Reducing the model size', 'کوچک کردنِ اندازه‌ی مدل'],
                ['Having a small draft model propose tokens that the large model verifies in parallel', 'یک مدلِ پیش‌نویسِ کوچک توکن‌هایی پیشنهاد می‌دهد که مدلِ بزرگ به‌صورت موازی تأیید می‌کند'],
                ['Quantising the KV cache', 'کوانتیزه کردنِ کشِ KV'],
                ['Batching only identical prompts', 'بَچ‌بندیِ تنها فراخوان‌های یکسان']],
      answer: 1 },
    ['A cheap draft model generates a block of candidate tokens; the target model scores them in one forward pass and accepts the prefix that agrees, giving roughly 2-3x lower latency with identical outputs.',
     'یک مدلِ پیش‌نویسِ ارزان بلوکی از توکن‌های نامزد تولید می‌کند؛ مدلِ هدف آن‌ها را در یک گذرِ پیش‌رو امتیاز می‌دهد و پیشوندِ موافق را می‌پذیرد، که با خروجیِ یکسان حدود ۲ تا ۳ برابر تأخیرِ کمتر می‌دهد.'],
    ['inference', 'speculative-decoding']);

  /* =================================================================
     MLOPS
     ================================================================= */
  Q('q-ops-01', 'ops', 'intermediate', 'mcq',
    ['Shadow deployment means:', 'استقرارِ سایه یعنی:'],
    { options: [['Serving 1% of traffic', 'سرو کردنِ ۱٪ ترافیک'],
                ['Running the new model alongside production, logging predictions but serving none of them', 'اجرای مدلِ جدید کنارِ تولید، ثبتِ پیش‌بینی‌ها بدون سرو کردنِ هیچ‌کدام'],
                ['Deploying at night', 'استقرار در شب'],
                ['Rolling back automatically', 'بازگشتِ خودکار']],
      answer: 1 },
    ['Shadow mode tests a candidate on live traffic with zero user impact — the best way to catch feature, scale and latency bugs before a canary.',
     'حالتِ سایه یک نامزد را روی ترافیکِ زنده بدون هیچ اثری بر کاربر می‌آزماید — بهترین راه برای گرفتنِ باگ‌های ویژگی، مقیاس و تأخیر پیش از کاناری.'],
    ['deployment', 'shadow']);

  Q('q-ops-02', 'ops', 'intermediate', 'mcq',
    ['A feature has PSI = 0.31 between the training reference and this week. What is the standard reading?',
     'یک ویژگی بینِ مرجعِ آموزش و این هفته مقدارِ PSI = 0.31 دارد. قرائتِ استاندارد چیست؟'],
    { options: [['Stable, no action needed', 'پایدار است، نیاز به اقدام نیست'],
                ['Monitor closely, minor shift', 'پایشِ دقیق، جابه‌جاییِ جزئی'],
                ['Major shift — investigate before trusting predictions', 'جابه‌جاییِ بزرگ — پیش از اعتماد به پیش‌بینی‌ها بررسی کنید'],
                ['The feature is useless', 'ویژگی بی‌فایده است']],
      answer: 2 },
    ['Conventional bands: PSI < 0.1 stable, 0.1-0.25 watch, > 0.25 major shift. It does not mean the model is broken, but it does mean the input population moved.',
     'باندهای متعارف: PSI کمتر از ۰/۱ پایدار، ۰/۱ تا ۰/۲۵ نیازمندِ توجه، بالاتر از ۰/۲۵ جابه‌جاییِ بزرگ. این به معنای خرابیِ مدل نیست، اما یعنی جمعیتِ ورودی جابه‌جا شده است.'],
    ['drift', 'monitoring']);

  Q('q-ops-03', 'ops', 'beginner', 'mcq',
    ['Which artefact must be shipped together with the model weights?',
     'کدام خروجی باید همراهِ وزن‌های مدل عرضه شود؟'],
    { options: [['The training notebook', 'نوت‌بوکِ آموزش'],
                ['The fitted preprocessing state (scalers, encoders, category maps)', 'حالتِ برازش‌یافته‌ی پیش‌پردازش (مقیاس‌دهنده‌ها، کدگذارها، نگاشت‌های دسته‌ای)'],
                ['The raw training data', 'داده‌ی خامِ آموزش'],
                ['The git history', 'تاریخچه‌ی گیت']],
      answer: 1 },
    ['Predictions are meaningless without the exact transformation applied at training time. Ship model + preprocessing + schema as one versioned artefact.',
     'بدون تبدیلِ دقیقی که در زمانِ آموزش اعمال شده، پیش‌بینی‌ها بی‌معنایند. مدل + پیش‌پردازش + طرح‌واره را به‌شکل یک خروجیِ نسخه‌گذاری‌شده عرضه کنید.'],
    ['packaging', 'skew']);

  Q('q-ops-04', 'ops', 'advanced', 'mcq',
    ['Sample Ratio Mismatch (SRM) in an A/B test means:',
     'عدم‌تطابقِ نسبتِ نمونه (SRM) در یک تستِ A/B یعنی:'],
    { options: [['The two variants have different conversion rates', 'دو نسخه نرخِ تبدیلِ متفاوتی دارند'],
                ['The observed traffic split differs from the intended one — usually a bug', 'تقسیمِ مشاهده‌شده‌ی ترافیک با تقسیمِ مورد نظر فرق دارد — معمولاً یک باگ'],
                ['The sample size is too small', 'حجمِ نمونه بسیار کوچک است'],
                ['Users were assigned twice', 'کاربران دو بار تخصیص یافته‌اند']],
      answer: 1 },
    ['SRM (chi-square p < 0.001) invalidates the whole experiment: assignment, logging or bot filtering is broken. Check it before looking at any metric.',
     'وجودِ SRM (با p < 0.001 در آزمونِ کای‌دو) کلِ آزمایش را باطل می‌کند: تخصیص، ثبت یا فیلترِ ربات خراب است. پیش از نگاه به هر معیاری آن را بررسی کنید.'],
    ['ab-testing', 'srm']);

  Q('q-ops-05', 'ops', 'advanced', 'num',
    ['Cost: an instance costs $1.20/hour and serves 3,000 requests/hour. What is the cost per 1,000 requests (in USD)?',
     'هزینه: یک نمونه در ساعت ۱/۲۰ دلار هزینه دارد و ۳٬۰۰۰ درخواست در ساعت سرو می‌کند. هزینه به‌ازای هر ۱٬۰۰۰ درخواست (به دلار) چقدر است؟'],
    { text: { en: 'USD per 1k requests = ?', fa: 'دلار به‌ازای هر ۱۰۰۰ درخواست = ؟' }, answer: 0.4, tol: 0.01 },
    ['1.20 / 3000 * 1000 = 0.40 USD. Batching that raises throughput to 6,000/h halves it to $0.20 — throughput, not just hardware price, drives unit cost.',
     '1.20 / 3000 × 1000 = 0.40 دلار. بَچ‌بندی‌ای که توان را به ۶٬۰۰۰ در ساعت برساند آن را به ۰/۲۰ دلار نصف می‌کند — این توان است که هزینه‌ی واحد را می‌گرداند، نه فقط قیمتِ سخت‌افزار.'],
    ['cost', 'capacity']);

  /* =================================================================
     RESPONSIBLE / PRACTICE
     ================================================================= */
  Q('q-resp-01', 'responsible', 'intermediate', 'mcq',
    ['The key property that makes SHAP attractive is:', 'ویژگیِ کلیدی که SHAP را جذاب می‌کند چیست؟'],
    { options: [['It is the fastest method', 'سریع‌ترین روش است'],
                ['Additivity: contributions sum to the prediction minus the base value, with a unique axiomatisation', 'جمعیّت: سهم‌ها با پیش‌بینی منهای مقدارِ پایه جمع می‌شوند و اصولِ موضوعه‌ی یکتا دارد'],
                ['It works only for neural networks', 'تنها برای شبکه‌های عصبی کار می‌کند'],
                ['It needs no data', 'به داده نیاز ندارد']],
      answer: 1 },
    ['Shapley values are the unique attribution satisfying efficiency (additivity), symmetry, dummy and additivity axioms — which is why they are the default despite the computation cost.',
     'مقادیرِ شپلی انتسابِ یکتایی هستند که در اصولِ کارایی (جمعیّت)، تقارن، بدل و جمعیّت صدق می‌کند — به همین دلیل با وجودِ هزینه‌ی محاسباتی پیش‌فرض‌اند.'],
    ['shap', 'interpretability']);

  Q('q-resp-02', 'responsible', 'advanced', 'mcq',
    ['Differential privacy with a smaller epsilon means:', 'حریمِ تفاضلی با epsilon کوچک‌تر یعنی:'],
    { options: [['Weaker privacy, better utility', 'حریمِ ضعیف‌تر، سودمندیِ بهتر'],
                ['Stronger privacy, usually worse utility', 'حریمِ قوی‌تر، معمولاً سودمندیِ بدتر'],
                ['More training data', 'داده‌ی آموزشِ بیشتر'],
                ['Deterministic output', 'خروجیِ قطعی']],
      answer: 1 },
    ['epsilon bounds how much one record can change the output distribution; smaller epsilon = more noise = stronger privacy but lower accuracy, especially for underrepresented groups.',
     'epsilon کران می‌زند که یک رکورد چقدر می‌تواند توزیعِ خروجی را تغییر دهد؛ epsilon کوچک‌تر یعنی نویزِ بیشتر یعنی حریمِ قوی‌تر اما دقتِ کمتر، به‌ویژه برای گروه‌های کم‌نمونه.'],
    ['differential-privacy']);

  Q('q-resp-03', 'responsible', 'advanced', 'mcq',
    ['Adversarial training is:', 'آموزشِ خصمانه عبارت است از:'],
    { options: [['Hiding the gradients from attackers', 'پنهان کردنِ گرادیان‌ها از مهاجمان'],
                ['Training on adversarially perturbed examples to make the model robust', 'آموزش روی نمونه‌های مخدوش‌شده‌ی خصمانه برای مقاوم کردنِ مدل'],
                ['Adding noise at inference only', 'افزودنِ نویز تنها در زمانِ استنتاج'],
                ['Testing with random inputs', 'آزمودن با ورودی‌های تصادفی']],
      answer: 1 },
    ['Training on PGD-generated perturbations is the defence that reliably improves robustness; obfuscated gradients give a false sense of security and are usually broken.',
     'آموزش روی مخدوش‌سازی‌های تولیدشده با PGD دفاعی است که مقاومت را به‌طور قابل‌اعتماد بهتر می‌کند؛ پنهان‌سازیِ گرادیان حسِ امنیتِ کاذب می‌دهد و معمولاً شکسته می‌شود.'],
    ['adversarial', 'robustness']);

  Q('q-prac-01', 'practice', 'beginner', 'mcq',
    ['The first thing to build in any ML project is:', 'نخستین چیزی که در هر پروژه‌ی یادگیری ماشین باید ساخت:'],
    { options: [['A deep neural network', 'یک شبکه‌ی عصبیِ عمیق'],
                ['A dumb baseline (last value, majority class, simple rule)', 'یک مبنای ساده‌لوحانه (آخرین مقدار، کلاسِ اکثریت، یک قاعده‌ی ساده)'],
                ['A hyperparameter sweep', 'یک جاروی ابرپارامترها'],
                ['A deployment pipeline', 'یک خطِ لوله‌ی استقرار']],
      answer: 1 },
    ['Without a baseline you cannot tell whether your model is better. Baselines also expose data problems and label leakage early.',
     'بدون مبنا نمی‌فهمید مدل‌تان بهتر است یا نه. مبناها همچنین مشکلاتِ داده و نشتِ برچسب را زود آشکار می‌کنند.'],
    ['baseline', 'workflow']);

  Q('q-prac-02', 'practice', 'intermediate', 'num',
    ['Experiment sizing: you need 4x more precision in an A/B test. By what factor must the sample size grow?',
     'اندازه‌ی آزمایش: برای دقتِ ۴ برابر بیشتر در یک تستِ A/B، حجمِ نمونه باید چند برابر شود؟'],
    { text: { en: 'factor = ? (an integer)', fa: 'ضریب = ؟ (یک عدد صحیح)' }, answer: 16, tol: 0 },
    ['Standard error scales as 1/sqrt(n), so 4x precision needs 4^2 = 16x the sample size. Precision is expensive.',
     'خطای استاندارد مانند 1/sqrt(n) مقیاس می‌شود، پس برای دقتِ ۴ برابر به 4^2 = ۱۶ برابر حجمِ نمونه نیاز است. دقت گران است.'],
    ['sample-size', 'ab-testing']);

  Q('q-prac-03', 'practice', 'beginner', 'mcq',
    ['Error analysis means:', 'تحلیلِ خطا یعنی:'],
    { options: [['Tuning hyperparameters until the loss is minimal', 'تنظیمِ ابرپارامترها تا کمینه شدنِ هزینه'],
                ['Systematically inspecting the examples the model gets wrong to find patterns', 'بررسیِ نظام‌مندِ نمونه‌هایی که مدل در آن‌ها اشتباه می‌کند تا الگوها پیدا شود'],
                ['Computing the standard error of a metric', 'محاسبه‌ی خطای استانداردِ یک معیار'],
                ['Checking the code for bugs', 'بررسیِ کد برای یافتنِ باگ']],
      answer: 1 },
    ['Looking at the worst false positives and false negatives tells you what data to collect, what features to add, and whether the label itself is noisy — usually higher ROI than tuning.',
     'نگاه کردن به بدترین مثبت‌ها و منفی‌های کاذب می‌گوید چه داده‌ای جمع کنید، چه ویژگی‌ای بیفزایید و آیا خودِ برچسب پُرنویز است — معمولاً بازدهیِ بیشتری از تنظیم دارد.'],
    ['error-analysis']);

  /* ------------------------------------------------------------------
     Statistical methods (lessons-11)
     ------------------------------------------------------------------ */

  Q('q-stat-11', 'statistics', 'beginner', 'mcq',
    ['A metric is heavily right-skewed and you compare two independent groups of n = 45. The default choice is:',
     'یک معیار به‌شدت راست‌چوله است و دو گروهِ مستقل با n = 45 را مقایسه می‌کنید. انتخابِ پیش‌فرض:'],
    { options: [['Pooled two-sample t-test', 'آزمونِ t دو‌نمونه‌ایِ ادغامی'],
                ['Welch t-test on the raw values', 'آزمونِ t ولچ روی مقادیرِ خام'],
                ['Mann-Whitney U or a permutation test', 'من‌ویتنی یا یک آزمونِ جایگشت'],
                ['Chi-square test of independence', 'آزمونِ استقلالِ کای‌دو']],
      answer: 2 },
    ['Skew with moderate n means the sampling distribution is not comfortably normal, and rank/permutation methods keep their validity without a distributional assumption. Mann-Whitney tests stochastic dominance, not medians — unless you also assume equal shapes.',
     'چولگی با n متوسط یعنی توزیعِ نمونه‌گیری با اطمینان نرمال نیست، و روش‌های رتبه‌ای/جایگشت بدون فرضِ توزیعی اعتبارشان را حفظ می‌کنند. من‌ویتنی چیرگیِ تصادفی را می‌آزماید، نه میانه‌ها را — مگر اینکه شکل‌های برابر را هم فرض کنید.'],
    ['method-selection', 'nonparametric']);

  Q('q-stat-12', 'statistics', 'intermediate', 'mcq',
    ['Why is the Welch t-test preferred over the pooled (Student) t-test by default?',
     'چرا آزمونِ t ولچ به‌طور پیش‌فرض بر آزمونِ t ادغامی (استیودنت) ترجیح دارد؟'],
    { options: [['It always has more power', 'همیشه توانِ بیشتری دارد'],
                ['It is valid when the variances differ, and costs almost nothing when they are equal', 'وقتی واریانس‌ها متفاوت‌اند معتبر است و وقتی برابرند تقریباً هیچ هزینه‌ای ندارد'],
                ['It does not require independence', 'به استقلال نیاز ندارد'],
                ['It uses the normal distribution instead of the t distribution', 'به‌جای توزیعِ t از توزیعِ نرمال استفاده می‌کند']],
      answer: 1 },
    ['The pooled test assumes equal variances; when that fails, its Type I error rate can be far from nominal in either direction. Welch adjusts the degrees of freedom and is nearly as powerful when variances are in fact equal — so there is little reason to test first and choose.',
     'آزمونِ ادغامی واریانس‌های برابر را فرض می‌کند؛ وقتی این فرض برقرار نباشد، نرخِ خطای نوعِ اولش می‌تواند در هر دو جهت از مقدارِ اسمی دور شود. ولچ درجاتِ آزادی را تعدیل می‌کند و وقتی واریانس‌ها واقعاً برابرند تقریباً به همان اندازه توانمند است — پس دلیلِ کمی برای آزمودنِ اولیه و انتخاب هست.'],
    ['welch', 't-test', 'assumptions']);

  Q('q-stat-13', 'statistics', 'intermediate', 'mcq',
    ['A permutation test is valid when the observations are:',
     'یک آزمونِ جایگشت وقتی معتبر است که مشاهده‌ها:'],
    { options: [['Normally distributed', 'نرمال توزیع شده باشند'],
                ['Exchangeable under the null hypothesis', 'تحتِ فرضِ صفر جایگزین‌پذیر باشند'],
                ['Independent of the sample size', 'مستقل از اندازه‌ی نمونه باشند'],
                ['Drawn from a known parametric family', 'از یک خانواده‌ی پارامتریِ معلوم کشیده شده باشند']],
      answer: 1 },
    ['Exchangeability under the null is the only requirement. Paired data are exchangeable within a pair (shuffle signs); clustered data are exchangeable at the cluster level (shuffle whole clusters). Normality is not needed at all.',
     'جایگزین‌پذیری تحتِ فرضِ صفر تنها شرط است. داده‌ی جفتی درونِ جفت جایگزین‌پذیر است (جابه‌جاییِ علامت‌ها)؛ داده‌ی خوشه‌ای در سطحِ خوشه (جابه‌جاییِ کلِ خوشه). نرمال‌بودن اصلاً لازم نیست.'],
    ['permutation', 'exchangeability']);

  Q('q-stat-14', 'statistics', 'intermediate', 'num',
    ['Two proportions: baseline p0 = 0.10, and you want to detect a lift to p1 = 0.12 at alpha = 0.05 (two-sided, z = 1.96) with 80% power (z = 0.84). How many users per arm? Round up to the nearest hundred.',
     'دو نسبت: مبنای p0 = 0.10 و می‌خواهید بهبود تا p1 = 0.12 را در آلفای ۰/۰۵ (دو‌طرفه، z = 1.96) با توانِ ۸۰٪ (z = 0.84) کشف کنید. چند کاربر در هر بازو؟ تا نزدیک‌ترین صد گرد کنید.'],
    { text: { en: 'n per arm = ?', fa: 'n در هر بازو = ؟' }, answer: 3900, tol: 60 },
    ['n = (1.96 + 0.84)^2 * (0.12*0.88 + 0.10*0.90) / (0.02)^2 = 7.849 * 0.1956 / 0.0004 ≈ 3838, so about 3,900 per arm. Note how a 20% relative lift on a 10% baseline still needs thousands of users.',
     'n = (1.96 + 0.84)^2 × (0.12×0.88 + 0.10×0.90) / (0.02)^2 = 7.849 × 0.1956 / 0.0004 ≈ ۳۸۳۸، یعنی حدود ۳٬۹۰۰ در هر بازو. توجه کنید که یک بهبودِ نسبیِ ۲۰٪ روی مبنای ۱۰٪ هنوز هزاران کاربر می‌خواهد.'],
    ['power', 'sample-size']);

  Q('q-stat-15', 'statistics', 'beginner', 'mcq',
    ['Which statement about a 95% confidence interval is correct?',
     'کدام گزاره درباره‌ی یک فاصله‌ی اطمینانِ ۹۵٪ درست است؟'],
    { options: [['95% of the observed data fall inside it', '۹۵٪ داده‌ی مشاهده‌شده درون آن می‌افتد'],
                ['There is a 95% probability that the true parameter is inside this particular interval', 'احتمالِ ۹۵٪ وجود دارد که پارامترِ واقعی درون این بازه‌ی خاص باشد'],
                ['If we repeated the procedure many times, about 95% of the intervals would contain the true parameter', 'اگر روش را بارها تکرار کنیم، حدود ۹۵٪ بازه‌ها شاملِ پارامترِ واقعی خواهند بود'],
                ['It is the range in which 95% of future observations will fall', 'بازه‌ای است که ۹۵٪ مشاهده‌های آینده در آن می‌افتند']],
      answer: 2 },
    ['The interval is random, the parameter is fixed (frequentist view). A statement about the probability that this specific interval contains the parameter is a Bayesian credible-interval statement. Option 4 describes a prediction interval.',
     'بازه تصادفی است و پارامتر ثابت (دیدگاهِ فراوانی‌گرا). گزاره‌ای درباره‌ی احتمالِ اینکه این بازه‌ی خاص شاملِ پارامتر باشد، یک گزاره‌ی بیزی درباره‌ی بازه‌ی معتبر است. گزینه‌ی ۴ یک بازه‌ی پیش‌بینی را توصیف می‌کند.'],
    ['confidence-interval', 'interpretation']);

  Q('q-stat-16', 'statistics', 'intermediate', 'mcq',
    ['You fit an OLS model on data where each user appears in many rows. The coefficients are fine but inference is wrong. What is the standard fix?',
     'یک مدلِ OLS روی داده‌ای برازش می‌دهید که هر کاربر در سطرهای متعدد ظاهر می‌شود. ضرایب خوب‌اند اما استنتاج غلط است. درمانِ استاندارد چیست؟'],
    { options: [['Use a larger learning rate', 'نرخِ یادگیریِ بزرگ‌تر به کار ببرید'],
                ['Drop the duplicated users', 'کاربرانِ تکراری را حذف کنید'],
                ['Use cluster-robust standard errors clustered on the user', 'از خطاهای معیارِ مقاومِ خوشه‌ای با خوشه‌بندی روی کاربر استفاده کنید'],
                ['Log-transform the outcome', 'خروجی را لگاریتم بگیرید']],
      answer: 2 },
    ['Rows from the same user are correlated, so the effective sample size is smaller than the row count and naive standard errors are too small. Cluster-robust (or a mixed model with a user effect) accounts for the dependence; HC3 alone does not, because heteroskedasticity and clustering are different problems.',
     'سطرهای یک کاربر همبسته‌اند، پس اندازه‌ی نمونه‌ی مؤثر از تعدادِ سطرها کوچک‌تر است و خطاهای معیارِ ساده‌لوحانه بیش از حد کوچک‌اند. خطاهای مقاومِ خوشه‌ای (یا یک مدلِ آمیخته با اثرِ کاربر) وابستگی را لحاظ می‌کند؛ HC3 به‌تنهایی نه، چون ناهمسانیِ واریانس و خوشه‌بندی دو مسئله‌ی متفاوت‌اند.'],
    ['clustered-standard-errors', 'ols']);

  Q('q-stat-17', 'statistics', 'intermediate', 'mcq',
    ['In a logistic regression the coefficient on "is_mobile" is 0.69. What does that mean?',
     'در یک رگرسیونِ لجستیک ضریبِ «is_mobile» برابرِ ۰/۶۹ است. این یعنی چه؟'],
    { options: [['Mobile users are 69% more likely to convert', 'احتمالِ تبدیلِ کاربرانِ موبایل ۶۹٪ بیشتر است'],
                ['The odds of conversion are multiplied by about 2 for mobile users, holding other variables fixed', 'شانسِ تبدیل برای کاربرانِ موبایل با سایر متغیرها ثابت، حدودِ ۲ برابر می‌شود'],
                ['Mobile users convert 0.69 percentage points more', 'کاربرانِ موبایل ۰/۶۹ واحدِ درصد بیشتر تبدیل می‌شوند'],
                ['The model explains 69% of the variance', 'مدل ۶۹٪ واریانس را تبیین می‌کند']],
      answer: 1 },
    ['exp(0.69) ≈ 2, so the odds double. It is an odds ratio, not a risk ratio: with a common outcome the two diverge sharply, so never present an odds ratio as "twice as likely".',
     'exp(0.69) ≈ ۲، پس شانس دو برابر می‌شود. این یک نسبتِ شانس است، نه نسبتِ خطر: با پیامدی شایع این دو به‌شدت از هم جدا می‌شوند، پس هرگز نسبتِ شانس را به شکلِ «دو برابر محتمل‌تر» ارائه نکنید.'],
    ['logistic', 'odds-ratio']);

  Q('q-stat-18', 'statistics', 'intermediate', 'mcq',
    ['A Poisson regression of event counts has Pearson chi-square / residual df = 4.8. What is the problem and the usual fix?',
     'یک رگرسیونِ پواسون روی شمارشِ رخدادها نسبتِ کای‌دوی پیرسون به df باقی‌مانده برابرِ ۴/۸ دارد. مشکل و درمانِ معمول چیست؟'],
    { options: [['Underdispersion; use a quasi-Poisson with a smaller scale',
                 'کم‌پراکنشی؛ از یک شِبه‌پواسون با مقیاسِ کوچک‌تر استفاده کنید'],
                ['Overdispersion; the standard errors are too small — move to a negative binomial (or quasi-Poisson)',
                 'بیش‌پراکنشی؛ خطاهای معیار بیش از حد کوچک‌اند — به دوجمله‌ایِ منفی (یا شِبه‌پواسون) بروید'],
                ['A missing offset; add log(exposure)',
                 'یک آفستِ از‌دست‌رفته؛ log(مواجهه) را بیفزایید'],
                ['Separation; regularise the model', 'جداشدگی؛ مدل را منظم کنید']],
      answer: 1 },
    ['Poisson forces Var = mean. A dispersion statistic well above 1 means the true variance exceeds the mean, so Poisson standard errors understate the uncertainty. Negative binomial adds a variance parameter (Var = mu + alpha*mu^2) and is the usual remedy.',
     'پواسون واریانس = میانگین را تحمیل می‌کند. یک آماره‌ی پراکنشِ بسیار بالاتر از ۱ یعنی واریانسِ واقعی از میانگین بیشتر است، پس خطاهای معیارِ پواسون عدم‌قطعیت را کمتر از واقع نشان می‌دهند. دوجمله‌ایِ منفی یک پارامترِ واریانس می‌افزاید (Var = mu + alpha*mu^2) و درمانِ معمول است.'],
    ['poisson', 'overdispersion']);

  Q('q-stat-19', 'statistics', 'advanced', 'mcq',
    ['What does Simpson paradox tell you when the sign of a comparison flips after splitting by a third variable?',
     'پارادوکسِ سیمپسون وقتی علامتِ یک مقایسه پس از تقسیم بر یک متغیرِ سوم برمی‌گردد، به شما چه می‌گوید؟'],
    { options: [['The data are corrupted', 'داده خراب است'],
                ['The pooled comparison mixed groups with different base rates, so it answered a different question',
                 'مقایسه‌ی تجمیعی گروه‌هایی با نرخ‌های مبنای متفاوت را مخلوط کرد، پس به پرسشِ دیگری پاسخ داد'],
                ['The sample was too small', 'نمونه بیش از حد کوچک بود'],
                ['You should use the pooled result because it has more data', 'باید از نتیجه‌ی تجمیعی استفاده کنید چون داده‌ی بیشتری دارد']],
      answer: 1 },
    ['The paradox is in the question, not the data. If the mix of the stratifying variable differs across the rows of the comparison, the pooled estimate is confounded. Stratify (Cochran-Mantel-Haenszel) or model the third variable — but first decide which question you actually want answered.',
     'پارادوکس در پرسش است نه در داده. اگر ترکیبِ متغیرِ طبقه‌بندی در سطرهای مقایسه فرق کند، برآوردِ تجمیعی مخدوش است. طبقه‌بندی کنید (کوکران-مانتل-هنزل) یا متغیرِ سوم را مدل کنید — اما نخست تصمیم بگیرید واقعاً کدام پرسش را می‌خواهید.'],
    ['simpson-paradox', 'confounding']);

  Q('q-stat-20', 'statistics', 'advanced', 'mcq',
    ['ICC = 0.10 with 20 rows per cluster. Roughly what is the effective sample size relative to the row count?',
     'ICC = 0.10 با ۲۰ سطر در هر خوشه. اندازه‌ی نمونه‌ی مؤثر نسبت به تعدادِ سطرها تقریباً چقدر است؟'],
    { options: [['About 90% of the rows', 'حدود ۹۰٪ سطرها'],
                ['About 63% of the rows', 'حدود ۶۳٪ سطرها'],
                ['About 34% of the rows', 'حدود ۳۴٪ سطرها'],
                ['Unchanged — clustering does not affect sample size', 'بدون تغییر — خوشه‌بندی روی اندازه‌ی نمونه اثر ندارد']],
      answer: 2 },
    ['Design effect = 1 + (m - 1) * ICC = 1 + 19 * 0.10 = 2.9, so the effective n is about n / 2.9 ≈ 34% of the rows. This is why 20,000 sessions from 1,000 users carry far less independent information than the row count suggests.',
     'اثرِ طرح = 1 + (m - 1) × ICC = 1 + 19 × 0.10 = ۲/۹، پس n مؤثر حدود ۳۴٪ سطرهاست. به همین دلیل ۲۰٬۰۰۰ نشست از ۱٬۰۰۰ کاربر اطلاعاتِ مستقلِ بسیار کمتری از آن دارد که تعدادِ سطرها نشان می‌دهد.'],
    ['icc', 'design-effect', 'mixed-models']);

  Q('q-stat-21', 'statistics', 'advanced', 'mcq',
    ['A study follows users for 90 days; 60% never churned. Analysing only the users who churned, or treating the others as churn = 0, both bias the answer. What is the right framing?',
     'یک مطالعه کاربران را ۹۰ روز دنبال می‌کند؛ ۶۰٪ هرگز ریزش نکرده‌اند. تحلیلِ تنها کاربرانی که ریزش کرده‌اند، یا صفر گرفتنِ بقیه، هر دو پاسخ را اریب می‌کند. چارچوبِ درست چیست؟'],
    { options: [['Logistic regression on churn = 0/1 for everyone', 'رگرسیونِ لجستیک روی ریزش = ۰/۱ برای همه'],
                ['Right-censored survival analysis: duration plus an event indicator', 'تحلیلِ بقایِ سانسورِ راست: مدت به‌همراه یک نشانگرِ رخداد'],
                ['Impute the missing churn dates with the mean', 'تاریخ‌های ریزشِ گمشده را با میانگین درون‌یابی کنید'],
                ['Drop the censored users and report the subgroup', 'کاربرانِ سانسور‌شده را حذف کنید و زیرگروه را گزارش کنید']],
      answer: 1 },
    ['The censored users contribute real information: they survived at least until day 90. Kaplan-Meier and Cox use exactly that. Collapsing to a binary flag throws away the timing and biases the estimate whenever the observation window varies.',
     'کاربرانِ سانسور‌شده اطلاعاتِ واقعی می‌دهند: حداقل تا روزِ ۹۰ دوام آورده‌اند. کاپلان-مایر و کاکس دقیقاً از همین استفاده می‌کنند. فشردن به یک پرچمِ دودویی زمان‌بندی را دور می‌ریزد و هرگاه پنجره‌ی مشاهده متفاوت باشد برآورد را اریب می‌کند.'],
    ['survival', 'censoring']);

  Q('q-stat-22', 'statistics', 'advanced', 'mcq',
    ['A Cox model gives a hazard ratio of 1.5 for the treatment group. The correct reading is:',
     'یک مدلِ کاکس برای گروهِ درمان نسبتِ مخاطره‌ی ۱/۵ می‌دهد. خوانشِ درست:'],
    { options: [['Treatment increases the probability of the event by 50%', 'درمان احتمالِ رخداد را ۵۰٪ افزایش می‌دهد'],
                ['At any instant, treated subjects experience the event at 1.5 times the rate of controls, conditional on having survived to that instant',
                 'در هر لحظه، آزمودنی‌های درمان رخداد را با ۱/۵ برابرِ نرخِ گروهِ کنترل تجربه می‌کنند، به شرطِ آنکه تا آن لحظه دوام آورده باشند'],
                ['Treatment reduces survival time by 50%', 'درمان زمانِ بقا را ۵۰٪ کاهش می‌دهد'],
                ['50% of treated subjects will have the event', '۵۰٪ آزمودنی‌های درمان رخداد را تجربه می‌کنند']],
      answer: 1 },
    ['A hazard ratio is a ratio of instantaneous rates under the proportional-hazards assumption, not a risk ratio and not a statement about survival probabilities. Convert to survival curves (or RMST differences) when communicating the result.',
     'نسبتِ مخاطره نسبتی از نرخ‌های لحظه‌ای تحتِ فرضِ مخاطره‌های متناسب است، نه نسبتِ خطر و نه گزاره‌ای درباره‌ی احتمال‌های بقا. هنگامِ انتقالِ نتیجه آن را به منحنی‌های بقا (یا اختلافِ RMST) تبدیل کنید.'],
    ['hazard-ratio', 'cox']);

  Q('q-stat-23', 'statistics', 'advanced', 'mcq',
    ['You backtest a forecaster and its 80% prediction interval covers the truth 55% of the time. What does that mean?',
     'یک پیش‌بین را پس‌آزمایی می‌کنید و بازه‌ی پیش‌بینیِ ۸۰٪‌اش حقیقت را ۵۵٪ وقت پوشش می‌دهد. این یعنی چه؟'],
    { options: [['The point forecasts are excellent', 'پیش‌بینی‌های نقطه‌ای عالی‌اند'],
                ['The intervals are too narrow — the model is overconfident about its own uncertainty',
                 'بازه‌ها بیش از حد تنگ‌اند — مدل نسبت به عدم‌قطعیتِ خودش بیش‌ازحد مطمئن است'],
                ['The intervals are too wide', 'بازه‌ها بیش از حد گشادند'],
                ['Backtesting does not apply to intervals', 'پس‌آزمایی برای بازه‌ها کاربرد ندارد']],
      answer: 1 },
    ['Calibration of intervals is checkable and often ignored. Under-coverage means the uncertainty model is wrong (wrong noise assumption, ignored parameter uncertainty, structural breaks), and any inventory or risk decision built on it will be systematically under-prepared.',
     'کالیبراسیونِ بازه‌ها قابل‌بررسی است و اغلب نادیده گرفته می‌شود. کم‌پوششی یعنی مدلِ عدم‌قطعیت غلط است (فرضِ نویزِ غلط، نادیده گرفتنِ عدم‌قطعیتِ پارامتر، گسست‌های ساختاری) و هر تصمیمِ موجودی یا ریسکی که روی آن بنا شود نظام‌مند کم‌آماده خواهد بود.'],
    ['forecasting', 'calibration', 'backtesting']);

  Q('q-stat-24', 'statistics', 'intermediate', 'mcq',
    ['A variable is missing not at random (MNAR). Which is true?',
     'یک متغیر به‌طور غیرتصادفی گم شده است (MNAR). کدام درست است؟'],
    { options: [['Complete-case analysis is unbiased', 'تحلیلِ مواردِ کامل نااریب است'],
                ['Multiple imputation under MAR removes the bias automatically', 'درون‌یابیِ چندگانه تحتِ MAR اریبی را خودکار حذف می‌کند'],
                ['No algorithm fixes it; you need a stated assumption and a sensitivity analysis',
                 'هیچ الگوریتمی درستش نمی‌کند؛ به یک فرضِ اعلام‌شده و یک تحلیلِ حساسیت نیاز دارید'],
                ['Weights always repair it', 'وزن‌ها همیشه آن را ترمیم می‌کنند']],
      answer: 2 },
    ['MNAR means missingness depends on the unobserved value itself, which the data cannot reveal. Imputation methods assume MAR (or MCAR). The honest response is to model the mechanism, report a range of assumptions, and show how strong the mechanism would have to be to change the conclusion.',
     'MNAR یعنی گم‌شدگی به خودِ مقدارِ مشاهده‌نشده وابسته است، چیزی که داده نمی‌تواند آشکار کند. روش‌های درون‌یابی MAR (یا MCAR) را فرض می‌کنند. پاسخِ صادقانه این است که سازوکار را مدل کنید، دامنه‌ای از فرض‌ها را گزارش کنید و نشان دهید سازوکار باید چقدر قوی باشد تا نتیجه عوض شود.'],
    ['missing-data', 'mnar', 'sensitivity']);

  Q('q-stat-25', 'statistics', 'advanced', 'mcq',
    ['A loss distribution has tail index alpha = 1.5 (Pareto-like). Which statement holds?',
     'یک توزیعِ زیان نمایِ دمِ alpha = 1.5 دارد (شبیهِ پارتو). کدام گزاره برقرار است؟'],
    { options: [['The mean is finite and the variance is infinite', 'میانگین متناهی و واریانس بی‌نهایت است'],
                ['Both mean and variance are finite', 'هم میانگین هم واریانس متناهی‌اند'],
                ['Both mean and variance are infinite', 'هم میانگین هم واریانس بی‌نهایت‌اند'],
                ['The distribution is light-tailed', 'توزیع دم‌سبک است']],
      answer: 0 },
    ['For a Pareto tail, moments of order >= alpha diverge: the mean needs alpha > 1, the variance needs alpha > 2. With alpha = 1.5 the sample mean converges painfully slowly and the sample variance does not settle at all — so averages are a poor guide to the loss.',
     'برای یک دمِ پارتو، گشتاورهای مرتبه‌ی >= alpha واگرا می‌شوند: میانگین به alpha > 1 و واریانس به alpha > 2 نیاز دارد. با alpha = 1.5 میانگینِ نمونه به‌کندیِ دردناکی همگرا می‌شود و واریانسِ نمونه اصلاً تثبیت نمی‌شود — پس میانگین‌ها راهنمایِ بدی برای زیان‌اند.'],
    ['heavy-tails', 'pareto', 'tail-index']);

  Q('q-stat-26', 'statistics', 'advanced', 'mcq',
    ['In a random-effects meta-analysis, I^2 = 78%. The best interpretation is:',
     'در یک فراتحلیلِ اثراتِ تصادفی، I^2 = ۷۸٪. بهترین تفسیر:'],
    { options: [['The pooled effect is highly significant', 'اثرِ تجمیعی بسیار معنادار است'],
                ['Most of the variation across studies is real between-study heterogeneity, not sampling noise',
                 'بیشترِ تغییراتِ بینِ مطالعات ناهمتجانسیِ واقعیِ بین‌مطالعه‌ای است، نه نویزِ نمونه‌گیری'],
                ['There is publication bias', 'سوگیریِ انتشار وجود دارد'],
                ['The studies should not have been pooled, and no summary should be reported',
                 'نباید مطالعات ادغام می‌شدند و هیچ خلاصه‌ای نباید گزارش شود']],
      answer: 1 },
    ['High I^2 means the true effects differ across settings. The pooled estimate then summarises a distribution, not a single constant — so report tau and the prediction interval (the range where a new study would land) alongside it, and investigate why the effects differ.',
     'I^2 بالا یعنی اثرهای واقعی در موقعیت‌های مختلف فرق دارند. در آن صورت برآوردِ تجمیعی یک توزیع را خلاصه می‌کند، نه یک ثابت یگانه — پس tau و بازه‌ی پیش‌بینی (محدوده‌ای که یک مطالعه‌ی جدید در آن می‌افتد) را همراهش گزارش کنید و بررسی کنید چرا اثرها فرق دارند.'],
    ['meta-analysis', 'heterogeneity', 'i2']);

  Q('q-stat-27', 'statistics', 'intermediate', 'mcq',
    ['Why does repeatedly peeking at a fixed-horizon A/B test inflate the false-positive rate?',
     'چرا نگاه کردنِ مکرر به یک آزمونِ A/B با افقِ ثابت نرخِ مثبتِ کاذب را بالا می‌برد؟'],
    { options: [['Because the data change between looks', 'چون داده بینِ نگاه‌ها تغییر می‌کند'],
                ['Because each look is another chance to cross the threshold, and the test was calibrated for one look',
                 'چون هر نگاه شانسِ دیگری برای عبور از آستانه است و آزمون برای یک نگاه کالیبره شده بود'],
                ['Because the sample size shrinks', 'چون اندازه‌ی نمونه کوچک می‌شود'],
                ['It does not, as long as alpha is 0.05', 'تا وقتی آلفا ۰/۰۵ باشد این اتفاق نمی‌افتد']],
      answer: 1 },
    ['Five looks at the 5% level can push the true false-positive rate to roughly 14%. Sequential designs fix this by spending alpha across looks (O\'Brien-Fleming, Pocock) or by using always-valid methods — confidence sequences and SPRT — that permit continuous monitoring.',
     'پنج نگاه در سطحِ ۵٪ می‌تواند نرخِ واقعیِ مثبتِ کاذب را به حدود ۱۴٪ برساند. طرح‌های پیاپی این را با خرج کردنِ آلفا در نگاه‌ها (اوبراین-فلمینگ، پوکاک) یا با استفاده از روش‌های همواره-معتبر — دنباله‌های اطمینان و SPRT — که پایشِ پیوسته را مجاز می‌کنند، درست می‌کنند.'],
    ['sequential', 'peeking', 'alpha-spending']);

  Q('q-stat-28', 'statistics', 'advanced', 'num',
    ['A GAM term has an effective degrees of freedom (edf) of 1.0 and another has edf = 8.7. What does the first term look like? Answer as a number: how many edf does a straight line use?',
     'یک جمله‌ی GAM درجه‌ی آزادیِ مؤثر (edf) برابرِ ۱/۰ و دیگری ۸/۷ دارد. جمله‌ی نخست چه شکلی است؟ به صورتِ عدد پاسخ دهید: یک خطِ راست چند edf استفاده می‌کند؟'],
    { text: { en: 'edf of a straight line = ?', fa: 'edf یک خطِ راست = ؟' }, answer: 1, tol: 0.01 },
    ['edf = 1 means the penalty has flattened the smooth into a straight line (a linear term), while edf = 8.7 means substantial wiggle. Quoting edf tells the reader whether the curvature is a real feature or noise you allowed through.',
     'edf = ۱ یعنی جریمه تابعِ هموار را به یک خطِ راست صاف کرده است (یک جمله‌ی خطی)، در حالی که edf = ۸/۷ یعنی موجِ قابل‌توجه. نقلِ edf به خواننده می‌گوید انحنا یک ویژگیِ واقعی است یا نویزی که اجازه‌ی عبورش را داده‌اید.'],
    ['gam', 'smoothing', 'edf']);

})(typeof window !== 'undefined' ? window : globalThis);
