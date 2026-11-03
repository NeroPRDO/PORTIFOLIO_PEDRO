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
for(const [locale,short] of languages){
 const t=JSON.parse(read(`src/${locale}.json`));
 if(Object.keys(en).some(k=>typeof t[k]!=='string'||!t[k].trim())||Object.keys(t).some(k=>!(k in en)))throw Error(`Invalid dictionary: ${locale}`);
 const tags=items=>`<ul class="tags">${items.map(v=>`<li>${escape(v)}</li>`).join('')}</ul>`;
 const projectHtml=projects.map((p,i)=>{
  const visual=p.image?`<div class="project-visual ${p.style}" aria-hidden="true"><div class="browser-dots"><i></i><i></i><i></i><span>${p.live.replace('https://','')}</span></div><img src="${p.image}" width="1200" height="800" loading="lazy" alt=""></div>`:p.id===2?`<div class="project-visual banking" aria-hidden="true"><span class="visual-kicker">BANTADS / SYSTEM ARCHITECTURE</span><div class="architecture"><span>Angular</span><b>↓</b><span>API Gateway</span><b>↓</b><div><span>Spring</span><span>RabbitMQ</span><span>SQL / NoSQL</span></div></div><span class="visual-orbit"></span></div>`:p.id===3?`<div class="project-visual expenses" aria-hidden="true"><span class="expense-symbol">÷</span><div class="expense-lines"><span>REACT NATIVE</span><strong>Divisão<br>de Despesas<span>.</span></strong><small>EXPO + SUPABASE</small></div></div>`:'';
  return `<article class="project ${i<4?'project-featured':'project-row'}" data-category="${p.category}" id="project-${p.id}">${visual}<div class="project-heading"><span class="project-index">${String(i+1).padStart(2,'0')}</span><div><p class="project-type">${escape(t[`p${p.id}Type`])}</p><h3>${escape(p.name)}</h3></div><span class="project-year">${p.year}</span></div><p class="project-description">${escape(t[`p${p.id}Desc`])}</p>${tags(p.tags)}<div class="project-links">${p.live?`<a href="${p.live}" target="_blank" rel="noopener noreferrer" aria-label="${escape(t.live)}: ${escape(p.name)}">${escape(t.live)} ↗</a>`:''}<a href="https://github.com/NeroPRDO/${p.repo}" target="_blank" rel="noopener noreferrer" aria-label="${escape(t.source)}: ${escape(p.name)}">${escape(t.source)} ↗</a>${p.editor?`<a href="${p.editor}" target="_blank" rel="noopener noreferrer">${escape(t.editor)} ↗</a>`:''}</div></article>`;
 }).join('\n');
 const values={...Object.fromEntries(Object.entries(t).map(([k,v])=>[k,escape(v)])),locale,languageShort:short,canonical:base+filename(locale),projects:projectHtml,
  skillsCards:technologies.map((list,i)=>`<article class="skill-card"><span class="skill-number" aria-hidden="true">0${i+1}</span><h3>${escape(t[`s${i+1}`])}</h3><p>${escape(t[`s${i+1}Body`])}</p>${tags(list)}</article>`).join(''),
  languageLinks:languages.map(([code,,name])=>`<a href="${filename(code)}" lang="${code}" hreflang="${code}" ${code===locale?'aria-current="page"':''}>${name}</a>`).join(''),
  alternates:languages.map(([code])=>`<link rel="alternate" hreflang="${code}" href="${base+filename(code)}">`).join('\n')+`\n<link rel="alternate" hreflang="x-default" href="${base}">`,
  messages:JSON.stringify({projectCount:t.projectCount,copied:t.copied,copyError:t.copyError,analyticsSaved:t.analyticsSaved}).replaceAll('<','\\u003c'),
  structuredData:JSON.stringify({'@context':'https://schema.org','@type':'Person',name:'Pedro Eduardo Dall’Agnol',url:base,jobTitle:t.heroRole,image:base+'images/profile/Header_01.jpg',email:'mailto:pedro.dallagnol.nr515@gmail.com',sameAs:['https://github.com/NeroPRDO','https://www.linkedin.com/in/pedro-dall-agnol-3378a1365/'],address:{'@type':'PostalAddress',addressLocality:'Bragança',addressCountry:'PT'}})
 };
 const html=template.replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(!(key in values))throw Error(`Missing template value: ${key}`);return values[key];});
 fs.writeFileSync(path.join(root,filename(locale)),html);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+languages.map(([code])=>`<url><loc>${base+filename(code)}</loc></url>`).join('')+'</urlset>\n');
console.log(`Built ${languages.length} complete language pages with ${projects.length} projects each.`);
