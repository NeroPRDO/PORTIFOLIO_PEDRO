import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, '');
const locales = ['en', 'pt-BR', 'pt-PT', 'fr', 'es', 'de', 'pl', 'it', 'kea-CV'];
const pageName = locale => locale === 'en' ? 'index.html' : `${locale}.html`;
const excluded = [
  'ds881-curriculo-GRR20240844', 'ds151-flag-game-test',
  'ds881-tmdb-app-github-actions-t', 'ds881-github-actions-example',
  'ds881-docker-swift-t', 'WEB-Client_Side', 'OUTDATED_Portifolio_WEB',
  'Manipulacao_DOM', 'Segredo_Imortal', 'Lista_Cabecalho',
];
const attributes = (html, name) => [...html.matchAll(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'gi'))].map(match => match[1]);
const ids = html => attributes(html, 'id');

test('all nine dictionaries have the same nonempty string keys', () => {
  const expected = Object.keys(JSON.parse(read('src/en.json'))).sort();
  for (const locale of locales) {
    const dictionary = JSON.parse(read(`src/${locale}.json`));
    assert.deepEqual(Object.keys(dictionary).sort(), expected, `${locale}: translation keys`);
    for (const [key, value] of Object.entries(dictionary)) {
      assert.equal(typeof value, 'string', `${locale}.${key}: string required`);
      assert.ok(value.trim(), `${locale}.${key}: empty translation`);
      assert.doesNotMatch(value, /\{\{\w+\}\}/, `${locale}.${key}: unresolved placeholder`);
    }
  }
});

for (const locale of locales) {
  test(`${locale}: page metadata, anchors and local resources resolve`, () => {
    const filename = pageName(locale);
    const html = read(filename);
    assert.match(html, new RegExp(`<html\\s+lang="${locale}"`));
    assert.doesNotMatch(html, /\{\{\w+\}\}/, 'unresolved template marker');
    const pageIds = ids(html);
    assert.equal(new Set(pageIds).size, pageIds.length, 'duplicate element IDs');
    for (const reference of [...attributes(html, 'src'), ...attributes(html, 'href')]) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) continue;
      const url = new URL(reference.replaceAll('&amp;', '&'), `https://local.test/${filename}`);
      const target = decodeURIComponent(url.pathname).replace(/^\//, '');
      const absolute = path.resolve(root, target);
      assert.ok(absolute.startsWith(root + path.sep), `${reference}: escapes site root`);
      assert.ok(fs.existsSync(absolute), `${filename}: missing local resource ${reference}`);
      assert.ok(fs.statSync(absolute).isFile(), `${reference}: expected file`);
      if (url.hash) {
        const anchor = decodeURIComponent(url.hash.slice(1));
        const targetIds = target === filename ? pageIds : ids(read(target));
        assert.ok(targetIds.includes(anchor), `${filename}: broken anchor ${reference}`);
      }
    }
    for (const referencedIds of [...attributes(html, 'aria-labelledby'), ...attributes(html, 'aria-describedby')]) {
      for (const id of referencedIds.split(/\s+/)) assert.ok(pageIds.includes(id), `missing accessible label ${id}`);
    }
    for (const target of attributes(html, 'data-open')) assert.ok(pageIds.includes(target), `missing dialog ${target}`);
    for (const code of locales) assert.ok(attributes(html, 'href').includes(pageName(code)), `missing ${code} language link`);
  });

  test(`${locale}: requested content exclusions and analytics privacy survive generation`, () => {
    const html = read(pageName(locale));
    for (const repo of excluded) assert.ok(!html.toLowerCase().includes(repo.toLowerCase()), `excluded repository ${repo}`);
    assert.doesNotMatch(html, /ECMAScript|órgão público|orgao publico|public agency|government employment/i);
    const skills = html.match(/<section\b[^>]*id="skills"[\s\S]*?<\/section>/)?.[0];
    assert.ok(skills, 'skills section is missing');
    assert.doesNotMatch(skills, /\d\s*%|role="progressbar"|<progress\b/i, 'percentage-based skills returned');
    for (const skill of ['MySQL', 'Balsamiq', 'Cisco Packet Tracer']) assert.ok(skills.includes(skill), `missing requested skill ${skill}`);
    // Analytics must never be fetched eagerly through script, iframe, image, preconnect or preload.
    for (const url of [...attributes(html, 'src'), ...attributes(html, 'href')]) {
      assert.doesNotMatch(url, /(?:googletagmanager|google-analytics)\.com/i, 'analytics is loaded before consent');
    }
    for (const button of ['analytics-accept', 'analytics-reject']) assert.ok(ids(html).includes(button), `missing ${button} control`);
  });
}

test('project selection has unique IDs, real repository destinations and no excluded exercises', () => {
  const projects = JSON.parse(read('src/projects.json'));
  assert.ok(projects.length >= 5, 'curated project selection is incomplete');
  assert.equal(new Set(projects.map(project => project.id)).size, projects.length, 'duplicate project IDs');
  assert.equal(new Set(projects.map(project => project.repo.toLowerCase())).size, projects.length, 'duplicate repositories');
  assert.ok(projects.some(project => project.repo === 'ajudacantina'), 'community project missing');
  for (const project of projects) {
    assert.match(project.repo, /^[A-Za-z\d_.-]+$/, 'invalid repository path');
    assert.ok(!excluded.some(repo => repo.toLowerCase() === project.repo.toLowerCase()));
    assert.ok(['web', 'systems', 'mobile'].includes(project.category), 'project cannot be reached by filters');
    assert.ok(Array.isArray(project.tags) && project.tags.length > 0, 'missing technology context');
    for (const locale of locales) {
      const dictionary = JSON.parse(read(`src/${locale}.json`));
      assert.ok(dictionary[`p${project.id}Desc`], `${locale}: missing description for ${project.repo}`);
      assert.ok(dictionary[`p${project.id}Type`], `${locale}: missing type for ${project.repo}`);
    }
  }
});

// Exercise the production consent handlers with an inert DOM: no network, animation or browser dependencies.
function analyticsSession(saved) {
  const storage = new Map();
  if (saved !== undefined) storage.set('pd-analytics', JSON.stringify(saved));
  const elements = new Map();
  const scripts = [];
  const getElement = selector => {
    if (!elements.has(selector)) {
      const handlers = new Map();
      const classes = new Set();
      elements.set(selector, {
        handlers, style: { setProperty() {} }, dataset: {},
        textContent: selector === '#messages' ? JSON.stringify({ projectCount: 'projects', analyticsSaved: 'Saved' }) : '',
        classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle(value, on) { on ? classes.add(value) : classes.delete(value); } },
        addEventListener(event, handler) { handlers.set(event, handler); },
        setAttribute() {}, close() {}, showModal() {}, focus() {},
        getContext() { return null; },
      });
    }
    return elements.get(selector);
  };
  const document = {
    documentElement: Object.assign(getElement('html'), { lang: 'en', scrollHeight: 1000 }),
    querySelector: getElement, querySelectorAll: () => [],
    getElementById: id => getElement(`#${id}`),
    createElement: tag => ({ tagName: tag }),
    head: { append: script => scripts.push(script) },
    addEventListener() {}, cookie: '', hidden: false,
  };
  const context = {
    document,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    location: { hostname: 'neroprdo.github.io', href: 'https://neroprdo.github.io/PORTIFOLIO_PEDRO/', search: '', hash: '' },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {}, dispatchEvent() {}, Event: class {},
    setTimeout: () => 1, clearTimeout() {}, requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    innerHeight: 800, scrollY: 0, URL, Intl,
  };
  context.window = context;
  vm.runInNewContext(read('assets/app.js'), context, { filename: 'assets/app.js', timeout: 1000 });
  return { scripts, storage, context, click(id) {
    const button = getElement(`#${id}`);
    const callback = button.handlers.get('click');
    assert.ok(callback, `missing click handler for ${id}`);
    callback({ target: button });
  } };
}

test('analytics does not load on first visit or after a saved rejection', () => {
  assert.equal(analyticsSession().scripts.length, 0);
  assert.equal(analyticsSession(false).scripts.length, 0);
});

test('consent enables the preserved GA property once and can be revoked', () => {
  const session = analyticsSession();
  session.click('analytics-accept');
  assert.equal(session.scripts.length, 1);
  assert.equal(new URL(session.scripts[0].src).searchParams.get('id'), 'G-XWFKEVEDM5');
  assert.equal(session.storage.get('pd-analytics'), 'true');
  session.click('analytics-accept');
  assert.equal(session.scripts.length, 1, 'duplicate analytics loader');
  session.click('analytics-reject');
  assert.equal(session.storage.get('pd-analytics'), 'false');
  assert.equal(session.context['ga-disable-G-XWFKEVEDM5'], true, 'tracking remains enabled after revocation');
});

test('saved consent restores analytics on a later visit', () => {
  const session = analyticsSession(true);
  assert.equal(session.scripts.length, 1);
  assert.equal(new URL(session.scripts[0].src).searchParams.get('id'), 'G-XWFKEVEDM5');
});
