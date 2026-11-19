/* ============================================================
 * capacitor.js — 电容器交互模块（file:// 可用，无 module / 无 import）
 * 契约：window.ModelLab.modules['capacitor'].render(container, extIndex) -> cleanup()
 * extIndex: 0 核心概念 / 1 动态模拟 / 2 充放电实验 / 3 拓展模型
 * ============================================================ */
(function (global) {
  'use strict';

  var NS = global.ModelLab = global.ModelLab || {};
  NS.modules = NS.modules || {};

  /* -------------------- 模块自带样式（避免依赖框架 CSS 细节） -------------------- */
  var STYLE = ''
    + '.cap-root{--cap-pink:#FFB3BA;--cap-peach:#FFD8A8;--cap-cream:#FFF3BF;--cap-mint:#B8E8D0;--cap-sky:#BFE3F5;--cap-lav:#D0C4E8;'
    + '--cap-up:#F4978E;--cap-down:#7FB3D5;--cap-same:#9AA4B0;--cap-ink:#3a4250;--cap-ink2:#5a6472;--cap-ink3:#8b95a3;'
    + '--cap-line:#e8edf2;--cap-bg:#fafbfc;box-sizing:border-box;color:var(--cap-ink);font:15px/1.6 "PingFang SC","Microsoft YaHei","Segoe UI",system-ui,sans-serif;display:flex;flex-direction:column;gap:14px;min-height:100%}'
    + '.cap-root *{box-sizing:border-box}'
    + '.cap-root :focus-visible{outline:2px solid #7FB3D5;outline-offset:2px;border-radius:6px}'
    + '.cap-grid2{display:grid;grid-template-columns:minmax(0,1.16fr) minmax(0,1fr);gap:14px;align-items:start}'
    + '.cap-grid4{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}'
    + '.cap-side{display:flex;flex-direction:column;gap:14px;min-width:0}'
    + '.cap-card{background:#fff;border:1px solid var(--cap-line);border-top:3px solid var(--cap-sky);border-radius:14px;padding:18px 20px;box-shadow:0 8px 22px rgba(88,108,132,.07);min-width:0}'
    + '.cap-card.pink{border-top-color:var(--cap-pink)}.cap-card.peach{border-top-color:var(--cap-peach)}'
    + '.cap-card.cream{border-top-color:var(--cap-cream)}.cap-card.mint{border-top-color:var(--cap-mint)}'
    + '.cap-card.sky{border-top-color:var(--cap-sky)}.cap-card.lav{border-top-color:var(--cap-lav)}'
    + '.cap-h{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:17px;font-weight:700;margin-bottom:12px}'
    + '.cap-sub{font-size:12px;color:var(--cap-ink3);font-weight:400}'
    + '.cap-tag{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;background:#f4f7f9;border:1px solid var(--cap-line);color:var(--cap-ink2);white-space:nowrap}'
    + '.cap-tag.mint{background:#effaf4;border-color:#cceede;color:#3f8067}.cap-tag.sky{background:#f0f8fd;border-color:#d3e9f6;color:#4e7f9e}'
    + '.cap-tag.pink{background:#fff0f1;border-color:#ffd6da;color:#a35d65}.cap-tag.peach{background:#fff6ec;border-color:#ffe2c4;color:#a47443}'
    + '.cap-formula{font-family:"Cambria Math","Times New Roman",Georgia,serif;font-style:italic;font-size:20px;text-align:center;'
    + 'background:#fffdf3;border:1px solid #f2e8bd;border-radius:10px;padding:14px 8px;margin:10px 0;overflow-x:auto;white-space:nowrap}'
    + '.cap-formula.sky{background:#f4fafe;border-color:#d8ebf6}.cap-formula.mint{background:#f3fbf7;border-color:#d3ecdf}'
    + '.cap-formula.lav{background:#f8f5fd;border-color:#e5dcf5}.cap-formula.peach{background:#fff8ee;border-color:#f6e2c4}'
    + '.cap-frac{display:inline-grid;grid-template-rows:auto auto;text-align:center;vertical-align:middle;margin:0 .18em;line-height:1.1}'
    + '.cap-frac .n{border-bottom:1.4px solid currentColor;padding:0 .32em .05em}.cap-frac .d{padding:.05em .32em 0}'
    + '.cap-sub2{font-size:.66em;vertical-align:-.25em;font-style:normal}'
    + '.cap-sym{font-size:13px;color:var(--cap-ink2);line-height:1.85}.cap-sym b{color:var(--cap-ink)}'
    + '.cap-sym .hl{color:#a35d65;font-weight:700}.cap-note{font-size:12px;color:var(--cap-ink3);line-height:1.75;margin-top:10px}'
    + '.cap-concept summary{cursor:pointer;font-size:17px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:10px;list-style:none}'
    + '.cap-concept summary::-webkit-details-marker{display:none}.cap-concept summary::after{content:"▸";color:var(--cap-ink3);font-size:13px}'
    + '.cap-concept[open] summary::after{transform:rotate(90deg)}'
    + '.cap-diagram{background:#fcfdfe;border:1px solid var(--cap-line);border-radius:12px;padding:5px;overflow:hidden}'
    + '.cap-diagram svg{display:block;width:100%;height:auto;min-height:210px}'
    + '.cap-svg-note{font-size:11.5px;color:var(--cap-ink3);text-align:center;margin-top:7px}'
    + '.cap-ctrls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0 10px}'
    + '.cap-ctrl label{display:flex;justify-content:space-between;gap:6px;font-size:12.5px;color:var(--cap-ink2);margin-bottom:8px}'
    + '.cap-ctrl label b{font-size:14px;color:#4e7f9e;font-variant-numeric:tabular-nums}'
    + '.cap-range{-webkit-appearance:none;appearance:none;width:100%;height:9px;border-radius:99px;outline:none;cursor:pointer;touch-action:none;'
    + 'background:linear-gradient(90deg,#9ecbe4 0 var(--fill,50%),#e9eef3 var(--fill,50%) 100%)}'
    + '.cap-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:4px solid #7FB3D5;box-shadow:0 1px 6px rgba(90,110,140,.28);cursor:grab}'
    + '.cap-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:4px solid #7FB3D5;cursor:grab}'
    + '.cap-metal-row{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fcfdfe;border:1px solid var(--cap-line);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--cap-ink2)}'
    + '.cap-switch{position:relative;width:50px;height:28px;flex:none;border-radius:99px;border:1px solid #dce4ec;background:#eef2f6;padding:0;cursor:pointer}'
    + '.cap-switch::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 5px rgba(90,110,140,.28);transition:transform .2s}'
    + '.cap-switch.on{background:var(--cap-mint);border-color:#a7ddc4}.cap-switch.on::after{transform:translateX(22px)}'
    + '.cap-seg{display:inline-flex;gap:4px;padding:4px;background:#f4f7f9;border:1px solid var(--cap-line);border-radius:99px}'
    + '.cap-seg button{border:0;background:transparent;color:var(--cap-ink2);font-size:13px;font-weight:700;border-radius:99px;padding:8px 14px;cursor:pointer;white-space:nowrap}'
    + '.cap-seg button.active{background:#fff;color:#3f6f8d;box-shadow:0 1px 5px rgba(90,110,140,.12)}'
    + '.cap-btn{border:1px solid #dce4ec;background:#fff;color:var(--cap-ink2);border-radius:10px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer}'
    + '.cap-btn:hover{border-color:#b9d7e8}.cap-btn.primary{background:var(--cap-mint);border-color:#a7ddc4;color:#2f6a55}'
    + '.cap-btn.active{background:var(--cap-sky);border-color:#b6d9ee;color:#3f6f8d}.cap-btn.warn{background:#fff0f1;border-color:#ffd6da;color:#a35d65}'
    + '.cap-btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}'
    + '.cap-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:14px}'
    + '.cap-metric{border:1px solid var(--cap-line);border-radius:11px;padding:10px 3px;text-align:center;background:#fcfdfe}'
    + '.cap-metric .k{font-size:11px;color:var(--cap-ink3)}.cap-metric .v{font-size:21px;font-weight:700;font-variant-numeric:tabular-nums;margin:3px 0}'
    + '.cap-metric .t{font-size:11px;font-weight:700;white-space:nowrap}'
    + '.cap-up,.cell-up{color:var(--cap-up)}.cap-down,.cell-down{color:var(--cap-down)}.cap-flat,.cell-same{color:var(--cap-same)}'
    + '.cap-drawer{border:1px solid var(--cap-line);border-radius:12px;background:#fff;overflow:hidden}'
    + '.cap-drawer summary{cursor:pointer;padding:10px 14px;font-size:13px;font-weight:700;color:var(--cap-ink2);background:#fcfdfe;list-style:none}'
    + '.cap-drawer summary::-webkit-details-marker{display:none}.cap-drawer .body{padding:12px 14px;border-top:1px solid var(--cap-line)}'
    + '.cap-table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}.cap-table th,.cap-table td{padding:6px 7px;text-align:center;border-bottom:1px solid var(--cap-line)}'
    + '.cap-table th{font-size:11px;color:var(--cap-ink3)}.cap-table td:first-child{text-align:left;font-weight:700}'
    + '.cap-tbl{border:1px solid var(--cap-line);border-radius:10px;padding:10px;margin-bottom:10px;opacity:.6}.cap-tbl.active{opacity:1;border-color:#b6d9ee;background:#f8fcfe}'
    + '.cap-tbl b{font-size:12px}.cap-pill{font-size:10px;color:#fff;background:#7FB3D5;border-radius:99px;padding:2px 9px}'
    + '.cap-pill.rose{background:#F4978E}'
    + '.cap-status{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}'
    + '.cap-box{border:1px solid var(--cap-line);border-radius:11px;padding:9px 11px;background:#fcfdfe}'
    + '.cap-box .k{font-size:11px;color:var(--cap-ink3)}.cap-box .v{font-size:20px;font-weight:700;font-variant-numeric:tabular-nums}'
    + '.cap-canvas{display:block;width:100%;height:auto;min-height:200px;border:1px solid var(--cap-line);border-radius:12px;background:#fff}'
    + '.cap-legend{display:flex;gap:16px;font-size:11.5px;color:var(--cap-ink2);margin-top:8px;flex-wrap:wrap}'
    + '.cap-legend i{display:inline-block;width:15px;height:3px;border-radius:2px;margin-right:5px;vertical-align:middle}'
    + '.cap-legend .lu{background:#F4978E}.cap-legend .li{background:#7FB3D5}'
    + '.cap-accordion{display:flex;flex-direction:column;gap:12px}'
    + '.cap-acc{background:#fff;border:1px solid var(--cap-line);border-radius:14px;box-shadow:0 8px 22px rgba(88,108,132,.06);overflow:hidden}'
    + '.cap-acc-head{width:100%;border:0;background:transparent;text-align:left;padding:14px 18px;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;color:var(--cap-ink)}'
    + '.cap-acc.is-open .cap-acc-head{background:#fcfdfe}.cap-acc-body{display:none;padding:4px 18px 18px;border-top:1px solid var(--cap-line)}'
    + '.cap-acc.is-open .cap-acc-body{display:block}'
    + '.cap-acc-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:14px;align-items:center}'
    + '.cap-mini-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}'
    + '.cap-mini{border:1px solid var(--cap-line);border-radius:11px;padding:9px;text-align:center;background:#fff}'
    + '.cap-mini svg{display:block;width:100%;height:auto;min-height:110px}.cap-mini p{font-size:12px;color:var(--cap-ink2);margin-top:5px}'
    + '.cap-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,10px);background:#fff;border:1px solid #dce4ec;border-radius:10px;padding:8px 14px;font-size:12px;color:#3a4250;box-shadow:0 8px 24px rgba(88,108,132,.14);opacity:0;transition:.2s;z-index:99;pointer-events:none}'
    + '.cap-chips{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}'
    + '.cap-chip{border:1px solid #dce4ec;background:#fff;border-radius:99px;padding:4px 11px;font-size:13px;font-weight:700;color:var(--cap-ink2);cursor:pointer;font-family:"Cambria Math",Georgia,serif;font-style:italic}'
    + '.cap-chip:hover{border-color:#b9d7e8}.cap-chip.on{background:var(--cap-cream);border-color:#e8d179;color:#7a6520;box-shadow:0 0 0 2px rgba(255,243,191,.7)}'
    + '.cap-explain{margin-top:12px;background:#f8fafc;border:1px dashed #cdd9e5;border-radius:10px;padding:11px 13px;font-size:13px;color:var(--cap-ink2);min-height:48px}'
    + '.cap-qhead{display:flex;align-items:center;gap:9px;font-weight:700;font-size:15px;margin-bottom:9px}'
    + '.cap-qnum{background:var(--cap-pink);color:#8c4f55;border-radius:8px;padding:2px 10px;font-size:12px}'
    + '.cap-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}'
    + '.cap-opt{border:1px solid var(--cap-line);background:#fff;border-radius:10px;padding:9px 12px;text-align:left;font-size:13px;cursor:pointer;color:var(--cap-ink2)}'
    + '.cap-opt:hover{border-color:#b9d7e8}.cap-opt.correct{background:#effaf4;border-color:#a7ddc4;color:#2f6a55;font-weight:700}'
    + '.cap-opt.wrong{background:#fff0f1;border-color:#ffd6da;color:#a35d65}'
    + '.cap-fb{font-size:13px;font-weight:700;min-height:20px;margin-top:6px}.cap-fb.ok{color:#3f8067}.cap-fb.no{color:#a35d65}'
    + '.cap-input{border:1px solid #dce4ec;border-radius:9px;padding:8px 11px;font-size:14px;width:120px;background:#fff}'
    + '.cap-exam-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:center}'
    + '@media(max-width:980px){.cap-grid2,.cap-grid4,.cap-acc-grid,.cap-exam-row{grid-template-columns:1fr}.cap-mini-row{grid-template-columns:1fr 1fr}}';

  /* -------------------- 视图 HTML -------------------- */
  function viewConcepts(){
    var cards = [
      { c:'pink', tag:'定义式', f:'C = <span class="cap-frac"><span class="n">Q</span><span class="d">U</span></span>',
        top:'两个彼此绝缘、相距很近的导体，能够储存电荷与电场能。',
        s:'<b>C</b> 电容（F）· <b>Q</b> 电荷量（C）· <b>U</b> 电压（V）<br>1 F = 1 C/V；C 不由 Q、U 决定。',
        chips:['C','Q','U'] },
      { c:'peach', tag:'决定式', f:'C = <span class="cap-frac"><span class="n">ε<span class="cap-sub2">r</span>S</span><span class="d">4πkd</span></span>',
        top:'电容由几何结构与介质决定。',
        s:'<b>ε<sub class="cap-sub2">r</sub></b> 相对介电常数 · <b>S</b> 正对面积 · <b>d</b> 板间距<br><b>k</b> 静电力常量 9.0×10⁹ N·m²/C²<br><span class="hl">核心：C ∝ ε<sub class="cap-sub2">r</sub>S / d</span>',
        chips:['C','εr','S','d','k'] },
      { c:'sky', tag:'场强', f:'E = <span class="cap-frac"><span class="n">U</span><span class="d">d</span></span> = <span class="cap-frac"><span class="n">4πkQ</span><span class="d">ε<span class="cap-sub2">r</span>S</span></span>',
        top:'平行板间为匀强电场，方向由正极板指向负极板。',
        s:'断电源时 Q 不变：<br><span class="hl">E 与板间距 d 无关</span>，只由面密度与介质决定。',
        chips:['E','U','d','Q','εr','S'] },
      { c:'mint', tag:'电场能', f:'W = <span class="cap-frac"><span class="n">1</span><span class="d">2</span></span>CU² = <span class="cap-frac"><span class="n">Q²</span><span class="d">2C</span></span> = <span class="cap-frac"><span class="n">1</span><span class="d">2</span></span>QU',
        top:'充电把其他形式的能转化为电场能储存起来。',
        s:'接电源用 <span class="hl">½CU²</span>，断电源用 <span class="hl">Q²/2C</span> 最方便。',
        chips:['W','C','U','Q'] }
    ];
    return '<div class="cap-grid4">' + cards.map(function(x){
      return '<details class="cap-card cap-concept ' + x.c + '" open>'
        + '<summary>' + x.tag + '</summary>'
        + '<div class="cap-sym" style="margin-top:10px">' + x.top + '</div>'
        + '<div class="cap-formula ' + (x.c==='sky'?'sky':x.c==='mint'?'mint':x.c==='peach'?'peach':'') + '">' + x.f + '</div>'
        + '<div class="cap-chips">' + x.chips.map(function(s){
            return '<button class="cap-chip" type="button" data-sym="'+s+'" aria-label="高亮物理量 '+s+'">'+s+'</button>';
          }).join('') + '</div>'
        + '<div class="cap-sym">' + x.s + '</div></details>';
    }).join('') + '</div>'
      + '<div class="cap-explain" id="capSymExplain" aria-live="polite">点按公式下方的物理量标记，可跨卡片高亮同一物理量并查看它的含义与单位。</div>'
      + '<details class="cap-drawer"><summary>符号与单位一览（点开查看）</summary><div class="body">'
      + '<table class="cap-table"><thead><tr><th>符号</th><th>意义</th><th>单位</th><th>符号</th><th>意义</th><th>单位</th></tr></thead><tbody>'
      + '<tr><td>C</td><td>电容</td><td>F</td><td>ε<sub class="cap-sub2">r</sub></td><td>相对介电常数</td><td>无量纲</td></tr>'
      + '<tr><td>Q</td><td>电荷量</td><td>C</td><td>S</td><td>正对面积</td><td>m²</td></tr>'
      + '<tr><td>U</td><td>电压</td><td>V</td><td>d</td><td>板间距</td><td>m</td></tr>'
      + '<tr><td>E</td><td>场强</td><td>V/m</td><td>k</td><td>静电力常量</td><td>9.0×10⁹</td></tr></tbody></table>'
      + '</div></details>';
  }

  function viewSimulator(){
    return '<div class="cap-grid2">'
      + '<div class="cap-card sky">'
      + '<div class="cap-h"><span>平行板电容器 · 动态分析 <span class="cap-sub">归一化示意</span></span><span class="cap-tag sky">电场线数量实时联动</span></div>'
      + '<div class="cap-diagram"><svg id="capCapSvg" viewBox="0 0 560 330" role="img" aria-label="平行板电容器示意图">'
      + '<defs>'
      + '<linearGradient id="capPosG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB3BA"/><stop offset="1" stop-color="#F4978E"/></linearGradient>'
      + '<linearGradient id="capNegG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F5"/><stop offset="1" stop-color="#7FB3D5"/></linearGradient>'
      + '<linearGradient id="capDielG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D0C4E8" stop-opacity=".22"/><stop offset=".5" stop-color="#D0C4E8" stop-opacity=".42"/><stop offset="1" stop-color="#D0C4E8" stop-opacity=".22"/></linearGradient>'
      + '<marker id="capArrF" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#7FB3D5"/></marker>'
      + '<marker id="capArrD" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#F4978E"/></marker>'
      + '</defs>'
      + '<g id="capWires" fill="none" stroke="#9aa8b6" stroke-width="2.4"></g>'
      + '<g id="capBattery"><line x1="68" y1="155" x2="112" y2="155" stroke="#F4978E" stroke-width="3"/><line x1="78" y1="170" x2="102" y2="170" stroke="#7FB3D5" stroke-width="3"/>'
      + '<text x="119" y="159" fill="#F4978E" font-size="14">+</text><text x="119" y="175" fill="#7FB3D5" font-size="14">−</text><text x="20" y="143" fill="#8b95a3" font-size="11">电源 · U 恒定</text></g>'
      + '<g id="capSwitch" style="display:none"><circle cx="90" cy="155" r="3.5" fill="#F4978E"/><circle cx="90" cy="170" r="3.5" fill="#F4978E"/>'
      + '<line x1="91" y1="154" x2="108" y2="143" stroke="#F4978E" stroke-width="3"/><text x="20" y="143" fill="#8b95a3" font-size="11">开关断开 · Q 守恒</text></g>'
      + '<rect id="capDiel" x="0" y="0" width="0" height="0" fill="url(#capDielG)" stroke="#c9bce4" stroke-dasharray="5 4" rx="2" style="display:none"/>'
      + '<g id="capFieldG"></g>'
      + '<rect id="capMetal" x="0" y="0" width="0" height="0" fill="#c9d3dd" stroke="#9dabba" rx="2" style="display:none"/>'
      + '<g id="capPolar"></g><text id="capErText" x="0" y="0" fill="#7665a0" font-size="11" style="display:none">介质</text>'
      + '<rect id="capPlateTop" x="0" y="0" width="0" height="12" fill="url(#capPosG)" rx="3"/>'
      + '<rect id="capPlateBot" x="0" y="0" width="0" height="12" fill="url(#capNegG)" rx="3"/>'
      + '<g id="capChargeG"></g>'
      + '<line id="capDimLine" x1="0" y1="0" x2="0" y2="0" stroke="#F4978E" stroke-width="1.5" marker-start="url(#capArrD)" marker-end="url(#capArrD)"/>'
      + '<text id="capDimText" x="0" y="0" fill="#a35d65" font-size="14" font-style="italic">d</text>'
      + '<text id="capSText" x="0" y="0" fill="#8b95a3" font-size="11" text-anchor="middle">正对面积 S</text>'
      + '<text id="capSceneText" x="20" y="320" fill="#8b95a3" font-size="10.5"></text>'
      + '</svg></div>'
      + '<div class="cap-svg-note" id="capFieldInfo"></div>'
      + '<div class="cap-ctrls">'
      + '<div class="cap-ctrl"><label for="capRangeD">极板间距 d <b id="capValD">1.00</b></label><input id="capRangeD" class="cap-range" type="range" min="0.5" max="2" step="0.01" value="1"></div>'
      + '<div class="cap-ctrl"><label for="capRangeS">正对面积 S <b id="capValS">1.00</b></label><input id="capRangeS" class="cap-range" type="range" min="0.5" max="2" step="0.01" value="1"></div>'
      + '<div class="cap-ctrl"><label for="capRangeEr">相对介电常数 εr <b id="capValEr">1.0</b></label><input id="capRangeEr" class="cap-range" type="range" min="1" max="6" step="0.1" value="1"></div></div>'
      + '<div class="cap-metal-row"><span><strong>插入金属板</strong>（等效减小 d） <span class="cap-tag" id="capMetalHint">未插入</span></span>'
      + '<button id="capMetalBtn" class="cap-switch" type="button" role="switch" aria-checked="false" aria-label="插入或移除金属板"></button></div>'
      + '</div>'
      + '<div class="cap-side">'
      + '<div class="cap-card pink">'
      + '<div class="cap-h"><span>电路情景与实时指标</span><span><button id="capBtnBase" class="cap-btn" type="button">设为基准</button> '
      + '<button id="capBtnReset" class="cap-btn" type="button">恢复默认</button></span></div>'
      + '<div class="cap-seg" role="group" aria-label="电路情景"><button id="capBtnU" class="active" type="button">🔌 接电源 · U 不变</button><button id="capBtnQ" type="button">⛔ 断电源 · Q 不变</button></div>'
      + '<div class="cap-metrics">'
      + ['C','Q','U','E','W'].map(function(k){ return '<div class="cap-metric"><div class="k">' + ({C:'电容 C',Q:'电荷 Q',U:'电压 U',E:'场强 E',W:'电场能 W'})[k] + '</div><div class="v" id="capV' + k + '">—</div><div class="t cap-flat" id="capT' + k + '">— 不变</div></div>'; }).join('')
      + '</div><p class="cap-note">数值为归一化示意（U₀=1、Q₀=C₀），只看趋势。<span class="cap-up">↑</span> 增大 · <span class="cap-down">↓</span> 减小。电场线线数 ∝ σ，线深浅 ∝ E。</p>'
      + '</div>'
      + '<details class="cap-drawer"><summary>动态规律速查表（两张表）</summary><div class="body">'
      + '<div id="capTblU" class="cap-tbl active"><b><span class="cap-pill rose">A</span> 接电源（U 不变）</b>'
      + '<table class="cap-table"><thead><tr><th>操作</th><th>C</th><th>Q</th><th>U</th><th>E</th><th>W</th></tr></thead><tbody>'
      + '<tr><td>d↑</td><td class="cell-down">↓</td><td class="cell-down">↓</td><td class="cell-same">—</td><td class="cell-down">↓</td><td class="cell-down">↓</td></tr>'
      + '<tr><td>S↑</td><td class="cell-up">↑</td><td class="cell-up">↑</td><td class="cell-same">—</td><td class="cell-same">—</td><td class="cell-up">↑</td></tr>'
      + '<tr><td>εr↑</td><td class="cell-up">↑</td><td class="cell-up">↑</td><td class="cell-same">—</td><td class="cell-same">—</td><td class="cell-up">↑</td></tr>'
      + '<tr><td>插金属板</td><td class="cell-up">↑</td><td class="cell-up">↑</td><td class="cell-same">—</td><td class="cell-up">↑</td><td class="cell-up">↑</td></tr></tbody></table></div>'
      + '<div id="capTblQ" class="cap-tbl"><b><span class="cap-pill">B</span> 断电源（Q 不变）</b>'
      + '<table class="cap-table"><thead><tr><th>操作</th><th>C</th><th>Q</th><th>U</th><th>E</th><th>W</th></tr></thead><tbody>'
      + '<tr><td>d↑</td><td class="cell-down">↓</td><td class="cell-same">—</td><td class="cell-up">↑</td><td class="cell-same">—</td><td class="cell-up">↑</td></tr>'
      + '<tr><td>S↑</td><td class="cell-up">↑</td><td class="cell-same">—</td><td class="cell-down">↓</td><td class="cell-down">↓</td><td class="cell-down">↓</td></tr>'
      + '<tr><td>εr↑</td><td class="cell-up">↑</td><td class="cell-same">—</td><td class="cell-down">↓</td><td class="cell-down">↓</td><td class="cell-down">↓</td></tr>'
      + '<tr><td>插金属板</td><td class="cell-up">↑</td><td class="cell-same">—</td><td class="cell-down">↓</td><td class="cell-same">—</td><td class="cell-down">↓</td></tr></tbody></table>'
      + '<p class="cap-note">断电源时 E=4πkQ/(εrS) 与 d 无关。</p></div>'
      + '</div></details></div></div>';
  }

  function viewCharge(){
    return '<div class="cap-grid2">'
      + '<div class="cap-card mint">'
      + '<div class="cap-h"><span>RC 充放电演示 <span class="cap-sub">开关切换电流方向</span></span><span class="cap-tag mint">电流粒子动画</span></div>'
      + '<div class="cap-btnrow"><button id="capBtnCharge" class="cap-btn primary" type="button">▶ 充电</button>'
      + '<button id="capBtnDischarge" class="cap-btn" type="button">◀ 放电</button>'
      + '<button id="capBtnPlay" class="cap-btn" type="button">⏸ 暂停</button>'
      + '<button id="capBtnResetRc" class="cap-btn warn" type="button">↺ 重置</button></div>'
      + '<div class="cap-diagram"><svg id="capRcSvg" viewBox="0 0 520 220" role="img" aria-label="RC 充放电电路">'
      + '<path id="capPathTop" d="M80,72 L80,40 L140,40 L200,40 L260,40 L320,40 L430,40 L430,80" fill="none" stroke="none"/>'
      + '<path id="capPathBottom" d="M430,120 L430,180 L80,180 L80,94" fill="none" stroke="none"/>'
      + '<path id="capPathDis" d="M430,80 L430,40 L320,40 L260,40 L200,40 L200,100 L200,180 L430,180 L430,120" fill="none" stroke="none"/>'
      + '<line x1="80" y1="40" x2="80" y2="70" stroke="#9aa8b6" stroke-width="2.5"/><line x1="62" y1="70" x2="98" y2="70" stroke="#F4978E" stroke-width="3.5"/>'
      + '<line x1="70" y1="94" x2="90" y2="94" stroke="#7FB3D5" stroke-width="3.5"/><line x1="80" y1="94" x2="80" y2="180" stroke="#9aa8b6" stroke-width="2.5"/>'
      + '<text x="106" y="74" fill="#a35d65" font-size="12">+</text><text x="106" y="98" fill="#4e7f9e" font-size="12">−</text><text x="18" y="88" fill="#8b95a3" font-size="11">电源</text>'
      + '<line x1="140" y1="40" x2="260" y2="40" stroke="#9aa8b6" stroke-width="2.5"/>'
      + '<path d="M260,40 l10,-9 l12,18 l12,-18 l12,18 l12,-18 l2,9" fill="none" stroke="#D0C4E8" stroke-width="3"/>'
      + '<line x1="320" y1="40" x2="430" y2="40" stroke="#9aa8b6" stroke-width="2.5"/><line x1="430" y1="40" x2="430" y2="80" stroke="#9aa8b6" stroke-width="2.5"/>'
      + '<text x="283" y="20" fill="#7665a0" font-size="11">R</text>'
      + '<line x1="80" y1="180" x2="430" y2="180" stroke="#9aa8b6" stroke-width="2.5"/><line x1="430" y1="180" x2="430" y2="120" stroke="#9aa8b6" stroke-width="2.5"/>'
      + '<line x1="200" y1="100" x2="200" y2="180" stroke="#c6d2dd" stroke-width="2.5" stroke-dasharray="4 4"/>'
      + '<circle cx="200" cy="40" r="4" fill="#5a6472"/><circle id="capContactCharge" cx="140" cy="40" r="4" fill="#B8E8D0" stroke="#7fbf9f"/>'
      + '<circle id="capContactDis" cx="200" cy="100" r="4" fill="#eef2f6" stroke="#c6d2dd"/>'
      + '<line id="capSwBlade" x1="200" y1="40" x2="142" y2="40" stroke="#5a6472" stroke-width="3.5" stroke-linecap="round"/>'
      + '<text x="122" y="28" fill="#3f8067" font-size="10">充电端</text><text x="210" y="104" fill="#8b95a3" font-size="10">放电端</text>'
      + '<line x1="398" y1="80" x2="462" y2="80" stroke="#F4978E" stroke-width="5" stroke-linecap="round"/>'
      + '<line x1="398" y1="120" x2="462" y2="120" stroke="#7FB3D5" stroke-width="5" stroke-linecap="round"/>'
      + '<g id="capCapCharges"></g><text x="470" y="105" fill="#5a6472" font-size="12" font-style="italic">C</text>'
      + '<g id="capRcParticles"></g><text id="capRcFlow" x="250" y="205" fill="#3f8067" font-size="11" text-anchor="middle">充电：电流从电源正极流向正极板</text>'
      + '</svg></div>'
      + '<p class="cap-note">小圆点表示常规电流方向；充电电荷逐个增加、电流衰减，放电电流反向、电荷减少到消失。</p>'
      + '</div>'
      + '<div class="cap-card peach">'
      + '<div class="cap-h"><span>电压与电流曲线 <span class="cap-sub">u-t / i-t</span></span><span class="cap-tag peach" id="capRcMode">充电中</span></div>'
      + '<div class="cap-status"><div class="cap-box"><div class="k">电容电压 u</div><div class="v" id="capStU">0.00</div></div>'
      + '<div class="cap-box"><div class="k">电流 i</div><div class="v" id="capStI">1.00</div></div>'
      + '<div class="cap-box"><div class="k">极板电荷符号</div><div class="v" id="capStQ">0</div></div></div>'
      + '<canvas id="capRcCurve" class="cap-canvas" width="960" height="290" role="img" aria-label="u-t 与 i-t 曲线"></canvas>'
      + '<div class="cap-legend"><span><i class="lu"></i>u(t) 电容电压</span><span><i class="li"></i>i(t) 电流（放电为负）</span></div>'
      + '<p class="cap-note">充电 u=U(1−e<sup>−t/RC</sup>)，放电 u=U₀e<sup>−t/RC</sup>；时间常数 τ=RC 决定快慢。</p>'
      + '</div></div>';
  }

  function viewExtend(){
    return '<div class="cap-accordion">'
      + '<div class="cap-acc is-open"><button class="cap-acc-head" type="button" aria-expanded="true">带电粒子在板间电场中的运动 <span class="cap-tag lav">类平抛</span></button>'
      + '<div class="cap-acc-body"><div class="cap-acc-grid"><div><div class="cap-formula">F = qE，a = qE/m ｜ x = v₀t，y = ½at²</div>'
      + '<div class="cap-sym">水平匀速、竖直匀加速 → 抛物线轨迹；飞出后沿切线匀速直线。</div></div>'
      + '<canvas id="capParticleCv" class="cap-canvas" width="1040" height="480" role="img" aria-label="粒子偏转动画"></canvas></div></div></div>'
      + '<div class="cap-acc"><button class="cap-acc-head" type="button" aria-expanded="false">LC 振荡电路 <span class="cap-tag sky">电磁振荡</span></button>'
      + '<div class="cap-acc-body"><div class="cap-acc-grid"><div><div class="cap-formula sky">T = 2π√LC ｜ f = 1/(2π√LC)</div>'
      + '<div class="cap-sym">q 最大时 i=0（电场能最大）；i 最大时 q=0（磁场能最大）。每 T/2 转化一次。</div>'
      + '<svg id="capLcSvg" viewBox="0 0 220 160" style="width:100%;max-width:260px;height:auto" role="img" aria-label="LC 电路">'
      + '<path d="M50,30 H170 M50,130 H170 M50,30 V70 M50,86 V130 M170,30 V50 M170,110 V130" fill="none" stroke="#9aa8b6" stroke-width="2.5"/>'
      + '<path d="M170,50 c-16,6 -16,14 0,20 c16,6 16,14 0,20 c-16,6 -16,14 0,20" fill="none" stroke="#D0C4E8" stroke-width="3.5"/>'
      + '<rect id="capLcGlow" x="36" y="64" width="28" height="28" rx="4" fill="#FFB3BA" opacity=".25"/>'
      + '<line x1="38" y1="70" x2="62" y2="70" stroke="#F4978E" stroke-width="4"/><line x1="38" y1="86" x2="62" y2="86" stroke="#7FB3D5" stroke-width="4"/>'
      + '<g id="capLcChargeTop"></g><g id="capLcChargeBottom"></g>'
      + '<path id="capArrR" d="M112,25 l11,5 -11,5 z" fill="#7FB3D5"/><path id="capArrL" d="M108,25 l-11,5 11,5 z" fill="#7FB3D5" style="display:none"/>'
      + '</svg></div><canvas id="capLcCv" class="cap-canvas" width="1040" height="440" role="img" aria-label="q-t 与 i-t 曲线"></canvas></div></div></div>'
      + '<div class="cap-acc"><button class="cap-acc-head" type="button" aria-expanded="false">电容器的串联与并联 <span class="cap-tag mint">等效电容</span></button>'
      + '<div class="cap-acc-body"><div class="cap-formula mint">串联 1/C = Σ1/Cᵢ（等电荷） ｜ 并联 C = ΣCᵢ（等电压）</div>'
      + '<div class="cap-mini-row"><div class="cap-mini"><svg viewBox="0 0 150 110" role="img" aria-label="串联电路">'
      + '<path d="M10,35 H58 M75,35 H118 M135,35 V85 M135,85 H100 M85,85 H10 V35" fill="none" stroke="#9aa8b6" stroke-width="2.5"/>'
      + '<line x1="58" y1="22" x2="58" y2="48" stroke="#F4978E" stroke-width="3.5"/><line x1="68" y1="22" x2="68" y2="48" stroke="#F4978E" stroke-width="3.5"/>'
      + '<line x1="100" y1="22" x2="100" y2="48" stroke="#7FB3D5" stroke-width="3.5"/><line x1="110" y1="22" x2="110" y2="48" stroke="#7FB3D5" stroke-width="3.5"/>'
      + '<path d="M68,35 H100" stroke="#9aa8b6" stroke-width="2.5"/></svg><p>串联：Q 相等，等效电容变小</p></div>'
      + '<div class="cap-mini"><svg viewBox="0 0 150 110" role="img" aria-label="并联电路">'
      + '<path d="M15,25 H135 M15,85 H135 M15,25 V85 M135,25 V85" fill="none" stroke="#9aa8b6" stroke-width="2.5"/>'
      + '<path d="M15,55 H60 M90,55 H135" fill="none" stroke="#9aa8b6" stroke-width="2.5"/>'
      + '<line x1="60" y1="42" x2="60" y2="68" stroke="#F4978E" stroke-width="3.5"/><line x1="70" y1="42" x2="70" y2="68" stroke="#F4978E" stroke-width="3.5"/>'
      + '<line x1="98" y1="42" x2="98" y2="68" stroke="#7FB3D5" stroke-width="3.5"/><line x1="108" y1="42" x2="108" y2="68" stroke="#7FB3D5" stroke-width="3.5"/>'
      + '<path d="M70,55 H98" stroke="#9aa8b6" stroke-width="2.5"/></svg><p>并联：U 相等，等效电容变大</p></div></div></div></div>'
      + '<div class="cap-acc"><button class="cap-acc-head" type="button" aria-expanded="false">电容式传感器 <span class="cap-tag peach">C 的变化检测</span></button>'
      + '<div class="cap-acc-body"><div class="cap-formula peach">被测量 → 改变 d / S / εr → 改变 C → 转换为电信号</div>'
      + '<div class="cap-mini-row">'
      + '<div class="cap-mini"><svg viewBox="0 0 130 90" role="img" aria-label="压力传感器"><rect x="20" y="20" width="90" height="8" fill="#FFB3BA" rx="2"/>'
      + '<path d="M22,66 Q65,80 108,66" fill="none" stroke="#7FB3D5" stroke-width="6"/><path d="M65,6 V26 M58,18 L65,26 L72,18" fill="none" stroke="#F4978E" stroke-width="2.5"/></svg><p>压力 → d↓ → C↑</p></div>'
      + '<div class="cap-mini"><svg viewBox="0 0 130 90" role="img" aria-label="位移传感器"><rect x="18" y="22" width="24" height="50" fill="#FFB3BA"/>'
      + '<rect x="80" y="12" width="24" height="50" fill="#BFE3F5"/></svg><p>位移 → S↓ → C↓</p></div>'
      + '<div class="cap-mini"><svg viewBox="0 0 130 90" role="img" aria-label="液位传感器"><rect x="26" y="8" width="7" height="72" fill="#FFB3BA"/>'
      + '<rect x="97" y="8" width="7" height="72" fill="#BFE3F5"/><rect x="34" y="46" width="62" height="34" fill="#BFE3F5" opacity=".8"/>'
      + '<path d="M34,46 H96" stroke="#7FB3D5" stroke-width="2"/></svg><p>液位 → εr↑ → C↑</p></div>'
      + '</div></div></div></div>';
  }

  function viewExam(){
    return ''
      + '<div class="cap-card pink">'
      + '<div class="cap-qhead"><span class="cap-qnum">1</span>平行板接电源 · 增大板间距（选择题）</div>'
      + '<div class="cap-sym">保持与电源连接，把板间距 d 从 1.00 调到 <b id="capQ1Val">1.50</b>，电容 C、电荷 Q、场强 E、电场能 W 如何变化？</div>'
      + '<input id="capQ1Range" class="cap-range" type="range" min="1.1" max="2" step="0.1" value="1.5" style="max-width:420px;margin:10px 0" aria-label="板间距变化倍数">'
      + '<div class="cap-opts" id="capQ1Opts">'
      + '<button class="cap-opt" type="button" data-i="0">A. C↑ Q↑ E↑ W↑</button>'
      + '<button class="cap-opt" type="button" data-i="1">B. C↓ Q↓ E↓ W↓</button>'
      + '<button class="cap-opt" type="button" data-i="2">C. C↓ Q↓ E 不变 W↓</button>'
      + '<button class="cap-opt" type="button" data-i="3">D. C↑ Q↑ E 不变 W↑</button></div>'
      + '<div class="cap-fb" id="capQ1Fb"></div>'
      + '<details class="cap-drawer"><summary>展开解析</summary><div class="body"><div class="cap-sym">接电源时 <b>U 不变</b>。由 C∝εrS/d 得 d↑→C↓；Q=CU→Q↓；E=U/d→E↓；W=½CU²→W↓。故选 B。</div></div></details>'
      + '</div>'

      + '<div class="cap-card peach">'
      + '<div class="cap-qhead"><span class="cap-qnum">2</span>串并联与电容传感器（计算题）</div>'
      + '<div class="cap-exam-row">'
      + '<div><div class="cap-sym">两个电容 C₁、C₂ <b>并联</b>接在同一电源上，求等效电容 C。可拖动参数改变题目数据（归一化，略去 4πk）。<br>'
      + 'C₁=<b id="capQ2C1V">2.0</b>　C₂=<b id="capQ2C2V">3.0</b></div>'
      + '<div class="cap-chips"><button class="cap-chip" type="button" data-sym="C">C</button><button class="cap-chip" type="button" data-sym="U">U</button><button class="cap-chip" type="button" data-sym="Q">Q</button></div>'
      + '<div class="cap-fb" id="capQ2SymFb" aria-live="polite">点按 C / U / Q 查看符号含义与单位。</div>'
      + '<div class="cap-ctrls" style="grid-template-columns:repeat(2,minmax(0,1fr))">'
      + '<div class="cap-ctrl"><label>C₁ <b>2.0</b></label><input id="capQ2C1" class="cap-range" type="range" min="1" max="5" step="0.5" value="2"></div>'
      + '<div class="cap-ctrl"><label>C₂ <b>3.0</b></label><input id="capQ2C2" class="cap-range" type="range" min="1" max="5" step="0.5" value="3"></div></div>'
      + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
      + '<input id="capQ2Ans" class="cap-input" type="number" step="0.1" placeholder="你的答案" aria-label="等效电容答案">'
      + '<button id="capQ2Check" class="cap-btn primary" type="button">判定</button></div>'
      + '<div class="cap-fb" id="capQ2Fb"></div></div>'
      + '<div class="cap-mini-row">'
      + '<div class="cap-mini"><svg viewBox="0 0 150 110" role="img" aria-label="串联电路"><path d="M15,25 H135 M15,85 H135 M15,25 V85 M135,25 V85" fill="none" stroke="#9aa8b6" stroke-width="2.5"/><path d="M15,55 H60 M90,55 H135" fill="none" stroke="#9aa8b6" stroke-width="2.5"/><line x1="60" y1="42" x2="60" y2="68" stroke="#F4978E" stroke-width="3.5"/><line x1="70" y1="42" x2="70" y2="68" stroke="#F4978E" stroke-width="3.5"/><line x1="98" y1="42" x2="98" y2="68" stroke="#7FB3D5" stroke-width="3.5"/><line x1="108" y1="42" x2="108" y2="68" stroke="#7FB3D5" stroke-width="3.5"/><path d="M70,55 H98" stroke="#9aa8b6" stroke-width="2.5"/></svg><p>串联：等电荷，1/C=Σ1/Cᵢ</p></div>'
      + '<div class="cap-mini"><svg viewBox="0 0 130 90" role="img" aria-label="液位传感器"><rect x="26" y="8" width="7" height="72" fill="#FFB3BA"/><rect x="97" y="8" width="7" height="72" fill="#BFE3F5"/><rect x="34" y="46" width="62" height="34" fill="#BFE3F5" opacity=".8"/><path d="M34,46 H96" stroke="#7FB3D5" stroke-width="2"/></svg><p>液位传感器：液面↑→等效 εr↑→C↑</p></div>'
      + '</div></div>'
      + '<details class="cap-drawer"><summary>展开解析</summary><div class="body"><div class="cap-sym">并联各支路<b>电压相等</b>，电荷量相加：Q=Q₁+Q₂=(C₁+C₂)U，故 <span class="hl">C=C₁+C₂</span>。串联则电荷相等、电压相加，等效电容比任一个都小。</div></div></details>'
      + '</div>'

      + '<div class="cap-card sky">'
      + '<div class="cap-qhead"><span class="cap-qnum">3</span>带电粒子偏转 · 初速度的影响（选择题）</div>'
      + '<div class="cap-exam-row">'
      + '<div><div class="cap-sym">带电粒子以水平初速度 v₀ 垂直进入匀强偏转电场。保持 q、m、E、极板长度不变，若 <b>v₀ 增大</b>，离开电场时的竖直偏转量 y 如何变化？当前 v₀=<b id="capQ3VVal">1.0</b>（示意）。</div>'
      + '<input id="capQ3V" class="cap-range" type="range" min="0.6" max="2" step="0.1" value="1" style="max-width:420px;margin:10px 0" aria-label="初速度">'
      + '<div class="cap-opts" style="grid-template-columns:1fr 1fr">'
      + '<button class="cap-opt" type="button" data-i="0">A. y 增大</button>'
      + '<button class="cap-opt" type="button" data-i="1">B. y 减小</button>'
      + '<button class="cap-opt" type="button" data-i="2">C. y 不变</button>'
      + '<button class="cap-opt" type="button" data-i="3">D. 先增大后减小</button></div>'
      + '<div class="cap-fb" id="capQ3Fb"></div></div>'
      + '<canvas id="capQuizParticle" class="cap-canvas" width="1040" height="480" role="img" aria-label="带电粒子偏转情境动画"></canvas>'
      + '</div>'
      + '<details class="cap-drawer"><summary>展开解析</summary><div class="body"><div class="cap-sym">水平方向 x=v₀t，竖直方向 y=½at²（a=qE/m）。联立得 <span class="hl">y=(qE/2mv₀²)x²</span>，故 v₀ 增大时偏转量 y 减小。飞出电场后粒子沿切线做匀速直线运动。</div></div></details>'
      + '</div>';
  }

  /* -------------------- 模块主体 -------------------- */
  function render(container, extIndex){
    if(!container || typeof container.innerHTML === 'undefined') return function(){};
    extIndex = Number(extIndex);
    if(!isFinite(extIndex) || extIndex < 0 || extIndex > 3) extIndex = 0;
    extIndex = extIndex | 0;

    var doc = global.document;
    var disposed = false, running = true, paused = false;
    var listeners = [], loops = [], timers = [];

    function q(id){ return container.querySelector('#' + id); }
    function on(el, type, fn, opts){
      if(!el) return;
      el.addEventListener(type, fn, opts);
      listeners.push({ el:el, type:type, fn:fn, opts:opts });
    }
    function later(fn, ms){
      var id = global.setTimeout(function(){ if(!disposed) fn(); }, ms);
      timers.push(id);
      return id;
    }
    function loop(fn){
      var rec = { id:0 };
      loops.push(rec);
      function frame(now){
        if(disposed || !running) return;
        try{ fn(now); }catch(e){ /* 单帧异常不终止动画 */ }
        rec.id = global.requestAnimationFrame(frame);
      }
      rec.id = global.requestAnimationFrame(frame);
    }
    on(doc, 'visibilitychange', function(){ paused = doc.hidden; });

    var toastEl = null;
    function toast(msg){
      if(!toastEl){
        toastEl = doc.createElement('div');
        toastEl.className = 'cap-toast';
        toastEl.setAttribute('role','status');
        doc.body.appendChild(toastEl);
        listeners.push({ el:toastEl, type:'__dom__', fn:toastEl, opts:null });
      }
      toastEl.textContent = msg;
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translate(-50%,0)';
      later(function(){
        if(toastEl){ toastEl.style.opacity = '0'; toastEl.style.transform = 'translate(-50%,10px)'; }
      }, 1500);
    }

    var body = extIndex === 0 ? viewConcepts()
      : extIndex === 1 ? viewSimulator()
        : extIndex === 2 ? viewCharge() : viewExam();
    container.innerHTML = '<style>' + STYLE + '</style><div class="cap-root">' + body + '</div>';

    /* ---------------- 视图 0：基本模型（公式物理量联动） ---------------- */
    if(extIndex === 0){
      var SYM = {
        C:'电容，反映电容器容纳电荷的本领，单位 F（法拉）。由 εr、S、d 决定，与 Q、U 无关。',
        Q:'电荷量，指一块极板所带电荷的绝对值，单位 C（库仑）。',
        U:'两极板间电势差（电压），单位 V（伏特）。接电源时由电源决定。',
        E:'板间匀强电场的场强，单位 V/m。接电源 E=U/d；断电源 E=4πkQ/(εrS) 与 d 无关。',
        W:'电场能，单位 J（焦耳）。接电源用 W=½CU²，断电源用 W=Q²/2C。',
        S:'两极板的正对面积，单位 m²。S 越大电容越大。',
        d:'两极板间距，单位 m。d 越大电容越小。',
        εr:'相对介电常数，无量纲（空气≈1）。插入介质后 εr 增大，电容增大。',
        k:'静电力常量 k=9.0×10⁹ N·m²/C²，出现在决定式分母 4πkd 中。'
      };
      var chips = container.querySelectorAll('.cap-chip');
      for(var ci=0; ci<chips.length; ci++){
        on(chips[ci], 'click', function(){
          var s = this.getAttribute('data-sym');
          for(var j=0;j<chips.length;j++) chips[j].classList.toggle('on', chips[j].getAttribute('data-sym') === s);
          q('capSymExplain').innerHTML = '<b style="font-family:Georgia,serif;font-style:italic">' + s + '</b>：' + (SYM[s] || '电容器相关物理量。');
        });
      }
    }

    /* ---------------- 物理内核 ---------------- */
    var METAL_T = 0.4;
    var DEFAULTS = { d:1, S:1, er:1, metal:false };
    var state = { d:1, S:1, er:1, metal:false, sc:'U' };
    var baseline = { d:1, S:1, er:1, metal:false };
    var C0 = 1;
    function dEff(p){ return p.metal ? Math.max(0.08, p.d - METAL_T) : p.d; }
    function Cof(p){ return p.er * p.S / dEff(p); }
    function computeC0(){ C0 = Cof(baseline); }
    function metrics(p, sc){
      var C = Cof(p), ge = dEff(p), U, Q, E, W;
      if(sc === 'U'){ U = 1; Q = C; E = 1/ge; W = C/2; }
      else { Q = C0; U = C0/C; E = C0/(p.er*p.S); W = (C0*C0)/(2*C); }
      return { C:C, Q:Q, U:U, E:E, W:W };
    }
    function fmt(v){
      if(!isFinite(v)) return '—';
      var a = Math.abs(v);
      if(a === 0) return '0';
      if(a < 0.001 || a >= 1000) return v.toExponential(2);
      return String(Number(v.toPrecision(3)));
    }
    function trend(v, base){
      var rel = (v - base) / (Math.abs(base) || 1);
      return rel > 1e-4 ? 'up' : rel < -1e-4 ? 'down' : 'flat';
    }
    function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
    function setAttr(el, obj){ for(var k in obj) el.setAttribute(k, obj[k]); }

    /* ---------------- 视图 1：动态模拟 ---------------- */
    if(extIndex === 1){
      function renderSim(){
        var m = metrics(state, state.sc), bm = metrics(baseline, state.sc);
        var w = 130 + 80*(state.S - 0.5)/1.5;
        var gap = 40 + 60*state.d;
        var cx = 315, cy = 165, t = 12;
        var L = cx - w/2, R = cx + w/2;
        var topY = cy - gap/2 - t, botY = cy + gap/2;
        var tin = cy - gap/2, bin = cy + gap/2;

        ['C','Q','U','E','W'].forEach(function(k){
          q('capV'+k).textContent = fmt(m[k]);
          var tr = trend(m[k], bm[k]), el = q('capT'+k);
          el.className = 't cap-' + tr;
          el.textContent = tr === 'up' ? '↑ 增大' : tr === 'down' ? '↓ 减小' : '— 不变';
        });
        q('capTblU').className = 'cap-tbl' + (state.sc==='U' ? ' active' : '');
        q('capTblQ').className = 'cap-tbl' + (state.sc==='Q' ? ' active' : '');

        setAttr(q('capPlateTop'), {x:L, y:topY, width:w, height:t});
        setAttr(q('capPlateBot'), {x:L, y:botY, width:w, height:t});
        q('capWires').innerHTML = '<path d="M'+L+','+(topY+t/2)+' H90 V155"/><path d="M'+L+','+(botY+t/2)+' H90 V170"/>';
        q('capBattery').style.display = state.sc==='U' ? '' : 'none';
        q('capSwitch').style.display = state.sc==='Q' ? '' : 'none';
        q('capSceneText').textContent = state.sc==='U' ? '情景 A：接电源，U 恒定' : '情景 B：断电源，Q 守恒';

        if(state.er > 1.001){
          q('capDiel').style.display = '';
          setAttr(q('capDiel'), {x:L+3, y:tin, width:w-6, height:gap, opacity:(0.55+0.45*(state.er-1)/5).toFixed(2)});
          var pol = '';
          for(var p=0;p<4;p++){
            var px = L + (p+0.5)*w/4;
            pol += '<text x="'+px.toFixed(1)+'" y="'+(tin+14)+'" fill="#9b87c4" font-size="10" text-anchor="middle">−</text>'
              + '<text x="'+px.toFixed(1)+'" y="'+(bin-5)+'" fill="#9b87c4" font-size="10" text-anchor="middle">+</text>';
          }
          q('capPolar').innerHTML = pol;
          q('capErText').style.display = '';
          setAttr(q('capErText'), {x:L+10, y:cy+4});
          q('capErText').textContent = '介质 εr=' + state.er.toFixed(1) + '（极化）';
        }else{
          q('capDiel').style.display = 'none'; q('capPolar').innerHTML = ''; q('capErText').style.display = 'none';
        }
        q('capMetal').style.display = state.metal ? '' : 'none';
        if(state.metal) setAttr(q('capMetal'), {x:L-4, y:cy-12, width:w+8, height:24});

        var N = clamp(Math.round(8*m.Q/state.S), 3, 14);
        var op = clamp(0.30 + 0.34*(m.E/(metrics(baseline,state.sc).E||1)), 0.22, 0.88);
        var segs = state.metal ? [[tin+2,cy-14],[cy+14,bin-2]] : [[tin+2,bin-2]];
        var html = '';
        for(var i=0;i<N;i++){
          var x = L + (i+0.5)*w/N;
          for(var s=0;s<segs.length;s++){
            var y1=segs[s][0], y2=segs[s][1];
            if(y2>y1+6) html += '<line x1="'+x.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="#7FB3D5" stroke-width="1.8" stroke-opacity="'+op.toFixed(2)+'" marker-end="url(#capArrF)"/>';
          }
        }
        q('capFieldG').innerHTML = html;

        var Nq = clamp(Math.round(5*m.Q), 3, 12), ch = '';
        for(var j=0;j<Nq;j++){
          var xx = L + (j+0.5)*w/Nq;
          ch += '<text x="'+xx.toFixed(1)+'" y="'+(topY+9)+'" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">+</text>';
          ch += '<text x="'+xx.toFixed(1)+'" y="'+(botY+9)+'" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">−</text>';
        }
        q('capChargeG').innerHTML = ch;
        setAttr(q('capDimLine'), {x1:R+28, y1:tin, x2:R+28, y2:bin});
        setAttr(q('capDimText'), {x:R+36, y:cy+4});
        setAttr(q('capSText'), {x:cx, y:topY-9});
        q('capFieldInfo').textContent = 'σ = Q/S = ' + fmt(m.Q/state.S) + ' ｜ 电场线 ' + N + ' 根 ｜ 极板电荷 ±' + Nq + ' 对（定性示意）';
        q('capMetalHint').textContent = state.metal ? '已插入（有效 d≈'+(state.d-METAL_T).toFixed(2)+'）' : '未插入';
      }
      function fill(el){
        var min=+el.min, max=+el.max;
        el.style.setProperty('--fill', ((+el.value-min)/(max-min)*100).toFixed(1)+'%');
      }
      [['capRangeD','d','capValD',2],['capRangeS','S','capValS',2],['capRangeEr','er','capValEr',1]].forEach(function(cfg){
        var el = q(cfg[0]); fill(el);
        on(el, 'input', function(){
          state[cfg[1]] = +this.value;
          q(cfg[2]).textContent = (+this.value).toFixed(cfg[3]);
          fill(this); renderSim();
        });
      });
      on(q('capMetalBtn'), 'click', function(){
        state.metal = !state.metal;
        this.classList.toggle('on', state.metal);
        this.setAttribute('aria-checked', String(state.metal));
        renderSim();
      });
      function setScenario(sc){
        state.sc = sc;
        q('capBtnU').classList.toggle('active', sc==='U');
        q('capBtnQ').classList.toggle('active', sc==='Q');
        renderSim();
      }
      on(q('capBtnU'), 'click', function(){ setScenario('U'); });
      on(q('capBtnQ'), 'click', function(){ setScenario('Q'); });
      on(q('capBtnBase'), 'click', function(){
        baseline = { d:state.d, S:state.S, er:state.er, metal:state.metal };
        computeC0(); renderSim(); toast('已将当前参数设为比较基准');
      });
      on(q('capBtnReset'), 'click', function(){
        state.d=1; state.S=1; state.er=1; state.metal=false; state.sc='U';
        baseline = { d:1, S:1, er:1, metal:false }; computeC0();
        q('capRangeD').value=1; q('capRangeS').value=1; q('capRangeEr').value=1;
        [q('capRangeD'),q('capRangeS'),q('capRangeEr')].forEach(fill);
        q('capValD').textContent='1.00'; q('capValS').textContent='1.00'; q('capValEr').textContent='1.0';
        q('capMetalBtn').classList.remove('on'); q('capMetalBtn').setAttribute('aria-checked','false');
        q('capBtnU').classList.add('active'); q('capBtnQ').classList.remove('active');
        renderSim(); toast('已恢复默认参数与基准');
      });
      computeC0(); renderSim();
    }

    /* ---------------- 视图 2：RC 充放电 ---------------- */
    if(extIndex === 2){
      var tau = 1.15, DURATION = 5*tau;
      var rc = { mode:'charge', u:0, u0:0, t:0, playing:true, i:1 };
      var NSsvg = 'http://www.w3.org/2000/svg';
      var paths = { top:q('capPathTop'), bottom:q('capPathBottom'), dis:q('capPathDis') };
      var lens = { top:0, bottom:0, dis:0 };
      var dots = [];
      Object.keys(paths).forEach(function(k){ try{ lens[k] = paths[k].getTotalLength(); }catch(e){} });
      for(var di=0; di<12; di++){
        var c = doc.createElementNS(NSsvg, 'circle');
        c.setAttribute('r','5'); c.setAttribute('stroke','#fff'); c.setAttribute('stroke-width','1'); c.setAttribute('opacity','0');
        q('capRcParticles').appendChild(c); dots.push(c);
      }
      function blade(){
        var charge = rc.mode==='charge';
        setAttr(q('capSwBlade'), charge ? {x2:142,y2:40} : {x2:200,y2:98});
        q('capContactCharge').setAttribute('fill', charge ? '#B8E8D0' : '#eef2f6');
        q('capContactDis').setAttribute('fill', charge ? '#eef2f6' : '#FFB3BA');
        q('capRcFlow').textContent = charge ? '充电：电流从电源正极流向正极板' : '放电：电流反向，经电阻流回负极板';
        q('capRcFlow').setAttribute('fill', charge ? '#3f8067' : '#a35d65');
        q('capRcMode').textContent = charge ? '充电中' : '放电中';
        q('capBtnCharge').classList.toggle('active', charge);
        q('capBtnDischarge').classList.toggle('active', !charge);
      }
      function setMode(m){
        if(m === rc.mode) return;
        if(m === 'discharge' && rc.u < 0.05) rc.u = 1;
        rc.u0 = rc.u; rc.t = 0; rc.mode = m; rc.playing = true;
        q('capBtnPlay').textContent = '⏸ 暂停'; blade();
      }
      function resetRc(){
        rc.mode='charge'; rc.u=0; rc.u0=0; rc.t=0; rc.playing=true;
        q('capBtnPlay').textContent = '⏸ 暂停'; blade();
      }
      on(q('capBtnCharge'), 'click', function(){ setMode('charge'); });
      on(q('capBtnDischarge'), 'click', function(){ setMode('discharge'); });
      on(q('capBtnPlay'), 'click', function(){
        rc.playing = !rc.playing;
        q('capBtnPlay').textContent = rc.playing ? '⏸ 暂停' : '▶ 继续';
      });
      on(q('capBtnResetRc'), 'click', function(){ resetRc(); toast('充放电实验已重置'); });
      blade();

      var curve = q('capRcCurve'), ctx = curve.getContext('2d');
      ctx.setTransform(curve.width/480, 0, 0, curve.height/145, 0, 0);
      function uAt(tt){ return rc.mode==='charge' ? 1-(1-rc.u0)*Math.exp(-tt/tau) : rc.u0*Math.exp(-tt/tau); }
      function iAt(tt){ return rc.mode==='charge' ? (1-rc.u0)*Math.exp(-tt/tau) : -rc.u0*Math.exp(-tt/tau); }
      function plot(fn, color, width, limit){
        ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath();
        var end=Math.min(limit,DURATION);
        for(var tt=0; tt<=end+0.001; tt+=0.03){
          var x=38+(tt/DURATION)*430, y=71-46*fn(tt);
          if(tt===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      function drawCurve(){
        ctx.clearRect(0,0,480,145);
        ctx.strokeStyle='rgba(160,175,190,.2)'; ctx.lineWidth=1;
        [16,71,126].forEach(function(y){ ctx.beginPath(); ctx.moveTo(38,y); ctx.lineTo(468,y); ctx.stroke(); });
        ctx.fillStyle='#8b95a3'; ctx.font='10px sans-serif';
        ctx.fillText('u',24,20); ctx.fillText('0',26,75); ctx.fillText('i',24,130); ctx.fillText('t',471,75);
        plot(uAt,'rgba(244,151,142,.32)',1.6,DURATION);
        plot(iAt,'rgba(127,179,213,.32)',1.6,DURATION);
        plot(uAt,'#F4978E',2.4,Math.min(rc.t,DURATION));
        plot(iAt,'#7FB3D5',2.4,Math.min(rc.t,DURATION));
        var px=38+(Math.min(rc.t,DURATION)/DURATION)*430;
        ctx.strokeStyle='rgba(90,100,114,.45)'; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(px,16); ctx.lineTo(px,126); ctx.stroke(); ctx.setLineDash([]);
        [[uAt,'#F4978E'],[iAt,'#7FB3D5']].forEach(function(pair){
          var y=71-46*pair[0](Math.min(rc.t,DURATION));
          ctx.fillStyle=pair[1]; ctx.beginPath(); ctx.arc(px,y,4,0,Math.PI*2); ctx.fill();
        });
      }
      var lastRc = 0;
      loop(function(now){
        if(!lastRc) lastRc = now;
        var dt = Math.min(0.05,(now-lastRc)/1000); lastRc = now;
        if(rc.playing && !paused){
          rc.t = Math.min(DURATION, rc.t + dt);
          rc.u = uAt(rc.t);
        }
        rc.i = iAt(rc.t);
        var mag = Math.abs(rc.i), group = q('capRcParticles');
        group.setAttribute('opacity', mag<0.015 ? '0' : clamp(0.25+0.75*mag,0,1).toFixed(2));
        var speed = 0.22+0.55*mag;
        for(var j=0;j<dots.length;j++){
          var key, idx, count;
          if(rc.mode==='charge'){
            if(j<6){ key='top'; idx=j; count=6; dots[j].setAttribute('fill','#F4978E'); }
            else{ key='bottom'; idx=j-6; count=6; dots[j].setAttribute('fill','#7FB3D5'); }
          }else{ key='dis'; idx=j; count=12; dots[j].setAttribute('fill', j<8?'#F4978E':'#7FB3D5'); }
          if(!lens[key]) continue;
          var frac=(idx/count+speed*rc.t)%1, pt=paths[key].getPointAtLength(frac*lens[key]);
          dots[j].setAttribute('cx', pt.x.toFixed(1)); dots[j].setAttribute('cy', pt.y.toFixed(1));
        }
        var n = Math.round(10*rc.u), html='';
        for(var k=0;k<n;k++){
          var x=402+(k+0.5)*(56/Math.max(n,1));
          html += '<text x="'+x.toFixed(1)+'" y="73" fill="#a35d65" font-size="10" text-anchor="middle">+</text>'
            + '<text x="'+x.toFixed(1)+'" y="134" fill="#4e7f9e" font-size="10" text-anchor="middle">−</text>';
        }
        q('capCapCharges').innerHTML = html;
        q('capStU').textContent = rc.u.toFixed(2);
        q('capStI').textContent = (rc.i>=0?'+':'') + rc.i.toFixed(2);
        q('capStQ').textContent = String(n);
        drawCurve();
      });
    }

    /* ---------------- 旧拓展动画保留备查（当前高考题型视图已不使用） ---------------- */
    if(extIndex === 99){
      var accs = container.querySelectorAll('.cap-acc');
      for(var ai=0; ai<accs.length; ai++){
        on(accs[ai].querySelector('.cap-acc-head'), 'click', function(){
          var item = this.parentNode;
          var willOpen = !item.classList.contains('is-open');
          for(var j=0;j<accs.length;j++){
            accs[j].classList.remove('is-open');
            accs[j].querySelector('.cap-acc-head').setAttribute('aria-expanded','false');
          }
          if(willOpen){ item.classList.add('is-open'); this.setAttribute('aria-expanded','true'); }
        });
      }

      /* 粒子偏转 */
      var pc = q('capParticleCv'), pctx = pc.getContext('2d');
      pctx.setTransform(pc.width/520, 0, 0, pc.height/240, 0, 0);
      var x0=90, y0=120, Lx=390, kp=50/Math.pow(300,2), xEnd=470, phP=0, lastP=0;
      function yAt(x){
        if(x<=Lx) return y0+kp*(x-x0)*(x-x0);
        return y0+50+2*kp*(Lx-x0)*(x-Lx);
      }
      loop(function(now){
        if(!lastP) lastP=now;
        var dt=Math.min(50,now-lastP); lastP=now;
        if(!paused) phP+=dt;
        if(!pc.offsetParent) return;
        var u=(phP%3200)/2400, x=x0+Math.min(1,u)*(xEnd-x0), y=yAt(x);
        pctx.clearRect(0,0,520,240);
        pctx.fillStyle='#FFB3BA'; pctx.fillRect(90,52,300,9);
        pctx.fillStyle='#BFE3F5'; pctx.fillRect(90,179,300,9);
        pctx.strokeStyle='rgba(127,179,213,.38)'; pctx.fillStyle='rgba(127,179,213,.6)'; pctx.lineWidth=1;
        for(var gx=120; gx<=380; gx+=52){
          pctx.beginPath(); pctx.moveTo(gx,64); pctx.lineTo(gx,174); pctx.stroke();
          pctx.beginPath(); pctx.moveTo(gx-3,170); pctx.lineTo(gx+3,170); pctx.lineTo(gx,177); pctx.closePath(); pctx.fill();
        }
        pctx.setLineDash([4,5]); pctx.strokeStyle='rgba(176,155,214,.55)'; pctx.lineWidth=1.4;
        pctx.beginPath(); pctx.moveTo(x0,y0);
        for(var px=x0;px<=xEnd;px+=5) pctx.lineTo(px,yAt(px));
        pctx.stroke(); pctx.setLineDash([]);
        pctx.strokeStyle='#B39DDB'; pctx.lineWidth=2.4; pctx.beginPath(); pctx.moveTo(x0,y0);
        for(var qx=x0;qx<=x;qx+=4) pctx.lineTo(qx,yAt(qx));
        pctx.lineTo(x,y); pctx.stroke();
        pctx.strokeStyle='#7fbf9f'; pctx.fillStyle='#7fbf9f'; pctx.lineWidth=2;
        pctx.beginPath(); pctx.moveTo(x0-34,y0); pctx.lineTo(x0-4,y0); pctx.stroke();
        pctx.beginPath(); pctx.moveTo(x0-2,y0); pctx.lineTo(x0-11,y0-4); pctx.lineTo(x0-11,y0+4); pctx.closePath(); pctx.fill();
        pctx.fillStyle='#F4978E'; pctx.beginPath(); pctx.arc(x,y,5.5,0,Math.PI*2); pctx.fill();
        pctx.fillStyle='#5a6472'; pctx.font='12px sans-serif'; pctx.fillText('F = qE',396,92);
      });

      /* LC 振荡 */
      var lc = q('capLcCv'), lctx = lc.getContext('2d');
      lctx.setTransform(lc.width/520, 0, 0, lc.height/220, 0, 0);
      var X0=46, X1=506, cy2=110, A=68, phL=0, lastL=0;
      function qf(u){ return Math.cos(4*Math.PI*u); }
      function iff(u){ return -Math.sin(4*Math.PI*u); }
      function curve(fn,color,width){
        lctx.strokeStyle=color; lctx.lineWidth=width; lctx.beginPath();
        for(var x=X0;x<=X1;x+=2){
          var u=(x-X0)/(X1-X0), y=cy2-A*fn(u);
          if(x===X0) lctx.moveTo(x,y); else lctx.lineTo(x,y);
        }
        lctx.stroke();
      }
      loop(function(now){
        if(!lastL) lastL=now;
        var dt=Math.min(50,now-lastL); lastL=now;
        if(!paused) phL+=dt;
        if(!lc.offsetParent) return;
        var u=(phL%7000)/7000;
        lctx.clearRect(0,0,520,220);
        lctx.strokeStyle='rgba(160,175,190,.18)'; lctx.lineWidth=1;
        for(var i=0;i<=8;i++){ var gx=X0+(X1-X0)*i/8; lctx.beginPath(); lctx.moveTo(gx,28); lctx.lineTo(gx,192); lctx.stroke(); }
        lctx.strokeStyle='rgba(138,148,160,.55)'; lctx.beginPath(); lctx.moveTo(X0,cy2); lctx.lineTo(X1,cy2); lctx.stroke();
        curve(qf,'#F4978E',2.2); curve(iff,'#7FB3D5',2.2);
        lctx.fillStyle='#a35d65'; lctx.font='10px sans-serif'; lctx.fillText('Q最大 · I=0',X0+6,22);
        lctx.fillStyle='#4e7f9e'; lctx.fillText('I最大 · Q=0',X0+(X1-X0)/16-16,44);
        var px=X0+(X1-X0)*u;
        lctx.strokeStyle='rgba(90,100,114,.45)'; lctx.setLineDash([3,3]);
        lctx.beginPath(); lctx.moveTo(px,28); lctx.lineTo(px,192); lctx.stroke(); lctx.setLineDash([]);
        [[qf,'#F4978E'],[iff,'#7FB3D5']].forEach(function(pair){
          var py=cy2-A*pair[0](u);
          lctx.fillStyle=pair[1]; lctx.beginPath(); lctx.arc(px,py,4,0,Math.PI*2); lctx.fill();
        });
        var qv=qf(u), iv=iff(u), n=clamp(Math.round(2+5*Math.abs(qv)),2,7), top='', bot='';
        for(var j=0;j<n;j++){
          var sx=40+(j+0.5)*(20/n);
          top += '<text x="'+sx.toFixed(1)+'" y="65" fill="'+(qv>=0?'#a35d65':'#4e7f9e')+'" font-size="10" text-anchor="middle">'+(qv>=0?'+':'−')+'</text>';
          bot += '<text x="'+sx.toFixed(1)+'" y="99" fill="'+(qv>=0?'#4e7f9e':'#a35d65')+'" font-size="10" text-anchor="middle">'+(qv>=0?'−':'+')+'</text>';
        }
        q('capLcChargeTop').innerHTML = top;
        q('capLcChargeBottom').innerHTML = bot;
        q('capLcGlow').setAttribute('opacity',(0.12+0.42*Math.abs(qv)).toFixed(2));
        q('capArrR').style.display = iv>=0 ? '' : 'none';
        q('capArrL').style.display = iv<0 ? '' : 'none';
      });
    }

    /* ---------------- 视图 3：高考题型（即时判分） ---------------- */
    if(extIndex === 3){
      /* 第 2 题 C / U / Q 标记：点击显示含义与单位（与第 0 节行为一致） */
      var SYM_EXAM = {
        C: '电容 C：容纳电荷的本领，单位 F（法拉）；并联 C=C₁+C₂，串联 1/C=Σ1/Cᵢ。',
        U: '电压 U：两极板间电势差，单位 V（伏特）；并联各支路电压相等。',
        Q: '电荷量 Q：一块极板所带电荷的绝对值，单位 C（库仑）；并联 Q=Q₁+Q₂。'
      };
      var examChips = container.querySelectorAll('#capQ2SymFb');
      var chipBox = examChips[0];
      var examSymBtns = container.querySelectorAll('.cap-chip');
      for(var si=0; si<examSymBtns.length; si++){
        on(examSymBtns[si], 'click', function(){
          var sym = this.getAttribute('data-sym');
          for(var sj=0; sj<examSymBtns.length; sj++) examSymBtns[sj].classList.toggle('on', examSymBtns[sj] === this);
          if(chipBox) chipBox.textContent = sym + '：' + (SYM_EXAM[sym] || '电容器相关物理量。');
        });
      }
      function fb(id, ok, msg){
        var el = q(id);
        el.className = 'cap-fb ' + (ok ? 'ok' : 'no');
        el.textContent = (ok ? '✔ 正确：' : '✘ 不正确：') + msg;
      }
      function resetOpts(list){ for(var i=0;i<list.length;i++) list[i].className = 'cap-opt'; }
      /* 第 1 题：接电源 d↑ */
      var q1opts = container.querySelectorAll('#capQ1Opts .cap-opt');
      for(var a=0;a<q1opts.length;a++){
        on(q1opts[a], 'click', function(){
          var i = +this.getAttribute('data-i');
          resetOpts(q1opts);
          if(i === 1){
            this.classList.add('correct');
            fb('capQ1Fb', true, 'U 不变，d↑→C↓、Q=CU↓、E=U/d↓、W=½CU²↓。');
          }else{
            this.classList.add('wrong'); q1opts[1].classList.add('correct');
            fb('capQ1Fb', false, '应选 B；接电源时 U 被电源锁定。');
          }
        });
      }
      on(q('capQ1Range'), 'input', function(){
        q('capQ1Val').textContent = (+this.value).toFixed(2);
        resetOpts(q1opts); q('capQ1Fb').textContent = '';
      });
      /* 第 2 题：并联等效电容 */
      var c1 = q('capQ2C1'), c2 = q('capQ2C2');
      function expectedC(){ return (+c1.value) + (+c2.value); }
      [c1,c2].forEach(function(el, idx){
        var out = idx === 0 ? q('capQ2C1V') : q('capQ2C2V');
        on(el, 'input', function(){
          out.textContent = (+this.value).toFixed(1);
          q('capQ2Fb').textContent = '';
        });
      });
      on(q('capQ2Check'), 'click', function(){
        var ans = parseFloat(q('capQ2Ans').value), exp = expectedC();
        if(isNaN(ans)){ fb('capQ2Fb', false, '请先输入一个数字答案。'); return; }
        if(Math.abs(ans-exp)/exp < 0.05) fb('capQ2Fb', true, 'C=C₁+C₂=' + exp.toFixed(1) + '，并联电压相等、电荷相加。');
        else fb('capQ2Fb', false, '并联应相加：C=C₁+C₂=' + exp.toFixed(1) + '。');
      });
      /* 第 3 题：粒子偏转 + 情境动画 */
      var q3opts = container.querySelectorAll('#capQuizParticle, .cap-card.sky .cap-opt');
      var q3list = container.querySelectorAll('.cap-card.sky .cap-opt');
      for(var b=0;b<q3list.length;b++){
        on(q3list[b], 'click', function(){
          var i = +this.getAttribute('data-i');
          resetOpts(q3list);
          if(i === 1){ this.classList.add('correct'); fb('capQ3Fb', true, 'y=(qE/2mv₀²)x²，v₀ 越大偏转越小。'); }
          else { this.classList.add('wrong'); q3list[1].classList.add('correct'); fb('capQ3Fb', false, '应选 B；水平速度越大，在场中时间越短。'); }
        });
      }
      var vRange = q('capQ3V');
      on(vRange, 'input', function(){
        q('capQ3VVal').textContent = (+this.value).toFixed(1);
        resetOpts(q3list); q('capQ3Fb').textContent = '';
      });
      var quizChips = container.querySelectorAll('.cap-chip');
      for(var h=0;h<quizChips.length;h++){
        on(quizChips[h], 'click', function(){
          for(var z=0;z<quizChips.length;z++) quizChips[z].classList.toggle('on', quizChips[z] === this);
        });
      }

      var pc = q('capQuizParticle'), pctx = pc.getContext('2d');
      pctx.setTransform(pc.width/520, 0, 0, pc.height/240, 0, 0);
      var x0=90, y0=120, Lx=390, xEnd=470, phP=0, lastP=0;
      function kNow(v){ return 50/(Math.pow(300,2)*v*v); }
      function yAt(x, v){
        if(x<=Lx) return y0 + kNow(v)*(x-x0)*(x-x0);
        return y0 + 50/(v*v) + 2*kNow(v)*(Lx-x0)*(x-Lx);
      }
      loop(function(now){
        if(!lastP) lastP=now;
        var dt=Math.min(50,now-lastP); lastP=now;
        if(!paused) phP+=dt;
        if(!pc.offsetParent) return;
        var v = +vRange.value;
        var u=(phP%3200)/2400, x=x0+Math.min(1,u)*(xEnd-x0), y=yAt(x,v);
        pctx.clearRect(0,0,520,240);
        pctx.fillStyle='#FFB3BA'; pctx.fillRect(90,52,300,9);
        pctx.fillStyle='#BFE3F5'; pctx.fillRect(90,179,300,9);
        pctx.strokeStyle='rgba(127,179,213,.38)'; pctx.fillStyle='rgba(127,179,213,.6)'; pctx.lineWidth=1;
        for(var gx=120; gx<=380; gx+=52){
          pctx.beginPath(); pctx.moveTo(gx,64); pctx.lineTo(gx,174); pctx.stroke();
          pctx.beginPath(); pctx.moveTo(gx-3,170); pctx.lineTo(gx+3,170); pctx.lineTo(gx,177); pctx.closePath(); pctx.fill();
        }
        pctx.setLineDash([4,5]); pctx.strokeStyle='rgba(176,155,214,.55)'; pctx.lineWidth=1.4;
        pctx.beginPath(); pctx.moveTo(x0,y0);
        for(var px=x0;px<=xEnd;px+=5) pctx.lineTo(px,yAt(px,v));
        pctx.stroke(); pctx.setLineDash([]);
        pctx.strokeStyle='#B39DDB'; pctx.lineWidth=2.4; pctx.beginPath(); pctx.moveTo(x0,y0);
        for(var qx=x0;qx<=x;qx+=4) pctx.lineTo(qx,yAt(qx,v));
        pctx.lineTo(x,y); pctx.stroke();
        pctx.strokeStyle='#7fbf9f'; pctx.fillStyle='#7fbf9f'; pctx.lineWidth=2;
        pctx.beginPath(); pctx.moveTo(x0-34,y0); pctx.lineTo(x0-4,y0); pctx.stroke();
        pctx.beginPath(); pctx.moveTo(x0-2,y0); pctx.lineTo(x0-11,y0-4); pctx.lineTo(x0-11,y0+4); pctx.closePath(); pctx.fill();
        pctx.fillStyle='#F4978E'; pctx.beginPath(); pctx.arc(x,y,5.5,0,Math.PI*2); pctx.fill();
        pctx.fillStyle='#5a6472'; pctx.font='12px sans-serif'; pctx.fillText('F=qE',396,92);
      });
    }

    /* ---------------- 可靠清理 ---------------- */
    return function cleanup(){
      if(disposed) return;
      disposed = true; running = false;
      loops.forEach(function(r){ try{ global.cancelAnimationFrame(r.id); }catch(e){} });
      timers.forEach(function(id){ try{ global.clearTimeout(id); }catch(e){} });
      listeners.forEach(function(x){
        try{
          if(x.type === '__dom__'){ if(x.fn && x.fn.parentNode) x.fn.parentNode.removeChild(x.fn); }
          else x.el.removeEventListener(x.type, x.fn, x.opts);
        }catch(e){}
      });
      loops.length = 0; timers.length = 0; listeners.length = 0;
      try{ container.innerHTML = ''; }catch(e){}
    };
  }

  NS.modules['capacitor'] = { render: render };
})(window);
