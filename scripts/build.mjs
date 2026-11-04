import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const languages=[['en','EN','English'],['pt-BR','PT-BR','Português · Brasil'],['pt-PT','PT','Português · Portugal'],['fr','FR','Français'],['es','ES','Español'],['de','DE','Deutsch'],['pl','PL','Polski'],['it','IT','Italiano'],['kea-CV','KEA','Kriolu · Santiago']];
const base='https://neroprdo.github.io/PORTIFOLIO_PEDRO/';
const filename=locale=>locale==='en'?'index.html':`${locale}.html`;
const projects=JSON.parse(read('src/projects.json'));
const template=read('src/template.html');
const en=JSON.parse(read('src/en.json'));
const technologies=[['HTML','CSS','JavaScript','TypeScript','React','Angular','Bootstrap'],['C / C++','C#','Java','Python','Pascal'],['MySQL','PostgreSQL','MongoDB','Oracle SQL','SQL'],['Unix / Linux','Cisco Packet Tracer','GNS3','Wireshark','VirtualBox'],['UML','Figma','Balsamiq','Lucidchart','Bizagi','Microsoft Visio'],['Git / GitHub','Scrum','Canva']];
const marks=['hearth','honey','sisters','dragon','lance','phases'];
for(const [locale,short] of languages){
 const t=JSON.parse(read(`src/${locale}.json`));
 if(Object.keys(en).some(k=>typeof t[k]!=='string'||!t[k].trim())||Object.keys(t).some(k=>!(k in en)))throw Error(`Invalid dictionary: ${locale}`);
 const tags=items=>`<ul class="tags">${items.map(v=>`<li>${escape(v)}</li>`).join('')}</ul>`;
 const story=n=>`<aside class="story-chapter story-${n}" id="story-${n}" aria-labelledby="story-title-${n}"><div class="story-copy"><p class="eyebrow">${escape(t.storyLabel)}</p><span class="story-number" aria-hidden="true">0${n} / 06</span><h2 id="story-title-${n}">${escape(t[`story${n}Title`])}</h2><p class="story-prose">${escape(t[`story${n}Body`])}</p>${n===1?`<a class="story-follow" href="#story-2">${escape(t.storyFollow)} ↓</a>`:''}</div><span class="thread-anchor" aria-hidden="true"></span><div class="story-illustration" aria-hidden="true"><div class="story-orbit"></div><svg viewBox="0 0 300 300"><use href="assets/story-marks.svg#${marks[n-1]}"/></svg><span class="story-star star-a">✧</span><span class="story-star star-b">✦</span></div></aside>`;
 const projectHtml=projects.map((p,i)=>{
  const screenshot=p.image?`<div class="project-visual ${p.style}" data-zoom-image="${p.image}"><img src="${p.image}" ${p.motionImage?`data-motion-src="${p.motionImage}" data-still-src="${p.image}"`:''} width="${p.id===8?579:1200}" height="${p.id===8?669:800}" loading="lazy" alt="${escape(p.name)}"><button class="image-expand js-only" data-image="${p.image}" data-image-name="${escape(p.name)}" aria-label="${escape(t.viewImage)}: ${escape(p.name)}">↗</button></div>`:p.id===3?`<div class="project-visual expenses" aria-hidden="true"><span class="expense-symbol">÷</span><div class="expense-lines"><span>REACT NATIVE</span><strong>Divisão<br>de Despesas<span>.</span></strong><small>EXPO + SUPABASE</small></div></div>`:`<div class="project-visual maintenance" aria-hidden="true"><span class="maintenance-orbit"></span><span class="maintenance-symbol">⌘</span><div><small>ANGULAR + SPRING</small><strong>API<br>REST<span>↗</span></strong></div></div>`;
  const html=`<article class="project project-featured" data-category="${p.category}" id="project-${p.id}">${screenshot}<div class="project-heading"><span class="project-index">${String(i+1).padStart(2,'0')}</span><div><p class="project-type">${escape(t[`p${p.id}Type`])}</p><h3>${escape(p.name)}</h3></div><span class="project-year">${p.year}</span></div><p class="project-description">${escape(t[`p${p.id}Desc`])}</p>${tags(p.tags)}<div class="project-links">${p.live?`<a href="${p.live}" target="_blank" rel="noopener noreferrer" aria-label="${escape(t.live)}: ${escape(p.name)}">${escape(t.live)} ↗</a>`:''}<a href="https://github.com/NeroPRDO/${p.repo}" target="_blank" rel="noopener noreferrer" aria-label="${escape(t.source)}: ${escape(p.name)}">${escape(t.source)} ↗</a>${p.editor?`<a href="${p.editor}" target="_blank" rel="noopener noreferrer">${escape(t.editor)} ↗</a>`:''}</div></article>`;
  return html+(i===3?story(2):'');
 }).join('\n');
 const values={...Object.fromEntries(Object.entries(t).map(([k,v])=>[k,escape(v)])),locale,languageShort:short,canonical:base+filename(locale),projects:projectHtml,projectTotal:projects.length,
  ...Object.fromEntries([1,3,4,5,6].map(n=>['story'+n,story(n)])),
  skillsCards:technologies.map((list,i)=>`<article class="skill-card"><span class="skill-number" aria-hidden="true">0${i+1}</span><h3>${escape(t[`s${i+1}`])}</h3><p>${escape(t[`s${i+1}Body`])}</p>${tags(list)}</article>`).join(''),
  languageLinks:languages.map(([code,,name])=>`<a href="${filename(code)}" lang="${code}" hreflang="${code}" ${code===locale?'aria-current="page"':''}>${name}</a>`).join(''),
  alternates:languages.map(([code])=>`<link rel="alternate" hreflang="${code}" href="${base+filename(code)}">`).join('\n')+`\n<link rel="alternate" hreflang="x-default" href="${base}">`,
  messages:JSON.stringify(Object.fromEntries(['projectCount','copied','copyError','analyticsSaved','physicsPause','physicsResume','viewImage'].map(k=>[k,t[k]]))).replaceAll('<','\\u003c'),
  structuredData:JSON.stringify({'@context':'https://schema.org','@type':'Person',name:'Pedro Eduardo Dall’Agnol',url:base,jobTitle:t.heroRole,image:base+'assets/portrait.jpeg',email:'mailto:pedro.dallagnol.nr515@gmail.com',sameAs:['https://github.com/NeroPRDO','https://www.linkedin.com/in/pedro-dall-agnol-3378a1365/'],address:{'@type':'PostalAddress',addressLocality:'Bragança',addressCountry:'PT'}})
 };
 const html=template.replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(!(key in values))throw Error(`Missing template value: ${key}`);return values[key];});
 fs.writeFileSync(path.join(root,filename(locale)),html);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+languages.map(([code])=>`<url><loc>${base+filename(code)}</loc></url>`).join('')+'</urlset>\n');
console.log(`Built ${languages.length} language pages, ${projects.length} projects and six story chapters.`);
