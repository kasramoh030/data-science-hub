/* =====================================================================
   lessons-04-statistics.js  —  9 lessons
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'statistics';

  /* ------------------------------------------------------------------ */
  L('stat-001', D, 'beginner', 12,
    ['Descriptive Statistics and Honest EDA', 'آمار توصیفی و تحلیلِ اکتشافیِ صادقانه'],
    ['Before any model, look at the data properly: centre, spread, shape, tails, missingness, and how each variable relates to the target. Most "model problems" are actually data problems found too late.',
     'پیش از هر مدلی، داده را درست نگاه کنید: مرکز، پراکندگی، شکل، دم‌ها، گم‌شدگی و نسبتِ هر متغیر با هدف. بیشترِ «مشکلاتِ مدل» در واقع مشکلاتِ داده‌اند که دیر پیدا می‌شوند.'],
    [
      def('Mean, median and mode describe the centre; variance, IQR and MAD describe the spread; skewness and kurtosis describe the shape. Quantiles (percentiles) describe all of it without assuming symmetry, which is why robust summaries are the default for skewed business metrics.',
          'میانگین، میانه و مُد مرکز را توصیف می‌کنند؛ واریانس، دامنه‌ی میان‌چارکی و MAD پراکندگی را؛ و چولگی و کشیدگی شکل را. چارک‌ها همه‌ی این‌ها را بدون فرضِ تقارن توصیف می‌کنند و به همین دلیل خلاصه‌های مقاوم پیش‌فرضِ معیارهای کسب‌وکاریِ چوله‌اند.'),
      math('mean     x_bar = (1/n) SUM x_i           sensitive to outliers\nmedian   the 50th percentile           robust, breakdown point 50%\nvariance s^2 = (1/(n-1)) SUM (x_i - x_bar)^2     (n-1: Bessel correction)\nIQR      Q3 - Q1                       spread of the middle 50%\nMAD      median(|x - median(x)|)       most robust spread measure\nskew     E[(X-mu)^3]/sigma^3           0 = symmetric\n\nstandard error of the mean = s / sqrt(n)'),
      code(`import numpy as np, pandas as pd
rng = np.random.default_rng(0)

# A log-normal revenue column: the mean is a terrible summary
rev = rng.lognormal(mean=3.0, sigma=1.2, size=100_000)
s = pd.Series(rev)
print(s.describe(percentiles=[.01, .25, .5, .75, .99]).round(2))
print('mean', round(s.mean(),1), 'median', round(s.median(),1),
      'p99', round(s.quantile(.99),1), 'max', round(s.max(),1))

# The five-minute EDA checklist, automated
df = pd.DataFrame({
    'age':    rng.integers(18, 80, 1000),
    'income': rng.lognormal(10, 1.0, 1000),
    'city':   rng.choice(['A','B','C'], 1000),
    'churn':  rng.binomial(1, .3, 1000),
})
df.loc[df.sample(frac=0.05).index, 'income'] = np.nan     # inject missingness

report = pd.DataFrame({
    'dtype': df.dtypes.astype(str),
    'missing_pct': df.isna().mean().round(3)*100,
    'n_unique': df.nunique(),
    'skew': df.select_dtypes('number').skew().round(2),
})
print(report)

# Target-conditional view: the only table that matters for supervised learning
print(df.groupby('city')['churn'].agg(['mean','count']).round(3))`),
      ul(['Always report the median alongside the mean for skewed metrics (revenue, latency, session length).',
          'Plot the distribution, not just the summary: a histogram or ECDF hides nothing.',
          'Check missingness mechanism: MCAR, MAR or MNAR — the fix differs for each.',
          'Look for impossible values (negative age, future timestamps) before anything else.'],
         ['برای معیارهای چوله (درآمد، تأخیر، طولِ نشست) همیشه میانه را کنار میانگین گزارش کنید.',
          'توزیع را بکشید، نه فقط خلاصه را: هیستوگرام یا ECDF چیزی را پنهان نمی‌کند.',
          'سازوکارِ گم‌شدگی را بررسی کنید: MCAR، MAR یا MNAR — درمان هر کدام فرق دارد.',
          'پیش از هر چیز به‌دنبال مقادیرِ غیرممکن (سنِ منفی، زمان‌سنج‌های آینده) بگردید.']),
      note('Rule: one EDA notebook per dataset, kept forever, with the date of the snapshot. Six months later it is the only thing that explains why a column has two incompatible encodings.',
           'قاعده: برای هر مجموعه‌داده یک نوت‌بوکِ EDA که همیشه نگه داشته می‌شود، با تاریخِ اسنپ‌شات. شش ماه بعد این تنها چیزی است که توضیح می‌دهد چرا یک ستون دو کدگذاریِ ناسازگار دارد.')
    ],
    ['eda', 'descriptive', 'missing-data', 'quantiles'],
    [R('pandas describe / value_counts docs', 'https://pandas.pydata.org/docs/reference/frame.html#computations-descriptive-stats', 'doc'),
     R('ydata-profiling', 'https://github.com/ydataai/ydata-profiling', 'tool')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-002', D, 'intermediate', 14,
    ['Sampling, Estimation and the Bias-Variance Trade-off', 'نمونه‌گیری، برآورد و بده‌بستانِ اُریب-واریانس'],
    ['Every estimate is a random variable: it has a spread (variance) and it may be systematically off (bias). Understanding which error you are fighting tells you what to change: more data, a bigger model, or better features.',
     'هر برآورد یک متغیر تصادفی است: پراکندگی دارد (واریانس) و ممکن است نظام‌مند خطا داشته باشد (اُریب). فهمیدن این‌که با کدام خطا می‌جنگید می‌گوید چه چیزی را تغییر دهید: داده‌ی بیشتر، مدلِ بزرگ‌تر یا ویژگی‌های بهتر.'],
    [
      def('An estimator theta_hat is unbiased when E[theta_hat] = theta. Bias is E[theta_hat] - theta; variance is Var(theta_hat). Mean squared error decomposes as MSE = Bias^2 + Variance + irreducible noise. Regularization trades a little bias for a lot of variance, and usually wins.',
          'برآوردگرِ theta_hat نااُریب است هرگاه E[theta_hat] = theta. اُریب برابر است با E[theta_hat] - theta و واریانس برابر است با Var(theta_hat). خطای میانگین مربعات تجزیه می‌شود به MSE = Bias^2 + Variance + نویزِ کاهش‌ناپذیر. منظم‌سازی اُریبِ اندک را با واریانسِ بسیار کمتر معامله می‌کند و معمولاً برنده است.'),
      math('MSE(theta_hat) = Bias(theta_hat)^2 + Var(theta_hat) + sigma^2\n\nsample mean:   unbiased, Var = sigma^2 / n\nsample var:    (1/n) is biased LOW by factor (n-1)/n  -> use 1/(n-1)\n\noverfitting  = low bias, high variance (memorises noise)\nunderfitting = high bias, low variance (misses the signal)\n\nsignals and what to do:\n  train error high, val error high      -> underfitting  -> bigger model / features\n  train error low,  val error high      -> overfitting   -> more data / regularise\n  both low and close                   -> you are done, go deploy'),
      code(`import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error
rng = np.random.default_rng(0)

# Bias-variance decomposition by simulation
n, true_f = 60, lambda x: np.sin(1.5*x)
def simulate(degree, n_train=60, trials=300):
    preds = np.zeros((trials, 200)); grid = np.linspace(-1, 1, 200)
    for t in range(trials):
        x = rng.uniform(-1, 1, n_train)
        y = true_f(x) + rng.normal(0, .3, n_train)
        m = make_pipeline(PolynomialFeatures(degree), LinearRegression()).fit(x[:,None], y)
        preds[t] = m.predict(grid[:,None])
    avg = preds.mean(0)
    bias2 = np.mean((avg - true_f(grid))**2)
    var   = np.mean(preds.var(0))
    return bias2, var, bias2 + var

for deg in [1, 3, 9, 15]:
    b2, v, tot = simulate(deg)
    print(f'degree {deg:2d}  bias^2={b2:.4f}  variance={v:.4f}  total={tot:.4f}')

# The bias of the 1/n variance estimator, empirically
for n in [5, 20, 100]:
    means = [np.var(rng.normal(0, 2, n)) for _ in range(50_000)]
    print('n', n, 'E[var with 1/n]', round(float(np.mean(means)), 3), 'true 4.0')`),
      ul(['Bagging reduces variance without increasing bias (random forests, ensembling).',
          'Boosting reduces bias, and can increase variance if run too long.',
          'More data reduces variance but never bias — a linear model stays linear.',
          'Cross-validation estimates the generalization error; the training error never does.'],
         ['بگینگ واریانس را بدون افزایشِ اُریب کاهش می‌دهد (جنگل‌های تصادفی، ترکیب‌سازی).',
          'بوستینگ اُریب را کاهش می‌دهد و اگر زیاد اجرا شود می‌تواند واریانس را افزایش دهد.',
          'داده‌ی بیشتر واریانس را کاهش می‌دهد اما هرگز اُریب را نه — مدل خطی خطی می‌ماند.',
          'اعتبارسنجیِ متقابل خطای تعمیم را برآورد می‌کند؛ خطای آموزش هرگز.'])
    ],
    ['bias-variance', 'estimation', 'overfitting', 'bessel'],
    [R('An Introduction to Statistical Learning — Ch. 2 (free)', 'https://www.statlearning.com/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-003', D, 'intermediate', 15,
    ['Maximum Likelihood, MAP and the Loss Functions You Already Use', 'درست‌نماییِ بیشینه، MAP و توابع هزینه‌ای که از پیش استفاده می‌کنید'],
    ['Most loss functions are not arbitrary: they are negative log-likelihoods, and adding a penalty is just putting a prior on your parameters. Seeing this lets you invent the right loss for a new problem.',
     'بیشترِ توابع هزینه دلبخواهی نیستند: آن‌ها منفیِ لگاریتمِ درست‌نمایی‌اند و افزودنِ جریمه چیزی جز گذاشتنِ پیشین روی پارامترها نیست. دیدنِ این موضوع اجازه می‌دهد برای یک مسئله‌ی جدید تابع هزینه‌ی درست را اختراع کنید.'],
    [
      def('Maximum likelihood estimation (MLE) picks the parameters that make the observed data most probable: theta_hat = argmax PROD_i p(x_i | theta). Because products underflow, we maximise the log instead: SUM_i log p(x_i | theta). MAP adds log p(theta) — a prior — to that sum.',
          'برآوردِ درست‌نماییِ بیشینه (MLE) پارامترهایی را برمی‌گزیند که داده‌ی مشاهده‌شده را محتمل‌ترین کند: theta_hat = argmax Π_i p(x_i | theta). چون حاصل‌ضرب‌ها سرریز می‌کنند، لگاریتم را بیشینه می‌کنیم: Σ_i log p(x_i | theta). روش MAP لگاریتمِ پیشین، log p(theta)، را به این مجموع می‌افزاید.'),
      math('MLE :  argmax_theta  SUM_i log p(y_i | x_i, theta)\nMAP :  argmax_theta  SUM_i log p(y_i | x_i, theta) + log p(theta)\n\nderived losses (all minimised):\n  Gaussian likelihood, sigma fixed -> SUM (y - y_hat)^2            = MSE\n  Laplace likelihood              -> SUM |y - y_hat|               = MAE\n  Bernoulli likelihood            -> -SUM [y log p + (1-y) log(1-p)] = log loss\n  Categorical likelihood          -> cross-entropy / softmax\n  Poisson likelihood              -> Poisson deviance\n\npenalties are priors:\n  L2 (ridge) = Gaussian prior on w      -> w ~ N(0, tau^2)\n  L1 (lasso) = Laplace prior on w       -> sparsity!'),
      code(`import numpy as np
from scipy.optimize import minimize
rng = np.random.default_rng(0)

# MLE for a Gaussian by hand and with numpy
x = rng.normal(loc=5.0, scale=2.0, size=10_000)
nll = lambda th: 0.5*len(x)*np.log(2*np.pi*th[1]**2) + np.sum((x-th[0])**2)/(2*th[1]**2)
res = minimize(nll, [0.0, 1.0], method='L-BFGS-B')
print('MLE  mu, sigma:', res.x.round(4))
print('moments      :', round(x.mean(),4), round(x.std(),4))

# Logistic regression = MLE under a Bernoulli likelihood
from sklearn.linear_model import LogisticRegression
X = rng.normal(size=(2000, 3)); w = np.array([1.5, -2.0, 0.5])
y = (rng.random(2000) < 1/(1+np.exp(-(X @ w)))).astype(int)
m = LogisticRegression(penalty=None).fit(X, y)
print('recovered weights:', m.coef_.round(3), 'true', w)

# MAP with a Gaussian prior == ridge (check via the closed form)
lam = 5.0
Xb = np.column_stack([np.ones(len(X)), X]); yb = y.astype(float)-0.5
w_ridge = np.linalg.solve(Xb.T@Xb + lam*np.eye(Xb.shape[1]), Xb.T@yb)
print('ridge-ish weights:', w_ridge.round(3))`),
      ul(['MLE is asymptotically efficient but can overfit badly with few samples — MAP/regularization saves you.',
          'Always work in log space; a product of 10,000 probabilities is exactly 0.0 in float64.',
          'The Laplace prior concentrates at zero, which is why L1 gives sparse solutions and L2 does not.',
          'If your metric is MAE, train with MAE (Laplace likelihood); training with MSE optimises the mean, not the median.'],
         ['MLE مجانباً کاراست اما با نمونه‌های کم می‌تواند به‌شدت بیش‌برازش کند — MAP/منظم‌سازی نجات‌تان می‌دهد.',
          'همیشه در فضای لگاریتم کار کنید؛ حاصل‌ضربِ ۱۰٬۰۰۰ احتمال در float64 دقیقاً صفر است.',
          'پیشینِ لاپلاس در صفر تمرکز دارد و به همین دلیل L1 جواب‌های تنک می‌دهد و L2 نه.',
          'اگر معیارِ شما MAE است، با MAE آموزش دهید (درست‌نماییِ لاپلاس)؛ آموزش با MSE میانگین را بهینه می‌کند نه میانه را.'])
    ],
    ['mle', 'map', 'loss-functions', 'priors'],
    [R('Maximum likelihood — Penn State STAT 414', 'https://online.stat.psu.edu/stat414/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-004', D, 'intermediate', 13,
    ['Confidence Intervals and What They Actually Mean', 'فواصل اطمینان و معنای واقعیِ آن‌ها'],
    ['A 95% confidence interval does not mean "95% probability the parameter is inside". Getting this right changes how you communicate results — and how much you trust a single number.',
     'فاصله‌ی اطمینانِ ۹۵٪ به معنای «احتمالِ ۹۵٪ که پارامتر داخل آن باشد» نیست. درست فهمیدنِ این موضوع نحوه‌ی گزارشِ نتایج و میزان اعتماد به یک عدد را تغییر می‌دهد.'],
    [
      def('A 95% CI is an interval built by a procedure that, across repeated samples, contains the true parameter 95% of the time. The randomness is in the interval, not the parameter. A credible interval (Bayesian) does let you say "95% probability the parameter lies here" — at the cost of assuming a prior.',
          'فاصله‌ی اطمینانِ ۹۵٪ بازه‌ای است که با روشی ساخته می‌شود که در نمونه‌گیری‌های مکرر، ۹۵٪ِ مواقع پارامترِ واقعی را در بر می‌گیرد. تصادفی بودن در خودِ بازه است، نه در پارامتر. یک بازه‌ی معتبر (بیزی) اجازه می‌دهد بگویید «احتمالِ ۹۵٪ که پارامتر این‌جاست» — به قیمتِ فرضِ یک پیشین.'),
      math('normal-approx CI for a mean:\n  x_bar +- z_{1-alpha/2} * s / sqrt(n)        z = 1.96 for 95%\nunknown sigma / small n: use t_{n-1} instead of z\n\nfor a proportion:\n  p_hat +- 1.96 * sqrt(p_hat (1-p_hat) / n)     needs np >= 10 both ways\n  Wilson interval is better for small n or extreme p\n\nbootstrap percentile CI:\n  resample the data B times, take the 2.5th and 97.5th percentiles of the statistic\n\ninterpretation trap:\n  "95% of future samples contain the truth"   NOT "95% chance this interval does"'),
      code(`import numpy as np
rng = np.random.default_rng(0)

# Coverage simulation: does the 95% CI really cover 95% of the time?
true_mu, sigma, n, trials = 10.0, 3.0, 25, 5000
cover = 0; widths = []
for _ in range(trials):
    s = rng.normal(true_mu, sigma, n)
    m = s.mean(ddof=1); se = s.std(ddof=1)/np.sqrt(n)
    lo, hi = m - 1.96*se, m + 1.96*se
    cover += (lo <= true_mu <= hi); widths.append(hi - lo)
print('coverage with z:', round(cover/trials, 3), '(should be ~0.95, slightly low)')

# With the correct t critical value the coverage is right
from scipy import stats
tcrit = stats.t.ppf(0.975, n-1)
cover = sum(abs(rng.normal(true_mu, sigma, n).mean() - true_mu) < tcrit*rng.normal(true_mu, sigma, n).std(ddof=1)/np.sqrt(n) for _ in range(trials))
print('coverage with t:', round(cover/trials, 3), 't crit', round(tcrit, 3))

# Bootstrap CI for the median — no formula needed
data = rng.lognormal(2, 1, 400)
boots = np.median(rng.choice(data, (4000, len(data)), replace=True), axis=1)
print('median', round(float(np.median(data)), 3),
      '95% CI', np.percentile(boots, [2.5, 97.5]).round(3))`),
      ul(['Wider sample, narrower interval: the width shrinks like 1/sqrt(n).',
          'Report CIs, not point estimates — an A/B lift of "+2% (95% CI: -0.4% to +4.4%)" is honest.',
          'Bootstrap CIs need the bootstrap distribution to be roughly symmetric; use BCa otherwise.',
          'Non-overlapping CIs do NOT imply a significant difference; check the difference directly.'],
         ['نمونه‌ی بزرگ‌تر، بازه‌ی باریک‌تر: پهنا مانند 1/sqrt(n) کوچک می‌شود.',
          'فواصل اطمینان را گزارش کنید، نه برآوردهای نقطه‌ای را — «۲٪+ (فاصله‌ی ۹۵٪: ۰/۴٪− تا ۴/۴٪+)» صادقانه است.',
          'فواصلِ بوت‌استرپ نیاز دارند توزیعِ بوت‌استرپ تقریباً متقارن باشد؛ در غیر این صورت از BCa استفاده کنید.',
          'فواصلِ غیرهم‌پوشان به معنای تفاوتِ معنادار نیست؛ تفاوت را مستقیماً بررسی کنید.'])
    ],
    ['confidence-interval', 'bootstrap', 'coverage', 't-test'],
    [R('Bootstrap — Stanford Stats 200', 'https://online.stat.psu.edu/stat555/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-005', D, 'intermediate', 16,
    ['Hypothesis Testing, p-values, Errors and Power', 'آزمون فرض، مقادیر p، خطاها و توان'],
    ['A p-value is the probability of seeing data this extreme if the null hypothesis were true. It is not the probability that the null is true — and that distinction has cost the world a lot of bad science.',
     'مقدارِ p احتمالِ دیدنِ داده‌ای به این شدت است، به‌شرط آن‌که فرضِ صفر درست باشد. این احتمالِ درستیِ فرضِ صفر نیست — و همین تمایز برای دنیا مقدار زیادی علمِ بد هزینه داشته است.'],
    [
      def('The null hypothesis H0 is the boring default (no effect, no difference). A test statistic measures how far the data is from H0; the p-value is P(statistic at least this extreme | H0). Reject H0 when p < alpha (usually 0.05). Type I error = rejecting a true null (false positive); Type II = failing to reject a false null (missed effect). Power = 1 - P(Type II).',
          'فرضِ صفرِ H0 همان پیش‌فرضِ خسته‌کننده است (بدون اثر، بدون تفاوت). یک آماره‌ی آزمون می‌سنجد داده چقدر از H0 دور است؛ مقدارِ p برابر است با P(آماره دست‌کم به این شدت | H0). وقتی p < alpha (معمولاً ۰/۰۵) است H0 را رد می‌کنیم. خطای نوع اول یعنی رد کردنِ یک فرضِ صفرِ درست (مثبتِ کاذب)؛ خطای نوع دوم یعنی رد نکردنِ یک فرضِ صفرِ نادرست (از دست دادنِ اثر). توان = 1 - P(خطای نوع دوم).'),
      math('two-sample t-test (equal n, unequal variance -> Welch):\n  t = (x_bar1 - x_bar2) / sqrt(s1^2/n1 + s2^2/n2)\n  Welch df ~ (s1^2/n1 + s2^2/n2)^2 / [ (s1^2/n1)^2/(n1-1) + (s2^2/n2)^2/(n2-1) ]\n\nchi-square test of independence:  X^2 = SUM (O - E)^2 / E\n\nerror table:\n                 H0 true        H0 false\n  reject         Type I (a)     correct (power)\n  not reject     correct        Type II (b)\n\nsample size for a two-proportion test:\n  n per arm ~ 2 (z_{1-a/2} + z_{1-b})^2 p(1-p) / delta^2'),
      code(`import numpy as np
from scipy import stats
rng = np.random.default_rng(0)

# A/B test: 3% -> 3.4% conversion, is it real?
n = 20_000
a = rng.binomial(1, 0.030, n); b = rng.binomial(1, 0.034, n)
tab = np.array([[a.sum(), n-a.sum()], [b.sum(), n-b.sum()]])
chi2, p, dof, exp = stats.chi2_contingency(tab, correction=False)
print('rates', round(a.mean(),4), round(b.mean(),4), 'p =', round(float(p), 5))

# Welch t-test (never assume equal variances)
x = rng.normal(0, 1, 500); y = rng.normal(0.2, 1.7, 400)
print(stats.ttest_ind(x, y, equal_var=False))

# Power analysis: how many samples do we need to detect a 0.5-point lift?
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
es = proportion_effectsize(0.034, 0.030)
n_req = NormalIndPower().solve_power(es, power=0.8, alpha=0.05, ratio=1)
print('n per arm for 80% power:', int(np.ceil(n_req)))

# What p < 0.05 looks like when there is NO effect (it lies 5% of the time)
sig = sum(stats.ttest_ind(rng.normal(0,1,50), rng.normal(0,1,50)).pvalue < .05 for _ in range(2000))
print('false positive rate:', round(sig/2000, 3))`),
      ul(['A non-significant result means "not enough evidence", never "no effect".',
          'Statistical significance is not practical significance: with n = 10M, a 0.01% lift is significant and useless.',
          'Fix the sample size and stopping rule in advance; peeking and stopping at p < 0.05 inflates false positives.',
          'Prefer reporting effect size and CI; the p-value alone hides how big the effect is.'],
         ['نتیجه‌ی غیرمعنادار یعنی «شواهدِ کافی نیست»، هرگز یعنی «اثری نیست».',
          'معناداریِ آماری همان معناداریِ عملی نیست: با 10M = n، بهبودِ ۰/۰۱٪ هم معنادار است هم بی‌فایده.',
          'حجمِ نمونه و قاعده‌ی توقف را از پیش تعیین کنید؛ نگاه‌کردنِ پیاپی و توقف در 0.05 < p مثبت‌های کاذب را افزایش می‌دهد.',
          'گزارشِ اندازه‌ی اثر و فاصله‌ی اطمینان را ترجیح دهید؛ مقدارِ p به‌تنهایی بزرگیِ اثر را پنهان می‌کند.']),
      note('Sequential testing done properly (Alpha spending, always-valid p-values, Bayesian bandits) lets you peek safely. Doing it informally does not — it is the most common way A/B platforms produce phantom wins.',
           'آزمونِ ترتیبیِ درست (هزینه‌کردِ آلفا، مقادیرِ p همواره-معتبر، بندیت‌های بیزی) اجازه می‌دهد با خیال راحت در جریان نگاه کنید. انجامِ غیررسمیِ آن چنین اجازه‌ای نمی‌دهد — این رایج‌ترین راهی است که پلتفرم‌های A/B پیروزی‌های خیالی تولید می‌کنند.')
    ],
    ['hypothesis-testing', 'p-values', 'power', 'ab-testing', 't-test'],
    [R('Seeing Theory — Hypothesis testing', 'https://seeing-theory.brown.edu/frequentist-inference/index.html', 'tool'),
     R('Trustworthy Online Controlled Experiments (Kohavi)', 'https://experimentguide.com/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-006', D, 'advanced', 13,
    ['Multiple Testing, False Discovery and Reproducibility', 'آزمون‌های چندگانه، نرخ کشفِ کاذب و تکرارپذیری'],
    ['Run 20 tests at alpha = 0.05 and one is significant by chance. Run 10,000 tests (a genome scan, 200 feature hypotheses, an A/B platform) and the situation gets serious. This is the statistics of modern data work.',
     'بیست آزمون با 0.05 = alpha اجرا کنید و یکی از آن‌ها تصادفاً معنادار است. ده هزار آزمون (یک اسکنِ ژنوم، ۲۰۰ فرضیه‌ی ویژگی، یک پلتفرمِ A/B) اجرا کنید و وضعیت جدی می‌شود. این آمارِ کارِ داده‌ی امروز است.'],
    [
      def('The family-wise error rate (FWER) is the probability of at least one false positive among all tests; the Bonferroni correction (alpha/m) controls it. The false discovery rate (FDR) is the expected fraction of false positives among the rejected hypotheses; the Benjamini-Hochberg procedure controls it at level q, with far more power.',
          'نرخِ خطای خانوادگی (FWER) احتمالِ دست‌کم یک مثبتِ کاذب در میان همه‌ی آزمون‌هاست؛ تصحیحِ بونفرونی (alpha/m) آن را کنترل می‌کند. نرخِ کشفِ کاذب (FDR) کسرِ مورد انتظارِ مثبت‌های کاذب در میان فرضیه‌های ردشده است؛ روشِ بنجامینی-هاکبرگ آن را در سطحِ q و با توانِ بسیار بیشتر کنترل می‌کند.'),
      math('m tests, p-values sorted p_(1) <= ... <= p_(m)\n\nBonferroni:  reject i if p_i <= alpha / m          FWER <= alpha\nHolm:        find smallest k with p_(k) > alpha/(m-k+1)   (uniformly better)\nBenjamini-Hochberg (FDR at q):\n   k* = max { k : p_(k) <= (k/m) q }\n   reject all hypotheses with rank <= k*,  adjusted p = min(1, min_{j>=i} m p_(j)/j)\n\nreproducibility checklist:\n   pre-register the hypothesis | hold-out confirmation | report all tests run\n   share code + data + random seeds | report effect sizes with CIs'),
      code(`import numpy as np
from scipy import stats
rng = np.random.default_rng(0)

# 2000 tests, 100 with a genuine effect: how do the corrections behave?
m, n = 2000, 60
pvals = []
for i in range(m):
    eff = 0.6 if i < 100 else 0.0
    a, b = rng.normal(0, 1, n), rng.normal(eff, 1, n)
    pvals.append(stats.ttest_ind(a, b).pvalue)
pvals = np.array(pvals)
truth = np.array([True]*100 + [False]*(m-100))

def report(name, rejected):
    tp = (rejected & truth).sum(); fp = (rejected & ~truth).sum()
    fdr = fp / max(tp+fp, 1)
    print(f'{name:14s} rejected={int(rejected.sum()):4d}  false pos={int(fp):3d}  FDR={fdr:.3f}  power={tp/100:.2f}')

report('raw p<0.05', pvals < 0.05)
report('Bonferroni', pvals < 0.05/m)

order = np.argsort(pvals); ranked = pvals[order]
bh_k = np.nonzero(ranked <= (np.arange(1, m+1)/m)*0.05)[0]
cut = order[:bh_k.max()+1] if len(bh_k) else np.array([], int)
rej = np.zeros(m, bool); rej[cut] = True
report('Benjamini-Hoch', rej)`),
      ul(['BH is almost always the right default: it trades a few false positives for much higher power.',
          'Log every test you ran, not just the ones you reported — the file-drawer effect is real.',
          'If you must test many segments, pre-specify a small number of primary hypotheses.',
          'Replication on a hold-out period is the cheapest credibility insurance there is.'],
         ['روشِ BH تقریباً همیشه پیش‌فرضِ درست است: چند مثبتِ کاذب را با توانِ بسیار بیشتر معامله می‌کند.',
          'همه‌ی آزمون‌هایی را که اجرا کرده‌اید ثبت کنید، نه فقط آن‌هایی را که گزارش داده‌اید — اثرِ کشوی پرونده واقعی است.',
          'اگر باید بخش‌های زیادی را آزمون کنید، تعداد اندکی فرضیه‌ی اصلی را از پیش تعیین کنید.',
          'تکرار روی یک دوره‌ی نگه‌داشته‌شده ارزان‌ترین بیمه‌ی اعتبار است که وجود دارد.'])
    ],
    ['multiple-testing', 'fdr', 'bonferroni', 'reproducibility'],
    [R('Benjamini & Hochberg (1995)', 'https://www.jstor.org/stable/2346101', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-007', D, 'advanced', 16,
    ['Bayesian Inference, Priors and Conjugacy', 'استنتاج بیزی، پیشین‌ها و توزیع‌های مزدوج'],
    ['Frequentism treats parameters as fixed and data as random; Bayesianism treats parameters as random and data as fixed. The Bayesian answer is a full distribution — which is exactly what you need for decision-making under uncertainty.',
     'فراوانی‌گرایی پارامترها را ثابت و داده را تصادفی می‌بیند؛ بیزی‌گری پارامترها را تصادفی و داده را ثابت می‌بیند. پاسخِ بیزی یک توزیعِ کامل است — که دقیقاً همان چیزی است که برای تصمیم‌گیری در شرایطِ عدم‌قطعیت نیاز دارید.'],
    [
      def('Bayes rule for parameters: p(theta | D) = p(D | theta) p(theta) / p(D). The posterior is the likelihood times the prior, normalised by the evidence. A conjugate prior makes the posterior the same family as the prior — closed-form updates, no MCMC needed.',
          'قاعده‌ی بیز برای پارامترها: p(theta | D) = p(D | theta) p(theta) / p(D). پسین همان درست‌نمایی ضرب‌در پیشین و نرمال‌شده با شواهد است. پیشینِ مزدوج باعث می‌شود پسین هم‌خانواده‌ی پیشین باشد — به‌روزرسانیِ فرم‌بسته، بدون نیاز به MCMC.'),
      math('Beta-Binomial:      p ~ Beta(a,b)   + (s successes, f failures)\n                    -> p | D ~ Beta(a+s, b+f)\nGamma-Poisson:      lambda ~ Gamma(a,b) + (sum x, n) -> Gamma(a+sum x, b+n)\nNormal-Normal:      mu ~ N(m0, s0^2) + n obs with sd s\n                    -> precision adds:  1/s_n^2 = 1/s0^2 + n/s^2\nDirichlet-Multinomial: categorical counts -> Dirichlet(a + counts)\n\nweakly informative priors > flat priors: they keep the posterior proper\n  and encode "implausible values are implausible" without dictating the answer'),
      code(`import numpy as np
rng = np.random.default_rng(0)

# Thompson sampling with a Beta posterior — a bandit in 20 lines
true_rates = [0.05, 0.09, 0.12]
a = np.ones(3); b = np.ones(3)
rewards = 0
for t in range(3000):
    samples = rng.beta(a, b)
    arm = int(np.argmax(samples))
    r = rng.random() < true_rates[arm]
    a[arm] += r; b[arm] += 1 - r
    rewards += r
print('posterior means', (a/(a+b)).round(3), 'total reward', rewards)

# Posterior shrink towards the prior with little data — the whole point
for n_obs in [0, 5, 50, 500]:
    s = int(0.4*n_obs); f = n_obs - s
    post_a, post_b = 2 + s, 8 + f
    mean = post_a/(post_a+post_b)
    print(f'n={n_obs:4d}  posterior mean={mean:.3f}  (prior 0.200, MLE 0.400)')

# Bayesian A/B: probability that B beats A, straight from simulation
A = rng.beta(1+30, 1+970, 200_000)
B = rng.beta(1+45, 1+955, 200_000)
print('P(B > A) =', round(float((B > A).mean()), 4))
print('expected loss if we ship B and it is worse:', round(float(np.maximum(A-B, 0).mean()), 5))`),
      ul(['With lots of data the prior washes out; with little data it is doing the real work.',
          'A posterior gives you probabilities of any statement you care about, not just a reject/fail-to-reject.',
          'Check prior sensitivity: rerun with a wider prior and see if conclusions move.',
          'Modern tooling: PyMC, Stan, NumPyro, and brms for formula-based models.'],
         ['با داده‌ی فراوان پیشین محو می‌شود؛ با داده‌ی اندک این پیشین است که کارِ واقعی را می‌کند.',
          'یک پسین احتمالِ هر گزاره‌ای که برای‌تان مهم است را می‌دهد، نه فقط یک رد/عدم‌رد.',
          'حساسیتِ پیشین را بررسی کنید: با پیشینی گسترده‌تر دوباره اجرا کنید و ببینید نتیجه تغییر می‌کند یا نه.',
          'ابزارهای امروز: PyMC، Stan، NumPyro و brms برای مدل‌های مبتنی بر فرمول.'])
    ],
    ['bayesian', 'posterior', 'conjugate', 'thompson-sampling'],
    [R('Bayesian Methods for Hackers (free, PyMC)', 'https://github.com/CamDavidsonPilon/Probabilistic-Programming-and-Bayesian-Methods-for-Hackers', 'book'),
     R('Statistical Rethinking — McElreath', 'https://xcelab.net/rm/statistical-rethinking/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-008', D, 'advanced', 18,
    ['Causal Inference: From Correlation to "What If"', 'استنتاج علّی: از همبستگی تا «چه می‌شد اگر»'],
    ['Models predict; only causal inference tells you what happens after you intervene. Confounding, colliders, selection bias and mediation are the four traps, and DAGs are the map.',
     'مدل‌ها پیش‌بینی می‌کنند؛ تنها استنتاجِ علّی می‌گوید پس از مداخله چه می‌شود. مخدوش‌شدگی، برخوردکننده‌ها، اُریبِ انتخاب و میانجی‌گری چهار تله‌اند و DAGها نقشه‌ی راه‌اند.'],
    [
      def('A confounder Z causes both the treatment X and the outcome Y, creating a spurious association. Conditioning on a collider (a variable caused by both X and Y) creates association where none existed. Randomised experiments remove confounding by construction — which is why the RCT is the gold standard.',
          'یک متغیرِ مخدوش‌کننده‌ی Z هم بر درمانِ X و هم بر پیامدِ Y اثر می‌گذارد و رابطه‌ای کاذب می‌سازد. شرطی‌کردن روی یک برخوردکننده (متغیری که هم از X و هم از Y ناشی می‌شود) رابطه‌ای می‌سازد که اصلاً وجود نداشت. آزمایش‌های تصادفی‌سازی‌شده مخدوش‌شدگی را بر حسبِ ساختار حذف می‌کنند — به همین دلیل RCT استانداردِ طلایی است.'),
      math('potential outcomes:  Y(1), Y(0);   individual effect = Y(1) - Y(0)  (never both observed)\nATE = E[Y(1) - Y(0)]        ATT = E[Y(1) - Y(0) | X=1]\n\nidentification with unconfoundedness  (Y(1),Y(0)) ⫫ X | Z :\n  ATE = E_Z[ E[Y|X=1,Z] - E[Y|X=0,Z] ]      (outcome regression / g-computation)\n  IPW: ATE = E[ X Y / e(Z) - (1-X) Y / (1-e(Z)) ]      e(Z) = P(X=1|Z)\n  doubly robust (AIPW): combine both; consistent if either model is right\n\ndesigns when you cannot randomise:\n  diff-in-diff:  (Y_post^A - Y_pre^A) - (Y_post^B - Y_pre^B)   parallel trends\n  regression discontinuity: threshold assignment\n  instrumental variables: Z affects Y only through X (LATE)\n  synthetic control: build a counterfactual from a donor pool'),
      code(`import numpy as np, pandas as pd
rng = np.random.default_rng(0)

# Confounding: the naive difference is badly biased
n = 100_000
age    = rng.normal(45, 12, n)
sever  = 0.6*np.random.randn(n)          # unobserved-ish severity
treat  = (0.05*(age-45) + 0.8*sever + rng.normal(0,.5,n) > 0).astype(int)
y      = 10 + 0.5*(age-45) + 3*sever + 2.0*treat + rng.normal(0,1,n)

print('naive difference :', round(y[treat==1].mean() - y[treat==0].mean(), 3), '(true effect 2.0)')

# Conditioning on the confounder removes the bias
df = pd.DataFrame({'y':y,'t':treat,'age':age})
strata = pd.cut(df.age, bins=20)
adj = df.groupby(strata, observed=True).apply(
    lambda g: g.loc[g.t==1,'y'].mean() - g.loc[g.t==0,'y'].mean())
print('age-adjusted     :', round(float(adj.mean()), 3))

# Inverse propensity weighting
from sklearn.linear_model import LogisticRegression
ps = LogisticRegression().fit(df[['age']], df.t).predict_proba(df[['age']])[:,1]
ps = np.clip(ps, 0.05, 0.95)
ipw = np.mean(df.t*df.y/ps) - np.mean((1-df.t)*df.y/(1-ps))
print('IPW estimate     :', round(float(ipw), 3))

# Difference-in-differences on 2 groups x 2 periods
pre  = np.array([10.0, 12.0]); post = np.array([13.0, 12.5])
print('DiD effect       :', round((post[0]-pre[0]) - (post[1]-pre[1]), 3))`),
      ul(['Always draw the DAG before modelling; most disputes are about which arrows exist.',
          'Never condition on a post-treatment variable — it blocks the very effect you want.',
          'Check covariate balance (standardised mean differences) after weighting or matching.',
          'Placebo/falsification tests (pre-period DiD, negative outcomes) are what make a design believable.'],
         ['همیشه پیش از مدل‌سازی DAG را بکشید؛ بیشتر اختلاف‌ها بر سرِ این است که کدام پیکان‌ها وجود دارند.',
          'هرگز روی متغیری که پس از درمان اندازه‌گیری شده شرطی نکنید — این همان اثری را می‌بندد که می‌خواهید.',
          'پس از وزن‌دهی یا همتاسازی، توازنِ کوواریت‌ها (تفاوت‌های میانگینِ استانداردشده) را بررسی کنید.',
          'آزمون‌های دارونما/ابطال (DiDِ دوره‌ی پیش، پیامدهای منفی) چیزی است که یک طرح را باورپذیر می‌کند.']),
      note('Libraries worth knowing: DoWhy and EconML (Microsoft), CausalML (Uber), and dowhy.do(...) for refutation tests that try to break your estimate automatically.',
           'کتابخانه‌هایی که ارزشِ شناختن دارند: DoWhy و EconML (مایکروسافت)، CausalML (اوبر) و dowhy.do(...) برای آزمون‌های ردیه که خودکار سعی می‌کنند برآوردِ شما را بشکنند.')
    ],
    ['causal', 'dag', 'did', 'instrumental-variables', 'propensity'],
    [R('Causal Inference: The Mixtape (Cunningham, free)', 'https://mixtape.scunning.com/', 'book'),
     R('DoWhy documentation', 'https://www.pywhy.org/dowhy/', 'doc'),
     R('The Book of Why (Pearl & Mackenzie)', 'http://bayes.cs.ucla.edu/WHY/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-009', D, 'advanced', 12,
    ['Concentration Inequalities and Sample-Size Planning', 'نامساوی‌های تمرکز و برنامه‌ریزیِ حجمِ نمونه'],
    ['How sure can you be with the data you have? Concentration inequalities bound the probability that an average strays from its expectation, and they are what makes learning theory and safe A/B testing possible.',
     'با داده‌ای که دارید چقدر می‌توانید مطمئن باشید؟ نامساوی‌های تمرکز احتمالِ انحرافِ یک میانگین از امیدِ آن را کران‌دار می‌کنند و همان چیزی‌اند که نظریه‌ی یادگیری و تستِ A/B ایمن را ممکن می‌سازند.'],
    [
      def('Markov bounds a non-negative variable by its mean. Chebyshev uses the variance and is distribution-free. Chernoff/Hoeffding use independence and give exponential decay in n — the strongest and most useful family for bounded variables.',
          'مارکوف یک متغیرِ نامنفی را با میانگینش کران‌دار می‌کند. چبیشف از واریانس استفاده می‌کند و مستقل از توزیع است. چرنوف/هفدینگ از استقلال استفاده می‌کنند و کاهشِ نمایی بر حسبِ n می‌دهند — قوی‌ترین و مفیدترین خانواده برای متغیرهای کران‌دار.'),
      math('Markov:      P(X >= a) <= E[X]/a                      (X >= 0)\nChebyshev:   P(|X - mu| >= t) <= sigma^2 / t^2        polynomial decay\nHoeffding:   P(|X_bar - mu| >= t) <= 2 exp(-2 n t^2 / (b-a)^2)\n             for independent X_i in [a, b]            EXPONENTIAL decay\nrearranged:  n >= (b-a)^2 ln(2/delta) / (2 t^2)       samples for accuracy t\n\nEmpirical Bernstein adds the observed variance -> tighter on low-variance data\n\nunion bound: m tests, each safe at delta -> use delta/m (sound but conservative)'),
      code(`import numpy as np
rng = np.random.default_rng(0)

# Hoeffding bound vs reality for coin flips
n, p = 1000, 0.5
t = 0.05
dev = np.abs(rng.binomial(n, p, 200_000)/n - p) >= t
print('empirical P(|mean-p|>=0.05):', dev.mean(),
      ' Hoeffding bound:', round(2*np.exp(-2*n*t**2), 6))

# Sample-size planning for a proportion, from first principles
def n_for_proportion(delta_p, base=0.10, alpha=0.05, power=0.80):
    from scipy.stats import norm
    z_a, z_b = norm.ppf(1-alpha/2), norm.ppf(power)
    p1, p2 = base, base + delta_p
    pbar = (p1 + p2)/2
    return int(np.ceil(2*pbar*(1-pbar)*(z_a+z_b)**2 / delta_p**2))
for d in [0.02, 0.01, 0.005]:
    print(f'detect {d:.3f} absolute on 10% base -> {n_for_proportion(d):,} per arm')

# Confidence sequences: peeking without inflating false positives
def always_valid_halfwidth(n, alpha=0.05, sigma=1.0):
    return sigma*np.sqrt(2*(n+1)/n**2 * np.log(np.sqrt(n+1)/alpha/2))
for n in [100, 1000, 10_000]:
    print('n', n, 'half-width', round(always_valid_halfwidth(n), 4))`),
      ul(['Hoeffding needs bounded variables; for unbounded data use Bernstein or sub-Gaussian assumptions.',
          'Sample-size formulas assume independent, identically distributed draws — batch effects break that.',
          'Always-valid confidence sequences let you monitor continuously without alpha inflation.',
          'For heavy-tailed metrics (revenue), winsorise or use a trimmed estimator before applying these bounds.'],
         ['هفدینگ به متغیرهای کران‌دار نیاز دارد؛ برای داده‌ی بی‌کران از برنشتاین یا فرض‌های زیر-گاوسی استفاده کنید.',
          'فرمول‌های حجمِ نمونه فرض می‌کنند نمونه‌ها مستقل و هم‌توزیع‌اند — اثراتِ بَچ این را می‌شکنند.',
          'دنباله‌های اطمینانِ همواره-معتبر اجازه می‌دهند پیوسته پایش کنید بدون تورّمِ آلفا.',
          'برای معیارهای دم‌سنگین (درآمد)، پیش از به‌کاربردنِ این کران‌ها winsorise کنید یا از برآوردگرِ کوتاه‌شده استفاده کنید.'])
    ],
    ['concentration', 'hoeffding', 'sample-size', 'confidence-sequences'],
    [R('High-Dimensional Probability (Vershynin)', 'https://www.math.uci.edu/~rvershyn/papers/HDP-book/HDP-book.html', 'book')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
