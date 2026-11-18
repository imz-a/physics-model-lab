/* inclined-block.js — 斜面滑块交互模块（IIFE，无外部依赖） */
(function (global) {
  'use strict';
  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};
  var G = 9.8;

  var STYLE = `<style>
.ib-wrap{color:var(--ink,#3a4250);font-size:15px}
.ib-grid{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(296px,.88fr);gap:16px;align-items:start}
@media(max-width:1080px){.ib-grid{grid-template-columns:1fr}}
.ib-card{background:#fff;border:1px solid var(--line-2,#dce4ec);border-radius:16px;box-shadow:var(--shadow,0 2px 8px rgba(88,108,132,.05));padding:14px 16px}
.ib-card+.ib-card{margin-top:14px}
.ib-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.ib-hd h4{font-size:16px;font-weight:700}
.ib-hd small{font-size:12px;color:var(--ink-3,#8b95a3)}
canvas.ib-cv{display:block;width:100%;height:200px;border-radius:10px;background:#fcfdfe;border:1px solid var(--line,#e8edf2)}
canvas.ib-cv.chart{height:146px}
.ib-intro{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.ib-chip{padding:5px 11px;border:1px solid var(--line-2,#dce4ec);border-radius:999px;background:#fff;font-size:13px;color:var(--ink-2,#5a6472)}
.ib-chip.hot{background:#FFF4F5;border-color:#FFB3BA}
.ib-chip b{color:var(--ink,#3a4250)}
.ib-ctrl{margin-top:9px}
.ib-ctrl label{display:flex;justify-content:space-between;font-size:13px;color:var(--ink-2,#5a6472);margin-bottom:2px}
.ib-ctrl label b{color:var(--ink,#3a4250);font-variant-numeric:tabular-nums}
input.ib-range{width:100%;height:22px;margin:0;background:transparent;border:0;-webkit-appearance:none;appearance:none;cursor:pointer}
input.ib-range::-webkit-slider-runnable-track{height:6px;background:#e8edf2;border-radius:99px}
input.ib-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-6px;border-radius:50%;background:#FFB3BA;border:3px solid #fff;box-shadow:0 1px 5px rgba(88,108,132,.28)}
input.ib-range::-moz-range-track{height:6px;background:#e8edf2;border-radius:99px}
input.ib-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#FFB3BA;border:3px solid #fff}
.ib-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.ib-btn{min-height:36px;padding:6px 13px;border:1px solid var(--line-2,#dce4ec);border-radius:9px;background:#fff;font-size:13px;font-weight:600}
.ib-btn:hover{border-color:#FFB3BA;background:#FFF4F5}
.ib-btn.main{background:#FFF4F5;border-color:#FFB3BA}
.ib-btn.seg.on{background:#F1F8FD;border-color:#BFE3F5;color:#3f7fa5}
.ib-reads{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ib-read{padding:8px 10px;background:#fafbfc;border:1px solid var(--line,#e8edf2);border-radius:9px}
.ib-read span{display:block;font-size:11px;color:var(--ink-3,#8b95a3);white-space:nowrap}
.ib-read b{font-size:16px;font-variant-numeric:tabular-nums}
.ib-read.hl{background:#FFF4F5;border-color:#FFD8DE}
.ib-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#5a6472);margin-top:8px}
.ib-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.ib-tip{margin-top:10px;padding:9px 12px;background:#F1F8FD;border:1px solid #BFE3F5;border-radius:9px;font-size:12.5px;color:var(--ink-2,#5a6472);line-height:1.6}
.ib-barrow{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.ib-barrow>span{flex:0 0 62px;font-size:12px;color:var(--ink-2,#5a6472)}
.ib-bartrack{flex:1;height:19px;background:#f2f5f8;border-radius:6px;overflow:hidden}
.ib-barfill{height:100%;width:0;border-radius:6px;transition:width .08s linear}
.ib-barval{flex:0 0 58px;text-align:right;font-size:13px;font-variant-numeric:tabular-nums}
.ib-quiz{border-top:1px dashed var(--line-2,#dce4ec);margin-top:12px;padding-top:10px}
.ib-quiz h5{font-size:14px;margin:0 0 6px}
.ib-quiz p{font-size:13px;color:var(--ink-2,#5a6472);line-height:1.6;margin:0 0 7px}
.ib-opts{display:flex;gap:7px;flex-wrap:wrap}
.ib-opt{padding:6px 12px;border:1px solid var(--line-2,#dce4ec);border-radius:8px;background:#fff;font-size:13px;min-height:36px}
.ib-opt:hover{border-color:#FFB3BA;background:#FFF4F5}
.ib-fb{margin-top:7px;font-size:12.5px;min-height:18px;line-height:1.6}
.ib-fb.ok{color:#2f8f68}.ib-fb.no{color:#c26b7a}
.ib-exp{margin-top:7px;min-height:32px;padding:4px 11px;font-size:12px}
.ib-explain{margin-top:7px;padding:9px 12px;background:#F7F4FC;border:1px solid #D0C4E8;border-radius:9px;font-size:12.5px;line-height:1.7;color:#6e57a0}
.ib-explain[hidden]{display:none}
</style>`;

  function line(c, x1, y1, x2, y2, color, width, dash) {
    var g = c.ctx || c; g.save(); g.beginPath(); if (dash) g.setLineDash(dash);
    g.strokeStyle = color; g.lineWidth = width || 1; g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore();
  }
  function text(c, s, x, y, color, size, align) {
    var g = c.ctx || c; g.save(); g.fillStyle = color || '#8b95a3';
    g.font = (size || 12) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    g.textAlign = align || 'left'; g.textBaseline = 'middle'; g.fillText(s, x, y); g.restore();
  }
  function dot(c, x, y, r, fill, stroke) {
    var g = c.ctx || c; g.save(); g.beginPath(); g.arc(x, y, r, 0, 6.2832);
    g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = 2; g.strokeStyle = stroke; g.stroke(); } g.restore();
  }
  function mk(el) { return { el: el, ctx: el.getContext('2d'), w: 0, h: 0, dpr: 0 }; }
  function fit(c) {
    var w = c.el.clientWidth, h = c.el.clientHeight, d = Math.min(global.devicePixelRatio || 1, 2);
    if (w && h && (w !== c.w || h !== c.h || d !== c.dpr)) {
      c.w = w; c.h = h; c.dpr = d; c.el.width = Math.round(w * d); c.el.height = Math.round(h * d);
      c.ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    return c;
  }
  function arrow(c, x1, y1, x2, y2, color, label) {
    line(c, x1, y1, x2, y2, color, 2.5);
    var a = Math.atan2(y2 - y1, x2 - x1), s = 8;
    var g = c.ctx || c; g.save(); g.beginPath(); g.moveTo(x2, y2);
    g.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45));
    g.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45));
    g.closePath(); g.fillStyle = color; g.fill(); g.restore();
    if (label) text(c, label, x2 + 7, y2 - 6, color, 12);
  }

  var QUIZ = [
    { id: 'q1', title: '① 恰好匀速下滑', label: '斜面倾角 θ', min: 15, max: 55, step: 1, val: 30,
      build: function (v) {
        var th = v * Math.PI / 180, ans = Math.tan(th);
        return { prompt: '倾角 θ = ' + v + '° 时滑块恰好匀速下滑，动摩擦因数 μ 约为？',
          opts: [ans.toFixed(2), (ans / 2).toFixed(2), (ans * 2).toFixed(2)], right: 0,
          ex: '匀速时沿斜面合力为零：mg sinθ = μmg cosθ，所以 μ = tanθ = ' + ans.toFixed(2) + '。结果与质量无关。' };
      } },
    { id: 'q2', title: '② 底端速度', label: '下滑位移 s', min: 2, max: 8, step: 1, val: 5,
      build: function (v) {
        var th = 30 * Math.PI / 180, mu = 0.2;
        var a = G * (Math.sin(th) - mu * Math.cos(th)), ans = Math.sqrt(2 * a * v);
        return { prompt: 'θ = 30°、μ = 0.20，从静止沿斜面下滑 ' + v + ' m，到达该处速度约为？',
          opts: [ans.toFixed(2), (ans / 2).toFixed(2), (ans * 1.5).toFixed(2)], right: 0,
          ex: 'a = g(sinθ − μcosθ) = ' + a.toFixed(2) + ' m/s²，由 v² = 2as 得 v = ' + ans.toFixed(2) + ' m/s。' };
      } }
  ];
  function quizHTML() {
    return '<div class="ib-card"><div class="ib-hd"><h4>高考题型 · 随堂练</h4><small>参数可调 · 即时判分</small></div>'
      + QUIZ.map(function (q) {
        return '<div class="ib-quiz"><h5>' + q.title + '</h5><p data-qp="' + q.id + '"></p>'
          + '<div class="ib-ctrl"><label><span>' + q.label + '</span><b data-qo="' + q.id + '"></b></label>'
          + '<input class="ib-range" type="range" data-qs="' + q.id + '" min="' + q.min + '" max="' + q.max + '" step="' + q.step + '" value="' + q.val + '"></div>'
          + '<div class="ib-opts" data-qopts="' + q.id + '"></div><div class="ib-fb" data-qfb="' + q.id + '"></div>'
          + '<button type="button" class="ib-btn ib-exp" data-qexp="' + q.id + '">展开解析 ▾</button>'
          + '<div class="ib-explain" data-qex="' + q.id + '" hidden></div></div>';
      }).join('') + '</div>';
  }

  NS.modules['inclined-block'] = {
    render: function (container, extIndex) {
      extIndex = extIndex | 0; if (extIndex < 0 || extIndex > 3) extIndex = 0;
      var intro = ['沿斜面分量 <b>mg sinθ</b> 驱动下滑', '正交分解：<b>垂直斜面合力为零</b>',
        '<b>mgh = ½mv² + 摩擦生热</b>', '由 <b>tanθ = μ</b> 判断临界'][extIndex];
      var extra = extIndex === 2
        ? '<div class="ib-card"><div class="ib-hd"><h4>能量流动</h4><small>重力势能 → 动能 + 内能</small></div>'
          + ['ep|势能 Ep|#B8E8D0', 'ek|动能 Ek|#FFD8A8', 'heat|摩擦生热 Q|#D0C4E8', 'sum|总机械能|#FFB3BA'].map(function (s) {
            var p = s.split('|');
            return '<div class="ib-barrow"><span>' + p[1] + '</span><div class="ib-bartrack"><div class="ib-barfill" data-bar="' + p[0] + '" style="background:' + p[2] + '"></div></div><b class="ib-barval" data-barval="' + p[0] + '">—</b></div>';
          }).join('') + '</div>'
        : extIndex === 3 ? quizHTML() : '';
      var chartTitle = ['a–t 加速度图像', '沿斜面 / 垂直斜面分力', '能量—位移图像', 'μ–θ 临界关系'][extIndex];
      container.innerHTML = STYLE + '<div class="ib-wrap"><div class="ib-intro">'
        + '<span class="ib-chip hot">' + intro + '</span><span class="ib-chip">a = g(sinθ − μcosθ)</span><span class="ib-chip">读数为示意值</span></div>'
        + '<div class="ib-grid"><div><div class="ib-card"><div class="ib-hd"><h4>斜面运动演示</h4><small>改变参数，观察滑块与受力</small></div>'
        + '<canvas class="ib-cv" data-cv="stage"></canvas><div class="ib-legend">'
        + '<span><i style="background:#FFB3BA"></i>重力 mg</span><span><i style="background:#BFE3F5"></i>支持力 N</span>'
        + '<span><i style="background:#B8E8D0"></i>摩擦力 f</span><span><i style="background:#FFD8A8"></i>合力</span></div></div>'
        + '<div class="ib-card"><div class="ib-hd"><h4>' + chartTitle + '</h4><small>随参数实时更新</small></div><canvas class="ib-cv chart" data-cv="chart"></canvas></div></div>'
        + '<div><div class="ib-card"><div class="ib-hd"><h4>参数调节</h4><small>拖动即时改变</small></div>'
        + [['theta', '斜面倾角 θ', 10, 60, 1, 30, '°'], ['mu', '动摩擦因数 μ', 0, 0.8, 0.05, 0.2, ''],
           ['mass', '滑块质量 m', 0.5, 5, 0.5, 2, 'kg'], ['v0', '初速度(沿斜面向上)', 0, 8, 0.5, 0, 'm/s']]
          .map(function (r) { return '<div class="ib-ctrl"><label><span>' + r[1] + '</span><b><span data-out="' + r[0] + '">' + r[5] + '</span> ' + r[6] + '</b></label><input class="ib-range" type="range" data-slider="' + r[0] + '" min="' + r[2] + '" max="' + r[3] + '" step="' + r[4] + '" value="' + r[5] + '"></div>'; }).join('')
        + '<div class="ib-btns"><button type="button" class="ib-btn main" data-btn="toggle">暂停</button><button type="button" class="ib-btn" data-btn="reset">重新释放</button></div></div>'
        + '<div class="ib-card"><div class="ib-hd"><h4>实时读数</h4><small>随运动刷新</small></div><div class="ib-reads">'
        + [['a', '加速度 a / (m/s²)', 1], ['v', '速度 v / (m/s)', 1], ['s', '位移 s / m', 1],
           ['f', '摩擦力 f / N', 0], ['ek', '动能 Ek / J', 0], ['ep', '势能 Ep / J', 0]]
          .map(function (r) { return '<div class="ib-read' + (r[2] ? ' hl' : '') + '"><span>' + r[1] + '</span><b data-read="' + r[0] + '">—</b></div>'; }).join('')
        + '</div><div class="ib-tip">下滑 a = g(sinθ − μcosθ)；上滑 a = −g(sinθ + μcosθ)。若 tanθ ≤ μ，停下后不再下滑。</div></div>'
        + extra + '</div></div></div>';

      var q = function (s) { return container.querySelector(s); };
      var qa = function (s) { return container.querySelectorAll(s); };
      var stage = mk(q('[data-cv="stage"]')), chart = mk(q('[data-cv="chart"]'));
      var disposers = [];
      function on(t, ty, fn, o) { t.addEventListener(ty, fn, o); disposers.push(function () { t.removeEventListener(ty, fn, o); }); }
      var st = { theta: 30, mu: 0.2, mass: 2, v0: 0, s: 0, v: 0, path: 0, running: true, last: 0, t: 0 };
      function reset() { st.s = 0; st.v = -st.v0; st.path = 0; st.t = 0; }
      reset();
      var L = 6;
      function accel() {
        var th = st.theta * Math.PI / 180;
        if (st.v < -0.002) return -G * (Math.sin(th) + st.mu * Math.cos(th));
        if (Math.abs(st.v) <= 0.002 && Math.tan(th) <= st.mu) return 0;
        return G * (Math.sin(th) - st.mu * Math.cos(th));
      }
      qa('[data-slider]').forEach(function (el) {
        var k = el.getAttribute('data-slider');
        on(el, 'input', function () {
          st[k] = parseFloat(el.value);
          q('[data-out="' + k + '"]').textContent = (k === 'mu' ? st[k].toFixed(2) : String(st[k]));
          reset();
        });
      });
      var tg = q('[data-btn="toggle"]');
      on(tg, 'click', function () { st.running = !st.running; tg.textContent = st.running ? '暂停' : '继续'; tg.classList.toggle('main', st.running); });
      on(q('[data-btn="reset"]'), 'click', reset);

      /* 参数化高考题 */
      if (extIndex === 3) {
        QUIZ.forEach(function (qq) {
          var cur = qq.val, data = qq.build(cur);
          function refresh() {
            data = qq.build(cur);
            q('[data-qp="' + qq.id + '"]').textContent = data.prompt;
            q('[data-qo="' + qq.id + '"]').textContent = cur + (qq.id === 'q1' ? '°' : ' m');
            q('[data-qopts="' + qq.id + '"]').innerHTML = data.opts.map(function (o, i) {
              return '<button type="button" class="ib-opt" data-q="' + qq.id + '" data-i="' + i + '">' + o + '</button>';
            }).join('');
            q('[data-qfb="' + qq.id + '"]').textContent = '';
            q('[data-qex="' + qq.id + '"]').hidden = true;
          }
          refresh();
          on(q('[data-qs="' + qq.id + '"]'), 'input', function (e) { cur = parseFloat(e.target.value); refresh(); });
          on(q('[data-qexp="' + qq.id + '"]'), 'click', function (e) {
            var box = q('[data-qex="' + qq.id + '"]');
            box.hidden = !box.hidden; box.textContent = data.ex;
            e.target.textContent = box.hidden ? '展开解析 ▾' : '收起解析 ▴';
          });
        });
        qa('[data-q]').forEach(function (btn) {
          on(btn, 'click', function () {
            var id = btn.getAttribute('data-q'), i = +btn.getAttribute('data-i');
            var qq = QUIZ.filter(function (z) { return z.id === id; })[0];
            var data = qq.build(parseFloat(q('[data-qs="' + id + '"]').value));
            var fb = q('[data-qfb="' + id + '"]');
            var ok = i === data.right;
            fb.className = 'ib-fb ' + (ok ? 'ok' : 'no');
            fb.textContent = (ok ? '✓ 正确！' : '✗ 再想想，点「展开解析」看思路。');
          });
        });
      }

      function geom() {
        var w = stage.w, h = stage.h, th = st.theta * Math.PI / 180;
        var px = Math.min((w - 110) / Math.cos(th), (h - 60) / Math.sin(th));
        var x0 = 46, y0 = h - 26;
        return { x0: x0, y0: y0, px: px, th: th, dx: Math.cos(th), dy: -Math.sin(th) };
      }
      function drawStage() {
        fit(stage); var c = stage.ctx, w = stage.w, h = stage.h; if (!w || !h) return;
        c.clearRect(0, 0, w, h); var g0 = geom(), th = g0.th;
        // 斜面
        var ex = g0.x0 + g0.px * g0.dx, ey = g0.y0 + g0.px * g0.dy;
        c.save(); c.beginPath(); c.moveTo(g0.x0, g0.y0); c.lineTo(ex, ey); c.lineTo(g0.x0, ey); c.closePath();
        c.fillStyle = '#FFF8EE'; c.fill(); c.strokeStyle = '#FFD8A8'; c.lineWidth = 2; c.stroke(); c.restore();
        line(c, g0.x0, g0.y0, ex, ey, '#E7B87E', 2.5);
        // 角度弧
        c.save(); c.beginPath(); c.arc(g0.x0, g0.y0, 42, -th, 0); c.strokeStyle = '#D0C4E8'; c.lineWidth = 2; c.stroke(); c.restore();
        text(c, 'θ=' + st.theta + '°', g0.x0 + 48, g0.y0 - 12, '#8b6fb0', 12);
        // 滑块
        var p = Math.max(0, Math.min(L, st.s)) / L * g0.px;
        var bx = g0.x0 + p * g0.dx, by = g0.y0 + p * g0.dy;
        c.save(); c.translate(bx, by); c.rotate(-th);
        c.fillStyle = '#FFB3BA'; c.strokeStyle = '#f28f9a'; c.lineWidth = 2;
        c.beginPath(); c.rect(-16, -22, 32, 20); c.fill(); c.stroke(); c.restore();
        // 受力矢量
        var sc = 0.052;
        arrow(c, bx, by, bx, by + st.mass * G * sc, '#FFB3BA', 'mg');
        arrow(c, bx, by, bx + Math.sin(th) * st.mass * G * Math.cos(th) * sc,
          by - Math.cos(th) * st.mass * G * Math.cos(th) * sc, '#BFE3F5', 'N');
        var f = st.mu * st.mass * G * Math.cos(th);
        var fdir = st.v < -0.002 ? 1 : -1;
        arrow(c, bx, by, bx + fdir * f * sc * g0.dx, by + fdir * f * sc * g0.dy, '#B8E8D0', 'f');
        var res = st.mass * accel();
        if (Math.abs(res) > 0.05) arrow(c, bx, by - 26, bx + res * sc * 1.4 * g0.dx, by - 26 + res * sc * 1.4 * g0.dy, '#FFD8A8', '合力');
        text(c, 's = ' + st.s.toFixed(2) + ' m', w - 14, 18, '#5a6472', 12, 'right');
      }
      function drawChart() {
        fit(chart); var c = chart.ctx, w = chart.w, h = chart.h; if (!w || !h) return;
        c.clearRect(0, 0, w, h); var x0 = 36, x1 = w - 14, top = 14, bot = h - 24;
        line(c, x0, bot, x1, bot, '#cbd6e2', 1); line(c, x0, top, x0, bot, '#cbd6e2', 1);
        var th = st.theta * Math.PI / 180;
        if (extIndex === 0) {
          var a = G * (Math.sin(th) - st.mu * Math.cos(th));
          text(c, 'a / (m/s²)', x0 + 3, top + 4, '#8b95a3', 11);
          line(c, x0, bot - (bot - top) / 2, x1, bot - (bot - top) / 2, '#e8edf2', 1, [4, 4]);
          line(c, x0, bot - a / 12 * (bot - top), x1, bot - a / 12 * (bot - top), '#FFB3BA', 2.5);
          var tt = st.t % 4;
          line(c, x0 + tt / 4 * (x1 - x0), top, x0 + tt / 4 * (x1 - x0), bot, '#BFE3F5', 1, [3, 3]);
          text(c, a.toFixed(2), x1 - 4, bot - a / 12 * (bot - top) - 9, '#c07884', 11, 'right');
        } else if (extIndex === 1) {
          var par = st.mass * G * Math.sin(th), per = st.mass * G * Math.cos(th), fr = st.mu * per;
          var mx = Math.max(par, per, fr, 1) * 1.15;
          [['mg sinθ', par, '#FFB3BA'], ['mg cosθ', per, '#BFE3F5'], ['f = μN', fr, '#B8E8D0']].forEach(function (r, i) {
            var y = top + 30 + i * 34, bw = (x1 - x0 - 80) * r[1] / mx;
            text(c, r[0], x0, y, '#5a6472', 12);
            c.fillStyle = r[2]; c.fillRect(x0 + 82, y - 8, bw, 16);
            text(c, r[1].toFixed(1) + ' N', x1, y, '#5a6472', 11, 'right');
          });
        } else if (extIndex === 2) {
          var E0 = st.mass * G * L * Math.sin(th) + 0.5 * st.mass * st.v0 * st.v0;
          function plot(fn, color) {
            c.save(); c.beginPath();
            for (var i = 0; i <= 100; i++) {
              var s = L * i / 100, y = bot - fn(s) / Math.max(E0, 1) * (bot - top - 10);
              if (i === 0) c.moveTo(x0, y); else c.lineTo(x0 + i / 100 * (x1 - x0), y);
            }
            c.strokeStyle = color; c.lineWidth = 2.4; c.stroke(); c.restore();
          }
          var vv = Math.sqrt(Math.max(0, st.v0 * st.v0 + 2 * G * (Math.sin(th) - st.mu * Math.cos(th)) * L));
          plot(function (s) { return st.mass * G * (L - s) * Math.sin(th); }, '#B8E8D0');
          plot(function (s) { return 0.5 * st.mass * (st.v0 * st.v0 + 2 * G * (Math.sin(th) - st.mu * Math.cos(th)) * s); }, '#FFD8A8');
          plot(function (s) { return st.mass * G * L * Math.sin(th) + 0.5 * st.mass * st.v0 * st.v0 - 0.5 * st.mass * vv * vv; }, '#D0C4E8');
          text(c, '粉：动能　绿：势能　紫：生热', x1, top + 6, '#8b95a3', 11, 'right');
        } else {
          text(c, 'μ', x0 + 3, top + 5, '#8b95a3', 11);
          c.save(); c.beginPath();
          for (var i = 0; i <= 60; i++) {
            var t2 = (10 + 50 * i / 60) * Math.PI / 180, y = bot - Math.tan(t2) / 1.8 * (bot - top - 10);
            if (i === 0) c.moveTo(x0, y); else c.lineTo(x0 + i / 60 * (x1 - x0), y);
          }
          c.strokeStyle = '#D0C4E8'; c.lineWidth = 2.5; c.stroke(); c.restore();
          line(c, x0, bot - st.mu / 1.8 * (bot - top - 10), x1, bot - st.mu / 1.8 * (bot - top - 10), '#FFB3BA', 1, [4, 4]);
          dot(c, x0 + (st.theta - 10) / 50 * (x1 - x0), bot - st.mu / 1.8 * (bot - top - 10), 5, '#FFB3BA', '#fff');
          text(c, 'μ = tanθ 为临界线', x0 + 6, top + 6, '#8b6fb0', 11);
        }
      }
      function set(k, v) { var e = q('[data-read="' + k + '"]'); if (e) e.textContent = v; }
      function update() {
        var th = st.theta * Math.PI / 180, f = st.mu * st.mass * G * Math.cos(th);
        var ep = st.mass * G * st.s * Math.sin(th), ek = 0.5 * st.mass * st.v * st.v;
        var heat = f * st.path, maxE = Math.max(1, st.mass * G * L * Math.sin(th) + 0.5 * st.mass * st.v0 * st.v0);
        set('a', accel().toFixed(2)); set('v', st.v.toFixed(2)); set('s', st.s.toFixed(2));
        set('f', f.toFixed(2)); set('ek', ek.toFixed(2)); set('ep', ep.toFixed(2));
        if (extIndex === 2) {
          [['ep', ep], ['ek', ek], ['heat', heat], ['sum', ep + ek + heat]].forEach(function (r) {
            var b = q('[data-bar="' + r[0] + '"]'), v = q('[data-barval="' + r[0] + '"]');
            if (b) b.style.width = Math.min(100, r[1] / maxE * 100).toFixed(1) + '%';
            if (v) v.textContent = r[1].toFixed(1);
          });
        }
      }
      var raf = 0;
      function loop(now) {
        if (!st.last) st.last = now;
        var dt = Math.min(0.04, (now - st.last) / 1000); st.last = now;
        if (st.running) {
          var a = accel(); st.v += a * dt; st.s += st.v * dt; st.path += Math.abs(st.v) * dt; st.t += dt;
          if (st.s < 0) { st.s = 0; st.v = 0; }
          if (st.s > L || (Math.abs(st.v) < 0.002 && st.s > 0.05 && a === 0)) reset();
        }
        drawStage(); drawChart(); update(); raf = global.requestAnimationFrame(loop);
      }
      raf = global.requestAnimationFrame(loop);
      return function cleanup() { global.cancelAnimationFrame(raf); disposers.forEach(function (f) { f(); }); disposers.length = 0; container.innerHTML = ''; };
    }
  };
})(window);
