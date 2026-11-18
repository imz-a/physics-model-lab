/* ============ simulator.js — 平行板电容器 SVG 可视化（依赖 core.js） ============ */
(function(){
  'use strict';
  var P = window.PhyLab;
  if(!P || !P.core) return;
  var core = P.core;
  function $(id){ return document.getElementById(id); }
  function setAttr(el, obj){ for(var k in obj){ el.setAttribute(k, obj[k]); } }

  /* 电场线根数 ∝ 自由电荷面密度 σ = Q/S；极板电荷符号个数 ∝ Q */
  function fieldLineCount(Q, S){ return core.clamp(Math.round(8 * Q / S), 3, 14); }
  function chargeSymbolCount(Q){ return core.clamp(Math.round(5 * Q), 3, 12); }

  function render(){
    var capSvg = $('capSvg'); if(!capSvg) return;
    var st = core.state, m = core.metrics(st, st.sc), bm = core.metrics(core.getBaseline(), st.sc);

    /* 五个实时指标（相对当前基准的增减） */
    ['C','Q','U','E','W'].forEach(function(k){
      var ve = $('v'+k), te = $('t'+k);
      if(!ve || !te) return;
      ve.textContent = core.fmt(m[k]);
      var tr = core.trend(m[k], bm[k]);
      te.className = 't ' + tr;
      te.textContent = tr === 'up' ? '↑ 增大' : tr === 'down' ? '↓ 减小' : '— 不变';
    });
    $('tblU').className = 'tbl-block' + (st.sc==='U' ? ' active' : '');
    $('tblQ').className = 'tbl-block' + (st.sc==='Q' ? ' active' : '');

    var w = 130 + 80*(st.S - 0.5)/1.5;
    var gap = 40 + 60*st.d;
    var cx = 315, cy = 165, t = 12;
    var L = cx - w/2, R = cx + w/2;
    var topY = cy - gap/2 - t, botY = cy + gap/2;
    var tin = cy - gap/2, bin = cy + gap/2;

    /* 极板 */
    setAttr($('plateTop'), {x:L, y:topY, width:w, height:t});
    setAttr($('plateBot'), {x:L, y:botY, width:w, height:t});

    /* 导线与电源/开关 */
    $('wires').innerHTML = '<path d="M'+L+','+(topY+t/2)+' H90 V155"/><path d="M'+L+','+(botY+t/2)+' H90 V170"/>';
    $('srcBattery').style.display = st.sc === 'U' ? '' : 'none';
    $('srcSwitch').style.display  = st.sc === 'Q' ? '' : 'none';
    $('sceneText').textContent = st.sc === 'U' ? '情景 A：始终接电源，U = 电源电动势（恒定）' : '情景 B：充电后断开，极板电荷 Q 守恒';

    /* 电介质 + 极化边界电荷提示 */
    if(st.er > 1.001){
      var diel = $('dielectric'); diel.style.display = '';
      setAttr(diel, {x:L+3, y:tin, width:w-6, height:gap, opacity:(0.55 + 0.45*(st.er-1)/5).toFixed(2)});
      var pol = '';
      for(var p=0;p<4;p++){
        var px = L + (p+0.5)*w/4;
        pol += '<text x="'+px.toFixed(1)+'" y="'+(tin+14)+'" fill="#9b87c4" font-size="10" text-anchor="middle">+</text>';
        pol += '<text x="'+px.toFixed(1)+'" y="'+(bin-5)+'" fill="#9b87c4" font-size="10" text-anchor="middle">−</text>';
      }
      $('polarG').innerHTML = pol;
      var et = $('erText'); et.style.display = '';
      setAttr(et, {x:L+10, y:cy+4}); et.textContent = '介质 εr=' + st.er.toFixed(1) + '（极化）';
    }else{
      $('dielectric').style.display = 'none';
      $('polarG').innerHTML = '';
      $('erText').style.display = 'none';
    }

    /* 金属板 */
    var metal = $('metal');
    if(st.metal){
      metal.style.display = '';
      setAttr(metal, {x:L-4, y:cy-12, width:w+8, height:24});
    }else{ metal.style.display = 'none'; }

    /* 电场线：根数随 σ 变，长度等于板间距；颜色深浅表示 E 的强弱 */
    var N = fieldLineCount(m.Q, st.S);
    var eRatio = m.E / (bm.E || 1);
    var op = core.clamp(0.30 + 0.34*eRatio, 0.22, 0.88);
    var segs = st.metal ? [[tin+2, cy-14],[cy+14, bin-2]] : [[tin+2, bin-2]];
    var html = '';
    for(var i=0;i<N;i++){
      var x = L + (i+0.5)*w/N;
      for(var s=0;s<segs.length;s++){
        var y1 = segs[s][0], y2 = segs[s][1];
        if(y2 > y1+6){
          html += '<line x1="'+x.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x.toFixed(1)+'" y2="'+y2.toFixed(1)+
                  '" stroke="#7FB3D5" stroke-width="1.8" stroke-opacity="'+op.toFixed(2)+'" marker-end="url(#arrF)"/>';
        }
      }
    }
    $('fieldG').innerHTML = html;

    /* 极板电荷符号：个数随 Q 增减 */
    var Nq = chargeSymbolCount(m.Q), ch = '';
    for(var j=0;j<Nq;j++){
      var xx = L + (j+0.5)*w/Nq;
      ch += '<text x="'+xx.toFixed(1)+'" y="'+(topY+9)+'" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">+</text>';
      ch += '<text x="'+xx.toFixed(1)+'" y="'+(botY+9)+'" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">−</text>';
    }
    $('chargeG').innerHTML = ch;

    /* 尺寸标注 */
    setAttr($('dimLine'), {x1:R+28, y1:tin, x2:R+28, y2:bin});
    setAttr($('dimText'), {x:R+36, y:cy+4});
    setAttr($('sText'), {x:cx, y:topY-9});

    /* 文字说明 */
    $('fieldInfo').textContent = 'σ = Q/S = ' + core.fmt(m.Q/st.S) +
      '　｜　电场线 ' + N + ' 根　｜　极板电荷 ±' + Nq + ' 对（均为定性示意）';
    $('metalHint').textContent = st.metal ? '已插入（有效 d≈'+(st.d-core.METAL_T).toFixed(2)+'）' : '未插入';
  }

  function init(){
    core.onChange(render);
    render();
  }
  P.simulator = { init:init, render:render, fieldLineCount:fieldLineCount, chargeSymbolCount:chargeSymbolCount };
})();
