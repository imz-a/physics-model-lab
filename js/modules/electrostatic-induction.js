/* ============================================================
 * electrostatic-induction.js — 静电感应与静电平衡
 * ============================================================ */
(function (global) {
  'use strict';
  var NS=global.ModelLab=global.ModelLab||{};NS.modules=NS.modules||{};
  var doc=global.document;
  var C={ink:'#3a4250',ink2:'#5a6472',ink3:'#8b95a3',pinkD:'#E27886',mintD:'#57A47F',skyD:'#5B9BC4',lavD:'#8A76BB',peachD:'#D69A55'};
  var saved={E:1.0,hollow:false,ground:false,playing:true};
  var SID='ml-ei-style';
  var CSS=''
    +'.ei-w{display:flex;flex-direction:column;gap:14px;font-size:16px;color:var(--ink,#3a4250)}'
    +'.ei-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.ei-chip{padding:7px 15px;border:1px solid var(--lav,#D0C4E8);border-radius:999px;background:#F7F4FC;color:#7B66A8;font-size:14px;font-weight:600}'
    +'.ei-seg{display:inline-flex;padding:3px;border:1px solid #e8edf2;border-radius:999px;background:#f6f8fa;gap:3px}.ei-seg button{min-height:36px;padding:6px 14px;border:0;border-radius:999px;background:transparent;color:var(--ink2);font-size:14px}.ei-seg button.is-on{background:#fff;color:var(--ink);font-weight:700;box-shadow:0 1px 5px rgba(88,108,132,.13)}'
    +'.ei-sp{flex:1 1 auto}.ei-btn{min-height:40px;padding:8px 17px;border:1px solid #dce4ec;border-radius:10px;background:#fff;color:var(--ink2);font-size:15px}.ei-btn--p{border-color:#cbbdea;background:#f5f1fb;color:#6E59A0;font-weight:700}'
    +'.ei-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);gap:16px;align-items:stretch}@media(max-width:1120px){.ei-grid{grid-template-columns:1fr}}'
    +'.ei-card{background:#fff;border:1px solid var(--line,#e8edf2);border-radius:18px;box-shadow:0 2px 8px rgba(88,108,132,.05);padding:17px 19px;min-width:0}'
    +'.ei-t{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;margin-bottom:12px}.ei-t i{width:9px;height:9px;border-radius:50%;background:var(--lav,#D0C4E8)}.ei-hint{font-size:13px;color:var(--ink3);font-weight:400;margin-left:auto}'
    +'canvas.ei-c{width:100%;height:auto;display:block;border-radius:12px;background:#fcfdfe;border:1px solid #eef2f6}'
    +'.ei-side{display:flex;flex-direction:column;gap:14px}.ei-ctrl{display:block;margin-bottom:10px}.ei-ctrl span{display:flex;justify-content:space-between;font-size:14px;color:var(--ink2)}.ei-ctrl output{font-weight:700}.ei-ctrl input{width:100%;accent-color:#A994D4;height:22px;cursor:pointer}'
    +'.ei-rd{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ei-rd div{padding:9px 11px;border:1px solid #eef2f6;border-radius:10px;background:var(--bg,#fafbfc)}.ei-rd span{display:block;font-size:12px;color:var(--ink3)}.ei-rd b{font-size:18px}'
    +'.ei-n{margin-top:9px;padding:9px 12px;border-radius:10px;background:#F7F4FC;border:1px solid #e6dcf6;color:#6B5896;font-size:13px;line-height:1.6}'
    +'.ei-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.ei-f{padding:12px 14px;border-radius:10px;background:#F7F4FC;border:1px solid #e6dcf6;font-size:15px;color:#6B5896;line-height:1.9}.ei-f b{font-size:17px}'
    +'.ei-rel{display:grid;gap:8px;margin-top:11px}.ei-rel div{display:flex;justify-content:space-between;padding:8px 11px;border-radius:9px;background:#f6f8fa;font-size:14px;color:var(--ink2)}.ei-rel b{color:var(--ink);font-variant-numeric:tabular-nums}'
    +'.ei-qz{padding:13px 15px;border:1px solid #ffe6c2;border-radius:11px;background:#FFFCF0;font-size:15px;line-height:1.85;color:#6d5b36}.ei-qz h5{margin:10px 0 4px;font-size:14px;color:#8A6637}'
    +'.ei-opts{display:grid;gap:6px;margin:8px 0}.ei-opts button{min-height:38px;text-align:left;padding:7px 11px;border:1px solid #e8edf2;border-radius:8px;background:#fff;font-size:14px;color:var(--ink2)}.ei-opts button.is-sel{border-color:#A994D4;background:#f5f1fb;color:#6E59A0;font-weight:700}'
    +'.ei-in{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}.ei-in input{width:130px;padding:9px 11px;border:1px solid #dce4ec;border-radius:9px;font-size:15px}'
    +'.ei-fb{margin-top:8px;padding:10px 12px;border-radius:9px;font-size:14px;line-height:1.7}.ei-fb[hidden]{display:none}.ei-fb.ok{background:#EFFAF4;border:1px solid #bfe6d2;color:#3F7A60}.ei-fb.no{background:#FFF4F5;border:1px solid #ffd0d5;color:#A85460}';
  function style(){if(!doc.getElementById(SID)){var s=doc.createElement('style');s.id=SID;s.textContent=CSS;doc.head.appendChild(s);}}
  function view(w,h){var c=doc.createElement('canvas'),d=Math.min(global.devicePixelRatio||1,2);c.width=w*d;c.height=h*d;c.className='ei-c';var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{el:c,ctx:x,w:w,h:h};}
  function nf(v){if(!isFinite(v))return'—';var a=Math.abs(v);return a>=100?v.toFixed(0):a>=10?v.toFixed(1):v.toFixed(3);}
  function on(m,e,t,f){e.addEventListener(t,f);var a=m[t]||(m[t]=[]);a.push([e,f]);}
  function seg(n,a,cur){var h='<div class="ei-seg" data-seg="'+n+'">';for(var i=0;i<a.length;i++)h+='<button data-val="'+a[i][0]+'" class="'+(cur===a[i][0]?'is-on':'')+'">'+a[i][1]+'</button>';return h+'</div>';}
  function rd(k,l,u){return '<div><span>'+l+'</span><b data-r="'+k+'">—</b> '+u+'</div>';}
  function quiz(){return '<div class="ei-qz"><h5>第 1 题 · 概念选择</h5><div data-qt="1"></div><div class="ei-opts" data-op="1"></div><button class="ei-btn" data-sub="1">提交答案</button><div class="ei-fb" data-fb="1" hidden></div><h5>第 2 题 · 定量计算</h5><div data-qt="2"></div><div class="ei-in"><input type="number" step="any" data-num placeholder="输入数值"><span data-unit></span><button class="ei-btn" data-sub="2">提交答案</button></div><div class="ei-fb" data-fb="2" hidden></div></div>';}
  var R=.72;
  function build(idx,s){
    var ex='';
    if(idx===1)ex='<div class="ei-card"><div class="ei-t"><i style="background:var(--pink,#FFB3BA)"></i>表面电荷分布 σ(θ)</div><div class="ei-f"><b>σ = 3ε₀E₀cosθ</b><br>右侧（θ≈0）感应正电荷最密，左侧感应负电荷最密；θ=±90° 处 σ=0。<br>接地后远端正电荷流入大地，导体整体带负电。</div><div class="ei-rel"><div><span>右侧最大 σ（相对值）</span><b data-r="sig">—</b></div><div><span>接地状态净电荷</span><b data-r="net">—</b></div></div></div>'
      +'<div class="ei-card"><div class="ei-t"><i style="background:var(--sky,#BFE3F5)"></i>等势体与表面场</div><div class="ei-f">导体内部 E=0，整个导体电势相等；<br>表面处电场方向<b>垂直于表面</b>，大小 E表=σ/ε₀。<br>外场 E₀ 越大，表面电荷越密，表面场越强。</div></div>';
    else if(idx===2)ex='<div class="ei-card"><div class="ei-t"><i style="background:var(--mint,#B8E8D0)"></i>法拉第笼 · 静电屏蔽</div><div class="ei-f"><b>空腔导体内部 E = 0</b><br>外部电场使电荷只分布在外表面，内表面无净电荷，腔内不受外场影响。<br>这就是金属外壳屏蔽静电的原因。</div><div class="ei-rel"><div><span>腔内场强</span><b data-r="inE">0 V/m</b></div><div><span>外部场强</span><b data-r="outE">—</b></div></div><div class="ei-n">切换「空腔导体」并拖动外场强度滑块：腔内探针读数始终为零。</div></div>'
      +'<div class="ei-card"><div class="ei-t"><i style="background:var(--lav,#D0C4E8)"></i>接地的额外效果</div><div class="ei-f">接地把导体与大地连成一个大导体，远端电荷被中和或由大地补充。<br>本图中接地使右侧正电荷减少，导体净剩负电荷，但<b>腔内仍然 E=0</b>。</div></div>';
    else if(idx===3)ex='<div class="ei-card"><div class="ei-t"><i style="background:var(--pink,#FFB3BA)"></i>高考题型 · 两题限时</div>'+quiz()+'<div class="ei-n">题目随外场强度、接地与空腔状态实时更新，提交后即时判分。</div></div>';
    else ex='<div class="ei-card"><div class="ei-t"><i style="background:var(--lav,#D0C4E8)"></i>静电平衡三结论</div><div class="ei-f">① 导体内部合场强 <b>E内 = 0</b><br>② 导体是<b>等势体</b>，表面是等势面<br>③ 表面电场线<b>垂直于表面</b></div><div class="ei-n">自由电子在外电场中定向移动，直到感应电荷产生的场与外场等大反向。</div></div>'
      +'<div class="ei-card"><div class="ei-t"><i style="background:var(--mint,#B8E8D0)"></i>观察提示</div><div class="ei-f">左侧聚集负电荷，右侧聚集正电荷；场线在导体表面处弯曲并垂直入射。<br>切换「空腔」「接地」观察电荷分布与屏蔽效果的变化。</div></div>';
    return '<div class="ei-w"><div class="ei-bar"><span class="ei-chip">静电场中的导体</span>'+seg('shape',[['solid','实心导体'],['hollow','空腔导体']],s.hollow?'hollow':'solid')+seg('gnd',[['off','不接地'],['on','接地']],s.ground?'on':'off')+'<span class="ei-sp"></span><button class="ei-btn ei-btn--p" data-play>'+(s.playing?'⏸ 暂停':'▶ 播放')+'</button><button class="ei-btn" data-reset>↺ 重置</button></div>'
      +'<div class="ei-grid"><div class="ei-card"><div class="ei-t"><i></i>导体在匀强外场中<span class="ei-hint">粉色 + / 蓝色 − 为感应电荷</span></div><div data-cv></div></div>'
      +'<div class="ei-side"><div class="ei-card"><div class="ei-t"><i style="background:var(--pink,#FFB3BA)"></i>参数</div><label class="ei-ctrl"><span>外电场强度 E₀<b data-o="E"></b></span><input type="range" data-k="E" min="0.3" max="2.5" step="0.1" value="'+s.E+'"></label><div class="ei-n">拖动滑块，观察表面电荷密度与场线弯曲程度同步变化。</div></div>'
      +'<div class="ei-card"><div class="ei-t"><i style="background:var(--peach,#FFD8A8)"></i>实时读数</div><div class="ei-rd">'+rd('in','导体内部 E','V/m')+rd('surf','表面最大 σ','相对值')+rd('pot','导体电势','V')+rd('net','净感应电荷','')+'</div><div class="ei-n" data-status></div></div></div></div><div class="ei-extra">'+ex+'</div></div>';
  }
  function arrow(ctx,x1,y1,x2,y2,c){var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<3)return;var ux=dx/L,uy=dy/L,h=8;ctx.save();ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=1.9;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*h-uy*h*.6,y2-uy*h+ux*h*.6);ctx.lineTo(x2-ux*h+uy*h*.6,y2-uy*h-ux*h*.6);ctx.closePath();ctx.fill();ctx.restore();}
  function label(ctx,t,x,y,c,al){ctx.save();ctx.font='15px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillStyle=c||C.ink3;ctx.textAlign=al||'left';ctx.fillText(t,x,y);ctx.restore();}

  NS.modules['electrostatic-induction']={render:function(container,extIndex){
    style();var idx=Math.max(0,Math.min(3,Number(extIndex)||0));
    var s={E:saved.E,hollow:saved.hollow,ground:saved.ground,playing:saved.playing,t:0};
    container.innerHTML=build(idx,s);
    var v=view(1000,430);container.querySelector('[data-cv]').appendChild(v.el);
    var ctx=v.ctx,W=v.w,H=v.h,sc=205,cx=W/2,cy=H/2,LST={},rAF=0,last=0,dead=false;
    var q=function(x){return container.querySelector(x);},qa=function(x){return container.querySelectorAll(x);};
    function M(x,y){return{x:cx+x*sc,y:cy-y*sc};}
    function setSeg(n,val){var b=q('[data-seg="'+n+'"]');if(!b)return;var x=b.querySelectorAll('button');for(var i=0;i<x.length;i++)x[i].classList.toggle('is-on',x[i].getAttribute('data-val')===val);}
    function sync(){saved.E=s.E;saved.hollow=s.hollow;saved.ground=s.ground;saved.playing=s.playing;}
    q('[data-o="E"]').textContent=nf(s.E);
    on(LST,q('[data-k="E"]'),'input',function(e){s.E=Number(e.target.value);q('[data-o="E"]').textContent=nf(s.E);sync();resetQuiz();});
    for(var g=0;g<qa('[data-seg]').length;g++){(function(box){on(LST,box,'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var n=box.getAttribute('data-seg'),val=b.getAttribute('data-val');if(n==='shape')s.hollow=val==='hollow';else s.ground=val==='on';setSeg(n,val);sync();resetQuiz();});})(qa('[data-seg]')[g]);}
    var pb=q('[data-play]');on(LST,pb,'click',function(){s.playing=!s.playing;pb.textContent=s.playing?'⏸ 暂停':'▶ 播放';sync();});on(LST,q('[data-reset]'),'click',function(){s.t=0;});
    var Q={1:{opts:[],correct:0,text:'',expl:''},2:{ans:0,text:'',unit:'',expl:''}},sel=-1;
    function quizData(){
      Q[1].text='导体达到静电平衡后，关于导体内部与表面，下列说法正确的是？';
      Q[1].opts=['内部场强不为零，表面场线平行表面','内部场强为零，表面场线垂直表面','内部场强为零，表面场线平行表面'];Q[1].correct=1;
      Q[1].expl='静电平衡时导体内部合场强为零，整个导体是等势体，表面电场线必与表面垂直。';
      var sig=3*8.854e-12*s.E*1e6; // µC/m²
      Q[2].text='已知 ε₀=8.854×10⁻¹² F/m，导体表面 θ=0 处 σ=3ε₀E₀。当前 E₀='+nf(s.E)+'×10⁵ V/m，求该处表面场强 E表=σ/ε₀（单位 ×10⁵ V/m）。';
      Q[2].ans=3*s.E;Q[2].unit='×10⁵ V/m';
      Q[2].expl='E表 = σ/ε₀ = 3ε₀E₀/ε₀ = 3E₀ = 3×'+nf(s.E)+' = '+nf(3*s.E)+' ×10⁵ V/m。';
    }
    function paintQuiz(){if(idx!==3)return;quizData();q('[data-qt="1"]').textContent=Q[1].text;q('[data-qt="2"]').textContent=Q[2].text;q('[data-unit]').textContent=Q[2].unit;var b=q('[data-op="1"]');b.innerHTML='';Q[1].opts.forEach(function(t,i){var x=doc.createElement('button');x.type='button';x.textContent=String.fromCharCode(65+i)+'. '+t;x.setAttribute('data-i',i);b.appendChild(x);});}
    function resetQuiz(){if(idx===3){sel=-1;q('[data-num]').value='';q('[data-fb="1"]').hidden=true;q('[data-fb="2"]').hidden=true;var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.remove('is-sel');}}
    function submit(n){n=Number(n);var fb=q('[data-fb="'+n+'"]');if(n===1){if(sel<0){fb.className='ei-fb no';fb.hidden=false;fb.textContent='请先选择一个答案。';return;}var ok=sel===Q[1].correct;fb.className='ei-fb '+(ok?'ok':'no');fb.hidden=false;fb.innerHTML=(ok?'✅ 正确！':'❌ 再想想。')+Q[1].expl;}
      else{var val=Number(q('[data-num]').value),ok2=isFinite(val)&&Math.abs(val-Q[2].ans)<Math.max(.05,Math.abs(Q[2].ans)*.05);fb.className='ei-fb '+(ok2?'ok':'no');fb.hidden=false;fb.innerHTML=(ok2?'✅ 正确！':'❌ 参考答案 '+nf(Q[2].ans)+' ×10⁵ V/m。')+Q[2].expl;}}
    if(idx===3){paintQuiz();on(LST,q('[data-op="1"]'),'click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;sel=Number(b.getAttribute('data-i'));var os=q('[data-op="1"]').querySelectorAll('button');for(var i=0;i<os.length;i++)os[i].classList.toggle('is-sel',i===sel);});for(var z=0;z<qa('[data-sub]').length;z++){(function(b){on(LST,b,'click',function(){submit(b.getAttribute('data-sub'));});})(qa('[data-sub]')[z]);}}

    function draw(){
      ctx.clearRect(0,0,W,H);
      // 外部匀强场线（右向）
      for(var row=-5;row<=5;row++){
        var y0=row*.21;
        ctx.save();ctx.strokeStyle=C.skyD;ctx.fillStyle=C.skyD;ctx.lineWidth=2;
        ctx.beginPath();
        if(Math.abs(y0)>R+.02){ctx.moveTo(M(-2.35,y0).x,M(-2.35,y0).y);ctx.lineTo(M(2.35,y0).x,M(2.35,y0).y);ctx.stroke();}
        else{
          var sgn=y0>=0?1:-1;
          if(y0===0){drawBend(1);drawBend(-1);}
          else drawBend(sgn);
        }
        ctx.restore();
        function drawBend(sg){
          var A=M(-2.35,y0),B0=M(-R-.22,y0),B1=M(R+.22,y0),Z=M(2.35,y0),ctrl=M(0,sg*(R+.5));
          ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B0.x,B0.y);ctx.quadraticCurveTo(ctrl.x,ctrl.y,B1.x,B1.y);ctx.lineTo(Z.x,Z.y);ctx.stroke();
          arrow(ctx,M(-1.7,y0).x,M(-1.7,y0).y,M(-1.35,y0).x,M(-1.35,y0).y,C.skyD);
          arrow(ctx,M(1.35,y0).x,M(1.35,y0).y,M(1.7,y0).x,M(1.7,y0).y,C.skyD);
        }
      }
      // 导体主体
      ctx.save();ctx.fillStyle=s.hollow?'#FBFAFE':'#F4F1FA';ctx.strokeStyle=C.lavD;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(cx,cy,R*sc,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
      if(s.hollow){
        ctx.save();ctx.fillStyle='#ffffff';ctx.strokeStyle='#B8A9D8';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(cx,cy,.33*sc,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
        label(ctx,'腔内 E = 0',cx,cy+5,C.lavD,'center');
      }else label(ctx,'E内 = 0',cx,cy-4,C.lavD,'center');
      // 感应电荷
      var n=36;
      for(var i=0;i<n;i++){
        var th=Math.PI*2*i/n,cs=Math.cos(th),mag=Math.abs(cs)*s.E;
        var isPos=cs>0;
        var reduce=s.ground&&isPos?.35:1;
        var alpha=Math.min(1,mag*reduce*.9);if(alpha<.12)continue;
        var x=cx+(R+.09)*sc*Math.cos(th),y=cy-(R+.09)*sc*Math.sin(th);
        ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=isPos?C.pinkD:C.skyD;ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText(isPos?'+':'−',x,y+6);ctx.restore();
      }
      if(s.ground){
        ctx.save();ctx.strokeStyle='#57A47F';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(cx,cy+R*sc);ctx.lineTo(cx,cy+R*sc+22);ctx.moveTo(cx-12,cy+R*sc+22);ctx.lineTo(cx+12,cy+R*sc+22);ctx.moveTo(cx-8,cy+R*sc+27);ctx.lineTo(cx+8,cy+R*sc+27);ctx.moveTo(cx-4,cy+R*sc+32);ctx.lineTo(cx+4,cy+R*sc+32);ctx.stroke();ctx.restore();
        label(ctx,'接地',cx+18,cy+R*sc+26,C.mintD);
      }
      label(ctx,'外电场 E₀ →',30,26,C.skyD);
      label(ctx,'左侧负电荷',M(-R-.2,0).x-30,cy+R*sc+40,C.skyD,'right');
      label(ctx,'右侧正电荷',M(R+.2,0).x+30,cy+R*sc+40,C.pinkD);
      label(ctx,s.hollow?'空腔导体：内部与腔内均无电场线':'实心导体：内部无电场线',W-20,H-12,C.lavD,'right');
    }
    function frame(ts){if(dead)return;if(!last)last=ts;var dt=Math.min(.05,(ts-last)/1000);last=ts;if(s.playing)s.t+=dt;draw();
      var set=function(k,v){var e=q('[data-r="'+k+'"]');if(e)e.textContent=v;};
      set('in','0');set('surf',nf(3*s.E));set('pot','0 V（等势体）');set('net',s.ground?'负':'0（等量异号）');
      if(idx===1){set('sig',nf(3*s.E));set('net',s.ground?'负（远端流入大地）':'0');}
      if(idx===2){set('inE','0 V/m');set('outE',nf(s.E*1e5)+' V/m');}
      var st=q('[data-status]');if(st)st.textContent=s.ground?'接地后远端正电荷流入大地，导体净带负电，但内部仍 E=0。':'感应电荷在左负右正，其内部场与外场等大反向。';
      rAF=global.requestAnimationFrame(frame);
    }
    rAF=global.requestAnimationFrame(frame);
    return function cleanup(){if(dead)return;dead=true;global.cancelAnimationFrame(rAF);for(var t in LST){if(!LST.hasOwnProperty(t))continue;var a=LST[t];for(var i=0;i<a.length;i++)a[i][0].removeEventListener(t,a[i][1]);}};
  }};
})(window);
