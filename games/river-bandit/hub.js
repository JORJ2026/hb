
const APPS={
  math:{title:"Gran’s Math Tutor",src:"apps/math.html"},
  words:{title:"Practice",src:"apps/words.html"},
  river:{title:"Elk River Bandit",src:"apps/river-bandit/index.html"}
};
const $=s=>document.querySelector(s),shell=$("#shell"),home=$("#home"),bar=$("#bar");
const frames={};let active=null;
let mobile=/iPhone|iPod/.test(navigator.userAgent);try{const v=localStorage.getItem("gst_mobile");if(v!==null)mobile=v==="1"}catch(e){}
const MOBCSS="html,body{overscroll-behavior:none;touch-action:manipulation;-webkit-touch-callout:none}body{-webkit-user-select:none;user-select:none;padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)}input,textarea,select{font-size:16px!important;-webkit-user-select:text;user-select:text}button,[role=button]{min-height:44px;touch-action:manipulation}";
function applyFrame(f){
  if(!f)return;
  try{const d=f.contentDocument;if(d&&d.head){
    let st=d.getElementById("gst-mob");
    if(mobile&&!st&&active!==null&&f!==frames.river){st=d.createElement("style");st.id="gst-mob";st.textContent=MOBCSS;d.head.appendChild(st)}
    if(!mobile&&st)st.remove();
    const m=d.querySelector('meta[name=viewport]');if(m){if(!m.dataset.o)m.dataset.o=m.content;m.content=mobile?m.dataset.o+", maximum-scale=1":m.dataset.o}
  }}catch(e){}
  try{f.contentWindow.setMobile&&f.contentWindow.setMobile(mobile)}catch(e){}
}
function setMobile(on,save){
  mobile=on;document.body.classList.toggle("mobile",on);
  for(const b of [$("#mb"),$("#mhome")])b.setAttribute("aria-pressed",on);
  $("#mhome b").textContent=on?"On":"Off";
  const standalone=window.navigator.standalone===true;$("#mtip").hidden=!(on&&/iPhone|iPad|iPod/.test(navigator.userAgent)&&!standalone);
  const m=$('meta[name=viewport]');if(!m.dataset.o)m.dataset.o=m.content;m.content=on?m.dataset.o+", maximum-scale=1":m.dataset.o;
  if(save!==false)try{localStorage.setItem("gst_mobile",on?"1":"0")}catch(e){}
  for(const j in frames)applyFrame(frames[j]);
}
function sync(){$("#tab").classList.toggle("on",active!==null&&bar.classList.contains("min"))}
function show(k){
  active=k;bar.classList.toggle("min",k=="river");sync();home.hidden=true;bar.classList.add("on");$("#bt").textContent=APPS[k].title;
  if(!frames[k]){
    const f=document.createElement("iframe");f.className="frame";f.title=APPS[k].title;
    f.setAttribute("allow","autoplay");f.addEventListener("load",()=>applyFrame(f));f.src=APPS[k].src;shell.appendChild(f);frames[k]=f;
  }
  for(const j in frames)frames[j].hidden=j!==k;if(k=="math"){try{frames[k].contentWindow.welcome()}catch(e){}}
  try{frames[k].focus()}catch(e){}
}
function goHome(){
  if(active=="river"&&frames.river){frames.river.remove();delete frames.river}
  active=null;bar.classList.remove("on","min");sync();home.hidden=false;
  for(const j in frames)frames[j].hidden=true;
  try{speechSynthesis.cancel()}catch(e){}
}
document.querySelectorAll(".app").forEach(b=>b.onclick=()=>show(b.dataset.a));
$("#hb").onclick=goHome;
$("#mb").onclick=()=>setMobile(!mobile);$("#mhome").onclick=()=>setMobile(!mobile);
setMobile(mobile,false);
$("#cb").onclick=()=>{bar.classList.add("min");sync()};
$("#tab").onclick=()=>{bar.classList.remove("min");sync()};
window.addEventListener("message",function(e){if(e.data&&typeof e.data.henryExam!=="undefined")bar.style.display=e.data.henryExam?"none":""});
$("#hero").onclick=()=>QUACK(1);$("#hero").onkeydown=e=>{if(e.key==="Enter"||e.key===" ")QUACK(1)};
