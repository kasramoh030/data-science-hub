/* =====================================================================
   lessons-02-calculus.js  —  7 lessons (calculus, optimisation, Monte Carlo)
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'calculus';

  /* ------------------------------------------------------------------ */
  L('calc-001', D, 'beginner', 12,
    ['Derivatives, Rules and the Chain Rule', 'مشتق‌ها، قواعد و قاعده‌ی زنجیره‌ای'],
    ['A derivative is the local slope: how much the output moves when you nudge one input. The chain rule is what makes learning possible — it is how a loss at the end of a model reaches parameters at the beginning.',
     'مشتق شیبِ موضعی است: با تکان کوچکِ یک ورودی، خروجی چقدر جابه‌جا می‌شود. قاعده‌ی زنجیره‌ای چیزی است که یادگیری را ممکن می‌کند — راهی که یک تابع هزینه در انتهای مدل به پارامترهای ابتدای آن می‌رسد.'],
    [
      def('f\'(x) = lim_{h->0} [f(x+h) - f(x)] / h. It answers: for a tiny step h in x, how much does f change, per unit of step? Everything in gradient-based learning is repeated applications of that one ratio.',
          'f\'(x) = lim_{h->0} [f(x+h) - f(x)] / h. این پاسخ می‌دهد: به‌ازای گام بسیار کوچکِ h در x، ف به‌ازای هر واحد گام چقدر تغییر می‌کند؟ همه‌چیز در یادگیریِ مبتنی بر گرادیان، تکرار همین نسبت است.'),
      math('power      d/dx x^n        = n x^{n-1}\nexponential d/dx e^x         = e^x\nlog        d/dx ln x        = 1/x\nsigmoid    sigma\'(x)        = sigma(x) (1 - sigma(x))\nReLU       d/dx max(0, x)   = 1 if x > 0 else 0\n\nproduct    (fg)\'  = f\'g + fg\'\nquotient   (f/g)\' = (f\'g - fg\') / g^2\nCHAIN      (f o g)\'(x) = f\'(g(x)) * g\'(x)'),
      p('The chain rule composes. A neural network is L nested functions, so the derivative of the loss with respect to a weight in layer 1 is a product of L-1 local Jacobians. Autodiff frameworks do not symbolically differentiate that product; they just apply the chain rule numerically, one elementary operation at a time, in reverse order (backpropagation).',
        'قاعده‌ی زنجیره‌ای ترکیب می‌کند. یک شبکه عصبی L تابعِ تودرتو است، پس مشتق تابع هزینه نسبت به وزنی در لایه‌ی ۱ حاصل‌ضربِ 1-L ژاکوبینِ موضعی است. چارچوب‌های مشتق‌گیری خودکار این حاصل‌ضرب را به‌صورت نمادین محاسبه نمی‌کنند؛ آن‌ها فقط قاعده‌ی زنجیره‌ای را به‌شکل عددی و یک عملِ پایه در میان، به ترتیب معکوس اعمال می‌کنند (پس‌انتشار).'),
      code(`import numpy as np

# Numerical derivative vs analytic — a sanity check you should always run
f  = lambda x: np.exp(-x**2) + np.sin(3*x)
df = lambda x: -2*x*np.exp(-x**2) + 3*np.cos(3*x)

def numeric_grad(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2*h)      # central difference: O(h^2)

x0 = 0.7
print(analytic := df(x0), numeric_grad(f, x0))   # agree to ~1e-9

# Tiny autodiff toy: multiply then sigmoid, and get gradients by hand
def sigmoid(z): return 1/(1+np.exp(-z))

W = np.array([0.8, -1.2]); x = np.array([2.0, 0.5]); b = 0.1
z = W @ x + b
a = sigmoid(z)
loss = -(np.log(a))                              # -log p(y=1)

dL_da = -1/a
da_dz = a*(1-a)
dz_dW = x
dL_dW = dL_da * da_dz * dz_dW                     # chain rule, 3 links
print('grad wrt W:', dL_dW.round(4))`),
      ul(['Central differences (f(x+h) - f(x-h)) / 2h are far more accurate than one-sided ones.',
          'Always gradient-check your custom layer against a numerical estimate before trusting it.',
          'Too-small h causes catastrophic cancellation; h around 1e-5 to 1e-6 in float64 is a good default.',
          'A derivative of 0 does not always mean a minimum — it may be a saddle or an inflection.'],
         ['تفاضل‌های مرکزی (f(x+h) - f(x-h)) / 2h بسیار دقیق‌تر از تفاضل‌های یک‌طرفه‌اند.',
          'همیشه گرادیانِ لایه‌ی سفارشی‌تان را با برآورد عددی بررسی کنید پیش از آن‌که به آن اعتماد کنید.',
          'h خیلی کوچک باعث cancellation فاجعه‌بار می‌شود؛ مقدار h در حدود 1e-5 تا 1e-6 در float64 انتخاب خوبی است.',
          'مشتقِ صفر همیشه به معنای کمینه نیست — ممکن است نقطه‌ی زینی یا عطف باشد.']),
      note('In practice you never code derivatives by hand. Autograd (PyTorch, JAX) builds a graph of elementary ops and applies the chain rule for you — but understanding the rule is what lets you debug vanishing, exploding and NaN gradients.',
           'در عمل مشتق‌ها را هرگز دستی نمی‌نویسید. کتابخانه‌های autograd (پای‌تورچ، JAX) گرافی از عمل‌های پایه می‌سازند و قاعده‌ی زنجیره‌ای را برای‌تان اعمال می‌کنند — اما فهم این قاعده همان چیزی است که امکان دیباگِ گرادیان‌های محو، منفجر و NaN را می‌دهد.')
    ],
    ['derivatives', 'chain-rule', 'autodiff', 'backprop'],
    [R('Khan Academy — Chain rule', 'https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-2-new', 'course'),
     R('Automatic Differentiation — Baydin et al. survey', 'https://arxiv.org/abs/1502.05767', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('calc-002', D, 'intermediate', 13,
    ['Gradients, Jacobians and Hessians', 'گرادیان، ژاکوبین و هسین'],
    ['One output -> gradient. Many outputs -> Jacobian. Second derivatives -> Hessian. Knowing which object you need keeps your shapes right and tells you what the optimizer can promise.',
     'یک خروجی -> گرادیان. چند خروجی -> ژاکوبین. مشتق‌های دوم -> هسین. دانستن این‌که به کدام شیء نیاز دارید ابعاد را درست نگه می‌دارد و می‌گوید بهینه‌ساز چه تضمینی می‌تواند بدهد.'],
    [
      def('For f: R^n -> R, the gradient grad f is the vector of partial derivatives — it points in the direction of steepest increase, so gradient descent steps the opposite way. For f: R^n -> R^m the Jacobian J is the m x n matrix of all first partials. The Hessian H is the n x n matrix of second partials of a scalar function.',
          'برای f: R^n -> R، گرادیانِ grad f بردارِ مشتقات جزئی است — به جهتِ بیشترین افزایش اشاره می‌کند، پس گرادیانِ نزولی در خلاف آن گام برمی‌دارد. برای f: R^n -> R^m، ژاکوبینِ J ماتریس m×n همه‌ی مشتقاتِ مرتبه‌ی اول است. هسینِ H ماتریس n×n مشتقاتِ مرتبه‌ی دومِ یک تابع اسکالر است.'),
      math('f: R^n -> R      grad f = [df/dx_1, ..., df/dx_n]        shape (n,)\nf: R^n -> R^m    J_ij   = df_i / dx_j                     shape (m, n)\nH_ij = d2f / dx_i dx_j                                    shape (n, n)\n\nsteepest ascent direction: grad f / ||grad f||\ndirectional derivative along unit v: v^T grad f\nTaylor:  f(x + d) ~ f(x) + grad f^T d + 0.5 d^T H d\nsecond-order step (Newton):  d = -H^{-1} grad f'),
      code(`import numpy as np

# Gradients of the linear-model MSE loss, worked out explicitly
rng = np.random.default_rng(1)
n, d = 50, 4
X = rng.normal(size=(n, d))
y = X @ np.array([1.5, -2.0, 0.0, 0.7]) + 0.1*rng.normal(size=n)
w = rng.normal(size=d)

def loss(w): 
    r = X @ w - y
    return 0.5*np.mean(r**2)

def grad(w):
    r = X @ w - y
    return (X.T @ r) / n                      # (d,)

def hess(w):
    return (X.T @ X) / n                      # (d, d) — constant for MSE

print('grad', grad(w).round(4))
print('Hessian PSD?', np.all(np.linalg.eigvalsh(hess(w)) > 0))

# Finite-difference check of the gradient, component by component
g_num = np.zeros(d); h = 1e-6
for i in range(d):
    e = np.zeros(d); e[i] = h
    g_num[i] = (loss(w + e) - loss(w - e)) / (2*h)
print('max |analytic - numeric| =', np.abs(grad(w) - g_num).max())

# Jacobian of a vector-valued function (e.g. a 3-unit layer)
def f_vec(w): return np.tanh(X[:3] @ w)       # (3,)
J = np.stack([(f_vec(w + 1e-6*np.eye(d)[i]) - f_vec(w - 1e-6*np.eye(d)[i]))/2e-6
              for i in range(d)], axis=1)     # (3, d) = (outputs, inputs)
print('Jacobian shape', J.shape)`),
      ul(['The gradient is a ROW in maths conventions but frameworks give you a tensor shaped like the parameter.',
          'The Hessian is symmetric whenever f is twice continuously differentiable (Clairaut).',
          'H positive definite at a point where grad f = 0 means a local minimum; negative definite means a maximum; mixed signs mean a saddle.',
          'Jacobians appear whenever you vectorise: one row per output, one column per input.'],
         ['در قراردادهای ریاضی گرادیان یک سطر است، اما چارچوب‌ها آن را هم‌شکل با پارامتر می‌دهند.',
          'هرگاه f دو بار مشتق‌پذیرِ پیوسته باشد، هسین متقارن است (کلرو).',
          'مثبت‌معین بودنِ H در نقطه‌ای که grad f = 0 یعنی کمینه‌ی موضعی؛ منفی‌معین بودن یعنی بیشینه و علامت‌های مختلط یعنی نقطه‌ی زینی.',
          'هرجا بردارسازی می‌کنید ژاکوبین ظاهر می‌شود: یک سطر به‌ازای هر خروجی، یک ستون به‌ازای هر ورودی.']),
      note('Full Hessians are n^2 memory — impossible for a model with millions of parameters. That is why deep learning uses first-order methods, and why quasi-Newton methods (L-BFGS) approximate curvature from recent gradients instead.',
           'هسینِ کامل حافظه‌ی n^2 می‌خواهد — برای مدلی با میلیون‌ها پارامتر غیرممکن است. به همین دلیل یادگیری عمیق از روش‌های مرتبه‌ی اول استفاده می‌کند و روش‌های شبه‌نیوتون (L-BFGS) انحنا را از گرادیان‌های اخیر تقریب می‌زنند.')
    ],
    ['gradient', 'jacobian', 'hessian', 'newton'],
    [R('Matrix calculus for ML (Petersen & Pedersen)', 'https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('calc-003', D, 'intermediate', 12,
    ['Taylor Series and Convexity', 'سری تیلور و تحدب'],
    ['Taylor series says: near a point, every smooth function looks like a polynomial. Convexity says: that polynomial has one bottom. Together they are the entire theoretical basis for why gradient descent should work.',
     'سری تیلور می‌گوید: در نزدیکی یک نقطه، هر تابع هموار شبیه یک چندجمله‌ای است. تحدب می‌گوید: آن چندجمله‌ای یک ته دارد. این دو با هم تمامِ مبنای نظریِ کارکردِ گرادیان نزولی‌اند.'],
    [
      def('f is convex when f(t x + (1-t) y) <= t f(x) + (1-t) f(y) for all t in [0,1]: the chord lies above the graph. For twice differentiable f, this is equivalent to the Hessian being positive semidefinite everywhere. Strict convexity gives a unique global minimum.',
          'تابع f محدب است هرگاه برای هر t در [0,1] داشته باشیم f(t x + (1-t) y) <= t f(x) + (1-t) f(y): وتر بالای نمودار قرار می‌گیرد. برای f دو بار مشتق‌پذیر این معادل است با نیمه‌معینِ مثبت بودنِ هسین همه‌جا. تحدبِ اکید کمینه‌ی سراسریِ یکتا می‌دهد.'),
      math('Taylor around x0 (multivariate):\n  f(x0 + d) = f(x0) + grad f(x0)^T d + 0.5 d^T H(x0) d + O(||d||^3)\n\nfirst-order (linear) approximation -> gradient descent step\nsecond-order (quadratic)           -> Newton step\n\nconvex tests:\n  1-D : f\'\'(x) >= 0\n  n-D : v^T H(x) v >= 0 for all v   (H PSD)\n  Jensen:  f(E[X]) <= E[f(X)]       (the workhorse inequality of ML)'),
      p('Why this matters in practice: MSE with a linear model is convex in the weights, so any local minimum is global and your optimizer cannot get lost. A neural net is emphatically not convex, yet empirical work shows most local minima are nearly equally good — the real difficulty is saddle points, where the Hessian has both positive and negative eigenvalues.',
        'چرا این در عمل مهم است: MSE با مدل خطی نسبت به وزن‌ها محدب است، پس هر کمینه‌ی موضعی سراسری است و بهینه‌ساز نمی‌تواند گم شود. شبکه عصبی قاطعانه محدب نیست، با این حال کار تجربی نشان می‌دهد بیشتر کمینه‌های موضعی تقریباً به یک اندازه خوب‌اند — دشواری واقعی نقاط زینی‌اند که در آن‌ها هسین هم مقدار ویژه‌ی مثبت دارد هم منفی.'),
      code(`import numpy as np
import matplotlib.pyplot as plt

# Taylor approximations of sin(x) at 0
x = np.linspace(-np.pi, np.pi, 400)
t1 = x
t3 = x - x**3/6
t5 = x - x**3/6 + x**5/120

# Convexity check by sampling: is f(midpoint) <= mean(f(ends))?
def convex_sample(f, lo, hi, n=2000):
    xs = np.random.uniform(lo, hi, size=(n, 2))
    m  = 0.5*(xs[:,0] + xs[:,1])
    return np.all(f(m) <= 0.5*f(xs[:,0]) + 0.5*f(xs[:,1]) + 1e-9)

print(convex_sample(lambda z: z**2, -5, 5))        # True
print(convex_sample(lambda z: np.sin(z), 0, 6))    # False
print(convex_sample(lambda z: np.exp(z), -2, 2))   # True

# Sum of convex functions is convex -> loss + L2 penalty stays convex
print(convex_sample(lambda z: z**2 + 0.1*np.abs(z), -5, 5))`),
      ul(['Linear regression, logistic regression, SVM (hinge) and ridge/lasso are convex problems.',
          'Neural network training, k-means and matrix factorisation are non-convex, but often benign.',
          'Composition rules: a convex function of an affine map is convex; the pointwise maximum of convex functions is convex.',
          'Jensen is behind EM, variational inference, and the evidence lower bound (ELBO).'],
         ['رگرسیون خطی، رگرسیون لجستیک، SVM (لولای مفصلی) و ریج/لاسو مسائل محدب‌اند.',
          'آموزش شبکه عصبی، k-means و تجزیه‌ی ماتریس غیرمحدب‌اند، اما غالباً خوش‌خیم.',
          'قواعد ترکیب: تابع محدب از یک نگاشت آفین محدب است و بیشینه‌ی نقطه‌ایِ توابع محدب محدب است.',
          'نامساوی جنسن پشتِ EM، استنتاج واریاسیونی و کران پایینِ شواهد (ELBO) است.'])
    ],
    ['taylor', 'convexity', 'jensen', 'hessian'],
    [R('Boyd & Vandenberghe — Convex Optimization (free book)', 'https://web.stanford.edu/~boyd/cvxbook/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('calc-004', D, 'intermediate', 15,
    ['Gradient Descent: Batch, SGD and Mini-batches', 'گرادیان نزولی: دسته‌ای، تصادفی و مینی‌بَچ'],
    ['The same one-line update powers linear regression and trillion-parameter models. What changes is how much data you use per step, and how big the step is.',
     'همان به‌روزرسانیِ تک‌خطی، هم رگرسیون خطی را می‌گرداند و هم مدل‌های تریلیون‌پارامتری. چیزی که تغییر می‌کند مقدار داده در هر گام و اندازه‌ی گام است.'],
    [
      def('Gradient descent repeats w <- w - eta * grad L(w). Batch GD uses all n points per step (stable, slow). SGD uses one point (noisy, fast, escapes shallow minima). Mini-batch (32-1024) is the practical compromise and is what every framework means by "SGD".',
          'گرادیان نزولی عبارت w <- w - eta * grad L(w) را تکرار می‌کند. GD دسته‌ای از همه‌ی n نقطه در هر گام استفاده می‌کند (پایدار، کند). SGD از یک نقطه استفاده می‌کند (پُرنویز، سریع، فرار از کمینه‌های کم‌عمق). مینی‌بَچ (۳۲ تا ۱۰۲۴) سازشِ عملی است و همان چیزی است که هر چارچوبی از «SGD» اراده می‌کند.'),
      math('update:       w_{t+1} = w_t - eta * g_t\n\nconvergence (convex, L-smooth):   eta <= 1/L  guarantees descent\nstep too small -> slow;  too large -> oscillation / divergence\n\nSGD noise scales as 1/sqrt(B): doubling the batch only halves the noise,\n  yet costs 2x compute -> the "linear scaling is a trap" observation\n\nschedules: constant | step decay | cosine | 1/sqrt(t) | warmup + cosine\nwarmup prevents early instability with large batches / Adam'),
      code(`import numpy as np

rng = np.random.default_rng(0)
n, d = 5000, 8
X = rng.normal(size=(n, d))
w_true = rng.normal(size=d)
y = X @ w_true + 0.5*rng.normal(size=n)

def grads(w, idx):
    r = X[idx] @ w - y[idx]
    return (X[idx].T @ r) / len(idx)

def run(mode, eta, epochs=60, batch=64):
    w = np.zeros(d); hist = []
    for ep in range(epochs):
        if mode == 'batch':
            batches = [np.arange(n)]
        else:
            perm = rng.permutation(n)
            batches = [perm[i:i+batch] for i in range(0, n, batch)]
        for b in batches:
            w -= eta * grads(w, b)
        hist.append(np.mean((X @ w - y)**2))
    return w, hist

for mode, eta in [('batch', 0.2), ('sgd', 0.05)]:
    w, h = run(mode, eta)
    print(mode, 'final MSE', round(h[-1], 4), 'param err', round(np.linalg.norm(w-w_true), 3))

# Effect of the learning rate — always sweep it first
for eta in [1e-3, 1e-2, 0.5, 1.0, 1.6]:
    w = np.zeros(d)
    for _ in range(400):
        w -= eta * grads(w, np.arange(n))
    print('eta', eta, 'MSE', round(float(np.mean((X @ w - y)**2)), 4))`),
      ul(['Always sweep the learning rate on a log grid; it is the single most important hyperparameter.',
          'Shuffle every epoch; correlated batches break the SGD noise assumptions.',
          'Feature scaling matters: with unscaled features the loss surface is a long valley and GD zig-zags.',
          'Cosine decay with warmup is the modern default for transformers; step decay remains common in vision.'],
         ['همیشه نرخ یادگیری را روی شبکه‌ی لگاریتمی جارو کنید؛ این مهم‌ترین ابرپارامتر است.',
          'هر دوره را درهم بزنید؛ بَچ‌های همبسته فرض‌های نویزِ SGD را می‌شکنند.',
          'مقیاس‌بندی ویژگی مهم است: با ویژگی‌های بدون مقیاس، سطحِ هزینه دره‌ای کشیده است و GD زیگ‌زاگ می‌رود.',
          'کاهشِ کسینوسی با گرم‌کردن، پیش‌فرضِ امروز برای ترنسفورمرهاست؛ کاهشِ پله‌ای در بینایی رایج است.']),
      note('Loss going to NaN is almost always a too-large learning rate or an unclipped gradient, not a bug in your model. Clip gradients, lower eta, and check for a batch containing a single extreme outlier.',
           'NaN شدنِ هزینه تقریباً همیشه به‌دلیل نرخ یادگیریِ بسیار بزرگ یا گرادیانِ نابریده است، نه باگ در مدل. گرادیان را ببرید، eta را کم کنید و بَچی را بررسی کنید که یک داده‌ی پرتِ بسیار شدید دارد.')
    ],
    ['gradient-descent', 'sgd', 'learning-rate', 'schedules'],
    [R('An overview of gradient descent optimization algorithms (Ruder)', 'https://arxiv.org/abs/1609.04747', 'paper'),
     R('Practical tips — Karpathy, A Recipe for Training Neural Networks', 'https://karpathy.github.io/2019/04/25/recipe/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('calc-005', D, 'advanced', 14,
    ['Constrained Optimization, Lagrange Multipliers and KKT', 'بهینه‌سازی مقید، ضرایب لاگرانژ و شرایط KKT'],
    ['Whenever you must optimise subject to a rule — probabilities summing to 1, weights on a simplex, a fairness constraint, a budget — you are doing constrained optimization, and Lagrange multipliers are the standard tool.',
     'هرجا باید با رعایت یک قاعده بهینه کنید — احتمال‌هایی که جمع‌شان یک است، وزن‌هایی روی یک سیمپلکس، یک قید عدالت، یک بودجه — در حال بهینه‌سازی مقید هستید و ضرایب لاگرانژ ابزار استاندارد آن‌اند.'],
    [
      def('To minimise f(x) subject to g(x) = 0, build the Lagrangian L(x, lambda) = f(x) + lambda * g(x). At the optimum, grad_x L = 0 and g(x) = 0. Multipliers are shadow prices: lambda tells you how fast the optimal value would improve if you relaxed the constraint slightly.',
          'برای کمینه‌سازیِ f(x) با قیدِ g(x) = 0، لاگرانژینِ L(x, lambda) = f(x) + lambda · g(x) را می‌سازید. در نقطه‌ی بهینه داریم grad_x L = 0 و g(x) = 0. ضرایب، قیمت سایه‌اند: lambda می‌گوید اگر قید را کمی آزاد کنید مقدار بهینه با چه سرعتی بهتر می‌شود.'),
      math('equality constraints g_i(x) = 0 and inequalities h_j(x) <= 0:\n  L(x, lambda, mu) = f(x) + SUM_i lambda_i g_i(x) + SUM_j mu_j h_j(x)\n\nKKT conditions (necessary under constraint qualifications, sufficient if convex):\n  1. stationarity   grad_x L = 0\n  2. primal feas.   g_i(x) = 0,  h_j(x) <= 0\n  3. dual feas.     mu_j >= 0\n  4. complementarity  mu_j h_j(x) = 0   (slack: inactive constraint -> mu = 0)\n\nSVM is literally this: hinge loss with margin constraints -> alphas are the multipliers,\n  and only support vectors have alpha > 0 (complementarity!)'),
      code(`import numpy as np
from scipy.optimize import minimize

# Maximum entropy distribution with a known mean: p on the simplex
support = np.array([0., 1., 2., 3., 4.])
target_mean = 2.3

def neg_entropy_and_grad(p):
    p = np.clip(p, 1e-12, 1)
    f = np.sum(p*np.log(p))                    # -entropy
    g = np.log(p) + 1
    return f, g

cons = [
    {'type': 'eq',   'fun': lambda p: np.sum(p) - 1,                     'jac': lambda p: np.ones_like(p)},
    {'type': 'eq',   'fun': lambda p: p @ support - target_mean,         'jac': lambda p: support},
]
res = minimize(neg_entropy_and_grad, np.ones(len(support))/len(support),
               jac=True, bounds=[(1e-9, 1)]*len(support), constraints=cons, method='SLSQP')
p = res.x / res.x.sum()
print('max-ent p:', p.round(4), 'mean', round(float(p @ support), 3))
# Closed form for max-ent with a mean constraint: p_i ∝ exp(λ x_i)
lam = res.x  # numeric route is the general one

# Projecting onto the probability simplex (common in RL / topic models)
def project_simplex(v):
    u = np.sort(v)[::-1]; css = np.cumsum(u)
    rho = np.nonzero(u*np.arange(1, len(v)+1) > (css - 1))[0][-1]
    theta = (css[rho] - 1) / (rho + 1.0)
    return np.maximum(v - theta, 0)
print(project_simplex(np.array([0.7, 0.1, 0.5])))   # sums to 1`),
      ul(['Inequality multipliers are non-negative; equality multipliers are free in sign.',
          'Complementary slackness is why solutions are sparse in the constraints that bind.',
          'Softmax is the closed-form solution of maximum entropy with a mean constraint — entropy regularization in one line.',
          'Dual formulations turn hard constrained problems into easier unconstrained ones (this is the SVM dual).'],
         ['ضرایبِ قیودِ نابرابری نامنفی‌اند؛ ضرایبِ قیودِ تساوی در علامت آزادند.',
          'به‌دلیل لَنگیِ مکمّل، جواب‌ها نسبت به قیودِ فعّال تنک‌اند.',
          'سافت‌مکس پاسخِ فرمِ بسته‌ی بیشینه‌آنتروپی با قیدِ میانگین است — منظم‌سازیِ آنتروپی در یک خط.',
          'فرم‌بندی‌های دوگان، مسائل مقیدِ سخت را به مسائل نامقیدِ آسان‌تر تبدیل می‌کنند (این همان دوگانِ SVM است).'])
    ],
    ['lagrange', 'kkt', 'constrained', 'svm', 'maxent'],
    [R('Convex Optimization — Ch. 5 Duality (Boyd)', 'https://web.stanford.edu/~boyd/cvxbook/', 'book')]
  );

  /* ------------------------------------------------------------------ */
  L('calc-006', D, 'beginner', 12,
    ['Integrals, Expectation as an Integral and Monte Carlo', 'انتگرال‌ها، امید ریاضی به‌مثابه انتگرال و مونت‌کارلو'],
    ['Expectations are integrals. When the integral has no closed form — which is most of the time in Bayesian models — you approximate it with samples. That is Monte Carlo, and it is why modern ML is computationally hungry.',
     'امیدهای ریاضی انتگرال‌اند. وقتی انتگرال فرم بسته ندارد — که در مدل‌های بیزی بیشترِ وقت‌ها همین است — آن را با نمونه‌ها تقریب می‌زنید. این همان مونت‌کارلو است و دلیل گرسنگیِ محاسباتیِ یادگیری ماشینِ امروز.'],
    [
      def('For a continuous variable with density p, E[f(X)] = INTEGRAL f(x) p(x) dx. The Monte Carlo estimator draws x_1...x_N from p and averages: E[f] ~ (1/N) SUM f(x_i). The error shrinks like 1/sqrt(N) regardless of dimension — which is exactly why it beats grids in high dimensions.',
          'برای متغیر پیوسته با چگالی p داریم E[f(X)] = ∫ f(x) p(x) dx. برآوردگر مونت‌کارلو x_1 تا x_N را از p می‌کشد و میانگین می‌گیرد: E[f] ≈ (1/N) Σ f(x_i). خطا مانند 1/sqrt(N) کوچک می‌شود، مستقل از بُعد — و این دقیقاً دلیل برتری آن بر شبکه‌ها در ابعاد بالا است.'),
      math('E[X]        = INTEGRAL x p(x) dx\nVar(X)      = E[X^2] - E[X]^2\nP(a<X<b)    = INTEGRAL_a^b p(x) dx\n\nMonte Carlo:   E[f] ~ f_hat = (1/N) SUM_i f(x_i)\n               standard error = sd(f) / sqrt(N)      <- 10x accuracy needs 100x samples\n\ndeterministic quadrature in d dimensions: error ~ N^{-r/d}  (curse of dimensionality)\nMonte Carlo error ~ N^{-1/2}                                 (dimension-free!)'),
      code(`import numpy as np

rng = np.random.default_rng(0)

# 1. Estimate pi by Monte Carlo (the classic)
N = 2_000_000
inside = ((rng.random(N)**2 + rng.random(N)**2) <= 1).sum()
print('pi ~', 4*inside/N)

# 2. Monte Carlo error shrinks as 1/sqrt(N)
for N in [100, 10_000, 1_000_000]:
    est = np.mean(np.sin(rng.random(N)*np.pi))     # true value = 2/pi
    print(f'N={N:>9,}  est={est:.5f}  true={2/np.pi:.5f}')

# 3. Importance sampling: sample from q, reweight by p/q
p = lambda x: np.exp(-0.5*((x-3)/0.5)**2)/0.5      # target (unnormalised is fine)
q = lambda x: np.exp(-0.5*((x-0)/2.0)**2)/2.0      # proposal
xs = rng.normal(0, 2.0, 200_000)
w = p(xs)/q(xs); w /= w.sum()
print('E[X] under p ~', float((w*xs).sum()))       # ~3.0

# 4. Numerical integration vs MC in high dimension
from scipy import integrate
print(integrate.quad(lambda x: np.exp(-x**2), -np.inf, np.inf)[0], np.sqrt(np.pi))`),
      ul(['Monte Carlo error is dimension-free; quadrature is not. That is the whole argument.',
          'Variance reduction (antithetic variates, control variates, stratification) buys accuracy for free.',
          'Importance sampling fails badly when the proposal q has lighter tails than the target p.',
          'MCMC (Metropolis-Hastings, HMC/NUTS) is importance sampling with a Markov chain that finds the typical set for you.'],
         ['خطای مونت‌کارلو مستقل از بُعد است؛ خطای انتگرال‌گیریِ عددی نه. تمامِ استدلال همین است.',
          'کاهش واریانس (متغیرهای متضاد، متغیرهای کنترل، طبقه‌بندی) دقت را مجانی می‌خرد.',
          'نمونه‌گیریِ اهمیت وقتی توزیع پیشنهادی q دم‌های سبک‌تر از هدفِ p دارد، به‌شدت شکست می‌خورد.',
          'MCMC (متروپلیس-هستینگز، HMC/NUTS) نمونه‌گیریِ اهمیت با یک زنجیره‌ی مارکوف است که مجموعه‌ی معمول را برای‌تان پیدا می‌کند.'])
    ],
    ['integration', 'expectation', 'monte-carlo', 'importance-sampling'],
    [R('Monte Carlo — Art Owen lecture notes', 'https://statweb.stanford.edu/~owen/mc/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('calc-007', D, 'advanced', 15,
    ['Beyond Plain SGD: Momentum, Adam, Newton and L-BFGS', 'فراتر از SGD ساده: مومنتوم، آدام، نیوتون و L-BFGS'],
    ['Every optimizer is a different belief about the geometry of the loss surface. Plain SGD assumes a round bowl; momentum assumes a valley; Adam assumes per-parameter noise; Newton measures the curvature; L-BFGS guesses it.',
     'هر بهینه‌ساز باوری متفاوت درباره‌ی هندسه‌ی سطحِ هزینه است. SGDِ ساده یک کاسه‌ی گرد را فرض می‌کند؛ مومنتوم یک دره را؛ آدام نویزِ جداگانه برای هر پارامتر را؛ نیوتون انحنا را اندازه می‌گیرد و L-BFGS آن را حدس می‌زند.'],
    [
      math('heavy ball / momentum:\n  v_t = mu v_{t-1} + g_t          (mu ~ 0.9)\n  w_t = w_{t-1} - eta v_t         damps oscillation across the valley\n\nRMSProp / Adam (adaptive per-parameter scaling):\n  m_t = b1 m_{t-1} + (1-b1) g_t          first moment (mean)\n  v_t = b2 v_{t-1} + (1-b2) g_t^2        second moment (uncentred variance)\n  m_hat = m_t/(1-b1^t),  v_hat = v_t/(1-b2^t)      bias correction\n  w_t = w_{t-1} - eta * m_hat / (sqrt(v_hat) + eps)\n  defaults: eta=1e-3, b1=0.9, b2=0.999, eps=1e-8\n\nNewton:    d = -H^{-1} g          (exact curvature, O(n^3) + n^2 memory)\nL-BFGS:    approximate H^{-1} g from the last ~10 (s, y) pairs'),
      code(`import numpy as np

def optimise(kind, grad, w0, eta=0.1, steps=300, **kw):
    w = w0.copy(); m = np.zeros_like(w); v = np.zeros_like(w)
    b1, b2, eps = kw.get('b1', .9), kw.get('b2', .999), 1e-8
    hist = []
    for t in range(1, steps+1):
        g = grad(w)
        if kind == 'sgd':
            w -= eta * g
        elif kind == 'momentum':
            m = kw.get('mu', .9)*m + g;  w -= eta * m
        elif kind == 'adam':
            m = b1*m + (1-b1)*g;  v = b2*v + (1-b2)*g*g
            mh, vh = m/(1-b1**t), v/(1-b2**t)
            w -= eta * mh/(np.sqrt(vh) + eps)
        hist.append(np.linalg.norm(w))
    return w, hist

# Ill-conditioned quadratic: the classic valley
A = np.diag([50.0, 1.0]); b = np.array([1.0, 1.0])
grad = lambda w: A @ (w - b)
for kind in ['sgd', 'momentum', 'adam']:
    w, h = optimise(kind, grad, np.zeros(2), eta=0.05 if kind != 'adam' else 0.5)
    print(kind, 'final w', w.round(4), 'err', round(float(np.linalg.norm(w-b)), 5))`),
      ul(['Adam with decoupled weight decay (AdamW) is the right default; plain Adam folds decay into the gradient and interacts with the adaptive scale.',
          'Adam converges fast but can generalize worse than SGD with momentum on vision tasks; try both.',
          'Newton and L-BFGS win on small, smooth, well-conditioned problems (logistic regression, CRFs, GPs).',
          'Second-order information is approximated in deep learning by Adam\'s diagonal, K-FAC, Shampoo, or Sophia.'],
         ['آدام با کاهش وزنِ جدا شده (AdamW) پیش‌فرضِ درست است؛ آدامِ ساده کاهش وزن را در گرادیان می‌آمیزد و با مقیاسِ تطبیقی تداخل می‌کند.',
          'آدام سریع همگرا می‌شود اما در کارهای بینایی ممکن است تعمیمِ بدتری از SGDِ مومنتومی داشته باشد؛ هر دو را امتحان کنید.',
          'نیوتون و L-BFGS در مسائل کوچک، هموار و خوش‌شرط (رگرسیون لجستیک، CRF، فرایند گاوسی) برنده‌اند.',
          'اطلاعات مرتبه‌ی دوم در یادگیری عمیق با قطرِ آدام، K-FAC، Shampoo یا Sophia تقریب زده می‌شود.']),
      note('Debugging rule: if the loss does not decrease on a tiny subset (say 50 samples) with a small model, you have a bug, not a tuning problem. Overfit one batch first — that is the fastest possible sanity check.',
           'قاعده‌ی دیباگ: اگر هزینه روی یک زیرمجموعه‌ی بسیار کوچک (مثلاً ۵۰ نمونه) با یک مدل کوچک کاهش نیافت، مشکل شما باگ است نه تنظیم. ابتدا روی یک بَچ برازشِ بیش‌ازحد بگیرید — این سریع‌ترین بررسیِ سلامت است.')
    ],
    ['adam', 'momentum', 'newton', 'lbfgs', 'optimizers'],
    [R('Adam: A Method for Stochastic Optimization', 'https://arxiv.org/abs/1412.6980', 'paper'),
     R('AdamW — Decoupled Weight Decay', 'https://arxiv.org/abs/1711.05101', 'paper')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
