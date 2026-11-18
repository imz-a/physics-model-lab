/* ============ app.js — 标签页 / 手风琴 / 控件绑定 / 初始化（最后加载） ============ */
(function(){
  'use strict';
  var P = window.PhyLab;
  if(!P || !P.core) return;
  var core = P.core;
  function $(id){ return document.getElementById(id); }
  function fillRange(el){
    var min = +el.min, max = +el.max;
    el.style.setProperty('--fill', ((+el.value-min)/(max-min)*100).toFixed(1)+'%');
  }
  var toastEl = null, toastTimer = null;
  function toast(msg){
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.setAttribute('role','status');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translate(-50%,12px);background:#fff;border:1px solid #dce4ec;border-radius:10px;padding:8px 14px;font-size:12px;color:#3a4250;box-shadow:0 8px 24px rgba(88,108,132,.12);opacity:0;transition:.22s;z-index:99;pointer-events:none';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translate(-50%,0)';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translate(-50%,12px)';
    }, 1500);
  }

  /* 顶部标签页 */
  function initTabs(){
    var tabs = document.querySelectorAll('.tab');
    for(var i=0;i<tabs.length;i++){
      tabs[i].addEventListener('click', function(){
        var key = this.getAttribute('data-tab');
        for(var j=0;j<tabs.length;j++){
          var on = tabs[j] === this;
          tabs[j].classList.toggle('active', on);
          tabs[j].setAttribute('aria-selected', String(on));
        }
        var panels = document.querySelectorAll('.panel');
        for(var k=0;k<panels.length;k++){
          panels[k].classList.toggle('active', panels[k].id === 'panel-'+key);
        }
      });
    }
  }

  /* 拓展模型手风琴：一次只展开一个 */
  function initAccordion(){
    var items = document.querySelectorAll('.acc-item');
    for(var i=0;i<items.length;i++){
      items[i].querySelector('.acc-head').addEventListener('click', function(){
        var item = this.parentNode;
        var willOpen = !item.classList.contains('open');
        for(var j=0;j<items.length;j++){
          items[j].classList.remove('open');
          items[j].querySelector('.acc-head').setAttribute('aria-expanded','false');
        }
        if(willOpen){
          item.classList.add('open');
          this.setAttribute('aria-expanded','true');
        }
      });
    }
  }

  /* 模拟器控件 */
  function initSimulatorControls(){
    var ranges = [
      {id:'dRange', key:'d', out:'dVal', digits:2},
      {id:'sRange', key:'S', out:'sVal', digits:2},
      {id:'erRange', key:'er', out:'erVal', digits:1}
    ];
    ranges.forEach(function(r){
      var el = $(r.id);
      if(!el) return;
      fillRange(el);
      el.addEventListener('input', function(){
        core.setParam(r.key, +this.value);
        $(r.out).textContent = (+this.value).toFixed(r.digits);
        fillRange(this);
      });
    });
    $('metalBtn').addEventListener('click', function(){
      var v = !core.state.metal;
      core.setParam('metal', v);
      this.classList.toggle('on', v);
      this.setAttribute('aria-checked', String(v));
    });
    ['btnU','btnQ'].forEach(function(id){
      $(id).addEventListener('click', function(){
        core.setScenario(this === $('btnU') ? 'U' : 'Q');
        $('btnU').classList.toggle('active', core.state.sc==='U');
        $('btnQ').classList.toggle('active', core.state.sc==='Q');
      });
    });
    $('btnBase').addEventListener('click', function(){ core.setBaseline(); toast('已将当前参数设为比较基准'); });
    $('btnReset').addEventListener('click', function(){
      core.reset();
      ['dRange','sRange','erRange'].forEach(function(id){ fillRange($(id)); });
      $('dVal').textContent = '1.00'; $('sVal').textContent = '1.00'; $('erVal').textContent = '1.0';
      $('metalBtn').classList.remove('on'); $('metalBtn').setAttribute('aria-checked','false');
      $('btnU').classList.add('active'); $('btnQ').classList.remove('active');
      toast('已恢复默认参数与基准');
    });
  }

  /* 充放电控件 */
  function initRcControls(){
    $('btnCharge').addEventListener('click', function(){ P.animations.rc.setMode('charge'); });
    $('btnDischarge').addEventListener('click', function(){ P.animations.rc.setMode('discharge'); });
    $('btnPlayRc').addEventListener('click', function(){ P.animations.rc.togglePlay(); });
    $('btnResetRc').addEventListener('click', function(){ P.animations.rc.reset(); toast('充放电实验已重置'); });
  }

  function boot(){
    initTabs();
    initAccordion();
    initSimulatorControls();
    if(P.simulator) P.simulator.init();
    if(P.animations) P.animations.init();
    initRcControls();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
