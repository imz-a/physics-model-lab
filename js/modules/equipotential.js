/* ============================================================
 * equipotential.js — 等势面与电场线
 * IIFE 注册，file:// 可运行；Canvas 手绘场线/等势线，试探点可拖动。
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};
  var doc = global.document;
  var C = { ink:'#3a4250', ink2:'#5a6472', ink3:'#8b95a3', pinkD:'#E27886', mintD:'#57A47F', skyD:'#5B9BC4', lavD:'#8A76BB', peachD:'#D69A55' };
  var saved = { type:'dipole', E:1.0, show:'all', playing:true };
  var SID = 'ml-eq-style';
  var CSS = ''
    + '.eq-w{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}'
    + '.eq-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
    + '.eq-chip{padding:7px 15px;border:1px solid var(--sky,#BFE3F5);border-radius:999px;background:#F1F8FD;color:#4A7FA0;font-size:14px;font-weight:600}'
    + '.eq-seg{display:inline-flex;padding:3px;border:1px solid var(--line,#e8edf2);border-radius:999px;background:#f6f8fa;gap:3px;flex-wrap:wrap}'
    + '.eq-seg button{min-height:36px;padding:6px 14px;border:0;border-radius:999px;background:transparent;color:var(--ink2,#5a6472);font-size:14px}'
    + '.eq-seg button.is-on{background:#fff;color:var(--ink);font-weight:700;box-shadow:0 1px 5px rgba(88,108,132,.13)}'
    + '.eq-sp{flex:1 1 auto}.eq-btn{min-height:40px;padding:8px 17px;border:1px solid #dce4ec;border-radius:10px;background:#fff;color:var(--ink2);font-size:15px}'
    + '.eq-btn--p{border-color:#a9d9ef;background:#eaf6fc;color:#3E7FA3;font-weight:700}'
    + '.eq-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}'
    + '@media(max-width:1120px){.eq-grid{grid-template-columns:1fr}}'
    + '.eq-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:18px;box-shadow:0 2px 8px rgba(88,108,132,.05);padding:17px 19px;min-width:0}'
    + '.eq-t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}'
    + '.eq-t i{width:9px;height:9px;border-radius:50%;background:var(--sky,#BFE3F5)}'
    + '.eq-hint{font-size:13px;color:var(--ink3);font-weight:400;margin-left:auto}'
    + 'canvas.eq-c{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6;touch-action:none}'
    + '.eq-side{display:flex;flex-direction:column;gap:14px}.eq-ctrl{display:block;margin-bottom:10px}'
    + '.eq-ctrl span{display:flex;justify-content:space-between;font-size:14px;color:var(--ink2)}'
    + '.eq-ctrl output{font-weight:700;color:var(--ink)}.eq-ctrl input{width:100%;accent-color:#8CC6E5;height:22px;cursor:pointer}'
    + '.eq-rd{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.eq-rd div{padding:9px 11px;border:1px solid #eef2f6;border-radius:10px;background:var(--bg,#fafbfc)}'
    + '.eq-rd span{display:block;font-size:12px;color:var(--ink3)}.eq-rd b{font-size:18px;font-variant-numeric:tabular-nums}'
    + '.eq-n{margin-top:9px;padding:9px 12px;border-radius:10px;background:#F1F8FD;border:1px solid #d9ecf8;color:#4A7FA0;font-size:13px;line-height:1.6}'
    + '.eq-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}'
    + '.eq-f{padding:12px 14px;border-radius:10px;background:#F7F4FC;border:1px solid #e6dcf6;font-size:15px;color:#6B5896;line-height:1.9}'
    + '.eq-f b{font-size:17px}.eq-rel{display:grid;gap:8px;margin-top:11px}'
    + '.eq-rel div{display:flex;justify-content:space-between;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2)}'
    + '.eq-rel b{color:var(--ink);font-variant-numeric:tabular-nums}'
    + '.eq-jd{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}'
    + '.eq-jd button{min-height:40px;padding:8px 14px;border:1px solid #dce4ec;border-radius:9px;background:#fff;font-size:14px;color:var(--ink2)}'
    + '.eq-jd button.is-on{border-color:#a9d9ef;background:#eaf6fc;color:#3E7FA3;font-weight:700}'
    + '.eq-qz{padding:13px 15px;border:1px solid #ffe6c2;border-radius:11px;background:#FFFCF0;font-size:15px;line-height:1.85;color:#6d5b36}'
    + '.eq-qz h5{margin:10px 0 4px;font-size:14px;color:#8A6637}'
    + '.eq-opts{display:grid;gap:6px;margin:8px 0}.eq-opts button{min-height:38px;text-align:left;padding:7px 11px;border:1px solid #e8edf2;border-radius:8px;background:#fff;font-size:14px;color:var(--ink2)}'
    + '.eq-opts button.is-sel{border-color:#8CC6E5;background:#eaf6fc;color:#3E7FA3;font-weight:700}'
    + '.eq-in{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}.eq-in input{width:130px;padding:9px 11px;border:1px solid #dce4ec;border-radius:9px;font-size:15px}'
    + '.eq-fb{margin-top:8px;padding:10px 12px;border-radius:9px;font-size:14px;line-height:1.7}.eq-fb[hidden]{display:none}'
    + '.eq-fb.ok{background:#EFFAF4;border:1px solid #bfe6d2;color:#3F7A60}.eq-fb.no{background:#FFF4F5;border:1px solid #ffd0d5;color:#A85460}';
  function style(){ if(!doc.getElementById(SID)){var s=doc.createElement('style');s.id=SID;s.textContent=CSS;doc.head.appendChild(s);} }
  function view(w,h){var c=doc.createElement('canvas'),d=Math.min(global.devicePixelRatio||1,2);c.width=w*d;c.height=h*d;c.className='eq-c';var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{el:c,ctx:x,w:w,h:h};}
  function nf(v){if(!isFinite(v))return'—';var a=Math.abs(v);return a>=100?v.toFixed(0):a>=10?v.toFixed(1):v.toFixed(2);}
  function on(m,e,t,f){e.addEventListener(t,f);var a=m[t]||(m[t]=[]);a.push([e,f]);}
  function seg(n,items,cur){var h='<div class="eq-seg" data-seg="'+n+'">';for(var i=0;i<items.length;i++)h+='<button type="button" data-val="'+items[i][0]+'" class="'+(cur===items[i][0]?'is-on':'')+'">'+items[i][1]+'</button>';return h+'</div>';}
  function rd(k,l,u){return '<div><span>'+l+'</span><b data-r="'+k+'">—</b> '+u+'</div>';}
  function quiz(){return '<div class="eq-qz"><h5>第 1 题 · 选择判断</h5><div data-qt="1"></div><div class="eq-opts" data-op="1"></div><button class="eq-btn" type="button" data-sub="1">提交答案</button><div class="eq-fb" data-fb="1" hidden></div>'
    +'<h5>第 2 题 · 定量计算</h5><div data-qt="2"></div><div class="eq-in"><input type="number" step="any" data-num placeholder="输入数值"><span data-unit></span><button class="eq-btn" type="button" data-sub="2">提交答案</button></div><div class="eq-fb" data-fb="2" hidden></div></div>';}

  var EQ_CHART_TITLE=['电势剖面 φ(x) · 沿水平扫描线','场强分量与电势梯度 · 正交验证','A / B 两点电势对比','等势线疏密 → 场强大小'];
  var EQ_CHART_HINT=['红色圆点为当前探测点所在位置','Ex 与 −∂φ/∂x 曲线重合','拖动 A / B 点，柱状图实时更新','等势面越密处场强越大'];
  var PS=[-1,1], XW=2.2, YW=1.2;
  function phi(x,y,t,E){
    if(t==='uniform') return E*y;
    if(t==='point+') return E/Math.max(.08,Math.hypot(x,y));
    if(t==='point-') return -E/Math.max(.08,Math.hypot(x,y));
    return E*(1/Math.max(.08,Math.hypot(x-PS[0],y))-1/Math.max(.08,Math.hypot(x-PS[1],y)));
  }
  function fieldAt(x,y,t,E){
    if(t==='uniform') return {x:0,y:-E};
    if(t==='dipole'){
      var r1=Math.hypot(x-PS[0],y),r2=Math.hypot(x-PS[1],y),a=E/(r1*r1*r1+1e-6),b=E/(r2*r2*r2+1e-6);
      return {x:a*(x-PS[0])-b*(x-PS[1]),y:a*y-b*y};
    }
    var s=t==='point+'?1:-1,r=Math.max(.08,Math.hypot(x,y));
    return {x:s*E*x/(r*r*r),y:s*E*y/(r*r*r)};
  }
  function grad(x,y,t,E){var h=.008;return{x:(phi(x+h,y,t,E)-phi(x-h,y,t,E))/(2*h),y:(phi(x,y+h,t,E)-phi(x,y-h,t,E))/(2*h)};}

  function build(idx,s){
    var extra='';
    if(idx===1){
      extra='<div class="eq-card"><div class="eq-t"><i style="background:var(--lav,#D0C4E8)"></i>图像识别 · 处处正交</div><div class="eq-f"><b>电场线 ⊥ 等势面</b><br>沿等势面移动电荷，电场力不做功：W=qE·s·cos90°=0。<br>电场线由高电势指向低电势，且是电势降低最快的方向。</div><div class="eq-rel"><div><span>拖动探测点，E·∇φ 方向的夹角</span><b data-r="orth">—</b></div><div><span>等势线疏密 → 场强大小</span><b>越密越强</b></div></div></div>'
        +'<div class="eq-card"><div class="eq-t"><i style="background:var(--sky,#BFE3F5)"></i>显示图层</div>'+seg('show',[['all','全部显示'],['field','只看电场线'],['equi','只看等势线']],s.show)+'<div class="eq-n">蓝色箭头为电场线，紫色闭合曲线为等势线；拖动主画布上的探测点观察二者的夹角。</div></div>';
    } else if(idx===2){
      extra='<div class="eq-card"><div class="eq-t"><i style="background:var(--mint,#B8E8D0)"></i>电势比较 · 谁高谁低</div><div style="font-size:15px;line-height:1.8">拖动主画布上的 <b style="color:#E27886">A</b> 与 <b style="color:#57A47F">B</b> 两点，判断电势高低：</div><div class="eq-jd" data-judge><button type="button" data-j="a">φA &gt; φB</button><button type="button" data-j="b">φA &lt; φB</button><button type="button" data-j="c">φA = φB</button></div><div class="eq-fb" data-jfb hidden></div><div class="eq-rel"><div><span>φA</span><b data-r="pa">—</b></div><div><span>φB</span><b data-r="pb">—</b></div></div></div>'
        +'<div class="eq-card"><div class="eq-t"><i style="background:var(--peach,#FFD8A8)"></i>判定依据</div><div class="eq-f">① 沿电场线方向电势<b>降低</b>；<br>② 正点电荷周围越靠近电荷电势越高；负点电荷相反；<br>③ 匀强电场中 φ = E·y（沿场强方向 y 减小则 φ 降低）。</div></div>';
    } else if(idx===3){
      extra='<div class="eq-card"><div class="eq-t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 两题限时</div>'+quiz()+'<div class="eq-n">题目随上方场源类型、场强与探测点位置实时更新，提交后即时判分。</div></div>';
    } else {
      extra='<div class="eq-card"><div class="eq-t"><i style="background:var(--sky,#BFE3F5)"></i>核心规律</div><div class="eq-f"><b>E = −∇φ</b><br>电场线垂直于等势面；<br>电场线密处等势面也密，场强更大；<br>电场线由高电势指向低电势。</div><div class="eq-n">拖动主画布上的探测点，实时读取该点的 E 与 φ。切换场源类型可比较四种典型分布。</div></div>'
        +'<div class="eq-card"><div class="eq-t"><i style="background:var(--mint,#B8E8D0)"></i>四种场源</div><div class="eq-f">单正电荷：场线向外、等势面同心圆，φ&gt;0<br>单负电荷：场线向内，φ&lt;0<br>等量异种：连线中垂面是零等势面<br>匀强电场：平行等距场线与等势面</div></div>';
    }
    return '<div class="eq-w"><div class="eq-bar"><span class="eq-chip">静电场 · 场线与等势面</span>'+seg('type',[['point+','正点电荷'],['point-','负点电荷'],['dipole','等量异种'],['uniform','匀强电场']],s.type)+'<span class="eq-sp"></span><button class="eq-btn eq-btn--p" type="button" data-play>'+(s.playing?'⏸ 暂停':'▶ 播放')+'</button><button class="eq-btn" type="button" data-reset>↺ 重置</button></div>'
      +'<div class="eq-grid"><div class="eq-card"><div class="eq-t"><i></i>'+(idx===2?'A / B 两点可拖动':'电场线与等势线分布')+'<span class="eq-hint">拖动圆点改变位置</span></div><div data-cv></div>'
      +'<div class="eq-t" style="margin-top:12px"><i style="background:var(--sky,#BFE3F5)"></i>'+EQ_CHART_TITLE[idx]+'<span class="eq-hint">'+EQ_CHART_HINT[idx]+'</span></div><div data-datachart></div></div>'
      +'<div class="eq-side"><div class="eq-card"><div class="eq-t"><i style="background:var(--pink,#FFB3BA)"></i>参数与图层</div>'
      +'<label class="eq-ctrl"><span>场强系数 E₀<b data-o="E"></b></span><input type="range" data-k="E" min="0.4" max="2" step="0.1" value="'+s.E+'"></label>'
      +'<div style="font-size:13px;color:var(--ink3)">'+(idx===1?'图层切换见右下卡片':'场强系数同时缩放场线密度与电势数值')+'</div></div>'
      +'<div class="eq-card"><div class="eq-t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div><div class="eq-rd">'
      +rd('E','探测点场强 |E|','')+rd('phi','探测点电势 φ','V')+rd('Ex','场强分量 Ex','')+rd('Ey','场强分量 Ey','')+'</div><div class="eq-n" data-status></div></div></div></div>'
      +'<div class="eq-extra">'+extra+'</div></div>';
  }

  function arrow(ctx,x1,y1,x2,y2,col){
    var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<3)return;var ux=dx/L,uy=dy/L,h=7;
    ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*h-uy*h*.6,y2-uy*h+ux*h*.6);ctx.lineTo(x2-ux*h+uy*h*.6,y2-uy*h-ux*h*.6);ctx.closePath();ctx.fill();ctx.restore();
  }
  function label(ctx,t,x,y,col,al){ctx.save();ctx.font='15px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillStyle=col||C.ink3;ctx.textAlign=al||'left';ctx.fillText(t,x,y);ctx.restore();}

  function drawDataChart(view, idx, s, P, pts) {
    var K=global.ChartKit; if(!K) return;
    var E=s.E, t=s.type, C2=K.colors;
    var xs=[], ph=[], ex=[], gx=[];
    for(var i=0;i<=80;i++){
      var x=-XW+2*XW*i/80;
      xs.push(x); ph.push(phi(x,P.y,t,E)); ex.push(fieldAt(x,P.y,t,E).x); gx.push(-(phi(x+.008,P.y,t,E)-phi(x-.008,P.y,t,E))/.016);
    }
    if(idx===0){
      K.line(view,{title:'电势剖面 φ(x)',xLabel:'位置 x',xUnit:'m',yLabel:'电势 φ',yUnit:'V',
        series:[{name:'φ(x)',color:C2.lav,width:2.6,points:xs.map(function(x,i){return[x,ph[i]]})}],
        markers:[{x:P.x,y:phi(P.x,P.y,t,E),label:'探测点',color:C2.pink,cross:true,r:5}]});
    } else if(idx===1){
      K.line(view,{title:'场强 Ex 与 −∂φ/∂x 重合',xLabel:'位置 x',xUnit:'m',yLabel:'场强分量',yUnit:'V/m',
        legend:true,
        series:[{name:'Ex（直接）',color:C2.sky,width:2.6,points:xs.map(function(x,i){return[x,ex[i]]})},
                {name:'−∂φ/∂x（梯度）',color:C2.peach,width:2,dash:[5,3],points:xs.map(function(x,i){return[x,gx[i]]})}]});
    } else if(idx===2){
      var pa=phi(pts.a.x,pts.a.y,t,E), pb=phi(pts.b.x,pts.b.y,t,E);
      K.bars(view,{title:'A / B 两点电势对比',yLabel:'电势 φ',yUnit:'V',
        bars:[{label:'A 点',value:pa,color:C2.pink,note:'('+pts.a.x.toFixed(2)+', '+pts.a.y.toFixed(2)+')'},
              {label:'B 点',value:pb,color:C2.mint,note:'('+pts.b.x.toFixed(2)+', '+pts.b.y.toFixed(2)+')'}],
        yMax:Math.max(1,Math.abs(pa),Math.abs(pb))*1.3});
    } else {
      // 场强大小沿 x 的分布（疏密指标）
      var mag=[]; for(var j=0;j<=80;j++){var xx=xs[j],f=fieldAt(xx,P.y,t,E);mag.push([xx,Math.hypot(f.x,f.y)]);}
      K.line(view,{title:'场强大小 |E| 沿 x 分布',xLabel:'位置 x',xUnit:'m',yLabel:'场强 |E|',yUnit:'V/m',
        series:[{name:'|E|',color:C2.mint,width:2.6,points:mag}],
        markers:[{x:P.x,y:Math.hypot(fieldAt(P.x,P.y,t,E).x,fieldAt(P.x,P.y,t,E).y),label:'探测点',color:C2.pink,r:5,cross:true}]});
    }
  }

  NS.modules['equipotential']={render:function(container,extIndex){
    style();var idx=Math.max(0,Math.min(3,Number(extIndex)||0));
    var s={type:saved.type,E:saved.E,show:saved.show,playing:saved.playing};
    container.innerHTML=build(idx,s);
    var v=view(1000,430);container.querySelector('[data-cv]').appendChild(v.el);
    var dv=view(700,250);dv.el.style.background='#fff';container.querySelector('[data-datachart]').appendChild(dv.el);
    var ctx=v.ctx,W=v.w,H=v.h,LST={},rAF=0,last=0,dead=false,animT=0;
    var pts={p:{x:-.45,y:.45},a:{x:-.9,y:.55},b:{x:.9,y:-.45}},drag=null;
    var q=function(x){return container.querySelector(x);},qa=function(x){return container.querySelectorAll(x);};
    function map(x,y){var pad=15,pw=W-30,ph=H-30,sc=Math.min(pw/(2*XW),ph/(2*YW));return{X:W/2+x*sc,Y:H/2-y*sc,sc:sc};}
    function unmap(X,Y){var pad=15,pw=W-30,ph=H-30,sc=Math.min(pw/(2*XW),ph/(2*YW));return{x:(X-W/2)/sc,y:(H/2-Y)/sc};}
    function setSeg(n,val){var b=q('[data-seg="'+n+'"]');if(!b)return;var x=b.querySelectorAll('button');for(var i=0;i<x.length;i++)x[i].classList.toggle('is-on',x[i].getAttribute('data-val')===String(val));}
    function sync(){saved.type=s.type;saved.E=s.E;saved.show=s.show;saved.playing=s.playing;}
    var sl=q('[data-k="E"]');
    on(LST,sl,'input',function(e){s.E=Number(e.target.value);q('[data-o="E"]').textContent=nf(s.E);sync();resetQuiz();});
    q('[data-o="E"]').textContent=nf(s.E);
    for(var gi=0;gi<qa('[data-seg]').length;gi++){(function(box){on(LST,box,'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var n=box.getAttribute('data-seg'),val=b.getAttribute('data-val');s[n]=val;setSeg(n,val);sync();resetQuiz();});})(qa('[data-seg]')[gi]);}
    var pb=q('[data-play]');on(LST,pb,'click',function(){s.playing=!s.playing;pb.textContent=s.playing?'⏸ 暂停':'▶ 播放';sync();});
    on(LST,q('[data-reset]'),'click',function(){pts.p={x:-.45,y:.45};pts.a={x:-.9,y:.55};pts.b={x:.9,y:-.45};animT=0;});
    function pos(e){var r=v.el.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
    function down(e){var P=pos(e),names=idx===2?['a','b']:['p'],best=null,bd=1e9;
      for(var i=0;i<names.length;i++){var sc=map(pts[names[i]].x,pts[names[i]].y).sc,dx=P.X-sc?0:0;var m=map(pts[names[i]].x,pts[names[i]].y),d=Math.hypot(P.X-m.X,P.Y-m.Y);if(d<bd){bd=d;best=names[i];}}
      if(bd<32){drag=best;move(e);}}
    function move(e){if(!drag)return;var P=pos(e),w=unmap(P.X,P.Y);pts[drag]={x:Math.max(-XW+.1,Math.min(XW-.1,w.x)),y:Math.max(-YW+.1,Math.min(YW-.1,w.y))};}
    function up(){drag=null;}
    on(LST,v.el,'pointerdown',down);on(LST,v.el,'pointermove',move);on(LST,v.el,'pointerup',up);on(LST,v.el,'pointercancel',up);

    /* 判分题 */
    var Q={1:{opts:[],correct:0,text:'',expl:''},2:{ans:0,text:'',unit:'',expl:''}},sel=-1;
    function quizData(){
      var pp=phi(pts.p.x,pts.p.y,s.type,s.E),pa=phi(pts.a.x,pts.a.y,s.type,s.E),pbv=phi(pts.b.x,pts.b.y,s.type,s.E);
      Q[1].text='在当前「'+({ 'point+':'正点电荷','point-':'负点电荷','dipole':'等量异种','uniform':'匀强电场'})[s.type]+'」中，沿电场线方向电势将怎样变化？';
      Q[1].opts=['逐渐升高','逐渐降低','保持不变'];Q[1].correct=1;
      Q[1].expl='电场线方向就是电势降低最快的方向，因为 E = −∇φ。';
      Q[2].text='把电荷量 q = 2×10⁻⁶ C 的试探电荷从 A 移到 B，求电场力做功 W = q(φA−φB)（单位 J）。当前 φA='+nf(pa)+' V，φB='+nf(pbv)+' V。';
      Q[2].ans=2e-6*(pa-pbv);Q[2].unit='J';
      Q[2].expl='W = q(φA−φB) = 2×10⁻⁶ × ('+nf(pa)+' − '+nf(pbv)+') = '+nf(2e-6*(pa-pbv))+' J。电场力做功与路径无关。';
    }
    function paintQuiz(){
      if(idx!==3)return;quizData();q('[data-qt="1"]').textContent=Q[1].text;q('[data-qt="2"]').textContent=Q[2].text;q('[data-unit]').textContent=Q[2].unit;
      var box=q('[data-op="1"]');box.innerHTML='';Q[1].opts.forEach(function(t,i){var b=doc.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+i)+'. '+t;b.setAttribute('data-i',i);box.appendChild(b);});
    }
    function resetQuiz(){if(idx===3){sel=-1;q('[data-num]').value='';q('[data-fb="1"]').hidden=true;q('[data-fb="2"]').hidden=true;var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.remove('is-sel');}}
    function submit(n){n=Number(n);var fb=q('[data-fb="'+n+'"]');
      if(n===1){if(sel<0){fb.className='eq-fb no';fb.hidden=false;fb.textContent='请先选择一个答案。';return;}
        var ok=sel===Q[1].correct;fb.className='eq-fb '+(ok?'ok':'no');fb.hidden=false;fb.innerHTML=(ok?'✅ 正确！':'❌ 再想想。')+' '+Q[1].expl;}
      else{var val=Number(q('[data-num]').value),ans=Q[2].ans,tol=Math.max(.02,Math.abs(ans)*.05),ok=isFinite(val)&&Math.abs(val-ans)<=tol;
        fb.className='eq-fb '+(ok?'ok':'no');fb.hidden=false;fb.innerHTML=(ok?'✅ 正确！':'❌ 参考答案 '+nf(ans)+' '+Q[2].unit+'。')+' '+Q[2].expl;}
    }
    if(idx===3){paintQuiz();for(var oi=0;oi<qa('[data-op="1"] button').length;oi++){}on(LST,q('[data-op="1"]'),'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;sel=Number(b.getAttribute('data-i'));var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.toggle('is-sel',i===sel);});
      for(var si=0;si<qa('[data-sub]').length;si++){(function(b){on(LST,b,'click',function(){submit(b.getAttribute('data-sub'));});})(qa('[data-sub]')[si]);}}
    if(idx===2){on(LST,q('[data-judge]'),'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var j=b.getAttribute('data-j'),pa=phi(pts.a.x,pts.a.y,s.type,s.E),pbc=phi(pts.b.x,pts.b.y,s.type,s.E),right=Math.abs(pa-pbc)<.03?'c':pa>pbc?'a':'b';var fb=q('[data-jfb]');fb.hidden=false;fb.className='eq-fb '+(j===right?'ok':'no');fb.innerHTML=(j===right?'✅ 判断正确！':'❌ 再看一看。')+' φA = '+nf(pa)+' V，φB = '+nf(pbc)+' V。沿电场线方向电势降低。';});}

    function contours(){
      var out=[],levels=s.type==='uniform'?[-.8,-.4,0,.4,.8].map(function(x){return x*s.E;}):[-2,-1,-.5,.5,1,2].map(function(x){return x*s.E;});
      var N=76,M=42,grid=[],i,j;
      for(i=0;i<=N;i++){grid[i]=[];for(j=0;j<=M;j++){var x=-XW+2*XW*i/N,y=-YW+2*YW*j/M;grid[i][j]=phi(x,y,s.type,s.E);}}
      for(var lv=0;lv<levels.length;lv++){
        var L0=levels[lv];
        for(i=0;i<N;i++)for(j=0;j<M;j++){
          var x0=-XW+2*XW*i/N,x1=-XW+2*XW*(i+1)/N,y0=-YW+2*YW*j/M,y1=-YW+2*YW*(j+1)/M;
          var a=grid[i][j],b=grid[i+1][j],c=grid[i+1][j+1],d=grid[i][j+1],cr=[];
          // ip 返回沿某条边的线性插值坐标（标量），由调用方补上该边固定的另一维坐标
          function ip(v1,v2,t1,t2){var t=(L0-v1)/(v2-v1);return t1+(t2-t1)*t;}
          if((a-L0)*(b-L0)<0)cr.push([ip(a,b,x0,x1),y0]);        // 底边：y=y0
          if((b-L0)*(c-L0)<0)cr.push([x1,ip(b,c,y0,y1)]);        // 右边：x=x1
          if((c-L0)*(d-L0)<0)cr.push([ip(c,d,x1,x0),y1]);        // 顶边：y=y1
          if((d-L0)*(a-L0)<0)cr.push([x0,ip(d,a,y1,y0)]);        // 左边：x=x0
          if(cr.length===2)out.push([cr[0][0],cr[0][1],cr[1][0],cr[1][1]]);
          else if(cr.length===4){
            // 鞍点：用中心电势与角 a 是否同侧决定配对，避免乱连
            var center=phi((x0+x1)/2,(y0+y1)/2,s.type,s.E);
            if((center-L0)*(a-L0)>0){
              out.push([cr[0][0],cr[0][1],cr[1][0],cr[1][1]]);
              out.push([cr[2][0],cr[2][1],cr[3][0],cr[3][1]]);
            }else{
              out.push([cr[0][0],cr[0][1],cr[3][0],cr[3][1]]);
              out.push([cr[1][0],cr[1][1],cr[2][0],cr[2][1]]);
            }
          }
        }
      }
      return out;
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      var showAll=s.show==='all';
      if(showAll||s.show==='equi'){
        ctx.save();ctx.strokeStyle='#D6C8EE';ctx.lineWidth=1.6;ctx.globalAlpha=.95;
        var cs=contours();for(var i=0;i<cs.length;i++){var a=map(cs[i][0],cs[i][1]),b=map(cs[i][2],cs[i][3]);ctx.beginPath();ctx.moveTo(a.X,a.Y);ctx.lineTo(b.X,b.Y);ctx.stroke();}ctx.restore();
      }
      if(showAll||s.show==='field'){
        ctx.save();ctx.strokeStyle=C.skyD;ctx.fillStyle=C.skyD;ctx.lineWidth=2;
        if(s.type==='uniform'){
          for(var gx=-2;gx<=2;gx+=.42){var A=map(gx,YW),B=map(gx,-YW);line(A.X,A.Y,B.X,B.Y);arrow(ctx,A.X,A.Y+(A.Y<B.Y?60:-60),A.X,A.Y+(A.Y<B.Y?80:-80),C.skyD);}
        }else if(s.type==='dipole'){
          for(var k=0;k<14;k++){var th=Math.PI*2*k/14,r0=.14,x=PS[0]+r0*Math.cos(th),y=r0*Math.sin(th);integrate(x,y,1);}
        }else{
          for(var k2=0;k2<18;k2++){var t2=Math.PI*2*k2/18,ct=Math.cos(t2),st=Math.sin(t2),R0=.14,RF=Math.min(XW,YW)*.9;
            var rr=map(R0*ct,R0*st),far=map(RF*ct,RF*st);line(rr.X,rr.Y,far.X,far.Y);
            // 正电荷电场线由内向外；负电荷指向电荷，由外向内
            var rA=s.type==='point-'?R0*2.6:R0*2.1,rB=s.type==='point-'?R0*2.1:R0*2.6;
            var pa=map(rA*ct,rA*st),pb=map(rB*ct,rB*st);
            arrow(ctx,pa.X,pa.Y,pb.X,pb.Y,C.skyD);}
        }
        ctx.restore();
        function line(x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
        function integrate(x,y,dir){
          ctx.beginPath();var m=map(x,y);ctx.moveTo(m.X,m.Y);
          for(var st=0;st<320;st++){var F=fieldAt(x,y,s.type,s.E),L=Math.hypot(F.x,F.y);if(L<1e-9)break;var h=.025,xn=x+dir*h*F.x/L,yn=y+dir*h*F.y/L;
            if(Math.abs(xn)>XW||Math.abs(yn)>YW)break;if(s.type==='dipole'&&Math.hypot(xn-PS[1],yn)<.09)break;
            x=xn;y=yn;m=map(x,y);ctx.lineTo(m.X,m.Y);if(st===90||st===190)arrow(ctx,m.X,m.Y,m.X+(m.X-map(x-.03*F.x/L,y-.03*F.y/L).X)*2,m.Y+(m.Y-map(x-.03*F.x/L,y-.03*F.y/L).Y)*2,C.skyD);}
          ctx.stroke();
        }
      }
      // 场源
      if(s.type!=='uniform'){
        var src=s.type==='dipole'?[{x:PS[0],v:'+'},{x:PS[1],v:'−'}]:[{x:0,v:s.type==='point+'?'+':'−'}];
        src.forEach(function(o){var m=map(o.x,0);ctx.save();ctx.fillStyle=o.v==='+'?C.pinkD:C.skyD;ctx.beginPath();ctx.arc(m.X,m.Y,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText(o.v,m.X,m.Y+6);ctx.restore();});
      }
      // 探测点
      function marker(key,col,txt){var o=pts[key],m=map(o.x,o.y);ctx.save();ctx.fillStyle=col;ctx.beginPath();ctx.arc(m.X,m.Y,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.restore();label(ctx,txt,m.X+11,m.Y-9,col);return m;}
      var pm=marker(idx===2?'a':'p',idx===2?C.pinkD:C.mintD,idx===2?'A':'探测点');
      if(idx===2)marker('b',C.mintD,'B');
      if(idx===1){
        var F=fieldAt(pts.p.x,pts.p.y,s.type,s.E),L=Math.hypot(F.x,F.y)||1,ux=F.x/L,uy=F.y/L;
        var e1=map(pts.p.x,pts.p.y),e2=map(pts.p.x+ux*.3,pts.p.y+uy*.3),t1=map(pts.p.x-uy*.22,pts.p.y+ux*.22),t2=map(pts.p.x+uy*.22,pts.p.y-ux*.22);
        arrow(ctx,e1.X,e1.Y,e2.X,e2.Y,C.pinkD);ctx.save();ctx.strokeStyle=C.lavD;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(t1.X,t1.Y);ctx.lineTo(t2.X,t2.Y);ctx.stroke();ctx.restore();
        var g=grad(pts.p.x,pts.p.y,s.type,s.E),gl=Math.hypot(g.x,g.y)||1,dot=Math.abs((F.x/L)*(-g.y/gl)+(F.y/L)*(g.x/gl));
        var rEl=q('[data-r="orth"]');if(rEl)rEl.textContent='cos夹角 = '+nf(dot)+'（≈0 即正交）';
      }
      label(ctx,'E₀ = '+nf(s.E),18,24,C.ink3);
    }
    function frame(ts){if(dead)return;
      var dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;
      // 播放按钮驱动探测点巡游：读数、场矢量与 quizData 都随之变化
      if(s.playing&&!drag&&idx!==2){
        animT+=dt;
        var nx=pts.p.x+0.42*Math.cos(animT*.8)*dt,ny=pts.p.y+0.42*Math.sin(animT*.53)*dt;
        pts.p={x:Math.max(-XW+.15,Math.min(XW-.15,nx)),y:Math.max(-YW+.15,Math.min(YW-.15,ny))};
      }
      draw();
      var P=pts[idx===2?'a':'p'],F=fieldAt(P.x,P.y,s.type,s.E),L=Math.hypot(F.x,F.y);
      var set=function(k,v){var e=q('[data-r="'+k+'"]');if(e)e.textContent=v;};
      set('E',nf(L));set('phi',nf(phi(P.x,P.y,s.type,s.E))+' V');set('Ex',nf(F.x));set('Ey',nf(F.y));
      var st=q('[data-status]');if(st)st.textContent='电场线垂直于等势面，沿电场线方向电势降低最快。'+(s.type==='dipole'?' 等量异种连线的中垂面电势为零。':'');
      if(idx===2){set('pa',nf(phi(pts.a.x,pts.a.y,s.type,s.E))+' V');set('pb',nf(phi(pts.b.x,pts.b.y,s.type,s.E))+' V');}
      drawDataChart(dv,idx,s,pts[idx===2?'a':'p'],pts);
      rAF=global.requestAnimationFrame(frame);
    }
    rAF=global.requestAnimationFrame(frame);
    return function cleanup(){if(dead)return;dead=true;global.cancelAnimationFrame(rAF);for(var t in LST){if(!LST.hasOwnProperty(t))continue;var a=LST[t];for(var i=0;i<a.length;i++)a[i][0].removeEventListener(t,a[i][1]);}};
  }};
})(window);
