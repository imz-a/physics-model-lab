/* ============================================================
 * nuclear-decay.js — 原子核衰变（近代物理）
 * 契约：IIFE + window.ModelLab.modules['nuclear-decay']，零依赖，file:// 可用。
 * 物理：N = N₀·(1/2)^(t/T)；半衰期是大量核的统计规律；
 *   α 衰变放 ⁴₂He（A−4, Z−2），β 衰变放电子（A 不变, Z+1），γ 伴随；质量数、电荷数守恒。
 * 4 个子标签：0 基本模型 / 1 半衰期 / 2 核反应方程 / 3 高考题型
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = (global.ModelLab = global.ModelLab || {});
  NS.modules = NS.modules || {};

  var CSS_ID = 'lm-css-nuclear-decay';
  var CSS = [
    '.nd-wrap{--tint:#D0C4E8;--tint-soft:#F7F4FC;color:var(--ink);font-size:16px;}',
    '.nd-wrap *{box-sizing:border-box;}',
    '.nd-lead{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:16px;}',
    '.nd-lead p{max-width:790px;color:var(--ink-2);font-size:15px;line-height:1.7;}',
    '.nd-formula{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--tint);border-radius:999px;background:var(--tint-soft);font-size:17px;font-weight:700;white-space:nowrap;}',
    '.nd-formula small{font-weight:400;color:var(--ink-2);font-size:12px;}',
    '.nd-bar{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:16px;}',
    '.nd-ctrl{flex:1 1 180px;min-width:165px;}',
    '.nd-ctrl__top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px;}',
    '.nd-ctrl__top label{font-size:14px;color:var(--ink-2);font-weight:600;}',
    '.nd-ctrl__val{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.nd-ctrl__val em{font-style:normal;font-size:12px;color:var(--ink-3);font-weight:400;margin-left:2px;}',
    '.nd-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:99px;background:#eef2f6;outline:0;margin:4px 0;}',
    '.nd-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.nd-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.nd-btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
    '.nd-btn{min-height:40px;padding:8px 16px;border:1px solid var(--line-2);border-radius:999px;background:#fff;color:var(--ink-2);font-size:14px;font-weight:600;transition:background .15s,border-color .15s;white-space:nowrap;}',
    '.nd-btn:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.nd-btn.is-active{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);box-shadow:inset 0 0 0 1px var(--tint);}',
    '.nd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}',
    '.nd-card{background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);padding:16px 18px;min-width:0;}',
    '.nd-card--wide{grid-column:1/-1;}',
    '.nd-card h4{font-size:16px;font-weight:700;margin-bottom:4px;}',
    '.nd-card__hint{font-size:13px;color:var(--ink-3);margin-bottom:12px;}',
    '.nd-cv{width:100%;display:block;border-radius:10px;background:#fff;}',
    '.nd-readouts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;}',
    '.nd-ro{padding:14px 16px;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;text-align:center;}',
    '.nd-ro span{display:block;font-size:13px;color:var(--ink-3);}',
    '.nd-ro b{display:block;margin-top:4px;font-size:23px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.nd-ro small{font-size:12px;color:var(--ink-3);font-weight:400;}',
    '.nd-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--ink-2);margin-top:10px;}',
    '.nd-legend i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:5px;vertical-align:-1px;}',
    '.nd-note{margin-top:14px;padding:12px 16px;border-left:4px solid var(--tint);background:var(--tint-soft);border-radius:0 10px 10px 0;font-size:14px;color:var(--ink-2);}',
    '.nd-note b{color:var(--ink);}',
    '.nd-eq{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:18px 12px;border:1px solid var(--line-2);border-radius:12px;background:var(--surface-soft);font-size:22px;margin:12px 0;}',
    '.nd-nu{display:inline-flex;align-items:center;position:relative;padding:0 2px;font-weight:700;}',
    '.nd-nu sup{font-size:12px;position:absolute;top:-9px;left:50%;transform:translateX(-50%);color:#8b6fb5;}',
    '.nd-nu sub{font-size:12px;position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);color:#8b6fb5;}',
    '.nd-arrow{color:var(--ink-3);}',
    '.nd-check{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:12px;}',
    '.nd-chip{padding:10px 12px;border:1px solid var(--line-2);border-radius:10px;background:var(--surface-soft);font-size:14px;display:flex;align-items:center;gap:8px;}',
    '.nd-chip--ok{border-color:#cceede;background:#f1fbf6;color:#3f8c68;}',
    '.nd-input{width:62px;padding:5px 8px;border:1px solid var(--line-2);border-radius:8px;text-align:center;font-size:15px;background:#fff;user-select:text;}',
    '.nd-fill{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:14px;padding:14px;border:1px dashed var(--tint);border-radius:12px;background:var(--tint-soft);font-size:16px;}',
    '.nd-fb{margin-top:10px;padding:10px 12px;border-radius:10px;font-size:14px;line-height:1.6;}',
    '.nd-fb--ok{background:#eefaf3;color:#2f8a5f;}',
    '.nd-fb--no{background:#fff3f4;color:#c1616c;}',
    '.nd-q{padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:14px;}',
    '.nd-q__t{font-size:16px;font-weight:700;line-height:1.6;}',
    '.nd-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;}',
    '.nd-opt{min-height:46px;padding:10px 14px;text-align:left;border:1px solid var(--line-2);border-radius:10px;background:#fff;font-size:15px;color:var(--ink-2);transition:background .15s,border-color .15s;}',
    '.nd-opt:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.nd-opt.is-right{background:#eefaf3;border-color:#a8e0c4;color:#2f8a5f;font-weight:700;}',
    '.nd-opt.is-wrong{background:#fff3f4;border-color:#ffc9cf;color:#c1616c;}',
    '.nd-explain{margin-top:12px;padding:12px 14px;background:#f7fafc;border-radius:10px;font-size:14px;color:var(--ink-2);line-height:1.7;}',
    '@media(max-width:1100px){.nd-grid{grid-template-columns:1fr;}.nd-readouts{grid-template-columns:repeat(2,1fr);}}',
    '@media(max-width:760px){.nd-opts{grid-template-columns:1fr;}}'
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
  function fmt(v, n) { return Number(v).toFixed(n === undefined ? 1 : n); }
  function remaining(N0, T, t) { return N0 * Math.pow(0.5, t / T); }
  var NUCLIDES = [
    { name: '铀 U-238', A: 238, Z: 92 }, { name: '镭 Ra-226', A: 226, Z: 88 },
    { name: '碳 C-14', A: 14, Z: 6 }, { name: '钍 Th-234', A: 234, Z: 90 }
  ];
  var SYM = { 2: 'He', 6: 'C', 7: 'N', 86: 'Rn', 88: 'Ra', 89: 'Ac', 90: 'Th', 91: 'Pa', 92: 'U', 93: 'Np' };
  function symbolOf(Z) { return SYM[Z] || 'X'; }
  function nuHtml(A, Z, sym) {
    return '<span class="nd-nu"><sup>' + A + '</sup><sub>' + Z + '</sub>' + sym + '</span>';
  }
  function decayResult(m, type) {
    if (type === 'a') return { A: m.A - 4, Z: m.Z - 2, sym: symbolOf(m.Z - 2), particle: nuHtml(4, 2, 'He'), pA: 4, pZ: 2, label: 'α 衰变' };
    if (type === 'b') return { A: m.A, Z: m.Z + 1, sym: symbolOf(m.Z + 1), particle: nuHtml(0, -1, 'e'), pA: 0, pZ: -1, label: 'β 衰变' };
    return { A: m.A, Z: m.Z, sym: m.name.slice(m.name.indexOf(' ') + 1, m.name.indexOf('-')), particle: 'γ', pA: 0, pZ: 0, label: 'γ 辐射' };
  }
  function ctrlHtml(key, label, min, max, step, val, unit) {
    return '<div class="nd-ctrl"><div class="nd-ctrl__top"><label for="ndS' + key + '">' + label + '</label>' +
      '<span class="nd-ctrl__val" data-val="' + key + '">' + fmt(val, step < 1 ? 1 : 0) + '<em>' + unit + '</em></span></div>' +
      '<input id="ndS' + key + '" class="nd-range" type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
  }
  function roHtml(key, label, val) {
    return '<div class="nd-ro"><span>' + label + '</span><b data-ro="' + key + '">' + val + '</b></div>';
  }
  function bindCtrls(ctx, st, keys, onChange) {
    keys.forEach(function (key) {
      var el = ctx.container.querySelector('[data-key="' + key + '"]');
      if (!el) return;
      ctx.on(el, 'input', function () {
        st[key] = parseFloat(el.value);
        var e = ctx.container.querySelector('[data-val="' + key + '"]');
        if (e) e.innerHTML = fmt(st[key], key === 'T' || key === 't' ? 1 : 0) + '<em>' + (key === 'N0' ? '个' : key === 'T' || key === 't' ? '单位时间' : '') + '</em>';
        if (onChange) onChange(key);
      });
    });
  }

  NS.modules['nuclear-decay'] = {
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
      var views = [viewBasic, viewHalfLife, viewEquation, viewExam];
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

  function drawDecayCurve(lay, st, cursor, refT) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 52, R = w - 18, Tp = 18, B = h - 36;
    var tMax = 40, nMax = 200;   // 固定绝对量程：t 与 N₀ 滑块上限，不随 T 缩放
    function X(t) { return L + t / tMax * (R - L); }
    function Y(n) { return B - n / nMax * (B - Tp); }
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
    for (var g = 1; g <= 4; g++) {
      c.beginPath(); c.moveTo(L, Tp + (B - Tp) * g / 5); c.lineTo(R, Tp + (B - Tp) * g / 5); c.stroke();
      c.beginPath(); c.moveTo(L + (R - L) * g / 5, Tp); c.lineTo(L + (R - L) * g / 5, B); c.stroke();
    }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('N / 个', 6, 12); c.fillText('t / 单位时间', R - 86, B + 22); c.fillText('N₀=' + st.N0, L + 6, Tp + 14);
    for (var tk = 0; tk <= tMax; tk += 10) c.fillText(String(tk), X(tk) - 6, B + 16);
    for (var nk = 0; nk <= nMax; nk += 50) c.fillText(String(nk), 14, Y(nk) + 4);
    // 变化前半衰期对应的理论曲线（灰虚线）
    if (refT && Math.abs(refT - st.T) > 1e-9) {
      c.save(); c.strokeStyle = '#aeb8c6'; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath();
      for (var rp = 0; rp <= R - L; rp += 2) {
        var rt = rp / (R - L) * tMax, rn = remaining(st.N0, refT, rt);
        if (!rp) c.moveTo(X(rt), Y(rn)); else c.lineTo(X(rt), Y(rn));
      }
      c.stroke(); c.restore();
      c.save(); c.fillStyle = '#8b95a3'; c.font = '11px sans-serif';
      c.fillText('灰虚线：变化前 T=' + fmt(refT, 1), L + 6, Tp + 30); c.restore();
    }
    c.beginPath();
    for (var px = 0; px <= R - L; px += 2) {
      var t = px / (R - L) * tMax, n = remaining(st.N0, st.T, t);
      if (px === 0) c.moveTo(X(t), Y(n)); else c.lineTo(X(t), Y(n));
    }
    c.strokeStyle = '#b49ad6'; c.lineWidth = 3; c.stroke();
    if (cursor) {
      var ct = clamp(st.t, 0, tMax), cn = remaining(st.N0, st.T, ct);
      c.strokeStyle = '#e0c4e8'; c.setLineDash([5, 4]); c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(X(ct), Y(cn)); c.lineTo(X(ct), B); c.stroke();
      c.beginPath(); c.moveTo(L, Y(cn)); c.lineTo(X(ct), Y(cn)); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.arc(X(ct), Y(cn), 6, 0, Math.PI * 2); c.fillStyle = '#8b6fb5'; c.fill();
      c.fillStyle = '#7c63a8'; c.font = 'bold 12px sans-serif';
      c.fillText('t=' + fmt(ct, 1) + '  N=' + fmt(cn, 1), Math.min(X(ct) + 8, R - 104), Math.max(Y(cn) - 8, Tp + 12));
    }
  }

  /* ---------------- 0 基本模型 ---------------- */
  function viewBasic(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { T: 5, N0: 100, t: 10 };
    ctx.container.innerHTML =
      '<div class="rp-wrap nd-wrap">' +
        '<div class="nd-lead"><p>拖动半衰期 T、初始核数 N₀ 与经过时间 t，观察母核逐个随机衰变为子核；右侧曲线为 N = N₀·(1/2)^(t/T)，游标标出当前位置。点“播放衰变”可自动推进时间。</p>' +
          '<span class="nd-formula">N = N₀·(1/2)^(t/T) <small>指数衰减</small></span></div>' +
        '<div class="nd-bar">' +
          ctrlHtml('T', '半衰期 T', 1, 12, 0.5, 5, '单位') +
          ctrlHtml('N0', '初始核数 N₀', 20, 200, 10, 100, '个') +
          ctrlHtml('t', '经过时间 t', 0, 40, 0.5, 10, '单位') +
          '<div class="nd-btnrow"><button type="button" class="nd-btn" data-act="play">▶ 播放衰变</button>' +
          '<button type="button" class="nd-btn" data-act="reset">复位</button></div>' +
        '</div>' +
        '<div class="nd-grid">' +
          '<section class="nd-card"><h4>原子核样本</h4><div class="nd-card__hint">紫点为母核，薄荷绿为子核；闪光表示刚刚发生衰变</div>' +
            '<canvas id="ndAtoms" class="nd-cv" style="height:290px" aria-label="原子核衰变动画"></canvas>' +
            '<div class="nd-legend"><span><i style="background:#c3a8e6"></i>母核</span><span><i style="background:#a8dfc6"></i>子核</span></div>' +
          '</section>' +
          '<section class="nd-card"><h4>N – t 指数衰减曲线</h4><div class="nd-card__hint">虚线游标对应当前 t，每过一个 T 剩余一半</div>' +
            '<canvas id="ndCurve" class="nd-cv" style="height:290px" aria-label="指数衰减曲线"></canvas></section>' +
        '</div>' +
        '<div class="nd-readouts">' +
          roHtml('N', '剩余母核 N', '—') + roHtml('ratio', '剩余比例', '—') +
          roHtml('decayed', '已衰变数', '—') + roHtml('half', '经过半衰期', '—') +
        '</div>' +
        '<div class="nd-note"><b>统计规律：</b>单个原子核何时衰变是随机的；只有当原子核数量足够多时，整体才严格服从指数衰减规律。半衰期是“有一半发生衰变所需的时间”，不是“全部衰变完的时间”。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var atomsLay = fit($('#ndAtoms'), 290), curveLay = fit($('#ndCurve'), 290);
    var ro = { N: $('[data-ro="N"]'), ratio: $('[data-ro="ratio"]'), decayed: $('[data-ro="decayed"]'), half: $('[data-ro="half"]') };
    var ps = [], playing = false, refT = st.T;   // 变化前半衰期（灰虚线参考）
    function initParticles() {
      ps = [];
      var cols = Math.ceil(Math.sqrt(st.N0 * 1.7));
      for (var i = 0; i < st.N0; i++) {
        ps.push({ x: (i % cols + 0.5) / cols, y: (Math.floor(i / cols) + 0.5) / Math.ceil(st.N0 / cols), parent: true, flash: 0 });
      }
    }
    initParticles();
    function targetParent() { return Math.round(remaining(st.N0, st.T, st.t)); }
    function syncParticles() {
      var want = targetParent(), cur = 0;
      for (var i = 0; i < ps.length; i++) if (ps[i].parent) cur++;
      var idx = [];
      for (var j = 0; j < ps.length; j++) idx.push(j);
      idx.sort(function () { return Math.random() - 0.5; });
      var k = 0;
      if (cur > want) {
        while (cur > want && k < idx.length) {
          var p = ps[idx[k++]];
          if (p.parent) { p.parent = false; p.flash = 1; cur--; }
        }
      } else if (cur < want) {
        while (cur < want && k < idx.length) {
          var q = ps[idx[k++]];
          if (!q.parent) { q.parent = true; q.flash = 0.6; cur++; }
        }
      }
    }
    function update() {
      var N = remaining(st.N0, st.T, st.t);
      ro.N.textContent = fmt(N, 0) + ' 个';
      ro.ratio.textContent = fmt(N / st.N0 * 100, 1) + '%';
      ro.decayed.textContent = fmt(st.N0 - N, 0) + ' 个';
      ro.half.textContent = fmt(st.t / st.T, 2) + ' 个 T';
      syncParticles();
    }
    // 先于 bindCtrls 保存旧 T，供曲线灰虚线参考
    var tEl = ctx.container.querySelector('[data-key="T"]');
    if (tEl) ctx.on(tEl, 'input', function () { refT = st.T; });
    bindCtrls(ctx, st, ['T', 'N0', 't'], function (key) {
      if (key === 'N0') initParticles();
      update();
    });
    on($('[data-act="play"]'), 'click', function () {
      if (playing) { playing = false; this.textContent = '▶ 播放衰变'; return; }
      playing = true; this.textContent = '⏸ 暂停'; st.t = 0;
      ctx.container.querySelector('[data-key="t"]').value = 0;
      ctx.container.querySelector('[data-val="t"]').innerHTML = '0<em>单位</em>';
      update();
    });
    on($('[data-act="reset"]'), 'click', function () {
      playing = false; $('[data-act="play"]').textContent = '▶ 播放衰变';
      st.T = 5; st.N0 = 100; st.t = 10; refT = 5;
      ['T', 'N0', 't'].forEach(function (k) {
        ctx.container.querySelector('[data-key="' + k + '"]').value = st[k];
        ctx.container.querySelector('[data-val="' + k + '"]').innerHTML = fmt(st[k], k === 'N0' ? 0 : 1) + '<em>' + (k === 'N0' ? '个' : '单位') + '</em>';
      });
      initParticles(); update();
    });
    on(win, 'resize', function () { atomsLay = fit($('#ndAtoms'), 290); curveLay = fit($('#ndCurve'), 290); });
    ctx.loop(function (t, dt) {
      if (playing) {
        st.t += dt * 0.008;
        if (st.t > 40) { st.t = 0; }   // 与固定 tMax=40 及 t 滑块上限一致
        ctx.container.querySelector('[data-key="t"]').value = st.t;
        ctx.container.querySelector('[data-val="t"]').innerHTML = fmt(st.t, 1) + '<em>单位</em>';
        update();
      }
      var c = atomsLay.c, w = atomsLay.w, h = atomsLay.h;
      c.clearRect(0, 0, w, h);
      c.fillStyle = '#fdfcff'; c.fillRect(0, 0, w, h);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        var px = 14 + p.x * (w - 28), py = 12 + p.y * (h - 24);
        if (p.flash > 0) {
          c.beginPath(); c.arc(px, py, 9 + 5 * p.flash, 0, Math.PI * 2);
          c.fillStyle = 'rgba(255,211,168,' + (p.flash * 0.55) + ')'; c.fill();
          p.flash -= 0.03;
        }
        c.beginPath(); c.arc(px, py, 4.6, 0, Math.PI * 2);
        c.fillStyle = p.parent ? '#c3a8e6' : '#a8dfc6'; c.fill();
        c.beginPath(); c.arc(px - 1.4, py - 1.4, 1.2, 0, Math.PI * 2);
        c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
      }
      drawDecayCurve(curveLay, st, true, refT);
    });
    update();
  }

  /* ---------------- 1 半衰期 ---------------- */
  function viewHalfLife(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { N0: 100, T: 5, tosses: 0, sum: 0 };
    ctx.container.innerHTML =
      '<div class="rp-wrap nd-wrap">' +
        '<div class="nd-lead"><p>半衰期是<b>大量</b>原子核的统计规律：核数越多，实际衰变曲线越贴近理论曲线；核数少时涨落明显。点击“模拟一个半衰期”相当于给每个核“抛硬币”，观察剩余比例趋近 1/2。</p></div>' +
        '<div class="nd-bar">' +
          ctrlHtml('N0', '原子核数 N₀', 10, 400, 10, 100, '个') +
          ctrlHtml('T', '半衰期 T', 1, 12, 0.5, 5, '单位') +
          '<div class="nd-btnrow"><button type="button" class="nd-btn" data-act="sim">🎲 模拟一个半衰期</button>' +
          '<button type="button" class="nd-btn" data-act="regen">重新生成曲线</button></div>' +
        '</div>' +
        '<div class="nd-grid">' +
          '<section class="nd-card"><h4>理论曲线 vs 随机模拟</h4><div class="nd-card__hint">紫色粗线为理论 N=N₀·(1/2)^(t/T)，淡色阶梯线为 3 次随机模拟</div>' +
            '<canvas id="ndStat" class="nd-cv" style="height:320px" aria-label="统计规律曲线"></canvas></section>' +
          '<section class="nd-card"><h4>“抛硬币”模拟</h4><div class="nd-card__hint">每次模拟让每个核以 1/2 概率保留</div>' +
            '<div class="nd-formula" style="margin:6px 0 16px">本次剩余比例 <span data-last>—</span></div>' +
            '<div class="nd-readouts" style="grid-template-columns:repeat(2,1fr);margin-top:0">' +
              roHtml('avg', '累计平均比例', '—') + roHtml('cnt', '模拟次数', '0') +
            '</div>' +
            '<div class="nd-note" style="margin-top:16px"><b>想一想：</b>为什么单次实验可能偏离 1/2，而大量重复后平均值接近 1/2？这正是统计规律的含义——对少数粒子无意义，对大量粒子才成立。</div>' +
          '</section>' +
        '</div>' +
        '<div class="nd-note"><b>重要：</b>半衰期由原子核自身性质决定，与温度、压强、化学状态等外界条件无关。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#ndStat'), 320);
    var ro = { avg: $('[data-ro="avg"]'), cnt: $('[data-ro="cnt"]') };
    var sims = [], refT = st.T;   // 变化前半衰期（灰虚线参考）
    function regen() {
      sims = [];
      for (var s = 0; s < 3; s++) {
        var times = [];
        // 指数分布抽样：λ=ln2/T（半衰期 T），漏除 ln2 会让模拟线比理论线快约 31%
        for (var i = 0; i < st.N0; i++) times.push(-st.T * Math.log(1 - Math.random()) / Math.LN2);
        times.sort(function (a, b) { return a - b; });
        sims.push(times);
      }
    }
    regen();
    function update() {
      ro.avg.textContent = st.tosses ? fmt(st.sum / st.tosses * 100, 1) + '%' : '—';
      ro.cnt.textContent = st.tosses;
    }
    on($('[data-key="N0"]'), 'input', function () { st.N0 = parseFloat(this.value); regen(); });
    on($('[data-key="T"]'), 'input', function () { refT = st.T; st.T = parseFloat(this.value); regen(); });
    on($('[data-act="regen"]'), 'click', regen);
    on($('[data-act="sim"]'), 'click', function () {
      var left = 0;
      for (var i = 0; i < st.N0; i++) if (Math.random() < 0.5) left++;
      var ratio = left / st.N0;
      st.tosses++; st.sum += ratio;
      $('[data-last]').textContent = fmt(ratio * 100, 1) + '%（' + left + '/' + st.N0 + '）';
      update();
    });
    on(win, 'resize', function () { lay = fit($('#ndStat'), 320); });
    ctx.loop(function () {
      var c = lay.c, w = lay.w, h = lay.h;
      c.clearRect(0, 0, w, h);
      var L = 52, R = w - 18, Tp = 16, B = h - 34;
      var tMax = 40, nMax = 400;   // 固定绝对量程，避免 T 改变时曲线形状完全不变
      function X(t) { return L + t / tMax * (R - L); }
      function Y(n) { return B - n / nMax * (B - Tp); }
      c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
      for (var g = 1; g <= 4; g++) { c.beginPath(); c.moveTo(L, Y(st.N0 * g / 5)); c.lineTo(R, Y(st.N0 * g / 5)); c.stroke(); }
      c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
      c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
      c.fillText('N / 个', 6, 10); c.fillText('t / 单位时间', R - 86, B + 20);
      for (var tk2 = 0; tk2 <= tMax; tk2 += 10) c.fillText(String(tk2), X(tk2) - 6, B + 16);
      for (var nk2 = 0; nk2 <= nMax; nk2 += 100) c.fillText(String(nk2), 14, Y(nk2) + 4);
      // 变化前理论曲线（灰虚线）
      if (Math.abs(refT - st.T) > 1e-9) {
        c.save(); c.strokeStyle = '#aeb8c6'; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath();
        for (var qp = 0; qp <= R - L; qp += 2) {
          var qt = qp / (R - L) * tMax, qn = remaining(st.N0, refT, qt);
          if (!qp) c.moveTo(X(qt), Y(qn)); else c.lineTo(X(qt), Y(qn));
        }
        c.stroke(); c.restore();
      }
      // 随机阶梯线
      var cols = ['#e8dcf2', '#d9e7f2', '#e6e0d0'];
      sims.forEach(function (times, k) {
        c.strokeStyle = cols[k]; c.lineWidth = 1.6; c.beginPath();
        var cur = st.N0, idx = 0;
        c.moveTo(X(0), Y(cur));
        for (var px = 2; px <= R - L; px += 2) {
          var tt = px / (R - L) * tMax;
          while (idx < times.length && times[idx] <= tt) { idx++; cur--; }
          c.lineTo(X(tt), Y(cur));
        }
        c.stroke();
      });
      // 理论曲线
      c.beginPath();
      for (var px2 = 0; px2 <= R - L; px2 += 2) {
        var t2 = px2 / (R - L) * tMax, n2 = remaining(st.N0, st.T, t2);
        if (px2 === 0) c.moveTo(X(t2), Y(n2)); else c.lineTo(X(t2), Y(n2));
      }
      c.strokeStyle = '#b49ad6'; c.lineWidth = 3; c.stroke();
      c.fillStyle = '#7c63a8'; c.font = 'bold 12px sans-serif';
      c.fillText('N₀ = ' + st.N0 + '，T = ' + fmt(st.T, 1), L + 8, Tp + 14);
    });
  }

  /* ---------------- 2 核反应方程 ---------------- */
  function viewEquation(ctx) {
    var on = ctx.on;
    var st = { idx: 0, type: 'a', A: 0, Z: 0 };
    ctx.container.innerHTML =
      '<div class="rp-wrap nd-wrap">' +
        '<div class="nd-lead"><p>选择母核与衰变类型，观察核反应方程如何自动配平。衰变前后<b>质量数守恒、电荷数守恒</b>——这是书写与校验方程的根本依据。</p></div>' +
        '<div class="nd-bar">' +
          '<div class="nd-btnrow"><span style="font-size:14px;color:var(--ink-3)">母核：</span>' +
            NUCLIDES.map(function (m, i) { return '<button type="button" class="nd-btn' + (i === 0 ? ' is-active' : '') + '" data-idx="' + i + '">' + m.name + '</button>'; }).join('') + '</div>' +
          '<div class="nd-btnrow"><span style="font-size:14px;color:var(--ink-3)">衰变类型：</span>' +
            '<button type="button" class="nd-btn is-active" data-type="a">α 衰变</button>' +
            '<button type="button" class="nd-btn" data-type="b">β 衰变</button>' +
            '<button type="button" class="nd-btn" data-type="g">γ 辐射</button></div>' +
        '</div>' +
        '<section class="nd-card"><h4>自动生成的核反应方程</h4><div class="nd-card__hint">上标为质量数 A，下标为电荷数 Z</div>' +
          '<div class="nd-eq" data-eq></div>' +
          '<div class="nd-check" data-check></div>' +
        '</section>' +
        '<section class="nd-card" style="margin-top:16px"><h4>你来配平：填写子核的质量数与电荷数</h4>' +
          '<div class="nd-card__hint">根据两条守恒定律推出空格中的数字，点“校验”查看结果</div>' +
          '<div class="nd-fill">' +
            '<span data-mother></span><span class="nd-arrow">→</span>' +
            '<span class="nd-nu"><sup data-inA>?</sup><sub data-inZ>?</sub><span data-daug>?</span></span>' +
            '<span>+</span><span data-particle></span>' +
            '<button type="button" class="nd-btn" data-act="check">校验配平</button>' +
          '</div>' +
          '<div style="display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap">' +
            '<label style="font-size:14px">子核质量数 A：<input class="nd-input" type="number" data-field="A" min="0" max="300" value="" aria-label="子核质量数"></label>' +
            '<label style="font-size:14px">子核电荷数 Z：<input class="nd-input" type="number" data-field="Z" min="-5" max="120" value="" aria-label="子核电荷数"></label>' +
          '</div>' +
          '<div class="nd-fb" data-fb hidden></div>' +
        '</section>' +
        '<div class="nd-note"><b>规律速记：</b>α 衰变 → A 减 4、Z 减 2；β 衰变 → A 不变、Z 加 1（中子变质子并放出电子）；γ 辐射 → A、Z 均不变，只是原子核从高能态跃迁到低能态。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    function update() {
      var m = NUCLIDES[st.idx], r = decayResult(m, st.type);
      st.A = r.A; st.Z = r.Z;
      $('[data-eq]').innerHTML = nuHtml(m.A, m.Z, symbolOf(m.Z))
        + '<span class="nd-arrow">→</span>' + nuHtml(r.A, r.Z, r.sym)
        + '<span class="nd-arrow">+</span>' + r.particle
        + '<span style="font-size:14px;color:var(--ink-3)">（' + r.label + '）</span>';
      var okA = m.A === r.A + r.pA, okZ = m.Z === r.Z + r.pZ;
      $('[data-check]').innerHTML =
        '<div class="nd-chip ' + (okA ? 'nd-chip--ok' : '') + '">质量数：' + m.A + ' = ' + r.A + ' + ' + r.pA + '　' + (okA ? '✓ 守恒' : '✗') + '</div>' +
        '<div class="nd-chip ' + (okZ ? 'nd-chip--ok' : '') + '">电荷数：' + m.Z + ' = ' + r.Z + ' + (' + r.pZ + ')　' + (okZ ? '✓ 守恒' : '✗') + '</div>';
      $('[data-mother]').innerHTML = nuHtml(m.A, m.Z, symbolOf(m.Z));
      $('[data-daug]').textContent = r.sym;
      $('[data-particle]').innerHTML = r.particle;
      $('[data-fb]').hidden = true;
    }
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-idx]'), function (b) {
      on(b, 'click', function () {
        st.idx = parseInt(b.getAttribute('data-idx'), 10);
        Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-idx]'), function (x) { x.classList.toggle('is-active', x === b); });
        update();
      });
    });
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-type]'), function (b) {
      on(b, 'click', function () {
        st.type = b.getAttribute('data-type');
        Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-type]'), function (x) { x.classList.toggle('is-active', x === b); });
        update();
      });
    });
    on($('[data-act="check"]'), 'click', function () {
      var a = parseFloat(ctx.container.querySelector('[data-field="A"]').value);
      var z = parseFloat(ctx.container.querySelector('[data-field="Z"]').value);
      var fb = $('[data-fb]'); fb.hidden = false;
      if (a === st.A && z === st.Z) {
        fb.className = 'nd-fb nd-fb--ok';
        fb.textContent = '✅ 配平正确！质量数与电荷数均守恒。';
      } else {
        fb.className = 'nd-fb nd-fb--no';
        fb.textContent = '❌ 再想想：由守恒可得 A = ' + st.A + '，Z = ' + st.Z + '。检查上面的两条守恒等式。';
      }
    });
    update();
  }

  /* ---------------- 3 高考题型 ---------------- */
  function viewExam(ctx) {
    var on = ctx.on;
    var st = { N0: 100, T: 5, t: 15 };
    ctx.container.innerHTML =
      '<div class="rp-wrap nd-wrap">' +
        '<div class="nd-lead"><p>点击选项即时判定并查看解析。第 1 题可调 N₀、T、t 实时计算剩余质量；第 2 题考查由质量数、电荷数守恒判断衰变类型。</p></div>' +
        '<div class="nd-q">' +
          '<div class="nd-q__t" data-qt="1">1．（计算）某放射性元素初始质量 100 g，半衰期 5 天，经过 15 天后剩余质量为多少？</div>' +
          '<div class="nd-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            ctrlHtml('N0', '初始质量 m₀', 20, 200, 10, 100, 'g') +
            ctrlHtml('T', '半衰期 T', 1, 12, 0.5, 5, '天') +
            ctrlHtml('t', '经过时间 t', 0, 40, 1, 15, '天') +
            '<div class="nd-formula" style="font-size:15px">m = <span data-m>—</span> g</div>' +
          '</div>' +
          '<div class="nd-opts" data-q="1">' +
            '<button type="button" class="nd-opt" data-ans="A">A．50 g</button>' +
            '<button type="button" class="nd-opt" data-ans="B">B．25 g</button>' +
            '<button type="button" class="nd-opt" data-ans="C">C．12.5 g</button>' +
            '<button type="button" class="nd-opt" data-ans="D">D．6.25 g</button>' +
          '</div><div class="nd-explain" data-exp="1" hidden></div>' +
        '</div>' +
        '<div class="nd-q">' +
          '<div class="nd-q__t">2．（判断）核反应 ²³⁸₉₂U → ²³⁴₉₀Th + X 中，X 是什么粒子？</div>' +
          '<div class="nd-opts" data-q="2">' +
            '<button type="button" class="nd-opt" data-ans="A">A．α 粒子（⁴₂He）</button>' +
            '<button type="button" class="nd-opt" data-ans="B">B．电子（⁰₋₁e）</button>' +
            '<button type="button" class="nd-opt" data-ans="C">C．质子（¹₁H）</button>' +
            '<button type="button" class="nd-opt" data-ans="D">D．中子（¹₀n）</button>' +
          '</div>' +
          '<div class="nd-eq" data-eq2 style="margin-top:16px;font-size:19px"></div>' +
          '<div class="nd-explain" data-exp="2" hidden></div>' +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var exp = {
      '1': { right: 'C', text: '' },
      '2': { right: 'A', text: '由质量数守恒：238 = 234 + A，得 A = 4；由电荷数守恒：92 = 90 + Z，得 Z = 2。故 X 为 ⁴₂He，即 α 粒子。' }
    };
    $('[data-eq2]').innerHTML = nuHtml(238, 92, 'U') + '<span class="nd-arrow">→</span>'
      + nuHtml(234, 90, 'Th') + '<span class="nd-arrow">+</span>' + nuHtml(4, 2, 'He');
    function update() {
      var m = remaining(st.N0, st.T, st.t);
      $('[data-m]').textContent = m < 0.01 ? m.toExponential(2) : fmt(m, 2);
      $('[data-val="N0"]').innerHTML = fmt(st.N0, 0) + '<em>g</em>';
      $('[data-val="T"]').innerHTML = fmt(st.T, 1) + '<em>天</em>';
      $('[data-val="t"]').innerHTML = fmt(st.t, 0) + '<em>天</em>';
      // 题干、选项与答案随 N₀ / T / t 动态生成
      $('[data-qt="1"]').textContent = '1．（计算）某放射性元素初始质量 ' + fmt(st.N0, 0) + ' g，半衰期 '
        + fmt(st.T, 1) + ' 天，经过 ' + fmt(st.t, 0) + ' 天后剩余质量为多少？';
      var cand = [m], extra = [m / 2, m * 2, m / 4, st.N0 / 2, st.N0, m * 4, m * 8, st.N0 / 4];
      function near(a, b) { return Math.abs(a - b) <= Math.max(1e-12, Math.abs(a) * 0.01, Math.abs(b) * 0.01); }
      function push(v) {
        for (var z = 0; z < cand.length; z++) if (near(cand[z], v)) return;
        if (cand.length < 4) cand.push(v);
      }
      function mtxt(v) { return v < 0.01 ? v.toExponential(2) : fmt(v, 2); }
      for (var i = 0; i < extra.length && cand.length < 4; i++) push(extra[i]);
      var letters = ['A', 'B', 'C', 'D'];
      for (var k = 0; k < 4; k++) {
        $('[data-q="1"] [data-ans="' + letters[k] + '"]').textContent = letters[k] + '．' + mtxt(cand[k]) + ' g';
        if (near(cand[k], m)) exp['1'].right = letters[k];
      }
      exp['1'].text = '经过 t/T = ' + fmt(st.t / st.T, 2) + ' 个半衰期，m = ' + fmt(st.N0, 0)
        + ' × (1/2)^(' + fmt(st.t / st.T, 2) + ') = ' + mtxt(m) + ' g，应选 ' + exp['1'].right
        + '。每多一个半衰期，剩余质量减半。';
      Array.prototype.forEach.call($('[data-q="1"]').querySelectorAll('.nd-opt'), function (x) { x.classList.remove('is-right', 'is-wrong'); });
      $('[data-exp="1"]').hidden = true;
    }
    bindCtrls(ctx, st, ['N0', 'T', 't'], update);
    ctx.container.querySelector('[data-val="N0"]').innerHTML = '100<em>g</em>';
    ctx.container.querySelector('[data-val="T"]').innerHTML = '5.0<em>天</em>';
    ctx.container.querySelector('[data-val="t"]').innerHTML = '15<em>天</em>';
    update();
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-q]'), function (box) {
      var q = box.getAttribute('data-q');
      Array.prototype.forEach.call(box.querySelectorAll('.nd-opt'), function (b) {
        on(b, 'click', function () {
          var ans = b.getAttribute('data-ans');
          Array.prototype.forEach.call(box.querySelectorAll('.nd-opt'), function (x) {
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
