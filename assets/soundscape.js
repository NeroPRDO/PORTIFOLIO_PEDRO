/* Original instrumental score: layered pads, bells and a soft pulse, synthesised locally. */
(() => {
  const $=s=>document.querySelector(s),button=$('#sound-toggle'),volume=$('#sound-volume');
  const messages=JSON.parse($('#messages').textContent);
  let context,master,reverb,dry,voices=[],enabled=false,interval,suspendTimer,step=0,current=-1,notes=[];
  const scenes=['#home','#story-1','#work','#story-2','#story-3','#about','#story-4','#skills','#story-5','#journey','#story-6','#moon-stage','#contact'];
  const harmonies=[[45,52,57,64],[50,57,60,65],[48,55,60,64],[53,60,65,69],[50,57,62,65],[48,55,59,64],[38,45,50,56],[43,50,55,62],[50,57,62,66],[55,62,67,71],[45,52,57,60],[50,57,62,69],[48,55,60,67]];
  const hz=m=>440*Math.pow(2,(m-69)/12);
  function init(){
    context=new (window.AudioContext||window.webkitAudioContext)();
    master=context.createGain();master.gain.value=0;
    const limiter=context.createDynamicsCompressor();limiter.threshold.value=-16;limiter.ratio.value=8;master.connect(limiter);limiter.connect(context.destination);
    dry=context.createGain();dry.gain.value=.6;dry.connect(master);
    reverb=context.createConvolver();const length=context.sampleRate*3,impulse=context.createBuffer(2,length,context.sampleRate);
    for(let c=0;c<2;c++){const data=impulse.getChannelData(c);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,3)*.6;}
    reverb.buffer=impulse;const wet=context.createGain();wet.gain.value=.24;reverb.connect(wet);wet.connect(master);
    for(let i=0;i<4;i++){
      const gain=context.createGain(),filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=600;gain.gain.value=.045;
      filter.connect(gain);gain.connect(dry);gain.connect(reverb);
      const pair=[-4,4].map(detune=>{const o=context.createOscillator();o.type='triangle';o.detune.value=detune;o.frequency.value=hz(harmonies[0][i]);o.connect(filter);o.start();return o;});
      voices.push({pair,filter,gain});
    }
  }
  function scene(){let selected=0;scenes.forEach((selector,i)=>{if($(selector).getBoundingClientRect().top<innerHeight*.55)selected=i});return selected;}
  function melody(){
    if(!enabled||document.hidden||context.state!=='running')return;
    const target=scene(),time=context.currentTime;
    if(target!==current){current=target;notes=harmonies[target];button.dataset.scene=String(target);voices.forEach((v,i)=>{v.pair.forEach(o=>o.frequency.setTargetAtTime(hz(notes[i]),time,1.8));v.filter.frequency.setTargetAtTime(target===6?280:target===8?1200:650,time,2);});}
    const epic=current===8||current===9,tense=current===6;
    const pattern=[0,2,1,3,2,1,3,0],note=notes[pattern[step++%8]]+(tense?0:12);
    const osc=context.createOscillator(),gain=context.createGain();osc.type=tense?'triangle':'sine';osc.frequency.value=hz(note);gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(epic?.11:.055,time+.04);gain.gain.exponentialRampToValueAtTime(.0001,time+2.7);osc.connect(gain);gain.connect(dry);gain.connect(reverb);osc.start(time);osc.stop(time+3);osc.onended=()=>{osc.disconnect();gain.disconnect()};
    if(epic&&step%2===0){const pulse=context.createOscillator(),g=context.createGain();pulse.frequency.setValueAtTime(95,time);pulse.frequency.exponentialRampToValueAtTime(40,time+.3);g.gain.setValueAtTime(.1,time);g.gain.exponentialRampToValueAtTime(.0001,time+.6);pulse.connect(g);g.connect(dry);pulse.start();pulse.stop(time+.7);pulse.onended=()=>{pulse.disconnect();g.disconnect()};}
  }
  function level(){if(context)master.gain.setTargetAtTime(enabled?Number(volume.value)/100:0,context.currentTime,.25)}
  button.addEventListener('click',async()=>{
    if(button.disabled)return;button.disabled=true;
    try{
      if(!context)init();
      clearTimeout(suspendTimer);enabled=!enabled;
      if(enabled){await context.resume();current=-1;melody();clearInterval(interval);interval=setInterval(melody,1100);}else{clearInterval(interval);suspendTimer=setTimeout(()=>{if(!enabled)context.suspend().then(()=>button.dataset.audioState=context.state);},1000);}
      level();button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?messages.soundOff:messages.soundOn);button.title=enabled?messages.soundOff:messages.soundOn;button.textContent=enabled?'Ⅱ ♫':'♫';button.closest('.sound-controls').classList.toggle('playing',enabled);button.dataset.audioState=context.state;
    }catch{enabled=false;button.setAttribute('aria-pressed','false');button.dataset.audioState='unavailable';}finally{button.disabled=false;}
  });
  volume.addEventListener('input',level);
  document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden){context.suspend();}else if(enabled){context.resume().catch(()=>{});}});
})();
