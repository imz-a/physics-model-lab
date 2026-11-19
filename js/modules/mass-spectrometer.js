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
  // 固定参考量程：用默认 U₀=5kV、B₀=0.6T 下的半径作绝对刻度基准，
  // 绝不随当前 U/B 归一化，否则 r∝√U/B 的比值会把参数变化完全抹平。
  var REF = { U: 5, B: 0.6, A: 238, z: 1 };
  var R_REF = calc(REF).r;                       // 场景最大参考半径（A=238 默认场）
  var R_BASE = calc({ A: 40, z: 1, U: 5, B: 0.6 }).r; // 初始状态参考半径（用于"变化前"虚线）
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
        // U 步长 0.5 kV，须显示 1 位小数；B 显示 2 位；A/z 取整数
        var dec = key === 'U' ? 1 : (key === 'B' ? 2 : 0);
        if (e) e.innerHTML = fmt(st[key], dec) + '<em>' + (key === 'U' ? 'kV' : key === 'B' ? 'T' : key === 'A' ? '' : 'e') + '</em>';
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
    var maxRpx = Math.min((mid - 44) / 2, magRight - entryX - 20);
    // 绝对线性刻度：像素半径 ∝ 物理半径，分母 R_REF 固定（不随 U/B 变），
    // 因此改 U、B、A、z 时轨道与落点都会真实移动。超出量程则饱和到边界。
    function pxOf(r) { return clamp(r / R_REF * maxRpx, 2, maxRpx); }
    var rpx = pxOf(res.r);
    var cx = entryX, cy = mid - rpx;
    // "变化前"参考圆（初始 U₀=5kV、B₀=0.6T、A=40、z=1）：灰色虚线，固定不动
    var rBasePx = pxOf(R_BASE);
    c.beginPath(); c.arc(entryX, mid - rBasePx, rBasePx, Math.PI / 2, -Math.PI / 2, true);
    c.strokeStyle = 'rgba(139,149,163,.6)'; c.lineWidth = 1.6; c.setLineDash([5,4]); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#939eab'; c.font = '11px sans-serif';
    c.fillText('变化前 r=' + fmt(R_BASE * 100, 1) + 'cm', entryX + 10, Math.max(30, mid - 2 * rBasePx - 6));
    // 其它质量数参考轨道（当前参数下）
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
    // 绝对半径刻度尺（磁场区右缘，固定 r=10/20/30cm 位置）
    [10, 20, 30].forEach(function (rcm) {
      var y = mid - 2 * pxOf(rcm / 100);
      if (y < 26 || y > h - 30) return;
      c.strokeStyle = '#cbb9df'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(magRight - 14, y); c.lineTo(magRight - 2, y); c.stroke();
      c.fillStyle = '#9a86b5'; c.font = '10px sans-serif';
      c.fillText(rcm + 'cm', magRight - 48, y + 3);
    });
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
        '<section class="ms-card ms-card--wide"><h4>质谱仪工作流程</h4><div class="ms-card__hint">实线=当前轨道；淡绿=其它质量数参考；灰虚线=变化前基准（U₀=5kV、B₀=0.6T、A=40）；右侧刻度为绝对半径；底片亮线为落点</div>' +
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
          '<section class="ms-card"><h4>轨道与落点</h4><div class="ms-card__hint">比荷越大半径越小；灰虚线=变化前基准(U₀=5kV、B₀=0.6T、A=40)</div>' +
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
          '<section class="ms-card"><h4>底片上的同位素谱线</h4><div class="ms-card__hint">横轴为绝对落点半径 r/cm；柱高示意丰度，位置由 r 决定；灰虚线为变化前落点。改 U/B/z 谱线整体平移</div>' +
            '<canvas id="msFilm" class="ms-cv" style="height:300px" aria-label="质谱图"></canvas></section>' +
        '</div>' +
        '<div class="ms-note"><b>读图要点：</b>谱线间距随质量数增大而变小（r ∝ √A，曲线越来越平缓）；但 r ∝ √(m/q)，决定落点的是<b>比荷 q/m</b>——只有比荷相同的离子才落在同一位置（如 A=12,z=1 与 A=24,z=2 的 q/m 相同），此时质谱仪无法区分，需结合其它信息判断。质量数相同而电荷数不同时 r 相差 √z 倍，落点明显分开。</div>' +
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
    var L = 52, R = w - 18, Tp = 20, B = h - 38;
    var aMax = 240, RMAX_CM = 30;               // 固定绝对量程 0~30cm，不随 U/B/z 归一化
    function X(a) { return L + clamp(a / aMax, 0, 1) * (R - L); }
    function Y(rcm) { return B - clamp(rcm / RMAX_CM, 0, 1) * (B - Tp); } // 入参单位 cm
    // 网格 + 绝对刻度（横轴质量数、纵轴 r/cm）
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1; c.fillStyle = '#8b95a3'; c.font = '11px sans-serif';
    for (var g = 1; g <= 4; g++) {
      var xx = X(g * 48), rc = RMAX_CM * g / 5, yy = Y(rc);
      c.beginPath(); c.moveTo(xx, Tp); c.lineTo(xx, B); c.stroke();
      c.beginPath(); c.moveTo(L, yy); c.lineTo(R, yy); c.stroke();
      c.fillText(String(g * 48), xx - 8, B + 14);
      c.fillText(String(Math.round(rc)), L - 24, yy + 4);
    }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('r / cm', 6, Tp + 2); c.fillText('质量数 A', R - 56, h - 6);
    // 曲线绘制器：rcm 由 calc 得到后统一乘 100，纵轴口径恒为 cm
    function plot(z, U, Bf, color, dash, lw) {
      c.save(); c.beginPath();
      for (var px = 0; px <= R - L; px += 2) {
        var a = px / (R - L) * aMax;
        var rcm = calc({ A: Math.max(1, a), z: z, U: U, B: Bf }).r * 100;
        if (px === 0) c.moveTo(X(a), Y(rcm)); else c.lineTo(X(a), Y(rcm));
      }
      c.strokeStyle = color; c.lineWidth = lw; if (dash) c.setLineDash(dash); c.stroke(); c.restore();
    }
    plot(REF.z, REF.U, REF.B, 'rgba(139,149,163,.65)', [5, 4], 1.6); // 变化前基准
    plot(st.z, st.U, st.B, '#6fc5a2', null, 3);                        // 当前曲线
    var cur = calc(st), curY = Y(cur.r * 100);
    c.beginPath(); c.arc(X(st.A), curY, 6, 0, Math.PI * 2); c.fillStyle = '#3f8c68'; c.fill();
    c.strokeStyle = '#a8dfc6'; c.setLineDash([4, 3]); c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(X(st.A), curY); c.lineTo(X(st.A), B); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#3f8c68'; c.font = 'bold 12px sans-serif';
    c.fillText('A=' + st.A + ', r=' + fmt(cur.r * 100, 1) + 'cm', Math.min(X(st.A) + 8, R - 140), Math.max(curY - 10, Tp + 14));
    c.font = '11px sans-serif';
    c.fillStyle = '#6fc5a2'; c.fillText('— 当前(U/B/z可调)', L + 6, Tp + 12);
    c.fillStyle = '#939eab'; c.fillText('┄ 变化前(U₀=5kV,B₀=0.6T,z=1)', L + 130, Tp + 12);
  }
  function drawFilm(lay, st) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 52, R = w - 20, Tp = 26, B = h - 52;
    var RMAX_CM = 20;                               // 固定绝对横轴 0~20cm，不随参数 min-max 归一化
    var masses = [12, 13, 14, 20, 21, 22];
    var abun = [0.45, 0.22, 0.72, 0.5, 0.34, 0.6];  // 示意丰度→不同柱高
    function X(rcm) { return L + clamp(rcm / RMAX_CM, 0, 1) * (R - L); }
    c.fillStyle = '#f2f8f5'; c.fillRect(L, Tp, R - L, B - Tp);
    // 网格 + 绝对刻度（落点半径 r/cm）
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1; c.fillStyle = '#8b95a3'; c.font = '11px sans-serif';
    for (var g = 0; g <= 5; g++) {
      var rcm = RMAX_CM * g / 5, xx = X(rcm);
      c.beginPath(); c.moveTo(xx, Tp); c.lineTo(xx, B); c.stroke();
      c.fillText(String(Math.round(rcm)), xx - 6, B + 15);
    }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#5a6472'; c.font = '12px sans-serif';
    c.fillText('落点半径 r / cm', (L + R) / 2 - 42, h - 8);
    c.fillText('柱高=丰度(示意)', L, Tp - 8);
    // 变化前基准落点（灰虚线，初始 U₀/B₀/z=1）
    masses.forEach(function (a) {
      var x0 = X(calc({ A: a, z: REF.z, U: REF.U, B: REF.B }).r * 100);
      c.strokeStyle = 'rgba(139,149,163,.5)'; c.lineWidth = 1; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(x0, Tp); c.lineTo(x0, B); c.stroke(); c.setLineDash([]);
    });
    // 当前谱线：位置随 U/B/z 整体平移，柱高各不相同（丰度示意）
    masses.forEach(function (a, i) {
      var xx = X(calc({ A: a, z: st.z, U: st.U, B: st.B }).r * 100);
      var topY = B - abun[i] * (B - Tp) * 0.9;
      var grad = c.createLinearGradient(0, topY, 0, B);
      grad.addColorStop(0, 'rgba(124,198,165,.2)'); grad.addColorStop(1, 'rgba(124,198,165,.9)');
      c.fillStyle = grad; c.fillRect(xx - 4, topY, 8, B - topY);
      c.fillStyle = '#3f8c68'; c.font = 'bold 12px sans-serif';
      c.fillText(String(a), xx - 5, topY - 5); // 柱顶标质量数
    });
    c.fillStyle = '#939eab'; c.font = '11px sans-serif';
    c.fillText('┄ 变化前落点', R - 82, Tp - 8);
  }

  /* ---------------- 3 高考题型 ---------------- */
  function viewExam(ctx) {
    var on = ctx.on;
    var st = { U: 5, B: 0.6, A: 40, z: 1 };
    // 参数可调 ⇒ 题干、半径、选项、正确答案、解析全部随 calc(st) 动态生成
    function buildQ1(s) {
      var res = calc(s);
      var rcm = res.r * 100;
      var right = Math.max(1, Math.round(rcm));    // 默认 r≈10.7cm → 约 11cm
      var vals = [];
      function add(x) {
        x = Math.max(1, Math.round(x));
        if (x !== right && vals.indexOf(x) < 0) vals.push(x);
      }
      add(right / 2); add(right * 2); add(right * 1.5); add(right + 6); add(Math.max(1, right - 4));
      while (vals.length < 3) add(right + vals.length + 1);
      return {
        prompt: '1．（计算）质量数 A=' + s.A + '、电荷数 z=' + s.z + ' 的离子，经 U=' + fmt(s.U, 1) +
          ' kV 加速后进入 B=' + fmt(s.B, 2) + ' T 的磁场，轨道半径约为多少？（u=1.66×10⁻²⁷kg，e=1.6×10⁻¹⁹C）',
        opts: ['A．约 ' + right + ' cm', 'B．约 ' + vals[0] + ' cm', 'C．约 ' + vals[1] + ' cm', 'D．约 ' + vals[2] + ' cm'],
        right: 'A', rcm: rcm,
        text: 'm=' + s.A + 'u=' + fmt(s.A * U_ATOMIC / 1e-27, 1) + '×10⁻²⁷kg，q=' + s.z + 'e=' + fmt(s.z * E_CHARGE / 1e-19, 1) +
          '×10⁻¹⁹C，U=' + fmt(s.U, 1) + 'kV，B=' + fmt(s.B, 2) + 'T：v=√(2qU/m)≈' + fmt(res.v / 1e5, 2) +
          '×10⁵m/s，r=mv/(qB)=√(2mU/q)/B≈' + fmt(res.r, 3) + 'm≈' + right + 'cm，最接近「约 ' + right + ' cm」，选 A。'
      };
    }
    var exp2 = { right: 'B', text: 'r ∝ √m，¹⁴C 质量数更大，半径更大，落点（距入射点 2r）更远。这正是质谱仪分离同位素的依据。' };
    ctx.container.innerHTML =
      '<div class="ms-wrap">' +
        '<div class="ms-lead"><p>点击选项即时判定并查看解析。第 1 题可调 U、B、A、z，<b>题干、半径、四个选项与正确答案均随参数实时重算</b>；第 2 题考查同位素分离规律。</p></div>' +
        '<div class="ms-q">' +
          '<div class="ms-q__t" data-prompt1></div>' +
          '<div class="ms-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            ctrlHtml('U', '加速电压 U', 1, 20, 0.5, 5, 'kV') +
            ctrlHtml('B', '磁场 B', 0.1, 2, 0.05, 0.6, 'T') +
            ctrlHtml('A', '质量数 A', 1, 238, 1, 40, '') +
            ctrlHtml('z', '电荷数 z', 1, 3, 1, 1, 'e') +
            '<div class="ms-formula" style="font-size:15px">r = <span data-r>—</span> cm</div>' +
          '</div>' +
          '<div class="ms-opts" data-q="1" data-opts1></div><div class="ms-explain" data-exp="1" hidden></div>' +
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
    function refreshQ1() {
      var d = buildQ1(st);
      $('[data-prompt1]').textContent = d.prompt;
      $('[data-r]').textContent = fmt(d.rcm, 1);
      $('[data-opts1]').innerHTML = d.opts.map(function (o, i) {
        return '<button type="button" class="ms-opt" data-ans="' + 'ABCD'[i] + '">' + o + '</button>';
      }).join('');
      $('[data-exp="1"]').hidden = true;
      $('[data-exp="1"]').innerHTML = '';
    }
    bindCtrls(ctx, st, ['U', 'B', 'A', 'z'], refreshQ1); refreshQ1();
    // 事件委托：选项 innerHTML 重建后判分依然有效；判分与解析取当前参数
    function answer(box, q) {
      on(box, 'click', function (e) {
        var b = e.target;
        while (b && b !== box && (b.className || '').indexOf('ms-opt') < 0) b = b.parentNode;
        if (!b || b === box) return;
        var ans = b.getAttribute('data-ans');
        var d = q === 1 ? buildQ1(st) : null;
        var correct = q === 1 ? d.right : exp2.right;
        var text = q === 1 ? d.text : exp2.text;
        Array.prototype.forEach.call(box.querySelectorAll('.ms-opt'), function (x) {
          x.classList.remove('is-right', 'is-wrong');
          if (x === b) x.classList.add(ans === correct ? 'is-right' : 'is-wrong');
        });
        var el = $('[data-exp="' + q + '"]'); el.hidden = false;
        el.innerHTML = (ans === correct ? '✅ 正确！' : '❌ 再想想。') + ' ' + text;
      });
    }
    answer($('[data-q="1"]'), 1);
    answer($('[data-q="2"]'), 2);
  }
})(window);
