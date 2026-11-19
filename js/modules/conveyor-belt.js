/* conveyor-belt.js — 传送带交互模块（IIFE，无外部依赖） */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};
  var G = 9.8;
  var STYLE = `<style>
.cb-wrap{color:var(--ink,#3a4250);font-size:15px}
.cb-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.cb-grid{grid-template-columns:1fr}}
.cb-card{background:#fff;border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.cb-card+.cb-card{margin-top:14px}
.cb-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.cb-hd h4{font-size:16px;font-weight:700}.cb-hd small{font-size:12px;color:var(--ink-3,#8b95a3)}
canvas.cb-cv{display:block;width:100%;height:200px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.cb-cv.chart{height:146px}
.cb-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.cb-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.cb-chip.hot{background:#FFF8EE;border-color:#FFD8A8}.cb-chip b{color:var(--ink,#3a4250)}
.cb-ctrl{margin-top:9px}.cb-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.cb-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.cb-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.cb-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.cb-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#FFD8A8;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.cb-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.cb-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#FFD8A8;border:3px solid #fff}
.cb-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.cb-btn{min-height:36px;padding:6px 13px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;font-size:13px;font-weight:600}
.cb-btn:hover{border-color:#FFD8A8;background:#FFF8EE}.cb-btn.main{background:#FFF8EE;border-color:#FFD8A8}
.cb-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cb-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px}
.cb-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.cb-read b{font-size:16px;font-variant-numeric:tabular-nums}
.cb-read.hl{background:#FFF8EE;border-color:#F2D9B6}
.cb-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.cb-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.cb-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.cb-barrow{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.cb-barrow>span{flex:0 0 66px;font-size:12px;color:var(--ink-2,#5a6472)}
.cb-bartrack{flex:1;height:19px;background:#f2f5f8;border-radius:6px;overflow:hidden}
.cb-barfill{height:100%;width:0;border-radius:6px;transition:width .08s linear}
.cb-barval{flex:0 0 58px;text-align:right;font-size:13px;font-variant-numeric:tabular-nums}
.cb-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:12px;padding-top:10px}
.cb-quiz h5{font-size:14px;margin:0 0 6px}.cb-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 7px}
.cb-opts{display:flex;gap:7px;flex-wrap:wrap}
.cb-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.cb-opt:hover{border-color:#FFD8A8;background:#FFF8EE}
.cb-fb{margin-top:7px;font-size:12.5px;min-height:18px;line-height:1.6}.cb-fb.ok{color:#2f8f68}.cb-fb.no{color:#c26b7a}
.cb-exp{margin-top:7px;min-height:32px;padding:4px 11px;font-size:12px}
.cb-explain{margin-top:7px;padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:12.5px;line-height:1.7;color:#6e57a0}
.cb-explain[hidden]{display:none}
</style>`;
  function line(c,a1,b1,a2,b2,col,w,d){var g=c.ctx||c;g.save();g.beginPath();if(d)g.setLineDash(d);g.strokeStyle=col;g.lineWidth=w||1;g.moveTo(a1,b1);g.lineTo(a2,b2);g.stroke();g.restore();}
  function text(c,s,x,y,col,sz,al){var g=c.ctx||c;g.save();g.fillStyle=col||'#8b95a3';g.font=(sz||12)+'px "PingFang SC","Microsoft YaHei",sans-serif';g.textAlign=al||'left';g.textBaseline='middle';g.fillText(s,x,y);g.restore();}
  function dot(c,x,y,r,f,s){var g=c.ctx||c;g.save();g.beginPath();g.arc(x,y,r,0,6.2832);g.fillStyle=f;g.fill();if(s){g.lineWidth=2;g.strokeStyle=s;g.stroke();}g.restore();}
  function mk(el){return{el:el,ctx:el.getContext('2d'),w:0,h:0,dpr:0};}
  function fit(c){var w=c.el.clientWidth,h=c.el.clientHeight,d=Math.min(global.devicePixelRatio||1,2);if(w&&h&&(w!==c.w||h!==c.h||d!==c.dpr)){c.w=w;c.h=h;c.dpr=d;c.el.width=Math.round(w*d);c.el.height=Math.round(h*d);c.ctx.setTransform(d,0,0,d,0,0);}return c;}
  function arrow(c,x1,y1,x2,y2,col,lab){line(c,x1,y1,x2,y2,col,2.5);var a=Math.atan2(y2-y1,x2-x1),g=c.ctx||c,s=8;g.save();g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-s*Math.cos(a-.45),y2-s*Math.sin(a-.45));g.lineTo(x2-s*Math.cos(a+.45),y2-s*Math.sin(a+.45));g.closePath();g.fillStyle=col;g.fill();g.restore();if(lab)text(c,lab,x2+7,y2-6,col,12);}

  var QUIZ=[
    {id:'q1',title:'① 达到共速的时间',label:'动摩擦因数 μ',min:.1,max:.8,step:.1,val:.4,unit:'',
      build:function(v){var vb=6,dv=vb,t=dv/(v*G);return{prompt:'带速 6 m/s、物块静止，μ = '+v.toFixed(1)+'，达到共速约需多久？',
        opts:[t.toFixed(2)+' s',(t/2).toFixed(2)+' s',(t*2).toFixed(2)+' s'],right:0,
        ex:'滑动时 a = μg = '+(v*G).toFixed(2)+' m/s²，t = Δv/a = 6/'+ (v*G).toFixed(2)+' = '+t.toFixed(2)+' s。'};}},
    {id:'q2',title:'② 摩擦生热',label:'动摩擦因数 μ',min:.1,max:.8,step:.1,val:.4,unit:'',
      build:function(v){var m=2,dv=6,Q=.5*m*dv*dv;return{prompt:'质量 2 kg、相对速度差 6 m/s，μ = '+v.toFixed(1)+'，摩擦生热 Q 为？',
        opts:[Q.toFixed(1)+' J',(2*Q).toFixed(1)+' J',(Q/2).toFixed(1)+' J'],right:0,
        ex:'Q = f·Δs = μmg·(Δv²/2μg) = ½mΔv² = ½×2×36 = '+Q.toFixed(1)+' J，与 μ 无关！'};}}
  ];
  function quizHTML(){return '<div class="cb-card"><div class="cb-hd"><h4>高考题型 · 随堂练</h4><small>参数可调 · 即时判分</small></div>'+QUIZ.map(function(q){
    return '<div class="cb-quiz"><h5>'+q.title+'</h5><p data-qp="'+q.id+'"></p><div class="cb-ctrl"><label><span>'+q.label+'</span><b data-qo="'+q.id+'"></b></label><input class="cb-range" type="range" data-qs="'+q.id+'" min="'+q.min+'" max="'+q.max+'" step="'+q.step+'" value="'+q.val+'"></div>'
      +'<div class="cb-opts" data-qopts="'+q.id+'"></div><div class="cb-fb" data-qfb="'+q.id+'"></div><button type="button" class="cb-btn cb-exp" data-qexp="'+q.id+'">展开解析 ▾</button><div class="cb-explain" data-qex="'+q.id+'" hidden></div></div>';}).join('')+'</div>';}

  NS.modules['conveyor-belt']={render:function(container,extIndex){
    extIndex=extIndex|0;if(extIndex<0||extIndex>3)extIndex=0;
    var intro=['摩擦力使物块速度 <b>趋于带速</b>','相对位移 <b>Δs</b> 决定生热','<b>Q = ½mΔv²</b> · 与 μ 无关','共速时间 <b>t = Δv/μg</b>'][extIndex];
    var extra=extIndex===2
      ?'<div class="cb-card"><div class="cb-hd"><h4>能量损耗</h4><small data-wtitle>Q + ΔEk = 电机做功</small></div>'
        +['Q|摩擦生热|#D0C4E8','dek|动能增量|#FFD8A8','W|电机做功|#B8E8D0'].map(function(s){var p=s.split('|');return'<div class="cb-barrow"><span>'+p[1]+'</span><div class="cb-bartrack"><div class="cb-barfill" data-bar="'+p[0]+'" style="background:'+p[2]+'"></div></div><b class="cb-barval" data-barval="'+p[0]+'">—</b></div>';}).join('')
        +'<div class="cb-tip">Q = ½m(v带−v₀)² 与 μ 无关；μ 越大，共速越快、相对位移越小。当 v₀ &gt; v带 时物块反拖电机，W = Q + ΔEk &lt; 0（负功），生热仍为正。</div></div>'
      :extIndex===3?quizHTML():'';
    var chartTitle=['v–t 图像','相对位移（两线之间面积）','生热 Q 与 μ 的关系','v–t 图像（共速时刻）'][extIndex];
    container.innerHTML=STYLE+'<div class="cb-wrap"><div class="cb-intro"><span class="cb-chip hot">'+intro+'</span><span class="cb-chip">f = μmg</span><span class="cb-chip">读数为全过程值</span></div>'
      +'<div class="cb-grid"><div><div class="cb-card"><div class="cb-hd"><h4>传送带演示</h4><small>物块在摩擦下趋于带速</small></div><canvas class="cb-cv" data-cv="stage"></canvas>'
      +'<div class="cb-legend"><span><i style="background:#FFD8A8"></i>传送带</span><span><i style="background:#FFB3BA"></i>物块</span><span><i style="background:#B8E8D0"></i>带上的标记点</span></div></div>'
      +'<div class="cb-card"><div class="cb-hd"><h4>'+chartTitle+'</h4><small>随参数实时更新</small></div><canvas class="cb-cv chart" data-cv="chart"></canvas></div></div>'
      +'<div><div class="cb-card"><div class="cb-hd"><h4>参数调节</h4><small>拖动即时改变</small></div>'
      +[['vb','传送带速度 v带',1,10,.5,5,'m/s'],['mu','动摩擦因数 μ',.05,.8,.05,.3,''],['mass','物块质量 m',.5,5,.5,2,'kg'],['v0','物块初速度 v₀',0,8,.5,1,'m/s']]
        .map(function(r){return'<div class="cb-ctrl"><label><span>'+r[1]+'</span><b><span data-out="'+r[0]+'">'+r[5]+'</span> '+r[6]+'</b></label><input class="cb-range" type="range" data-slider="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'" value="'+r[5]+'"></div>';}).join('')
      +'<div class="cb-btns"><button type="button" class="cb-btn main" data-btn="toggle">暂停</button><button type="button" class="cb-btn" data-btn="reset">重新放置</button></div></div>'
      +'<div class="cb-card"><div class="cb-hd"><h4>实时读数</h4><small>随运动刷新</small></div><div class="cb-reads">'
      +[['t','当前时间 t / s',1],['v','物块速度 / (m/s)',1],['teq','共速时间 / s',1],['rel','相对位移 Δs（全过程）/ m',0],['Q','生热 Q（全过程）/ J',0],['W','电机做功 W（全过程）/ J',0]]
        .map(function(r){return'<div class="cb-read'+(r[2]?' hl':'')+'"><span>'+r[1]+'</span><b data-read="'+r[0]+'">—</b></div>';}).join('')
      +'</div><div class="cb-tip">滑动摩擦力 f = μmg 恒定，a = μg；达到带速后相对静止，摩擦力消失。</div></div>'+extra+'</div></div></div>';
    var q=function(s){return container.querySelector(s);},qa=function(s){return container.querySelectorAll(s);};
    var stage=mk(q('[data-cv="stage"]')),chart=mk(q('[data-cv="chart"]')),dis=[];
    function on(t,ty,fn,o){t.addEventListener(ty,fn,o);dis.push(function(){t.removeEventListener(ty,fn,o);});}
    var st={vb:5,mu:.3,mass:2,v0:1,t:0,x:0,running:true,last:0};
    function reset(){st.t=0;st.x=0;}
    function a(){var dv=st.vb-st.v0;if(Math.abs(dv)<1e-6)return 0;return Math.sign(dv)*st.mu*G;}
    function teq(){return Math.abs(st.vb-st.v0)/(st.mu*G);}
    function curV(){var t=Math.min(st.t,teq());return st.v0+a()*t;}
    // 共速后物块随带匀速：必须保留 (t−T)·v带 项，不能把 t 提前 clamp 掉
    function sBlock(t){var T=teq();if(t<=T)return st.v0*t+.5*a()*t*t;return st.v0*T+.5*a()*T*T+(t-T)*st.vb;}
    function rel(){var T=teq();return Math.abs(st.vb*T-sBlock(T));}
    function heat(){return st.mu*st.mass*G*rel();}
    // v₀>v带 时物块相对带向前，摩擦反拖电机 → 电机做负功
    function motorW(){return Math.sign(st.vb-st.v0)*st.mu*st.mass*G*st.vb*teq();}
    function dEk(){return .5*st.mass*(st.vb*st.vb-st.v0*st.v0);}
    // 「变化前」基准：只在 m、v带、v₀ 改变时刷新；单独调 μ 时基准与当前 Q 重合
    var refQ=heat();
    qa('[data-slider]').forEach(function(el){var k=el.getAttribute('data-slider');on(el,'input',function(){if(k!=='mu')refQ=heat();st[k]=parseFloat(el.value);q('[data-out="'+k+'"]').textContent=(k==='mu'||k==='v0'||k==='vb')?st[k].toFixed(1):String(st[k]);reset();});});
    var tg=q('[data-btn="toggle"]');on(tg,'click',function(){st.running=!st.running;tg.textContent=st.running?'暂停':'继续';tg.classList.toggle('main',st.running);});
    on(q('[data-btn="reset"]'),'click',reset);
    if(extIndex===3){
      QUIZ.forEach(function(z){
        function refresh(){var d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));q('[data-qp="'+z.id+'"]').textContent=d.prompt;q('[data-qo="'+z.id+'"]').textContent=parseFloat(q('[data-qs="'+z.id+'"]').value).toFixed(1);q('[data-qopts="'+z.id+'"]').innerHTML=d.opts.map(function(o,i){return'<button type="button" class="cb-opt" data-q="'+z.id+'" data-i="'+i+'">'+o+'</button>';}).join('');q('[data-qfb="'+z.id+'"]').textContent='';q('[data-qex="'+z.id+'"]').hidden=true;}
        refresh();on(q('[data-qs="'+z.id+'"]'),'input',refresh);
        on(q('[data-qexp="'+z.id+'"]'),'click',function(e){var d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value)),box=q('[data-qex="'+z.id+'"]');box.hidden=!box.hidden;box.textContent=d.ex;e.target.textContent=box.hidden?'展开解析 ▾':'收起解析 ▴';});
      });
      qa('[data-q]').forEach(function(b){on(b,'click',function(){var id=b.getAttribute('data-q'),i=+b.getAttribute('data-i'),z=QUIZ.filter(function(x){return x.id===id;})[0],d=z.build(parseFloat(q('[data-qs="'+id+'"]').value)),fb=q('[data-qfb="'+id+'"]'),ok=i===d.right;fb.className='cb-fb '+(ok?'ok':'no');fb.textContent=ok?'✓ 正确！':'✗ 再想想，点「展开解析」看思路。';});});
    }
    function drawStage(){
      fit(stage);var c=stage.ctx,w=stage.w,h=stage.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var by=h*.66,off=(st.vb*st.t*18)%36;
      c.save();c.fillStyle='#F1F8FD';c.fillRect(10,by-16,w-20,34);c.strokeStyle='#BFE3F5';c.lineWidth=2;c.strokeRect(10,by-16,w-20,34);c.restore();
      c.fillStyle='#FFD8A8';for(var x=12-off;x<w-10;x+=36)c.fillRect(x,by-13,18,26);
      // 滚轮
      for(var wx=26;wx<w-16;wx+=64){dot(c,wx,by+25,8,'#fff','#BFE3F5');}
      var scale=Math.min(24,(w-100)/20);       // 固定绝对位移量程，不随 v带 归一化
      var bx=54+sBlock(st.t)*scale;
      if(bx>w-60)reset(),bx=54;
      c.save();c.fillStyle='#FFB3BA';c.strokeStyle='#f28f9a';c.lineWidth=2;c.beginPath();c.rect(bx-18,by-40,36,24);c.fill();c.stroke();c.restore();
      text(c,'m',bx,by-28,'#fff',13,'center');
      // 带上的标记点（随带匀速）
      var mx=54+st.vb*st.t*scale;while(mx>bx+90)mx-=Math.max(40,(w-90)/Math.max(1,st.vb*2));
      if(extIndex===1&&mx>bx)line(c,mx,by-2,bx,by-2,'#B8E8D0',2,[4,3]);
      dot(c,mx,by-2,4,'#B8E8D0');text(c,'带标记',mx,by-46,'#6cba92',11,'center');
      arrow(c,bx,by-52,bx+Math.max(12,curV()*3),by-52,'#FFB3BA','v');
      text(c,'v带 = '+st.vb.toFixed(1)+' m/s',w-12,18,'#5a6472',12,'right');
    }
    function drawChart(){
      fit(chart);var c=chart.ctx,w=chart.w,h=chart.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var x0=42,x1=w-14,top=16,bot=h-28,T=Math.max(1.2,teq()*1.5);
      line(c,x0,bot,x1,bot,'#cbd6e2',1);line(c,x0,top,x0,bot,'#cbd6e2',1);
      function clamp01(u){return Math.max(0,Math.min(1,u));}
      function frame(xlab,ylab){text(c,xlab,x1,h-8,'#8b95a3',11,'right');text(c,ylab,x0+2,top+4,'#8b95a3',10);text(c,'0',x0-4,bot+1,'#aab4c0',10,'right');}
      function px(t){return x0+clamp01(t/T)*(x1-x0);}
      if(extIndex===2){
        // μ 图：横轴是 μ（0.05~0.8），纵轴用固定绝对量程 Qref（由滑块极限决定）
        var Qref=.5*5*10*10;   // 固定绝对量程 250 J（m≤5 kg、Δv≤10 m/s 的滑块极限）
        function pxMu(m){return x0+(m-.05)/.75*(x1-x0);}
        function pyQ(q){return bot-clamp01(q/Qref)*(bot-top);}
        frame('动摩擦因数 μ','Q / J');
        [0.05,0.2,0.35,0.5,0.65,0.8].forEach(function(m){var X=pxMu(m);line(c,X,bot,X,bot+4,'#cbd6e2',1);text(c,m.toFixed(2),X,bot+12,'#aab4c0',9,'center');});
        text(c,'0',x0-4,bot,'#aab4c0',10,'right');text(c,Qref.toFixed(0),x0-4,top+4,'#aab4c0',10,'right');
        line(c,x0,pyQ(refQ),x1,pyQ(refQ),'#b9c2cc',2,[5,4]);   // 变化前灰色虚线基准
        text(c,'变化前 Q='+refQ.toFixed(1)+' J',x0+6,pyQ(refQ)-9,'#9aa4b0',10);
        line(c,x0,pyQ(heat()),x1,pyQ(heat()),'#D0C4E8',2.5);
        text(c,'Q = ½mΔv² = '+heat().toFixed(1)+' J',x0+6,pyQ(heat())+9,'#8b6fb0',10);
        text(c,'水平线说明 Q 与 μ 无关（仅调 μ 时与灰虚线重合）',(x0+x1)/2,top+4,'#8b6fb0',10,'center');
        return;
      }
      var vAxis=Math.max(2,Math.ceil(Math.max(st.vb,st.v0)*1.15/2)*2); // 固定绝对速度刻度（取整档）
      function py(v){return bot-clamp01(v/vAxis)*(bot-top);}
      frame('t / s','v / (m/s)');
      text(c,String(vAxis),x0-4,top+4,'#aab4c0',10,'right');text(c,T.toFixed(1),x1,bot+12,'#aab4c0',10,'right');
      line(c,x0,py(st.v0),x1,py(st.v0),'#e3e8ee',1,[4,4]);   // v₀ 初值参考
      text(c,'v₀='+st.v0.toFixed(1),x0+4,py(st.v0)-8,'#aab4c0',10);
      line(c,x0,py(st.vb),x1,py(st.vb),'#BFE3F5',2,[5,4]);text(c,'v带='+st.vb.toFixed(1),x1-2,py(st.vb)-9,'#6fa9cc',11,'right');
      var Te=Math.min(T,teq());
      c.save();c.beginPath();c.moveTo(x0,py(st.v0));c.lineTo(px(Te),py(st.vb));c.lineTo(x1,py(st.vb));c.lineTo(px(Te),py(st.vb));c.lineTo(x0,py(st.v0));c.closePath();c.fillStyle='rgba(184,232,208,.35)';c.fill();c.restore();
      c.save();c.beginPath();c.moveTo(x0,py(st.v0));c.lineTo(px(Te),py(st.vb));c.lineTo(x1,py(st.vb));c.strokeStyle='#FFB3BA';c.lineWidth=2.5;c.stroke();c.restore();
      line(c,px(Te),top,px(Te),bot,'#D0C4E8',1,[3,3]);
      text(c,'共速 t='+teq().toFixed(2)+' s',px(Te)+5,top+10,'#8b6fb0',10);
      if(extIndex===3)text(c,'共速后摩擦力 f 突变为 0',px(Te)+5,top+24,'#8b6fb0',10);
      if(extIndex===1)text(c,'阴影面积 = 相对位移 Δs',x0+8,bot-12,'#5cae86',10);
      var tnow=Math.min(st.t,T);line(c,px(tnow),top,px(tnow),bot,'#e8edf2',1,[3,3]);dot(c,px(tnow),py(curV()),5,'#FFB3BA','#fff');
      text(c,'— 物块 v',x1-4,top+4,'#FFB3BA',10,'right');text(c,'- - 带速 v带',x1-4,top+17,'#6fa9cc',10,'right');
    }
    function set(k,v){var e=q('[data-read="'+k+'"]');if(e)e.textContent=v;}
    function update(){
      set('t',st.t.toFixed(2));set('v',curV().toFixed(2));set('teq',teq().toFixed(2));set('rel',rel().toFixed(2));set('Q',heat().toFixed(1));set('W',motorW().toFixed(1));
      if(extIndex===2){
        var wt=q('[data-wtitle]'),W=motorW();
        if(wt)wt.textContent=W<0?'物块带动传送带，电机做负功（被反拖）：Q + ΔEk = W':'Q + ΔEk = 电机做功';
        var mx=Math.max(1,Math.abs(heat()),Math.abs(dEk()),Math.abs(W)),vals={Q:heat(),dek:dEk(),W:W};
        Object.keys(vals).forEach(function(k){var b=q('[data-bar="'+k+'"]'),v=q('[data-barval="'+k+'"]');if(b)b.style.width=Math.min(100,Math.abs(vals[k])/mx*100).toFixed(1)+'%';if(v)v.textContent=vals[k].toFixed(1);});
      }
    }
    var raf=0;
    function loop(now){if(!st.last)st.last=now;var dt=Math.min(.04,(now-st.last)/1000);st.last=now;if(st.running){st.t+=dt;if(st.t>teq()+2.5)reset();}drawStage();drawChart();update();raf=global.requestAnimationFrame(loop);}
    raf=global.requestAnimationFrame(loop);
    return function cleanup(){global.cancelAnimationFrame(raf);dis.forEach(function(f){f();});dis.length=0;container.innerHTML='';};
  }};
})(window);
