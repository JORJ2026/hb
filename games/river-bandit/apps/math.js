
const $=s=>document.querySelector(s),R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[R(0,a.length-1)];
let S={grade:3,stars:0,done:{},op:"mix"};
try{Object.assign(S,JSON.parse(localStorage.getItem("gmt")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("gmt",JSON.stringify(S))}catch(e){}};
let timer=null;
const AC=window.AudioContext||window.webkitAudioContext;let ac;
const sfx=k=>{if(S.mute||!AC)return;if(k=="n"){WOMP();return}if(k=="y")setTimeout(()=>QUACK(1),130);if(k=="w")setTimeout(()=>QUACK(2),450);try{ac=ac||new AC();const seq={y:[[660,.08],[880,.12]],n:[[220,.2]],w:[[523,.1],[659,.1],[784,.1],[1047,.25]],t:[[440,.08],[523,.1]]}[k];let t=ac.currentTime;seq.forEach(([f,d])=>{const o=ac.createOscillator(),g=ac.createGain();o.type=k=="n"?"sawtooth":"triangle";o.frequency.value=f;g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d);t+=d})}catch(e){}};
const speak=t=>{try{if(S.mute)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.85;speechSynthesis.speak(u)}catch(e){}};
const stop=()=>{clearInterval(timer);timer=null;document.onkeydown=null};

/* ---------- Duck mascot ---------- */
const duck=(m="happy",s=110)=>{
 const eye=m=="cheer"?`<path d="M70 42q5-8 10 0" stroke="#222" stroke-width="3.5" fill="none" stroke-linecap="round"/>`:`<circle cx="75" cy="42" r="4.5" fill="#222"/><circle cx="76.5" cy="40.5" r="1.4" fill="#fff"/>`;
 const extra=m=="sad"?`<path d="M80 49q2 6 0 8q-3-2 0-8z" fill="#4db8ff"/><path d="M68 34l14 3" stroke="#222" stroke-width="2.5"/>`:"";
 const mouth=m=="sad"?"":`<path d="M92 56q4 3 9 0" stroke="#b35f00" stroke-width="2" fill="none"/>`;
 return `<svg class="duck ${m}" width="${s}" height="${s}" viewBox="0 0 120 120" aria-hidden="true">
 <ellipse cx="55" cy="90" rx="38" ry="25" fill="#ffd23f"/><path d="M20 82q-10-6-12-16q12 4 20 8z" fill="#ffd23f"/>
 <ellipse cx="50" cy="90" rx="20" ry="13" fill="#f5b800"/>
 <circle cx="76" cy="48" r="23" fill="#ffd23f"/><path d="M72 26q4-10 10-4" stroke="#ffd23f" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="97" cy="52" rx="14" ry="7" fill="#ff8a00"/><ellipse cx="62" cy="54" rx="5" ry="3.5" fill="#ff9aa2" opacity=".8"/>
 ${eye}${extra}${mouth}
 <ellipse cx="45" cy="115" rx="10" ry="4" fill="#ff8a00"/><ellipse cx="68" cy="115" rx="10" ry="4" fill="#ff8a00"/>
 <path d="M60 18l6-10 6 10z" fill="#e03e45" ${m=="cheer"?"":'style="display:none"'}/></svg>`};
const mascot=(txt,m="happy")=>`<div class="mascot">${duck(m)}<div class="say" id="say" aria-live="polite">${txt}</div></div>`;
const say=(t,m)=>{const el=$("#say");if(!el)return;el.innerHTML=t;const d=$(".duck");if(d&&m){d.outerHTML=duck(m)}};

const YAY=[`Quack-tastic!`,`You’re egg-ceptional!`,`Feather-ific!`,`Duck yeah! Correct!`,`Waddle you know… you’re right!`,`Nailed it, smarty-pants!`,`Beak-utiful work!`,`Cheep cheep hooray!`,`Gran would be so proud!`];
const OOPS=a=>[`Oopsie-daisy! It was ${a}.`,`Fowl play! The answer was ${a}.`,`Quack! So close. It was ${a}.`,`Even ducks fall in the pond. It was ${a}.`,`Hmm, my feathers say ${a}.`,`Whoopsie-quack! ${a} was the one.`];

/* ---------- question generator ---------- */
function gen(op,g=S.grade){
 if(op=="mix")op=pick(["+","-","×","÷"]);
 const m=[0,0,20,100,1000,10000][g];let a,b;
 if(op=="+"){a=R(Math.ceil(m/10),m);b=R(Math.ceil(m/10),m);return{t:`${a} + ${b}`,a:a+b}}
 if(op=="-"){a=R(Math.ceil(m/10),m);b=R(1,a);return{t:`${a} − ${b}`,a:a-b}}
 if(op=="×"){
  if(g==2){a=pick([2,5,10]);b=R(1,10)}else if(g==3){a=R(2,10);b=R(2,10)}else if(g==4){a=R(2,12);b=R(2,12)}else{a=R(12,50);b=R(2,9)}
  return{t:`${a} × ${b}`,a:a*b}}
 let d,c;
 if(g==2){d=pick([2,5,10]);c=R(1,10)}else if(g==3){d=R(2,10);c=R(1,10)}else if(g==4){d=R(2,12);c=R(2,12)}else{d=R(2,12);c=R(12,60)}
 return{t:`${d*c} ÷ ${d}`,a:c}}
function choices(a){const s=new Set([a]);let g=0;while(s.size<4&&g++<60){const n=a+pick([-1,1,-2,2,-10,10,R(-6,6)])*(a>40&&Math.random()<.3?1:1);if(n>=0)s.add(n)}let i=1;while(s.size<4)s.add(a+i++);return[...s].sort(()=>Math.random()-.5)}
const head=(back,title)=>`<div class="top"><button class="btn alt" onclick="${back}">◀ Back</button><b>${title||""}</b><span><button class="chip" aria-label="Sound on or off" onclick="S.mute=!S.mute;save();this.textContent=S.mute?'🔇':'🔊'">${S.mute?"🔇":"🔊"}</button> <span class="pill">⭐ ${S.stars}</span></span></div>`;
const win=n=>{S.stars+=n;save()};

/* ---------- Home ---------- */
const rank=()=>{const s=S.stars;return s<25?"🐣 Duckling":s<100?"🦆 Paddler":s<300?"🌊 Swimmer":s<700?"🪽 Flyer":"👑 Quack Master"};
(()=>{const d=new Date().toDateString(),y=new Date(Date.now()-864e5).toDateString();if(S.last!=d){S.days=S.last==y?(S.days||0)+1:1;S.last=d;save()}})();
const GRAN=[`Mistakes are just your brain doing push-ups.`,`A little practice every day beats a lot once a week.`,`If you get stuck, take a deep breath and quack it out.`,`Nobody was born knowing their 7s. Not even me!`,`I knew you were clever the day you hatched.`];
function home(){stop();
 $("#app").innerHTML=`<div class="top"><span class="pill">${rank()}</span><span class="pill">🔥 ${S.days||1}-day streak · ⭐ ${S.stars}</span></div>
 <div style="text-align:center"><div class="row" style="margin:0">${duck("happy",150)}</div>
 <h1 onclick='welcome()' style='cursor:pointer'>Gran’s Math Tutor</h1><p class="mut" style="margin:.2em">Quack the code of numbers!</p></div>
 ${mascot(pick([`Hi there! I’m great at math, and also at standing on one leg.`,`Welcome back! Did you bring bread? No? Then we’ll do math.`,`Pick your grade, then let’s waddle into learning!`]))}
 <h2 style="text-align:center;margin:12px 0 10px">What do you want to practice?</h2><div class="ops">${[["+","➕","Add","#d95f00"],["-","➖","Subtract","#1d7fe0"],["×","✖️","Multiply","#6a45e6"],["÷","➗","Divide","#17995a"]].map(o=>`<button class="op" style="--c:${o[3]}" onclick="setup('${o[0]}')"><span>${o[1]}</span>${o[2]}</button>`).join("")}</div>
 <p class="card" style="text-align:center;margin:14px 0 8px"><b>Gran says:</b> ${pick(GRAN)}</p><p style="text-align:center;margin:6px 0"><b>My grade:</b></p>
 <div class="row">${[2,3,4,5].map(g=>`<button class="chip ${S.grade==g?"on":""}" onclick="S.grade=${g};save();home()">Grade ${g}</button>`).join("")}</div>
 <div class="grid" style="margin-top:16px">
 <button class="tile" onclick="learn()"><span class="em">📖</span>Learn<small>Times tables &amp; tips</small></button>
 <button class="tile" onclick="practiceMenu()"><span class="em">✏️</span>Practice<small>Mix &amp; worksheets</small></button>
 <button class="tile" onclick="games()"><span class="em">🎮</span>Fun Games<small>Pop, race &amp; match</small></button></div>`}

/* ---------- Learn ---------- */
const TRICKS={1:`Anything times 1 stays itself. It’s very shy.`,2:`Just double it! Two wings, two feet, two times table.`,3:`Count by 3s: it’s double plus one more. Ducklings come in threes!`,4:`Double it, then double it again. Quack-quack!`,5:`Answers end in 0 or 5, just like counting on your fingers. Hand it over!`,6:`Even answers only! 6 × 4 is 4 × 6, so you already know half of them.`,7:`Remember 5, 6, 7, 8: 56 = 7 × 8. Lucky seven is a sneaky one!`,8:`Double, double, double. That’s three quacks.`,9:`The two digits always add up to 9: 18, 27, 36… Magic!`,10:`Stick a zero on the end. Easiest trick in the pond.`,11:`Up to 9 × 11, just say the digit twice: 33, 44, 55!`,12:`Do the ×10, then add the ×2. A dozen eggs, a dozen quacks.`};
const FUN=[`Look at you go!`,`Is it just me, or are you getting smarter?`,`Another one! My beak is tingling.`,`Notice the pattern? Ducks love patterns.`,`I’d clap, but my wings are wet.`,`Halfway there! Waddle on!`,`Keep it up and I’ll do a dance.`,`Ooh, getting tough? Not for you!`,`Almost there! Don’t drop the bread.`,`Brain: stretched. Duck: impressed.`,`Nearly done! Quack with pride.`,`The last one! Ta-da!`];
function learn(){stop();
 $("#app").innerHTML=`${head("home()","Learn")}${mascot(`Pick a times table. We’ll learn it one number at a time, nice and slow, like a duck on a lazy river.`)}
 <h2>Times tables <span class="mut" style="font-size:1rem">${Object.keys(S.done).length}/12 mastered</span></h2><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(90px,1fr))">
 ${Array.from({length:12},(_,i)=>i+1).map(n=>`<button class="tile" style="padding:12px 4px" onclick="table(${n},1)">${n}×${S.done[n]?`<small>✅</small>`:`<small>&nbsp;</small>`}</button>`).join("")}</div>
 <div class="row" style="margin-top:12px"><button class="btn" onclick="mixedTables()">🎲 Mixed tables challenge</button></div><h2 style="margin-top:18px">Quick lessons</h2><div class="grid">
 <div class="card"><b>➕ Adding</b><p>Make a 10 first! <b>8 + 5</b>: take 2 from the 5 to make 8 + 2 = 10, then 10 + 3 = <b>13</b>.</p><button class="btn" onclick="startQuiz('+')">Try it</button></div>
 <div class="card"><b>➖ Subtracting</b><p>Count up! <b>13 − 8</b>: from 8 hop to 10 (2 hops), then to 13 (3 hops). 2 + 3 = <b>5</b>.</p><button class="btn" onclick="startQuiz('-')">Try it</button></div>
 <div class="card"><b>✖️ Multiplying</b><p>It’s fast adding! <b>4 × 3</b> is 3 + 3 + 3 + 3 = <b>12</b>. Four ponds with three ducks each.</p><button class="btn" onclick="startQuiz('×')">Try it</button></div>
 <div class="card"><b>➗ Dividing</b><p>Sharing fairly! <b>12 ÷ 3</b>: 12 breadcrumbs for 3 ducks is <b>4</b> each. Or ask: 3 times what is 12?</p><button class="btn" onclick="startQuiz('÷')">Try it</button></div></div>`}
function table(n,k){stop();
 let rows="";for(let i=1;i<=k;i++)rows+=`<div class="${i==k?"new":""}"><span>${n} × ${i}</span><span>= ${n*i}</span></div>`;
 const skip=Array.from({length:k},(_,i)=>`<span>${n*(i+1)}</span>`).join("");
 $("#app").innerHTML=`${head("learn()","The "+n+" times table")}
 ${mascot(k==1?`Today: the ${n}s! <b>Trick:</b> ${TRICKS[n]}`:FUN[k-1],k==12?"cheer":"happy")}
 <p class="mut" style="text-align:center;margin:4px">Counting by ${n}s:</p><div class="skip">${skip}</div>
 ${n*k<=60?`<div style="text-align:center;font-size:1.3rem;line-height:1.3">${("🦆".repeat(n)+"<br>").repeat(k)}</div>`:""}<div class="rows">${rows}</div><div class="bar"><i style="width:${k/12*100}%"></i></div>
 <div class="row"><button class="btn alt" onclick="speak('${n} times ${k} is ${n*k}')">🔊 Say it</button>${k<12?`<button class="btn" onclick="table(${n},${k+1})">Next one ▶</button>`:""}
 <button class="btn ${k<12?"alt":""}" onclick="tableQuiz(${n})">Test me on the ${n}s!</button></div>`}
function tableQuiz(n){const used=[];quiz({title:n+"× quiz",n:12,back:`table(${n},12)`,gen:()=>{let b;do{b=R(1,12)}while(used.includes(b)&&used.length<12);used.push(b);return{t:`${n} × ${b}`,a:n*b}},
 done:ok=>{if(ok>=10){S.done[n]=1;save()}}})}

/* ---------- Quiz setup ---------- */
var SU={};
const LV=["","","Easy","Medium","Hard","Expert"],NAME={"+":"Addition","-":"Subtraction","×":"Multiplication","÷":"Division"};
function setup(op){stop();if(typeof op=="string")SU={op,lvl:S.grade,tbl:null,n:10};
 const u=SU,mt=u.op=="×"||u.op=="÷",tm=u.tbl!==null;
 $("#app").innerHTML=`${head("welcome()",NAME[u.op])}${mascot(mt?`Pick a level, or choose one times table to master!`:`Pick a level and how many problems. Then quack away!`)}
 <div class="card su"><h3>Level</h3><div class="row">${[2,3,4,5].map(l=>`<button class="chip ${!tm&&u.lvl==l?"on":""}" onclick="SU.lvl=${l};SU.tbl=null;setup()">${LV[l]} ${"⭐".repeat(l-1)}</button>`).join("")}</div>
 ${mt?`<h3>…or one times table</h3><div class="tbls">${[...Array(12)].map((_,i)=>`<button class="chip ${u.tbl===i+1?"on":""}" onclick="SU.tbl=${i+1};setup()">${i+1}</button>`).join("")}<button class="chip ${u.tbl===0?"on":""}" onclick="SU.tbl=0;setup()">Mix</button></div>`:""}
 <h3>How many problems?</h3><div class="row">${[5,10,15,20].map(n=>`<button class="chip ${u.n==n?"on":""}" onclick="SU.n=${n};setup()">${n}</button>`).join("")}</div></div>
 <div class="row" style="margin-top:16px"><button class="btn go" onclick="goQuiz()">Start ▶</button></div>`}
function goQuiz(){const u=SU,t=u.tbl;
 const g=t===null?()=>gen(u.op,u.lvl):()=>{const n=t||R(2,12),b=R(1,12);return u.op=="×"?{t:`${n} × ${b}`,a:n*b}:{t:`${n*b} ÷ ${n}`,a:b}};
 quiz({title:NAME[u.op]+(t?` · ${t}s`:""),n:u.n,back:"setup()",gen:g,done:ok=>{if(t&&u.op=="×"&&ok>=Math.ceil(u.n*.85)){S.done[t]=1;save()}}})}
/* ---------- Practice ---------- */
const mixedTables=()=>quiz({title:"Mixed tables",n:15,back:"learn()",gen:()=>{const a=R(2,12),b=R(2,12);return{t:`${a} × ${b}`,a:a*b}}});
var QS,SHOW=0;
function sheet(r){stop();if(!r){QS=Array.from({length:20},()=>gen("mix"));SHOW=0}
 $("#app").innerHTML=`<div class="row" id="np"><button class="btn alt" onclick="practiceMenu()">◀ Back</button><button class="btn" onclick="print()">🖨️ Print</button><button class="btn alt" onclick="SHOW=!SHOW;sheet(1)">Answers ${SHOW?"off":"on"}</button><button class="btn alt" onclick="sheet()">New sheet</button></div><h2>Name: ________ &nbsp; Grade ${S.grade}</h2><div style="columns:2;font-size:1.4rem;font-weight:800;line-height:2.3">${QS.map((q,i)=>`${i+1}. ${q.t} = ${SHOW?`<u>${q.a}</u>`:"_____"}<br>`).join("")}</div>`}
function practiceMenu(){stop();
 $("#app").innerHTML=`${head("home()","Practice")}${mascot(`Got any grapes?`)}<div class="row"><button class="btn alt" onclick="sheet()">🖨️ Printable worksheet</button></div>
 <div class="grid" style="margin-top:12px">${[["+","➕","Addition"],["-","➖","Subtraction"],["×","✖️","Multiplication"],["÷","➗","Division"],["mix","🎲","Surprise mix"]].map(o=>`<button class="tile" onclick="startQuiz('${o[0]}')"><span class="em">${o[1]}</span>${o[2]}<small>Grade ${S.grade}</small></button>`).join("")}</div>`}
function startQuiz(op){quiz({title:"Practice",n:10,back:"practiceMenu()",gen:()=>gen(op)})}
function quiz(o0){const o={...o0},N0=o.n,redo=[];stop();let i=0,ok=0,cur,val="",lock=false;
 function next(){if(i>=o.n)return end();cur=redo.length&&i>=N0?redo.shift():o.gen();val="";lock=false;i++;draw()}
 function draw(){
  $("#app").innerHTML=`${head(o.back,o.title)}<div class="bar"><i style="width:${(i-1)/o.n*100}%"></i></div><p class="mut" style="text-align:center;margin:0">Question ${i} of ${o.n}</p>
  ${mascot(`Got any grapes?`)}
  <div class="q">${cur.t} = ?</div><div class="disp" id="d">${val}</div><p style="text-align:center;margin:0 0 8px"><button class="chip" onclick="hint()">💡 Hint</button> <span id="h" class="mut"></span></p>
  <div class="pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button onclick="K('${n}')">${n}</button>`).join("")}<button onclick="K('b')">⌫</button><button onclick="K('0')">0</button><button class="go" onclick="K('g')">✔</button></div>`}
 window.K=k=>{if(lock)return;if(k=="b")val=val.slice(0,-1);else if(k=="g"){if(val=="")return;check();return}else if(val.length<6)val+=k;$("#d").textContent=val};
 document.onkeydown=e=>{if(/^\d$/.test(e.key))K(e.key);else if(e.key=="Backspace")K("b");else if(e.key=="Enter")K("g")};
 function check(){lock=true;const d=$("#d"),good=+val==cur.a;
  if(good){if(!cur.r)ok++;win(1);sfx("y");d.classList.add("good");say(pick(YAY),"cheer")}else{sfx("n");if(!cur.r&&o.n<N0+3){o.n++;redo.push({t:cur.t,a:cur.a,r:1})}d.classList.add("bad");d.textContent=`${val} → ${cur.a}`;say(pick(OOPS(cur.a)),"sad")}
  setTimeout(next,good?1000:2200)}
 function end(){document.onkeydown=null;const pct=ok/N0;if(o.done)o.done(ok);if(pct>=.8)win(5);sfx(pct>=.8?"w":"t");
  $("#app").innerHTML=`${head(o.back,"All done!")}<div class="big">${pct>=.8?"🏆":pct>=.5?"🎉":"🐣"}</div><h2 style="text-align:center">${ok} out of ${N0}</h2>
  ${mascot(pct>=.8?`WOW! ${ok}! I’m so proud I could lay an egg. (Bonus: +5 stars!)`:pct>=.5?`Good job! A little more practice and you’ll be quacking the code.`:`Don’t worry! Everyone starts as a duckling. Try the Learn page, then come back!`,pct>=.5?"cheer":"happy")}
  <div class="row"><button class="btn" onclick="quiz(window.__o)">Play again</button><button class="btn alt" onclick="home()">Home</button></div>`}
 window.hint=()=>{const a=String(cur.a);$("#h").textContent=`${a.length} digit${a.length>1?"s":""}, starts with ${a[0]}`};window.__o=o0;next()}

/* ---------- Games ---------- */
function games(){stop();
 $("#app").innerHTML=`${head("home()","Fun Games")}${mascot(`Games! My favorite thing after naps and puddles. Choose the kind of sums first.`)}
 <div class="row" style="margin:10px 0">${[["+","➕"],["-","➖"],["×","✖️"],["÷","➗"],["mix","🎲"]].map(o=>`<button class="chip ${S.op==o[0]?"on":""}" onclick="S.op='${o[0]}';games()">${o[1]}</button>`).join("")}</div>
 <div class="grid"><button class="tile" onclick="speed()"><span class="em">⚡</span>Speed Quack<small>60 seconds. Go go go!</small></button>
 <button class="tile" onclick="bubbles()"><span class="em">🫧</span>Bubble Pop<small>Pop the right answer</small></button>
 <button class="tile" onclick="match()"><span class="em">🥚</span>Egg Match<small>Match sums to answers</small></button></div>`}
function speed(){stop();let t=60,sc=0,st=0,best=0,cur,lock=false;
 function q(){cur=gen(S.op);lock=false;const c=choices(cur.a);
  $("#app").innerHTML=`${(document.onkeydown=e=>{const i=+e.key-1;if(i>=0&&i<4)document.querySelectorAll(".opt")[i]?.click()},"")}${head("games()","Speed Quack")}<div class="row"><span class="pill">⏱ <span id="t">${t}</span></span><span class="pill">Score ${sc}</span><span class="pill">🔥 ${st}</span></div>
  ${mascot(st>=3?`${st} in a row! Hot duck!`:`Quick! Tap the answer!`,st>=3?"cheer":"happy")}<div class="q">${cur.t}</div>
  <div class="opts">${c.map(n=>`<button class="opt" onclick="A(this,${n})">${n}</button>`).join("")}</div>`}
 window.A=(b,n)=>{if(lock)return;lock=true;if(n==cur.a){sc++;st++;best=Math.max(best,st);sfx("y");if(st%5==0)t+=3;b.classList.add("right")}else{st=0;sfx("n");b.classList.add("wrong");[...document.querySelectorAll(".opt")].find(x=>+x.textContent==cur.a).classList.add("right")}setTimeout(()=>{if(t>0)q()},n==cur.a?250:800)};
 timer=setInterval(()=>{t--;const e=$("#t");if(e)e.textContent=t;if(t<=0){stop();win(sc);sfx("w");const nb=sc>(S.bestSpeed||0);if(nb){S.bestSpeed=sc;save()}
  $("#app").innerHTML=`${head("games()","Time’s up!")}<div class="big">⚡</div><h2 style="text-align:center">${sc} correct! Best streak: ${best}${nb?" 🎉 New record!":` Record: ${S.bestSpeed}`}</h2>${mascot(sc>=15?`My wings are smoking! Incredible!`:`Not bad at all! My flipper-speed is ${sc+3}.`,"cheer")}<p style="text-align:center">+${sc} ⭐</p><div class="row"><button class="btn" onclick="speed()">Again!</button><button class="btn alt" onclick="games()">Games</button></div>`}},1000);
 q()}
function bubbles(){let lives=3,pop=0,cur,lock=false;
 function q(){cur=gen(S.op);lock=false;const c=choices(cur.a);
  $("#app").innerHTML=`${head("games()","Bubble Pop")}<div class="row"><span class="pill">${"❤️".repeat(lives)||"💔"}</span><span class="pill">Popped ${pop}/10</span></div>
  ${mascot(`Pop the bubble with the right answer! Splish splash!`)}<div class="q">${cur.t}</div>
  <div class="grid" style="grid-template-columns:1fr 1fr;max-width:420px;margin:0 auto">${c.map((n,i)=>`<button class="bub" style="animation-delay:${i*-.6}s" onclick="B(this,${n})">${n}</button>`).join("")}</div>`}
 window.B=(b,n)=>{if(lock)return;if(n==cur.a){lock=true;pop++;b.classList.add("pop");say(pick(YAY)+" POP!","cheer");setTimeout(()=>pop>=10?fin(true):q(),500)}
  else{lives--;sfx("n");b.disabled=true;b.style.opacity=.25;say(`Oops! That bubble was full of wrong. ${lives?"Try again!":""}`,"sad");if(lives<=0){lock=true;setTimeout(()=>fin(false),800)}else document.querySelector(".pill").textContent="❤️".repeat(lives)}};
 function fin(w){win(pop);$("#app").innerHTML=`${head("games()","Bubble Pop")}<div class="big">${w?"🫧🏆🫧":"💦"}</div><h2 style="text-align:center">${w?"You popped them all!":`You popped ${pop}!`}</h2>${mascot(w?`Splashtastic! I’m soaking, and I love it.`:`The pond got you this time. Dive back in!`,w?"cheer":"sad")}<p style="text-align:center">+${pop} ⭐</p><div class="row"><button class="btn" onclick="bubbles()">Again!</button><button class="btn alt" onclick="games()">Games</button></div>`}
 q()}
function match(){let pairs=[];const seen=new Set();while(pairs.length<6){const x=gen(S.op);if(!seen.has(x.t)&&![...pairs].some(p=>p.a==x.a)){seen.add(x.t);pairs.push(x)}}
 const cards=pairs.flatMap((p,i)=>[{id:i,t:p.t},{id:i,t:String(p.a)}]).sort(()=>Math.random()-.5);
 let open=[],found=0,tries=0,lock=false;
 function draw(){$("#app").innerHTML=`${head("games()","Egg Match")}<div class="row"><span class="pill">Tries ${tries}</span><span class="pill">Found ${found}/6</span></div>${mascot(`Find each sum and its answer. Eggs hide secrets!`)}
 <div class="eggs">${cards.map((c,i)=>`<button class="egg ${c.done?"done":open.includes(i)?"":"back"}" onclick="F(${i})">${c.done||open.includes(i)?c.t:"🥚"}</button>`).join("")}</div>`}
 window.F=i=>{if(lock||cards[i].done||open.includes(i))return;open.push(i);draw();
  if(open.length==2){tries++;const[a,b]=open;
   if(cards[a].id==cards[b].id){cards[a].done=cards[b].done=1;found++;open=[];setTimeout(()=>{draw();say(pick(YAY),"cheer");if(found==6){const s=Math.max(3,12-tries);win(s);say(`All hatched in ${tries} tries! +${s} ⭐ Egg-cellent!`,"cheer")}},250)}
   else{lock=true;sfx("n");setTimeout(()=>{open=[];lock=false;draw();say(`Not a match. That egg is hiding!`,"sad")},900)}}};
 stop();draw()}
const WOP=[['+','➕','Add','#d95f00'],['-','➖','Subtract','#1d7fe0'],['×','✖️','Multiply','#6a45e6'],['÷','➗','Divide','#17995a']]; var SEL=[],MULTI=false; function welcome(){stop();SEL=[];$('#app').innerHTML=`<div style='text-align:center'><div class='row' style='margin:0'>${duck('happy',150)}</div><h1 onclick='welcome()' style='cursor:pointer'>Gran’s Math Tutor</h1></div>${mascot('Which of the 4 operations are we working on today? Pick one or more.')}<div class='ops'>${WOP.map(o=>`<button class='op' id='o${WOP.indexOf(o)}' style='--c:${o[3]}' data-o='${o[0]}' aria-pressed='false' onclick='togOp(this)'><span>${o[1]}</span>${o[2]}</button>`).join('')}</div><div class='row' style='margin-top:14px'><button class='btn go' id='ogo' disabled onclick='startToday()'>Let’s go ▶</button></div><div class='row' style='margin-top:10px'><button class='btn alt' onclick='home()'>More: learn, games &amp; worksheets</button></div>`} function togOp(b){const o=b.dataset.o,i=SEL.indexOf(o);if(i<0)SEL.push(o);else SEL.splice(i,1);b.setAttribute('aria-pressed',i<0?'true':'false');b.style.outline=i<0?'4px solid #222':'none';$('#ogo').disabled=!SEL.length} function startToday(){if(!SEL.length)return;if(SEL.length==1){todayOp(SEL[0]);return}MULTI=true;if(SEL.includes('×'))timesPick();else mixGo(0)} function mixGo(n){const L=SEL.slice();quiz({title:'Today’s mix',n:12,back:'welcome()',gen:()=>{const op=pick(L);if(op=='×'&&n){const b=R(1,12);return{t:`${n} × ${b}`,a:n*b}}return gen(op)}})} function todayOp(o){MULTI=false;if(o=='×')timesPick();else setup(o)} function timesPick(){stop();$('#app').innerHTML=`${head('welcome()','Multiplication')}${mascot('Which times table (1 to 12) are we working on today?')}<div class='card su'><div class='tbls'>${[...Array(12)].map((_,i)=>`<button class='chip' data-n='${i+1}' onclick='timesChoice(+this.dataset.n)'>${i+1}${S.done[i+1]?' ✅':''}</button>`).join('')}<button class='chip' data-n='0' onclick='timesChoice(0)'>Mix</button></div></div>`} function timesChoice(n){stop();if(MULTI){mixGo(n);return}if(!n){SU={op:'×',lvl:S.grade,tbl:0,n:10};goQuiz();return} $('#app').innerHTML=`${head('timesPick()','The '+n+'s')}${mascot('The '+n+'s! Trick: '+TRICKS[n])}<div class='row' style='margin-top:14px'><button class='btn' onclick='table(${n},1)'>📖 Show me, step by step</button><button class='btn go' onclick='timesPractice(${n})'>✏️ Practice the ${n}s</button></div>`} function timesPractice(n){SU={op:'×',lvl:S.grade,tbl:n,n:10};goQuiz()}  welcome();
