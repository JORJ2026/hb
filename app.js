const library = document.querySelector('#library');
const player = document.querySelector('#player');
const frame = document.querySelector('#emulator');
const starting = document.querySelector('.starting');
const title = document.querySelector('#playing-title');
const systemType = document.querySelector('#system-type');
const wordmark = document.querySelector('.controller-wordmark');
let selectedCard = null;
let captureTimer = null;
let captureSession = 0;

document.querySelectorAll('.game-card').forEach(card => {
  const shot = card.dataset.shot ? null : localStorage.getItem('cartridge-shot:' + card.dataset.rom);
  if (shot) {
    const image = card.querySelector('.title-shot');
    image.src = shot;
    image.classList.add('is-ready');
  }
});

function captureTitleArt() {
  if (!selectedCard || selectedCard.dataset.shot) return;
  try {
    const doc = frame.contentDocument;
    const source = doc && [...doc.querySelectorAll('canvas')].find(canvas => canvas.width > 100 && canvas.height > 80);
    if (!source) return;
    const shot = document.createElement('canvas');
    shot.width = 480; shot.height = 360;
    const ctx = shot.getContext('2d');
    ctx.drawImage(source, 0, 0, shot.width, shot.height);
    const pixels = ctx.getImageData(0, 0, shot.width, shot.height).data;
    let color = 0;
    for (let i = 0; i < pixels.length; i += 160) color += pixels[i] + pixels[i + 1] + pixels[i + 2];
    if (color / (pixels.length / 160) < 24) return;
    const data = shot.toDataURL('image/jpeg', 0.78);
    const image = selectedCard.querySelector('.title-shot');
    image.src = data;
    image.classList.add('is-ready');
    try { localStorage.setItem('cartridge-shot:' + selectedCard.dataset.rom, data); } catch {}
    clearInterval(captureTimer);
  } catch (error) { /* Some emulator renderers do not expose readable pixels. */ }
}

function openGame(rom, name, core, card) {
  const session = ++captureSession;
  selectedCard = card;
  clearInterval(captureTimer);
  title.textContent = name;
  const isGba = core === 'gba';
  player.classList.remove('code');
  player.classList.toggle('gba', isGba);
  wordmark.textContent = isGba ? 'GAME BOY ADVANCE' : 'SUPER NINTENDO';
  systemType.textContent = (isGba ? 'GBA' : 'SNES') + ' · EMULATORJS';
  library.hidden = true;
  player.hidden = false;
  starting.style.display = 'flex';
  const gameUrl = new URL(rom, location.href).href;
  const config = JSON.stringify(gameUrl);
  const gameName = JSON.stringify(name);
  const coreName = JSON.stringify(core);
  frame.srcdoc = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body,#game{margin:0;width:100%;height:100%;overflow:hidden;background:#050605}body{display:flex}#game{width:100%;height:100%}</style></head><body><div id="game"></div><script>window.EJS_player="#game";window.EJS_core='+coreName+';window.EJS_gameUrl='+config+';window.EJS_gameName='+gameName+';window.EJS_pathtodata="https://cdn.emulatorjs.org/stable/data/";window.EJS_startOnLoaded=true;<\/script><script src="https://cdn.emulatorjs.org/stable/data/loader.js"><\/script></body></html>';
  frame.onload = () => {
    setTimeout(() => starting.style.display = 'none', 5500);
    setTimeout(() => {
      if (session !== captureSession || player.hidden) return;
      captureTitleArt();
      captureTimer = setInterval(captureTitleArt, 1800);
    }, 3500);
    setTimeout(() => { if (session === captureSession) clearInterval(captureTimer); }, 25000);
  };
}

// In-code games: plain HTML pages loaded straight into the player frame.
function openCode(url, name, card) {
  const session = ++captureSession;
  selectedCard = card;
  clearInterval(captureTimer);
  title.textContent = name;
  player.classList.remove('gba');
  player.classList.add('code');
  systemType.textContent = 'IN-CODE · HTML5';
  library.hidden = true;
  player.hidden = false;
  starting.style.display = 'flex';
  frame.removeAttribute('srcdoc');
  frame.onload = () => {
    starting.style.display = 'none';
    try { frame.contentWindow.focus(); } catch (error) {}
    setTimeout(() => {
      if (session !== captureSession || player.hidden) return;
      captureTitleArt();
      captureTimer = setInterval(captureTitleArt, 1800);
    }, 3500);
    setTimeout(() => { if (session === captureSession) clearInterval(captureTimer); }, 25000);
  };
  frame.src = url;
}

document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', () => {
    if (card.dataset.html) return openCode(card.dataset.html, card.dataset.title, card);
    const core = card.dataset.system || (card.dataset.rom.endsWith('.gba') ? 'gba' : 'snes');
    openGame(card.dataset.rom, card.dataset.title, core, card);
  });
});

document.querySelector('#back').addEventListener('click', () => {
  captureSession++;
  releaseAll();
  clearInterval(captureTimer);
  frame.onload = null;
  frame.removeAttribute('srcdoc');
  frame.src = 'about:blank';
  player.hidden = true;
  player.classList.remove('gba', 'code');
  library.hidden = false;
});

document.querySelector('#full').addEventListener('click', async () => {
  try { await frame.requestFullscreen(); } catch (error) { console.warn('Fullscreen unavailable', error); }
});

// EmulatorJS keyboard bindings: arrows, X/Z face buttons, A/S auxiliary, Q/W shoulders.
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
