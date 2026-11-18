/* ============================================================
 * mass-spectrometer.js — 质谱仪（磁场）
 * 契约：IIFE + window.ModelLab.modules['mass-spectrometer']，零依赖，file:// 可用。
 * 物理：qU = ½mv² ⇒ v=√(2qU/m)；r = mv/(qB) ⇒ q/m = 2U/(B²r²)。
 *   常量 u=1.66×10⁻²⁷ kg，e=1.6×10⁻¹⁹ C；A 为质量数，z 为电荷数。
 * 4 个子标签：0 基本模型 / 1 比荷测定 / 2 图像分析 / 3 高考题型
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = (global.ModelLab = global.ModelLab || {});
  NS.modules = NS.modules || {};

  var CSS_ID = 'lm-css-mass-spectrometer';
  var CSS = [
    '.ms-wrap{--tint:#B8E8D0;--tint-soft:#F1FBF6;color:var(--ink);font-size:16px;}',
    '.ms-wrap *{box-sizing:border-box;}',
    '.ms-lead{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:16px;}',
    '.ms-lead p{max-width:790px;color:var(--ink-2);font-size:15px;line-height:1.7;}',
    '.ms-formula{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--tint);border-radius:999px;background:var(--tint-soft);font-size:17px;font-weight:700;white-space:nowrap;}',
    '.ms-formula small{font-weight:400;color:var(--ink-2);font-size:12px;}',
    '.ms-bar{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:16px;}',
    '.ms-ctrl{flex:1 1 175px;min-width:160px;}',
    '.ms-ctrl__top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px;}',
    '.ms-ctrl__top label{font-size:14px;color:var(--ink-2);font-weight:600;}',
    '.ms-ctrl__val{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.ms-ctrl__val em{font-style:normal;font-size:12px;color:var(--ink-3);font-weight:400;margin-left:2px;}',
    '.ms-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:99px;background:#eef2f6;outline:0;margin:4px 0;}',
    '.ms-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.ms-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.ms-btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
    '.ms-btn{min-height:40px;padding:8px 16px;border:1px solid var(--line-2);border-radius:999px;background:#fff;color:var(--ink-2);font-size:14px;font-weight:600;transition:background .15s,border-color .15s;white-space:nowrap;}',
    '.ms-btn:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.ms-btn.is-active{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);box-shadow:inset 0 0 0 1px var(--tint);}',
    '.ms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}',
    '.ms-card{background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);padding:16px 18px;min-width:0;}',
    '.ms-card--wide{grid-column:1/-1;}',
    '.ms-card h4{font-size:16px;font-weight:700;margin-bottom:4px;}',
    '.ms-card__hint{font-size:13px;color:var(--ink-3);margin-bottom:12px;}',
    '.ms-cv{width:100%;display:block;border-radius:10px;background:#fff;}',
    '.ms-readouts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;}',
    '.ms-ro{padding:14px 16px;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;text-align:center;}',
    '.ms-ro span{display:block;font-size:13px;color:var(--ink-3);}',
    '.ms-ro b{display:block;margin-top:4px;font-size:23px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.ms-ro small{font-size:12px;color:var(--ink-3);font-weight:400;}',
    '.ms-note{margin-top:14px;padding:12px 16px;border-left:4px solid var(--tint);background:var(--tint-soft);border-radius:0 10px 10px 0;font-size:14px;color:var(--ink-2);}',
    '.ms-note b{color:var(--ink);}',
    '.ms-derive{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;padding:16px;border:1px dashed var(--tint);border-radius:12px;background:var(--tint-soft);font-size:17px;margin:12px 0;}',
    '.ms-derive span{white-space:nowrap;}',
    '.ms-q{padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:14px;}',
    '.ms-q__t{font-size:16px;font-weight:700;line-height:1.6;}',
    '.ms-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;}',
    '.ms-opt{min-height:46px;padding:10px 14px;text-align:left;border:1px solid var(--line-2);border-radius:10px;background:#fff;font-size:15px;color:var(--ink-2);transition:background .15s,border-color .15s;}',
    '.ms-opt:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.ms-opt.is-right{background:#eefaf3;border-color:#a8e0c4;color:#2f8a5f;font-weight:700;}',
    '.ms-opt.is-wrong{background:#fff3f4;border-color:#ffc9cf;color:#c1616c;}',
    '.ms-explain{margin-top:12px;padding:12px 14px;background:#f7fafc;border-radius:10px;font-size:14px;color:var(--ink-2);line-height:1.7;}',
    '@media(max-width:1100px){.ms-grid{grid-template-columns:1fr;}.ms-readouts{grid-template-columns:repeat(2,1fr);}}',
    '@media(max-width:760px){.ms-opts{grid-template-columns:1fr;}}'
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
  function calc(st) {
    var m = st.A * U_ATOMIC, q = st.z * E_CHARGE, U = st.U * 1000;
    var v = Math.sqrt(2 * q * U / m);
    var r = m * v / (q * st.B);
    return { v: v, r: r, qm: q / m };
  }
  function ctrlHtml(key, label, min, max, step, val, unit) {
    return '<div class="ms-ctrl"><div class="ms-ctrl__top"><label for="msS' + key + '">' + label + '</label>' +
      '<span class="ms-ctrl__val" data-val="' + key + '">' + fmt(val, step < 1 ? 1 : 0) + '<em>' + unit + '</em></span></div>' +
      '<input id="msS' + key + '" class="ms-range" type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
  }
  function roHtml(key, label, val) {
    return '<div class="ms-ro"><span>' + label + '</span><b data-ro="' + key + '">' + val + '</b></div>';
  }
  function bindCtrls(ctx, st, keys, onChange) {
    keys.forEach(function (key) {
      var el = ctx.container.querySelector('[data-key="' + key + '"]');
      if (!el) return;
      ctx.on(el, 'input', function () {
        st[key] = parseFloat(el.value);
        var e = ctx.container.querySelector('[data-val="' + key + '"]');
        if (e) e.innerHTML = fmt(st[key], key === 'B' ? 2 : key === 'U' ? 0 : 0) + '<em>' + (key === 'U' ? 'kV' : key === 'B' ? 'T' : key === 'A' ? '' : 'e') + '</em>';
        if (onChange) onChange(key);
      });
    });
  }

  NS.modules['mass-spectrometer'] = {
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
      var views = [viewBasic, viewRatio, viewGraph, viewExam];
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

  // 画质谱仪装置：离子源→加速→磁场半圆→回到入射侧底片（落点距入射点 2r）
  function drawMS(lay, st, t, opts) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var srcX = 46, accX = w * 0.22, entryX = w * 0.44, magRight = w - 26;
    var mid = h * 0.80;
    // 加速电场两板
    c.fillStyle = '#d5eadf'; c.fillRect(accX - 16, mid - 46, 9, 92); c.fillRect(accX + 18, mid - 46, 9, 92);
    c.fillStyle = '#4c9a77'; c.font = '13px sans-serif';
    c.fillText('+', accX - 26, mid - 52); c.fillText('−', accX + 26, mid - 52);
    c.fillText('加速 U', accX - 34, mid - 30);
    // 磁场区域（入射边界 entryX 右侧）
    c.fillStyle = '#f6f2fb'; c.fillRect(entryX, 18, magRight - entryX, h - 36);
    c.strokeStyle = '#d9cae8'; c.lineWidth = 1;
    c.strokeRect(entryX, 18, magRight - entryX, h - 36);
    c.fillStyle = '#b9a7d8';
    for (var mx = entryX + 24; mx < magRight - 14; mx += 40) {
      for (var my = 38; my < h - 24; my += 38) {
        c.beginPath(); c.arc(mx, my, 4.5, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(mx - 2.5, my - 2.5); c.lineTo(mx + 2.5, my + 2.5); c.moveTo(mx + 2.5, my - 2.5); c.lineTo(mx - 2.5, my + 2.5); c.stroke();
      }
    }
    c.fillStyle = '#8b6fb5'; c.font = '12px sans-serif'; c.fillText('偏转磁场 B ⊗', entryX + 12, 14);
    // 底片（位于入射边界左侧，离子做半圆后回到此处）
    c.fillStyle = '#cbd6e2'; c.fillRect(entryX - 18, 22, 9, mid - 22);
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif'; c.fillText('底片', entryX - 24, 16);
    // 离子源 + 入射直线
    c.beginPath(); c.arc(srcX, mid, 8, 0, Math.PI * 2); c.fillStyle = '#f0c08a'; c.fill();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif'; c.fillText('离子源', srcX - 20, mid + 24);
    c.strokeStyle = '#e8b884'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(srcX + 8, mid); c.lineTo(entryX, mid); c.stroke();
    // 半圆轨道：圆心在入射点正上方 rpx，轨道向右弯回入射边界
    var res = calc(st);
    var rMax = calc({ A: 238, z: 1, U: st.U, B: st.B }).r;
    var maxRpx = Math.min((mid - 44) / 2, magRight - entryX - 20);
    function pxOf(r) { return clamp(20 + r / (rMax || 1) * (maxRpx - 20), 18, maxRpx); }
    var rpx = pxOf(res.r);
    var cx = entryX, cy = mid - rpx;
    // 参考轨迹
    if (opts && opts.refs) {
      [12, 90, 200].forEach(function (A) {
        if (Math.abs(A - st.A) < 8) return;
        var rp = pxOf(calc({ A: A, z: st.z, U: st.U, B: st.B }).r);
        c.beginPath(); c.arc(entryX, mid - rp, rp, Math.PI / 2, -Math.PI / 2, true);
        c.strokeStyle = 'rgba(168,223,198,.42)'; c.lineWidth = 1.6; c.stroke();
        c.fillStyle = '#7bb99e'; c.font = '11px sans-serif';
        c.fillText('A=' + A, entryX - 56, mid - 2 * rp + 4);
      });
    }
    c.beginPath(); c.arc(cx, cy, rpx, Math.PI / 2, -Math.PI / 2, true);
    c.strokeStyle = '#7cc6a5'; c.lineWidth = 3; c.stroke();
    // 落点（在底片上，距入射点 2r）
    var landY = mid - 2 * rpx;
    c.beginPath(); c.arc(entryX - 4, landY, 5, 0, Math.PI * 2); c.fillStyle = '#4c9a77'; c.fill();
    c.fillStyle = '#3f8c68'; c.font = 'bold 12px sans-serif';
    c.fillText('A=' + st.A + ' 落点', entryX - 96, landY - 8);
    // 运动离子
    if (opts && opts.animate) {
      var ph = (t * 0.00028) % 1, px, py;
      if (ph < 0.32) { px = srcX + 8 + (entryX - srcX - 8) * (ph / 0.32); py = mid; }
      else {
        var ang = Math.PI / 2 - (ph - 0.32) / 0.68 * Math.PI;
        px = cx + rpx * Math.cos(ang); py = cy + rpx * Math.sin(ang);
      }
      c.beginPath(); c.arc(px, py, 6, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
      c.strokeStyle = '#f0a868'; c.lineWidth = 2.5; c.stroke();
    }
  }

  /* ---------------- 0 基本模型 ---------------- */
  function viewBasic(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { U: 5, B: 0.6, A: 40, z: 1 };
    ctx.container.innerHTML =
      '<div class="ms-wrap">' +
        '<div class="ms-lead"><p>离子经加速电场获得速度，再进入匀强磁场做匀速圆周运动。调节加速电压、磁感应强度与离子种类，观察轨道半径与底片落点如何变化。</p>' +
          '<span class="ms-formula">r = √(2mU/q) / B <small>u=1.66×10⁻²⁷kg，e=1.6×10⁻¹⁹C</small></span></div>' +
        '<div class="ms-bar">' +
          ctrlHtml('U', '加速电压 U', 1, 20, 0.5, 5, 'kV') +
          ctrlHtml('B', '磁感应强度 B', 0.1, 2, 0.05, 0.6, 'T') +
          ctrlHtml('A', '质量数 A', 1, 238, 1, 40, '') +
          ctrlHtml('z', '电荷数 z', 1, 3, 1, 1, 'e') +
        '</div>' +
        '<section class="ms-card ms-card--wide"><h4>质谱仪工作流程</h4><div class="ms-card__hint">淡色为其它质量数的参考轨道；底片上的亮线是离子落点</div>' +
          '<canvas id="msScene" class="ms-cv" style="height:350px" aria-label="质谱仪装置动画"></canvas></section>' +
        '<div class="ms-readouts">' +
          roHtml('v', '加速后速度 v', '—') + roHtml('r', '轨道半径 r', '—') +
          roHtml('qm', '比荷 q/m', '—') + roHtml('land', '落点距入射点', '—') +
        '</div>' +
        '<div class="ms-note"><b>规律：</b>r ∝ √(m/q)，比荷越大的离子半径越小、落点越近。同位素电荷数相同而质量数不同，因此会在底片上落到不同位置——这就是质谱仪分离同位素的原理。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#msScene'), 350);
    function update() {
      var res = calc(st);
      $('[data-ro="v"]').innerHTML = fmt(res.v / 1e6, 2) + ' <small>×10⁶m/s</small>';
      $('[data-ro="r"]').innerHTML = fmt(res.r * 100, 1) + ' <small>cm</small>';
      $('[data-ro="qm"]').innerHTML = fmt(res.qm / 1e7, 2) + ' <small>×10⁷C/kg</small>';
      $('[data-ro="land"]').innerHTML = fmt(res.r * 200, 1) + ' <small>cm</small>';
    }
    bindCtrls(ctx, st, ['U', 'B', 'A', 'z'], update);
    on(win, 'resize', function () { lay = fit($('#msScene'), 350); });
    ctx.loop(function (t) { drawMS(lay, st, t, { animate: true, refs: true }); });
    update();
  }

  /* ---------------- 1 比荷测定 ---------------- */
  function viewRatio(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { U: 5, B: 0.6, A: 40, z: 1 };
    ctx.container.innerHTML =
      '<div class="ms-wrap">' +
        '<div class="ms-lead"><p>由 <b>qU = ½mv²</b> 与 <b>r = mv/(qB)</b> 联立消去 v，得到 <b>q/m = 2U/(B²r²)</b>。测出 U、B、r 即可测定粒子的比荷。</p></div>' +
        '<div class="ms-bar">' +
          ctrlHtml('U', '加速电压 U', 1, 20, 0.5, 5, 'kV') +
          ctrlHtml('B', '磁感应强度 B', 0.1, 2, 0.05, 0.6, 'T') +
          ctrlHtml('A', '质量数 A', 1, 238, 1, 40, '') +
          ctrlHtml('z', '电荷数 z', 1, 3, 1, 1, 'e') +
        '</div>' +
        '<div class="ms-derive"><span>qU = ½mv²</span><span class="ms-arrow">→</span><span>v = √(2qU/m)</span><span class="ms-arrow">→</span><span>r = mv/(qB)</span><span class="ms-arrow">→</span><span>q/m = 2U/(B²r²)</span></div>' +
        '<div class="ms-grid">' +
          '<section class="ms-card"><h4>轨道与落点</h4><div class="ms-card__hint">比荷越大，半径越小</div>' +
            '<canvas id="msRatio" class="ms-cv" style="height:280px" aria-label="比荷与轨道"></canvas></section>' +
          '<section class="ms-card"><h4>控制变量观察</h4><div class="ms-card__hint">分别改变 U、B、A、z，看 r 如何响应</div>' +
            '<div class="ms-note" style="margin-top:0"><b>U 增大：</b>r 增大（∝√U）<br><b>B 增大：</b>r 减小（∝1/B）<br><b>A 增大：</b>r 增大（∝√m）<br><b>z 增大：</b>r 减小（∝1/√q）</div>' +
            '<div class="ms-formula" style="margin-top:16px">当前 r = <span data-r>—</span> cm</div>' +
          '</section>' +
        '</div>' +
        '<div class="ms-readouts">' +
          roHtml('qm', '比荷 q/m', '—') + roHtml('r', '半径 r', '—') +
          roHtml('v', '速度 v', '—') + roHtml('ratio', 'm/q 相对值', '—') +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#msRatio'), 280);
    function update() {
      var res = calc(st);
      $('[data-ro="qm"]').innerHTML = fmt(res.qm / 1e7, 2) + ' <small>×10⁷C/kg</small>';
      $('[data-ro="r"]').innerHTML = fmt(res.r * 100, 1) + ' <small>cm</small>';
      $('[data-ro="v"]').innerHTML = fmt(res.v / 1e6, 2) + ' <small>×10⁶m/s</small>';
      $('[data-ro="ratio"]').textContent = fmt(st.A / st.z, 1) + ' u/e';
      $('[data-r]').textContent = fmt(res.r * 100, 1);
    }
    bindCtrls(ctx, st, ['U', 'B', 'A', 'z'], update);
    on(win, 'resize', function () { lay = fit($('#msRatio'), 280); });
    ctx.loop(function (t) { drawMS(lay, st, t, { animate: true, refs: false }); });
    update();
  }

  /* ---------------- 2 图像分析 ---------------- */
  function viewGraph(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { U: 5, B: 0.6, A: 40, z: 1 };
    ctx.container.innerHTML =
      '<div class="ms-wrap">' +
        '<div class="ms-lead"><p>左图：<b>r – A</b> 关系曲线（r ∝ √A），工作点随参数移动；右图：底片上的<b>同位素谱线</b>——质量数不同，落点不同，这就是质谱图。</p></div>' +
        '<div class="ms-bar">' +
          ctrlHtml('U', '加速电压 U', 1, 20, 0.5, 5, 'kV') +
          ctrlHtml('B', '磁感应强度 B', 0.1, 2, 0.05, 0.6, 'T') +
          ctrlHtml('A', '质量数 A', 1, 238, 1, 40, '') +
          ctrlHtml('z', '电荷数 z', 1, 3, 1, 1, 'e') +
        '</div>' +
        '<div class="ms-grid">' +
          '<section class="ms-card"><h4>r – A 关系曲线</h4><div class="ms-card__hint">当前 U、B、z 固定；r 随 √A 增大</div>' +
            '<canvas id="msCurve" class="ms-cv" style="height:300px" aria-label="r-A曲线"></canvas></section>' +
          '<section class="ms-card"><h4>底片上的同位素谱线</h4><div class="ms-card__hint">一组相近质量数的离子在底片上形成分离的谱线</div>' +
            '<canvas id="msFilm" class="ms-cv" style="height:300px" aria-label="质谱图"></canvas></section>' +
        '</div>' +
        '<div class="ms-note"><b>读图要点：</b>谱线间距随质量数增大而变小（r ∝ √A，曲线越来越平缓）；若两种离子质量数相同而电荷数不同，也会落在同一位置附近——实际质谱仪需综合判断。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var curveLay = fit($('#msCurve'), 300), filmLay = fit($('#msFilm'), 300);
    function update() {
      ctx.loop(function () { drawCurve(curveLay, st); drawFilm(filmLay, st); });
    }
    bindCtrls(ctx, st, ['U', 'B', 'A', 'z'], function () { /* 曲线每帧重绘，无需额外更新 */ });
    on(win, 'resize', function () { curveLay = fit($('#msCurve'), 300); filmLay = fit($('#msFilm'), 300); });
    update();
  }
  function drawCurve(lay, st) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 52, R = w - 18, Tp = 18, B = h - 36;
    var aMax = 240, rMax = calc({ A: aMax, z: st.z, U: st.U, B: st.B }).r * 1.1;
    function X(a) { return L + a / aMax * (R - L); }
    function Y(r) { return B - r / rMax * (B - Tp); }
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
    for (var g = 1; g <= 4; g++) {
      c.beginPath(); c.moveTo(X(g * 48), Tp); c.lineTo(X(g * 48), B); c.stroke();
      c.beginPath(); c.moveTo(L, Y(rMax * g / 5)); c.lineTo(R, Y(rMax * g / 5)); c.stroke();
    }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('r/cm', 12, Tp + 6); c.fillText('A', R - 6, B + 20);
    c.beginPath();
    for (var px = 0; px <= R - L; px += 2) {
      var a = px / (R - L) * aMax, r = calc({ A: Math.max(1, a), z: st.z, U: st.U, B: st.B }).r;
      if (px === 0) c.moveTo(X(a), Y(r)); else c.lineTo(X(a), Y(r));
    }
    c.strokeStyle = '#6fc5a2'; c.lineWidth = 3; c.stroke();
    var cur = calc(st);
    c.beginPath(); c.arc(X(st.A), Y(cur.r), 6, 0, Math.PI * 2); c.fillStyle = '#3f8c68'; c.fill();
    c.strokeStyle = '#a8dfc6'; c.setLineDash([4, 3]); c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(X(st.A), Y(cur.r)); c.lineTo(X(st.A), B); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#3f8c68'; c.font = 'bold 12px sans-serif';
    c.fillText('A=' + st.A + ', r=' + fmt(cur.r * 100, 1) + 'cm', Math.min(X(st.A) + 8, R - 140), Math.max(Y(cur.r) - 10, Tp + 14));
  }
  function drawFilm(lay, st) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 56, R = w - 20, Tp = 24, B = h - 50;
    var masses = [12, 13, 14, 20, 21, 22];
    var rs = masses.map(function (a) { return calc({ A: a, z: st.z, U: st.U, B: st.B }).r; });
    var rmin = Math.min.apply(null, rs), rmax = Math.max.apply(null, rs);
    function X(r) { return L + (r - rmin) / (rmax - rmin || 1) * (R - L); }
    // 底片横轴
    c.fillStyle = '#f2f8f5'; c.fillRect(L, Tp, R - L, B - Tp);
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('落点位置（半径 r 增大 →）', L, B + 22);
    masses.forEach(function (a, i) {
      var xx = X(rs[i]);
      var grad = c.createLinearGradient(0, Tp, 0, B);
      grad.addColorStop(0, 'rgba(124,198,165,0)'); grad.addColorStop(1, 'rgba(124,198,165,.85)');
      c.fillStyle = grad; c.fillRect(xx - 4, Tp, 8, B - Tp);
      c.fillStyle = '#3f8c68'; c.font = 'bold 12px sans-serif';
      c.fillText(String(a), xx - 6, B + 16);
    });
    c.fillStyle = '#5a6472'; c.font = '13px sans-serif';
    c.fillText('质量数 A', L, Tp - 6);
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('（谱线越高表示丰度越大，此处示意位置）', L, Tp + 14);
  }

  /* ---------------- 3 高考题型 ---------------- */
  function viewExam(ctx) {
    var on = ctx.on;
    var st = { U: 5, B: 0.6, A: 40, z: 1 };
    ctx.container.innerHTML =
      '<div class="ms-wrap">' +
        '<div class="ms-lead"><p>点击选项即时判定并查看解析。第 1 题可调 U、B、A、z 实时计算轨道半径；第 2 题考查同位素分离的规律。</p></div>' +
        '<div class="ms-q">' +
          '<div class="ms-q__t">1．（计算）质量数 A=40、电荷数 z=1 的离子，经 U=5 kV 加速后进入 B=0.6 T 的磁场，轨道半径约为多少？（u=1.66×10⁻²⁷kg，e=1.6×10⁻¹⁹C）</div>' +
          '<div class="ms-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            ctrlHtml('U', '加速电压 U', 1, 20, 0.5, 5, 'kV') +
            ctrlHtml('B', '磁场 B', 0.1, 2, 0.05, 0.6, 'T') +
            ctrlHtml('A', '质量数 A', 1, 238, 1, 40, '') +
            ctrlHtml('z', '电荷数 z', 1, 3, 1, 1, 'e') +
            '<div class="ms-formula" style="font-size:15px">r = <span data-r>—</span> cm</div>' +
          '</div>' +
          '<div class="ms-opts" data-q="1">' +
            '<button type="button" class="ms-opt" data-ans="A">A．约 12 cm</button>' +
            '<button type="button" class="ms-opt" data-ans="B">B．约 24 cm</button>' +
            '<button type="button" class="ms-opt" data-ans="C">C．约 6 cm</button>' +
            '<button type="button" class="ms-opt" data-ans="D">D．约 48 cm</button>' +
          '</div><div class="ms-explain" data-exp="1" hidden></div>' +
        '</div>' +
        '<div class="ms-q">' +
          '<div class="ms-q__t">2．（判断）同位素 ¹²C 与 ¹⁴C（均带一个单位正电）经相同电压加速后进入同一磁场，谁在底片上的落点离入射点更远？</div>' +
          '<div class="ms-opts" data-q="2">' +
            '<button type="button" class="ms-opt" data-ans="A">A．¹²C 更远</button>' +
            '<button type="button" class="ms-opt" data-ans="B">B．¹⁴C 更远</button>' +
            '<button type="button" class="ms-opt" data-ans="C">C．一样远</button>' +
            '<button type="button" class="ms-opt" data-ans="D">D．无法判断</button>' +
          '</div><div class="ms-explain" data-exp="2" hidden></div>' +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var exp = {
      '1': { right: 'A', text: 'm=40u=6.64×10⁻²⁶kg，q=e，U=5kV：v=√(2qU/m)≈1.55×10⁵m/s，r=mv/(qB)≈0.107m≈11cm，最接近 12 cm。也可直接用 r=√(2mU/q)/B。' },
      '2': { right: 'B', text: 'r ∝ √m，¹⁴C 质量数更大，半径更大，落点（距入射点 2r）更远。这正是质谱仪分离同位素的依据。' }
    };
    function update() { $('[data-r]').textContent = fmt(calc(st).r * 100, 1); }
    bindCtrls(ctx, st, ['U', 'B', 'A', 'z'], update); update();
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-q]'), function (box) {
      var q = box.getAttribute('data-q');
      Array.prototype.forEach.call(box.querySelectorAll('.ms-opt'), function (b) {
        on(b, 'click', function () {
          var ans = b.getAttribute('data-ans');
          Array.prototype.forEach.call(box.querySelectorAll('.ms-opt'), function (x) {
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
