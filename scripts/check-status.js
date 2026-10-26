const fs = require('fs');
const path = require('path');
const os = require('os');
const token = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.antideploy', 'config.json'))).token;

fetch('https://antideploy.com/api/v1/deployments/ae3fa086-cc29-4ee3-9fcb-2eab21d44f55', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(d => {
  console.log('Status:', d.status, 'Finished:', d.finished);
  if (d.steps) {
    for (const s of d.steps) {
      console.log(` - ${s.key}: ${s.status} [${s.detail || ''}]`);
    }
  }
  if (d.error) console.log('Error:', d.error);
  if (d.summary) console.log('Summary:', d.summary);
  if (d.application && d.application.url) console.log('Live URL:', d.application.url);
})
.catch(e => console.error(e));
