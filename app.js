const library = document.querySelector('#library');
const player = document.querySelector('#player');
const frame = document.querySelector('#emulator');
const starting = document.querySelector('.starting');
const title = document.querySelector('#playing-title');

function openGame(rom, name) {
  title.textContent = name;
  library.hidden = true;
  player.hidden = false;
  starting.style.display = 'flex';
  const gameUrl = new URL(rom, location.href).href;
  const config = JSON.stringify(gameUrl);
  const gameName = JSON.stringify(name);
  frame.srcdoc = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body,#game{margin:0;width:100%;height:100%;overflow:hidden;background:#050605}body{display:flex}#game{width:100%;height:100%}</style></head><body><div id="game"></div><script>window.EJS_player="#game";window.EJS_core="snes";window.EJS_gameUrl='+config+';window.EJS_gameName='+gameName+';window.EJS_pathtodata="https://cdn.emulatorjs.org/stable/data/";window.EJS_startOnLoaded=true;<\/script><script src="https://cdn.emulatorjs.org/stable/data/loader.js"><\/script></body></html>';
  frame.onload = () => { setTimeout(() => starting.style.display = 'none', 5500); };
}

document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', () => openGame(card.dataset.rom, card.dataset.title));
});

document.querySelector('#back').addEventListener('click', () => {
  releaseAll();
  frame.srcdoc = '';
  player.hidden = true;
  library.hidden = false;
});

document.querySelector('#full').addEventListener('click', async () => {
  try { await frame.requestFullscreen(); } catch (error) { console.warn('Fullscreen unavailable', error); }
});

// Hold-to-play touch controls mirror the EmulatorJS default SNES keyboard layout.
const heldPointers = new Map();
function sendKey(key, type) {
  try {
    const doc = frame.contentDocument;
    if (!doc) return;
    const codes = {ArrowUp:38, ArrowDown:40, ArrowLeft:37, ArrowRight:39, x:88, z:90, s:83, a:65, Enter:13, Shift:16, q:81, w:87};
    const codeNames = {x:'KeyX', z:'KeyZ', s:'KeyS', a:'KeyA', q:'KeyQ', w:'KeyW'};
    const event = new KeyboardEvent(type, {key, code:codeNames[key] || key, bubbles:true, cancelable:true, composed:true});
    Object.defineProperty(event, 'keyCode', {get:() => codes[key] || 0});
    Object.defineProperty(event, 'which', {get:() => codes[key] || 0});
    doc.dispatchEvent(event);
  } catch (error) { /* The cartridge may still be starting. */ }
}
function releaseAll() {
  for (const key of heldPointers.values()) sendKey(key, 'keyup');
  heldPointers.clear();
}
document.querySelectorAll('[data-key]').forEach(button => {
  button.addEventListener('contextmenu', event => event.preventDefault());
  button.addEventListener('dragstart', event => event.preventDefault());
  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    const key = button.dataset.key;
    button.setPointerCapture?.(event.pointerId);
    heldPointers.set(event.pointerId, key);
    button.classList.add('pressed');
    sendKey(key, 'keydown');
  });
  const finish = event => {
    const key = heldPointers.get(event.pointerId);
    if (!key) return;
    heldPointers.delete(event.pointerId);
    button.classList.remove('pressed');
    sendKey(key, 'keyup');
  };
  button.addEventListener('pointerup', finish);
  button.addEventListener('pointercancel', finish);
  button.addEventListener('lostpointercapture', finish);
});
window.addEventListener('blur', releaseAll);
