/* Three scroll chapters use native sticky positioning, including on touch screens. */
(() => {
  const root=document.documentElement, $=s=>document.querySelector(s);
  const intro=$('#intro-stage'), hero=$('#home'), tree=$('.tree-world'), moons=$('#moon-stage');
  const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  const messages=JSON.parse($('#messages').textContent);
  const phases=['moonNew','moonWaxCrescent','moonFirstQuarter','moonWaxGibbous','moonFull','moonWanGibbous','moonLastQuarter','moonWanCrescent'];
  let introTop=0,introTravel=1,moonTop=0,moonTravel=1,dx=0,dy=0,frame=0,lastPhase=-1,layoutTimer;
  let active=false;
  // Procedural stone textures are generated once, then lit by a moving sun vector.
  function sphere(canvas,seed,tint){
    const ctx=canvas.getContext('2d'),size=canvas.width,data=ctx.createImageData(size,size),surface=[];
    let n=seed;const rand=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296};
    const craters=Array.from({length:32},()=>({x:rand()*1.8-.9,y:rand()*1.8-.9,r:.025+rand()*.14}));
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const nx=(x+.5)/size*2-1,ny=(y+.5)/size*2-1,r=nx*nx+ny*ny;
      if(r>1){surface.push(null);continue;}
      let texture=.73+rand()*.15+Math.sin(nx*16+ny*9)*.035;
      for(const c of craters){const d=Math.hypot(nx-c.x,ny-c.y)/c.r;if(d<1.2)texture+=d<.8?-.11:(1.2-d)*.32;}
      surface.push({x:nx,y:ny,z:Math.sqrt(1-r),texture});
    }
    return phase=>{
      const angle=phase*Math.PI*2-Math.PI,sx=-Math.sin(angle),sz=Math.cos(angle);
      surface.forEach((p,i)=>{if(!p)return;const light=Math.max(0,p.x*sx+p.z*sz);const shade=.035+Math.pow(light,.65)*.965;const v=255*shade*p.texture;
        data.data[i*4]=v*tint[0];data.data[i*4+1]=v*tint[1];data.data[i*4+2]=v*tint[2];data.data[i*4+3]=255;
      });ctx.putImageData(data,0,0);
    };
  }
  const drawLarge=sphere($('#moon-large'),1337,[1,.88,.64]),drawSmall=sphere($('#moon-small'),872,[.75,.88,1]);
  function layout(){
    const reduced=root.classList.contains('reduce-motion');
    active=!reduced&&parseFloat(getComputedStyle(root).fontSize)<=18&&innerHeight>=500;
    root.classList.toggle('cinematic',active);
    tree.style.removeProperty('translate');tree.style.removeProperty('scale');
    const hr=hero.getBoundingClientRect(),tr=tree.getBoundingClientRect();
    dx=hr.left+hr.width/2-(tr.left+tr.width/2);dy=hr.height/2-(tr.top-hr.top+tr.height/2);
    introTop=intro.getBoundingClientRect().top+scrollY;
    introTravel=Math.max(1,intro.offsetHeight-hero.offsetHeight);
    moonTop=moons.getBoundingClientRect().top+scrollY;
    moonTravel=Math.max(1,moons.offsetHeight-$('.moon-sticky').offsetHeight);
    lastPhase=-1;update();
  }
  function update(){
    frame=0;
    const p=active?clamp((scrollY-introTop)/introTravel):0;
    intro.dataset.progress=p.toFixed(4);
    const centered=smooth(p/.32),zoom=smooth((p-.28)/.36);
    tree.style.translate=`${dx*centered}px ${dy*centered}px`;
    tree.style.scale=String(1+zoom*17);
    hero.style.setProperty('--intro-copy',1-smooth(p/.2));
    $('.hero-copy').inert=p>.2;$('.tree-links').inert=p>.2;
    hero.style.setProperty('--intro-dark',smooth((p-.58)/.13));
    const spark=smooth((p-.76)/.23);
    hero.style.setProperty('--spark-opacity',p>.73?1:0);
    hero.style.setProperty('--spark-scale',String(1+Math.pow(spark,3)*Math.max(innerWidth,innerHeight)/3));
    hero.style.setProperty('--spark-glow',String(1-smooth((p-.94)/.06)));
    hero.dataset.zoom=(1+zoom*17).toFixed(2);
    const m=active?clamp((scrollY-moonTop)/moonTravel):.44;
    moons.dataset.progress=m.toFixed(4);
    const cycle=clamp(m/.78),index=cycle>=1?0:Math.min(7,Math.floor(cycle*8));
    const quantized=Math.round(cycle*180);
    if(quantized!==lastPhase){drawLarge(cycle);drawSmall(cycle);lastPhase=quantized;}
    $('#moon-phase-name').textContent=messages[phases[index]];
    [...$('.phase-dots').children].forEach((dot,i)=>dot.classList.toggle('current',i===index));
    moons.dataset.phase=phases[index];
    moons.style.setProperty('--moon-zoom',1+smooth((m-.8)/.16)*22);
    moons.style.setProperty('--moon-dark',smooth((m-.9)/.09));
    moons.style.setProperty('--moon-copy',1-smooth((m-.78)/.08));
    // Continue the main thread over this opaque scene, ending exactly at the moon.
    const sr=$('.moon-sticky').getBoundingClientRect(),lr=$('#moon-large').getBoundingClientRect();
    const ex=lr.left+lr.width/2-sr.left,ey=lr.top+lr.height/2-sr.top;
    const connector=$('.moon-connector'),path=connector.querySelector('path');
    connector.setAttribute('viewBox',`0 0 ${sr.width} ${sr.height}`);
    const turn=Math.min(ey-20,$('.moon-heading').getBoundingClientRect().bottom-sr.top+24);
    path.setAttribute('d',`M 20 0 L 20 ${turn} C 20 ${ey}, ${ex} ${turn}, ${ex} ${ey}`);
    const length=path.getTotalLength(),reveal=active?clamp((innerHeight-sr.top)/(innerHeight*.7)):1;
    path.style.strokeDasharray=length;path.style.strokeDashoffset=length*(1-reveal);
    connector.style.opacity=1-smooth((m-.75)/.1);
    moons.dataset.tipX=ex+sr.left;moons.dataset.tipY=ey+sr.top;
    // The line terminates at the great moon; its moving endpoint stirs the rain.
    const contact=$('#contact').getBoundingClientRect();
    $('#contact').style.setProperty('--contact-reveal',active?clamp((innerHeight-contact.top)/(innerHeight*.6)):1);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update)}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',()=>{clearTimeout(layoutTimer);layoutTimer=setTimeout(layout,160)},{passive:true});
  window.addEventListener('preferenceschange',layout);
  window.addEventListener('load',layout);
  new ResizeObserver(()=>{clearTimeout(layoutTimer);layoutTimer=setTimeout(layout,160)}).observe($('#main'));
  layout();
})();
