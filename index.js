const express = require('express');
const path = require('path');
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");
const log = require("./logger/log.js");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Ensure log storage
if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");
const logPath = path.join(__dirname, "cache", "logs.txt");
fs.writeFileSync(logPath, "", { flag: "a" });
const logStream = fs.createWriteStream(logPath, { flags: "a" });

let clients = [];

const originalLog = console.log;
console.log = (...args) => {
  const logMsg = args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ");
  originalLog(logMsg);
  logStream.write(logMsg + "\n");
  clients.forEach(ws => ws.readyState === 1 && ws.send(logMsg));
};

// WebSocket for live logs
const wss = new WebSocket.Server({ server });
wss.on("connection", ws => {
  clients.push(ws);
  ws.send("[Connected] ✅ GoatBot log viewer active");
  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
  });
});

// Route: /test
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// Route: /logs viewer (enhanced UI)
app.get("/logs", (req, res) => {
  res.send(`
  <html>
    <head>
      <title>GoatBot Logs</title>
      <style>
        body { font-family: monospace; background: #000; color: #0f0; padding: 10px; }
        #log { height: 80vh; overflow-y: scroll; white-space: pre-wrap; border: 1px solid #444; padding: 10px; margin-bottom: 10px; }
        .error { color: red; }
        button { background: #111; color: #0f0; border: 1px solid #0f0; padding: 5px 10px; margin-right: 5px; cursor: pointer; }
        button:hover { background: #222; }
      </style>
    </head>
    <body>
      <h2>📜 GoatBot Logs (Realtime)</h2>
      <div id="log">Loading...</div>
      <div>
        <button onclick="copyLogs()">📋 Copy</button>
        <a href="/logs.txt" download><button>📥 Download</button></a>
        <button onclick="scrollToTop()">⬆️ Top</button>
        <button onclick="scrollToBottom()">⬇️ Bottom</button>
        <button onclick="toggleAutoScroll()">🔁 Autoscroll: <span id="autoscroll-status">ON</span></button>
      </div>

      <script>
        const log = document.getElementById("log");
        let autoScroll = true;

        // Load initial logs
        fetch("/logs.txt")
          .then(r => r.text())
          .then(t => {
            log.innerHTML = colorize(t);
            if (autoScroll) log.scrollTop = log.scrollHeight;
          });

        // WebSocket
        const ws = new WebSocket("wss://" + location.host);
        ws.onmessage = e => {
          const line = colorize(e.data);
          log.innerHTML += "<br>" + line;
          if (autoScroll) log.scrollTop = log.scrollHeight;
        };

        // Highlight errors
        function colorize(text) {
          return text.replace(/\\n/g, "<br>").replace(/\.*?ERROR.*?\/gi, match => \`<span class="error">\${match}</span>\`);
        }

        // Scroll & copy
        function scrollToTop() {
          log.scrollTop = 0;
        }

        function scrollToBottom() {
          log.scrollTop = log.scrollHeight;
        }

        function toggleAutoScroll() {
          autoScroll = !autoScroll;
          document.getElementById("autoscroll-status").textContent = autoScroll ? "ON" : "OFF";
        }

        function copyLogs() {
          const temp = document.createElement("textarea");
          temp.value = log.textContent;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          document.body.removeChild(temp);
          alert("✅ Logs copied to clipboard!");
        }
      </script>
    </body>
  </html>
  `);
});

// Serve logs.txt for download
app.use("/logs.txt", express.static(logPath));

// Start web server
server.listen(port, () => {
  console.log(`📡 Web server running at http://localhost:${port}`);
});

// Start Goat.js and capture logs
function startProject() {
  console.log("[DEBUG] 𝐒𝐭𝐚𝐫𝐭𝐢𝐧𝐠 𝐁𝐨𝐭...");

  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    shell: true
  });

  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    console.log("[𝐀𝐫𝐚𝐟𝐚𝐭 𝐒𝐚𝐫𝐝𝐞𝐫]", msg);
  });

  child.stderr.on("data", (data) => {
    const err = data.toString().trim();
    console.log("[CMD LOADING]", err);
  });

  child.on("close", (code) => {
    console.log(`[Goat.js] Exited with code ${code}`);
    if (code == 2) {
      log.info("Restarting Project...");
      startProject();
    }
  });

  child.on("error", (err) => {
    console.log("[ERROR] Failed to start Arafat.js:", err.message);
  });
}

startProject();
