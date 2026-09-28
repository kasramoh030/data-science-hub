/* =====================================================================
   lessons-11-statistical-methods.js  —  18 lessons
   The applied statistics toolkit: choosing tests, parametric and
   nonparametric families, GLMs, mixed models, survival, time series,
   multivariate, smoothing, model comparison, robust and extreme-value
   methods, missing data, meta-analysis and sequential designs.
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'statistics';

  /* ------------------------------------------------------------------ */
  L('stat-010', D, 'beginner', 14,
    ['Choosing the Right Statistical Method', 'انتخابِ روشِ آماریِ درست'],
    ['A decision map that turns "I have data and a question" into a specific method: what you are comparing, how many groups, whether measurements are paired, what scale the outcome lives on, and what you can assume. Most wrong analyses are right tests applied to the wrong question.',
     'یک نقشه‌ی تصمیم که «داده دارم و یک پرسش» را به یک روشِ مشخص تبدیل می‌کند: چه چیزی را مقایسه می‌کنید، چند گروه، آیا اندازه‌گیری‌ها جفت‌اند، مقیاسِ خروجی چیست و چه چیزی را می‌توانید فرض کنید. بیشترِ تحلیل‌های غلط، آزمون‌های درستی‌اند که به پرسشِ غلط اعمال شده‌اند.'],
    [
      def('Method selection has four inputs: (1) the outcome type — continuous, count, binary, time-to-event, or a ranking; (2) the comparison structure — one sample, two independent samples, paired/repeated, or many groups; (3) the assumption budget — can you defend normality and equal variance, or not; and (4) the goal — test a hypothesis, estimate a size of effect, or predict. Everything else follows from these four.',
          'انتخابِ روش چهار ورودی دارد: (۱) نوعِ خروجی — پیوسته، شمارشی، دودویی، زمان-تا-رخداد یا رتبه‌ای؛ (۲) ساختارِ مقایسه — یک نمونه، دو نمونه‌ی مستقل، جفتی/تکراری، یا چند گروه؛ (۳) بودجه‌ی فرض — می‌توانید نرمال‌بودن و هم‌واریانسی را توجیه کنید یا نه؛ و (۴) هدف — آزمودنِ یک فرض، برآوردِ اندازه‌ی اثر، یا پیش‌بینی. بقیه از این چهار تا پیروی می‌کند.'),
      p('Work through the questions in order. The first one that fails already tells you which family you are in, and the family narrows the choice to two or three candidate methods.',
        'پرسش‌ها را به ترتیب پیش بروید. نخستین پرسشی که پاسخش منفی است، خانواده‌ی شما را تعیین می‌کند و آن خانواده انتخاب را به دو یا سه روشِ نامزد محدود می‌کند.'),
      ul(['Is the outcome a time to an event with censoring (users who never churned, patients still alive)? If yes, use survival methods, not a mean.',
          'Are observations paired or repeated (same user before/after, same store on two days)? If yes, use within-unit differences or a mixed model, not two independent samples.',
          'Are you comparing more than two groups, or several factors at once? Running many pairwise tests inflates the false-positive rate; use ANOVA/regression with contrasts, then adjust.',
          'Can you defend a distributional assumption? With n in the hundreds the CLT covers the mean; with n in the tens, heavy tails, or obvious skew, prefer ranks, permutation or a model that matches the outcome type.',
          'Do you need a number ("how much bigger") rather than a verdict? Lead with the effect size and its interval; the p-value is secondary.'],
          ['آیا خروجی یک زمان-تا-رخداد با سانسور است (کاربرانی که هرگز ریزش نکرده‌اند، بیمارانی که هنوز زنده‌اند)؟ اگر بله، از روش‌های بقا استفاده کنید، نه میانگین.',
           'آیا مشاهده‌ها جفتی یا تکراری‌اند (یک کاربر قبل/بعد، یک فروشگاه در دو روز)؟ اگر بله، از تفاضلِ درون‌واحدی یا یک مدلِ آمیخته استفاده کنید، نه دو نمونه‌ی مستقل.',
           'آیا بیش از دو گروه، یا چند عامل همزمان را مقایسه می‌کنید؟ اجرای آزمون‌های دودوییِ متعدد نرخِ مثبتِ کاذب را بالا می‌برد؛ از ANOVA/رگرسیون با تضادها استفاده کنید و سپس تعدیل کنید.',
           'می‌توانید یک فرضِ توزیعی را توجیه کنید؟ با n در حدِ صدها، قضیه‌ی حدِ مرکزی میانگین را پوشش می‌دهد؛ با n در حدِ ده‌ها، دم‌های سنگین یا چولگیِ آشکار، رتبه‌ها، جایگشت یا مدلی متناسب با نوعِ خروجی را ترجیح دهید.',
           'یک عدد می‌خواهید («چقدر بزرگ‌تر») نه یک حکم؟ با اندازه‌ی اثر و بازه‌اش شروع کنید؛ مقدارِ p در درجه‌ی دوم است.']),
      math('OUTCOME                COMPARISON            DEFAULT METHOD\n----------------------------------------------------------------\ncontinuous, ~normal    one sample            one-sample t (or sign test)\ncontinuous, ~normal    two independent       Welch t-test\ncontinuous, ~normal    paired / repeated     paired t (or Wilcoxon signed-rank)\ncontinuous, skewed     any                   Mann-Whitney / permutation / GLM\nbinary                 two or more groups    chi-square, Fisher, logistic\ncount (rate)           groups + exposure     Poisson / negative binomial w/ offset\nordinal / ranks        two or more groups    Kruskal-Wallis, ordinal logistic\ntime-to-event          groups + censoring    Kaplan-Meier, log-rank, Cox\n>2 groups, continuous  one factor            ANOVA + contrasts; Welch ANOVA\nrepeated / nested      units inside groups   linear mixed model\nrelationship           two continuous        Pearson / Spearman / regression'),
      code(`def choose_method(outcome, groups, paired=False, n_small=False, skewed=False,
                   censored=False, exposure=None):
    """Return the default method for a comparison. Deliberately boring."""
    if censored:
        return 'kaplan-meier + log-rank; Cox for covariate adjustment'
    if exposure is not None:
        return 'poisson (check overdispersion -> negative binomial) with log(exposure) offset'
    if outcome == 'binary':
        return ('fisher exact' if n_small else 'chi-square') + '; logistic for adjustment'
    if outcome == 'count':
        return 'poisson / negative binomial GLM'
    if outcome == 'ordinal':
        return 'kruskal-wallis (or ordinal logistic for adjustment)'
    if outcome == 'continuous':
        if paired:
            return 'paired t' if not skewed else 'wilcoxon signed-rank'
        if groups == 1:
            return 'one-sample t' if not (skewed or n_small) else 'sign test / bootstrap'
        if groups == 2:
            return 'welch t-test' if not (skewed or n_small) else 'mann-whitney / permutation'
        return 'anova + contrasts' if not (skewed or n_small) else 'kruskal-wallis'
    raise ValueError('describe your outcome first')

print(choose_method('continuous', 2))                       # welch t-test
print(choose_method('continuous', 2, paired=True, skewed=True))
print(choose_method('binary', 2, n_small=True))              # fisher exact
print(choose_method('count', 3, exposure='days'))            # poisson w/ offset`),
      p('Two habits prevent most mistakes. First, write the estimator and the estimand before you run anything: "I want the difference in mean session length between variants A and B, with an interval." Second, plot the data in the shape of the comparison — paired data as a slope per unit, two groups as overlapping distributions — because the plot reveals the pairing, the skew and the outliers that no table of numbers will show you.',
        'دو عادت جلوی بیشترِ اشتباه‌ها را می‌گیرد. نخست، پیش از اجرای هر چیز برآوردگر و مقدارِ هدف را بنویسید: «من اختلافِ میانگینِ طولِ نشست بین نسخه‌های A و B را می‌خواهم، با یک بازه.» دوم، داده را در قالبِ مقایسه رسم کنید — داده‌ی جفتی به شکلِ شیب برای هر واحد، دو گروه به شکلِ توزیع‌های هم‌پوشان — چون نمودار جفت‌بودن، چولگی و دورافتاده‌هایی را آشکار می‌کند که هیچ جدولی نشان‌تان نمی‌دهد.'),
      note('If two honest routes disagree, the assumptions differ, not the arithmetic. Report the fragile one: "significant under a t-test (p=0.04), not under a permutation test (p=0.11) — the result depends on the tail, so I would not ship on it."',
           'اگر دو مسیرِ صادقانه با هم توافق نکنند، اختلاف در فرض‌هاست نه در محاسبه. آن را که شکننده‌تر است گزارش کنید: «با t معنادار است (p=0.04)، با آزمونِ جایگشت نه (p=0.11) — نتیجه به دم وابسته است، پس روی آن شرط‌بندی نمی‌کنم.»')
    ],
    ['method-selection', 'decision-map', 'eda', 'assumptions'],
    [R('scipy.stats user guide', 'https://docs.scipy.org/doc/scipy/tutorial/stats.html', 'doc'),
     R('Statistics Done Wrong (Reinhart)', 'https://www.statisticsdonewrong.com/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-011', D, 'beginner', 15,
    ['Parametric Tests and the Assumptions They Rest On', 'آزمون‌های پارامتری و فرض‌هایی که بر آن‌ها استوارند'],
    ['t-tests, ANOVA and chi-square are the workhorses, and each one is a small theorem with preconditions: independence, a sampling distribution you can name, and (for pooled variants) equal variances. Learn the preconditions and you will know when the p-value means what it claims.',
     'آزمون‌های t، ANOVA و کای‌دو اسب‌های بارکش‌اند و هر یک قضیه‌ی کوچکی با پیش‌شرط است: استقلال، یک توزیعِ نمونه‌گیری که بتوان نام برد، و (برای نسخه‌های ادغامی) واریانس‌های برابر. پیش‌شرط‌ها را یاد بگیرید تا بدانید مقدارِ p کی همان معنایی را می‌دهد که ادعا می‌کند.'],
    [
      def('A parametric test assumes a family of distributions indexed by parameters and derives the sampling distribution of a statistic under the null. The t-test assumes the observations are independent draws and that the sample mean is approximately normal — which the CLT delivers for moderate n and finite variance, and which heavy tails can delay for a surprisingly long time.',
          'یک آزمونِ پارامتری خانواده‌ای از توزیع‌ها را با پارامترهای مشخص فرض می‌کند و توزیعِ نمونه‌گیریِ یک آماره را تحتِ فرضِ صفر به دست می‌آورد. آزمونِ t فرض می‌کند مشاهده‌ها نمونه‌های مستقل‌اند و میانگینِ نمونه تقریباً نرمال است — چیزی که قضیه‌ی حدِ مرکزی برای n متوسط و واریانسِ متناهی فراهم می‌کند و دم‌های سنگین می‌توانند مدت‌های شگفت‌آوری به تأخیرش بیندازند.'),
      math('one-sample:     t = (x_bar - mu0) / (s / sqrt(n))            df = n - 1\n\ntwo-sample pooled (equal sigma):\n  s_p^2 = ((n1-1)s1^2 + (n2-1)s2^2) / (n1+n2-2)\n  t = (x_bar1 - x_bar2) / (s_p * sqrt(1/n1 + 1/n2))    df = n1 + n2 - 2\n\nWelch (unequal sigma) — USE THIS BY DEFAULT:\n  t = (x_bar1 - x_bar2) / sqrt(s1^2/n1 + s2^2/n2)\n  df = (s1^2/n1 + s2^2/n2)^2 / [ (s1^2/n1)^2/(n1-1) + (s2^2/n2)^2/(n2-1) ]\n\npaired:          t = d_bar / (s_d / sqrt(n))   on differences d_i = x_i - y_i\nANOVA F:         F = MS_between / MS_within     (k groups, df = k-1, N-k)\nchi-square:      X^2 = SUM (observed - expected)^2 / expected'),
      code(`import numpy as np
from scipy import stats

rng = np.random.default_rng(7)
a = rng.normal(10.0, 2.0, 40)          # control
b = rng.normal(11.2, 5.0, 35)          # treatment: bigger mean AND bigger spread

print('pooled :', stats.ttest_ind(a, b, equal_var=True))
print('welch  :', stats.ttest_ind(a, b, equal_var=False))     # default in R, use it
print('var    : Levene p =', round(stats.levene(a, b).pvalue, 4))

# Paired: same users before and after a change
before = rng.normal(30, 8, 60)
after  = before + rng.normal(-2.0, 3.0, 60)      # correlated by construction
print('paired :', stats.ttest_rel(before, after))
print('wrong  :', stats.ttest_ind(before, after))   # throws away the pairing

# One-way ANOVA and the post-hoc contrasts that follow it
groups = [rng.normal(m, 3, 25) for m in (10, 10.5, 12.0)]
F, p = stats.f_oneway(*groups)
print('ANOVA  : F =', round(F, 3), 'p =', round(p, 5))

# Chi-square test of independence on a 2x2 table
table = np.array([[120, 80], [95, 105]])
chi2, p_chi, dof, exp = stats.chi2_contingency(table)
print('chi2   : p =', round(p_chi, 4), 'min expected =', round(exp.min(), 1))`),
      ul(['Independence is the assumption you cannot test your way out of. Clustered data (many rows per user, per store, per day) breaks it; the fix is aggregation, cluster-robust errors, or a model with cluster effects.',
          'Normality matters for the sampling distribution, not for the raw data. Check with a QQ plot, not with a hypothesis test: with n = 20 a Shapiro test cannot detect the skew that matters, and with n = 20,000 it flags skew that the CLT has already absorbed.',
          'Equal variance: use Welch by default. When variances are equal it costs you almost nothing; when they are unequal the pooled test can be badly wrong in either direction.',
          'Chi-square needs expected cell counts around 5 or more; below that use Fisher exact (or a Monte Carlo version for larger tables).',
          'ANOVA tells you the groups are not all equal — it does not say which. Pre-register the contrasts you care about (or use Tukey) instead of fishing.'],
          ['استقلال فرضی است که نمی‌توانید با آزمون از آن خلاص شوید. داده‌ی خوشه‌ای (سطرهای زیاد برای هر کاربر، هر فروشگاه، هر روز) آن را می‌شکند؛ درمانش تجمیع، خطاهای مقاومِ خوشه‌ای، یا مدلی با اثرِ خوشه است.',
           'نرمال‌بودن برای توزیعِ نمونه‌گیری مهم است، نه برای داده‌ی خام. با نمودارِ QQ بررسی کنید، نه با یک آزمونِ فرض: با n = 20 آزمونِ شپیرو چولگیِ مهم را نمی‌تواند بگیرد و با n = 20٬۰۰۰ چولگی‌ای را پرچم می‌کند که قضیه‌ی حدِ مرکزی از قبل هضمش کرده است.',
           'هم‌واریانسی: به‌طور پیش‌فرض ولچ استفاده کنید. وقتی واریانس‌ها برابرند تقریباً هیچ هزینه‌ای ندارد؛ وقتی نابرابرند، آزمونِ ادغامی می‌تواند در هر دو جهت به‌شدت غلط باشد.',
           'کای‌دو به شمارشِ مورد انتظارِ حدودِ ۵ یا بیشتر در هر خانه نیاز دارد؛ کمتر از آن از آزمونِ دقیقِ فیشر (یا نسخه‌ی مونت‌کارلو برای جدول‌های بزرگ‌تر) استفاده کنید.',
           'ANOVA می‌گوید گروه‌ها همه برابر نیستند — نمی‌گوید کدام. تضادهایی را که برای‌تان مهم است از پیش ثبت کنید (یا از توکی استفاده کنید) به‌جای اینکه ماهی‌گیری کنید.']),
      note('A p-value from a parametric test is a statement about a model of the world, not about the data. If the model is wrong (dependent rows, drifting variance, a censored outcome), the p-value is precise and irrelevant.',
           'مقدارِ p در یک آزمونِ پارامتری گزاره‌ای درباره‌ی یک مدل از جهان است، نه درباره‌ی داده. اگر مدل غلط باشد (سطرهای وابسته، واریانسِ رونده، خروجیِ سانسور‌شده)، مقدارِ p دقیق است و بی‌ربط.')
    ],
    ['t-test', 'anova', 'chi-square', 'assumptions', 'welch'],
    [R('Welch t-test explained (Ruxton)', 'https://doi.org/10.1093/beheco/arr082', 'paper'),
     R('statsmodels statistical tests', 'https://www.statsmodels.org/stable/stats.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-012', D, 'intermediate', 16,
    ['Nonparametric and Resampling Methods', 'روش‌های ناپارامتری و بازنمونه‌گیری'],
    ['When you cannot name the distribution, let the data supply it: rank tests, permutation tests and the bootstrap replace algebra with rearrangement. They ask slightly different questions than their parametric cousins, so knowing what each one actually tests is the whole skill.',
     'وقتی نمی‌توانید توزیع را نام ببرید، بگذارید خودِ داده فراهمش کند: آزمون‌های رتبه‌ای، آزمون‌های جایگشت و بوت‌استرپ جبر را با جابه‌جایی جایگزین می‌کنند. آن‌ها پرسش‌های کمی متفاوتی از هم‌خانواده‌های پارامتری‌شان می‌پرسند، پس دانستنِ اینکه هر کدام واقعاً چه چیزی را می‌آزماید، کلِ مهارت است.'],
    [
      def('Rank tests discard the magnitudes and keep the order, which buys insensitivity to outliers and skew at the cost of some power when data really are normal. Permutation tests keep the magnitudes but rebuild the null distribution by relabelling group membership — valid whenever the observations are exchangeable under the null. The bootstrap resamples rows to estimate the variability of a statistic, including awkward ones like a median, a ratio or a correlation difference.',
          'آزمون‌های رتبه‌ای اندازه‌ها را دور می‌ریزند و ترتیب را نگه می‌دارند؛ این بی‌حساسی به دورافتاده‌ها و چولگی می‌خرد به قیمتِ از دست دادنِ بخشی از توان وقتی داده واقعاً نرمال است. آزمون‌های جایگشت اندازه‌ها را نگه می‌دارند اما توزیعِ فرضِ صفر را با برچسب‌گذاریِ دوباره‌ی عضویتِ گروهی بازسازی می‌کنند — معتبر هرگاه مشاهده‌ها تحتِ فرضِ صفر جایگزین‌پذیر باشند. بوت‌استرپ سطرها را بازنمونه‌گیری می‌کند تا تغییرپذیریِ یک آماره را برآورد کند، از جمله آماره‌های لجباز مانند میانه، نسبت یا اختلافِ همبستگی.'),
      math('Mann-Whitney U (two independent samples):\n  U = SUM over pairs  1[x_i > y_j] + 0.5 * 1[x_i = y_j]\n  tests P(X > Y) = 0.5   (stochastic equality, NOT "equal medians")\n\nWilcoxon signed-rank (paired):  rank |d_i|, sum the ranks of positive d_i\nKruskal-Wallis (k groups):      H on pooled ranks, ~ chi-square(k-1)\nFriedman (k repeated measures): ranks within each block\n\nKolmogorov-Smirnov:   D = sup_x |F_n(x) - G_m(x)|       (whole distribution)\nAnderson-Darling:     weights the tails more heavily than KS\n\nPermutation p-value:  p = (1 + #{|t*| >= |t_obs|}) / (1 + B)\nBootstrap:            resample rows with replacement, B times'),
      code(`import numpy as np
from scipy import stats

rng = np.random.default_rng(11)
x = rng.lognormal(2.0, 1.0, 60)      # skewed: revenue per user
y = rng.lognormal(2.3, 1.0, 55)

# Rank tests
print('mann-whitney :', stats.mannwhitneyu(x, y, alternative='two-sided'))
print('KS           :', stats.ks_2samp(x, y))

def perm_test(a, b, stat=np.mean, B=20_000, seed=0):
    """Two-sided permutation test on a difference of any statistic."""
    r = np.random.default_rng(seed)
    obs = stat(a) - stat(b)
    pool = np.concatenate([a, b]); n = len(a)
    draws = np.empty(B)
    for i in range(B):
        r.shuffle(pool)
        draws[i] = stat(pool[:n]) - stat(pool[n:])
    return obs, (1 + np.sum(np.abs(draws) >= abs(obs))) / (1 + B)

obs, p = perm_test(x, y, stat=np.mean)
print(f'permutation on means: diff={obs:+.2f}  p={p:.4f}')

# Bootstrap CI for a statistic with no clean formula: the ratio of medians
def boot_ci(stat, data, B=10_000, alpha=0.05, seed=1):
    r = np.random.default_rng(seed); n = len(data)
    vals = np.array([stat(r.choice(data, n, replace=True)) for _ in range(B)])
    return np.percentile(vals, [100*alpha/2, 100*(1-alpha/2)])

ratio = lambda s: np.median(s[:, 0]) / np.median(s[:, 1])
data = np.column_stack([x, rng.lognormal(2.0, 1.0, len(x))])
print('bootstrap CI (median ratio):', boot_ci(ratio, data).round(3))`),
      ul(['Mann-Whitney is not a test of medians unless you additionally assume the two distributions have the same shape. It tests whether values from one group tend to be larger — a perfectly cromulent and often more useful question.',
          'Permutation tests are exact for exchangeable data. Paired data are exchangeable within a pair (shuffle the signs), clustered data are exchangeable at the cluster level (shuffle whole clusters) — get the unit right.',
          'The bootstrap estimates variability, not truth. It cannot rescue a biased estimator or a sample that does not represent the population; with heavy tails, bootstrap the studentised statistic or use the BCa interval.',
          'Report the interval, not just "bootstrap says yes". A percentile interval on 10,000 resamples is one line of code and answers the question people actually had.',
          'With n in the tens and a discrete outcome, bootstrap and permutation distributions are coarse; the smallest achievable p-value is 1/C(n,k), so plan the sample size before you plan the test.'],
          ['من‌ویتنی آزمونِ میانه‌ها نیست مگر اینکه علاوه بر آن فرض کنید دو توزیع شکلِ یکسانی دارند. این آزمون می‌سنجد که آیا مقادیرِ یک گروه تمایل دارند بزرگ‌تر باشند — پرسشی کاملاً معتبر و معمولاً مفیدتر.',
           'آزمون‌های جایگشت برای داده‌ی جایگزین‌پذیر دقیق‌اند. داده‌ی جفتی درونِ جفت جایگزین‌پذیر است (علامت‌ها را جابه‌جا کنید)، داده‌ی خوشه‌ای در سطحِ خوشه (کلِ خوشه را جابه‌جا کنید) — واحد را درست انتخاب کنید.',
           'بوت‌استرپ تغییرپذیری را برآورد می‌کند، نه حقیقت را. نمی‌تواند یک برآوردگرِ اریب یا نمونه‌ای که نماینده‌ی جامعه نیست را نجات دهد؛ با دم‌های سنگین، آماره‌ی استودنتی‌شده را بوت‌استرپ کنید یا از بازه‌ی BCa استفاده کنید.',
           'بازه را گزارش کنید، نه فقط اینکه «بوت‌استرپ گفت بله». یک بازه‌ی صدکی روی ۱۰٬۰۰۰ بازنمونه یک خط کد است و به پرسشی پاسخ می‌دهد که مردم واقعاً داشتند.',
           'با n در حدِ ده‌ها و خروجیِ گسسته، توزیع‌های بوت‌استرپ و جایگشت زمخت‌اند؛ کوچک‌ترین مقدارِ p قابلِ دستیابی 1/C(n,k) است، پس اندازه‌ی نمونه را پیش از آزمون برنامه‌ریزی کنید.']),
      note('When a rank test and a t-test disagree, look at the plot. Usually one outlier or one long tail is driving the t-test, and the honest sentence is: "the difference is real but concentrated in the top 5% of users."',
           'وقتی یک آزمونِ رتبه‌ای و یک آزمونِ t توافق ندارند، نمودار را نگاه کنید. معمولاً یک دورافتاده یا یک دمِ بلند آزمونِ t را می‌راند و جمله‌ی صادقانه این است: «اختلاف واقعی است اما در ۵٪ بالای کاربران متمرکز است.»')
    ],
    ['nonparametric', 'permutation', 'bootstrap', 'mann-whitney', 'resampling'],
    [R('Bootstrap methods (Efron & Tibshirani intro)', 'https://web.stanford.edu/~hastie/CASI_files/PDF/casi.pdf', 'book'),
     R('scipy.stats resampling reference', 'https://docs.scipy.org/doc/scipy/reference/stats.html#resampling-methods', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-013', D, 'intermediate', 15,
    ['Effect Sizes, Power and Sample-Size Planning', 'اندازه‌ی اثر، توان و برنامه‌ریزیِ اندازه‌ی نمونه'],
    ['A p-value answers "is there anything here?"; the effect size answers "how much, and is it worth acting on?". Power analysis turns that second question into a sample size before you spend the traffic, the money or the week.',
     'مقدارِ p به «آیا اینجا چیزی هست؟» پاسخ می‌دهد؛ اندازه‌ی اثر به «چقدر، و آیا ارزشِ اقدام دارد؟». تحلیلِ توان پرسشِ دوم را پیش از آنکه ترافیک، پول یا هفته را خرج کنید، به یک اندازه‌ی نمونه تبدیل می‌کند.'],
    [
      def('An effect size is a scale-free (or decision-relevant) measure of how big a difference is: standardised mean difference, a ratio of probabilities, a correlation, or — best of all — the raw unit that the business cares about. Power is the probability that a study of a given size detects an effect of a given size at a given alpha; it is a property of the design, computed before the data arrive.',
          'اندازه‌ی اثر معیاری بی‌مقیاس (یا مرتبط با تصمیم) از بزرگیِ یک اختلاف است: اختلافِ میانگینِ استاندارد‌شده، نسبتی از احتمال‌ها، یک همبستگی، یا — از همه بهتر — همان واحدِ خامی که کسب‌وکار به آن اهمیت می‌دهد. توان احتمال این است که مطالعه‌ای با اندازه‌ی مفروض، اثری با اندازه‌ی مفروض را در سطحِ آلفای مفروض کشف کند؛ این ویژگیِ طرح است و پیش از رسیدنِ داده محاسبه می‌شود.'),
      math("Cohen d        = (m1 - m2) / s_pooled          0.2 small, 0.5 medium, 0.8 large\nHedges g       = d * (1 - 3/(4*(n1+n2) - 9))      small-sample correction\nCliff delta    = P(X > Y) - P(X < Y)              rank-based, in [-1, 1]\nodds ratio     = (a/b) / (c/d)                    binary outcomes\nrelative risk  = p1 / p0                          (lift = RR - 1)\n\nTwo proportions, equal n per arm, two-sided:\n  n per arm = (z_{1-a/2} + z_{1-b})^2 * (p1(1-p1) + p0(1-p0)) / (p1 - p0)^2\n\nTwo means:\n  n per arm = 2 * (z_{1-a/2} + z_{1-b})^2 * sigma^2 / delta^2\n\nMinimum detectable effect (rearranged):\n  delta = (z_{1-a/2} + z_{1-b}) * sqrt(2 * sigma^2 / n)"),
      code(`import numpy as np
from scipy import stats
from math import sqrt

def n_per_arm_props(p0, mde_relative, alpha=0.05, power=0.8):
    """Sample size per arm to detect a relative lift on a baseline rate."""
    p1 = p0 * (1 + mde_relative)
    z_a = stats.norm.ppf(1 - alpha / 2)
    z_b = stats.norm.ppf(power)
    return int(np.ceil((z_a + z_b) ** 2 * (p1 * (1 - p1) + p0 * (1 - p0)) / (p1 - p0) ** 2))

p0 = 0.05                                  # 5% baseline conversion
for lift in (0.20, 0.10, 0.05, 0.02):
    print(f'lift {lift:>5.0%}  ->  n/arm = {n_per_arm_props(p0, lift):>9,}')

def mde_props(p0, n, alpha=0.05, power=0.8):
    z = stats.norm.ppf(1 - alpha / 2) + stats.norm.ppf(power)
    return z * sqrt(2 * p0 * (1 - p0) / n)

print('MDE at 50k/arm:', round(mde_props(p0, 50_000), 4))

# Effect sizes in practice
rng = np.random.default_rng(3)
x, y = rng.normal(0, 1, 200), rng.normal(0.4, 1, 200)
n1, n2 = len(x), len(y)
s_pool = sqrt(((n1-1)*x.var(ddof=1) + (n2-1)*y.var(ddof=1)) / (n1 + n2 - 2))
d = (x.mean() - y.mean()) / s_pool
g = d * (1 - 3 / (4 * (n1 + n2) - 9))
print(f"d = {d:.3f}   Hedges g = {g:.3f}   cliff delta = "
      f"{2*stats.mannwhitneyu(x, y).statistic/(n1*n2) - 1:.3f}")

# Simulated power: the honest way when the test is not textbook
def power_sim(effect, n=40, sigma=1.0, alpha=0.05, reps=5000, seed=0):
    r = np.random.default_rng(seed)
    hits = sum(stats.ttest_ind(r.normal(0, sigma, n),
                               r.normal(effect, sigma, n), equal_var=False).pvalue < alpha
               for _ in range(reps))
    return hits / reps

print('simulated power at d=0.5, n=40/arm:', power_sim(0.5))`),
      ul(['Plan with the MDE, not with the effect you hope for: "with 50k per arm we can detect a 2.4% relative lift; anything smaller is invisible to this design."',
          'Power depends on variance as much as on n. Reducing variance (CUPED, better targeting, a within-subject design, a more stable metric) is often cheaper than buying more traffic.',
          'Post-hoc power — computed from the observed effect — is circular. If the result was not significant, say the design could only have detected effects larger than X.',
          'Report the interval around the effect. "Lift between -1% and +6%" is more useful and more honest than "not significant".',
          'For a decision, small effects can matter (a 0.3% lift on a large revenue base) and large ones can be irrelevant (a big lift on a feature nobody uses). Judge on the raw unit, then on the p-value.'],
          ['با کمینه‌ی اثرِ قابلِ کشف برنامه‌ریزی کنید، نه با اثری که امیدش را دارید: «با ۵۰ هزار در هر بازو می‌توانیم یک بهبودِ نسبیِ ۲.۴٪ را کشف کنیم؛ هرچه کوچک‌تر باشد برای این طرح نامرئی است.»',
           'توان به واریانس هم وابسته است، نه فقط به n. کاهشِ واریانس (CUPED، هدف‌گیریِ بهتر، طرحِ درون‌آزمودنی، معیارِ پایدارتر) معمولاً ارزان‌تر از خریدِ ترافیکِ بیشتر است.',
           'توانِ پس‌از-واقعه — محاسبه‌شده از اثرِ مشاهده‌شده — دور باطل است. اگر نتیجه معنادار نبود، بگویید طرح فقط می‌توانست اثرهای بزرگ‌تر از X را کشف کند.',
           'بازه‌ی اطرافِ اثر را گزارش کنید. «بهبود بین ‎-1٪‎ و ‎+6٪‎» مفیدتر و صادقانه‌تر از «معنادار نیست» است.',
           'برای یک تصمیم، اثرهای کوچک می‌توانند مهم باشند (بهبودِ ۰.۳٪ روی یک پایگاهِ درآمدیِ بزرگ) و اثرهای بزرگ می‌توانند بی‌ربط باشند (بهبودِ بزرگ روی قابلیتی که کسی استفاده نمی‌کند). بر اساسِ واحدِ خام قضاوت کنید، سپس مقدارِ p.']),
      note('The most common planning error is forgetting the unit of randomisation. If you randomise stores but analyse visits, your effective n is the number of stores, and the naive power calculation can overstate power by an order of magnitude.',
           'رایج‌ترین اشتباهِ برنامه‌ریزی فراموش کردنِ واحدِ تصادفی‌سازی است. اگر فروشگاه‌ها را تصادفی می‌کنید اما بازدیدها را تحلیل می‌کنید، n مؤثرِ شما تعدادِ فروشگاه‌هاست و محاسبه‌ی ساده‌لوحانه‌ی توان می‌تواند توان را یک مرتبه‌ی بزرگی بیش از واقع نشان دهد.')
    ],
    ['effect-size', 'power', 'sample-size', 'mde', 'ab-testing'],
    [R('statsmodels power and sample size', 'https://www.statsmodels.org/stable/stats.html#power-and-sample-size-calculations', 'doc'),
     R('Trustworthy Online Controlled Experiments (Kohavi et al.)', 'https://experimentguide.com/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-014', D, 'intermediate', 18,
    ['Linear Models: Inference, Diagnostics and Robust Errors', 'مدل‌های خطی: استنتاج، تشخیص و خطاهای مقاوم'],
    ['OLS is the model everyone has run and few have checked: what the coefficients mean, what the standard errors assume, what heteroskedasticity and collinearity do to them, and how to fix each without lying to yourself.',
     'حداقل مربعات مدلی است که همه اجرا کرده‌اند و کمتر کسی بررسی‌اش کرده: ضرایب چه معنایی دارند، خطاهای معیار چه فرض می‌کنند، ناهمسانیِ واریانس و هم‌خطی با آن‌ها چه می‌کنند، و چگونه هر کدام را بدون دروغ گفتن به خود درست کنیم.'],
    [
      def('The linear model y = X beta + eps with E[eps|X] = 0 estimates the best linear approximation to the conditional mean. Under homoskedastic, independent errors, the OLS estimator is BLUE (Gauss-Markov) and its usual standard errors are correct. When errors are heteroskedastic or clustered, the coefficients stay consistent but the standard errors do not — and the sandwich estimator repairs the errors, not the coefficients.',
          'مدلِ خطیِ y = X beta + eps با E[eps|X] = 0 بهترین تقریبِ خطیِ میانگینِ شرطی را برآورد می‌کند. تحتِ خطاهای هم‌واریانس و مستقل، برآوردگرِ OLS بهترین برآوردگرِ خطیِ نااریب (گاوس-مارکوف) است و خطاهای معیارِ معمولش درست‌اند. وقتی خطاها ناهمسان‌واریانس یا خوشه‌ای‌اند، ضرایب سازگار می‌مانند اما خطاهای معیار نه — و برآوردگرِ ساندویچی خطاها را تعمیر می‌کند، نه ضرایب را.'),
      math('beta_hat = (X^T X)^{-1} X^T y\nVar(beta_hat) = sigma^2 (X^T X)^{-1}                    (homoskedastic)\nSandwich:     Var_robust = (X^T X)^{-1} (SUM w_i x_i x_i^T) (X^T X)^{-1}\n  HC0: w_i = e_i^2        HC3: w_i = e_i^2 / (1 - h_i)^2     (best default)\n  cluster: sum within cluster first, then sandwich\n\nR^2 = 1 - SSE/SST        adjusted R^2 penalises added columns\nVIF_j = 1 / (1 - R^2_j)  (>5-10 signals collinearity)\nCook D_i = (SUM_j (yhat_j - yhat_j(-i))^2) / (p * MSE)   (>4/n to inspect)\nBreusch-Pagan: regress e^2 on X; LM = n * R^2 ~ chi-square(p)'),
      code(`import numpy as np, pandas as pd, statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.stats.diagnostic import het_breuschpagan
from statsmodels.stats.outliers_influence import variance_inflation_factor

rng = np.random.default_rng(5)
n = 800
store = rng.integers(0, 40, n)                       # clustered structure
size  = rng.normal(0, 1, n)
price = 0.6 * size + rng.normal(0, 1, n)             # correlated with size
noise = rng.normal(0, np.exp(0.5 * size))            # heteroskedastic
sales = 5 + 2.0 * size - 1.0 * price + noise
df = pd.DataFrame({'sales': sales, 'size': size, 'price': price, 'store': store})

m = smf.ols('sales ~ size + price', data=df).fit()
print(m.summary().tables[1])
print('robust HC3   :\\n', m.get_robustcov_results(cov_type='HC3').bse.round(3))
mc = smf.ols('sales ~ size + price', data=df).fit(cov_type='cluster',
                                                  cov_kwds={'groups': df['store']})
print('cluster SE   :', np.sqrt(np.diag(mc.cov_params())).round(3))

# Diagnostics
bp = het_breuschpagan(m.resid, m.model.exog)
print('Breusch-Pagan p =', round(bp[1], 5))
X = sm.add_constant(df[['size', 'price']])
print('VIF:', [round(variance_inflation_factor(X.values, i), 2) for i in range(X.shape[1])])
infl = m.get_influence()
print('max Cook D   :', round(infl.cooks_distance[0].max(), 4), '(threshold 4/n =', round(4/n, 4), ')')

# Fixing non-linearity with the model, not with the p-value
df['size_sq'] = df['size'] ** 2
print(smf.ols('sales ~ size + size_sq + price', data=df).fit().summary().tables[1])`),
      ul(['The coefficient is a slope conditional on the other columns. "Holding price fixed" is not a causal claim unless the design or an identification argument makes it one.',
          'Default to heteroskedasticity-robust (HC3) standard errors for cross-sectional data and cluster-robust errors whenever the same unit appears in many rows or treatment is assigned by group.',
          'High VIF does not bias predictions; it inflates standard errors and makes coefficients unstable and hard to interpret. Centre or drop, or use a regularised model if prediction is the goal.',
          'Residual plots beat summary statistics: residuals vs fitted (curvature, heteroskedasticity), QQ plot (tails), residuals vs each predictor (missing interactions), residuals vs time (drift).',
          'Influential points are not automatically errors. Report the model with and without them rather than silently deleting.'],
          ['ضریب یک شیبِ شرطی بر بقیه‌ی ستون‌هاست. «با ثابت نگه داشتنِ قیمت» یک ادعای علّی نیست مگر اینکه طرح یا یک استدلالِ شناسایی آن را علّی کند.',
           'برای داده‌ی مقطعی به‌طور پیش‌فرض خطاهای معیارِ مقاوم (HC3) و هرگاه همان واحد در سطرهای متعدد ظاهر می‌شود یا درمان در سطحِ گروه تخصیص یافته، خطاهای مقاومِ خوشه‌ای را به کار ببرید.',
           'VIF بالا پیش‌بینی‌ها را اریب نمی‌کند؛ خطاهای معیار را باد می‌کند و ضرایب را ناپایدار و دشوار برای تفسیر می‌سازد. مرکز‌سازی یا حذف کنید، یا اگر هدف پیش‌بینی است از یک مدلِ منظم‌شده استفاده کنید.',
           'نمودارهای باقی‌مانده از آماره‌های خلاصه بهترند: باقی‌مانده در برابرِ برازش (انحنا، ناهمسانیِ واریانس)، نمودارِ QQ (دم‌ها)، باقی‌مانده در برابرِ هر پیش‌بین (برهم‌کنش‌های از‌دست‌رفته)، باقی‌مانده در برابرِ زمان (رانش).',
           'نقاطِ اثرگذار لزوماً خطا نیستند. مدل را با و بدونِ آن‌ها گزارش کنید به‌جای آنکه بی‌سر و صدا حذفشان کنید.']),
      note('If the outcome is logged, the coefficient is approximately a percentage effect: 100 * beta per unit of x. If the predictor is logged, it is the effect of a 1% change. If both, it is an elasticity. Write it down before you present it.',
           'اگر خروجی لگاریتم گرفته شده، ضریب تقریباً یک اثرِ درصدی است: 100 * beta به‌ازای هر واحدِ x. اگر پیش‌بین لگاریتم گرفته شده، اثرِ یک تغییرِ ۱٪ است. اگر هر دو، یک کشش است. پیش از ارائه یادداشتش کنید.')
    ],
    ['ols', 'regression', 'heteroskedasticity', 'robust-standard-errors', 'diagnostics', 'vif'],
    [R('Mostly Harmless Econometrics (Angrist & Pischke)', 'https://www.mostlyharmlesseconometrics.com/', 'book'),
     R('statsmodels diagnostics API', 'https://www.statsmodels.org/stable/stats.html#residual-diagnostics-and-specification-tests', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-015', D, 'intermediate', 17,
    ['Generalized Linear Models: Logistic, Poisson and Friends', 'مدل‌های خطیِ تعمیم‌یافته: لجستیک، پواسون و دوستان'],
    ['A GLM keeps the linear predictor and changes everything else: the outcome distribution comes from the exponential family and a link function maps the mean to the linear scale. This is how you model conversion, counts, rates and skewed positives without pretending they are normal.',
     'یک GLM پیش‌بینِ خطی را نگه می‌دارد و بقیه را تغییر می‌دهد: توزیعِ خروجی از خانواده‌ی نمایی می‌آید و یک تابعِ پیوند میانگین را به مقیاسِ خطی می‌برد. این همان راهی است که با آن تبدیل، شمارش، نرخ و مقادیرِ مثبتِ چوله را مدل می‌کنید بی‌آنکه وانمود کنید نرمال‌اند.'],
    [
      def('A GLM has three parts: a random component (the outcome distribution — Gaussian, Bernoulli, Poisson, Gamma, negative binomial), a systematic component (eta = X beta), and a link g with g(mu) = eta. The canonical links are logit for Bernoulli, log for Poisson and Gamma, and identity for Gaussian. Fit is by iteratively reweighted least squares, and comparison is by deviance rather than by R-squared.',
          'یک GLM سه بخش دارد: یک مؤلفه‌ی تصادفی (توزیعِ خروجی — گاوسی، برنولی، پواسون، گاما، دوجمله‌ای منفی)، یک مؤلفه‌ی سیستماتیک (eta = X beta)، و یک پیوندِ g با g(mu) = eta. پیوندهای کانونی لاجیت برای برنولی، لگاریتم برای پواسون و گاما، و همانی برای گاوسی هستند. برازش با کمینه‌سازیِ مربعاتِ بازوزن‌شده‌ی تکراری است و مقایسه با انحراف (deviance) انجام می‌شود نه با R-squared.'),
      math('Bernoulli / logistic:\n  logit(p) = log(p/(1-p)) = X beta        p = 1/(1+e^{-eta})\n  coefficient b -> odds ratio e^b (per one unit of x)\n\nPoisson:\n  log(mu) = X beta + log(exposure)        (the offset, coefficient fixed at 1)\n  coefficient b -> rate ratio e^b\n  Var(y) = mu assumed; overdispersion: Var(y) = mu + alpha*mu^2 -> NegBin\n\nGamma (positive, right-skewed, constant CV):  log link, Var = mu^2 / shape\n\nDeviance:   D = 2 * (loglik_saturated - loglik_model)\n  nested models:  D0 - D1 ~ chi-square(df difference)\n  Pearson chi2/df >> 1  ->  overdispersion\n\nSeparation: a predictor that perfectly predicts y -> infinite coefficients\n  fix: Firth correction, or a Bayesian prior / regularisation'),
      code(`import numpy as np, pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf

rng = np.random.default_rng(21)
n = 4000

# --- Logistic: conversion ---
tenure = rng.normal(24, 12, n).clip(0)
discount = rng.binomial(1, 0.3, n)
logit = -2.2 + 0.03 * tenure + 0.8 * discount
conv = rng.binomial(1, 1 / (1 + np.exp(-logit)))
d = pd.DataFrame({'conv': conv, 'tenure': tenure, 'discount': discount})

logit_m = smf.glm('conv ~ tenure + discount', data=d,
                  family=sm.families.Binomial()).fit()
print(np.exp(logit_m.params).round(3))       # odds ratios
print('conf-int (OR):\\n', np.exp(logit_m.conf_int()).round(3))

# --- Poisson with an offset: events per user-month ---
days = rng.integers(5, 400, n)
rate = np.exp(-3.0 + 0.02 * tenure + 0.5 * discount)
events = rng.poisson(rate * days / 30)
d['events'], d['days'] = events, days

pois = smf.glm('events ~ tenure + discount', data=d,
               family=sm.families.Poisson(), offset=np.log(d['days'] / 30)).fit()
print('poisson   :', pois.params.round(4).to_dict())
print('pearson chi2/df =', round(pois.pearson_chi2 / pois.df_resid, 3))

# Overdispersed? Move to negative binomial and compare
nb = smf.glm('events ~ tenure + discount', data=d,
             family=sm.families.NegativeBinomial(alpha=0.5),
             offset=np.log(d['days'] / 30)).fit()
print('negbin    :', nb.params.round(4).to_dict(), '| llf', round(nb.llf, 1))`),
      ul(['Logistic coefficients are log-odds; exponentiate for the odds ratio and remember it is not a risk ratio — for common outcomes they diverge sharply.',
          'Counts always need an exposure: log(days), log(impressions), log(population) as an offset with coefficient fixed at 1, not as another predictor.',
          'Check overdispersion (Pearson chi-square / df, or a dispersion statistic). If it is well above 1, standard errors are too small and the negative binomial is usually the answer.',
          'Watch for separation with rare events or perfectly predictive categories — coefficients blow up to ±20 and standard errors to thousands. Regularise, use Firth, or pool the level.',
          'Calibration matters more than discrimination for decision-making: a model that ranks well but says 0.4 when the truth is 0.05 will misprice everything downstream.'],
          ['ضرایبِ لجستیک لگاریتمِ شانس‌اند؛ برای نسبتِ شانس نمایی کنید و به خاطر داشته باشید که نسبتِ خطر نیست — برای پیامدهای شایع این دو به‌شدت از هم جدا می‌شوند.',
           'شمارش‌ها همیشه به یک مواجهه نیاز دارند: log(روزها)، log(نمایش‌ها)، log(جمعیت) به عنوان یک آفست با ضریبِ ثابتِ ۱، نه به عنوان یک پیش‌بینِ دیگر.',
           'بیش‌پراکنشی را بررسی کنید (کای‌دوی پیرسون تقسیم بر df، یا یک آماره‌ی پراکنش). اگر خیلی بالاتر از ۱ باشد، خطاهای معیار کوچک‌تر از واقع‌اند و معمولاً پاسخ دوجمله‌ایِ منفی است.',
           'با رخدادهای نادر یا دسته‌های کاملاً پیش‌بین‌کننده مراقبِ جداشدگی باشید — ضرایب به ‎±20‎ و خطاهای معیار به هزاران می‌رسند. منظم‌سازی کنید، از فیرث استفاده کنید، یا آن سطح را ادغام کنید.',
           'برای تصمیم‌گیری، کالیبراسیون از تفکیک‌پذیری مهم‌تر است: مدلی که خوب رتبه می‌دهد اما به جای ۰.۰۵ می‌گوید ۰.۴، قیمتِ هر چیزِ پایین‌دستی را غلط می‌گذارد.']),
      note('A GLM is a model for the conditional mean, not for the whole distribution. If you need the tail — the 99th percentile of claim size, the probability of a stock-out — you need quantile regression, an extreme-value model, or a full predictive distribution.',
           'یک GLM مدلی برای میانگینِ شرطی است، نه برای کلِ توزیع. اگر دم را می‌خواهید — صدکِ ۹۹امِ اندازه‌ی خسارت، احتمالِ اتمامِ موجودی — به رگرسیونِ چارکی، یک مدلِ مقادیرِ فرین، یا یک توزیعِ پیش‌بینِ کامل نیاز دارید.')
    ],
    ['glm', 'logistic', 'poisson', 'odds-ratio', 'overdispersion', 'offset'],
    [R('Generalized Linear Models (McCullagh & Nelder)', 'https://doi.org/10.1201/9780203753736', 'book'),
     R('statsmodels GLM guide', 'https://www.statsmodels.org/stable/glm.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-016', D, 'intermediate', 14,
    ['Categorical Data: Tables, Chi-Square and Odds', 'داده‌ی رده‌ای: جداول، کای‌دو و نسبتِ شانس'],
    ['Counts in a table are the raw material of most business questions — conversion by channel, defects by line, churn by plan. Learn to read a table, test the association honestly, and express the association as a number a decision-maker can use.',
     'شمارش‌های درونِ یک جدول ماده‌ی خامِ بیشترِ پرسش‌های کسب‌وکاری‌اند — تبدیل به تفکیکِ کانال، نقص به تفکیکِ خط، ریزش به تفکیکِ طرح. یاد بگیرید جدول را بخوانید، وابستگی را صادقانه بیازمایید و آن را به عددی بیان کنید که تصمیم‌گیرنده بتواند استفاده کند.'],
    [
      def('A contingency table cross-classifies counts. The question "are these two factors associated?" is a chi-square test of independence; "is this group different from that one?" needs a contrast with an effect size (odds ratio, risk ratio, risk difference). The third factor that appears when you split the table is where Simpson paradox lives.',
          'یک جدولِ توافقی شمارش‌ها را متقاطع طبقه‌بندی می‌کند. پرسشِ «آیا این دو عامل وابسته‌اند؟» یک آزمونِ استقلالِ کای‌دو است؛ «آیا این گروه با آن یکی فرق دارد؟» به یک تضاد با اندازه‌ی اثر نیاز دارد (نسبتِ شانس، نسبتِ خطر، اختلافِ خطر). عاملِ سومی که هنگامِ تقسیمِ جدول ظاهر می‌شود همان‌جایی است که پارادوکسِ سیمپسون زندگی می‌کند.'),
      math('2x2 table:            outcome+   outcome-\n  exposed / group A       a           b\n  control / group B       c           d\n\nrisk (group A) = a/(a+b)         risk (group B) = c/(c+d)\nrisk difference = p_A - p_B     ("absolute lift")\nrelative risk   = p_A / p_B\nodds ratio      = (a/b) / (c/d) = (a*d) / (b*c)\n  OR = 1 -> no association;  log(OR) SE = sqrt(1/a + 1/b + 1/c + 1/d)\n\nchi-square (independence):  X^2 = SUM (O - E)^2 / E,  df = (r-1)(c-1)\nFisher exact:               conditions on the margins (small counts)\nCochran-Mantel-Haenszel:    stratified OR, controls a third variable\nG-test:                     2 * SUM O * ln(O/E)'),
      code(`import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.contingency_tables import StratifiedTable

# Click-through by channel: is the association real?
table = np.array([[ 412, 1588], [ 305, 1695], [ 88,  412]])
chi2, p, dof, exp = stats.chi2_contingency(table)
print(f'chi2 = {chi2:.2f}  df = {dof}  p = {p:.4f}  min expected = {exp.min():.0f}')

# Effect size for one contrast: channel A vs B
a, b = table[0]; c, d = table[1]
odds_ratio = (a * d) / (b * c)
se_log_or = np.sqrt(1/a + 1/b + 1/c + 1/d)
ci = np.exp(np.log(odds_ratio) + np.array([-1, 1]) * 1.96 * se_log_or)
print(f'OR = {odds_ratio:.3f}  95% CI [{ci[0]:.3f}, {ci[1]:.3f}]')

# Small counts -> exact test
small = np.array([[7, 2], [1, 5]])
print('fisher:', stats.fisher_exact(small))

# Simpson's paradox: a third variable flips the sign
df = pd.DataFrame({
    'segment': ['new']*2000 + ['returning']*2000,
    'variant': ['A']*1000 + ['B']*1000 + ['A']*1000 + ['B']*1000,
    'converted': [40, 90] + [300, 260] })          # B wins in each segment
df['converted'] = np.concatenate([np.random.default_rng(1).binomial(1, p, n)
                                  for p, n in [(0.04,1000),(0.09,1000),(0.30,1000),(0.26,1000)]])
overall = df.groupby('variant')['converted'].agg(['sum', 'count'])
print('overall rates:\\n', (overall['sum']/overall['count']).round(4).to_dict())
print('by segment:\\n', df.groupby(['segment','variant'])['converted'].mean().round(4).to_dict())

# Control the segment with CMH
tab = np.array([df[(df.segment==s) & (df.variant==v)]['converted'].agg([lambda x: x.sum(),
                lambda x: (1-x).sum()]).tolist() for s in ['new','returning'] for v in ['A','B']])
strata = [tab[0:2], tab[2:4]]
st = StratifiedTable([np.array(s) for s in strata])
print('CMH OR =', round(st.oddsratio_pooled, 3), '| test of OR=1 p =', round(st.test_null_odds().pvalue, 4))`),
      ul(['Pick the effect measure for the audience: risk difference for "how many extra conversions", relative risk for "how much better", odds ratio for case-control designs and logistic models.',
          'Chi-square says "associated", not "how much" and not "which". Follow it with a contrast and an interval.',
          'Expected counts below about 5 make the chi-square approximation unreliable; use Fisher exact for 2x2 and a Monte Carlo simulation for bigger tables.',
          'Always ask what the table is stratified by. If the mix of the stratifying variable differs between rows (different segment share per channel), the pooled comparison is confounded — stratify or model it.',
          'Zero cells are informative, not missing. They mean "never observed in this sample", and they are exactly why the odds ratio can be infinite.'],
          ['معیارِ اثر را برای مخاطب انتخاب کنید: اختلافِ خطر برای «چند تبدیلِ بیشتر»، نسبتِ خطر برای «چقدر بهتر»، نسبتِ شانس برای طرح‌های مورد-شاهدی و مدل‌های لجستیک.',
           'کای‌دو می‌گوید «وابسته»، نه «چقدر» و نه «کدام». پس از آن یک تضاد و یک بازه بیاورید.',
           'شمارش‌های مورد انتظارِ کمتر از حدودِ ۵ تقریبِ کای‌دو را غیرقابل‌اعتماد می‌کند؛ برای ۲×۲ از آزمونِ دقیقِ فیشر و برای جدول‌های بزرگ‌تر از شبیه‌سازیِ مونت‌کارلو استفاده کنید.',
           'همیشه بپرسید جدول بر چه اساسی طبقه‌بندی شده است. اگر ترکیبِ متغیرِ طبقه‌بندی بین سطرها فرق کند (سهمِ متفاوتِ بخش در هر کانال)، مقایسه‌ی تجمیعی مخدوش است — طبقه‌بندی کنید یا مدلش کنید.',
           'خانه‌های صفر آموزنده‌اند، نه گم‌شده. یعنی «در این نمونه هرگز مشاهده نشده» و دقیقاً به همین دلیل است که نسبتِ شانس می‌تواند بی‌نهایت شود.']),
      note('The paradox is not in the data, it is in the question. "Is B better?" has no answer until you say for whom, and until the mix of "whom" is held fixed across the comparison.',
           'پارادوکس در داده نیست، در پرسش است. «آیا B بهتر است؟» پاسخی ندارد تا وقتی نگویید برای چه کسی، و تا وقتی ترکیبِ «چه کسی» در دو سوی مقایسه ثابت نگه داشته نشود.')
    ],
    ['categorical', 'chi-square', 'odds-ratio', 'simpson-paradox', 'contingency'],
    [R('Categorical Data Analysis (Agresti)', 'https://doi.org/10.1002/0471249688', 'book'),
     R('statsmodels contingency tables', 'https://www.statsmodels.org/stable/contingency_tables.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-017', D, 'advanced', 18,
    ['Mixed and Hierarchical Models', 'مدل‌های آمیخته و سلسله‌مراتبی'],
    ['Users inside cities, students inside schools, sessions inside users, repeated measures inside subjects. Mixed models let you use all the rows without pretending they are independent, and they shrink noisy group estimates toward the mean by exactly the right amount.',
     'کاربران درونِ شهرها، دانش‌آموزان درونِ مدارس، نشست‌ها درونِ کاربران، اندازه‌گیری‌های تکراری درونِ آزمودنی‌ها. مدل‌های آمیخته اجازه می‌دهند از همه‌ی سطرها استفاده کنید بی‌آنکه وانمود کنید مستقل‌اند، و برآوردهای پُرنویزِ گروهی را به‌اندازه‌ی دقیقِ درست به سمتِ میانگین می‌کشند.'],
    [
      def('A fixed effect is a parameter you want to estimate for its own sake (the treatment, the price elasticity). A random effect is a deviation for a level drawn from a population of levels (this city, this subject), assumed to come from a distribution — usually normal with variance estimated from the data. Pooling everything ignores structure; fitting each group separately overfits small groups. A mixed model does partial pooling: each group is pulled toward the grand mean in proportion to how little and how noisily it was observed.',
          'اثرِ ثابت پارامتری است که به‌خاطرِ خودش می‌خواهید برآوردش کنید (درمان، کششِ قیمت). اثرِ تصادفی انحرافی برای یک سطح است که از جامعه‌ای از سطوح کشیده شده (این شهر، این آزمودنی) و فرض می‌شود از یک توزیع می‌آید — معمولاً نرمال با واریانسی که از داده برآورد می‌شود. تجمیعِ همه‌چیز ساختار را نادیده می‌گیرد؛ برازشِ جداگانه‌ی هر گروه روی گروه‌های کوچک بیش‌برازش می‌کند. یک مدلِ آمیخته تجمیعِ جزئی انجام می‌دهد: هر گروه به تناسبِ اینکه چقدر کم و چقدر پُرنویز مشاهده شده، به سمتِ میانگینِ کل کشیده می‌شود.'),
      math('y_ij = X_ij beta + u_j + e_ij ,    u_j ~ N(0, tau^2),  e_ij ~ N(0, sigma^2)\n\nrandom intercept:  group j shifts up/down\nrandom slope:      u_j multiplies a predictor:  y_ij = ... + (b0 + u_j) * x_ij\n\nICC (intraclass correlation) = tau^2 / (tau^2 + sigma^2)\n  share of variance that is between-group; 0 -> no need for random effects\n\nshrinkage of group j:   weight = n_j * tau^2 / (n_j * tau^2 + sigma^2)\n  estimate_j = weight * (ybar_j - ybar) + (1 - weight) * 0\n\ndesign effect  = 1 + (m - 1) * ICC      (m = rows per cluster)\n  effective sample size = n_rows / design effect\n\nREML estimates variance components without the df bias of ML\nGEE: population-averaged, robust SEs, no distributional assumption on u'),
      code(`import numpy as np, pandas as pd
import statsmodels.formula.api as smf

rng = np.random.default_rng(42)
n_stores, per_store = 60, 20
store = np.repeat(np.arange(n_stores), per_store)
true_u = rng.normal(0, 1.2, n_stores)                  # store-level effect
price  = rng.normal(1.0, 0.15, n_stores * per_store)
promo  = rng.binomial(1, 0.4, n_stores * per_store)
sales  = (8 + true_u[store] - 2.5 * price + 1.1 * promo
          + rng.normal(0, 0.8, n_stores * per_store))
df = pd.DataFrame({'sales': sales, 'price': price, 'promo': promo, 'store': store})

# Naive OLS: treats 60 stores as 1200 independent rows
ols = smf.ols('sales ~ price + promo', data=df).fit()
print('OLS    price SE :', round(ols.bse['price'], 4))

# Random intercept per store
mix = smf.mixedlm('sales ~ price + promo', data=df, groups=df['store']).fit()
print('Mixed  price SE :', round(mix.bse['price'], 4))
tau2 = float(mix.cov_re.iloc[0, 0]); sigma2 = mix.scale
print(f'ICC = {tau2 / (tau2 + sigma2):.3f}   design effect = '
      f'{1 + (per_store - 1) * tau2 / (tau2 + sigma2):.2f}')

# Random slope: promotion works differently per store
mix2 = smf.mixedlm('sales ~ price + promo', data=df, groups=df['store'],
                   re_formula='~promo').fit()
print(mix2.summary().tables[1])

# Partial pooling in one line: group means shrunk toward the grand mean
g = df.groupby('store')['sales'].agg(['mean', 'count'])
grand = df['sales'].mean()
w = g['count'] * tau2 / (g['count'] * tau2 + sigma2)
shrunk = grand + w * (g['mean'] - grand)
print('noisiest stores, raw vs shrunk:')
print(pd.DataFrame({'raw': g['mean'], 'shrunk': shrunk}).head(5).round(2))`),
      ul(['Use a mixed model when rows are nested (sessions in users) or crossed (items and raters), when you have repeated measures, or when you want to generalise to a population of groups rather than to these specific groups.',
          'Random effects need enough levels — a handful of groups gives you a variance estimate with huge uncertainty. With fewer than ~10 levels, treat the grouping as fixed, or accept that tau is barely identified.',
          'The ICC tells you how much independent information you actually have. With ICC = 0.1 and 20 rows per cluster, your effective sample size is about a third of the row count.',
          'Distinguish the two questions: "what is the effect for this store?" (conditional, mixed model with a BLUP) versus "what is the average effect across stores?" (population-averaged, GEE). With a logit link they are not the same number.',
          'Specify the maximal random structure the design supports, then simplify only when the model fails to converge — and say which terms you dropped.'],
          ['زمانی از مدلِ آمیخته استفاده کنید که سطرها تودرتو باشند (نشست‌ها در کاربران) یا متقاطع (آیتم‌ها و داوران)، وقتی اندازه‌گیری‌های تکراری دارید، یا وقتی می‌خواهید به جامعه‌ای از گروه‌ها تعمیم دهید نه به این گروه‌های مشخص.',
           'اثرهای تصادفی به تعدادِ کافی از سطوح نیاز دارند — چند گروه معدود، برآوردِ واریانسی با عدم‌قطعیتِ عظیم می‌دهد. با کمتر از حدودِ ۱۰ سطح، گروه‌بندی را ثابت در نظر بگیرید، یا بپذیرید که tau به‌سختی شناسایی می‌شود.',
           'ICC می‌گوید واقعاً چقدر اطلاعاتِ مستقل دارید. با ICC = 0.1 و ۲۰ سطر در هر خوشه، اندازه‌ی نمونه‌ی مؤثرِ شما حدود یک‌سومِ تعدادِ سطرهاست.',
           'دو پرسش را از هم جدا کنید: «اثر برای این فروشگاه چقدر است؟» (شرطی، مدلِ آمیخته با BLUP) در برابر «اثرِ میانگین در فروشگاه‌ها چقدر است؟» (میانگینِ جامعه، GEE). با پیوندِ لاجیت این دو یک عدد نیستند.',
           'بیشینه‌ی ساختارِ تصادفی‌ای را که طرح پشتیبانی می‌کند مشخص کنید، سپس تنها وقتی مدل همگرا نشد ساده کنید — و بگویید کدام جمله‌ها را حذف کرده‌اید.']),
      note('Mixed models are not a licence to ignore clustering in an experiment. If treatment is assigned at the cluster level, the treatment effect is compared between clusters — a random intercept does not manufacture the missing degrees of freedom.',
           'مدل‌های آمیخته مجوزی برای نادیده گرفتنِ خوشه‌بندی در یک آزمایش نیستند. اگر درمان در سطحِ خوشه تخصیص یافته، اثرِ درمان بینِ خوشه‌ها مقایسه می‌شود — یک عرض از مبدأِ تصادفی درجاتِ آزادیِ گم‌شده را تولید نمی‌کند.')
    ],
    ['mixed-models', 'hierarchical', 'random-effects', 'partial-pooling', 'icc', 'shrinkage'],
    [R('Data Analysis Using Regression and Multilevel Models (Gelman & Hill)', 'https://www.cambridge.org/core/books/data-analysis-using-regression-and-multilevelhierarchical-models/', 'book'),
     R('statsmodels MixedLM', 'https://www.statsmodels.org/stable/mixed_linear.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-018', D, 'advanced', 18,
    ['Survival Analysis: Time-to-Event with Censoring', 'تحلیلِ بقا: زمان-تا-رخداد با سانسور'],
    ['Churn, time to purchase, time to failure, time to recovery: the outcome is a duration and many subjects have not had the event yet. Dropping or imputing those rows biases everything; survival methods use exactly the information they contain — "at least this long".',
     'ریزش، زمان تا خرید، زمان تا خرابی، زمان تا بهبودی: خروجی یک مدت است و بسیاری از آزمودنی‌ها هنوز رخداد را تجربه نکرده‌اند. حذف یا درون‌یابیِ آن سطرها همه‌چیز را اریب می‌کند؛ روش‌های بقا دقیقاً از همان اطلاعاتی استفاده می‌کنند که دارند — «حداقل به این اندازه».'],
    [
      def('Each subject contributes (duration, event indicator). Right-censored means the event has not happened by the end of observation; we know T > t but not T. The survival function S(t) = P(T > t) and the hazard h(t) = the instantaneous event rate at t given survival to t. The Kaplan-Meier estimator steps down at each observed event and accounts for people leaving the risk set; the Cox model regresses the hazard on covariates without specifying the baseline hazard.',
          'هر آزمودنی یک (مدت، نشانگرِ رخداد) می‌دهد. سانسورِ راست یعنی رخداد تا پایانِ مشاهده اتفاق نیفتاده؛ می‌دانیم T > t اما T را نمی‌دانیم. تابعِ بقا S(t) = P(T > t) و مخاطره h(t) نرخِ لحظه‌ایِ رخداد در t به شرطِ بقا تا t است. برآوردگرِ کاپلان-مایر در هر رخدادِ مشاهده‌شده پله‌ای پایین می‌آید و خروجِ آدم‌ها از مجموعه‌ی در-معرض را لحاظ می‌کند؛ مدلِ کاکس مخاطره را روی کوواریت‌ها رگرس می‌کند بی‌آنکه مخاطره‌ی پایه را مشخص کند.'),
      math('S(t) = P(T > t)                 h(t) = lim_dt->0 P(t <= T < t+dt | T >= t) / dt\nH(t) = integral_0^t h(u) du            S(t) = exp(-H(t))\n\nKaplan-Meier:   S_hat(t) = PROD_{t_i <= t} (1 - d_i / n_i)\n  d_i events at t_i, n_i at risk just before t_i   (censored leave after)\n  Greenwood SE:  Var(S) ~ S^2 * SUM d_i / (n_i (n_i - d_i))\n\nLog-rank test:  compares whole curves, weights all times equally\n  (Wilcoxon/Breslow weights early times more)\n\nCox PH:   h_i(t) = h_0(t) * exp(X_i beta)\n  proportional hazards: the ratio h_i/h_j is constant in t\n  partial likelihood -> beta;  exp(beta) = hazard ratio\n  HR > 1 -> higher hazard -> shorter survival\n\nMedian survival: smallest t with S(t) <= 0.5\nRestricted mean survival time (RMST): area under S(t) up to tau'),
      code(`import numpy as np, pandas as pd
from lifelines import KaplanMeierFitter, CoxPHFitter
from lifelines.statistics import logrank_test, proportional_hazard_test

rng = np.random.default_rng(9)
n = 1500
plan   = rng.binomial(1, 0.5, n)                 # 1 = annual plan
support = rng.poisson(2, n)                      # support tickets opened
scale  = np.exp(3.2 - 0.45 * plan + 0.10 * support)   # longer = slower churn
true_t = rng.weibull(1.3, n) * scale
obs    = rng.uniform(1, 365, n)                  # observation window in days
t      = np.minimum(true_t, obs)
event  = (true_t <= obs).astype(int)
df = pd.DataFrame({'t': t, 'event': event, 'plan': plan, 'support': support})
print('censoring rate:', round(1 - df.event.mean(), 3))

kmf = KaplanMeierFitter()
for p in (0, 1):
    m = df.plan == p
    kmf.fit(df.t[m], df.event[m], label=f'plan={p}')
    print(f'plan={p}  median survival = {kmf.median_survival_time_:.0f} d')

lr = logrank_test(df.t[df.plan == 1], df.t[df.plan == 0],
                  df.event[df.plan == 1], df.event[df.plan == 0])
print('log-rank p =', round(lr.p_value, 6))

cph = CoxPHFitter().fit(df, duration_col='t', event_col='event')
cph.print_summary(decimals=3)
print('hazard ratios:\\n', np.exp(cph.params_).round(3).to_dict())

# PH assumption: a significant test means the HR drifts over time
proportional_hazard_test(cph, df).print_summary(decimals=4)`),
      ul(['Define time zero unambiguously (signup? first payment?) and use the same definition for every subject; the most common bug is a time zero that differs by group.',
          'Censoring must be independent of the event mechanism (non-informative). If people leave the study because they are about to churn, your censoring is informative and survival estimates are biased.',
          'Report the median (or RMST) and the number still at risk, not just the curve. A tail estimated from nine people is a tail you should not quote.',
          'The Cox HR is not a risk ratio and it is not a statement about survival probability; it is a ratio of instantaneous rates. Convert to S(t) differences when talking to stakeholders.',
          'Competing risks: if a user can leave for reasons that preclude the event (account closed by fraud), treat the other cause as a competing risk, not as censoring — the two give different cumulative incidences.'],
          ['زمانِ صفر را بدون ابهام تعریف کنید (ثبت‌نام؟ نخستین پرداخت؟) و همان تعریف را برای همه به کار ببرید؛ رایج‌ترین باگ، زمانِ صفرِ متفاوت بین گروه‌هاست.',
           'سانسور باید از سازوکارِ رخداد مستقل باشد (غیرآموزنده). اگر آدم‌ها چون در شُرفِ ریزش‌اند مطالعه را ترک می‌کنند، سانسورِ شما آموزنده است و برآوردهای بقا اریب‌اند.',
           'میانه (یا RMST) و تعدادِ باقی‌مانده در معرض را گزارش کنید، نه فقط منحنی را. دمی که از نه نفر برآورد شده، دمی است که نباید نقل کنید.',
           'HR کاکس نه نسبتِ خطر است و نه گزاره‌ای درباره‌ی احتمالِ بقا؛ نسبتی از نرخ‌های لحظه‌ای است. هنگامِ گفت‌وگو با ذی‌نفعان آن را به اختلافِ S(t) تبدیل کنید.',
           'خطرهای رقیب: اگر کاربر بتواند به دلایلی برود که رخداد را ناممکن می‌کند (حساب به دلیلِ تقلب بسته شود)، علتِ دیگر را یک خطرِ رقیب بدانید، نه سانسور — این دو برآمدِ تجمعیِ متفاوتی می‌دهند.']),
      note('A survival model answers "when", a logistic model answers "whether". If you collapse the duration to a binary flag you throw away both the timing and the information in the censored rows — and you usually lose power.',
           'یک مدلِ بقا به «کی» پاسخ می‌دهد و یک مدلِ لجستیک به «آیا». اگر مدت را به یک پرچمِ دودویی فشرده کنید، هم زمان‌بندی و هم اطلاعاتِ درونِ سطرهای سانسور‌شده را دور ریخته‌اید — و معمولاً توان را از دست می‌دهید.')
    ],
    ['survival', 'kaplan-meier', 'cox', 'censoring', 'hazard-ratio', 'churn'],
    [R('lifelines documentation', 'https://lifelines.readthedocs.io/en/latest/', 'doc'),
     R('Survival Analysis: A Self-Learning Text (Kleinbaum & Klein)', 'https://doi.org/10.1007/978-1-4419-6646-9', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-019', D, 'advanced', 18,
    ['Time Series: Stationarity, ARIMA and Honest Forecast Intervals', 'سری‌های زمانی: ایستایی، آریما و بازه‌های پیش‌بینیِ صادقانه'],
    ['Time series break the independence assumption on purpose: yesterday predicts today. Working with that structure — rather than against it — is what separates a forecast from a curve fit.',
     'سری‌های زمانی فرضِ استقلال را عمداً می‌شکنند: دیروز امروز را پیش‌بینی می‌کند. کار کردن با این ساختار — نه علیه آن — همان چیزی است که یک پیش‌بینی را از یک برازشِ منحنی جدا می‌کند.'],
    [
      def('A series is stationary when its mean, variance and autocovariance do not drift over time; most classical models require it, and differencing or detrending is how you get there. ACF shows correlation with lags; PACF shows correlation with a lag after removing the shorter lags. The ARIMA(p,d,q) model combines p autoregressive lags, d differences and q moving-average error lags, and SARIMA adds seasonal terms.',
          'یک سری زمانی ایستا است وقتی میانگین، واریانس و کوواریانسِ خودکارش در طول زمان رانش نکنند؛ بیشترِ مدل‌های کلاسیک به آن نیاز دارند و تفاضل‌گیری یا روندزدایی راهِ رسیدن به آن است. ACF همبستگی با وقفه‌ها را نشان می‌دهد؛ PACF همبستگی با یک وقفه را پس از حذفِ وقفه‌های کوتاه‌تر. مدلِ ARIMA(p,d,q) ترکیب می‌کند: p وقفه‌ی خودرگرسیو، d تفاضل و q وقفه‌ی خطای میانگینِ متحرک، و SARIMA جمله‌های فصلی می‌افزاید.'),
      math('lag operator L:  L y_t = y_{t-1}\nAR(p):      y_t = c + SUM_{i=1..p} phi_i y_{t-i} + e_t\nMA(q):      y_t = mu + e_t + SUM_{j=1..q} theta_j e_{t-j}\nARIMA(p,d,q):  phi(L) (1-L)^d y_t = c + theta(L) e_t\nSARIMA:     ARIMA(p,d,q) x (P,D,Q)_s   (s = season length)\n\nACF  rho_k = Corr(y_t, y_{t-k})         PACF = partial correlation at lag k\nADF test:  H0 = unit root (non-stationary);  p < 0.05 -> stationary\nKPSS test: H0 = stationarity             (use both; they disagree informatively)\n\nForecast variance grows with horizon:  VAR(y_{T+h}) > VAR(y_{T+1})\nInterval = yhat +/- z * sigma_h           (wider as h grows, always)\n\nBacktest: rolling-origin, never a single random split'),
      code(`import numpy as np, pandas as pd
from statsmodels.tsa.stattools import adfuller, kpss, acf, pacf
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.seasonal import STL

rng = np.random.default_rng(4)
idx = pd.date_range('2022-01-01', periods=730, freq='D')
trend = np.linspace(100, 160, 730)
season = 12 * np.sin(2 * np.pi * np.arange(730) / 7)          # weekly
noise = np.random.default_rng(1).normal(0, 4, 730)
y = pd.Series(trend + season + noise, index=idx)

print('ADF p =', round(adfuller(y)[1], 4), '| after diff:', round(adfuller(y.diff().dropna())[1], 6))
print('KPSS p =', round(kpss(y, regression='c', nlags='auto')[1], 4))
print('ACF  lags 1-4 :', acf(y, nlags=4).round(3))
print('PACF lags 1-4 :', pacf(y, nlags=4).round(3))

stl = STL(y, period=7).fit()
stl.plot()                      # trend / seasonal / residual: read this first

# Rolling-origin backtest — the only honest way to score a forecaster
def backtest(series, order, seasonal_order, h=7, start=0.6, step=7):
    cut = int(len(series) * start); errs, widths, cover = [], [], []
    for t in range(cut, len(series) - h, step):
        tr, te = series.iloc[:t], series.iloc[t:t + h]
        fit = SARIMAX(tr, order=order, seasonal_order=seasonal_order,
                      enforce_stationarity=False).fit(disp=False)
        fc = fit.get_forecast(h); m = fc.predicted_mean; ci = fc.conf_int()
        errs.append(np.abs(te.values - m.values).mean())
        widths.append((ci.iloc[:, 1] - ci.iloc[:, 0]).mean())
        cover.append(np.mean((te.values >= ci.iloc[:, 0].values) &
                             (te.values <= ci.iloc[:, 1].values)))
    return dict(MAE=float(np.mean(errs)), width=float(np.mean(widths)),
                coverage=float(np.mean(cover)))

print('naive last value MAE:',
      round(np.abs(y.diff().dropna()).mean(), 3))
print('SARIMA(1,1,1)(1,0,0,7):', backtest(y, (1,1,1), (1,0,0,7)))`),
      ul(['Establish a seasonal-naive baseline (last week same weekday) before any model; a surprising share of business series are not beaten by ARIMA on a short horizon.',
          'Backtest with rolling origins and report MAE/RMSE plus interval coverage. A model whose 80% interval covers the truth 55% of the time is dangerous even with a good point score.',
          'Check that the residual series looks like noise: no remaining autocorrelation (Ljung-Box), no heteroskedasticity, no leftover seasonality. Residual structure is free forecast you left on the table.',
          'Interventions matter: a launch, a lockdown or a pricing change is a level shift or a ramp, and a model fitted across it will smear the change into every forecast. Add a regressor or fit after the break.',
          'Aggregation changes the problem. Daily data are noisy and seasonal; weekly data are calmer but shorter. Choose the granularity of the decision, not of the database.'],
          ['پیش از هر مدلی یک مبنای فصلیِ ساده‌لوحانه برقرار کنید (هفته‌ی قبل، همان روزِ هفته)؛ بخشِ شگفت‌آوری از سری‌های کسب‌وکاری در افقِ کوتاه توسطِ آریما شکست نمی‌خورند.',
           'با مبدأهای غلتان پس‌آزمایی کنید و MAE/RMSE را همراه با پوششِ بازه گزارش کنید. مدلی که بازه‌ی ۸۰٪‌اش حقیقت را ۵۵٪ وقت پوشش می‌دهد، حتی با امتیازِ نقطه‌ایِ خوب، خطرناک است.',
           'بررسی کنید سریِ باقی‌مانده شبیهِ نویز باشد: بدون خودهمبستگیِ باقی‌مانده (لانگ-باکس)، بدون ناهمسانیِ واریانس، بدون فصلیتِ باقی‌مانده. ساختارِ درونِ باقی‌مانده پیش‌بینیِ رایگانی است که روی میز جا گذاشته‌اید.',
           'مداخله‌ها مهم‌اند: یک عرضه، یک تعطیلیِ سراسری یا یک تغییرِ قیمت، یک جابه‌جاییِ سطح یا یک شیب است و مدلی که در دو سوی آن برازش شود، تغییر را در همه‌ی پیش‌بینی‌ها پخش می‌کند. یک رگرسور بیفزایید یا پس از گسست برازش کنید.',
           'تجمیع مسئله را عوض می‌کند. داده‌ی روزانه پُرنویز و فصلی است؛ داده‌ی هفتگی آرام‌تر اما کوتاه‌تر است. دانه‌درشتیِ تصمیم را انتخاب کنید، نه دانه‌درشتیِ پایگاهِ داده.']),
      note('Prediction intervals from a fitted model assume the model is right and the future resembles the past. For planning, widen them and scenario-test: "if the level shifts by 15% in March, does the inventory policy still hold?"',
           'بازه‌های پیش‌بینی از یک مدلِ برازش‌یافته فرض می‌کنند مدل درست است و آینده شبیهِ گذشته. برای برنامه‌ریزی آن‌ها را گشاد کنید و سناریو بیازمایید: «اگر سطح در مارس ۱۵٪ جابه‌جا شود، آیا سیاستِ موجودی هنوز پابرجاست؟»')
    ],
    ['time-series', 'arima', 'stationarity', 'forecasting', 'backtesting', 'seasonality'],
    [R('Forecasting: Principles and Practice (Hyndman & Athanasopoulos)', 'https://otexts.com/fpp3/', 'book'),
     R('statsmodels time series analysis', 'https://www.statsmodels.org/stable/tsa.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-020', D, 'advanced', 17,
    ['Multivariate Methods: Distance, MANOVA, LDA and CCA', 'روش‌های چندمتغیره: فاصله، مانوا، LDA و CCA'],
    ['When the outcome — or the question — involves several variables at once, testing them one at a time inflates error and misses structure. Mahalanobis distance, MANOVA, LDA and canonical correlation handle the joint geometry.',
     'وقتی خروجی — یا پرسش — شاملِ چند متغیر به‌طور همزمان است، آزمودنِ آن‌ها یکی‌یکی خطا را باد می‌کند و ساختار را از دست می‌دهد. فاصله‌ی ماهالانوبیس، مانوا، LDA و همبستگیِ کانونی با هندسه‌ی مشترک کار می‌کنند.'],
    [
      def('Multivariate methods work with the covariance structure instead of pretending variables are independent. Mahalanobis distance measures how far a point is from a centre in units of the covariance — the right way to say "this row is unusual" when variables are correlated. MANOVA tests whether group centroids differ along any linear combination. LDA finds the combinations that best separate known groups. CCA finds the pairs of linear combinations of two variable sets that are most correlated with each other.',
          'روش‌های چندمتغیره با ساختارِ کوواریانس کار می‌کنند به‌جای وانمود کردن به استقلالِ متغیرها. فاصله‌ی ماهالانوبیس می‌سنجد یک نقطه در واحدهای کوواریانس چقدر از مرکز دور است — راهِ درستِ گفتنِ «این سطر غیرعادی است» وقتی متغیرها همبسته‌اند. مانوا می‌آزماید آیا مراکزِ گروه‌ها در امتدادِ ترکیبی خطی تفاوت دارند. LDA ترکیب‌هایی را می‌یابد که گروه‌های معلوم را بهترین جداسازی می‌کنند. CCA جفت‌ترکیب‌های خطیِ دو دسته متغیر را می‌یابد که بیشترین همبستگی را با هم دارند.'),
      math('Mahalanobis:   D^2(x) = (x - mu)^T Sigma^{-1} (x - mu)\n  for normal data, D^2 ~ chi-square(p);  large D^2 = multivariate outlier\n  (correlation-aware: a point can be unusual though each coordinate is typical)\n\nHotelling T^2 (one/two sample):  multivariate t-test\n  T^2 = n (x_bar - mu)^T S^{-1} (x_bar - mu)  ->  F distribution\n\nMANOVA:  compares between-group to within-group covariance matrices\n  Wilks Lambda = |E| / |E + H|      (small -> groups differ)\n  also Pillai trace, Roy root, Lawley-Hotelling\n\nLDA:  maximise  (between-class scatter)^{-1} (within-class scatter)\n  discriminant scores = linear combinations;  dim <= k - 1 classes\n\nCCA:  find a, b maximising Corr(a^T X, b^T Y)\n  canonical correlations = sqrt(eigenvalues of Sxx^{-1} Sxy Syy^{-1} Syx)\n\nCovariance shrinkage:  Sigma_hat = (1-lambda) S + lambda * (trace(S)/p) I'),
      code(`import numpy as np
from scipy import stats
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.cross_decomposition import CCA
from sklearn.covariance import LedoitWolf, MinCovDet

rng = np.random.default_rng(17)

# --- Mahalanobis outliers: none of the coordinates looks extreme alone
mu = np.array([0., 0.]); Sig = np.array([[1., 0.9], [0.9, 1.]])
X = rng.multivariate_normal(mu, Sig, 500)
sinv = np.linalg.inv(np.cov(X.T))
d2 = np.einsum('ij,jk,ik->i', X - mu, sinv, X - mu)
print('max D^2 =', round(d2.max(), 2), '| chi2 0.999 threshold =',
      round(stats.chi2.ppf(0.999, 2), 2))
print('flagged rows:', int((d2 > stats.chi2.ppf(0.999, 2)).sum()),
      '| univariate |z| > 3 flags:',
      int((np.abs(X - X.mean(0)) / X.std(0) > 3).any(1).sum()))

# --- MANOVA via regression (Wilks Lambda) and LDA for interpretation
from statsmodels.multivariate.manova import MANOVA
y1 = rng.normal(0, 1, 90); y2 = 0.5 * y1 + rng.normal(0, 1, 90)
grp = np.repeat(['a', 'b', 'c'], 30)
grp[:30] = 'a'; y1[:30] += 0.8; y2[:30] -= 0.4                 # shift group a
df = {'y1': y1, 'y2': y2, 'g': grp}
print(MANOVA.from_formula('y1 + y2 ~ g', data=df).mv_test().summary_frame.loc[
      'Wilks\' lambda', 'Pr > F'])

lda = LinearDiscriminantAnalysis().fit(np.column_stack([y1, y2]), grp)
print('LDA explained variance ratio:', lda.explained_variance_ratio_.round(3))

# --- CCA: which linear combos of features and outcomes move together
A = rng.normal(size=(300, 4)); B = A[:, :2] @ np.array([[1., .5], [0, 1.]]) + rng.normal(0, .3, (300, 2))
cca = CCA(n_components=2).fit(A, B)
U, V = cca.transform(A, B)
print('canonical correlations:',
      [round(np.corrcoef(U[:, i], V[:, i])[0, 1], 3) for i in range(2)])

# --- Covariance estimation when p is not tiny relative to n
p, n = 60, 120
S = rng.normal(size=(n, p))
lw = LedoitWolf().fit(S)
print('Ledoit-Wolf shrinkage lambda =', round(lw.shrinkage_, 3))
print('robust (MCD) det ratio vs MLE:',
      round(np.linalg.det(MinCovDet(random_state=0).fit(S).covariance_) /
            np.linalg.det(np.cov(S.T)), 6))`),
      ul(['Test the joint hypothesis once, then interpret with the discriminant or canonical directions. Running p univariate tests and reporting the smallest p-value is a multiple-testing problem in disguise.',
          'Mahalanobis distance needs a good covariance estimate. With p approaching n, shrink it (Ledoit-Wolf) or use a robust estimator (MCD); the sample covariance is then nearly singular and distances are meaningless.',
          'MANOVA assumes multivariate normality and similar covariance matrices across groups; when the second fails, use a robust variant or a permutation test on the distance between centroids.',
          'LDA is a classifier, but it is also a dimension-reduction view: plot the first two discriminant scores and you can see which groups are separable and which are not.',
          'CCA is symmetric and scale-sensitive; standardise first and cross-validate the canonical correlations, because in-sample ones are optimistically large when p is large.'],
          ['فرضِ مشترک را یک‌بار بیازمایید، سپس با جهت‌های متمایزساز یا کانونی تفسیر کنید. اجرای p آزمونِ تک‌متغیره و گزارشِ کوچک‌ترین مقدارِ p یک مسئله‌ی آزمونِ چندگانه در لباسِ مبدّل است.',
           'فاصله‌ی ماهالانوبیس به یک برآوردِ خوب از کوواریانس نیاز دارد. وقتی p به n نزدیک می‌شود آن را منقبض کنید (لدوا-ولف) یا از یک برآوردگرِ مقاوم (MCD) استفاده کنید؛ کوواریانسِ نمونه‌ای در آن حالت تقریباً تکین است و فاصله‌ها بی‌معنایند.',
           'مانوا نرمال‌بودنِ چندمتغیره و ماتریس‌های کوواریانسِ مشابه بین گروه‌ها را فرض می‌کند؛ وقتی دومی برقرار نیست، از یک نسخه‌ی مقاوم یا یک آزمونِ جایگشت روی فاصله‌ی بینِ مراکز استفاده کنید.',
           'LDA یک طبقه‌بند است، اما یک نگاهِ کاهشِ بعد هم هست: دو امتیازِ متمایزسازِ نخست را رسم کنید و می‌بینید کدام گروه‌ها جداشدنی‌اند و کدام نه.',
           'CCA متقارن و حساس به مقیاس است؛ نخست استاندارد کنید و همبستگی‌های کانونی را اعتبارسنجیِ متقاطع کنید، چون مقادیرِ درون‌نمونه‌ای وقتی p بزرگ است خوش‌بینانه بزرگ‌اند.']),
      note('A univariate test on each variable answers p different questions. If the scientific question is "do these profiles differ at all?", that is one question and MANOVA or a permutation test on distance is the tool that matches it.',
           'یک آزمونِ تک‌متغیره روی هر متغیر به p پرسشِ متفاوت پاسخ می‌دهد. اگر پرسشِ علمی این است که «آیا این نیمرخ‌ها اصلاً فرق دارند؟»، این یک پرسش است و مانوا یا یک آزمونِ جایگشت روی فاصله ابزاری است که با آن جور درمی‌آید.')
    ],
    ['multivariate', 'mahalanobis', 'manova', 'lda', 'cca', 'outlier-detection'],
    [R('Applied Multivariate Statistical Analysis (Johnson & Wichern)', 'https://www.pearson.com/en-us/subject-catalog/p/applied-multivariate-statistical-analysis/P200000003298', 'book'),
     R('scikit-learn covariance estimation', 'https://scikit-learn.org/stable/modules/covariance.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-021', D, 'intermediate', 15,
    ['Smoothing: KDE, Splines, LOESS and GAMs', 'هموارسازی: KDE، اسپلاین‌ها، لوئس و GAMها'],
    ['Between a straight line and a black box there is a well-understood middle: smoothers. They let the data choose the shape while you keep control of how wiggly the shape is allowed to be.',
     'میانِ یک خطِ راست و یک جعبه‌ی سیاه، یک میانه‌ی خوب‌فهمیده‌شده وجود دارد: هموارسازها. آن‌ها می‌گذارند داده شکل را انتخاب کند در حالی که شما کنترلِ میزانِ موج‌دار بودنِ مجاز را نگه می‌دارید.'],
    [
      def('A smoother estimates a function without claiming a fixed parametric form. Kernels estimate a density; LOESS fits local lines; splines are piecewise polynomials joined smoothly at knots; a GAM is a regression whose predictors each enter through their own smooth function, keeping additivity (and interpretability) while allowing curvature. The single tuning knob in every case is the amount of smoothing, chosen by cross-validation or an information criterion.',
          'یک هموارساز تابعی را برآورد می‌کند بی‌آنکه ادعای یک شکلِ پارامتریِ ثابت کند. هسته‌ها یک چگالی را برآورد می‌کنند؛ لوئس خطوطِ محلی برازش می‌کند؛ اسپلاین‌ها چندجمله‌ای‌های تکه‌ای‌اند که در گره‌ها به‌نرمی به هم می‌رسند؛ یک GAM رگرسیونی است که هر پیش‌بینش از راهِ تابعِ هموارِ خودش وارد می‌شود و جمع‌پذیری (و تفسیرپذیری) را نگه می‌دارد در حالی که انحنا را مجاز می‌کند. تک‌دسته‌گیر در همه‌ی این موارد مقدارِ هموارسازی است که با اعتبارسنجیِ متقاطع یا یک معیارِ اطلاعاتی انتخاب می‌شود.'),
      math('KDE:   f_hat(x) = (1/(n h)) SUM K((x - x_i)/h)\n  bandwidth h: too small -> spiky, too large -> flat\n  Silverman rule:  h = 1.06 * sigma * n^{-1/5}     (normal-ish data)\n  MISE-optimal h ~ n^{-1/5};  bandwidth choice matters more than the kernel\n\nLOESS:  weighted local regression around each x, span = fraction of neighbours\n\nRegression spline:  y = SUM_{j=0..d} b_j x^j  +  SUM_{k=1..K} b_{d+k} (x - t_k)_+^d\n  (x - t)_+^d = (x - t)^d if x > t else 0;   K knots, degree d (cubic: d = 3)\n  natural spline: linear beyond the boundary knots (stable in the tails)\n\nGAM:   g(E[y]) = beta_0 + f_1(x_1) + f_2(x_2) + ... + f_p(x_p)\n  smoothing penalty:  lambda * INTEGRAL (f\'\'(x))^2 dx   (wiggliness)\n  effective df (edf) = 1 -> a straight line;  higher -> more curvature'),
      code(`import numpy as np, pandas as pd
from sklearn.neighbors import KernelDensity
from sklearn.model_selection import GridSearchCV, KFold
from sklearn.linear_model import LinearRegression
from pygam import LinearGAM, s, f
import matplotlib.pyplot as plt

rng = np.random.default_rng(31)
n = 800
x1 = rng.uniform(0, 10, n); x2 = rng.uniform(-2, 2, n)
y = 2.5 + 3.1 * np.sin(x1) - 0.4 * x1 + 0.8 * x2**2 + rng.normal(0, 0.6, n)

# --- KDE with a bandwidth chosen by cross-validation
samp = rng.lognormal(1.0, 0.8, 1500).reshape(-1, 1)
grid = np.exp(np.linspace(-0.5, 4.5, 200)).reshape(-1, 1)
kde = GridSearchCV(KernelDensity(kernel='gaussian'),
                   {'bandwidth': np.linspace(0.05, 1.2, 40)},
                   cv=KFold(5)).fit(samp)
print('CV bandwidth =', round(kde.best_params_['bandwidth'], 3),
      '| Silverman =', round(1.06 * samp.std() * len(samp) ** -0.2, 3))

# --- Truncated-power spline basis in a few lines
def spline_basis(x, knots, degree=3):
    return np.column_stack([x ** j for j in range(degree + 1)] +
                           [np.maximum(x - t, 0) ** degree for t in knots])

knots = np.quantile(x1, np.linspace(0.1, 0.9, 6))
Xs = spline_basis(x1, knots)
print('spline R^2 =', round(LinearRegression().fit(Xs, y).score(Xs, y), 3),
      '| linear R^2 =', round(LinearRegression().fit(x1.reshape(-1, 1), y).score(x1.reshape(-1, 1), y), 3))

# --- GAM: additive smooths, interpretable curvature
gam = LinearGAM(s(0, n_splines=20) + s(1)).fit(np.column_stack([x1, x2]), y)
print(gam.summary())
for i, edf in enumerate(gam.statistics_['edof']):
    print(f'term {i}: effective df = {edf:.2f}')
gam.partial_dependence(term=0)      # plot: the shape the data chose`),
      ul(['Choose the smoothing parameter by cross-validation (or GCV/REML for GAMs); eyeballing is fine for exploration and indefensible for a reported estimate.',
          'Splines are unstable in the tails. Use natural or penalised splines when you need predictions near the edges of the data range.',
          'A GAM is the right default when you want a flexible but explainable model: each term has a plot and an effective degrees of freedom you can show a stakeholder.',
          'Density estimates need the right support. KDE on a positive, skewed variable leaks mass below zero — estimate on the log scale and transform back.',
          'Smoothing is not extrapolation. Outside the range of the data, every smoother reverts to its boundary behaviour, and no amount of tuning changes that.'],
          ['پارامترِ هموارسازی را با اعتبارسنجیِ متقاطع انتخاب کنید (یا GCV/REML برای GAMها)؛ نگاه‌کردن با چشم برای کاوش خوب است و برای یک برآوردِ گزارش‌شده غیرقابل‌دفاع.',
           'اسپلاین‌ها در دم‌ها ناپایدارند. وقتی به پیش‌بینی در نزدیکیِ لبه‌های بازه‌ی داده نیاز دارید از اسپلاین‌های طبیعی یا جریمه‌شده استفاده کنید.',
           'یک GAM پیش‌فرضِ درستی است وقتی مدلی منعطف اما توضیح‌پذیر می‌خواهید: هر جمله یک نمودار و یک درجه‌ی آزادیِ مؤثر دارد که می‌توانید به ذی‌نفع نشان دهید.',
           'برآوردهای چگالی به پشتیبانِ درست نیاز دارند. KDE روی یک متغیرِ مثبتِ چوله، جرم را به زیرِ صفر نشت می‌دهد — در مقیاسِ لگاریتم برآورد کنید و بازگردانید.',
           'هموارسازی برون‌یابی نیست. بیرون از بازه‌ی داده، هر هموارسازی به رفتارِ مرزی‌اش برمی‌گردد و هیچ مقدارِ تنظیمی این را عوض نمی‌کند.']),
      note('Effective degrees of freedom is the number to quote. "I fitted a spline" says nothing; "the smooth used 4.2 effective degrees of freedom" tells the reader whether the wiggle is a real feature or noise you let through.',
           'درجه‌ی آزادیِ مؤثر همان عددی است که باید نقل کنید. «یک اسپلاین برازش دادم» چیزی نمی‌گوید؛ «تابعِ هموار ۴.۲ درجه‌ی آزادیِ مؤثر استفاده کرد» به خواننده می‌گوید آن موج یک ویژگیِ واقعی است یا نویزی که از صافی گذشته.')
    ],
    ['smoothing', 'kde', 'splines', 'gam', 'loess', 'nonparametric-regression'],
    [R('Generalized Additive Models (Wood)', 'https://doi.org/10.1201/9781315370279', 'book'),
     R('pyGAM documentation', 'https://pygam.readthedocs.io/en/latest/', 'doc')]
  );


  /* ------------------------------------------------------------------ */
  L('stat-022', D, 'intermediate', 15,
    ['Comparing Models: LRT, Wald, Score, AIC and Cross-Validation', 'مقایسه‌ی مدل‌ها: LRT، والد، اسکور، AIC و اعتبارسنجیِ متقاطع'],
    ['"Which model is better?" has three precise versions: does a nested term belong in the model (a hypothesis test), which model predicts better out of sample (cross-validation), and which model is closer to the truth per parameter spent (information criteria). They answer different questions and can disagree.',
     '«کدام مدل بهتر است؟» سه صورتِ دقیق دارد: آیا یک جمله‌ی تودرتو به مدل تعلق دارد (یک آزمونِ فرض)، کدام مدل بیرون از نمونه بهتر پیش‌بینی می‌کند (اعتبارسنجیِ متقاطع)، و کدام مدل به‌ازای هر پارامترِ مصرف‌شده به حقیقت نزدیک‌تر است (معیارهای اطلاعاتی). آن‌ها به پرسش‌های متفاوتی پاسخ می‌دهند و می‌توانند با هم توافق نداشته باشند.'],
    [
      def('The three classical tests all target the same null but look at the likelihood from different angles: the Wald test measures how far the estimate is from the null in standard errors; the score (Lagrange multiplier) test measures the slope of the log-likelihood at the null value; the likelihood-ratio test compares the maximum log-likelihoods directly. Information criteria (AIC, BIC) trade fit against complexity, and cross-validation estimates out-of-sample performance without assuming either model is true.',
          'هر سه آزمونِ کلاسیک یک فرضِ صفر را هدف می‌گیرند اما درست‌نمایی را از زاویه‌های متفاوت می‌بینند: آزمونِ والد می‌سنجد برآورد در واحدِ خطای معیار چقدر از فرضِ صفر دور است؛ آزمونِ اسکور (ضرب‌گرِ لاگرانژ) شیبِ لگاریتمِ درست‌نمایی را در مقدارِ فرضِ صفر می‌سنجد؛ آزمونِ نسبتِ درست‌نمایی مستقیماً بیشینه‌های لگاریتمِ درست‌نمایی را مقایسه می‌کند. معیارهای اطلاعاتی (AIC، BIC) برازش را با پیچیدگی معاوضه می‌کنند و اعتبارسنجیِ متقاطع عملکردِ بیرون‌از-نمونه را برآورد می‌کند بی‌آنکه فرض کند یکی از مدل‌ها درست است.'),
      math('Let l(beta) = log-likelihood, beta_hat = MLE, beta_0 = the null value.\n\nWald:    W = (beta_hat - beta_0)^2 / Var(beta_hat)          ~ chi-square(q)\nScore:   U = [dl/dbeta | beta_0]^2 / I(beta_0)              ~ chi-square(q)\nLRT:     LR = 2 [ l(beta_hat_full) - l(beta_hat_reduced) ]   ~ chi-square(q)\n  (q = number of restricted parameters; requires nested models + regularity)\n\nAIC = -2 l + 2k          (k = parameters)   -> predictive accuracy\nBIC = -2 l + k ln(n)                         -> probability the model is true\n  BIC penalises complexity harder;  delta AIC > 2 is worth noticing,\n  > 10 is strong;  AIC weights:  w_i ~ exp(-(AIC_i - AIC_min)/2)\n\nCross-validation:  K-fold CV error estimates out-of-sample risk\n  LOOCV ~ AIC asymptotically;  10-fold CV is the practical default\n  time series -> blocked / rolling-origin CV, never random K-fold'),
      code(`import numpy as np, pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf
from sklearn.model_selection import KFold, cross_val_score
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(77)
n = 600
x1 = rng.normal(0, 1, n); x2 = rng.normal(0, 1, n); x3 = rng.normal(0, 1, n)
y = 3 + 1.5 * x1 + 0.0 * x2 + 0.4 * x3 + rng.normal(0, 1, n)
df = pd.DataFrame({'y': y, 'x1': x1, 'x2': x2, 'x3': x3})

full = smf.ols('y ~ x1 + x2 + x3', data=df).fit()
red  = smf.ols('y ~ x1 + x3', data=df).fit()

# Likelihood-ratio test (nested, Gaussian -> also an F test)
lr = 2 * (full.llf - red.llf)
from scipy import stats
print(f'LRT = {lr:.3f}  df = 1  p = {stats.chi2.sf(lr, 1):.4f}')
print('F-test on x2 alone      :', full.f_test('x2 = 0').pvalue.round(4))
print('Wald test on x2         :', full.t_test('x2 = 0').pvalue.round(4))
print(full.compare_f_test(red))          # (F, p, df diff)

# Information criteria
for name, m in [('full', full), ('reduced', red)]:
    print(f'{name:8s}  AIC = {m.aic:8.2f}   BIC = {m.bic:8.2f}   adjR2 = {m.rsquared_adj:.4f}')

# Cross-validation: does the extra term help out of sample?
X = df[['x1', 'x2', 'x3']]
def cv_rmse(cols):
    return -cross_val_score(LinearRegression(), X[cols], y, cv=KFold(10, shuffle=True, random_state=0),
                            scoring='neg_root_mean_squared_error').mean()
print('CV RMSE  [x1,x3]   :', round(cv_rmse(['x1', 'x3']), 4))
print('CV RMSE  [x1,x2,x3]:', round(cv_rmse(['x1', 'x2', 'x3']), 4))`),
      ul(['LRT requires nested models fitted to the same rows on the same outcome. Different datasets, different transformations or a different link break the comparison.',
          'AIC selects for prediction; BIC for explanation. With a large n they diverge, and reporting both is more informative than choosing one in advance.',
          'Differences smaller than about 2 AIC units are not evidence. Rank the models, look at the weights, and say when the top two are indistinguishable.',
          'For prediction, cross-validation is the arbiter and it must mimic the deployment: grouped splits for clustered data, blocked splits for time series, and the same preprocessing inside each fold.',
          'Model selection invalidates the naive standard errors of the winner. If you selected the model using the data, hold out a set or use selective-inference methods before quoting p-values.'],
          ['LRT به مدل‌های تودرتو نیاز دارد که روی سطرهای یکسان و خروجیِ یکسان برازش شده باشند. مجموعه‌داده‌های متفاوت، تبدیل‌های متفاوت یا پیوندِ متفاوت مقایسه را می‌شکنند.',
           'AIC برای پیش‌بینی انتخاب می‌کند؛ BIC برای تبیین. با n بزرگ این دو از هم جدا می‌شوند و گزارشِ هر دو آموزنده‌تر از انتخابِ یکی از پیش است.',
           'اختلاف‌های کوچک‌تر از حدودِ ۲ واحدِ AIC مدرک نیستند. مدل‌ها را رتبه‌بندی کنید، وزن‌ها را نگاه کنید و بگویید چه وقت دو مدلِ برتر از هم تشخیص‌ناپذیرند.',
           'برای پیش‌بینی، اعتبارسنجیِ متقاطع داور است و باید استقرار را تقلید کند: تقسیم‌های گروه‌بندی‌شده برای داده‌ی خوشه‌ای، تقسیم‌های بلوکی برای سری‌های زمانی، و همان پیش‌پردازش درونِ هر لایه.',
           'انتخابِ مدل، خطاهای معیارِ ساده‌لوحانه‌ی برنده را بی‌اعتبار می‌کند. اگر مدل را با استفاده از داده انتخاب کرده‌اید، پیش از نقلِ مقادیرِ p یک مجموعه کنار بگذارید یا از روش‌های استنتاجِ انتخابی استفاده کنید.']),
      note('Posterior predictive checks are the Bayesian cousin of this idea: simulate data from the fitted model and compare the simulations to the real data on the quantities you care about. A model can win on AIC and still never produce a distribution as skewed as the one you observed.',
           'بررسی‌های پیش‌بینِ پسین پسرعموی بیزیِ همین ایده است: از مدلِ برازش‌یافته داده شبیه‌سازی کنید و شبیه‌سازی‌ها را با داده‌ی واقعی روی کمیت‌هایی که برای‌تان مهم است مقایسه کنید. یک مدل می‌تواند در AIC ببرد و هرگز توزیعی به چولگیِ چیزی که مشاهده کرده‌اید تولید نکند.')
    ],
    ['likelihood-ratio', 'aic', 'bic', 'cross-validation', 'model-selection', 'wald'],
    [R('Model Selection and Multimodel Inference (Burnham & Anderson)', 'https://link.springer.com/book/10.1007/b97636', 'book'),
     R('scikit-learn cross-validation', 'https://scikit-learn.org/stable/modules/cross_validation.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-023', D, 'advanced', 15,
    ['Robust Statistics and Quantile Regression', 'آمارِ مقاوم و رگرسیونِ چارکی'],
    ['A single extreme value can move a mean and flip a conclusion. Robust methods ask how much contamination an estimator tolerates and model the median or any quantile instead of the mean, which is often the quantity a decision actually depends on.',
     'یک مقدارِ فرینِ یگانه می‌تواند میانگین را جابه‌جا کند و یک نتیجه را برگرداند. روش‌های مقاوم می‌پرسند یک برآوردگر چقدر آلودگی را تاب می‌آورد و به‌جای میانگین، میانه یا هر چارکی را مدل می‌کنند — که معمولاً همان کمیتی است که یک تصمیم واقعاً به آن وابسته است.'],
    [
      def('Robustness is measured by the breakdown point: the fraction of contaminated observations an estimator can absorb before it produces arbitrarily wrong values. The mean and the OLS estimator have a breakdown point of 0; the median has 50%; Huber M-estimators trade a little efficiency under clean normal data for bounded influence from outliers. Quantile regression extends this to modelling: instead of E[y|x], it models the conditional tau-quantile, which is also how you get sensible prediction intervals without assuming a shape.',
          'مقاومت با نقطه‌ی شکست سنجیده می‌شود: کسرِ مشاهده‌های آلوده‌ای که یک برآوردگر می‌تواند جذب کند پیش از آنکه مقادیرِ بی‌نهایت غلط تولید کند. میانگین و برآوردگرِ OLS نقطه‌ی شکستِ ۰ دارند؛ میانه ۵۰٪؛ برآوردگرهای Mِ هیوبر اندکی کارایی در داده‌ی نرمالِ تمیز را با نفوذِ کران‌دارِ دورافتاده‌ها معاوضه می‌کنند. رگرسیونِ چارکی این را به مدل‌سازی می‌گسترد: به‌جای E[y|x]، چارکِ شرطیِ tau را مدل می‌کند، که همچنین راهی است برای گرفتنِ بازه‌های پیش‌بینیِ معقول بدون فرضِ یک شکل.'),
      math('breakdown point:   mean = 0       median = 50%      MAD = 50%\n                   OLS  = 0       LTS/LMS up to 50%      trimmed mean = alpha\n\nM-estimator:  minimise SUM rho((y_i - x_i beta) / s)\n  rho(r) = r^2/2                        OLS\n  rho(r) = |r|                          LAD / median regression\n  Huber:  r^2/2 if |r| <= k, else k|r| - k^2/2    (k = 1.345 -> 95% efficiency)\n  influence function psi = rho\' is bounded -> one point cannot dominate\n\nQuantile regression:  minimise SUM rho_tau(y_i - x_i beta),\n  rho_tau(u) = u (tau - 1[u < 0])\n  tau = 0.5 -> median regression (LAD)\n  -> a full conditional distribution if you fit many tau\n  -> heteroskedasticity becomes visible: coefficient varies with tau\n\nRobust scale:  MAD = median(|x - median(x)|),  sigma_hat = 1.4826 * MAD'),
      code(`import numpy as np, pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf

rng = np.random.default_rng(23)
n = 500
x = rng.normal(0, 1, n)
y = 2 + 1.5 * x + rng.normal(0, 1, n)
y[:10] += 60                                     # 2% contamination

ols = smf.ols('y ~ x', data=pd.DataFrame({'y': y, 'x': x})).fit()
rlm = smf.rlm('y ~ x', data=pd.DataFrame({'y': y, 'x': x}),
              M=sm.robust.norms.HuberT()).fit()
print('OLS  slope:', round(ols.params['x'], 3), '| robust slope:', round(rlm.params['x'], 3))
print('true slope: 1.5')

# Robust scale and a robust z-score for anomaly flags
v = np.concatenate([rng.normal(0, 1, 1000), [40, -35]])
mad = np.median(np.abs(v - np.median(v)))
print('sd =', round(v.std(ddof=1), 2), '| 1.4826*MAD =', round(1.4826 * mad, 2))

# Quantile regression: the effect differs across the distribution
n2 = 3000
inc = rng.uniform(10, 100, n2)
spend = 50 + 0.8 * inc + rng.normal(0, 3 + 0.25 * inc, n2)   # spread grows with income
d2 = pd.DataFrame({'spend': spend, 'inc': inc})
for tau in (0.10, 0.50, 0.90):
    q = smf.quantreg('spend ~ inc', data=d2).fit(q=tau)
    print(f'tau={tau:.2f}  intercept={q.params["Intercept"]:7.2f}  slope={q.params["inc"]:.3f}')

# Prediction interval straight from two quantiles, no normality assumed
lo = smf.quantreg('spend ~ inc', data=d2).fit(q=0.10)
hi = smf.quantreg('spend ~ inc', data=d2).fit(q=0.90)
new = pd.DataFrame({'inc': [45.0]})
print('80% interval at income 45:',
      [round(float(lo.predict(new)), 1), round(float(hi.predict(new)), 1)])

# Trimmed mean: robustness with one line and no machinery
print('mean =', round(y.mean(), 2), '| 5% trimmed =',
      round(pd.Series(y).sort_values().iloc[int(.05*len(y)):int(.95*len(y))].mean(), 2))`),
      ul(['Run the analysis with and without robust estimators. When they agree, say so and move on; when they disagree, the outliers are the story and deserve their own paragraph.',
          'Robust methods are not a licence to delete inconvenient data. They are a way to keep every row while preventing a handful from dictating the answer.',
          'Quantile regression is the natural tool when the effect itself varies across the outcome distribution (a policy that matters for heavy users but not light ones) and when you need intervals without a distributional assumption.',
          'Standard errors for quantile regression come from bootstrapping by default; report enough resamples (a few thousand) and quote the interval, not just the point.',
          'With very heavy tails even the median can be unstable in small samples; consider trimmed means, winsorising with a stated rule, or modelling the tail explicitly with extreme-value methods.'],
          ['تحلیل را با و بدونِ برآوردگرهای مقاوم اجرا کنید. وقتی توافق دارند، همین را بگویید و بروید سراغِ بعدی؛ وقتی توافق ندارند، دورافتاده‌ها خودِ داستان‌اند و پاراگرافِ خود را می‌خواهند.',
           'روش‌های مقاوم مجوزی برای حذفِ داده‌ی ناخوشایند نیستند. راهی‌اند برای نگه داشتنِ هر سطر در حالی که مشتی از آن‌ها نمی‌توانند پاسخ را دیکته کنند.',
           'رگرسیونِ چارکی ابزارِ طبیعی است وقتی خودِ اثر در سراسرِ توزیعِ خروجی تغییر می‌کند (سیاستی که برای کاربرانِ سنگین مهم است و برای سبک‌ها نه) و وقتی به بازه‌هایی بدون فرضِ توزیعی نیاز دارید.',
           'خطاهای معیار برای رگرسیونِ چارکی به‌طور پیش‌فرض از بوت‌استرپ می‌آیند؛ به تعدادِ کافی بازنمونه (چند هزار) گزارش کنید و بازه را نقل کنید، نه فقط نقطه را.',
           'با دم‌های بسیار سنگین حتی میانه در نمونه‌های کوچک می‌تواند ناپایدار باشد؛ میانگین‌های هرس‌شده، وینزوریزه کردن با یک قاعده‌ی اعلام‌شده، یا مدل‌سازیِ صریحِ دم با روش‌های مقادیرِ فرین را در نظر بگیرید.']),
      note('Robust does not mean assumption-free. An M-estimator still assumes a model for the bulk of the data; it just refuses to let the tails rewrite it. State the tuning constant (Huber k, trimming fraction) so the result is reproducible.',
           'مقاوم به‌معنای بی‌فرض نیست. یک برآوردگرِ M هنوز برای توده‌ی داده یک مدل فرض می‌کند؛ فقط نمی‌گذارد دم‌ها آن را بازنویسی کنند. ثابتِ تنظیم (kِ هیوبر، کسرِ هرس) را اعلام کنید تا نتیجه بازتولیدپذیر باشد.')
    ],
    ['robust', 'quantile-regression', 'outliers', 'm-estimators', 'mad', 'breakdown-point'],
    [R('Robust Statistics (Huber & Ronchetti)', 'https://doi.org/10.1002/9781118186435', 'book'),
     R('statsmodels robust models', 'https://www.statsmodels.org/stable/rlm.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-024', D, 'advanced', 16,
    ['Survey Sampling, Weighting and Missing Data', 'نمونه‌گیریِ پیمایشی، وزن‌دهی و داده‌ی گمشده'],
    ['Most real datasets are neither a random sample nor complete. Survey design tells you what a sample can support, weighting repairs a known mismatch with the population, and missing-data methods tell you honestly how much of your answer is assumption.',
     'بیشترِ مجموعه‌داده‌های واقعی نه یک نمونه‌ی تصادفی‌اند و نه کامل. طراحیِ پیمایش می‌گوید یک نمونه چه چیزی را می‌تواند پشتیبانی کند، وزن‌دهی یک ناهمخوانیِ معلوم با جامعه را ترمیم می‌کند، و روش‌های داده‌ی گمشده صادقانه می‌گویند چه بخشِ پاسخِ شما فرض است.'],
    [
      def('Three sampling designs cover most practice: simple random sampling (every unit equally likely), stratified sampling (sample within known groups, usually to reduce variance), and cluster sampling (sample groups, then units — cheaper per unit, more variance per unit). Weights are the inverse of the selection probability, and they let a non-representative sample estimate a population quantity — provided you account for the design when computing uncertainty. Missingness has three mechanisms: MCAR (independent of everything), MAR (explained by observed data), and MNAR (depends on the missing value itself).',
          'سه طرحِ نمونه‌گیری بیشترِ عمل را می‌پوشاند: نمونه‌گیریِ تصادفیِ ساده (هر واحد به‌طور برابر محتمل)، نمونه‌گیریِ طبقه‌ای (نمونه‌گیری درونِ گروه‌های معلوم، معمولاً برای کاهشِ واریانس)، و نمونه‌گیریِ خوشه‌ای (نمونه‌گیریِ گروه‌ها، سپس واحدها — ارزان‌تر به‌ازای هر واحد، واریانسِ بیشتر به‌ازای هر واحد). وزن‌ها وارونِ احتمالِ انتخاب‌اند و به یک نمونه‌ی غیرنماینده اجازه می‌دهند یک کمیتِ جامعه را برآورد کند — به شرطی که هنگامِ محاسبه‌ی عدم‌قطعیت، طرح را لحاظ کنید. گم‌شدگی سه سازوکار دارد: MCAR (مستقل از هر چیز)، MAR (تبیین‌شده با داده‌ی مشاهده‌شده)، و MNAR (وابسته به خودِ مقدارِ گمشده).'),
      math('Horvitz-Thompson estimator:  theta_hat = SUM_{i in sample} w_i y_i ,\n  w_i = 1 / pi_i   (pi_i = inclusion probability)\n\npost-stratification:  w_i = N_g / n_g  for unit i in group g\nraking / calibration: adjust weights iteratively to match several margins\n\nDesign effect:  deff = Var_design / Var_SRS    (cluster sampling: > 1)\n  effective sample size = n / deff\n  Kish effective size for unequal weights:  n_eff = (SUM w)^2 / SUM w^2\n\nVariance under a complex design: use Taylor linearisation,\n  or replicate weights (bootstrap / jackknife / BRR) — not the naive formula\n\nMissing data:\n  MCAR:  P(missing | y, x) = P(missing)          -> complete cases unbiased\n  MAR:   P(missing | y, x) = P(missing | x)      -> impute / weight / model\n  MNAR:  depends on y itself                     -> needs a stated assumption\n\nMultiple imputation (MICE):\n  draw m completed datasets, analyse each, pool with Rubin rules\n  total variance = within-imputation + (1 + 1/m) * between-imputation'),
      code(`import numpy as np, pandas as pd
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(64)
N = 200_000
pop = pd.DataFrame({'age': rng.integers(18, 70, N),
                    'region': rng.choice(['N', 'S', 'E', 'W'], N)})
pop['income'] = 1200 + 45 * pop.age + rng.normal(0, 4000, N)
pop.loc[pop.region == 'N', 'income'] += 2500

# A biased sample: urban region N is over-represented
p = np.where(pop.region == 'N', 0.6, 0.13)
s_idx = rng.choice(N, 4000, replace=False, p=p / p.sum())
s = pop.iloc[s_idx].copy()
print('sample mean :', round(s.income.mean(), 1))
print('truth       :', round(pop.income.mean(), 1))

# Post-stratification weights
share_pop = pop.region.value_counts(normalize=True)
share_smp = s.region.value_counts(normalize=True)
w = (share_pop / share_smp).reindex(s.region).values
print('weighted    :', round(np.average(s.income, weights=w), 1))
print('Kish n_eff  :', round(w.sum() ** 2 / (w ** 2).sum()))

# Design effect of clustering: same n, much wider intervals
def cluster_sim(k=40, m=25, reps=800):
    means = []
    for _ in range(reps):
        centres = rng.normal(0, 1.0, k)
        means.append(np.mean(centres[:, None] + rng.normal(0, 1.0, (k, m))))
    return np.std(means)
print('SE clustered :', round(cluster_sim(), 4),
      '| SE independent:', round(1 / np.sqrt(40 * 25), 4))

# --- Missing data: MAR, and why mean-imputation is a bad idea
n = 5000
x = rng.normal(0, 1, n)
y = 2 + 3 * x + rng.normal(0, 1, n)
miss = 1 / (1 + np.exp(-(-1.5 + 2.0 * x)))           # higher x -> more likely missing
d = pd.DataFrame({'x': x, 'y': y})
d.loc[rng.random(n) < miss, 'y'] = np.nan
print('missing rate:', round(d.y.isna().mean(), 3))

cc = d.dropna()
print('complete-case slope :', round(LinearRegression().fit(cc[['x']], cc.y).coef_[0], 3))
imp = d.copy(); imp['y'] = imp.y.fillna(imp.y.mean())
print('mean-imputed slope  :', round(LinearRegression().fit(imp[['x']], imp.y).coef_[0], 3))

# Multiple imputation by chained equations (draws, not one number)
m = 20; slopes = []
for _ in range(m):
    t = d.copy()
    fit = LinearRegression().fit(t[['x']][t.y.notna()], t.y[t.y.notna()])
    pred = fit.predict(t[['x']][t.y.isna()])
    resid = np.random.default_rng().choice(cc.y - fit.predict(cc[['x']]), len(pred))
    t.loc[t.y.isna(), 'y'] = pred + resid                 # proper: add noise
    slopes.append(LinearRegression().fit(t[['x']], t.y).coef_[0])
print(f'MI slope = {np.mean(slopes):.3f}  (between-imputation sd = {np.std(slopes, ddof=1):.3f})')
print('truth = 3.0')`),
      ul(['Weighted estimates need design-aware uncertainty. Applying the naive formula to weighted or clustered data understates the standard error — sometimes by a factor of two or more.',
          'Report the effective sample size. A survey of 10,000 respondents with wildly unequal weights may carry the information of 3,000.',
          'Complete-case analysis is unbiased under MCAR and biased under MAR. Since you cannot distinguish them from the data, treat MAR as the working assumption and say so.',
          'Never mean-impute a variable you are about to regress on: it shrinks coefficients toward zero and manufactures false confidence. Impute from a model that uses other variables, and add noise (multiple imputation) so the uncertainty survives.',
          'For MNAR you need an assumption, not an algorithm. Do a sensitivity analysis: how large would the missing-data mechanism have to be to change the conclusion?'],
          ['برآوردهای وزن‌دار به عدم‌قطعیتِ آگاه‌از-طرح نیاز دارند. اعمالِ فرمولِ ساده‌لوحانه روی داده‌ی وزن‌دار یا خوشه‌ای خطای معیار را کمتر از واقع نشان می‌دهد — گاهی با ضریبِ دو یا بیشتر.',
           'اندازه‌ی نمونه‌ی مؤثر را گزارش کنید. یک پیمایش با ۱۰٬۰۰۰ پاسخگو و وزن‌های به‌شدت نابرابر ممکن است اطلاعاتی به اندازه‌ی ۳٬۰۰۰ نفر داشته باشد.',
           'تحلیلِ مواردِ کامل تحتِ MCAR نااریب و تحتِ MAR اریب است. چون نمی‌توانید این دو را از داده تشخیص دهید، MAR را به عنوانِ فرضِ کاری بپذیرید و این را بگویید.',
           'هرگز متغیری را که می‌خواهید روی آن رگرسیون بدهید با میانگین درون‌یابی نکنید: ضرایب را به سمتِ صفر می‌کشد و اطمینانِ کاذب تولید می‌کند. از مدلی درون‌یابی کنید که متغیرهای دیگر را به کار می‌برد، و نویز بیفزایید (درون‌یابیِ چندگانه) تا عدم‌قطعیت زنده بماند.',
           'برای MNAR به یک فرض نیاز دارید، نه یک الگوریتم. یک تحلیلِ حساسیت انجام دهید: سازوکارِ داده‌ی گمشده باید چقدر بزرگ باشد تا نتیجه عوض شود؟']),
      note('Weights fix a known, measured mismatch. They cannot fix an unmeasured one — if the people who never answer the survey differ on something you did not record, no weighting scheme will recover them, and the honest report says so.',
           'وزن‌ها یک ناهمخوانیِ معلوم و اندازه‌گیری‌شده را درست می‌کنند. نمی‌توانند ناهمخوانیِ اندازه‌گیری‌نشده را درست کنند — اگر کسانی که هرگز به پیمایش پاسخ نمی‌دهند در چیزی که ثبت نکرده‌اید تفاوت دارند، هیچ طرحِ وزن‌دهی آن‌ها را بازنمی‌گرداند و گزارشِ صادقانه همین را می‌گوید.')
    ],
    ['survey', 'weighting', 'missing-data', 'multiple-imputation', 'design-effect', 'mcar'],
    [R('Flexible Imputation of Missing Data (van Buuren)', 'https://stefvanbuuren.name/fimd/', 'book'),
     R('Complex Surveys: a guide to analysis using R (Lumley)', 'https://r-survey.r-forge.r-project.org/svybook/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-025', D, 'advanced', 15,
    ['Extreme Values, Heavy Tails and Rare Events', 'مقادیرِ فرین، دم‌های سنگین و رخدادهای نادر'],
    ['Averages are a poor guide when the loss lives in the tail: fraud, outages, floods, claims, latency spikes. Extreme-value theory gives you a principled way to talk about events rarer than anything in your data.',
     'میانگین‌ها راهنمایِ بدی‌اند وقتی زیان در دم زندگی می‌کند: تقلب، قطعی، سیل، خسارت، جهش‌های تأخیر. نظریه‌ی مقادیرِ فرین راهی اصولی برای سخن گفتن درباره‌ی رخدادهایی نادرتر از هرچه در داده‌ی شما هست می‌دهد.'],
    [
      def('Heavy-tailed distributions put non-negligible probability far from the centre: a Pareto tail decays like a power law, P(X > x) ~ C x^{-alpha}, so the tail index alpha governs how violent extremes can be (alpha <= 1: infinite mean; alpha <= 2: infinite variance). Extreme-value theory provides the limiting laws for extremes: the generalised extreme-value distribution for block maxima and the generalised Pareto distribution for exceedances over a high threshold. These let you estimate return levels — the level exceeded once every T periods.',
          'توزیع‌های دم‌سنگین احتمالِ غیرقابل‌چشم‌پوشی را دور از مرکز می‌گذارند: یک دمِ پارتو مانند یک قانونِ توانی میرا می‌شود، P(X > x) ~ C x^{-alpha}، پس نمایِ دمِ alpha تعیین می‌کند افراط‌ها چقدر می‌توانند خشن باشند (alpha <= 1: میانگینِ بی‌نهایت؛ alpha <= 2: واریانسِ بی‌نهایت). نظریه‌ی مقادیرِ فرین قوانینِ حدی برای افراط‌ها فراهم می‌کند: توزیعِ مقادیرِ فرینِ تعمیم‌یافته برای بیشینه‌های بلوکی و توزیعِ پارتوی تعمیم‌یافته برای فراتررفتگی‌ها از یک آستانه‌ی بالا. این‌ها اجازه می‌دهند سطوحِ بازگشت را برآورد کنید — سطحی که هر T دوره یک‌بار فراتر می‌رود.'),
      math('Tail index (Pareto / power law):   P(X > x) = C x^{-alpha}\n  Hill estimator:  alpha_hat = 1 / [ (1/k) SUM_{i=1..k} ln(x_{(n-i+1)} / x_{(n-k)}) ]\n  alpha <= 1 -> infinite mean      alpha <= 2 -> infinite variance\n  alpha <= 4 -> sample kurtosis is not to be trusted\n\nBlock maxima (GEV):   M_n = max(X_1..X_n)\n  P((M_n - b_n)/a_n <= z) -> G(z) = exp(-(1 + xi z)^{-1/xi})\n  xi > 0 heavy (Frechet)   xi = 0 light (Gumbel)   xi < 0 bounded (Weibull)\n\nPeaks over threshold (GPD):  P(X - u > y | X > u) ~ (1 + xi y / sigma)^{-1/xi}\n  choose u high enough for the limit, low enough to keep data (check stability)\n\nReturn level for period T (m observations per period):\n  x_T = u + (sigma/xi) [ (m T P(X>u))^{xi} - 1 ]\n\nEmpirical rule: with n points you can estimate roughly the 1/n quantile directly;\nanything rarer is an extrapolation and must say so.'),
      code(`import numpy as np
from scipy import stats

rng = np.random.default_rng(52)
# A heavy-tailed loss distribution (no closed form, tail index ~ 2)
losses = stats.pareto.rvs(b=2.2, scale=1000, size=50_000, random_state=rng)
print('mean =', round(losses.mean(), 1), '| median =', round(np.median(losses), 1),
      '| p99 =', round(np.quantile(losses, .99), 1), '| max =', round(losses.max(), 1))
print('share of total loss in top 1%:',
      round(losses[losses >= np.quantile(losses, .99)].sum() / losses.sum(), 3))

def hill(x, k):
    xs = np.sort(x)[::-1]
    return 1 / np.mean(np.log(xs[:k] / xs[k]))

for k in (100, 250, 500, 1000, 2500):
    print(f'k={k:5d}  Hill alpha = {hill(losses, k):.2f}')      # truth ~2.2

# Peaks-over-threshold fit with scipy's GPD
u = np.quantile(losses, 0.95)
exc = losses[losses > u] - u
xi, loc, sigma = stats.genpareto.fit(exc, floc=0)
print(f'GPD: xi = {xi:.3f}  sigma = {sigma:.1f}')

# Return level: the 1-in-10-years loss, with 10k losses per year
m = len(losses) / 5                       # five years of data in this sample
T, pu = 10, (losses > u).mean()
x_T = u + (sigma / xi) * ((m / 5 * T * pu) ** xi - 1)
print(f'1-in-{T}-year loss ~ {x_T:,.0f}')

# Sanity check against the empirical tail
print('empirical 1-in-10y (extrapolated naively):',
      round(np.quantile(losses, 1 - 1 / (m * T)), 1))

# Mean-excess plot: linearity above u supports the GPD fit
for t in np.quantile(losses, [0.5, 0.8, 0.9, 0.95, 0.99]):
    print(f'threshold {t:8.0f}  mean excess = {losses[losses > t].mean() - t:8.0f}')`),
      ul(['Plot the tail before modelling it: a log-log survival plot that is roughly straight is a power law, and its slope is the tail index.',
          'The Hill estimator is sensitive to k. Plot the estimate against k and quote a stable region; if there is none, the tail is not clearly power-law and you should say so.',
          'Extremes are extrapolations. A 1-in-100-year estimate from 5 years of data rests on the limiting-law assumption — present it with the interval and the assumption attached.',
          'Aggregate risk is dominated by the tail: in insurance and fraud, the top 1% of events often carry most of the loss, so a model tuned for average error will systematically under-prepare you.',
          'Do not confuse heavy tails with outliers to delete. If the tail is real, trimming it removes precisely the events you needed to plan for.'],
          ['دم را پیش از مدل‌سازی رسم کنید: یک نمودارِ بقایِ لگ-لگ که تقریباً راست است یعنی قانونِ توانی، و شیبش همان نمایِ دم است.',
           'برآوردگرِ هیل به k حساس است. برآورد را بر حسب k رسم کنید و یک ناحیه‌ی پایدار نقل کنید؛ اگر وجود ندارد، دم به‌وضوح قانونِ توانی نیست و باید این را بگویید.',
           'مقادیرِ فرین برون‌یابی‌اند. یک برآوردِ ۱-در-۱۰۰-سال از ۵ سال داده بر فرضِ قانونِ حدی تکیه دارد — آن را با بازه و با فرضِ ضمیمه ارائه کنید.',
           'ریسکِ تجمیعی تحتِ سلطه‌ی دم است: در بیمه و تقلب، ۱٪ بالای رخدادها معمولاً بیشترِ زیان را می‌کشد، پس مدلی که برای خطایِ میانگین تنظیم شده شما را نظام‌مند کم‌آماده می‌گذارد.',
           'دم‌های سنگین را با دورافتاده‌هایی که باید حذف شوند اشتباه نگیرید. اگر دم واقعی است، هرس کردنش دقیقاً همان رخدادهایی را حذف می‌کند که برای برنامه‌ریزی لازم داشتید.']),
      note('Every tail estimate is a statement about a mechanism you have not observed. The value of EVT is not that it is certain — it is that it makes the extrapolation explicit, bounded and open to criticism.',
           'هر برآوردِ دم گزاره‌ای درباره‌ی سازوکاری است که مشاهده‌اش نکرده‌اید. ارزشِ EVT در این نیست که قطعی است — در این است که برون‌یابی را صریح، کران‌دار و در معرضِ نقد می‌کند.')
    ],
    ['extreme-value', 'heavy-tails', 'pareto', 'hill-estimator', 'return-level', 'tail-risk'],
    [R('An Introduction to Statistical Modeling of Extreme Values (Coles)', 'https://doi.org/10.1007/978-1-4471-3675-0', 'book'),
     R('scipy stats: continuous distributions', 'https://docs.scipy.org/doc/scipy/reference/stats.html#continuous-distributions', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-026', D, 'advanced', 14,
    ['Meta-Analysis: Combining Evidence Honestly', 'فراتحلیل: ترکیبِ صادقانه‌ی شواهد'],
    ['You rarely have one study; you have several, plus a literature. Meta-analysis pools effect estimates into one number with an honest interval — and, more importantly, measures how much the studies disagree and why.',
     'به‌ندرت یک مطالعه دارید؛ چند مطالعه دارید، به‌علاوه یک پیشینه. فراتحلیل برآوردهای اثر را در یک عدد با یک بازه‌ی صادقانه ادغام می‌کند — و مهم‌تر، می‌سنجد مطالعات چقدر و چرا با هم اختلاف دارند.'],
    [
      def('A meta-analysis takes effect estimates y_i with standard errors s_i from k studies and combines them. A fixed-effect model assumes one true effect and attributes all scatter to sampling noise; a random-effects model assumes the true effects themselves vary, adding a between-study variance tau^2. Heterogeneity statistics (Q, I^2) quantify the disagreement, and if it is large, the pooled number is a summary of a distribution, not a discovery of a constant.',
          'یک فراتحلیل برآوردهای اثرِ y_i را با خطاهای معیارِ s_i از k مطالعه می‌گیرد و ترکیب‌شان می‌کند. یک مدلِ اثرِ ثابت یک اثرِ واقعیِ یگانه فرض می‌کند و همه‌ی پراکندگی را به نویزِ نمونه‌گیری نسبت می‌دهد؛ یک مدلِ اثراتِ تصادفی فرض می‌کند خودِ اثرهای واقعی تغییر می‌کنند و یک واریانسِ بین‌مطالعه‌ایِ tau^2 می‌افزاید. آماره‌های ناهمتجانسی (Q، I^2) مقدارِ اختلاف را می‌سنجد، و اگر بزرگ باشد، عددِ تجمیعی خلاصه‌ی یک توزیع است نه کشفِ یک ثابت.'),
      math('Fixed effect (inverse variance):\n  w_i = 1 / s_i^2          mu_hat = SUM w_i y_i / SUM w_i\n  SE(mu_hat) = 1 / sqrt(SUM w_i)\n\nRandom effects (DerSimonian-Laird):\n  Q = SUM w_i (y_i - mu_FE)^2 ,  df = k - 1\n  tau^2 = max(0, (Q - df) / (SUM w_i - SUM w_i^2 / SUM w_i))\n  w_i* = 1 / (s_i^2 + tau^2)      mu_RE = SUM w_i* y_i / SUM w_i*\n\nHeterogeneity:\n  I^2 = (Q - df) / Q * 100%    0/25/50/75% -> none/low/moderate/high\n  tau = the SD of true effects on the original scale (interpretable!)\n  prediction interval:  mu_RE +/- t_{k-2} * sqrt(SE^2 + tau^2)\n\nPublication bias:\n  funnel plot asymmetry -> Egger test, trim-and-fill (a diagnostic, not a fix)\n  small-study effects: big effects in tiny studies = suspicion'),
      code(`import numpy as np
from scipy import stats

# k studies of the same intervention, on a log-odds-ratio scale
rng = np.random.default_rng(88)
k = 12
true_effects = rng.normal(-0.35, 0.25, k)              # effects genuinely differ
s = rng.uniform(0.08, 0.35, k)                         # study precision
y = true_effects + rng.normal(0, s)

w_fe = 1 / s**2
mu_fe = np.sum(w_fe * y) / np.sum(w_fe)
Q = np.sum(w_fe * (y - mu_fe) ** 2); df = k - 1
C = np.sum(w_fe) - np.sum(w_fe ** 2) / np.sum(w_fe)
tau2 = max(0.0, (Q - df) / C)
w_re = 1 / (s**2 + tau2)
mu_re = np.sum(w_re * y) / np.sum(w_re)
se_re = np.sqrt(1 / np.sum(w_re))

I2 = max(0.0, (Q - df) / Q) * 100
print(f'fixed   : log-OR = {mu_fe:+.3f}  [{mu_fe-1.96/np.sqrt(np.sum(w_fe)):+.3f}, '
      f'{mu_fe+1.96/np.sqrt(np.sum(w_fe)):+.3f}]')
print(f'random  : log-OR = {mu_re:+.3f}  [{mu_re-1.96*se_re:+.3f}, {mu_re+1.96*se_re:+.3f}]')
print(f'Q = {Q:.1f} (df {df}, p = {stats.chi2.sf(Q, df):.4f})  I^2 = {I2:.0f}%  tau = {np.sqrt(tau2):.3f}')

# Prediction interval: where the effect in a NEW study would land
tcrit = stats.t.ppf(0.975, k - 2)
pred = mu_re + np.array([-1, 1]) * tcrit * np.sqrt(se_re**2 + tau2)
print(f'95% prediction interval for a new study: [{pred[0]:+.3f}, {pred[1]:+.3f}]')
print('odds ratio scale:', np.exp(mu_re).round(3), np.exp(pred).round(3))

# Egger test for funnel asymmetry (small-study effects)
se = s
z = y / se
b = np.polyfit(se, z, 1)                               # intercept != 0 -> asymmetry
print('Egger intercept =', round(b[1], 3), '(|z| > 2 suggests publication bias)')`),
      ul(['Choose the random-effects model by default. Assuming a single true effect across different populations, protocols and years is a strong claim, and the fixed-effect interval is then optimistically narrow.',
          'Report I^2 and tau, not just the pooled estimate. If tau is large, the interesting finding is "the effect varies from -0.1 to -0.8 across settings", not "the effect is -0.35".',
          'Quote the prediction interval when someone will apply the result in a new setting: it includes the between-study variance that the pooled interval ignores.',
          'Assess publication bias, but treat the tests as weak: with few studies they have almost no power, and asymmetry can come from real heterogeneity rather than missing studies.',
          'Pre-register the inclusion criteria and extract effects on a common scale (log odds, standardised mean difference, log rate ratio) with its variance, before you look at the pooled number.'],
          ['به‌طور پیش‌فرض مدلِ اثراتِ تصادفی را انتخاب کنید. فرضِ یک اثرِ واقعیِ یگانه در جمعیت‌ها، پروتکل‌ها و سال‌های متفاوت یک ادعای قوی است و بازه‌ی اثرِ ثابت در آن صورت خوش‌بینانه تنگ است.',
           'I^2 و tau را گزارش کنید، نه فقط برآوردِ تجمیعی را. اگر tau بزرگ باشد، یافته‌ی جالب این است که «اثر از ‎-0.1‎ تا ‎-0.8‎ در موقعیت‌های مختلف تغییر می‌کند»، نه اینکه «اثر ‎-0.35‎ است».',
           'وقتی کسی می‌خواهد نتیجه را در یک موقعیتِ جدید به کار ببرد، بازه‌ی پیش‌بینی را نقل کنید: این بازه واریانسِ بین‌مطالعه‌ای را هم در بر می‌گیرد که بازه‌ی تجمیعی نادیده‌اش می‌گیرد.',
           'سوگیریِ انتشار را بسنجید، اما آزمون‌ها را ضعیف بدانید: با تعدادِ اندکِ مطالعات تقریباً هیچ توانی ندارند، و عدم‌تقارن می‌تواند از ناهمتجانسیِ واقعی بیاید نه از مطالعاتِ گمشده.',
           'معیارهای ورود را پیش‌ثبت کنید و اثرها را پیش از نگاه کردن به عددِ تجمیعی، در یک مقیاسِ مشترک (لگاریتمِ نسبتِ شانس، اختلافِ میانگینِ استاندارد، لگاریتمِ نسبتِ نرخ) همراه با واریانسش استخراج کنید.']),
      note('Pooling bad studies gives you a precise wrong answer. Weighting by inverse variance is a statement about precision, not about quality — and quality has to be judged study by study, pre-registered, before the weights are applied.',
           'ادغامِ مطالعاتِ بد یک پاسخِ غلطِ دقیق می‌دهد. وزن‌دهی با وارونِ واریانس گزاره‌ای درباره‌ی دقت است، نه کیفیت — و کیفیت باید مطالعه‌به‌مطالعه و پیش‌ثبت‌شده قضاوت شود، پیش از اعمالِ وزن‌ها.')
    ],
    ['meta-analysis', 'heterogeneity', 'random-effects', 'publication-bias', 'forest-plot'],
    [R('Introduction to Meta-Analysis (Borenstein et al.)', 'https://onlinelibrary.wiley.com/doi/book/10.1002/9780470743386', 'book'),
     R('Cochrane Handbook for Systematic Reviews', 'https://training.cochrane.org/handbook/current', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('stat-027', D, 'advanced', 15,
    ['Sequential and Adaptive Experiments', 'آزمایش‌های پیاپی و تطبیقی'],
    ['A fixed-horizon test forces one decision at one moment. Sequential designs let you look early — legally — and adaptive designs let you change what happens next based on what you learn, without turning the result into noise.',
     'یک آزمونِ افقِ ثابت شما را مجبور می‌کند در یک لحظه یک تصمیم بگیرید. طرح‌های پیاپی اجازه می‌دهند زودتر — و به‌طور مشروع — نگاه کنید، و طرح‌های تطبیقی اجازه می‌دهند بر اساسِ آنچه می‌آموزید تغییر دهید چه اتفاقی بعد بیفتد، بی‌آنکه نتیجه را به نویز تبدیل کنید.'],
    [
      def('Peeking at a fixed-horizon test inflates the false-positive rate because each look is another chance to cross the threshold. Sequential designs control this by spending the alpha across looks (Pocock, O\'Brien-Fleming, alpha-spending functions) or by always-valid inference (sequential probability ratio tests, confidence sequences), which permits looking as often as you like. Adaptive designs go further: drop an arm, re-randomise traffic toward the better variant, or stop for futility — each with rules fixed in advance.',
          'نگاه کردنِ دزدکی به یک آزمونِ افقِ ثابت نرخِ مثبتِ کاذب را بالا می‌برد، چون هر نگاه شانسِ دیگری برای عبور از آستانه است. طرح‌های پیاپی این را با خرج کردنِ آلفا در نگاه‌ها (پوکاک، اوبراین-فلمینگ، توابعِ خرجِ آلفا) یا با استنتاجِ همواره-معتبر (آزمون‌های نسبتِ درست‌نماییِ پیاپی، دنباله‌های اطمینان) کنترل می‌کنند که اجازه می‌دهد هرچه می‌خواهید نگاه کنید. طرح‌های تطبیقی فراتر می‌روند: حذفِ یک بازو، تصادفی‌سازیِ دوباره‌ی ترافیک به سمتِ نسخه‌ی بهتر، یا توقف برای بی‌حاصلی — هر کدام با قواعدی که از پیش ثابت شده‌اند.'),
      math('Fixed horizon:  one look at n, reject if |Z| > 1.96\n  naive peeking at 5 looks inflates alpha from 5% to roughly 14%\n\nPocock:            constant boundary,  |Z_k| > c  (c ~ 2.18 for 5 looks at 5%)\nO\'Brien-Fleming:   |Z_k| > c * sqrt(K / k)   (very strict early, ~1.96 at the end)\nAlpha spending:    alpha(t) = 2 * (1 - Phi(z_{1-alpha/2} / sqrt(t)))\n  t = information fraction (n_k / n_max);  spend the budget however you like\n\nSPRT (Wald):  stop when  LR = L(H1)/L(H0)  leaves [B, A]\n  A = (1 - beta)/alpha ,  B = beta/(1 - alpha)\n  optimal expected sample size for a simple-vs-simple test\n\nConfidence sequence:  a CI valid at every n simultaneously\n  mu_hat_n +/- sqrt( (2 sigma^2 / n) * ln( (2/alpha) * ln(n) + ... ) )\n\nFutility:  stop when the predictive probability of eventual success < threshold\nMulti-armed bandit:  reallocates traffic to the leader;  regret-minimising,\n  but the final comparison needs care (biased estimates from adaptive sampling)'),
      code(`import numpy as np
from scipy import stats

# --- 1. Show the cost of peeking
def peek_sim(n_per_look=500, looks=5, reps=4000, seed=0):
    r = np.random.default_rng(seed); false_pos = 0
    for _ in range(reps):
        hit = False
        for _l in range(looks):
            a = r.binomial(1, 0.10, n_per_look); b = r.binomial(1, 0.10, n_per_look)
            if stats.ttest_ind(a, b, equal_var=False).pvalue < 0.05:
                hit = True; break                    # stopped early: a win!
        false_pos += hit
    return false_pos / reps
print('false positive rate with 5 peeks:', round(peek_sim(), 3), '(nominal 0.05)')

# --- 2. O'Brien-Fleming boundaries
def obf_boundary(K, alpha=0.05, two_sided=True):
    z = stats.norm.ppf(1 - (alpha / 2 if two_sided else alpha) / 2)
    # Lan-DeMets spending approximation
    return [z * np.sqrt(K / k) for k in range(1, K + 1)]
print('OBF boundaries (5 looks):', [round(b, 2) for b in obf_boundary(5)])

# --- 3. A sequential test run: group-sequential with OBF
def group_sequential(true_p1, p0=0.10, n_per_look=1000, K=5, seed=1):
    r = np.random.default_rng(seed); bounds = obf_boundary(K); info = []
    for k in range(K):
        a = r.binomial(1, p0, n_per_look); b = r.binomial(1, true_p1, n_per_look)
        pooled = (a.sum() + b.sum()) / (2 * n_per_look)
        se = np.sqrt(2 * pooled * (1 - pooled) / n_per_look)
        z = (b.mean() - a.mean()) / se
        info.append((k + 1, round(z, 2), round(bounds[k], 2)))
        if abs(z) > bounds[k]:
            return info, f'stopped at look {k + 1}'
    return info, 'no stopping'
tr, verdict = group_sequential(0.13)
print(verdict, tr)

# --- 4. A confidence sequence you can look at every day
def conf_sequence(x, alpha=0.05):
    n = np.arange(1, len(x) + 1); mean = np.cumsum(x) / n
    half = np.sqrt((2 / n) * np.log(2 * np.log(n + 1) / alpha))
    return mean - half, mean + half
xs = np.random.default_rng(2).normal(0.05, 1, 2000)
lo, hi = conf_sequence(xs)
print('valid at every n: final interval', round(lo[-1], 3), round(hi[-1], 3),
      '| covers truth (0.05):', bool(lo[-1] <= 0.05 <= hi[-1]))`),
      ul(['Fix the stopping rule before the first look. "We stopped because it was significant" is not a stopping rule, and the resulting p-value does not mean what it says.',
          'Use O\'Brien-Fleming-style boundaries when the cost of a false positive is high (shipping a harmful change); use Pocock when you want a decent chance to stop early and can tolerate the slightly larger final sample.',
          'Add a futility rule. Most A/B tests are flat, and stopping for futility early is where sequential designs save the most time.',
          'Bandits optimise reward during the experiment, not inference after it. If you need an unbiased estimate of the difference at the end, keep a small fixed randomisation holdout or use a design built for both.',
          'Always-valid methods (confidence sequences, SPRT with a proper threshold) let you monitor continuously without pre-committing to the number of looks — the modern default for a metric dashboard.'],
          ['قاعده‌ی توقف را پیش از نخستین نگاه ثابت کنید. «چون معنادار بود متوقف شدیم» یک قاعده‌ی توقف نیست و مقدارِ p حاصل دیگر آن معنا را نمی‌دهد.',
           'وقتی هزینه‌ی مثبتِ کاذب بالاست (عرضه‌ی یک تغییرِ زیان‌بار) از مرزهای سبکِ اوبراین-فلمینگ استفاده کنید؛ وقتی می‌خواهید شانسِ خوبی برای توقفِ زودهنگام داشته باشید و نمونه‌ی نهاییِ کمی بزرگ‌تر را می‌توانید تحمل کنید، از پوکاک.',
           'یک قاعده‌ی بی‌حاصلی بیفزایید. بیشترِ آزمایش‌های A/B تخت‌اند و توقفِ زودهنگام برای بی‌حاصلی جایی است که طرح‌های پیاپی بیشترین زمان را ذخیره می‌کنند.',
           'بندیت‌ها پاداش را در حینِ آزمایش بهینه می‌کنند، نه استنتاج را پس از آن. اگر به یک برآوردِ نااریب از اختلاف در پایان نیاز دارید، یک نگه‌داشتِ تصادفیِ کوچکِ ثابت نگه دارید یا از طرحی استفاده کنید که برای هر دو ساخته شده است.',
           'روش‌های همواره-معتبر (دنباله‌های اطمینان، SPRT با آستانه‌ی درست) اجازه می‌دهند پیوسته پایش کنید بی‌آنکه از پیش به تعدادِ نگاه‌ها متعهد شوید — پیش‌فرضِ امروزی برای یک داشبوردِ معیار.']),
      note('Sequential designs buy the right to stop early by paying in the final sample size: if the effect is real, you stop sooner on average; if it is not, you run longer than a fixed test. Say which cost you are accepting and why.',
           'طرح‌های پیاپی حقِ توقفِ زودهنگام را با پرداخت از اندازه‌ی نمونه‌ی نهایی می‌خرند: اگر اثر واقعی باشد، به‌طور میانگین زودتر متوقف می‌شوید؛ اگر نباشد، طولانی‌تر از یک آزمونِ ثابت می‌روید. بگویید کدام هزینه را و چرا می‌پذیرید.')
    ],
    ['sequential', 'alpha-spending', 'sprt', 'confidence-sequences', 'bandits', 'interim-analysis'],
    [R('Group Sequential Methods (Jennison & Turnbull)', 'https://doi.org/10.1201/9780367805326', 'book'),
     R('Sequential estimation with confidence sequences (Howard et al.)', 'https://arxiv.org/abs/1810.08240', 'paper')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
