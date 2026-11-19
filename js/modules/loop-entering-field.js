/* ============================================================
 * loop-entering-field.js — 线框进出磁场
 * 进入 / 完全在内 / 穿出 三段；ε=BLv，I=ε/R，Q=W外
 * ============================================================ */
(function (global) {
  'use strict';
  var NS=global.ModelLab=global.ModelLab||{};NS.modules=NS.modules||{};
  var doc=global.document;
  var C={ink:'#3a4250',ink2:'#5a6472',ink3:'#8b95a3',pinkD:'#E27886',mintD:'#57A47F',skyD:'#5B9BC4',lavD:'#8A76BB',peachD:'#D69A55'};
  var saved={B:0.8,L:0.2,v:1.0,R:2.0,Wf:0.5,playing:true};
  var DEFAULTS={B:0.8,L:0.2,v:1.0,R:2.0,Wf:0.5}; // 变化前基准（固定，不受滑块改写）
  var EMF_AXIS=2.6;  // 固定纵轴量程：B=2T,L=0.4m,v=3m/s → ε=2.4V，留余量
  var T_AXIS=5.2;    // 固定横轴量程：tCut≤min(0.4,0.8)/0.3≈1.33s，tHold≤0.7/0.3≈2.33s，T≤5s
  var SID='ml-lf-style';
  var CSS=''
    +'.lf-w{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}.lf-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
    +'.lf-chip{padding:7px 15px;border:1px solid var(--mint,#B8E8D0);border-radius:999px;background:#F1FBF6;color:#4C9071;font-size:14px;font-weight:600}'
    +'.lf-sp{flex:1 1 auto}.lf-btn{min-height:40px;padding:8px 17px;border:1px solid #dce4ec;border-radius:10px;background:#fff;color:var(--ink2);font-size:15px}.lf-btn--p{border-color:#a9dfc4;background:#eef9f3;color:#438562;font-weight:700}'
    +'.lf-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}@media(max-width:1120px){.lf-grid{grid-template-columns:1fr}}'
    +'.lf-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:18px;box-shadow:0 2px 8px rgba(88,108,132,.05);padding:17px 19px;min-width:0}'
    +'.lf-t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}.lf-t i{width:9px;height:9px;border-radius:50%;background:var(--mint,#B8E8D0)}.lf-hint{font-size:13px;color:var(--ink3);font-weight:400;margin-left:auto}'
    +'canvas.lf-c{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6}'
    +'.lf-side{display:flex;flex-direction:column;gap:14px}.lf-ctrl{display:block;margin-bottom:9px}.lf-ctrl span{display:flex;justify-content:space-between;font-size:14px;color:var(--ink2)}.lf-ctrl output{font-weight:700}.lf-ctrl input{width:100%;accent-color:#8ED6B4;height:22px;cursor:pointer}'
    +'.lf-rd{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lf-rd div{padding:9px 11px;border:1px solid #eef2f6;border-radius:10px;background:var(--bg,#fafbfc)}.lf-rd span{display:block;font-size:12px;color:var(--ink3)}.lf-rd b{font-size:18px}'
    +'.lf-n{margin-top:9px;padding:9px 12px;border-radius:10px;background:#F1FBF6;border:1px solid #cceede;color:#437F64;font-size:13px;line-height:1.6}'
    +'.lf-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.lf-f{padding:12px 14px;border-radius:10px;background:#F1FBF6;border:1px solid #cceede;font-size:15px;color:#437F64;line-height:1.9}.lf-f b{font-size:17px}'
    +'.lf-rel{display:grid;gap:8px;margin-top:11px}.lf-rel div{display:flex;justify-content:space-between;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2)}.lf-rel b{color:var(--ink);font-variant-numeric:tabular-nums}'
    +'.lf-bar{margin-top:10px}.lf-bar__t{display:flex;justify-content:space-between;font-size:13px;color:var(--ink2)}.lf-bar__k{height:20px;border-radius:99px;background:#f0f3f7;overflow:hidden}.lf-bar__f{height:100%;width:0;border-radius:99px;transition:width .12s linear}'
    +'.lf-qz{padding:13px 15px;border:1px solid #ffe6c2;border-radius:11px;background:#FFFCF0;font-size:15px;line-height:1.85;color:#6d5b36}.lf-qz h5{margin:10px 0 4px;font-size:14px;color:#8A6637}'
    +'.lf-opts{display:grid;gap:6px;margin:8px 0}.lf-opts button{min-height:38px;text-align:left;padding:7px 11px;border:1px solid #e8edf2;border-radius:8px;background:#fff;font-size:14px;color:var(--ink2)}.lf-opts button.is-sel{border-color:#8ED6B4;background:#effaf4;color:#3F7A60;font-weight:700}'
    +'.lf-in{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}.lf-in input{width:130px;padding:9px 11px;border:1px solid #dce4ec;border-radius:9px;font-size:15px}'
    +'.lf-fb{margin-top:8px;padding:10px 12px;border-radius:9px;font-size:14px;line-height:1.7}.lf-fb[hidden]{display:none}.lf-fb.ok{background:#EFFAF4;border:1px solid #bfe6d2;color:#3F7A60}.lf-fb.no{background:#FFF4F5;border:1px solid #ffd0d5;color:#A85460}';
  function style(){if(!doc.getElementById(SID)){var s=doc.createElement('style');s.id=SID;s.textContent=CSS;doc.head.appendChild(s);}}
  function view(w,h){var c=doc.createElement('canvas'),d=Math.min(global.devicePixelRatio||1,2);c.width=w*d;c.height=h*d;c.className='lf-c';var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{el:c,ctx:x,w:w,h:h};}
  function nf(v){if(!isFinite(v))return'—';var a=Math.abs(v);return a>=100?v.toFixed(0):a>=10?v.toFixed(1):v.toFixed(3);}
  function on(m,e,t,f){e.addEventListener(t,f);var a=m[t]||(m[t]=[]);a.push([e,f]);}
  function rd(k,l,u){return '<div><span>'+l+'</span><b data-r="'+k+'">—</b> '+u+'</div>';}
  function quiz(){return '<div class="lf-qz"><h5>第 1 题 · 电流方向</h5><div data-qt="1"></div><div class="lf-opts" data-op="1"></div><button class="lf-btn" data-sub="1">提交答案</button><div class="lf-fb" data-fb="1" hidden></div><h5>第 2 题 · 焦耳热</h5><div data-qt="2"></div><div class="lf-in"><input type="number" step="any" data-num placeholder="输入数值"><span data-unit></span><button class="lf-btn" data-sub="2">提交答案</button></div><div class="lf-fb" data-fb="2" hidden></div></div>';}
  var LF_CHART_TITLE=['磁通量 Φ 随线框位置 x 变化','感应电动势 ε — t 波形','累计焦耳热 Q 随时间增长','单次穿越总热量 Q = 2B²L³/R'];
  var LF_CHART_HINT=['斜率非零处才有感应电动势','进入与穿出为等高反向平台','Q 单调增长，平台期保持不变','Q ∝ B²L³/R，随参数实时重算'];
  function calc(s,xc){
    var lw=s.L*10,fw=s.Wf*10,xf=3,total=lw+fw+3.4;
    var re=xc+lw; // 线框右边界
    // enter：右边界进入左边界、尚未穿出右边界；exit：左边界进入、右边界已穿出
    // 仅这两个阶段重叠宽度在变（dΦ/dt≠0）；否则磁通恒定，ε=0
    var enter=xc<xf&&re>xf&&re<=xf+fw;
    var exit=xc>xf&&xc<xf+fw&&re>xf+fw;
    var overlap=Math.max(0,Math.min(re,xf+fw)-Math.max(xc,xf));
    var phase=enter?'进入':exit?'穿出':overlap>0?(fw<lw?'磁场被完全覆盖':'完全在内'):'未进入/已离开';
    var emf=(enter||exit)?s.B*s.L*s.v:0,I=emf/s.R,F=s.B*I*s.L,P=I*I*s.R;
    return{lw:lw,fw:fw,xf:xf,total:total,phase:phase,emf:emf,I:I,F:F,P:P,enter:enter,exit:exit};
  }
  function build(idx,s){
    var ex='';
    if(idx===1)ex='<div class="lf-card"><div class="lf-t"><i style="background:var(--sky,#BFE3F5)"></i>ε — t 分段图像</div><div data-chart></div><div class="lf-rel"><div><span>切割段时长 min(L,w)/v</span><b data-r="tin">—</b></div><div><span>中间零平台时长 |w−L|/v</span><b data-r="tmid">—</b></div><div><span>平台高度 ε = BLv</span><b data-r="eplot">—</b></div></div><div class="lf-n">进入与穿出两段是等高的正负平台；中间零平台对应磁通量不变：w&gt;L 时线框完全在磁场内，w&lt;L 时磁场被线框完全覆盖。纵轴 ε/V 为固定量程，灰虚线为变化前基准。</div></div>'
      +'<div class="lf-card"><div class="lf-t"><i style="background:var(--lav,#D0C4E8)"></i>图像判读要点</div><div class="lf-f">① 只有"切割边界"的时段才有感应电动势；<br>② 进入与穿出的 ε 大小相等、方向相反；<br>③ 平台高度 ∝ B、L、v（纵轴固定刻度，拖 B 可见平台升降）；平台宽度 ∝ min(L,w)/v。<br>磁场区比线框窄（w&lt;L）时，中间是"磁场被完全覆盖"的零平台。</div></div>';
    else if(idx===2)ex='<div class="lf-card"><div class="lf-t"><i style="background:var(--peach,#FFD8A8)"></i>能量转化 · 焦耳热</div>'
      +'<div class="lf-bar"><div class="lf-bar__t"><span>累计焦耳热 Q = ∫I²R dt</span><b data-barv="q">—</b></div><div class="lf-bar__k"><div class="lf-bar__f" data-bar="q" style="background:var(--peach,#FFD8A8)"></div></div></div>'
      +'<div class="lf-bar"><div class="lf-bar__t"><span>克服安培力做功 W = ∫F安 v dt</span><b data-barv="w">—</b></div><div class="lf-bar__k"><div class="lf-bar__f" data-bar="w" style="background:var(--mint,#B8E8D0)"></div></div></div>'
      +'<div class="lf-n">两条柱始终等高：安培力做多少负功，就产生多少焦耳热（能量守恒）。</div><div class="lf-rel"><div><span>单次穿越总热量</span><b data-r="qtot">—</b></div></div></div>'
      +'<div class="lf-card"><div class="lf-t"><i style="background:var(--mint,#B8E8D0)"></i>规律总结</div><div class="lf-f"><b>Q = 2·(B²L²v/R)·(L/v) = 2B²L³/R</b><br>（要求磁场区足够宽，能完整经历进入与穿出）<br>外力做功 W外 = Q，线框动能不变。</div></div>';
    else if(idx===3)ex='<div class="lf-card"><div class="lf-t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 两题限时</div>'+quiz()+'<div class="lf-n">题目随 B、L、v、R、磁场宽度实时更新，提交后即时判分。</div></div>';
    else ex='<div class="lf-card"><div class="lf-t"><i style="background:var(--mint,#B8E8D0)"></i>三段过程</div><div class="lf-f"><b>进入</b>：右边切割，ε=BLv，电流逆时针，安培力向左阻碍；<br><b>完全在内</b>：磁通量不变，ε=0，无电流；<br><b>穿出</b>：左边切割，ε 大小相同方向相反，电流顺时针。</div></div>'
      +'<div class="lf-card"><div class="lf-t"><i style="background:var(--sky,#BFE3F5)"></i>能量视角</div><div class="lf-f">感应电流在磁场中受安培力，方向总与运动方向相反；<br>外力维持匀速所做的功全部转化为电阻上的焦耳热：<br><b>W外 = Q = ∫I²R dt</b>。</div></div>';
    var sl='';
    [['B','磁感应强度 B',0.2,2,0.1,s.B,'T'],['L','线框边长 L',0.1,0.4,0.02,s.L,'m'],['v','运动速度 v',0.3,3,0.1,s.v,'m/s'],['R','回路电阻 R',0.5,8,0.5,s.R,'Ω'],['Wf','磁场区宽度 w',0.2,0.8,0.05,s.Wf,'m']].forEach(function(a){
      sl+='<label class="lf-ctrl"><span>'+a[1]+'<b data-o="'+a[0]+'"></b></span><input type="range" data-k="'+a[0]+'" min="'+a[2]+'" max="'+a[3]+'" step="'+a[4]+'" value="'+a[5]+'"></label>';});
    return '<div class="lf-w"><div class="lf-bar"><span class="lf-chip">电磁感应 · 线框穿越边界</span><span class="lf-sp"></span><button class="lf-btn lf-btn--p" data-play>'+(s.playing?'⏸ 暂停':'▶ 播放')+'</button><button class="lf-btn" data-reset>↺ 重置</button></div>'
      +'<div class="lf-grid"><div class="lf-card"><div class="lf-t"><i></i>线框穿过有界磁场<span class="lf-hint">淡紫区为磁场（× 向里）</span></div><div data-cv></div>'
      +'<div class="lf-t" style="margin-top:12px"><i style="background:var(--sky,#BFE3F5)"></i>'+LF_CHART_TITLE[idx]+'<span class="lf-hint">'+LF_CHART_HINT[idx]+'</span></div><div data-datachart></div></div>'
      +'<div class="lf-side"><div class="lf-card"><div class="lf-t"><i style="background:var(--pink,#FFB3BA)"></i>参数</div>'+sl+'</div>'
      +'<div class="lf-card"><div class="lf-t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div><div class="lf-rd">'+rd('ph','当前阶段','')+rd('emf','感应电动势 ε','V')+rd('I','感应电流 I','A')+rd('F','安培力 F','N')+rd('P','热功率 P','W')+rd('Q','累计热量 Q','J')+'</div><div class="lf-n" data-status></div></div></div></div><div class="lf-extra">'+ex+'</div></div>';
  }
  function arrow(ctx,x1,y1,x2,y2,c){var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<3)return;var ux=dx/L,uy=dy/L,h=8;ctx.save();ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*h-uy*h*.6,y2-uy*h+ux*h*.6);ctx.lineTo(x2-ux*h+uy*h*.6,y2-uy*h-ux*h*.6);ctx.closePath();ctx.fill();ctx.restore();}
  function label(ctx,t,x,y,c,al){ctx.save();ctx.font='15px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillStyle=c||C.ink3;ctx.textAlign=al||'left';ctx.fillText(t,x,y);ctx.restore();}
  // 画ε-t波形：tCut=min(L,w)/v（切割段），tHold=|w-L|/v（零平台段），ε幅度=B·L·v
  function wavePath(ctx,s,X,Y){
    var tCut=Math.min(s.L,s.Wf)/s.v,tHold=Math.abs(s.Wf-s.L)/s.v,e=s.B*s.L*s.v,T=2*tCut+tHold;
    ctx.beginPath();
    ctx.moveTo(X(0),Y(0));ctx.lineTo(X(0),Y(e));ctx.lineTo(X(tCut),Y(e));ctx.lineTo(X(tCut),Y(0));
    ctx.lineTo(X(tCut+tHold),Y(0));ctx.lineTo(X(tCut+tHold),Y(-e));ctx.lineTo(X(T),Y(-e));ctx.lineTo(X(T),Y(0));
  }
  function chart(view,s,elapsed){
    var ctx=view.ctx,W=view.w,H=view.h;ctx.clearRect(0,0,W,H);
    var L=54,R=W-18,Tp=18,B=H-32;
    function X(t){return L+Math.min(1,t/T_AXIS)*(R-L);}
    function Y(v){return (Tp+B)/2-(B-Tp)/2*v/EMF_AXIS;}
    // 坐标轴
    ctx.save();ctx.strokeStyle='#e8edf2';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(L,Tp);ctx.lineTo(L,B);ctx.lineTo(R,B);ctx.stroke();
    // 纵轴刻度 ±ε
    [1,0.5,0,-0.5,-1].forEach(function(k){var y=Y(k*EMF_AXIS);ctx.beginPath();ctx.moveTo(L-4,y);ctx.lineTo(L,y);ctx.stroke();label(ctx,(k*EMF_AXIS).toFixed(1),L-6,y,C.ink3,'right');});
    // 横轴刻度 t/s
    for(var t=0;t<=5;t+=1){var xx=X(t);ctx.beginPath();ctx.moveTo(xx,B);ctx.lineTo(xx,B+4);ctx.stroke();label(ctx,String(t),xx,B+15,C.ink3,'center');}
    ctx.restore();
    // 变化前虚线基准（默认参数）
    ctx.save();ctx.strokeStyle='rgba(139,149,163,.55)';ctx.lineWidth=1.6;ctx.setLineDash([5,4]);
    wavePath(ctx,DEFAULTS,X,Y);ctx.stroke();ctx.restore();
    // 当前波形
    ctx.save();ctx.strokeStyle=C.mintD;ctx.lineWidth=2.8;wavePath(ctx,s,X,Y);ctx.stroke();ctx.restore();
    // 游标
    var tc=Math.min(T_AXIS,elapsed),tCut=Math.min(s.L,s.Wf)/s.v,tHold=Math.abs(s.Wf-s.L)/s.v;
    var cy=tc<tCut?1:tc<tCut+tHold?0:tc<2*tCut+tHold?-1:0;
    ctx.save();ctx.strokeStyle=C.pinkD;ctx.lineWidth=1.8;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(X(tc),Tp);ctx.lineTo(X(tc),B);ctx.stroke();ctx.restore();
    ctx.save();ctx.fillStyle=C.pinkD;ctx.beginPath();ctx.arc(X(tc),Y(cy*s.B*s.L*s.v),5,0,Math.PI*2);ctx.fill();ctx.restore();
    label(ctx,'ε / V',L-4,Tp+2,C.ink3,'right');label(ctx,'t / s',R,H-6,C.ink2,'right');
    label(ctx,'— 当前　┄ 变化前',L+6,Tp+10,C.mintD);
  }

  function drawDataChart(view, idx, s, d) {
    var K=global.ChartKit; if(!K) return; var C2=K.colors;
    var B=s.B,L=s.L,v=s.v,R=s.R,Wf=s.Wf, lw=d.lw, fw=d.fw, xf=d.xf;
    if(idx===0){
      // 磁通量随线框右边界位置：Φ = B·L·重叠宽度
      var pts=[];
      for(var i=0;i<=100;i++){
        var xc=-1.5+(d.total+1.5)*i/100, re2=xc+lw;
        var ov=Math.max(0,Math.min(re2,xf+fw)-Math.max(xc,xf));
        pts.push([xc, B*L*(ov/10)]); // 重叠宽度 mm→m
      }
      K.line(view,{title:'磁通量 Φ(x) · 平台期斜率为零',xLabel:'线框左边界 x',xUnit:'m',yLabel:'磁通量 Φ',yUnit:'Wb',
        series:[{name:'Φ(x)',color:C2.lav,width:2.6,points:pts}],
        markers:[{x:s.xc,y:B*L*Math.max(0,Math.min(s.xc+lw,xf+fw)-Math.max(s.xc,xf))/10,label:'当前',color:C2.pink,r:5,cross:true}]});
    } else if(idx===1){
      var tCut=Math.min(L,Wf)/v, tHold=Math.abs(Wf-L)/v, per=2*tCut+tHold, eps=B*L*v;
      var pts2=[], tt=(Math.max(0,s.t)%per);
      for(var j=0;j<=100;j++){var t=per*j/100;var e=(t<tCut)?1:(t<tCut+tHold)?0:(t<2*tCut+tHold)?-1:0;pts2.push([t,e*eps]);}
      K.line(view,{title:'ε—t 波形：进入正、平台零、穿出负',xLabel:'时间 t',xUnit:'s',yLabel:'电动势 ε',yUnit:'V',
        series:[{name:'ε(t)',color:C2.sky,width:2.6,points:pts2}],
        markers:[{x:tt,y:(tt<tCut)?eps:(tt<tCut+tHold)?0:(tt<2*tCut+tHold)?-eps:0,label:'当前',color:C2.pink,r:5,cross:true}],
        hlines:[{y:0,label:'零线',color:C2.ink3,dash:[4,4]}]});
    } else if(idx===2){
      // Q 与 W 累积对比（柱状）
      K.bars(view,{title:'能量守恒：克服安培力做功 = 焦耳热',yLabel:'能量',yUnit:'J',
        yMax:Math.max(1e-6,s.Q,s.W)*1.3,
        bars:[{label:'焦耳热 Q',value:s.Q,color:C2.peach,note:'∫I²R dt'},
              {label:'安培力功 W',value:s.W,color:C2.mint,note:'∫F·v dt'}],
        fmt:function(val){return val.toExponential(2)+' J';}});
    } else {
      // 总热量随 B 变化（控制变量）
      var qpts=[];
      for(var k=0;k<=40;k++){var bb=0.2+1.8*k/40;qpts.push([bb,2*bb*bb*L*L*L/R]);}
      K.line(view,{title:'总热量 Q = 2B²L³/R（随 B² 增长）',xLabel:'磁感应强度 B',xUnit:'T',yLabel:'总热量 Q',yUnit:'J',
        series:[{name:'Q(B)',color:C2.peach,width:2.6,points:qpts}],
        markers:[{x:B,y:2*B*B*L*L*L/R,label:'当前',color:C2.pink,r:5,cross:true}]});
    }
  }

  NS.modules['loop-entering-field']={render:function(container,extIndex){
    style();var idx=Math.max(0,Math.min(3,Number(extIndex)||0));
    var s={B:saved.B,L:saved.L,v:saved.v,R:saved.R,Wf:saved.Wf,playing:saved.playing,xc:-1.5,t:0,Q:0,W:0};
    container.innerHTML=build(idx,s);
    var v=view(1000,430);container.querySelector('[data-cv]').appendChild(v.el);
    var dv=view(700,250);dv.el.style.background='#fff';container.querySelector('[data-datachart]').appendChild(dv.el);
    var chartV=idx===1?view(560,210):null;if(chartV){chartV.el.className='lf-c';container.querySelector('[data-chart]').appendChild(chartV.el);}
    var ctx=v.ctx,W=v.w,H=v.h,LST={},rAF=0,last=0,dead=false;
    var q=function(x){return container.querySelector(x);},qa=function(x){return container.querySelectorAll(x);};
    var units={B:'T',L:'m',v:'m/s',R:'Ω',Wf:'m'};
    function sync(){['B','L','v','R','Wf'].forEach(function(k){saved[k]=s[k];});saved.playing=s.playing;}
    for(var g=0;g<qa('input[type=range]').length;g++){(function(el){on(LST,el,'input',function(e){var k=e.target.getAttribute('data-k');s[k]=Number(e.target.value);q('[data-o="'+k+'"]').textContent=nf(s[k])+' '+units[k];sync();resetQuiz();});})(qa('input[type=range]')[g]);}
    qa('input[type=range]').length&&qa('input[type=range]').forEach(function(el){var k=el.getAttribute('data-k');q('[data-o="'+k+'"]').textContent=nf(s[k])+' '+units[k];});
    var pb=q('[data-play]');on(LST,pb,'click',function(){s.playing=!s.playing;pb.textContent=s.playing?'⏸ 暂停':'▶ 播放';sync();});
    on(LST,q('[data-reset]'),'click',function(){s.xc=-1.5;s.Q=0;s.W=0;s.t=0;});
    var Q={1:{opts:[],correct:0,text:'',expl:''},2:{ans:0,text:'',unit:'',expl:''}},sel=-1;
    function quizData(){
      Q[1].text='线框（磁场向里）正在进入磁场的过程中，感应电流方向是？';
      Q[1].opts=['顺时针','逆时针','无电流'];Q[1].correct=1;
      Q[1].expl='进入时向里的磁通量增加，感应电流产生向外的磁场，由右手螺旋定则为逆时针。穿出时相反。';
      var qtot=2*s.B*s.B*s.L*s.L*s.L/s.R;
      Q[2].text='B='+nf(s.B)+' T，L='+nf(s.L)+' m，v='+nf(s.v)+' m/s，R='+nf(s.R)+' Ω，磁场足够宽。求完整穿越产生的总焦耳热 Q（J）。';
      Q[2].ans=qtot;Q[2].unit='J';Q[2].expl='Q = 2·(B²L²v/R)·(L/v) = 2B²L³/R = 2×'+nf(s.B)+'²×'+nf(s.L)+'³/'+nf(s.R)+' = '+nf(qtot)+' J，与速度无关。';
    }
    function paintQuiz(){if(idx!==3)return;quizData();q('[data-qt="1"]').textContent=Q[1].text;q('[data-qt="2"]').textContent=Q[2].text;q('[data-unit]').textContent=Q[2].unit;var b=q('[data-op="1"]');b.innerHTML='';Q[1].opts.forEach(function(t,i){var x=doc.createElement('button');x.type='button';x.textContent=String.fromCharCode(65+i)+'. '+t;x.setAttribute('data-i',i);b.appendChild(x);});}
    function resetQuiz(){if(idx===3){sel=-1;q('[data-num]').value='';q('[data-fb="1"]').hidden=true;q('[data-fb="2"]').hidden=true;var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.remove('is-sel');paintQuiz();}}
    function submit(n){n=Number(n);var fb=q('[data-fb="'+n+'"]');if(n===1){if(sel<0){fb.className='lf-fb no';fb.hidden=false;fb.textContent='请先选择。';return;}var ok=sel===Q[1].correct;fb.className='lf-fb '+(ok?'ok':'no');fb.hidden=false;fb.innerHTML=(ok?'✅ 正确！':'❌ 再想想。')+Q[1].expl;}
      else{var val=Number(q('[data-num]').value),ok2=isFinite(val)&&Math.abs(val-Q[2].ans)<=Math.max(1e-4,Math.abs(Q[2].ans)*.06);fb.className='lf-fb '+(ok2?'ok':'no');fb.hidden=false;fb.innerHTML=(ok2?'✅ 正确！':'❌ 参考答案 '+nf(Q[2].ans)+' J。')+Q[2].expl;}}
    if(idx===3){paintQuiz();on(LST,q('[data-op="1"]'),'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;sel=Number(b.getAttribute('data-i'));var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.toggle('is-sel',i===sel);});for(var z=0;z<qa('[data-sub]').length;z++){(function(b){on(LST,b,'click',function(){submit(b.getAttribute('data-sub'));});})(qa('[data-sub]')[z]);}}

    function draw(d){
      ctx.clearRect(0,0,W,H);
      var X=function(x){return 40+x*90;},ytop=140,ybot=305;
      // 磁场区
      ctx.save();ctx.fillStyle='#F7F4FC';ctx.fillRect(X(d.xf),ytop-20,d.fw*90,ybot-ytop+40);ctx.strokeStyle=C.lavD;ctx.lineWidth=2;ctx.strokeRect(X(d.xf),ytop-20,d.fw*90,ybot-ytop+40);ctx.restore();
      for(var gx=X(d.xf)+18;gx<X(d.xf)+d.fw*90;gx+=36)for(var gy=ytop;gy<ybot;gy+=38){
        ctx.save();ctx.strokeStyle='#C9BBE4';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(gx,gy,5,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.moveTo(gx-3,gy-3);ctx.lineTo(gx+3,gy+3);ctx.moveTo(gx+3,gy-3);ctx.lineTo(gx-3,gy+3);ctx.stroke();ctx.restore();
      }
      label(ctx,'有界磁场 B='+nf(s.B)+' T，宽 '+nf(s.Wf)+' m',X(d.xf),ytop-32,C.lavD,'center');
      // 线框
      var x1=X(s.xc),x2=X(s.xc+d.lw);
      var phaseCol=d.enter?C.pinkD:d.exit?C.skyD:C.ink3;
      ctx.save();ctx.strokeStyle=phaseCol;ctx.lineWidth=4;ctx.lineJoin='round';
      ctx.strokeRect(x1,ytop,x2-x1,ybot-ytop);ctx.restore();
      if(d.enter||d.exit){
        var c=d.enter?C.pinkD:C.skyD;
        // 进入：向里磁通增加 → 逆时针（上边向左、下边向右）；穿出：顺时针（上边向右、下边向左）
        if(d.enter){arrow(ctx,x2+16,ytop-2,x2-14,ytop-2,c);arrow(ctx,x1-16,ybot+2,x1+14,ybot+2,c);}
        else{arrow(ctx,x1-16,ytop-2,x1+14,ytop-2,c);arrow(ctx,x2+16,ybot+2,x2-14,ybot+2,c);}
        label(ctx,'I = '+nf(d.I)+' A',(x1+x2)/2,ytop-18,c,'center');
      }
      arrow(ctx,x1-70,(ytop+ybot)/2,x1-18,(ytop+ybot)/2,C.mintD);label(ctx,'v',x1-70,(ytop+ybot)/2-10,C.mintD);
      label(ctx,d.phase,40,32,d.enter?C.pinkD:d.exit?C.skyD:C.ink2);
      label(ctx,'左边界 X=0',X(0),ybot+34,C.ink3,'center');label(ctx,'右边界',X(d.xf+d.fw),ybot+34,C.ink3,'center');
    }
    function frame(ts){if(dead)return;if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;
      if(s.playing){
        s.xc+=s.v*6*dt;s.t+=dt;
        var d0=calc(s,s.xc);if(d0.P>0){s.Q+=d0.P*dt;s.W+=d0.F*s.v*dt;}
        if(s.xc>d0.total)s.xc=-1.5;
      }
      var d=calc(s,s.xc);draw(d);
      var set=function(k,val){var e=q('[data-r="'+k+'"]');if(e)e.textContent=val;};
      set('ph',d.phase);set('emf',nf(d.emf));set('I',nf(d.I));set('F',nf(d.F));set('P',nf(d.P));set('Q',nf(s.Q));
      if(idx===1){var tCut=Math.min(s.L,s.Wf)/s.v,tHold=Math.abs(s.Wf-s.L)/s.v,per=2*tCut+tHold;
        set('tin',nf(tCut)+' s');set('tmid',nf(tHold)+' s');set('eplot',nf(s.B*s.L*s.v)+' V');
        chart(chartV,s,Math.max(0,s.t)%per);}
      if(idx===2){set('qtot',nf(2*s.B*s.B*s.L*s.L*s.L/s.R)+' J');var mx=Math.max(s.Q,s.W,1e-6);var f1=q('[data-bar="q"]'),f2=q('[data-bar="w"]'),t1=q('[data-barv="q"]'),t2=q('[data-barv="w"]');if(f1)f1.style.width=(s.Q/mx*100).toFixed(1)+'%';if(f2)f2.style.width=(s.W/mx*100).toFixed(1)+'%';if(t1)t1.textContent=nf(s.Q)+' J';if(t2)t2.textContent=nf(s.W)+' J';}
      var st=q('[data-status]');if(st)st.textContent=d.phase==='完全在内'?'磁通量不变，ε=0，无感应电流。':d.phase==='进入'?'右边切割，逆时针电流，安培力向左阻碍运动。':d.phase==='穿出'?'左边切割，顺时针电流，安培力仍向左阻碍。':'线框尚未进入磁场。';
      drawDataChart(dv,idx,s,d);
      rAF=global.requestAnimationFrame(frame);
    }
    rAF=global.requestAnimationFrame(frame);
    return function cleanup(){if(dead)return;dead=true;global.cancelAnimationFrame(rAF);for(var t in LST){if(!LST.hasOwnProperty(t))continue;var a=LST[t];for(var i=0;i<a.length;i++)a[i][0].removeEventListener(t,a[i][1]);}};
  }};
})(window);
