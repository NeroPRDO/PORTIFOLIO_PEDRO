/* Scroll is always native. This layer observes it; it never cancels wheel/touch scrolling. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const root = document.documentElement;
  const clamp = (n, lo=0, hi=1) => Math.min(hi, Math.max(lo,n));
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => root.classList.contains('reduce-motion');
  const messages = JSON.parse($('#messages').textContent);
  const main = $('#main'), hero = $('#home'), world = $('.tree-world');
  const chapters = $$('.story-chapter');
  const thread = $('#story-thread'), guide = $('.thread-guide'), light = $('.thread-light'), head = $('.thread-head');
  const aura = $('#cursor-aura');
  const field = $('#ether-field'), fieldContext = field.getContext('2d');
  const portrait = $('.portrait-frame');
  const images = $$('.project-visual>img');
  let width=innerWidth, height=innerHeight, mainTop=0, pathLength=0;
  let frame=0, lastFrame=0, lastScroll=scrollY, velocity=0, dirty=true;
  let pointer={x:-1000,y:-1000}, auraPoint={x:-1000,y:-1000};
  let rain=[],trail=[], sparks=[], pointerActive=false, storyPositions=[];
  let journeyStart=0, journeyTravel=0, journeyProgress=0, journeyOffset=100;
  let resizeTimer;
  const journey=$('#journey'), stage=$('.journey-stage'), track=$('.journey-track'), windowEl=$('.journey-window');
  const journeyCards=$$('.journey-card');
  const prev=$('#journey-prev'), next=$('#journey-next');
  const physicsCanvas=$('#physics-canvas'), physicsContext=physicsCanvas.getContext('2d'), physicsStage=$('#physics-stage');
  let engine, bodies=[], physicsWidth=0, physicsHeight=0, physicsVisible=false, physicsPaused=false, physicsAccumulator=0;
  let grabbed=null, dragPoint=null, lastDrag=null;
  const labels=['HTML','CSS','JavaScript','SQL','React','Python','Git','Java'];
  const colors=['#e9c47e','#89d7c8','#b5a5df','#d3c9aa'];

  function setupCanvas(canvas, context, w, h) {
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    context?.setTransform(dpr,0,0,dpr,0,0);
  }

  function layoutJourney() {
    journey.classList.remove('journey-horizontal');
    journeyTravel=0;
    const headerHeight=$('.site-header').getBoundingClientRect().height;
    root.style.setProperty('--header-height',headerHeight+'px');
    journeyOffset=headerHeight+16;
    if (width>=300 && !reduced() && parseFloat(getComputedStyle(root).fontSize)<=18 && height>=560) {
      journey.classList.add('journey-horizontal');
      const cardHeight=Math.max(...journeyCards.map(card=>card.getBoundingClientRect().height));
      const viewport=cardHeight+95;
      if (viewport>height-journeyOffset-12) {
        journey.classList.remove('journey-horizontal');
      } else {
        journeyTravel=Math.max(0,track.scrollWidth-windowEl.clientWidth);
        stage.style.setProperty('--journey-travel',journeyTravel+'px');
        stage.style.setProperty('--journey-viewport',viewport+'px');
      }
    }
    journeyStart=stage.getBoundingClientRect().top+scrollY-journeyOffset;
  }

  function layoutThread() {
    mainTop=main.getBoundingClientRect().top+scrollY;
    const totalHeight=main.offsetHeight;
    thread.setAttribute('viewBox',`0 0 ${main.clientWidth} ${totalHeight}`);
    const narrow=width<760;
    const edge=Math.max(12,Math.min(28,width*.025));
    let d='',previous=null;
    storyPositions=chapters.map((chapter,i)=>{
      const r=chapter.getBoundingClientRect();
      const a=chapter.querySelector('.thread-anchor').getBoundingClientRect();
      const x=a.left+a.width/2, y=a.top+a.height/2+scrollY-mainTop;
      const top=r.top+scrollY-mainTop, bottom=top+r.height;
      const incoming=narrow?edge:(i%2?main.clientWidth-edge:edge);
      const outgoing=narrow?edge:(i%2?edge:main.clientWidth-edge);
      if (!previous) d=`M ${incoming} ${Math.max(0,top-100)}`;
      else d+=` C ${previous.x} ${previous.y+80}, ${incoming} ${top-80}, ${incoming} ${top+15}`;
      d+=` C ${incoming} ${top+55}, ${x} ${y-65}, ${x} ${y}`;
      d+=` C ${x} ${y+65}, ${outgoing} ${bottom-60}, ${outgoing} ${bottom-15}`;
      previous={x:outgoing,y:bottom-15};
      return {top:top+mainTop,bottom:bottom+mainTop,center:y+mainTop,element:chapter};
    });
    const mr=$('#moon-stage').getBoundingClientRect();
    const endY=mr.top+scrollY-mainTop+Math.min(height*.55,450);
    const endX=main.clientWidth*.4;
    d+=` C ${previous.x} ${previous.y+80}, ${endX} ${endY-100}, ${endX} ${endY}`;
    guide.setAttribute('d',d); light.setAttribute('d',d);
    pathLength=light.getTotalLength();
    light.style.strokeDasharray=pathLength;
    updateThread();
  }

  function updateThread() {
    if (!pathLength) return;
    if (reduced()) {light.style.strokeDashoffset=0;return;}
    const target=scrollY+height*.64-mainTop;
    let low=0,high=pathLength;
    // Every segment progresses downward; find the illuminated length at the reader's position.
    for(let i=0;i<17;i++){const mid=(low+high)/2;light.getPointAtLength(mid).y<target?low=mid:high=mid;}
    const length=(low+high)/2;
    light.style.strokeDashoffset=pathLength-length;
    const point=light.getPointAtLength(length);
    head.setAttribute('cx',point.x);head.setAttribute('cy',point.y);
    thread.dataset.progress=(length/pathLength).toFixed(4);
    thread.dataset.tipX=point.x;thread.dataset.tipY=point.y+mainTop-scrollY;
  }

  function updateScrollScenes() {
    const motion=!reduced();
    const y=scrollY;
    const heroRect=hero.getBoundingClientRect();
    const heroProgress=clamp(-heroRect.top/Math.max(heroRect.height,1));
    world.style.setProperty('--hero-scale',motion&&!root.classList.contains('cinematic')?(1+heroProgress*.34).toFixed(3):'1');
    world.style.setProperty('--hero-progress',motion?heroProgress:'0');
    if(!root.classList.contains('cinematic'))hero.dataset.zoom=motion?(1+heroProgress*.7).toFixed(3):'1';
    storyPositions.forEach(({top,bottom,center,element})=>{
      const p=clamp((y+height-top)/(height+bottom-top));
      const near=Math.abs(center-(y+height*.55))<height*.55;
      element.classList.toggle('is-current',near);
      if(top<y+height+200 && bottom>y-200){
        element.style.setProperty('--story-drift',motion?((p-.5)*-125).toFixed(1)+'px':'0px');
        element.style.setProperty('--story-turn',motion?((p-.5)*42).toFixed(2)+'deg':'0deg');
        element.style.setProperty('--story-scale',motion?(0.72+p*.55).toFixed(3):'1');
        element.style.setProperty('--story-orbit',motion?(p*180).toFixed(2)+'deg':'0deg');
      }
    });
    images.forEach(img=>{
      const r=img.parentElement.getBoundingClientRect();
      if(r.bottom>0&&r.top<height){const p=clamp((height-r.top)/(height+r.height));img.style.setProperty('--image-zoom',motion?(1+p*.17).toFixed(3):'1');}
    });
    const pr=portrait.getBoundingClientRect();
    if(pr.bottom>0&&pr.top<height)portrait.style.setProperty('--portrait-scale',motion?(1+clamp((height-pr.top)/(height+pr.height))*.18).toFixed(3):'1');
    journeyProgress=journeyTravel?clamp((y-journeyStart)/journeyTravel):0;
    journey.style.setProperty('--journey-x',(-journeyProgress*journeyTravel).toFixed(1)+'px');
    journey.style.setProperty('--journey-progress',journeyProgress);
    journey.dataset.progress=journeyProgress.toFixed(4);
    $('#journey-position').textContent=String(1+Math.round(journeyProgress*4)).padStart(2,'0')+' / 05';
    prev.disabled=!journeyTravel||journeyProgress<.01;
    next.disabled=!journeyTravel||journeyProgress>.99;
    updateThread();
  }

  function goToChapter(index) {
    const p=clamp(index/4);
    if(journeyTravel)window.scrollTo({top:journeyStart+p*journeyTravel,behavior:reduced()?'instant':'smooth'});
    else journeyCards[clamp(index,0,4)].scrollIntoView({block:'center',behavior:'smooth'});
  }
  prev.addEventListener('click',()=>goToChapter(Math.round(journeyProgress*4)-1));
  next.addEventListener('click',()=>goToChapter(Math.round(journeyProgress*4)+1));
  track.addEventListener('focusin',event=>{const card=event.target.closest('.journey-card');if(card&&journeyTravel)goToChapter(journeyCards.indexOf(card));});

  function makePhysics() {
    if (!window.Matter || !physicsContext) return;
    const M=window.Matter;
    physicsWidth=physicsStage.clientWidth;physicsHeight=physicsStage.clientHeight;
    setupCanvas(physicsCanvas,physicsContext,physicsWidth,physicsHeight);
    if(engine)M.Engine.clear(engine);
    engine=M.Engine.create({enableSleeping:true,gravity:{x:0,y:.65}});
    const narrow=physicsWidth<500, tileWidth=narrow?83:112,tileHeight=narrow?39:48;
    const columns=narrow?3:4;
    bodies=labels.map((label,i)=>{
      const x=physicsWidth/(columns+1)*(i%columns+1),y=34+Math.floor(i/columns)*65;
      const body=M.Bodies.rectangle(x,y,tileWidth,tileHeight,{chamfer:{radius:8},restitution:.65,friction:.2,frictionAir:.014,angle:(i%3-1)*.16,label});
      body.plugin={width:tileWidth,height:tileHeight,color:colors[i%colors.length]};return body;
    });
    M.Composite.add(engine.world,[...bodies,
      M.Bodies.rectangle(physicsWidth/2,physicsHeight+25,physicsWidth+100,50,{isStatic:true}),
      M.Bodies.rectangle(-25,physicsHeight/2,50,physicsHeight*3,{isStatic:true}),
      M.Bodies.rectangle(physicsWidth+25,physicsHeight/2,50,physicsHeight*3,{isStatic:true}),
      M.Bodies.rectangle(physicsWidth/2,-25,physicsWidth+100,50,{isStatic:true})]);
    $('.physics-lab').classList.add('physics-ready');
    physicsAccumulator=0;grabbed=null;drawPhysics();
  }

  function drawPhysics() {
    if(!physicsContext||!engine)return;
    const c=physicsContext;c.clearRect(0,0,physicsWidth,physicsHeight);
    c.strokeStyle='#8bddcf15';c.lineWidth=1;
    for(let x=20;x<physicsWidth;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,physicsHeight);c.stroke();}
    for(const body of bodies){
      const {width:w,height:h,color}=body.plugin;
      c.save();c.translate(body.position.x,body.position.y);c.rotate(body.angle);
      c.shadowColor=color+'55';c.shadowBlur=12;
      c.fillStyle='#142730';c.strokeStyle=color;c.lineWidth=1;
      c.beginPath();c.roundRect(-w/2,-h/2,w,h,8);c.fill();c.stroke();
      c.shadowBlur=0;c.fillStyle=color;c.font=`${physicsWidth<500?12:14}px ui-monospace,monospace`;c.textAlign='center';c.textBaseline='middle';c.fillText(body.label,0,1);c.restore();
    }
  }
  function kickPhysics() {
    if(reduced()||!engine)return;
    if(physicsPaused)setPhysicsPaused(false);
    bodies.forEach((body,i)=>{Matter.Sleeping.set(body,false);Matter.Body.setVelocity(body,{x:Math.sin(i*2.7)*7,y:-7-i%3});Matter.Body.setAngularVelocity(body,(i%2?1:-1)*.08);});
    physicsCanvas.dataset.impulses=String(Number(physicsCanvas.dataset.impulses||0)+1);
  }
  function setPhysicsPaused(value){physicsPaused=value;$('#physics-pause').setAttribute('aria-pressed',String(value));$('#physics-pause').setAttribute('aria-label',value?messages.physicsResume:messages.physicsPause);$('#physics-pause').title=value?messages.physicsResume:messages.physicsPause;$('#physics-pause').textContent=value?'▷':'Ⅱ';physicsCanvas.dataset.paused=String(value);}
  $('#physics-kick').addEventListener('click',kickPhysics);
  $('#physics-reset').addEventListener('click',()=>{makePhysics();setPhysicsPaused(false);});
  $('#physics-pause').addEventListener('click',()=>setPhysicsPaused(!physicsPaused));
  function pointerInPhysics(event){const r=physicsCanvas.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top};}
  physicsCanvas.addEventListener('pointerdown',event=>{
    if(reduced()||!engine||physicsPaused)return;
    const point=pointerInPhysics(event),body=Matter.Query.point(bodies,point)[0];
    if(!body)return;
    if(event.pointerType!=='mouse'){Matter.Sleeping.set(body,false);Matter.Body.setVelocity(body,{x:(point.x<physicsWidth/2?1:-1)*7,y:-12});physicsCanvas.dataset.impulses=String(Number(physicsCanvas.dataset.impulses||0)+1);return;}
    grabbed=body;dragPoint=point;lastDrag=point;Matter.Sleeping.set(body,false);Matter.Body.setStatic(body,true);physicsCanvas.setPointerCapture(event.pointerId);
  });
  physicsCanvas.addEventListener('pointermove',event=>{if(grabbed){lastDrag=dragPoint;dragPoint=pointerInPhysics(event);}});
  function release(){if(grabbed){Matter.Body.setStatic(grabbed,false);Matter.Body.setVelocity(grabbed,{x:clamp((dragPoint.x-lastDrag.x)*.5,-12,12),y:clamp((dragPoint.y-lastDrag.y)*.5,-12,12)});grabbed=null;}}
  physicsCanvas.addEventListener('pointerup',release);physicsCanvas.addEventListener('pointercancel',release);physicsCanvas.addEventListener('lostpointercapture',release);

  $('#physics-scatter').addEventListener('click',()=>{kickPhysics();bodies.forEach((b,i)=>{Matter.Body.setPosition(b,{x:50+Math.random()*(physicsWidth-100),y:45+Math.random()*(physicsHeight-90)});Matter.Body.setAngularVelocity(b,(i%2?1:-1)*.2);});});
  $('#gravity-mode').addEventListener('change',()=>{bodies.forEach(b=>Matter.Sleeping.set(b,false));physicsCanvas.dataset.gravity=$('#gravity-mode').value;});
  $('#gravity-force').addEventListener('input',()=>bodies.forEach(b=>Matter.Sleeping.set(b,false)));
  function updatePhysics(dt) {
    if(!engine||!physicsVisible||physicsPaused||reduced())return;
    const mode=$('#gravity-mode').value,force=Number($('#gravity-force').value);
    engine.gravity.x=clamp(velocity*.018,-1,1)*force;
    engine.gravity.y=(mode==='up'?-.7:mode==='float'||mode==='vortex'?0:.7)*force+clamp(velocity*.022,-.8,.8);
    if(mode==='vortex')bodies.forEach(b=>{const dx=physicsWidth/2-b.position.x,dy=physicsHeight/2-b.position.y;Matter.Sleeping.set(b,false);Matter.Body.applyForce(b,b.position,{x:(dx-dy*1.6)*.0000006*force*b.mass,y:(dy+dx*1.6)*.0000006*force*b.mass});});
    if(Math.abs(velocity)>4)bodies.forEach(b=>Matter.Sleeping.set(b,false));
    if(grabbed&&dragPoint)Matter.Body.setPosition(grabbed,{x:clamp(dragPoint.x,40,physicsWidth-40),y:clamp(dragPoint.y,24,physicsHeight-24)});
    physicsAccumulator+=Math.min(dt,40);
    while(physicsAccumulator>=1000/60){Matter.Engine.update(engine,1000/60);physicsAccumulator-=1000/60;}
    drawPhysics();
  }

  function drawEther(now,dt) {
    if(!fieldContext)return;
    const c=fieldContext;c.clearRect(0,0,width,height);
    // Gold rain with periodic wind. Both touch and the narrative tip disturb the field.
    const inWork=$('#work').getBoundingClientRect(),inAbout=$('#about').getBoundingClientRect();
    const quiet=(inWork.top<height*.5&&inWork.bottom>height*.5)||(inAbout.top<height*.5&&inAbout.bottom>height*.5);
    const lunar=$('#moon-stage'),lunarRect=lunar.getBoundingClientRect();
    const source=lunarRect.top<height*.5&&lunarRect.bottom>height*.5?lunar:thread;
    const tip={x:Number(source.dataset.tipX||-1000),y:Number(source.dataset.tipY||-1000)};
    const wind=Math.sin(now*.00022)*1.2+Math.sin(now*.00061)*.4;
    if(rain.length!==(width<760?90:170))rain=Array.from({length:width<760?90:170},()=>({x:Math.random()*width,y:Math.random()*height,vx:0,vy:.6+Math.random()*1.5,size:.5+Math.random()*1.3}));
    rain.forEach(p=>{
      p.vx+=(wind-p.vx)*.016;
      for(const source of [tip,pointer]){const dx=p.x-source.x,dy=p.y-source.y,d=Math.hypot(dx,dy);if(d<150&&d>1){p.vx+=dx/d*(1-d/150)*.8;p.y+=dy/d*(1-d/150)*3;}}
      p.x+=p.vx*dt/16;p.y+=p.vy*dt/16;
      if(p.y>height+10){p.y=-10;p.x=Math.random()*width;}if(p.x>width+10)p.x=-10;if(p.x< -10)p.x=width+10;
      c.globalAlpha=quiet?.12:.42;c.strokeStyle='#edc77b';c.lineWidth=p.size;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*3,p.y-p.vy*5);c.stroke();
    });
    field.dataset.wind=wind.toFixed(2);field.dataset.density=quiet?'quiet':'full';
    trail=trail.filter(p=>now-p.time<950);
    if(trail.length>2){
      ['#eac379','#7ccec9','#af96d7'].forEach((color,layer)=>{
        c.beginPath();c.strokeStyle=color;c.lineWidth=2.5+layer*1.7;c.shadowColor=color;c.shadowBlur=25;c.globalAlpha=.65-layer*.09;
        trail.forEach((p,i)=>{const age=(now-p.time)/950,off=Math.sin(i*.4+now*.002)*age*13*layer;const x=p.x+off,y=p.y-off;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();
      });
    }
    c.shadowBlur=0;
    sparks=sparks.filter(p=>p.life>0);
    sparks.forEach(p=>{p.x+=p.vx*dt/16;p.y+=p.vy*dt/16;p.vy+=.018*dt/16;p.life-=dt;c.globalAlpha=clamp(p.life/850)*.65;c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.size,0,Math.PI*2);c.fill();});
    c.globalAlpha=1;
  }

  function pointerAllowed(){return finePointer.matches&&!reduced()&&!root.classList.contains('native-cursor');}
  function updateCursor(){
    const allowed=pointerAllowed()&&pointerActive;
    root.classList.toggle('magic-pointer',allowed);
    aura.classList.toggle('active',allowed);
    if(allowed){auraPoint.x+=(pointer.x-auraPoint.x)*.25;auraPoint.y+=(pointer.y-auraPoint.y)*.25;aura.style.transform=`translate3d(${auraPoint.x}px,${auraPoint.y}px,0)`;}
  }
  window.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'){pointer={x:event.clientX,y:event.clientY};return;}
    pointer={x:event.clientX,y:event.clientY};
    if(!pointerActive)auraPoint={...pointer};pointerActive=true;
    if(pointerAllowed()) {trail.push({...pointer,time:performance.now()});if(trail.length>36)trail.shift();}
    const visual=event.target.closest('.project-visual');
    if(visual&&!reduced()){const r=visual.getBoundingClientRect();visual.style.setProperty('--tilt-x',((.5-(pointer.y-r.top)/r.height)*12)+'deg');visual.style.setProperty('--tilt-y',(((pointer.x-r.left)/r.width-.5)*16)+'deg');}
  },{passive:true});
  document.addEventListener('pointerover',event=>aura.classList.toggle('over-link',!!event.target.closest('a,button,summary,input,label')));
  document.addEventListener('pointerout',event=>{if(!event.relatedTarget){pointerActive=false;root.classList.remove('magic-pointer');aura.classList.remove('active');}});
  $$('.project-visual').forEach(el=>el.addEventListener('pointerleave',()=>{el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg');}));
  window.addEventListener('pointerdown',event=>{
    if(reduced())return;
    pointer={x:event.clientX,y:event.clientY};
    for(let i=0;i<16;i++){const angle=i*Math.PI/8;sparks.push({x:event.clientX,y:event.clientY,vx:Math.cos(angle)*(1+i%3),vy:Math.sin(angle)*(1+i%3),life:850,size:i%3===0?1.8:1,color:colors[i%3]});}
    if(sparks.length>80)sparks=sparks.slice(-80);
  },{passive:true});
  window.addEventListener('blur',()=>{pointerActive=false;root.classList.remove('magic-pointer');aura.classList.remove('active');release();});

  const imageObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const img=entry.target;img.dataset.inView=String(entry.isIntersecting);
    img.src=entry.isIntersecting&&!reduced()?img.dataset.motionSrc:img.dataset.stillSrc;
  }),{rootMargin:'100px'});
  $$('img[data-motion-src]').forEach(img=>imageObserver.observe(img));
  const physicsObserver=new IntersectionObserver(entries=>{physicsVisible=entries[0].isIntersecting;},{rootMargin:'80px'});physicsObserver.observe(physicsStage);

  function layout(){
    width=innerWidth;height=innerHeight;
    setupCanvas(field,fieldContext,width,height);
    layoutJourney();layoutThread();
    if(engine&&Math.abs(physicsWidth-physicsStage.clientWidth)>2)makePhysics();
    dirty=true;updateScrollScenes();
  }
  function scheduleLayout(){clearTimeout(resizeTimer);resizeTimer=setTimeout(layout,100);}
  window.addEventListener('resize',scheduleLayout,{passive:true});
  new ResizeObserver(scheduleLayout).observe(main);
  window.addEventListener('scroll',()=>{dirty=true;},{passive:true});
  window.addEventListener('preferenceschange',()=>{
    release();trail=[];sparks=[];
    $$('img[data-motion-src]').forEach(img=>{img.src=!reduced()&&img.dataset.inView==='true'?img.dataset.motionSrc:img.dataset.stillSrc;});
    updateCursor();layout();start();
  });
  finePointer.addEventListener('change',()=>{updateCursor();start();});
  systemMotion.addEventListener('change',()=>{layout();start();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;release();}else{dirty=true;start();}});

  function tick(now){
    frame=0;
    if(document.hidden)return;
    const dt=lastFrame?now-lastFrame:16;
    if(dt<(width<760?30:15)){frame=requestAnimationFrame(tick);return;}
    lastFrame=now;
    const diff=scrollY-lastScroll;velocity=velocity*.75+diff*.25;lastScroll=scrollY;
    if(dirty){updateScrollScenes();dirty=false;}
    if(!reduced()){updateCursor();drawEther(now,Math.min(dt,40));updatePhysics(dt);frame=requestAnimationFrame(tick);}
    else {fieldContext?.clearRect(0,0,width,height);updateCursor();}
  }
  function start(){if(frame)cancelAnimationFrame(frame);lastFrame=0;frame=requestAnimationFrame(tick);}
  // Reduced motion still updates the static progress display after native scrolling.
  window.addEventListener('scroll',()=>{if(reduced())start();},{passive:true});
  makePhysics();layout();start();
})();
