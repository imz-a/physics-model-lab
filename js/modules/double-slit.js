/* ============================================================
 * double-slit.js — 双缝干涉（光学）
 * 契约：IIFE + window.ModelLab.modules['double-slit']，零依赖，file:// 可用。
 * 物理：Δx = Lλ/d；I(x) ∝ cos²(π d x / (λ L))；亮纹 Δr = kλ。
 * 单位：λ 用 nm，d 用 mm，L 用 m，Δx 用 mm（Δx = L·λ/nm / d/mm × 10⁻³）。
 * 4 个子标签：0 基本模型 / 1 条纹间距 / 2 实验拓展 / 3 高考题型
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = (global.ModelLab = global.ModelLab || {});
  NS.modules = NS.modules || {};

  var CSS_ID = 'lm-css-double-slit';
  var CSS = [
    '.ds-wrap{--tint:#f0d97a;--tint-soft:#FFFCF0;color:var(--ink);font-size:16px;}',
    '.ds-wrap *{box-sizing:border-box;}',
    '.ds-lead{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:16px;}',
    '.ds-lead p{max-width:780px;color:var(--ink-2);font-size:15px;line-height:1.7;}',
    '.ds-formula{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--tint);border-radius:999px;background:var(--tint-soft);font-size:17px;font-weight:700;white-space:nowrap;}',
    '.ds-formula small{font-weight:400;color:var(--ink-2);font-size:12px;}',
    '.ds-bar{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:16px;}',
    '.ds-ctrl{flex:1 1 190px;min-width:170px;}',
    '.ds-ctrl__top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px;}',
    '.ds-ctrl__top label{font-size:14px;color:var(--ink-2);font-weight:600;}',
    '.ds-ctrl__val{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.ds-ctrl__val em{font-style:normal;font-size:12px;color:var(--ink-3);font-weight:400;margin-left:2px;}',
    '.ds-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:99px;background:#eef2f6;outline:0;margin:4px 0;}',
    '.ds-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.ds-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.ds-range--wave{background:linear-gradient(90deg,#8f7fd6,#5b8fe0,#57c2b4,#a6d16b,#f2d35e,#ef9a52,#e4605f);}',
    '.ds-btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
    '.ds-btn{min-height:40px;padding:8px 16px;border:1px solid var(--line-2);border-radius:999px;background:#fff;color:var(--ink-2);font-size:14px;font-weight:600;transition:background .15s,border-color .15s;white-space:nowrap;}',
    '.ds-btn:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.ds-btn.is-active{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);box-shadow:inset 0 0 0 1px var(--tint);}',
    '.ds-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}',
    '.ds-card{background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);padding:16px 18px;min-width:0;}',
    '.ds-card--wide{grid-column:1/-1;}',
    '.ds-card h4{font-size:16px;font-weight:700;margin-bottom:4px;}',
    '.ds-card__hint{font-size:13px;color:var(--ink-3);margin-bottom:12px;}',
    '.ds-cv{width:100%;display:block;border-radius:10px;background:#fff;}',
    '.ds-readouts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;}',
    '.ds-ro{padding:14px 16px;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;text-align:center;}',
    '.ds-ro span{display:block;font-size:13px;color:var(--ink-3);}',
    '.ds-ro b{display:block;margin-top:4px;font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.ds-ro small{font-size:12px;color:var(--ink-3);font-weight:400;}',
    '.ds-note{margin-top:14px;padding:12px 16px;border-left:4px solid var(--tint);background:var(--tint-soft);border-radius:0 10px 10px 0;font-size:14px;color:var(--ink-2);}',
    '.ds-note b{color:var(--ink);}',
    '.ds-curvegrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}',
    '.ds-mini{padding:14px;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;}',
    '.ds-mini h5{font-size:14px;font-weight:700;margin:0 0 4px;}',
    '.ds-mini p{font-size:12px;color:var(--ink-3);margin-bottom:8px;}',
    '.ds-q{padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:14px;}',
    '.ds-q__t{font-size:16px;font-weight:700;line-height:1.6;}',
    '.ds-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;}',
    '.ds-opt{min-height:46px;padding:10px 14px;text-align:left;border:1px solid var(--line-2);border-radius:10px;background:#fff;font-size:15px;color:var(--ink-2);transition:background .15s,border-color .15s;}',
    '.ds-opt:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.ds-opt.is-right{background:#eefaf3;border-color:#a8e0c4;color:#2f8a5f;font-weight:700;}',
    '.ds-opt.is-wrong{background:#fff3f4;border-color:#ffc9cf;color:#c1616c;}',
    '.ds-explain{margin-top:12px;padding:12px 14px;background:#f7fafc;border-radius:10px;font-size:14px;color:var(--ink-2);line-height:1.7;}',
    '@media(max-width:1100px){.ds-grid,.ds-curvegrid{grid-template-columns:1fr;}.ds-readouts{grid-template-columns:repeat(2,1fr);}}',
    '@media(max-width:760px){.ds-opts{grid-template-columns:1fr;}}'
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
  function dxOf(lambdaNm, dMm, L) { return L * lambdaNm / dMm * 1e-3; } // mm
  // 波长 → 柔和 RGB（可见光 380–780nm）
  function wlRgb(wl, soft) {
    var r = 0, g = 0, b = 0, f = 1;
    if (wl < 440) { r = -(wl - 440) / 60; b = 1; }
    else if (wl < 490) { g = (wl - 440) / 50; b = 1; }
    else if (wl < 510) { g = 1; b = -(wl - 510) / 20; }
    else if (wl < 580) { r = (wl - 510) / 70; g = 1; }
    else if (wl < 645) { r = 1; g = -(wl - 645) / 65; }
    else { r = 1; }
    if (wl < 420) f = 0.35 + 0.65 * (wl - 380) / 40;
    else if (wl > 700) f = 0.35 + 0.65 * (780 - wl) / 80;
    // 粉彩化：向浅色靠拢，保持红/紫可辨但避免荧光、霓虹感
    var mix = soft === undefined ? 0.10 : soft;
    var base = 0.5;
    return [
      Math.round(((base + (1 - base) * r * f) * (1 - mix) + mix) * 255),
      Math.round(((base + (1 - base) * g * f) * (1 - mix) + mix) * 255),
      Math.round(((base + (1 - base) * b * f) * (1 - mix) + mix) * 255)
    ];
  }
  function rgbStr(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a === undefined ? 1 : a) + ')'; }

  NS.modules['double-slit'] = {
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
        var w = cv.clientWidth || 460, h = cssH || cv.clientHeight || 240;
        cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
        var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { c: c, w: w, h: h };
      }
      var ctx = { container: container, doc: doc, win: win, on: on, loop: loop, later: later, fit: fit };
      var views = [viewBasic, viewSpacing, viewExperiment, viewExam];
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

  function ctrlHtml(key, label, min, max, step, val, unit, wave) {
    return '<div class="ds-ctrl"><div class="ds-ctrl__top"><label for="dsS' + key + '">' + label + '</label>' +
      '<span class="ds-ctrl__val" data-val="' + key + '">' + fmt(val, step < 1 ? 1 : 0) + '<em>' + unit + '</em></span></div>' +
      '<input id="dsS' + key + '" class="ds-range' + (wave ? ' ds-range--wave' : '') + '" type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
  }
  function roHtml(key, label, val) {
    return '<div class="ds-ro"><span>' + label + '</span><b data-ro="' + key + '">' + val + '</b></div>';
  }
  function bindCtrls(ctx, st, onChange) {
    ['lambda', 'd', 'L'].forEach(function (key) {
      var el = ctx.container.querySelector('[data-key="' + key + '"]');
      if (!el) return;
      ctx.on(el, 'input', function () {
        st[key] = parseFloat(el.value);
        var e = ctx.container.querySelector('[data-val="' + key + '"]');
        if (e) e.innerHTML = fmt(st[key], key === 'lambda' ? 0 : (key === 'L' ? 1 : 2)) + '<em>' + (key === 'lambda' ? 'nm' : key === 'd' ? 'mm' : 'm') + '</em>';
        if (onChange) onChange(key);
      });
    });
  }

  // 画条纹带：mode='mono' 单色，'white' 白光
  function drawFringe(c, w, h, st, mode, marks) {
    c.clearRect(0, 0, w, h);
    var bandY = 30, bandH = h - 70;
    var Xmax = 6; // 观测窗 ±6 mm
    c.fillStyle = '#fbfcfe'; c.fillRect(0, bandY, w, bandH);
    var stepPx = 2;
    for (var px = 0; px < w; px += stepPx) {
      var xmm = -Xmax + (px / w) * 2 * Xmax;
      var xm = xmm * 1e-3;
      var R = 0, G = 0, B = 0;
      if (mode === 'white') {
        var wsum = 0;
        for (var wl = 400; wl <= 700; wl += 6) {
          var phi = Math.PI * (st.d * 1e-3) * xm / ((wl * 1e-9) * st.L);
          var I = Math.pow(Math.cos(phi), 2);
          var col = wlRgb(wl, 0);
          R += I * col[0]; G += I * col[1]; B += I * col[2]; wsum += 1;
        }
        R /= wsum; G /= wsum; B /= wsum;
        var bright = Math.min(1, 0.18 + Math.max(R, G, B) / 210);
        c.fillStyle = 'rgb(' + Math.round(R * bright + 255 * (1 - bright)) + ',' + Math.round(G * bright + 255 * (1 - bright)) + ',' + Math.round(B * bright + 255 * (1 - bright)) + ')';
      } else {
        var phi2 = Math.PI * (st.d * 1e-3) * xm / ((st.lambda * 1e-9) * st.L);
        var I2 = Math.pow(Math.cos(phi2), 2);
        var col2 = wlRgb(st.lambda, 0.14);
        var lum = 0.16 + 0.84 * I2;
        c.fillStyle = 'rgb(' + Math.round(255 - (255 - col2[0]) * lum) + ',' + Math.round(255 - (255 - col2[1]) * lum) + ',' + Math.round(255 - (255 - col2[2]) * lum) + ')';
      }
      c.fillRect(px, bandY, stepPx + 1, bandH);
    }
    c.strokeStyle = '#dce4ec'; c.lineWidth = 1; c.strokeRect(0.5, bandY + 0.5, w - 1, bandH - 1);
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('屏上位置 x（观测窗 ±6 mm）', 6, bandY - 10);
    // 强度曲线
    var cy0 = h - 34, amp = 26;
    c.strokeStyle = mode === 'white' ? '#cfc4e8' : rgbStr(wlRgb(st.lambda, 0.05)); c.lineWidth = 2;
    c.beginPath();
    for (var px2 = 0; px2 <= w; px2 += 2) {
      var xm2 = (-Xmax + (px2 / w) * 2 * Xmax) * 1e-3;
      var ph = Math.PI * (st.d * 1e-3) * xm2 / ((st.lambda * 1e-9) * st.L);
      var I3 = Math.pow(Math.cos(ph), 2);
      var yy = cy0 - I3 * amp;
      if (px2 === 0) c.moveTo(px2, yy); else c.lineTo(px2, yy);
    }
    c.stroke();
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, cy0); c.lineTo(w, cy0); c.stroke();
    c.fillStyle = '#8b95a3'; c.fillText('光强 I ∝ cos²', 6, h - 2);
    if (marks && marks.length) {
      marks.forEach(function (m, i) {
        var mx = (m + Xmax) / (2 * Xmax) * w;
        c.strokeStyle = '#e0606c'; c.lineWidth = 2; c.setLineDash([4, 3]);
        c.beginPath(); c.moveTo(mx, bandY); c.lineTo(mx, bandY + bandH); c.stroke(); c.setLineDash([]);
        c.fillStyle = '#c1616c'; c.font = 'bold 13px sans-serif';
        c.fillText((i === 0 ? '①' : '②'), mx + 4, bandY + 16);
      });
    }
  }

  /* ---------------- 0 基本模型 ---------------- */
  function viewBasic(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { lambda: 550, d: 0.4, L: 1.5 };
    ctx.container.innerHTML =
      '<div class="ds-wrap">' +
        '<div class="ds-lead"><p>调节波长、双缝间距与缝屏距离，观察条纹如何真实变化。波长改变时条纹颜色随之改变（紫 → 红）；波长越长、缝越近、屏越远，条纹越宽。</p>' +
          '<span class="ds-formula">Δx = Lλ / d <small>条纹间距</small></span></div>' +
        '<div class="ds-bar">' +
          ctrlHtml('lambda', '波长 λ', 400, 700, 5, 550, 'nm', true) +
          ctrlHtml('d', '双缝间距 d', 0.1, 1, 0.01, 0.4, 'mm') +
          ctrlHtml('L', '缝屏距离 L', 0.5, 3, 0.1, 1.5, 'm') +
          '<div class="ds-btnrow"><button type="button" class="ds-btn" data-act="reset">恢复默认</button></div>' +
        '</div>' +
        '<div class="ds-grid">' +
          '<section class="ds-card"><h4>实验装置与波前叠加</h4><div class="ds-card__hint">两列子波在空间中叠加，屏上形成明暗条纹</div>' +
            '<canvas id="dsWave" class="ds-cv" style="height:250px" aria-label="双缝波前动画"></canvas></section>' +
          '<section class="ds-card"><h4>屏上干涉条纹</h4><div class="ds-card__hint">下方曲线为光强分布 I ∝ cos²(πdx/λL)</div>' +
            '<canvas id="dsFr" class="ds-cv" style="height:250px" aria-label="干涉条纹"></canvas></section>' +
        '</div>' +
        '<div class="ds-readouts">' +
          roHtml('dx', '条纹间距 Δx', '—') + roHtml('n', '可见亮纹数', '—') +
          roHtml('color', '光色', '—') + roHtml('formula', '亮纹条件', 'Δr = kλ') +
        '</div>' +
        '<div class="ds-note"><b>规律：</b>Δx = Lλ/d。红光波长比紫光长，故红光条纹更宽；增大 L、减小 d 都能加宽条纹。相邻亮纹（或暗纹）间距相等。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var waveLay = fit($('#dsWave'), 250), frLay = fit($('#dsFr'), 250);
    var ro = { dx: $('[data-ro="dx"]'), n: $('[data-ro="n"]'), color: $('[data-ro="color"]') };
    var swatch;
    function update() {
      var dx = dxOf(st.lambda, st.d, st.L);
      ro.dx.innerHTML = fmt(dx, 2) + ' <small>mm</small>';
      ro.n.textContent = Math.max(1, Math.round(12 / dx));
      var col = wlRgb(st.lambda, 0);
      ro.color.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:rgb(' + col.join(',') + ');vertical-align:-2px;margin-right:6px"></span>' + colorName(st.lambda);
      var dot = $('[data-val="lambda"]');
      if (dot) dot.innerHTML = st.lambda + '<em>nm</em>';
    }
    bindCtrls(ctx, st, function (key) {
      if (key === 'lambda') {
        var el = ctx.container.querySelector('[data-key="lambda"]');
        el.classList.add('ds-range--wave');
      }
      update();
    });
    on($('[data-act="reset"]'), 'click', function () {
      st.lambda = 550; st.d = 0.4; st.L = 1.5;
      ['lambda', 'd', 'L'].forEach(function (k) {
        var el = ctx.container.querySelector('[data-key="' + k + '"]');
        el.value = st[k];
        ctx.container.querySelector('[data-val="' + k + '"]').innerHTML = fmt(st[k], k === 'lambda' ? 0 : k === 'L' ? 1 : 2) + '<em>' + (k === 'lambda' ? 'nm' : k === 'd' ? 'mm' : 'm') + '</em>';
      });
      update();
    });
    on(win, 'resize', function () { waveLay = fit($('#dsWave'), 250); frLay = fit($('#dsFr'), 250); });

    ctx.loop(function (t) {
      drawWave(waveLay, st, t);
      drawFringe(frLay.c, frLay.w, frLay.h, st, 'mono', null);
    });
    update();
  }
  function colorName(wl) {
    return wl < 440 ? '紫光' : wl < 490 ? '蓝光' : wl < 510 ? '青光' : wl < 580 ? '绿光' : wl < 645 ? '黄光' : '红光';
  }
  function drawWave(lay, st, t) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var midY = h / 2;
    var sx = 40, slitX = w * 0.40, screenX = w - 34;
    var s1y = midY - 26, s2y = midY + 26;
    // 入射平面波
    c.strokeStyle = '#f0d97a'; c.lineWidth = 2;
    var col = wlRgb(st.lambda, 0.05);
    c.strokeStyle = rgbStr(col, 0.8);
    for (var i = 0; i < 5; i++) {
      var xx = sx + ((i * 34 + t * 0.05) % 136);
      c.beginPath(); c.moveTo(xx, midY - 54); c.lineTo(xx, midY + 54); c.stroke();
    }
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif'; c.fillText('光源', sx - 12, midY - 62);
    // 双缝挡板
    c.fillStyle = '#cbd6e2';
    c.fillRect(slitX - 3, 20, 6, s1y - 26 - 20);
    c.fillRect(slitX - 3, s1y + 12, 6, s2y - s1y - 24);
    c.fillRect(slitX - 3, s2y + 14, 6, h - 20 - (s2y + 14));
    c.fillStyle = '#8b95a3'; c.fillText('双缝', slitX - 14, 16);
    // 两列子波圆弧
    var maxR = screenX - slitX + 40;
    for (var s = 0; s < 2; s++) {
      var cyy = s === 0 ? s1y : s2y;
      for (var k = 0; k < 7; k++) {
        var r = ((t * 0.06 + k * 34) % maxR);
        if (r < 6) continue;
        c.beginPath(); c.arc(slitX, cyy, r, -Math.PI / 2, Math.PI / 2);
        c.strokeStyle = rgbStr(col, 0.28 * (1 - r / maxR));
        c.lineWidth = 1.6; c.stroke();
      }
    }
    // 屏
    c.strokeStyle = '#b7c4d1'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(screenX, 18); c.lineTo(screenX, h - 18); c.stroke();
    c.fillStyle = '#8b95a3'; c.fillText('屏', screenX + 8, 16);
    // 屏上强度（在屏左侧画小色块）
    for (var yy = 24; yy < h - 24; yy += 3) {
      var xmm = (yy - midY) / (h - 48) * 12;
      var ph = Math.PI * (st.d * 1e-3) * (xmm * 1e-3) / ((st.lambda * 1e-9) * st.L);
      var I = Math.pow(Math.cos(ph), 2);
      var lum = 0.15 + 0.85 * I;
      c.fillStyle = 'rgb(' + [0, 1, 2].map(function (q) { return Math.round(255 - (255 - col[q]) * lum); }).join(',') + ')';
      c.fillRect(screenX - 6, yy, 5, 3);
    }
  }

  /* ---------------- 1 条纹间距 ---------------- */
  function viewSpacing(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { lambda: 550, d: 0.4, L: 1.5 };
    ctx.container.innerHTML =
      '<div class="ds-wrap">' +
        '<div class="ds-lead"><p>用<b>控制变量法</b>验证 Δx 与各量的关系：Δx 与 λ 成正比、与 L 成正比、与 d 成反比。拖动滑块，观察三个图上的工作点如何移动。</p></div>' +
        '<div class="ds-bar">' +
          ctrlHtml('lambda', '波长 λ', 400, 700, 5, 550, 'nm', true) +
          ctrlHtml('d', '双缝间距 d', 0.1, 1, 0.01, 0.4, 'mm') +
          ctrlHtml('L', '缝屏距离 L', 0.5, 3, 0.1, 1.5, 'm') +
        '</div>' +
        '<div class="ds-curvegrid">' +
          '<div class="ds-mini"><h5>Δx – λ（d、L 固定）</h5><p>正比：波长越长条纹越宽</p><canvas class="ds-cv cvL" style="height:200px"></canvas></div>' +
          '<div class="ds-mini"><h5>Δx – L（λ、d 固定）</h5><p>正比：屏越远条纹越宽</p><canvas class="ds-cv cvD" style="height:200px"></canvas></div>' +
          '<div class="ds-mini"><h5>Δx – d（λ、L 固定）</h5><p>反比：缝间距越大条纹越窄</p><canvas class="ds-cv cvK" style="height:200px"></canvas></div>' +
        '</div>' +
        '<div class="ds-readouts"><div class="ds-ro"><span>当前条纹间距 Δx</span><b data-ro="dx">—</b></div>' +
          '<div class="ds-ro"><span>λ : d : L</span><b style="font-size:17px" data-ro="ratio">—</b></div>' +
          '<div class="ds-ro"><span>对照（λ 加倍）</span><b data-ro="dbl">—</b></div>' +
          '<div class="ds-ro"><span>规律</span><b style="font-size:17px">Δx = Lλ/d</b></div></div>' +
        '<div class="ds-note"><b>实验结论：</b>保持其他量不变，只改变一个量，是发现物理规律的常用方法。红光（λ 大）条纹宽，紫光（λ 小）条纹窄。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var cvs = { l: fit($('.cvL'), 200), d: fit($('.cvD'), 200), k: fit($('.cvK'), 200) };
    var ref = { lambda: st.lambda, d: st.d, L: st.L };  // 变化前参数快照
    // 先于 bindCtrls 注册：在 st 被改写前保存旧值
    ['lambda', 'd', 'L'].forEach(function (key) {
      var el = ctx.container.querySelector('[data-key="' + key + '"]');
      if (el) ctx.on(el, 'input', function () { ref.lambda = st.lambda; ref.d = st.d; ref.L = st.L; });
    });
    function update() {
      var dx = dxOf(st.lambda, st.d, st.L);
      $('[data-ro="dx"]').innerHTML = fmt(dx, 2) + ' <small>mm</small>';
      $('[data-ro="ratio"]').textContent = st.lambda + ' : ' + fmt(st.d, 2) + ' : ' + fmt(st.L, 1);
      $('[data-ro="dbl"]').innerHTML = fmt(dxOf(Math.min(700, st.lambda * 2), st.d, st.L), 2) + ' <small>mm</small>';
      Object.keys(cvs).forEach(function (key) { drawCurve(cvs[key], key, st, ref); });
    }
    bindCtrls(ctx, st, update);
    on(win, 'resize', function () {
      cvs = { l: fit($('.cvL'), 200), d: fit($('.cvD'), 200), k: fit($('.cvK'), 200) }; update();
    });
    update();
  }
  function drawCurve(lay, type, st, ref) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 40, R = w - 14, Tp = 14, B = h - 30;
    var xmin, xmax, fn, curX, label;
    if (type === 'l') {
      xmin = 400; xmax = 700; curX = st.lambda; label = 'λ/nm';
      fn = function (x) { return dxOf(x, st.d, st.L); };
    } else if (type === 'd') {
      xmin = 0.5; xmax = 3; curX = st.L; label = 'L/m';
      fn = function (x) { return dxOf(st.lambda, st.d, x); };
    } else {
      xmin = 0.1; xmax = 1; curX = st.d; label = 'd/mm';
      fn = function (x) { return dxOf(st.lambda, x, st.L); };
    }
    // 固定绝对量程：λ=700nm、d=0.1mm、L=3m 时 Δx≈21mm，取 22mm；不随当前参数自归一
    var yMax = 22;
    function X(x) { return L + (x - xmin) / (xmax - xmin) * (R - L); }
    function Y(y) { return B - Math.min(1.05, y / yMax) * (B - Tp); }
    function fnRef(x) {
      if (type === 'l') return dxOf(x, ref.d, ref.L);
      if (type === 'd') return dxOf(ref.lambda, ref.d, x);
      return dxOf(ref.lambda, x, ref.L);
    }
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var gy = Y(g * 5);
      c.beginPath(); c.moveTo(L, gy); c.lineTo(R, gy); c.stroke();
      c.fillStyle = '#aab4c0'; c.font = '10px sans-serif'; c.fillText(String(g * 5), 14, gy + 4);
    }
    for (var gx = 1; gx <= 4; gx++) {
      var xv = xmin + (xmax - xmin) * gx / 5;
      c.beginPath(); c.moveTo(X(xv), Tp); c.lineTo(X(xv), B); c.stroke();
    }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
    // 变化前曲线（灰虚线，参数快照）
    if (ref) {
      c.save(); c.strokeStyle = '#aeb8c6'; c.lineWidth = 2; c.setLineDash([5, 5]); c.beginPath();
      for (var rj = 0; rj <= 60; rj++) {
        var rx = xmin + (xmax - xmin) * rj / 60;
        if (!rj) c.moveTo(X(rx), Y(fnRef(rx))); else c.lineTo(X(rx), Y(fnRef(rx)));
      }
      c.stroke(); c.restore();
    }
    c.beginPath();
    for (var j = 0; j <= 60; j++) {
      var xx = xmin + (xmax - xmin) * j / 60;
      if (!j) c.moveTo(X(xx), Y(fn(xx))); else c.lineTo(X(xx), Y(fn(xx)));
    }
    c.strokeStyle = '#e8a06f'; c.lineWidth = 3; c.stroke();
    var px = X(curX), py = Y(fn(curX));
    c.save(); c.strokeStyle = '#e8b884'; c.setLineDash([4, 3]);
    c.beginPath(); c.moveTo(px, py); c.lineTo(px, B); c.stroke(); c.restore();
    c.beginPath(); c.arc(px, py, 10, 0, Math.PI * 2); c.fillStyle = 'rgba(255,179,186,.4)'; c.fill();
    c.beginPath(); c.arc(px, py, 5, 0, Math.PI * 2); c.fillStyle = '#e0606c'; c.fill();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('Δx/mm', 4, Tp + 6); c.fillText(label, R - 30, B + 20);
    c.fillText('— 当前 ┄ 变化前', L + 6, Tp + 10);
    c.fillStyle = '#c1616c'; c.font = 'bold 12px sans-serif';
    c.fillText(fmt(fn(curX), 2), Math.min(px + 8, R - 34), Math.max(py - 8, Tp + 12));
  }

  /* ---------------- 2 实验拓展 ---------------- */
  function viewExperiment(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { lambda: 550, d: 0.4, L: 1.5, mode: 'mono', marks: [] };
    ctx.container.innerHTML =
      '<div class="ds-wrap">' +
        '<div class="ds-lead"><p>切换<b>白光干涉</b>观察中央白色亮纹与两侧彩色条纹；还可以像做实验一样，在条纹上点击两个亮纹位置，测量条纹间距并与理论值 Δx = Lλ/d 对照。</p></div>' +
        '<div class="ds-bar">' +
          '<div class="ds-btnrow"><button type="button" class="ds-btn is-active" data-mode="mono">单色光</button>' +
          '<button type="button" class="ds-btn" data-mode="white">白光干涉</button></div>' +
          '<div class="ds-btnrow"><button type="button" class="ds-btn" data-act="clear">清除测量标记</button></div>' +
          ctrlHtml('lambda', '波长 λ', 400, 700, 5, 550, 'nm', true) +
          ctrlHtml('d', '双缝间距 d', 0.1, 1, 0.01, 0.4, 'mm') +
          ctrlHtml('L', '缝屏距离 L', 0.5, 3, 0.1, 1.5, 'm') +
        '</div>' +
        '<section class="ds-card ds-card--wide"><h4>条纹观测与测量</h4><div class="ds-card__hint">在条纹带上点击两次取两个亮纹位置（白光模式下测量以 550nm 估算）</div>' +
          '<canvas id="dsExp" class="ds-cv" style="height:290px" aria-label="条纹观测与测量"></canvas></section>' +
        '<div class="ds-readouts">' +
          roHtml('dx', '理论 Δx', '—') + roHtml('meas', '实测间距', '—') + roHtml('err', '相对误差', '—') + roHtml('note', '白光特征', '中央白纹') +
        '</div>' +
        '<div class="ds-note"><b>白光干涉：</b>各色光条纹间距不同（红宽紫窄），只有中央亮纹处各种色光都加强，叠加为白色；离开中央，不同颜色的亮纹位置逐渐错开，形成彩色条纹。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#dsExp'), 290);
    var ro = { dx: $('[data-ro="dx"]'), meas: $('[data-ro="meas"]'), err: $('[data-ro="err"]'), note: $('[data-ro="note"]') };
    function update() {
      var dx = dxOf(st.lambda, st.d, st.L);
      ro.dx.innerHTML = fmt(dx, 2) + ' <small>mm</small>';
      ro.note.textContent = st.mode === 'white' ? '中央白、两侧彩色' : '单一颜色等间距';
      measure();
    }
    function measure() {
      if (st.marks.length === 2) {
        var m = Math.abs(st.marks[1] - st.marks[0]);
        var dx = dxOf(st.mode === 'white' ? 550 : st.lambda, st.d, st.L);
        ro.meas.innerHTML = fmt(m, 2) + ' <small>mm</small>';
        ro.err.textContent = fmt(Math.abs(m - dx) / dx * 100, 1) + '%';
      } else {
        ro.meas.textContent = '—'; ro.err.textContent = '—';
      }
    }
    bindCtrls(ctx, st, update);
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-mode]'), function (b) {
      on(b, 'click', function () {
        st.mode = b.getAttribute('data-mode');
        Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-mode]'), function (x) { x.classList.toggle('is-active', x === b); });
        update();
      });
    });
    on($('[data-act="clear"]'), 'click', function () { st.marks = []; measure(); });
    on($('#dsExp'), 'pointerdown', function (e) {
      var r = this.getBoundingClientRect();
      var xmm = -6 + (e.clientX - r.left) / r.width * 12;
      st.marks.push(xmm);
      if (st.marks.length > 2) st.marks.shift();
      measure();
    });
    on(win, 'resize', function () { lay = fit($('#dsExp'), 290); });
    ctx.loop(function () {
      drawFringe(lay.c, lay.w, lay.h, st, st.mode, st.marks);
    });
    update();
  }

  /* ---------------- 3 高考题型 ---------------- */
  function viewExam(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { lambda: 600, d: 0.3, L: 2.0 };   // 与滑块 value=600、题干与选项口径一致
    ctx.container.innerHTML =
      '<div class="ds-wrap">' +
        '<div class="ds-lead"><p>点击选项即时判定并查看解析。第 2 题可调参数，实时算出条纹间距。</p></div>' +
        '<div class="ds-q">' +
          '<div class="ds-q__t">1．（定性比较）用红光和紫光分别做双缝干涉实验，其他条件相同，哪种光的条纹间距更大？</div>' +
          '<div class="ds-opts" data-q="1">' +
            '<button type="button" class="ds-opt" data-ans="A">A．红光</button>' +
            '<button type="button" class="ds-opt" data-ans="B">B．紫光</button>' +
            '<button type="button" class="ds-opt" data-ans="C">C．一样大</button>' +
            '<button type="button" class="ds-opt" data-ans="D">D．无法判断</button>' +
          '</div><div class="ds-explain" data-exp="1" hidden></div>' +
        '</div>' +
        '<div class="ds-q">' +
          '<div class="ds-q__t" data-qt="2">2．（计算）波长 λ = 600 nm、双缝间距 d = 0.3 mm、缝屏距离 L = 2 m，条纹间距 Δx 约为多少？</div>' +
          '<div class="ds-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            ctrlHtml('lambda', '波长 λ', 400, 700, 5, 600, 'nm') +
            ctrlHtml('d', '双缝间距 d', 0.1, 1, 0.01, 0.3, 'mm') +
            ctrlHtml('L', '缝屏距离 L', 0.5, 3, 0.1, 2, 'm') +
            '<div class="ds-formula" style="font-size:15px">Δx = <span data-dx>—</span> mm</div>' +
          '</div>' +
          '<div class="ds-opts" data-q="2">' +
            '<button type="button" class="ds-opt" data-ans="A">A．1 mm</button>' +
            '<button type="button" class="ds-opt" data-ans="B">B．2 mm</button>' +
            '<button type="button" class="ds-opt" data-ans="C">C．4 mm</button>' +
            '<button type="button" class="ds-opt" data-ans="D">D．8 mm</button>' +
          '</div><div class="ds-explain" data-exp="2" hidden></div>' +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var exp = {
      '1': { right: 'A', text: 'Δx = Lλ/d，红光波长（约 650 nm）大于紫光（约 400 nm），故红光条纹更宽。' },
      '2': { right: 'C', text: '' }
    };
    function updateDx() {
      var dx = dxOf(st.lambda, st.d, st.L);
      $('[data-dx]').textContent = fmt(dx, 2);
      // 题干、选项与正确答案随三个滑块动态生成
      $('[data-qt="2"]').textContent = '2．（计算）波长 λ = ' + fmt(st.lambda, 0) + ' nm、双缝间距 d = '
        + fmt(st.d, 2) + ' mm、缝屏距离 L = ' + fmt(st.L, 1) + ' m，条纹间距 Δx 约为多少？';
      var cand = [dx], extra = [dx / 2, dx * 2, dx / 4, dx * 4, 1, 2, 4, 8];
      function push(v) {
        for (var z = 0; z < cand.length; z++) if (Math.abs(cand[z] - v) < 0.01) return;
        if (cand.length < 4) cand.push(v);
      }
      for (var i = 0; i < extra.length && cand.length < 4; i++) push(extra[i]);
      var letters = ['A', 'B', 'C', 'D'];
      for (var k = 0; k < 4; k++) {
        $('[data-q="2"] [data-ans="' + letters[k] + '"]').textContent = letters[k] + '．' + fmt(cand[k], 2) + ' mm';
        if (Math.abs(cand[k] - dx) < 0.01) exp['2'].right = letters[k];
      }
      exp['2'].text = 'Δx = Lλ/d = ' + fmt(st.L, 1) + ' × ' + fmt(st.lambda, 0) + ' nm / ' + fmt(st.d, 2)
        + ' mm = ' + fmt(dx, 2) + ' mm，应选 ' + exp['2'].right + '。注意统一单位（λ 取 nm、d 取 mm 时结果需 ×10⁻³）。';
      var box = $('[data-q="2"]');
      Array.prototype.forEach.call(box.querySelectorAll('.ds-opt'), function (x) { x.classList.remove('is-right', 'is-wrong'); });
      $('[data-exp="2"]').hidden = true;
    }
    bindCtrls(ctx, st, updateDx); updateDx();
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-q]'), function (box) {
      var q = box.getAttribute('data-q');
      Array.prototype.forEach.call(box.querySelectorAll('.ds-opt'), function (b) {
        on(b, 'click', function () {
          var ans = b.getAttribute('data-ans');
          Array.prototype.forEach.call(box.querySelectorAll('.ds-opt'), function (x) {
            x.classList.remove('is-right', 'is-wrong');
            if (x === b) x.classList.add(ans === exp[q].right ? 'is-right' : 'is-wrong');
          });
          var e = $('[data-exp="' + q + '"]');
          e.hidden = false;
          e.innerHTML = (ans === exp[q].right ? '✅ 正确！' : '❌ 再想想。') + ' ' + exp[q].text;
        });
      });
    });
  }
})(window);
