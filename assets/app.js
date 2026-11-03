const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const messages=JSON.parse($('#messages').textContent);
const root=document.documentElement;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let prefs=read('pd-preferences',{});
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500)}
function applyPreferences(){
 const size=[100,125,150].includes(prefs.size)?prefs.size:100;
 root.style.fontSize=size+'%';root.classList.toggle('large-text',size>100);
 root.classList.toggle('high-contrast',prefs.contrast===true);
 root.classList.toggle('reduce-motion',prefs.motion===true||motionQuery.matches);
 $(`input[name="text-size"][value="${size}"]`).checked=true;
 $('#motion').checked=prefs.motion===true||motionQuery.matches;
 $('#motion').disabled=motionQuery.matches;
 $('#contrast').checked=prefs.contrast===true;
 window.dispatchEvent(new Event('preferenceschange'));
}
$$('input[name="text-size"]').forEach(input=>input.addEventListener('change',()=>{prefs.size=Number(input.value);write('pd-preferences',prefs);applyPreferences()}));
$('#motion').addEventListener('change',e=>{prefs.motion=e.target.checked;write('pd-preferences',prefs);applyPreferences()});
$('#contrast').addEventListener('change',e=>{prefs.contrast=e.target.checked;write('pd-preferences',prefs);applyPreferences()});
$('#reset-preferences').addEventListener('click',()=>{prefs={};write('pd-preferences',prefs);applyPreferences()});
motionQuery.addEventListener('change',applyPreferences);
applyPreferences();
let dialogTrigger;
$$('[data-open]').forEach(button=>button.addEventListener('click',()=>{dialogTrigger=button;document.getElementById(button.dataset.open).showModal()}));
$$('dialog').forEach(dialog=>{
 dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>dialogTrigger?.focus({preventScroll:true}));
});
$$('#menu-dialog a').forEach(a=>a.addEventListener('click',()=>{$('#menu-dialog').close();requestAnimationFrame(()=>{const target=$(a.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true})})}));
document.addEventListener('click',e=>{if(!e.target.closest('.language-picker'))$('.language-picker').open=false});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('.language-picker').open){$('.language-picker').open=false;$('.language-picker summary').focus()}});
$$('.language-options a').forEach(a=>a.addEventListener('click',()=>{write('pd-language',a.lang);a.href=a.href.split('#')[0]+location.hash}));
// A remembered language is used only on the English entry page, never on explicit translations.
const language=read('pd-language',null),supported=['en','pt-BR','pt-PT','fr','es','de','pl','it','kea-CV'];
if(root.lang==='en'&&language&&language!=='en'&&supported.includes(language)&&!location.search.includes('lang=en')){
 // The explicit English language link clears this preference before navigation.
 location.replace(new URL(language+'.html'+location.hash,location.href).href);
}
$$('.language-options a[lang="en"]').forEach(a=>a.addEventListener('click',()=>write('pd-language','en')));
function projectCount(n){
 const singular={en:'project','pt-BR':'projeto','pt-PT':'projeto',fr:'projet',es:'proyecto',de:'Projekt',pl:'projekt',it:'progetto','kea-CV':'projetu'};
 if(n===1)return `${n} ${singular[root.lang]||messages.projectCount}`;
 if(root.lang==='pl')return `${n} ${new Intl.PluralRules('pl').select(n)==='few'?'projekty':'projektów'}`;
 return `${n} ${messages.projectCount}`;
}
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;
 $$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 let count=0;
 $$('.project').forEach(p=>{p.hidden=filter!=='all'&&p.dataset.category!==filter;if(!p.hidden){count++;p.classList.add('visible')}});
 $('#project-count').textContent=projectCount(count);
}));
$$('a[href^="#project-"]').forEach(a=>a.addEventListener('click',()=>{
 $$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));
 $$('.project').forEach(p=>{p.hidden=false;p.classList.add('visible')});
 $('#project-count').textContent=projectCount($$('.project').length);
}));
$('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('pedro.dallagnol.nr515@gmail.com');toast(messages.copied)}catch{toast(messages.copyError)}});
// Preserve the original GA4 property. No Google requests until a visitor opts in.
const measurementId='G-XWFKEVEDM5';
let analyticsLoaded=false;
function enableAnalytics(){
 window['ga-disable-'+measurementId]=false;
 if(analyticsLoaded)return;
 analyticsLoaded=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments)};
 window.gtag('js',new Date());
 window.gtag('config',measurementId,{anonymize_ip:true});
 const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+measurementId;document.head.append(script);
}
function disableAnalytics(){
 window['ga-disable-'+measurementId]=true;
 const domains=[location.hostname,'.'+location.hostname];
 document.cookie.split(';').map(c=>c.trim().split('=')[0]).filter(n=>n==='_ga'||n.startsWith('_ga_')).forEach(name=>{
  document.cookie=`${name}=; Max-Age=0; path=/`;
  domains.forEach(domain=>document.cookie=`${name}=; Max-Age=0; path=/; domain=${domain}`);
 });
}
if(read('pd-analytics',false)===true)enableAnalytics();
function saveConsent(allowed){write('pd-analytics',allowed);allowed?enableAnalytics():disableAnalytics();$('#privacy-dialog').close();$('#consent-banner').hidden=true;toast(messages.analyticsSaved)}
$('#analytics-accept').addEventListener('click',()=>saveConsent(true));
$('#analytics-reject').addEventListener('click',()=>saveConsent(false));
$$('[data-consent]').forEach(b=>b.addEventListener('click',()=>saveConsent(b.dataset.consent==='yes')));
if(read('pd-analytics',null)===null)$('#consent-banner').hidden=false;
// Reveal adds motion only to content below the initial viewport. Content remains readable without JS.
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});
 $$('.project,.skill-card,.timeline-entry,.about-copy,.section-intro').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal');observer.observe(el)}});
}
let scrollPending=false;
function updateScroll(){const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;scrollPending=false}
window.addEventListener('scroll',()=>{if(!scrollPending){requestAnimationFrame(updateScroll);scrollPending=true}},{passive:true});updateScroll();
// The interactive canopy uses a small, capped canvas. It pauses offscreen, in background tabs,
// and whenever the visitor or operating system requests reduced motion.
const canvas=$('#tree-particles'),ctx=canvas.getContext('2d'),world=$('.tree-world');
let width=0,height=0,visible=true,frame=0,last=0,particles=[];
let pointer={x:-1000,y:-1000};
function resizeCanvas(){const r=world.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx?.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:36},(_,i)=>({x:((i*137.5)%360)/360*width,y:((i*71)%100)/100*height,r:1+(i%3)*.35,speed:.08+(i%4)*.035,phase:i*.7}))}
function canAnimate(){return ctx&&visible&&!document.hidden&&!root.classList.contains('reduce-motion')}
function draw(now){frame=0;if(!canAnimate())return;const dt=Math.min(now-last||16,40);last=now;ctx.clearRect(0,0,width,height);for(const p of particles){p.y-=p.speed*dt/16;if(p.y<0)p.y=height;const x=p.x+Math.sin(now/3500+p.phase)*7;const distance=Math.hypot(x-pointer.x,p.y-pointer.y);ctx.globalAlpha=distance<100?.85:.22+Math.sin(now/1700+p.phase)*.15;ctx.fillStyle='#f6ce82';ctx.beginPath();ctx.arc(x,p.y,p.r,0,Math.PI*2);ctx.fill();if(distance<100){ctx.globalAlpha=(1-distance/100)*.2;ctx.strokeStyle='#f6ce82';ctx.beginPath();ctx.moveTo(x,p.y);ctx.lineTo(pointer.x,pointer.y);ctx.stroke()}}ctx.globalAlpha=1;frame=requestAnimationFrame(draw)}
function syncAnimation(){if(frame){cancelAnimationFrame(frame);frame=0}if(canAnimate())frame=requestAnimationFrame(draw);else{ctx?.clearRect(0,0,width,height);world.style.setProperty('--tree-x','0px');world.style.setProperty('--tree-y','0px')}}
if(ctx){resizeCanvas();new ResizeObserver(()=>{resizeCanvas();syncAnimation()}).observe(world);if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncAnimation()}).observe(world);world.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!canAnimate())return;const r=world.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};world.style.setProperty('--tree-x',((pointer.x/width-.5)*8)+'px');world.style.setProperty('--tree-y',((pointer.y/height-.5)*8)+'px')});world.addEventListener('pointerleave',()=>{pointer={x:-1000,y:-1000};world.style.setProperty('--tree-x','0px');world.style.setProperty('--tree-y','0px')});document.addEventListener('visibilitychange',syncAnimation);window.addEventListener('preferenceschange',syncAnimation);syncAnimation()}
