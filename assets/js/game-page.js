(function(){
var D=window.PV||{},$=function(i){return document.getElementById(i)};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function fix(p){return !p?"":/^(https?:)?\/\//.test(p)?p:"../"+p}
var ST={available:"متاحة",dev:"قيد التطوير",soon:"قريبًا"};
$("yr").textContent=new Date().getFullYear();

var id=new URLSearchParams(location.search).get("id");
var g=(D.games||[]).filter(function(x){return x.id===id})[0];
if(!g){$("gMissing").hidden=false;return}

document.title=g.name+" | PixelVerse";
$("gName").textContent=g.name;$("gDesc").textContent=g.desc||"";
var im=$("gImg");im.src=fix(g.preview||g.cover);im.alt="صورة من لعبة "+g.name;
var b=$("gBadges");b.append(el("span","badge b-"+g.status,ST[g.status]||g.status));
if(g.version)b.append(el("span","badge",g.version));
var m=$("gMeta");
[["الإصدار الحالي",g.version],["آخر تحديث",g.updated],["الحالة",ST[g.status]]].forEach(function(r){
  if(r[1]){var li=el("li");li.append(el("b","",r[0]+": "),document.createTextNode(r[1]));m.append(li)}});
$("gInfo").hidden=false;

var play=$("gPlay"),can=g.status==="available"&&g.embed;
if(!can){play.textContent="قريبًا";play.disabled=true;play.classList.add("off")}

var P=$("gPlayer"),F=$("gFrame"),full=$("pFull"),pf=false;
$("pTitle").textContent=g.name;
$("pOpen").href=g.url||g.embed||"#";

function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
function setFull(on){
  var req=P.requestFullscreen||P.webkitRequestFullscreen;
  if(on){
    if(req){try{var r=req.call(P);if(r&&r.catch)r.catch(function(){soft(true)})}catch(e){soft(true)}}else soft(true);
  }else{
    var ex=document.exitFullscreen||document.webkitExitFullscreen;
    if(fsEl()&&ex)ex.call(document);
    soft(false);
  }
}
function soft(on){pf=on;P.classList.toggle("pfs",on);document.body.classList.toggle("noscroll",on);label()}
function label(){full.textContent=(fsEl()||pf)?"خروج من الشاشة الكاملة":"ملء الشاشة"}
["fullscreenchange","webkitfullscreenchange"].forEach(function(ev){document.addEventListener(ev,function(){
  if(!fsEl())soft(false);else label()})});
full.onclick=function(){setFull(!(fsEl()||pf))};

play.onclick=function(){
  if(!can)return;
  $("gInfo").hidden=true;P.hidden=false;
  if(F.getAttribute("src")!==g.embed)F.src=g.embed;
  window.scrollTo(0,0);
};
$("pBack").onclick=function(){
  setFull(false);
  F.removeAttribute("src");   // إيقاف اللعبة (التقدم محفوظ تلقائي)
  P.hidden=true;$("gInfo").hidden=false;
};
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&pf)setFull(false)});
})();
