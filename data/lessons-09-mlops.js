/* =====================================================================
   lessons-09-mlops.js  —  8 lessons (MLOps & production systems)
   ===================================================================== */
(function (root) {
  'use strict';
  var DSH = root.DSH, L = DSH.L, R = DSH.R, B = DSH.B;
  var p = B.p, ul = B.ul, math = B.math, code = B.code, note = B.note, def = B.def;
  var D = 'ops';

  /* ------------------------------------------------------------------ */
  L('ops-001', D, 'beginner', 12,
    ['Experiment Tracking and Reproducibility', 'ردیابیِ آزمایش‌ها و تکرارپذیری'],
    ['If you cannot reproduce last Tuesday result, you do not have a result — you have an anecdote. Tracking turns experiments into an asset you can search, compare and hand over.',
     'اگر نمی‌توانید نتیجه‌ی سه‌شنبه‌ی گذشته را بازتولید کنید، نتیجه ندارید — حکایت دارید. ردیابی، آزمایش‌ها را به دارایی‌ای تبدیل می‌کند که می‌توان جست‌وجو، مقایسه و تحویل داد.'],
    [
      def('An experiment run records: code version (git commit), data version (hash/snapshot id), hyperparameters, environment, metrics, artefacts (model, plots) and the full log. Tools: MLflow, Weights & Biases, Comet, ClearML, Neptune, or a disciplined CSV plus object storage.',
          'یک اجرای آزمایش این‌ها را ثبت می‌کند: نسخه‌ی کد (کامیتِ گیت)، نسخه‌ی داده (هش/شناسه‌ی اسنپ‌شات)، ابرپارامترها، محیط، معیارها، خروجی‌ها (مدل، نمودار) و کلِ لاگ. ابزارها: MLflow، Weights & Biases، Comet، ClearML، Neptune، یا یک CSV منضبط به‌علاوه‌ی ذخیره‌سازیِ شیء.'),
      math('the minimal reproducible unit:\n  git_commit + data_hash + config(yaml) + seed + environment_lock -> metrics\n\nhyperparameter sweeps:\n  record every trial, not just the winner; the losers are the evidence\n  parallel coordinate plots reveal interactions between hyperparameters\n\nartefacts to store per run:\n  model weights (safetensors/pickle), preprocessing pipeline, feature list,\n  metrics json, confusion matrix, a few prediction examples, the training log\n\nnaming matters more than tooling:  {project}/{team}/{model}-{data_version}-{run_id}'),
      code(`import mlflow, hashlib, json, subprocess, numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score

def git_commit():
    return subprocess.check_output(['git','rev-parse','--short','HEAD']).decode().strip()

X = np.random.default_rng(0).normal(size=(5000, 20))
y = (X[:,0] + X[:,1]**2 > 0).astype(int)

mlflow.set_experiment('churn-baseline')
with mlflow.start_run(run_name='rf-tuning') as run:
    params = dict(n_estimators=300, max_depth=8, min_samples_leaf=3, seed=0)
    mlflow.log_params(params)
    mlflow.set_tags({'git_commit': git_commit(), 'data_version': '2025-08-01',
                     'data_hash': hashlib.md5(X.tobytes()).hexdigest()[:8]})

    m = RandomForestClassifier(**params).fit(X[:4000], y[:4000])
    auc = roc_auc_score(y[4000:], m.predict_proba(X[4000:])[:,1])
    mlflow.log_metric('val_auc', auc)
    mlflow.sklearn.log_model(m, 'model')
    mlflow.log_dict(params, 'config.json')
    print('run', run.info.run_id, 'val_auc', round(auc, 4))

# A zero-dependency option: append to a JSONL ledger
with open('runs.jsonl','a') as f:
    f.write(json.dumps({'git': git_commit(), 'params': params, 'val_auc': auc}) + '\\n')`),
      ul(['Log the code commit and the data snapshot id in every single run — no exceptions.',
          'Set seeds, but remember: GPU nondeterminism means "reproducible" often means "within noise".',
          'Track a metric on a fixed validation set so runs are comparable across time.',
          'Search your runs before starting a new one; someone may have already tried it.'],
         ['در هر اجرا کامیتِ کد و شناسه‌ی اسنپ‌شاتِ داده را ثبت کنید — بدون استثنا.',
          'دانه‌ها را تنظیم کنید، اما به خاطر داشته باشید: عدم‌قطعیتِ GPU یعنی «تکرارپذیر» اغلب یعنی «در حدِ نویز».',
          'یک معیار روی مجموعه‌ی اعتبارسنجیِ ثابت ردیابی کنید تا اجراها در طولِ زمان قابل‌مقایسه باشند.',
          'پیش از شروعِ یک آزمایشِ جدید، اجراهای قبلی را جست‌وجو کنید؛ شاید کسی از پیش امتحانش کرده باشد.'])
    ],
    ['experiment-tracking', 'mlflow', 'reproducibility', 'wandb'],
    [R('MLflow documentation', 'https://mlflow.org/docs/latest/', 'doc'),
     R('Weights & Biases', 'https://docs.wandb.ai/', 'doc'),
     R('DVC — data version control', 'https://dvc.org/doc', 'tool')]
  );

  /* ------------------------------------------------------------------ */
  L('ops-002', D, 'intermediate', 14,
    ['Packaging Models: Environments, Formats and Artefacts', 'بسته‌بندیِ مدل‌ها: محیط‌ها، فرمت‌ها و خروجی‌ها'],
    ['A model file is not a deployable system. You ship a package: the weights, the code that runs them, the preprocessing state, the exact dependencies and the interface contract.',
     'یک فایلِ مدل یک سیستمِ قابل‌استقرار نیست. شما یک بسته عرضه می‌کنید: وزن‌ها، کدی که آن‌ها را اجرا می‌کند، حالتِ پیش‌پردازش، وابستگی‌های دقیق و قراردادِ رابط.'],
    [
      def('Serialisation formats: pickle/joblib (flexible, unsafe — never load untrusted files), ONNX (framework-agnostic, optimisable), TorchScript/TorchExport, TensorFlow SavedModel, and safetensors (weights only, safe and fast). Choose based on where the model will run, not how it was trained.',
          'فرمت‌های سریال‌سازی: pickle/joblib (منعطف، ناایمن — هرگز فایلِ غیرقابل‌اعتماد را load نکنید)، ONNX (مستقل از چارچوب، قابل‌بهینه‌سازی)، TorchScript/TorchExport، TensorFlow SavedModel و safetensors (تنها وزن‌ها، ایمن و سریع). بر اساسِ این‌که مدل کجا اجرا می‌شود انتخاب کنید، نه این‌که چگونه آموزش دیده است.'),
      math('artefact checklist:\n  model weights + the exact library version that wrote them\n  preprocessing/feature pipeline FITTED STATE (scalers, encoders, vocab, category maps)\n  input schema (types, ranges, required fields, allowed nulls)\n  output schema (classes, units, probability calibration state)\n  a golden input/output pair used as a smoke test in CI and after deploy\n  model card: intended use, training data, metrics, limitations, owner\n\ncontainer image hygiene:\n  pinned base image + lock file + non-root user + healthcheck\n  slim runtime image separate from the fat training image\n  model fetched at start-up (or baked in for immutable, fast rollouts)\n  layer caching: copy dependency files first, code second'),
      code(`# Dockerfile — small, pinned, non-root, with a healthcheck
"""
FROM python:3.11-slim AS build
COPY requirements.lock /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.lock

FROM python:3.11-slim
RUN useradd -m -u 1001 app
WORKDIR /app
COPY --from=build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY src/ /app/src
COPY model/ /app/model
USER 1001
EXPOSE 8080
HEALTHCHECK --interval=30s CMD curl -f http://localhost:8080/health || exit 1
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8080"]
"""

import json, numpy as np, joblib
from pydantic import BaseModel, Field, validator

class PredictRequest(BaseModel):
    age: float = Field(ge=0, le=120)
    income: float = Field(ge=0)
    country: str

    @validator('country')
    def known(cls, v, values):
        # unknown categories must be handled explicitly, not silently
        return v if v in {'DE','FR','US'} else 'OTHER'

class PredictResponse(BaseModel):
    score: float
    model_version: str
    latency_ms: float

# The artefact bundle: never ship the model alone
bundle = {'model': joblib.load('model/rf.joblib'),
          'scaler': joblib.load('model/scaler.joblib'),
          'categories': json.load(open('model/categories.json')),
          'schema_version': '3.2.0',
          'train_metrics': {'val_auc': 0.812}}

# Golden-pair smoke test, run in CI and immediately after every deploy
def smoke(bundle):
    req = PredictRequest(age=41.0, income=52000.0, country='DE')
    out = predict(bundle, req)
    assert 0.0 <= out.score <= 1.0, out
    print('smoke ok', out.score)`),
      ul(['Never unpickle a model you did not produce; prefer safetensors or ONNX for shared artefacts.',
          'Store the fitted preprocessing state next to the weights — they are one artefact.',
          'Pin the exact inference library version; silent numerical changes between versions do happen.',
          'Keep a golden request/response pair and run it on every deployment.'],
         ['هرگز مدلی را که خودتان تولید نکرده‌اید از pickle درنیاورید؛ برای خروجی‌های مشترک safetensors یا ONNX را ترجیح دهید.',
          'حالتِ برازش‌یافته‌ی پیش‌پردازش را کنارِ وزن‌ها ذخیره کنید — آن‌ها یک خروجیِ واحدند.',
          'نسخه‌ی دقیقِ کتابخانه‌ی استنتاج را pin کنید؛ تغییراتِ عددیِ خاموش بینِ نسخه‌ها واقعاً رخ می‌دهد.',
          'یک جفتِ درخواست/پاسخِ طلایی نگه دارید و آن را در هر استقرار اجرا کنید.'])
    ],
    ['packaging', 'docker', 'onnx', 'safetensors', 'schema'],
    [R('ONNX — interoperability', 'https://onnx.ai/', 'doc'),
     R('safetensors', 'https://huggingface.co/docs/safetensors/index', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ops-003', D, 'intermediate', 16,
    ['Deployment Patterns: Batch, Real-Time, Streaming and Rollouts', 'الگوهای استقرار: دسته‌ای، بی‌درنگ، جریانی و عرضه‌ی تدریجی'],
    ['Pick the simplest serving pattern that meets the latency requirement. Then pick a rollout strategy that limits the blast radius when the model is wrong — because eventually it will be.',
     'ساده‌ترین الگوی سروینگی را برگزینید که نیازِ تأخیر را برآورده کند. سپس راهبردی برای عرضه انتخاب کنید که شعاعِ انفجار را وقتی مدل اشتباه می‌کند محدود کند — چون بالاخره اشتباه خواهد کرد.'],
    [
      def('Batch inference scores many rows on a schedule and writes results to a table — cheap, simple, and right for most recommendation and risk workloads. Real-time inference serves a single request over HTTP/gRPC with strict latency. Streaming inference consumes events and scores continuously. Almost every system is a mix.',
          'استنتاجِ دسته‌ای سطرهای زیادی را طبقِ برنامه امتیاز می‌دهد و نتایج را در جدول می‌نویسد — ارزان، ساده و برای بیشترِ بارهای کاریِ توصیه و ریسک درست. استنتاجِ بی‌درنگ یک درخواست را روی HTTP/gRPC با تأخیرِ سخت‌گیرانه سرو می‌کند. استنتاجِ جریانی رویدادها را مصرف و پیوسته امتیاز می‌دهد. تقریباً هر سیستمی آمیخته‌ای از این‌هاست.'),
      math('latency budgets (typical):\n  batch:       minutes to hours, cost per row is what matters\n  nearline:    < 1 minute (feature-triggered: user logs in -> refresh recommendations)\n  real-time:   10-200 ms p99, autoscaled, warm models, no cold starts\n  streaming:   event-time semantics, exactly-once or at-least-once delivery\n\nrollout strategies:\n  shadow      : new model logs predictions, serves nothing (zero risk, real traffic)\n  canary      : 1-5% of traffic, watch guardrails, then ramp\n  A/B         : split traffic, measure the business metric, keep the winner\n  multi-armed bandit : shift traffic automatically toward the better arm\n  blue/green  : two full environments, instant switch and instant rollback\n\nalways have:  a one-command rollback, a kill switch, and a rule-based fallback'),
      code(`# FastAPI service: pydantic contract, warm model, structured logging
from fastapi import FastAPI, HTTPException
import time, logging, json

app = FastAPI(title='risk-scorer')
model = load_bundle('model/bundle-v3')          # loaded once at start-up

@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest):
    t0 = time.perf_counter()
    try:
        x = transform(model, req)                # uses the FITTED preprocessing state
        score = float(model['model'].predict_proba(x)[0, 1])
    except Exception as e:
        logging.exception('predict failed')
        raise HTTPException(503, 'model unavailable; falling back upstream')
    ms = (time.perf_counter() - t0) * 1000
    logging.info(json.dumps({'event':'prediction','latency_ms':round(ms,2),
                             'model_version': model['schema_version'],
                             'score': round(score, 4),
                             'features': req.model_dump()}))
    return PredictResponse(score=score, model_version=model['schema_version'], latency_ms=ms)

@app.get('/health')
def health(): return {'status':'ok','model': model['schema_version']}

# Batch scoring job: the same bundle, no server
def score_partition(day: str):
    df = warehouse.query('select * from features where dt = %(day)s', day=day)
    df['score'] = model['model'].predict_proba(transform_df(model, df))[:, 1]
    warehouse.write(df[['user_id','score']], table='scores', partition=day, mode='overwrite')`),
      ul(['Start with batch: it is an order of magnitude simpler and often sufficient.',
          'Precompute what you can; a real-time call should do the minimum necessary work.',
          'Shadow deployments catch feature and scale bugs with zero user impact.',
          'Log inputs alongside predictions — without them you cannot debug or retrain later.'],
         ['با حالتِ دسته‌ای شروع کنید: یک مرتبه‌ی بزرگی ساده‌تر است و اغلب کافی است.',
          'هرچه را می‌توانید پیش‌محاسبه کنید؛ یک فراخوانِ بی‌درنگ باید کمترین کارِ لازم را انجام دهد.',
          'استقرارهای سایه باگ‌های ویژگی و مقیاس را بدون اثر بر کاربر می‌گیرند.',
          'ورودی‌ها را کنارِ پیش‌بینی‌ها ثبت کنید — بدون آن‌ها نمی‌توانید دیباگ یا بازآموزش دهید.'])
    ],
    ['deployment', 'batch', 'real-time', 'canary', 'shadow'],
    [R('Designing Machine Learning Systems (Huyen)', 'https://huyenchip.com/ml-interviews-book/', 'book'),
     R('Machine Learning: The High-Interest Credit Card of Technical Debt', 'https://proceedings.neurips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('ops-004', D, 'intermediate', 16,
    ['Monitoring: Data Drift, Concept Drift and Performance Decay', 'پایش: انحرافِ داده، انحرافِ مفهوم و افتِ عملکرد'],
    ['Models do not break loudly, they decay quietly. You need monitors on the inputs, the outputs, the ground truth when it arrives, and the operational health of the service.',
     'مدل‌ها با صدای بلند نمی‌شکنند، بی‌صدا افت می‌کنند. به پایش روی ورودی‌ها، خروجی‌ها، پاسخِ قطعی وقتی می‌رسد، و سلامتِ عملیاتیِ سرویس نیاز دارید.'],
    [
      def('Covariate shift (data drift) is a change in P(X); concept drift is a change in P(Y|X); label shift is a change in P(Y). Only concept drift necessarily means the decision boundary is wrong — but all three are worth detecting because they change what you should do next.',
          'جابه‌جاییِ هم‌متغیر (انحرافِ داده) تغییر در P(X) است؛ انحرافِ مفهوم تغییر در P(Y|X) است؛ جابه‌جاییِ برچسب تغییر در P(Y) است. تنها انحرافِ مفهوم است که لزوماً یعنی مرزِ تصمیم غلط است — اما تشخیصِ هر سه ارزشمند است چون تعیین می‌کنند گامِ بعدی چیست.'),
      math('detectors:\n  PSI (population stability index):  SUM (p_i - q_i) ln(p_i/q_i)\n     < 0.1 stable | 0.1-0.25 watch | > 0.25 major shift\n  KS two-sample test on each numeric feature (with multiple-testing correction)\n  chi-square on categoricals;  Wasserstein / Jensen-Shannon as alternatives\n  embedding drift: distance between reference and current embedding centroids\n  prediction drift: monitor the distribution of the scores, not just the inputs\n\nwithout labels you can still monitor:\n  prediction distribution, confidence, feature null-rate, feature ranges,\n  request volume, latency, error rate, and out-of-schema inputs\n\nwith delayed labels:  track realised performance by cohort and by prediction bucket,\n  and always measure against the deployment date, not the training date\n\nalerting: alert on sustained deviation (e.g. 3 consecutive windows), not single spikes'),
      code(`import numpy as np, pandas as pd
from scipy import stats

def psi(ref, cur, bins=10, eps=1e-6):
    qs = np.quantile(ref, np.linspace(0, 1, bins+1)); qs[0], qs[-1] = -np.inf, np.inf
    p = np.histogram(ref, qs)[0] / len(ref)
    q = np.histogram(cur, qs)[0] / len(cur)
    p = np.clip(p, eps, None); q = np.clip(q, eps, None)
    return float(np.sum((p - q) * np.log(p / q)))

rng = np.random.default_rng(0)
ref = rng.normal(0, 1, 10_000)
print('no drift  PSI', round(psi(ref, rng.normal(0, 1, 10_000)), 4))
print('shifted   PSI', round(psi(ref, rng.normal(0.5, 1, 10_000)), 4))
print('KS test p  ', round(stats.ks_2samp(ref, rng.normal(0.5, 1, 10_000)).pvalue, 6))

# A monitoring table you can schedule hourly
def drift_report(ref_df, cur_df):
    rows = []
    for col in ref_df.columns:
        if pd.api.types.is_numeric_dtype(ref_df[col]):
            rows.append({'feature': col, 'psi': psi(ref_df[col].dropna(), cur_df[col].dropna()),
                         'null_rate_ref': ref_df[col].isna().mean(),
                         'null_rate_cur': cur_df[col].isna().mean(),
                         'mean_cur': cur_df[col].mean(), 'mean_ref': ref_df[col].mean()})
        else:
            a = ref_df[col].value_counts(normalize=True)
            b = cur_df[col].value_counts(normalize=True).reindex(a.index).fillna(0)
            rows.append({'feature': col, 'psi': float(np.sum((a-b)*np.log((a+1e-9)/(b+1e-9)))),
                         'new_categories': int((~cur_df[col].isin(a.index)).sum())})
    return pd.DataFrame(rows).sort_values('psi', ascending=False)`),
      ul(['Monitor the prediction distribution: it is the cheapest early-warning signal you have.',
          'Set thresholds from the noise level you observe day to day, not from textbook constants.',
          'Segment monitoring by important cohorts — a global metric hides a broken slice.',
          'Define the retraining trigger in advance: drift threshold plus a label-availability plan.'],
         ['توزیعِ پیش‌بینی را پایش کنید: این ارزان‌ترین نشانه‌ی هشدارِ زودهنگامی است که دارید.',
          'آستانه‌ها را از سطحِ نویزی که روزانه می‌بینید تعیین کنید، نه از ثابت‌های کتاب‌ها.',
          'پایش را بر حسبِ گروه‌های مهم بخش‌بندی کنید — یک معیارِ سراسری یک برشِ خراب را پنهان می‌کند.',
          'محرکِ بازآموزش را از پیش تعریف کنید: آستانه‌ی انحراف به‌علاوه‌ی یک برنامه برای دسترسی به برچسب.'])
    ],
    ['monitoring', 'drift', 'psi', 'concept-drift', 'alerting'],
    [R('Evidently AI — open-source drift monitoring', 'https://docs.evidentlyai.com/', 'tool'),
     R('A Survey on Concept Drift Adaptation', 'https://arxiv.org/abs/2004.05785', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('ops-005', D, 'intermediate', 15,
    ['CI/CD and Testing for Machine Learning', 'CI/CD و آزمون‌نویسی برای یادگیری ماشین'],
    ['ML systems need the same automation as software, plus tests for data and models. The goal is that a broken pipeline never reaches production, and a good one ships in minutes.',
     'سیستم‌های یادگیری ماشین به همان خودکارسازیِ نرم‌افزار نیاز دارند، به‌علاوه‌ی آزمون‌هایی برای داده و مدل. هدف این است که یک خطِ لوله‌ی خراب هرگز به تولید نرسد و یک خطِ لوله‌ی خوب در چند دقیقه عرضه شود.'],
    [
      def('Continuous integration runs tests on every change; continuous delivery keeps the main branch deployable; continuous deployment ships automatically. ML adds data tests, model quality gates and training pipeline runs to the standard unit/integration test suite.',
          'یکپارچه‌سازیِ پیوسته آزمون‌ها را روی هر تغییر اجرا می‌کند؛ تحویلِ پیوسته شاخه‌ی اصلی را قابل‌استقرار نگه می‌دارد؛ استقرارِ پیوسته به‌طور خودکار عرضه می‌کند. یادگیری ماشین آزمون‌های داده، دروازه‌های کیفیتِ مدل و اجرای خطِ لوله‌ی آموزش را به مجموعه‌ی استانداردِ آزمون‌های واحد/یکپارچه می‌افزاید.'),
      math('the ML test pyramid:\n  data tests        schema, nulls, ranges, uniqueness, freshness, referential integrity\n  feature tests     no leakage, deterministic given inputs, correct for known edge cases\n  model tests       golden-pair output, metric above a floor, no NaN, latency under a cap\n  training tests    overfit-one-batch passes, loss decreases, gradients finite, seeds work\n  pipeline tests    end-to-end on a tiny fixture dataset, idempotent reruns\n  infra tests       container builds, healthcheck passes, rollback works\n\nCI stages:\n  1. lint + type check + unit tests                        (seconds)\n  2. data validation on a sample                           (seconds)\n  3. short training smoke run + metric gate                (minutes)\n  4. build artefact, run golden-pair and latency tests      (minutes)\n  5. deploy to staging -> integration tests -> manual/auto promote\n\nquality gates:  new model must beat the incumbent on a fixed validation set\n  and must not regress any protected slice by more than X%'),
      code(`# pytest-style tests that actually catch ML breakage
import numpy as np, pandas as pd, pytest

def test_schema(df):
    assert set(['user_id','age','income','country']).issubset(df.columns)
    assert df.age.between(0, 120).all()
    assert df.income.ge(0).all()
    assert df.user_id.is_unique

def test_no_target_leakage(df):
    for col in ['cancelled_at','churn_reason','refund_id']:
        assert col not in df.columns, f'{col} is a post-outcome field'

def test_features_deterministic(featurise):
    row = {'age': 41, 'income': 52000, 'country': 'DE'}
    assert featurise(row) == featurise(row)          # pure function of the row + state

def test_model_quality(bundle, X_val, y_val):
    from sklearn.metrics import roc_auc_score
    auc = roc_auc_score(y_val, bundle['model'].predict_proba(X_val)[:,1])
    assert auc >= 0.75, f'quality gate failed: {auc:.3f}'
    assert not np.isnan(bundle['model'].predict_proba(X_val)).any()

def test_overfit_one_batch(train_step, tiny_batch):
    loss0 = train_step(tiny_batch)
    for _ in range(200): loss = train_step(tiny_batch)
    assert loss < loss0 and loss < 0.1, 'model cannot even memorise one batch'

def test_golden_pair(bundle):
    out = predict(bundle, PredictRequest(age=41, income=52000, country='DE'))
    assert abs(out.score - 0.3271) < 1e-3, 'behaviour changed unexpectedly'`),
      ul(['Test the data as seriously as the code — most production incidents are data incidents.',
          'Keep a tiny fixture dataset so the full pipeline can run in CI in seconds.',
          'Gate promotion on a fixed validation set and on protected slices, never on the test set.',
          'Make rollback a tested, one-command operation; you will need it at the worst moment.'],
         ['داده را به همان جدّیّتِ کد آزمون کنید — بیشترِ حادثه‌های تولید، حادثه‌ی داده‌اند.',
          'یک مجموعه‌داده‌ی بسیار کوچک نگه دارید تا کلِ خطِ لوله در CI در چند ثانیه اجرا شود.',
          'ارتقا را به یک مجموعه‌ی اعتبارسنجیِ ثابت و برش‌های محافظت‌شده گره بزنید، هرگز به مجموعه‌ی آزمون.',
          'بازگشت را یک عملِ آزمون‌شده‌ی تک‌دستوری کنید؛ در بدترین لحظه به آن نیاز خواهید داشت.'])
    ],
    ['ci-cd', 'testing', 'pytest', 'quality-gates'],
    [R('Continuous Delivery for Machine Learning', 'https://martinfowler.com/articles/cd4ml.html', 'doc'),
     R('Made With ML — MLOps course', 'https://madewithml.com/', 'course')]
  );

  /* ------------------------------------------------------------------ */
  L('ops-006', D, 'advanced', 14,
    ['Feature Stores and Training-Serving Parity', 'فروشگاهِ ویژگی و هم‌خوانیِ آموزش/سروینگ'],
    ['The most common silent bug in production ML: the feature computed at training time differs from the one computed at serving time. A feature store exists to make them literally the same code and the same values.',
     'رایج‌ترین باگِ خاموش در یادگیری ماشینِ تولید: ویژگی‌ای که در زمانِ آموزش حساب می‌شود با چیزی که در زمانِ سروینگ حساب می‌شود فرق دارد. فروشگاهِ ویژگی وجود دارد تا این دو را تحت‌الفظی همان کد و همان مقادیر کند.'],
    [
      def('Training-serving skew comes from different code paths, different data sources, or time-travel: using information at training time that would not be available at prediction time. A feature store fixes this with a single definition per feature, materialised to both an offline store (for training, with point-in-time correct joins) and an online store (for low-latency lookup).',
          'انحرافِ آموزش/سروینگ از مسیرهای کدِ متفاوت، منابعِ داده‌ی متفاوت، یا سفر در زمان می‌آید: استفاده از اطلاعاتی در زمانِ آموزش که در زمانِ پیش‌بینی در دسترس نبود. فروشگاهِ ویژگی این را با یک تعریفِ واحد برای هر ویژگی درست می‌کند که هم در فروشگاهِ آفلاین (برای آموزش، با پیوندهای درستِ نقطه‌در-زمان) و هم در فروشگاهِ آنلاین (برای بازیابیِ کم‌تأخیر) مادی‌سازی می‌شود.'),
      math('point-in-time correctness:\n  for a training example at time t, use only feature values known at t\n  implementation: as-of join on event time with a lookback window\n  getting this wrong is the classic "my offline AUC was 0.9" disaster\n\nfeature store anatomy:\n  registry    : feature definitions, owners, lineage, freshness SLA, schema\n  offline     : columnar history for training and backfills (Parquet/warehouse)\n  online      : key-value store with the latest value per entity (Redis/DynamoDB)\n  materialisation job: runs the same transformation on both paths\n\nfeature types:  batch (daily), streaming (real-time aggregates),\n                on-demand (computed at request time from request data)\n\ntools:  Feast (open source), Tecton, Databricks/Databricks Feature Store,\n        SageMaker Feature Store, or simply dbt + Redis if you are disciplined'),
      code(`# Feast-style feature definition: one definition, two stores
"""
from feast import Entity, FeatureView, Field, FileSource
from feast.types import Float32, Int64
from datetime import timedelta

user = Entity(name='user', join_keys=['user_id'])

source = FileSource(path='data/orders.parquet',
                    event_timestamp_column='event_ts',
                    created_timestamp_column='created_ts')

user_stats = FeatureView(
    name='user_stats', entities=[user], ttl=timedelta(days=30),
    schema=[Field(name='orders_7d', dtype=Int64),
            Field(name='avg_order_value_30d', dtype=Float32),
            Field(name='days_since_last_order', dtype=Int64)],
    source=source)
"""

# Point-in-time correct training data: no future information leaks in
# df = store.get_historical_features(
#         entity_df=labels_with_timestamps,         # user_id, event_timestamp, label
#         features=['user_stats:orders_7d', 'user_stats:avg_order_value_30d']).to_df()

# Online serving: the same values, from the online store
# vec = store.get_online_features(features=['user_stats:orders_7d'],
#                                 entity_rows=[{'user_id': 42}]).to_dict()

# The manual version: an as-of join you can reason about
def as_of_join(events, features, key='user_id', time='ts'):
    out = []
    for _, e in events.iterrows():
        hist = features[(features[key] == e[key]) & (features[time] <= e[time])]
        out.append(hist.iloc[-1] if len(hist) else None)
    return pd.DataFrame(out)`),
      ul(['Write each feature once; if you write it twice, it will drift.',
          'Every training example needs a timestamp; without it, point-in-time correctness is impossible.',
          'Monitor online/offline consistency: sample requests and compare the two paths.',
          'A feature store is infrastructure — do not adopt one for a single model with three features.'],
         ['هر ویژگی را یک‌بار بنویسید؛ اگر دوبار نوشتید، منحرف خواهد شد.',
          'هر مثالِ آموزشی به یک زمان‌سنج نیاز دارد؛ بدون آن، درستیِ نقطه‌در-زمان غیرممکن است.',
          'سازگاریِ آنلاین/آفلاین را پایش کنید: درخواست‌ها را نمونه‌برداری و دو مسیر را مقایسه کنید.',
          'فروشگاهِ ویژگی زیرساخت است — برای یک مدل با سه ویژگی آن را به‌کار نگیرید.'])
    ],
    ['feature-store', 'skew', 'point-in-time', 'feast'],
    [R('Feast documentation', 'https://docs.feast.dev/', 'doc'),
     R('Hidden Technical Debt in Machine Learning Systems', 'https://proceedings.neurips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html', 'paper')]
  );

  /* ------------------------------------------------------------------ */
  L('ops-007', D, 'intermediate', 14,
    ['Model Registry, Governance and Documentation', 'ثبت‌گاهِ مدل، حاکمیت و مستندسازی'],
    ['In a regulated or simply large organisation, "which model is in production and why" must have an answer. The registry is the system of record; the model card is the human-readable contract.',
     'در یک سازمانِ تحتِ نظارت یا صرفاً بزرگ، عبارتِ «کدام مدل در تولید است و چرا» باید پاسخی داشته باشد. ثبت‌گاه، سیستمِ ثبتِ وقایع است و کارتِ مدل قراردادِ قابل‌خواندن برای انسان.'],
    [
      def('A model registry versions models, tracks their lifecycle stage (dev/staging/production/archived), stores lineage (data, code, run) and holds the approval record. Governance adds: who approved, on what evidence, under which policy, with what monitoring and rollback plan.',
          'یک ثبت‌گاهِ مدل مدل‌ها را نسخه‌گذاری می‌کند، مرحله‌ی چرخه‌ی حیات‌شان (توسعه/آزمایشی/تولید/بایگانی) را ردیابی می‌کند، تبار (داده، کد، اجرا) را ذخیره می‌کند و رکوردِ تأیید را نگه می‌دارد. حاکمیت می‌افزاید: چه کسی تأیید کرد، بر چه پایه‌ای، تحتِ کدام سیاست، با چه پایشی و چه برنامه‌ی بازگشتی.'),
      math('registry entry:\n  model name + version + stage + owner + created_at\n  lineage: training data snapshot, git commit, experiment run id, base model\n  metrics: overall + per-slice + fairness metrics + calibration\n  artefacts: weights, preprocessing, schemas, evaluation report\n  approvals: reviewer, date, decision, conditions, expiry date\n  deployment: environment, endpoint, traffic share, rollback version\n\nmodel card sections:\n  intended use and out-of-scope uses | training data and its known gaps\n  metrics with confidence intervals and slice breakdowns | ethical considerations\n  limitations and failure modes | monitoring and retraining plan | contact\n\ncompliance touchpoints:  EU AI Act risk tiers, GDPR (automated decisions, Art. 22),\n  sector rules (credit: ECOA/FCRA adverse action; health: HIPAA; finance: SR 11-7)'),
      code(`import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()
model_name = 'churn-risk-scorer'

# Register the winning run and move it through stages with an audit trail
res = mlflow.register_model('runs:/<run_id>/model', model_name)
client.set_model_version_tag(model_name, res.version, 'approved_by', 'risk-committee')
client.set_model_version_tag(model_name, res.version, 'approval_date', '2025-08-14')
client.set_model_version_tag(model_name, res.version, 'data_snapshot', '2025-08-01')
client.transition_model_version_stage(model_name, res.version, 'Production',
                                      archive_existing_versions=True)

# A machine-readable model card next to the artefact
card = {
  'name': model_name, 'version': res.version,
  'intended_use': 'Ranking retention offers for EU retail customers',
  'out_of_scope': ['credit decisions', 'pricing', 'any use outside the EU retail book'],
  'training_data': {'snapshot': '2025-08-01', 'rows': 1_240_000,
                    'known_gaps': ['no coverage of customers onboarded after 2025-07']},
  'metrics': {'val_auc': 0.812, 'ci95': [0.803, 0.821],
              'slice': {'DE': 0.83, 'FR': 0.79, 'US': 0.81}},
  'fairness': {'demographic_parity_ratio': 0.94, 'equal_opportunity_diff': 0.02},
  'limitations': ['degrades when a new pricing plan launches (seen 2025-03)'],
  'monitoring': {'schedule': 'hourly', 'psi_threshold': 0.25, 'retrain_policy': 'quarterly or on drift'},
  'owner': 'retention-ml@company.example'
}`),
      ul(['Every production model should have a named human owner and a documented rollback version.',
          'Record out-of-scope uses explicitly; misuse is usually scope creep, not malice.',
          'Keep evaluation reports with slice breakdowns attached to the version, not in a slide deck.',
          'Automate the approval trail — an audit you have to reconstruct later is an audit you will fail.'],
         ['هر مدلِ تولید باید یک مالکِ انسانیِ نام‌برده و یک نسخه‌ی بازگشتِ مستند داشته باشد.',
          'مواردِ خارج از دامنه را صریحاً ثبت کنید؛ سوءاستفاده معمولاً خزشِ دامنه است نه سوءنیّت.',
          'گزارش‌های ارزیابی را با تفکیکِ برش‌ها ضمیمه‌ی نسخه نگه دارید، نه در یک اسلاید.',
          'ردِ تأیید را خودکار کنید — حسابرسی‌ای که بعداً باید بازسازی شود، حسابرسی‌ای است که در آن رد می‌شوید.'])
    ],
    ['registry', 'governance', 'model-cards', 'compliance'],
    [R('Model Cards for Model Reporting', 'https://arxiv.org/abs/1810.03993', 'paper'),
     R('MLflow Model Registry', 'https://mlflow.org/docs/latest/model-registry.html', 'doc'),
     R('EU AI Act — official text', 'https://artificialintelligenceact.eu/', 'doc')]
  );

  /* ------------------------------------------------------------------ */
  L('ops-008', D, 'advanced', 14,
    ['Cost, Capacity and Reliability Engineering for ML', 'مهندسیِ هزینه، ظرفیت و قابلیت اطمینان برای یادگیری ماشین'],
    ['A model in production is a service with an SLA and a monthly bill. Capacity planning, autoscaling, graceful degradation and cost visibility are what separate a demo from a system.',
     'مدلی در تولید سرویسی با یک SLA و یک قبضِ ماهانه است. برنامه‌ریزیِ ظرفیت، مقیاس‌دهیِ خودکار، تنزّلِ باوقار و دیدِ هزینه همان چیزی است که یک دمو را از یک سیستم جدا می‌کند.'],
    [
      def('Reliability engineering for ML means defining SLOs (latency, availability, freshness, quality), measuring against them, and designing for failure: timeouts, retries, circuit breakers, caching, fallbacks and rate limiting. Cost engineering means knowing your cost per inference, per retrain and per experiment, and cutting the biggest line item.',
          'مهندسیِ قابلیت اطمینان برای یادگیری ماشین یعنی تعریفِ SLOها (تأخیر، در دسترس بودن، تازگی، کیفیت)، سنجش در برابر آن‌ها و طراحی برای شکست: وقفه‌ی زمانی، تلاشِ مجدد، قطع‌کننده‌های مدار، کش، راهکارهای جایگزین و محدودسازیِ نرخ. مهندسیِ هزینه یعنی دانستنِ هزینه به‌ازای هر استنتاج، هر بازآموزش و هر آزمایش، و بُریدنِ بزرگ‌ترین قلم.'),
      math('cost model:\n  cost_per_1k_predictions = (instance_hourly / throughput_per_hour) * 1000\n  GPU:  batch aggressively; the same card serves far more requests with batching\n  CPU:  quantise, use ONNX Runtime, distil to a smaller model\n  LLM:  cost = input_tokens * p_in + output_tokens * p_out\n        -> cache prefixes, shorten prompts, route easy queries to a small model\n\nbudget levers, in rough order of payoff:\n  1. batch size / continuous batching / request coalescing\n  2. quantisation and distillation (usually <1% quality loss)\n  3. right-size the instance (most ML services are 3-5x over-provisioned)\n  4. caching (identical requests, embeddings, retrieved documents)\n  5. spot/preemptible instances for training and batch jobs\n  6. autoscaling on queue depth, not just CPU (GPU utilisation is the real signal)\n\nreliability patterns:  timeout + retry with jitter + circuit breaker + bulkhead,\n  graceful degradation (serve a cached/simpler model), and a documented kill switch'),
      code(`# Cost per 1k predictions: measure it, then optimise the biggest term
def cost_per_1k(instance_hourly_usd, throughput_per_hour):
    return instance_hourly_usd / throughput_per_hour * 1000

print('A10G, 1 GPU, 600 req/h :', round(cost_per_1k(1.20, 600), 4), 'USD/1k')
print('A10G, batched, 6000/h :', round(cost_per_1k(1.20, 6000), 4), 'USD/1k')
print('serverless CPU small  :', round(cost_per_1k(0.05, 3000), 4), 'USD/1k')

# LLM cost accounting: tokens are the unit
PRICE = {'gpt-4o-mini': (0.15, 0.60), 'gpt-4o': (2.50, 10.00)}   # USD / 1M tokens
def llm_cost(model, in_tok, out_tok):
    p_in, p_out = PRICE[model]
    return (in_tok/1e6)*p_in + (out_tok/1e6)*p_out
print('1k requests, 2k in / 300 out, 4o-mini:',
      round(llm_cost('gpt-4o-mini', 2000*1000, 300*1000), 3), 'USD')

# Routing: send easy traffic to the cheap model, hard traffic to the strong one
def route(query, confidence_threshold=0.6):
    cheap = call_small(query)
    return cheap if cheap.confidence > confidence_threshold else call_large(query)

# Circuit breaker + fallback so the product survives a model outage
class CircuitBreaker:
    def __init__(self, max_failures=5, reset_after=60):
        self.fails = 0; self.max = max_failures; self.open_until = None
    def call(self, fn, fallback):
        import time
        if self.open_until and time.time() < self.open_until:
            return fallback()
        try:
            out = fn(); self.fails = 0; return out
        except Exception:
            self.fails += 1
            if self.fails >= self.max: self.open_until = time.time() + 60
            return fallback()`),
      ul(['Instrument cost per request from day one — retrofitting cost visibility is painful.',
          'Autoscale on queue depth or GPU utilisation; CPU is a poor proxy for ML load.',
          'Design a graceful fallback: a cached score or a rule beats a 500 error.',
          'Retraining on a schedule is a cost too; trigger it from drift, not from the calendar alone.'],
         ['هزینه به‌ازای هر درخواست را از روزِ اول ابزاربندی کنید — افزودنِ دیدِ هزینه بعداً دردناک است.',
          'بر پایه‌ی عمقِ صف یا استفاده از GPU مقیاس دهید؛ CPU نماینده‌ی بدی برای بارِ یادگیری ماشین است.',
          'یک راهکارِ جایگزینِ باوقار طراحی کنید: یک امتیازِ کش‌شده یا یک قاعده از خطای ۵۰۰ بهتر است.',
          'بازآموزشِ طبقِ برنامه هم هزینه دارد؛ آن را از انحراف محرک کنید، نه تنها از تقویم.'])
    ],
    ['cost', 'capacity', 'reliability', 'autoscaling', 'slo'],
    [R('Google SRE Book — free', 'https://sre.google/books/', 'book'),
     R('Practical MLOps (O\'Reilly)', 'https://www.oreilly.com/library/view/practical-mlops/9781098103002/', 'book')]
  );

})(typeof window !== 'undefined' ? window : globalThis);
