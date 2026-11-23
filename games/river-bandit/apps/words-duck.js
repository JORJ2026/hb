/* Practice mascot: a duck that says "Got any grapes?" and pipes up with silly lines as you click around */
(function(){
  var LINES=[
    "Got any grapes?",
    "Got any grapes? Asking for a friend.",
    "Spell it slowly. I’ll wait. I have nowhere to be but this pond.",
    "Stop poking me. I’m trying to look dignified.",
    "Is that a sandwich? No? Then why are you poking it?",
    "I was napping. Now I’m awake, which is much worse.",
    "Psst. Every word has a secret. Find it!",
    "Do that again and I’ll start a duck-ing war.",
    "My feet are cold. Discuss.",
    "That tickled my tail feathers!",
    "Is it snack time? Tell me it’s snack time.",
    "I’m not a rubber duck. I have opinions.",
    "Bread is not a food. It’s a feeling.",
    "Quack! That’s my professional opinion on that spelling.",
    "I can see you clicking. I’m watching you.",
    "Wheee! Again! Again!",
    "Careful, you’ll make my head feathers frizzy.",
    "Who needs a clock when you have a pond?",
    "D-U-C-K. See? Easy. Next word, please!",
    "I once spelled ‘necessary’ right on the first try. Once."
  ];
  var DUCK='<svg class="duck" width="84" height="84" viewBox="0 0 120 120" aria-label="Duck mascot" role="button" tabindex="0">'+
    '<ellipse cx="55" cy="90" rx="38" ry="25" fill="#ffd23f"/><path d="M20 82q-10-6-12-16q12 4 20 8z" fill="#ffd23f"/>'+
    '<ellipse cx="50" cy="90" rx="20" ry="13" fill="#f5b800"/>'+
    '<circle cx="76" cy="48" r="23" fill="#ffd23f"/><path d="M72 26q4-10 10-4" stroke="#ffd23f" stroke-width="5" fill="none" stroke-linecap="round"/>'+
    '<ellipse cx="97" cy="52" rx="14" ry="7" fill="#ff8a00"/><ellipse cx="62" cy="54" rx="5" ry="3.5" fill="#ff9aa2" opacity=".8"/>'+
    '<circle class="eye" cx="75" cy="42" r="4.5" fill="#222"/><circle cx="76.5" cy="40.5" r="1.4" fill="#fff"/>'+
    '<path d="M92 56q4 3 9 0" stroke="#b35f00" stroke-width="2" fill="none"/>'+
    '<ellipse cx="45" cy="115" rx="10" ry="4" fill="#ff8a00"/><ellipse cx="68" cy="115" rx="10" ry="4" fill="#ff8a00"/></svg>';
  var box=document.createElement("div");
  box.id="duck";box.innerHTML='<div class="dbub" aria-live="polite"></div>'+DUCK;
  document.body.appendChild(box);
  var bub=box.querySelector(".dbub"),svg=box.querySelector(".duck"),last=-1,timer=null;
  function pick(){var i;do{i=Math.floor(Math.random()*LINES.length)}while(i===last&&LINES.length>1);last=i;return LINES[i]}
  function say(text){
    bub.textContent=text||pick();
    box.classList.remove("show");void box.offsetWidth;box.classList.add("show");
    svg.classList.remove("hop");void svg.getBoundingClientRect();svg.classList.add("hop");
    clearTimeout(timer);timer=setTimeout(function(){box.classList.remove("show")},3600);
  }
  svg.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();say()}});
  document.addEventListener("click",function(e){
    var t=e.target;
    if(!t||!t.closest)return;
    if(t.closest("input,textarea,select"))return;
    if(t.closest("#duck")){say();return}
    say();
  });
  setTimeout(function(){say("Got any grapes?")},600);
})();
