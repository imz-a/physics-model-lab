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
.bp-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
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
    {id:'q1',title:'① 上块不滑的最大外力',label:'上块质量 m₁',min:.5,max:4,step:.5,val:1,unit:'kg',
      build:function(v){var m2=3,mu=.3,Fmax=mu*v*G*(v+m2)/m2;return{prompt:'m₁='+v.toFixed(1)+' kg、m₂=3 kg、μ=0.30，力作用在木板上，要使两块不相对滑动，F 最大约为？',
        opts:[Fmax.toFixed(1)+' N',(Fmax/2).toFixed(1)+' N',(2*Fmax).toFixed(1)+' N'],right:0,
        ex:'不滑时 a=F/(m₁+m₂)，上块靠摩擦加速：μm₁g ≥ m₁a → a ≤ μg；故 F ≤ μg(m₁+m₂) = '+Fmax.toFixed(1)+' N。'};}},
    {id:'q2',title:'② 相对加速度',label:'外力 F',min:4,max:30,step:2,val:12,unit:'N',
      build:function(v){var m1=1,m2=3,mu=.2,f=mu*m1*G,a1=f/m1,a2=(v-f)/m2,rel=Math.abs(a2-a1);return{prompt:'m₁=1 kg、m₂=3 kg、μ=0.20，F='+v+' N 作用于木板，两块相对加速度大小约为？',
        opts:[rel.toFixed(2)+' m/s²',(rel/2).toFixed(2)+' m/s²',(2*rel).toFixed(2)+' m/s²'],right:0,
        ex:'滑动摩擦 f=μm₁g='+f.toFixed(2)+' N；a₁=f/m₁='+a1.toFixed(2)+'，a₂=(F−f)/m₂='+a2.toFixed(2)+'，相对加速度 = '+rel.toFixed(2)+' m/s²。'};}}
  ];
  function quizHTML(){return '<div class="bp-card"><div class="bp-hd"><h4>高考题型 · 随堂练</h4><small>参数可调 · 即时判分</small></div>'+QUIZ.map(function(z){
    return '<div class="bp-quiz"><h5>'+z.title+'</h5><p data-qp="'+z.id+'"></p><div class="bp-ctrl"><label><span>'+z.label+'</span><b data-qo="'+z.id+'"></b></label><input class="bp-range" type="range" data-qs="'+z.id+'" min="'+z.min+'" max="'+z.max+'" step="'+z.step+'" value="'+z.val+'"></div><div class="bp-opts" data-qopts="'+z.id+'"></div><div class="bp-fb" data-qfb="'+z.id+'"></div><button type="button" class="bp-btn bp-exp" data-qexp="'+z.id+'">展开解析 ▾</button><div class="bp-explain" data-qex="'+z.id+'" hidden></div></div>';}).join('')+'</div>';}

  NS.modules['block-plate']={render:function(container,extIndex){
    extIndex=extIndex|0;if(extIndex<0||extIndex>3)extIndex=0;
    var intro=['摩擦力使上下两块 <b>加速度不同</b>','相对滑动：<b>Δa = a₁ − a₂</b>','v–t 交点即 <b>共速时刻</b>','先判相对滑动，再列牛顿方程'][extIndex];
    var extra=extIndex===1
      ?'<div class="bp-card"><div class="bp-hd"><h4>相对滑动</h4><small>判断运动状态</small></div><div class="bp-status" data-status></div>'
        +[['a1','上块 a₁','#FFB3BA'],['a2','木板 a₂','#B8E8D0'],['f','滑动摩擦 f','#D0C4E8']].map(function(p){return'<div class="bp-barrow" style="margin-top:9px"><span>'+p[1]+'</span><div class="bp-bartrack"><div class="bp-barfill" data-bar="'+p[0]+'" style="background:'+p[2]+'"></div></div><b class="bp-barval" data-barval="'+p[0]+'">—</b></div>';}).join('')
        +'<div class="bp-tip">地面光滑；最大静摩擦 fₘ = μm₁g。所需摩擦超过它，就发生相对滑动。</div></div>'
      :extIndex===2
        ?'<div class="bp-card"><div class="bp-hd"><h4>图像分析</h4><small>两线交点 = 共速</small></div><div class="bp-tip">上块（粉）v₁ = v₀ − μgt 线性减小；木板（绿）v₂ = a₂t 线性增大。交点时刻 t = v₀/(a₂ + μg)，此后若无相对滑动趋势则共同运动。</div><div class="bp-status" data-cross></div></div>'
        :extIndex===3?quizHTML():'';
    var chartTitle=['v–t 双线：物块与木板','a–t 对比','v–t 交点（共速点）','a₁、a₂ 随 F 变化'][extIndex];
    container.innerHTML=STYLE+'<div class="bp-wrap"><div class="bp-intro"><span class="bp-chip hot">'+intro+'</span><span class="bp-chip">地面光滑 · f = μm₁g</span><span class="bp-chip">读数为示意值</span></div>'
      +'<div class="bp-grid"><div><div class="bp-card"><div class="bp-hd"><h4>板块运动演示</h4><small>上块与木板发生相对滑动</small></div><canvas class="bp-cv" data-cv="stage"></canvas>'
      +'<div class="bp-legend"><span><i style="background:#FFB3BA"></i>上块 m₁</span><span><i style="background:#B8E8D0"></i>木板 m₂</span><span><i style="background:#FFD8A8"></i>外力 F</span></div></div>'
      +'<div class="bp-card"><div class="bp-hd"><h4>'+chartTitle+'</h4><small>随参数实时更新</small></div><canvas class="bp-cv chart" data-cv="chart"></canvas></div></div>'
      +'<div><div class="bp-card"><div class="bp-hd"><h4>参数调节</h4><small>拖动即时改变</small></div>'
      +[['m1','上块质量 m₁',.5,4,.5,1,'kg'],['m2','木板质量 m₂',.5,5,.5,3,'kg'],['mu','动摩擦因数 μ',.05,.6,.05,.2,''],['F','外力 F',0,30,1,12,'N'],['v0','上块初速度 v₀',0,10,.5,6,'m/s']]
        .map(function(r){return'<div class="bp-ctrl"><label><span>'+r[1]+'</span><b><span data-out="'+r[0]+'">'+r[5]+'</span> '+r[6]+'</b></label><input class="bp-range" type="range" data-slider="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'" value="'+r[5]+'"></div>';}).join('')
      +'<div class="bp-btns"><button type="button" class="bp-btn seg on" data-on="lower">F 作用于木板</button><button type="button" class="bp-btn seg" data-on="upper">F 作用于上块</button></div>'
      +'<div class="bp-btns"><button type="button" class="bp-btn main" data-btn="toggle">暂停</button><button type="button" class="bp-btn" data-btn="reset">重新放置</button></div></div>'
      +'<div class="bp-card"><div class="bp-hd"><h4>实时读数</h4><small>随运动刷新</small></div><div class="bp-reads">'
      +[['a1','上块 a₁ / (m/s²)',1],['a2','木板 a₂ / (m/s²)',1],['arel','相对加速度 / (m/s²)',1],['v1','上块速度 / (m/s)',0],['v2','木板速度 / (m/s)',0],['tc','共速时间 / s',0]]
        .map(function(r){return'<div class="bp-read'+(r[2]?' hl':'')+'"><span>'+r[1]+'</span><b data-read="'+r[0]+'">—</b></div>';}).join('')
      +'</div><div class="bp-tip">a₁ = f/m₁，a₂ = (F−f)/m₂（力作用于木板时）。</div></div>'+extra+'</div></div></div>';
    var q=function(s){return container.querySelector(s);},qa=function(s){return container.querySelectorAll(s);};
    var stage=mk(q('[data-cv="stage"]')),chart=mk(q('[data-cv="chart"]')),dis=[];
    function on(t,ty,fn,o){t.addEventListener(ty,fn,o);dis.push(function(){t.removeEventListener(ty,fn,o);});}
    var st={m1:1,m2:3,mu:.2,F:12,v0:6,on:'lower',v1:6,v2:0,x1:0,x2:0,t:0,running:true,last:0};
    function reset(){st.v1=st.v0;st.v2=0;st.x1=0;st.x2=0;st.t=0;}
    function fmax(){return st.mu*st.m1*G;}
    function calc(){
      var f=fmax(),a1,a2,slip;
      if(st.on==='lower'){
        var aCommon=st.F/(st.m1+st.m2),need=st.m1*aCommon;
        slip=need>f+1e-6||st.v1>st.v2+1e-6;
        if(slip){a1=-f/st.m1;a2=(st.F+f)/st.m2;}
        else{a1=aCommon;a2=aCommon;}
      }else{
        var aC=st.F/(st.m1+st.m2),need2=st.m2*aC;
        slip=need2>f+1e-6||st.v1>st.v2+1e-6;
        if(slip){a1=(st.F-f)/st.m1;a2=f/st.m2;}
        else{a1=aC;a2=aC;}
      }
      var tc=(st.v2-st.v1)/Math.max(1e-6,a1-a2);
      return {f:f,a1:a1,a2:a2,slip:slip,tc:tc>0?tc:0};
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
      var gy=h*.68,sc=Math.min(16,(w-150)/Math.max(8,st.v0*2.5));
      var px=w*.24+st.x2*sc,bx=px+18+st.x1*sc;
      line(c,16,gy+18,w-16,gy+18,'#cbd6e2',2);
      c.save();c.fillStyle='#DDF3E8';c.strokeStyle='#B8E8D0';c.lineWidth=2;c.beginPath();c.rect(px,gy-12,190,28);c.fill();c.stroke();c.restore();
      text(c,'木板 m₂',px+95,gy+2,'#4f9b78',12,'center');
      c.save();c.fillStyle='#FFB3BA';c.strokeStyle='#f28f9a';c.lineWidth=2;c.beginPath();c.rect(bx,gy-38,50,26);c.fill();c.stroke();c.restore();
      text(c,'m₁',bx+25,gy-25,'#fff',12,'center');
      if(extIndex===1&&st.x1!==st.x2){
        var y=gy-54;line(c,px+18,y,bx,y,'#FFD8A8',2,[4,3]);
        line(c,bx,y,bx-6,y-4,'#FFD8A8',2);line(c,bx,y,bx-6,y+4,'#FFD8A8',2);
        text(c,'相对位移 '+(st.x1-st.x2).toFixed(2)+' m',(px+bx)/2,y-10,'#e0a458',11,'center');
      }
      var d=calc(),fx=st.on==='lower'?px+95:bx+25,fy=st.on==='lower'?gy+16:gy-52;
      arrow(c,fx,fy,fx+Math.max(18,Math.min(70,st.F*2)),fy,'#FFD8A8','F');
      text(c,'a₁='+d.a1.toFixed(2)+'　a₂='+d.a2.toFixed(2),w-12,18,'#5a6472',12,'right');
    }
    function drawChart(){
      fit(chart);var c=chart.ctx,w=chart.w,h=chart.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var x0=38,x1=w-14,top=14,bot=h-24,d=calc();line(c,x0,bot,x1,bot,'#cbd6e2',1);line(c,x0,top,x0,bot,'#cbd6e2',1);
      var T=Math.max(2,Math.min(6,d.tc||3)),vmax=Math.max(st.v0,3)*1.15;
      function px(t){return x0+t/T*(x1-x0);}function py(v){return bot-Math.max(0,v)/vmax*(bot-top);}
      if(extIndex===3){
        c.save();c.beginPath();for(var i=0;i<=50;i++){var F=30*i/50,f=fmax(),a1=(F-f)/st.m1,a2=f/st.m2,y=bot-(a1-a2)/12*(bot-top);if(i===0)c.moveTo(x0,y);else c.lineTo(x0+i/50*(x1-x0),y);}c.strokeStyle='#FFB3BA';c.lineWidth=2.4;c.stroke();c.restore();
        line(c,x0,bot,x1,bot,'#e8edf2',1,[3,3]);text(c,'相对加速度 a₁−a₂',x0+6,top+6,'#c07884',11);return;
      }
      c.save();c.beginPath();c.moveTo(x0,py(st.v0));c.lineTo(px(T),py(st.v0+d.a1*T));c.strokeStyle='#FFB3BA';c.lineWidth=2.5;c.stroke();c.restore();
      c.save();c.beginPath();c.moveTo(x0,py(0));c.lineTo(px(T),py(d.a2*T));c.strokeStyle='#B8E8D0';c.lineWidth=2.5;c.stroke();c.restore();
      if(extIndex===2&&d.tc>0&&d.tc<T){
        var cx=px(d.tc),cy=py(st.v0+d.a1*d.tc);
        line(c,cx,top,cx,bot,'#D0C4E8',1,[3,3]);dot(c,cx,cy,6,'#D0C4E8','#fff');
        text(c,'共速 t='+d.tc.toFixed(2)+'s',cx+8,top+8,'#8b6fb0',11);
      }
      if(extIndex===0||extIndex===2){var tnow=Math.min(st.t,T);line(c,px(tnow),top,px(tnow),bot,'#e8edf2',1,[3,3]);dot(c,px(tnow),py(st.v1),5,'#FFB3BA','#fff');dot(c,px(tnow),py(st.v2),5,'#B8E8D0','#fff');}
      text(c,'t/s',x1,h-8,'#8b95a3',11,'right');text(c,'v',x0+3,top+4,'#8b95a3',11);
    }
    function set(k,v){var e=q('[data-read="'+k+'"]');if(e)e.textContent=v;}
    function update(){var d=calc();set('a1',d.a1.toFixed(2));set('a2',d.a2.toFixed(2));set('arel',(d.a1-d.a2).toFixed(2));set('v1',st.v1.toFixed(2));set('v2',st.v2.toFixed(2));set('tc',d.tc.toFixed(2));
      if(extIndex===1){var stt=q('[data-status]');if(stt){stt.className='bp-status'+(d.slip?' slip':'');stt.textContent=d.slip?'发生相对滑动：两物块加速度不同':'保持相对静止：两物块一起加速';}
        var mx=Math.max(1,Math.abs(d.a1),Math.abs(d.a2),d.f),vals={a1:d.a1,a2:d.a2,f:d.f};Object.keys(vals).forEach(function(k){var b=q('[data-bar="'+k+'"]'),e=q('[data-barval="'+k+'"]');if(b)b.style.width=Math.min(100,Math.abs(vals[k])/mx*100).toFixed(1)+'%';if(e)e.textContent=vals[k].toFixed(2);});}
      if(extIndex===2){var cr=q('[data-cross]');if(cr)cr.textContent=d.tc>0?'两线在 t = '+d.tc.toFixed(2)+' s 相交，此时 v₁ = v₂ = '+(st.v0+d.a1*d.tc).toFixed(2)+' m/s':'当前参数下两线不相交，无法自然共速';}
    }
    var raf=0;
    function loop(now){if(!st.last)st.last=now;var dt=Math.min(.04,(now-st.last)/1000);st.last=now;
      if(st.running){var d=calc();if(st.v1>st.v2){st.v1+=d.a1*dt;st.v2+=d.a2*dt;}else{st.v1=st.v2+=st.F/(st.m1+st.m2)*dt;}
        st.x1+=st.v1*dt;st.x2+=st.v2*dt;st.t+=dt;if(st.t>5||Math.abs(st.x1-st.x2)>4)reset();}
      drawStage();drawChart();update();raf=global.requestAnimationFrame(loop);}
    raf=global.requestAnimationFrame(loop);
    return function cleanup(){global.cancelAnimationFrame(raf);dis.forEach(function(f){f();});dis.length=0;container.innerHTML='';};
  }};
})(window);
