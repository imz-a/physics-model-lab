/* ============================================================
 * ideal-gas.js — 理想气体状态变化（热学）
 * 契约：IIFE + window.ModelLab.modules['ideal-gas']，零依赖，file:// 可用。
 * 归一化：取 R = 1，p = nRT / V（p 为相对压强）；T 用 K，V 用 L，n 用 mol。
 * 4 个子标签：0 基本模型 / 1 图像分析 / 2 微观解释 / 3 高考题型
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = (global.ModelLab = global.ModelLab || {});
  NS.modules = NS.modules || {};

  var CSS_ID = 'lm-css-ideal-gas';
  var CSS = [
    '.ig-wrap{--tint:#FFD8A8;--tint-soft:#FFF8EE;color:var(--ink);font-size:16px;}',
    '.ig-wrap *{box-sizing:border-box;}',
    '.ig-lead{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:16px;}',
    '.ig-lead p{max-width:760px;color:var(--ink-2);font-size:15px;line-height:1.7;}',
    '.ig-formula{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--tint);border-radius:999px;background:var(--tint-soft);font-size:17px;font-weight:700;white-space:nowrap;}',
    '.ig-formula small{font-weight:400;color:var(--ink-2);font-size:12px;}',
    '.ig-bar{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:16px;}',
    '.ig-ctrl{flex:1 1 190px;min-width:170px;}',
    '.ig-ctrl__top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px;}',
    '.ig-ctrl__top label{font-size:14px;color:var(--ink-2);font-weight:600;}',
    '.ig-ctrl__val{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.ig-ctrl__val em{font-style:normal;font-size:12px;color:var(--ink-3);font-weight:400;margin-left:2px;}',
    '.ig-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:99px;background:#eef2f6;outline:0;margin:4px 0;}',
    '.ig-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.ig-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--tint);box-shadow:0 2px 6px rgba(88,108,132,.18);cursor:pointer;}',
    '.ig-btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
    '.ig-btn{min-height:40px;padding:8px 16px;border:1px solid var(--line-2);border-radius:999px;background:#fff;color:var(--ink-2);font-size:14px;font-weight:600;transition:background .15s,border-color .15s,color .15s;white-space:nowrap;}',
    '.ig-btn:hover{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);}',
    '.ig-btn.is-active{background:var(--tint-soft);border-color:var(--tint);color:var(--ink);box-shadow:inset 0 0 0 1px var(--tint);}',
    '.ig-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}',
    '.ig-card{background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);padding:16px 18px;min-width:0;}',
    '.ig-card--wide{grid-column:1/-1;}',
    '.ig-card h4{font-size:16px;font-weight:700;margin-bottom:4px;}',
    '.ig-card__hint{font-size:13px;color:var(--ink-3);margin-bottom:12px;}',
    '.ig-cv{width:100%;display:block;border-radius:10px;background:#fff;}',
    '.ig-readouts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px;}',
    '.ig-ro{padding:14px 16px;background:var(--surface);border:1px solid var(--line-2);border-radius:12px;text-align:center;}',
    '.ig-ro span{display:block;font-size:13px;color:var(--ink-3);}',
    '.ig-ro b{display:block;margin-top:4px;font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;}',
    '.ig-ro small{font-size:12px;color:var(--ink-3);font-weight:400;}',
    '.ig-note{margin-top:14px;padding:12px 16px;border-left:4px solid var(--tint);background:var(--tint-soft);border-radius:0 10px 10px 0;font-size:14px;color:var(--ink-2);}',
    '.ig-note b{color:var(--ink);}',
    '.ig-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--ink-2);margin-top:10px;}',
    '.ig-legend i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:5px;vertical-align:-1px;}',
    '.ig-q{padding:16px 18px;background:var(--surface);border:1px solid var(--line-2);border-radius:14px;box-shadow:var(--shadow);margin-bottom:14px;}',
    '.ig-q__t{font-size:16px;font-weight:700;line-height:1.6;}',
    '.ig-q__t em{font-style:normal;color:#c9856a;}',
    '.ig-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;}',
    '.ig-opt{min-height:46px;padding:10px 14px;text-align:left;border:1px solid var(--line-2);border-radius:10px;background:#fff;font-size:15px;color:var(--ink-2);transition:background .15s,border-color .15s;}',
    '.ig-opt:hover{background:var(--tint-soft);border-color:var(--tint);}',
    '.ig-opt.is-right{background:#eefaf3;border-color:#a8e0c4;color:#2f8a5f;font-weight:700;}',
    '.ig-opt.is-wrong{background:#fff3f4;border-color:#ffc9cf;color:#c1616c;}',
    '.ig-explain{margin-top:12px;padding:12px 14px;background:#f7fafc;border-radius:10px;font-size:14px;color:var(--ink-2);line-height:1.7;}',
    '@media(max-width:1100px){.ig-grid{grid-template-columns:1fr;}.ig-readouts{grid-template-columns:repeat(2,1fr);}}',
    '@media(max-width:760px){.ig-opts{grid-template-columns:1fr;}.ig-readouts{grid-template-columns:repeat(2,1fr);}}'
  ].join('\n');

  function ensureCss(doc) {
    if (doc.getElementById(CSS_ID)) return;
    var s = doc.createElement('style');
    s.id = CSS_ID;
    s.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(s);
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src) continue;
      for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
    }
    return target;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function fmt(v, n) { return Number(v).toFixed(n === undefined ? 1 : n); }

  NS.modules['ideal-gas'] = {
    render: function (container, extIndex) {
      var doc = container.ownerDocument;
      var win = doc.defaultView || global;
      ensureCss(doc);

      var disposed = false;
      var ac = win.AbortController ? new win.AbortController() : null;
      var rafId = 0;
      var tickFn = null;
      var lastT = 0;
      var timers = [];

      function on(target, type, fn, opts) {
        target.addEventListener(type, fn, assign({ signal: ac ? ac.signal : undefined }, opts || {}));
      }
      function loop(fn) {
        tickFn = fn;
        if (!rafId) rafId = win.requestAnimationFrame(frame);
      }
      function frame(t) {
        if (disposed) return;
        var dt = lastT ? Math.min(60, t - lastT) : 16;
        lastT = t;
        if (tickFn) tickFn(t, dt);
        rafId = win.requestAnimationFrame(frame);
      }
      function later(fn, ms) {
        var id = win.setTimeout(function () { if (!disposed) fn(); }, ms);
        timers.push(id); return id;
      }
      function fit(cv, cssH) {
        var dpr = Math.min(win.devicePixelRatio || 1, 2);
        var w = cv.clientWidth || 460;
        var h = cssH || cv.clientHeight || 260;
        cv.width = Math.max(1, Math.round(w * dpr));
        cv.height = Math.max(1, Math.round(h * dpr));
        var c = cv.getContext('2d');
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { c: c, w: w, h: h };
      }

      var ctx = { container: container, doc: doc, win: win, on: on, loop: loop, later: later, fit: fit };
      var views = [viewBasic, viewGraph, viewMicro, viewExam];
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

  /* ---------------- 0 基本模型 ---------------- */
  function viewBasic(ctx) {
    var d = ctx.doc, on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { T: 300, V: 5, n: 1.5 };
    ctx.container.innerHTML =
      '<div class="ig-wrap">' +
        '<div class="ig-lead">' +
          '<p>拖动温度、体积与物质的量，观察压强如何变化；左侧活塞随体积移动，右侧分子随温度加剧热运动。体积越大活塞越向外，压强越大气体着色越深。</p>' +
          '<span class="ig-formula">pV = nRT <small>这里取 R = 1，p 为相对压强</small></span>' +
        '</div>' +
        '<div class="ig-bar">' +
          sliderHtml('T', '温度 T', 100, 600, 10, st.T, 'K') +
          sliderHtml('V', '体积 V', 1, 10, 0.1, st.V, 'L') +
          sliderHtml('n', '物质的量 n', 0.5, 3, 0.1, st.n, 'mol') +
          '<div class="ig-btnrow"><button type="button" class="ig-btn" data-act="reset">恢复默认</button></div>' +
        '</div>' +
        '<div class="ig-grid">' +
          '<section class="ig-card"><h4>活塞 — 气缸模型</h4><div class="ig-card__hint">活塞位置表示体积，颜色深浅表示压强</div>' +
            '<svg id="igCyl" viewBox="0 0 460 230" style="width:100%;height:auto;display:block" role="img" aria-label="活塞气缸示意图"></svg>' +
          '</section>' +
          '<section class="ig-card"><h4>分子热运动</h4><div class="ig-card__hint">温度越高，分子运动越剧烈</div>' +
            '<canvas id="igMol" class="ig-cv" style="height:230px" aria-label="分子热运动动画"></canvas>' +
          '</section>' +
        '</div>' +
        '<div class="ig-readouts">' +
          roHtml('p', '压强 p', '—') + roHtml('pvt', 'pV/T', '—') +
          roHtml('pv', 'pV', '—') + roHtml('state', '状态方程检验', '成立') +
        '</div>' +
        '<div class="ig-note"><b>规律：</b>p = nRT / V。温度 T 升高或物质的量 n 增大，压强增大；体积 V 增大，压强减小。压强本质是大量分子频繁碰撞器壁的宏观表现。</div>' +
      '</div>';

    var $ = function (s) { return ctx.container.querySelector(s); };
    var cyl = $('#igCyl');
    var cv = $('#igMol');
    var lay = fit(cv, 230);
    var read = { p: $('[data-ro="p"]'), pvt: $('[data-ro="pvt"]'), pv: $('[data-ro="pv"]'), state: $('[data-ro="state"]') };

    var particles = [];
    function syncParticles() {
      var target = Math.round(st.n * 20);
      while (particles.length < target) particles.push(newParticle());
      if (particles.length > target) particles.length = target;
    }
    function newParticle() {
      var a = Math.random() * Math.PI * 2;
      return { x: 0.2 + Math.random() * 0.6, y: 0.1 + Math.random() * 0.8, dx: Math.cos(a), dy: Math.sin(a) };
    }
    syncParticles();

    ['T', 'V', 'n'].forEach(function (key) {
      var el = $('[data-key="' + key + '"]');
      on(el, 'input', function () {
        st[key] = parseFloat(el.value);
        $('[data-val="' + key + '"]').textContent = fmt(st[key], key === 'V' || key === 'n' ? 1 : 0);
        if (key === 'n') syncParticles();
        update();
      });
    });
    on($('[data-act="reset"]'), 'click', function () {
      st.T = 300; st.V = 5; st.n = 1.5;
      ['T', 'V', 'n'].forEach(function (key) {
        $('[data-key="' + key + '"]').value = st[key];
        $('[data-val="' + key + '"]').textContent = fmt(st[key], key === 'V' || key === 'n' ? 1 : 0);
      });
      syncParticles(); update();
    });
    on(win, 'resize', function () { lay = fit(cv, 230); });

    function update() {
      var p = st.n * st.T / st.V;
      read.p.innerHTML = fmt(p, 1) + ' <small>相对值</small>';
      read.pvt.textContent = fmt((p * st.V / st.T), 2);
      read.pv.textContent = fmt(p * st.V, 1);
      read.state.textContent = 'pV/T = nR = ' + fmt(st.n, 1);
      drawCylinder(cyl, st, p);
    }

    ctx.loop(function (t, dt) {
      var p = st.n * st.T / st.V;
      var c = lay.c, w = lay.w, h = lay.h;
      c.clearRect(0, 0, w, h);
      // 容器：宽度随 V 变化
      var boxL = 14, boxR = 14 + (w - 28) * (0.45 + 0.5 * (st.V - 1) / 9);
      var boxT = 16, boxB = h - 16;
      c.fillStyle = '#fcfdfe';
      c.fillRect(boxL, boxT, boxR - boxL, boxB - boxT);
      c.strokeStyle = '#dbe4ec'; c.lineWidth = 2;
      c.strokeRect(boxL, boxT, boxR - boxL, boxB - boxT);
      var speed = 0.11 * Math.sqrt(st.T / 300);
      var step = speed * dt;
      for (var i = 0; i < particles.length; i++) {
        var q = particles[i];
        var px = boxL + q.x * (boxR - boxL);
        var py = boxT + q.y * (boxB - boxT);
        q.x += q.dx * step / (boxR - boxL);
        q.y += q.dy * step / (boxB - boxT);
        if (q.x < 0.02) { q.x = 0.02; q.dx = Math.abs(q.dx); }
        if (q.x > 0.98) { q.x = 0.98; q.dx = -Math.abs(q.dx); }
        if (q.y < 0.03) { q.y = 0.03; q.dy = Math.abs(q.dy); }
        if (q.y > 0.97) { q.y = 0.97; q.dy = -Math.abs(q.dy); }
        c.beginPath(); c.arc(px, py, 4, 0, Math.PI * 2);
        c.fillStyle = 'rgba(232,150,120,.85)'; c.fill();
        c.beginPath(); c.arc(px - 1.2, py - 1.2, 1.3, 0, Math.PI * 2);
        c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
      }
      c.fillStyle = '#8b95a3'; c.font = '13px sans-serif';
      c.fillText('分子数 ∝ n = ' + fmt(st.n, 1) + '　速率 ∝ √T', 16, h - 2);
    });
    update();
  }

  function sliderHtml(key, label, min, max, step, val, unit) {
    return '<div class="ig-ctrl"><div class="ig-ctrl__top"><label for="igS' + key + '">' + label + '</label>' +
      '<span class="ig-ctrl__val" data-val="' + key + '">' + fmt(val, step < 1 ? 1 : 0) + '<em>' + unit + '</em></span></div>' +
      '<input id="igS' + key + '" class="ig-range" type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" aria-label="' + label + '"></div>';
  }
  function roHtml(key, label, val) {
    return '<div class="ig-ro"><span>' + label + '</span><b data-ro="' + key + '">' + val + '</b></div>';
  }

  function drawCylinder(svg, st, p) {
    var px = 60 + (st.V - 1) / 9 * 300;
    var shade = clamp(0.10 + p / 900, 0.1, 0.9);
    var angle = -120 + clamp(p / 900, 0, 1) * 240;
    var gasColor = 'rgba(255,190,140,' + fmt(shade, 2) + ')';
    var ns = 'http://www.w3.org/2000/svg';
    function el(tag, attrs, text) {
      var n = document.createElementNS(ns, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (text !== undefined) n.textContent = text;
      return n;
    }
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.appendChild(el('rect', { x: 40, y: 70, width: 372, height: 112, rx: 6, fill: '#fbfcfe', stroke: '#dbe4ec', 'stroke-width': 2 }));
    svg.appendChild(el('rect', { x: 42, y: 72, width: Math.max(2, px - 42), height: 108, rx: 4, fill: gasColor }));
    // 缸底
    svg.appendChild(el('rect', { x: 34, y: 60, width: 10, height: 132, rx: 3, fill: '#c9d6e2' }));
    // 活塞
    svg.appendChild(el('rect', { x: px, y: 62, width: 14, height: 128, rx: 3, fill: '#ffd8a8', stroke: '#e8b884', 'stroke-width': 2 }));
    svg.appendChild(el('rect', { x: px + 14, y: 112, width: Math.max(8, 410 - px - 14), height: 10, rx: 5, fill: '#dbe4ec' }));
    svg.appendChild(el('text', { x: 46, y: 205, fill: '#5a6472', 'font-size': 13 }, 'V = ' + fmt(st.V, 1) + ' L'));
    // 压力表
    svg.appendChild(el('circle', { cx: 70, cy: 34, r: 24, fill: '#fff', stroke: '#dbe4ec', 'stroke-width': 2 }));
    var rad = (angle - 90) * Math.PI / 180;
    svg.appendChild(el('line', { x1: 70, y1: 34, x2: 70 + Math.cos(rad) * 17, y2: 34 + Math.sin(rad) * 17, stroke: '#e08a6f', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    svg.appendChild(el('circle', { cx: 70, cy: 34, r: 3, fill: '#5a6472' }));
    svg.appendChild(el('text', { x: 104, y: 39, fill: '#5a6472', 'font-size': 14 }, 'p = ' + fmt(p, 0) + '（相对）'));
    svg.appendChild(el('text', { x: 250, y: 205, fill: '#5a6472', 'font-size': 13 }, 'T = ' + fmt(st.T, 0) + ' K　n = ' + fmt(st.n, 1) + ' mol'));
  }

  /* ---------------- 1 图像分析 ---------------- */
  function viewGraph(ctx) {
    var d = ctx.doc, on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { n: 1.5, T: 300, V: 5, mode: 'iso' };
    var pMax = 3000;   // 固定压强量程，覆盖 n=3、T=900、V=1 的极端值 p=3×900/1=2700，避免状态点贴顶饱和
    var nRef = st.n;   // 变化前的物质的量（灰虚线参考）
    ctx.container.innerHTML =
      '<div class="ig-wrap">' +
        '<div class="ig-lead"><p>拖动 <b>p–V 图</b>上的状态点 A，切换等温 / 等压 / 等容过程，观察状态如何沿过程线移动；右下方 p–T 图同步显示等容线。</p>' +
          '<span class="ig-formula">pV/T = 常量 <small>质量一定时</small></span></div>' +
        '<div class="ig-bar">' +
          '<div class="ig-btnrow"><button type="button" class="ig-btn is-active" data-mode="iso">等温 T 不变</button>' +
          '<button type="button" class="ig-btn" data-mode="bar">等压 p 不变</button>' +
          '<button type="button" class="ig-btn" data-mode="vol">等容 V 不变</button></div>' +
          '<div class="ig-btnrow"><button type="button" class="ig-btn" data-act="play">▶ 播放过程</button>' +
          '<button type="button" class="ig-btn" data-act="reset">复位</button></div>' +
          '<div class="ig-ctrl" style="flex:0 0 220px"><div class="ig-ctrl__top"><label>物质的量 n</label><span class="ig-ctrl__val" data-val="n">1.5<em>mol</em></span></div>' +
          '<input class="ig-range" type="range" data-key="n" min="0.5" max="3" step="0.1" value="1.5"></div>' +
        '</div>' +
        '<div class="ig-grid">' +
          '<section class="ig-card"><h4>p – V 图（可拖动状态点 A）</h4><div class="ig-card__hint">按住红点拖动；过程线随所选定律变化</div>' +
            '<canvas id="igPV" class="ig-cv" style="height:330px" aria-label="pV 图"></canvas></section>' +
          '<section class="ig-card"><h4>p – T 图</h4><div class="ig-card__hint">等容过程为过原点的直线，斜率 ∝ n/V</div>' +
            '<canvas id="igPT" class="ig-cv" style="height:330px" aria-label="pT 图"></canvas></section>' +
        '</div>' +
        '<div class="ig-readouts">' +
          roHtml('p', '压强 p', '—') + roHtml('v', '体积 V', '—') + roHtml('t', '温度 T', '—') + roHtml('law', '当前过程', '等温') +
        '</div>' +
        '<div class="ig-note" data-note><b>等温过程：</b>pV = 常量，p–V 图为双曲线，温度不变则内能不变。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var pv = fit($('#igPV'), 330), pt = fit($('#igPT'), 330);
    var read = { p: $('[data-ro="p"]'), v: $('[data-ro="v"]'), t: $('[data-ro="t"]'), law: $('[data-ro="law"]') };
    var notes = {
      iso: '<b>等温过程：</b>pV = 常量，p–V 图为双曲线，温度不变则内能不变。',
      bar: '<b>等压过程：</b>V/T = 常量，p–V 图为水平线，p–T 图为水平线。',
      vol: '<b>等容过程：</b>p/T = 常量，p–V 图为竖直线，p–T 图为过原点的直线。'
    };
    var lawNames = { iso: '等温 pV=C', bar: '等压 V/T=C', vol: '等容 p/T=C' };
    var drag = false, playing = false, playT = 0, playP = 0;

    function pressure(V, T) { return st.n * T / V; }
    function updateLabels() {
      var p = pressure(st.V, st.T);
      read.p.textContent = fmt(p, 1);
      read.v.textContent = fmt(st.V, 1) + ' L';
      read.t.textContent = fmt(st.T, 0) + ' K';
      read.law.textContent = lawNames[st.mode];
      $('[data-note]').innerHTML = notes[st.mode];
      $('[data-val="n"]').innerHTML = fmt(st.n, 1) + '<em>mol</em>';
    }
    // p-V 图坐标映射
    function X(v) { return 52 + (v - 1) / 9 * (pv.w - 78); }
    function Y(p) { return pv.h - 42 - clamp(p / pMax, 0, 1) * (pv.h - 66); }
    function vFromX(x) { return clamp(1 + (x - 52) / (pv.w - 78) * 9, 1, 10); }
    function pFromY(y) { return clamp((pv.h - 42 - y) / (pv.h - 66) * pMax, 1, pMax); }

    function drawPV() {
      var c = pv.c, w = pv.w, h = pv.h;
      c.clearRect(0, 0, w, h);
      // 网格
      c.strokeStyle = '#eef2f6'; c.lineWidth = 1;
      for (var v = 1; v <= 10; v++) { c.beginPath(); c.moveTo(X(v), 18); c.lineTo(X(v), h - 42); c.stroke(); }
      for (var p = 0; p <= pMax; p += 250) { c.beginPath(); c.moveTo(52, Y(p)); c.lineTo(w - 26, Y(p)); c.stroke(); }
      // 等温参考线族
      c.strokeStyle = '#f3e3cf'; c.lineWidth = 1.5;
      [200, 300, 450, 600].forEach(function (T) {
        c.beginPath();
        for (var vv = 1; vv <= 10.01; vv += 0.15) {
          var yy = Y(st.n * T / vv);
          if (vv === 1) c.moveTo(X(vv), yy); else c.lineTo(X(vv), yy);
        }
        c.stroke();
      });
      // 当前过程线
      c.strokeStyle = '#e8a06f'; c.lineWidth = 3;
      c.beginPath();
      if (st.mode === 'iso') {
        for (var v2 = 1; v2 <= 10.01; v2 += 0.1) {
          var y2 = Y(pressure(v2, st.T));
          if (v2 === 1) c.moveTo(X(v2), y2); else c.lineTo(X(v2), y2);
        }
      } else if (st.mode === 'bar') {
        c.moveTo(X(1), Y(pressure(st.V, st.T))); c.lineTo(X(10), Y(pressure(st.V, st.T)));
      } else {
        c.moveTo(X(st.V), Y(1)); c.lineTo(X(st.V), Y(pMax));
      }
      c.stroke();
      // 坐标轴
      c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(52, 18); c.lineTo(52, h - 42); c.lineTo(w - 20, h - 42); c.stroke();
      c.fillStyle = '#8b95a3'; c.font = '13px sans-serif';
      c.fillText('p / (相对单位)', 8, 14); c.fillText('V / L', w - 40, h - 24);
      for (var vv2 = 2; vv2 <= 10; vv2 += 2) c.fillText(String(vv2), X(vv2) - 4, h - 24);
      for (var pvTick = 0; pvTick <= pMax; pvTick += 500) c.fillText(String(pvTick), 10, Y(pvTick) + 4);
      // 状态点
      var ax = X(st.V), ay = Y(pressure(st.V, st.T));
      c.beginPath(); c.arc(ax, ay, 12, 0, Math.PI * 2); c.fillStyle = 'rgba(255,179,186,.45)'; c.fill();
      c.beginPath(); c.arc(ax, ay, 6, 0, Math.PI * 2); c.fillStyle = '#e06c75'; c.fill();
      c.fillStyle = '#c1616c'; c.font = 'bold 14px sans-serif'; c.fillText('A', ax + 12, ay - 10);
    }
    function drawPT() {
      var c = pt.c, w = pt.w, h = pt.h;
      c.clearRect(0, 0, w, h);
      var tMax = 600, pTop = 120;
      function X2(T) { return 52 + T / tMax * (w - 78); }
      function Y2(p) { return h - 42 - clamp(p / pTop, 0, 1) * (h - 66); }
      c.strokeStyle = '#eef2f6';
      for (var T = 0; T <= 600; T += 100) { c.beginPath(); c.moveTo(X2(T), 18); c.lineTo(X2(T), h - 42); c.stroke(); }
      for (var pp = 0; pp <= pTop; pp += 20) { c.beginPath(); c.moveTo(52, Y2(pp)); c.lineTo(w - 26, Y2(pp)); c.stroke(); }
      // 等容线 p=nT/V：按 T 逐点绘制，到达 pTop 后水平延伸（真实形状，不是终点 clamp 的斜线）
      function isoLine(V, n, color, width, dash) {
        var tTop = pTop * V / n;
        c.save(); c.strokeStyle = color; c.lineWidth = width;
        if (dash) c.setLineDash(dash);
        c.beginPath(); c.moveTo(X2(0), Y2(0));
        var tEnd = Math.min(tMax, tTop);
        for (var tt = 4; tt <= tEnd; tt += 4) c.lineTo(X2(tt), Y2(n * tt / V));
        c.lineTo(X2(tEnd), Y2(n * tEnd / V));
        if (tTop < tMax) { c.lineTo(X2(tTop), Y2(pTop)); c.lineTo(X2(tMax), Y2(pTop)); }
        c.stroke(); c.restore();
      }
      if (Math.abs(nRef - st.n) > 1e-9) isoLine(4, nRef, '#aeb8c6', 2, [6, 5]); // 变化前参考
      [2, 4, 6, 8].forEach(function (V) { isoLine(V, st.n, '#d5c7e6', 2, null); });
      c.save(); c.fillStyle = '#aeb8c6'; c.font = '12px sans-serif';
      c.fillText('灰虚线：变化前 n=' + fmt(nRef, 1), 56, 30); c.restore();
      c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(52, 18); c.lineTo(52, h - 42); c.lineTo(w - 20, h - 42); c.stroke();
      c.fillStyle = '#8b95a3'; c.font = '13px sans-serif';
      c.fillText('p / (相对单位)', 4, 14); c.fillText('T / K', w - 48, h - 24);
      for (var T2 = 100; T2 <= 600; T2 += 200) c.fillText(String(T2), X2(T2) - 8, h - 24);
      for (var ptTick = 0; ptTick <= pTop; ptTick += 40) c.fillText(String(ptTick), 12, Y2(ptTick) + 4);
      c.save(); c.fillStyle = '#8b95a3'; c.font = '12px sans-serif'; c.fillText('淡紫：等容线 V=2/4/6/8 L', 56, 46); c.restore();
      var cxp = X2(st.T), cyp = Y2(pressure(st.V, st.T));
      c.beginPath(); c.arc(cxp, cyp, 12, 0, Math.PI * 2); c.fillStyle = 'rgba(208,196,232,.45)'; c.fill();
      c.beginPath(); c.arc(cxp, cyp, 6, 0, Math.PI * 2); c.fillStyle = '#9b86c4'; c.fill();
    }

    function pointerPos(e) {
      var r = $('#igPV').getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function applyDrag(pos) {
      var p = pressure(st.V, st.T);
      if (st.mode === 'iso') { st.V = vFromX(pos.x); }
      else if (st.mode === 'bar') { st.V = vFromX(pos.x); st.T = p * st.V / st.n; }
      else { p = pFromY(pos.y); st.T = p * st.V / st.n; }
      st.V = clamp(st.V, 1, 10); st.T = clamp(st.T, 50, 900);
      updateLabels();
    }
    var cvEl = $('#igPV');
    on(cvEl, 'pointerdown', function (e) {
      var pos = pointerPos(e);
      var ax = X(st.V), ay = Y(pressure(st.V, st.T));
      if (Math.abs(pos.x - ax) < 24 && Math.abs(pos.y - ay) < 24) {
        drag = true; cvEl.setPointerCapture(e.pointerId);
      }
    });
    on(cvEl, 'pointermove', function (e) { if (drag) applyDrag(pointerPos(e)); });
    on(cvEl, 'pointerup', function () { drag = false; });
    on(cvEl, 'pointercancel', function () { drag = false; });

    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-mode]'), function (b) {
      on(b, 'click', function () {
        st.mode = b.getAttribute('data-mode');
        Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-mode]'), function (x) { x.classList.toggle('is-active', x === b); });
        updateLabels();
      });
    });
    on($('[data-key="n"]'), 'input', function () { nRef = st.n; st.n = parseFloat(this.value); updateLabels(); });
    on($('[data-act="reset"]'), 'click', function () {
      st.n = 1.5; st.T = 300; st.V = 5; playing = false; nRef = 1.5;
      ctx.container.querySelector('[data-key="n"]').value = 1.5;
      updateLabels();
    });
    on($('[data-act="play"]'), 'click', function () {
      playing = true; playT = 0; playP = pressure(st.V, st.T);
    });
    on(win, 'resize', function () { pv = fit($('#igPV'), 330); pt = fit($('#igPT'), 330); });

    ctx.loop(function (t, dt) {
      if (playing) {
        playT += dt / 1400;
        if (playT > 1) { playT = 0; }
        var k = playT < 0.5 ? playT * 2 : (1 - playT) * 2;
        if (st.mode === 'vol') { st.T = 200 + k * 400; }
        else { st.V = 2 + k * 6; if (st.mode === 'bar') st.T = playP * st.V / st.n; }
        updateLabels();
      }
      drawPV(); drawPT();
    });
    updateLabels();
  }

  /* ---------------- 2 微观解释 ---------------- */
  function viewMicro(ctx) {
    var on = ctx.on, fit = ctx.fit, win = ctx.win;
    var st = { T: 300, flash: [] };
    ctx.container.innerHTML =
      '<div class="ig-wrap">' +
        '<div class="ig-lead"><p>温度是分子平均动能的标志。升高温度，分子速率分布曲线向右移动、峰值降低，撞击器壁更频繁更剧烈，宏观上表现为压强增大。</p>' +
          '<span class="ig-formula">平均动能 ∝ T <small>归一化示意</small></span></div>' +
        '<div class="ig-bar"><div class="ig-ctrl"><div class="ig-ctrl__top"><label>温度 T</label><span class="ig-ctrl__val" data-val="T">300<em>K</em></span></div>' +
          '<input class="ig-range" type="range" data-key="T" min="100" max="800" step="10" value="300" aria-label="温度"></div>' +
          '<div class="ig-btnrow"><button type="button" class="ig-btn" data-t="200">低温 200K</button><button type="button" class="ig-btn" data-t="300">常温 300K</button><button type="button" class="ig-btn" data-t="700">高温 700K</button></div></div>' +
        '<div class="ig-grid">' +
          '<section class="ig-card"><h4>分子热运动与器壁碰撞</h4><div class="ig-card__hint">亮起的边缘表示分子撞击器壁产生压力</div>' +
            '<canvas id="igMol2" class="ig-cv" style="height:270px" aria-label="分子碰撞动画"></canvas></section>' +
          '<section class="ig-card"><h4>分子速率分布（麦克斯韦分布示意）</h4><div class="ig-card__hint">横轴：速率；纵轴：分子数占比。T 越高，峰越低越靠右</div>' +
            '<canvas id="igDist" class="ig-cv" style="height:270px" aria-label="速率分布曲线"></canvas></section>' +
        '</div>' +
        '<div class="ig-legend"><span><i style="background:#f6c99a"></i>200 K</span><span><i style="background:#e8a06f"></i>300 K</span><span><i style="background:#d97a6c"></i>700 K</span></div>' +
        '<div class="ig-note"><b>要点：</b>同一温度下分子速率有快有慢，呈“中间多、两头少”的分布；温度升高，<b>平均</b>速率增大，但并非每个分子都变快。</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var molLay = fit($('#igMol2'), 270), distLay = fit($('#igDist'), 270);
    var ps = [];
    for (var i = 0; i < 46; i++) {
      var a = Math.random() * Math.PI * 2;
      ps.push({ x: 0.05 + Math.random() * 0.9, y: 0.05 + Math.random() * 0.9, dx: Math.cos(a), dy: Math.sin(a) });
    }
    function setT(v) {
      st.T = v;
      $('[data-val="T"]').innerHTML = v + '<em>K</em>';
      ctx.container.querySelector('[data-key="T"]').value = v;
    }
    on(ctx.container.querySelector('[data-key="T"]'), 'input', function () { setT(parseInt(this.value, 10)); });
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-t]'), function (b) {
      on(b, 'click', function () { setT(parseInt(b.getAttribute('data-t'), 10)); });
    });
    on(win, 'resize', function () { molLay = fit($('#igMol2'), 270); distLay = fit($('#igDist'), 270); });

    function drawDist() {
      var c = distLay.c, w = distLay.w, h = distLay.h;
      c.clearRect(0, 0, w, h);
      var L = 46, R = w - 20, Tp = 16, B = h - 36;
      function X(v) { return L + v / 3 * (R - L); }
      function Y(f) { return B - f * (B - Tp); }
      c.strokeStyle = '#eef2f6';
      for (var i = 0; i <= 6; i++) { c.beginPath(); c.moveTo(X(i * 0.5), Tp); c.lineTo(X(i * 0.5), B); c.stroke(); }
      c.strokeStyle = '#9aa6b4'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
      c.fillStyle = '#8b95a3'; c.font = '13px sans-serif';
      c.fillText('速率 v', R - 42, B + 22); c.fillText('占比', 14, Tp + 4);
      var curves = [
        { T: 200, col: '#f6c99a' }, { T: 300, col: '#e8a06f' }, { T: 700, col: '#d97a6c' }
      ];
      curves.forEach(function (cvv) {
        c.beginPath();
        for (var v = 0; v <= 3.001; v += 0.03) {
          var vp = 0.9 * Math.sqrt(cvv.T / 300);
          var f = (v / vp) * (v / vp) * Math.exp(-(v / vp) * (v / vp));
          f = clamp(f / 1.1, 0, 1);
          if (v === 0) c.moveTo(X(v), Y(f)); else c.lineTo(X(v), Y(f));
        }
        c.strokeStyle = cvv.col; c.lineWidth = cvv.T === st.T ? 4 : 2; c.stroke();
      });
      // 当前 T 的平均值标记：分布峰值位于 vp=0.9√(T/300)（最概然速率），
      // 麦克斯韦分布平均速率 v̄=(2/√π)·vp≈1.128vp≈1.02√(T/300)，而非 1.13√。
      var vm = 2 / Math.sqrt(Math.PI) * (0.9 * Math.sqrt(st.T / 300));
      c.strokeStyle = '#c1616c'; c.setLineDash([5, 4]); c.lineWidth = 2;
      c.beginPath(); c.moveTo(X(vm), Tp); c.lineTo(X(vm), B); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#c1616c'; c.font = 'bold 13px sans-serif';
      c.fillText('平均速率', X(vm) + 6, Tp + 16);
    }

    ctx.loop(function (t, dt) {
      var c = molLay.c, w = molLay.w, h = molLay.h;
      c.clearRect(0, 0, w, h);
      var L = 16, R = w - 16, Tp = 16, B = h - 26;
      c.fillStyle = '#fcfdfe'; c.fillRect(L, Tp, R - L, B - Tp);
      var step = 0.075 * Math.sqrt(st.T / 300) * dt / 60;
      for (var i = 0; i < ps.length; i++) {
        var q = ps[i];
        q.x += q.dx * step; q.y += q.dy * step;
        if (q.x < 0.02) { q.x = 0.02; q.dx = Math.abs(q.dx); st.flash.push({ e: 'l', y: q.y, a: 1 }); }
        if (q.x > 0.98) { q.x = 0.98; q.dx = -Math.abs(q.dx); st.flash.push({ e: 'r', y: q.y, a: 1 }); }
        if (q.y < 0.03) { q.y = 0.03; q.dy = Math.abs(q.dy); st.flash.push({ e: 't', x: q.x, a: 1 }); }
        if (q.y > 0.97) { q.y = 0.97; q.dy = -Math.abs(q.dy); st.flash.push({ e: 'b', x: q.x, a: 1 }); }
        var px = L + q.x * (R - L), py = Tp + q.y * (B - Tp);
        c.beginPath(); c.arc(px, py, 4, 0, Math.PI * 2); c.fillStyle = '#e8a06f'; c.fill();
        c.beginPath(); c.arc(px - 1.2, py - 1.2, 1.3, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
      }
      if (st.flash.length > 60) st.flash.splice(0, st.flash.length - 60);
      st.flash = st.flash.filter(function (f) {
        f.a -= 0.04;
        if (f.a <= 0) return false;
        c.save(); c.globalAlpha = f.a; c.fillStyle = '#ffb3ba';
        if (f.e === 'l') c.fillRect(L, Tp + f.y * (B - Tp) - 12, 5, 24);
        if (f.e === 'r') c.fillRect(R - 5, Tp + f.y * (B - Tp) - 12, 5, 24);
        if (f.e === 't') c.fillRect(L + f.x * (R - L) - 12, Tp, 24, 5);
        if (f.e === 'b') c.fillRect(L + f.x * (R - L) - 12, B - 5, 24, 5);
        c.restore();
        return true;
      });
      c.strokeStyle = '#c9d6e2'; c.lineWidth = 3; c.strokeRect(L, Tp, R - L, B - Tp);
      drawDist();
    });
  }

  /* ---------------- 3 高考题型 ---------------- */
  function viewExam(ctx) {
    var on = ctx.on;
    ctx.container.innerHTML =
      '<div class="ig-wrap">' +
        '<div class="ig-lead"><p>两道典型题，点击选项即时判定并查看解析。第 1 题可调体积直观看到压强变化。</p></div>' +
        '<div class="ig-q">' +
          '<div class="ig-q__t" data-qt="1">1．（等温变化）一定质量的理想气体温度保持不变，体积由 2.0 L 变为 1.0 L，压强将如何变化？</div>' +
          '<div class="ig-bar" style="box-shadow:none;border:0;padding:12px 0">' +
            '<div class="ig-ctrl" style="flex:1 1 260px"><div class="ig-ctrl__top"><label>末体积 V₂</label><span class="ig-ctrl__val" data-val="v2">1.0<em>L</em></span></div>' +
            '<input class="ig-range" type="range" data-key="v2" min="0.5" max="4" step="0.1" value="1" aria-label="末体积"></div>' +
            '<div class="ig-formula" style="font-size:15px">p₂ / p₁ = V₁ / V₂ = <span data-ratio>2.0</span></div>' +
          '</div>' +
          '<div class="ig-opts" data-q="1">' +
            '<button type="button" class="ig-opt" data-ans="A">A．变为原来的一半</button>' +
            '<button type="button" class="ig-opt" data-ans="B">B．变为原来的 2 倍</button>' +
            '<button type="button" class="ig-opt" data-ans="C">C．保持不变</button>' +
            '<button type="button" class="ig-opt" data-ans="D">D．变为原来的 4 倍</button>' +
          '</div><div class="ig-explain" data-exp="1" hidden></div>' +
        '</div>' +
        '<div class="ig-q">' +
          '<div class="ig-q__t">2．（图像判断）在 p–V 图中，一条<b>水平直线</b>表示气体经历了哪种过程？</div>' +
          '<div class="ig-opts" data-q="2">' +
            '<button type="button" class="ig-opt" data-ans="A">A．等温过程</button>' +
            '<button type="button" class="ig-opt" data-ans="B">B．等压过程</button>' +
            '<button type="button" class="ig-opt" data-ans="C">C．等容过程</button>' +
            '<button type="button" class="ig-opt" data-ans="D">D．都不是</button>' +
          '</div><div class="ig-explain" data-exp="2" hidden></div>' +
        '</div>' +
      '</div>';
    var $ = function (s) { return ctx.container.querySelector(s); };
    var exp = {
      '1': { right: 'B', text: '' },
      '2': { right: 'B', text: 'p–V 图中纵轴是压强 p。水平线意味着 p 不随 V 变化，即压强恒定，是等压过程（此时 V ∝ T）。' }
    };
    var v2Input = $('[data-key="v2"]');
    function optText(x) {
      if (Math.abs(x - 1) < 0.02) return '保持不变';
      if (Math.abs(x - 0.5) < 0.02) return '变为原来的一半';
      return '变为原来的 ' + fmt(x, 2) + ' 倍';
    }
    function updateRatio() {
      var v2 = parseFloat(v2Input.value), ratio = 2 / v2;
      $('[data-val="v2"]').innerHTML = fmt(v2, 1) + '<em>L</em>';
      $('[data-ratio]').textContent = fmt(ratio, 2);
      $('[data-qt="1"]').textContent = '1．（等温变化）一定质量的理想气体温度保持不变，体积由 2.0 L 变为 '
        + fmt(v2, 1) + ' L，压强将如何变化？';
      // 选项与正确答案随 V₂ 实时生成（含去重，滑块 0.5~4 L 全程可判）
      var cand = [ratio], extra = [ratio / 2, ratio * 2, 1, ratio * 4, ratio / 4, 0.5, 2, 3];
      function pushUnique(v) {
        for (var z = 0; z < cand.length; z++) if (Math.abs(cand[z] - v) < 0.02) return;
        if (cand.length < 4) cand.push(v);
      }
      for (var i = 0; i < extra.length && cand.length < 4; i++) pushUnique(extra[i]);
      var off = Math.round(v2 * 10) % 4, letters = ['A', 'B', 'C', 'D'];
      for (var k = 0; k < 4; k++) {
        var val = cand[(k + off) % 4];
        $('[data-q="1"] [data-ans="' + letters[k] + '"]').textContent = letters[k] + '．' + optText(val);
        if (Math.abs(val - ratio) < 0.02) exp['1'].right = letters[k];
      }
      exp['1'].text = '等温过程 p₁V₁ = p₂V₂，故 p₂/p₁ = V₁/V₂ = 2/' + fmt(v2, 1)
        + ' = ' + fmt(ratio, 2) + '，应选 ' + exp['1'].right + '。V₂ 越小，压强比越大。';
      var box = $('[data-q="1"]');
      Array.prototype.forEach.call(box.querySelectorAll('.ig-opt'), function (x) { x.classList.remove('is-right', 'is-wrong'); });
      $('[data-exp="1"]').hidden = true;
    }
    on(v2Input, 'input', updateRatio); updateRatio();
    Array.prototype.forEach.call(ctx.container.querySelectorAll('[data-q]'), function (box) {
      var q = box.getAttribute('data-q');
      Array.prototype.forEach.call(box.querySelectorAll('.ig-opt'), function (b) {
        on(b, 'click', function () {
          var ans = b.getAttribute('data-ans');
          Array.prototype.forEach.call(box.querySelectorAll('.ig-opt'), function (x) {
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
