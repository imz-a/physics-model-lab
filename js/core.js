/* ============ core.js — 物理计算与全局状态（无依赖，第一个加载） ============ */
(function(){
  'use strict';
  var P = window.PhyLab = window.PhyLab || {};

  var METAL_T = 0.4;                          // 金属板厚度（归一化）
  var DEFAULTS = { d:1, S:1, er:1, metal:false };
  var state = { d:1, S:1, er:1, metal:false, sc:'U' };
  var baseline = { d:1, S:1, er:1, metal:false };
  var C0 = 1;
  var listeners = [];

  function dEff(p){ return p.metal ? Math.max(0.08, p.d - METAL_T) : p.d; }
  function Cof(p){ return p.er * p.S / dEff(p); }
  function computeC0(){ C0 = Cof(baseline); }

  /* 归一化：基准态先充电至 U0 = 1，故 Q0 = C0
     情景 A（接电源）：U 恒为 1
     情景 B（断电源）：Q 恒为 C0，E = C0/(εr·S) 与 d 无关 */
  function metrics(p, sc){
    var C = Cof(p), ge = dEff(p), U, Q, E, W;
    if(sc === 'U'){
      U = 1; Q = C; E = 1/ge; W = C/2;
    }else{
      Q = C0; U = C0/C; E = C0/(p.er*p.S); W = (C0*C0)/(2*C);
    }
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
    if(rel > 1e-4) return 'up';
    if(rel < -1e-4) return 'down';
    return 'flat';
  }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  function notify(){
    for(var i=0;i<listeners.length;i++){
      try{ listeners[i](); }catch(e){ /* 单个订阅者异常不影响其他 */ }
    }
  }
  function setParam(k, v){ state[k] = v; notify(); }
  function setScenario(sc){ state.sc = sc; notify(); }
  function setBaseline(){
    baseline = { d:state.d, S:state.S, er:state.er, metal:state.metal };
    computeC0(); notify();
  }
  function reset(){
    state.d = DEFAULTS.d; state.S = DEFAULTS.S; state.er = DEFAULTS.er; state.metal = DEFAULTS.metal;
    baseline = { d:DEFAULTS.d, S:DEFAULTS.S, er:DEFAULTS.er, metal:DEFAULTS.metal };
    computeC0(); notify();
  }
  function onChange(fn){ listeners.push(fn); }
  function getC0(){ return C0; }
  function getBaseline(){ return baseline; }

  computeC0();

  P.core = {
    METAL_T:METAL_T, DEFAULTS:DEFAULTS, state:state,
    dEff:dEff, Cof:Cof, getC0:getC0, getBaseline:getBaseline, metrics:metrics,
    fmt:fmt, trend:trend, clamp:clamp,
    setParam:setParam, setScenario:setScenario, setBaseline:setBaseline,
    reset:reset, onChange:onChange, notify:notify
  };
})();
