const https = require('https');

async function testUrl(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`[${res.status}] ${url}`);
    console.log(`Content length: ${text.length} bytes`);
    console.log(`Sample: ${text.trim().substring(0, 100)}\n`);
    return { status: res.status, ok: res.ok };
  } catch (err) {
    console.error(`Error requesting ${url}:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function run() {
  console.log('Testing live deployment at https://omiichat.antideploy.app...\n');
  await testUrl('https://omiichat.antideploy.app/health');
  await testUrl('https://omiichat.antideploy.app/googlea56af85a01950fad.html');
  await testUrl('https://omiichat.antideploy.app/');
}

run();
