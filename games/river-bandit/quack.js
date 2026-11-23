
/* Quack + womp sound module (synthesized, no files needed) */
(function(){
var ac,last=-1;
var AC=window.AudioContext||window.webkitAudioContext;
function ctx(){if(!AC)return null;try{ac=ac||new AC();if(ac.state==="suspended")ac.resume();return ac}catch(e){return null}}
function muted(){try{return typeof S!=="undefined"&&S&&S.mute===true}catch(e){return false}}
function quack1(c,t,p){
  var o=c.createOscillator(),bp=c.createBiquadFilter(),lp=c.createBiquadFilter(),g=c.createGain(),tr=c.createGain(),lf=c.createOscillator(),ld=c.createGain();
  o.type="sawtooth";o.frequency.setValueAtTime(p*1.5,t);o.frequency.exponentialRampToValueAtTime(p*.8,t+.16);
  bp.type="bandpass";bp.frequency.setValueAtTime(1000,t);bp.frequency.linearRampToValueAtTime(1500,t+.05);bp.frequency.linearRampToValueAtTime(900,t+.17);bp.Q.value=2.2;
  lp.type="lowpass";lp.frequency.value=3200;
  lf.frequency.value=62;ld.gain.value=.35;tr.gain.value=.65;lf.connect(ld);ld.connect(tr.gain);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.55,t+.015);g.gain.setValueAtTime(.45,t+.1);g.gain.exponentialRampToValueAtTime(.0001,t+.2);
  o.connect(bp);bp.connect(lp);lp.connect(tr);tr.connect(g);g.connect(c.destination);
  o.start(t);lf.start(t);o.stop(t+.22);lf.stop(t+.22)}
window.QUACK=function(n){if(muted())return;var c=ctx();if(!c)return;n=n||1;var t=c.currentTime+.01,base=380+Math.random()*110;
  for(var i=0;i<n;i++){quack1(c,t+i*.24,base*(i%2?.93:1))}};
var W=[[233,"sawtooth",[1,1,1],.26,.7,6],[196,"sawtooth",[2,2,2],.3,.8,5],[220,"triangle",[1,2,3],.24,.9,7],[175,"square",[1,1,2],.28,.75,0],[262,"sawtooth",[2,1,1],.22,.6,6],[165,"sawtooth",[3,2,1],.3,.9,4],[247,"triangle",[1,1,1],.2,.7,8],[208,"square",[2,2,3],.25,.8,0],[185,"sawtooth",[1,2,2],.27,.85,5],[294,"sawtooth",[3,3,3],.22,.7,6],[147,"sawtooth",[2,2,4],.3,1,3],[233,"square",[1,1,1],.18,.6,0],[196,"triangle",[2,1,3],.26,.9,7],[277,"sawtooth",[1,1,3],.24,.7,5],[156,"square",[3,3,3],.32,.85,0],[220,"sawtooth",[2,3,5],.25,1,6],[330,"triangle",[2,2,2],.2,.6,8],[175,"sawtooth",[1,2,3],.28,.95,4],[262,"square",[1,3,2],.22,.7,0],[185,"triangle",[2,2,5],.3,1,6]];
var VOL={sawtooth:.2,square:.1,triangle:.32};
function semi(f,s){return f*Math.pow(2,-s/12)}
window.WOMP=function(){if(muted())return;var c=ctx();if(!c)return;
  var k;do{k=Math.floor(Math.random()*W.length)}while(k===last&&W.length>1);last=k;
  var P=W[k],root=P[0],wave=P[1],d=P[2],nd=P[3],ld=P[4],vib=P[5],t=c.currentTime+.01;
  var fr=[root,semi(root,d[0]),semi(semi(root,d[0]),d[1])];
  for(var i=0;i<3;i++){
    var last3=i===2,dur=last3?ld:nd,f=fr[i];
    var o=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();
    o.type=wave;o.frequency.setValueAtTime(f,t);
    if(last3){o.frequency.setValueAtTime(f,t+dur*.3);o.frequency.exponentialRampToValueAtTime(semi(f,d[2]),t+dur)}
    else{o.frequency.exponentialRampToValueAtTime(semi(f,.4),t+dur)}
    lp.type="lowpass";lp.Q.value=7;lp.frequency.setValueAtTime(f*1.6,t);lp.frequency.exponentialRampToValueAtTime(f*6,t+dur*.4);lp.frequency.exponentialRampToValueAtTime(f*2.2,t+dur);
    var v=VOL[wave];g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.03);g.gain.setValueAtTime(v,t+dur*.65);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    if(last3&&vib>0){var lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=vib;lg.gain.value=f*.025;lf.connect(lg);lg.connect(o.frequency);lf.start(t);lf.stop(t+dur+.05)}
    o.connect(lp);lp.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.05);
    t+=dur+.07}};
document.addEventListener("click",function(e){var el=e.target;if(el&&el.closest&&el.closest(".duck"))window.QUACK(1)});
})();
