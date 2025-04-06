let fixedViolations = [];
document.getElementById('check').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const resultsDiv = document.getElementById('results');
  resultsDiv.textContent = 'Running accessibility checks...';

  try {
    // Inject relay
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['relay.js'],
      world: 'ISOLATED'
    });

    // Inject fix-handler
    const isFixHandlerLoaded = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!window.ruleFixes,
      world: 'MAIN'
    });

    if (!isFixHandlerLoaded[0].result) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['fix-handler.js'],
        world: 'MAIN'
      });
    }

    // Inject axe-core
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['axe-core.min.js'],
      world: 'MAIN'
    });

    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
      world: 'MAIN'
    });

    const listener = (message) => {
      if (message.error) {
        resultsDiv.textContent = `Error: ${message.error}`;
      } else {
        const violations = message.results.violations;
if (violations.length === 0) {
  resultsDiv.textContent = 'No accessibility violations found!';
} else {
  resultsDiv.innerHTML = violations.map(v => `
    <div class="violation">
      <div class="violation-header">
        <svg class="violation-icon" viewBox="0 0 24 24">
          <path d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8"/>
        </svg>
        <h3 class="violation-title">
          ${v.help}
          <span class="violation-id">(${v.id})</span>
        </h3>
      </div>
      <p class="violation-description">${v.description}</p>
      ${v.nodes.length > 0 ? `
        <div class="violation-nodes">
          <strong>Affected elements:</strong>
          <ul>${v.nodes.map(n => `<li>${n.html}</li>`).join('')}</ul>
        </div>
      ` : ''}
      <div class="violation-help">
        <a href="${v.helpUrl}" target="_blank">
          Learn how to fix this
          <svg style="width:14px;height:14px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
          </svg>
        </a>
      </div>
    </div>
  `).join('');
}
      }
      chrome.runtime.onMessage.removeListener(listener);
    };

    chrome.runtime.onMessage.addListener(listener);
  } catch (error) {
    resultsDiv.textContent = `Error: ${error.message}`;
  }
});

document.getElementById('fix').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const statusDiv = document.getElementById('status');
  
  const resultsDiv = document.getElementById('results');
  resultsDiv.textContent = '';
  
  statusDiv.innerHTML = `
    <div class="status-message">Applying fixes...</div>
    <div class="status-actions" hidden>
      <button id="show-fixes" class="view-fixes">Show Fixed Violations</button>
    </div>
  `;

  try {
    // Inject fix-handler
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['fix-handler.js'],
      world: 'MAIN'
    });

    // Then trigger fixes
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        window.postMessage({ type: 'APPLY_FIXES' }, '*');
      },
      world: 'MAIN'
    });

    // Handle results
    const listener = (message) => {
      if (message.type === 'FIXES_COMPLETE') {
        const messageEl = statusDiv.querySelector('.status-message');
        const actionsEl = statusDiv.querySelector('.status-actions');
        
        fixedViolations = message.successful;
        
        messageEl.innerHTML = `
          Fixed ${message.successful.length} issues successfully <br>
          ${message.failed.length > 0 ? 
            ` ${message.failed.length} fixes failed` : 
            'All fixes applied successfully'
          }
        `;
        
        actionsEl.hidden = false;
        chrome.runtime.onMessage.removeListener(listener);
      }
      
      if (message.type === 'FIXES_ERROR') {
        statusDiv.querySelector('.status-message').textContent = `Fix error: ${message.error}`;
        chrome.runtime.onMessage.removeListener(listener);
      }
    };
    
    chrome.runtime.onMessage.addListener(listener);

  } catch (error) {
    statusDiv.querySelector('.status-message').textContent = `Error: ${error.message}`;
  }
});

document.addEventListener('click', (e) => {
  if (e.target.id === 'show-fixes') {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
      <h3>Fixed Violations</h3>
      ${fixedViolations.map(v => `
        <div class="violation fixed-violation">
          <h3>${v.id} (${v.count} elements fixed)</h3>
          <p>Automatically resolved ${v.count} instances of this issue</p>
        </div>
      `).join('')}
    `;
  }
});