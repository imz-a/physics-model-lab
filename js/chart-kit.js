/* ============================================================
 * chart-kit.js — 共享数据图表组件（零依赖，file:// 可用）
 * 挂到 window.ChartKit，供各物理模块在子标签主区绘制专属数据图。
 * 统一风格：白底马卡龙、绝对刻度、单位、图例、当前点标记、变化前基准。
 * 契约：纯函数式绘制，接收 view={ctx,w,h}，不管理生命周期。
 * ============================================================ */
(function (global) {
  'use strict';
  var NS = global.ChartKit = global.ChartKit || {};
  var C = {
    ink: '#3a4250', ink2: '#5a6472', ink3: '#8b95a3',
    grid: '#eef2f6', axis: '#cbd6e2', bg: '#ffffff',
    pink: '#E27886', mint: '#57A47F', sky: '#5B9BC4',
    lav: '#8A76BB', peach: '#D69A55', gold: '#C9A227'
  };
  var FONT = '"PingFang SC","Microsoft YaHei",sans-serif';

  function txt(ctx, s, x, y, color, size, align, baseline) {
    ctx.save();
    ctx.font = (size || 12) + 'px ' + FONT;
    ctx.fillStyle = color || C.ink3;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'alphabetic';
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  function niceNum(range) {
    if (!(range > 0)) return 1;
    var exp = Math.floor(Math.log(range) / Math.LN10);
    var f = range / Math.pow(10, exp);
    var n = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
    return n * Math.pow(10, exp);
  }
  function fmtNum(v, step) {
    if (!isFinite(v)) return '—';
    var a = Math.abs(v);
    if (step >= 1) return v.toFixed(0);
    if (step >= 0.1) return v.toFixed(1);
    if (step >= 0.01) return v.toFixed(2);
    return v.toFixed(3);
  }

  /* 折线/曲线图
   * opts: {
   *   title, xLabel, yLabel, xUnit, yUnit,
   *   xMin, xMax, yMin, yMax,        // 固定量程（推荐），可省略其一由数据推
   *   series: [{name, color, dash, width, points:[[x,y],...]}],
   *   markers: [{x, y, label, color}],  // 当前点/工作点
   *   hlines: [{y, label, color, dash}],// 参考水平线
   *   vlines: [{x, label, color, dash}],// 参考竖线
   *   fill: {series:0, color:'rgba(...)'} // 曲线下方填充
   * }
   */
  NS.line = function (view, opts) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    var padL = 58, padR = 16, padT = opts.title ? 34 : 14, padB = 40;
    var x0 = padL, x1 = W - padR, top = padT, bot = H - padB;
    if (opts.title) txt(ctx, opts.title, W / 2, 20, C.ink, 14, 'center');

    // 量程
    var xMin = opts.xMin, xMax = opts.xMax, yMin = opts.yMin, yMax = opts.yMax;
    var allX = [], allY = [];
    (opts.series || []).forEach(function (s) {
      (s.points || []).forEach(function (p) { allX.push(p[0]); allY.push(p[1]); });
    });
    (opts.markers || []).forEach(function (m) { if (m.x != null) allX.push(m.x); if (m.y != null) allY.push(m.y); });
    if (xMin == null) xMin = Math.min.apply(null, allX.concat([0]));
    if (xMax == null) xMax = Math.max.apply(null, allX.concat([1]));
    if (yMin == null) yMin = Math.min.apply(null, allY.concat([0]));
    if (yMax == null) yMax = Math.max.apply(null, allY.concat([1]));
    if (xMax - xMin < 1e-9) xMax = xMin + 1;
    if (yMax - yMin < 1e-9) yMax = yMin + 1;

    function PX(x) { return x0 + (x - xMin) / (xMax - xMin) * (x1 - x0); }
    function PY(y) { return bot - (y - yMin) / (yMax - yMin) * (bot - top); }

    // 网格 + 刻度
    var xStep = niceNum((xMax - xMin) / 5), yStep = niceNum((yMax - yMin) / 4);
    ctx.lineWidth = 1;
    ctx.strokeStyle = C.grid;
    for (var xv = Math.ceil(xMin / xStep) * xStep; xv <= xMax + 1e-9; xv += xStep) {
      ctx.beginPath(); ctx.moveTo(PX(xv), top); ctx.lineTo(PX(xv), bot); ctx.stroke();
      txt(ctx, fmtNum(xv, xStep), PX(xv), bot + 15, C.ink3, 11, 'center');
    }
    for (var yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + 1e-9; yv += yStep) {
      ctx.beginPath(); ctx.moveTo(x0, PY(yv)); ctx.lineTo(x1, PY(yv)); ctx.stroke();
      txt(ctx, fmtNum(yv, yStep), x0 - 7, PY(yv) + 4, C.ink3, 11, 'right');
    }
    // 坐标轴
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0, bot); ctx.lineTo(x1, bot); ctx.stroke();
    // 零线
    if (yMin < 0 && yMax > 0) {
      ctx.strokeStyle = '#dfe6ee'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, PY(0)); ctx.lineTo(x1, PY(0)); ctx.stroke();
    }
    // 轴标签
    if (opts.yLabel) {
      txt(ctx, opts.yLabel + (opts.yUnit ? ' / ' + opts.yUnit : ''), 4, top - 4, C.ink2, 11, 'left');
    }
    if (opts.xLabel) {
      txt(ctx, opts.xLabel + (opts.xUnit ? ' / ' + opts.xUnit : ''), x1, H - 6, C.ink2, 11, 'right');
    }

    // 参考线
    (opts.hlines || []).forEach(function (h) {
      if (h.y < yMin || h.y > yMax) return;
      ctx.save(); ctx.strokeStyle = h.color || C.ink3; ctx.lineWidth = h.width || 1;
      if (h.dash) ctx.setLineDash(h.dash);
      ctx.beginPath(); ctx.moveTo(x0, PY(h.y)); ctx.lineTo(x1, PY(h.y)); ctx.stroke(); ctx.restore();
      if (h.label) txt(ctx, h.label, x1 - 4, PY(h.y) - 4, h.color || C.ink3, 10, 'right');
    });
    (opts.vlines || []).forEach(function (v) {
      if (v.x < xMin || v.x > xMax) return;
      ctx.save(); ctx.strokeStyle = v.color || C.ink3; ctx.lineWidth = v.width || 1;
      if (v.dash) ctx.setLineDash(v.dash);
      ctx.beginPath(); ctx.moveTo(PX(v.x), top); ctx.lineTo(PX(v.x), bot); ctx.stroke(); ctx.restore();
      if (v.label) txt(ctx, v.label, PX(v.x) + 4, top + 11, v.color || C.ink3, 10, 'left');
    });

    // 曲线
    (opts.series || []).forEach(function (s, idx) {
      var pts = s.points || [];
      if (pts.length < 2) return;
      if (opts.fill && opts.fill.series === idx && opts.fill.color) {
        ctx.save(); ctx.beginPath();
        ctx.moveTo(PX(pts[0][0]), PY(opts.fill.base != null ? opts.fill.base : yMin));
        pts.forEach(function (p) { ctx.lineTo(PX(p[0]), PY(p[1])); });
        ctx.lineTo(PX(pts[pts.length - 1][0]), PY(opts.fill.base != null ? opts.fill.base : yMin));
        ctx.closePath(); ctx.fillStyle = opts.fill.color; ctx.fill(); ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = s.color || C.sky; ctx.lineWidth = s.width || 2.2;
      if (s.dash) ctx.setLineDash(s.dash);
      ctx.beginPath();
      pts.forEach(function (p, i) { i === 0 ? ctx.moveTo(PX(p[0]), PY(p[1])) : ctx.lineTo(PX(p[0]), PY(p[1])); });
      ctx.stroke(); ctx.restore();
    });

    // 当前点标记
    (opts.markers || []).forEach(function (m) {
      if (m.x == null || m.y == null) return;
      var px = PX(m.x), py = PY(m.y);
      if (m.cross) {
        ctx.save(); ctx.strokeStyle = m.color || C.pink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bot); ctx.moveTo(x0, py); ctx.lineTo(x1, py); ctx.stroke(); ctx.restore();
      }
      ctx.save(); ctx.beginPath(); ctx.arc(px, py, m.r || 5, 0, Math.PI * 2);
      ctx.fillStyle = m.color || C.pink; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      if (m.label) txt(ctx, m.label, px + (m.labelDx || 8), py - 8, m.color || C.pink, 11, 'left');
    });

    // 图例
    if (opts.legend && (opts.series || []).length) {
      var lx = x0 + 6, ly = top + 12;
      (opts.series || []).forEach(function (s) {
        if (!s.name) return;
        ctx.save(); ctx.strokeStyle = s.color || C.sky; ctx.lineWidth = 2.5;
        if (s.dash) ctx.setLineDash(s.dash);
        ctx.beginPath(); ctx.moveTo(lx, ly - 4); ctx.lineTo(lx + 16, ly - 4); ctx.stroke(); ctx.restore();
        txt(ctx, s.name, lx + 20, ly, C.ink2, 11, 'left');
        lx += 20 + (s.name.length * 12) + 14;
      });
    }
    return { PX: PX, PY: PY, x0: x0, x1: x1, top: top, bot: bot };
  };

  /* 柱状图 / 对比条形图
   * opts: {title, yLabel, yUnit, yMax, bars:[{label,value,color,note}], fmt}
   */
  NS.bars = function (view, opts) {
    var ctx = view.ctx, W = view.w, H = view.h;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    var padL = 44, padR = 14, padT = opts.title ? 34 : 16, padB = 44;
    var x0 = padL, x1 = W - padR, top = padT, bot = H - padB;
    if (opts.title) txt(ctx, opts.title, W / 2, 20, C.ink, 14, 'center');
    var bars = opts.bars || [];
    var yMax = opts.yMax;
    if (yMax == null) yMax = Math.max.apply(null, bars.map(function (b) { return Math.abs(b.value); }).concat([1])) * 1.15;
    function PY(v) { return bot - Math.max(0, Math.min(1, v / yMax)) * (bot - top); }
    var yStep = niceNum(yMax / 4);
    for (var yv = 0; yv <= yMax + 1e-9; yv += yStep) {
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, PY(yv)); ctx.lineTo(x1, PY(yv)); ctx.stroke();
      txt(ctx, fmtNum(yv, yStep), x0 - 6, PY(yv) + 4, C.ink3, 11, 'right');
    }
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0, bot); ctx.lineTo(x1, bot); ctx.stroke();
    if (opts.yLabel) txt(ctx, opts.yLabel + (opts.yUnit ? ' / ' + opts.yUnit : ''), 4, top - 4, C.ink2, 11, 'left');
    var n = bars.length, slot = (x1 - x0) / Math.max(1, n);
    var bw = Math.min(56, slot * 0.6);
    bars.forEach(function (b, i) {
      var cx = x0 + slot * (i + 0.5), by = PY(b.value);
      ctx.save(); ctx.fillStyle = b.color || C.sky;
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(cx - bw / 2, by, bw, bot - by, [5, 5, 0, 0]); }
      else ctx.rect(cx - bw / 2, by, bw, bot - by);
      ctx.fill(); ctx.restore();
      var label = opts.fmt ? opts.fmt(b.value) : fmtNum(b.value, yStep);
      txt(ctx, label, cx, by - 5, b.color || C.ink2, 12, 'center');
      txt(ctx, b.label, cx, bot + 15, C.ink2, 11, 'center');
      if (b.note) txt(ctx, b.note, cx, bot + 29, C.ink3, 10, 'center');
    });
    return { x0: x0, x1: x1, top: top, bot: bot };
  };

  NS.colors = C;
})(window);
