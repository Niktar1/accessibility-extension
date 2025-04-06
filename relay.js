// relay.js (injected into ISOLATED world)
window.addEventListener('message', (event) => {
  if (event.data.type === 'RELAY_TO_EXTENSION') {
    chrome.runtime.sendMessage(event.data.message);
  }
});
// relay.js (ISOLATED WORLD)
window.addEventListener('message', (event) => {
  if (event.data.type === 'FIXES_COMPLETE' || event.data.type === 'FIXES_ERROR') {
    chrome.runtime.sendMessage(event.data);
  }
});