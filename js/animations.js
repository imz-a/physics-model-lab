/* ============ animations.js — 粒子偏转 / LC 振荡 / RC 充放电（依赖 core.js） ============ */
(function(){
  'use strict';
  var P = window.PhyLab;
  if(!P || !P.core) return;
  function $(id){ return document.getElementById(id); }
  function active(id){ var e = $(id); return !!e && e.classList.contains('active'); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

  /* ---------- 统一动画管理 ---------- */
  var anims = [], paused = false;
  document.addEventListener('visibilitychange', function(){ paused = document.hidden; });
  window.addEventListener('pagehide', function(){ anims.length = 0; });
  function loop(fn){
    anims.push(fn);
    function frame(now){ fn(now); requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  }
  function ctx2d(cv, W, H){
    var ctx = cv.getContext('2d');
    ctx.setTransform(cv.width/W, 0, 0, cv.height/H, 0, 0);
    return ctx;
  }

  /* ================= 粒子偏转（马卡龙配色） ================= */
  (function particle(){
    var cv, ctx, last = 0, ph = 0;
    var x0 = 90, y0 = 120, L = 390, k = 50/Math.pow(390-90,2), xEnd = 470;
    function yAt(x){
      if(x <= L) return y0 + k*(x-x0)*(x-x0);
      return y0 + 50 + 2*k*(L-x0)*(x-L);
    }
    function draw(now){
      cv = cv || $('particleCv'); if(!cv) return;
      if(!last) last = now;
      var dt = Math.min(50, now-last); last = now;
      if(!paused && active('panel-extend')) ph += dt;
      if(!active('panel-extend')) return;
      ctx = ctx || ctx2d(cv, 520, 240);
      var u = (ph % 3200)/2400, x = x0 + Math.min(1,u)*(xEnd-x0), y = yAt(x);
      ctx.clearRect(0,0,520,240);

      /* 极板 */
      ctx.fillStyle = '#FFB3BA'; ctx.fillRect(90,52,300,9);
      ctx.fillStyle = '#BFE3F5'; ctx.fillRect(90,179,300,9);
      ctx.fillStyle = '#a35d65'; ctx.font = '11px sans-serif'; ctx.fillText('+  +  +  +  +',100,48);
      ctx.fillStyle = '#4e7f9e'; ctx.fillText('−  −  −  −  −',100,196);
      /* 电场线 */
      ctx.strokeStyle = 'rgba(127,179,213,.38)'; ctx.fillStyle = 'rgba(127,179,213,.6)'; ctx.lineWidth = 1;
      for(var gx=120; gx<=380; gx+=52){
        ctx.beginPath(); ctx.moveTo(gx,64); ctx.lineTo(gx,174); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx-3,170); ctx.lineTo(gx+3,170); ctx.lineTo(gx,177); ctx.closePath(); ctx.fill();
      }
      /* 完整轨迹（虚线） */
      ctx.setLineDash([4,5]); ctx.strokeStyle = 'rgba(176,155,214,.55)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x0,y0);
      for(var px=x0; px<=xEnd; px+=5) ctx.lineTo(px, yAt(px));
      ctx.stroke(); ctx.setLineDash([]);
      /* 已走轨迹 */
      ctx.strokeStyle = '#B39DDB'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(x0,y0);
      for(var qx=x0; qx<=x; qx+=4) ctx.lineTo(qx, yAt(qx));
      ctx.lineTo(x,y); ctx.stroke();
      /* 初速度 */
      ctx.strokeStyle = '#7fbf9f'; ctx.fillStyle = '#7fbf9f'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0-34,y0); ctx.lineTo(x0-4,y0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0-2,y0); ctx.lineTo(x0-11,y0-4); ctx.lineTo(x0-11,y0+4); ctx.closePath(); ctx.fill();
      ctx.font = 'italic 13px serif'; ctx.fillText('v₀',x0-34,y0-8);
      /* 粒子 */
      ctx.save(); ctx.shadowColor = '#F4978E'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#F4978E'; ctx.beginPath(); ctx.arc(x,y,5.5,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#5a6472'; ctx.font = '12px sans-serif'; ctx.fillText('q', x+9, y-8);
      /* 说明 */
      ctx.fillStyle = '#8b95a3'; ctx.font = '11px sans-serif';
      ctx.fillText('水平匀速 x=v₀t', 100, 228);
      ctx.fillText('竖直匀加速 y=½at²', 250, 228);
      ctx.fillStyle = '#5a6472'; ctx.fillText('F = qE', 396, 92);
    }
    loop(draw);
  })();

  /* ================= LC 振荡 ================= */
  (function lc(){
    var cv, ctx, last = 0, ph = 0;
    var x0 = 46, x1 = 506, cy = 110, A = 68;
    function qf(u){ return Math.cos(4*Math.PI*u); }
    function iff(u){ return -Math.sin(4*Math.PI*u); }
    function curve(fn, color, width){
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
      for(var x=x0; x<=x1; x+=2){
        var u = (x-x0)/(x1-x0), y = cy - A*fn(u);
        if(x===x0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    function draw(now){
      cv = cv || $('lcCv'); if(!cv) return;
      if(!last) last = now;
      var dt = Math.min(50, now-last); last = now;
      if(!paused && active('panel-extend')) ph += dt;
      if(!active('panel-extend')) return;
      ctx = ctx || ctx2d(cv, 520, 220);
      var u = (ph % 7000)/7000;
      ctx.clearRect(0,0,520,220);
      /* 网格 */
      ctx.strokeStyle = 'rgba(160,175,190,.18)'; ctx.lineWidth = 1;
      for(var i=0;i<=8;i++){ var gx=x0+(x1-x0)*i/8; ctx.beginPath(); ctx.moveTo(gx,28); ctx.lineTo(gx,192); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(138,148,160,.55)'; ctx.beginPath(); ctx.moveTo(x0,cy); ctx.lineTo(x1,cy); ctx.stroke();
      ctx.fillStyle = '#8b95a3'; ctx.font = '11px sans-serif';
      ctx.fillText('0',x0-4,cy+18); ctx.fillText('T',x0+(x1-x0)/2-3,cy+18); ctx.fillText('2T',x1-14,cy+18);
      ctx.fillText('t',x1+5,cy+4);
      /* 曲线：q 珊瑚粉，i 马卡龙蓝 */
      curve(qf, '#F4978E', 2.2);
      curve(iff, '#7FB3D5', 2.2);
      ctx.fillStyle = '#a35d65'; ctx.font = '10px sans-serif'; ctx.fillText('Q最大 · I=0', x0+6, 22);
      ctx.fillStyle = '#4e7f9e'; ctx.fillText('I最大 · Q=0', x0+(x1-x0)/16-16, 44);
      ctx.fillStyle = '#8b95a3'; ctx.fillText('电场能 ↔ 磁场能：每 T/2 转化一次', x0+190, 210);
      ctx.fillStyle = '#F4978E'; ctx.fillRect(x1-100,16,14,3); ctx.fillText('q(t)',x1-82,20);
      ctx.fillStyle = '#7FB3D5'; ctx.fillRect(x1-42,16,14,3); ctx.fillText('i(t)',x1-24,20);
      /* 游标 */
      var px = x0+(x1-x0)*u;
      ctx.strokeStyle = 'rgba(90,100,114,.45)'; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(px,28); ctx.lineTo(px,192); ctx.stroke(); ctx.setLineDash([]);
      [[qf,'#F4978E'],[iff,'#7FB3D5']].forEach(function(pair){
        var py = cy - A*pair[0](u);
        ctx.fillStyle = pair[1]; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill();
      });
      /* SVG 电路随相位变化 */
      var qv = qf(u), iv = iff(u);
      var n = clamp(Math.round(2 + 5*Math.abs(qv)), 2, 7);
      var signTop = qv >= 0 ? '+' : '−';
      var signBot = qv >= 0 ? '−' : '+';
      var top = '', bot = '';
      for(var j=0;j<n;j++){
        var sx = 40 + (j+0.5)*(20/n);
        top += '<text x="'+sx.toFixed(1)+'" y="65" fill="'+(qv>=0?'#a35d65':'#4e7f9e')+'" font-size="10" text-anchor="middle">'+signTop+'</text>';
        bot += '<text x="'+sx.toFixed(1)+'" y="99" fill="'+(qv>=0?'#4e7f9e':'#a35d65')+'" font-size="10" text-anchor="middle">'+signBot+'</text>';
      }
      $('lcChargeTop').innerHTML = top;
      $('lcChargeBottom').innerHTML = bot;
      $('lcGlow').setAttribute('opacity', (0.12+0.42*Math.abs(qv)).toFixed(2));
      $('arrR').style.display = iv >= 0 ? '' : 'none';
      $('arrL').style.display = iv < 0 ? '' : 'none';
    }
    loop(draw);
  })();

  /* ================= RC 充放电 ================= */
  var rc = (function(){
    var tau = 1.15, DURATION = 5*tau;
    var mode = 'charge', u = 0, u0 = 0, t = 0, playing = true;
    var cv, ctx, last = 0;
    var circles = [], pathEls = {}, pathLens = {};
    var NS = 'http://www.w3.org/2000/svg';

    function cache(){
      cv = $('rcCurve');
      pathEls.top = $('pathChargeTop');
      pathEls.bottom = $('pathChargeBottom');
      pathEls.discharge = $('pathDischarge');
      var group = $('rcParticles');
      for(var i=0;i<12;i++){
        var c = document.createElementNS(NS,'circle');
        c.setAttribute('r','5'); c.setAttribute('stroke','#ffffff'); c.setAttribute('stroke-width','1.1'); c.setAttribute('opacity','0');
        group.appendChild(c); circles.push(c);
      }
    }
    function measure(){
      ['top','bottom','discharge'].forEach(function(k){
        try{ pathLens[k] = pathEls[k].getTotalLength(); }catch(e){ pathLens[k] = 0; }
      });
    }
    function current(){ return mode === 'charge' ? (1-u) : -u; }

    function updateBlade(){
      var blade = $('swBlade');
      if(mode === 'charge'){
        blade.setAttribute('x2','142'); blade.setAttribute('y2','40');
        $('contactCharge').setAttribute('fill','#B8E8D0');
        $('contactDischarge').setAttribute('fill','#eef2f6');
        $('rcFlowLabel').textContent = '充电：电流从电源正极流向正极板';
        $('rcFlowLabel').setAttribute('fill','#3f8067');
        $('rcModeTag').textContent = '充电中';
      }else{
        blade.setAttribute('x2','200'); blade.setAttribute('y2','98');
        $('contactCharge').setAttribute('fill','#eef2f6');
        $('contactDischarge').setAttribute('fill','#FFB3BA');
        $('rcFlowLabel').textContent = '放电：电流反向，从正极板经电阻流向负极板';
        $('rcFlowLabel').setAttribute('fill','#a35d65');
        $('rcModeTag').textContent = '放电中';
      }
      $('btnCharge').classList.toggle('active', mode==='charge');
      $('btnDischarge').classList.toggle('active', mode==='discharge');
      $('btnCharge').setAttribute('aria-pressed', String(mode==='charge'));
      $('btnDischarge').setAttribute('aria-pressed', String(mode==='discharge'));
    }

    function setMode(m){
      if(m === mode) return;
      /* 若电容未带电直接点放电，先视作已充满，保证演示可见 */
      if(m === 'discharge' && u < 0.05) u = 1;
      u0 = u; t = 0; mode = m; playing = true;
      $('btnPlayRc').textContent = '⏸ 暂停';
      measure(); updateBlade();
    }
    function togglePlay(){
      playing = !playing;
      $('btnPlayRc').textContent = playing ? '⏸ 暂停' : '▶ 继续';
    }
    function reset(){
      mode = 'charge'; u = 0; u0 = 0; t = 0; playing = true;
      $('btnPlayRc').textContent = '⏸ 暂停';
      measure(); updateBlade();
    }

    function updateParticles(dt, i){
      var mag = Math.abs(i);
      var group = $('rcParticles');
      if(mag < 0.015 || !playing){ group.setAttribute('opacity','0'); return; }
      group.setAttribute('opacity', clamp(0.25+0.75*mag,0,1).toFixed(2));
      var speed = 0.22 + 0.55*mag;
      for(var j=0;j<circles.length;j++){
        var key, idx, count;
        if(mode === 'charge'){
          if(j < 6){ key='top'; idx=j; count=6; circles[j].setAttribute('fill','#F4978E'); }
          else{ key='bottom'; idx=j-6; count=6; circles[j].setAttribute('fill','#7FB3D5'); }
        }else{
          key='discharge'; idx=j; count=12; circles[j].setAttribute('fill', j<8?'#F4978E':'#7FB3D5');
        }
        var len = pathLens[key] || 0;
        if(!len) continue;
        var frac = (idx/count + speed*t) % 1;
        var pt = pathEls[key].getPointAtLength(frac*len);
        circles[j].setAttribute('cx', pt.x.toFixed(1));
        circles[j].setAttribute('cy', pt.y.toFixed(1));
      }
    }

    function updateCapCharges(){
      var n = Math.round(10*u), html = '';
      for(var j=0;j<n;j++){
        var x = 402 + (j+0.5)*(56/Math.max(n,1));
        html += '<text x="'+x.toFixed(1)+'" y="73" fill="#a35d65" font-size="10" text-anchor="middle">+</text>';
        html += '<text x="'+x.toFixed(1)+'" y="134" fill="#4e7f9e" font-size="10" text-anchor="middle">−</text>';
      }
      $('capCharges').innerHTML = html;
      $('stU').textContent = u.toFixed(2);
      $('stI').textContent = (iDisp>=0?'+':'') + iDisp.toFixed(2);
      $('stQ').textContent = String(n);
    }
    var iDisp = 1;

    function drawCurve(){
      if(!ctx) ctx = ctx2d(cv, 480, 145);
      var X0=38, X1=468, Y0=16, Y1=126, cy=71, A=46;
      ctx.clearRect(0,0,480,145);
      ctx.strokeStyle = 'rgba(160,175,190,.2)'; ctx.lineWidth = 1;
      [Y0,cy,Y1].forEach(function(y){ ctx.beginPath(); ctx.moveTo(X0,y); ctx.lineTo(X1,y); ctx.stroke(); });
      ctx.fillStyle = '#8b95a3'; ctx.font = '10px sans-serif';
      ctx.fillText('u',X0-14,Y0+4); ctx.fillText('0',X0-12,cy+4); ctx.fillText('i',X0-14,Y1+4);
      ctx.fillText('t',X1+3,cy+4);

      function uAt(tt){ return mode==='charge' ? 1-(1-u0)*Math.exp(-tt/tau) : u0*Math.exp(-tt/tau); }
      function iAt(tt){ return mode==='charge' ? (1-u0)*Math.exp(-tt/tau) : -u0*Math.exp(-tt/tau); }
      function plot(fn,color,width,limit){
        ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath();
        var end = Math.min(limit, DURATION);
        for(var tt=0; tt<=end+0.001; tt+=0.03){
          var x=X0+(tt/DURATION)*(X1-X0), y=cy-A*fn(tt);
          if(tt===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      plot(uAt,'rgba(244,151,142,.32)',1.6,DURATION);
      plot(iAt,'rgba(127,179,213,.32)',1.6,DURATION);
      plot(uAt,'#F4978E',2.4,Math.min(t,DURATION));
      plot(iAt,'#7FB3D5',2.4,Math.min(t,DURATION));
      var px = X0+(Math.min(t,DURATION)/DURATION)*(X1-X0);
      ctx.strokeStyle='rgba(90,100,114,.4)'; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(px,Y0); ctx.lineTo(px,Y1); ctx.stroke(); ctx.setLineDash([]);
      [[uAt,'#F4978E'],[iAt,'#7FB3D5']].forEach(function(pair){
        var y=cy-A*pair[0](Math.min(t,DURATION));
        ctx.fillStyle=pair[1]; ctx.beginPath(); ctx.arc(px,y,3.8,0,Math.PI*2); ctx.fill();
      });
    }

    function frame(now){
      if(!last) last = now;
      var dt = Math.min(0.05, (now-last)/1000); last = now;
      if(!active('panel-charge')) return;
      if(playing && !paused){
        t += dt;
        if(t > DURATION) t = DURATION;
        u = mode==='charge' ? 1-(1-u0)*Math.exp(-t/tau) : u0*Math.exp(-t/tau);
      }
      iDisp = current();
      updateParticles(dt, iDisp);
      updateCapCharges();
      drawCurve();
    }

    function init(){
      cache(); measure(); updateBlade();
      loop(frame);
    }
    return { init:init, setMode:setMode, togglePlay:togglePlay, reset:reset };
  })();

  function init(){
    if($('particleCv')) { /* 粒子模块已在 IIFE 中注册 loop */ }
    if($('rcCurve')) rc.init();
  }
  P.animations = { init:init, loop:loop, rc:rc };
})();
