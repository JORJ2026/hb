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
  document.body.classList.add('rom-playing');
  setImmersive(false);
  document.body.classList.remove('code-playing');
  try { if (document.fullscreenElement === player) document.exitFullscreen(); } catch (error) {}
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
  frame.srcdoc = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body,#game{margin:0;width:100%;height:100%;overflow:hidden;background:#050605}body{display:flex}#game{width:100%;height:100%}</style></head><body><div id="game"></div><script>window.EJS_player="#game";window.EJS_core='+coreName+';window.EJS_gameUrl='+config+';window.EJS_gameName='+gameName+';window.EJS_pathtodata="https://cdn.emulatorjs.org/stable/data/";window.EJS_startOnLoaded=true;window.EJS_defaultOptions={"virtual-gamepad":"disabled"};<\/script><script src="https://cdn.emulatorjs.org/stable/data/loader.js"><\/script></body></html>';
  frame.onload = () => {
    // Belt and braces: if EmulatorJS still starts with its own virtual gamepad on, switch it off once (it stays toggleable in Settings).
    let tries = 0;
    const gamepadOff = setInterval(() => {
      try {
        const emu = frame.contentWindow.EJS_emulator;
        if (emu && emu.started && typeof emu.changeSettingOption === 'function') {
          clearInterval(gamepadOff);
          if (emu.getSettingValue && emu.getSettingValue('virtual-gamepad') === 'enabled') emu.changeSettingOption('virtual-gamepad', 'disabled');
        }
      } catch (error) { /* not ready yet */ }
      if (++tries > 40 || session !== captureSession) clearInterval(gamepadOff);
    }, 500);
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
  document.body.classList.remove('rom-playing');
  setImmersive(false);
  player.classList.add('code');
  document.body.classList.add('code-playing');
  showHud();
  try { const fs = player.requestFullscreen && player.requestFullscreen(); if (fs && fs.catch) fs.catch(() => {}); } catch (error) { /* fullscreen not allowed here; the page is still full-viewport */ }
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
  setImmersive(false);
  player.classList.remove('gba', 'code');
  document.body.classList.remove('rom-playing');
  document.body.classList.remove('code-playing');
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch (error) {}
  library.hidden = false;
});

document.querySelector('#full').addEventListener('click', async () => {
  try { if (document.fullscreenElement) return await document.exitFullscreen(); await (player.classList.contains('code') ? player : frame).requestFullscreen(); } catch (error) { console.warn('Fullscreen unavailable', error); }
});

// On-screen pad -> EmulatorJS. Libretro button ids: 0 B, 1 Y, 2 Select, 3 Start, 4-7 D-pad, 8 A, 9 X, 10 L, 11 R.
// Keyboard fallback uses EmulatorJS's default bindings (x=B, z=A, s=Y, a=X, q=L, e=R, v=Select, Enter=Start).
const PAD = {
  'Up':[4,'ArrowUp',38], 'Down':[5,'ArrowDown',40], 'Left':[6,'ArrowLeft',37], 'Right':[7,'ArrowRight',39],
  'Select':[2,'v',86], 'Start':[3,'Enter',13], 'A':[8,'z',90], 'B':[0,'x',88], 'X':[9,'a',65], 'Y':[1,'s',83],
  'L shoulder':[10,'q',81], 'R shoulder':[11,'e',69]
};
const heldPointers = new Map();
function sendKey(name, type) {
  const pad = PAD[name];
  if (!pad) return;
  try {
    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    if (!win || !doc) return;
    const down = type === 'keydown';
    const emu = win.EJS_emulator;
    if (emu && emu.gameManager && typeof emu.gameManager.simulateInput === 'function') {
      emu.gameManager.simulateInput(0, pad[0], down ? 1 : 0);
      return;
    }
    const [, key, keyCode] = pad;
    const event = new win.KeyboardEvent(type, {key, code: key.length === 1 ? 'Key' + key.toUpperCase() : key, keyCode, which: keyCode, bubbles:true, cancelable:true, composed:true});
    Object.defineProperty(event, 'keyCode', {get:() => keyCode});
    Object.defineProperty(event, 'which', {get:() => keyCode});
    (doc.querySelector('.ejs_parent') || doc.querySelector('#game') || doc).dispatchEvent(event);
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
    const key = button.getAttribute('aria-label');
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

// Download: ROMs and single-file games save directly; multi-file games are zipped in the browser.
function toast(text) {
  let t = document.querySelector('#dl-toast');
  if (!t) { t = document.createElement('div'); t.id = 'dl-toast'; document.body.appendChild(t); }
  t.textContent = text; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 4500);
}
function saveBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function loadJsZip() {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'vendor/jszip.min.js';
    s.onload = () => resolve(window.JSZip); s.onerror = () => reject(new Error('zip library unavailable'));
    document.head.appendChild(s);
  });
}
async function downloadGame(card) {
  if (!card) return;
  try {
    if (card.dataset.rom) {
      const res = await fetch(card.dataset.rom); if (!res.ok) throw new Error('ROM not found');
      return saveBlob(await res.blob(), card.dataset.rom.split('/').pop());
    }
    const dir = card.dataset.html.replace(/index\.html$/, '');
    const slug = dir.replace(/\/$/, '').split('/').pop();
    const manifest = await fetch(dir + 'manifest.json');
    if (!manifest.ok) {
      const res = await fetch(card.dataset.html); if (!res.ok) throw new Error('file not found');
      return saveBlob(await res.blob(), slug + '.html');
    }
    toast('Packing ' + card.dataset.title + '…');
    const files = await manifest.json();
    const JSZip = await loadJsZip();
    const zip = new JSZip();
    for (const f of files) {
      const res = await fetch(dir + f); if (!res.ok) throw new Error('missing ' + f);
      zip.file(f, await res.blob());
    }
    saveBlob(await zip.generateAsync({type: 'blob', compression: 'STORE'}), slug + '.zip');
    toast('Downloaded ' + slug + '.zip');
  } catch (error) {
    toast('Download failed: ' + error.message + '. Serve the shelf from a web server or use the shelf zip.');
  }
}
document.querySelector('#download').addEventListener('click', () => downloadGame(selectedCard));
document.querySelectorAll('.dl-chip').forEach(chip => {
  const run = event => { event.stopPropagation(); event.preventDefault(); downloadGame(chip.closest('.game-card')); };
  chip.addEventListener('click', run);
  chip.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') run(event); });
});

// Floating controls for full-screen in-code games: open for a few seconds, then collapse to a small handle.
const hud = document.querySelector('.player-bar');
let hudTimer = null;
function showHud() {
  hud.classList.remove('collapsed');
  clearTimeout(hudTimer);
  hudTimer = setTimeout(() => hud.classList.add('collapsed'), 3500);
}
document.querySelector('#hud-toggle').addEventListener('click', () => {
  clearTimeout(hudTimer);
  hud.classList.toggle('collapsed');
});

// Full screen emulation mode: the picture fills the display and the on-screen pad floats over it.
function setImmersive(on) {
  const was = player.classList.contains('immersive');
  player.classList.toggle('immersive', on);
  document.body.classList.toggle('immersive-playing', on);
  const label = document.querySelector('#immerse');
  if (label) label.textContent = on ? '✕ EXIT FULL SCREEN' : '⛶ FULL SCREEN';
  try {
    if (on && !document.fullscreenElement && player.requestFullscreen) {
      const fs = player.requestFullscreen({navigationUI: 'hide'});
      if (fs && fs.catch) fs.catch(() => {});
    } else if (!on && was && document.fullscreenElement) {
      document.exitFullscreen();
    }
  } catch (error) { /* fullscreen not allowed here; the page still fills the viewport */ }
  releaseAll();
}
document.querySelector('#immerse').addEventListener('click', () => setImmersive(!player.classList.contains('immersive')));
