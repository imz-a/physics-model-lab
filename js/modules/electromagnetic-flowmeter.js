/* ============================================================
 * electromagnetic-flowmeter.js — 电磁流量计
 * ε: qvB=qE → E=Bv；U=Bvd；Q=v·πd²/4=πdU/(4B)
 * ============================================================ */
(function (global) {
  'use strict';
  var NS=global.ModelLab=global.ModelLab||{};NS.modules=NS.modules||{};
  var doc=global.document;
  var C={ink:'#3a4250',ink2:'#5a6472',ink3:'#8b95a3',pinkD:'#E27886',mintD:'#57A47F',skyD:'#5B9BC4',lavD:'#8A76BB',peachD:'#D69A55'};
  var saved={B:1.0,d:0.10,v:1.0,playing:true};
  var SID='ml-fm-style';
  var CSS=''
    +'.fm-w{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}.fm-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
    +'.fm-chip{padding:7px 15px;border:1px solid var(--mint,#B8E8D0);border-radius:999px;background:#F1FBF6;color:#4C9071;font-size:14px;font-weight:600}'
    +'.fm-seg{display:inline-flex;padding:3px;border:1px solid #e8edf2;border-radius:999px;background:#f6f8fa;gap:3px}.fm-seg button{min-height:36px;padding:6px 14px;border:0;border-radius:999px;background:transparent;color:var(--ink2);font-size:14px}.fm-seg button.is-on{background:#fff;color:var(--ink);font-weight:700;box-shadow:0 1px 5px rgba(88,108,132,.13)}'
    +'.fm-sp{flex:1 1 auto}.fm-btn{min-height:40px;padding:8px 17px;border:1px solid #dce4ec;border-radius:10px;background:#fff;color:var(--ink2);font-size:15px}.fm-btn--p{border-color:#a9dfc4;background:#eef9f3;color:#438562;font-weight:700}'
    +'.fm-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}@media(max-width:1120px){.fm-grid{grid-template-columns:1fr}}'
    +'.fm-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:18px;box-shadow:0 2px 8px rgba(88,108,132,.05);padding:17px 19px;min-width:0}'
    +'.fm-t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}.fm-t i{width:9px;height:9px;border-radius:50%;background:var(--mint,#B8E8D0)}.fm-hint{font-size:13px;color:var(--ink3);font-weight:400;margin-left:auto}'
    +'canvas.fm-c{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6}'
    +'.fm-side{display:flex;flex-direction:column;gap:14px}.fm-ctrl{display:block;margin-bottom:10px}.fm-ctrl span{display:flex;justify-content:space-between;font-size:14px;color:var(--ink2)}.fm-ctrl output{font-weight:700}.fm-ctrl input{width:100%;accent-color:#8ED6B4;height:22px;cursor:pointer}'
    +'.fm-rd{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fm-rd div{padding:9px 11px;border:1px solid #eef2f6;border-radius:10px;background:var(--bg,#fafbfc)}.fm-rd span{display:block;font-size:12px;color:var(--ink3)}.fm-rd b{font-size:18px}'
    +'.fm-n{margin-top:9px;padding:9px 12px;border-radius:10px;background:#F1FBF6;border:1px solid #cceede;color:#437F64;font-size:13px;line-height:1.6}'
    +'.fm-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.fm-f{padding:12px 14px;border-radius:10px;background:#F1FBF6;border:1px solid #cceede;font-size:15px;color:#437F64;line-height:1.9}.fm-f b{font-size:17px}'
    +'.fm-rel{display:grid;gap:8px;margin-top:11px}.fm-rel div{display:flex;justify-content:space-between;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2)}.fm-rel b{color:var(--ink);font-variant-numeric:tabular-nums}'
    +'.fm-qz{padding:13px 15px;border:1px solid #ffe6c2;border-radius:11px;background:#FFFCF0;font-size:15px;line-height:1.85;color:#6d5b36}.fm-qz h5{margin:10px 0 4px;font-size:14px;color:#8A6637}'
    +'.fm-opts{display:grid;gap:6px;margin:8px 0}.fm-opts button{min-height:38px;text-align:left;padding:7px 11px;border:1px solid #e8edf2;border-radius:8px;background:#fff;font-size:14px;color:var(--ink2)}.fm-opts button.is-sel{border-color:#8ED6B4;background:#effaf4;color:#3F7A60;font-weight:700}'
    +'.fm-in{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}.fm-in input{width:130px;padding:9px 11px;border:1px solid #dce4ec;border-radius:9px;font-size:15px}'
    +'.fm-fb{margin-top:8px;padding:10px 12px;border-radius:9px;font-size:14px;line-height:1.7}.fm-fb[hidden]{display:none}.fm-fb.ok{background:#EFFAF4;border:1px solid #bfe6d2;color:#3F7A60}.fm-fb.no{background:#FFF4F5;border:1px solid #ffd0d5;color:#A85460}';
  function style(){if(!doc.getElementById(SID)){var s=doc.createElement('style');s.id=SID;s.textContent=CSS;doc.head.appendChild(s);}}
  function view(w,h){var c=doc.createElement('canvas'),d=Math.min(global.devicePixelRatio||1,2);c.width=w*d;c.height=h*d;c.className='fm-c';var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{el:c,ctx:x,w:w,h:h};}
  function nf(v){if(!isFinite(v))return'—';var a=Math.abs(v);return a>=100?v.toFixed(0):a>=10?v.toFixed(1):v.toFixed(3);}
  function on(m,e,t,f){e.addEventListener(t,f);var a=m[t]||(m[t]=[]);a.push([e,f]);}
  function seg(n,a,cur){var h='<div class="fm-seg" data-seg="'+n+'">';for(var i=0;i<a.length;i++)h+='<button data-val="'+a[i][0]+'" class="'+(cur===a[i][0]?'is-on':'')+'">'+a[i][1]+'</button>';return h+'</div>';}
  function rd(k,l,u){return '<div><span>'+l+'</span><b data-r="'+k+'">—</b> '+u+'</div>';}
  function quiz(){return '<div class="fm-qz"><h5>第 1 题 · 极性判断</h5><div data-qt="1"></div><div class="fm-opts" data-op="1"></div><button class="fm-btn" data-sub="1">提交答案</button><div class="fm-fb" data-fb="1" hidden></div><h5>第 2 题 · 流量计算</h5><div data-qt="2"></div><div class="fm-in"><input type="number" step="any" data-num placeholder="输入数值"><span data-unit></span><button class="fm-btn" data-sub="2">提交答案</button></div><div class="fm-fb" data-fb="2" hidden></div></div>';}
  function calc(s){var U=s.B*s.d*s.v,Q=Math.PI*s.d*s.d*s.v/4,E=s.B*s.v;return{U:U,Q:Q,E:E};}
  function build(idx,s){
    var c=calc(s),ex='';
    if(idx===1){ex='<div class="fm-card"><div class="fm-t"><i style="background:var(--sky,#BFE3F5)"></i>U 与各物理量的关系</div>'+seg('rel',[['v','U—v'],['B','U—B'],['d','U—d']],s.rel||'v')+'<div data-chart></div><div class="fm-rel"><div><span>U = B·d·v</span><b data-r="u">—</b></div><div><span>两极间场强 E = Bv</span><b data-r="e">—</b></div><div><span>平衡条件 qvB = qE</span><b>已建立</b></div></div></div>'
      +'<div class="fm-card"><div class="fm-t"><i style="background:var(--lav,#D0C4E8)"></i>为什么 U 与流量成正比</div><div class="fm-f">导电液体中的正负离子随液体以 v 运动，受洛伦兹力 qvB 分别向两侧偏转；<br>积累电荷产生电场 E，当 <b>qE = qvB</b> 时达到稳定：<br><b>E = Bv，U = Ed = Bvd</b>。<br>因此测得电压即可反推流速与流量。</div></div>';}
    else if(idx===2){ex='<div class="fm-card"><div class="fm-t"><i style="background:var(--peach,#FFD8A8)"></i>流量换算 · Q = πdU / 4B</div><div class="fm-rel"><div><span>管截面积 S = πd²/4</span><b data-r="area">—</b></div><div><span>体积流量 Q = S·v</span><b data-r="q">—</b></div><div><span>由电压反推 Q = πdU/(4B)</span><b data-r="q2">—</b></div></div><div class="fm-n">两种算法结果必然相同——这就是电磁流量计只用电压就能测流量的原理。</div></div>'
      +'<div class="fm-card"><div class="fm-t"><i style="background:var(--mint,#B8E8D0)"></i>应用拓展</div><div class="fm-f">优点：无机械转动部件、不阻碍流体、可测腐蚀性液体。<br>限制：液体必须导电；磁场 B 与管径 d 需要标定。<br>若 B 加倍而 U 不变，说明实际流速减半。</div></div>';}
    else if(idx===3){ex='<div class="fm-card"><div class="fm-t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 两题限时</div>'+quiz()+'<div class="fm-n">题目随 B、管径 d、流速 v 实时更新，提交后即时判分。</div></div>';}
    else ex='<div class="fm-card"><div class="fm-t"><i style="background:var(--mint,#B8E8D0)"></i>核心规律</div><div class="fm-f"><b>qvB = qE → E = Bv</b><br>电极间电势差 <b>U = Bvd</b><br>体积流量 <b>Q = v·πd²/4 = πdU/(4B)</b></div><div class="fm-n">粉色正离子向上、蓝色负离子向下偏转，两极积累异号电荷形成电场。</div></div>'
      +'<div class="fm-card"><div class="fm-t"><i style="background:var(--sky,#BFE3F5)"></i>方向判定</div><div class="fm-f">用左手定则：磁感线穿手心（本图向里），四指指正电荷运动方向（向右），拇指即受力方向。<br>正离子向上 → 上极板带正电、电势高；下极板带负电。</div></div>';
    return '<div class="fm-w"><div class="fm-bar"><span class="fm-chip">电磁感应应用 · 流量计</span>'+seg('bdir',[['in','B 向里 ×'],['out','B 向外 ·']],saved.bdir||'in')+'<span class="fm-sp"></span><button class="fm-btn fm-btn--p" data-play>'+(s.playing?'⏸ 暂停':'▶ 播放')+'</button><button class="fm-btn" data-reset>↺ 重置</button></div>'
      +'<div class="fm-grid"><div class="fm-card"><div class="fm-t"><i></i>导电液体在磁场中流动<span class="fm-hint">电场平衡后电压稳定</span></div><div data-cv></div></div>'
      +'<div class="fm-side"><div class="fm-card"><div class="fm-t"><i style="background:var(--pink,#FFB3BA)"></i>参数</div>'
      +'<label class="fm-ctrl"><span>磁感应强度 B<b data-o="B"></b></span><input type="range" data-k="B" min="0.2" max="2" step="0.1" value="'+s.B+'"></label>'
      +'<label class="fm-ctrl"><span>管径 d<b data-o="d"></b></span><input type="range" data-k="d" min="0.02" max="0.2" step="0.01" value="'+s.d+'"></label>'
      +'<label class="fm-ctrl"><span>流速 v<b data-o="v"></b></span><input type="range" data-k="v" min="0.2" max="3" step="0.1" value="'+s.v+'"></label></div>'
      +'<div class="fm-card"><div class="fm-t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div><div class="fm-rd">'+rd('U','电极电压 U','V')+rd('E','极间场强 E','V/m')+rd('v','流速 v','m/s')+rd('Q','流量 Q','m³/s')+'</div><div class="fm-n" data-status></div></div></div></div><div class="fm-extra">'+ex+'</div></div>';
  }
  function arrow(ctx,x1,y1,x2,y2,c){var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<3)return;var ux=dx/L,uy=dy/L,h=8;ctx.save();ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*h-uy*h*.6,y2-uy*h+ux*h*.6);ctx.lineTo(x2-ux*h+uy*h*.6,y2-uy*h-ux*h*.6);ctx.closePath();ctx.fill();ctx.restore();}
  function label(ctx,t,x,y,c,al){ctx.save();ctx.font='15px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillStyle=c||C.ink3;ctx.textAlign=al||'left';ctx.fillText(t,x,y);ctx.restore();}
  function chart(view,key,s){
    var ctx=view.ctx,W=view.w,H=view.h;ctx.clearRect(0,0,W,H);
    var L=46,R=W-18,T=16,B=H-30,min=0,max=key==='B'?2:key==='d'?.2:key==='v'?3:key==='U'?4:0.004,cv=s[key];
    if(key==='Q'){max=Math.PI*.2*.2*3/4;}
    function fn(x){if(key==='v')return s.B*s.d*x;if(key==='B')return x*s.d*s.v;if(key==='d')return s.B*x*s.v;if(key==='U')return x*4*s.B/(Math.PI*s.d);return Math.PI*s.d*s.d*x/4;}
    var ymax=fn(max)*1.15||1;
    function X(v){return L+(R-L)*(v-min)/(max-min);}function Y(v){return B-(B-T)*v/ymax;}
    ctx.save();ctx.strokeStyle='#e8edf2';ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,B);ctx.lineTo(R,B);ctx.stroke();ctx.restore();
    var names={v:'v (m/s)',B:'B (T)',d:'d (m)',U:'U (V)',Q:'U (V)'},yn={v:'U / V',B:'U / V',d:'U / V',U:'Q / (m³/s)',Q:'Q / (m³/s)'};
    label(ctx,(key==='U'||key==='Q'?'Q — U':'U — '+key.toUpperCase()),L+4,T+10,C.mintD);label(ctx,yn[key],L-4,T+2,C.ink3,'right');
    ctx.save();ctx.strokeStyle=C.mintD;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(X(min),Y(fn(min)));ctx.lineTo(X(max),Y(fn(max)));ctx.stroke();ctx.restore();
    var cvv=key==='U'?calc(s).U:key==='Q'?calc(s).U:cv;
    ctx.save();ctx.fillStyle=C.pinkD;ctx.beginPath();ctx.arc(X(cvv),Y(fn(cvv)),6,0,Math.PI*2);ctx.fill();ctx.restore();
    label(ctx,names[key],R,H-6,C.ink2,'right');label(ctx,'当前 '+nf(cvv),L+4,H-6,C.pinkD);
  }

  NS.modules['electromagnetic-flowmeter']={render:function(container,extIndex){
    style();var idx=Math.max(0,Math.min(3,Number(extIndex)||0));
    var s={B:saved.B,d:saved.d,v:saved.v,playing:saved.playing,bdir:saved.bdir||'in',rel:'v',t:0};
    container.innerHTML=build(idx,s);
    var v=view(1000,430);container.querySelector('[data-cv]').appendChild(v.el);
    var chartV=idx===1?view(560,210):null;if(chartV){chartV.el.className='fm-c';container.querySelector('[data-chart]').appendChild(chartV.el);}
    var ctx=v.ctx,W=v.w,H=v.h,LST={},rAF=0,last=0,dead=false;
    var q=function(x){return container.querySelector(x);},qa=function(x){return container.querySelectorAll(x);};
    var units={B:'T',d:'m',v:'m/s'};
    function setSeg(n,val){var b=q('[data-seg="'+n+'"]');if(!b)return;var x=b.querySelectorAll('button');for(var i=0;i<x.length;i++)x[i].classList.toggle('is-on',x[i].getAttribute('data-val')===val);}
    function sync(){saved.B=s.B;saved.d=s.d;saved.v=s.v;saved.playing=s.playing;saved.bdir=s.bdir;}
    ['B','d','v'].forEach(function(k){q('[data-o="'+k+'"]').textContent=nf(s[k])+' '+units[k];});
    for(var gi=0;gi<qa('input[type=range]').length;gi++){(function(el){on(LST,el,'input',function(e){var k=e.target.getAttribute('data-k');s[k]=Number(e.target.value);q('[data-o="'+k+'"]').textContent=nf(s[k])+' '+units[k];sync();resetQuiz();});})(qa('input[type=range]')[gi]);}
    for(var gj=0;gj<qa('[data-seg]').length;gj++){(function(box){on(LST,box,'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var n=box.getAttribute('data-seg'),val=b.getAttribute('data-val');if(n==='rel')s.rel=val;else s.bdir=val;setSeg(n,val);sync();resetQuiz();});})(qa('[data-seg]')[gj]);}
    var pb=q('[data-play]');on(LST,pb,'click',function(){s.playing=!s.playing;pb.textContent=s.playing?'⏸ 暂停':'▶ 播放';sync();});on(LST,q('[data-reset]'),'click',function(){s.t=0;});
    var Q={1:{opts:[],correct:0,text:'',expl:''},2:{ans:0,text:'',unit:'',expl:''}},sel=-1;
    function quizData(){
      var up=s.bdir==='in';
      Q[1].text='磁场'+(up?'垂直纸面向里、 liquid 向右流动':'垂直纸面向外、液体向右流动')+'时，哪一侧电极电势较高？';
      Q[1].opts=['上电极','下电极','两侧相等'];Q[1].correct=up?0:1;
      Q[1].expl=up?'正离子受洛伦兹力向上，上极板带正电，电势高。':'正离子受洛伦兹力向下，下极板带正电，电势高。';
      var c=calc(s);
      Q[2].text='当前 B='+nf(s.B)+' T，d='+nf(s.d)+' m，v='+nf(s.v)+' m/s，求体积流量 Q（单位 m³/s）。';
      Q[2].ans=c.Q;Q[2].unit='m³/s';Q[2].expl='Q = v·πd²/4 = '+nf(s.v)+'×π×'+nf(s.d)+'²/4 = '+c.Q.toExponential(2)+' m³/s；也可由 πdU/(4B) 得到。';
    }
    function paintQuiz(){if(idx!==3)return;quizData();q('[data-qt="1"]').textContent=Q[1].text.replace('liquid ','液体');q('[data-qt="2"]').textContent=Q[2].text;q('[data-unit]').textContent=Q[2].unit;var b=q('[data-op="1"]');b.innerHTML='';Q[1].opts.forEach(function(t,i){var x=doc.createElement('button');x.type='button';x.textContent=String.fromCharCode(65+i)+'. '+t;x.setAttribute('data-i',i);b.appendChild(x);});}
    function resetQuiz(){if(idx===3){sel=-1;q('[data-num]').value='';q('[data-fb="1"]').hidden=true;q('[data-fb="2"]').hidden=true;var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.remove('is-sel');}}
    function submit(n){var fb=q('[data-fb="'+n+'"]');if(typeof n==='string')n=Number(n);if(n===1){if(sel<0){fb.className='fm-fb no';fb.hidden=false;fb.textContent='请先选择。';return;}var ok=sel===Q[1].correct;fb.className='fm-fb '+(ok?'ok':'no');fb.hidden=false;fb.innerHTML=(ok?'✅ 正确！':'❌ 再想想。')+Q[1].expl;}
      else{var val=Number(q('[data-num]').value),ok2=isFinite(val)&&Math.abs(val-Q[2].ans)<=Math.max(1e-6,Math.abs(Q[2].ans)*.06);fb.className='fm-fb '+(ok2?'ok':'no');fb.hidden=false;fb.innerHTML=(ok2?'✅ 正确！':'❌ 参考答案 '+Q[2].ans.toExponential(2)+' m³/s。')+Q[2].expl;}}
    if(idx===3){paintQuiz();on(LST,q('[data-op="1"]'),'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;sel=Number(b.getAttribute('data-i'));var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.toggle('is-sel',i===sel);});for(var z=0;z<qa('[data-sub]').length;z++){(function(b){on(LST,b,'click',function(){submit(b.getAttribute('data-sub'));});})(qa('[data-sub]')[z]);}}

    function draw(){
      ctx.clearRect(0,0,W,H);var c=calc(s),h=s.d*700,top=H/2-h/2,bot=H/2+h/2,x0=70,x1=880;
      // 管道底色（先画，避免遮住磁场符号）
      ctx.save();ctx.fillStyle='#F3FAF7';ctx.fillRect(x0,top,x1-x0,h);ctx.restore();
      // 磁场符号
      for(var gx=x0+30;gx<x1-20;gx+=52)for(var gy=top+16;gy<bot;gy+=42){
        ctx.save();ctx.strokeStyle='#B9DFCC';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(gx,gy,6,0,Math.PI*2);ctx.stroke();
        if(s.bdir==='in'){ctx.beginPath();ctx.moveTo(gx-4,gy-4);ctx.lineTo(gx+4,gy+4);ctx.moveTo(gx+4,gy-4);ctx.lineTo(gx-4,gy+4);ctx.stroke();}
        else{ctx.fillStyle='#B9DFCC';ctx.beginPath();ctx.arc(gx,gy,2,0,Math.PI*2);ctx.fill();}
        ctx.restore();
      }
      // 管壁
      ctx.save();ctx.strokeStyle=C.mintD;ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(x0,top);ctx.lineTo(x1,top);ctx.moveTo(x0,bot);ctx.lineTo(x1,bot);ctx.stroke();ctx.restore();
      // 液体质点
      var up=s.bdir==='in'?1:-1;
      for(var i=0;i<38;i++){
        var seed=(i*0.173)%1,px=x0+((seed*780+s.t*s.v*95)%780);
        var drift=(i%2?1:-1)*up*(4+s.B*s.v*4)*((px-x0)/780);
        var py=(top+12)+((i*0.271)%1)*(h-24)+drift;
        if(py<top+5||py>bot-5)continue;
        var pos=i%3===0;
        ctx.save();ctx.fillStyle=pos?C.pinkD:C.skyD;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(px,py,pos?4.5:4,0,Math.PI*2);ctx.fill();
        if(pos){ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('+',px,py+3.5);}else{ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('−',px,py+3.5);}
        ctx.restore();
      }
      // 洛伦兹力箭头
      var hx=x0+540,hy=H/2;
      ctx.save();ctx.fillStyle='#fff';ctx.strokeStyle=C.pinkD;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(hx,hy-22,9,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
      arrow(ctx,hx,hy-22,hx,hy-22-up*52,C.pinkD);label(ctx,'F+=qvB',hx+10,hy-22-up*52,C.pinkD);
      arrow(ctx,hx,hy+22,hx,hy+22+up*52,C.skyD);label(ctx,'F−',hx+10,hy+22+up*52,C.skyD);
      // 电极 + 电压表
      var ex=x0+420;
      ctx.save();ctx.fillStyle=C.lavD;ctx.fillRect(ex-4,top-18,8,18);ctx.fillRect(ex-4,bot,8,18);ctx.strokeStyle=C.lavD;ctx.lineWidth=2.2;
      ctx.beginPath();ctx.moveTo(ex,top-18);ctx.lineTo(940,top-18);ctx.lineTo(940,top+16);ctx.moveTo(ex,bot+18);ctx.lineTo(940,bot+18);ctx.lineTo(940,bot-16);ctx.stroke();
      ctx.fillStyle='#fff';ctx.strokeStyle=C.lavD;ctx.lineWidth=2;ctx.beginPath();ctx.arc(940,H/2,28,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
      label(ctx,'V',940,H/2+7,C.lavD,'center');
      label(ctx,nf(c.U)+' V',940,H/2-42,C.lavD,'center');
      label(ctx,up?'上 +  下 −':'上 −  下 +',940,bot+52,up?C.pinkD:C.skyD,'center');
      arrow(ctx,x0+40,top-34,x0+150,top-34,C.mintD);label(ctx,'液体流速 v',x0+40,top-42,C.mintD);
      label(ctx,'B '+(s.bdir==='in'?'向里 ×':'向外 ·'),x0+16,bot+34,C.mintD);
    }
    function frame(ts){if(dead)return;if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;if(s.playing)s.t+=dt;draw();
      var c=calc(s),set=function(k,v){var e=q('[data-r="'+k+'"]');if(e)e.textContent=v;};
      set('U',nf(c.U));set('E',nf(c.E));set('v',nf(s.v));set('Q',c.Q.toExponential(2));
      if(idx===1){set('u',nf(c.U)+' V');set('e',nf(c.E)+' V/m');chart(chartV,s.rel,s);}
      if(idx===2){set('area',(Math.PI*s.d*s.d/4).toExponential(2)+' m²');set('q',c.Q.toExponential(2));set('q2',(Math.PI*s.d*c.U/(4*s.B)).toExponential(2));}
      var st=q('[data-status]');if(st)st.textContent='qvB = qE 平衡后 E = Bv = '+nf(c.E)+' V/m，U = Bvd = '+nf(c.U)+' V。';
      rAF=global.requestAnimationFrame(frame);
    }
    rAF=global.requestAnimationFrame(frame);
    return function cleanup(){if(dead)return;dead=true;global.cancelAnimationFrame(rAF);for(var t in LST){if(!LST.hasOwnProperty(t))continue;var a=LST[t];for(var i=0;i<a.length;i++)a[i][0].removeEventListener(t,a[i][1]);}};
  }};
})(window);
