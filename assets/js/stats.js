/* إحصائيات PixelVerse | عدّادات حقيقية عبر Abacus (نفس خدمة دكان السعادة لكن بمعرّفات منفصلة)
   - الزيارة بتتسجل مرة واحدة لكل متصفح في اليوم (تحديث الصفحة مش بيزوّد الرقم)
   - عدّاد لكل يوم (d-YYYY-MM-DD) + عدّاد إجمالي (views) في مساحة الأسماء pixelverse-*
   - أي رقم مش متاح بيظهر «—» ومفيش أرقام تجريبية أو وهمية
   - الإعدادات كلها في data/site.js (PV.stats.abacus) */
(function(){
'use strict';
var D=window.PV||{},C=(D.stats||{}).abacus||{};
function $(i){return document.getElementById(i)}
var box=$('stats'),note=$('snote');

if(!C.ns){
  if(box){note.textContent='الإحصائيات ستتوفر قريبًا.';$('sp').parentNode.hidden=true;$('sw').parentNode.hidden=true}
  return;
}

var API=String(C.api||'https://abacus.jasoncameron.dev/').replace(/\/?$/,'/'),
    NS=C.ns,TOTAL=C.total||'views',PFX=C.dayPrefix||'d-',SINCE=C.since||'',TZ=C.tz||'Africa/Cairo',
    NF='ar-EG',DAYS=7;

/* ---------- التاريخ (بنفس المنطقة الزمنية لكل الزوار) ---------- */
function today(){
  var s;
  try{s=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(e){}
  return /^\d{4}-\d{2}-\d{2}$/.test(s||'')?s:new Date().toISOString().slice(0,10);
}
function addDays(s,n){var p=s.split('-');return new Date(Date.UTC(+p[0],+p[1]-1,+p[2]+n)).toISOString().slice(0,10)}
function dayName(s){try{return new Date(s+'T12:00:00Z').toLocaleDateString(NF,{weekday:'short',timeZone:'UTC'})}catch(e){return s.slice(5)}}
function longDate(s){try{return new Date(s+'T12:00:00Z').toLocaleDateString(NF,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}catch(e){return s}}
function fmt(n){return n.toLocaleString(NF)}

/* ---------- Abacus ---------- */
// get: لو العدّاد لسه مش موجود (404) يبقى فعلًا مفيش زيارات اتسجلت = 0 حقيقي. أي خطأ تاني = رقم غير متاح (يرمي استثناء)
function call(op,key){
  var ctl=window.AbortController?new AbortController():null,t=ctl?setTimeout(function(){ctl.abort()},9000):0;
  return fetch(API+op+'/'+NS+'/'+key,{cache:'no-store',signal:ctl?ctl.signal:undefined}).then(function(r){
    clearTimeout(t);
    if(r.status===404&&op==='get')return{value:0};
    if(!r.ok)throw new Error(r.status);
    return r.json();
  }).then(function(d){var v=Number(d&&d.value);if(!isFinite(v)||v<0)throw new Error('bad');return v});
}

/* ---------- تسجيل الزيارة: مرة لكل متصفح في اليوم ---------- */
function store(){try{var k='__pv_t';localStorage.setItem(k,'1');localStorage.removeItem(k);return localStorage}catch(e){return null}}
function track(day){
  var ls=store();
  // لو مفيش تخزين نقدر نمنع التكرار بيه، أو الزائر بوت: منسجّلش (أحسن من إننا نزوّد الأرقام بشكل غير منطقي)
  if(!ls||navigator.webdriver||/bot|crawl|spider|headless|preview/i.test(navigator.userAgent||'')||document.visibilityState==='prerender')return Promise.resolve(null);
  if(ls.getItem('pv_hit')===day)return Promise.resolve(null);
  return call('hit',PFX+day).then(function(dv){
    try{ls.setItem('pv_hit',day)}catch(e){}
    return call('hit',TOTAL).then(function(tv){return{day:dv,total:tv}},function(){return{day:dv,total:null}});
  }).catch(function(){return null});
}

/* ---------- جلب الأرقام ---------- */
function load(day,tr){
  var list=[];for(var i=DAYS-1;i>=0;i--)list.push(addDays(day,-i));
  var jobs=list.map(function(d){
    if(SINCE&&d<SINCE)return Promise.resolve({d:d,v:null,pre:1}); // قبل بداية التسجيل: غير متاح مش صفر
    if(d===day&&tr&&tr.day!=null)return Promise.resolve({d:d,v:tr.day});
    return call('get',PFX+d).then(function(v){return{d:d,v:v}},function(){return{d:d,v:null,err:1}});
  });
  var tp=(tr&&tr.total!=null)?Promise.resolve(tr.total):call('get',TOTAL).catch(function(){return null});
  return Promise.all([tp,Promise.all(jobs)]);
}

/* ---------- العرض ---------- */
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el,n){
  if(reduce||n<2||!window.requestAnimationFrame){el.textContent=fmt(n);return}
  var t0=0,dur=900;
  function step(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1);el.textContent=fmt(Math.round(n*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step)}
  requestAnimationFrame(step);
}
function whenVisible(fn){
  if(!('IntersectionObserver' in window)){fn();return}
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();fn()}},{threshold:.2});io.observe(box);
}
function bars(rows,day){
  var max=Math.max.apply(null,rows.map(function(r){return r.v||0}))||1,wrap=$('bars');
  wrap.textContent='';
  rows.forEach(function(r){
    var b=document.createElement('div'),e=document.createElement('em'),tr=document.createElement('div'),i=document.createElement('i'),s=document.createElement('small');
    b.className='bar'+(r.d===day?' today':'')+(r.v==null?' na':r.v===0?' zero':'');
    e.textContent=r.v==null?'—':fmt(r.v);
    tr.className='tr';
    if(r.v!=null&&r.v>0)i.style.setProperty('--h',Math.max(r.v/max*100,6)+'%');
    s.textContent=r.d===day?'اليوم':dayName(r.d);
    tr.append(i);b.append(e,tr,s);wrap.append(b);
  });
  $('spark').hidden=false;
}
function render(res,day){
  var total=res[0],rows=res[1],ok=rows.filter(function(r){return r.v!=null}),errs=rows.filter(function(r){return r.err}).length,
      week=ok.reduce(function(a,r){return a+r.v},0),msgs=[];
  var tEl=$('sp'),wEl=$('sw');
  if(total==null&&!ok.length&&errs){box.classList.add('err');note.textContent='تعذّر تحميل الإحصائيات الآن. جرّب تفتح الصفحة تاني بعد شوية.';return}
  whenVisible(function(){
    box.classList.add('in');
    if(total!=null)countUp(tEl,total);
    if(ok.length)countUp(wEl,week);
  });
  if(total==null)msgs.push('تعذّر تحميل الإجمالي الآن.');
  if(errs&&ok.length)msgs.push('تعذّر تحميل بعض الأيام، والرقم المعروض يشمل الأيام المتاحة فقط.');
  if(ok.length)bars(rows,day);
  if(SINCE&&SINCE>rows[0].d)msgs.push('بدأ تسجيل الإحصائيات يوم '+longDate(SINCE)+'، والأيام قبله غير متاحة.');
  msgs.push('الزيارة بتتحسب مرة لكل متصفح في اليوم.');
  if(msgs.length>1&&(total==null||errs))box.classList.add('err');
  note.textContent=msgs.join(' ');
}

function run(){
  var day=today();
  track(day).then(function(tr){return load(day,tr)}).then(function(res){render(res,day)},function(){
    box.classList.add('err');note.textContent='تعذّر تحميل الإحصائيات الآن.';
  });
}

if(!box){ // صفحات تانية (زي صفحة اللعبة): تسجيل الزيارة بس
  var go=function(){track(today())};
  if('requestIdleCallback' in window)requestIdleCallback(go,{timeout:3000});else setTimeout(go,1500);
}else{
  if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:2000});else setTimeout(run,300);
}
})();
