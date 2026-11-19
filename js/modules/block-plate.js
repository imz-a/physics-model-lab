/* block-plate.js — 板块模型交互模块（IIFE，无外部依赖） */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};
  var G = 9.8;
  var STYLE = `<style>
.bp-wrap{color:var(--ink,#3a4250);font-size:15px}
.bp-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.bp-grid{grid-template-columns:1fr}}
.bp-card{background:#fff;border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.bp-card+.bp-card{margin-top:14px}
.bp-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.bp-hd h4{font-size:16px;font-weight:700}.bp-hd small{font-size:12px;color:var(--ink-3,#8b95a3)}
canvas.bp-cv{display:block;width:100%;height:200px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.bp-cv.chart{height:146px}
.bp-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.bp-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.bp-chip.hot{background:#FFF4F5;border-color:#FFB3BA}.bp-chip b{color:var(--ink,#3a4250)}
.bp-ctrl{margin-top:9px}.bp-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.bp-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.bp-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.bp-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.bp-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#FFB3BA;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.bp-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.bp-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#FFB3BA;border:3px solid #fff}
.bp-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.bp-btn{min-height:36px;padding:6px 13px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;font-size:13px;font-weight:600}
.bp-btn:hover{border-color:#FFB3BA;background:#FFF4F5}.bp-btn.main{background:#FFF4F5;border-color:#FFB3BA}
.bp-btn.seg.on{background:#F1F8FD;border-color:#BFE3F5;color:#3f7fa5}
.bp-reads{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.bp-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px}
.bp-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.bp-read b{font-size:16px;font-variant-numeric:tabular-nums}.bp-read.hl{background:#FFF4F5;border-color:#FFD8DE}
.bp-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.bp-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.bp-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.bp-status{margin-top:10px;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;background:#F1FBF6;border:1px solid #B8E8D0;color:#3d8d6c}
.bp-status.slip{background:#FFF4F5;border-color:#FFB3BA;color:#c26b7a}
.bp-barrow{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.bp-barrow>span{flex:0 0 74px;font-size:12px;color:var(--ink-2,#5a6472)}
.bp-bartrack{flex:1;height:19px;background:#f2f5f8;border-radius:6px;overflow:hidden}
.bp-barfill{height:100%;border-radius:6px}
.bp-barval{flex:0 0 56px;text-align:right;font-size:13px;font-variant-numeric:tabular-nums}
.bp-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:12px;padding-top:10px}
.bp-quiz h5{font-size:14px;margin:0 0 6px}.bp-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 7px}
.bp-opts{display:flex;gap:7px;flex-wrap:wrap}
.bp-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.bp-opt:hover{border-color:#FFB3BA;background:#FFF4F5}
.bp-fb{margin-top:7px;font-size:12.5px;min-height:18px;line-height:1.6}.bp-fb.ok{color:#2f8f68}.bp-fb.no{color:#c26b7a}
.bp-exp{margin-top:7px;min-height:32px;padding:4px 11px;font-size:12px}
.bp-explain{margin-top:7px;padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:12.5px;line-height:1.7;color:#6e57a0}
.bp-explain[hidden]{display:none}
</style>`;
  function line(c,a1,b1,a2,b2,col,w,d){var g=c.ctx||c;g.save();g.beginPath();if(d)g.setLineDash(d);g.strokeStyle=col;g.lineWidth=w||1;g.moveTo(a1,b1);g.lineTo(a2,b2);g.stroke();g.restore();}
  function text(c,s,x,y,col,sz,al){var g=c.ctx||c;g.save();g.fillStyle=col||'#8b95a3';g.font=(sz||12)+'px "PingFang SC","Microsoft YaHei",sans-serif';g.textAlign=al||'left';g.textBaseline='middle';g.fillText(s,x,y);g.restore();}
  function dot(c,x,y,r,f,s){var g=c.ctx||c;g.save();g.beginPath();g.arc(x,y,r,0,6.2832);g.fillStyle=f;g.fill();if(s){g.lineWidth=2;g.strokeStyle=s;g.stroke();}g.restore();}
  function mk(el){return{el:el,ctx:el.getContext('2d'),w:0,h:0,dpr:0};}
  function fit(c){var w=c.el.clientWidth,h=c.el.clientHeight,d=Math.min(global.devicePixelRatio||1,2);if(w&&h&&(w!==c.w||h!==c.h||d!==c.dpr)){c.w=w;c.h=h;c.dpr=d;c.el.width=Math.round(w*d);c.el.height=Math.round(h*d);c.ctx.setTransform(d,0,0,d,0,0);}return c;}
  function arrow(c,x1,y1,x2,y2,col,lab){line(c,x1,y1,x2,y2,col,2.5);var a=Math.atan2(y2-y1,x2-x1),g=c.ctx||c,s=8;g.save();g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-s*Math.cos(a-.45),y2-s*Math.sin(a-.45));g.lineTo(x2-s*Math.cos(a+.45),y2-s*Math.sin(a+.45));g.closePath();g.fillStyle=col;g.fill();g.restore();if(lab)text(c,lab,x2+7,y2-6,col,12);}
  var QUIZ=[
    {id:'q1',title:'① 一起运动的最大外力',label:'上块质量 m₁',min:.5,max:4,step:.5,val:1,unit:'kg',
      build:function(v){var m2=3,mu=.3,Fmax=mu*G*(v+m2);return{prompt:'m₁='+v.toFixed(1)+' kg、m₂=3 kg、μ=0.30，力 F 作用在木板上（地面光滑），要使两块始终不相对滑动，F 最大约为？',
        opts:[Fmax.toFixed(1)+' N',(Fmax/2).toFixed(1)+' N',(2*Fmax).toFixed(1)+' N'],right:0,
        ex:'不滑时整体 a=F/(m₁+m₂)；上块只靠静摩擦加速，需 f_s=m₁a=m₁F/(m₁+m₂) ≤ fₘ=μm₁g，即 F ≤ μg(m₁+m₂) = '+Fmax.toFixed(1)+' N。'};}},
    {id:'q2',title:'② 相对加速度大小',label:'外力 F',min:4,max:30,step:2,val:12,unit:'N',
      build:function(v){var m1=1,m2=3,mu=.2,f=mu*m1*G,a1=-f/m1,a2=(v+f)/m2,rel=Math.abs(a2-a1);return{prompt:'m₁=1 kg、m₂=3 kg、μ=0.20，F='+v+' N 作用于木板，设初始 v₁>v₂（上块相对木板向右滑），两块相对加速度大小约为？',
        opts:[rel.toFixed(2)+' m/s²',(rel/2).toFixed(2)+' m/s²',(2*rel).toFixed(2)+' m/s²'],right:0,
        ex:'设 v₁>v₂：滑动摩擦 f=μm₁g='+f.toFixed(2)+' N 使上块减速、木板加速。上块 a₁=−f/m₁='+a1.toFixed(2)+' m/s²，木板 a₂=(F+f)/m₂='+a2.toFixed(2)+' m/s²；相对加速度大小 |a₁−a₂| = '+rel.toFixed(2)+' m/s²。'};}}
  ];
  function quizHTML(){return '<div class="bp-card"><div class="bp-hd"><h4>高考题型 · 随堂练</h4><small>参数可调 · 即时判分</small></div>'+QUIZ.map(function(z){
    return '<div class="bp-quiz"><h5>'+z.title+'</h5><p data-qp="'+z.id+'"></p><div class="bp-ctrl"><label><span>'+z.label+'</span><b data-qo="'+z.id+'"></b></label><input class="bp-range" type="range" data-qs="'+z.id+'" min="'+z.min+'" max="'+z.max+'" step="'+z.step+'" value="'+z.val+'"></div><div class="bp-opts" data-qopts="'+z.id+'"></div><div class="bp-fb" data-qfb="'+z.id+'"></div><button type="button" class="bp-btn bp-exp" data-qexp="'+z.id+'">展开解析 ▾</button><div class="bp-explain" data-qex="'+z.id+'" hidden></div></div>';}).join('')+'</div>';}

  NS.modules['block-plate']={render:function(container,extIndex){
    extIndex=extIndex|0;if(extIndex<0||extIndex>3)extIndex=0;
    var intro=['摩擦力使上下两块 <b>加速度不同</b>','相对加速度大小 <b>|Δa| = |a₁ − a₂|</b>','v–t 交点即 <b>共速时刻</b>','先判相对滑动，再列牛顿方程'][extIndex];
    var extra=extIndex===1
      ?'<div class="bp-card"><div class="bp-hd"><h4>相对滑动</h4><small>判断运动状态</small></div><div class="bp-status" data-status></div>'
        +[['a1','上块 a₁','#FFB3BA'],['a2','木板 a₂','#B8E8D0'],['f','摩擦力 f','#D0C4E8']].map(function(p){return'<div class="bp-barrow" style="margin-top:9px"><span>'+p[1]+'</span><div class="bp-bartrack"><div class="bp-barfill" data-bar="'+p[0]+'" style="background:'+p[2]+'"></div></div><b class="bp-barval" data-barval="'+p[0]+'">—</b></div>';}).join('')
        +'<div class="bp-tip">地面光滑，f = fₘ = μm₁g。摩擦方向由 sign(v₁−v₂) 决定：v₁>v₂ 时上块受摩擦向左、木板向右；v₂>v₁ 时反向。共速后还要比较「维持一起运动所需静摩擦」与 fₘ：够则一起以 a=F/(m₁+m₂) 运动，不够则摩擦反向、继续相对滑动。</div></div>'
      :extIndex===2
        ?'<div class="bp-card"><div class="bp-hd"><h4>图像分析</h4><small>两线交点 = 共速</small></div><div class="bp-tip">粉线 v₁、绿线 v₂ 为分段直线，交点 t_c 为共速时刻。两线之间阴影面积 = 相对滑动距离 L，摩擦生热 Q = f·L = μm₁g·L。共速后只有所需静摩擦 ≤ fₘ 才一起运动，默认 F 较大时摩擦反向、继续相对滑动。</div><div class="bp-status" data-cross></div></div>'
        :extIndex===3?quizHTML():'';
    var chartTitle=['v–t 双线（阴影 = 相对滑动距离 L）','a₁、a₂ 随 t 对比','v–t 交点 · 共速与阴影面积','a₁、a₂ 随 F 变化（设 v₁>v₂）'][extIndex];
    container.innerHTML=STYLE+'<div class="bp-wrap"><div class="bp-intro"><span class="bp-chip hot">'+intro+'</span><span class="bp-chip">地面光滑 · f = μm₁g</span><span class="bp-chip">v–t 阴影面积 = 相对滑动距离 L</span></div>'
      +'<div class="bp-grid"><div><div class="bp-card"><div class="bp-hd"><h4>板块运动演示</h4><small>上块与木板发生相对滑动</small></div><canvas class="bp-cv" data-cv="stage"></canvas>'
      +'<div class="bp-legend"><span><i style="background:#FFB3BA"></i>上块 m₁</span><span><i style="background:#B8E8D0"></i>木板 m₂</span><span><i style="background:#FFD8A8"></i>外力 F</span><span><i style="background:#D0C4E8"></i>摩擦力 f₁</span></div></div>'
      +'<div class="bp-card"><div class="bp-hd"><h4>'+chartTitle+'</h4><small>随参数实时更新</small></div><canvas class="bp-cv chart" data-cv="chart"></canvas></div></div>'
      +'<div><div class="bp-card"><div class="bp-hd"><h4>参数调节</h4><small>拖动即时改变</small></div>'
      +[['m1','上块质量 m₁',.5,4,.5,1,'kg'],['m2','木板质量 m₂',.5,5,.5,3,'kg'],['mu','动摩擦因数 μ',.05,.6,.05,.2,''],['F','外力 F',0,30,1,12,'N'],['v0','上块初速度 v₀',0,10,.5,6,'m/s']]
        .map(function(r){return'<div class="bp-ctrl"><label><span>'+r[1]+'</span><b><span data-out="'+r[0]+'">'+r[5]+'</span> '+r[6]+'</b></label><input class="bp-range" type="range" data-slider="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'" value="'+r[5]+'"></div>';}).join('')
      +'<div class="bp-btns"><button type="button" class="bp-btn seg on" data-on="lower">F 作用于木板</button><button type="button" class="bp-btn seg" data-on="upper">F 作用于上块</button></div>'
      +'<div class="bp-btns"><button type="button" class="bp-btn main" data-btn="toggle">暂停</button><button type="button" class="bp-btn" data-btn="reset">重新放置</button></div></div>'
      +'<div class="bp-card"><div class="bp-hd"><h4>实时读数</h4><small>随运动/参数刷新</small></div><div class="bp-reads">'
      +[['a1','上块 a₁ / (m/s²)',0],['a2','木板 a₂ / (m/s²)',0],['arel','相对加速度大小 / (m/s²)',1],['tc','共速时刻 t_c / s',0],
        ['v1','上块速度 v₁ / (m/s)',0],['v2','木板速度 v₂ / (m/s)',0],['L','相对滑动距离 L / m',1],['Q','摩擦生热 Q / J',1]]
        .map(function(r){return'<div class="bp-read'+(r[2]?' hl':'')+'"><span>'+r[1]+'</span><b data-read="'+r[0]+'">—</b></div>';}).join('')
      +'</div><div class="bp-tip" data-tip></div></div>'+extra+'</div></div></div>';
    var q=function(s){return container.querySelector(s);},qa=function(s){return container.querySelectorAll(s);};
    var stage=mk(q('[data-cv="stage"]')),chart=mk(q('[data-cv="chart"]')),dis=[];
    function on(t,ty,fn,o){t.addEventListener(ty,fn,o);dis.push(function(){t.removeEventListener(ty,fn,o);});}
    var st={m1:1,m2:3,mu:.2,F:12,v0:6,on:'lower',v1:6,v2:0,x1:0,x2:0,t:0,running:true,last:0};
    function reset(){st.v1=st.v0;st.v2=0;st.x1=0;st.x2=0;st.t=0;}
    function fmax(){return st.mu*st.m1*G;}
    // 滑动摩擦下的加速度：sg = sign(v1-v2)，摩擦方向由相对运动方向决定
    function sliding(sg){
      var f=fmax();
      if(st.on==='lower')return{a1:-sg*f/st.m1,a2:(st.F+sg*f)/st.m2};
      return{a1:(st.F-sg*f)/st.m1,a2:sg*f/st.m2};
    }
    // 从初始状态 (v1=v0, v2=0) 固定解析出的全过程：只依赖参数，不随动画抖动
    var thKey='',thCache=null;
    function theory(){
      var key=[st.m1,st.m2,st.mu,st.F,st.v0,st.on].join('|');
      if(key===thKey)return thCache;
      var f=fmax(),aCommon=st.F/(st.m1+st.m2);
      var need=st.on==='lower'?st.m1*aCommon:st.m2*aCommon;
      var together=need<=f+1e-9;                 // 维持一起运动所需静摩擦是否够
      var staticStart=st.v0<=1e-9;               // 初始无相对速度（v₀=0）
      var sg0=staticStart?(st.on==='lower'?-1:1):1;  // 初始相对运动方向；v₀=0 时取起滑趋势
      var init=(staticStart&&together)?{a1:aCommon,a2:aCommon}:sliding(sg0);
      var denom=init.a2-init.a1;
      var tc0=denom>1e-6?st.v0/denom:0;         // 固定共速时刻
      var vc=tc0>0?init.a2*tc0:st.v0;
      var post=(tc0>0&&together)?{a1:aCommon,a2:aCommon}:sliding(st.on==='lower'?-1:1);
      var T=tc0>0?Math.max(2,Math.min(8,tc0*1.5)):3;
      thCache={f:f,aCommon:aCommon,need:need,together:together,init:init,post:post,tc0:tc0,vc:vc,T:T,
        Fcr:st.on==='lower'?st.mu*G*(st.m1+st.m2):f*(st.m1+st.m2)/st.m2};
      thKey=key;
      return thCache;
    }
    // 当前 (v1,v2) 下的瞬时运动状态：calc 与 loop 共用的唯一物理真源
    function accelOf(v1,v2){
      var th=theory(),du=v1-v2,sg=Math.sign(du);
      if(Math.abs(du)<1e-6){
        if(th.together)return{a1:th.aCommon,a2:th.aCommon,slip:false,sg:0,fActual:th.need,mode:'together'};
        sg=st.on==='lower'?-1:1;                // 共速但静摩擦不足：按相对滑动趋势方向起滑（摩擦反向）
      }
      var a=sliding(sg);
      return{a1:a.a1,a2:a.a2,slip:true,sg:sg,fActual:th.f,mode:sg>0?'slip+':'slip-'};
    }
    function theoryV(t){
      var th=theory();
      if(th.tc0>0&&t>th.tc0){var dt=t-th.tc0;return{v1:th.vc+th.post.a1*dt,v2:th.vc+th.post.a2*dt};}
      return{v1:st.v0+th.init.a1*t,v2:th.init.a2*t};
    }
    // v–t 两线之间阴影面积 = 相对滑动距离 L；Q = f·L = μm₁g·L
    // 对全过程 |v1−v2| 积分：共速后静摩擦不足、摩擦反向继续滑动的这一段同样生热，不能截断在 tc0
    function slideHeat(){
      var th=theory(),tEnd=th.T,L=0,N=160,prev=Math.abs(st.v0);
      for(var i=1;i<=N;i++){var t=tEnd*i/N,vv=theoryV(t),vr=Math.abs(vv.v1-vv.v2);L+=(prev+vr)/2*(tEnd/N);prev=vr;}
      return{L:L,Q:th.f*L,tEnd:tEnd};
    }
    function calc(){
      var d=accelOf(st.v1,st.v2),th=theory();
      d.tc=th.tc0;d.together=th.together;d.aCommon=th.aCommon;d.vc=th.vc;d.T=th.T;d.f=th.f;
      return d;
    }
    qa('[data-slider]').forEach(function(el){var k=el.getAttribute('data-slider');on(el,'input',function(){st[k]=parseFloat(el.value);q('[data-out="'+k+'"]').textContent=(k==='mu'?st[k].toFixed(2):String(st[k]));reset();});});
    qa('[data-on]').forEach(function(b){on(b,'click',function(){st.on=b.getAttribute('data-on');qa('[data-on]').forEach(function(x){x.classList.toggle('on',x===b);});reset();});});
    var tg=q('[data-btn="toggle"]');on(tg,'click',function(){st.running=!st.running;tg.textContent=st.running?'暂停':'继续';tg.classList.toggle('main',st.running);});
    on(q('[data-btn="reset"]'),'click',reset);
    if(extIndex===3){
      QUIZ.forEach(function(z){function refresh(){var d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));q('[data-qp="'+z.id+'"]').textContent=d.prompt;q('[data-qo="'+z.id+'"]').textContent=q('[data-qs="'+z.id+'"]').value+(z.unit||'');q('[data-qopts="'+z.id+'"]').innerHTML=d.opts.map(function(o,i){return'<button type="button" class="bp-opt" data-q="'+z.id+'" data-i="'+i+'">'+o+'</button>';}).join('');q('[data-qfb="'+z.id+'"]').textContent='';q('[data-qex="'+z.id+'"]').hidden=true;}
        refresh();on(q('[data-qs="'+z.id+'"]'),'input',refresh);on(q('[data-qexp="'+z.id+'"]'),'click',function(e){var box=q('[data-qex="'+z.id+'"]'),d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));box.hidden=!box.hidden;box.textContent=d.ex;e.target.textContent=box.hidden?'展开解析 ▾':'收起解析 ▴';});});
      qa('[data-q]').forEach(function(b){on(b,'click',function(){var id=b.getAttribute('data-q'),i=+b.getAttribute('data-i'),z=QUIZ.filter(function(x){return x.id===id;})[0],d=z.build(parseFloat(q('[data-qs="'+id+'"]').value)),fb=q('[data-qfb="'+id+'"]'),ok=i===d.right;fb.className='bp-fb '+(ok?'ok':'no');fb.textContent=ok?'✓ 正确！':'✗ 再想想，点「展开解析」看思路。';});});
    }
    function drawStage(){
      fit(stage);var c=stage.ctx,w=stage.w,h=stage.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var gy=h*.68,sc=Math.min(16,(w-150)/8);      // 固定绝对量程，不随参数归一化
      var px=w*.24+st.x2*sc;                        // 木板对地位移
      var rel=st.x1-st.x2;                          // 上块相对木板的位移（唯一相对量）
      var bx=px+18+rel*sc;                          // 上块位置 = 板左缘 + 相对位移
      var d=calc();
      line(c,16,gy+18,w-16,gy+18,'#cbd6e2',2);
      c.save();c.fillStyle='#DDF3E8';c.strokeStyle='#B8E8D0';c.lineWidth=2;c.beginPath();c.rect(px,gy-12,190,28);c.fill();c.stroke();c.restore();
      text(c,'木板 m₂',px+95,gy+2,'#4f9b78',12,'center');
      c.save();c.fillStyle='#FFB3BA';c.strokeStyle='#f28f9a';c.lineWidth=2;c.beginPath();c.rect(bx,gy-38,50,26);c.fill();c.stroke();c.restore();
      text(c,'m₁',bx+25,gy-25,'#fff',12,'center');
      // 相对位移箭头：长度与方向都取自相对量 rel
      if(extIndex===1&&Math.abs(rel)>1e-3){
        var y=gy-54,xL=px+18,xR=px+18+rel*sc,dir=rel>0?1:-1;
        line(c,xL,y,xR,y,'#FFD8A8',2,[4,3]);
        line(c,xR,y,xR-6*dir,y-4,'#FFD8A8',2);line(c,xR,y,xR-6*dir,y+4,'#FFD8A8',2);
        text(c,'相对位移 '+rel.toFixed(2)+' m',(xL+xR)/2,y-10,'#e0a458',11,'center');
      }
      // 外力 F：长度随 F，方向恒为正方向
      var fyF=st.on==='lower'?gy+16:gy-50,fxF=st.on==='lower'?px+95:bx+25;
      if(st.F>0.01)arrow(c,fxF,fyF,fxF+Math.max(18,Math.min(70,st.F*2)),fyF,'#FFD8A8','F');
      // 上块所受摩擦力 f₁：方向由 sign(v1-v2) 决定（滑动时与相对运动反向，一起运动时提供 a_common）
      var fdir=d.slip?-(d.sg||1):(d.aCommon>=0?1:-1);
      var fyf=st.on==='lower'?gy-50:gy-64;
      arrow(c,bx+25,fyf,bx+25+fdir*Math.min(40,14+d.fActual*2.6),fyf,'#D0C4E8','f₁');
      text(c,'a₁='+d.a1.toFixed(2)+'　a₂='+d.a2.toFixed(2),w-12,18,'#5a6472',12,'right');
    }
    function drawChart(){
      fit(chart);var c=chart.ctx,w=chart.w,h=chart.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var x0=46,x1=w-14,top=16,bot=h-26,th=theory(),T=th.T;
      function px(t){return x0+Math.max(0,Math.min(1,t/T))*(x1-x0);}
      function clamp01(u){return Math.max(0,Math.min(1,u));}
      function frame(xlab,ylab){
        line(c,x0,bot,x1,bot,'#cbd6e2',1);line(c,x0,top,x0,bot,'#cbd6e2',1);
        text(c,xlab,x1,h-8,'#8b95a3',11,'right');
        text(c,ylab,x0+3,top+2,'#8b95a3',10);
        text(c,'0',x0,bot+12,'#aab4c0',10);
      }
      // extIndex 3：a₁、a₂ 随 F 变化（设 v₁>v₂，即初始滑动段），按 st.on 取公式、画两条
      if(extIndex===3){
        var f=th.f,Fmax=30;
        function pxF(F){return x0+F/Fmax*(x1-x0);}
        var A=Math.ceil(Math.max(6,Fmax/Math.min(st.m1,st.m2)+st.mu*G)*1.1);
        function pyA(a){return bot-clamp01((a+A)/(2*A))*(bot-top);}
        frame('F / N','a / (m/s²)');
        line(c,x0,pyA(0),x1,pyA(0),'#e8edf2',1,[3,3]);
        text(c,'0',x0-4,pyA(0),'#aab4c0',10,'right');
        text(c,'+'+A,x0-4,top+4,'#aab4c0',10,'right');text(c,'−'+A,x0-4,bot-2,'#aab4c0',10,'right');
        text(c,'30',x1,bot+12,'#aab4c0',10,'right');
        var accF=st.on==='lower'?function(F){return{a1:-f/st.m1,a2:(F+f)/st.m2};}:function(F){return{a1:(F-f)/st.m1,a2:f/st.m2};};
        [['a1','#FFB3BA'],['a2','#B8E8D0']].forEach(function(p){
          c.save();c.beginPath();
          for(var i=0;i<=80;i++){var F=Fmax*i/80,a=accF(F)[p[0]],X=pxF(F),Y=pyA(a);if(i===0)c.moveTo(X,Y);else c.lineTo(X,Y);}
          c.strokeStyle=p[1];c.lineWidth=2.4;c.stroke();c.restore();
        });
        if(th.Fcr<=Fmax){var cx=pxF(th.Fcr);line(c,cx,top,cx,bot,'#D0C4E8',1,[3,3]);text(c,'F临='+th.Fcr.toFixed(1)+' N',cx+4,top+10,'#8b6fb0',10);}
        text(c,'— a₁ 上块',x1-4,top+4,'#FFB3BA',10,'right');text(c,'— a₂ 木板',x1-4,top+16,'#B8E8D0',10,'right');
        return;
      }
      // extIndex 1：a₁、a₂ 随 t 对比（分段常数，共速处加速度突变）
      if(extIndex===1){
        var A1=Math.ceil(Math.max(4,Math.abs(th.init.a1),Math.abs(th.init.a2),Math.abs(th.post.a1),Math.abs(th.post.a2),Math.abs(th.aCommon))*1.15);
        function py1(a){return bot-clamp01((a+A1)/(2*A1))*(bot-top);}
        frame('t / s','a / (m/s²)');
        line(c,x0,py1(0),x1,py1(0),'#e8edf2',1,[3,3]);
        text(c,'0',x0-4,py1(0),'#aab4c0',10,'right');
        text(c,'+'+A1,x0-4,top+4,'#aab4c0',10,'right');text(c,'−'+A1,x0-4,bot-2,'#aab4c0',10,'right');
        text(c,T.toFixed(1),x1,bot+12,'#aab4c0',10,'right');
        var t1=th.tc0>0?Math.min(th.tc0,T):T;
        [['a1','#FFB3BA'],['a2','#B8E8D0']].forEach(function(p){
          c.save();c.strokeStyle=p[1];c.lineWidth=2.4;
          c.beginPath();c.moveTo(px(0),py1(th.init[p[0]]));c.lineTo(px(t1),py1(th.init[p[0]]));c.stroke();
          if(th.tc0>0&&th.tc0<T){
            c.beginPath();c.moveTo(px(t1),py1(th.init[p[0]]));c.lineTo(px(t1),py1(th.post[p[0]]));c.stroke();
            c.beginPath();c.moveTo(px(t1),py1(th.post[p[0]]));c.lineTo(px(T),py1(th.post[p[0]]));c.stroke();
          }
          c.restore();
        });
        if(th.tc0>0&&th.tc0<T){line(c,px(th.tc0),top,px(th.tc0),bot,'#D0C4E8',1,[3,3]);text(c,'共速 t='+th.tc0.toFixed(2)+'s',px(th.tc0)+4,top+10,'#8b6fb0',10);}
        line(c,px(Math.min(st.t,T)),top,px(Math.min(st.t,T)),bot,'#e8edf2',1,[3,3]);
        text(c,'— a₁ 上块',x1-4,top+4,'#FFB3BA',10,'right');text(c,'— a₂ 木板',x1-4,top+16,'#B8E8D0',10,'right');
        return;
      }
      // extIndex 0 / 2：v–t 双线 + 阴影(面积 = 相对滑动距离 L) + 共速点 + 当前游标
      var vmax=st.v0;
      for(var k=0;k<=60;k++){var vv0=theoryV(T*k/60);vmax=Math.max(vmax,vv0.v1,vv0.v2);}
      var vAxis=Math.max(6,Math.ceil(vmax*1.15/2)*2);
      function py(v){return bot-clamp01(v/vAxis)*(bot-top);}
      frame('t / s','v / (m/s)');
      text(c,'0',x0-4,bot,'#aab4c0',10,'right');
      text(c,String(vAxis),x0-4,top+4,'#aab4c0',10,'right');
      text(c,T.toFixed(1),x1,bot+12,'#aab4c0',10,'right');
      line(c,x0,py(st.v0),x1,py(st.v0),'#dfe6ee',1,[4,4]);   // v₀ 变化前参考虚线
      text(c,'v₀='+st.v0.toFixed(1),x0+4,py(st.v0)-7,'#aab4c0',10);
      var sh=slideHeat(),tEnd=sh.tEnd;
      c.save();c.beginPath();                                   // 两线之间阴影填充
      for(var i=0;i<=80;i++){var t=tEnd*i/80,vv=theoryV(t),X=px(t),Y=py(vv.v1);if(i===0)c.moveTo(X,Y);else c.lineTo(X,Y);}
      for(var j=80;j>=0;j--){var t2=tEnd*j/80,vv2=theoryV(t2);c.lineTo(px(t2),py(vv2.v2));}
      c.closePath();c.fillStyle='rgba(184,232,208,.45)';c.fill();c.restore();
      [['v1','#FFB3BA'],['v2','#B8E8D0']].forEach(function(p){  // 两条理论速度线
        c.save();c.beginPath();
        for(var i=0;i<=100;i++){var t=T*i/100,vv=theoryV(t),X=px(t),Y=py(vv[p[0]]);if(i===0)c.moveTo(X,Y);else c.lineTo(X,Y);}
        c.strokeStyle=p[1];c.lineWidth=2.5;c.stroke();c.restore();
      });
      if(th.tc0>0&&th.tc0<T){
        var cx=px(th.tc0),cy=py(th.vc);
        line(c,cx,top,cx,bot,'#D0C4E8',1,[3,3]);dot(c,cx,cy,5,'#D0C4E8','#fff');
        text(c,'共速 t='+th.tc0.toFixed(2)+'s',cx+6,top+10,'#8b6fb0',10);
      }
      text(c,'阴影面积 = 相对滑动距离 L',(x0+x1)/2,bot-10,'#3d8d6c',10,'center');
      text(c,'Q = f·L = μm₁g·L = '+sh.Q.toFixed(2)+' J',x0+4,bot-22,'#3d8d6c',10);
      var tnow=Math.max(0,Math.min(st.t,T));
      line(c,px(tnow),top,px(tnow),bot,'#e8edf2',1,[3,3]);
      dot(c,px(tnow),py(st.v1),5,'#FFB3BA','#fff');dot(c,px(tnow),py(st.v2),5,'#B8E8D0','#fff');
      text(c,'— v₁',x1-4,top+4,'#FFB3BA',10,'right');text(c,'— v₂',x1-4,top+16,'#B8E8D0',10,'right');
    }
    function set(k,v){var e=q('[data-read="'+k+'"]');if(e)e.textContent=v;}
    function update(){
      var d=calc(),th=theory(),sh=slideHeat();
      set('a1',d.a1.toFixed(2));set('a2',d.a2.toFixed(2));
      set('arel',Math.abs(d.a1-d.a2).toFixed(2));            // 相对加速度统一取大小
      set('v1',st.v1.toFixed(2));set('v2',st.v2.toFixed(2));
      set('tc',th.tc0>0?th.tc0.toFixed(2):'—');
      set('L',sh.L.toFixed(2));set('Q',sh.Q.toFixed(2));
      var tip=q('[data-tip]'),base=st.on==='lower'
        ?'设 v₁>v₂（F 作用于木板）：上块受摩擦向左 a₁=−f/m₁=−μg，木板受摩擦向右 a₂=(F+f)/m₂；若 v₂>v₁ 摩擦反向：a₁=+f/m₁，a₂=(F−f)/m₂。'
        :'设 v₁>v₂（F 作用于上块）：上块 a₁=(F−f)/m₁，木板 a₂=f/m₂；若 v₂>v₁ 摩擦反向：a₁=(F+f)/m₁，a₂=−f/m₂。';
      if(tip)tip.textContent=base+'共速后需「维持一起运动的静摩擦」≤ fₘ 才一起运动，否则摩擦反向、继续滑动；相对加速度取大小 |a₁−a₂|，L 为全过程 v–t 阴影面积（含共速后反向滑动段），Q=f·L=μm₁g·L。';
      if(extIndex===1){
        var stt=q('[data-status]');
        if(stt){stt.className='bp-status'+(d.slip?' slip':'');
          stt.textContent=d.slip
            ?'相对滑动（'+(d.sg>0?'v₁>v₂，上块相对木板向右':'v₂>v₁，木板相对上块向右')+'）：摩擦力方向与相对运动相反'
            :'保持相对静止：所需静摩擦 '+d.fActual.toFixed(2)+' N ≤ fₘ，一起以 a=F/(m₁+m₂) 加速';}
        var mx=Math.max(1,Math.abs(d.a1),Math.abs(d.a2),d.f),vals={a1:d.a1,a2:d.a2,f:d.fActual};
        Object.keys(vals).forEach(function(k){var b=q('[data-bar="'+k+'"]'),e=q('[data-barval="'+k+'"]');if(b)b.style.width=Math.min(100,Math.abs(vals[k])/mx*100).toFixed(1)+'%';if(e)e.textContent=vals[k].toFixed(2);});
      }
      if(extIndex===2){
        var cr=q('[data-cross]');
        if(cr)cr.textContent=th.tc0>0
          ?'两线在 t_c = '+th.tc0.toFixed(2)+' s 共速，v₁=v₂='+th.vc.toFixed(2)+' m/s；'+(th.together?'所需静摩擦 ≤ fₘ，此后一起运动':'所需静摩擦 > fₘ，此后摩擦反向、继续相对滑动')+'。阴影 L='+sh.L.toFixed(2)+' m，Q='+sh.Q.toFixed(2)+' J'
          :'当前参数下相对速度不减小，两线不相交、不会自然共速；阴影 L='+sh.L.toFixed(2)+' m，Q='+sh.Q.toFixed(2)+' J';
      }
    }
    var raf=0;
    function loop(now){if(!st.last)st.last=now;var dt=Math.min(.04,(now-st.last)/1000);st.last=now;
      if(st.running){
        var d=calc();                                   // 与读数/图形共用同一套物理分支
        var du0=st.v1-st.v2,nv1=st.v1+d.a1*dt,nv2=st.v2+d.a2*dt,du1=nv1-nv2;
        if(d.mode==='slip+'&&du0>0&&du1<=0){           // 本帧抵达共速点
          var th=theory(),vcom=(nv1+nv2)/2;
          if(th.together){st.v1=st.v2=vcom+th.aCommon*dt;}      // 静摩擦够：一起运动
          else{var sg2=st.on==='lower'?-1:1,a2=sliding(sg2);st.v1=st.v1+a2.a1*dt;st.v2=st.v2+a2.a2*dt;} // 不够：摩擦反向继续滑
        }else{st.v1=nv1;st.v2=nv2;}
        st.x1+=st.v1*dt;st.x2+=st.v2*dt;st.t+=dt;
        if(st.t>theory().T||Math.abs(st.x1-st.x2)>4)reset();
      }
      drawStage();drawChart();update();raf=global.requestAnimationFrame(loop);}
    raf=global.requestAnimationFrame(loop);
    return function cleanup(){global.cancelAnimationFrame(raf);dis.forEach(function(f){f();});dis.length=0;container.innerHTML='';};
  }};
})(window);
