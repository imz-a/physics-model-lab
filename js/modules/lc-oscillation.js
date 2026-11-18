/* ============================================================
 * lc-oscillation.js — LC 振荡电路
 * T = 2π√(LC)，f = 1/T；q = Q₀cosωt，i = −ωQ₀sinωt
 * 电场能 q²/2C 与磁场能 Li²/2 交替转化，周期 T/2
 * ============================================================ */
(function (global) {
  'use strict';
  var NS=global.ModelLab=global.ModelLab||{};NS.modules=NS.modules||{};
  var doc=global.document;
  var C={ink:'#3a4250',ink2:'#5a6472',ink3:'#8b95a3',pinkD:'#E27886',mintD:'#57A47F',skyD:'#5B9BC4',lavD:'#8A76BB',peachD:'#D69A55'};
  var saved={L:1.0,C:10,playing:true};
  var Q0=10e-6;
  var SID='ml-lc-style';
  var CSS=''
    +'.lc-w{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}.lc-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
    +'.lc-chip{padding:7px 15px;border:1px solid var(--lav,#D0C4E8);border-radius:999px;background:#F7F4FC;color:#7B66A8;font-size:14px;font-weight:600}'
    +'.lc-sp{flex:1 1 auto}.lc-btn{min-height:40px;padding:8px 17px;border:1px solid #dce4ec;border-radius:10px;background:#fff;color:var(--ink2);font-size:15px}.lc-btn--p{border-color:#cbbdea;background:#f5f1fb;color:#6E59A0;font-weight:700}'
    +'.lc-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}@media(max-width:1120px){.lc-grid{grid-template-columns:1fr}}'
    +'.lc-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:18px;box-shadow:0 2px 8px rgba(88,108,132,.05);padding:17px 19px;min-width:0}'
    +'.lc-t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}.lc-t i{width:9px;height:9px;border-radius:50%;background:var(--lav,#D0C4E8)}.lc-hint{font-size:13px;color:var(--ink3);font-weight:400;margin-left:auto}'
    +'canvas.lc-c{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6}'
    +'.lc-side{display:flex;flex-direction:column;gap:14px}.lc-ctrl{display:block;margin-bottom:10px}.lc-ctrl span{display:flex;justify-content:space-between;font-size:14px;color:var(--ink2)}.lc-ctrl output{font-weight:700}.lc-ctrl input{width:100%;accent-color:#A994D4;height:22px;cursor:pointer}'
    +'.lc-rd{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lc-rd div{padding:9px 11px;border:1px solid #eef2f6;border-radius:10px;background:var(--bg,#fafbfc)}.lc-rd span{display:block;font-size:12px;color:var(--ink3)}.lc-rd b{font-size:18px}'
    +'.lc-n{margin-top:9px;padding:9px 12px;border-radius:10px;background:#F7F4FC;border:1px solid #e6dcf6;color:#6B5896;font-size:13px;line-height:1.6}'
    +'.lc-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.lc-f{padding:12px 14px;border-radius:10px;background:#F7F4FC;border:1px solid #e6dcf6;font-size:15px;color:#6B5896;line-height:1.9}.lc-f b{font-size:17px}'
    +'.lc-rel{display:grid;gap:8px;margin-top:11px}.lc-rel div{display:flex;justify-content:space-between;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2)}.lc-rel b{color:var(--ink);font-variant-numeric:tabular-nums}'
    +'.lc-bar{margin-top:10px}.lc-bar__t{display:flex;justify-content:space-between;font-size:13px;color:var(--ink2)}.lc-bar__k{height:20px;border-radius:99px;background:#f0f3f7;overflow:hidden}.lc-bar__f{height:100%;width:0;border-radius:99px;transition:width .12s linear}'
    +'.lc-qz{padding:13px 15px;border:1px solid #ffe6c2;border-radius:11px;background:#FFFCF0;font-size:15px;line-height:1.85;color:#6d5b36}.lc-qz h5{margin:10px 0 4px;font-size:14px;color:#8A6637}'
    +'.lc-opts{display:grid;gap:6px;margin:8px 0}.lc-opts button{min-height:38px;text-align:left;padding:7px 11px;border:1px solid #e8edf2;border-radius:8px;background:#fff;font-size:14px;color:var(--ink2)}.lc-opts button.is-sel{border-color:#A994D4;background:#f5f1fb;color:#6E59A0;font-weight:700}'
    +'.lc-in{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}.lc-in input{width:130px;padding:9px 11px;border:1px solid #dce4ec;border-radius:9px;font-size:15px}'
    +'.lc-fb{margin-top:8px;padding:10px 12px;border-radius:9px;font-size:14px;line-height:1.7}.lc-fb[hidden]{display:none}.lc-fb.ok{background:#EFFAF4;border:1px solid #bfe6d2;color:#3F7A60}.lc-fb.no{background:#FFF4F5;border:1px solid #ffd0d5;color:#A85460}';
  function style(){if(!doc.getElementById(SID)){var s=doc.createElement('style');s.id=SID;s.textContent=CSS;doc.head.appendChild(s);}}
  function view(w,h){var c=doc.createElement('canvas'),d=Math.min(global.devicePixelRatio||1,2);c.width=w*d;c.height=h*d;c.className='lc-c';var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{el:c,ctx:x,w:w,h:h};}
  function nf(v){if(!isFinite(v))return'—';var a=Math.abs(v);return a>=100?v.toFixed(0):a>=10?v.toFixed(1):v.toFixed(3);}
  function on(m,e,t,f){e.addEventListener(t,f);var a=m[t]||(m[t]=[]);a.push([e,f]);}
  function rd(k,l,u){return '<div><span>'+l+'</span><b data-r="'+k+'">—</b> '+u+'</div>';}
  function quiz(){return '<div class="lc-qz"><h5>第 1 题 · 相位判断</h5><div data-qt="1"></div><div class="lc-opts" data-op="1"></div><button class="lc-btn" data-sub="1">提交答案</button><div class="lc-fb" data-fb="1" hidden></div><h5>第 2 题 · 周期计算</h5><div data-qt="2"></div><div class="lc-in"><input type="number" step="any" data-num placeholder="输入数值"><span data-unit></span><button class="lc-btn" data-sub="2">提交答案</button></div><div class="lc-fb" data-fb="2" hidden></div></div>';}
  function st(s,t){var L=s.L,Cf=s.C*1e-6,T=2*Math.PI*Math.sqrt(L*Cf),w=2*Math.PI/T,q=Q0*Math.cos(w*t),i=-w*Q0*Math.sin(w*t);return{L:L,C:Cf,T:T,f:1/T,w:w,q:q,i:i,Ec:q*q/(2*Cf),Em:.5*L*i*i,tot:Q0*Q0/(2*Cf)};}

  NS.modules['lc-oscillation']={render:function(container,extIndex){
    style();var idx=Math.max(0,Math.min(3,Number(extIndex)||0));
    var s={L:saved.L,C:saved.C,playing:saved.playing,t:0};
    container.innerHTML=(function(){
      var ex='';
      if(idx===0)ex='<div class="lc-card"><div class="lc-t"><i style="background:var(--sky,#BFE3F5)"></i>q — t 与 i — t 双曲线</div><div data-wave></div><div class="lc-n">粉色为电荷 q，蓝色为电流 i；二者相位差 π/2（即 T/4）。游标表示当前时刻。</div></div>'
        +'<div class="lc-card"><div class="lc-t"><i style="background:var(--lav,#D0C4E8)"></i>相位关系</div><div class="lc-f"><b>q = Q₀cosωt</b><br><b>i = −ωQ₀sinωt</b><br>q 最大时 i=0（电场能最大）；i 最大时 q=0（磁场能最大）。</div></div>';
      else if(idx===1)ex='<div class="lc-card"><div class="lc-t"><i style="background:var(--mint,#B8E8D0)"></i>周期公式图像</div><div data-chart></div><div class="lc-rel"><div><span>T = 2π√(LC)</span><b data-r="T">—</b></div><div><span>f = 1/T</span><b data-r="f">—</b></div></div></div>'
        +'<div class="lc-card"><div class="lc-t"><i style="background:var(--peach,#FFD8A8)"></i>变量关系</div><div class="lc-f">T ∝ √L，T ∝ √C；<br>L 变为 4 倍 → T 变为 2 倍；C 变为 4 倍 → T 也变为 2 倍。<br>图像是过原点的直线（横轴取 √L 或 √C）。</div></div>';
      else if(idx===2)ex='<div class="lc-card"><div class="lc-t"><i style="background:var(--pink,#FFB3BA)"></i>能量此消彼长</div><div data-energy></div>'
        +'<div class="lc-bar"><div class="lc-bar__t"><span>电场能 Ec = q²/2C</span><b data-barv="ec">—</b></div><div class="lc-bar__k"><div class="lc-bar__f" data-bar="ec" style="background:var(--pink,#FFB3BA)"></div></div></div>'
        +'<div class="lc-bar"><div class="lc-bar__t"><span>磁场能 Em = Li²/2</span><b data-barv="em">—</b></div><div class="lc-bar__k"><div class="lc-bar__f" data-bar="em" style="background:var(--sky,#BFE3F5)"></div></div></div>'
        +'<div class="lc-rel"><div><span>Ec + Em（守恒）</span><b data-r="tot">—</b></div></div></div>'
        +'<div class="lc-card"><div class="lc-t"><i style="background:var(--mint,#B8E8D0)"></i>能量转化周期</div><div class="lc-f">电场能与磁场能各自的变化周期是 <b>T/2</b>；<br>每隔 T/4 完成一次电场能↔磁场能的完全转化；<br>总能量保持不变（理想无电阻）。</div></div>';
      else ex='<div class="lc-card"><div class="lc-t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 两题限时</div>'+quiz()+'<div class="lc-n">题目随 L、C 实时更新，提交后即时判分。</div></div>';
      return '<div class="lc-w"><div class="lc-bar"><span class="lc-chip">电磁振荡 · LC 回路</span><span class="lc-sp"></span><button class="lc-btn lc-btn--p" data-play>'+(s.playing?'⏸ 暂停':'▶ 播放')+'</button><button class="lc-btn" data-reset>↺ 重置</button></div>'
        +'<div class="lc-grid"><div class="lc-card"><div class="lc-t"><i></i>LC 振荡回路<span class="lc-hint">极板电荷与电流方向实时变化</span></div><div data-cv></div></div>'
        +'<div class="lc-side"><div class="lc-card"><div class="lc-t"><i style="background:var(--pink,#FFB3BA)"></i>参数</div>'
        +'<label class="lc-ctrl"><span>电感 L<b data-o="L"></b></span><input type="range" data-k="L" min="0.1" max="2" step="0.1" value="'+s.L+'"></label>'
        +'<label class="lc-ctrl"><span>电容 C<b data-o="C"></b></span><input type="range" data-k="C" min="1" max="100" step="1" value="'+s.C+'"></label></div>'
        +'<div class="lc-card"><div class="lc-t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div><div class="lc-rd">'+rd('T','周期 T','ms')+rd('f','频率 f','Hz')+rd('q','电荷 q','µC')+rd('i','电流 i','mA')+'</div><div class="lc-n" data-status></div></div></div></div><div class="lc-extra">'+ex+'</div></div>';
    })();
    var v=view(1000,430);container.querySelector('[data-cv]').appendChild(v.el);
    var waveV=idx===0?view(560,210):null,chartV=idx===1?view(560,210):null,energyV=idx===2?view(560,210):null;
    [['[data-wave]',waveV],['[data-chart]',chartV],['[data-energy]',energyV]].forEach(function(p){if(p[1]){p[1].el.className='lc-c';container.querySelector(p[0]).appendChild(p[1].el);}});
    var ctx=v.ctx,W=v.w,H=v.h,LST={},rAF=0,last=0,dead=false;
    var q=function(x){return container.querySelector(x);},qa=function(x){return container.querySelectorAll(x);};
    q('[data-o="L"]').textContent=nf(s.L)+' H';q('[data-o="C"]').textContent=nf(s.C)+' µF';
    function sync(){saved.L=s.L;saved.C=s.C;saved.playing=s.playing;}
    for(var g=0;g<qa('input[type=range]').length;g++){(function(el){on(LST,el,'input',function(e){var k=e.target.getAttribute('data-k');s[k]=Number(e.target.value);q('[data-o="'+k+'"]').textContent=nf(s[k])+(k==='L'?' H':' µF');sync();resetQuiz();});})(qa('input[type=range]')[g]);}
    var pb=q('[data-play]');on(LST,pb,'click',function(){s.playing=!s.playing;pb.textContent=s.playing?'⏸ 暂停':'▶ 播放';sync();});on(LST,q('[data-reset]'),'click',function(){s.t=0;});
    var Q={1:{opts:[],correct:0,text:'',expl:''},2:{ans:0,text:'',unit:'',expl:''}},sel=-1;
    function quizData(){
      Q[1].text='LC 振荡电路中，电荷 q 达到最大值时，电流 i 与磁场能情况是？';
      Q[1].opts=['i 最大，磁场能最大','i 为零，磁场能为零','i 与 q 同时最大'];Q[1].correct=1;
      Q[1].expl='q 最大时电容器电场能最大，此时 i=0，线圈磁场能为零；随后电场能向磁场能转化。';
      Q[2].text='L='+nf(s.L)+' H，C='+nf(s.C)+' µF，求振荡周期 T（单位 ms）。';
      Q[2].ans=st(s,0).T*1000;Q[2].unit='ms';Q[2].expl='T = 2π√(LC) = 2π√('+nf(s.L)+'×'+nf(s.C)+'×10⁻⁶) = '+nf(Q[2].ans)+' ms。';
    }
    function paintQuiz(){if(idx!==3)return;quizData();q('[data-qt="1"]').textContent=Q[1].text;q('[data-qt="2"]').textContent=Q[2].text;q('[data-unit]').textContent=Q[2].unit;var b=q('[data-op="1"]');b.innerHTML='';Q[1].opts.forEach(function(t,i){var x=doc.createElement('button');x.type='button';x.textContent=String.fromCharCode(65+i)+'. '+t;x.setAttribute('data-i',i);b.appendChild(x);});}
    function resetQuiz(){if(idx===3){sel=-1;q('[data-num]').value='';q('[data-fb="1"]').hidden=true;q('[data-fb="2"]').hidden=true;var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.remove('is-sel');}}
    function submit(n){n=Number(n);var fb=q('[data-fb="'+n+'"]');if(n===1){if(sel<0){fb.className='lc-fb no';fb.hidden=false;fb.textContent='请先选择。';return;}var ok=sel===Q[1].correct;fb.className='lc-fb '+(ok?'ok':'no');fb.hidden=false;fb.innerHTML=(ok?'✅ 正确！':'❌ 再想想。')+Q[1].expl;}
      else{var val=Number(q('[data-num]').value),ok2=isFinite(val)&&Math.abs(val-Q[2].ans)<=Math.max(.05,Math.abs(Q[2].ans)*.05);fb.className='lc-fb '+(ok2?'ok':'no');fb.hidden=false;fb.innerHTML=(ok2?'✅ 正确！':'❌ 参考答案 '+nf(Q[2].ans)+' ms。')+Q[2].expl;}}
    if(idx===3){paintQuiz();on(LST,q('[data-op="1"]'),'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;sel=Number(b.getAttribute('data-i'));var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.toggle('is-sel',i===sel);});for(var z=0;z<qa('[data-sub]').length;z++){(function(b){on(LST,b,'click',function(){submit(b.getAttribute('data-sub'));});})(qa('[data-sub]')[z]);}}

    function arrow(ctx,x1,y1,x2,y2,c){var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<3)return;var ux=dx/L,uy=dy/L,h=8;ctx.save();ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*h-uy*h*.6,y2-uy*h+ux*h*.6);ctx.lineTo(x2-ux*h+uy*h*.6,y2-uy*h-ux*h*.6);ctx.closePath();ctx.fill();ctx.restore();}
    function label(ctx,t,x,y,c,al){ctx.save();ctx.font='15px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillStyle=c||C.ink3;ctx.textAlign=al||'left';ctx.fillText(t,x,y);ctx.restore();}
    function drawCircuit(S){
      ctx.clearRect(0,0,W,H);
      var xL=180,xR=800,yT=110,yB=320;
      ctx.save();ctx.strokeStyle=C.ink2;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xL,yT);ctx.lineTo(xR-60,yT);ctx.moveTo(xL,yB);ctx.lineTo(xR,yB);ctx.stroke();ctx.restore();
      // 电容
      ctx.save();ctx.strokeStyle=C.pinkD;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(xL,yT+40);ctx.lineTo(xL,yT+90);ctx.stroke();
      ctx.beginPath();ctx.moveTo(xL-32,yT+65);ctx.lineTo(xL+32,yT+65);ctx.moveTo(xL-32,yT+80);ctx.lineTo(xL+32,yT+80);ctx.stroke();ctx.restore();
      ctx.save();ctx.strokeStyle=C.ink2;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xL,yT);ctx.lineTo(xL,yT+65);ctx.moveTo(xL,yT+80);ctx.lineTo(xL,yB);ctx.stroke();ctx.restore();
      var nq=Math.min(6,Math.round(Math.abs(S.q)/Q0*6));
      for(var i=0;i<6;i++){
        var on=i<nq,sgn=S.q>=0?1:-1;
        ctx.save();ctx.globalAlpha=on?1:.18;ctx.fillStyle=sgn>0?C.pinkD:C.skyD;ctx.font='bold 18px sans-serif';ctx.textAlign='center';
        ctx.fillText(sgn>0?'+':'−',xL-16+(i%3)*16,yT+60);ctx.fillText(sgn>0?'−':'+',xL-16+(i%3)*16,yT+92);ctx.restore();
      }
      label(ctx,'C = '+nf(s.C)+' µF',xL-46,yT+130,C.pinkD,'right');
      // 电感线圈（右侧）
      ctx.save();ctx.strokeStyle=C.lavD;ctx.lineWidth=3.5;ctx.beginPath();
      ctx.moveTo(xR-60,yT);
      for(var k=0;k<6;k++)ctx.arc(xR-40+k*14,yT,10,Math.PI,0,false);
      ctx.lineTo(xR,yT+30);ctx.stroke();ctx.restore();
      label(ctx,'L = '+nf(s.L)+' H',xR-20,yT-24,C.lavD,'center');
      // 电流方向
      if(Math.abs(S.i)>1e-5){
        var dir=S.i>0?1:-1;
        arrow(ctx,xL+300,yB,xL+300+dir*90,yB,C.mintD);label(ctx,'i = '+nf(S.i*1000)+' mA',xL+310,yB-12,C.mintD);
        for(var p=0;p<14;p++){var f=(p/14+s.t*.8)%1,px=xL+(xR-xL)*f,py=yB;ctx.save();ctx.fillStyle=C.mintD;ctx.beginPath();ctx.arc(px,py,3.2,0,Math.PI*2);ctx.fill();ctx.restore();}
      }
      label(ctx,'q = '+nf(S.q*1e6)+' µC',xL,yT-24,C.pinkD,'center');
      label(ctx,'电场能 '+nf(S.Ec*1e3)+' mJ　↔　磁场能 '+nf(S.Em*1e3)+' mJ',W/2,H-12,C.lavD,'center');
    }
    function curve(view,fn1,fn2,c1,c2,t,S,ttl){
      var x=view.ctx,w=view.w,h=view.h;x.clearRect(0,0,w,h);
      var L=46,R=w-18,T=18,B=h-30;
      x.save();x.strokeStyle='#e8edf2';x.beginPath();x.moveTo(L,T);x.lineTo(L,B);x.lineTo(R,B);x.stroke();x.restore();
      label(x,ttl,L+4,T+10,C.ink3);
      var mx=Math.max(1e-9,Math.abs(fn1(0)),Math.abs(fn2(ttl/4)))*1.15;
      function X(v){return L+(R-L)*v/ttl;}function Y(v){return (T+B)/2-(B-T)/2*v/mx;}
      x.save();x.strokeStyle='#f0f3f7';x.beginPath();x.moveTo(L,Y(0));x.lineTo(R,Y(0));x.stroke();x.restore();
      [[fn1,c1],[fn2,c2]].forEach(function(p){x.save();x.strokeStyle=p[1];x.lineWidth=2.6;x.beginPath();for(var i=0;i<=140;i++){var tv=ttl*i/140;if(i===0)x.moveTo(X(tv),Y(p[0](tv)));else x.lineTo(X(tv),Y(p[0](tv)));}x.stroke();x.restore();});
      var tc=Math.min(ttl,t);
      x.save();x.strokeStyle=C.lavD;x.setLineDash([4,4]);x.beginPath();x.moveTo(X(tc),T);x.lineTo(X(tc),B);x.stroke();x.restore();
      x.save();x.fillStyle=C.pinkD;x.beginPath();x.arc(X(tc),Y(fn1(tc)),5,0,Math.PI*2);x.fill();x.restore();
      label(x,'t / ms',R,h-6,C.ink2,'right');
    }
    function frame(ts){if(dead)return;if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;
      if(s.playing)s.t+=dt;
      var S=st(s,s.t);drawCircuit(S);
      var set=function(k,v){var e=q('[data-r="'+k+'"]');if(e)e.textContent=v;};
      set('T',nf(S.T*1000));set('f',nf(S.f));set('q',nf(S.q*1e6));set('i',nf(S.i*1000));
      if(idx===0){curve(waveV,function(t){return Q0*Math.cos(S.w*t);},function(t){return -S.w*Q0*Math.sin(S.w*t);},C.pinkD,C.skyD,s.t%S.T,S,S.T,'q（粉）/ i（蓝）');}
      if(idx===1){set('T',nf(S.T*1000)+' ms');set('f',nf(S.f)+' Hz');
        var cv=chartV.ctx,w=chartV.w,h=chartV.h;cv.clearRect(0,0,w,h);var L=48,R=w-18,T=18,B=h-30;
        function fn(x){return 2*Math.PI*Math.sqrt(x*s.C*1e-6)*1000;}var maxL=2,mx=fn(maxL)*1.15;
        cv.save();cv.strokeStyle='#e8edf2';cv.beginPath();cv.moveTo(L,T);cv.lineTo(L,B);cv.lineTo(R,B);cv.stroke();cv.restore();
        cv.save();cv.strokeStyle=C.mintD;cv.lineWidth=2.6;cv.beginPath();cv.moveTo(L,B);cv.lineTo(R,B-(B-T)*fn(maxL)/mx);cv.stroke();cv.restore();
        cv.save();cv.fillStyle=C.pinkD;cv.beginPath();cv.arc(L+(R-L)*s.L/maxL,B-(B-T)*fn(s.L)/mx,6,0,Math.PI*2);cv.fill();cv.restore();
        label(cv,'T / ms',L-4,T+2,C.ink3,'right');label(cv,'L / H',R,h-6,C.ink2,'right');label(cv,'T ∝ √L',L+4,T+10,C.mintD);
      }
      if(idx===2){curve(energyV,function(t){var qq=Q0*Math.cos(S.w*t);return qq*qq/(2*S.C);},function(t){var ii=-S.w*Q0*Math.sin(S.w*t);return .5*S.L*ii*ii;},C.pinkD,C.skyD,s.t%(S.T/2),S,S.T/2,'Ec（粉）/ Em（蓝）');
        set('tot',nf(S.tot*1e3)+' mJ');var f1=q('[data-bar="ec"]'),f2=q('[data-bar="em"]'),t1=q('[data-barv="ec"]'),t2=q('[data-barv="em"]');
        if(f1)f1.style.width=(S.Ec/S.tot*100).toFixed(1)+'%';if(f2)f2.style.width=(S.Em/S.tot*100).toFixed(1)+'%';if(t1)t1.textContent=nf(S.Ec*1e3)+' mJ';if(t2)t2.textContent=nf(S.Em*1e3)+' mJ';}
      var msg=q('[data-status]');if(msg)msg.textContent='T = 2π√(LC) = '+nf(S.T*1000)+' ms；电场能与磁场能每隔 T/4 完全转化一次。';
      rAF=global.requestAnimationFrame(frame);
    }
    rAF=global.requestAnimationFrame(frame);
    return function cleanup(){if(dead)return;dead=true;global.cancelAnimationFrame(rAF);for(var t in LST){if(!LST.hasOwnProperty(t))continue;var a=LST[t];for(var i=0;i<a.length;i++)a[i][0].removeEventListener(t,a[i][1]);}};
  }};
})(window);
