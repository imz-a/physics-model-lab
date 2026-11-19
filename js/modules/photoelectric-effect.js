/* ============================================================
 * photoelectric-effect.js — 光电效应（近代物理）
 * 契约：IIFE + window.ModelLab.modules['photoelectric-effect']，零依赖，file:// 可用。
 * 单位约定（全局一致）：ν 用 ×10¹⁴ Hz；能量用 eV；h = 6.63×10⁻³⁴ J·s
 *   = 4.14×10⁻¹⁵ eV·s ⇒ E(eV) = 0.414 × ν(×10¹⁴Hz)。
 *   W₀ 用 eV；ν₀ = W₀ / 0.414；Ek = max(0, hν − W₀)；Uc(V) = Ek(eV)。
 * 4 个子标签：0 基本模型 / 1 爱因斯坦方程 / 2 图像分析 / 3 高考题型
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = (global.ModelLab = global.ModelLab || {});
  NS.modules = NS.modules || {};

  var H_EV = 0.414; // eV per (×10¹⁴ Hz)
  var METALS = [
    { name: '铯 Cs', w: 1.9 }, { name: '钾 K', w: 2.2 }, { name: '钠 Na', w: 2.3 },
    { name: '锌 Zn', w: 4.3 }, { name: '铜 Cu', w: 4.7 }
  ];

  var CSS_ID = 'lm-css-photoelectric';
  var CSS = [
    '.pe-wrap{--tint:#d0c4e8;--tint-soft:#F7F4FC;color:var(--ink);font-size:16px;}',
    '.pe-wrap *{box-sizing:border-box;}',
    '.pe-lead{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:16px;}',
    '.pe-lead p{max-width:780px;color:var(--ink-2);font-size:15px;line-height:1.7;}',
    '.pe-formula{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--tint);border-radius:999px;background:var(--tint-soft);font-size:17px;font-weight:700;white-space:nowrap;}',
    '.pe-formula small{font-weight:400;color:var(--ink-2);font-size:12px;}',
    '.pe-bar{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:16px;}',
    '.pe-ctrl{flex:1 1 180px;min-width:160px;}',
    '.pe-ctrl__top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px;}',
    '.pe-ctrl__top label{font-size:14px;color:var(--ink-2);font-weight:600;}',
    '.pe-ctrl__val{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.pe-ctrl__val em{font-style:normal;font-size:12px;color:var(--ink-3);font-weight:400;margin-left:2px;}',
    '.pe-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:99px;background:#eef2f6;outline:0;margin:4px 0;}',
    '.pe-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.pe-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.pe-btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
    '.pe-btn{min-height:40px;padding:8px 14px;border:1px solid var(--line-2);border-radius:999px;background:#fff;color:var(--ink-2);font-size:14px;font-weight:600;transition:background .15s,border-color .15s;white-space:nowrap;}',
    '.pe-btn:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.pe-btn.is-active{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);box-shadow:inset 0 0 0 1px var(--tint);}',
    '.pe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}',
    '.pe-card{background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);padding:16px 18px;min-width:0;}',
    '.pe-card--wide{grid-column:1/-1;}',
    '.pe-card h4{font-size:16px;font-weight:700;margin-bottom:4px;}',
    '.pe-card__hint{font-size:13px;color:var(--ink-3);margin-bottom:12px;}',
    '.pe-cv{width:100%;display:block;border-radius:10px;background:#fff;}',
    '.pe-readouts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;}',
    '.pe-ro{padding:14px 16px;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;text-align:center;}',
    '.pe-ro span{display:block;font-size:13px;color:var(--ink-3);}',
    '.pe-ro b{display:block;margin-top:4px;font-size:23px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.pe-ro small{font-size:12px;color:var(--ink-3);font-weight:400;}',
    '.pe-status{margin-top:14px;padding:12px 16px;border-radius:10px;font-size:15px;font-weight:600;}',
    '.pe-status--on{background:#eefaf3;border:1px solid #cceede;color:#3f8c68;}',
    '.pe-status--off{background:#fff4f5;border:1px solid #ffd6da;color:#c1616c;}',
    '.pe-note{margin-top:14px;padding:12px 16px;border-left:4px solid var(--tint);background:var(--tint-soft);border-radius:0 10px 10px 0;font-size:14px;color:var(--ink-2);}',
    '.pe-note b{color:var(--ink);}',
    '.pe-q{padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:14px;}',
    '.pe-q__t{font-size:16px;font-weight:700;line-height:1.6;}',
    '.pe-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;}',
    '.pe-opt{min-height:46px;padding:10px 14px;text-align:left;border:1px solid var(--line-2);border-radius:10px;background:#fff;font-size:15px;color:var(--ink-2);transition:background .15s,border-color .15s;}',
    '.pe-opt:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.pe-opt.is-right{background:#eefaf3;border-color:#a8e0c4;color:#2f8a5f;font-weight:700;}',
    '.pe-opt.is-wrong{background:#fff3f4;border-color:#ffc9cf;color:#c1616c;}',
    '.pe-explain{margin-top:12px;padding:12px 14px;background:#f7fafc;border-radius:10px;font-size:14px;color:var(--ink-2);line-height:1.7;}',
    '@media(max-width:1100px){.pe-grid{grid-template-columns:1fr;}.pe-readouts{grid-template-columns:repeat(2,1fr);}}',
    '@media(max-width:760px){.pe-opts{grid-template-columns:1fr;}}'
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
  function photonEnergy(nu) { return H_EV * nu; }             // eV
  function cutoffFreq(w) { return w / H_EV; }                  // ×10¹⁴ Hz
  function ekMax(nu, w) { return Math.max(0, photonEnergy(nu) - w); }
  function wlOfNu(nu) { return 3000 / nu; }                    // nm（c=3e8）
  function nuRgb(nu) {
    var wl = clamp(wlOfNu(nu), 380, 780);
    var r = 0, g = 0, b = 0, f = 1;
    if (wl < 440) { r = -(wl - 440) / 60; b = 1; }
    else if (wl < 490) { g = (wl - 440) / 50; b = 1; }
    else if (wl < 510) { g = 1; b = -(wl - 510) / 20; }
    else if (wl < 580) { r = (wl - 510) / 70; g = 1; }
    else if (wl < 645) { r = 1; g = -(wl - 645) / 65; }
    else { r = 1; }
    if (wl < 420) f = 0.4 + 0.6 * (wl - 380) / 40;
    if (wl > 700) f = 0.4 + 0.6 * (780 - wl) / 80;
    // 粉彩化：马卡龙柔和色域，避免荧光/霓虹
    var base = 0.5, mix = 0.06;
    return [
      Math.round(((base + (1 - base) * r * f) * (1 - mix) + mix) * 255),
      Math.round(((base + (1 - base) * g * f) * (1 - mix) + mix) * 255),
      Math.round(((base + (1 - base) * b * f) * (1 - mix) + mix) * 255)
    ];
  }
  function rgbStr(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a === undefined ? 1 : a) + ')'; }

  NS.modules['photoelectric-effect'] = {
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
        var w = cv.clientWidth || 460, h = cssH || cv.clientHeight || 250;
        cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
        var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { c: c, w: w, h: h };
      }
      var ctx = { container: container, doc: doc, win: win, on: on, loop: loop, later: later, fit: fit };
      var views = [viewBasic, viewEquation, viewGraphs, viewExam];
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

  function ctrlHtml(key, label, min, max, step, val, unit) {
    return '<div class="pe-ctrl"><div class="pe-ctrl__top"><label for="peS' + key + '">' + label + '</label>' +
      '<span class="pe-ctrl__val" data-val="' + key + '">' + fmt(val, step < 1 ? 1 : 1) + '<em>' + unit + '</em></span></div>' +
      '<input id="peS' + key + '" class="pe-range" type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
  }
  function roHtml(key, label, val) {
    return '<div class="pe-ro"><span>' + label + '</span><b data-ro="' + key + '">' + val + '</b></div>';
  }
  function metalBtns() {
    return METALS.map(function (m, i) {
      return '<button type="button" class="pe-btn' + (i === 2 ? ' is-active' : '') + '" data-metal="' + i + '">' + m.name + '</button>';
    }).join('');
  }
  function bindCommon(ctx, st, onChange) {
    ['nu', 'light', 'w'].forEach(function (key) {
      var el = ctx.container.querySelector('[data-key="' + key + '"]');
      if (!el) return;
      ctx.on(el, 'input', function () {
        st[key] = parseFloat(el.value);
        if (key === 'w') st.metal = -1;
        var e = ctx.container.querySelector('[data-val="' + key + '"]');
        if (e) e.innerHTML = fmt(st[key], key === 'nu' ? 1 : 1) + '<em>' + (key === 'nu' ? '×10¹⁴Hz' : key === 'light' ? '' : 'eV') + '</em>';
        if (key === 'w') {
          Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-metal]'), function (b) { b.classList.remove('is-active'); });
        }
        if (onChange) onChange(key);
      });
    });
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-metal]'), function (b) {
      ctx.on(b, 'click', function () {
        var idx = parseInt(b.getAttribute('data-metal'), 10);
        st.metal = idx; st.w = METALS[idx].w;
        ctx.container.querySelector('[data-key="w"]').value = st.w;
        ctx.container.querySelector('[data-val="w"]').innerHTML = fmt(st.w, 1) + '<em>eV</em>';
        Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-metal]'), function (x) { x.classList.toggle('is-active', x === b); });
        if (onChange) onChange('metal');
      });
    });
  }
  function metalLabel(st) { return st.metal >= 0 ? METALS[st.metal].name : '自定义金属'; }

  /* ---------------- 0 基本模型 ---------------- */
  function viewBasic(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { nu: 6.0, light: 0.6, w: 2.3, metal: 2 };
    ctx.container.innerHTML =
      '<div class="ds-wrap pe-wrap">' +
        '<div class="pe-lead"><p>调节入射光频率与强度、切换金属，观察光电子是否能逸出。频率决定单个光子的能量，光强只决定光子（与光电子）的数目。</p>' +
          '<span class="pe-formula">Ek = hν − W₀ <small>h = 6.63×10⁻³⁴ J·s = 4.14×10⁻¹⁵ eV·s</small></span></div>' +
        '<div class="pe-bar">' +
          ctrlHtml('nu', '入射光频率 ν', 2, 10, 0.1, 6.0, '×10¹⁴Hz') +
          ctrlHtml('light', '光强（相对）', 0.1, 1, 0.05, 0.6, '') +
          '<div class="pe-ctrl" style="flex:1 1 200px"><div class="pe-ctrl__top"><label>逸出功 W₀</label><span class="pe-ctrl__val" data-val="w">2.3<em>eV</em></span></div>' +
            '<input class="pe-range" type="range" data-key="w" min="1" max="5" step="0.1" value="2.3" aria-label="逸出功"></div>' +
          '<div class="pe-btnrow">' + metalBtns() + '</div>' +
        '</div>' +
        '<div class="pe-grid">' +
          '<section class="pe-card pe-card--wide"><h4>光电效应演示</h4><div class="pe-card__hint">左侧入射光子射向金属板；频率足够高时右侧打出光电子，光强越大电子越多</div>' +
            '<canvas id="peScene" class="pe-cv" style="height:280px" aria-label="光电效应动画"></canvas></section>' +
        '</div>' +
        '<div class="pe-readouts">' +
          roHtml('hnu', '光子能量 hν', '—') + roHtml('ek', '最大初动能 Ek', '—') +
          roHtml('nu0', '截止频率 ν₀', '—') + roHtml('uc', '遏止电压 Uc', '—') +
        '</div>' +
        '<div class="pe-status" data-status></div>' +
        '<div class="pe-note"><b>三条规律：</b>①存在截止频率 ν₀ = W₀/h，ν < ν₀ 时无论多强都不发生光电效应；②Ek 只随频率增大而增大，与光强无关；③光电子数目（光电流）随光强增大，且发射几乎是瞬时的。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#peScene'), 280);
    var ro = { hnu: $('[data-ro="hnu"]'), ek: $('[data-ro="ek"]'), nu0: $('[data-ro="nu0"]'), uc: $('[data-ro="uc"]') };
    var photons = [], electrons = [], flashes = [];
    function update() {
      var hnu = photonEnergy(st.nu), ek = ekMax(st.nu, st.w), nu0 = cutoffFreq(st.w);
      ro.hnu.innerHTML = fmt(hnu, 2) + ' <small>eV</small>';
      ro.ek.innerHTML = fmt(ek, 2) + ' <small>eV</small>';
      ro.nu0.innerHTML = fmt(nu0, 2) + ' <small>×10¹⁴Hz</small>';
      ro.uc.innerHTML = fmt(ek, 2) + ' <small>V</small>';
      var status = $('[data-status]');
      if (hnu + 1e-9 < st.w) {
        status.className = 'pe-status pe-status--off';
        status.textContent = '✕ hν (' + fmt(hnu, 2) + ' eV) < W₀ (' + fmt(st.w, 2) + ' eV)，不发生光电效应——增大光强也不会有电子逸出。';
      } else {
        status.className = 'pe-status pe-status--on';
        status.textContent = '✓ hν ≥ W₀，发生光电效应：' + metalLabel(st) + ' 逸出光电子，最大初动能 ' + fmt(ek, 2) + ' eV，遏止电压 ' + fmt(ek, 2) + ' V。';
      }
    }
    bindCommon(ctx, st, update);
    on(win, 'resize', function () { lay = fit($('#peScene'), 280); });

    ctx.loop(function (t, dt) {
      var c = lay.c, w = lay.w, h = lay.h;
      c.clearRect(0, 0, w, h);
      var plateX = w * 0.46, midY = h * 0.5;
      var col = nuRgb(st.nu);
      var hnu = photonEnergy(st.nu), ek = ekMax(st.nu, st.w);
      var emitting = hnu + 1e-9 >= st.w;
      // 光子生成（数目 ∝ 光强）
      var want = Math.round(3 + st.light * 14);
      while (photons.length < want) photons.push({ x: Math.random() * plateX, y: 30 + Math.random() * (h - 60), ph: Math.random() * 6 });
      if (photons.length > want) photons.length = want;
      var pSpeed = 0.28 * dt;
      for (var i = 0; i < photons.length; i++) {
        var p = photons[i];
        p.x += pSpeed; p.ph += 0.06 * dt;
        if (p.x >= plateX) {
          p.x = -10; p.y = 30 + Math.random() * (h - 60);
          flashes.push({ y: p.y, a: 1 });
          if (emitting && Math.random() < 0.75) {
            var ang = (Math.random() - 0.5) * 1.1;
            electrons.push({ x: plateX + 6, y: p.y, vx: Math.cos(ang), vy: Math.sin(ang), life: 1 });
          }
        }
        c.beginPath(); c.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        c.fillStyle = rgbStr(col, 0.9); c.fill();
        c.beginPath(); c.arc(p.x, p.y, 9 + 2 * Math.sin(p.ph), 0, Math.PI * 2);
        c.strokeStyle = rgbStr(col, 0.28); c.lineWidth = 1.5; c.stroke();
      }
      // 金属板
      var grad = c.createLinearGradient(plateX - 14, 0, plateX + 14, 0);
      grad.addColorStop(0, '#dfe6ee'); grad.addColorStop(0.5, '#aebccb'); grad.addColorStop(1, '#dfe6ee');
      c.fillStyle = grad; c.fillRect(plateX - 9, 24, 18, h - 48);
      c.fillStyle = '#5a6472'; c.font = '13px sans-serif';
      c.fillText(metalLabel(st), plateX - 26, 18);
      c.fillText('W₀=' + fmt(st.w, 1) + 'eV', plateX - 30, h - 8);
      // 入射方向
      c.fillStyle = '#8b95a3'; c.fillText('入射光 ν=' + fmt(st.nu, 1) + '×10¹⁴Hz', 12, 18);
      // 闪光
      flashes = flashes.filter(function (f) {
        f.a -= 0.06;
        if (f.a <= 0) return false;
        c.save(); c.globalAlpha = f.a;
        c.beginPath(); c.arc(plateX, f.y, 12, 0, Math.PI * 2);
        c.fillStyle = rgbStr(col, 0.5); c.fill(); c.restore();
        return true;
      });
      // 光电子
      var eSpeed = (0.10 + 0.22 * Math.sqrt(ek)) * dt;
      electrons = electrons.filter(function (e) {
        e.x += e.vx * eSpeed; e.y += e.vy * eSpeed; e.life -= 0.0025 * dt;
        if (e.x > w + 12 || e.life <= 0) return false;
        c.beginPath(); c.arc(e.x, e.y, 5, 0, Math.PI * 2);
        c.fillStyle = '#8bb8e0'; c.fill();
        c.fillStyle = '#fff'; c.font = 'bold 11px sans-serif'; c.fillText('−', e.x - 2.5, e.y + 4);
        return true;
      });
      if (electrons.length > 60) electrons.splice(0, electrons.length - 60);
      c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
      c.fillText(emitting ? '逸出光电子（数目 ∝ 光强）' : '无电子逸出', plateX + 16, h - 8);
    });
    update();
  }

  /* ---------------- 1 爱因斯坦方程 ---------------- */
  function viewEquation(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { nu: 6.0, light: 0.6, w: 2.3, metal: 2 };
    ctx.container.innerHTML =
      '<div class="pe-wrap">' +
        '<div class="pe-lead"><p>Ek–ν 图是 Einstein 方程 <b>Ek = hν − W₀</b> 的图像：<b>斜率就是普朗克常量 h</b>，横截距是截止频率 ν₀，纵截距的绝对值是逸出功 W₀。换金属只会平移直线，斜率不变。</p></div>' +
        '<div class="pe-bar">' +
          ctrlHtml('nu', '入射频率 ν', 2, 10, 0.1, 6.0, '×10¹⁴Hz') +
          '<div class="pe-ctrl" style="flex:1 1 200px"><div class="pe-ctrl__top"><label>逸出功 W₀</label><span class="pe-ctrl__val" data-val="w">2.3<em>eV</em></span></div>' +
            '<input class="pe-range" type="range" data-key="w" min="1" max="5" step="0.1" value="2.3" aria-label="逸出功"></div>' +
          '<div class="pe-btnrow">' + metalBtns() + '</div>' +
        '</div>' +
        '<section class="pe-card pe-card--wide"><h4>Ek – ν 图像（直线斜率 = h）</h4><div class="pe-card__hint">拖动频率滑块，工作点沿直线移动；切换金属，直线上下平移但始终平行</div>' +
          '<canvas id="peEq" class="pe-cv" style="height:360px" aria-label="Ek-nu 图像"></canvas></section>' +
        '<div class="pe-readouts">' +
          roHtml('slope', '斜率 h', '0.414') + roHtml('nu0', '截止频率 ν₀', '—') +
          roHtml('ek', '当前 Ek', '—') + roHtml('w', '逸出功 W₀', '—') +
        '</div>' +
        '<div class="pe-note"><b>关键：</b>直线部分在 ν₀ 左侧没有物理意义（Ek 不能为负）。不同金属的直线彼此平行，因为斜率都是 h；逸出功越大，ν₀ 越大，直线越靠右。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#peEq'), 360);
    var ro = { nu0: $('[data-ro="nu0"]'), ek: $('[data-ro="ek"]'), w: $('[data-ro="w"]') };
    function update() {
      ro.nu0.innerHTML = fmt(cutoffFreq(st.w), 2) + ' <small>×10¹⁴Hz</small>';
      ro.ek.innerHTML = fmt(ekMax(st.nu, st.w), 2) + ' <small>eV</small>';
      ro.w.innerHTML = fmt(st.w, 2) + ' <small>eV</small>';
    }
    // 该标签没有 light 控件，bindCommon 会跳过缺失项
    bindCommon(ctx, st, update);
    on(win, 'resize', function () { lay = fit($('#peEq'), 360); });
    ctx.loop(function () { drawEkNu(lay, st); });
    update();
  }
  function drawEkNu(lay, st) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 58, R = w - 26, Tp = 22, B = h - 44;
    var nuMax = 10, eMax = 4.2;
    function X(nu) { return L + nu / nuMax * (R - L); }
    function Y(e) { return B - clamp(e / eMax, 0, 1) * (B - Tp); }
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
    for (var nu = 0; nu <= 10; nu += 2) { c.beginPath(); c.moveTo(X(nu), Tp); c.lineTo(X(nu), B); c.stroke(); }
    for (var e = 0; e <= 4; e += 1) { c.beginPath(); c.moveTo(L, Y(e)); c.lineTo(R, Y(e)); c.stroke(); }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '13px sans-serif';
    c.fillText('Ek/eV', 12, Tp + 4); c.fillText('ν / ×10¹⁴Hz', R - 92, B + 26);
    for (var n2 = 2; n2 <= 10; n2 += 2) c.fillText(String(n2), X(n2) - 6, B + 20);
    for (var e2 = 1; e2 <= 4; e2++) c.fillText(String(e2), L - 22, Y(e2) + 4);
    // 其他金属淡线
    METALS.forEach(function (m) {
      if (Math.abs(m.w - st.w) < 1e-6) return;
      var nu0 = cutoffFreq(m.w);
      c.beginPath(); c.moveTo(X(nu0), Y(0)); c.lineTo(X(10), Y(Math.max(0, photonEnergy(10) - m.w)));
      c.strokeStyle = '#e7e0f1'; c.lineWidth = 2; c.stroke();
    });
    // 当前金属直线
    var nu0c = cutoffFreq(st.w);
    c.beginPath(); c.moveTo(X(nu0c), Y(0)); c.lineTo(X(10), Y(Math.max(0, photonEnergy(10) - st.w)));
    c.strokeStyle = '#9b86c4'; c.lineWidth = 3.5; c.stroke();
    // ν₀ 截距
    c.strokeStyle = '#d0c4e8'; c.setLineDash([5, 4]); c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(X(nu0c), B); c.lineTo(X(nu0c), Y(0)); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#8b6fb5'; c.font = 'bold 13px sans-serif';
    c.fillText('ν₀=' + fmt(nu0c, 2), X(nu0c) - 20, B - 8);
    c.fillStyle = '#7c63a8'; c.fillText('斜率 h = 0.414 eV/(10¹⁴Hz) = 4.14×10⁻¹⁵ eV·s', X(4.2), Y(photonEnergy(4.2) - st.w) - 12);
    // 工作点
    if (st.nu >= nu0c) {
      var eNow = ekMax(st.nu, st.w);
      c.beginPath(); c.arc(X(st.nu), Y(eNow), 12, 0, Math.PI * 2); c.fillStyle = 'rgba(208,196,232,.5)'; c.fill();
      c.beginPath(); c.arc(X(st.nu), Y(eNow), 6, 0, Math.PI * 2); c.fillStyle = '#7c63a8'; c.fill();
      c.strokeStyle = '#cbbce2'; c.setLineDash([4, 3]); c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(X(st.nu), Y(eNow)); c.lineTo(X(st.nu), B); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#7c63a8'; c.font = 'bold 13px sans-serif';
      c.fillText('Ek=' + fmt(eNow, 2) + 'eV', X(st.nu) + 10, Y(eNow) - 10);
    }
  }

  /* ---------------- 2 图像分析 ---------------- */
  function viewGraphs(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { nu: 6.0, light: 0.6, w: 2.3, metal: 2 };
    ctx.container.innerHTML =
      '<div class="pe-wrap">' +
        '<div class="pe-lead"><p>左图：<b>Uc–ν</b> 关系，斜率 h/e、横截距 ν₀，改变光强曲线不动；右图：<b>光电流 I–U</b> 特性，光强只改变饱和电流，<b>遏止电压 Uc 不变</b>——这是高考高频考点。</p></div>' +
        '<div class="pe-bar">' +
          ctrlHtml('nu', '入射频率 ν', 2, 10, 0.1, 6.0, '×10¹⁴Hz') +
          ctrlHtml('light', '光强（相对）', 0.1, 1, 0.05, 0.6, '') +
          '<div class="pe-ctrl" style="flex:1 1 200px"><div class="pe-ctrl__top"><label>逸出功 W₀</label><span class="pe-ctrl__val" data-val="w">2.3<em>eV</em></span></div>' +
            '<input class="pe-range" type="range" data-key="w" min="1" max="5" step="0.1" value="2.3" aria-label="逸出功"></div>' +
          '<div class="pe-btnrow">' + metalBtns() + '</div>' +
        '</div>' +
        '<div class="pe-grid">' +
          '<section class="pe-card"><h4>遏止电压 Uc – ν</h4><div class="pe-card__hint">各金属直线平行；光强变化不改变此图</div><canvas id="peUc" class="pe-cv" style="height:300px"></canvas></section>' +
          '<section class="pe-card"><h4>光电流 I – U</h4><div class="pe-card__hint">增大光强 → 饱和电流增大，但 Uc 不变</div><canvas id="peIU" class="pe-cv" style="height:300px"></canvas></section>' +
        '</div>' +
        '<div class="pe-readouts">' +
          roHtml('hnu', '光子能量 hν', '—') + roHtml('ek', '最大初动能 Ek', '—') +
          roHtml('uc', '遏止电压 Uc', '—') + roHtml('isat', '饱和电流（相对）', '—') +
        '</div>' +
        '<div class="pe-note"><b>辨析：</b>频率 ν 决定单个光子能量，从而决定 Ek 与 Uc；光强决定单位时间光子数，从而决定逸出电子数与饱和电流。二者不可混为一谈。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var ucLay = fit($('#peUc'), 300), iuLay = fit($('#peIU'), 300);
    var ro = { hnu: $('[data-ro="hnu"]'), ek: $('[data-ro="ek"]'), uc: $('[data-ro="uc"]'), isat: $('[data-ro="isat"]') };
    function update() {
      var ek = ekMax(st.nu, st.w);
      ro.hnu.innerHTML = fmt(photonEnergy(st.nu), 2) + ' <small>eV</small>';
      ro.ek.innerHTML = fmt(ek, 2) + ' <small>eV</small>';
      ro.uc.innerHTML = fmt(ek, 2) + ' <small>V</small>';
      ro.isat.innerHTML = fmt(st.light, 2) + ' <small>相对值</small>';
    }
    bindCommon(ctx, st, update);
    on(win, 'resize', function () { ucLay = fit($('#peUc'), 300); iuLay = fit($('#peIU'), 300); });
    ctx.loop(function () { drawUcNu(ucLay, st); drawIU(iuLay, st); });
    update();
  }
  function drawUcNu(lay, st) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 46, R = w - 18, Tp = 18, B = h - 36;
    var nuMax = 10, uMax = 4.2;
    function X(nu) { return L + nu / nuMax * (R - L); }
    function Y(u) { return B - clamp(u / uMax, 0, 1) * (B - Tp); }
    c.strokeStyle = '#eef2f6';
    for (var n = 0; n <= 10; n += 2) { c.beginPath(); c.moveTo(X(n), Tp); c.lineTo(X(n), B); c.stroke(); }
    for (var u = 0; u <= 4; u++) { c.beginPath(); c.moveTo(L, Y(u)); c.lineTo(R, Y(u)); c.stroke(); }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('Uc/V', 10, Tp + 6); c.fillText('ν/×10¹⁴Hz', R - 74, B + 22);
    METALS.forEach(function (m) {
      var nu0 = cutoffFreq(m.w);
      c.beginPath(); c.moveTo(X(nu0), Y(0)); c.lineTo(X(10), Y(Math.max(0, photonEnergy(10) - m.w)));
      c.strokeStyle = Math.abs(m.w - st.w) < 1e-6 ? '#9b86c4' : '#e7e0f1';
      c.lineWidth = Math.abs(m.w - st.w) < 1e-6 ? 3.5 : 1.8; c.stroke();
    });
    var ek = ekMax(st.nu, st.w);
    c.beginPath(); c.arc(X(st.nu), Y(ek), 6, 0, Math.PI * 2); c.fillStyle = '#7c63a8'; c.fill();
    c.fillStyle = '#7c63a8'; c.font = 'bold 12px sans-serif';
    c.fillText('Uc=' + fmt(ek, 2) + 'V', X(st.nu) + 8, Math.max(Y(ek) - 8, Tp + 12));
  }
  function drawIU(lay, st) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 46, R = w - 18, Tp = 18, B = h - 36;
    var uc = ekMax(st.nu, st.w); // V
    var uMin = -Math.max(2.5, uc * 1.5), uMax = 3;
    function X(u) { return L + (u - uMin) / (uMax - uMin) * (R - L); }
    function Y(i) { return B - i * (B - Tp); }
    c.strokeStyle = '#eef2f6';
    for (var g = 1; g <= 3; g++) { var gy = Tp + (B - Tp) * g / 4; c.beginPath(); c.moveTo(L, gy); c.lineTo(R, gy); c.stroke(); }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(L, Y(0)); c.lineTo(R, Y(0)); c.moveTo(X(0), Tp); c.lineTo(X(0), B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('I', 12, Tp + 6); c.fillText('U/V', R - 28, B + 22); c.fillText('0', X(0) - 4, B + 16);
    // 不同光强的曲线（固定 Uc）：始终高亮离当前光强最近的一条
    var levels = [0.3, 0.6, 1], nearest = levels[0];
    levels.forEach(function (v) { if (Math.abs(v - st.light) < Math.abs(nearest - st.light)) nearest = v; });
    c.fillStyle = '#8b95a3'; c.font = '11px sans-serif';
    c.fillText('当前光强 ' + fmt(st.light, 2) + '（高亮最接近曲线）', L + 6, Tp + 10);
    levels.forEach(function (inten) {
      c.beginPath();
      for (var px = 0; px <= w - L; px += 2) {
        var u = uMin + px / (R - L) * (uMax - uMin);
        var ii = u <= -uc ? 0 : inten * (1 - Math.exp(-(u + uc) / 0.45));
        var xx = X(u), yy = Y(ii);
        if (px === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy);
      }
      var active = inten === nearest;
      c.strokeStyle = active ? '#9b86c4' : 'rgba(208,196,232,.6)';
      c.lineWidth = active ? 3.5 : 1.8; c.stroke();
    });
    // 截止电压标记
    if (uMin <= -uc && -uc <= uMax) {
      c.strokeStyle = '#e0606c'; c.setLineDash([5, 4]); c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(X(-uc), Tp); c.lineTo(X(-uc), B); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#c1616c'; c.font = 'bold 12px sans-serif';
      c.fillText('−Uc=' + fmt(-uc, 2) + 'V', X(-uc) - 22, B - 8);
    }
  }

  /* ---------------- 3 高考题型 ---------------- */
  function viewExam(ctx) {
    var on = ctx.on;
    var st = { nu: 6.0, light: 0.6, w: 2.3, metal: 2 };
    ctx.container.innerHTML =
      '<div class="pe-wrap">' +
        '<div class="pe-lead"><p>点击选项即时判定并查看解析。第 2 题可调频率和金属，实时计算遏止电压。</p></div>' +
        '<div class="pe-q">' +
          '<div class="pe-q__t">1．（概念辨析）入射光频率不变，只增大光强，光电子的最大初动能将如何变化？</div>' +
          '<div class="pe-opts" data-q="1">' +
            '<button type="button" class="pe-opt" data-ans="A">A．增大</button>' +
            '<button type="button" class="pe-opt" data-ans="B">B．不变</button>' +
            '<button type="button" class="pe-opt" data-ans="C">C．减小</button>' +
            '<button type="button" class="pe-opt" data-ans="D">D．先增大后不变</button>' +
          '</div><div class="pe-explain" data-exp="1" hidden></div>' +
        '</div>' +
        '<div class="pe-q">' +
          '<div class="pe-q__t" data-qt="2">2．（计算）用 ν = 6.0×10¹⁴ Hz 的光照射钠（W₀ = 2.3 eV），遏止电压约为多少？</div>' +
          '<div class="pe-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            ctrlHtml('nu', '频率 ν', 2, 10, 0.1, 6.0, '×10¹⁴Hz') +
            '<div class="pe-ctrl" style="flex:1 1 200px"><div class="pe-ctrl__top"><label>逸出功 W₀</label><span class="pe-ctrl__val" data-val="w">2.3<em>eV</em></span></div>' +
              '<input class="pe-range" type="range" data-key="w" min="1" max="5" step="0.1" value="2.3" aria-label="逸出功"></div>' +
            '<div class="pe-formula" style="font-size:15px">Uc = <span data-uc>—</span> V</div>' +
          '</div>' +
          '<div class="pe-opts" data-q="2">' +
            '<button type="button" class="pe-opt" data-ans="A">A．0.18 V</button>' +
            '<button type="button" class="pe-opt" data-ans="B">B．0.42 V</button>' +
            '<button type="button" class="pe-opt" data-ans="C">C．2.48 V</button>' +
            '<button type="button" class="pe-opt" data-ans="D">D．4.78 V</button>' +
          '</div><div class="pe-explain" data-exp="2" hidden></div>' +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var exp = {
      '1': { right: 'B', text: '由 Ek = hν − W₀ 可知，最大初动能只由频率 ν 决定，与光强无关。增大光强只会使逸出的光电子数目增多（饱和电流增大）。' },
      '2': { right: 'A', text: '' }
    };
    function updateUc() {
      var uc = ekMax(st.nu, st.w), photon = photonEnergy(st.nu);
      $('[data-uc]').textContent = fmt(uc, 2);
      // 题干、选项、答案随 ν 与 W₀ 动态生成
      $('[data-qt="2"]').textContent = '2．（计算）用 ν = ' + fmt(st.nu, 1) + '×10¹⁴ Hz 的光照射逸出功 W₀ = '
        + fmt(st.w, 1) + ' eV 的金属，遏止电压约为多少？';
      var cand = [uc], extra = [uc / 2, uc * 2, uc + 0.5, uc + 1, 0, 0.5, 1, 2];
      function push(v) {
        if (v < 0 || cand.length >= 4) return;
        for (var z = 0; z < cand.length; z++) if (Math.abs(cand[z] - v) < 0.01) return;
        cand.push(v);
      }
      for (var i = 0; i < extra.length && cand.length < 4; i++) push(extra[i]);
      var letters = ['A', 'B', 'C', 'D'];
      for (var k = 0; k < 4; k++) {
        $('[data-q="2"] [data-ans="' + letters[k] + '"]').textContent = letters[k] + '．' + fmt(cand[k], 2) + ' V';
        if (Math.abs(cand[k] - uc) < 0.01) exp['2'].right = letters[k];
      }
      exp['2'].text = 'hν = 0.414 × ' + fmt(st.nu, 1) + ' ≈ ' + fmt(photon, 2) + ' eV，Ek = hν − W₀ = '
        + fmt(photon, 2) + ' − ' + fmt(st.w, 1) + ' = ' + fmt(uc, 2) + ' eV；由 eUc = Ek 得 Uc ≈ '
        + fmt(uc, 2) + ' V，应选 ' + exp['2'].right + '。（若 hν < W₀ 则不发生光电效应，Uc = 0。）';
      Array.prototype.forEach.call($('[data-q="2"]').querySelectorAll('.pe-opt'), function (x) { x.classList.remove('is-right', 'is-wrong'); });
      $('[data-exp="2"]').hidden = true;
    }
    bindCommon(ctx, st, updateUc); updateUc();
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-q]'), function (box) {
      var q = box.getAttribute('data-q');
      Array.prototype.forEach.call(box.querySelectorAll('.pe-opt'), function (b) {
        on(b, 'click', function () {
          var ans = b.getAttribute('data-ans');
          Array.prototype.forEach.call(box.querySelectorAll('.pe-opt'), function (x) {
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
