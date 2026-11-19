/* connected-bodies.js — 连接体交互模块（IIFE，无外部依赖） */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};
  var G = 9.8;
  var STYLE = `<style>
.co-wrap{color:var(--ink,#3a4250);font-size:15px}
.co-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.co-grid{grid-template-columns:1fr}}
.co-card{background:#fff;border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.co-card+.co-card{margin-top:14px}
.co-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.co-hd h4{font-size:16px;font-weight:700}.co-hd small{font-size:12px;color:var(--ink-3,#8b95a3)}
canvas.co-cv{display:block;width:100%;height:200px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.co-cv.chart{height:146px}
.co-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.co-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.co-chip.hot{background:#F7F4FC;border-color:#D0C4E8}.co-chip b{color:var(--ink,#3a4250)}
.co-ctrl{margin-top:9px}.co-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.co-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.co-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.co-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.co-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#D0C4E8;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.co-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.co-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#D0C4E8;border:3px solid #fff}
.co-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.co-btn{min-height:36px;padding:6px 13px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;font-size:13px;font-weight:600}
.co-btn:hover{border-color:#D0C4E8;background:#F7F4FC}
.co-btn.main{background:#F7F4FC;border-color:#D0C4E8}
.co-btn.seg.on{background:#F7F4FC;border-color:#D0C4E8;color:#6e57a0}
.co-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.co-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px}
.co-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.co-read b{font-size:16px;font-variant-numeric:tabular-nums}
.co-read.hl{background:#F7F4FC;border-color:#DED2EE}
.co-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.co-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.co-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.co-eq{padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:13px;line-height:1.9;color:#6e57a0}
.co-status{margin-top:10px;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;background:#F1FBF6;border:1px solid #B8E8D0;color:#3d8d6c}
.co-status.stop{background:#FFF8EE;border-color:#FFD8A8;color:#a67838}
.co-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:12px;padding-top:10px}
.co-quiz h5{font-size:14px;margin:0 0 6px}.co-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 7px}
.co-opts{display:flex;gap:7px;flex-wrap:wrap}
.co-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.co-opt:hover{border-color:#D0C4E8;background:#F7F4FC}
.co-fb{margin-top:7px;font-size:12.5px;min-height:18px;line-height:1.6}.co-fb.ok{color:#2f8f68}.co-fb.no{color:#c26b7a}
.co-exp{margin-top:7px;min-height:32px;padding:4px 11px;font-size:12px}
.co-explain{margin-top:7px;padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:12.5px;line-height:1.7;color:#6e57a0}
.co-explain[hidden]{display:none}
</style>`;
  function line(c,a1,b1,a2,b2,col,w,d){var g=c.ctx||c;g.save();g.beginPath();if(d)g.setLineDash(d);g.strokeStyle=col;g.lineWidth=w||1;g.moveTo(a1,b1);g.lineTo(a2,b2);g.stroke();g.restore();}
  function text(c,s,x,y,col,sz,al){var g=c.ctx||c;g.save();g.fillStyle=col||'#8b95a3';g.font=(sz||12)+'px "PingFang SC","Microsoft YaHei",sans-serif';g.textAlign=al||'left';g.textBaseline='middle';g.fillText(s,x,y);g.restore();}
  function dot(c,x,y,r,f,s){var g=c.ctx||c;g.save();g.beginPath();g.arc(x,y,r,0,6.2832);g.fillStyle=f;g.fill();if(s){g.lineWidth=2;g.strokeStyle=s;g.stroke();}g.restore();}
  function mk(el){return{el:el,ctx:el.getContext('2d'),w:0,h:0,dpr:0};}
  function fit(c){var w=c.el.clientWidth,h=c.el.clientHeight,d=Math.min(global.devicePixelRatio||1,2);if(w&&h&&(w!==c.w||h!==c.h||d!==c.dpr)){c.w=w;c.h=h;c.dpr=d;c.el.width=Math.round(w*d);c.el.height=Math.round(h*d);c.ctx.setTransform(d,0,0,d,0,0);}return c;}
  function arrow(c,x1,y1,x2,y2,col,lab){line(c,x1,y1,x2,y2,col,2.5);var a=Math.atan2(y2-y1,x2-x1),g=c.ctx||c,s=8;g.save();g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-s*Math.cos(a-.45),y2-s*Math.sin(a-.45));g.lineTo(x2-s*Math.cos(a+.45),y2-s*Math.sin(a+.45));g.closePath();g.fillStyle=col;g.fill();g.restore();if(lab)text(c,lab,x2+7,y2-6,col,12);}

  var QUIZ=[
    {id:'q1',title:'① 水平整体加速度',label:'外力 F',min:5,max:40,step:5,val:20,unit:'N',
      build:function(v){var m1=1,m2=3,mu=.2,crit=mu*(m1+m2)*G,a=Math.max(0,(v-crit)/(m1+m2));return{prompt:'m₁=1 kg、m₂=3 kg、μ=0.20，F='+v+' N，两物块共同加速度约为？',
        opts:[a.toFixed(2)+' m/s²',(a+1).toFixed(2)+' m/s²',(a+2).toFixed(2)+' m/s²'],right:0,
        ex:'整体法：a = [F − μ(m₁+m₂)g]/(m₁+m₂) = ('+v+'−7.84)/4 = '+a.toFixed(2)+' m/s²。'+(v<=crit?'（F ≤ 7.84 N 不足以克服最大静摩擦，系统静止，a=0）':'')};}},
    {id:'q2',title:'② 绳的张力',label:'外力 F',min:5,max:40,step:5,val:20,unit:'N',
      build:function(v){var m1=1,m2=3,mu=.2,crit=mu*(m1+m2)*G,a=Math.max(0,(v-crit)/(m1+m2)),T=v<=crit?v*m1/(m1+m2):m1*a+mu*m1*G;return{prompt:'同上参数，连接两块的绳张力 T 约为？',
        opts:[T.toFixed(2)+' N',(T+1).toFixed(2)+' N',(T+2).toFixed(2)+' N'],right:0,
        ex:v<=crit?'F 未超过临界：整体静止，静摩擦按质量分配，T = F·m₁/(m₁+m₂) = '+T.toFixed(2)+' N。':'隔离 m₁：T − μm₁g = m₁a，故 T = m₁a + μm₁g = '+T.toFixed(2)+' N。'};}}
  ];
  function quizHTML(){return '<div class="co-card"><div class="co-hd"><h4>高考题型 · 随堂练</h4><small>参数可调 · 即时判分</small></div>'+QUIZ.map(function(z){
    return '<div class="co-quiz"><h5>'+z.title+'</h5><p data-qp="'+z.id+'"></p><div class="co-ctrl"><label><span>'+z.label+'</span><b data-qo="'+z.id+'"></b></label><input class="co-range" type="range" data-qs="'+z.id+'" min="'+z.min+'" max="'+z.max+'" step="'+z.step+'" value="'+z.val+'"></div><div class="co-opts" data-qopts="'+z.id+'"></div><div class="co-fb" data-qfb="'+z.id+'"></div><button type="button" class="co-btn co-exp" data-qexp="'+z.id+'">展开解析 ▾</button><div class="co-explain" data-qex="'+z.id+'" hidden></div></div>';}).join('')+'</div>';}

  NS.modules['connected-bodies']={render:function(container,extIndex){
    extIndex=extIndex|0;if(extIndex<0||extIndex>3)extIndex=0;
    var intro=['整体法 <b>a = [F − f₁ − f₂]/(m₁+m₂)</b>','隔离法 <b>T = m₁a + f₁</b>','临界：<b>恰好不滑动</b>的条件','先整体求 a，再隔离求 T'][extIndex];
    var extra=extIndex===1
      ?'<div class="co-card"><div class="co-hd"><h4>分析视角</h4><small>点击切换高亮对象</small></div><div class="co-btns">'
        +['all|整体','one|隔离 m₁','two|隔离 m₂'].map(function(s,i){var p=s.split('|');return'<button type="button" class="co-btn seg'+(i===0?' on':'')+'" data-view="'+p[0]+'">'+p[1]+'</button>';}).join('')
        +'</div><div class="co-eq" data-eq></div></div>'
      :extIndex===2
        ?'<div class="co-card"><div class="co-hd"><h4>临界问题</h4><small>找出恰好不滑动的边界</small></div><div class="co-status" data-status></div><div class="co-eq" data-crit></div></div>'
        :extIndex===3?quizHTML():'';
    var chartTitle=['a–F 关系曲线','张力 T 随 F 变化','临界条件示意','a–F 关系曲线'][extIndex];
    container.innerHTML=STYLE+'<div class="co-wrap"><div class="co-intro"><span class="co-chip hot">'+intro+'</span><span class="co-chip">绳张力处处相等</span><span class="co-chip">光滑面时 a = F/(m₁+m₂)</span></div>'
      +'<div class="co-grid"><div><div class="co-card"><div class="co-hd"><h4>连接体运动演示</h4><small>整体同加速度，绳传递拉力</small></div><canvas class="co-cv" data-cv="stage"></canvas>'
      +'<div class="co-legend"><span><i style="background:#FFB3BA"></i>物块 m₁</span><span><i style="background:#B8E8D0"></i>物块 m₂</span><span><i style="background:#D0C4E8"></i>绳张力 T</span><span><i style="background:#FFD8A8"></i>外力 F</span></div></div>'
      +'<div class="co-card"><div class="co-hd"><h4>'+chartTitle+'</h4><small>随参数实时更新</small></div><canvas class="co-cv chart" data-cv="chart"></canvas></div></div>'
      +'<div><div class="co-card"><div class="co-hd"><h4>参数调节</h4><small>拖动即时改变</small></div>'
      +[['m1','物块质量 m₁',.5,4,.5,1,'kg'],['m2','物块质量 m₂',.5,5,.5,3,'kg'],['F','外力 F',0,40,1,20,'N'],['mu','动摩擦因数 μ',0,.6,.05,.2,'']]
        .map(function(r){return'<div class="co-ctrl"><label><span>'+r[1]+'</span><b><span data-out="'+r[0]+'">'+r[5]+'</span> '+r[6]+'</b></label><input class="co-range" type="range" data-slider="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'" value="'+r[5]+'"></div>';}).join('')
      +'<div class="co-btns"><button type="button" class="co-btn seg on" data-scene="horizontal">水平面</button><button type="button" class="co-btn seg" data-scene="incline">斜面+悬挂</button></div>'
      +'<div class="co-btns"><button type="button" class="co-btn main" data-btn="toggle">暂停</button><button type="button" class="co-btn" data-btn="reset">重新释放</button></div></div>'
      +'<div class="co-card"><div class="co-hd"><h4>实时读数</h4><small>随运动刷新</small></div><div class="co-reads">'
      +[['a','整体加速度 a / (m/s²)',1],['T','绳张力 T / N',1],['v','当前速度 / (m/s)',1],['f1','m₁ 摩擦 / N（静止时为静摩擦）',0],['f2','m₂ 摩擦 / N（静止时为静摩擦）',0],['s','位移 s / m',0]]
        .map(function(r){return'<div class="co-read'+(r[2]?' hl':'')+'"><span>'+r[1]+'</span><b data-read="'+r[0]+'">—</b></div>';}).join('')
      +'</div><div class="co-tip">先整体法求共同加速度，再隔离某一物块求绳张力。</div></div>'+extra+'</div></div></div>';
    var q=function(s){return container.querySelector(s);},qa=function(s){return container.querySelectorAll(s);};
    var stage=mk(q('[data-cv="stage"]')),chart=mk(q('[data-cv="chart"]')),dis=[];
    function on(t,ty,fn,o){t.addEventListener(ty,fn,o);dis.push(function(){t.removeEventListener(ty,fn,o);});}
    var st={m1:1,m2:3,F:20,mu:.2,scene:'horizontal',view:'all',s:0,v:0,t:0,running:true,last:0};
    var TH=30*Math.PI/180;
    function calc(){
      if(st.scene==='horizontal'){
        var drive=st.F-st.mu*(st.m1+st.m2)*G;
        var crit=st.mu*(st.m1+st.m2)*G;
        if(drive<=0){
          // 外力不足以克服最大静摩擦：整体静止，静摩擦按质量分配且 f₁+f₂=F
          var fs1=st.F*st.m1/(st.m1+st.m2),fs2=st.F*st.m2/(st.m1+st.m2);
          return {a:0,T:fs1,f1:fs1,f2:fs2,drive:drive,crit:crit,static:true};
        }
        return {a:drive/(st.m1+st.m2),T:st.m1*drive/(st.m1+st.m2)+st.mu*st.m1*G,f1:st.mu*st.m1*G,f2:st.mu*st.m2*G,drive:drive,crit:crit,static:false};
      }
      var diff=st.m2*G-st.m1*G*Math.sin(TH),fr=st.mu*st.m1*G*Math.cos(TH);
      var a2;
      if(diff>fr)a2=(diff-fr)/(st.m1+st.m2);
      else if(diff<-fr)a2=(diff+fr)/(st.m1+st.m2);
      else a2=0;
      // 静止时静摩擦恰好平衡重力差与绳拉力之差（|diff|，可为零）；
      // 只有真正滑动时才取滑动摩擦 μm₁gcosθ。
      var f1=Math.abs(diff)<=fr?Math.abs(diff):fr;
      return {a:a2,T:st.m2*G-st.m2*a2,f1:f1,f2:0,drive:diff,crit:fr};
    }
    function reset(){st.s=0;st.v=0;st.t=0;}
    // 「变化前」基准曲线（μ 改变前），灰色虚线保留作对照
    var refMu=st.mu;
    qa('[data-slider]').forEach(function(el){var k=el.getAttribute('data-slider');on(el,'input',function(){if(k==='mu')refMu=st.mu;st[k]=parseFloat(el.value);q('[data-out="'+k+'"]').textContent=(k==='mu'?st[k].toFixed(2):String(st[k]));reset();});});
    qa('[data-scene]').forEach(function(b){on(b,'click',function(){st.scene=b.getAttribute('data-scene');
      var fsl=q('[data-slider="F"]');if(fsl){fsl.disabled=st.scene==='incline';fsl.title=st.scene==='incline'?'斜面模型由重力差驱动，与 F 无关':'';if(fsl.parentNode)fsl.parentNode.style.opacity=st.scene==='incline'?'.45':'1';}
      qa('[data-scene]').forEach(function(x){x.classList.toggle('on',x===b);});reset();});});
    qa('[data-view]').forEach(function(b){on(b,'click',function(){st.view=b.getAttribute('data-view');qa('[data-view]').forEach(function(x){x.classList.toggle('on',x===b);});refreshView();});});
    var tg=q('[data-btn="toggle"]');on(tg,'click',function(){st.running=!st.running;tg.textContent=st.running?'暂停':'继续';tg.classList.toggle('main',st.running);});
    on(q('[data-btn="reset"]'),'click',reset);
    function refreshView(){
      var d=calc(),e=q('[data-eq]');if(!e)return;
      var map={
        all:'整体法：F − f₁ − f₂ = (m₁+m₂)a<br>代入得 <b>a = '+d.a.toFixed(2)+' m/s²</b>（加速度对外力即时响应）',
        one:'隔离 m₁：T − f₁ = m₁a<br><b>T = m₁a + f₁ = '+d.T.toFixed(2)+' N</b>',
        two:'隔离 m₂：F − T − f₂ = m₂a<br><b>T = F − f₂ − m₂a = '+(st.F-d.f2-st.m2*d.a).toFixed(2)+' N</b>（与左侧一致）'};
      e.innerHTML=map[st.scene==='incline'&&st.view==='two'?'one':st.view];
      if(st.scene==='incline')e.innerHTML=st.view==='all'?'斜面整体：m₂g − m₁g sinθ − f = (m₁+m₂)a<br><b>a = '+d.a.toFixed(2)+' m/s²</b>':st.view==='one'?'隔离 m₁：T − m₁g sinθ − f = m₁a<br><b>T = '+d.T.toFixed(2)+' N</b>':'隔离 m₂：m₂g − T = m₂a<br><b>T = m₂g − m₂a = '+d.T.toFixed(2)+' N</b>';
    }
    if(extIndex===1)refreshView();
    if(extIndex===2){function refreshCrit(){var d=calc(),el=q('[data-status]'),box=q('[data-crit]');if(!el)return;var moving=Math.abs(d.a)>0.01;el.className='co-status'+(moving?'':' stop');el.textContent=moving?(st.scene==='horizontal'?'外力超过临界值，整体加速中':'重力差超过静摩擦上限，系统运动中'):(st.scene==='horizontal'&&d.static?'外力不足以克服最大静摩擦，系统保持静止（f₁+f₂=F）':'恰好处于临界状态：保持静止 / 匀速');box.innerHTML=st.scene==='horizontal'?'水平面临界外力 <b>F临 = μ(m₁+m₂)g = '+d.crit.toFixed(2)+' N</b><br>当前 F = '+st.F.toFixed(0)+' N':'斜面临界静摩擦 <b>f临 = μm₁g cosθ = '+d.crit.toFixed(2)+' N</b><br>重力差 = '+d.drive.toFixed(2)+' N';}
      refreshCrit();qa('[data-slider]').forEach(function(el){on(el,'input',refreshCrit);});qa('[data-scene]').forEach(function(b){on(b,'click',function(){setTimeout(refreshCrit,0);});});}
    if(extIndex===3){
      QUIZ.forEach(function(z){function refresh(){var d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));q('[data-qp="'+z.id+'"]').textContent=d.prompt;q('[data-qo="'+z.id+'"]').textContent=q('[data-qs="'+z.id+'"]').value+' N';q('[data-qopts="'+z.id+'"]').innerHTML=d.opts.map(function(o,i){return'<button type="button" class="co-opt" data-q="'+z.id+'" data-i="'+i+'">'+o+'</button>';}).join('');q('[data-qfb="'+z.id+'"]').textContent='';q('[data-qex="'+z.id+'"]').hidden=true;}
        refresh();on(q('[data-qs="'+z.id+'"]'),'input',refresh);on(q('[data-qexp="'+z.id+'"]'),'click',function(e){var box=q('[data-qex="'+z.id+'"]'),d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));box.hidden=!box.hidden;box.textContent=d.ex;e.target.textContent=box.hidden?'展开解析 ▾':'收起解析 ▴';});});
      qa('[data-q]').forEach(function(b){on(b,'click',function(){var id=b.getAttribute('data-q'),i=+b.getAttribute('data-i'),z=QUIZ.filter(function(x){return x.id===id;})[0],d=z.build(parseFloat(q('[data-qs="'+id+'"]').value)),fb=q('[data-qfb="'+id+'"]'),ok=i===d.right;fb.className='co-fb '+(ok?'ok':'no');fb.textContent=ok?'✓ 正确！':'✗ 再想想，点「展开解析」看思路。';});});
    }
    function block(c,x,y,w,h,col,label){c.save();c.fillStyle=col;c.strokeStyle='rgba(88,108,132,.25)';c.lineWidth=1.5;c.beginPath();c.rect(x,y-h,w,h);c.fill();c.stroke();c.restore();text(c,label,x+w/2,y-h/2,'#fff',13,'center');}
    function drawStage(){
      fit(stage);var c=stage.ctx,w=stage.w,h=stage.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var d=calc(),dispx=Math.max(-150,Math.min(150,st.s*22));   // 允许 a<0 时向左运动
      if(st.scene==='horizontal'){
        var gy=h*.66;line(c,20,gy,w-20,gy,'#cbd6e2',2);
        for(var i=30;i<w-20;i+=18)line(c,i,gy+2,i-8,gy+9,'#e8edf2',1);
        block(c,50+dispx,gy,52,32,'#FFB3BA','m₁');block(c,168+dispx,gy,52,32,'#B8E8D0','m₂');
        line(c,102+dispx,gy-16,168+dispx,gy-16,'#D0C4E8',2);text(c,'T='+d.T.toFixed(1)+' N',135+dispx,gy-28,'#8b6fb0',11,'center');
        arrow(c,220+dispx,gy-16,270+dispx,gy-16,'#FFD8A8','F');
        if(extIndex===1){var hi=st.view==='one'?0:st.view==='two'?1:-1;if(hi>=0){c.save();c.strokeStyle='#D0C4E8';c.lineWidth=3;c.strokeRect((hi?168:50)+dispx-6,gy-38,64,44);c.restore();}}
        // m₁ 受 F 向右拉，摩擦力向左（滑动时与相对运动反向）；静止时 f₁ 也向左平衡 T
        arrow(c,76+dispx,gy+4,76+dispx-Math.max(10,d.f1*2),gy+4,'#BFE3F5','f₁');
      }else{
        var px=w*.32,py=h*.24,Lp=Math.min(w*.42/Math.cos(TH),h*.5/Math.sin(TH));
        var ex=px+Lp*Math.cos(TH),ey=py+Lp*Math.sin(TH);
        line(c,px,py,ex,ey,'#E7B87E',3);dot(c,ex,ey-16,10,'#fff','#D0C4E8');
        var along=Math.max(-Lp+40,Math.min(Lp-40,dispx));var bx=px+along*Math.cos(TH),by=py+along*Math.sin(TH);
        block(c,bx-16,by+10,34,24,'#FFB3BA','m₁');
        line(c,bx+10,by-4,ex,ey-26,'#D0C4E8',2);line(c,ex,ey-26,ex,ey+20,'#D0C4E8',2);
        block(c,ex+12,Math.max(30,Math.min(h-30,ey+20+dispx)),34,28,'#B8E8D0','m₂');
        arrow(c,bx+16,by-10,bx+16+d.T*1.2*Math.cos(TH),by-10-d.T*1.2*Math.sin(TH),'#D0C4E8','T');
        arrow(c,ex+29,ey+40,ex+29,ey+70,'#BFE3F5','m₂g');
      }
      text(c,'a = '+d.a.toFixed(2)+' m/s²　T = '+d.T.toFixed(2)+' N',w-12,18,'#5a6472',12,'right');
    }
    function drawChart(){
      fit(chart);var c=chart.ctx,w=chart.w,h=chart.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var x0=48,x1=w-14,top=16,bot=h-28,d=calc();
      line(c,x0,bot,x1,bot,'#cbd6e2',1);line(c,x0,top,x0,bot,'#cbd6e2',1);
      function clamp01(u){return Math.max(0,Math.min(1,u));}
      function frame(xlab,ylab){text(c,xlab,x1,h-8,'#8b95a3',11,'right');text(c,ylab,x0+2,top+4,'#8b95a3',10);text(c,'0',x0-4,bot+1,'#aab4c0',10,'right');}
      // 斜面模型：外力 F 与系统无关，改画 a–m₂ 曲线（横轴 m₂/kg）
      if(st.scene==='incline'){
        function accIncline(m2){var diff=m2*G-st.m1*G*Math.sin(TH),fr=st.mu*st.m1*G*Math.cos(TH);
          if(diff>fr)return(diff-fr)/(st.m1+m2);if(diff<-fr)return(diff+fr)/(st.m1+m2);return 0;}
        function accRef(m2){var diff=m2*G-st.m1*G*Math.sin(TH),fr=refMu*st.m1*G*Math.cos(TH);
          if(diff>fr)return(diff-fr)/(st.m1+m2);if(diff<-fr)return(diff+fr)/(st.m1+m2);return 0;}
        var vals=[];for(var k0=0;k0<=60;k0++)vals.push(accIncline(.5+4.5*k0/60));
        var aMax=Math.max(1,Math.max.apply(null,vals.map(Math.abs))*1.15);  // 曲线理论量程，不用常数 8
        function px(m2){return x0+(m2-.5)/4.5*(x1-x0);}
        function py(a){return bot-clamp01((a+aMax)/(2*aMax))*(bot-top);}
        frame('m₂ / kg','a / (m·s⁻²)');
        line(c,x0,py(0),x1,py(0),'#e8edf2',1,[3,3]);
        text(c,'0',x0-4,py(0),'#aab4c0',10,'right');text(c,'+'+aMax.toFixed(1),x0-4,top+4,'#aab4c0',10,'right');text(c,'−'+aMax.toFixed(1),x0-4,bot-2,'#aab4c0',10,'right');
        [.5,2,3.5,5].forEach(function(m){text(c,m.toFixed(1),px(m),bot+12,'#aab4c0',10,'center');});
        if(Math.abs(refMu-st.mu)>1e-6){c.save();c.beginPath();for(var r=0;r<=60;r++){var m2r=.5+4.5*r/60,X=px(m2r),Y=py(accRef(m2r));if(r===0)c.moveTo(X,Y);else c.lineTo(X,Y);}c.strokeStyle='#b9c2cc';c.lineWidth=1.8;c.setLineDash([5,4]);c.stroke();c.restore();text(c,'变化前 μ='+refMu.toFixed(2),x0+6,top+16,'#9aa4b0',10);}
        c.save();c.beginPath();for(var k=0;k<=60;k++){var m2k=.5+4.5*k/60,Xk=px(m2k),Yk=py(accIncline(m2k));if(k===0)c.moveTo(Xk,Yk);else c.lineTo(Xk,Yk);}c.strokeStyle='#D0C4E8';c.lineWidth=2.5;c.stroke();c.restore();
        line(c,px(st.m2),top,px(st.m2),bot,'#FFB3BA',1,[3,3]);dot(c,px(st.m2),py(d.a),5,'#FFB3BA','#fff');
        text(c,'斜面由重力差驱动，与 F 无关',x0+6,bot-12,'#a67838',10);
        return;
      }
      // 水平面 a–F（与 T–F）：纵轴用理论量程，不随曲线数值自我归一化
      var Fmax=40,aMax=Math.max(1,Fmax/(st.m1+st.m2)),TMax=Math.max(1,st.m1*Fmax/(st.m1+st.m2));
      function pxF(F){return x0+F/Fmax*(x1-x0);}
      function pyA(a){return bot-clamp01(a/aMax)*(bot-top);}
      function pyT(T){return bot-clamp01(T/TMax)*(bot-top);}
      function accF(F,mu){return Math.max(0,(F-mu*(st.m1+st.m2)*G)/(st.m1+st.m2));}
      frame('F / N',extIndex===1?'a / (m·s⁻²) · T / N':'a / (m·s⁻²)');
      text(c,aMax.toFixed(1),x0-4,top+4,'#aab4c0',10,'right');text(c,'40',x1,bot+12,'#aab4c0',10,'right');
      if(Math.abs(refMu-st.mu)>1e-6){c.save();c.beginPath();for(var r=0;r<=60;r++){var Fr=Fmax*r/60,X=pxF(Fr),Y=pyA(accF(Fr,refMu));if(r===0)c.moveTo(X,Y);else c.lineTo(X,Y);}c.strokeStyle='#b9c2cc';c.lineWidth=1.8;c.setLineDash([5,4]);c.stroke();c.restore();text(c,'变化前 μ='+refMu.toFixed(2),x0+6,top+16,'#9aa4b0',10);}
      c.save();c.beginPath();for(var i=0;i<=60;i++){var Fi=Fmax*i/60,X=pxF(Fi),Y=pyA(accF(Fi,st.mu));if(i===0)c.moveTo(X,Y);else c.lineTo(X,Y);}c.strokeStyle='#D0C4E8';c.lineWidth=2.5;c.stroke();c.restore();
      if(extIndex===1){
        c.save();c.beginPath();for(var j=0;j<=60;j++){var Fj=Fmax*j/60,Xj=pxF(Fj),Yj=pyT(st.m1*Fj/(st.m1+st.m2));if(j===0)c.moveTo(Xj,Yj);else c.lineTo(Xj,Yj);}c.strokeStyle='#B8E8D0';c.lineWidth=2.4;c.stroke();c.restore();
        text(c,'紫：a (m/s²)　绿：T (N)，两线量纲不同',x1-4,top+4,'#8b95a3',10,'right');
      }
      if(extIndex===2){var fc=Math.min(st.mu*(st.m1+st.m2)*G,Fmax),cx=pxF(fc);line(c,cx,top,cx,bot,'#FFB3BA',2,[4,4]);text(c,'F临='+d.crit.toFixed(1)+' N',Math.min(cx+6,x1-72),top+8,'#c07884',11);}
      var cur=pxF(Math.min(Fmax,st.F));line(c,cur,top,cur,bot,'#e8edf2',1,[3,3]);dot(c,cur,pyA(d.a),5,'#D0C4E8','#fff');
    }
    function set(k,v){var e=q('[data-read="'+k+'"]');if(e)e.textContent=v;}
    function update(){var d=calc();set('a',d.a.toFixed(2));set('T',d.T.toFixed(2));set('v',st.v.toFixed(2));set('f1',d.f1.toFixed(2));set('f2',d.f2.toFixed(2));set('s',st.s.toFixed(2));
      var tip=q('[data-tip]');if(tip)tip.textContent=d.static&&st.scene==='horizontal'
        ?'F='+st.F.toFixed(0)+' N ≤ F临='+d.crit.toFixed(2)+' N：整体静止，静摩擦按质量分配 f₁='+d.f1.toFixed(2)+' N、f₂='+d.f2.toFixed(2)+' N（均 ≤ μN），且 f₁+f₂=F；绳张力 T=f₁。'
        :st.scene==='incline'?'斜面模型由 m₂g 与 m₁g sinθ 的重力差驱动，与外力 F 无关；a–m₂ 图已按此重绘。':'先整体法求共同加速度 a=[F−μ(m₁+m₂)g]/(m₁+m₂)，再隔离求绳张力；图中紫线按 a 轴、绿线按 T 轴（量纲不同）。';
      if(extIndex===1&&st.view)refreshView();
    }
    var raf=0;
    function loop(now){if(!st.last)st.last=now;var dt=Math.min(.04,(now-st.last)/1000);st.last=now;var d=calc();if(st.running){st.v+=d.a*dt;st.s+=st.v*dt;st.t+=dt;if(st.s>5||st.s<-5)reset();}drawStage();drawChart();update();raf=global.requestAnimationFrame(loop);}
    raf=global.requestAnimationFrame(loop);
    return function cleanup(){global.cancelAnimationFrame(raf);dis.forEach(function(f){f();});dis.length=0;container.innerHTML='';};
  }};
})(window);
