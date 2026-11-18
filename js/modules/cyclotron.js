/* ============================================================
 * cyclotron.js — 回旋加速器（磁场）
 * 契约：IIFE + window.ModelLab.modules['cyclotron']，零依赖，file:// 可用。
 * 物理：T = 2πm/(qB)（与 v、r 无关）；交变电场周期须等于回旋周期；
 *   v_max = qBR/m，Ek_max = q²B²R²/(2m)，与加速电压 U 无关。
 * 常量 u=1.66×10⁻²⁷kg，e=1.6×10⁻¹⁹C。
 * 4 个子标签：0 基本模型 / 1 加速原理 / 2 周期匹配 / 3 高考题型
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = (global.ModelLab = global.ModelLab || {});
  NS.modules = NS.modules || {};

  var CSS_ID = 'lm-css-cyclotron';
  var CSS = [
    '.cy-wrap{--tint:#D0C4E8;--tint-soft:#F7F4FC;color:var(--ink);font-size:16px;}',
    '.cy-wrap *{box-sizing:border-box;}',
    '.cy-lead{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:16px;}',
    '.cy-lead p{max-width:790px;color:var(--ink-2);font-size:15px;line-height:1.7;}',
    '.cy-formula{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--tint);border-radius:999px;background:var(--tint-soft);font-size:17px;font-weight:700;white-space:nowrap;}',
    '.cy-formula small{font-weight:400;color:var(--ink-2);font-size:12px;}',
    '.cy-bar{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:16px;}',
    '.cy-ctrl{flex:1 1 175px;min-width:160px;}',
    '.cy-ctrl__top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px;}',
    '.cy-ctrl__top label{font-size:14px;color:var(--ink-2);font-weight:600;}',
    '.cy-ctrl__val{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.cy-ctrl__val em{font-style:normal;font-size:12px;color:var(--ink-3);font-weight:400;margin-left:2px;}',
    '.cy-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:99px;background:#eef2f6;outline:0;margin:4px 0;}',
    '.cy-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.cy-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.cy-btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
    '.cy-btn{min-height:40px;padding:8px 16px;border:1px solid var(--line-2);border-radius:999px;background:#fff;color:var(--ink-2);font-size:14px;font-weight:600;transition:background .15s,border-color .15s;white-space:nowrap;}',
    '.cy-btn:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.cy-btn.is-active{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);box-shadow:inset 0 0 0 1px var(--tint);}',
    '.cy-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}',
    '.cy-card{background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);padding:16px 18px;min-width:0;}',
    '.cy-card--wide{grid-column:1/-1;}',
    '.cy-card h4{font-size:16px;font-weight:700;margin-bottom:4px;}',
    '.cy-card__hint{font-size:13px;color:var(--ink-3);margin-bottom:12px;}',
    '.cy-cv{width:100%;display:block;border-radius:10px;background:#fff;}',
    '.cy-readouts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;}',
    '.cy-ro{padding:14px 16px;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;text-align:center;}',
    '.cy-ro span{display:block;font-size:13px;color:var(--ink-3);}',
    '.cy-ro b{display:block;margin-top:4px;font-size:23px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.cy-ro small{font-size:12px;color:var(--ink-3);font-weight:400;}',
    '.cy-status{margin-top:14px;padding:12px 16px;border-radius:10px;font-size:15px;font-weight:600;}',
    '.cy-status--ok{background:#eefaf3;border:1px solid #cceede;color:#3f8c68;}',
    '.cy-status--no{background:#fff4f5;border:1px solid #ffd6da;color:#c1616c;}',
    '.cy-note{margin-top:14px;padding:12px 16px;border-left:4px solid var(--tint);background:var(--tint-soft);border-radius:0 10px 10px 0;font-size:14px;color:var(--ink-2);}',
    '.cy-note b{color:var(--ink);}',
    '.cy-ladder{display:flex;align-items:flex-end;gap:6px;height:110px;padding:10px 14px;border:1px solid var(--line-2);border-radius:12px;background:var(--surface-soft);}',
    '.cy-ladder i{flex:1;background:linear-gradient(180deg,#d0c4e8,#e8def3);border-radius:4px 4px 0 0;min-height:4px;}',
    '.cy-q{padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:14px;}',
    '.cy-q__t{font-size:16px;font-weight:700;line-height:1.6;}',
    '.cy-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;}',
    '.cy-opt{min-height:46px;padding:10px 14px;text-align:left;border:1px solid var(--line-2);border-radius:10px;background:#fff;font-size:15px;color:var(--ink-2);transition:background .15s,border-color .15s;}',
    '.cy-opt:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.cy-opt.is-right{background:#eefaf3;border-color:#a8e0c4;color:#2f8a5f;font-weight:700;}',
    '.cy-opt.is-wrong{background:#fff3f4;border-color:#ffc9cf;color:#c1616c;}',
    '.cy-explain{margin-top:12px;padding:12px 14px;background:#f7fafc;border-radius:10px;font-size:14px;color:var(--ink-2);line-height:1.7;}',
    '@media(max-width:1100px){.cy-grid{grid-template-columns:1fr;}.cy-readouts{grid-template-columns:repeat(2,1fr);}}',
    '@media(max-width:760px){.cy-opts{grid-template-columns:1fr;}}'
  ].join('\n');

  function ensureCss(doc) {
    if (doc.getElementById(CSS_ID)) return;
    var s = doc.createElement('style'); s.id = CSS_ID; s.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(s);
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i]; if (!src) continue;
      for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
    }
    return target;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function fmt(v, n) { return Number(v).toFixed(n === undefined ? 2 : n); }
  var U_ATOMIC = 1.66e-27, E_CHARGE = 1.6e-19;
  function particleOf(type) {
    return type === 'p' ? { name: '质子', m: U_ATOMIC, q: E_CHARGE } : { name: 'α粒子', m: 4 * U_ATOMIC, q: 2 * E_CHARGE };
  }
  function period(st) { var p = particleOf(st.ptype); return 2 * Math.PI * p.m / (p.q * st.B); }
  function freq(st) { return 1 / period(st); }
  function vmax(st) { var p = particleOf(st.ptype); return p.q * st.B * st.R / p.m; }
  function ekmax(st) { var p = particleOf(st.ptype); return p.q * p.q * st.B * st.B * st.R * st.R / (2 * p.m); }
  function ctrlHtml(key, label, min, max, step, val, unit) {
    return '<div class="cy-ctrl"><div class="cy-ctrl__top"><label for="cyS' + key + '">' + label + '</label>' +
      '<span class="cy-ctrl__val" data-val="' + key + '">' + fmt(val, step < 1 ? 2 : 0) + '<em>' + unit + '</em></span></div>' +
      '<input id="cyS' + key + '" class="cy-range" type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
  }
  function roHtml(key, label, val) {
    return '<div class="cy-ro"><span>' + label + '</span><b data-ro="' + key + '">' + val + '</b></div>';
  }
  function bindCtrls(ctx, st, keys, onChange) {
    keys.forEach(function (key) {
      var el = ctx.container.querySelector('[data-key="' + key + '"]');
      if (!el) return;
      ctx.on(el, 'input', function () {
        st[key] = parseFloat(el.value);
        var e = ctx.container.querySelector('[data-val="' + key + '"]');
        if (e) e.innerHTML = fmt(st[key], key === 'B' || key === 'R' || key === 'f' ? 2 : 0) + '<em>' + (key === 'B' ? 'T' : key === 'R' ? 'm' : key === 'U' ? 'kV' : key === 'f' ? 'MHz' : '') + '</em>';
        if (onChange) onChange(key);
      });
    });
  }
  function particleBtns(st) {
    return '<div class="cy-btnrow"><button type="button" class="cy-btn' + (st.ptype === 'p' ? ' is-active' : '') + '" data-ptype="p">质子 p</button>' +
      '<button type="button" class="cy-btn' + (st.ptype === 'a' ? ' is-active' : '') + '" data-ptype="a">α 粒子</button></div>';
  }
  function bindParticle(ctx, st, onChange) {
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-ptype]'), function (b) {
      ctx.on(b, 'click', function () {
        st.ptype = b.getAttribute('data-ptype');
        Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-ptype]'), function (x) { x.classList.toggle('is-active', x === b); });
        if (onChange) onChange('ptype');
      });
    });
  }

  NS.modules['cyclotron'] = {
    render: function (container, extIndex) {
      var doc = container.ownerDocument;
      var win = doc.defaultView || global;
      ensureCss(doc);
      var disposed = false;
      var ac = win.AbortController ? new win.AbortController() : null;
      var rafId = 0, tickFn = null, lastT = 0, timers = [];
      function on(target, type, fn, opts) {
        target.addEventListener(type, fn, assign({ signal: ac ? ac.signal : undefined }, opts || {}));
      }
      function loop(fn) { tickFn = fn; if (!rafId) rafId = win.requestAnimationFrame(frame); }
      function frame(t) {
        if (disposed) return;
        var dt = lastT ? Math.min(60, t - lastT) : 16; lastT = t;
        if (tickFn) tickFn(t, dt);
        rafId = win.requestAnimationFrame(frame);
      }
      function later(fn, ms) { var id = win.setTimeout(function () { if (!disposed) fn(); }, ms); timers.push(id); return id; }
      function fit(cv, cssH) {
        var dpr = Math.min(win.devicePixelRatio || 1, 2);
        var w = cv.clientWidth || 460, h = cssH || cv.clientHeight || 260;
        cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
        var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { c: c, w: w, h: h };
      }
      var ctx = { container: container, doc: doc, win: win, on: on, loop: loop, later: later, fit: fit };
      var views = [viewBasic, viewPrinciple, viewMatch, viewExam];
      (views[extIndex] || viewBasic)(ctx);
      return function cleanup() {
        disposed = true;
        if (rafId) win.cancelAnimationFrame(rafId);
        rafId = 0; tickFn = null;
        for (var i = 0; i < timers.length; i++) win.clearTimeout(timers[i]);
        if (ac) ac.abort();
        container.innerHTML = '';
      };
    }
  };

  // 画 D 形盒与螺旋轨道
  function drawCyclotron(lay, st, t, opts) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2, Rpx = Math.min(w * 0.34, h * 0.44);
    // 两个 D 形盒
    c.fillStyle = '#f7f4fc'; c.strokeStyle = '#cdbfe2'; c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, Rpx, -Math.PI / 2, Math.PI / 2); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.arc(cx, cy, Rpx, Math.PI / 2, Math.PI * 1.5); c.closePath(); c.fill(); c.stroke();
    // 缝隙
    c.fillStyle = '#eef1f5'; c.fillRect(cx - 5, cy - Rpx, 10, 2 * Rpx);
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('D₁', cx - Rpx * 0.6, cy - 12); c.fillText('D₂', cx + Rpx * 0.45, cy - 12);
    c.fillText('交变电场缝隙', cx + 10, cy + Rpx + 16);
    // 磁场符号
    c.strokeStyle = '#d8cbe8';
    for (var mx = cx - Rpx + 22; mx < cx + Rpx; mx += 36) {
      for (var my = cy - Rpx + 24; my < cy + Rpx; my += 36) {
        if (Math.hypot(mx - cx, my - cy) > Rpx - 14) continue;
        c.beginPath(); c.arc(mx, my, 4, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(mx - 2.5, my - 2.5); c.lineTo(mx + 2.5, my + 2.5); c.moveTo(mx + 2.5, my - 2.5); c.lineTo(mx - 2.5, my + 2.5); c.stroke();
      }
    }
    c.fillStyle = '#8b6fb5'; c.font = '12px sans-serif'; c.fillText('B ⊗', 14, 20);
    // 螺旋轨道：半径 ∝ √n
    var N = 9, pts = [];
    for (var n = 1; n <= N; n++) {
      var rr = Rpx * 0.10 + Rpx * 0.86 * Math.sqrt(n / N);
      var start = (n % 2 === 1) ? -Math.PI / 2 : Math.PI / 2;
      var end = (n % 2 === 1) ? Math.PI / 2 : Math.PI * 1.5;
      for (var a = 0; a <= 24; a++) {
        var ang = start + (end - start) * a / 24;
        pts.push({ x: cx + rr * Math.cos(ang), y: cy + rr * Math.sin(ang), n: n });
      }
    }
    c.strokeStyle = '#b9a0dc'; c.lineWidth = 2; c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.stroke();
    // 缝隙处加速闪光
    if (opts && opts.animate) {
      var flash = (t * 0.0012) % 1;
      c.fillStyle = 'rgba(240,192,138,' + (0.35 + 0.35 * Math.abs(Math.sin(t * 0.006))) + ')';
      c.fillRect(cx - 7, cy - 9, 14, 18);
    }
    // 运动粒子
    if (opts && opts.animate) {
      var ph = (t * 0.00022) % 1;
      var idx = Math.floor(ph * (pts.length - 1));
      var p = pts[idx];
      c.beginPath(); c.arc(p.x, p.y, 5.5, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
      c.strokeStyle = '#8b6fb5'; c.lineWidth = 2.5; c.stroke();
    }
    c.fillStyle = '#7c63a8'; c.font = 'bold 12px sans-serif';
    c.fillText(particleOf(st.ptype).name + ' · R=' + fmt(st.R, 2) + 'm', 14, h - 12);
  }

  /* ---------------- 0 基本模型 ---------------- */
  function viewBasic(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { B: 1.0, R: 0.5, U: 10, ptype: 'p' };
    ctx.container.innerHTML =
      '<div class="cy-wrap">' +
        '<div class="cy-lead"><p>粒子在 D 形盒内被磁场偏转做半圆运动，每次经过缝隙都被交变电场加速，轨道半径逐级增大，形成螺旋。调节 B、R、U 并切换粒子，观察最大动能如何变化。</p>' +
          '<span class="cy-formula">Ek_max = q²B²R²/(2m) <small>与加速电压 U 无关</small></span></div>' +
        '<div class="cy-bar">' +
          ctrlHtml('B', '磁感应强度 B', 0.2, 2, 0.05, 1.0, 'T') +
          ctrlHtml('R', 'D形盒半径 R', 0.2, 1, 0.05, 0.5, 'm') +
          ctrlHtml('U', '加速电压 U', 2, 50, 1, 10, 'kV') +
          particleBtns(st) +
        '</div>' +
        '<section class="cy-card cy-card--wide"><h4>回旋加速器螺旋加速</h4><div class="cy-card__hint">紫色螺旋为粒子轨道；缝隙处的暖色闪烁表示每次加速</div>' +
          '<canvas id="cyScene" class="cy-cv" style="height:360px" aria-label="回旋加速器动画"></canvas></section>' +
        '<div class="cy-readouts">' +
          roHtml('T', '回旋周期 T', '—') + roHtml('f', '交变频率 f', '—') +
          roHtml('vmax', '最大速度', '—') + roHtml('ek', '最大动能', '—') +
        '</div>' +
        '<div class="cy-note"><b>注意：</b>增大加速电压 U 只会减少加速次数、缩短加速时间，<b>不能</b>提高最大动能；最大动能由 B 和 R 决定（粒子种类固定时）。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#cyScene'), 360);
    function update() {
      $('[data-ro="T"]').innerHTML = fmt(period(st) * 1e8, 1) + ' <small>×10⁻⁸s</small>';
      $('[data-ro="f"]').innerHTML = fmt(freq(st) / 1e6, 2) + ' <small>MHz</small>';
      $('[data-ro="vmax"]').innerHTML = fmt(vmax(st) / 1e7, 2) + ' <small>×10⁷m/s</small>';
      $('[data-ro="ek"]').innerHTML = fmt(ekmax(st) / 1.6e-13, 2) + ' <small>MeV</small>';
    }
    bindCtrls(ctx, st, ['B', 'R', 'U'], update);
    bindParticle(ctx, st, update);
    on(win, 'resize', function () { lay = fit($('#cyScene'), 360); });
    ctx.loop(function (t) { drawCyclotron(lay, st, t, { animate: true }); });
    update();
  }

  /* ---------------- 1 加速原理 ---------------- */
  function viewPrinciple(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { B: 1.0, R: 0.5, U: 10, ptype: 'p' };
    ctx.container.innerHTML =
      '<div class="cy-wrap">' +
        '<div class="cy-lead"><p>每经过一次缝隙，电场力做功 <b>qU</b>，动能增加；进入 D 盒后磁场只改变方向、不做功。于是速度一次次增大，半径 r = mv/(qB) 也随之增大。</p></div>' +
        '<div class="cy-bar">' +
          ctrlHtml('U', '每次加速电压 U', 2, 50, 1, 10, 'kV') +
          ctrlHtml('B', '磁感应强度 B', 0.2, 2, 0.05, 1.0, 'T') +
          particleBtns(st) +
        '</div>' +
        '<div class="cy-grid">' +
          '<section class="cy-card"><h4>轨道与能量阶梯</h4><div class="cy-card__hint">柱高表示每次加速后的动能（逐级增加 √n 的半径）</div>' +
            '<canvas id="cyPrin" class="cy-cv" style="height:280px" aria-label="加速原理轨道"></canvas>' +
            '<div class="cy-ladder" data-ladder style="margin-top:12px"></div>' +
          '</section>' +
          '<section class="cy-card"><h4>两种场的分工</h4><div class="cy-card__hint">电场加速、磁场偏转，各司其职</div>' +
            '<div class="cy-note" style="margin-top:0"><b>缝隙中的电场：</b>方向周期性反转，保证粒子每次穿过都被加速；每次做功 W = qU。<br><br>' +
            '<b>D 盒内的磁场：</b>洛伦兹力始终垂直于速度，只改变运动方向，不改变速率、不做功。<br><br>' +
            '<b>结果：</b>加速 n 次后 Ek = nqU，直到半径达到 D 盒边缘 R。</div>' +
            '<div class="cy-formula" style="margin-top:16px">n ≈ Ek_max/(qU) = <span data-n>—</span> 次</div>' +
          '</section>' +
        '</div>' +
        '<div class="cy-note"><b>结论：</b>U 越大，达到最大动能所需的加速次数 n 越少（加速更快），但最大动能 Ek_max 不变。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#cyPrin'), 280);
    function update() {
      var p = particleOf(st.ptype);
      var n = ekmax(st) / (p.q * st.U * 1000);
      $('[data-n]').textContent = fmt(n, 0);
      var lad = $('[data-ladder]');
      var html = '';
      for (var i = 1; i <= 10; i++) html += '<i style="height:' + Math.round(10 + 82 * i / 10) + '%"></i>';
      lad.innerHTML = html;
    }
    bindCtrls(ctx, st, ['U', 'B'], update);
    bindParticle(ctx, st, update);
    on(win, 'resize', function () { lay = fit($('#cyPrin'), 280); });
    ctx.loop(function (t) { drawCyclotron(lay, st, t, { animate: true }); });
    update();
  }

  /* ---------------- 2 周期匹配 ---------------- */
  function viewMatch(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { B: 1.0, R: 0.5, U: 10, ptype: 'p', f: null };
    ctx.container.innerHTML =
      '<div class="cy-wrap">' +
        '<div class="cy-lead"><p>回旋周期 <b>T = 2πm/(qB)</b> 与速度、半径<b>无关</b>——这是回旋加速器能工作的关键。交变电场频率必须等于回旋频率 f = qB/(2πm)，否则粒子到达缝隙时电场方向不对，无法继续加速。</p></div>' +
        '<div class="cy-bar">' +
          ctrlHtml('B', '磁感应强度 B', 0.2, 2, 0.05, 1.0, 'T') +
          '<div class="cy-ctrl"><div class="cy-ctrl__top"><label>交变电场频率 f</label><span class="cy-ctrl__val" data-val="f">—</span></div>' +
            '<input class="cy-range" type="range" data-key="f" min="2" max="30" step="0.1" value="15" aria-label="交变频率"></div>' +
          '<div class="cy-btnrow"><button type="button" class="cy-btn is-active" data-act="auto">自动匹配</button>' +
          '<button type="button" class="cy-btn" data-act="manual">手动调节</button></div>' +
          particleBtns(st) +
        '</div>' +
        '<div class="cy-grid">' +
          '<section class="cy-card"><h4>T – v 关系（水平线）</h4><div class="cy-card__hint">周期与速度无关；切换粒子或改变 B 只会整体上下平移</div>' +
            '<canvas id="cyTV" class="cy-cv" style="height:290px" aria-label="周期速度关系"></canvas></section>' +
          '<section class="cy-card"><h4>频率匹配判定</h4><div class="cy-card__hint">f 与回旋频率一致才能同步加速</div>' +
            '<div class="cy-note" style="margin-top:0"><b>回旋频率：</b>f₀ = qB/(2πm) = <span data-f0>—</span> MHz<br><br>' +
            '<b>设定频率：</b>f = <span data-fset>—</span> MHz<br><br>' +
            '<b>粒子：</b><span data-pt>—</span></div>' +
            '<div class="cy-status" data-status style="margin-top:16px"></div>' +
          '</section>' +
        '</div>' +
        '<div class="cy-note"><b>为什么 T 与 v 无关：</b>r ∝ v，而周长 2πr 也 ∝ v，两者之比 T = 2πr/v = 2πm/(qB) 与 v 约去。因此粒子每转半圈用时恒为 T/2，交变电场只要以固定周期反转即可。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#cyTV'), 290);
    var auto = true;
    function update() {
      var f0 = freq(st) / 1e6;
      if (auto) { st.f = f0; ctx.container.querySelector('[data-key="f"]').value = clamp(f0, 2, 30); }
      $('[data-val="f"]').innerHTML = fmt(st.f, 2) + '<em>MHz</em>';
      $('[data-f0]').textContent = fmt(f0, 2);
      $('[data-fset]').textContent = fmt(st.f, 2);
      $('[data-pt]').textContent = particleOf(st.ptype).name;
      var ok = Math.abs(st.f - f0) < 0.12;
      var s = $('[data-status]');
      s.className = 'cy-status ' + (ok ? 'cy-status--ok' : 'cy-status--no');
      s.textContent = ok ? '✓ 频率匹配：每次到达缝隙都被加速，粒子正常螺旋前进。'
        : '✕ 频率失配：粒子到达缝隙时电场方向不对，无法持续加速（会被减速或卡住）。';
    }
    bindCtrls(ctx, st, ['B'], function () { if (auto) update(); else update(); });
    on(ctx.container.querySelector('[data-key="f"]'), 'input', function () { auto = false; st.f = parseFloat(this.value); update(); });
    on($('[data-act="auto"]'), 'click', function () {
      auto = true; this.classList.add('is-active'); $('[data-act="manual"]').classList.remove('is-active'); update();
    });
    on($('[data-act="manual"]'), 'click', function () {
      auto = false; this.classList.add('is-active'); $('[data-act="auto"]').classList.remove('is-active');
    });
    bindParticle(ctx, st, update);
    on(win, 'resize', function () { lay = fit($('#cyTV'), 290); });
    ctx.loop(function () { drawTV(lay, st); });
    update();
  }
  function drawTV(lay, st) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 52, R = w - 18, Tp = 20, B = h - 38;
    var vMax = 3e7, tMax = period(st) * 1.35;
    function X(v) { return L + v / vMax * (R - L); }
    function Y(T) { return B - T / tMax * (B - Tp); }
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
    for (var g = 1; g <= 4; g++) {
      c.beginPath(); c.moveTo(X(vMax * g / 5), Tp); c.lineTo(X(vMax * g / 5), B); c.stroke();
      c.beginPath(); c.moveTo(L, Y(tMax * g / 5)); c.lineTo(R, Y(tMax * g / 5)); c.stroke();
    }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('T', 12, Tp + 6); c.fillText('v /(×10⁷m/s)', R - 104, B + 22);
    c.strokeStyle = '#9b86c4'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(X(0), Y(period(st))); c.lineTo(X(vMax), Y(period(st))); c.stroke();
    c.fillStyle = '#7c63a8'; c.font = 'bold 13px sans-serif';
    c.fillText('T = ' + fmt(period(st) * 1e8, 1) + '×10⁻⁸s（与 v 无关）', L + 12, Math.max(Y(period(st)) - 12, Tp + 16));
  }

  /* ---------------- 3 高考题型 ---------------- */
  function viewExam(ctx) {
    var on = ctx.on;
    var st = { B: 1.0, R: 0.5, U: 10, ptype: 'p' };
    ctx.container.innerHTML =
      '<div class="cy-wrap">' +
        '<div class="cy-lead"><p>点击选项即时判定并查看解析。第 1 题考查加速电压与最大动能的关系；第 2 题可调 B、R、粒子实时算交变频率。</p></div>' +
        '<div class="cy-q">' +
          '<div class="cy-q__t">1．（概念）质子在回旋加速器中，若只把加速电压 U 增大为原来的 2 倍，最大动能将如何变化？</div>' +
          '<div class="cy-opts" data-q="1">' +
            '<button type="button" class="cy-opt" data-ans="A">A．变为 2 倍</button>' +
            '<button type="button" class="cy-opt" data-ans="B">B．不变</button>' +
            '<button type="button" class="cy-opt" data-ans="C">C．变为 4 倍</button>' +
            '<button type="button" class="cy-opt" data-ans="D">D．变为一半</button>' +
          '</div><div class="cy-explain" data-exp="1" hidden></div>' +
        '</div>' +
        '<div class="cy-q">' +
          '<div class="cy-q__t">2．（计算）质子（m=1.67×10⁻²⁷kg，q=1.6×10⁻¹⁹C）在 B=1 T 的磁场中回旋，交变电场频率应调为多少？</div>' +
          '<div class="cy-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            ctrlHtml('B', '磁场 B', 0.2, 2, 0.05, 1.0, 'T') +
            ctrlHtml('R', 'D形盒半径 R', 0.2, 1, 0.05, 0.5, 'm') +
            particleBtns(st) +
            '<div class="cy-formula" style="font-size:15px">f = qB/(2πm) = <span data-f>—</span> MHz</div>' +
          '</div>' +
          '<div class="cy-opts" data-q="2">' +
            '<button type="button" class="cy-opt" data-ans="A">A．约 15 MHz</button>' +
            '<button type="button" class="cy-opt" data-ans="B">B．约 30 MHz</button>' +
            '<button type="button" class="cy-opt" data-ans="C">C．约 7.5 MHz</button>' +
            '<button type="button" class="cy-opt" data-ans="D">D．约 1.6 MHz</button>' +
          '</div><div class="cy-explain" data-exp="2" hidden></div>' +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var exp = {
      '1': { right: 'B', text: '最大动能 Ek_max = q²B²R²/(2m)，只由 B、R 和粒子决定，与加速电压 U 无关。增大 U 只会减少加速次数、缩短达到最大动能的时间。' },
      '2': { right: 'A', text: 'f = qB/(2πm) = 1.6×10⁻¹×1 / (2π×1.67×10⁻²⁷) ≈ 1.53×10⁷ Hz ≈ 15 MHz。拖动 B 可见频率与 B 成正比。' }
    };
    function update() {
      $('[data-f]').textContent = fmt(freq(st) / 1e6, 2);
      $('[data-val="B"]').innerHTML = fmt(st.B, 2) + '<em>T</em>';
      $('[data-val="R"]').innerHTML = fmt(st.R, 2) + '<em>m</em>';
    }
    bindCtrls(ctx, st, ['B', 'R'], update);
    bindParticle(ctx, st, update); update();
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-q]'), function (box) {
      var q = box.getAttribute('data-q');
      Array.prototype.forEach.call(box.querySelectorAll('.cy-opt'), function (b) {
        on(b, 'click', function () {
          var ans = b.getAttribute('data-ans');
          Array.prototype.forEach.call(box.querySelectorAll('.cy-opt'), function (x) {
            x.classList.remove('is-right', 'is-wrong');
            if (x === b) x.classList.add(ans === exp[q].right ? 'is-right' : 'is-wrong');
          });
          var e = $('[data-exp="' + q + '"]'); e.hidden = false;
          e.innerHTML = (ans === exp[q].right ? '✅ 正确！' : '❌ 再想想。') + ' ' + exp[q].text;
        });
      });
    });
  }
})(window);
