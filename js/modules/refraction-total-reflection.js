/* ============================================================
 * refraction-total-reflection.js — 光的折射与全反射（光学）
 * 契约：IIFE + window.ModelLab.modules['refraction-total-reflection']，零依赖，file:// 可用。
 * 物理：n1·sinθ1 = n2·sinθ2；n = c/v；光密→光疏且 θ1 ≥ C 时全反射，sinC = n2/n1。
 * 4 个子标签：0 基本模型 / 1 折射率 / 2 全反射条件 / 3 高考题型
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = (global.ModelLab = global.ModelLab || {});
  NS.modules = NS.modules || {};

  var CSS_ID = 'lm-css-refraction';
  var CSS = [
    '.rp-wrap{--tint:#BFE3F5;--tint-soft:#F1F8FD;color:var(--ink);font-size:16px;}',
    '.rp-wrap *{box-sizing:border-box;}',
    '.rp-lead{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:16px;}',
    '.rp-lead p{max-width:790px;color:var(--ink-2);font-size:15px;line-height:1.7;}',
    '.rp-formula{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--tint);border-radius:999px;background:var(--tint-soft);font-size:17px;font-weight:700;white-space:nowrap;}',
    '.rp-formula small{font-weight:400;color:var(--ink-2);font-size:12px;}',
    '.rp-bar{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:16px;}',
    '.rp-ctrl{flex:1 1 190px;min-width:175px;}',
    '.rp-ctrl__top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px;}',
    '.rp-ctrl__top label{font-size:14px;color:var(--ink-2);font-weight:600;}',
    '.rp-ctrl__val{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.rp-ctrl__val em{font-style:normal;font-size:12px;color:var(--ink-3);font-weight:400;margin-left:2px;}',
    '.rp-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:99px;background:#eef2f6;outline:0;margin:4px 0;}',
    '.rp-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.rp-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.rp-presets{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px;}',
    '.rp-preset{min-height:28px;padding:3px 9px;border:1px solid var(--line-2);border-radius:999px;background:#fff;color:var(--ink-3);font-size:12px;}',
    '.rp-preset:hover{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);}',
    '.rp-btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
    '.rp-btn{min-height:40px;padding:8px 16px;border:1px solid var(--line-2);border-radius:999px;background:#fff;color:var(--ink-2);font-size:14px;font-weight:600;transition:background .15s,border-color .15s;white-space:nowrap;}',
    '.rp-btn:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.rp-btn.is-active{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);box-shadow:inset 0 0 0 1px var(--tint);}',
    '.rp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}',
    '.rp-card{background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);padding:16px 18px;min-width:0;}',
    '.rp-card--wide{grid-column:1/-1;}',
    '.rp-card h4{font-size:16px;font-weight:700;margin-bottom:4px;}',
    '.rp-card__hint{font-size:13px;color:var(--ink-3);margin-bottom:12px;}',
    '.rp-cv{width:100%;display:block;border-radius:10px;background:#fff;}',
    '.rp-readouts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;}',
    '.rp-ro{padding:14px 16px;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;text-align:center;}',
    '.rp-ro span{display:block;font-size:13px;color:var(--ink-3);}',
    '.rp-ro b{display:block;margin-top:4px;font-size:23px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.rp-ro small{font-size:12px;color:var(--ink-3);font-weight:400;}',
    '.rp-status{margin-top:14px;padding:12px 16px;border-radius:10px;font-size:15px;font-weight:600;}',
    '.rp-status--refract{background:#F1F8FD;border:1px solid #cfe6f5;color:#4b87a8;}',
    '.rp-status--total{background:#FFF4F5;border:1px solid #ffd6da;color:#c1616c;}',
    '.rp-note{margin-top:14px;padding:12px 16px;border-left:4px solid var(--tint);background:var(--tint-soft);border-radius:0 10px 10px 0;font-size:14px;color:var(--ink-2);}',
    '.rp-note b{color:var(--ink);}',
    '.rp-table{width:100%;border-collapse:collapse;font-size:14px;}',
    '.rp-table th,.rp-table td{padding:9px 8px;text-align:left;border-bottom:1px solid var(--line);}',
    '.rp-table th{font-size:12px;color:var(--ink-3);font-weight:600;}',
    '.rp-table tr[data-n] {cursor:pointer;transition:background .15s;}',
    '.rp-table tr[data-n]:hover{background:var(--tint-soft);}',
    '.rp-table tr.is-active{background:var(--tint-soft);font-weight:700;}',
    '.rp-cond{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--line-2);border-radius:10px;background:var(--surface-soft);font-size:14px;margin-bottom:10px;}',
    '.rp-cond__ico{width:26px;height:26px;flex:0 0 auto;display:grid;place-items:center;border-radius:50%;font-size:14px;font-weight:700;}',
    '.rp-cond--yes .rp-cond__ico{background:#e6f7ef;color:#3f8c68;}',
    '.rp-cond--no .rp-cond__ico{background:#fff0f2;color:#c1616c;}',
    '.rp-q{padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:14px;}',
    '.rp-q__t{font-size:16px;font-weight:700;line-height:1.6;}',
    '.rp-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;}',
    '.rp-opt{min-height:46px;padding:10px 14px;text-align:left;border:1px solid var(--line-2);border-radius:10px;background:#fff;font-size:15px;color:var(--ink-2);transition:background .15s,border-color .15s;}',
    '.rp-opt:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.rp-opt.is-right{background:#eefaf3;border-color:#a8e0c4;color:#2f8a5f;font-weight:700;}',
    '.rp-opt.is-wrong{background:#fff3f4;border-color:#ffc9cf;color:#c1616c;}',
    '.rp-explain{margin-top:12px;padding:12px 14px;background:#f7fafc;border-radius:10px;font-size:14px;color:var(--ink-2);line-height:1.7;}',
    '@media(max-width:1100px){.rp-grid{grid-template-columns:1fr;}.rp-readouts{grid-template-columns:repeat(2,1fr);}}',
    '@media(max-width:760px){.rp-opts{grid-template-columns:1fr;}}'
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
  var MEDIA = [{ name: '空气', n: 1.00 }, { name: '水', n: 1.33 }, { name: '玻璃', n: 1.50 }, { name: '钻石', n: 2.42 }];
  function optics(n1, n2, th1) {
    var s = Math.sin(th1 * Math.PI / 180) * n1 / n2;
    var total = n1 > n2 + 1e-9 && s >= 1 - 1e-9;
    var th2 = total ? null : Math.asin(clamp(s, -1, 1)) * 180 / Math.PI;
    var C = n1 > n2 + 1e-9 ? Math.asin(clamp(n2 / n1, 0, 1)) * 180 / Math.PI : null;
    return { total: total, th2: th2, C: C, ratio: s };
  }
  function arrow(c, x1, y1, x2, y2, color, width) {
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = width; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1), sz = 10;
    c.beginPath(); c.moveTo(x2, y2);
    c.lineTo(x2 - sz * Math.cos(a - 0.42), y2 - sz * Math.sin(a - 0.42));
    c.lineTo(x2 - sz * Math.cos(a + 0.42), y2 - sz * Math.sin(a + 0.42));
    c.closePath(); c.fill();
  }
  function ctrlHtml(key, label, min, max, step, val, unit, presets) {
    var h = '<div class="rp-ctrl"><div class="rp-ctrl__top"><label for="rpS' + key + '">' + label + '</label>' +
      '<span class="rp-ctrl__val" data-val="' + key + '">' + fmt(val, step < 1 ? 2 : 0) + '<em>' + unit + '</em></span></div>' +
      '<input id="rpS' + key + '" class="rp-range" type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '">';
    if (presets) {
      h += '<div class="rp-presets">' + MEDIA.map(function (m) {
        return '<button type="button" class="rp-preset" data-preset="' + key + '" data-n="' + m.n + '">' + m.name + '</button>';
      }).join('') + '</div>';
    }
    return h + '</div>';
  }
  function roHtml(key, label, val) {
    return '<div class="rp-ro"><span>' + label + '</span><b data-ro="' + key + '">' + val + '</b></div>';
  }
  function bindCommon(ctx, st, onChange) {
    ['th1', 'n1', 'n2'].forEach(function (key) {
      var el = ctx.container.querySelector('[data-key="' + key + '"]');
      if (!el) return;
      ctx.on(el, 'input', function () {
        st[key] = parseFloat(el.value);
        var e = ctx.container.querySelector('[data-val="' + key + '"]');
        if (e) e.innerHTML = fmt(st[key], key === 'th1' ? 0 : 2) + '<em>' + (key === 'th1' ? '°' : '') + '</em>';
        if (onChange) onChange(key);
      });
    });
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-preset]'), function (b) {
      ctx.on(b, 'click', function () {
        var key = b.getAttribute('data-preset'), val = parseFloat(b.getAttribute('data-n'));
        st[key] = val;
        var el = ctx.container.querySelector('[data-key="' + key + '"]');
        if (el) el.value = val;
        var e = ctx.container.querySelector('[data-val="' + key + '"]');
        if (e) e.innerHTML = fmt(val, 2);
        if (onChange) onChange(key);
      });
    });
  }

  NS.modules['refraction-total-reflection'] = {
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
      var views = [viewBasic, viewIndex, viewCondition, viewExam];
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

  // 画完整光路图
  function drawRay(lay, st, t, opts) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var mid = h * 0.52;
    c.fillStyle = '#f5fafe'; c.fillRect(0, 0, w, mid);
    c.fillStyle = '#fffbf2'; c.fillRect(0, mid, w, h - mid);
    var o = optics(st.n1, st.n2, st.th1);
    var ox = w * 0.46, L = Math.min(w, h) * 0.72;
    var a1 = st.th1 * Math.PI / 180;
    // 分界面 + 法线
    c.strokeStyle = '#cbd6e2'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(16, mid); c.lineTo(w - 16, mid); c.stroke();
    c.strokeStyle = '#b9c6d4'; c.setLineDash([6, 5]); c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(ox, 18); c.lineTo(ox, h - 16); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#8b95a3'; c.font = '13px sans-serif';
    c.fillText('法线', ox + 6, 22);
    c.fillText('介质1  n₁=' + fmt(st.n1, 2), 18, mid - 12);
    c.fillText('介质2  n₂=' + fmt(st.n2, 2), 18, mid + 20);
    c.beginPath(); c.arc(ox, mid, 4, 0, Math.PI * 2); c.fillStyle = '#7f8b99'; c.fill();
    // 光线端点
    var ix = ox - Math.sin(a1) * L, iy = mid - Math.cos(a1) * L;
    var rx = ox + Math.sin(a1) * L, ry = mid - Math.cos(a1) * L;
    var refracted = !o.total && o.th2 !== null;
    var tx, ty;
    if (refracted) {
      var a2 = o.th2 * Math.PI / 180;
      tx = ox + Math.sin(a2) * L; ty = mid + Math.cos(a2) * L;
    }
    arrow(c, Math.max(ix, 10), Math.max(iy, 12), ox, mid, '#d0b4e0', 3);
    arrow(c, ox, mid, Math.min(rx, w - 12), Math.max(ry, 12), '#f2b8bd', 3);
    if (refracted) arrow(c, ox, mid, Math.min(tx, w - 10), Math.min(ty, h - 12), '#a8d8c6', 3);
    else {
      c.fillStyle = '#c1616c'; c.font = 'bold 15px sans-serif';
      c.fillText('全反射 · 无折射光', Math.min(ox + 22, w - 150), 34);
    }
    // 角度弧线
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5; c.beginPath();
    c.arc(ox, mid, 34, -Math.PI / 2 - a1, -Math.PI / 2); c.stroke();
    c.fillStyle = '#5a6472'; c.font = '13px sans-serif';
    c.fillText('θ₁=' + fmt(st.th1, 0) + '°', ox - 54, mid - 40);
    if (refracted) c.fillText('θ₂=' + fmt(o.th2, 1) + '°', ox + 14, mid + 46);
    // 光点动画：沿 入射 → (折射/反射) 循环
    if (opts && opts.animate) {
      var ph = (t * 0.00045) % 2;
      var px, py;
      if (ph < 1) { px = ix + (ox - ix) * ph; py = iy + (mid - iy) * ph; }
      else {
        var ex = refracted ? tx : rx, ey = refracted ? ty : ry;
        px = ox + (ex - ox) * (ph - 1); py = mid + (ey - mid) * (ph - 1);
      }
      c.beginPath(); c.arc(px, py, 6, 0, Math.PI * 2);
      c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#8aa8c8'; c.lineWidth = 2.5; c.stroke();
    }
  }

  /* ---------------- 0 基本模型 ---------------- */
  function viewBasic(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { th1: 35, n1: 1.50, n2: 1.00 };
    ctx.container.innerHTML =
      '<div class="rp-wrap">' +
        '<div class="rp-lead"><p>调节入射角与两种介质的折射率，观察入射、反射、折射三条光线如何实时变化；当光从光密介质射向光疏介质且入射角超过临界角时，折射光消失，发生全反射。</p>' +
          '<span class="rp-formula">n₁sinθ₁ = n₂sinθ₂ <small>折射定律</small></span></div>' +
        '<div class="rp-bar">' +
          ctrlHtml('th1', '入射角 θ₁', 0, 85, 1, 35, '°') +
          ctrlHtml('n1', '介质1 折射率 n₁', 1, 2.5, 0.01, 1.5, '', true) +
          ctrlHtml('n2', '介质2 折射率 n₂', 1, 2.5, 0.01, 1.0, '', true) +
          '<div class="rp-btnrow"><button type="button" class="rp-btn" data-act="reset">恢复默认</button></div>' +
        '</div>' +
        '<section class="rp-card rp-card--wide"><h4>光路演示</h4><div class="rp-card__hint">白点为沿光路传播的光；虚线为法线</div>' +
          '<canvas id="rpRay" class="rp-cv" style="height:330px" aria-label="折射与全反射光路"></canvas></section>' +
        '<div class="rp-readouts">' +
          roHtml('th2', '折射角 θ₂', '—') + roHtml('C', '临界角 C', '—') +
          roHtml('dense', '传播方向', '—') + roHtml('state', '现象', '—') +
        '</div>' +
        '<div class="rp-status" data-status></div>' +
        '<div class="rp-note"><b>要点：</b>光从光疏进入光密（n₁&lt;n₂），折射角小于入射角，偏向法线；从光密进入光疏（n₁&gt;n₂），折射角大于入射角，偏离法线。只有后者才可能发生全反射。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#rpRay'), 330);
    var ro = { th2: $('[data-ro="th2"]'), C: $('[data-ro="C"]'), dense: $('[data-ro="dense"]'), state: $('[data-ro="state"]') };
    function update() {
      var o = optics(st.n1, st.n2, st.th1);
      ro.th2.textContent = o.total ? '无' : fmt(o.th2, 1) + '°';
      ro.C.innerHTML = o.C === null ? '— <small>无</small>' : fmt(o.C, 1) + '°';
      ro.dense.textContent = st.n1 > st.n2 ? '光密 → 光疏' : (st.n1 < st.n2 ? '光疏 → 光密' : '同介质');
      ro.state.textContent = o.total ? '全反射' : '折射 + 反射';
      var s = $('[data-status]');
      if (o.total) {
        s.className = 'rp-status rp-status--total';
        s.textContent = '✕ 折射光消失：n₁ > n₂ 且 θ₁ = ' + fmt(st.th1, 0) + '° ≥ C = ' + fmt(o.C, 1) + '°，发生全反射，光全部反射回介质1。';
      } else {
        s.className = 'rp-status rp-status--refract';
        s.textContent = '✓ 折射角 θ₂ = ' + fmt(o.th2, 1) + '°，满足 n₁sinθ₁ = n₂sinθ₂；同时有部分光被反射。';
      }
    }
    bindCommon(ctx, st, update);
    on($('[data-act="reset"]'), 'click', function () {
      st.th1 = 35; st.n1 = 1.5; st.n2 = 1.0;
      ['th1', 'n1', 'n2'].forEach(function (k) {
        ctx.container.querySelector('[data-key="' + k + '"]').value = st[k];
        ctx.container.querySelector('[data-val="' + k + '"]').innerHTML = fmt(st[k], k === 'th1' ? 0 : 2) + (k === 'th1' ? '<em>°</em>' : '');
      });
      update();
    });
    on(win, 'resize', function () { lay = fit($('#rpRay'), 330); });
    ctx.loop(function (t) { drawRay(lay, st, t, { animate: true }); });
    update();
  }

  /* ---------------- 1 折射率 ---------------- */
  function viewIndex(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { th1: 35, n1: 1.00, n2: 1.50 };
    ctx.container.innerHTML =
      '<div class="rp-wrap">' +
        '<div class="rp-lead"><p>折射率 <b>n = c / v</b>：n 越大，光在介质中传播越慢。比较 θ₂–θ₁ 曲线可见：光进入折射率更大的介质时向法线偏折（θ₂ &lt; θ₁）。</p></div>' +
        '<div class="rp-bar">' +
          ctrlHtml('th1', '入射角 θ₁', 0, 85, 1, 35, '°') +
          ctrlHtml('n1', '介质1 n₁', 1, 2.5, 0.01, 1.0, '', true) +
          ctrlHtml('n2', '介质2 n₂', 1, 2.5, 0.01, 1.5, '', true) +
        '</div>' +
        '<div class="rp-grid">' +
          '<section class="rp-card"><h4>常见介质折射率与光速</h4><div class="rp-card__hint">点击一行设为介质2，c = 3.00×10⁸ m/s</div>' +
            '<table class="rp-table"><thead><tr><th>介质</th><th>折射率 n</th><th>光速 v = c/n</th></tr></thead><tbody>' +
            MEDIA.map(function (m) { return '<tr data-n="' + m.n + '"><td>' + m.name + '</td><td>' + fmt(m.n, 2) + '</td><td>' + fmt(3 / m.n, 2) + '×10⁸ m/s</td></tr>'; }).join('') +
            '</tbody></table>' +
            '<div class="rp-note" style="margin-top:14px"><b>规律：</b>折射率越大，光速越小。真空 n=1，其它介质 n&gt;1。</div>' +
          '</section>' +
          '<section class="rp-card"><h4>折射角 θ₂ 随入射角 θ₁ 变化</h4><div class="rp-card__hint">高亮曲线为当前 n₁ / n₂；虚线为光密→光疏的临界截断</div>' +
            '<canvas id="rpCurve" class="rp-cv" style="height:300px" aria-label="折射角曲线"></canvas></section>' +
        '</div>' +
        '<div class="rp-readouts">' +
          roHtml('th2', '当前 θ₂', '—') + roHtml('ratio', 'sinθ₂ / sinθ₁', '—') +
          roHtml('speed', '介质2 光速', '—') + roHtml('bend', '偏折方向', '—') +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var lay = fit($('#rpCurve'), 300);
    var ro = { th2: $('[data-ro="th2"]'), ratio: $('[data-ro="ratio"]'), speed: $('[data-ro="speed"]'), bend: $('[data-ro="bend"]') };
    function update() {
      var o = optics(st.n1, st.n2, st.th1);
      ro.th2.textContent = o.total ? '无（全反射）' : fmt(o.th2, 1) + '°';
      ro.ratio.textContent = o.total ? '—' : fmt(st.n1 / st.n2, 2);
      ro.speed.innerHTML = fmt(3 / st.n2, 2) + ' <small>×10⁸m/s</small>';
      ro.bend.textContent = st.n1 < st.n2 ? '偏向法线' : (st.n1 > st.n2 ? '偏离法线' : '不偏折');
      Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-n]'), function (tr) {
        tr.classList.toggle('is-active', Math.abs(parseFloat(tr.getAttribute('data-n')) - st.n2) < 1e-6);
      });
    }
    bindCommon(ctx, st, update);
    Array.prototype.forEach.call(ctx.container.querySelectorAll('tr[data-n]'), function (tr) {
      on(tr, 'click', function () {
        st.n2 = parseFloat(tr.getAttribute('data-n'));
        ctx.container.querySelector('[data-key="n2"]').value = st.n2;
        ctx.container.querySelector('[data-val="n2"]').innerHTML = fmt(st.n2, 2);
        update();
      });
    });
    on(win, 'resize', function () { lay = fit($('#rpCurve'), 300); });
    ctx.loop(function () { drawCurve(lay, st); });
    update();
  }
  function drawCurve(lay, st) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var L = 46, R = w - 16, Tp = 16, B = h - 34;
    function X(a) { return L + a / 90 * (R - L); }
    function Y(a) { return B - a / 90 * (B - Tp); }
    c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
    for (var g = 0; g <= 90; g += 15) {
      c.beginPath(); c.moveTo(X(g), Tp); c.lineTo(X(g), B); c.stroke();
      c.beginPath(); c.moveTo(L, Y(g)); c.lineTo(R, Y(g)); c.stroke();
    }
    c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('θ₂/°', 8, Tp + 6); c.fillText('θ₁/°', R - 28, B + 20);
    function curve(n1, n2, color, width) {
      c.beginPath();
      var started = false;
      for (var a = 0; a <= 90; a += 0.5) {
        var s = n1 / n2 * Math.sin(a * Math.PI / 180);
        if (s > 1) break;
        var b = Math.asin(clamp(s, -1, 1)) * 180 / Math.PI;
        if (!started) { c.moveTo(X(a), Y(b)); started = true; } else c.lineTo(X(a), Y(b));
      }
      c.strokeStyle = color; c.lineWidth = width; c.stroke();
    }
    curve(1, 1.5, '#e3ecf3', 2);   // 光疏→光密参考
    curve(1.5, 1, '#eee4f2', 2);   // 光密→光疏参考
    curve(st.n1, st.n2, '#7fb3d5', 3.5);
    var o = optics(st.n1, st.n2, st.th1);
    if (!o.total) {
      c.beginPath(); c.arc(X(st.th1), Y(o.th2), 6, 0, Math.PI * 2); c.fillStyle = '#4b87a8'; c.fill();
    }
    c.fillStyle = '#4b87a8'; c.font = 'bold 12px sans-serif';
    c.fillText('当前 n₁/n₂ = ' + fmt(st.n1 / st.n2, 2), L + 10, Tp + 16);
  }

  /* ---------------- 2 全反射条件 ---------------- */
  function viewCondition(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { th1: 50, n1: 1.50, n2: 1.00 };
    ctx.container.innerHTML =
      '<div class="rp-wrap">' +
        '<div class="rp-lead"><p>全反射必须<b>同时</b>满足两个条件：① 光从光密介质射向光疏介质（n₁ &gt; n₂）；② 入射角 θ₁ ≥ 临界角 C，其中 <b>sinC = n₂ / n₁</b>。缺一不可。</p></div>' +
        '<div class="rp-bar">' +
          ctrlHtml('th1', '入射角 θ₁', 0, 85, 1, 50, '°') +
          ctrlHtml('n1', '光密介质 n₁', 1, 2.5, 0.01, 1.5, '', true) +
          ctrlHtml('n2', '光疏介质 n₂', 1, 2.5, 0.01, 1.0, '', true) +
        '</div>' +
        '<div class="rp-grid">' +
          '<section class="rp-card"><h4>两个必要条件</h4><div class="rp-card__hint">随参数实时判定</div>' +
            '<div class="rp-cond" data-c1><span class="rp-cond__ico">✓</span><span>条件①：n₁ > n₂（光密 → 光疏）</span></div>' +
            '<div class="rp-cond" data-c2><span class="rp-cond__ico">✓</span><span>条件②：θ₁ ≥ C（入射角够大）</span></div>' +
            '<div class="rp-note" data-c3><b>临界角：</b>sinC = n₂/n₁</div>' +
            '<div class="rp-formula" style="margin-top:14px">C = arcsin(n₂/n₁) = <span data-val="C">—</span></div>' +
          '</section>' +
          '<section class="rp-card"><h4>临界状态光路</h4><div class="rp-card__hint">θ₁ = C 时折射角恰为 90°，折射光沿界面传播</div>' +
            '<canvas id="rpCrit" class="rp-cv" style="height:250px" aria-label="临界角光路"></canvas></section>' +
        '</div>' +
        '<section class="rp-card rp-card--wide" style="margin-top:16px"><h4>情境拓展：光导纤维中的全反射</h4><div class="rp-card__hint">纤芯 n₁ 必须大于包层 n₂，光才能在内壁反复全反射向前传播</div>' +
          '<canvas id="rpFiber" class="rp-cv" style="height:210px" aria-label="光纤全反射动画"></canvas></section>' +
        '<div class="rp-note"><b>应用：</b>光导纤维、全反射棱镜都利用全反射。若纤芯折射率不大于包层，光会从侧壁漏出，无法远距离传输。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var critLay = fit($('#rpCrit'), 250), fiberLay = fit($('#rpFiber'), 210);
    function update() {
      var o = optics(st.n1, st.n2, st.th1);
      var c1 = st.n1 > st.n2 + 1e-9;
      var c2 = o.C !== null && st.th1 >= o.C - 1e-9;
      [['[data-c1]', c1], ['[data-c2]', c2]].forEach(function (p) {
        var el = $(p[0]);
        el.className = 'rp-cond ' + (p[1] ? 'rp-cond--yes' : 'rp-cond--no');
        el.querySelector('.rp-cond__ico').textContent = p[1] ? '✓' : '✗';
      });
      $('[data-val="C"]').textContent = o.C === null ? '不存在（n₁ ≤ n₂）' : fmt(o.C, 1) + '°';
      $('[data-c3]').innerHTML = o.total
        ? '<b>已发生全反射：</b>两条件同时满足，折射光消失。'
        : '<b>尚未全反射：</b>' + (!c1 ? '光从光疏射向光密，不可能全反射。' : '入射角小于临界角，仍有折射光。');
    }
    bindCommon(ctx, st, update);
    on(win, 'resize', function () { critLay = fit($('#rpCrit'), 250); fiberLay = fit($('#rpFiber'), 210); });
    ctx.loop(function (t) {
      drawRay(critLay, st, t, { animate: false });
      drawFiber(fiberLay, st, t);
    });
    update();
  }
  function drawFiber(lay, st, t) {
    var c = lay.c, w = lay.w, h = lay.h;
    c.clearRect(0, 0, w, h);
    var top = 46, bot = h - 34;
    c.fillStyle = '#f7fbfe'; c.fillRect(0, top, w, bot - top);
    c.fillStyle = '#fffbf2'; c.fillRect(0, 0, w, top); c.fillRect(0, bot, w, h - bot);
    c.strokeStyle = '#a9cde3'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(16, top); c.lineTo(w - 16, top); c.moveTo(16, bot); c.lineTo(w - 16, bot); c.stroke();
    c.fillStyle = '#8b95a3'; c.font = '12px sans-serif';
    c.fillText('包层 n₂=' + fmt(st.n2, 2), 18, 18);
    c.fillText('纤芯 n₁=' + fmt(st.n1, 2), 18, h - 10);
    var o = optics(st.n1, st.n2, 55); // 纤芯内以 55° 入射内壁
    var ok = o.total;
    c.fillStyle = ok ? '#3f8c68' : '#c1616c'; c.font = 'bold 13px sans-serif';
    c.fillText(ok ? '✓ 满足全反射，光被约束在纤芯内' : '✗ 不满足全反射，光会漏出纤芯', w - 260, 20);
    // 锯齿路径
    var seg = 92, y0 = (top + bot) / 2;
    var pts = [{ x: 16, y: y0 }];
    var dir = 1;
    for (var x = 16 + seg; x < w - 16; x += seg) {
      var y = dir > 0 ? bot - 4 : top + 4;
      pts.push({ x: x, y: y }); dir = -dir;
      pts.push({ x: x + seg * 0.001, y: y });
    }
    pts.push({ x: w - 16, y: y0 });
    c.strokeStyle = ok ? '#d0b4e0' : '#e8b8bd'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.stroke();
    if (!ok) {
      c.strokeStyle = '#e79aa2'; c.setLineDash([4, 4]); c.lineWidth = 2;
      for (var j = 1; j < pts.length - 1; j += 2) {
        c.beginPath(); c.moveTo(pts[j].x, pts[j].y); c.lineTo(pts[j].x + 26, pts[j].y + (pts[j].y > (top + bot) / 2 ? 34 : -34)); c.stroke();
      }
      c.setLineDash([]);
    }
    // 沿路径移动的光点
    var totalLen = 0, lens = [];
    for (var k = 1; k < pts.length; k++) { var d = Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y); lens.push(d); totalLen += d; }
    var pos = (t * 0.00018) % 1 * totalLen, acc = 0;
    for (var m = 0; m < lens.length; m++) {
      if (pos <= acc + lens[m]) {
        var f = (pos - acc) / lens[m];
        var px = pts[m].x + (pts[m + 1].x - pts[m].x) * f;
        var py = pts[m].y + (pts[m + 1].y - pts[m].y) * f;
        c.beginPath(); c.arc(px, py, 5.5, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
        c.strokeStyle = '#8aa8c8'; c.lineWidth = 2; c.stroke();
        break;
      }
      acc += lens[m];
    }
  }

  /* ---------------- 3 高考题型 ---------------- */
  function viewExam(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { n: 1.50, n1: 1.33, n2: 1.00, th1: 50 };
    ctx.container.innerHTML =
      '<div class="rp-wrap">' +
        '<div class="rp-lead"><p>点击选项即时判定并查看解析。第 1 题可调折射率实时计算临界角；第 2 题可调参数观察全反射是否发生。</p></div>' +
        '<div class="rp-q">' +
          '<div class="rp-q__t">1．（计算）玻璃折射率 n = 1.5，光从玻璃射向空气，临界角 C 约为多少？</div>' +
          '<div class="rp-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            '<div class="rp-ctrl" style="flex:1 1 260px"><div class="rp-ctrl__top"><label>介质折射率 n</label><span class="rp-ctrl__val" data-val="n">1.50</span></div>' +
              '<input class="rp-range" type="range" data-key="n" min="1.1" max="2.5" step="0.01" value="1.5" aria-label="折射率"></div>' +
            '<div class="rp-formula" style="font-size:15px">sinC = 1/n，C = <span data-C>—</span></div>' +
          '</div>' +
          '<div class="rp-opts" data-q="1">' +
            '<button type="button" class="rp-opt" data-ans="A">A．30°</button>' +
            '<button type="button" class="rp-opt" data-ans="B">B．42°</button>' +
            '<button type="button" class="rp-opt" data-ans="C">C．48°</button>' +
            '<button type="button" class="rp-opt" data-ans="D">D．60°</button>' +
          '</div><div class="rp-explain" data-exp="1" hidden></div>' +
        '</div>' +
        '<div class="rp-q">' +
          '<div class="rp-q__t">2．（判断）下列光从一种介质射向另一种介质，<b>可能</b>发生全反射的是哪一组？</div>' +
          '<div class="rp-opts" data-q="2">' +
            '<button type="button" class="rp-opt" data-ans="A">A．水 → 空气</button>' +
            '<button type="button" class="rp-opt" data-ans="B">B．空气 → 水</button>' +
            '<button type="button" class="rp-opt" data-ans="C">C．空气 → 玻璃</button>' +
            '<button type="button" class="rp-opt" data-ans="D">D．水 → 玻璃</button>' +
          '</div>' +
          '<div class="rp-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            '<div class="rp-ctrl"><div class="rp-ctrl__top"><label>试试：n₁</label><span class="rp-ctrl__val" data-val="n1">1.33</span></div>' +
              '<input class="rp-range" type="range" data-key="n1" min="1" max="2.5" step="0.01" value="1.33"></div>' +
            '<div class="rp-ctrl"><div class="rp-ctrl__top"><label>试试：n₂</label><span class="rp-ctrl__val" data-val="n2">1.00</span></div>' +
              '<input class="rp-range" type="range" data-key="n2" min="1" max="2.5" step="0.01" value="1.00"></div>' +
            '<div class="rp-ctrl"><div class="rp-ctrl__top"><label>入射角 θ₁</label><span class="rp-ctrl__val" data-val="th1">50°</span></div>' +
              '<input class="rp-range" type="range" data-key="th1" min="0" max="85" step="1" value="50"></div>' +
            '<div class="rp-formula" style="font-size:15px" data-trial>—</div>' +
          '</div>' +
          '<div class="rp-explain" data-exp="2" hidden></div>' +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var exp = {
      '1': { right: 'B', text: 'sinC = n₂/n₁ = 1/1.5 ≈ 0.667，C = arcsin(0.667) ≈ 41.8° ≈ 42°。拖动滑块可见 n 越大 C 越小，越容易发生全反射。' },
      '2': { right: 'A', text: '全反射必须由光密介质射向光疏介质。水的 n≈1.33 > 空气 n≈1，满足；而 B、C、D 都是由光疏射向光密，不可能全反射。' }
    };
    function update() {
      var C = Math.asin(clamp(1 / st.n, 0, 1)) * 180 / Math.PI;
      $('[data-C]').textContent = fmt(C, 1) + '°';
      $('[data-val="n"]').textContent = fmt(st.n, 2);
      var o = optics(st.n1, st.n2, st.th1);
      $('[data-val="n1"]').textContent = fmt(st.n1, 2);
      $('[data-val="n2"]').textContent = fmt(st.n2, 2);
      $('[data-val="th1"]').textContent = fmt(st.th1, 0) + '°';
      $('[data-trial]').innerHTML = o.total ? '此处：全反射 ✓' : (o.C === null ? '此处：不会全反射（光疏→光密）' : '此处：折射（θ₁=' + fmt(st.th1, 0) + '° < C=' + fmt(o.C, 1) + '°）');
    }
    on($('[data-key="n"]'), 'input', function () { st.n = parseFloat(this.value); update(); });
    on($('[data-key="n1"]'), 'input', function () { st.n1 = parseFloat(this.value); update(); });
    on($('[data-key="n2"]'), 'input', function () { st.n2 = parseFloat(this.value); update(); });
    on($('[data-key="th1"]'), 'input', function () { st.th1 = parseFloat(this.value); update(); });
    update();
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-q]'), function (box) {
      var q = box.getAttribute('data-q');
      Array.prototype.forEach.call(box.querySelectorAll('.rp-opt'), function (b) {
        on(b, 'click', function () {
          var ans = b.getAttribute('data-ans');
          Array.prototype.forEach.call(box.querySelectorAll('.rp-opt'), function (x) {
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
