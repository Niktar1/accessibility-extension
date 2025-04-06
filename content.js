// content.js
axe.run(document, {
  resultTypes: ['violations']
}, (error, results) => {
  if (error) {
    window.postMessage({
      type: 'RELAY_TO_EXTENSION',
      message: { error: error.message }
    }, '*');
    return;
  }

  // Store violations FIRST
  window.postMessage({
    type: 'STORE_VIOLATIONS',
    violations: results.violations
  }, '*');

  // Then send results to extension
  window.postMessage({
    type: 'RELAY_TO_EXTENSION',
    message: { results }
  }, '*');
  
  console.log('Violations stored:', results.violations.length);
});