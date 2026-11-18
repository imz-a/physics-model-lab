/* ============================================================
 * self-mutual-induction.js — 自感与互感
 * ε自 = −L ΔI/Δt；τ = L/R；磁场能 W = ½LI²
 * ============================================================ */
(function (global) {
  'use strict';
  var NS=global.ModelLab=global.ModelLab||{};NS.modules=NS.modules||{};
  var doc=global.document;
  var C={ink:'#3a4250',ink2:'#5a6472',ink3:'#8b95a3',pinkD:'#E27886',mintD:'#57A47F',skyD:'#5B9BC4',lavD:'#8A76BB',peachD:'#D69A55'};
  var saved={L:2.0,R:6.0,on:true,playing:true};
  var SID='ml-si-style';
  var CSS=''
    +'.si-w{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}.si-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
    +'.si-chip{padding:7px 15px;border:1px solid var(--cream,#FFF3BF);border-radius:999px;background:#FFFCF0;color:#9A7B28;font-size:14px;font-weight:600}'
    +'.si-seg{display:inline-flex;padding:3px;border:1px solid #e8edf2;border-radius:999px;background:#f6f8fa;gap:3px}.si-seg button{min-height:36px;padding:6px 16px;border:0;border-radius:999px;background:transparent;color:var(--ink2);font-size:14px}.si-seg button.is-on{background:#fff;color:var(--ink);font-weight:700;box-shadow:0 1px 5px rgba(88,108,132,.13)}'
    +'.si-sp{flex:1 1 auto}.si-btn{min-height:40px;padding:8px 17px;border:1px solid #dce4ec;border-radius:10px;background:#fff;color:var(--ink2);font-size:15px}.si-btn--p{border-color:#e6d59a;background:#FFFCF0;color:#9A7B28;font-weight:700}'
    +'.si-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}@media(max-width:1120px){.si-grid{grid-template-columns:1fr}}'
    +'.si-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:18px;box-shadow:0 2px 8px rgba(88,108,132,.05);padding:17px 19px;min-width:0}'
    +'.si-t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}.si-t i{width:9px;height:9px;border-radius:50%;background:var(--cream,#FFF3BF)}.si-hint{font-size:13px;color:var(--ink3);font-weight:400;margin-left:auto}'
    +'canvas.si-c{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6}'
    +'.si-side{display:flex;flex-direction:column;gap:14px}.si-ctrl{display:block;margin-bottom:10px}.si-ctrl span{display:flex;justify-content:space-between;font-size:14px;color:var(--ink2)}.si-ctrl output{font-weight:700}.si-ctrl input{width:100%;accent-color:#D8BF6A;height:22px;cursor:pointer}'
    +'.si-rd{display:grid;grid-template-columns:1fr 1fr;gap:8px}.si-rd div{padding:9px 11px;border:1px solid #eef2f6;border-radius:10px;background:var(--bg,#fafbfc)}.si-rd span{display:block;font-size:12px;color:var(--ink3)}.si-rd b{font-size:18px}'
    +'.si-n{margin-top:9px;padding:9px 12px;border-radius:10px;background:#FFFCF0;border:1px solid #f2e6bd;color:#9A7B28;font-size:13px;line-height:1.6}'
    +'.si-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.si-f{padding:12px 14px;border-radius:10px;background:#FFFCF0;border:1px solid #f2e6bd;font-size:15px;color:#8A6F28;line-height:1.9}.si-f b{font-size:17px}'
    +'.si-rel{display:grid;gap:8px;margin-top:11px}.si-rel div{display:flex;justify-content:space-between;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2)}.si-rel b{color:var(--ink);font-variant-numeric:tabular-nums}'
    +'.si-bar{margin-top:10px}.si-bar__t{display:flex;justify-content:space-between;font-size:13px;color:var(--ink2)}.si-bar__k{height:20px;border-radius:99px;background:#f0f3f7;overflow:hidden}.si-bar__f{height:100%;width:0;border-radius:99px;transition:width .12s linear}'
    +'.si-qz{padding:13px 15px;border:1px solid #ffe6c2;border-radius:11px;background:#FFFCF0;font-size:15px;line-height:1.85;color:#6d5b36}.si-qz h5{margin:10px 0 4px;font-size:14px;color:#8A6637}'
    +'.si-opts{display:grid;gap:6px;margin:8px 0}.si-opts button{min-height:38px;text-align:left;padding:7px 11px;border:1px solid #e8edf2;border-radius:8px;background:#fff;font-size:14px;color:var(--ink2)}.si-opts button.is-sel{border-color:#E0C979;background:#FFFCF0;color:#8A6F28;font-weight:700}'
    +'.si-in{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}.si-in input{width:130px;padding:9px 11px;border:1px solid #dce4ec;border-radius:9px;font-size:15px}'
    +'.si-fb{margin-top:8px;padding:10px 12px;border-radius:9px;font-size:14px;line-height:1.7}.si-fb[hidden]{display:none}.si-fb.ok{background:#EFFAF4;border:1px solid #bfe6d2;color:#3F7A60}.si-fb.no{background:#FFF4F5;border:1px solid #ffd0d5;color:#A85460}';
  function style(){if(!doc.getElementById(SID)){var s=doc.createElement('style');s.id=SID;s.textContent=CSS;doc.head.appendChild(s);}}
  function view(w,h){var c=doc.createElement('canvas'),d=Math.min(global.devicePixelRatio||1,2);c.width=w*d;c.height=h*d;c.className='si-c';var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{el:c,ctx:x,w:w,h:h};}
  function nf(v){if(!isFinite(v))return'—';var a=Math.abs(v);return a>=100?v.toFixed(0):a>=10?v.toFixed(1):v.toFixed(3);}
  function on(m,e,t,f){e.addEventListener(t,f);var a=m[t]||(m[t]=[]);a.push([e,f]);}
  function rd(k,l,u){return '<div><span>'+l+'</span><b data-r="'+k+'">—</b> '+u+'</div>';}
  function quiz(){return '<div class="si-qz"><h5>第 1 题 · 现象判断</h5><div data-qt="1"></div><div class="si-opts" data-op="1"></div><button class="si-btn" data-sub="1">提交答案</button><div class="si-fb" data-fb="1" hidden></div><h5>第 2 题 · 定量计算</h5><div data-qt="2"></div><div class="si-in"><input type="number" step="any" data-num placeholder="输入数值"><span data-unit></span><button class="si-btn" data-sub="2">提交答案</button></div><div class="si-fb" data-fb="2" hidden></div></div>';}
  function build(idx,s){
    var ex='';
    if(idx===1)ex='<div class="si-card"><div class="si-t"><i style="background:var(--sky,#BFE3F5)"></i>I — t 暂态曲线</div><div data-chart></div><div class="si-rel"><div><span>时间常数 τ = L/R</span><b data-r="tau">—</b></div><div><span>稳态电流 I₀ = V/R</span><b data-r="i0">—</b></div><div><span>经过 5τ 后电流</span><b data-r="five">—</b></div></div><div class="si-n">τ 越大（L 大或 R 小），电流建立/衰减越慢；5τ 后暂态基本结束。</div></div>'
      +'<div class="si-card"><div class="si-t"><i style="background:var(--lav,#D0C4E8)"></i>自感的"阻碍"</div><div class="si-f">通电瞬间：电流想增大，自感电动势方向与电源相反，电流<b>逐渐增大</b>；<br>断电瞬间：电流想减小，自感电动势与原电流同向，电流<b>逐渐减小</b>（可能使灯泡闪亮）。<br><b>ε自 = −L·ΔI/Δt</b></div></div>';
    else if(idx===2)ex='<div class="si-card"><div class="si-t"><i style="background:var(--peach,#FFD8A8)"></i>磁场能与焦耳热</div>'
      +'<div class="si-bar"><div class="si-bar__t"><span>磁场能 W = ½LI²</span><b data-barv="mag">—</b></div><div class="si-bar__k"><div class="si-bar__f" data-bar="mag" style="background:var(--lav,#D0C4E8)"></div></div></div>'
      +'<div class="si-bar"><div class="si-bar__t"><span>电阻累计热 Q = ∫I²R dt</span><b data-barv="heat">—</b></div><div class="si-bar__k"><div class="si-bar__f" data-bar="heat" style="background:var(--peach,#FFD8A8)"></div></div></div>'
      +'<div class="si-n">通电时电源做功一部分存为磁场能、一部分变成热；断电时磁场能通过自感电流全部释放为热。</div><div class="si-rel"><div><span>稳态磁场能 ½LI₀²</span><b data-r="wmax">—</b></div></div></div>'
      +'<div class="si-card"><div class="si-t"><i style="background:var(--mint,#B8E8D0)"></i>能量守恒</div><div class="si-f">电源提供的能量 = 磁场能增量 + 电阻发热<br>断开后线圈与灯泡构成回路，磁场能 <b>½LI²</b> 继续驱动电流，最终全部转化为热与光。</div></div>';
    else if(idx===3)ex='<div class="si-card"><div class="si-t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 两题限时</div>'+quiz()+'<div class="si-n">题目随 L、R 与开关状态实时更新，提交后即时判分。</div></div>';
    else ex='<div class="si-card"><div class="si-t"><i style="background:var(--cream,#FFF3BF)"></i>自感现象</div><div class="si-f">线圈中电流变化时，自身产生感应电动势阻碍电流变化：<br><b>ε自 = −L·ΔI/Δt</b>，<b>τ = L/R</b>。<br>通电：灯泡慢慢变亮；断电：灯泡慢慢熄灭（甚至闪亮一下）。</div></div>'
      +'<div class="si-card"><div class="si-t"><i style="background:var(--sky,#BFE3F5)"></i>互感现象</div><div class="si-f">一个线圈电流变化，使邻近另一线圈磁通量变化而产生感应电动势：<br><b>ε₂ = −M·ΔI₁/Δt</b>。<br>图中下方副线圈的箭头表示互感电流方向，总是阻碍原磁通的变化。</div></div>';
    return '<div class="si-w"><div class="si-bar"><span class="si-chip">电磁感应 · 自感与互感</span><div class="si-seg" data-seg="sw"><button data-val="on" class="'+(s.on?'is-on':'')+'">闭合开关</button><button data-val="off" class="'+(!s.on?'is-on':'')+'">断开开关</button></div><span class="si-sp"></span><button class="si-btn si-btn--p" data-play>'+(s.playing?'⏸ 暂停':'▶ 播放')+'</button><button class="si-btn" data-reset>↺ 重置</button></div>'
      +'<div class="si-grid"><div class="si-card"><div class="si-t"><i></i>含线圈与灯泡的电路<span class="si-hint">灯泡亮度随电流实时变化</span></div><div data-cv></div></div>'
      +'<div class="si-side"><div class="si-card"><div class="si-t"><i style="background:var(--pink,#FFB3BA)"></i>参数</div>'
      +'<label class="si-ctrl"><span>自感系数 L<b data-o="L"></b></span><input type="range" data-k="L" min="0.2" max="5" step="0.2" value="'+s.L+'"></label>'
      +'<label class="si-ctrl"><span>电阻 R<b data-o="R"></b></span><input type="range" data-k="R" min="1" max="20" step="1" value="'+s.R+'"></label><div class="si-n">电源电压固定 6 V；τ = L/R，L 越大或 R 越小，暂态越慢。</div></div>'
      +'<div class="si-card"><div class="si-t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div><div class="si-rd">'+rd('I','当前电流 I','A')+rd('tau','时间常数 τ','s')+rd('emf','自感电动势','V')+rd('W','磁场能 ½LI²','J')+'</div><div class="si-n" data-status></div></div></div></div><div class="si-extra">'+ex+'</div></div>';
  }
  function arrow(ctx,x1,y1,x2,y2,c){var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<4)return;var ux=dx/L,uy=dy/L,h=8;ctx.save();ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*h-uy*h*.6,y2-uy*h+ux*h*.6);ctx.lineTo(x2-ux*h+uy*h*.6,y2-uy*h-ux*h*.6);ctx.closePath();ctx.fill();ctx.restore();}
  function label(ctx,t,x,y,c,al){ctx.save();ctx.font='15px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillStyle=c||C.ink3;ctx.textAlign=al||'left';ctx.fillText(t,x,y);ctx.restore();}
  function state(s,t){var I0=6/s.R,tau=s.L/s.R;var I=s.on?I0*(1-Math.exp(-t/tau)):I0*Math.exp(-t/tau);var dI=s.on?(I0/tau)*Math.exp(-t/tau):-(I0/tau)*Math.exp(-t/tau);return{I:I,dI:dI,tau:tau,I0:I0,emf:-s.L*dI,W:.5*s.L*I*I};}

  NS.modules['self-mutual-induction']={render:function(container,extIndex){
    style();var idx=Math.max(0,Math.min(3,Number(extIndex)||0));
    var s={L:saved.L,R:saved.R,on:saved.on,playing:saved.playing,t:0,heat:0};
    container.innerHTML=build(idx,s);
    var v=view(1000,430);container.querySelector('[data-cv]').appendChild(v.el);
    var chartV=idx===1?view(560,210):null;if(chartV){chartV.el.className='si-c';container.querySelector('[data-chart]').appendChild(chartV.el);}
    var ctx=v.ctx,W=v.w,H=v.h,LST={},rAF=0,last=0,dead=false;
    var q=function(x){return container.querySelector(x);},qa=function(x){return container.querySelectorAll(x);};
    q('[data-o="L"]').textContent=nf(s.L)+' H';q('[data-o="R"]').textContent=nf(s.R)+' Ω';
    function setSeg(val){var b=q('[data-seg="sw"]').querySelectorAll('button');for(var i=0;i<b.length;i++)b[i].classList.toggle('is-on',b[i].getAttribute('data-val')===val);}
    function sync(){saved.L=s.L;saved.R=s.R;saved.on=s.on;saved.playing=s.playing;}
    for(var g=0;g<qa('input[type=range]').length;g++){(function(el){on(LST,el,'input',function(e){var k=e.target.getAttribute('data-k');s[k]=Number(e.target.value);q('[data-o="'+k+'"]').textContent=nf(s[k])+(k==='L'?' H':' Ω');sync();resetQuiz();});})(qa('input[type=range]')[g]);}
    on(LST,q('[data-seg="sw"]'),'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;s.on=b.getAttribute('data-val')==='on';s.t=0;setSeg(s.on?'on':'off');sync();resetQuiz();});
    var pb=q('[data-play]');on(LST,pb,'click',function(){s.playing=!s.playing;pb.textContent=s.playing?'⏸ 暂停':'▶ 播放';sync();});on(LST,q('[data-reset]'),'click',function(){s.t=0;s.heat=0;});
    var Q={1:{opts:[],correct:0,text:'',expl:''},2:{ans:0,text:'',unit:'',expl:''}},sel=-1;
    function quizData(){
      Q[1].text='闭合含大自感线圈的开关瞬间，与线圈串联的灯泡亮度如何变化？';
      Q[1].opts=['立即达到最亮','由暗逐渐变亮','先闪亮再熄灭'];Q[1].correct=1;
      Q[1].expl='电流增大时自感电动势阻碍电流增大，电流从零按指数规律上升，灯泡逐渐变亮。';
      var st=state(s,s.tau*Math.log(2)/(s.on?1:1));
      Q[2].text='L='+nf(s.L)+' H，R='+nf(s.R)+' Ω，求时间常数 τ=L/R（单位 s）。';
      Q[2].ans=s.L/s.R;Q[2].unit='s';Q[2].expl='τ = L/R = '+nf(s.L)+'/'+nf(s.R)+' = '+nf(s.L/s.R)+' s；经过约 5τ 暂态基本结束。';
    }
    function paintQuiz(){if(idx!==3)return;quizData();q('[data-qt="1"]').textContent=Q[1].text;q('[data-qt="2"]').textContent=Q[2].text;q('[data-unit]').textContent=Q[2].unit;var b=q('[data-op="1"]');b.innerHTML='';Q[1].opts.forEach(function(t,i){var x=doc.createElement('button');x.type='button';x.textContent=String.fromCharCode(65+i)+'. '+t;x.setAttribute('data-i',i);b.appendChild(x);});}
    function resetQuiz(){if(idx===3){sel=-1;q('[data-num]').value='';q('[data-fb="1"]').hidden=true;q('[data-fb="2"]').hidden=true;var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.remove('is-sel');}}
    function submit(n){n=Number(n);var fb=q('[data-fb="'+n+'"]');if(n===1){if(sel<0){fb.className='si-fb no';fb.hidden=false;fb.textContent='请先选择。';return;}var ok=sel===Q[1].correct;fb.className='si-fb '+(ok?'ok':'no');fb.hidden=false;fb.innerHTML=(ok?'✅ 正确！':'❌ 再想想。')+Q[1].expl;}
      else{var val=Number(q('[data-num]').value),ok2=isFinite(val)&&Math.abs(val-Q[2].ans)<=Math.max(.01,Math.abs(Q[2].ans)*.05);fb.className='si-fb '+(ok2?'ok':'no');fb.hidden=false;fb.innerHTML=(ok2?'✅ 正确！':'❌ 参考答案 '+nf(Q[2].ans)+' s。')+Q[2].expl;}}
    if(idx===3){paintQuiz();on(LST,q('[data-op="1"]'),'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;sel=Number(b.getAttribute('data-i'));var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.toggle('is-sel',i===sel);});for(var z=0;z<qa('[data-sub]').length;z++){(function(b){on(LST,b,'click',function(){submit(b.getAttribute('data-sub'));});})(qa('[data-sub]')[z]);}}

    function draw(st){
      ctx.clearRect(0,0,W,H);
      var xL=120,xR=830,yT=90,yB=340;
      // 边框与元件
      ctx.save();ctx.strokeStyle=C.ink2;ctx.lineWidth=3;ctx.lineJoin='round';ctx.beginPath();
      ctx.moveTo(xL,yT);ctx.lineTo(xR,yT);ctx.lineTo(xR,yB);ctx.lineTo(xL,yB);ctx.closePath();ctx.stroke();ctx.restore();
      // 电池
      ctx.save();ctx.strokeStyle=C.pinkD;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xL-12,yT+50);ctx.lineTo(xL+12,yT+50);ctx.moveTo(xL-6,yT+72);ctx.lineTo(xL+6,yT+72);ctx.stroke();ctx.restore();
      label(ctx,'6 V',xL-24,yT+66,C.pinkD,'right');
      // 开关
      ctx.save();ctx.strokeStyle=C.ink2;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(xL+70,yT);ctx.lineTo(xL+110,yT-(s.on?0:26));ctx.stroke();ctx.restore();
      ctx.save();ctx.fillStyle=s.on?C.mintD:C.pinkD;ctx.beginPath();ctx.arc(xL+70,yT,5,0,Math.PI*2);ctx.arc(xL+110,yT,5,0,Math.PI*2);ctx.fill();ctx.restore();
      label(ctx,s.on?'开关 闭合':'开关 断开',xL+90,yT-34,s.on?C.mintD:C.pinkD,'center');
      // 线圈（ Primary）
      ctx.save();ctx.strokeStyle=C.lavD;ctx.lineWidth=3;ctx.beginPath();
      for(var i=0;i<5;i++)ctx.arc(xL+330+i*22,yT,13,Math.PI,0,false);
      ctx.stroke();ctx.restore();label(ctx,'L = '+nf(s.L)+' H',xL+380,yT-24,C.lavD,'center');
      // 灯泡（右侧）
      var bright=Math.min(1,st.I/(6/s.R));
      var gx=xR,gy=(yT+yB)/2;
      ctx.save();var grd=ctx.createRadialGradient(gx,gy,3,gx,gy,60);grd.addColorStop(0,'rgba(255,227,140,'+(.15+bright*.75)+')');grd.addColorStop(1,'rgba(255,227,140,0)');ctx.fillStyle=grd;ctx.beginPath();ctx.arc(gx,gy,60,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save();ctx.fillStyle=bright>.05?'#FFF3BF':'#fff';ctx.strokeStyle=C.ink2;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(gx,gy,20,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(gx-11,gy+11);ctx.lineTo(gx+11,gy-11);ctx.moveTo(gx-11,gy-11);ctx.lineTo(gx+11,gy+11);ctx.stroke();ctx.restore();
      label(ctx,'灯泡',gx+36,gy+5,C.ink2);
      // 电阻（底部）
      ctx.save();ctx.strokeStyle=C.peachD;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xL+320,yB);
      for(var k=0;k<7;k++)ctx.lineTo(xL+330+k*18,yB+(k%2?12:-12));
      ctx.lineTo(xL+470,yB);ctx.stroke();ctx.restore();label(ctx,'R = '+nf(s.R)+' Ω',xL+400,yB+34,C.peachD,'center');
      // 电流流动点
      if(st.I>.002){
        var n=16,spd=Math.min(.5,st.I*.08);
        for(var p=0;p<n;p++){
          var f=((p/n+s.t*spd)%1),px,py;
          if(f<.33){px=xL+(xR-xL)*f/.33;py=yT;}
          else if(f<.66){px=xR;py=yT+(yB-yT)*(f-.33)/.33;}
          else{px=xR-(xR-xL)*(f-.66)/.34;py=yB;}
          ctx.save();ctx.fillStyle=C.skyD;ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fill();ctx.restore();
        }
        arrow(ctx,xL+180,yT,xL+230,yT,C.skyD);label(ctx,'I='+nf(st.I)+' A',xL+180,yT-12,C.skyD);
      }
      // 副线圈（互感）
      ctx.save();ctx.strokeStyle=C.mintD;ctx.lineWidth=2.5;ctx.beginPath();
      for(var m=0;m<5;m++)ctx.arc(xL+330+m*22,yT+95,12,Math.PI,0,false);
      ctx.stroke();ctx.restore();
      label(ctx,'副线圈（互感）',xL+380,yT+128,C.mintD,'center');
      if(Math.abs(st.dI)>.002){
        var dir=st.dI>0?-1:1;
        arrow(ctx,xL+380,yT+95,xL+380+dir*70,yT+95,C.mintD);
        label(ctx,'ε₂ ∝ −ΔI₁/Δt',xL+390,yT+80,C.mintD);
      }
      label(ctx,s.on?'通电暂态：电流逐渐增大':'断电暂态：电流逐渐减小',24,H-12,s.on?C.lavD:C.pinkD);
    }
    function drawChart(st){
      var ctx=chartV.ctx,W=chartV.w,H=chartV.h;ctx.clearRect(0,0,W,H);
      var L=46,R=W-18,T=18,B=H-32,TT=Math.max(6*st.tau,.5);
      function X(t){return L+(R-L)*t/TT;}function Y(v){return B-(B-T)*v/(st.I0*1.15);}
      ctx.save();ctx.strokeStyle='#e8edf2';ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,B);ctx.lineTo(R,B);ctx.stroke();ctx.restore();
      label(ctx,'I / A',L-4,T+2,C.ink3,'right');label(ctx,'t / s',R,H-6,C.ink2,'right');
      ctx.save();ctx.strokeStyle=C.mintD;ctx.lineWidth=2.6;ctx.beginPath();
      for(var i=0;i<=140;i++){var t=TT*i/140,v=s.on?st.I0*(1-Math.exp(-t/st.tau)):st.I0*Math.exp(-t/st.tau);if(i===0)ctx.moveTo(X(t),Y(v));else ctx.lineTo(X(t),Y(v));}
      ctx.stroke();ctx.restore();
      ctx.save();ctx.strokeStyle=C.pinkD;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(X(st.tau),T);ctx.lineTo(X(st.tau),B);ctx.stroke();ctx.restore();
      label(ctx,'τ='+nf(st.tau)+' s',X(st.tau)+5,T+12,C.pinkD);
      ctx.save();ctx.fillStyle=C.pinkD;ctx.beginPath();ctx.arc(X(Math.min(TT,s.t)),Y(st.I),6,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function frame(ts){if(dead)return;if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;
      if(s.playing){s.t+=dt;s.heat+=state(s,s.t).I*state(s,s.t).I*s.R*dt;}
      var st=state(s,s.t);draw(st);
      var set=function(k,v){var e=q('[data-r="'+k+'"]');if(e)e.textContent=v;};
      set('I',nf(st.I));set('tau',nf(st.tau)+' s');set('emf',nf(st.emf)+' V');set('W',nf(st.W)+' J');
      if(idx===1){set('tau',nf(st.tau)+' s');set('i0',nf(st.I0)+' A');set('five',nf(st.I0*Math.exp(-5))+' A');drawChart(st);}
      if(idx===2){set('wmax',nf(.5*s.L*st.I0*st.I0)+' J');var mx=Math.max(st.W,s.heat,.5*s.L*st.I0*st.I0,1e-6);
        var f1=q('[data-bar="mag"]'),f2=q('[data-bar="heat"]'),t1=q('[data-barv="mag"]'),t2=q('[data-barv="heat"]');
        if(f1)f1.style.width=(st.W/mx*100).toFixed(1)+'%';if(f2)f2.style.width=(s.heat/mx*100).toFixed(1)+'%';if(t1)t1.textContent=nf(st.W)+' J';if(t2)t2.textContent=nf(s.heat)+' J';}
      var msg=q('[data-status]');if(msg)msg.textContent=s.on?'闭合后自感阻碍电流增大，τ = L/R = '+nf(st.tau)+' s。':'断开后磁场能释放，电流按指数衰减，灯泡逐渐熄灭。';
      rAF=global.requestAnimationFrame(frame);
    }
    rAF=global.requestAnimationFrame(frame);
    return function cleanup(){if(dead)return;dead=true;global.cancelAnimationFrame(rAF);for(var t in LST){if(!LST.hasOwnProperty(t))continue;var a=LST[t];for(var i=0;i<a.length;i++)a[i][0].removeEventListener(t,a[i][1]);}};
  }};
})(window);
