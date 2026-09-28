#!/usr/bin/env node
/* =====================================================================
   tools/validate.js — data integrity checks for the curriculum
   Usage:  node tools/validate.js
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const sandbox = { console };
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);

const dataFiles = fs.readdirSync(path.join(ROOT, 'data')).filter(f => f.endsWith('.js'));
const ordered = ['schema.js']
  .concat(dataFiles.filter(f => f.startsWith('lessons-')).sort())
  .concat(dataFiles.filter(f => !f.startsWith('lessons-') && f !== 'schema.js').sort());
const files = ordered.map(f => 'data/' + f);
files.forEach(f => {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  vm.runInContext(code, sandbox, { filename: f });
});

const DSH = sandbox.DSH;
const problems = [];
const warn = [];

const domainIds = new Set(DSH.DOMAINS.map(d => d.id));
const levelIds = new Set(DSH.LEVELS.map(l => l.id));

/* ------------------------------------------------------------ lessons */
const seen = new Set();
let blocks = 0, codeBlocks = 0, faChars = 0, enChars = 0, minutes = 0;
DSH.LESSONS.forEach(l => {
  if (seen.has(l.id)) problems.push('duplicate lesson id: ' + l.id);
  seen.add(l.id);
  if (!domainIds.has(l.domain)) problems.push(`${l.id}: unknown domain ${l.domain}`);
  if (!levelIds.has(l.level)) problems.push(`${l.id}: unknown level ${l.level}`);
  ['title', 'summary'].forEach(k => {
    if (!l[k] || !l[k].en || !l[k].fa) problems.push(`${l.id}: missing ${k} in one language`);
  });
  if (!Array.isArray(l.blocks) || !l.blocks.length) problems.push(`${l.id}: no content blocks`);
  (l.blocks || []).forEach((b, i) => {
    blocks++;
    const type = b[0];
    if (!['p', 'ul', 'math', 'code', 'note', 'def'].includes(type)) {
      problems.push(`${l.id} block ${i}: unknown type ${type}`);
    }
    if (type === 'code') {
      codeBlocks++;
      if (typeof b[1] !== 'string' || b[1].length < 20) problems.push(`${l.id} block ${i}: empty code`);
    } else if (type === 'ul') {
      const en = b[1], fa = b[2];
      if (!Array.isArray(en) || !Array.isArray(fa)) problems.push(`${l.id} block ${i}: ul must hold two arrays`);
      else if (en.length !== fa.length) problems.push(`${l.id} block ${i}: ul length mismatch ${en.length}/${fa.length}`);
      else { enChars += en.join(' ').length; faChars += fa.join(' ').length; }
    } else {
      const en = b[1], fa = b[2];
      if (typeof en !== 'string' || !en.length) problems.push(`${l.id} block ${i}: empty EN`);
      if (typeof fa !== 'string' || !fa.length) problems.push(`${l.id} block ${i}: empty FA`);
      if (en) enChars += en.length;
      if (fa) faChars += fa.length;
    }
  });
  minutes += l.minutes;
  (l.resources || []).forEach(r => {
    if (!/^https?:\/\//.test(r.url || '')) problems.push(`${l.id}: bad resource url ${r.url}`);
  });
});

/* ---------------------------------------------------------- questions */
const qseen = new Set();
DSH.QUESTIONS.forEach(q => {
  if (qseen.has(q.id)) problems.push('duplicate question id: ' + q.id);
  qseen.add(q.id);
  if (!domainIds.has(q.domain)) problems.push(`${q.id}: unknown domain ${q.domain}`);
  if (!levelIds.has(q.level)) problems.push(`${q.id}: unknown level ${q.level}`);
  if (!['mcq', 'msq', 'num', 'text'].includes(q.kind)) problems.push(`${q.id}: bad kind ${q.kind}`);
  if (!q.prompt || !q.prompt.en || !q.prompt.fa) problems.push(`${q.id}: prompt missing a language`);
  if (!q.explain || !q.explain.en || !q.explain.fa) warn.push(`${q.id}: explanation missing a language`);
  const p = q.payload || {};
  if (q.kind === 'mcq') {
    if (!Array.isArray(p.options) || p.options.length < 2) problems.push(`${q.id}: needs >= 2 options`);
    else if (!(p.answer >= 0 && p.answer < p.options.length)) problems.push(`${q.id}: answer index out of range`);
    p.options.forEach((o, i) => {
      if (!Array.isArray(o) || !o[0] || !o[1]) problems.push(`${q.id} option ${i}: not bilingual`);
    });
  }
  if (q.kind === 'msq') {
    if (!Array.isArray(p.answers) || !p.answers.length) problems.push(`${q.id}: msq needs answers[]`);
    (p.answers || []).forEach(a => {
      if (!(a >= 0 && a < (p.options || []).length)) problems.push(`${q.id}: msq answer index out of range`);
    });
  }
  if (q.kind === 'num') {
    if (typeof p.gen === 'function') {
      for (let k = 0; k < 200; k++) {
        const g = p.gen();
        if (typeof g.answer !== 'number' || !isFinite(g.answer)) { problems.push(`${q.id}: generator produced a bad answer`); break; }
        if (!g.text || !g.text.en || !g.text.fa) { problems.push(`${q.id}: generator text must be bilingual`); break; }
      }
    } else {
      if (typeof p.answer !== 'number') problems.push(`${q.id}: num needs a numeric answer`);
      if (!p.text || !p.text.en || !p.text.fa) problems.push(`${q.id}: num text must be bilingual`);
    }
  }
  if (q.kind === 'text') {
    if (!Array.isArray(p.answers) || !p.answers.length) problems.push(`${q.id}: text needs accepted answers`);
  }
});

/* ------------------------------------------------------------- paths */
const pids = new Set();
DSH.PATHS.forEach(p => {
  if (pids.has(p.id)) problems.push('duplicate path id: ' + p.id);
  pids.add(p.id);
  if (!p.title || !p.title.en || !p.title.fa) problems.push(`${p.id}: title not bilingual`);
  p.lessons.forEach(id => { if (!seen.has(id)) problems.push(`${p.id}: unknown lesson ${id}`); });
  if (!levelIds.has(p.level)) problems.push(`${p.id}: unknown level ${p.level}`);
});

/* ---------------------------------------------------------- projects */
const pseen = new Set();
let stepCount = 0, codeSteps = 0, projectHours = 0;
DSH.PROJECTS.forEach(pr => {
  if (pseen.has(pr.id)) problems.push('duplicate project id: ' + pr.id);
  pseen.add(pr.id);
  if (pr.kind !== 'domain' && pr.kind !== 'capstone') problems.push(`${pr.id}: bad kind ${pr.kind}`);
  if (!domainIds.has(pr.domain)) problems.push(`${pr.id}: unknown domain ${pr.domain}`);
  if (!levelIds.has(pr.level)) problems.push(`${pr.id}: unknown level ${pr.level}`);
  ['title', 'pitch'].forEach(k => {
    if (!pr[k] || !pr[k].en || !pr[k].fa) problems.push(`${pr.id}: ${k} missing a language`);
  });
  if (!pr.dataset || !pr.dataset.en || !pr.dataset.fa) problems.push(`${pr.id}: dataset missing a language`);
  if (!/^https?:\/\//.test((pr.dataset || {}).url || '')) problems.push(`${pr.id}: bad dataset url`);
  if (!pr.steps || pr.steps.length < 5) problems.push(`${pr.id}: needs at least 5 steps`);
  (pr.steps || []).forEach((st, i) => {
    stepCount++;
    if (!st.title || !st.title.en || !st.title.fa) problems.push(`${pr.id} step ${i}: title not bilingual`);
    if (!st.body || !st.body.en || !st.body.fa) problems.push(`${pr.id} step ${i}: body not bilingual`);
    if (st.code) {
      codeSteps++;
      if (typeof st.code[0] !== 'string' || st.code[0].length < 20) problems.push(`${pr.id} step ${i}: empty code`);
      if (!['python', 'sql', 'bash', 'yaml', 'docker', 'js'].includes(st.code[1] || 'python')) {
        problems.push(`${pr.id} step ${i}: unknown code language ${st.code[1]}`);
      }
    }
    if (st.hint && (!st.hint.en || !st.hint.fa)) problems.push(`${pr.id} step ${i}: hint not bilingual`);
    if (st.check && (!st.check.en || !st.check.fa)) problems.push(`${pr.id} step ${i}: check not bilingual`);
  });
  if (!pr.deliverables || !(pr.deliverables.en || []).length || !(pr.deliverables.fa || []).length) {
    problems.push(`${pr.id}: missing deliverables`);
  } else if (pr.deliverables.en.length !== pr.deliverables.fa.length) {
    problems.push(`${pr.id}: deliverables length mismatch`);
  }
  if (!pr.rubric || pr.rubric.length < 3) problems.push(`${pr.id}: rubric needs at least 3 items`);
  (pr.rubric || []).forEach((r, i) => {
    if (!r.en || !r.fa) problems.push(`${pr.id} rubric ${i}: not bilingual`);
  });
  (pr.resources || []).forEach(r => {
    if (!/^https?:\/\//.test(r.url || '')) problems.push(`${pr.id}: bad resource url ${r.url}`);
  });
  projectHours += pr.hours || 0;
});

/* --------------------------------------------------------- resources */
const rids = new Set();
DSH.RESOURCES.forEach(r => {
  if (rids.has(r.id)) problems.push('duplicate resource id: ' + r.id);
  rids.add(r.id);
  if (!/^https?:\/\//.test(r.url || '')) problems.push(`${r.id}: bad url ${r.url}`);
  if (!domainIds.has(r.domain)) problems.push(`${r.id}: unknown domain ${r.domain}`);
  if (!r.title || !r.title.en || !r.title.fa) problems.push(`${r.id}: title not bilingual`);
});

/* ------------------------------------------------------------- report */
const byDomain = {};
DSH.LESSONS.forEach(l => { byDomain[l.domain] = (byDomain[l.domain] || 0) + 1; });
const qByDomain = {};
DSH.QUESTIONS.forEach(q => { qByDomain[q.domain] = (qByDomain[q.domain] || 0) + 1; });

console.log('======================================================');
console.log(' lessons      :', DSH.LESSONS.length, '| blocks', blocks, '| code samples', codeBlocks);
console.log(' questions    :', DSH.QUESTIONS.length);
console.log(' resources    :', DSH.RESOURCES.length);
console.log(' paths        :', DSH.PATHS.length);
console.log(' projects     :', DSH.PROJECTS.length,
  '(' + DSH.PROJECTS.filter(p => p.kind === 'domain').length + ' domain, ' +
  DSH.PROJECTS.filter(p => p.kind === 'capstone').length + ' capstone)',
  '| steps', stepCount, '| code', codeSteps, '|', projectHours + ' h');
console.log(' study time   :', (minutes / 60).toFixed(1), 'hours of reading');
console.log(' EN / FA text :', (enChars / 1000).toFixed(0) + 'k / ' + (faChars / 1000).toFixed(0) + 'k chars');
console.log('------------------------------------------------------');
DSH.DOMAINS.forEach(d => {
  const nL = String(byDomain[d.id] || 0).padStart(3);
  const nQ = String(qByDomain[d.id] || 0).padStart(3);
  console.log(' ' + nL + ' lessons  ' + nQ + ' questions   ' + d.id);
});
console.log('======================================================');
if (warn.length) { console.log('WARNINGS'); warn.forEach(w => console.log('  ~ ' + w)); }
if (problems.length) {
  console.log('PROBLEMS (' + problems.length + ')');
  problems.forEach(p => console.log('  x ' + p));
  process.exit(1);
}
console.log('All checks passed ✅');
