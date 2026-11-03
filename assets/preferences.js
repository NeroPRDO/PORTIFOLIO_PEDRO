// Apply saved accessibility choices before the first paint; no network requests.
document.documentElement.classList.add('js');
try {
 const p=JSON.parse(localStorage.getItem('pd-preferences')||'{}');
 if([100,125,150].includes(p.size)){document.documentElement.style.fontSize=p.size+'%';document.documentElement.classList.toggle('large-text',p.size>100);}
 document.documentElement.classList.toggle('high-contrast',p.contrast===true);
 document.documentElement.classList.toggle('reduce-motion',p.motion===true||matchMedia('(prefers-reduced-motion: reduce)').matches);
}catch{}
