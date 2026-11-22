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
  frame.srcdoc =     '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body,#game{margin:0;width:100%;height:100%;overflow:hidden;background:#050605}body{display:flex}#game{width:100%;height:100%}</style></head><body><div id="game"></div><script>window.EJS_player="#game";window.EJS_core="snes";window.EJS_gameUrl='+config+';window.EJS_gameName='+gameName+';window.EJS_pathtodata="https://cdn.emulatorjs.org/stable/data/";window.EJS_startOnLoaded=true;<\/script><script src="https://cdn.emulatorjs.org/stable/data/loader.js"><\/script></body></html>';
  frame.onload = () => { setTimeout(() => starting.style.display = 'none', 5500); };
}

document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', () => openGame(card.dataset.rom, card.dataset.title));
});

document.querySelector('#back').addEventListener('click', () => {
  frame.srcdoc = '';
  player.hidden = true;
  library.hidden = false;
});

document.querySelector('#full').addEventListener('click', async () => {
  try { await frame.requestFullscreen(); } catch (error) { console.warn('Fullscreen unavailable', error); }
});
