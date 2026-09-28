/* =====================================================================
   lessons-06-ml.js  —  14 lessons (classical machine learning)
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'ml';

  /* ------------------------------------------------------------------ */
  L('ml-001', D, 'beginner', 12,
    ['The Machine Learning Workflow and Its Vocabulary', 'گردش‌کارِ یادگیری ماشین و واژگانِ آن'],
    ['Supervised, unsupervised, semi-supervised, self-supervised and reinforcement learning differ only in what feedback you get. Everything else — splits, metrics, tuning — is shared machinery.',
     'یادگیریِ با‌نظارت، بی‌نظارت، نیمه‌نظارتی، خودنظارتی و تقویتی تنها در این تفاوت دارند که چه بازخوردی می‌گیرید. بقیه — تقسیم‌ها، معیارها، تنظیم — ماشین‌آلاتِ مشترک‌اند.'],
    [
      def('Supervised learning learns a map from inputs x to labels y using examples. Unsupervised learning finds structure in x alone. Self-supervised learning invents labels from the data itself (predict the next token, the masked word, the rotated image). Reinforcement learning learns from scalar rewards via trial and error.',
          'یادگیریِ بانظارت نگاشتی از ورودی‌های x به برچسب‌های y را با استفاده از مثال‌ها می‌آموزد. یادگیریِ بی‌نظارت ساختار را در خودِ x پیدا می‌کند. یادگیریِ خودنظارتی برچسب‌ها را از خودِ داده اختراع می‌کند (پیش‌بینیِ توکنِ بعدی، واژه‌ی پوشانده‌شده، تصویرِ چرخانده‌شده). یادگیریِ تقویتی از پاداش‌های اسکالر از راه آزمون و خطا می‌آموزد.'),
      math('dataset   X (n x p),  y (n,)\nmodel     f_theta : x -> y_hat\nloss      L(y, y_hat)            the objective you minimise\nobjective (1/n) SUM L + lambda * Omega(theta)\n\nthe three splits and their jobs:\n  train   fit the parameters\n  val     choose hyperparameters, early stopping, threshold\n  test    touch once, at the very end\n\ngolden rules:\n  1. the test set is a simulation of the future -> split by time or group when possible\n  2. never tune on the test set; you will just measure your own overfitting\n  3. establish a dumb baseline first (majority class, last value, mean)'),
      code(`import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
rng = np.random.default_rng(0)

X = rng.normal(size=(3000, 12))
y = (X[:, 0] + 0.5*X[:, 1]**2 + rng.normal(0, .5, 3000) > 0).astype(int)

Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.2, stratify=y, random_state=0)

# Step 1: baselines. Always.
for strat in ['most_frequent', 'stratified']:
    d = DummyClassifier(strategy=strat).fit(Xtr, ytr)
    print(f'{strat:14s} acc={accuracy_score(yte, d.predict(Xte)):.3f}')

# Step 2: cross-validated estimate of a real model
rf = RandomForestClassifier(n_estimators=300, min_samples_leaf=3, n_jobs=-1, random_state=0)
print('CV ROC AUC', cross_val_score(rf, Xtr, ytr, cv=5, scoring='roc_auc').mean().round(3))

# Step 3: fit on train, evaluate once on test
rf.fit(Xtr, ytr)
print('test ROC AUC', round(roc_auc_score(yte, rf.predict_proba(Xte)[:,1]), 3))`),
      ul(['Start with a baseline and a single feature; complexity is earned, not assumed.',
          'Stratify classification splits; use GroupKFold when rows are not independent.',
          'Write down the metric that matches the business cost before you model.',
          'Most gains come from better data and features, not a fancier algorithm.'],
         ['با یک پایه و یک ویژگی شروع کنید؛ پیچیدگی را باید به دست آورد، نه فرض کرد.',
          'تقسیم‌های دسته‌بندی را طبقه‌بندی‌شده کنید؛ وقتی سطرها مستقل نیستند از GroupKFold استفاده کنید.',
          'پیش از مدل‌سازی، معیاری را که با هزینه‌ی کسب‌وکار هم‌خوان است بنویسید.',
          'بیشترِ دستاوردها از داده و ویژگی‌های بهتر می‌آید، نه از الگوریتمِ عجیب‌تر.'])
    ],
    ['workflow', 'supervised', 'splits', 'baselines'],
    [R('Hands-On ML with Scikit-Learn (Géron)', 'https://github.com/ageron/handson-ml3', 'book'),
     R('sklearn — choosing the right estimator', 'https://scikit-learn.org/stable/tutorial/machine_learning_map/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-002', D, 'intermediate', 16,
    ['Linear Regression, Regularization and the Elastic Net', 'رگرسیون خطی، منظم‌سازی و تورِ الاستیک'],
    ['Linear models are the baseline every project needs and the final model in many. Regularization is the dial between underfitting and overfitting — and it has a Bayesian meaning you already know.',
     'مدل‌های خطی مبنایی هستند که هر پروژه لازم دارد و در بسیاری از پروژه‌ها مدلِ نهایی‌اند. منظم‌سازی ولومِ بینِ کم‌برازش و بیش‌برازش است — و معنای بیزی دارد که از پیش می‌دانید.'],
    [
      def('Ridge (L2) adds lambda * ||w||_2^2 to the loss: shrinkage, keeps all features, handles collinearity gracefully. Lasso (L1) adds lambda * ||w||_1: performs feature selection by driving coefficients to exactly zero. Elastic Net mixes both and is the right default when features are correlated.',
          'ریج (L2) عبارت lambda · ||w||_2^2 را به هزینه می‌افزاید: کوچک‌سازی، نگه‌داشتنِ همه‌ی ویژگی‌ها و مدیریتِ نرمِ هم‌خطی. لاسو (L1) عبارت lambda · ||w||_1 را می‌افزاید: با راندنِ ضرایب به دقیقاً صفر انتخابِ ویژگی انجام می‌دهد. تورِ الاستیک هر دو را می‌آمیزد و وقتی ویژگی‌ها همبسته‌اند پیش‌فرضِ درست است.'),
      math('minimise  (1/2n) SUM (y_i - x_i^T w)^2 + lambda * [ (1-alpha)/2 ||w||_2^2 + alpha ||w||_1 ]\n\n  alpha = 0     -> ridge      (Gaussian prior)   correlated features share weight\n  alpha = 1     -> lasso      (Laplace prior)    sparsity, picks one of a correlated pair\n  0 < a < 1     -> elastic net                    the practical compromise\n\nstandardise FIRST: penalties are not scale-invariant, unscaled features get unfairly shrunk\nchoose lambda by CV over a log grid (e.g. np.logspace(-4, 2, 30))\n\nridge closed form:  w = (X^T X + n*lambda*I)^{-1} X^T y\nlasso: no closed form -> coordinate descent (sklearn) or LARS'),
      code(`import numpy as np
from sklearn.linear_model import Ridge, Lasso, ElasticNetCV, LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import mean_squared_error
rng = np.random.default_rng(0)

n, p = 200, 60                                  # p close to n: OLS will overfit
X = rng.normal(size=(n, p))
w_true = np.zeros(p); w_true[:5] = [3, -2, 1.5, 0, -1]     # only 5 real signals
y = X @ w_true + rng.normal(0, 1, n)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.3, random_state=0)

for name, m in [('OLS', LinearRegression()),
                ('ridge a=1e-2', make_pipeline(StandardScaler(), Ridge(alpha=1e-2))),
                ('ridge a=10',   make_pipeline(StandardScaler(), Ridge(alpha=10))),
                ('lasso a=0.1',  make_pipeline(StandardScaler(), Lasso(alpha=0.1, max_iter=5000)))]:
    m.fit(Xtr, ytr)
    print(f'{name:12s} test MSE={mean_squared_error(yte, m.predict(Xte)):.3f}  '
          f'nonzero coefs={np.sum(np.abs(m[-1].coef_ if hasattr(m, "__len__") else m.coef_) > 1e-6)}')

# Let CV pick both the mixing and the strength
enet = make_pipeline(StandardScaler(), ElasticNetCV(l1_ratio=[.1,.5,.7,.9,.95,1],
                                                    cv=5, n_jobs=-1, max_iter=10_000))
enet.fit(Xtr, ytr)
print('chosen alpha', round(enet[-1].alpha_, 4), 'l1_ratio', enet[-1].l1_ratio)

# Polynomial features expand the hypothesis class; regularisation keeps it honest
poly = make_pipeline(PolynomialFeatures(3, include_bias=False), StandardScaler(),
                     Ridge(alpha=1.0))
print('poly-3 ridge CV R2', cross_val_score(poly, Xtr, ytr, cv=5).mean().round(3))`),
      ul(['Always standardise before penalised regression; the penalty is not scale-invariant.',
          'Ridge with correlated features spreads weight; lasso picks arbitrarily among them — elastic net is safer.',
          'Search lambda on a log grid; the optimum is usually within a factor of 3 of the CV choice.',
          'Interpret coefficients only after checking that features are on comparable scales and not collinear.'],
         ['همیشه پیش از رگرسیونِ جریمه‌ای استانداردسازی کنید؛ جریمه ناوردا نسبت به مقیاس نیست.',
          'ریج با ویژگی‌های همبسته وزن را پخش می‌کند؛ لاسو به‌طور دلبخواه یکی را برمی‌گزیند — تورِ الاستیک ایمن‌تر است.',
          'lambda را روی شبکه‌ی لگاریتمی جست‌وجو کنید؛ نقطه‌ی بهینه معمولاً در ضریبِ ۳ از انتخابِ CV است.',
          'ضرایب را تنها پس از بررسیِ مقیاسِ هم‌سنج و نبودِ هم‌خطی تفسیر کنید.'])
    ],
    ['regression', 'ridge', 'lasso', 'elastic-net'],
    [R('The Elements of Statistical Learning (free)', 'https://hastie.su.domains/ElemStatLearn/', 'book'),
     R('sklearn — linear models', 'https://scikit-learn.org/stable/modules/linear_model.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-003', D, 'intermediate', 15,
    ['Classification: Logistic Regression, Margins and Calibration', 'دسته‌بندی: رگرسیون لجستیک، حاشیه‌ها و کالیبراسیون'],
    ['Logistic regression is a linear model for probabilities, not a classifier someone forgot to make non-linear. Its outputs are well-calibrated by construction — which is rarer and more valuable than it sounds.',
     'رگرسیون لجستیک یک مدل خطی برای احتمال‌هاست، نه دسته‌بندکننده‌ای که کسی یادش رفته غیرخطی‌اش کند. خروجی‌های آن بر حسبِ ساختار کالیبره‌شده‌اند — که نادرتر و ارزشمندتر از آن است که به نظر می‌رسد.'],
    [
      def('Logistic regression models p(y=1|x) = sigma(w^T x) with sigma(z) = 1/(1+e^{-z}). Minimising log loss is maximum-likelihood under a Bernoulli model. The decision boundary is linear in x, so feature engineering (interactions, basis expansions) is where non-linearity comes from.',
          'رگرسیون لجستیک مدل می‌کند p(y=1|x) = sigma(w^T x) با sigma(z) = 1/(1+e^{-z}). کمینه‌سازیِ لاج‌لاس همان بیشینه‌سازیِ درست‌نمایی تحت یک مدلِ برنولی است. مرزِ تصمیم در x خطی است، پس غیرخطی بودن از مهندسیِ ویژگی (برهم‌کنش‌ها، بسط‌های پایه) می‌آید.'),
      math('sigmoid   sigma(z) = 1/(1 + e^{-z})        maps R -> (0, 1)\nlogit     log(p/(1-p)) = w^T x               log-odds is LINEAR\nlog loss  -[ y log p + (1-y) log(1-p) ]      = Bernoulli NLL\nsoftmax   p_k = exp(z_k) / SUM_j exp(z_j)    multi-class generalisation\n\ncalibration:  P(y=1 | p_hat = 0.7) should be 0.7\n  Brier score = mean (p_hat - y)^2        lower is better\n  reliability diagram: bucket by p_hat, plot observed frequency\n  fixes: Platt scaling (sigmoid on the scores) or isotonic regression\n         (isotonic needs more data, is more flexible)'),
      code(`import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import brier_score_loss, log_loss, roc_auc_score
from sklearn.preprocessing import SplineTransformer
rng = np.random.default_rng(0)

X = rng.normal(size=(6000, 8))
logit = 0.8*X[:,0] - 1.2*X[:,1] + 0.5*X[:,0]*X[:,1]      # there IS an interaction
y = (rng.random(6000) < 1/(1+np.exp(-logit))).astype(int)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.3, stratify=y, random_state=0)

lr = LogisticRegression(max_iter=2000).fit(Xtr, ytr)
rf = RandomForestClassifier(n_estimators=400, min_samples_leaf=5, random_state=0).fit(Xtr, ytr)

for name, m in [('logreg', lr), ('random forest', rf)]:
    p = m.predict_proba(Xte)[:,1]
    print(f'{name:14s} AUC={roc_auc_score(yte,p):.3f}  logloss={log_loss(yte,p):.3f}  '
          f'Brier={brier_score_loss(yte,p):.3f}')

# Random forests are badly calibrated; isotonic/Platt fixes it
cal = CalibratedClassifierCV(rf, method='isotonic', cv=5).fit(Xtr, ytr)
p_cal = cal.predict_proba(Xte)[:,1]
print(f'{"RF calibrated":14s} Brier={brier_score_loss(yte,p_cal):.3f}')

# Add the interaction explicitly: linear models can be non-linear in x
from sklearn.pipeline import make_pipeline
pipe = make_pipeline(SplineTransformer(n_knots=5, degree=3, include_bias=False),
                     LogisticRegression(max_iter=2000, C=1.0))
pipe.fit(Xtr, ytr); p2 = pipe.predict_proba(Xte)[:,1]
print(f'{"spline logreg":14s} AUC={roc_auc_score(yte,p2):.3f}  Brier={brier_score_loss(yte,p2):.3f}')`),
      ul(['AUC measures ranking; Brier/log-loss measure calibration — report both when probabilities matter.',
          'Tree ensembles and modern neural nets are typically overconfident; calibrate before using probabilities in decisions.',
          'Class weights (class_weight="balanced") change the fit; threshold moving changes only the decision.',
          'For multi-class use softmax regression; for mutually non-exclusive labels use one-vs-rest with sigmoids.'],
         ['AUC رتبه‌بندی را می‌سنجد؛ Brier/لاج‌لاس کالیبراسیون را — وقتی احتمال‌ها مهم‌اند هر دو را گزارش کنید.',
          'ترکیب‌های درختی و شبکه‌های عصبیِ امروزی معمولاً بیش‌اعتمادند؛ پیش از استفاده از احتمال‌ها در تصمیم‌گیری کالیبره کنید.',
          'وزن‌های کلاس (class_weight="balanced") برازش را تغییر می‌دهند؛ جابه‌جاییِ آستانه تنها تصمیم را تغییر می‌دهد.',
          'برای چندکلاسه از رگرسیونِ سافت‌مکس استفاده کنید؛ برای برچسب‌های غیرمانعة‌الجمع از یک-در-برابر-بقیه با سیگمویدها.'])
    ],
    ['logistic-regression', 'calibration', 'brier', 'softmax'],
    [R('sklearn — probability calibration', 'https://scikit-learn.org/stable/modules/calibration.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-004', D, 'intermediate', 17,
    ['Evaluation: Metrics, ROC/PR Curves and Cross-Validation Strategy', 'ارزیابی: معیارها، منحنی‌های ROC/PR و راهبردِ اعتبارسنجی'],
    ['The metric decides what your model optimises, and the split decides whether the number means anything. Most production failures trace back to one of the two.',
     'معیار تعیین می‌کند مدل چه چیزی را بهینه کند و تقسیم تعیین می‌کند آن عدد اصلاً معنا دارد یا نه. بیشترِ شکست‌های تولید به یکی از این دو برمی‌گردد.'],
    [
      def('Accuracy = (TP+TN)/n is misleading under imbalance. Precision = TP/(TP+FP) is "of the ones we flagged, how many were right"; recall = TP/(TP+FN) is "of the real positives, how many did we catch". F1 is their harmonic mean. ROC-AUC is threshold-free ranking quality; PR-AUC focuses on the positive class and is more informative at low prevalence.',
          'دقت = (TP+TN)/n در شرایطِ عدم‌توازن گمراه‌کننده است. دقتِ مثبت (precision) = TP/(TP+FP) یعنی «از مواردی که پرچم زدیم چندتا درست بود»؛ بازیابی (recall) = TP/(TP+FN) یعنی «از مثبت‌های واقعی چندتا را گرفتیم». F1 میانگینِ هارمونیکِ آن‌هاست. ROC-AUC کیفیتِ رتبه‌بندیِ بدون آستانه است؛ PR-AUC روی کلاسِ مثبت تمرکز دارد و در شیوعِ کم آموزنده‌تر است.'),
      math('confusion matrix columns = predicted, rows = actual\n\n  precision P = TP/(TP+FP)          recall R = TP/(TP+FN)\n  F_beta = (1+b^2) P R / (b^2 P + R)          F1 when b = 1\n  MCC   = (TP*TN - FP*FN)/sqrt((TP+FP)(TP+FN)(TN+FP)(TN+FN))   balanced, use for imbalance\n\nROC: TPR vs FPR over thresholds;  AUC = P(score(pos) > score(neg))\nPR : precision vs recall;          baseline = prevalence (NOT 0.5)\n\ncross-validation choice:\n  KFold            i.i.d. rows              TimeSeriesSplit   temporal\n  StratifiedKFold  classification           GroupKFold        repeated entities\n  LeaveOneOut      tiny data (high variance)\n\nregression:  MAE (median-optimal), RMSE (mean-optimal), MAPE (bad at zero),\n             R^2 (relative to the mean baseline)'),
      code(`import numpy as np
from sklearn.metrics import (precision_recall_curve, roc_curve, auc, average_precision_score,
                             confusion_matrix, matthews_corrcoef, f1_score, classification_report)
from sklearn.model_selection import StratifiedKFold, TimeSeriesSplit, GroupKFold, cross_val_score
from sklearn.ensemble import HistGradientBoostingClassifier
rng = np.random.default_rng(0)

# Imbalanced problem: 1% positives
n = 50_000
X = rng.normal(size=(n, 10))
y = (rng.random(n) < 1/(1+np.exp(-(X[:,0]*1.5 + X[:,1]*0.8 - 3.5)))).astype(int)
print('prevalence', y.mean().round(4))

m = HistGradientBoostingClassifier(random_state=0).fit(X[:40000], y[:40000])
s = m.predict_proba(X[40000:])[:,1]
print('accuracy at 0.5     ', round((m.predict(X[40000:]) == y[40000:]).mean(), 4))
print('average precision   ', round(average_precision_score(y[40000:], s), 4), '(baseline = prevalence)')
print('ROC AUC             ', round(auc(*roc_curve(y[40000:], s)[:2]), 4))

# Pick the threshold that maximises F1 or hits a precision target
P, R, T = precision_recall_curve(y[40000:], s)
f1s = np.divide(2*P*R, P+R, out=np.zeros_like(P), where=(P+R) > 0)
best = T[np.argmax(f1s[:-1])]
print('F1-optimal threshold', round(float(best), 4), 'F1', round(float(f1s[:-1].max()), 4))

# CV strategy matters as much as the model
print('stratified CV', cross_val_score(m, X, y, cv=StratifiedKFold(5), scoring='average_precision').mean().round(4))
groups = rng.integers(0, 5000, n)                       # rows are NOT independent
print('grouped CV   ', cross_val_score(m, X, y, cv=GroupKFold(5), scoring='average_precision',
                                       groups=groups).mean().round(4))
print(classification_report(y[40000:], (s > best).astype(int), digits=3))`),
      ul(['With 1% positives, a PR curve shows reality and a ROC curve flatters you.',
          'For ranking problems use AUC/NDCG/MAP; for decision problems use the metric tied to cost.',
          'CV must mirror production: same grouping, same time ordering, same leakage surface.',
          'Report a confidence interval on the metric (bootstrap over the test set) before declaring a winner.'],
         ['با ۱٪ مثبت، منحنیِ PR واقعیت را نشان می‌دهد و منحنیِ ROC شما را می‌فریبد.',
          'برای مسائلِ رتبه‌بندی از AUC/NDCG/MAP استفاده کنید؛ برای مسائلِ تصمیم از معیاری که به هزینه گره خورده است.',
          'اعتبارسنجیِ متقابل باید آینه‌ی تولید باشد: همان گروه‌بندی، همان ترتیبِ زمانی، همان سطحِ نشت.',
          'پیش از اعلامِ برنده، یک فاصله‌ی اطمینان برای معیار (بوت‌استرپ روی مجموعه‌ی آزمون) گزارش کنید.'])
    ],
    ['metrics', 'roc', 'precision-recall', 'cross-validation', 'imbalance'],
    [R('The Relationship Between Precision-Recall and ROC Curves (Davis & Goadrich)', 'https://dl.acm.org/doi/10.1145/1143844.1143874', 'paper'),
     R('sklearn — metrics and scoring', 'https://scikit-learn.org/stable/modules/model_evaluation.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-005', D, 'intermediate', 14,
    ['Hyperparameter Tuning: Grid, Random and Bayesian Optimisation', 'تنظیمِ ابرپارامترها: شبکه‌ای، تصادفی و بهینه‌سازیِ بیزی'],
    ['Random search beats grid search because most hyperparameters do not matter equally. Bayesian optimisation beats both when evaluations are expensive, by modelling the response surface.',
     'جست‌وجوی تصادفی از جست‌وجوی شبکه‌ای بهتر است چون بیشترِ ابرپارامترها به یک اندازه مهم نیستند. بهینه‌سازیِ بیزی وقتی ارزیابی‌ها گران‌اند از هر دو بهتر است، با مدل‌سازیِ سطحِ پاسخ.'],
    [
      def('A hyperparameter is set before training (depth, learning rate, lambda); a parameter is learned (weights). Nested cross-validation gives an unbiased estimate of the tuned model performance: an outer loop for evaluation, an inner loop for tuning.',
          'یک ابرپارامتر پیش از آموزش تنظیم می‌شود (عمق، نرخِ یادگیری، lambda)؛ یک پارامتر آموخته می‌شود (وزن‌ها). اعتبارسنجیِ متقابلِ تودرتو برآوردی نااُریب از عملکردِ مدلِ تنظیم‌شده می‌دهد: یک حلقه‌ی بیرونی برای ارزیابی و یک حلقه‌ی درونی برای تنظیم.'),
      math('grid:    k^d evaluations              wastes budget on useless dimensions\nrandom:  k evaluations, each dim sampled independently\n         with 2 useful of d dims, random covers far more of the useful space\n\nsuccessive halving: train a little on many configs, keep the best fraction,\n         give them more budget -> Hyperband automates the schedule\n\nBayesian optimisation (TPE, GP):\n  surrogate model p(score | config)  +  acquisition function\n    EI   expected improvement\n    UCB  upper confidence bound\n    PI   probability of improvement\n  each trial costs a model fit, so use it when an evaluation takes minutes+\n\nlog-uniform priors for rates:  lr ~ LogUniform(1e-5, 1e-1)\nint-uniform for depth:         depth ~ Int(3, 12)'),
      code(`import numpy as np, time
from scipy.stats import loguniform, randint
from sklearn.model_selection import RandomizedSearchCV, GridSearchCV, cross_val_score
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=20_000, n_features=30, n_informative=8,
                           weights=[.8,.2], random_state=0)

space = {'learning_rate': loguniform(1e-3, 3e-1),
         'max_leaf_nodes': randint(8, 128),
         'min_samples_leaf': randint(5, 100),
         'l2_regularization': loguniform(1e-3, 10),
         'max_iter': randint(100, 400)}

search = RandomizedSearchCV(HistGradientBoostingClassifier(random_state=0), space,
                            n_iter=40, cv=3, scoring='average_precision',
                            n_jobs=-1, random_state=0)
t = time.perf_counter(); search.fit(X, y)
print('random search best AP', round(search.best_score_, 4), 'in',
      round(time.perf_counter()-t, 1), 's ->', search.best_params_)

# Optuna: TPE + pruning, the modern default
import optuna, sklearn.model_selection as ms
optuna.logging.set_verbosity(optuna.logging.WARNING)

def objective(trial):
    params = {'learning_rate': trial.suggest_float('lr', 1e-3, 3e-1, log=True),
              'max_leaf_nodes': trial.suggest_int('leaves', 8, 128),
              'min_samples_leaf': trial.suggest_int('leaf', 5, 100),
              'l2_regularization': trial.suggest_float('l2', 1e-3, 10, log=True)}
    return cross_val_score(HistGradientBoostingClassifier(max_iter=200, **params),
                           X, y, cv=3, scoring='average_precision').mean()

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=40)
print('optuna best AP', round(study.best_value, 4), '->', study.best_params)`),
      ul(['Search on a log scale for anything multiplicative (learning rates, regularization).',
          'Use early stopping / pruning: kill unpromising trials after a fraction of the budget.',
          'Tune on the validation split, then refit on train+val and evaluate once on test.',
          'Record every trial — the search history is the most underrated artefact in ML.'],
         ['برای هر چیزِ ضربی (نرخ‌های یادگیری، منظم‌سازی) در مقیاسِ لگاریتمی جست‌وجو کنید.',
          'از توقفِ زودهنگام/هرس‌کردن استفاده کنید: آزمایش‌های ناامیدکننده را پس از کسری از بودجه بکشید.',
          'روی بخشِ اعتبارسنجی تنظیم کنید، سپس روی آموزش+اعتبارسنجی بازبرازش دهید و یک‌بار روی آزمون ارزیابی کنید.',
          'هر آزمایش را ثبت کنید — تاریخچه‌ی جست‌وجو کم‌قدردیده‌شده‌ترین خروجی در یادگیری ماشین است.'])
    ],
    ['tuning', 'random-search', 'bayesian', 'optuna', 'hyperband'],
    [R('Random Search for Hyper-Parameter Optimization (Bergstra & Bengio)', 'https://jmlr.org/papers/v13/bergstra12a.html', 'paper'),
     R('Optuna documentation', 'https://optuna.readthedocs.io/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-006', D, 'intermediate', 16,
    ['Decision Trees, Bagging and Random Forests', 'درخت‌های تصمیم، بگینگ و جنگل‌های تصادفی'],
    ['A tree asks a sequence of yes/no questions about features. Averaging many decorrelated trees (bagging) turns a high-variance, low-bias model into one of the most reliable tools in applied ML.',
     'یک درخت دنباله‌ای از پرسش‌های بله/خیر درباره‌ی ویژگی‌ها می‌پرسد. میانگین‌گیری از درخت‌های زیادِ ناهمبسته (بگینگ) مدلی با واریانسِ بالا و اُریبِ کم را به یکی از قابل‌اعتمادترین ابزارهای یادگیری ماشینِ کاربردی تبدیل می‌کند.'],
    [
      def('A tree splits the feature space into axis-aligned rectangles, choosing at each node the split that maximises purity gain: Gini or entropy for classification, variance reduction for regression. Bagging (bootstrap aggregating) trains trees on resampled data and averages; random forests additionally sample features per split to decorrelate the trees.',
          'یک درخت فضای ویژگی را به مستطیل‌های هم‌راستا با محورها تقسیم می‌کند و در هر گره گسلی را برمی‌گزیند که افزایشِ خلوص را بیشینه کند: جینی یا آنتروپی برای دسته‌بندی، کاهشِ واریانس برای رگرسیون. بگینگ (تجمیعِ بوت‌استرپ) درخت‌ها را روی داده‌های بازنمونه‌گیری‌شده آموزش می‌دهد و میانگین می‌گیرد؛ جنگل‌های تصادفی علاوه بر آن در هر گسُل ویژگی‌ها را نیز نمونه‌گیری می‌کنند تا همبستگیِ درخت‌ها کم شود.'),
      math('Gini(node)      = 1 - SUM_k p_k^2                 0 = pure\nentropy(node)   = -SUM_k p_k log2 p_k\ninformation gain = impurity(parent) - SUM_j (n_j/n) impurity(child_j)\nvariance reduction (regression): SSR = SS_before - (SS_left + SS_right)\n\nrandom forest prediction:  y_hat = (1/B) SUM_b T_b(x)\nout-of-bag error: for each row, average only the trees that did NOT see it\n                 -> a free validation set, no hold-out needed\n\nfeature importance trap:\n  impurity-based importance favours high-cardinality features\n  -> prefer permutation importance (or group it for correlated features)'),
      code(`import numpy as np
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=8000, n_features=20, n_informative=5,
                           n_redundant=5, random_state=0)
names = [f'f{i}' for i in range(X.shape[1])]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.25, stratify=y, random_state=0)

rf = RandomForestClassifier(n_estimators=500, max_features='sqrt', min_samples_leaf=3,
                            oob_score=True, n_jobs=-1, random_state=0).fit(Xtr, ytr)
print('test AUC', round(roc_auc_score(yte, rf.predict_proba(Xte)[:,1]), 4),
      '| OOB', round(rf.oob_score_, 4))

# Impurity vs permutation importance: they disagree, trust the second
imp = np.argsort(rf.feature_importances_)[::-1][:6]
print('impurity-based top features :', [names[i] for i in imp])
perm = permutation_importance(rf, Xte, yte, n_repeats=10, scoring='roc_auc', random_state=0)
top = np.argsort(perm.importances_mean)[::-1][:6]
print('permutation top features    :', [names[i] for i in top])

# A single tree for interpretability, a forest for accuracy
from sklearn.tree import DecisionTreeClassifier, export_text, plot_tree
small = DecisionTreeClassifier(max_depth=3, random_state=0).fit(Xtr, ytr)
print(export_text(small, feature_names=names, max_depth=3)[:600])`),
      ul(['min_samples_leaf is the most effective regularizer for trees; depth alone overfits less predictably.',
          'max_features="sqrt" for classification, ~1/3 for regression; fewer features = more decorrelation.',
          'Out-of-bag estimates let you skip a validation split during exploration.',
          'Trees extrapolate poorly: a forest cannot predict values outside the training range of y.'],
         ['min_samples_leaf مؤثرترین منظم‌ساز برای درخت‌هاست؛ عمق به‌تنهایی رفتارِ کم‌برازشِ پیش‌بینی‌ناپذیرتری دارد.',
          'برای دسته‌بندی max_features="sqrt" و برای رگرسیون حدود یک‌سوم؛ ویژگی‌های کمتر یعنی ناهمبستگیِ بیشتر.',
          'برآوردهای خارج-از-کیسه اجازه می‌دهند در مرحله‌ی کاوش از تقسیمِ اعتبارسنجی صرف‌نظر کنید.',
          'درخت‌ها برون‌یابی را بد انجام می‌دهند: یک جنگل نمی‌تواند مقادیری خارج از بازه‌ی آموزشِ y پیش‌بینی کند.'])
    ],
    ['trees', 'random-forest', 'bagging', 'importance'],
    [R('Understanding Random Forests (Louppe)', 'https://arxiv.org/abs/1407.7502', 'paper'),
     R('sklearn — ensemble methods', 'https://scikit-learn.org/stable/modules/ensemble.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-007', D, 'advanced', 18,
    ['Gradient Boosting: XGBoost, LightGBM, CatBoost', 'تقویتِ گرادیانی: XGBoost، LightGBM، CatBoost'],
    ['Boosting builds trees sequentially, each one fitting the residual errors of the ensemble so far. Done carefully it is still the best thing you can do with tabular data — and often beats deep learning there.',
     'بوستینگ درخت‌ها را پیاپی می‌سازد، هر کدام خطاهای باقیمانده‌ی ترکیبِ تا آن لحظه را برازش می‌دهد. اگر با دقت انجام شود هنوز بهترین کاری است که با داده‌ی جدولی می‌توانید بکنید — و اغلب در این حوزه از یادگیری عمیق بهتر است.'],
    [
      def('Gradient boosting performs gradient descent in function space: at each step it fits a new weak learner to the negative gradient of the loss with respect to the current predictions. The three dominant libraries differ in tree construction, categorical handling and speed/accuracy trade-offs.',
          'تقویتِ گرادیانی گرادیانِ نزولی را در فضای تابع انجام می‌دهد: در هر گام یک یادگیرنده‌ی ضعیفِ جدید را بر منفیِ گرادیانِ هزینه نسبت به پیش‌بینی‌های فعلی برازش می‌دهد. سه کتابخانه‌ی غالب در ساختِ درخت، مدیریتِ دسته‌ای و بده‌بستانِ سرعت/دقت تفاوت دارند.'),
      math('additive model:   F_m(x) = F_{m-1}(x) + nu * h_m(x)\n  h_m fits the negative gradient  g_i = -dL(y_i, F(x_i))/dF(x_i)\n  nu = learning rate (shrinkage), typically 0.01-0.2; smaller nu needs more trees\n\nXGBoost objective (second-order):\n  L ~ SUM_i [ g_i h(x_i) + 0.5 h_i h(x_i)^2 ] + Omega(h),   Omega = gamma T + 0.5 lambda ||w||^2\n  gain of a split = 0.5 [ G_L^2/(H_L+lambda) + G_R^2/(H_R+lambda) - G^2/(H+lambda) ] - gamma\n\nkey knobs:  n_estimators + early_stopping_rounds, learning_rate, max_depth (3-10),\n  subsample & colsample_bytree (stochasticity), min_child_weight, lambda/alpha, gamma\n\nlibrary flavours:\n  XGBoost  exact + histogram, GPU, very tunable\n  LightGBM histogram + leaf-wise growth, fastest, GOSS/EFB sampling\n  CatBoost ordered target statistics for categoricals, robust defaults'),
      code(`import numpy as np, pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, average_precision_score
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=60_000, n_features=40, n_informative=10,
                           weights=[.9,.1], random_state=0)
Xtr, Xva, ytr, yva = train_test_split(X, y, test_size=.2, stratify=y, random_state=0)

import xgboost as xgb
dtr = xgb.DMatrix(Xtr, ytr); dva = xgb.DMatrix(Xva, yva)
params = dict(objective='binary:logistic', eval_metric='auc', tree_method='hist',
              learning_rate=0.05, max_depth=6, subsample=0.8, colsample_bytree=0.8,
              min_child_weight=5, reg_lambda=1.0, nthread=8, seed=0)
bst = xgb.train(params, dtr, num_boost_round=3000, evals=[(dva,'va')],
                early_stopping_rounds=100, verbose_eval=False)
print('XGB best iters', bst.best_iteration, 'AUC',
      round(roc_auc_score(yva, bst.predict(dva, iteration_range=(0, bst.best_iteration+1))), 4))

import lightgbm as lgb
m = lgb.train(dict(objective='binary', metric='auc', learning_rate=.05, num_leaves=63,
                   feature_fraction=.8, bagging_fraction=.8, bagging_freq=1, verbose=-1),
              lgb.Dataset(Xtr, ytr), num_boost_round=1000,
              valid_sets=[lgb.Dataset(Xva, yva)],
              callbacks=[lgb.early_stopping(100, verbose=False)])
print('LGBM best iters', m.best_iteration, 'AUC', round(roc_auc_score(yva, m.predict(Xva)), 4))

# Native categorical support (the reason to reach for CatBoost)
from catboost import CatBoostClassifier
df = pd.DataFrame(X[:, :5], columns=list('abcde'))
df['cat'] = pd.Series(np.random.choice(['p','q','r'], len(df))).astype('category')
cb = CatBoostClassifier(iterations=500, learning_rate=.05, depth=6,
                        cat_features=['cat'], verbose=False)
cb.fit(df.iloc[:40000], y[:40000], eval_set=(df.iloc[40000:], y[40000:]),
       use_best_model=True)
print('CatBoost AUC', round(roc_auc_score(y[40000:], cb.predict_proba(df.iloc[40000:])[:,1]), 4))`),
      ul(['Always use early stopping with a validation set; the number of trees is the main overfitting knob.',
          'Lower learning rate + more trees wins, given patience and early stopping.',
          'Handle categoricals natively (CatBoost, LightGBM categorical_feature) instead of one-hot for high-cardinality.',
          'SHAP values from tree models are exact and fast (TreeExplainer) — a real advantage over neural nets.'],
         ['همیشه با یک مجموعه‌ی اعتبارسنجی از توقفِ زودهنگام استفاده کنید؛ تعدادِ درخت‌ها اصلی‌ترین ولومِ بیش‌برازش است.',
          'نرخِ یادگیریِ کمتر + درخت‌های بیشتر برنده است، به شرطِ صبر و توقفِ زودهنگام.',
          'برای کاردینالیته‌ی بالا، دسته‌ای‌ها را به‌صورت بومی مدیریت کنید (CatBoost، categorical_feature در LightGBM) نه با یک‌هات.',
          'مقادیرِ SHAP در مدل‌های درختی دقیق و سریع‌اند (TreeExplainer) — یک مزیتِ واقعی نسبت به شبکه‌های عصبی.'])
    ],
    ['boosting', 'xgboost', 'lightgbm', 'catboost', 'shap'],
    [R('XGBoost: A Scalable Tree Boosting System', 'https://arxiv.org/abs/1603.02754', 'paper'),
     R('LightGBM: A Highly Efficient GBDT', 'https://papers.nips.cc/paper/6907-lightgbm-a-highly-efficient-gradient-boosting-decision-tree', 'paper'),
     R('Why tree ensembles beat deep learning on tabular data', 'https://arxiv.org/abs/2207.08815', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-008', D, 'advanced', 15,
    ['Support Vector Machines and the Kernel Trick', 'ماشین‌های بردار پشتیبان و ترفندِ کرنل'],
    ['The SVM finds the widest possible margin between classes, and the kernel trick lets it do so in an infinite-dimensional feature space without ever computing the coordinates there.',
     'ماشینِ بردار پشتیبان وسیع‌ترین حاشیه‌ی ممکن بینِ کلاس‌ها را پیدا می‌کند و ترفندِ کرنل اجازه می‌دهد این کار را در یک فضای ویژگیِ بی‌بُعد انجام دهد بی‌آن‌که هرگز مختصاتِ آن‌جا را حساب کند.'],
    [
      def('A kernel k(x, x\') is a function that equals an inner product in some (possibly infinite-dimensional) feature space: k(x, x\') = <phi(x), phi(x\')>. Any algorithm that only uses inner products can be "kernelised". This is the representer theorem in action, and it is also exactly what a Gaussian process is.',
          'یک کرنلِ k(x, x\') تابعی است که با یک ضربِ داخلی در فضای ویژگی‌ای (احتمالاً بی‌بُعد) برابر است: k(x, x\') = <phi(x), phi(x\')>. هر الگوریتمی که تنها از ضرب‌های داخلی استفاده کند می‌تواند «کرنلی» شود. این قضیه‌ی نماینده در عمل است و دقیقاً همان چیزی است که یک فرایند گاوسی هست.'),
      math('hard margin:  minimise 0.5||w||^2  s.t.  y_i (w^T x_i + b) >= 1\nsoft margin:  minimise 0.5||w||^2 + C SUM_i xi_i\n   C large -> fewer margin violations (low bias, high variance);  C small -> smoother\n\ndual:  maximise  SUM a_i - 0.5 SUM_i SUM_j a_i a_j y_i y_j k(x_i, x_j)\n   s.t. 0 <= a_i <= C,  SUM a_i y_i = 0\n   prediction: f(x) = sign( SUM_i a_i y_i k(x_i, x) + b )\n   only points with a_i > 0 matter -> the SUPPORT VECTORS (complementarity!)\n\nkernels:\n  linear     x^T x\'\n  polynomial (gamma x^T x\' + r)^d\n  RBF/Gauss  exp(-gamma ||x - x\'||^2)      gamma too big -> overfit\n  Laplacian  exp(-gamma ||x - x\'||_1)      less smooth'),
      code(`import numpy as np
from sklearn.svm import SVC, SVR, LinearSVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.datasets import make_moons, make_circles
rng = np.random.default_rng(0)

# Non-linearly separable data: where kernels shine
X, y = make_moons(n_samples=2000, noise=0.2, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.3, random_state=0)

pipe = make_pipeline(StandardScaler(), SVC(kernel='rbf', probability=True))
gs = GridSearchCV(pipe, {'svc__C': np.logspace(-2, 3, 6),
                         'svc__gamma': np.logspace(-3, 2, 6)},
                  cv=5, n_jobs=-1).fit(Xtr, ytr)
print('best', gs.best_params_, 'AUC', round(roc_auc_score(yte, gs.predict_proba(Xte)[:,1]), 4))

# Scaling is mandatory for SVMs: distances drive everything
raw = SVC(kernel='rbf').fit(Xtr, ytr)
std = make_pipeline(StandardScaler(), SVC(kernel='rbf')).fit(Xtr, ytr)
print('unscaled acc', round(raw.score(Xte, yte), 3), '| scaled acc', round(std.score(Xte, yte), 3))

# SVMs do not scale: O(n^2)-O(n^3). Use linear solvers for big sparse data
Xbig, ybig = make_classification(n_samples=200_000, n_features=100, random_state=0)
lin = make_pipeline(StandardScaler(with_mean=False), LinearSVC(C=0.1, dual=True))
print('LinearSVC on 200k rows fits in seconds; an RBF SVC would not.')

# Kernel ridge / GP connection: the same maths, a probabilistic output
from sklearn.kernel_ridge import KernelRidge
kr = make_pipeline(StandardScaler(), KernelRidge(kernel='rbf', gamma=0.1, alpha=1.0))`),
      ul(['Standardise features before any kernel method; gamma and C assume comparable scales.',
          'Use LinearSVC / SGDClassifier for large or sparse data; RBF kernels are O(n^2) memory.',
          'SVMs give no probabilities by default — use probability=True (slow) or calibrate separately.',
          'Tune C and gamma on a log grid; gamma controls the smoothness of the boundary.'],
         ['پیش از هر روشِ کرنلی ویژگی‌ها را استاندارد کنید؛ gamma و C مقیاس‌های هم‌سنج را فرض می‌کنند.',
          'برای داده‌ی بزرگ یا تنک از LinearSVC / SGDClassifier استفاده کنید؛ کرنل‌های RBF حافظه‌ی O(n^2) می‌خواهند.',
          'ماشین‌های بردار پشتیبان به‌طور پیش‌فرض احتمال نمی‌دهند — از probability=True (کند) استفاده کنید یا جداگانه کالیبره کنید.',
          'C و gamma را روی شبکه‌ی لگاریتمی تنظیم کنید؛ gamma همواریِ مرز را کنترل می‌کند.'])
    ],
    ['svm', 'kernels', 'rbf', 'margin'],
    [R('A Tutorial on Support Vector Machines (Burges)', 'https://link.springer.com/article/10.1023/A:1009715923555', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-009', D, 'intermediate', 16,
    ['Clustering: k-means, Hierarchical, DBSCAN and GMM', 'خوشه‌بندی: k-means، سلسله‌مراتبی، DBSCAN و GMM'],
    ['Clustering has no labels, so there is no single right answer — only answers that are useful for a purpose. Each algorithm encodes a different assumption about what a cluster is.',
     'در خوشه‌بندی برچسب نداریم، پس پاسخِ درستِ واحدی وجود ندارد — تنها پاسخ‌هایی که برای هدفی مفیدند. هر الگوریتم فرضی متفاوت درباره‌ی این‌که خوشه چیست در خود دارد.'],
    [
      def('k-means assumes spherical, similarly-sized clusters and minimises within-cluster variance. DBSCAN assumes dense regions separated by sparse ones and finds arbitrarily-shaped clusters plus outliers. Hierarchical builds a tree of merges (agglomerative) with no need to pre-specify k. GMM fits a mixture of Gaussians and gives soft, elliptical clusters.',
          'k-means خوشه‌های کروی و هم‌اندازه را فرض می‌کند و واریانسِ درون‌خوشه‌ای را کمینه می‌کند. DBSCAN نواحیِ چگالِ جداشده با نواحیِ تنک را فرض می‌کند و خوشه‌هایی با هر شکلی به‌همراهِ داده‌های پرت می‌یابد. روشِ سلسله‌مراتبی درختی از ادغام‌ها می‌سازد (تجمیعی) و نیازی به تعیینِ k ندارد. GMM آمیخته‌ای از گاوسی‌ها را برازش می‌دهد و خوشه‌های نرم و بیضوی می‌دهد.'),
      math('k-means objective:  minimise SUM_i ||x_i - mu_{c(i)}||^2\n  Lloyd algorithm: assign to nearest centroid, recompute centroids, repeat\n  k-means++ init   : spread initial centres -> much better local optima\n  elbow / silhouette / gap statistic to pick k\n  silhouette s(i) = (b(i) - a(i)) / max(a(i), b(i))  in [-1, 1]\n\nDBSCAN:  eps (neighbourhood radius) + min_samples\n  core point: >= min_samples within eps; border; noise (-1)\n  no k needed, finds noise, struggles with varying density (-> HDBSCAN)\n\nGMM / EM:  p(x) = SUM_k pi_k N(x | mu_k, Sigma_k)\n  E-step responsibilities -> M-step weighted MLE;  BIC to choose k'),
      code(`import numpy as np
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.mixture import GaussianMixture
from sklearn.datasets import make_blobs, make_moons
from sklearn.metrics import silhouette_score, adjusted_rand_score
from sklearn.preprocessing import StandardScaler
rng = np.random.default_rng(0)

X, y_true = make_blobs(n_samples=1500, centers=4, cluster_std=1.0, random_state=0)
X = StandardScaler().fit_transform(X)

# Choosing k: silhouette peaks at the "right" answer here
for k in range(2, 8):
    lab = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)
    print(f'k={k}  inertia={KMeans(n_clusters=k, n_init=10, random_state=0).fit(X).inertia_:8.1f}  '
          f'silhouette={silhouette_score(X, lab):.3f}')

# Compare algorithms on non-spherical data
moons, mlab = make_moons(n_samples=800, noise=.05, random_state=0)
moons = StandardScaler().fit_transform(moons)
for name, m in [('k-means', KMeans(2, n_init=10, random_state=0)),
                ('agglomerative', AgglomerativeClustering(2, linkage='ward')),
                ('DBSCAN', DBSCAN(eps=0.25, min_samples=8)),
                ('GMM', GaussianMixture(2, covariance_type='full', random_state=0))]:
    lab = m.fit_predict(moons)
    ari = adjusted_rand_score(mlab, lab) if len(set(lab)) > 1 else float('nan')
    print(f'{name:14s} clusters={len(set(lab))}  ARI={ari:.3f}')

# GMM gives probabilities and a principled k via BIC
bics = [GaussianMixture(k, random_state=0).fit(X).bic(X) for k in range(1, 9)]
print('BIC-optimal k =', int(np.argmin(bics)) + 1)`),
      ul(['Scale before clustering; distance-based methods are dominated by the largest-variance feature.',
          'k-means needs the number of clusters up front and fails on nested or crescent shapes.',
          'HDBSCAN removes DBSCAN eps tuning and handles varying density — the practical default for shape-based clustering.',
          'Validate clusters against a downstream task; a silhouette score of 0.4 can still be perfectly useful.'],
         ['پیش از خوشه‌بندی مقیاس کنید؛ روش‌های مبتنی بر فاصله تحت سلطه‌ی ویژگی‌ای با بزرگ‌ترین واریانس‌اند.',
          'k-means تعدادِ خوشه‌ها را از پیش می‌خواهد و روی شکل‌های تودرتو یا هلالی شکست می‌خورد.',
          'HDBSCAN تنظیمِ eps را حذف می‌کند و با چگالیِ متغیر کنار می‌آید — پیش‌فرضِ عملی برای خوشه‌بندیِ مبتنی بر شکل.',
          'خوشه‌ها را در برابر یک وظیفه‌ی پایین‌دستی اعتبارسنجی کنید؛ امتیازِ silhouette برابر ۰/۴ هم می‌تواند کاملاً مفید باشد.'])
    ],
    ['clustering', 'kmeans', 'dbscan', 'gmm'],
    [R('sklearn — clustering', 'https://scikit-learn.org/stable/modules/clustering.html', 'doc'),
     R('HDBSCAN documentation', 'https://hdbscan.readthedocs.io/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-010', D, 'intermediate', 15,
    ['Dimensionality Reduction: PCA, t-SNE and UMAP', 'کاهشِ بُعد: PCA، t-SNE و UMAP'],
    ['PCA finds directions of maximum variance (linear, interpretable, fast). t-SNE and UMAP preserve local neighbourhood structure (non-linear, great for visualisation, dangerous for anything else).',
     'PCA جهت‌های بیشترین واریانس را می‌یابد (خطی، تفسیرپذیر، سریع). t-SNE و UMAP ساختارِ همسایگیِ موضعی را حفظ می‌کنند (غیرخطی، عالی برای مصورسازی، خطرناک برای هر چیزِ دیگر).'],
    [
      def('PCA projects onto the top eigenvectors of the covariance matrix — the best linear reconstruction of the data in a lower dimension. t-SNE minimises the KL divergence between similarity distributions in high and low dimensions, optimised only for visualisation. UMAP preserves both local and some global structure using topological/fuzzy-simplicial-set ideas.',
          'PCA روی بردارهای ویژه‌ی برترِ ماتریس کوواریانس تصویر می‌کند — بهترین بازسازیِ خطیِ داده در بُعدی پایین‌تر. t-SNE واگراییِ KL بین توزیع‌های شباهت در بُعدِ بالا و پایین را کمینه می‌کند و تنها برای مصورسازی بهینه شده است. UMAP با ایده‌های توپولوژیک/مجموعه‌های سیمپلیسیِ فازی، ساختارِ موضعی و بخشی از ساختارِ سراسری را حفظ می‌کند.'),
      math('PCA:  centre X, SVD  X = U S V^T,  scores = U_k S_k\n  explained variance ratio of component i = s_i^2 / SUM_j s_j^2\n  choose k for ~90-95% cumulative variance, or by a reconstruction-error knee\n  whitening: divide scores by s_i -> unit variance, decorrelated\n\nt-SNE:   p_{j|i} ~ exp(-||x_i-x_j||^2 / 2 sigma_i^2)   (perplexity sets sigma)\n         q_{j|i} ~ (1 + ||y_i-y_j||^2)^{-1}             (Student-t in the map)\n         minimise KL(P||Q);  perplexity 5-50, lr 200-1000\n\ncaveats:  cluster SIZES in t-SNE are meaningless; distances between clusters are\n          meaningless; run several perplexities before believing any structure'),
      code(`import numpy as np
from sklearn.decomposition import PCA, IncrementalPCA
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_digits
import matplotlib.pyplot as plt
rng = np.random.default_rng(0)

digits = load_digits(); X, y = digits.data, digits.target
Xs = StandardScaler().fit_transform(X)

pca = PCA().fit(Xs)
cum = np.cumsum(pca.explained_variance_ratio_)
print('components for 90% variance:', int(np.searchsorted(cum, .90) + 1))
print('components for 95% variance:', int(np.searchsorted(cum, .95) + 1))

# PCA as denoising: reconstruct with 30 components
p30 = PCA(30).fit(Xs)
rec = p30.inverse_transform(p30.transform(Xs))
print('reconstruction MSE (standardised units):', round(float(np.mean((Xs-rec)**2)), 4))

# Visualise in 2-D: UMAP if installed, else t-SNE
emb = TSNE(n_components=2, perplexity=30, init='pca', random_state=0).fit_transform(Xs)
plt.scatter(emb[:,0], emb[:,1], c=y, cmap='tab10', s=6); plt.title('t-SNE of digits')

# PCA before clustering often helps; PCA before t-SNE always helps
Xp = PCA(50).fit_transform(Xs)
emb2 = TSNE(n_components=2, perplexity=30, random_state=0).fit_transform(Xp)

# Incremental PCA for data that does not fit in RAM
ipca = IncrementalPCA(n_components=30, batch_size=512)
for i in range(0, len(Xs), 512): ipca.partial_fit(Xs[i:i+512])`),
      ul(['PCA is a preprocessing step; t-SNE/UMAP are visualisation tools — do not cluster in t-SNE space casually.',
          'Standardise before PCA, or the highest-variance feature dominates component one.',
          'Use PCA (or autoencoders) before t-SNE: it speeds things up and denoises.',
          'UMAP supports transform() on new data; t-SNE does not, which matters in production.'],
         ['PCA یک گامِ پیش‌پردازش است؛ t-SNE/UMAP ابزارِ مصورسازی‌اند — بی‌ملاحظه در فضای t-SNE خوشه‌بندی نکنید.',
          'پیش از PCA استانداردسازی کنید، وگرنه ویژگیِ با بیشترین واریانس مؤلفه‌ی اول را تسخیر می‌کند.',
          'پیش از t-SNE از PCA (یا خودرمزگذارها) استفاده کنید: سرعت را بالا می‌برد و نویز را می‌گیرد.',
          'UMAP روی داده‌ی جدید تابعِ transform() دارد؛ t-SNE ندارد، و این در تولید مهم است.'])
    ],
    ['pca', 'tsne', 'umap', 'visualization'],
    [R('How to Use t-SNE Effectively', 'https://distill.pub/2016/misread-tsne/', 'doc'),
     R('UMAP documentation', 'https://umap-learn.readthedocs.io/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-011', D, 'intermediate', 14,
    ['Imbalanced Data, Cost-Sensitive Learning and Anomaly Detection', 'داده‌ی نامتوازن، یادگیریِ حساس به هزینه و تشخیصِ ناهنجاری'],
    ['When positives are 0.1% of the data, accuracy is a trap. Fix it at three levels: resampling, weighting, and choosing a metric that reflects the actual cost of errors.',
     'وقتی مثبت‌ها ۰/۱٪ِ داده‌اند، دقت یک تله است. آن را در سه سطح درست کنید: بازنمونه‌گیری، وزن‌دهی و انتخابِ معیاری که هزینه‌ی واقعیِ خطاها را نشان دهد.'],
    [
      def('Resampling changes the data: over-sample the minority (SMOTE generates synthetic points along segments between neighbours) or under-sample the majority. Cost-sensitive learning changes the loss instead, weighting errors by class. Anomaly detection reframes the problem entirely: model only the normal class and flag deviations.',
          'بازنمونه‌گیری داده را تغییر می‌دهد: نمونه‌گیریِ بیشتر از اقلیت (SMOTE نقاطِ مصنوعی در امتدادِ پاره‌خط‌های بینِ همسایه‌ها می‌سازد) یا نمونه‌گیریِ کمتر از اکثریت. یادگیریِ حساس به هزینه به‌جای آن تابعِ هزینه را تغییر می‌دهد و خطاها را بر حسبِ کلاس وزن می‌دهد. تشخیصِ ناهنجاری کلِ مسئله را از نو می‌چیند: تنها کلاسِ عادی را مدل می‌کند و انحراف‌ها را پرچم می‌زند.'),
      math('class weights:  w_c = n_samples / (n_classes * n_c)     ("balanced")\nSMOTE:   x_new = x_i + lambda (x_hat_i - x_i),  lambda ~ U(0,1)\n         synthesise, never duplicate -> duplicates just memorise\n\nthreshold from costs:  flag when  p * benefit > (1-p) * cost\n         equivalently  threshold = cost / (cost + benefit)\n\nanomaly scores:\n  IsolationForest  : anomalous points need fewer random splits to isolate\n  OneClassSVM      : learn a boundary around normal data (nu = expected outlier fraction)\n  LocalOutlierFactor: compare local density to neighbours\n  reconstruction err: autoencoder trained on normal data only\n  Mahalanobis / robust covariance: elliptical normal region'),
      code(`import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import average_precision_score, classification_report
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.under_sampling import RandomUnderSampler
rng = np.random.default_rng(0)

X, y = make_classification(n_samples=30_000, n_features=20, n_informative=5,
                           weights=[.995, .005], flip_y=0, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.3, stratify=y, random_state=0)

def ap(m): 
    m.fit(Xtr, ytr); return average_precision_score(yte, m.predict_proba(Xte)[:,1])

print('plain logreg          ', round(ap(LogisticRegression(max_iter=2000)), 4))
print('class_weight balanced ', round(ap(LogisticRegression(max_iter=2000, class_weight='balanced')), 4))
print('SMOTE + logreg        ', round(ap(ImbPipeline([('s', SMOTE(random_state=0)),
                                                      ('m', LogisticRegression(max_iter=2000))])), 4))
print('under-sampling        ', round(ap(ImbPipeline([('u', RandomUnderSampler(random_state=0)),
                                                      ('m', LogisticRegression(max_iter=2000))])), 4))

# Pure anomaly detection: train on normal data only
Xn = Xtr[ytr == 0]
iso = IsolationForest(n_estimators=300, contamination=.01, random_state=0).fit(Xn)
print('IsolationForest AP    ', round(average_precision_score(yte, -iso.score_samples(Xte)), 4))

# Threshold from economics rather than from 0.5
p = LogisticRegression(max_iter=2000, class_weight='balanced').fit(Xtr, ytr).predict_proba(Xte)[:,1]
cost_fp, benefit_tp = 5.0, 500.0
thr = cost_fp / (cost_fp + benefit_tp)
print('cost-based threshold', round(thr, 4), '->',
      classification_report(yte, (p > thr).astype(int), digits=3, zero_division=0).split()[-4:])`),
      ul(['Resample inside the CV loop (imblearn Pipeline), never before splitting — or you leak.',
          'Prefer PR-AUC / average precision over ROC-AUC for rare positives.',
          'SMOTE on high-dimensional, sparse or categorical data can fabricate nonsense points; try simple weighting first.',
          'For fraud and failure detection, treat it as anomaly detection plus a human review queue.'],
         ['بازنمونه‌گیری را درونِ حلقه‌ی CV انجام دهید (خط لوله‌ی imblearn)، هرگز پیش از تقسیم — وگرنه نشت می‌دهید.',
          'برای مثبت‌های نادر، PR-AUC / متوسطِ دقت را بر ROC-AUC ترجیح دهید.',
          'SMOTE روی داده‌ی پربُعد، تنک یا دسته‌ای می‌تواند نقاطِ بی‌معنا بسازد؛ ابتدا وزن‌دهیِ ساده را امتحان کنید.',
          'برای تشخیصِ تقلب و خرابی، مسئله را به‌صورتِ تشخیصِ ناهنجاری به‌علاوه‌ی یک صفِ بازبینیِ انسانی ببینید.'])
    ],
    ['imbalance', 'smote', 'anomaly-detection', 'cost-sensitive'],
    [R('imbalanced-learn documentation', 'https://imbalanced-learn.org/', 'doc'),
     R('Isolation Forest (Liu et al.)', 'https://ieeexplore.ieee.org/document/4781136', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-012', D, 'advanced', 15,
    ['Recommender Systems and Learning to Rank', 'سیستم‌های توصیه‌گر و یادگیریِ رتبه‌بندی'],
    ['Recommendation is prediction with a twist: the data is a sparse matrix of interactions, feedback is biased by what you showed, and the metric is ranking quality, not error.',
     'توصیه همان پیش‌بینی با یک پیچیدگی است: داده یک ماتریسِ تنک از تعامل‌هاست، بازخورد تحت تأثیرِ چیزی است که نشان داده‌اید و معیار، کیفیتِ رتبه‌بندی است نه خطا.'],
    [
      def('Collaborative filtering factorises the user-item interaction matrix into latent factors: R ~ P Q^T with a bias term and regularization. Content-based methods use item/user features instead. Hybrid systems do both, and modern production systems usually end with a learned ranker over a candidate generator.',
          'پالایشِ مشارکتی ماتریسِ تعاملِ کاربر-کالا را به عامل‌های نهان تجزیه می‌کند: R ~ P Q^T به‌همراه یک جمله‌ی اُریب و منظم‌سازی. روش‌های مبتنی بر محتوا به‌جای آن از ویژگی‌های کالا/کاربر استفاده می‌کنند. سیستم‌های ترکیبی هر دو را انجام می‌دهند و سیستم‌های تولیدِ امروزی معمولاً با یک رتبه‌بندِ آموخته‌شده روی یک مولدِ نامزد تمام می‌شوند.'),
      math('explicit feedback:  minimise SUM_{(u,i) known} (r_ui - (mu + b_u + b_i + p_u^T q_i))^2\n                      + lambda (||p||^2 + ||q||^2)\n  solved by SGD or ALS (ALS parallelises beautifully: alternate closed-form solves)\n\nimplicit feedback (clicks, views):\n  confidence-weighted: c_ui = 1 + alpha * count_ui,  preference p_ui = 1 if count > 0\n\nranking metrics:\n  Precision@k / Recall@k / MAP / NDCG@k\n  DCG@k = SUM_{i<=k} rel_i / log2(i+1);   NDCG = DCG / IDCG\n  MRR  = mean over users of 1/rank of the first relevant item\n\nlearning to rank: pointwise | pairwise (RankNet) | listwise (LambdaMART, XGBoost rank:ndcg)'),
      code(`import numpy as np, pandas as pd
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import ndcg_score
from implicit.als import AlternatingLeastSquares
rng = np.random.default_rng(0)

# A tiny implicit-feedback matrix (users x items), 1 = interacted
R = csr_matrix((rng.random(60_000) < 0.02).astype(np.float32).reshape(2000, 30*1)[:, :30]
               if False else (np.random.default_rng(0).random((2000, 500)) < .02).astype(np.float32))

# ALS for implicit feedback (the classic production baseline)
model = AlternatingLeastSquares(factors=64, regularization=0.05, iterations=20, random_state=0)
model.fit(R.T.tocsr())                       # implicit expects (items x users)
user_items = R.tocsr()
ids, scores = model.recommend(0, user_items[0], N=10, filter_already_liked_items=True)
print('top recs for user 0:', ids[:5], scores[:5].round(3))

# Pure NumPy baselines that are hard to beat
U, S, Vt = np.linalg.svd(R.toarray(), full_matrices=False)
print('SVD reconstruction error rank-32:',
      round(float(np.linalg.norm(R.toarray() - (U[:,:32]*S[:32]) @ Vt[:32])), 2))

# NDCG@10 for a ranker: this is the metric that matters
y_true = np.array([[3, 2, 1, 0, 0]])
y_score = np.array([[0.9, 0.1, 0.8, 0.7, 0.2]])
print('NDCG@3', round(ndcg_score(y_true, y_score, k=3), 4))

# Two-stage architecture: retrieve ~500 candidates, then rank with GBDT
# XGBRanker(objective='rank:ndcg') over features: user, item, cross features, ALS score`),
      ul(['Implicit feedback dominates: model absence as unknown, not as zero.',
          'Guard against popularity bias and filter bubbles; measure diversity and coverage, not just NDCG.',
          'Cold start: fall back to content-based or popularity until interactions accumulate.',
          'Offline NDCG is a weak proxy — online A/B with a guardrail metric is the real test.'],
         ['بازخوردِ ضمنی غالب است: نبود را «نامعلوم» مدل کنید، نه صفر.',
          'در برابر اُریبِ محبوبیت و حبابِ فیلتر محافظت کنید؛ تنوع و پوشش را بسنجید، نه فقط NDCG را.',
          'شروعِ سرد: تا وقتی تعامل جمع شود به روشِ مبتنی بر محتوا یا محبوبیت برگردید.',
          'NDCG آفلاین نماینده‌ی ضعیفی است — تستِ A/B آنلاین با یک معیارِ محافظ، آزمونِ واقعی است.'])
    ],
    ['recommenders', 'collaborative-filtering', 'als', 'ndcg', 'ranking'],
    [R('Matrix Factorization Techniques for Recommender Systems (Koren et al.)', 'https://ieeexplore.ieee.org/document/5197422', 'paper'),
     R('implicit (ALS library)', 'https://github.com/benfred/implicit', 'tool'),
     R('RecSys — Microsoft Recommenders repo', 'https://github.com/recommenders-team/recommenders', 'tool')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-013', D, 'advanced', 16,
    ['Time Series: Decomposition, Stationarity and Forecasting', 'سری‌های زمانی: تجزیه، مانایی و پیش‌بینی'],
    ['Time series breaks the i.i.d. assumption: order matters, the future is not in your training set, and naive baselines are frighteningly strong. Split by time or your numbers are fiction.',
     'سری‌های زمانی فرضِ i.i.d. را می‌شکنند: ترتیب مهم است، آینده در مجموعه‌ی آموزش نیست و مبناهای ساده‌لوحانه به‌شکل ترسناکی قوی‌اند. بر حسبِ زمان تقسیم کنید وگرنه عددهایتان داستان‌اند.'],
    [
      def('A series is stationary when its mean, variance and autocovariance do not depend on time. Most forecasting methods require it; differencing (d) and transformations (log) are how you get there. Autocorrelation (ACF) measures correlation with lagged values; partial autocorrelation (PACF) removes intermediate effects and identifies AR order p.',
          'یک سری زمانی مانا (ایستا) است وقتی میانگین، واریانس و کوواریانسِ خودهمبسته‌ی آن به زمان وابسته نباشد. بیشترِ روش‌های پیش‌بینی به آن نیاز دارند؛ تفاضل‌گیری (d) و تبدیل‌ها (لگاریتم) راهِ رسیدن به آن‌اند. خودهمبستگی (ACF) همبستگی با مقادیرِ تأخیری را می‌سنجد؛ خودهمبستگیِ جزئی (PACF) اثراتِ میانی را حذف می‌کند و مرتبه‌ی p مدلِ AR را شناسایی می‌کند.'),
      math('decomposition:  y_t = trend_t + seasonal_t + residual_t   (additive)\n                  y_t = trend_t * seasonal_t * residual_t   (multiplicative -> take logs)\n\nARIMA(p, d, q):\n  AR(p):  y_t = c + SUM_i phi_i y_{t-i} + e_t        PACF cuts off after p\n  I(d):   d differences to reach stationarity        ADF test, KPSS test\n  MA(q):  y_t = mu + SUM_j theta_j e_{t-j} + e_t     ACF cuts off after q\n\nfeatures for ML forecasters:\n  lags y_{t-1}, y_{t-7}, y_{t-365} | rolling mean/std over windows\n  calendar: hour, dow, month, is_holiday | Fourier terms for seasonality\n  exogenous regressors (price, promo, weather) -> SARIMAX / Prophet\n\nevaluation:  MAE, RMSE, MAPE (fails at zero), sMAPE, MASE (scale-free!)\n  MASE = MAE_model / MAE_naive_seasonal   < 1 means better than naive'),
      code(`import numpy as np, pandas as pd
from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error

# Synthetic daily demand with weekly + yearly seasonality and a trend
rng = np.random.default_rng(0)
idx = pd.date_range('2021-01-01', periods=1000, freq='D')
t = np.arange(1000)
y = (50 + 0.05*t + 12*np.sin(2*np.pi*t/7) + 20*np.sin(2*np.pi*t/365)
     + rng.normal(0, 3, 1000))
s = pd.Series(y, index=idx)

# Time-based split (the only honest one)
tr, te = s.iloc[:800], s.iloc[800:]

# Baselines first — always print these
naive = pd.Series(tr.iloc[-1], index=te.index)
seas   = pd.Series(tr.iloc[-7:].values, index=te.index[:7])
seas   = seas.reindex(te.index).ffill()
print('naive MAE  ', round(mean_absolute_error(te, naive), 3))
print('seasonal MAE', round(mean_absolute_error(te, seas), 3))

# STL decomposition then forecast the seasonally adjusted series
stl = STL(tr, period=7, robust=True).fit()
print('trend std', stl.trend.std().round(2), 'seasonal std', stl.seasonal.std().round(2))

# Stationarity test
print('ADF p-value raw      ', round(adfuller(s)[1], 4))
print('ADF p-value differenced', round(adfuller(np.diff(s))[1], 6))

m = ARIMA(tr, order=(2,1,2)).fit()
fc = m.forecast(len(te))
print('ARIMA MAE', round(mean_absolute_error(te, fc), 3),
      '| MASE', round(mean_absolute_error(te, fc)/mean_absolute_error(te, seas), 3))

# Feature-based approach with a gradient booster
def make_features(sr, lags=(1,7,14,28)):
    df = pd.DataFrame({'y': sr})
    for L in lags: df[f'lag_{L}'] = df.y.shift(L)
    df['dow'] = df.index.dayofweek; df['month'] = df.index.month
    df['roll7'] = df.y.rolling(7).mean()
    return df.dropna()`),
      ul(['Split by time and never shuffle; use walk-forward / rolling-origin evaluation.',
          'Compare against a seasonal-naive baseline with MASE before claiming victory.',
          'Add holiday and calendar effects explicitly; models do not discover them from timestamps.',
          'For many series, a global model (LightGBM over pooled series with series features) beats per-series ARIMA.'],
         ['بر حسبِ زمان تقسیم کنید و هرگز درهم نزنید؛ از ارزیابیِ پیش‌رونده/مبدأِ غلتان استفاده کنید.',
          'پیش از اعلامِ پیروزی، مدل را با مبنای ساده‌لوحانه‌ی فصلی با معیارِ MASE مقایسه کنید.',
          'اثراتِ تعطیلات و تقویم را صریحاً بیفزایید؛ مدل‌ها آن‌ها را از زمان‌سنج‌ها کشف نمی‌کنند.',
          'برای سری‌های متعدد، یک مدلِ سراسری (LightGBM روی سری‌های تجمیع‌شده با ویژگی‌های سری) از ARIMA ی هر-سری بهتر است.'])
    ],
    ['time-series', 'arima', 'stationarity', 'forecasting', 'mase'],
    [R('Forecasting: Principles and Practice (Hyndman, free)', 'https://otexts.com/fpp3/', 'book'),
     R('statsmodels — time series', 'https://www.statsmodels.org/stable/tsa.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ml-014', D, 'intermediate', 15,
    ['Classical NLP: Bag of Words, TF-IDF, Embeddings and Topics', 'پردازش زبانِ کلاسیک: کیسه‌ی واژگان، TF-IDF، embeddingها و موضوعات'],
    ['Before transformers there was counting. TF-IDF with a linear model is still the baseline that every NLP project must beat, and static embeddings (word2vec, GloVe, fastText) are still useful, cheap and fast.',
     'پیش از ترنسفورمرها، شمارش بود. TF-IDF با یک مدل خطی هنوز مبنایی است که هر پروژه‌ی NLP باید آن را بزند و embeddingهای ایستا (word2vec، GloVe، fastText) هنوز مفید، ارزان و سریع‌اند.'],
    [
      def('TF-IDF weights a term by its frequency in a document times the inverse of how common it is across documents: tf-idf(t, d) = tf(t,d) * log(N / df(t)). It down-weights stopwords and highlights distinctive terms. Static embeddings instead learn a dense vector per word from co-occurrence, so similar words land near each other.',
          'TF-IDF یک واژه را با بسامدِ آن در یک سند ضرب‌در معکوسِ فراوانی‌اش در میانِ اسناد وزن می‌دهد: tf-idf(t, d) = tf(t,d) · log(N / df(t)). این کار وزنِ واژه‌های توقفی را کم و واژه‌های متمایز را برجسته می‌کند. در مقابل، embeddingهای ایستا برای هر واژه یک بردارِ چگال از هم‌رخدادی می‌آموزند، پس واژه‌های مشابه نزدیکِ هم می‌افتند.'),
      math('tf-idf(t, d) = (1 + log tf) * log( (1+N) / (1 + df(t)) )      + L2 normalise\n\ncosine similarity in tf-idf space = the classic IR ranking score\n\nword2vec:\n  skip-gram  maximise SUM log p(context | word)     good for rare words\n  CBOW       predict the word from its context      faster, better for frequent\n  negative sampling replaces the softmax over |V| -> O(k) per update\n  the famous relation:  king - man + woman ~ queen\n\ntopic models:\n  LSA  = Truncated SVD on tf-idf (linear algebra, fast)\n  LDA  = probabilistic, documents are mixtures of topics (Dirichlet priors)\n  coherence score (c_v) to pick the number of topics'),
      code(`import numpy as np, pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import classification_report

docs = ["the battery life is amazing and the screen is bright",
        "worst phone i have ever bought, it broke in a week",
        "shipping was fast and the packaging was neat",
        "the camera takes blurry photos at night"]*250
y = np.array([1,0,1,0]*250)

Xtr, Xte, ytr, yte = train_test_split(docs, y, test_size=.25, stratify=y, random_state=0)

pipe = make_pipeline(TfidfVectorizer(ngram_range=(1,2), min_df=2, sublinear_tf=True,
                                     stop_words='english'),
                     LogisticRegression(max_iter=1000))
pipe.fit(Xtr, ytr)
print(classification_report(yte, pipe.predict(Xte), digits=3))
print('CV accuracy', cross_val_score(pipe, docs, y, cv=5).mean().round(3))

# What does the model actually attend to?
vec = pipe[0]; clf = pipe[1]
names = np.array(vec.get_feature_names_out())
top = np.argsort(clf.coef_[0])[::-1][:8]
print('top positive features:', names[top])

# LSA topics: SVD over tf-idf gives you interpretable directions
X = TfidfVectorizer(stop_words='english', max_features=5000).fit_transform(docs)
lsa = TruncatedSVD(3, random_state=0).fit(X)
for i, comp in enumerate(lsa.components_):
    print(f'topic {i}:', ', '.join(names[np.argsort(comp)[::-1][:6]]) if len(names)==X.shape[1]
          else ', '.join(np.array(vec.get_feature_names_out())[:0]))`),
      ul(['TF-IDF + linear SVM/logreg is a ferociously strong baseline for text classification.',
          'Char n-grams handle typos and morphology better than word n-grams for short, noisy text.',
          'Static embeddings cannot disambiguate word senses (bank the river vs bank the money).',
          'Always strip markup, normalise unicode, and check label noise before blaming the model.'],
         ['TF-IDF به‌همراه SVM/لاجستیکِ خطی مبنایی به‌شدت قوی برای دسته‌بندیِ متن است.',
          'برای متنِ کوتاه و پُرنویز، n-گرم‌های کاراکتری اشتباه‌های تایپی و صرف را بهتر مدیریت می‌کنند.',
          'embeddingهای ایستا نمی‌توانند معانیِ چندگانه‌ی واژه را تفکیک کنند (بانکِ رودخانه در برابر بانکِ پول).',
          'همیشه نشانه‌گذاری را بزدایید، یونیکُد را نرمال کنید و پیش از مقصر دانستنِ مدل، نویزِ برچسب را بررسی کنید.'])
    ],
    ['nlp', 'tfidf', 'word2vec', 'topic-models'],
    [R('Speech and Language Processing (Jurafsky & Martin, free)', 'https://web.stanford.edu/~jurafsky/slp3/', 'book'),
     R('word2vec — Efficient Estimation (Mikolov et al.)', 'https://arxiv.org/abs/1301.3781', 'paper')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
