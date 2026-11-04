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
    assert.ok(['web', 'systems', 'mobile', 'games'].includes(project.category), 'project cannot be reached by filters');
    assert.ok(Array.isArray(project.tags) && project.tags.length > 0, 'missing technology context');
    for (const locale of locales) {
      const dictionary = JSON.parse(read(`src/${locale}.json`));
      assert.ok(dictionary[`p${project.id}Desc`], `${locale}: missing description for ${project.repo}`);
      assert.ok(dictionary[`p${project.id}Type`], `${locale}: missing type for ${project.repo}`);
    }
  }
});

test('Tetris remains discoverable through the games filter in every language', () => {
  const projects = JSON.parse(read('src/projects.json'));
  const tetris = projects.find(project => project.repo === 'TETRIS');
  assert.ok(tetris, 'Tetris is missing from selected projects');
  assert.equal(tetris.category, 'games');
  assert.ok(tetris.image && tetris.motionImage, 'Tetris needs static and animated previews');
  for (const locale of locales) {
    const html = read(pageName(locale));
    const dictionary = JSON.parse(read(`src/${locale}.json`));
    assert.match(html, /<button\b[^>]*data-filter="games"[^>]*aria-pressed="false"/);
    const article = html.match(new RegExp(`<article\\b[^>]*id="project-${tetris.id}"[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(article, `${locale}: Tetris is not rendered`);
    assert.match(article, /data-category="games"/);
    assert.ok(article.includes('https://github.com/NeroPRDO/TETRIS'));
    assert.ok(article.includes(dictionary.p8Desc), `${locale}: wrong Tetris description`);
  }
});

const htmlEscape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

test('six distinct story chapters retain their order and translated prose', () => {
  const english = JSON.parse(read('src/en.json'));
  for (const locale of locales) {
    const html = read(pageName(locale));
    const dictionary = JSON.parse(read(`src/${locale}.json`));
    const chapters = [...html.matchAll(/<aside\b[^>]*id="story-(\d+)"[\s\S]*?<\/aside>/g)];
    assert.deepEqual(chapters.map(chapter => Number(chapter[1])), [1, 2, 3, 4, 5, 6], `${locale}: missing, duplicated or reordered story chapters`);
    const titles = [], bodies = [];
    for (const [markup, number] of chapters) {
      const title = dictionary[`story${number}Title`], body = dictionary[`story${number}Body`];
      titles.push(title); bodies.push(body);
      assert.ok(markup.includes(htmlEscape(title)), `${locale}: chapter ${number} title mismatch`);
      assert.ok(markup.includes(htmlEscape(body)), `${locale}: chapter ${number} prose mismatch`);
      assert.ok(markup.includes(`aria-labelledby="story-title-${number}"`));
      if (locale !== 'en') assert.notEqual(body, english[`story${number}Body`], `${locale}: untranslated story chapter ${number}`);
    }
    assert.equal(new Set(titles).size, 6, `${locale}: repeated story titles`);
    assert.equal(new Set(bodies).size, 6, `${locale}: repeated story prose`);
    for (const name of ['Rrenner', 'Êmer', 'Tarik', 'Winholm']) assert.ok(!bodies.join(' ').includes(name), `${locale}: obsolete story name ${name}`);
  }
});

test('journey starts in 2020 and keeps learning separate from project descriptions', () => {
  for (const locale of locales) {
    const html = read(pageName(locale));
    const dictionary = JSON.parse(read(`src/${locale}.json`));
    const journey = html.match(/<section\b[^>]*id="journey"[\s\S]*?<\/section>/)?.[0];
    assert.ok(journey, `${locale}: journey missing`);
    assert.match(journey, /class="journey-year">2020</);
    for (const key of ['originTitle', 'originBody', 'learningTitle', 'learningBody', 'ipbBody']) {
      assert.ok(journey.includes(htmlEscape(dictionary[key])), `${locale}: missing ${key}`);
    }
    assert.ok(!journey.includes(htmlEscape(dictionary.p7Desc)), `${locale}: project description reused as biography`);
    assert.doesNotMatch(html, /(?:src|data-image)="[^\"]*roots\.(?:jpg|png|webp)"|class="myth-note"/i);
    assert.ok(!html.includes(htmlEscape(dictionary.aboutBody3)), `${locale}: removed mythology paragraph returned`);
  }
});

test('image enlargement and animated previews use existing local files', () => {
  for (const locale of locales) {
    const html = read(pageName(locale));
    const previews = [...html.matchAll(/<div\b[^>]*data-zoom-image="([^\"]+)"[\s\S]*?<\/div>/g)];
    assert.ok(previews.length >= 5, `${locale}: real project previews missing`);
    for (const [markup, image] of previews) {
      assert.ok(attributes(markup, 'src').includes(image), `${locale}: preview does not match full image`);
      assert.ok(attributes(markup, 'data-image').includes(image), `${locale}: no enlarge action for ${image}`);
      assert.match(markup, /<button\b[^>]*aria-label="[^\"]+"/, `${locale}: image control lacks a name`);
    }
    for (const attribute of ['data-image', 'data-zoom-image', 'data-still-src', 'data-motion-src']) {
      for (const file of attributes(html, attribute)) {
        assert.ok(file.startsWith('assets/'), `${locale}: nonlocal ${attribute}`);
        const absolute = path.resolve(root, file);
        assert.ok(absolute.startsWith(root + path.sep), `${locale}: image escapes root`);
        assert.ok(fs.existsSync(absolute) && fs.statSync(absolute).isFile(), `${locale}: missing ${attribute} ${file}`);
      }
    }
    for (const tag of html.match(/<img\b[^>]*data-motion-src[^>]*>/g) ?? []) {
      assert.equal(attributes(tag, 'data-still-src').length, 1, 'animated image has no reduced-motion alternative');
    }
  }
});

test('rune inscription and keyboard-operable experience controls are preserved', () => {
  const inscription = 'ᚦᛖ ᛟᛚᛞ ᚹᚨᛁᛊ ᚨᚱᛖ ᚦᛖ ᛟᚾᛚᛁ ᛈᚨᚦ ᛏᛟ ᚠᚱᛖᛖᛞᛟᛗ';
  for (const locale of locales) {
    const html = read(pageName(locale));
    assert.ok(html.includes(inscription), `${locale}: rune inscription changed`);
    for (const id of ['journey-prev', 'journey-next', 'physics-reset', 'physics-pause']) {
      const tag = html.match(new RegExp(`<button\\b[^>]*id="${id}"[^>]*>`))?.[0];
      assert.ok(tag, `${locale}: ${id} is not a native button`);
      assert.ok(attributes(tag, 'aria-label')[0]?.trim(), `${locale}: ${id} lacks an accessible name`);
    }
    assert.match(html, /<button\b[^>]*id="physics-kick"[^>]*>[^<]+<\/button>/);
    assert.match(html, /<button\b[^>]*id="physics-pause"[^>]*aria-pressed="false"/);
    const imageDialog = html.match(/<dialog\b[^>]*id="image-dialog"[\s\S]*?<\/dialog>/)?.[0];
    assert.ok(imageDialog, `${locale}: image viewer dialog missing`);
    assert.ok(attributes(imageDialog, 'aria-labelledby').length || attributes(imageDialog, 'aria-label').length, `${locale}: image viewer has no name`);
    assert.match(imageDialog, /<button\b[^>]*data-close[^>]*aria-label="[^\"]+"/);
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

test('motion starts enabled and respects explicit reduction', () => {
  for (const [system, choice, expected] of [[true, undefined, false], [false, undefined, false], [true, false, false], [false, true, true]]) {
    const classes = new Set();
    const document = {documentElement:{style:{}, classList:{add:x=>classes.add(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)}}};
    vm.runInNewContext(read('assets/preferences.js'), {document,localStorage:{getItem:()=>JSON.stringify(choice===undefined?{}:{motion:choice})},matchMedia:()=>({matches:system})});
    assert.equal(classes.has('reduce-motion'), expected);
    assert.equal(classes.has('allow-motion'), choice!==true);
  }
});


test('lunar finale follows the tale and precedes contact in every language', () => {
  for (const locale of locales) {
    const html=read(pageName(locale)), t=JSON.parse(read(`src/${locale}.json`));
    assert.ok(html.indexOf('id="story-6"') < html.indexOf('id="moon-stage"'));
    assert.ok(html.indexOf('id="moon-stage"') < html.indexOf('id="contact"'));
    for (const id of ['moon-large','moon-small','gravity-mode','gravity-force','physics-scatter','sound-toggle','sound-volume']) assert.ok(html.includes(`id="${id}"`));
    assert.match(html, /id="sound-toggle" aria-pressed="false"/);
    for(const key of ['moonNew','moonWaxCrescent','moonFirstQuarter','moonWaxGibbous','moonFull','moonWanGibbous','moonLastQuarter','moonWanCrescent']) assert.ok(t[key]?.length);
    for(let i=1;i<=6;i++) assert.ok(t[`story${i}Body`].split(/\s+/).length>=60, `${locale}: story ${i} is too short`);
    assert.ok(html.includes('href="#story-1"'));
    assert.ok(html.includes('class="moon-connector"'));
  }
});
