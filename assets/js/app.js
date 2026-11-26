(function(){
var D=window.PV||{},$=function(i){return document.getElementById(i)};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
var ST={available:"متاحة",dev:"قيد التطوير",soon:"قريبًا"};
function badge(s){return el("span","badge b-"+s,ST[s]||s)}
function btn(g){var a=el("a","btn",g.cta||"تشغيل اللعبة"),h=g.page||g.url;if(h&&g.status==="available"){a.href=h;if(!g.page){a.target="_blank";a.rel="noopener"}}else{a.className+=" off";a.textContent="قريبًا"}return a}
function cover(g){var i=el("img");i.src=g.cover||"";i.alt="غلاف "+g.name;i.loading="lazy";i.decoding="async";return i}

var games=D.games||[];
if(games.length){
  var g=games[0],L=$("latestGame"),w=el("div","latest"),n=el("div","in"),r=el("div","row");
  r.append(el("h3","",g.name),badge(g.status));if(g.version)r.append(el("span","badge",g.version));
  n.append(r,el("p","",g.desc),btn(g));w.append(cover(g),n);L.append(w);
  games.forEach(function(g){
    var c=el("article","card game"),i=el("div","in"),r=el("div","row");
    r.append(badge(g.status));if(g.version)r.append(el("span","badge",g.version));
    i.append(el("h3","",g.name),el("p","",g.desc),r,btn(g));c.append(cover(g),i);$("gameGrid").append(c)});
}else{$("latest").hidden=true;$("games").hidden=true}

var W=D.weekly,B=$("weeklyBox");
if(W){
  var wk=el("div","wk"),r=el("div","row");
  r.append(el("b","",W.game));if(W.week)r.append(el("span","badge","الأسبوع "+W.week));r.append(el("span","badge "+(W.status==="مكتمل"?"b-available":"b-dev"),W.status));
  wk.append(r,el("h3","",W.title),el("p","",W.description));
  if(W.announce)wk.append(el("p","ann",W.announce));
  if(W.done&&W.done.length){wk.append(el("h4","","تم الانتهاء"));var u=el("ul");W.done.forEach(function(x){u.append(el("li","",x))});wk.append(u)}
  if(W.history&&W.history.length){wk.append(el("h4","","سجل التحديثات"));var h=el("div","hist");
    W.history.forEach(function(x){var d=el("div");d.append(el("b","",x.label+" "),el("small","",x.date||""),el("p","",x.text));h.append(d)});wk.append(h)}
  B.append(wk)}

(D.platforms||[]).forEach(function(p){
  var ok=p.status==="available"&&p.url,c=ok?el("a","card plat"):el("div","card plat");
  if(ok){c.href=p.url;c.target="_blank";c.rel="noopener"}
  var i=el("div","ic",p.letter||p.name[0]);i.style.background=p.color||"#333";i.style.color="#fff";
  var t=el("div","t");t.append(el("b","",p.name),el("small","",p.note||""));
  c.append(i,t,badge(ok?"available":"soon"));$("platList").append(c)});

$("yr").textContent=new Date().getFullYear();

var links=[].slice.call(document.querySelectorAll(".nav a"));
if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+e.target.id)})}})},{rootMargin:"-40% 0px -55% 0px"});
  ["home","games","weekly","platforms"].forEach(function(i){io.observe($(i))})}
})();
