/* حكاية صياد | الإصدار v1 | تاريخ الإصدار 2026-11-26 */
(function(){
"use strict";
const $=id=>document.getElementById(id);

/* ---------- الحفظ (مستقل تمامًا عن حفظ دكان السعادة) ---------- */
const SAVE_KEY='hekaya_v1';
let S={money:0,caught:0,u:{rod:0,bait:0,bag:0,shoes:0},inv:{tilapia:0,catfish:0,mullet:0,gold:0,legend:0}};
try{
  const raw=localStorage.getItem(SAVE_KEY);
  if(raw){const s=JSON.parse(raw);if(s){
    S.money=Math.max(0,+s.money||0);S.caught=Math.max(0,+s.caught||0);
    if(s.u)for(const k in S.u)if(k in s.u)S.u[k]=Math.max(0,Math.min(5,Math.floor(+s.u[k]||0)));
    if(s.inv)for(const k in S.inv)if(k in s.inv)S.inv[k]=Math.max(0,Math.floor(+s.inv[k]||0));
  }}
}catch(e){}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}

/* ---------- بيانات السمك والتطويرات ---------- */
const FISH=[
  {k:'tilapia',n:'بلطي',w0:46,wr:-2,price:8,color:0x6fb6c9},
  {k:'catfish',n:'قرموط',w0:26,wr:-1,price:15,color:0x4a3626},
  {k:'mullet', n:'بوري',w0:16,wr:0, price:25,color:0x9aa7b0},
  {k:'gold',   n:'سمكة ذهبية',w0:8,wr:2, price:60,color:0xffd34d},
  {k:'legend', n:'سمكة أسطورية',w0:4,wr:1, price:150,color:0x8e5bff}
];
const UPG=[
  {k:'rod',  n:'صنارة أقوى', d:'تقلل وقت انتظار السمكة', base:60,max:5},
  {k:'bait', n:'طُعم أفضل',  d:'تزيد فرصة السمك النادر', base:80,max:5},
  {k:'bag',  n:'شنطة أكبر',  d:'تزيد سعة السمك',         base:50,max:5},
  {k:'shoes',n:'حذاء أسرع',  d:'تزيد سرعة الحركة',       base:70,max:5}
];
const cost=u=>Math.floor(u.base*Math.pow(1.6,S.u[u.k]));
const bagCap=()=>5+3*S.u.bag;
const waitTime=()=>Math.max(1.6,5*Math.pow(0.88,S.u.rod));
const moveSpeed=()=>3.1*(1+0.15*S.u.shoes);
const totalInv=()=>Object.values(S.inv).reduce((a,b)=>a+b,0);
function fishWeights(){return FISH.map(f=>Math.max(1,f.w0+f.wr*S.u.bait))}
function pickFish(){
  const w=fishWeights(),total=w.reduce((a,b)=>a+b,0);let r=Math.random()*total;
  for(let i=0;i<FISH.length;i++){if(r<w[i])return FISH[i];r-=w[i]}
  return FISH[0];
}

/* ---------- مشهد Three.js ---------- */
let renderer,scene,camera,player,water,spotMarker,bobber,line,biteFX;
const CAM_OFF={x:0,y:7.2,z:7.4};
function initScene(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x8fd3e8);
  scene.fog=new THREE.Fog(0x8fd3e8,22,42);
  camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.1,100);
  renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.setSize(innerWidth,innerHeight);

  scene.add(new THREE.AmbientLight(0xffffff,0.78));
  const dl=new THREE.DirectionalLight(0xffffff,0.75);dl.position.set(6,12,4);scene.add(dl);

  const sand=new THREE.Mesh(new THREE.BoxGeometry(18,0.4,12),new THREE.MeshStandardMaterial({color:0xe4c27a}));
  sand.position.set(0,-0.2,-3);scene.add(sand);
  // حدود رملية بسيطة (تلال صغيرة) تحدد حافة الخريطة
  for(const x of[-9.3,9.3]){const dune=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.2,12),new THREE.MeshStandardMaterial({color:0xd1a85c}));dune.position.set(x,0.4,-3);scene.add(dune)}

  water=new THREE.Mesh(new THREE.BoxGeometry(20,0.3,14),new THREE.MeshStandardMaterial({color:0x2f9bd6,transparent:true,opacity:0.92}));
  water.position.set(0,-0.3,7);scene.add(water);

  for(let i=0;i<6;i++){
    const plank=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.15,1),new THREE.MeshStandardMaterial({color:0x8a5a34}));
    plank.position.set(0,0.08,1.4+i*1.05);scene.add(plank);
  }
  [[-6,-6],[6,-6.5],[-7.2,0.5],[7,-1]].forEach(p=>scene.add(buildPalm(p[0],p[1])));

  spotMarker=new THREE.Mesh(new THREE.ConeGeometry(0.28,0.6,8),new THREE.MeshStandardMaterial({color:0xffdd33}));
  spotMarker.position.set(0,0.5,4.1);scene.add(spotMarker);

  bobber=new THREE.Mesh(new THREE.SphereGeometry(0.16,10,10),new THREE.MeshStandardMaterial({color:0xffffff}));
  bobber.position.set(0,-1,4.1);bobber.visible=false;scene.add(bobber);
  const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
  line=new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:0xffffff}));
  line.visible=false;scene.add(line);

  biteFX=buildExcl();biteFX.visible=false;scene.add(biteFX);

  player=buildPlayer();
  player.position.set(0,0,-1);
  scene.add(player);

  updateCamera();
}
function buildPalm(x,z){
  const g=new THREE.Group();
  const trunk=new THREE.Mesh(new THREE.BoxGeometry(0.35,2,0.35),new THREE.MeshStandardMaterial({color:0x7a4a28}));
  trunk.position.y=1;g.add(trunk);
  const leaves=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.4,1.7),new THREE.MeshStandardMaterial({color:0x2e8b3d}));
  leaves.position.y=2.1;g.add(leaves);
  g.position.set(x,0,z);
  return g;
}
function buildExcl(){
  const g=new THREE.Group();
  const bar=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.7,0.16),new THREE.MeshStandardMaterial({color:0xff3b30}));
  bar.position.y=0.5;g.add(bar);
  const dot=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.16,0.16),new THREE.MeshStandardMaterial({color:0xff3b30}));
  dot.position.y=0;g.add(dot);
  g.position.set(0,1.7,4.1);
  return g;
}
function buildPlayer(){
  const g=new THREE.Group();
  const skin=0xe0a878,shirt=0x2f6fb3,pants=0x3a3a3a,hat=0xc0392b,wood=0x6b4423;
  const mk=(w,h,d,c)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c}));
  const torso=mk(0.9,1,0.5,shirt);torso.position.y=1.1;g.add(torso);
  const head=mk(0.68,0.68,0.68,skin);head.position.y=1.93;g.add(head);
  const hatM=mk(0.76,0.22,0.76,hat);hatM.position.y=2.33;g.add(hatM);
  const legL=mk(0.34,0.9,0.4,pants);legL.position.set(-0.22,0.45,0);g.add(legL);
  const legR=mk(0.34,0.9,0.4,pants);legR.position.set(0.22,0.45,0);g.add(legR);
  const armL=mk(0.27,0.82,0.27,skin);armL.position.set(-0.58,1.15,0);g.add(armL);
  const armR=mk(0.27,0.82,0.27,skin);armR.position.set(0.58,1.15,0);g.add(armR);
  const rod=mk(0.08,1.7,0.08,wood);rod.position.set(0.6,1.95,0.35);rod.rotation.x=-0.55;g.add(rod);
  g.userData.legL=legL;g.userData.legR=legR;g.userData.walkT=0;
  return g;
}
function onResize(){
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
function updateCamera(){
  camera.position.set(player.position.x+CAM_OFF.x,player.position.y+CAM_OFF.y,player.position.z+CAM_OFF.z);
  camera.lookAt(player.position.x,player.position.y+1,player.position.z);
}

/* ---------- عصا التحكم (pointer events: تشتغل باللمس والماوس) ---------- */
const joy={active:false,id:null,cx:0,cy:0,dx:0,dy:0};
function initJoy(){
  const base=$('joyBase'),knob=$('joyKnob');
  function move(e){
    let dx=e.clientX-joy.cx,dy=e.clientY-joy.cy;const max=36,len=Math.hypot(dx,dy);
    if(len>max){dx=dx/len*max;dy=dy/len*max}
    joy.dx=dx/max;joy.dy=dy/max;
    knob.style.transform=`translate(${dx}px,${dy}px)`;
  }
  base.addEventListener('pointerdown',e=>{
    joy.active=true;joy.id=e.pointerId;
    const r=base.getBoundingClientRect();joy.cx=r.left+r.width/2;joy.cy=r.top+r.height/2;
    try{base.setPointerCapture(e.pointerId)}catch(err){}
    move(e);
  });
  base.addEventListener('pointermove',e=>{if(joy.active&&e.pointerId===joy.id)move(e)});
  function end(e){if(joy.id===e.pointerId){joy.active=false;joy.id=null;joy.dx=0;joy.dy=0;knob.style.transform='translate(0,0)'}}
  base.addEventListener('pointerup',end);
  base.addEventListener('pointercancel',end);
}

/* ---------- حركة اللاعب ---------- */
const BOUND={x:7.6,zMin:-7.6,zMax:3.1},SPOT_POS={x:0,y:0,z:4.1};
function nearSpot(){return player.position.distanceTo(SPOT_POS)<2.6}
function updateMovement(dt){
  const mx=joy.dx,my=joy.dy,mag=Math.hypot(mx,my);
  let moving=false;
  if(FS==='idle'&&mag>0.12){
    const spd=moveSpeed();
    player.position.x+=mx*spd*dt;
    player.position.z+=my*spd*dt;
    player.position.x=Math.max(-BOUND.x,Math.min(BOUND.x,player.position.x));
    player.position.z=Math.max(BOUND.zMin,Math.min(BOUND.zMax,player.position.z));
    player.rotation.y=Math.atan2(mx,my);
    moving=true;
  }
  const g=player;
  g.userData.walkT+=dt*(moving?9:0);
  const swing=moving?Math.sin(g.userData.walkT)*0.5:0;
  g.userData.legL.rotation.x=swing;g.userData.legR.rotation.x=-swing;
  updateCamera();
}

/* ---------- آلة حالة الصيد ---------- */
let FS='idle',FT=0;
function setHint(text,bite){const h=$('hint');h.textContent=text;h.classList.toggle('bite',!!bite)}
function refreshFishUI(){
  const cast=$('btnCast'),pull=$('btnPull');
  if(FS==='bite'){cast.style.display='none';pull.style.display='';}
  else{pull.style.display='none';cast.style.display='';cast.disabled=!(FS==='idle'&&nearSpot());}
}
function startCast(){
  if(FS!=='idle'||!nearSpot())return;
  FS='casting';FT=0.35;
  bobber.visible=true;line.visible=true;
  setHint('يلا نرمي الصنارة...');
  refreshFishUI();
}
function updateFishing(dt){
  if(FS==='idle'){
    setHint(nearSpot()?'يلا نرمي الصنارة':'امشي لحد الصنارة عشان تصطاد');
    refreshFishUI();
    return;
  }
  if(FS==='casting'){
    FT-=dt;
    if(FT<=0){FS='waiting';FT=waitTime()*(0.75+Math.random()*0.6);setHint('استنى شوية يا معلم...')}
  }else if(FS==='waiting'){
    FT-=dt;
    if(FT<=0){FS='bite';FT=1.7;biteFX.visible=true;setHint('شد يا صياد، في سمكة!',true);refreshFishUI()}
  }else if(FS==='bite'){
    FT-=dt;
    bobber.position.y=-0.15+Math.sin(performance.now()*0.02)*0.08;
    if(FT<=0)missFish();
  }
  // تحديث خط الصنارة من يد اللاعب للطفّافة
  if(bobber.visible){
    const tip=new THREE.Vector3(player.position.x+0.6,player.position.y+2.5,player.position.z+0.35);
    line.geometry.setFromPoints([tip,bobber.position.clone()]);
  }
}
function pullLine(){
  if(FS!=='bite')return;
  catchFish();
}
function endBobber(){bobber.visible=false;line.visible=false;biteFX.visible=false;}
function catchFish(){
  FS='idle';endBobber();refreshFishUI();
  if(totalInv()>=bagCap()){toast('الشنطة مليانة! بيع السمك الأول 🧺');save();refreshHUD();return}
  const f=pickFish();S.inv[f.k]++;S.caught++;save();
  toast('مبروك، اصطدت '+f.n+' 🎣');
  refreshHUD();
}
function missFish(){
  FS='idle';endBobber();refreshFishUI();
  toast('واحشتك السمكة... فلتت منك!');
  if(S.u.rod<2)setTimeout(()=>toast('الصنارة محتاجة تتطور يا معلم'),900);
}

/* ---------- البيع ---------- */
function sellAll(){
  let sum=0;FISH.forEach(f=>{sum+=S.inv[f.k]*f.price;S.inv[f.k]=0});
  if(sum<=0){toast('مفيش سمك تبيعه دلوقتي');return}
  S.money+=sum;save();toast('السمك اتباع، خد فلوسك: +'+sum+'ج');refreshHUD();renderShop();
}

/* ---------- التطويرات ---------- */
function buyUpg(k){
  const u=UPG.find(x=>x.k===k);if(!u)return;
  if(S.u[u.k]>=u.max)return;
  const c=cost(u);if(S.money<c)return;
  S.money-=c;S.u[u.k]++;save();refreshHUD();renderShop();
}
function renderShop(){
  const box=$('shop');box.innerHTML='';
  UPG.forEach(u=>{
    const b=document.createElement('button');b.className='up';
    const lv=S.u[u.k],mx=lv>=u.max,c=cost(u);
    b.innerHTML='<span>'+u.n+' – '+u.d+'</span><small>'+(mx?'أقصى مستوى':'مستوى '+lv+' • '+c+'ج')+'</small>';
    b.disabled=mx||S.money<c;
    b.onclick=()=>buyUpg(u.k);
    box.appendChild(b);
  });
}
function renderBag(){
  const box=$('bagList');box.innerHTML='';
  FISH.forEach(f=>{
    const row=document.createElement('div');row.className='fishrow';
    row.innerHTML='<span>'+f.n+'</span><b>×'+S.inv[f.k]+' ('+f.price+'ج/واحدة)</b>';
    box.appendChild(row);
  });
}

/* ---------- الواجهة ---------- */
function toast(msg){
  const t=document.createElement('div');t.className='tmsg';t.textContent=msg;
  $('toast').appendChild(t);setTimeout(()=>t.remove(),2500);
}
function refreshHUD(){
  $('hMoney').textContent='💰 '+S.money+'ج';
  $('hBag').textContent='🧺 '+totalInv()+'/'+bagCap();
  $('hCaught').textContent='🐟 '+S.caught;
}

function initUI(){
  initJoy();
  $('btnCast').onclick=startCast;
  $('btnPull').onclick=pullLine;
  $('btnSell').onclick=sellAll;
  $('btnUpg').onclick=()=>{renderShop();$('upgOverlay').classList.add('show')};
  $('upgClose').onclick=()=>$('upgOverlay').classList.remove('show');
  $('btnBag').onclick=()=>{renderBag();$('bagOverlay').classList.add('show')};
  $('bagClose').onclick=()=>$('bagOverlay').classList.remove('show');
  refreshFishUI();
  refreshHUD();
}

/* ---------- حلقة اللعبة ---------- */
let last=performance.now();
function loop(){
  const now=performance.now(),dt=Math.min(0.05,(now-last)/1000);last=now;
  updateMovement(dt);
  updateFishing(dt);
  const t=now*0.001;
  water.position.y=-0.3+Math.sin(t*0.8)*0.02;
  if(biteFX.visible)biteFX.position.y=1.6+Math.abs(Math.sin(t*8))*0.25;
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
}

/* ---------- البدء ---------- */
function boot(){
  if(typeof THREE==='undefined'){
    document.body.innerHTML='<p style="color:#fff;text-align:center;margin-top:40vh;font-family:Tahoma">تعذّر تحميل مكتبة الرسم ثلاثي الأبعاد. تأكد من اتصالك بالإنترنت وجرّب تاني.</p>';
    return;
  }
  initScene();
  initUI();
  window.addEventListener('resize',onResize);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
  requestAnimationFrame(loop);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
