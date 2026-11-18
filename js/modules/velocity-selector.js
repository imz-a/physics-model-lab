/* ============================================================
 * velocity-selector.js — 速度选择器交互模块（IIFE，file:// 可用）
 * 契约：window.ModelLab.modules['velocity-selector'].render(container, extIndex) -> cleanup
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};

  var STYLE = ''
    + '.vs-root{--vs-pink:#FFB3BA;--vs-peach:#FFD8A8;--vs-cream:#FFF3BF;--vs-mint:#B8E8D0;--vs-sky:#BFE3F5;--vs-lav:#D0C4E8;--vs-ink:#3a4250;--vs-ink2:#5a6472;--vs-ink3:#8b95a3;--vs-line:#e8edf2;box-sizing:border-box;color:var(--vs-ink);font:15px/1.6 "PingFang SC","Microsoft YaHei","Segoe UI",system-ui,sans-serif;display:flex;flex-direction:column;gap:14px;min-height:100%}'
    + '.vs-root *{box-sizing:border-box}.vs-root :focus-visible{outline:2px solid #7FB3D5;outline-offset:2px}'
    + '.vs-g2{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:14px;align-items:start}'
    + '.vs-card{background:#fff;border:1px solid var(--vs-line);border-top:3px solid var(--vs-sky);border-radius:14px;padding:18px 20px;box-shadow:0 8px 22px rgba(88,108,132,.07);min-width:0}'
    + '.vs-card.pink{border-top-color:var(--vs-pink)}.vs-card.peach{border-top-color:var(--vs-peach)}.vs-card.mint{border-top-color:var(--vs-mint)}.vs-card.lav{border-top-color:var(--vs-lav)}'
    + '.vs-h{font-size:17px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}'
    + '.vs-tag{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;background:#f4f7f9;border:1px solid var(--vs-line);color:var(--vs-ink2);white-space:nowrap}'
    + '.vs-formula{font-family:"Cambria Math","Times New Roman",Georgia,serif;font-style:italic;font-size:19px;text-align:center;background:#fffdf3;border:1px solid #f2e8bd;border-radius:10px;padding:13px 8px;margin:10px 0;overflow-x:auto;white-space:nowrap}'
    + '.vs-formula.mint{background:#f3fbf7;border-color:#d3ecdf}'
    + '.vs-sym{font-size:13px;color:var(--vs-ink2);line-height:1.85}.vs-sym b{color:var(--vs-ink)}.vs-sym .hl{color:#a35d65;font-weight:700}'
    + '.vs-ctrls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin:12px 0}'
    + '.vs-ctrl label{display:flex;justify-content:space-between;font-size:12px;color:var(--vs-ink2);margin-bottom:7px}'
    + '.vs-ctrl label b{font-size:13px;color:#4e7f9e;font-variant-numeric:tabular-nums}'
    + '.vs-range{-webkit-appearance:none;appearance:none;width:100%;height:9px;border-radius:99px;background:linear-gradient(90deg,#9ecbe4 0 var(--fill,50%),#e9eef3 var(--fill,50%) 100%);outline:none;cursor:pointer;touch-action:none}'
    + '.vs-range::-webkit-slider-thumb{-webkit-appearance:none;width:21px;height:21px;border-radius:50%;background:#fff;border:4px solid #7FB3D5;box-shadow:0 1px 6px rgba(90,110,140,.28);cursor:grab}'
    + '.vs-range::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#fff;border:4px solid #7FB3D5;cursor:grab}'
    + '.vs-canvas{display:block;width:100%;height:auto;min-height:250px;border:1px solid var(--vs-line);border-radius:12px;background:#fff}'
    + '.vs-reads{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:12px}'
    + '.vs-box{border:1px solid var(--vs-line);border-radius:11px;padding:10px 5px;text-align:center;background:#fcfdfe}'
    + '.vs-box .k{font-size:11px;color:var(--vs-ink3)}.vs-box .v{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums}'
    + '.vs-alert{border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700;margin-top:10px}'
    + '.vs-alert.ok{background:#effaf4;color:#2f6a55}.vs-alert.no{background:#fff5ec;color:#a47443}'
    + '.vs-qhead{display:flex;align-items:center;gap:9px;font-weight:700;font-size:15px;margin-bottom:9px}'
    + '.vs-qnum{background:var(--vs-peach);color:#a47443;border-radius:8px;padding:2px 10px;font-size:12px}'
    + '.vs-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}'
    + '.vs-opt{border:1px solid var(--vs-line);background:#fff;border-radius:10px;padding:9px 11px;font-size:13px;text-align:left;cursor:pointer;color:var(--vs-ink2)}'
    + '.vs-opt.correct{background:#effaf4;border-color:#a7ddc4;color:#2f6a55;font-weight:700}.vs-opt.wrong{background:#fff0f1;border-color:#ffd6da;color:#a35d65}'
    + '.vs-fb{font-size:13px;font-weight:700;min-height:20px;margin-top:6px}.vs-fb.ok{color:#3f8067}.vs-fb.no{color:#a35d65}'
    + '.vs-btn{border:1px solid #dce4ec;background:#fff;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer}'
    + '.vs-btn.primary{background:var(--vs-mint);border-color:#a7ddc4;color:#2f6a55}'
    + '.vs-btn.on{background:var(--vs-sky);border-color:#b6d9ee;color:#3f6f8d}'
    + '.vs-input{border:1px solid #dce4ec;border-radius:9px;padding:8px 11px;font-size:14px;width:120px}'
    + '.vs-drawer{border:1px solid var(--vs-line);border-radius:12px;background:#fff;overflow:hidden;margin-top:10px}'
    + '.vs-drawer summary{cursor:pointer;padding:9px 14px;font-size:13px;font-weight:700;background:#fcfdfe;list-style:none}'
    + '.vs-drawer summary::-webkit-details-marker{display:none}.vs-drawer .b{padding:11px 14px;border-top:1px solid var(--vs-line)}'
    + '@media(max-width:980px){.vs-g2,.vs-ctrls,.vs-reads{grid-template-columns:1fr 1fr}}';

  function basics(){
    return '<div class="vs-g2"><div class="vs-card pink"><div class="vs-h">速度选择器 · 基本模型 <span class="vs-tag">正交电磁场</span></div>'
      + '<div class="vs-sym">粒子通过相互垂直的电场与磁场区域。电场力与洛伦兹力方向相反，只有速度恰好满足 qE=qvB 的粒子才能合力为零、直线通过。</div>'
      + '<div class="vs-formula">qE = qvB　→　<span class="hl">v = E/B</span></div>'
      + '<div class="vs-sym">选择条件<b>与电荷量 q、质量 m 无关</b>，只由 E、B 决定。速度偏大或偏小的粒子会分别向上、下偏转而被挡板拦住。</div>'
      + '</div><div class="vs-card lav"><div class="vs-h">场与力的方向</div>'
      + '<svg viewBox="0 0 460 250" style="width:100%;height:auto" role="img" aria-label="速度选择器正交场示意">'
      + '<rect x="60" y="45" width="340" height="150" fill="#f4fafe" stroke="#d8ebf6" rx="10"/>'
      + '<text x="230" y="32" text-anchor="middle" fill="#4e7f9e" font-size="12">E 向下 · B 垂直纸面向里</text>'
      + '<line x1="95" y1="70" x2="95" y2="120" stroke="#F4978E" stroke-width="2" marker-end="url(#vsA)"/>'
      + '<line x1="195" y1="70" x2="195" y2="120" stroke="#F4978E" stroke-width="2" marker-end="url(#vsA)"/>'
      + '<line x1="295" y1="70" x2="295" y2="120" stroke="#F4978E" stroke-width="2" marker-end="url(#vsA)"/>'
      + '<defs><marker id="vsA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#F4978E"/></marker></defs>'
      + '<circle cx="145" cy="165" r="7" fill="none" stroke="#7FB3D5" stroke-width="2"/><circle cx="145" cy="165" r="2" fill="#7FB3D5"/>'
      + '<circle cx="245" cy="165" r="7" fill="none" stroke="#7FB3D5" stroke-width="2"/><circle cx="245" cy="165" r="2" fill="#7FB3D5"/>'
      + '<line x1="60" y1="130" x2="400" y2="130" stroke="#B39DDB" stroke-width="2.5" stroke-dasharray="6 5"/>'
      + '<text x="230" y="222" text-anchor="middle" fill="#8b95a3" font-size="11">仅 v=E/B 的粒子沿虚线直线通过</text>'
      + '</svg></div></div>';
  }

  function balanceView(){
    return '<div class="vs-g2"><div class="vs-card sky"><div class="vs-h">受力平衡 · 轨迹实时演示 <span class="vs-tag">拖动观察偏转</span></div>'
      + '<div class="vs-ctrls">'
      + '<div class="vs-ctrl"><label>电场 E <b id="vsEV">6.0</b></label><input id="vsE" class="vs-range" type="range" min="1" max="10" step="0.5" value="6"></div>'
      + '<div class="vs-ctrl"><label>磁场 B <b id="vsBV">2.0</b></label><input id="vsB" class="vs-range" type="range" min="0.5" max="3" step="0.1" value="2"></div>'
      + '<div class="vs-ctrl"><label>粒子速度 v <b id="vsVV">3.0</b></label><input id="vsV" class="vs-range" type="range" min="0.5" max="8" step="0.1" value="3"></div>'
      + '<div class="vs-ctrl"><label>电荷 <b id="vsSV">正电</b></label><button id="vsSign" class="vs-btn" type="button" aria-pressed="false">切换为正/负</button></div></div>'
      + '<canvas id="vsSimCv" class="vs-canvas" width="1040" height="520" role="img" aria-label="带电粒子在正交电磁场中的运动轨迹"></canvas>'
      + '</div><div class="vs-card mint"><div class="vs-h">实时读数</div>'
      + '<div class="vs-reads"><div class="vs-box"><div class="k">选择速度 E/B</div><div class="v" id="vsRv0">—</div></div>'
      + '<div class="vs-box"><div class="k">电场力 qE</div><div class="v" id="vsRfe">—</div></div>'
      + '<div class="vs-box"><div class="k">洛伦兹力 qvB</div><div class="v" id="vsRfb">—</div></div>'
      + '<div class="vs-box"><div class="k">合力方向</div><div class="v" id="vsRnet">—</div></div></div>'
      + '<div class="vs-alert ok" id="vsPass">速度匹配：直线通过</div>'
      + '<div class="vs-formula mint" style="margin-top:12px">v=E/B　F<sub>e</sub>=qE　F<sub>B</sub>=qvB</div>'
      + '<div class="vs-sym">图中红色箭头为电场力、蓝色箭头为洛伦兹力；两者等大反向时粒子直线通过。</div>'
      + '</div></div>';
  }

  function appView(){
    return '<div class="vs-g2"><div class="vs-card lav"><div class="vs-h">应用拓展 · 作为质谱仪的前置选择器 <span class="vs-tag">串联情境</span></div>'
      + '<div class="vs-sym">粒子先通过速度选择器（E、B）获得确定速度 v=E/B，再进入分析磁场 B′ 做半圆运动，测得半径 r。由 q/m = v/(B′r) 得 <span class="hl">q/m = E/(B·B′·r)</span>。</div>'
      + '<div class="vs-ctrls">'
      + '<div class="vs-ctrl"><label>选择器 E <b id="vsGE">6.0</b></label><input id="vsGE2" class="vs-range" type="range" min="1" max="10" step="0.5" value="6"></div>'
      + '<div class="vs-ctrl"><label>选择器 B <b id="vsGB">2.0</b></label><input id="vsGB2" class="vs-range" type="range" min="0.5" max="3" step="0.1" value="2"></div>'
      + '<div class="vs-ctrl"><label>分析磁场 B′ <b id="vsGBp">1.5</b></label><input id="vsGBp2" class="vs-range" type="range" min="0.5" max="3" step="0.1" value="1.5"></div>'
      + '<div class="vs-ctrl"><label>半径 r <b id="vsGr">2.0</b></label><input id="vsGr2" class="vs-range" type="range" min="0.5" max="4" step="0.1" value="2"></div></div>'
      + '<canvas id="vsAppCv" class="vs-canvas" width="1040" height="480" role="img" aria-label="速度选择器与质谱仪串联示意"></canvas>'
      + '</div><div class="vs-card peach"><div class="vs-h">串联测量链</div>'
      + '<div class="vs-reads" style="grid-template-columns:repeat(2,minmax(0,1fr))">'
      + '<div class="vs-box"><div class="k">选出速度 v=E/B</div><div class="v" id="vsAv">—</div></div>'
      + '<div class="vs-box"><div class="k">比荷 q/m</div><div class="v" id="vsAqm">—</div></div></div>'
      + '<div class="vs-formula">q/m = <span class="vs-frac" style="display:inline-grid;grid-template-rows:auto auto;text-align:center;vertical-align:middle"><span>E</span><span>B·B′·r</span></span> = v/(B′r)</div>'
      + '<div class="vs-sym">前置选择器的作用是<b>剔除速度不同的粒子</b>，使后续偏转半径只反映比荷差异，从而提高测量精度。</div>'
      + '</div></div>';
  }

  function examView(){
    return '<div class="vs-card pink"><div class="vs-qhead"><span class="vs-qnum">1</span>选择题 · 选择条件与电荷无关</div>'
      + '<div class="vs-sym">在速度选择器中，能直线通过的粒子速度 v=E/B。若把入射粒子的电荷量加倍而速度不变（电性相同），则：</div>'
      + '<div class="vs-opts"><button class="vs-opt" type="button" data-i="0">A. 仍能直线通过</button><button class="vs-opt" type="button" data-i="1">B. 向上偏转</button>'
      + '<button class="vs-opt" type="button" data-i="2">C. 向下偏转</button><button class="vs-opt" type="button" data-i="3">D. 无法判断</button></div>'
      + '<div class="vs-fb" id="vsQ1Fb"></div>'
      + '<details class="vs-drawer"><summary>展开解析</summary><div class="b">qE 与 qvB 同时正比于 q，q 约去后条件仍为 v=E/B。选 A。</div></details></div>'
      + '<div class="vs-card mint" style="margin-top:14px"><div class="vs-qhead"><span class="vs-qnum">2</span>选择题 · 串联质谱仪求比荷（参数可调）</div>'
      + '<div class="vs-sym">E=<b id="vsEE">6.0</b>、B=<b id="vsEB">2.0</b>、B′=<b id="vsEBp">1.5</b>、r=<b id="vsEr">2.0</b>，则 q/m 为：</div>'
      + '<div class="vs-ctrls"><div class="vs-ctrl"><label>E <b>6.0</b></label><input id="vsEE2" class="vs-range" type="range" min="1" max="10" step="0.5" value="6"></div>'
      + '<div class="vs-ctrl"><label>B <b>2.0</b></label><input id="vsEB2" class="vs-range" type="range" min="0.5" max="3" step="0.1" value="2"></div>'
      + '<div class="vs-ctrl"><label>B′ <b>1.5</b></label><input id="vsEBp2" class="vs-range" type="range" min="0.5" max="3" step="0.1" value="1.5"></div>'
      + '<div class="vs-ctrl"><label>r <b>2.0</b></label><input id="vsEr2" class="vs-range" type="range" min="0.5" max="4" step="0.1" value="2"></div></div>'
      + '<div class="vs-opts" id="vsQ2Opts"></div>'
      + '<div class="vs-fb" id="vsQ2Fb"></div>'
      + '<details class="vs-drawer"><summary>展开解析</summary><div class="b">v=E/B，进入分析磁场后 q/m=v/(B′r)=E/(B·B′·r)。</div></details></div>';
  }

  function render(container, extIndex){
    if(!container || typeof container.innerHTML === 'undefined') return function(){};
    extIndex=Number(extIndex);
    if(!isFinite(extIndex)||extIndex<0||extIndex>3) extIndex=0;
    extIndex=extIndex|0;
    var doc=global.document, disposed=false, running=true, paused=false;
    var listeners=[], loops=[], timers=[];
    function q(id){ return container.querySelector('#'+id); }
    function on(el,type,fn){ if(!el)return; el.addEventListener(type,fn); listeners.push({el:el,type:type,fn:fn}); }
    function loop(fn){ var rec={id:0}; loops.push(rec); function frame(now){ if(disposed||!running)return; try{fn(now)}catch(e){} rec.id=global.requestAnimationFrame(frame); } rec.id=global.requestAnimationFrame(frame); }
    on(doc,'visibilitychange',function(){ paused=doc.hidden; });
    function fill(el){ if(!el)return; var min=+el.min,max=+el.max; el.style.setProperty('--fill',((+el.value-min)/(max-min)*100).toFixed(1)+'%'); }
    function fmt(v){ return Math.abs(v)>=100?v.toFixed(0):v.toFixed(2); }
    function ctx(cv,W,H){ var c=cv.getContext('2d'); c.setTransform(cv.width/W,0,0,cv.height/H,0,0); return c; }

    container.innerHTML='<style>'+STYLE+'</style><div class="vs-root">'+(extIndex===0?basics():extIndex===1?balanceView():extIndex===2?appView():examView())+'</div>';

    if(extIndex===1){
      [['vsE','vsEV',1],['vsB','vsBV',1],['vsV','vsVV',1]].forEach(function(x){ fill(q(x[0])); on(q(x[0]),'input',function(){ q(x[1]).textContent=(+this.value).toFixed(x[2]); fill(this); }); });
      var sign=1;
      on(q('vsSign'),'click',function(){
        sign = -sign;
        this.classList.toggle('on', sign<0);
        this.setAttribute('aria-pressed', String(sign<0));
        q('vsSV').textContent = sign>0 ? '正电' : '负电';
      });
      var cv=q('vsSimCv'), c=ctx(cv,520,260);
      loop(function(now){
        if(paused) return;
        var E=+q('vsE').value,B=+q('vsB').value,v=+q('vsV').value;
        var v0=E/B, Fe=E, Fb=v*B, net=(v-v0)*B*sign;
        q('vsRv0').textContent=fmt(v0);
        q('vsRfe').textContent=fmt(Fe);
        q('vsRfb').textContent=fmt(Fb);
        q('vsRnet').textContent=Math.abs(v-v0)<0.05?'0':(net>0?'向上':'向下');
        var ok=Math.abs(v-v0)<0.05, al=q('vsPass');
        al.className='vs-alert '+(ok?'ok':'no');
        al.textContent=ok?'速度匹配：合力为零，直线通过':'速度不匹配：粒子发生偏转，无法通过狭缝';
        c.clearRect(0,0,520,260);
        /* 场区 */
        c.fillStyle='#f4fafe'; c.fillRect(40,25,440,210);
        c.strokeStyle='#d8ebf6'; c.lineWidth=2; c.strokeRect(40,25,440,210);
        c.fillStyle='#4e7f9e'; c.font='11px sans-serif'; c.fillText('E 向下 · B 向里',46,18);
        for(var i=0;i<7;i++){
          var gx=80+i*65;
          c.strokeStyle='rgba(244,151,142,.45)'; c.lineWidth=1.5;
          c.beginPath(); c.moveTo(gx,45); c.lineTo(gx,90); c.stroke();
          c.fillStyle='rgba(244,151,142,.6)'; c.beginPath(); c.moveTo(gx-3,86); c.lineTo(gx+3,86); c.lineTo(gx,93); c.closePath(); c.fill();
          c.strokeStyle='rgba(127,179,213,.5)'; c.beginPath(); c.arc(gx+30,205,5,0,Math.PI*2); c.stroke();
        }
        /* 粒子轨迹 */
        var phase=(now/2600)%1, x=45+phase*430;
        var k=(v-v0)/Math.max(v0,0.1);
        var y=130 - Math.sign(k)*Math.min(95,Math.abs(k)*70)*Math.pow(phase,2)*sign*sign;
        c.strokeStyle='rgba(176,155,214,.55)'; c.lineWidth=2; c.setLineDash([4,4]); c.beginPath();
        for(var t=0;t<=1;t+=0.02){
          var xx=45+t*430, yy=130-Math.sign(k)*Math.min(95,Math.abs(k)*70)*t*t*sign*sign;
          if(t===0)c.moveTo(xx,yy); else c.lineTo(xx,yy);
        }
        c.stroke(); c.setLineDash([]);
        /* 受力箭头 */
        if(x>60 && x<460){
          c.strokeStyle='#F4978E'; c.fillStyle='#F4978E'; c.lineWidth=2.5;
          c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+28*sign); c.stroke();
          c.beginPath(); c.moveTo(x,y+28*sign); c.lineTo(x-4,y+20*sign); c.lineTo(x+4,y+20*sign); c.closePath(); c.fill();
          c.strokeStyle='#7FB3D5'; c.fillStyle='#7FB3D5';
          c.beginPath(); c.moveTo(x+12,y); c.lineTo(x+12,y-32*sign); c.stroke();
          c.beginPath(); c.moveTo(x+12,y-32*sign); c.lineTo(x+8,y-24*sign); c.lineTo(x+16,y-24*sign); c.closePath(); c.fill();
        }
        c.fillStyle='#F4978E'; c.beginPath(); c.arc(x,y,6,0,Math.PI*2); c.fill();
        c.fillStyle='#5a6472'; c.fillText('v='+v.toFixed(1)+'（选择值 '+v0.toFixed(1)+'）',380,247);
      });
    }

    if(extIndex===2){
      [['vsGE2','vsGE',1],['vsGB2','vsGB',1],['vsGBp2','vsGBp',1],['vsGr2','vsGr',1]].forEach(function(x){ fill(q(x[0])); on(q(x[0]),'input',function(){ q(x[1]).textContent=(+this.value).toFixed(x[2]); fill(this); }); });
      var ac=q('vsAppCv'), a=ctx(ac,520,240);
      loop(function(){
        var E=+q('vsGE2').value,B=+q('vsGB2').value,Bp=+q('vsGBp2').value,r=+q('vsGr2').value;
        var v=E/B, qm=E/(B*Bp*r);
        q('vsAv').textContent=fmt(v); q('vsAqm').textContent=fmt(qm);
        a.clearRect(0,0,520,240);
        a.fillStyle='#fff8ee'; a.fillRect(20,60,150,120); a.strokeStyle='#f6e2c4'; a.strokeRect(20,60,150,120);
        a.fillStyle='#a47443'; a.font='11px sans-serif'; a.fillText('速度选择器 E、B',38,52);
        a.fillStyle='#f4fafe'; a.fillRect(200,25,300,190); a.strokeStyle='#d8ebf6'; a.strokeRect(200,25,300,190);
        a.fillStyle='#4e7f9e'; a.fillText('分析磁场 B′',300,42);
        a.strokeStyle='#7FB3D5'; a.lineWidth=2; a.beginPath(); a.moveTo(25,120); a.lineTo(200,120); a.stroke();
        var R=Math.max(18,Math.min(80,r*20));
        a.strokeStyle='#F4978E'; a.lineWidth=2.5; a.beginPath(); a.arc(200+R,120,R,Math.PI,0,true); a.stroke();
        a.fillStyle='#F4978E'; a.fillRect(200+2*R-2,108,4,24);
        a.fillStyle='#5a6472'; a.fillText('选出 v='+fmt(v)+' → r='+fmt(r)+' → q/m='+fmt(qm),24,225);
      });
    }

    if(extIndex===3){
      function fb(id,ok,msg){ var el=q(id); el.className='vs-fb '+(ok?'ok':'no'); el.textContent=(ok?'✔ 正确：':'✘ 不正确：')+msg; }
      var opts=container.querySelectorAll('.vs-card.pink .vs-opt');
      for(var i=0;i<opts.length;i++){
        on(opts[i],'click',function(){
          var idx=+this.getAttribute('data-i');
          for(var j=0;j<opts.length;j++) opts[j].className='vs-opt';
          if(idx===0){ this.className='vs-opt correct'; fb('vsQ1Fb',true,'qE 与 qvB 同乘 q，约去后条件仍为 v=E/B。'); }
          else{ this.className='vs-opt wrong'; opts[0].className='vs-opt correct'; fb('vsQ1Fb',false,'应选 A；选择速度与电荷量无关。'); }
        });
      }
      var ee=q('vsEE2'),eb=q('vsEB2'),ebp=q('vsEBp2'),er=q('vsEr2');
      var outs=[q('vsEE'),q('vsEB'),q('vsEBp'),q('vsEr')];
      [ee,eb,ebp,er].forEach(function(el,ix){ fill(el); on(el,'input',function(){ outs[ix].textContent=(+this.value).toFixed(1); fill(this); buildQ2(); }); });
      function buildQ2(){
        var E=+ee.value,B=+eb.value,Bp=+ebp.value,r=+er.value;
        var right=E/(B*Bp*r), optsHtml='';
        var set=[right*0.5, right, right*2, right*0.25].sort(function(a,b){return a-b});
        var labels=['A','B','C','D'];
        for(var i=0;i<4;i++) optsHtml += '<button class="vs-opt" type="button" data-v="'+set[i].toFixed(4)+'">'+labels[i]+'. '+fmt(set[i])+'</button>';
        q('vsQ2Opts').innerHTML = optsHtml;
        q('vsQ2Fb').textContent = '';
        var btns=q('vsQ2Opts').querySelectorAll('.vs-opt');
        for(var j=0;j<btns.length;j++){
          on(btns[j],'click',function(){
            var chosen=parseFloat(this.getAttribute('data-v'));
            for(var k=0;k<btns.length;k++) btns[k].className='vs-opt';
            if(Math.abs(chosen-right)/right<0.01){ this.className='vs-opt correct'; fb('vsQ2Fb',true,'q/m=E/(B·B′·r)='+fmt(right)+'。'); }
            else{ this.className='vs-opt wrong'; fb('vsQ2Fb',false,'正确值约 '+fmt(right)+'，由 E/(B·B′·r) 求得。'); }
          });
        }
      }
      buildQ2();
    }

    return function cleanup(){
      if(disposed)return; disposed=true; running=false;
      loops.forEach(function(r){ try{global.cancelAnimationFrame(r.id)}catch(e){} });
      timers.forEach(function(id){ try{global.clearTimeout(id)}catch(e){} });
      listeners.forEach(function(x){ try{x.el.removeEventListener(x.type,x.fn)}catch(e){} });
      loops.length=0; timers.length=0; listeners.length=0;
      try{ container.innerHTML=''; }catch(e){}
    };
  }

  NS.modules['velocity-selector'] = { render:render };
})(window);
