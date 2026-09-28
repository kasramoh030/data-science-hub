/* =====================================================================
   sw.js — tiny service worker: the hub keeps working with no network
   Bump CACHE when you publish new content so clients re-fetch.
   ===================================================================== */
var CACHE = 'dshub-v4';

var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/icon.svg',
  './data/schema.js',
  './data/lessons-01-linear-algebra.js',
  './data/lessons-02-calculus.js',
  './data/lessons-03-probability.js',
  './data/lessons-04-statistics.js',
  './data/lessons-11-statistical-methods.js',
  './data/lessons-05-programming.js',
  './data/lessons-06-ml.js',
  './data/lessons-07-dl.js',
  './data/lessons-08-genai.js',
  './data/lessons-09-mlops.js',
  './data/lessons-10-responsible-practice.js',
  './data/quizzes.js',
  './data/extras.js',
  './data/updates.js',
  './data/projects-01-foundations.js',
  './data/projects-02-domains.js',
  './data/projects-03-capstones.js',
  './js/i18n.js',
  './js/store.js',
  './js/ui.js',
  './js/quiz.js',
  './js/playgrounds.js',
  './js/app.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS).catch(function () {
        // ignore individual 404s (e.g. when opened from file://)
      }); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never cache third-party links

  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
