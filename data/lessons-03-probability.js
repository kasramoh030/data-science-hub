/* =====================================================================
   lessons-03-probability.js  —  6 lessons
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'probability';

  /* ------------------------------------------------------------------ */
  L('prob-001', D, 'beginner', 11,
    ['Probability Axioms, Sets and Conditional Probability', 'اصل‌های احتمال، مجموعه‌ها و احتمال شرطی'],
    ['Three axioms, a bit of set algebra and one definition (conditioning) generate the entire subject — and most of the mistakes practitioners make come from misusing that one definition.',
     'سه اصل، کمی جبرِ مجموعه‌ها و یک تعریف (شرطی‌کردن) کل این موضوع را می‌سازند — و بیشتر اشتباه‌های کارورزان از بد به‌کار بردنِ همان یک تعریف است.'],
    [
      def('A probability measure P on a sample space Omega satisfies: (1) P(A) >= 0; (2) P(Omega) = 1; (3) for disjoint events, P(A union B) = P(A) + P(B) (countable additivity). Conditional probability: P(A|B) = P(A and B) / P(B) for P(B) > 0.',
          'یک اندازه‌ی احتمال P روی فضای نمونه‌ی Omega این‌هاست: (۱) 0 ≤ P(A)؛ (۲) P(Omega) = 1؛ (۳) برای پیشامدهای مجزا، P(A ∪ B) = P(A) + P(B) (جمعیّتِ شمارا). احتمال شرطی: P(A|B) = P(A ∩ B) / P(B) به‌شرط 0 < P(B).'),
      math('complement      P(A^c) = 1 - P(A)\nunion           P(A u B) = P(A) + P(B) - P(A n B)\nchain rule      P(A n B n C) = P(A) P(B|A) P(C|A,B)\nlaw of total pr P(A) = SUM_i P(A|B_i) P(B_i)     for a partition {B_i}\nindependence    P(A n B) = P(A)P(B)   <=>   P(A|B) = P(A)\n\nBayes:          P(B|A) = P(A|B) P(B) / P(A)\n\nWARNING:  P(A|B) is NOT P(B|A)      (the prosecutor fallacy)\n          independence != mutually exclusive'),
      p('Conditional independence is the workhorse of modelling: X and Y are conditionally independent given Z when P(X, Y | Z) = P(X|Z) P(Y|Z). Naive Bayes assumes features are conditionally independent given the class; a Markov chain assumes the future is conditionally independent of the past given the present. Each is a simplifying assumption that makes computation tractable — and each is false in a way you should be able to name.',
        'استقلال شرطی اسبِ بارکشِ مدل‌سازی است: X و Y به‌شرط Z مستقلِ شرطی‌اند هرگاه P(X, Y | Z) = P(X|Z) P(Y|Z). نایو بیز فرض می‌کند ویژگی‌ها به‌شرط کلاس مستقل‌اند؛ زنجیره‌ی مارکوف فرض می‌کند آینده به‌شرط حال از گذشته مستقل است. هر کدام فرضی ساده‌کننده است که محاسبه را شدنی می‌کند — و هر کدام به شکلی نادرست است که باید بتوانید آن را نام ببرید.'),
      code(`import numpy as np

rng = np.random.default_rng(0)

# Law of total probability + Bayes, empirically verified
p_disease = 0.01          # prevalence
p_pos_given_d = 0.99      # sensitivity
p_pos_given_h = 0.05      # false positive rate

p_pos = p_pos_given_d*p_disease + p_pos_given_h*(1 - p_disease)
p_d_given_pos = p_pos_given_d * p_disease / p_pos
print(f'P(disease | +) = {p_d_given_pos:.3f}')     # ~0.167, not 0.99!

# Monte Carlo check with 2 million people
N = 2_000_000
sick = rng.random(N) < p_disease
pos  = np.where(sick, rng.random(N) < p_pos_given_d, rng.random(N) < p_pos_given_h)
print('empirical:', round(float((sick & pos).sum() / pos.sum()), 4))

# Independence vs correlation: uncorrelated does NOT mean independent
x = rng.uniform(-1, 1, 100_000)
y = x**2                                  # fully dependent, zero correlation!
print('corr(x, x^2) =', round(float(np.corrcoef(x, y)[0, 1]), 4))`),
      ul(['Always name the conditioning set: "probability of churn given user is in cohort A and week >= 4".',
          'Base rates matter: a 99% accurate test on a 0.1% rare disease is wrong 99%+ of the time when positive.',
          'Independence is a strong assumption; correlation zero is much weaker and is all linear models can see.',
          'Simpson paradox: an association can reverse in every subgroup — always condition on the confounder.'],
         ['همیشه مجموعه‌ی شرطی را نام ببرید: «احتمالِ ریزش به‌شرط این‌که کاربر در گروه A و هفته ≥ ۴ باشد».',
          'نرخ‌های پایه مهم‌اند: تستی با دقت ۹۹٪ روی بیماری با شیوع ۰/۱٪ در صورت مثبت شدن، بیش از ۹۹٪ مواقع اشتباه است.',
          'استقلال فرضی قوی است؛ همبستگیِ صفر بسیار ضعیف‌تر است و تنها چیزی است که مدل‌های خطی می‌بینند.',
          'پارادوکس سیمپسون: یک رابطه ممکن است در هر زیرگروه معکوس شود — همیشه روی متغیرِ مخدوش‌کننده شرطی کنید.'])
    ],
    ['axioms', 'conditional', 'independence', 'bayes'],
    [R('Seeing Theory — visual probability', 'https://seeing-theory.brown.edu/', 'tool')]
  );

  /* ------------------------------------------------------------------ */
  L('prob-002', D, 'beginner', 12,
    ['Random Variables, PMF, PDF and CDF', 'متغیرهای تصادفی، تابع جرم، چگالی و توزیع تجمعی'],
    ['A random variable is a function from outcomes to numbers. Which of the three descriptions (PMF, PDF, CDF) you use decides how you compute, sample and debug.',
     'متغیر تصادفی تابعی از پیشامدها به عدد است. این‌که از کدام توصیف (PMF، PDF، CDF) استفاده کنید تعیین می‌کند چگونه محاسبه، نمونه‌گیری و دیباگ می‌کنید.'],
    [
      def('Discrete variables have a probability mass function (PMF) p(x) = P(X = x) with SUM p(x) = 1. Continuous variables have a density (PDF) with P(a <= X <= b) = INTEGRAL_a^b p(x) dx; note P(X = x) = 0 for any single point. The CDF F(x) = P(X <= x) works for both and is always non-decreasing from 0 to 1.',
          'متغیرهای گسسته تابع جرمِ احتمال (PMF) دارند که در آن p(x) = P(X = x) و Σ p(x) = 1. متغیرهای پیوسته چگالی (PDF) دارند با P(a ≤ X ≤ b) = ∫_a^b p(x) dx؛ توجه کنید برای هر نقطه‌ی منفرد P(X = x) = 0 است. تابع توزیع تجمعی F(x) = P(X ≤ x) برای هر دو کار می‌کند و همیشه از ۰ تا ۱ غیرنزولی است.'),
      math('PMF : SUM_x p(x) = 1,           E[X] = SUM_x x p(x)\nPDF : INTEGRAL p(x) dx = 1,   E[X] = INTEGRAL x p(x) dx\nCDF : F(x) = P(X <= x),       F(−inf)=0, F(+inf)=1, non-decreasing\n      P(a < X <= b) = F(b) - F(a)\n      quantile function Q(u) = F^{-1}(u)   -> inverse-CDF sampling!\n\nchange of variables:  if Y = g(X) then  p_Y(y) = p_X(x) * |dx/dy|'),
      code(`import numpy as np
rng = np.random.default_rng(0)

# Empirical CDF and the KS idea: compare sample CDF to a reference
def ecdf(sample, grid):
    return np.searchsorted(np.sort(sample), grid, side='right') / len(sample)

s = rng.exponential(scale=2.0, size=5000)
grid = np.linspace(0, 10, 9)
print(np.round(ecdf(s, grid), 3))
print(np.round(1 - np.exp(-grid/2.0), 3))       # theoretical F

# Inverse-CDF (a.k.a. Smirnov) sampling from scratch
def inv_cdf_exp(u, scale=2.0): return -scale*np.log(1-u)
samples = inv_cdf_exp(rng.random(100_000))
print('mean', round(float(samples.mean()), 3), 'theoretical 2.0')

# PMF vs PDF: a density can exceed 1, a probability cannot
from scipy import stats
print('N(0, 0.1) density at 0 =', round(float(stats.norm.pdf(0, 0, 0.1)), 3))   # > 1

# Transformation of variables with the Jacobian correction
x = rng.normal(0, 1, 200_000)
y = np.exp(x)                                    # lognormal
print('E[exp(X)]', round(float(y.mean()), 3), 'analytic', round(float(np.exp(0.5)), 3))`),
      ul(['A density value is not a probability; only its integral over a set is.',
          'Use log-densities in code — probabilities underflow to zero in high dimensions.',
          'The CDF is the only description that handles mixed discrete-continuous variables cleanly.',
          'Quantile functions turn uniform randomness into any distribution you want (inverse-CDF sampling).'],
         ['مقدارِ چگالی احتمال نیست؛ تنها انتگرال آن روی یک مجموعه احتمال است.',
          'در کد از چگالیِ لگاریتمی استفاده کنید — احتمال‌ها در ابعاد بالا به صفر سرریز می‌کنند.',
          'توزیع تجمعی تنها توصیفی است که متغیرهای آمیخته‌ی گسسته-پیوسته را تمیز handle می‌کند.',
          'توابع چارک، تصادفیِ یکنواخت را به هر توزیعی که بخواهید تبدیل می‌کنند (نمونه‌گیریِ معکوسِ CDF).'])
    ],
    ['random-variables', 'pmf', 'pdf', 'cdf', 'sampling'],
    [R('scipy.stats — continuous distributions', 'https://docs.scipy.org/doc/scipy/reference/stats.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('prob-003', D, 'intermediate', 16,
    ['Key Distributions and When to Reach for Each', 'توزیع‌های کلیدی و این‌که هر کدام کِی به‌کار می‌آیند'],
    ['You do not need 100 distributions. You need about twelve, plus the instinct for which one generates your data — because picking a likelihood IS picking a loss function.',
     'به ۱۰۰ توزیع نیاز ندارید. به حدود دوازده توزیع نیاز دارید، به‌علاوه‌ی این شهود که کدام‌یک داده‌ی شما را تولید می‌کند — چون انتخابِ درست‌نمایی همان انتخابِ تابع هزینه است.'],
    [
      p('Every negative log-likelihood is a loss function in disguise: Gaussian likelihood gives MSE, Bernoulli likelihood gives log loss / cross-entropy, Laplace likelihood gives MAE, Poisson likelihood gives Poisson regression loss. Choosing a distribution is choosing what your model cares about.',
        'هر منفیِ لگاریتمِ درست‌نمایی، تابع هزینه‌ای در لباس مبدّل است: درست‌نماییِ گاوسی MSE می‌دهد، درست‌نماییِ برنولی لاج‌لاس/آنتروپی متقاطع می‌دهد، درست‌نماییِ لاپلاس MAE می‌دهد و درست‌نماییِ پوآسون تابع هزینه‌ی رگرسیون پوآسون را می‌دهد. انتخابِ توزیع یعنی انتخابِ این‌که مدل به چه چیزی اهمیت بدهد.'),
      math('Bernoulli(p)      coin flip, click / no-click          -> binary cross-entropy\nBinomial(n, p)    number of successes in n trials       -> CTR, conversion counts\nCategorical       one of K classes                      -> cross-entropy\nPoisson(lambda)   counts in an interval, var = mean     -> events per minute, Poisson reg\nGaussian(mu, s2)  sum of many small effects (CLT)       -> MSE, most measurements\nExponential       waiting time, memoryless              -> time to next event\nGamma / Weibull   positive, skewed, survival analysis   -> time-to-failure\nBeta              a probability itself, on [0,1]        -> prior for p, Thompson sampling\nDirichlet         vector on the simplex                 -> prior for categoricals, LDA\nStudent-t         heavy tails, robust regression        -> outlier-friendly noise\nLog-normal        multiplicative growth                 -> incomes, latency, sizes\nZipf / power law  rank-frequency                       -> words, city sizes'),
      code(`import numpy as np
rng = np.random.default_rng(0)

# Likelihood -> loss, confirmed numerically
y = np.array([1., 0., 1., 1., 0.])
p = np.array([0.9, 0.2, 0.7, 0.4, 0.6])
bce = -np.mean(y*np.log(p) + (1-y)*np.log(1-p))
print('binary cross-entropy =', round(float(bce), 4))

# Poisson vs Gaussian for counts: variance grows with the mean
counts = rng.poisson(lam=3.0, size=100_000)
print('poisson mean', counts.mean().round(3), 'variance', counts.var().round(3))

# Heavy tails: how fast does the empirical max grow?
g = rng.normal(size=200_000)
t = rng.standard_t(df=3, size=200_000)
print('max |gaussian|', round(float(np.abs(g).max()), 1),
      ' max |t(3)|', round(float(np.abs(t).max()), 1))

# Beta-Binomial conjugacy: updating a click-rate belief as data arrives
a, b = 2.0, 8.0                                     # prior mean 0.2
obs = rng.binomial(1, 0.35, 500)                    # true rate 0.35
for chunk in np.array_split(obs, 10):
    a += chunk.sum(); b += len(chunk) - chunk.sum()
print('posterior mean', round(a/(a+b), 3))`),
      ul(['Counts with overdispersion (var >> mean) call for negative binomial, not Poisson.',
          'Data that cannot be negative and spans orders of magnitude: model log(y), or use Gamma/log-normal.',
          'Latency and revenue are almost always log-normal; taking logs before averaging is usually right.',
          'Class imbalance in the tail: extreme value theory (GPD) beats a Gaussian assumption for risk.'],
         ['شمارش‌هایی با پراکندگیِ بیش‌ازحد (واریانس بسیار بزرگ‌تر از میانگین) به دوجمله‌ایِ منفی نیاز دارند، نه پوآسون.',
          'داده‌ای که نمی‌تواند منفی باشد و چندین مرتبه‌ی بزرگی را می‌پوشاند: لگاریتمِ y را مدل کنید یا از گاما/لاگ‌نرمال استفاده کنید.',
          'تأخیر و درآمد تقریباً همیشه لاگ‌نرمال‌اند؛ گرفتنِ لگاریتم پیش از میانگین‌گیری معمولاً درست است.',
          'عدم توازنِ کلاس در دُم: نظریه‌ی مقادیر فرین (GPD) برای ریسک از فرضِ گاوسی بهتر است.']),
      note('Empirical check before you commit to a likelihood: plot a log-log histogram, compare mean vs variance, and look at the tail index. If the variance grows with the mean, you are not Gaussian.',
           'پیش از آن‌که به یک درست‌نمایی متعهد شوید، بررسی تجربی کنید: هیستوگرامِ لگ-لگ را بکشید، میانگین را با واریانس مقایسه کنید و نمایِ دُم را ببینید. اگر واریانس با میانگین رشد می‌کند، گاوسی نیستید.')
    ],
    ['distributions', 'likelihood', 'poisson', 'beta', 'heavy-tails'],
    [R('Distribution Explorer — Seeing Theory', 'https://seeing-theory.brown.edu/probability-distributions/index.html', 'tool'),
     R('Common distributions and their uses', 'https://distribution-explorer.github.io/', 'tool')]
  );

  /* ------------------------------------------------------------------ */
  L('prob-004', D, 'intermediate', 14,
    ['Expectation, Variance, Covariance, LLN and CLT', 'امید ریاضی، واریانس، کوواریانس، قانون اعداد بزرگ و قضیه‌ی حد مرکزی'],
    ['Two theorems carry most of applied statistics: the Law of Large Numbers (averages settle down) and the Central Limit Theorem (averages become Gaussian). Everything from A/B testing to confidence intervals rests on them.',
     'دو قضیه بخشِ بزرگی از آمار کاربردی را حمل می‌کنند: قانون اعداد بزرگ (میانگین‌ها آرام می‌گیرند) و قضیه‌ی حد مرکزی (میانگین‌ها گاوسی می‌شوند). همه‌چیز، از تست A/B تا فواصل اطمینان، بر آن‌ها استوار است.'],
    [
      def('E[X] is the centre of mass, Var(X) = E[(X - E[X])^2] the spread, Cov(X, Y) = E[(X - E[X])(Y - E[Y])] the joint movement. Correlation is the normalised covariance in [-1, 1]. LLN: the sample mean converges to E[X] as n grows. CLT: sqrt(n) (X_bar - mu) converges in distribution to N(0, sigma^2).',
          'E[X] مرکزِ جرم، Var(X) = E[(X - E[X])^2] پراکندگی و Cov(X, Y) = E[(X - E[X])(Y - E[Y])] حرکتِ مشترک است. همبستگی همان کوواریانسِ نرمال‌شده در بازه‌ی [1-, 1] است. قانون اعداد بزرگ: میانگینِ نمونه با رشدِ n به E[X] همگرا می‌شود. قضیه‌ی حد مرکزی: sqrt(n) (X_bar - mu) در توزیع به N(0, sigma^2) همگرا می‌شود.'),
      math('linearity     E[aX + bY] = aE[X] + bE[Y]      ALWAYS true\nvariance      Var(aX + bY) = a^2 Var(X) + b^2 Var(Y)   ONLY if independent\n              Var(X + Y) = Var(X) + Var(Y) + 2Cov(X,Y)\nE[X^2]        = Var(X) + E[X]^2          (the second moment identity)\n\nLLN : X_bar -> mu            as n -> inf\nCLT : X_bar ~ N(mu, sigma^2/n)   for large n, whatever the shape of X\n\nstandard error of the mean:  SE = sigma / sqrt(n)   -> 4x data halves the error'),
      code(`import numpy as np
rng = np.random.default_rng(0)

# CLT from three wildly non-normal parents
for name, draw in [('exponential', lambda n: rng.exponential(2.0, n)),
                   ('bernoulli(0.1)', lambda n: rng.binomial(1, 0.1, n)),
                   ('uniform', lambda n: rng.random(n))]:
    means = np.array([draw(2000).mean() for _ in range(4000)])
    print(f'{name:16s} mean of means={means.mean():.4f}  sd of means={means.std():.4f}')

# Standard error shrinks as 1/sqrt(n): the cost of precision
for n in [100, 400, 1600, 6400]:
    m = np.array([rng.exponential(2.0, n).mean() for _ in range(3000)])
    print('n', n, 'sd of mean', round(float(m.std()), 4), ' predicted', round(2.0/np.sqrt(n), 4))

# Covariance matrix by hand and via NumPy
X = rng.multivariate_normal([0, 0], [[2.0, 1.2], [1.2, 1.0]], size=100_000)
Xc = X - X.mean(0)
print('manual cov\\n', np.round(Xc.T @ Xc / len(X), 3))
print('np.cov\\n', np.round(np.cov(X.T), 3))`),
      ul(['Linearity of expectation needs no independence — that is why it is so useful.',
          'The CLT needs finite variance; for heavy tails (alpha < 2) the limit is a stable law, not Gaussian.',
          'The CLT is about the mean, not about individual observations — do not apply it to maxima.',
          'Correlation measures linear association only; check a scatter plot before trusting a coefficient.'],
         ['خطی بودنِ امید ریاضی به استقلال نیاز ندارد — به همین دلیل بسیار مفید است.',
          'قضیه‌ی حد مرکزی به واریانسِ متناهی نیاز دارد؛ برای دم‌های سنگین (2 < alpha) حد، یک توزیع پایدار است نه گاوسی.',
          'قضیه‌ی حد مرکزی درباره‌ی میانگین است، نه تک‌مشاهده‌ها — آن را به بیشینه‌ها اعمال نکنید.',
          'همبستگی تنها رابطه‌ی خطی را می‌سنجد؛ پیش از اعتماد به ضریب، نمودار پراکندگی را ببینید.'])
    ],
    ['expectation', 'variance', 'clt', 'lln', 'covariance'],
    [R('Central Limit Theorem — 3Blue1Brown', 'https://www.youtube.com/watch?v=zeJD6dqJ5lo', 'video')]
  );

  /* ------------------------------------------------------------------ */
  L('prob-005', D, 'intermediate', 15,
    ['Bayes Theorem and Information Theory', 'قضیه‌ی بیز و نظریه‌ی اطلاعات'],
    ['Bayes tells you how to update beliefs with evidence. Information theory tells you how many bits that evidence carried. Between them you get cross-entropy loss, KL regularization, mutual-information feature selection and the VAE objective.',
     'بیز می‌گوید چگونه باورها را با شواهد به‌روز کنید. نظریه‌ی اطلاعات می‌گوید آن شواهد چند بیت حمل می‌کردند. بین این دو، تابع هزینه‌ی آنتروپیِ متقاطع، منظم‌سازیِ KL، انتخاب ویژگی با اطلاعات متقابل و هدفِ VAE به دست می‌آید.'],
    [
      def('Entropy H(X) = -SUM p(x) log p(x) is the expected number of bits (log base 2) or nats (natural log) needed to encode a draw from p. Cross-entropy H(p, q) = -SUM p log q is the cost of encoding truth p using model q. KL divergence D_KL(p||q) = H(p, q) - H(p) is the extra cost, always >= 0.',
          'آنتروپیِ H(X) = -Σ p(x) log p(x) تعداد بیت (با لگاریتم در مبنای ۲) یا نات (با لگاریتم طبیعی) است که برای کدگذاری یک نمونه از p لازم است. آنتروپیِ متقاطعِ H(p, q) = -Σ p log q هزینه‌ی کدگذاریِ واقعیتِ p با مدلِ q است. واگراییِ KL یعنی D_KL(p||q) = H(p, q) - H(p) هزینه‌ی اضافی است و همیشه نامنفی است.'),
      math('H(X)          = -SUM_x p(x) log p(x)          in [0, log K]\ncross-entropy H(p,q) = -SUM_x p(x) log q(x)\nKL            D_KL(p||q) = SUM_x p(x) log (p(x)/q(x)) >= 0,  NOT symmetric\nmutual info   I(X;Y) = D_KL( p(x,y) || p(x)p(y) ) = H(X) - H(X|Y)\nchain rule    H(X,Y) = H(X) + H(Y|X)\n\nclassification: minimising cross-entropy == maximising log-likelihood\nGaussian KL (closed form, used by VAEs):\n  D_KL( N(m, s^2) || N(0,1) ) = 0.5 (m^2 + s^2 - 1 - 2 log s)'),
      code(`import numpy as np

def entropy(p):
    p = np.asarray(p, float); p = p[p > 0]
    return float(-(p*np.log2(p)).sum())

print('fair coin  ', round(entropy([.5, .5]), 3), 'bits')     # 1.0
print('biased     ', round(entropy([.99, .01]), 3), 'bits')   # ~0.081
print('4-way fair ', round(entropy([.25]*4), 3), 'bits')      # 2.0

def kl(p, q):
    p = np.asarray(p, float); q = np.asarray(q, float)
    return float((p*np.log(p/q)).sum())

p = np.array([0.5, 0.5]); q = np.array([0.9, 0.1])
print('KL(p||q)', round(kl(p, q), 4), '  KL(q||p)', round(kl(q, p), 4))   # asymmetric!

# Cross-entropy loss (binary) from scratch, and why it punishes confident errors
def bce(y, p_hat, eps=1e-12):
    p_hat = np.clip(p_hat, eps, 1-eps)
    return float(-np.mean(y*np.log(p_hat) + (1-y)*np.log(1-p_hat)))
print('confident & wrong :', round(bce(np.array([1.]), np.array([0.01])), 3))
print('confident & right :', round(bce(np.array([1.]), np.array([0.99])), 3))

# Mutual information as a feature-selection score on discrete data
X = np.random.randint(0, 3, 5000); Y = (X + np.random.randint(0, 2, 5000)) % 3
joint = np.histogram2d(X, Y, bins=[3,3])[0] / 5000
mi = entropy(joint.sum(1)) + entropy(joint.sum(0)) - entropy(joint.ravel())
print('MI(X;Y) =', round(mi, 4))`),
      ul(['Use logits + a stable loss (F.cross_entropy) rather than computing softmax then log yourself.',
          'KL is not a distance: it is asymmetric and can be infinite when q is zero where p is not.',
          'Entropy is maximised by the uniform distribution — maximum-entropy modelling is "assume nothing else".',
          'Cross-entropy in bits vs nats differs only by a factor of ln 2; be consistent when reporting.'],
         ['به‌جای محاسبه‌ی دستیِ سافت‌مکس و سپس لگاریتم، از logits به‌همراه یک تابع هزینه‌ی پایدار (F.cross_entropy) استفاده کنید.',
          'KL یک فاصله نیست: نامتقارن است و می‌تواند بی‌نهایت شود هرگاه q در جایی که p ناصفر است صفر باشد.',
          'آنتروپی با توزیع یکنواخت بیشینه می‌شود — مدل‌سازیِ بیشینه‌آنتروپی یعنی «هیچ فرض دیگری نکن».',
          'آنتروپیِ متقاطع بر حسب بیت در برابر نات تنها در ضریبِ ln 2 تفاوت دارد؛ در گزارش‌دهی یکدست باشید.'])
    ],
    ['bayes', 'entropy', 'kl', 'mutual-information', 'cross-entropy'],
    [R('Visual Information Theory (Colah)', 'https://colah.github.io/posts/2015-09-Visual-Information/', 'doc'),
     R('Elements of Information Theory (Cover & Thomas)', 'https://www.wiley.com/en-us/Elements+of+Information+Theory%2C+2nd+Edition-p-9780471241959', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('prob-006', D, 'advanced', 15,
    ['Markov Chains, Stationary Distributions and MCMC', 'زنجیره‌های مارکوف، توزیع‌های مانا و MCMC'],
    ['A Markov chain is a random walk where the next state depends only on the current one. Run it long enough and it forgets where it started — and if you design the transitions cleverly, where it settles is exactly the distribution you want to sample from.',
     'زنجیره‌ی مارکوف گشتِ تصادفی‌ای است که در آن حالتِ بعدی تنها به حالتِ فعلی بستگی دارد. آن را به‌اندازه‌ی کافی طولانی اجرا کنید و از نقطه‌ی شروع چشم‌پوشی می‌کند — و اگر گذارها را زیرکانه طراحی کنید، جایی که آرام می‌گیرد دقیقاً همان توزیعی است که می‌خواهید از آن نمونه بگیرید.'],
    [
      def('A Markov chain on states S with transition matrix P (rows sum to 1) satisfies the Markov property: P(X_{t+1} | X_t, ..., X_0) = P(X_{t+1} | X_t). A distribution pi is stationary when pi P = pi. If the chain is irreducible and aperiodic, pi is unique and the chain converges to it from any start.',
          'یک زنجیره‌ی مارکوف روی حالت‌های S با ماتریس گذارِ P (که مجموعِ سطرهایش یک است) در ویژگیِ مارکوف صدق می‌کند: P(X_{t+1} | X_t, ..., X_0) = P(X_{t+1} | X_t). توزیع pi مانا (ایستا) است هرگاه pi P = pi. اگر زنجیره تحویل‌ناپذیر و غیرتناوبی باشد، pi یکتاست و زنجیره از هر شروعی به آن همگرا می‌شود.'),
      math('n-step:      P(X_n = j | X_0 = i) = (P^n)_{ij}\nstationary:  pi P = pi,   SUM pi_i = 1      -> left eigenvector for lambda = 1\ndetailed balance:  pi_i P_{ij} = pi_j P_{ji}   (sufficient for stationarity)\n\nMetropolis-Hastings acceptance:\n  alpha = min(1, [p(x\') q(x | x\')] / [p(x) q(x\' | x)])\n  the normalising constant of p cancels -> sample from unnormalised posteriors!\n\nmixing time: how long until the chain forgets its start (this is the hard part)\ndiagnostics: R-hat < 1.01, effective sample size (ESS), trace plots'),
      code(`import numpy as np
rng = np.random.default_rng(0)

# 1. PageRank is a stationary distribution over the web graph
P = np.array([[0.0, 0.5, 0.5, 0.0],
              [0.0, 0.0, 1.0, 0.0],
              [1/3, 1/3, 0.0, 1/3],
              [0.0, 0.0, 1.0, 0.0]])
d = 0.85                                   # damping
n = P.shape[0]
G = d*P + (1-d)*np.ones((n, n))/n
pi = np.ones(n)/n
for _ in range(200): pi = pi @ G
print('PageRank:', pi.round(4))            # power iteration = the chain itself

# 2. Metropolis-Hastings for a target known only up to a constant
def target(x):   # mixture of two Gaussians, unnormalised
    return np.exp(-0.5*((x-3)/0.6)**2) + 0.6*np.exp(-0.5*((x+2)/0.8)**2)

x, chain, accept = 0.0, [], 0
for t in range(60_000):
    xp = x + rng.normal(0, 1.2)                       # symmetric proposal
    if rng.random() < target(xp)/target(x):
        x, accept = xp, accept + 1
    if t > 5_000 and t % 10 == 0: chain.append(x)
chain = np.array(chain)
print('acceptance rate', round(accept/(t+1), 3), '(aim for ~0.23)')
print('E[X] under target ~', round(float(chain.mean()), 3), 'samples', len(chain))

# 3. ESS: correlated samples are worth less than independent ones
def ess(x):
    x = x - x.mean(); n = len(x)
    acf = np.correlate(x, x, 'full')[n-1:]/ (np.arange(n, 0, -1) * x.var())
    tau = 1 + 2*np.sum(acf[1:][acf[1:] > 0.05])
    return n / tau
print('effective sample size ~', int(ess(chain)), 'of', len(chain))`),
      ul(['Irreducible + aperiodic + finite means a unique stationary distribution — check both conditions.',
          'MCMC gives correlated samples: report ESS, not the raw number of draws.',
          'Run multiple chains from dispersed starts; R-hat above 1.01 means not converged.',
          'Gradient-based samplers (HMC/NUTS in Stan, PyMC, NumPyro) are the default; use Metropolis only to learn.'],
         ['تحویل‌ناپذیر + غیرتناوبی + متناهی یعنی توزیع مانای یکتا — هر دو شرط را بررسی کنید.',
          'MCMC نمونه‌های همبسته می‌دهد: ESS را گزارش کنید، نه تعدادِ خامِ نمونه‌ها را.',
          'چند زنجیره از نقاط شروعِ پراکنده اجرا کنید؛ R-hat بالاتر از ۱/۰۱ یعنی همگرا نشده‌اید.',
          'نمونه‌گیرهای مبتنی بر گرادیان (HMC/NUTS در Stan، PyMC، NumPyro) پیش‌فرض‌اند؛ از متروپلیس فقط برای یادگیری استفاده کنید.']),
      note('A burn-in period and thinning are band-aids. If your chain mixes badly, reparameterise the model (centred vs non-centred) — that is the real fix for the funnel geometries that break sampling.',
           'دوره‌ی سوختن (burn-in) و تُنُک‌کردن، راه‌حل‌های موقتی‌اند. اگر زنجیره بد می‌آمیزد، مدل را بازپارامترسازی کنید (مرکزی در برابر غیرمرکزی) — این درمانِ واقعیِ هندسه‌های قیفی است که نمونه‌گیری را می‌شکنند.')
    ],
    ['markov', 'mcmc', 'metropolis', 'pagerank', 'stationary'],
    [R('MCMC — Stan user guide', 'https://mc-stan.org/docs/stan-users-guide/', 'doc'),
     R('PyMC documentation', 'https://www.pymc.io/welcome.html', 'doc')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
