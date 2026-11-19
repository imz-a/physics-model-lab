/* collision.js — 碰撞交互模块（IIFE，无外部依赖） */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};
  var STYLE = `<style>
.cl-wrap{color:var(--ink,#3a4250);font-size:15px}
.cl-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.cl-grid{grid-template-columns:1fr}}
.cl-card{background:#fff;border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.cl-card+.cl-card{margin-top:14px}
.cl-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.cl-hd h4{font-size:16px;font-weight:700}.cl-hd small{font-size:12px;color:var(--ink-3,#8b95a3)}
canvas.cl-cv{display:block;width:100%;height:200px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.cl-cv.chart{height:146px}
.cl-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.cl-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.cl-chip.hot{background:#F1FBF6;border-color:#B8E8D0}.cl-chip b{color:var(--ink,#3a4250)}
.cl-ctrl{margin-top:9px}.cl-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.cl-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.cl-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.cl-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.cl-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#B8E8D0;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.cl-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.cl-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#B8E8D0;border:3px solid #fff}
.cl-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.cl-btn{min-height:36px;padding:6px 13px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;font-size:13px;font-weight:600}
.cl-btn:hover{border-color:#B8E8D0;background:#F1FBF6}.cl-btn.main{background:#F1FBF6;border-color:#B8E8D0}
.cl-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cl-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px}
.cl-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.cl-read b{font-size:16px;font-variant-numeric:tabular-nums}.cl-read.hl{background:#F1FBF6;border-color:#CceedE}
.cl-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.cl-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.cl-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.cl-barrow{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.cl-barrow>span{flex:0 0 74px;font-size:12px;color:var(--ink-2,#5a6472)}
.cl-bartrack{flex:1;height:19px;background:#f2f5f8;border-radius:6px;overflow:hidden}
.cl-barfill{height:100%;border-radius:6px;transition:width .1s linear}
.cl-barval{flex:0 0 58px;text-align:right;font-size:13px;font-variant-numeric:tabular-nums}
.cl-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:12px;padding-top:10px}
.cl-quiz h5{font-size:14px;margin:0 0 6px}.cl-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 7px}
.cl-opts{display:flex;gap:7px;flex-wrap:wrap}
.cl-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.cl-opt:hover{border-color:#B8E8D0;background:#F1FBF6}
.cl-fb{margin-top:7px;font-size:12.5px;min-height:18px;line-height:1.6}.cl-fb.ok{color:#2f8f68}.cl-fb.no{color:#c26b7a}
.cl-exp{margin-top:7px;min-height:32px;padding:4px 11px;font-size:12px}
.cl-explain{margin-top:7px;padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:12.5px;line-height:1.7;color:#6e57a0}
.cl-explain[hidden]{display:none}
</style>`;
  function line(c,a1,b1,a2,b2,col,w,d){var g=c.ctx||c;g.save();g.beginPath();if(d)g.setLineDash(d);g.strokeStyle=col;g.lineWidth=w||1;g.moveTo(a1,b1);g.lineTo(a2,b2);g.stroke();g.restore();}
  function text(c,s,x,y,col,sz,al){var g=c.ctx||c;g.save();g.fillStyle=col||'#8b95a3';g.font=(sz||12)+'px "PingFang SC","Microsoft YaHei",sans-serif';g.textAlign=al||'left';g.textBaseline='middle';g.fillText(s,x,y);g.restore();}
  function dot(c,x,y,r,f,s){var g=c.ctx||c;g.save();g.beginPath();g.arc(x,y,r,0,6.2832);g.fillStyle=f;g.fill();if(s){g.lineWidth=2;g.strokeStyle=s;g.stroke();}g.restore();}
  function mk(el){return{el:el,ctx:el.getContext('2d'),w:0,h:0,dpr:0};}
  function fit(c){var w=c.el.clientWidth,h=c.el.clientHeight,d=Math.min(global.devicePixelRatio||1,2);if(w&&h&&(w!==c.w||h!==c.h||d!==c.dpr)){c.w=w;c.h=h;c.dpr=d;c.el.width=Math.round(w*d);c.el.height=Math.round(h*d);c.ctx.setTransform(d,0,0,d,0,0);}return c;}
  function arrow(c,x1,y1,x2,y2,col,lab){line(c,x1,y1,x2,y2,col,2.5);var a=Math.atan2(y2-y1,x2-x1),g=c.ctx||c,s=8;g.save();g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-s*Math.cos(a-.45),y2-s*Math.sin(a-.45));g.lineTo(x2-s*Math.cos(a+.45),y2-s*Math.sin(a+.45));g.closePath();g.fillStyle=col;g.fill();g.restore();if(lab)text(c,lab,x2+7,y2-6,col,12);}
  var QUIZ=[
    {id:'q1',title:'① 完全非弹性共速',label:'m₂ 质量',min:.5,max:5,step:.5,val:3,unit:'kg',
      build:function(v){var m1=2,u1=6,p=m1*u1,vs=p/(m1+v);return{prompt:'m₁=2 kg 以 6 m/s 撞上静止的 m₂='+v.toFixed(1)+' kg 并粘在一起，共同速度为？',
        opts:[vs.toFixed(2)+' m/s',(vs/2).toFixed(2)+' m/s',(vs*2).toFixed(2)+' m/s'],right:0,
        ex:'动量守恒：m₁u₁=(m₁+m₂)v，v = 12/('+(2+v).toFixed(1)+') = '+vs.toFixed(2)+' m/s。'};}},
    {id:'q2',title:'② 弹性碰撞后速度',label:'m₂ 质量',min:.5,max:5,step:.5,val:3,unit:'kg',
      build:function(v){var m1=2,u1=6,u1p=(m1-v)/(m1+v)*u1;return{prompt:'m₁=2 kg 以 6 m/s 正碰静止的 m₂='+v.toFixed(1)+' kg（弹性），m₁ 碰后速度为？',
        opts:[u1p.toFixed(2)+' m/s',(u1p+2).toFixed(2)+' m/s',(u1p-2).toFixed(2)+' m/s'],right:0,
        ex:'弹性碰撞 v₁′=(m₁−m₂)u₁/(m₁+m₂) = (2−'+v.toFixed(1)+')×6/(2+'+v.toFixed(1)+') = '+u1p.toFixed(2)+' m/s（负值表示反弹）。'+(Math.abs(v-2)<1e-6?' 等质量时速度交换，m₁ 碰后静止。':'')};}}
  ];
  function quizHTML(){return '<div class="cl-card"><div class="cl-hd"><h4>高考题型 · 随堂练</h4><small>参数可调 · 即时判分</small></div>'+QUIZ.map(function(z){
    return '<div class="cl-quiz"><h5>'+z.title+'</h5><p data-qp="'+z.id+'"></p><div class="cl-ctrl"><label><span>'+z.label+'</span><b data-qo="'+z.id+'"></b></label><input class="cl-range" type="range" data-qs="'+z.id+'" min="'+z.min+'" max="'+z.max+'" step="'+z.step+'" value="'+z.val+'"></div><div class="cl-opts" data-qopts="'+z.id+'"></div><div class="cl-fb" data-qfb="'+z.id+'"></div><button type="button" class="cl-btn cl-exp" data-qexp="'+z.id+'">展开解析 ▾</button><div class="cl-explain" data-qex="'+z.id+'" hidden></div></div>';}).join('')+'</div>';}

  NS.modules['collision']={render:function(container,extIndex){
    extIndex=extIndex|0;if(extIndex<0||extIndex>3)extIndex=0;
    var intro=['动量守恒 <b>p = 常量</b>','碰前碰后 <b>动量条</b> 对比','<b>ΔEk = ½μᵣ(1−e²)Δv²</b>','弹性 / 完全非弹性碰撞'][extIndex];
    var extra=extIndex===2
      ?'<div class="cl-card"><div class="cl-hd"><h4>能量损失</h4><small>损失量随 e 变化</small></div>'
        +[['before','碰前动能','#FFB3BA'],['after','碰后动能','#B8E8D0'],['loss','动能损失','#D0C4E8']].map(function(p){return'<div class="cl-barrow"><span>'+p[1]+'</span><div class="cl-bartrack"><div class="cl-barfill" data-bar="'+p[0]+'" style="background:'+p[2]+'"></div></div><b class="cl-barval" data-barval="'+p[0]+'">—</b></div>';}).join('')
        +'<div class="cl-tip">e = 1 弹性碰撞无动能损失；e = 0 完全非弹性损失最大。</div></div>'
      :extIndex===3?quizHTML():'';
    var chartTitle=['速度—时间示意图','碰前 / 碰后动量条','动能损失 ΔEk–e 曲线','速度—时间示意图'][extIndex];
    container.innerHTML=STYLE+'<div class="cl-wrap"><div class="cl-intro"><span class="cl-chip hot">'+intro+'</span><span class="cl-chip">e：恢复系数 0～1</span><span class="cl-chip">读数为示意值</span></div>'
      +'<div class="cl-grid"><div><div class="cl-card"><div class="cl-hd"><h4>碰撞演示</h4><small>两球相向运动，碰撞后分开或粘合</small></div><canvas class="cl-cv" data-cv="stage"></canvas>'
      +'<div class="cl-legend"><span><i style="background:#FFB3BA"></i>小球 1</span><span><i style="background:#B8E8D0"></i>小球 2</span><span><i style="background:#D0C4E8"></i>速度矢量</span></div></div>'
      +'<div class="cl-card"><div class="cl-hd"><h4>'+chartTitle+'</h4><small>随参数实时更新</small></div><canvas class="cl-cv chart" data-cv="chart"></canvas></div></div>'
      +'<div><div class="cl-card"><div class="cl-hd"><h4>参数调节</h4><small>拖动即时改变</small></div>'
      +[['m1','质量 m₁',.5,5,.5,2,'kg'],['m2','质量 m₂',.5,5,.5,3,'kg'],['v1','初速度 v₁',-8,8,.5,6,'m/s'],['v2','初速度 v₂',-8,8,.5,-2,'m/s'],['e','恢复系数 e',0,1,.05,1,'']]
        .map(function(r){return'<div class="cl-ctrl"><label><span>'+r[1]+'</span><b><span data-out="'+r[0]+'">'+r[5]+'</span> '+r[6]+'</b></label><input class="cl-range" type="range" data-slider="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'" value="'+r[5]+'"></div>';}).join('')
      +'<div class="cl-btns"><button type="button" class="cl-btn main" data-btn="toggle">暂停</button><button type="button" class="cl-btn" data-btn="reset">重新碰撞</button></div></div>'
      +'<div class="cl-card"><div class="cl-hd"><h4>实时读数</h4><small>碰撞前后对比</small></div><div class="cl-reads">'
      +[['p0','碰前总动量 / (kg·m/s)',1],['p1','碰后总动量 / (kg·m/s)',1],['ek0','碰前动能 / J',1],['ek1','碰后动能 / J',0],['loss','动能损失 / J',0],['e','恢复系数 e',0]]
        .map(function(r){return'<div class="cl-read'+(r[2]?' hl':'')+'"><span>'+r[1]+'</span><b data-read="'+r[0]+'">—</b></div>';}).join('')
      +'</div><div class="cl-tip">v₁′=[m₁v₁+m₂v₂−m₂e(v₁−v₂)]/(m₁+m₂)；v₂′同理取 +m₁e。动量条长度按固定参考速度 8 m/s 定标，左右表示方向；ΔEk 图纵轴向下增大。</div></div>'+extra+'</div></div></div>';
    var q=function(s){return container.querySelector(s);},qa=function(s){return container.querySelectorAll(s);};
    var stage=mk(q('[data-cv="stage"]')),chart=mk(q('[data-cv="chart"]')),dis=[];
    function on(t,ty,fn,o){t.addEventListener(ty,fn,o);dis.push(function(){t.removeEventListener(ty,fn,o);});}
    var st={m1:2,m2:3,v1:6,v2:-2,e:1,x1:-7,x2:7,hit:false,running:true,last:0,t:0};
    function reset(){st.hit=false;st.t=0;st.x1=-7;st.x2=7;}
    var X0=-7,X2=7;   // 固定初始位置（m），用于「变化前」灰色虚线参考
    function outcome(){
      var s=st.m1+st.m2,p=st.m1*st.v1+st.m2*st.v2,dv=st.v1-st.v2;
      return {v1:(p-st.m2*st.e*dv)/s,v2:(p+st.m1*st.e*dv)/s,p0:p,p1:st.m1*((p-st.m2*st.e*dv)/s)+st.m2*((p+st.m1*st.e*dv)/s),
        ek0:.5*st.m1*st.v1*st.v1+.5*st.m2*st.v2*st.v2,
        ek1:.5*st.m1*Math.pow((p-st.m2*st.e*dv)/s,2)+.5*st.m2*Math.pow((p+st.m1*st.e*dv)/s,2)};
    }
    // 「变化前」参考结果：参数改变前的碰前/碰后速度，灰色虚线画在 v–t 图上
    var refOut=null,refLoss=null;
    qa('[data-slider]').forEach(function(el){var k=el.getAttribute('data-slider');on(el,'input',function(){refOut=outcome();refLoss=Math.max(0,refOut.ek0-refOut.ek1);st[k]=parseFloat(el.value);q('[data-out="'+k+'"]').textContent=(k==='e'?st[k].toFixed(2):st[k].toFixed(1));reset();});});
    var tg=q('[data-btn="toggle"]');on(tg,'click',function(){st.running=!st.running;tg.textContent=st.running?'暂停':'继续';tg.classList.toggle('main',st.running);});
    on(q('[data-btn="reset"]'),'click',reset);
    if(extIndex===3){
      QUIZ.forEach(function(z){function refresh(){var d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));q('[data-qp="'+z.id+'"]').textContent=d.prompt;q('[data-qo="'+z.id+'"]').textContent=q('[data-qs="'+z.id+'"]').value+' kg';q('[data-qopts="'+z.id+'"]').innerHTML=d.opts.map(function(o,i){return'<button type="button" class="cl-opt" data-q="'+z.id+'" data-i="'+i+'">'+o+'</button>';}).join('');q('[data-qfb="'+z.id+'"]').textContent='';q('[data-qex="'+z.id+'"]').hidden=true;}
        refresh();on(q('[data-qs="'+z.id+'"]'),'input',refresh);on(q('[data-qexp="'+z.id+'"]'),'click',function(e){var box=q('[data-qex="'+z.id+'"]'),d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));box.hidden=!box.hidden;box.textContent=d.ex;e.target.textContent=box.hidden?'展开解析 ▾':'收起解析 ▴';});});
      qa('[data-q]').forEach(function(b){on(b,'click',function(){var id=b.getAttribute('data-q'),i=+b.getAttribute('data-i'),z=QUIZ.filter(function(x){return x.id===id;})[0],d=z.build(parseFloat(q('[data-qs="'+id+'"]').value)),fb=q('[data-qfb="'+id+'"]'),ok=i===d.right;fb.className='cl-fb '+(ok?'ok':'no');fb.textContent=ok?'✓ 正确！':'✗ 再想想，点「展开解析」看思路。';});});
    }
    function drawStage(){
      fit(stage);var c=stage.ctx,w=stage.w,h=stage.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var mid=w*.5,cy=h*.54,sc=Math.min(14,(w*.34)/24);   // 固定绝对位移量程：24 m 对应画布 34%
      var x1=mid+st.x1*sc,x2=mid+st.x2*sc;
      line(c,20,cy+52,w-20,cy+52,'#cbd6e2',2);
      var r1=12+st.m1*3,r2=12+st.m2*3;
      // 「变化前」初始位置参考（灰色虚线）
      c.save();c.setLineDash([4,4]);c.strokeStyle='#c9d4e0';c.lineWidth=1.5;
      c.beginPath();c.arc(mid+X0*sc,cy,r1,0,6.2832);c.stroke();c.beginPath();c.arc(mid+X2*sc,cy,r2,0,6.2832);c.stroke();c.restore();
      text(c,'初始位置',mid+X2*sc,cy-r2-12,'#aab4c0',10,'center');
      if(!st.hit&&x2-x1<=r1+r2){
        st.hit=true;
        var midW=(st.x1+st.x2)/2,sep=(r1+r2)/(2*sc);
        st.x1=midW-sep;st.x2=midW+sep;
        x1=mid+st.x1*sc;x2=mid+st.x2*sc;
      }
      var vv=st.hit?outcome():{v1:st.v1,v2:st.v2};
      dot(c,x1,cy,r1,'#FFB3BA','#f28f9a');dot(c,x2,cy,r2,'#B8E8D0','#86cbaa');
      text(c,'m₁',x1,cy,'#fff',12,'center');text(c,'m₂',x2,cy,'#fff',12,'center');
      var l1=Math.max(16,Math.min(75,Math.abs(vv.v1)*5))*Math.sign(vv.v1||1);
      var l2=Math.max(16,Math.min(75,Math.abs(vv.v2)*5))*Math.sign(vv.v2||1);
      arrow(c,x1,cy-r1-10,x1+l1,cy-r1-10,'#D0C4E8','v₁');
      arrow(c,x2,cy-r2-10,x2+l2,cy-r2-10,'#D0C4E8','v₂');
      text(c,st.hit?'已碰撞 · e='+st.e.toFixed(2):'相向运动中',w-12,18,'#5a6472',12,'right');
    }
    function drawChart(){
      fit(chart);var c=chart.ctx,w=chart.w,h=chart.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var x0=48,x1=w-14,top=16,bot=h-28,o=outcome();
      line(c,x0,bot,x1,bot,'#cbd6e2',1);line(c,x0,top,x0,bot,'#cbd6e2',1);
      function clamp01(u){return Math.max(0,Math.min(1,u));}
      function frame(xlab,ylab){text(c,xlab,x1,h-8,'#8b95a3',11,'right');text(c,ylab,x0+2,top+4,'#8b95a3',10);}
      if(extIndex===0||extIndex===3){
        // 真实 v–t：碰前两条水平线 → 碰撞时刻阶跃 → 碰后两条水平线（实线碰前 / 虚线碰后）
        var midT=(x0+x1)/2,vals=[st.v1,st.v2,o.v1,o.v2],vAxis=Math.max(2,Math.ceil(Math.max.apply(null,vals.map(Math.abs))*1.2));
        function py(v){return bot-clamp01((v+vAxis)/(2*vAxis))*(bot-top);}
        frame('t / s','v / (m/s)');
        text(c,String(vAxis),x0-4,top+4,'#aab4c0',10,'right');text(c,'0',x0-4,py(0),'#aab4c0',10,'right');text(c,'−'+vAxis,x0-4,bot,'#aab4c0',10,'right');
        text(c,'0',x0,bot+12,'#aab4c0',10,'center');text(c,'碰撞时刻',midT,bot+12,'#8b6fb0',10,'center');text(c,'t / s',x1,h-8,'#8b95a3',11,'right');
        if(refOut){line(c,x0,py(refOut.v1),x1,py(refOut.v1),'#c9d4e0',1,[4,4]);line(c,x0,py(refOut.v2),x1,py(refOut.v2),'#c9d4e0',1,[4,4]);text(c,'变化前',x0+5,py(refOut.v1)-8,'#9aa4b0',10);}
        line(c,x0,py(st.v1),midT,py(st.v1),'#FFB3BA',2.5);line(c,x0,py(st.v2),midT,py(st.v2),'#B8E8D0',2.5);
        line(c,midT,py(o.v1),x1,py(o.v1),'#FFB3BA',2.5,[5,4]);line(c,midT,py(o.v2),x1,py(o.v2),'#B8E8D0',2.5,[5,4]);
        line(c,midT,py(st.v1),midT,py(o.v1),'#FFB3BA',1,[2,3]);line(c,midT,py(st.v2),midT,py(o.v2),'#B8E8D0',1,[2,3]);
        line(c,midT,top,midT,bot,'#D0C4E8',1,[3,3]);
        dot(c,x0+4,py(st.v1),3,'#FFB3BA');dot(c,x0+4,py(st.v2),3,'#B8E8D0');
        text(c,'— 球1',x1-4,top+4,'#FFB3BA',10,'right');text(c,'— 球2',x1-4,top+17,'#B8E8D0',10,'right');
        text(c,'实线=碰前　虚线=碰后',x0+6,bot-12,'#8b95a3',10);
        return;
      }
      if(extIndex===1){
        // 动量条：固定参考量程，保留符号；向左为负、向右为正
        var mx=Math.max(8,(Math.abs(st.m1)+Math.abs(st.m2))*8),center=(x0+x1)/2,half=(x1-x0)/2-56;
        frame('p / (kg·m/s)','碰前 / 碰后动量');
        line(c,center,top,center,bot,'#cbd6e2',1,[3,3]);
        text(c,'−'+mx.toFixed(0),x0,top+4,'#aab4c0',10);text(c,'0',center,top+4,'#aab4c0',10,'center');text(c,'+'+mx.toFixed(0),x1,top+4,'#aab4c0',10,'right');
        [['碰前 p',o.p0,'#FFB3BA',0],['碰后 p',o.p1,'#B8E8D0',1]].forEach(function(r){
          var y=top+44+r[3]*52,X=center+(r[1]/mx)*half;
          text(c,r[0],x0,y,'#5a6472',12);c.fillStyle=r[2];c.fillRect(Math.min(center,X),y-8,Math.abs(X-center),16);
          text(c,r[1].toFixed(1),x1,y,'#5a6472',11,'right');
        });
        text(c,'← 负方向　　正方向 →',center,bot-10,'#8b95a3',10,'center');
        return;
      }
      var mu=st.m1*st.m2/(st.m1+st.m2),lossMax=Math.max(1e-9,.5*mu*Math.pow(st.v1-st.v2,2));
      function pxE(e){return x0+e*(x1-x0);}
      function pyL(loss){return top+clamp01(loss/lossMax)*(bot-top);}   // 纵轴向下增大，与标注一致
      frame('恢复系数 e','ΔEk / J（↓增大）');
      text(c,'0',x0-4,top+4,'#aab4c0',10,'right');text(c,lossMax.toFixed(1),x0-4,bot,'#aab4c0',10,'right');
      [0,.5,1].forEach(function(e){text(c,e.toFixed(1),pxE(e),bot+12,'#aab4c0',10,'center');});
      if(refLoss!==null&&refLoss>0){c.save();c.beginPath();for(var r0=0;r0<=50;r0++){var er=r0/50,X=pxE(er),Y=top+clamp01(refLoss*(1-er*er)/lossMax)*(bot-top);if(r0===0)c.moveTo(X,Y);else c.lineTo(X,Y);}c.strokeStyle='#c9d4e0';c.lineWidth=1.6;c.setLineDash([5,4]);c.stroke();c.restore();text(c,'变化前',x0+5,bot-12,'#9aa4b0',10);}
      c.save();c.beginPath();for(var i=0;i<=50;i++){var e=i/50,X=pxE(e),Y=pyL(lossMax*(1-e*e));if(i===0)c.moveTo(X,Y);else c.lineTo(X,Y);}c.strokeStyle='#D0C4E8';c.lineWidth=2.5;c.stroke();c.restore();
      var lossNow=Math.max(0,o.ek0-o.ek1);line(c,pxE(st.e),top,pxE(st.e),bot,'#FFB3BA',1,[3,3]);dot(c,pxE(st.e),pyL(lossNow),5,'#FFB3BA','#fff');
      text(c,'e=0 损失最大（底部）；e=1 损失为零（顶部）',x0+6,top+16,'#8b6fb0',10);
    }
    function set(k,v){var e=q('[data-read="'+k+'"]');if(e)e.textContent=v;}
    function update(){var o=outcome(),loss=Math.max(0,o.ek0-o.ek1);set('p0',o.p0.toFixed(2));set('p1',o.p1.toFixed(2));set('ek0',o.ek0.toFixed(2));set('ek1',o.ek1.toFixed(2));set('loss',loss.toFixed(2));set('e',st.e.toFixed(2));
      if(extIndex===2){var mx=Math.max(1,o.ek0),vals={before:o.ek0,after:o.ek1,loss:loss};Object.keys(vals).forEach(function(k){var b=q('[data-bar="'+k+'"]'),v=q('[data-barval="'+k+'"]');if(b)b.style.width=Math.min(100,vals[k]/mx*100).toFixed(1)+'%';if(v)v.textContent=vals[k].toFixed(1);});}
    }
    var raf=0;
    function loop(now){if(!st.last)st.last=now;var dt=Math.min(.04,(now-st.last)/1000);st.last=now;
      if(st.running){var o=outcome(),v1=st.hit?o.v1:st.v1,v2=st.hit?o.v2:st.v2;st.x1+=v1*dt;st.x2+=v2*dt;st.t+=dt;
        var lim=(w0()*.42)/Math.min(14,(w0()*.34)/24);  // 以固定像素量程换算的离场阈值（m）
        if(Math.abs(st.x1)>lim||Math.abs(st.x2)>lim||st.t>7)reset();}
      drawStage();drawChart();update();raf=global.requestAnimationFrame(loop);
      function w0(){return stage.w||600;}
    }
    raf=global.requestAnimationFrame(loop);
    return function cleanup(){global.cancelAnimationFrame(raf);dis.forEach(function(f){f();});dis.length=0;container.innerHTML='';};
  }};
})(window);
