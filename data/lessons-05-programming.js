/* =====================================================================
   lessons-05-programming.js  —  9 lessons (python, numpy, pandas, SQL, pipelines)
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'programming';

  /* ------------------------------------------------------------------ */
  L('prog-001', D, 'beginner', 12,
    ['Python for Data Work: Idioms, Environments and Speed', 'پایتون برای کارِ داده: اصطلاحات، محیط‌ها و سرعت'],
    ['You do not need to be a software engineer, but you do need reproducible environments, vectorized thinking, and the discipline to never mutate data you might need again.',
     'لازم نیست مهندس نرم‌افزار باشید، اما به محیط‌های تکرارپذیر، تفکرِ برداری و این انضباط که هرگز داده‌ای را که ممکن است دوباره لازم شود تغییر ندهید، نیاز دارید.'],
    [
      def('Vectorization means pushing loops down into C/Fortran (NumPy) instead of iterating in Python. A 100x speedup is typical and the code gets shorter. Broadcasting is NumPy rule set for combining arrays of different shapes without copying.',
          'بردارسازی یعنی حلقه‌ها را به لایه‌ی C/فورترن (نام‌پای) بفرستید نه این‌که در پایتون پیمایش کنید. سرعتِ ۱۰۰ برابر معمول است و کد کوتاه‌تر می‌شود. پخش‌سازی (broadcasting) مجموعه‌قواعدِ نام‌پای برای ترکیبِ آرایه‌های هم‌شکلِ متفاوت بدون کپی‌کردن است.'),
      math('broadcasting rules (align shapes from the RIGHT):\n  (256, 256, 3)  +  (3,)          -> ok, last dims match\n  (256, 256, 3)  +  (256, 3)      -> ok, right-aligned\n  (256, 256, 3)  +  (256,)        -> ERROR: 3 != 256\n  (8, 1)         +  (8, 4)        -> (8, 4)   (dim of size 1 stretches)\n\ncomplexity honesty:\n  python for-loop over a Series : ~10^6 ops/s\n  numpy vectorized op           : ~10^8-10^9 ops/s'),
      code(`import numpy as np, time
rng = np.random.default_rng(0)
a = rng.random(2_000_000)

t = time.perf_counter(); s = 0.0
for v in a: s += v                       # never do this
t_loop = time.perf_counter() - t

t = time.perf_counter(); s = a.sum(); t_vec = time.perf_counter() - t
print(f'loop {t_loop:.3f}s   vectorized {t_vec:.5f}s   speedup {t_loop/t_vec:.0f}x')

# Environments: pin everything
# pip:   python -m venv .venv && pip install -U pip && pip freeze > requirements.txt
# uv:    uv venv && uv pip install -r requirements.txt      (10-100x faster)
# conda: conda env export --no-builds > environment.yml
# poetry/pdm: lock files with hashes -> truly reproducible

# Never mutate the input of a function you will call twice
def add_ratio_bad(df):     df['ratio'] = df.a / df.b; return df      # mutates!
def add_ratio_good(df):    return df.assign(ratio=df.a / df.b)       # returns a copy

# Copy-on-write in pandas 3.0 makes chained assignment errors a thing of the past
# pd.options.mode.copy_on_write = True`),
      ul(['Use uv or Poetry, not "pip install into the system python".',
          'Pin versions in a lock file; "works on my machine" is not reproducibility.',
          'Prefer functions that return new objects; reserve in-place ops for genuinely huge frames.',
          'Profile before optimizing: %timeit in a notebook, or py-spy for a running job.'],
         ['از uv یا Poetry استفاده کنید، نه «pip install در پایتونِ سیستم».',
          'نسخه‌ها را در یک فایلِ قفل pin کنید؛ «روی ماشینِ من کار می‌کند» تکرارپذیری نیست.',
          'توابعی را ترجیح دهید که شیءِ جدید برمی‌گردانند؛ عمل‌های درجا را برای فریم‌های واقعاً عظیم نگه دارید.',
          'پیش از بهینه‌سازی پروفایل کنید: %timeit در نوت‌بوک، یا py-spy برای یک جابِ در حال اجرا.'])
    ],
    ['python', 'vectorization', 'broadcasting', 'environments'],
    [R('uv — fast Python package manager', 'https://docs.astral.sh/uv/', 'tool'),
     R('Python Data Science Handbook (free)', 'https://jakevdp.github.io/PythonDataScienceHandbook/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('prog-002', D, 'beginner', 14,
    ['NumPy: Arrays, Views, Broadcasting and einsum', 'نام‌پای: آرایه‌ها، نماها، پخش‌سازی و einsum'],
    ['Almost every performance bug and silent data corruption in scientific Python comes from not knowing when NumPy copies and when it only views. Learn that, plus einsum, and you can read any deep-learning code.',
     'تقریباً هر باگِ کارایی و هر خرابیِ خاموشِ داده در پایتونِ علمی از ندانستنِ این است که نام‌پای کِی کپی می‌کند و کِی فقط نما می‌سازد. این را یاد بگیرید، به‌علاوه‌ی einsum، و آن‌گاه می‌توانید هر کدِ یادگیری عمیقی را بخوانید.'],
    [
      def('A view shares memory with the original array; a copy does not. Basic slicing gives views, fancy/boolean indexing gives copies, and reshape usually gives a view while flatten() gives a copy. np.shares_memory(a, b) settles any doubt.',
          'یک نما حافظه را با آرایه‌ی اصلی شریک است؛ یک کپی نه. برشِ پایه نما می‌دهد، نمایه‌گذاریِ fancy/بولی کپی می‌دهد و معمولاً reshape نما می‌دهد در حالی که flatten() کپی می‌دهد. تابع np.shares_memory(a, b) هر تردیدی را رفع می‌کند.'),
      math('strides: how many bytes to step along each axis\n  a = np.zeros((4, 5), float64)   -> strides (40, 8)\n  a.T.strides                      -> (8, 40)   a transpose is free (a view)\n  a[::2].strides                   -> (80, 8)   a strided view, still no copy\n\nC-order (row-major) vs F-order (column-major) decides cache-friendliness\n\neinsum: declare index letters, repeat to contract, omit to reduce\n  "ij,jk->ik"     matrix product\n  "ij->i"         row sums\n  "bij,bjk->bik"  batched matrix product\n  "btd,bTd->btT"  attention scores (batch, time, dim)'),
      code(`import numpy as np
rng = np.random.default_rng(0)

a = np.arange(12.).reshape(3, 4)
b = a[::2, :]                # view
c = a[[0, 2], :]             # copy (fancy indexing)
b[0, 0] = 999
print('a changed?', a[0, 0] == 999, '| shares_memory', np.shares_memory(a, b))

# Strides: transpose is free, but it changes memory layout
x = rng.random((5000, 5000))
print(x.flags['C_CONTIGUOUS'], x.T.flags['C_CONTIGUOUS'])
t = lambda z: np.sum(z, axis=0)
import time; s = time.perf_counter(); t(x);   t1 = time.perf_counter()-s
s = time.perf_counter(); t(x.T); t2 = time.perf_counter()-s
print(f'column sum along C-order: {t1:.4f}s vs {t2:.4f}s  -> np.ascontiguousarray matters')

# einsum: the same operation, three ways
A = rng.random((3, 4)); B = rng.random((4, 5))
print(np.allclose(A @ B, np.einsum('ij,jk->ik', A, B)))

# Batched attention scores, the pattern behind transformers
Q = rng.random((8, 16, 64)); K = rng.random((8, 16, 64))
scores = np.einsum('bqd,bkd->bqk', Q, K) / np.sqrt(64)
print('scores shape', scores.shape)              # (batch, query, key)

# Broadcasting done right: centre the rows of a matrix
X = rng.random((100, 10))
Xc = X - X.mean(axis=1, keepdims=True)           # keepdims -> (100,1) not (100,)`),
      ul(['keepdims=True is the single most useful argument in NumPy — use it in every reduction you broadcast.',
          'np.ascontiguousarray before heavy BLAS calls can be worth 2-10x on non-contiguous views.',
          'Use out= and in-place ops inside hot loops to avoid allocating gigabytes of temporaries.',
          'float32 halves memory bandwidth vs float64 — usually the right default for ML.'],
         ['آرگومانِ keepdims=True مفیدترین آرگومانِ نام‌پای است — آن را در هر کاهشی که پخش می‌کنید به‌کار ببرید.',
          'فراخوانیِ np.ascontiguousarray پیش از فراخوانی‌های سنگینِ BLAS می‌تواند روی نماهای غیرپیوسته ۲ تا ۱۰ برابر ارزش داشته باشد.',
          'در حلقه‌های داغ از out= و عمل‌های درجا استفاده کنید تا از تخصیصِ گیگابایت‌ حافظه‌ی موقت جلوگیری کنید.',
          'float32 پهنای باندِ حافظه را نسبت به float64 نصف می‌کند — معمولاً پیش‌فرضِ درست برای یادگیری ماشین است.'])
    ],
    ['numpy', 'views', 'einsum', 'strides'],
    [R('NumPy — 100 exercises', 'https://github.com/rougier/numpy-100', 'tool'),
     R('einsum is all you need (Rocktäschel)', 'https://rockt.github.io/2018/04/30/einsum', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('prog-003', D, 'intermediate', 16,
    ['Pandas and Polars: Tidy Data, groupby, Joins and Windows', 'پانداز و پولارز: داده‌ی مرتب، گروه‌بندی، پیوندها و توابع پنجره'],
    ['Most of a data scientist day is reshaping tables. The tidy-data contract (one row per observation, one column per variable) plus groupby-join-window covers about 90% of it.',
     'بیشترِ روزِ یک دانشمند داده صرفِ تغییر شکلِ جدول‌ها می‌شود. قراردادِ داده‌ی مرتب (یک سطر به‌ازای هر مشاهده، یک ستون به‌ازای هر متغیر) به‌علاوه‌ی groupby-join-window حدود ۹۰٪ِ آن را پوشش می‌دهد.'],
    [
      def('Tidy data: each variable is a column, each observation a row, each value a cell. Once data is tidy, groupby-apply-combine, joins and window functions compose freely. Polars offers the same ideas with a lazy query optimizer and true parallelism; pandas remains the ecosystem default.',
          'داده‌ی مرتب: هر متغیر یک ستون، هر مشاهده یک سطر و هر مقدار یک خانه. وقتی داده مرتب شد، groupby-apply-combine، پیوندها و توابعِ پنجره آزادانه ترکیب می‌شوند. پولارز همین ایده‌ها را با یک بهینه‌سازِ پرس‌وجوی تنبل و موازی‌سازیِ واقعی ارائه می‌دهد؛ پانداز همچنان پیش‌فرضِ اکوسیستم است.'),
      math('split-apply-combine:  df.groupby(keys)[col].agg(f)\njoins:    how = inner | left | right | outer | cross         validate="1:1" catches bugs\nwindow:   .groupby(k)[c].transform(f)          -> same shape back, aligned\n          .groupby(k)[c].shift(n) / .diff()    -> lags and deltas\n          .rolling(w).mean()                   -> needs sorted time index\n          .cumsum() / .cummax()                -> running aggregates\nmelt/pivot:  wide <-> long;  wide is for humans, long is for machines'),
      code(`import pandas as pd, numpy as np
rng = np.random.default_rng(0)

orders = pd.DataFrame({
    'user_id': rng.integers(1, 500, 20_000),
    'ts': pd.to_datetime('2025-01-01') + pd.to_timedelta(rng.integers(0, 90*24, 20_000), unit='h'),
    'amount': np.round(rng.lognormal(3, 1, 20_000), 2),
    'channel': rng.choice(['web', 'app', 'store'], 20_000),
})

# 1. Per-user recency, frequency, monetary — the classic RFM table
rfm = (orders.sort_values('ts')
       .groupby('user_id')
       .agg(recency=('ts', lambda s: (orders.ts.max() - s.max()).days),
            frequency=('amount', 'size'),
            monetary=('amount', 'sum')))
print(rfm.describe().round(1))

# 2. Window functions: 7-day rolling revenue & share of each order within a user
daily = (orders.set_index('ts')
         .resample('D')['amount'].sum()
         .rolling(7, min_periods=1).mean())
orders = orders.assign(user_share = orders.amount / orders.groupby('user_id').amount.transform('sum'))

# 3. Join with a dimension table, validating cardinality
users = pd.DataFrame({'user_id': range(1, 500),
                      'country': rng.choice(['DE','FR','US'], 499)})
enriched = orders.merge(users, on='user_id', how='left', validate='m:1')
print(enriched.country.isna().mean(), 'unmatched rows')

# 4. The Polars equivalent of the RFM query (lazy, parallel)
import polars as pl
out = (pl.from_pandas(orders).lazy()
       .group_by('user_id')
       .agg(pl.col('amount').sum().alias('monetary'),
            pl.len().alias('frequency'))
       .sort('monetary', descending=True)
       .collect())
print(out.head(3))`),
      ul(['Always pass validate= to merge; a silently duplicated join has ruined many dashboards.',
          'Sort by time before rolling/lag operations; window functions do not sort for you.',
          'Prefer transform over apply: transform returns an aligned series, apply is slow and fiddly.',
          'Use categorical dtype for low-cardinality strings — big memory and speed wins.'],
         ['همیشه به merge آرگومانِ validate= بدهید؛ یک پیوند که بی‌صدا تکرار می‌سازد داشبوردهای زیادی را خراب کرده است.',
          'پیش از عملیاتِ rolling/lag بر حسبِ زمان مرتب کنید؛ توابعِ پنجره برای شما مرتب نمی‌کنند.',
          'transform را بر apply ترجیح دهید: transform یک سریِ هم‌راستا برمی‌گرداند، apply کند و دردسرساز است.',
          'برای رشته‌های با کاردینالیته‌ی کم از نوعِ categorical استفاده کنید — صرفه‌جوییِ بزرگ در حافظه و سرعت.'])
    ],
    ['pandas', 'polars', 'groupby', 'joins', 'window-functions'],
    [R('pandas user guide — groupby', 'https://pandas.pydata.org/docs/user_guide/groupby.html', 'doc'),
     R('Polars user guide', 'https://docs.pola.rs/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('prog-004', D, 'intermediate', 15,
    ['Data Cleaning, Validation and the Leakage Trap', 'پاک‌سازی داده، اعتبارسنجی و تله‌ی نشت'],
    ['Cleaning is where projects are won. The goal is not pretty data but trustworthy data: validated at the boundary, split before any fitting, and checked for leakage that makes offline scores meaningless.',
     'پاک‌سازی جایی است که پروژه‌ها برده می‌شوند. هدف داده‌ی زیبا نیست، داده‌ی قابل‌اعتماد است: اعتبارسنجی‌شده در مرز، تقسیم‌شده پیش از هر برازش، و بررسی‌شده از نظرِ نشتی که امتیازهای آفلاین را بی‌معنا می‌کند.'],
    [
      def('Data leakage is any information from the future or from the test set seeping into training. Target leakage uses a feature that is a consequence of the label (e.g. a "cancelled_at" column for churn). It produces beautiful offline metrics and a production disaster.',
          'نشتِ داده یعنی هر اطلاعاتی از آینده یا از مجموعه‌ی آزمون که به آموزش نشت کند. نشتِ هدف از ویژگی‌ای استفاده می‌کند که پیامدِ برچسب است (مثلاً ستونِ «تاریخ_لغو» برای پیش‌بینیِ ریزش). این کار معیارهای آفلاینِ زیبا و یک فاجعه در تولید می‌سازد.'),
      math('split BEFORE you fit anything:   train -> fit scaler/imputer/encoder -> transform val/test\nsplit by TIME for forecasting:   train < t0 < val < t1 < test\nsplit by GROUP when rows are correlated (same user, same patient, same store)\n\nleakage smell test:\n  offline AUC 0.98, online 0.62  -> you are leaking, or your split is wrong\ndebugging move:\n  train a model on shuffled labels; if it scores above chance, the pipeline leaks'),
      code(`import pandas as pd, numpy as np
from sklearn.model_selection import train_test_split, GroupKFold, TimeSeriesSplit
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
rng = np.random.default_rng(0)

n = 5000
df = pd.DataFrame({
    'age':    rng.integers(18, 80, n),
    'income': rng.lognormal(10, 1, n),
    'city':   rng.choice(['A','B','C'], n),
    'cust_id':rng.integers(0, 700, n),          # groups: several rows per customer
    'day':    np.arange(n),                     # time ordering
    'churn':  rng.binomial(1, .3, n),
})
df.loc[df.sample(frac=.08).index, 'income'] = np.nan
df.loc[df.sample(frac=.03).index, 'age'] = -1        # sentinel for missing

# 1. Sentinels and impossible values first
df['age'] = df['age'].replace(-1, np.nan)
assert df.age.between(0, 120).all(), 'impossible ages remain'

# 2. Correct splitting: grouped and time-aware beats random
gss = GroupKFold(n_splits=5)
tr, te = next(gss.split(df, df.churn, groups=df.cust_id))
print('grouped split sizes', len(tr), len(te),
      'customer overlap', len(set(df.cust_id[tr]) & set(df.cust_id[te])))

# 3. Fit preprocessing inside the pipeline — never on the full frame
pre = ColumnTransformer([
    ('num', Pipeline([('imp', SimpleImputer(strategy='median')), ('sc', StandardScaler())]), ['age','income']),
    ('cat', OneHotEncoder(handle_unknown='ignore'), ['city']),
])
pipe = Pipeline([('pre', pre), ('clf', LogisticRegression(max_iter=1000))])
pipe.fit(df.iloc[tr].drop(columns=['day','cust_id','churn']), df.churn.iloc[tr])
print('val accuracy', round(pipe.score(df.iloc[te].drop(columns=['day','cust_id','churn']), df.churn.iloc[te]), 4))

# 4. The leakage canary: shuffle the labels and re-score
y_shuf = df.churn.sample(frac=1, random_state=0).values
pipe.fit(df.drop(columns=['day','cust_id','churn']), y_shuf)
print('shuffled-label train score (should be ~chance):',
      round(pipe.score(df.drop(columns=['day','cust_id','churn']), y_shuf), 4))`),
      ul(['Fit imputers, scalers and encoders on the training fold only — the pipeline enforces this.',
          'Watch for "id-like" columns and post-outcome timestamps; drop them explicitly.',
          'Validate at the boundary with a schema (pandera, pydantic, Great Expectations) so bad data fails loudly.',
          'Keep raw data immutable; every cleaning step should be a reproducible function, not a notebook cell.'],
         ['جای‌گذارها، مقیاس‌دهنده‌ها و کدگذارها را تنها روی بخشِ آموزش برازش دهید — خطِ لوله این را تحمیل می‌کند.',
          'مراقب ستون‌های «شبیهِ id» و زمان‌سنج‌های پس از پیامد باشید؛ آن‌ها را صریحاً حذف کنید.',
          'داده را در مرز با یک طرح‌واره (pandera، pydantic، Great Expectations) اعتبارسنجی کنید تا داده‌ی بد با صدای بلند شکست بخورد.',
          'داده‌ی خام را تغییرناپذیر نگه دارید؛ هر گامِ پاک‌سازی باید یک تابعِ تکرارپذیر باشد، نه یک سلولِ نوت‌بوک.'])
    ],
    ['cleaning', 'leakage', 'pipelines', 'validation'],
    [R('sklearn — Common pitfalls (data leakage)', 'https://scikit-learn.org/stable/common_pitfalls.html', 'doc'),
     R('pandera — statistical data validation', 'https://pandera.readthedocs.io/', 'tool')]
  );

  /* ------------------------------------------------------------------ */
  L('prog-005', D, 'intermediate', 15,
    ['SQL for Data Scientists: CTEs, Windows and Query Plans', 'SQL برای دانشمندان داده: CTEها، پنجره‌ها و طرحِ پرس‌وجو'],
    ['SQL is the interface to where the data actually lives. CTEs make queries readable, window functions replace most self-joins, and reading a query plan is how you stop waiting an hour for a result.',
     'SQL رابطِ جایی است که داده واقعاً زندگی می‌کند. CTEها پرس‌وجوها را خواندنی می‌کنند، توابعِ پنجره جای بیشترِ self-joinها را می‌گیرند و خواندنِ طرحِ پرس‌وجو راهی است که دیگر یک ساعت منتظر نتیجه نمانید.'],
    [
      def('A window function computes a value over a set of rows related to the current one, without collapsing them: OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN ...). CTEs (WITH clauses) name intermediate results so a 200-line query reads like a story.',
          'یک تابعِ پنجره مقداری را روی مجموعه‌ای از سطرهای مرتبط با سطرِ جاری حساب می‌کند، بی‌آن‌که آن‌ها را ادغام کند: OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN ...). CTEها (بندهای WITH) نتایجِ میانی را نام‌گذاری می‌کنند تا یک پرس‌وجوی ۲۰۰ خطی مانند یک داستان خوانده شود.'),
      math('ranking :  ROW_NUMBER() | RANK() | DENSE_RANK() | NTILE(4)\noffsets :  LAG(x) | LEAD(x) | FIRST_VALUE(x) | LAST_VALUE(x)\naggs    :  SUM(x) OVER (PARTITION BY k ORDER BY t ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)\n\nframe gotcha:\n  RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  (default, ties included)\n  ROWS  BETWEEN 6 PRECEDING AND CURRENT ROW          (exactly 7 rows)\n\nplan reading (EXPLAIN ANALYZE):\n  scan type (seq vs index) | join type (nested loop / hash / merge)\n  rows estimated vs actual (>10x off -> stale statistics)\n  the biggest number is where your time goes'),
      code(`-- Sessionize events: new session after 30 minutes of inactivity
WITH events AS (
    SELECT user_id, event_ts,
           LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) AS prev_ts
    FROM   raw.events
    WHERE  event_ts >= CURRENT_DATE - INTERVAL '30 days'
),
gaps AS (
    SELECT *,
           CASE WHEN prev_ts IS NULL
                  OR EXTRACT(EPOCH FROM (event_ts - prev_ts)) > 1800
                THEN 1 ELSE 0 END AS new_session
    FROM   events
),
sessions AS (
    SELECT *, SUM(new_session) OVER (PARTITION BY user_id ORDER BY event_ts
                                     ROWS UNBOUNDED PRECEDING) AS session_id
    FROM   gaps
)
SELECT user_id, session_id,
       MIN(event_ts) AS started_at,
       COUNT(*)      AS n_events,
       MAX(event_ts) - MIN(event_ts) AS duration
FROM   sessions
GROUP  BY 1, 2;

-- Slowly changing dimension: pick the latest record per key, no self-join
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) rn
    FROM   dim.customers
) t WHERE rn = 1;

-- Always check the plan before you trust the query
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;`),
      ul(['Filter as early as possible; push predicates into the CTE that scans the table.',
          'Prefer window functions over correlated subqueries — one pass instead of n.',
          'Beware COUNT(DISTINCT) on huge tables; approximate (HLL) when you can.',
          'Materialise an expensive CTE into a temp table if the optimizer re-scans it.'],
         ['تا جای ممکن زود فیلتر کنید؛ شرط‌ها را به CTEای که جدول را می‌خواند بفرستید.',
          'توابعِ پنجره را بر زیرپرس‌وجوهای همبسته ترجیح دهید — یک گذر به‌جای n گذر.',
          'مراقبِ COUNT(DISTINCT) روی جداولِ عظیم باشید؛ در صورت امکان تقریبی (HLL) حساب کنید.',
          'اگر بهینه‌ساز یک CTEِ گران را دوباره می‌خواند، آن را در یک جدولِ موقت مادی‌سازی کنید.'])
    ],
    ['sql', 'window-functions', 'cte', 'query-plan'],
    [R('Mode SQL tutorial (free)', 'https://mode.com/sql-tutorial/', 'course'),
     R('Use The Index, Luke', 'https://use-the-index-luke.com/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('prog-006', D, 'beginner', 12,
    ['Visualization: Choosing the Chart That Tells the Truth', 'مصورسازی: انتخابِ نموداری که راست می‌گوید'],
    ['A chart is an argument. Pick the encoding that matches the question: comparison, distribution, composition, relationship or change over time — and then remove everything that does not help.',
     'یک نمودار یک استدلال است. کدگذاری‌ای را برگزینید که با پرسش هم‌خوان باشد: مقایسه، توزیع، ترکیب، رابطه یا تغییر در زمان — و سپس هرچه کمکی نمی‌کند حذف کنید.'],
    [
      p('Encoding effectiveness, roughly from most to least precise for humans: position along a common axis, length, angle/slope, area, volume, colour hue. So: bars beat pies for comparison, lines beat stacked areas for trends, and a scatter plot beats a bubble chart for relationship.',
        'کاراییِ کدگذاری، تقریباً از دقیق‌ترین به کم‌دقت‌ترین برای انسان: موقعیت روی یک محورِ مشترک، طول، زاویه/شیب، مساحت، حجم، فامِ رنگ. پس: برای مقایسه، میله‌ای از دایره‌ای بهتر است؛ برای روند، خطی از مساحتِ روی‌هم؛ و برای رابطه، پراکندگی از حبابی بهتر است.'),
      math('question -> chart\n  compare categories      -> bar (sorted), never pie with > 3 slices\n  distribution            -> histogram, ECDF, box/violin, strip\n  relationship (2 vars)   -> scatter + trend line\n  relationship (many)     -> scatter matrix / correlation heatmap\n  composition over time   -> stacked bar (not stacked area: area distorts)\n  change over time        -> line chart with direct labels\n  part-to-whole           -> treemap or bar, NOT donut\n  uncertainty             -> error bars, fan charts, bootstrapped bands'),
      code(`import numpy as np, pandas as pd, matplotlib.pyplot as plt
rng = np.random.default_rng(0)

# The same data, three honest ways
grp = pd.DataFrame({'model': ['A','B','C','D'],
                    'score': [0.71, 0.74, 0.738, 0.699],
                    'lo':    [0.68, 0.72, 0.71, 0.66],
                    'hi':    [0.74, 0.76, 0.76, 0.73]})
grp = grp.sort_values('score')

fig, ax = plt.subplots(figsize=(6, 3))
ax.barh(grp.model, grp.score, xerr=[grp.score-grp.lo, grp.hi-grp.score],
        capsize=4, color='#6366f1')
ax.set_xlim(0.6, 0.8); ax.set_xlabel('ROC AUC'); ax.spines[['top','right']].set_visible(False)

# Distribution: ECDF hides nothing, no bin-width choices
x = rng.lognormal(2, 1, 2000)
fig, ax = plt.subplots(1, 2, figsize=(9, 3))
ax[0].hist(x, bins=60, color='#0ea5e9'); ax[0].set_title('histogram (bin choice matters)')
xs = np.sort(x); ys = np.arange(1, len(xs)+1)/len(xs)
ax[1].plot(xs, ys, color='#0ea5e9'); ax[1].set_title('ECDF (no parameters)')

# Log scale for skewed money metrics
fig, ax = plt.subplots(figsize=(5,3))
ax.hist(np.log10(x), bins=40, color='#14b8a6'); ax.set_xlabel('log10(value)')

# Plotly for interactivity in reports
import plotly.express as px
fig = px.scatter(pd.DataFrame({'a': rng.normal(size=500), 'b': rng.normal(size=500)}),
                 x='a', y='b', trendline='ols')
fig.write_html('scatter.html')`),
      ul(['Start the y-axis at zero for bars; for lines, a non-zero baseline is fine but label it.',
          'Direct-label lines instead of relying on a legend — less eye travel.',
          'Use colour for categories, sequential scales for magnitudes, and never both at once.',
          'Show uncertainty by default; a point estimate without a band is an overclaim.'],
         ['برای میله‌ای‌ها محورِ y را از صفر شروع کنید؛ برای خطی‌ها مبنای غیرصفر اشکالی ندارد اما آن را برچسب بزنید.',
          'خطوط را مستقیماً برچسب بزنید نه این‌که به راهنما تکیه کنید — حرکتِ چشم کمتر می‌شود.',
          'رنگ را برای دسته‌ها و مقیاس‌های پیاپی را برای بزرگی‌ها به‌کار ببرید و هرگز هر دو را هم‌زمان.',
          'عدم‌قطعیت را به‌طور پیش‌فرض نشان دهید؛ یک برآوردِ نقطه‌ای بدون بازه، ادعای گزاف است.'])
    ],
    ['visualization', 'matplotlib', 'plotly', 'charts'],
    [R('Fundamentals of Data Visualization (free)', 'https://clauswilke.com/dataviz/', 'book'),
     R('Storytelling with Data', 'https://www.storytellingwithdata.com/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('prog-007', D, 'intermediate', 14,
    ['Feature Engineering: Encoding, Scaling and Interactions', 'مهندسی ویژگی: کدگذاری، مقیاس‌بندی و برهم‌کنش‌ها'],
    ['Features are the ceiling on model performance. Encoding choices, leakage-free transformations and a few domain interactions usually beat switching algorithms.',
     'ویژگی‌ها سقفِ عملکردِ مدل‌اند. انتخاب‌های کدگذاری، تبدیل‌های بدون نشت و چند برهم‌کنشِ حوزه‌ای معمولاً از تعویضِ الگوریتم بهتر جواب می‌دهند.'],
    [
      def('Encoding maps raw data to numbers a model can use: one-hot for nominal categories with low cardinality, ordinal for ordered levels, target/mean encoding for high-cardinality with careful out-of-fold fitting, hashing for unbounded vocabularies. Scaling makes distance- and gradient-based methods behave.',
          'کدگذاری داده‌ی خام را به عددی تبدیل می‌کند که مدل بتواند استفاده کند: یک‌هات برای دسته‌های اسمی با کاردینالیته‌ی کم، ترتیبی برای سطوحِ مرتب، کدگذاریِ هدف/میانگین برای کاردینالیته‌ی بالا با برازشِ دقیقِ خارج از بخش، و هشینگ برای واژگانِ نامحدود. مقیاس‌بندی باعث می‌شود روش‌های مبتنی بر فاصله و گرادیان خوب رفتار کنند.'),
      math('scaling choices:\n  StandardScaler   (x - mu)/sigma     needed for SVM, NN, PCA, kNN, regularized linear\n  MinMaxScaler     [0, 1]             bounded outputs, image pixels\n  RobustScaler     (x - median)/IQR   when outliers are real and must stay\n  QuantileTransformer  -> uniform/normal  non-linear, for tree ensembles too\n  log1p            log(1+x)           positive skewed (money, counts)\n\ntarget encoding (leak-free):\n  enc_i = (mean(y) in fold k of row i) + smoothing toward the global mean\n  smoothing:  enc = (n * m_fold + alpha * m_global) / (n + alpha)\n\ninteractions:  x1*x2 for linear models, ratios and deltas, group aggregates,\n               date parts (dow, hour, is_holiday), text length, recency'),
      code(`import numpy as np, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, FunctionTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import KFold
rng = np.random.default_rng(0)

n = 20_000
df = pd.DataFrame({
    'city':     rng.choice([f'c{i}' for i in range(300)], n),   # high cardinality
    'plan':     rng.choice(['free','pro','enterprise'], n),
    'logins_7d':rng.poisson(3, n),
    'revenue':  np.round(rng.lognormal(3, 1.2, n), 2),
    'tenure_d': rng.integers(0, 1500, n),
    'y':        rng.binomial(1, .2, n),
})

# Out-of-fold target encoding: the only safe way
def oof_target_encode(train, col, y, k=5, alpha=20.0, seed=0):
    enc = pd.Series(index=train.index, dtype=float)
    gmean = y.mean()
    for tr, va in KFold(k, shuffle=True, random_state=seed).split(train):
        m = y.iloc[tr].groupby(train[col].iloc[tr]).agg(['mean','count'])
        sm = (m['count']*m['mean'] + alpha*gmean) / (m['count'] + alpha)
        enc.iloc[va] = train[col].iloc[va].map(sm).fillna(gmean)
    return enc

enc_map = {c: m for c, m in
           ((c, df.y.groupby(df.city).mean()) for c in [None])}
df['city_te'] = oof_target_encode(df, 'city', df.y)
print(df[['city','city_te']].drop_duplicates().head())

# Full preprocessing pipeline
pre = ColumnTransformer([
    ('oh',  OneHotEncoder(handle_unknown='ignore', min_frequency=10), ['plan']),
    ('num', Pipeline([('log', FunctionTransformer(np.log1p)), ('sc', StandardScaler())]),
           ['logins_7d','revenue','tenure_d','city_te']),
])
X = pre.fit_transform(df)
print('design matrix', X.shape, 'sparse?' , hasattr(X, 'tocsr'))`),
      ul(['Fit target encoding inside a cross-validation loop; a global map leaks the label.',
          'One-hot with min_frequency groups the long tail into "other" instead of exploding dimensionality.',
          'Tree models do not need scaling, but they do need sensible categorical handling (or native categorical support).',
          'Write features as pure functions of a row plus a fitted state object — then serving matches training.'],
         ['کدگذاریِ هدف را درونِ یک حلقه‌ی اعتبارسنجیِ متقابل برازش دهید؛ یک نگاشتِ سراسری برچسب را نشت می‌دهد.',
          'یک‌هات با min_frequency دُمِ دراز را در دسته‌ی «سایر» جمع می‌کند تا ابعاد منفجر نشود.',
          'مدل‌های درختی به مقیاس‌بندی نیاز ندارند، اما به مدیریتِ معقولِ دسته‌ای نیاز دارند (یا پشتیبانیِ دسته‌ایِ بومی).',
          'ویژگی‌ها را به‌شکل توابعِ خالص از یک سطر به‌علاوه‌ی یک شیءِ حالتِ برازش‌یافته بنویسید — آن‌گاه سروینگ با آموزش هم‌خوان می‌شود.']),
      note('The serving parity rule: any statistic computed over the full dataset (a mean, a max, a category map) must be stored as part of the model artefact and reused at inference. Recomputing it later is silent training/serving skew.',
           'قاعده‌ی هم‌خوانیِ سروینگ: هر آماره‌ای که روی کلِ مجموعه‌داده حساب می‌شود (یک میانگین، یک بیشینه، یک نگاشتِ دسته‌ای) باید بخشی از خروجیِ مدل ذخیره شود و در استنتاج دوباره استفاده شود. محاسبه‌ی مجددِ آن بعداً، انحرافِ خاموشِ آموزش/سروینگ است.')
    ],
    ['feature-engineering', 'encoding', 'scaling', 'target-encoding'],
    [R('Feature Engineering for ML (Zheng & Casari)', 'https://www.oreilly.com/library/view/feature-engineering-for/9781491953235/', 'book'),
     R('sklearn — preprocessing', 'https://scikit-learn.org/stable/modules/preprocessing.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('prog-008', D, 'advanced', 15,
    ['Data Pipelines, Orchestration and Data Quality', 'خطوط لوله‌ی داده، هماهنگ‌سازی و کیفیتِ داده'],
    ['A model is a small part of a system that ingests, validates, transforms and serves data on a schedule. Pipelines make that system testable and recoverable; orchestration makes it observable.',
     'مدل بخشِ کوچکی از سیستمی است که داده را طبق برنامه می‌گیرد، اعتبارسنجی، تبدیل و سرو می‌کند. خطوطِ لوله این سیستم را قابل‌آزمون و قابل‌بازیابی می‌کنند و هماهنگ‌ساز آن را قابلِ مشاهده می‌کند.'],
    [
      def('An ETL pipeline extracts, transforms and loads; ELT loads raw first and transforms inside the warehouse with SQL (dbt). Orchestrators (Airflow, Dagster, Prefect, Mage) schedule tasks, track dependencies, retry failures and backfill history. Idempotency — rerunning a task gives the same result — is what makes retries safe.',
          'یک خط لوله‌ی ETL داده را استخراج، تبدیل و بارگذاری می‌کند؛ ELT ابتدا خام را بارگذاری می‌کند و سپس درونِ انبار با SQL تبدیل می‌کند (dbt). هماهنگ‌سازها (Airflow، Dagster، Prefect، Mage) وظایف را زمان‌بندی می‌کنند، وابستگی‌ها را ردیابی، شکست‌ها را تکرار و تاریخچه را پُر می‌کنند. بی‌اثر بودن (idempotency) — اینکه اجرای مجددِ یک وظیفه نتیجه‌ی یکسان بدهد — همان چیزی است که تکرار را ایمن می‌کند.'),
      math('pipeline design rules:\n  1. tasks are idempotent and deterministic given inputs + params\n  2. partitions (dt) are the unit of rerun:  backfill one day, not the world\n  3. schema contracts at every boundary; break loudly, alert loudly\n  4. assets not tasks (Dagster): declare the table, not the steps\n\nquality checks (Great Expectations / dbt tests / Soda):\n  not null | unique | accepted values | row count within x% of the 7-day median\n  freshness (max(ts) older than SLA -> alert) | distribution drift (PSI, KS)\n\nlineage: column-level provenance answers "who reads this field?" in seconds'),
      code(`# dbt-style model: declarative, tested, materialised as a table
# models/orders_daily.sql
"""
{{ config(materialized='table', partition_by='dt') }}

select
    date_trunc('day', o.created_at)      as dt,
    o.country,
    count(*)                             as n_orders,
    sum(o.amount)                        as revenue,
    count(distinct o.user_id)            as n_buyers
from {{ ref('stg_orders') }} o
where o.status not in ('cancelled', 'test')
group by 1, 2
"""

# schema.yml — the contract lives next to the model
"""
models:
  - name: orders_daily
    tests:
      - dbt_utils.unique_combination_of_columns: {combination_of_columns: [dt, country]}
    columns:
      - name: revenue
        tests: [not_null, dbt_utils.accepted_range: {min_value: 0}]
      - name: dt
        tests: [not_null]
"""

# Airflow-style DAG, but keep business logic out of the DAG file
from datetime import datetime
# with DAG('daily_features', schedule='0 3 * * *', catchup=True) as dag:
#     extract >> validate >> transform >> publish >> notify

# A minimal, honest data-quality gate in Python
def assert_fresh(df, ts_col, max_age_hours=26):
    age = (pd.Timestamp.utcnow() - df[ts_col].max()).total_seconds()/3600
    assert age <= max_age_hours, f'data is {age:.1f}h old (SLA {max_age_hours}h)'

def assert_no_row_count_shock(df, baseline, tol=0.4):
    assert abs(len(df) - baseline) / baseline < tol, 'row count moved more than 40%'`),
      ul(['Keep transformation logic in tested functions/SQL, not inside orchestration code.',
          'Partition every table by date so backfills are cheap and reruns are scoped.',
          'Alert on freshness and volume, not just on job failure — a green job can emit nothing.',
          'Treat the warehouse as production software: version control, code review, CI, staging.'],
         ['منطقِ تبدیل را در توابع/SQLِ آزمون‌شده نگه دارید، نه درونِ کدِ هماهنگ‌سازی.',
          'هر جدول را بر حسبِ تاریخ پارتیشن‌بندی کنید تا پُرکردنِ گذشته ارزان و اجرای مجدد محدود باشد.',
          'بر تازگی و حجم هشدار بدهید، نه فقط بر شکستِ جاب — یک جابِ سبز می‌تواند هیچ خروجی ندهد.',
          'با انبارِ داده مانند نرم‌افزارِ تولید رفتار کنید: کنترلِ نسخه، بازبینیِ کد، CI، محیطِ آزمایشی.'])
    ],
    ['pipelines', 'airflow', 'dbt', 'data-quality', 'orchestration'],
    [R('Dagster — data orchestrator', 'https://dagster.io/', 'tool'),
     R('dbt documentation', 'https://docs.getdbt.com/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('prog-009', D, 'advanced', 14,
    ['Scaling Out: Parquet, Arrow, Spark, Dask and Cloud Warehouses', 'مقیاس‌دهی: پارکت، اَرو، اسپارک، دَسک و انبارهای ابری'],
    ['When data stops fitting in memory you have three moves: use a better format, use more cores, or push the compute to where the data lives. In that order.',
     'وقتی داده در حافظه جا نمی‌گیرد سه حرکت دارید: فرمتِ بهتر، هسته‌های بیشتر، یا فرستادنِ محاسبه به جایی که داده زندگی می‌کند. به همین ترتیب.'],
    [
      def('Columnar formats (Parquet, ORC) store data column-by-column with compression and statistics, so a query touching 3 of 50 columns reads a fraction of the bytes. Arrow is the in-memory columnar standard that lets pandas, Polars, DuckDB and Spark exchange data with zero copies.',
          'فرمت‌های ستونی (Parquet، ORC) داده را ستون‌به‌ستون با فشرده‌سازی و آماره ذخیره می‌کنند، پس پرس‌وجویی که ۳ ستون از ۵۰ ستون را لمس می‌کند کسر کوچکی از بایت‌ها را می‌خواند. اَرو استانداردِ ستونیِ درون‌حافظه‌ای است که به پانداز، پولارز، DuckDB و اسپارک اجازه می‌دهد داده را بدون کپی مبادله کنند.'),
      math('why Parquet beats CSV:\n  column pruning (read 3 of 50 columns)   -> often 10-20x less I/O\n  row-group statistics -> predicate pushdown skips whole row groups\n  dictionary + RLE + snappy/zstd compression -> 3-10x smaller\n  schema is embedded; types are not guessed\n\ndecision tree:\n  < 10 GB and one machine : DuckDB / Polars / pandas   (do this first, always)\n  10 GB - 1 TB, one box   : DuckDB out-of-core, Polars streaming\n  cluster already exists  : Spark (batch), Flink (streaming)\n  SQL analysts everywhere : warehouse (BigQuery / Snowflake / Databricks)\n\npartitioning: by date and a low-cardinality key; avoid tiny files (target 128-512 MB)'),
      code(`import duckdb, pyarrow.parquet as pq, pandas as pd
import numpy as np
rng = np.random.default_rng(0)

df = pd.DataFrame({'a': rng.normal(size=5_000_000),
                   'b': rng.integers(0, 100, 5_000_000),
                   's': rng.choice(['x','y','z'], 5_000_000)})
df.to_parquet('wide.parquet', compression='zstd')                # columnar + compressed
df.to_csv('wide.csv', index=False)
import os; print('parquet', os.path.getsize('wide.parquet')//1_000_000, 'MB vs csv',
                 os.path.getsize('wide.csv')//1_000_000, 'MB')

# DuckDB: analytic SQL at laptop scale, faster than pandas for most groupbys
con = duckdb.connect()
print(con.execute("""
    SELECT s, count(*) n, avg(a) mean_a, quantile_cont(b, 0.95) p95
    FROM 'wide.parquet' WHERE a > 0 GROUP BY s ORDER BY n DESC
""").df())

# Polars streaming: process a dataset larger than RAM
import polars as pl
print(pl.scan_parquet('wide.parquet')
        .filter(pl.col('a') > 0)
        .group_by('s').agg(pl.len(), pl.col('a').mean())
        .collect(streaming=True))

# PySpark: the same aggregation when the data really lives on a cluster
# (spark.read.parquet(...).groupBy('s').agg(count('*'), mean('a')).show())`),
      ul(['Never read a column you do not need — column pruning is the cheapest optimization there is.',
          'Prefer partitioned Parquet over thousands of CSVs; avoid files smaller than ~128 MB.',
          'Push filters and aggregations into the warehouse/engine; do not pull raw rows into pandas.',
          'Try DuckDB before Spark: for under a few hundred GB it is usually faster, cheaper and simpler.'],
         ['هرگز ستونی را که لازم ندارید نخوانید — حذفِ ستون ارزان‌ترین بهینه‌سازیِ ممکن است.',
          'پارکتِ پارتیشن‌بندی‌شده را بر هزاران فایلِ CSV ترجیح دهید؛ از فایل‌های کوچک‌تر از حدود ۱۲۸ مگابایت بپرهیزید.',
          'فیلترها و تجمیع‌ها را به انبار/موتور بفرستید؛ سطرهای خام را به پانداز نکشید.',
          'پیش از اسپارک، DuckDB را امتحان کنید: برای کمتر از چند صد گیگابایت معمولاً سریع‌تر، ارزان‌تر و ساده‌تر است.'])
    ],
    ['parquet', 'arrow', 'duckdb', 'spark', 'polars'],
    [R('DuckDB — docs', 'https://duckdb.org/docs/', 'doc'),
     R('Apache Parquet format', 'https://parquet.apache.org/docs/', 'doc')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
