/* =====================================================================
   lessons-07-dl.js  —  12 lessons (deep learning)
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'dl';

  /* ------------------------------------------------------------------ */
  L('dl-001', D, 'beginner', 14,
    ['Neural Networks from Scratch: Layers, Weights and Depth', 'شبکه‌های عصبی از پایه: لایه‌ها، وزن‌ها و عمق'],
    ['A neural network is a stack of linear maps with non-linearities between them. Depth is what buys you compositionality: later layers build features out of earlier ones.',
     'شبکه عصبی پشته‌ای از نگاشت‌های خطی است که بین آن‌ها غیرخطی‌بودگی قرار دارد. عمق همان چیزی است که ترکیب‌پذیری را می‌خرد: لایه‌های بعدی ویژگی‌ها را از لایه‌های قبلی می‌سازند.'],
    [
      def('A layer computes h = phi(W x + b) where W is a weight matrix, b a bias and phi a non-linear activation. Without phi, the whole stack collapses to a single linear map: W2(W1 x) = (W2 W1) x. Depth without non-linearity is pointless.',
          'یک لایه عبارت h = phi(W x + b) را حساب می‌کند که در آن W ماتریسِ وزن، b بایاس و phi تابعِ فعال‌سازِ غیرخطی است. بدون phi کلِ پشته به یک نگاشتِ خطیِ واحد فرو می‌ریزد: W2(W1 x) = (W2 W1) x. عمق بدون غیرخطی بودن بی‌معناست.'),
      math('layer:      h^(l) = phi( W^(l) h^(l-1) + b^(l) )\nsizes:      W^(l) is (n_l x n_{l-1}),  b^(l) is (n_l,)\nparameters of an MLP:  SUM_l (n_{l-1} * n_l + n_l)\n\nuniversal approximation: one hidden layer with enough units can approximate any\n  continuous function on a compact set — but "enough" may be exponential.\n  Depth is exponentially more parameter-efficient for many function classes.\n\nwhat depth composes:\n  layer 1: edges and colours      layer 2: corners, textures\n  layer 3: parts (eye, wheel)     layer 4: objects (face, car)'),
      code(`import numpy as np
rng = np.random.default_rng(0)

# A 2-layer MLP for binary classification, in 30 lines of NumPy
def relu(z): return np.maximum(0, z)
def drelu(z): return (z > 0).astype(float)
def sigmoid(z): return 1/(1+np.exp(-z))

n_in, n_hid, n_out = 20, 64, 1
W1 = rng.normal(0, np.sqrt(2/n_in),  (n_in, n_hid));  b1 = np.zeros(n_hid)
W2 = rng.normal(0, np.sqrt(2/n_hid), (n_hid, n_out)); b2 = np.zeros(n_out)

def forward(x):
    z1 = x @ W1 + b1;  h1 = relu(z1)
    z2 = h1 @ W2 + b2; p = sigmoid(z2)
    return z1, h1, z2, p

X = rng.normal(size=(2000, n_in))
y = (X[:, 0]*X[:, 1] + 0.3*rng.normal(size=2000) > 0).astype(float)[:, None]

lr = 0.05
for step in range(600):
    z1, h1, z2, p = forward(X)
    loss = -np.mean(y*np.log(p+1e-9) + (1-y)*np.log(1-p+1e-9))

    dz2 = (p - y) / len(y)                 # dL/dz2 for BCE + sigmoid
    dW2 = h1.T @ dz2;           db2 = dz2.sum(0)
    dh1 = dz2 @ W2.T
    dz1 = dh1 * drelu(z1)
    dW1 = X.T @ dz1;            db1 = dz1.sum(0)

    for P, G in [(W2,dW2),(b2,db2),(W1,dW1),(b1,db1)]: P -= lr*G
    if step % 150 == 0: print('step', step, 'loss', round(float(loss), 4))
print('train accuracy', round(float(((forward(X)[3] > .5) == y).mean()), 4))`),
      ul(['Parameter count is dominated by the largest layer; that is where quantization and LoRA matter most.',
          'A bias is redundant if the next layer uses batch/layer normalisation — many modern nets drop them.',
          'Width vs depth: for a fixed budget, deeper usually generalises better up to optimisation limits.',
          'Residual connections are what make very deep networks trainable at all.'],
         ['تعدادِ پارامترها تحت سلطه‌ی بزرگ‌ترین لایه است؛ این همان‌جایی است که کوانتیزاسیون و LoRA اهمیت می‌یابند.',
          'اگر لایه‌ی بعدی از نرمال‌سازیِ بَچ/لایه استفاده کند، بایاس زائد است — بسیاری از شبکه‌های امروزی آن را حذف می‌کنند.',
          'پهنا در برابر عمق: با بودجه‌ی ثابت، عمیق‌تر معمولاً تا مرزهای بهینه‌سازی تعمیمِ بهتری دارد.',
          'اتصال‌های بازمانده (residual) همان چیزی هستند که آموزشِ شبکه‌های بسیار عمیق را اصولاً ممکن می‌کنند.'])
    ],
    ['neural-networks', 'mlp', 'forward-pass', 'universal-approximation'],
    [R('Neural Networks and Deep Learning (Nielsen, free)', 'http://neuralnetworksanddeeplearning.com/', 'book'),
     R('PyTorch — What is torch.nn?', 'https://pytorch.org/tutorials/beginner/nn_tutorial.html', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-002', D, 'intermediate', 15,
    ['Backpropagation and Automatic Differentiation', 'پس‌انتشار و مشتق‌گیریِ خودکار'],
    ['Backpropagation is the chain rule applied in reverse order with intermediate values cached. Autodiff frameworks build a graph of your operations and do this for you — but you must understand it to debug a vanishing or exploding gradient.',
     'پس‌انتشار همان قاعده‌ی زنجیره‌ای است که با ترتیبِ معکوس و با ذخیره‌ی مقادیرِ میانی اعمال می‌شود. چارچوب‌های مشتق‌گیریِ خودکار گرافی از عمل‌های شما می‌سازند و این را برای‌تان انجام می‌دهند — اما برای دیباگِ گرادیانِ محو یا منفجر باید آن را بفهمید.'],
    [
      def('Forward mode computes derivatives alongside values (efficient for few inputs, many outputs). Reverse mode — backpropagation — computes one pass backwards and gives the gradient with respect to every parameter at once, which is exactly what training needs with millions of parameters and one scalar loss.',
          'حالتِ پیش‌رو مشتق‌ها را کنار مقادیر حساب می‌کند (برای ورودی‌های کم و خروجی‌های زیاد کاراست). حالتِ معکوس — پس‌انتشار — یک گذرِ رو به عقب انجام می‌دهد و گرادیان نسبت به همه‌ی پارامترها را یک‌جا می‌دهد؛ دقیقاً همان چیزی که آموزش با میلیون‌ها پارامتر و یک هزینه‌ی اسکالر نیاز دارد.'),
      math('for a chain  x -> h1 -> h2 -> L  with parameters W1, W2:\n  cache z1, h1, z2 in the forward pass\n  dL/dW2 = (dL/dz2) (dz2/dW2)                   = delta2 * h1^T\n  dL/dh1 = (dL/dz2) (dz2/dh1)                   = delta2 * W2^T\n  dL/dW1 = (dL/dz1) (dz1/dW1) = (dL/dh1 * phi\') * x^T\n\ncost:  one forward + one backward ≈ 2-3x the forward pass (independent of #params)\nmemory: you must keep every activation -> activation checkpointing trades compute for memory\n\nvanishing:  product of Jacobians with spectral radius < 1 -> 0   (deep sigmoid nets)\nexploding:  spectral radius > 1 -> inf -> gradient clipping (clip by global norm ~1.0)'),
      code(`import torch, torch.nn as nn

torch.manual_seed(0)
model = nn.Sequential(nn.Linear(20, 64), nn.ReLU(), nn.Linear(64, 1))
opt   = torch.optim.AdamW(model.parameters(), lr=1e-3)
lossf = nn.BCEWithLogitsLoss()

X = torch.randn(1024, 20)
y  = (torch.rand(1024, 1) < torch.sigmoid(X[:, :1]*2)).float()

for step in range(300):
    opt.zero_grad(set_to_none=True)   # clear old gradients (accumulate by default!)
    loss = lossf(model(X), y)
    loss.backward()                    # reverse-mode autodiff over the graph
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)   # against explosions
    opt.step()

# Inspect gradients: the #1 debugging tool
for name, prm in model.named_parameters():
    if prm.grad is not None:
        print(f'{name:12s} grad norm {prm.grad.norm():.5f}  -> nan? {torch.isnan(prm.grad).any().item()}')

# Gradient accumulation: simulate a batch of 1024 with 4 micro-batches of 256
opt.zero_grad()
for i in range(4):
    loss = lossf(model(X[i*256:(i+1)*256]), y[i*256:(i+1)*256]) / 4
    loss.backward()
opt.step()

# Freeze most of the network (transfer learning) then unfreeze later
for prm in model[:-1].parameters(): prm.requires_grad_(False)`),
      ul(['Always zero_grad() before backward(); gradients accumulate by default in PyTorch.',
          'Use loss.item() for logging; keeping tensors around retains the whole graph and leaks memory.',
          'detach() or torch.no_grad() when you only need values (evaluation, target networks in RL).',
          'Check gradient norms per layer at step 1: zeros mean dead units or a detached branch.'],
         ['همیشه پیش از backward() تابعِ zero_grad() را فراخوانید؛ در پای‌تورچ گرادیان‌ها به‌طور پیش‌فرض انباشته می‌شوند.',
          'برای لاگ‌کردن از loss.item() استفاده کنید؛ نگه‌داشتنِ تنسورها کلِ گراف را حفظ می‌کند و حافظه نشت می‌کند.',
          'وقتی تنها به مقادیر نیاز دارید (ارزیابی، شبکه‌های هدف در RL) از detach() یا torch.no_grad() استفاده کنید.',
          'نُرمِ گرادیانِ هر لایه را در گامِ ۱ بررسی کنید: صفر یعنی واحدِ مرده یا شاخه‌ای جدا شده.'])
    ],
    ['backprop', 'autograd', 'pytorch', 'gradient-clipping'],
    [R('PyTorch autograd mechanics', 'https://pytorch.org/docs/stable/notes/autograd.html', 'doc'),
     R('Yes you should understand backprop (Karpathy)', 'https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-003', D, 'intermediate', 16,
    ['Activations, Initialization and Normalization', 'فعال‌سازها، مقداردهیِ اولیه و نرمال‌سازی'],
    ['Three design choices decide whether a deep network trains at all: the activation shapes the gradient flow, the initialization keeps signals in a useful range, and normalization keeps that true throughout training.',
     'سه انتخابِ طراحی تعیین می‌کنند اصلاً یک شبکه‌ی عمیق آموزش ببیند یا نه: فعال‌ساز جریانِ گرادیان را شکل می‌دهد، مقداردهیِ اولیه سیگنال‌ها را در بازه‌ی مفید نگه می‌دارد و نرمال‌سازی در تمامِ طولِ آموزش این را حفظ می‌کند.'],
    [
      def('Initialization aims to keep the variance of activations roughly constant across layers (He/Xavier). Normalization layers (BatchNorm, LayerNorm, RMSNorm) re-standardise activations during training, which lets you use bigger learning rates and makes depth trainable.',
          'هدفِ مقداردهیِ اولیه این است که واریانسِ فعال‌سازی‌ها را تقریباً در طولِ لایه‌ها ثابت نگه دارد (He/Xavier). لایه‌های نرمال‌سازی (BatchNorm، LayerNorm، RMSNorm) فعال‌سازی‌ها را در طولِ آموزش دوباره استاندارد می‌کنند، که اجازه می‌دهد نرخ‌های یادگیریِ بزرگ‌تر به‌کار ببرید و عمق را آموزش‌پذیر می‌کند.'),
      math('Xavier/Glorot:  Var(W) = 2/(n_in + n_out)      good for tanh / sigmoid\nHe:             Var(W) = 2/n_in                 for ReLU and family\n\nactivations:\n  sigmoid   1/(1+e^-z)         saturates -> vanishing gradients; use only at the output\n  tanh      zero-centred, still saturates\n  ReLU      max(0,z)           cheap, but dead units for z < 0\n  LeakyReLU max(az, z)         a = 0.01, no dead units\n  GELU      x*Phi(x)           smooth; default in transformers\n  SiLU/Swish x*sigmoid(x)      used in EfficientNet, modern convnets\n  GLU/SwiGLU gated variants    default FFN activation in LLMs\n\nBatchNorm:  normalise over (batch, spatial)  -> needs large batches, breaks with tiny ones\nLayerNorm:  normalise over (features)        -> batch-size independent; transformers\nRMSNorm:    divide by RMS only, no mean      -> cheaper, used by LLaMA\nGroupNorm:  normalise over channel groups    -> small-batch vision'),
      code(`import torch, torch.nn as nn
import numpy as np

# Why initialization matters: watch activation std explode or vanish
def activation_std(depth=30, width=256, scale=1.0, act='relu'):
    x = torch.randn(512, width)
    for _ in range(depth):
        W = torch.randn(width, width) * scale
        x = torch.relu(x @ W) if act == 'relu' else torch.tanh(x @ W)
    return x.std().item(), x.mean().item()

for scale in [0.01, 0.1, np.sqrt(2/256)]:
    s, m = activation_std(scale=scale)
    print(f'scale={scale:.4f} -> after 30 layers: std={s:.4e} mean={m:.3f}')

# The right init keeps the signal alive
lin = nn.Linear(256, 256)
nn.init.kaiming_normal_(lin.weight, nonlinearity='relu')   # He init
print('He init std', round(lin.weight.std().item(), 4), 'expected', round(np.sqrt(2/256), 4))

# BatchNorm vs LayerNorm: shape of what gets normalised
x = torch.randn(32, 128, 512)               # (batch, seq, features)
bn = nn.BatchNorm1d(512); ln = nn.LayerNorm(512); rms = nn.RMSNorm(512)
print('BN over batch+seq | LN over features | RMSNorm over features, mean-free')

# Pre-LN vs Post-LN transformers: pre-LN removes the need for careful warmup
block_post = nn.Sequential(nn.MultiheadAttention(512, 8, batch_first=True), nn.LayerNorm(512))
block_pre  = nn.Sequential(nn.LayerNorm(512), nn.MultiheadAttention(512, 8, batch_first=True))`),
      ul(['Match the init to the activation: He for ReLU-family, Xavier for tanh.',
          'LayerNorm/RMSNorm are the default in transformers; BatchNorm still wins in convnets with big batches.',
          'Normalization has a running-statistics state at inference; make sure it is in eval() mode.',
          'Dead ReLUs show up as zero gradient and zero activation — try LeakyReLU or lower the learning rate.'],
         ['مقداردهی را با فعال‌ساز هماهنگ کنید: He برای خانواده‌ی ReLU، Xavier برای تانژانت.',
          'در ترنسفورمرها LayerNorm/RMSNorm پیش‌فرض‌اند؛ BatchNorm هنوز در شبکه‌های پیچشی با بَچ‌های بزرگ برنده است.',
          'نرمال‌سازی در استنتاج آماره‌های در حالِ اجرا دارد؛ مطمئن شوید در حالتِ eval() است.',
          'ReLUهای مرده به‌شکل گرادیانِ صفر و فعال‌سازیِ صفر ظاهر می‌شوند — LeakyReLU را امتحان کنید یا نرخِ یادگیری را کم کنید.'])
    ],
    ['activations', 'initialization', 'batchnorm', 'layernorm'],
    [R('Delving Deep into Rectifiers (He et al.)', 'https://arxiv.org/abs/1502.01852', 'paper'),
     R('Layer Normalization', 'https://arxiv.org/abs/1607.06450', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-004', D, 'intermediate', 14,
    ['Loss Functions, Output Heads and What They Assume', 'توابع هزینه، سرهای خروجی و فرض‌های آن‌ها'],
    ['Choosing a loss is choosing a probabilistic assumption and a business objective at the same time. Get it wrong and the network optimises something nobody cares about.',
     'انتخابِ تابعِ هزینه یعنی هم‌زمان انتخابِ یک فرضِ احتمالاتی و یک هدفِ کسب‌وکاری. اگر اشتباه کنید، شبکه چیزی را بهینه می‌کند که هیچ‌کس برایش اهمیت ندارد.'],
    [
      def('A loss for classification is usually the negative log-likelihood of a categorical distribution over classes (cross-entropy). A loss for regression is usually the negative log-likelihood of a Gaussian (MSE) or Laplace (MAE). Custom losses (focal, Huber, Dice, contrastive) exist to fix a specific mismatch between these defaults and the real objective.',
          'تابعِ هزینه برای دسته‌بندی معمولاً منفیِ لگاریتمِ درست‌نماییِ یک توزیعِ دسته‌ای روی کلاس‌هاست (آنتروپیِ متقاطع). تابعِ هزینه برای رگرسیون معمولاً منفیِ لگاریتمِ درست‌نماییِ یک گاوسی (MSE) یا لاپلاس (MAE) است. توابعِ سفارشی (focal، Huber، Dice، تضادی) برای رفعِ یک ناهم‌خوانیِ مشخص بین این پیش‌فرض‌ها و هدفِ واقعی وجود دارند.'),
      math('cross-entropy (K classes):   L = -log p_{y}          p = softmax(z)\n  with logits:  log_softmax then NLL            <-- numerically stable, always do this\n  label smoothing: target = (1-e) one_hot + e/K  -> less overconfident, better calibration\n\nbinary:      BCEWithLogitsLoss  (logits, not probabilities — fused sigmoid for stability)\nregression:  MSE = mean (y-y_hat)^2     -> predicts the conditional MEAN\n             MAE = mean |y-y_hat|       -> predicts the conditional MEDIAN\n             Huber = quadratic near 0, linear beyond delta -> robust to outliers\n             quantile loss = max(q e, (q-1) e)  -> predictive intervals\nimbalance:   focal loss = -(1-p_t)^gamma log p_t   down-weights easy examples\nranking:     contrastive / triplet / InfoNCE:\n  InfoNCE = -log [ exp(sim(q,k+)/tau) / SUM_j exp(sim(q,k_j)/tau) ]\nsegmentation: Dice / Focal-Tversky for tiny objects'),
      code(`import torch, torch.nn as nn, torch.nn.functional as F

# NEVER do this (unstable):  loss = -torch.log(torch.softmax(logits, -1)[target])
# ALWAYS do this:
logits = torch.randn(8, 5); target = torch.randint(0, 5, (8,))
print('cross entropy', F.cross_entropy(logits, target).item())
print('manual       ', F.nll_loss(F.log_softmax(logits, -1), target).item())

# Label smoothing
print('smoothed     ', F.cross_entropy(logits, target, label_smoothing=0.1).item())

# Regression losses predict different statistics
y, yhat = torch.randn(1000, 1), None
data = torch.randn(1000)
noise = torch.randn(1000)*0.5
y = torch.sin(data) + noise
mse_pred = y.mean().expand_as(y)          # MSE minimiser = mean
mae_pred = y.median().expand_as(y)        # MAE minimiser = median
print('MSE at mean  ', F.mse_loss(mse_pred, y).item(), '| at median', F.mse_loss(mae_pred, y).item())
print('MAE at mean  ', F.l1_loss(mse_pred, y).item(),  '| at median', F.l1_loss(mae_pred, y).item())

# Focal loss for 1000:1 imbalance
def focal_loss(logits, targets, gamma=2.0, alpha=0.25):
    bce = F.binary_cross_entropy_with_logits(logits, targets, reduction='none')
    pt  = torch.exp(-bce)
    return (alpha * (1-pt)**gamma * bce).mean()

# InfoNCE (the contrastive loss behind CLIP and SimCLR)
def info_nce(q, k, tau=0.07):
    q, k = F.normalize(q), F.normalize(k)
    logits = q @ k.T / tau
    labels = torch.arange(len(q), device=q.device)
    return F.cross_entropy(logits, labels)`),
      ul(['Pass logits to the loss, not probabilities: fused implementations are stable and faster.',
          'Weighted or focal losses change what the model focuses on; so does simply resampling.',
          'Multi-task learning: sum the losses, but tune the weights (or use uncertainty weighting).',
          'If the metric is not differentiable, try a surrogate — then check the surrogate correlates with the metric.'],
         ['logits را به تابعِ هزینه بدهید، نه احتمال‌ها را: پیاده‌سازی‌های ترکیبی پایدارتر و سریع‌ترند.',
          'توابعِ هزینه‌ی وزن‌دار یا focal تمرکزِ مدل را تغییر می‌دهند؛ بازنمونه‌گیریِ ساده هم همین کار را می‌کند.',
          'یادگیریِ چندوظیفه‌ای: هزینه‌ها را جمع کنید، اما وزن‌ها را تنظیم کنید (یا از وزن‌دهیِ عدم‌قطعیت استفاده کنید).',
          'اگر معیار مشتق‌پذیر نیست، یک جایگزین امتحان کنید — سپس بررسی کنید جایگزین با معیار همبستگی دارد.'])
    ],
    ['loss-functions', 'cross-entropy', 'focal', 'infonce'],
    [R('Focal Loss for Dense Object Detection', 'https://arxiv.org/abs/1708.02002', 'paper'),
     R('PyTorch loss functions', 'https://pytorch.org/docs/stable/nn.html#loss-functions', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-005', D, 'intermediate', 17,
    ['The Training Recipe: Regularization, Augmentation and Debugging', 'دستور پختِ آموزش: منظم‌سازی، افزایشِ داده و دیباگ'],
    ['There is a standard order of operations for training a neural net. Follow it and most problems disappear before they start; skip it and you will spend days on an optimizer that was never the issue.',
     'برای آموزشِ شبکه عصبی یک ترتیبِ عملیاتِ استاندارد وجود دارد. آن را رعایت کنید و بیشترِ مشکل‌ها پیش از شروع ناپدید می‌شوند؛ رهایش کنید و روزها صرفِ بهینه‌سازی می‌کنید که اصلاً مشکل نبود.'],
    [
      def('Regularization is any technique that improves generalization without improving training fit: weight decay, dropout, data augmentation, early stopping, noise, label smoothing, mixup/cutmix, and simply training longer with the right schedule.',
          'منظم‌سازی هر تکنیکی است که تعمیم را بدون بهبودِ برازشِ آموزش بهتر کند: کاهشِ وزن، دراپ‌اوت، افزایشِ داده، توقفِ زودهنگام، نویز، هموارسازیِ برچسب، mixup/cutmix، و صرفاً آموزشِ طولانی‌تر با زمان‌بندیِ درست.'),
      math('the recipe (Karpathy-style):\n  1. become one with the data: look at examples, check labels, find duplicates/leakage\n  2. set up the end-to-end training + evaluation skeleton with fixed random seeds\n  3. overfit a tiny subset (e.g. 32 examples) -> if loss will not go to ~0, you have a bug\n  4. underfit on purpose: no augmentation, no regularization, small model\n     -> verify the train loss goes down and the val gap is small\n  5. regularize: more data > augmentation > weight decay > dropout > smaller model\n  6. tune: learning rate (log sweep), batch size, schedule, architecture\n  7. squeeze: ensembling, longer training, test-time augmentation\n\ndropout:  randomly zero activations with prob p during training; scale by 1/(1-p) at inference\nweight decay:  w <- w - eta*lambda*w     (AdamW decouples it from the gradient)\nmixup:  x = lam x_i + (1-lam) x_j,  y = lam y_i + (1-lam) y_j'),
      code(`import torch, torch.nn as nn, torch.nn.functional as F
from torchvision import transforms
torch.manual_seed(0)

# Augmentation is the strongest regularizer for vision
train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.6, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.3, 0.3, 0.3, 0.1),
    transforms.RandomErasing(p=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
])

# Mixup: interpolate inputs AND labels
def mixup(x, y, alpha=0.4):
    lam = torch.distributions.Beta(alpha, alpha).sample()
    idx = torch.randperm(x.size(0), device=x.device)
    return lam*x + (1-lam)*x[idx], lam*y + (1-lam)*y[idx]

# The modern training loop skeleton
def train(model, loader, epochs=10, lr=3e-4, wd=0.05):
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=wd,
                            betas=(0.9, 0.95))
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=lr,
                                                steps_per_epoch=len(loader), epochs=epochs)
    best = float('inf')
    for ep in range(epochs):
        model.train()
        for xb, yb in loader:
            xb, yb = mixup(xb, F.one_hot(yb, 10).float())
            opt.zero_grad(set_to_none=True)
            loss = F.cross_entropy(model(xb), yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step(); sched.step()
        # early stopping on validation loss with patience
        val = evaluate(model, loader)
        if val < best - 1e-4: best, patience = val, 0
        else:
            patience += 1
            if patience > 5: print('early stop at epoch', ep); break`),
      ul(['Overfit one batch first: it is a five-minute test that catches most bugs.',
          'Weight decay and dropout are weak compared with more and better data.',
          'Augmentation must respect the label: do not flip a "6" into a "9", do not rotate text randomly.',
          'Track train and val loss together; the gap is the only honest overfitting signal.'],
         ['ابتدا روی یک بَچ بیش‌برازش بگیرید: آزمونی پنج‌دقیقه‌ای که بیشترِ باگ‌ها را می‌گیرد.',
          'کاهشِ وزن و دراپ‌اوت در مقایسه با داده‌ی بیشتر و بهتر ضعیف‌اند.',
          'افزایشِ داده باید برچسب را رعایت کند: یک «۶» را به «۹» تبدیل نکنید، متن را بی‌حساب نچرخانید.',
          'هزینه‌ی آموزش و اعتبارسنجی را با هم ردیابی کنید؛ شکاف تنها نشانه‌ی صادقانه‌ی بیش‌برازش است.']),
      note('Debugging checklist when the loss will not move: verify the labels are aligned with the inputs, print a few predictions, check for NaNs, confirm the loss is computed on the right axis, and try lr = 1e-6 then 1e-2 to bracket the working range.',
           'چک‌لیستِ دیباگ وقتی هزینه تکان نمی‌خورد: بررسی کنید برچسب‌ها با ورودی‌ها هم‌راستا باشند، چند پیش‌بینی چاپ کنید، NaNها را چک کنید، تأیید کنید هزینه روی محورِ درست حساب می‌شود، و مقدارِ lr را از 1e-6 تا 1e-2 امتحان کنید تا بازه‌ی کارآمد را قاب بگیرید.')
    ],
    ['training', 'regularization', 'augmentation', 'early-stopping', 'mixup'],
    [R('A Recipe for Training Neural Networks (Karpathy)', 'https://karpathy.github.io/2019/04/25/recipe/', 'doc'),
     R('Bag of Tricks for Image Classification', 'https://arxiv.org/abs/1812.01187', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-006', D, 'advanced', 18,
    ['Convolutional Networks and Modern Vision Architectures', 'شبکه‌های پیچشی و معماری‌های امروزیِ بینایی'],
    ['Convolutions encode three priors about images: locality, translation equivariance and weight sharing. Everything from ResNet to ConvNeXt is an argument about how to keep those priors while making the network deeper and cheaper.',
     'پیچش‌ها سه پیش‌فرض درباره‌ی تصویر را در خود دارند: موضعی بودن، هم‌ورداییِ انتقالی و اشتراکِ وزن. هر چیزی از ResNet تا ConvNeXt بحثی است درباره‌ی این‌که چگونه این پیش‌فرض‌ها را حفظ کنیم در حالی که شبکه عمیق‌تر و ارزان‌تر می‌شود.'],
    [
      def('A convolution slides a small kernel across the input, computing dot products: it detects the same local pattern everywhere with the same weights. Pooling or strided convolution reduces resolution; stacking layers trades spatial resolution for channel depth, building a hierarchy from edges to objects.',
          'یک پیچش یک کرنلِ کوچک را روی ورودی می‌لغزاند و ضرب‌های داخلی حساب می‌کند: همان الگوی موضعی را همه‌جا با همان وزن‌ها تشخیص می‌دهد. ادغام (pooling) یا پیچش با گامِ بیشتر وضوح را کاهش می‌دهد؛ روی‌هم‌چیدنِ لایه‌ها وضوحِ مکانی را با عمقِ کانال معامله می‌کند و سلسله‌مراتبی از لبه تا شیء می‌سازد.'),
      math('output size:  O = floor( (I + 2P - K) / S ) + 1\n  I input, K kernel, P padding, S stride\nreceptive field of layer l:  RF_l = RF_{l-1} + (K_l - 1) * PROD_{i<l} S_i\n\nparameters of a conv:  K*K*C_in*C_out (+C_out)\n  3x3 conv, 256 -> 256  = 590k;  a 7x7 conv = 3.2M  -> stack 3x3 instead (same RF, fewer params)\n\narchitectural milestones:\n  LeNet -> AlexNet (ReLU + GPU) -> VGG (deep 3x3) -> GoogLeNet (inception, 1x1 bottlenecks)\n  ResNet:  y = F(x) + x        identity skip -> gradients flow, 1000+ layers trainable\n  DenseNet, SENet (channel attention), EfficientNet (compound scaling d/w/r)\n  ConvNeXt: a ResNet modernised with transformer-era tricks (GELU, LN, large kernels)\n  ViT / Swin: pure attention on patches; needs lots of data or strong augmentation'),
      code(`import torch, torch.nn as nn

# A residual block: the single most reused idea in deep learning
class ResBlock(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(c, c, 3, padding=1, bias=False),
            nn.BatchNorm2d(c), nn.ReLU(inplace=True),
            nn.Conv2d(c, c, 3, padding=1, bias=False),
            nn.BatchNorm2d(c))
    def forward(self, x): return torch.relu(x + self.net(x))     # the skip

# Receptive field arithmetic
def out_size(i, k=3, p=1, s=1): return (i + 2*p - k)//s + 1
n = 224
for _ in range(5): n = out_size(n, 3, 1, 2)
print('after 5 stride-2 blocks:', n, 'x', n)                    # 7x7

# Depthwise separable convolution: MobileNet's trick, ~9x cheaper
dw = nn.Conv2d(64, 64, 3, padding=1, groups=64)     # depthwise
pw = nn.Conv2d(64, 128, 1)                          # pointwise (1x1)
std = nn.Conv2d(64, 128, 3, padding=1)
print('separable params', sum(p.numel() for p in (dw, pw)),
      'vs standard', sum(p.numel() for p in std.parameters()))

# Transfer learning: the realistic way to work with vision
from torchvision import models
m = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
for prm in m.parameters(): prm.requires_grad_(False)
m.fc = nn.Linear(m.fc.in_features, 10)              # new head, train only this
print('trainable params', sum(p.numel() for p in m.parameters() if p.requires_grad))`),
      ul(['Use pretrained weights: for most vision tasks you fine-tune, you do not train from scratch.',
          'Batch size interacts with BatchNorm — below ~8 per device, switch to GroupNorm.',
          'Modern data regimes: strong augmentation + regularization beats architectural cleverness.',
          'For detection and segmentation, the backbone is shared; the head and loss differ.'],
         ['از وزن‌های از‌پیش‌آموخته استفاده کنید: برای بیشترِ کارهای بینایی تنظیمِ ظریف می‌کنید، از صفر آموزش نمی‌دهید.',
          'اندازه‌ی بَچ با BatchNorm تعامل دارد — کمتر از حدود ۸ به‌ازای هر دستگاه، به GroupNorm بروید.',
          'در رژیم‌های داده‌ی امروزی، افزایشِ داده‌ی قوی + منظم‌سازی از زرنگیِ معماری بهتر است.',
          'برای تشخیص و قطعه‌بندی، ستونِ فقرات مشترک است؛ سر و تابعِ هزینه فرق می‌کنند.'])
    ],
    ['cnn', 'resnet', 'convolution', 'transfer-learning', 'receptive-field'],
    [R('Deep Residual Learning (ResNet)', 'https://arxiv.org/abs/1512.03385', 'paper'),
     R('CS231n: Convolutional Neural Networks for Visual Recognition', 'https://cs231n.github.io/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-007', D, 'advanced', 17,
    ['Sequence Models: RNN, LSTM, Seq2Seq and the Road to Attention', 'مدل‌های دنباله‌ای: RNN، LSTM، Seq2Seq و راهِ رسیدن به توجه'],
    ['Recurrent networks process sequences one step at a time, carrying a hidden state. They dominated NLP for a decade — and understanding why they struggle is exactly why transformers exist.',
     'شبکه‌های بازگشتی دنباله‌ها را گام‌به‌گام پردازش می‌کنند و یک حالتِ پنهان حمل می‌کنند. آن‌ها یک دهه بر پردازشِ زبان چیره بودند — و فهمیدنِ این‌که چرا به زحمت می‌افتند دقیقاً دلیلِ وجودِ ترنسفورمرهاست.'],
    [
      def('An RNN computes h_t = phi(W_xh x_t + W_hh h_{t-1} + b). Unrolled in time it is a deep network with shared weights, trained by backpropagation through time (BPTT). The gradient path through time is a product of Jacobians, which is where vanishing and exploding gradients come from.',
          'یک RNN عبارت h_t = phi(W_xh x_t + W_hh h_{t-1} + b) را حساب می‌کند. اگر در زمان باز شود، شبکه‌ای عمیق با وزن‌های مشترک است که با پس‌انتشار در زمان (BPTT) آموزش می‌بیند. مسیرِ گرادیان در زمان حاصل‌ضربی از ژاکوبین‌هاست، و محو یا انفجارِ گرادیان از همین‌جا می‌آید.'),
      math('vanilla RNN:   h_t = tanh(W_xh x_t + W_hh h_{t-1} + b)\n  gradient:  dh_t/dh_{t-k} = PROD_j (diag(phi\') W_hh)   -> rho^k: vanishes or explodes\n\nLSTM gates (the fix: a highway for the gradient):\n  f_t = sigmoid(W_f [h_{t-1}, x_t])      forget\n  i_t = sigmoid(W_i [h_{t-1}, x_t])      input\n  g_t = tanh(   W_g [h_{t-1}, x_t])      candidate\n  o_t = sigmoid(W_o [h_{t-1}, x_t])      output\n  c_t = f_t * c_{t-1} + i_t * g_t        cell state (additive -> gradient flows!)\n  h_t = o_t * tanh(c_t)\nGRU: two gates (update, reset), fewer parameters, usually similar quality\n\nseq2seq + attention:\n  encoder -> context c;  decoder produces y_t conditioned on c_t = SUM_i alpha_{ti} h_i\n  alpha_{ti} = softmax(score(h_t, h_i))      -> the bottleneck is fixed, attention removes it'),
      code(`import torch, torch.nn as nn

# LSTM from the outside: what the shapes mean
lstm = nn.LSTM(input_size=32, hidden_size=64, num_layers=2,
               batch_first=True, dropout=0.1, bidirectional=True)
x = torch.randn(16, 50, 32)                 # (batch, seq, features)
out, (h, c) = lstm(x)
print('output', tuple(out.shape),           # (16, 50, 128) = 2 directions x 64
      'hidden', tuple(h.shape))             # (4, 16, 64)  = 2 layers x 2 dirs

# Packed sequences: skip the padding, get correct hidden states and speed
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence
lengths = torch.randint(20, 50, (16,)).sort(descending=True).values
packed  = pack_padded_sequence(x, lengths.cpu(), batch_first=True)
out, (h, c) = lstm(packed)
out, _ = pad_packed_sequence(out, batch_first=True)

# Additive attention (Bahdanau) in ~10 lines
class AdditiveAttention(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.v = nn.Linear(dim, 1, bias=False)
        self.W = nn.Linear(dim*2, dim, bias=False)
    def forward(self, query, keys, mask=None):
        # query (B, D), keys (B, T, D)
        q = query.unsqueeze(1).expand_as(keys[:, :, :query.size(-1)])
        e = self.v(torch.tanh(self.W(torch.cat([q, keys], -1)))).squeeze(-1)
        if mask is not None: e = e.masked_fill(mask == 0, -1e9)
        a = torch.softmax(e, -1)
        return (a.unsqueeze(-1) * keys).sum(1), a`),
      ul(['RNNs are sequential: O(T) steps with no parallelism — the fatal bottleneck for long sequences.',
          'LSTM/GRU fix gradient flow but not the sequential-computation or long-range-memory problem.',
          'Bidirectional encoders are fine for classification, impossible for autoregressive decoding.',
          'Teacher forcing during training vs scheduled sampling at inference is the classic exposure-bias trap.'],
         ['شبکه‌های بازگشتی ترتیبی‌اند: O(T) گام بدون موازی‌سازی — گلوگاهِ مرگبار برای دنباله‌های بلند.',
          'LSTM/GRU جریانِ گرادیان را درست می‌کنند، اما مشکلِ محاسبه‌ی ترتیبی و حافظه‌ی بلندبرد را نه.',
          'رمزگذارهای دوجهته برای دسته‌بندی خوب‌اند، اما برای رمزگشاییِ خودبازگشتی غیرممکن‌اند.',
          'اجبارِ معلم در آموزش در برابر نمونه‌گیریِ زمان‌بندی‌شده در استنتاج، همان تله‌ی کلاسیکِ اُریبِ مواجهه است.'])
    ],
    ['rnn', 'lstm', 'seq2seq', 'attention'],
    [R('Understanding LSTM Networks (Olah)', 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/', 'doc'),
     R('Neural Machine Translation by Jointly Learning to Align and Translate', 'https://arxiv.org/abs/1409.0473', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-008', D, 'advanced', 19,
    ['Transformers: Self-Attention in Depth', 'ترنسفورمرها: خودتوجهی در عمق'],
    ['Attention replaces recurrence with a single matrix multiplication over the whole sequence. That one change made training parallel, made long-range dependencies cheap, and gave us the modern AI era.',
     'توجه جایگزینِ بازگشت با یک ضربِ ماتریسیِ واحد روی کلِ دنباله می‌شود. همین یک تغییر آموزش را موازی کرد، وابستگی‌های بلندبرد را ارزان کرد و عصرِ هوش مصنوعیِ امروز را ساخت.'],
    [
      def('Scaled dot-product attention computes, for each query, a weighted average of values, where the weights come from query-key similarity: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V. Multi-head attention runs several of these in parallel subspaces so different heads can attend to different relations.',
          'توجهِ ضربِ داخلیِ مقیاس‌شده برای هر پرس‌وجو میانگینِ وزن‌داری از مقادیر حساب می‌کند که وزن‌های آن از شباهتِ پرس‌وجو-کلید می‌آیند: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V. توجهِ چندسر چندتا از این‌ها را در زیرفضاهای موازی اجرا می‌کند تا سرهای مختلف بتوانند به روابطِ مختلف توجه کنند.'),
      math('Attention(Q,K,V) = softmax( Q K^T / sqrt(d_k) + M ) V\n  Q (n x d_k), K (m x d_k), V (m x d_v);  M is the causal/additive mask\n  scaling by sqrt(d_k) keeps the softmax out of its saturated region\n\nmulti-head:  head_i = Attn(X W_i^Q, X W_i^K, X W_i^V);   out = Concat(head) W^O\n  h heads, d_model = h * d_k       (8-128 heads typical)\n\ncomplexity:  O(n^2 d) time and O(n^2) memory in sequence length  <- the wall\n  -> FlashAttention (IO-aware tiling), linear attention, Mamba/SSM, sparse/local windows\n\npositional encoding:\n  sinusoidal: PE(pos,2i) = sin(pos/10000^{2i/d})\n  RoPE: rotate Q,K by an angle proportional to position (LLaMA, most LLMs today)\n  ALiBi: add a linear bias to the scores; excellent length extrapolation\n\nblock:  x = x + Attn(LN(x));  x = x + FFN(LN(x))      (pre-LN, the stable order)'),
      code(`import torch, torch.nn as nn, torch.nn.functional as F
import math

def scaled_dot_product_attention(Q, K, V, mask=None, dropout=0.0):
    d = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d)
    if mask is not None: scores = scores.masked_fill(mask == 0, -1e9)
    attn = scores.softmax(-1)
    return F.dropout(attn, dropout) @ V, attn

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads, dropout=0.1):
        super().__init__()
        assert d_model % n_heads == 0
        self.h, self.dk = n_heads, d_model // n_heads
        self.Wq, self.Wk, self.Wv, self.Wo = (nn.Linear(d_model, d_model) for _ in range(4))
        self.drop = nn.Dropout(dropout)
    def forward(self, x, mask=None):
        B, T, C = x.shape
        q = self.Wq(x).view(B, T, self.h, self.dk).transpose(1, 2)
        k = self.Wk(x).view(B, T, self.h, self.dk).transpose(1, 2)
        v = self.Wv(x).view(B, T, self.h, self.dk).transpose(1, 2)
        # PyTorch >= 2.0: fused, memory-efficient, uses FlashAttention when possible
        out = F.scaled_dot_product_attention(q, k, v, attn_mask=mask,
                                             is_causal=mask is None and self.training)
        return self.Wo(out.transpose(1, 2).contiguous().view(B, T, C))

# RoPE: rotate half the dimensions by pos * theta
def rope(x, theta=10000.0):
    B, T, D = x.shape
    pos = torch.arange(T).float().unsqueeze(1)
    freq = 1.0 / (theta ** (torch.arange(0, D, 2).float() / D))
    ang = pos * freq
    cos, sin = ang.cos(), ang.sin()
    x1, x2 = x[..., ::2], x[..., 1::2]
    out = torch.stack([x1*cos - x2*sin, x1*sin + x2*cos], -1)
    return out.flatten(-2)

# Causal mask so position i only sees j <= i
T = 8
causal = torch.tril(torch.ones(T, T)).view(1, 1, T, T)`),
      ul(['The n^2 cost is why context length is a hardware and algorithm problem, not just a data one.',
          'Pre-LN (normalize before the sub-layer) is the stable choice; post-LN needs careful warmup.',
          'KV caching makes autoregressive decoding O(n) per token instead of O(n^2) — essential in serving.',
          'Attention weights are a weak explanation of model behaviour; do not over-interpret them.'],
         ['هزینه‌ی n^2 دلیلِ این است که طولِ متن یک مسئله‌ی سخت‌افزاری و الگوریتمی است، نه فقط داده‌ای.',
          'pre-LN (نرمال‌سازی پیش از زیرلایه) انتخابِ پایدار است؛ post-LN به گرم‌کردنِ دقیق نیاز دارد.',
          'کشِ KV رمزگشاییِ خودبازگشتی را به‌ازای هر توکن O(n) می‌کند نه O(n^2) — در سروینگ ضروری است.',
          'وزن‌های توجه توضیحِ ضعیفی از رفتارِ مدل‌اند؛ در تفسیرِ آن‌ها زیاده‌روی نکنید.']),
      note('Memory math for self-attention: activations scale as batch x heads x n^2. At n = 32k tokens with 32 heads in fp16, the score matrix alone is tens of gigabytes — this is why flash attention, sliding windows and KV compression exist.',
           'حسابِ حافظه برای خودتوجهی: فعال‌سازی‌ها مانند batch × heads × n^2 رشد می‌کنند. با 32k = n توکن و ۳۲ سر در fp16، خودِ ماتریسِ امتیاز ده‌ها گیگابایت است — این دلیلِ وجودِ فلش‌توجه، پنجره‌های لغزان و فشرده‌سازیِ KV است.')
    ],
    ['transformers', 'attention', 'rope', 'flash-attention', 'kv-cache'],
    [R('Attention Is All You Need', 'https://arxiv.org/abs/1706.03762', 'paper'),
     R('The Illustrated Transformer (Alammar)', 'https://jalammar.github.io/illustrated-transformer/', 'doc'),
     R('FlashAttention', 'https://arxiv.org/abs/2205.14135', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-009', D, 'advanced', 18,
    ['Generative Models: VAE, GAN, Diffusion and Flow Matching', 'مدل‌های مولد: VAE، GAN، دیفیوژن و تطبیقِ جریان'],
    ['Generative modelling learns the distribution of the data, not just a decision boundary. The field has converged on a simple idea: define a path from noise to data, and learn to walk it backwards.',
     'مدل‌سازیِ مولد توزیعِ داده را می‌آموزد، نه فقط یک مرزِ تصمیم. این حوزه بر یک ایده‌ی ساده همگرا شده است: مسیری از نویز به داده تعریف کن و یاد بگیر چگونه آن را رو به عقب بروی.'],
    [
      def('A VAE maximises a lower bound (ELBO) on the log-likelihood by encoding inputs to a distribution and decoding samples back. A GAN trains a generator and a discriminator against each other. Diffusion models gradually add Gaussian noise then learn to denoise, which turns out to be a very stable objective. Flow matching learns a velocity field that transports noise to data along a continuous path.',
          'یک VAE با رمزگذاریِ ورودی‌ها به یک توزیع و رمزگشاییِ نمونه‌ها به عقب، یک کرانِ پایین (ELBO) بر لگاریتمِ درست‌نمایی را بیشینه می‌کند. یک GAN مولد و متمایزکننده را در برابر هم آموزش می‌دهد. مدل‌های دیفیوژن به‌تدریج نویزِ گاوسی می‌افزایند و سپس نویززدایی را می‌آموزند، که هدفی بسیار پایدار از آب درآمده است. تطبیقِ جریان یک میدانِ سرعت می‌آموزد که نویز را در امتدادِ یک مسیرِ پیوسته به داده منتقل می‌کند.'),
      math('VAE ELBO:   log p(x) >= E_q[log p(x|z)] - D_KL( q(z|x) || p(z) )\n  reparameterisation: z = mu + sigma * eps,  eps ~ N(0,1)   (makes it differentiable)\n\nGAN:  min_G max_D  E_x[log D(x)] + E_z[log(1 - D(G(z)))]\n  problems: mode collapse, unstable training;  fixes: WGAN-GP, spectral norm, StyleGAN\n\ndiffusion (DDPM):\n  forward:  x_t = sqrt(a_bar_t) x_0 + sqrt(1 - a_bar_t) eps\n  training: minimise || eps - eps_theta(x_t, t) ||^2        (simple MSE!)\n  sampling: x_{t-1} = (x_t - (1-a_t)/sqrt(1-a_bar_t) * eps_theta) / sqrt(a_t) + sigma_t z\n  classifier-free guidance: eps = eps_uncond + w (eps_cond - eps_uncond),  w ~ 7.5\n\nflow matching / rectified flow:\n  x_t = (1-t) x_0 + t eps;   learn v_theta(x_t, t) ~ dx_t/dt = eps - x_0\n  integrate the ODE with few steps -> fast, deterministic, the basis of SD3 / many video models\n  consistency models distill the whole trajectory into 1-4 steps'),
      code(`import torch, torch.nn as nn, torch.nn.functional as F

# Training a DDPM in its simplest form: predict the noise
def diffusion_loss(model, x0, t, alphas_bar, eps=None):
    if eps is None: eps = torch.randn_like(x0)
    a_bar = alphas_bar[t].view(-1, 1, 1, 1)
    xt = torch.sqrt(a_bar) * x0 + torch.sqrt(1 - a_bar) * eps
    return F.mse_loss(model(xt, t), eps)

# The sampler (DDPM ancestral sampling)
@torch.no_grad()
def sample(model, shape, alphas, alphas_bar, betas, T=1000, device='cpu'):
    x = torch.randn(shape, device=device)
    for t in reversed(range(T)):
        z = torch.randn(shape, device=device) if t > 0 else 0
        a, ab = alphas[t], alphas_bar[t]
        eps = model(x, torch.full((shape[0],), t, device=device))
        x = (x - (1-a)/torch.sqrt(1-ab) * eps) / torch.sqrt(a) + torch.sqrt(betas[t]) * z
    return x

# Classifier-free guidance: one forward pass for cond, one for uncond
@torch.no_grad()
def cfg_sample(model, x_t, t, cond, null_cond, w=7.5):
    e_cond = model(x_t, t, cond)
    e_uncond = model(x_t, t, null_cond)
    return e_uncond + w * (e_cond - e_uncond)

# VAE reparameterisation trick in three lines
def vae_sample(mu, logvar):
    std = torch.exp(0.5 * logvar)
    return mu + std * torch.randn_like(std)`),
      ul(['Diffusion trains with plain MSE on noise prediction — remarkably stable compared with GANs.',
          'Guidance scale trades diversity for fidelity; too high gives saturated, repetitive samples.',
          'Latent diffusion (run the process in an autoencoder latent space) is what made high-res generation affordable.',
          'Evaluate generative models with FID/CLIP score plus human evaluation — no single metric is enough.'],
         ['دیفیوژن با MSE ساده روی پیش‌بینیِ نویز آموزش می‌بیند — در مقایسه با GANها به‌شکل چشمگیری پایدار است.',
          'مقیاسِ هدایت تنوع را با وفاداری معامله می‌کند؛ مقدارِ بسیار بالا نمونه‌های اشباع و تکراری می‌دهد.',
          'دیفیوژنِ نهان (اجرای فرایند در فضای نهانِ یک خودرمزگذار) چیزی است که تولیدِ با وضوحِ بالا را مقرون‌به‌صرفه کرد.',
          'مدل‌های مولد را با FID/CLIP score به‌علاوه‌ی ارزیابیِ انسانی بسنجید — هیچ معیارِ واحدی کافی نیست.'])
    ],
    ['diffusion', 'vae', 'gan', 'flow-matching', 'guidance'],
    [R('Denoising Diffusion Probabilistic Models', 'https://arxiv.org/abs/2006.11239', 'paper'),
     R('Flow Matching for Generative Modeling', 'https://arxiv.org/abs/2210.02747', 'paper'),
     R('The Illustrated Stable Diffusion (Alammar)', 'https://jalammar.github.io/illustrated-stable-diffusion/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-010', D, 'advanced', 16,
    ['Self-Supervised, Transfer and Parameter-Efficient Fine-Tuning', 'خودنظارتی، انتقالِ یادگیری و تنظیمِ ظریفِ کم‌پارامتر'],
    ['Labelled data is the bottleneck, so the field learned to create labels from the data itself. Pretrain on a self-supervised task, then adapt — and for big models, adapt with a tiny fraction of the parameters.',
     'داده‌ی برچسب‌خورده گلوگاه است، پس این حوزه آموخت برچسب را از خودِ داده بسازد. روی یک وظیفه‌ی خودنظارتی پیش‌آموزش بدهید، سپس تطبیق دهید — و برای مدل‌های بزرگ، با کسرِ کوچکی از پارامترها تطبیق دهید.'],
    [
      def('Self-supervised learning (SSL) creates a pretext task from unlabelled data: predict a masked word, predict the next token, recognise which augmentation was applied, or match two views of the same image. The learned representation transfers to downstream tasks with far fewer labels.',
          'یادگیریِ خودنظارتی (SSL) یک وظیفه‌ی بهانه از داده‌ی بدون برچسب می‌سازد: پیش‌بینیِ یک واژه‌ی پوشانده‌شده، پیش‌بینیِ توکنِ بعدی، تشخیصِ این‌که کدام افزایشِ داده اعمال شده، یا تطبیقِ دو نما از یک تصویر. بازنماییِ آموخته‌شده با برچسب‌های بسیار کمتر به وظایفِ پایین‌دستی منتقل می‌شود.'),
      math('contrastive (SimCLR / CLIP):\n  two augmented views of the same item are positives, everything else negatives\n  InfoNCE pushes sim(v_i, v_j) up for positives and down for the rest\n  needs big batches or a memory bank (MoCo) to have enough negatives\n\nnon-contrastive (BYOL, SimSiam, VICReg):\n  no negatives needed, but must avoid collapse -> stop-gradient, predictor, variance term\n\nmasked modelling (BERT, MAE):\n  corrupt ~15% of tokens (text) or ~75% of patches (images), reconstruct\n\nparameter-efficient fine-tuning (PEFT):\n  LoRA:  W <- W + B A,  B (d x r), A (r x k), r = 4-64;  train only A, B\n         scales as alpha/r;  ~0.1% of parameters, often matches full fine-tuning\n  DoRA / AdaLoRA / LoRA+: refinements on rank and scaling\n  prefix / prompt tuning: learn soft tokens prepended to the input\n  adapters: small bottleneck modules inserted in each block\n  QLoRA: 4-bit base weights + LoRA -> fine-tune a 70B model on one GPU'),
      code(`import torch, torch.nn as nn
from peft import LoraConfig, get_peft_model

# LoRA injected into attention projections
base = nn.TransformerEncoderLayer(d_model=768, nhead=12, batch_first=True)
cfg = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, bias='none',
                 target_modules=['linear1', 'linear2'])
peft_model = get_peft_model(base, cfg)
peft_model.print_trainable_parameters()
# trainable params: ~0.5% || all params: ~7M

# LoRA by hand: the whole idea is these four lines
class LoRALinear(nn.Module):
    def __init__(self, lin, r=8, alpha=16):
        super().__init__()
        self.lin = lin
        for p in self.lin.parameters(): p.requires_grad_(False)
        self.A = nn.Parameter(torch.randn(r, lin.in_features) * 0.01)
        self.B = nn.Parameter(torch.zeros(lin.out_features, r))
        self.scale = alpha / r
    def forward(self, x):
        return self.lin(x) + self.scale * (x @ self.A.T @ self.B.T)

# Linear probing vs full fine-tuning: a diagnostic, not just a choice
for name, prm in base.named_parameters(): prm.requires_grad_(False)
head = nn.Linear(768, 10)                      # probe: train only the head

# Catastrophic forgetting guard: keep a little of the pretraining data in the mix
# or use a small LR (1e-5) + early stopping + weight decay to the pretrained weights`),
      ul(['SSL pretraining then fine-tuning is the default recipe in vision, speech and NLP.',
          'LoRA merges back into the weights at inference — no extra latency if you merge.',
          'Rank r and which modules you target matter more than most other LoRA hyperparameters.',
          'Full fine-tuning still wins when you have lots of high-quality in-domain data.'],
         ['پیش‌آموزشِ SSL و سپس تنظیمِ ظریف، دستورِ پیش‌فرض در بینایی، گفتار و پردازشِ زبان است.',
          'LoRA در زمانِ استنتاج در وزن‌ها ادغام می‌شود — اگر ادغام کنید تأخیرِ اضافه ندارد.',
          'رتبه‌ی r و این‌که کدام ماژول‌ها را هدف می‌گیرید از بیشترِ ابرپارامترهای دیگرِ LoRA مهم‌تر است.',
          'وقتی داده‌ی هم‌دامنه‌ی باکیفیتِ زیاد دارید، تنظیمِ ظریفِ کامل هنوز برنده است.'])
    ],
    ['self-supervised', 'lora', 'peft', 'contrastive', 'transfer'],
    [R('LoRA: Low-Rank Adaptation of Large Language Models', 'https://arxiv.org/abs/2106.09685', 'paper'),
     R('A Simple Framework for Contrastive Learning (SimCLR)', 'https://arxiv.org/abs/2002.05709', 'paper'),
     R('QLoRA', 'https://arxiv.org/abs/2305.14314', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-011', D, 'advanced', 17,
    ['Reinforcement Learning and RLHF', 'یادگیریِ تقویتی و RLHF'],
    ['When the objective is not differentiable — a reward from a human, a game score, a business KPI — you optimise it with trial and error. This is how language models are aligned after pretraining.',
     'وقتی هدف مشتق‌پذیر نیست — پاداشی از انسان، امتیازِ یک بازی، یک شاخصِ کسب‌وکار — آن را با آزمون و خطا بهینه می‌کنید. این همان روشی است که مدل‌های زبانی پس از پیش‌آموزش با آن هم‌راستا می‌شوند.'],
    [
      def('An agent interacts with an environment: it observes a state, takes an action, receives a reward and moves to a new state. The goal is to maximise the expected discounted return G_t = SUM_k gamma^k r_{t+k}. Value functions estimate future return; policy gradients directly optimise the policy.',
          'یک ایجنت با محیط تعامل می‌کند: حالتی را مشاهده می‌کند، کنشی انجام می‌دهد، پاداش می‌گیرد و به حالتِ جدید می‌رود. هدف بیشینه‌سازیِ بازگشتِ تنزیل‌شده‌ی مورد انتظار است: G_t = Σ_k gamma^k r_{t+k}. توابعِ ارزش بازگشتِ آینده را برآورد می‌کنند؛ گرادیان‌های سیاست مستقیماً سیاست را بهینه می‌کنند.'),
      math('MDP: (S, A, P, R, gamma)\n  V(s)      = E[ G_t | s_t = s ]                 expected return from s\n  Q(s,a)    = E[ G_t | s_t = s, a_t = a ]\n  advantage A(s,a) = Q(s,a) - V(s)               was this action better than average?\n\nQ-learning:   Q(s,a) <- Q(s,a) + a [ r + gamma max_a\' Q(s\',a\') - Q(s,a) ]\n  DQN: neural Q + replay buffer + target network\n\npolicy gradient:  grad J = E[ grad log pi(a|s) * G_t ]\n  REINFORCE with baseline:  A = G_t - V(s)          reduces variance\n  PPO:  clip the ratio  r = pi(a|s)/pi_old(a|s)  to [1-e, 1+e]\n     L = E[ min( r A, clip(r, 1-e, 1+e) A ) ]  + value loss - entropy bonus\n\nRLHF pipeline (the recipe behind ChatGPT):\n  1. SFT       : supervised fine-tuning on demonstration data\n  2. Reward model: train r_phi(x,y) from human preference comparisons (Bradley-Terry)\n     P(a > b) = sigmoid( r(x,a) - r(x,b) )\n  3. RL        : optimise the policy with PPO against r_phi, with a KL penalty to the SFT model\n     objective: E[ r(x,y) ] - beta * D_KL( pi || pi_SFT )      <- beta prevents reward hacking\n  cheaper alternative: DPO — the RL objective has a closed-form optimum;\n     L_DPO = -log sigmoid( beta [ log(pi/pi_ref)(y_w) - log(pi/pi_ref)(y_l) ] )'),
      code(`import torch, torch.nn.functional as F

# The PPO clipped objective, in ~12 lines
def ppo_loss(logp, logp_old, adv, returns, values, eps=0.2, vf_coef=0.5, ent_coef=0.01):
    ratio = torch.exp(logp - logp_old)
    unclipped = ratio * adv
    clipped   = torch.clamp(ratio, 1-eps, 1+eps) * adv
    policy_loss = -torch.min(unclipped, clipped).mean()
    value_loss  = vf_coef * F.mse_loss(values, returns)
    entropy     = -ent_coef * (-logp * torch.exp(logp)).mean()    # encourage exploration
    return policy_loss + value_loss - entropy

# DPO: preference tuning without a reward model or RL loop
def dpo_loss(pi_logp_w, pi_logp_l, ref_logp_w, ref_logp_l, beta=0.1):
    pi_ratio  = pi_logp_w  - pi_logp_l
    ref_ratio = ref_logp_w - ref_logp_l
    return -F.logsigmoid(beta * (pi_ratio - ref_ratio)).mean()

# Reward model from pairwise preferences (Bradley-Terry)
def reward_model_loss(r_chosen, r_rejected):
    return -F.logsigmoid(r_chosen - r_rejected).mean()

# Generalised advantage estimation: the variance/bias dial, lambda
def gae(rewards, values, gamma=0.99, lam=0.95):
    deltas = rewards[:-1] + gamma*values[1:] - values[:-1]
    adv = torch.zeros_like(rewards[:-1]); g = 0.0
    for t in reversed(range(len(deltas))):
        g = deltas[t] + gamma*lam*g
        adv[t] = g
    return adv`),
      ul(['RL is sample-hungry and unstable: start with imitation learning or DPO when possible.',
          'The KL term in RLHF is not decoration — without it the model finds reward-hacking shortcuts.',
          'Reward models are learned proxies; they can be gamed, so cap and monitor the reward.',
          'Advantage normalisation, entropy bonus and careful advantage estimation do most of the stabilising.'],
         ['یادگیریِ تقویتی نمونه‌دوست نیست و ناپایدار است: در صورت امکان با یادگیریِ تقلیدی یا DPO شروع کنید.',
          'جمله‌ی KL در RLHF تزیینی نیست — بدون آن مدل میان‌برهای تقلبِ پاداش پیدا می‌کند.',
          'مدل‌های پاداش نماینده‌های آموخته‌شده‌اند و می‌توان فریب‌شان داد، پس پاداش را سقف بگذارید و پایش کنید.',
          'نرمال‌سازیِ برتری، پاداشِ آنتروپی و برآوردِ دقیقِ برتری بیشترِ پایدارسازی را انجام می‌دهند.'])
    ],
    ['reinforcement-learning', 'ppo', 'rlhf', 'dpo', 'gae'],
    [R('Spinning Up in Deep RL (OpenAI)', 'https://spinningup.openai.com/', 'course'),
     R('Deep RL from Human Preferences', 'https://arxiv.org/abs/1706.03741', 'paper'),
     R('Direct Preference Optimization', 'https://arxiv.org/abs/2305.18290', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('dl-012', D, 'advanced', 15,
    ['Graph Neural Networks and Geometric Deep Learning', 'شبکه‌های عصبیِ گرافی و یادگیریِ عمیقِ هندسی'],
    ['Not all data lives on a grid. Molecules, social networks, code, knowledge graphs and meshes are graphs — and the right architecture respects permutation symmetry instead of a fixed ordering.',
     'همه‌ی داده‌ها روی یک شبکه زندگی نمی‌کنند. مولکول‌ها، شبکه‌های اجتماعی، کد، گراف‌های دانش و مش‌بندی‌ها گراف‌اند — و معماریِ درست به تقارنِ جایگشت احترام می‌گذارد نه به یک ترتیبِ ثابت.'],
    [
      def('A graph neural network computes node representations by repeatedly aggregating information from neighbours — message passing. Because aggregation is permutation-invariant (sum, mean, max), the network respects the symmetry of graphs: relabelling nodes relabels the outputs identically.',
          'یک شبکه‌ی عصبیِ گرافی بازنماییِ گره‌ها را با تجمیعِ مکررِ اطلاعات از همسایه‌ها حساب می‌کند — گذرِ پیام. چون تجمیع ناوردا نسبت به جایگشت است (جمع، میانگین، بیشینه)، شبکه به تقارنِ گراف‌ها احترام می‌گذارد: بازبرچسب‌زدنِ گره‌ها خروجی‌ها را دقیقاً به همان شکل بازبرچسب می‌زند.'),
      math('message passing layer:\n  m_v = AGGREGATE_{u in N(v)}  M(h_v, h_u, e_{vu})      (sum / mean / max / attention)\n  h_v\' = UPDATE(h_v, m_v)                                (MLP / GRU / residual)\n\nGCN:      h\' = D^{-1/2} A D^{-1/2} h W      (renormalised adjacency + self-loops)\nGraphSAGE: sample a fixed number of neighbours -> scales to huge graphs\nGAT:      attention-weighted aggregation,  a_{vu} = softmax(LeakyReLU(a^T [Wh_v || Wh_u]))\nMPNN / MPNN+virtual node: chemistry standard\n\nover-smoothing: after ~2-4 layers, node features converge to the same vector\n  -> residual connections, PairNorm, fewer layers, or graph transformers\nover-squashing: exponentially growing information must fit in a fixed-size vector\n  -> graph rewiring, bottleneck-aware architectures\n\ntasks: node classification | link prediction | graph classification | generation'),
      code(`import torch, torch.nn as nn
import torch_geometric.nn as pyg_nn
from torch_geometric.nn import GCNConv, GATConv, SAGEConv, global_mean_pool
from torch_geometric.data import Data

# Message passing by hand: scatter-add is all it really is
def mp_layer(h, edge_index, W):
    src, dst = edge_index
    msg = h[src] @ W                       # messages from neighbours
    agg = torch.zeros_like(h).index_add_(0, dst, msg)   # sum at each destination
    deg = torch.zeros(h.size(0), device=h.device).index_add_(0, dst, torch.ones_like(dst, dtype=h.dtype))
    return agg / deg.clamp(min=1).unsqueeze(-1)         # mean aggregation

# A small GNN with PyTorch Geometric
class GNN(nn.Module):
    def __init__(self, in_dim, hid, out):
        super().__init__()
        self.c1, self.c2 = GCNConv(in_dim, hid), GATConv(hid, hid, heads=4)
        self.head = nn.Linear(hid*4, out)
    def forward(self, data):
        h = torch.relu(self.c1(data.x, data.edge_index))
        h = torch.relu(self.c2(h, data.edge_index))
        return self.head(global_mean_pool(h, data.batch))    # graph-level readout

# Scaling: neighbour sampling for graphs with millions of nodes
from torch_geometric.loader import NeighborLoader
# loader = NeighborLoader(data, num_neighbors=[15, 10], batch_size=1024, input_nodes=train_idx)`),
      ul(['Node features, edge features and edge weights all matter — do not throw away edge attributes.',
          'Deep GNNs over-smooth; two or three message-passing layers is often the sweet spot.',
          'For large graphs, sample neighbourhoods or use subgraph/graph-SAINT training.',
          'Expressive power is bounded by the WL graph isomorphism test; positional encodings help beyond it.'],
         ['ویژگی‌های گره، ویژگی‌های یال و وزن‌های یال همه مهم‌اند — ویژگی‌های یال را دور نریزید.',
          'شبکه‌های گرافیِ عمیق بیش‌ازحد هموار می‌شوند؛ دو یا سه لایه‌ی گذرِ پیام اغلب نقطه‌ی بهینه است.',
          'برای گراف‌های بزرگ، همسایگی‌ها را نمونه‌گیری کنید یا از آموزشِ زیرگراف/graph-SAINT استفاده کنید.',
          'توانِ بیان با آزمونِ یک‌ریختیِ WL کران‌دار است؛ کدگذاری‌های موقعیتی فراتر از آن کمک می‌کنند.'])
    ],
    ['gnn', 'graph', 'message-passing', 'geometric-deep-learning'],
    [R('A Comprehensive Survey on Graph Neural Networks', 'https://arxiv.org/abs/1901.00596', 'paper'),
     R('Geometric Deep Learning (Bronstein et al.)', 'https://arxiv.org/abs/2104.13478', 'paper'),
     R('PyTorch Geometric', 'https://pytorch-geometric.readthedocs.io/', 'doc')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
