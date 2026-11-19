/* circular-motion.js — 圆周运动交互模块（IIFE，无外部依赖） */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};
  var G = 9.8;
  var STYLE = `<style>
.cm-wrap{color:var(--ink,#3a4250);font-size:15px}
.cm-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.cm-grid{grid-template-columns:1fr}}
.cm-card{background:#fff;border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.cm-card+.cm-card{margin-top:14px}
.cm-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.cm-hd h4{font-size:16px;font-weight:700}.cm-hd small{font-size:12px;color:var(--ink-3,#8b95a3)}
canvas.cm-cv{display:block;width:100%;height:200px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.cm-cv.chart{height:146px}
.cm-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.cm-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.cm-chip.hot{background:#F7F4FC;border-color:#D0C4E8}.cm-chip b{color:var(--ink,#3a4250)}
.cm-ctrl{margin-top:9px}.cm-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.cm-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.cm-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.cm-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.cm-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#D0C4E8;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.cm-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.cm-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#D0C4E8;border:3px solid #fff}
.cm-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.cm-btn{min-height:36px;padding:6px 13px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;font-size:13px;font-weight:600}
.cm-btn:hover{border-color:#D0C4E8;background:#F7F4FC}.cm-btn.main{background:#F7F4FC;border-color:#D0C4E8}
.cm-btn.seg.on{background:#F7F4FC;border-color:#D0C4E8;color:#6e57a0}
.cm-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cm-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px}
.cm-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.cm-read b{font-size:16px;font-variant-numeric:tabular-nums}.cm-read.hl{background:#F7F4FC;border-color:#DED2EE}
.cm-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.cm-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.cm-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.cm-barrow{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.cm-barrow>span{flex:0 0 74px;font-size:12px;color:var(--ink-2,#5a6472)}
.cm-bartrack{flex:1;height:19px;background:#f2f5f8;border-radius:6px;overflow:hidden}
.cm-barfill{height:100%;border-radius:6px}
.cm-barval{flex:0 0 56px;text-align:right;font-size:13px;font-variant-numeric:tabular-nums}
.cm-status{margin-top:10px;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;background:#F1FBF6;border:1px solid #B8E8D0;color:#3d8d6c}
.cm-status.no{background:#FFF4F5;border-color:#FFB3BA;color:#c26b7a}
.cm-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:12px;padding-top:10px}
.cm-quiz h5{font-size:14px;margin:0 0 6px}.cm-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 7px}
.cm-opts{display:flex;gap:7px;flex-wrap:wrap}
.cm-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.cm-opt:hover{border-color:#D0C4E8;background:#F7F4FC}
.cm-fb{margin-top:7px;font-size:12.5px;min-height:18px;line-height:1.6}.cm-fb.ok{color:#2f8f68}.cm-fb.no{color:#c26b7a}
.cm-exp{margin-top:7px;min-height:32px;padding:4px 11px;font-size:12px}
.cm-explain{margin-top:7px;padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:12.5px;line-height:1.7;color:#6e57a0}
.cm-explain[hidden]{display:none}
</style>`;
  function line(c,a1,b1,a2,b2,col,w,d){var g=c.ctx||c;g.save();g.beginPath();if(d)g.setLineDash(d);g.strokeStyle=col;g.lineWidth=w||1;g.moveTo(a1,b1);g.lineTo(a2,b2);g.stroke();g.restore();}
  function text(c,s,x,y,col,sz,al){var g=c.ctx||c;g.save();g.fillStyle=col||'#8b95a3';g.font=(sz||12)+'px "PingFang SC","Microsoft YaHei",sans-serif';g.textAlign=al||'left';g.textBaseline='middle';g.fillText(s,x,y);g.restore();}
  function dot(c,x,y,r,f,s){var g=c.ctx||c;g.save();g.beginPath();g.arc(x,y,r,0,6.2832);g.fillStyle=f;g.fill();if(s){g.lineWidth=2;g.strokeStyle=s;g.stroke();}g.restore();}
  function mk(el){return{el:el,ctx:el.getContext('2d'),w:0,h:0,dpr:0};}
  function fit(c){var w=c.el.clientWidth,h=c.el.clientHeight,d=Math.min(global.devicePixelRatio||1,2);if(w&&h&&(w!==c.w||h!==c.h||d!==c.dpr)){c.w=w;c.h=h;c.dpr=d;c.el.width=Math.round(w*d);c.el.height=Math.round(h*d);c.ctx.setTransform(d,0,0,d,0,0);}return c;}
  function arrow(c,x1,y1,x2,y2,col,lab){line(c,x1,y1,x2,y2,col,2.5);var a=Math.atan2(y2-y1,x2-x1),g=c.ctx||c,s=8;g.save();g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-s*Math.cos(a-.45),y2-s*Math.sin(a-.45));g.lineTo(x2-s*Math.cos(a+.45),y2-s*Math.sin(a+.45));g.closePath();g.fillStyle=col;g.fill();g.restore();if(lab)text(c,lab,x2+7,y2-6,col,12);}
  var QUIZ=[
    {id:'q1',title:'① 最高点临界速度（绳）',label:'圆周半径 r',min:.5,max:3,step:.5,val:2,unit:'m',
      build:function(v){var ans=Math.sqrt(G*v);return{prompt:'绳系小球在竖直面做圆周运动，r = '+v.toFixed(1)+' m，恰好过最高点的速度至少为？',
        opts:[ans.toFixed(2)+' m/s',(ans/2).toFixed(2)+' m/s',Math.sqrt(2*G*v).toFixed(2)+' m/s'],right:0,
        ex:'最高点绳张力恰为零：mg = mv²/r，v临 = √(gr) = '+ans.toFixed(2)+' m/s。'};}},
    {id:'q2',title:'② 最低点向心力',label:'最低点速度 v',min:3,max:12,step:1,val:6,unit:'m/s',
      build:function(v){var m=2,r=2,Fc=m*v*v/r;return{prompt:'m = 2 kg、r = 2 m，最低点速度 '+v+' m/s，所需向心力为？',
        opts:[Fc.toFixed(1)+' N',(Fc/2).toFixed(1)+' N',(2*Fc).toFixed(1)+' N'],right:0,
        ex:'F向 = mv²/r = 2×'+v+'²/2 = '+Fc.toFixed(1)+' N（此处 T − mg = F向，张力更大）。'};}}
  ];
  function quizHTML(){return '<div class="cm-card"><div class="cm-hd"><h4>高考题型 · 随堂练</h4><small>参数可调 · 即时判分</small></div>'+QUIZ.map(function(z){
    return '<div class="cm-quiz"><h5>'+z.title+'</h5><p data-qp="'+z.id+'"></p><div class="cm-ctrl"><label><span>'+z.label+'</span><b data-qo="'+z.id+'"></b></label><input class="cm-range" type="range" data-qs="'+z.id+'" min="'+z.min+'" max="'+z.max+'" step="'+z.step+'" value="'+z.val+'"></div><div class="cm-opts" data-qopts="'+z.id+'"></div><div class="cm-fb" data-qfb="'+z.id+'"></div><button type="button" class="cm-btn cm-exp" data-qexp="'+z.id+'">展开解析 ▾</button><div class="cm-explain" data-qex="'+z.id+'" hidden></div></div>';}).join('')+'</div>';}

  NS.modules['circular-motion']={render:function(container,extIndex){
    extIndex=extIndex|0;if(extIndex<0||extIndex>3)extIndex=0;
    var intro=['向心力 <b>F = mv²/r</b> 只改变方向','最高点：<b>T + mg = mv²/r</b>','临界：<b>v顶 = √(gr)</b>（绳）','竖直圆周的临界条件'][extIndex];
    var extra=extIndex===1
      ?'<div class="cm-card"><div class="cm-hd"><h4>向心力分析</h4><small>沿半径方向的合力</small></div>'
        +[['need','所需向心力 mv²/r','#D0C4E8'],['grav','重力径向分量','#BFE3F5'],['tens','绳/杆作用力','#FFB3BA']].map(function(p){return'<div class="cm-barrow"><span>'+p[1]+'</span><div class="cm-bartrack"><div class="cm-barfill" data-bar="'+p[0]+'" style="background:'+p[2]+'"></div></div><b class="cm-barval" data-barval="'+p[0]+'">—</b></div>';}).join('')
        +'<div class="cm-tip">径向方程：T + mg·cosα = mv²/r（α 为与最高点夹角）。最低点张力最大，最高点最小。</div></div>'
      :extIndex===2
        ?'<div class="cm-card"><div class="cm-hd"><h4>临界问题</h4><small>能否完整通过最高点</small></div><div class="cm-status" data-status></div><div class="cm-tip" data-crit></div></div>'
        :extIndex===3?quizHTML():'';
    var chartTitle=['v–θ 速度随位置变化','F向–v 关系','临界速度–半径关系','v–θ 速度随位置变化'][extIndex];
    container.innerHTML=STYLE+'<div class="cm-wrap"><div class="cm-intro"><span class="cm-chip hot">'+intro+'</span><span class="cm-chip">机械能守恒</span><span class="cm-chip">读数为示意值</span></div>'
      +'<div class="cm-grid"><div><div class="cm-card"><div class="cm-hd"><h4>竖直圆周运动</h4><small>小球沿圆周运动，矢量实时转向</small></div><canvas class="cm-cv" data-cv="stage"></canvas>'
      +'<div class="cm-legend"><span><i style="background:#FFB3BA"></i>速度 v</span><span><i style="background:#D0C4E8"></i>向心力</span><span><i style="background:#BFE3F5"></i>重力 mg</span></div></div>'
      +'<div class="cm-card"><div class="cm-hd"><h4>'+chartTitle+'</h4><small>随参数实时更新</small></div><canvas class="cm-cv chart" data-cv="chart"></canvas></div></div>'
      +'<div><div class="cm-card"><div class="cm-hd"><h4>参数调节</h4><small>拖动即时改变</small></div>'
      +[['v0','最低点速度 v₀',3,16,.5,8,'m/s'],['r','半径 r',.5,3,.1,1.5,'m'],['mass','质量 m',.5,5,.5,2,'kg'],['angle','位置角 θ',0,360,5,0,'°']]
        .map(function(r){return'<div class="cm-ctrl"><label><span>'+r[1]+'</span><b><span data-out="'+r[0]+'">'+r[5]+'</span> '+r[6]+'</b></label><input class="cm-range" type="range" data-slider="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'" value="'+r[5]+'"></div>';}).join('')
      +'<div class="cm-btns"><button type="button" class="cm-btn seg on" data-model="string">绳模型</button><button type="button" class="cm-btn seg" data-model="rod">杆模型</button></div>'
      +'<div class="cm-btns"><button type="button" class="cm-btn main" data-btn="toggle">暂停</button><button type="button" class="cm-btn" data-btn="reset">回到最低点</button></div></div>'
      +'<div class="cm-card"><div class="cm-hd"><h4>实时读数</h4><small>随位置刷新</small></div><div class="cm-reads">'
      +[['v','当前速度 / (m/s)',1],['Fc','向心力 / N',1],['omega','角速度 ω / (rad/s)',1],['Tperiod','瞬时 2π/ω / s（非真实周期）',0],['vtop','最高点速度 / (m/s)',0],['T','绳/杆作用力 / N',0]]
        .map(function(r){return'<div class="cm-read'+(r[2]?' hl':'')+'"><span>'+r[1]+'</span><b data-read="'+r[0]+'">—</b></div>';}).join('')
      +'</div><div class="cm-tip">速度由机械能守恒决定：v²(θ) = v₀² − 2gr(1−cosθ)。竖直面内 ω=v/r 是瞬时值，2π/ω 不是真实周期。绳模型 v₀&lt;√(2gr) 时仍绷紧、作摆动；√(2gr)&lt;v₀&lt;√(5gr) 时在上半圆绳松弛、小球做斜抛；杆模型可过顶（顶速可为 0）。</div></div>'+extra+'</div></div></div>';
    var q=function(s){return container.querySelector(s);},qa=function(s){return container.querySelectorAll(s);};
    var stage=mk(q('[data-cv="stage"]')),chart=mk(q('[data-cv="chart"]')),dis=[];
    function on(t,ty,fn,o){t.addEventListener(ty,fn,o);dis.push(function(){t.removeEventListener(ty,fn,o);});}
    var st={v0:8,r:1.5,mass:2,angle:0,model:'string',dir:1,running:true,last:0,manual:false,detached:false,proj:null};
    function vAt(th){var v2=st.v0*st.v0-2*G*st.r*(1-Math.cos(th));return Math.sqrt(Math.max(0,v2));}
    function vcrit(){return st.model==='string'?Math.sqrt(5*G*st.r):2*Math.sqrt(G*st.r);}
    function canLoop(){return st.v0>=vcrit();}
    var P2=Math.PI*2;
    function ratio(){return st.v0*st.v0/(G*st.r);}
    // 绳张力 T = mv²/r + mg·cosθ（θ 自最低点量起）。T=0 → cosθ=(2−v₀²/(gr))/3
    function detachAngle(){if(st.model!=='string')return null;var k=ratio();if(k<=2+1e-9||k>=5-1e-9)return null;return Math.acos(Math.max(-1,Math.min(1,(2-k)/3)));}
    function swingAngle(){var c=1-ratio()/2;if(c<=-1)return Math.PI;if(c>=1)return 0;return Math.acos(c);}
    function resetMotion(){st.angle=0;st.dir=1;st.detached=false;st.proj=null;}
    function beginDetach(thd){var co=Math.cos(thd),vd=Math.sqrt(Math.max(0,-G*st.r*co));st.angle=thd;st.detached=true;st.proj={x:st.r*Math.sin(thd),y:st.r*Math.cos(thd),vx:vd*co,vy:-vd*Math.sin(thd)};}
    qa('[data-slider]').forEach(function(el){var k=el.getAttribute('data-slider');on(el,'input',function(){st[k]=parseFloat(el.value);q('[data-out="'+k+'"]').textContent=(k==='r'?st[k].toFixed(1):String(st[k]));if(k==='angle'){st.manual=true;st.angle=st[k]*Math.PI/180;st.dir=1;var td=detachAngle();if(td!==null&&st.angle>=td)beginDetach(td);else{st.detached=false;st.proj=null;}}else{st.manual=false;resetMotion();}if(extIndex===2)refreshCrit();});});
    qa('[data-model]').forEach(function(b){on(b,'click',function(){st.model=b.getAttribute('data-model');qa('[data-model]').forEach(function(x){x.classList.toggle('on',x===b);});resetMotion();if(extIndex===2)refreshCrit();});});
    var tg=q('[data-btn="toggle"]');on(tg,'click',function(){st.running=!st.running;tg.textContent=st.running?'暂停':'继续';tg.classList.toggle('main',st.running);});
    on(q('[data-btn="reset"]'),'click',function(){resetMotion();st.manual=false;q('[data-slider="angle"]').value=0;q('[data-out="angle"]').textContent='0';});
    function refreshCrit(){var el=q('[data-status]'),box=q('[data-crit]');if(!el)return;var ok=canLoop(),td=detachAngle();el.className='cm-status'+(ok?'':' no');el.textContent=ok?'✓ 速度足够，能完整通过最高点':(td!==null?'✗ 绳在上半圆松弛，小球脱离做斜抛':'✗ 速度不足，沿圆弧往返摆动（未过顶）');box.innerHTML=(st.model==='string'?'绳模型':'杆模型')+'：v₀临 = '+vcrit().toFixed(2)+' m/s（v顶临 = '+(st.model==='string'?Math.sqrt(G*st.r).toFixed(2):'0')+' m/s）；当前 v₀ = '+st.v0.toFixed(1)+' m/s。'+(td!==null?' 脱离角 θ = '+(td*180/Math.PI).toFixed(0)+'°。':'');}
    if(extIndex===2)refreshCrit();
    if(extIndex===3){
      QUIZ.forEach(function(z){function refresh(){var d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));q('[data-qp="'+z.id+'"]').textContent=d.prompt;q('[data-qo="'+z.id+'"]').textContent=q('[data-qs="'+z.id+'"]').value+(z.unit||'');q('[data-qopts="'+z.id+'"]').innerHTML=d.opts.map(function(o,i){return'<button type="button" class="cm-opt" data-q="'+z.id+'" data-i="'+i+'">'+o+'</button>';}).join('');q('[data-qfb="'+z.id+'"]').textContent='';q('[data-qex="'+z.id+'"]').hidden=true;}
        refresh();on(q('[data-qs="'+z.id+'"]'),'input',refresh);on(q('[data-qexp="'+z.id+'"]'),'click',function(e){var box=q('[data-qex="'+z.id+'"]'),d=z.build(parseFloat(q('[data-qs="'+z.id+'"]').value));box.hidden=!box.hidden;box.textContent=d.ex;e.target.textContent=box.hidden?'展开解析 ▾':'收起解析 ▴';});});
      qa('[data-q]').forEach(function(b){on(b,'click',function(){var id=b.getAttribute('data-q'),i=+b.getAttribute('data-i'),z=QUIZ.filter(function(x){return x.id===id;})[0],d=z.build(parseFloat(q('[data-qs="'+id+'"]').value)),fb=q('[data-qfb="'+id+'"]'),ok=i===d.right;fb.className='cm-fb '+(ok?'ok':'no');fb.textContent=ok?'✓ 正确！':'✗ 再想想，点「展开解析」看思路。';});});
    }
    function drawStage(){
      fit(stage);var c=stage.ctx,w=stage.w,h=stage.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var cx=w*.42,cy=h*.54,R0=Math.min(h*.36,110),R=R0*Math.max(.6,Math.min(1.4,st.r/1.5));
      var th=st.angle,v,ux,uy,Fc=0;
      c.save();c.beginPath();c.arc(cx,cy,R0,0,P2);c.strokeStyle='#e3e8ee';c.lineWidth=1.5;c.setLineDash([4,4]);c.stroke();c.restore();
      if(Math.abs(R-R0)>2)text(c,'r=1.5 m（变化前）',cx+R0+5,cy-R0+9,'#aab4c0',10);
      c.save();c.beginPath();c.arc(cx,cy,R,0,P2);c.strokeStyle='#E6DFFA';c.lineWidth=2;c.setLineDash([5,4]);c.stroke();c.restore();
      dot(c,cx,cy,4,'#8b95a3');
      var bx,by;
      if(st.detached&&st.proj){
        // 绳松弛后的斜抛轨迹（物理坐标 x 右为正、y 下为正，单位 m）
        var p={x:st.proj.x,y:st.proj.y,vx:st.proj.vx,vy:st.proj.vy};
        c.save();c.beginPath();
        for(var s=0;s<=60;s++){
          var sx=cx+p.x/st.r*R,sy=cy+p.y/st.r*R;
          if(s===0)c.moveTo(sx,sy);else c.lineTo(sx,sy);
          p.vy+=G*.03;p.x+=p.vx*.03;p.y+=p.vy*.03;
        }
        c.strokeStyle='#c9d4e0';c.lineWidth=1.8;c.setLineDash([4,4]);c.stroke();c.restore();
        bx=cx+st.proj.x/st.r*R;by=cy+st.proj.y/st.r*R;
        v=Math.sqrt(st.proj.vx*st.proj.vx+st.proj.vy*st.proj.vy);
        arrow(c,bx,by,bx+st.proj.vx/st.r*R*.42,by+st.proj.vy/st.r*R*.42,'#FFB3BA','v');
        text(c,'绳松弛 · 斜抛',w-12,36,'#c26b7a',12,'right');
      }else{
        bx=cx+R*Math.sin(th);by=cy+R*Math.cos(th);v=vAt(th);
        line(c,cx,cy,bx,by,st.model==='string'?'#D0C4E8':'#BFE3F5',st.model==='string'?2:5);
        var tx=Math.cos(th)*st.dir,ty=-Math.sin(th)*st.dir,vl=Math.min(70,v*5);
        arrow(c,bx,by,bx+tx*vl,by+ty*vl,'#FFB3BA','v');
        Fc=st.mass*v*v/st.r;var fl=Math.min(60,Fc*1.6);
        ux=(cx-bx)/Math.max(1,R);uy=(cy-by)/Math.max(1,R);
        arrow(c,bx,by,bx+ux*fl,by+uy*fl,'#D0C4E8','F向');
      }
      dot(c,bx,by,13,'#FFB3BA','#f28f9a');
      arrow(c,bx,by,bx,by+Math.min(60,14+st.mass*G*1.6),'#BFE3F5','mg');  // 长度随质量变化
      var deg=(th*180/Math.PI)%360;if(deg<0)deg+=360;
      text(c,'θ='+deg.toFixed(0)+'°　v='+v.toFixed(2)+' m/s　r='+st.r.toFixed(1)+' m',w-12,18,'#5a6472',12,'right');
      text(c,st.model==='string'?'绳模型':'杆模型',12,18,'#8b6fb0',12);
    }
    function drawChart(){
      fit(chart);var c=chart.ctx,w=chart.w,h=chart.h;if(!w||!h)return;c.clearRect(0,0,w,h);
      var x0=48,x1=w-14,top=16,bot=h-28;
      line(c,x0,bot,x1,bot,'#cbd6e2',1);line(c,x0,top,x0,bot,'#cbd6e2',1);
      function clamp01(u){return Math.max(0,Math.min(1,u));}
      function frame(xlab,ylab){text(c,xlab,x1,h-8,'#8b95a3',11,'right');text(c,ylab,x0+2,top+4,'#8b95a3',10);text(c,'0',x0-4,bot+1,'#aab4c0',10,'right');}
      if(extIndex===0||extIndex===3){
        var vAxis=Math.max(6,Math.ceil(Math.max(st.v0,3)*1.1/2)*2);
        function py(v){return bot-clamp01(v/vAxis)*(bot-top);}
        function pxTh(th){return x0+clamp01(th/P2)*(x1-x0);}
        frame('θ / (°)','v / (m/s)');
        text(c,String(vAxis),x0-4,top+4,'#aab4c0',10,'right');text(c,'0',x0,bot+12,'#aab4c0',10,'center');text(c,'360°',x1,bot+12,'#aab4c0',10,'right');
        line(c,x0,py(st.v0),x1,py(st.v0),'#e3e8ee',1,[4,4]);text(c,'v₀='+st.v0.toFixed(1),x0+5,py(st.v0)-8,'#aab4c0',10);
        var td=detachAngle(),thEnd=td!==null?td:P2;
        var nSeg=Math.max(2,Math.round(120*thEnd/P2));
        c.save();c.beginPath();for(var i=0;i<=nSeg;i++){var th=thEnd*i/nSeg,X=pxTh(th),Y=py(vAt(th));if(i===0)c.moveTo(X,Y);else c.lineTo(X,Y);}c.strokeStyle='#D0C4E8';c.lineWidth=2.4;c.stroke();c.restore();
        if(td!==null){
          c.save();c.beginPath();for(var ii=0;ii<=120-nSeg;ii++){var th2=thEnd+(P2-thEnd)*ii/(120-nSeg),X2=pxTh(th2),Y2=py(vAt(th2));if(ii===0)c.moveTo(X2,Y2);else c.lineTo(X2,Y2);}c.strokeStyle='#dfe6ee';c.lineWidth=1.8;c.setLineDash([4,4]);c.stroke();c.restore();
          line(c,pxTh(td),top,pxTh(td),bot,'#FFB3BA',1,[4,4]);text(c,'绳松弛 '+(td*180/Math.PI).toFixed(0)+'°',pxTh(td)+4,top+12,'#c26b7a',10);
          text(c,'灰虚线：脱离后不再沿圆',x0+6,bot-12,'#9aa4b0',10);
        }
        var curTh=st.detached&&st.proj?thEnd:Math.max(0,Math.min(P2,st.angle));
        line(c,pxTh(curTh),top,pxTh(curTh),bot,'#e8edf2',1,[3,3]);dot(c,pxTh(curTh),py(vAt(curTh)),5,'#FFB3BA','#fff');
        return;
      }
      if(extIndex===1){
        // 固定绝对量程：默认 m=2 kg、r=1.5 m、v≤16 m/s → 350 N
        var FcAxis=Math.max(100,Math.ceil(2*16*16/1.5/50)*50);
        function pyF(F){return bot-clamp01(F/FcAxis)*(bot-top);}
        function pxV(v){return x0+v/16*(x1-x0);}
        frame('v / (m/s)','F向 / N');
        text(c,FcAxis,x0-4,top+4,'#aab4c0',10,'right');text(c,'16',x1,bot+12,'#aab4c0',10,'right');
        c.save();c.beginPath();for(var r=0;r<=60;r++){var vr=16*r/60,X=pxV(vr),Y=pyF(2*vr*vr/1.5);if(r===0)c.moveTo(X,Y);else c.lineTo(X,Y);}c.strokeStyle='#c9d4e0';c.lineWidth=1.6;c.setLineDash([5,4]);c.stroke();c.restore();
        text(c,'变化前 m=2 kg、r=1.5 m',x0+6,top+16,'#9aa4b0',10);
        c.save();c.beginPath();for(var j=0;j<=60;j++){var vj=16*j/60,Xj=pxV(vj),Yj=pyF(st.mass*vj*vj/st.r);if(j===0)c.moveTo(Xj,Yj);else c.lineTo(Xj,Yj);}c.strokeStyle='#FFB3BA';c.lineWidth=2.5;c.stroke();c.restore();
        var vnow=st.detached&&st.proj?Math.sqrt(st.proj.vx*st.proj.vx+st.proj.vy*st.proj.vy):vAt(st.angle);
        dot(c,pxV(Math.min(16,vnow)),pyF(st.mass*vnow*vnow/st.r),5,'#FFB3BA','#fff');
        return;
      }
      var Vax=13;
      function pyVc(v){return bot-clamp01(v/Vax)*(bot-top);}
      function pxR(rr){return x0+(rr-.5)/2.5*(x1-x0);}
      frame('r / m','v临 / (m/s)');
      text(c,String(Vax),x0-4,top+4,'#aab4c0',10,'right');[.5,1.5,3].forEach(function(rr){text(c,rr.toFixed(1),pxR(rr),bot+12,'#aab4c0',10,'center');});
      c.save();c.beginPath();for(var k=0;k<=60;k++){var rr=.5+2.5*k/60,vc=st.model==='string'?Math.sqrt(5*G*rr):2*Math.sqrt(G*rr),X=pxR(rr),Y=pyVc(vc);if(k===0)c.moveTo(X,Y);else c.lineTo(X,Y);}c.strokeStyle='#D0C4E8';c.lineWidth=2.5;c.stroke();c.restore();
      line(c,x0,pyVc(st.v0),x1,pyVc(st.v0),'#FFB3BA',1,[4,4]);text(c,'当前 v₀='+st.v0.toFixed(1),x1-4,pyVc(st.v0)-8,'#c07884',10,'right');
      line(c,pxR(st.r),top,pxR(st.r),bot,'#e8edf2',1,[3,3]);dot(c,pxR(st.r),pyVc(st.model==='string'?Math.sqrt(5*G*st.r):2*Math.sqrt(G*st.r)),5,'#D0C4E8','#fff');
    }
    function set(k,v){var e=q('[data-read="'+k+'"]');if(e)e.textContent=v;}
    function update(){
      var det=st.detached&&st.proj,v=det?Math.sqrt(st.proj.vx*st.proj.vx+st.proj.vy*st.proj.vy):vAt(st.angle);
      var Fc=det?0:st.mass*v*v/st.r,om=det?0:v/st.r;
      var radial=st.mass*G*Math.cos(Math.PI-st.angle);   // = −mg cosθ
      var rawT=Fc-radial,T=st.model==='string'?Math.max(0,rawT):rawT,slack=st.model==='string'&&rawT<=0;
      var vtop=Math.sqrt(Math.max(0,st.v0*st.v0-4*G*st.r));
      set('v',v.toFixed(2));set('Fc',Fc.toFixed(2));set('omega',om.toFixed(2));set('Tperiod',(2*Math.PI/Math.max(.1,om)).toFixed(2));set('vtop',vtop.toFixed(2));set('T',slack?'0（绳松弛）':T.toFixed(2));
      if(extIndex===1){var mx=Math.max(1,Fc,Math.abs(radial),Math.abs(T)),vals={need:Fc,grav:radial,tens:slack?0:T};Object.keys(vals).forEach(function(k){var b=q('[data-bar="'+k+'"]'),e=q('[data-barval="'+k+'"]');if(b)b.style.width=Math.min(100,Math.abs(vals[k])/mx*100).toFixed(1)+'%';if(e)e.textContent=vals[k].toFixed(1);});}
    }
    var raf=0;
    function loop(now){if(!st.last)st.last=now;var dt=Math.min(.04,(now-st.last)/1000);st.last=now;
      if(st.running&&!st.manual){
        if(st.detached&&st.proj){
          st.proj.vy+=G*dt;st.proj.x+=st.proj.vx*dt;st.proj.y+=st.proj.vy*dt;
          if(st.proj.y>st.r+1.2||Math.abs(st.proj.x)>st.r*2.5)resetMotion();
        }else{
          var v=vAt(st.angle),td=detachAngle(),lim=canLoop()?null:swingAngle();
          if(td!==null&&st.dir>0&&st.angle>=td)beginDetach(td);
          else{
            if(lim!==null&&st.angle>=lim-1e-3&&st.dir>0)st.dir=-1;
            if(v<0.08&&st.angle>0.01&&st.angle<Math.PI)st.dir=-1;
            st.angle+=st.dir*v/Math.max(.3,st.r)*dt;
            if(st.angle>=P2){if(canLoop())st.angle-=P2;else st.dir=-1;}
            if(st.angle<=0){st.angle=0;st.dir=1;}
          }
        }
        var deg=Math.round(st.angle*180/Math.PI),sl=q('[data-slider="angle"]'),out=q('[data-out="angle"]');
        if(sl&&global.document&&global.document.activeElement!==sl)sl.value=String(deg);
        if(out)out.textContent=String(deg);
      }
      drawStage();drawChart();update();raf=global.requestAnimationFrame(loop);}
    raf=global.requestAnimationFrame(loop);
    return function cleanup(){global.cancelAnimationFrame(raf);dis.forEach(function(f){f();});dis.length=0;container.innerHTML='';};
  }};
})(window);
