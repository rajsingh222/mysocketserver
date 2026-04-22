const http = require("http");
const { Server } = require("socket.io");

// -----------------------------
// HTTP SERVER
// -----------------------------
const server = http.createServer((req, res) => {

  // ✅ HEALTH CHECK (important for Render)
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200);
    res.end("Socket server running 🚀");
    return;
  }

  // 🔥 NEW: HANDLE PYTHON DATA
  if (req.method === "POST" && req.url === "/data") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        console.log("📡 Python data received");

        // 🔥 SEND TO FRONTEND (REAL-TIME)
        io.emit("wave-data", data);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));

      } catch (err) {
        console.log("❌ JSON parse error:", err);

        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });

    return;
  }

  // DEFAULT RESPONSE
  res.writeHead(200);
  res.end("Socket server running");
});

// -----------------------------
// SOCKET.IO
// -----------------------------
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// -----------------------------
// SOCKET EVENTS
// -----------------------------
io.on("connection", (socket) => {
  console.log("🟢 CLIENT CONNECTED:", socket.id);

  // ✅ EXISTING FLOW (UNCHANGED)
  socket.on("new-file", (data) => {
    console.log("📁 FILE EVENT:", data);

    // broadcast to all dashboards
    io.emit("new-file", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 CLIENT DISCONNECTED:", socket.id);
  });
});

// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});