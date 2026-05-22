// const http = require("http");
// const { Server } = require("socket.io");

// // -----------------------------
// // HTTP SERVER
// // -----------------------------
// const server = http.createServer((req, res) => {

//   // ✅ HEALTH CHECK (important for Render)
//   if (req.method === "GET" && req.url === "/") {
//     res.writeHead(200);
//     res.end("Socket server running 🚀");
//     return;
//   }

//   // 🔥 NEW: HANDLE PYTHON DATA
//   if (req.method === "POST" && req.url === "/data") {
//     let body = "";

//     req.on("data", chunk => {
//       body += chunk.toString();
//     });

//     req.on("end", () => {
//       try {
//         const data = JSON.parse(body);

//         console.log("📡 Python data received");

//         // 🔥 SEND TO FRONTEND (REAL-TIME)
//         io.emit("wave-data", data);

//         res.writeHead(200, { "Content-Type": "application/json" });
//         res.end(JSON.stringify({ status: "ok" }));

//       } catch (err) {
//         console.log("❌ JSON parse error:", err);

//         res.writeHead(400);
//         res.end("Invalid JSON");
//       }
//     });

//     return;
//   }

//   // DEFAULT RESPONSE
//   res.writeHead(200);
//   res.end("Socket server running");
// });

// // -----------------------------
// // SOCKET.IO
// // -----------------------------
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// // -----------------------------
// // SOCKET EVENTS
// // -----------------------------
// io.on("connection", (socket) => {
//   console.log("🟢 CLIENT CONNECTED:", socket.id);

//   // ✅ EXISTING FLOW (UNCHANGED)
//   socket.on("new-file", (data) => {
//     console.log("📁 FILE EVENT:", data);

//     // broadcast to all dashboards
//     io.emit("new-file", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 CLIENT DISCONNECTED:", socket.id);
//   });
// });

// // -----------------------------
// // START SERVER
// // -----------------------------
// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



const http = require("http");
const { Server } = require("socket.io");

// 🔥 STORE LATEST PYTHON DATA
let latestWaveData = null;

// -----------------------------
// HTTP SERVER
// -----------------------------
const server = http.createServer((req, res) => {

  // ✅ HEALTH CHECK
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200);
    res.end("Socket server running 🚀");
    return;
  }

  // ✅ NEW JSON API
  // This DOES NOT affect existing flow
  if (req.method === "GET" && req.url === "/latest-data") {

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify({
      success: true,
      data: latestWaveData
    }));

    return;
  }

  // ✅ EXISTING PYTHON FLOW (UNCHANGED)
  if (req.method === "POST" && req.url === "/data") {

    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {

      try {

        const data = JSON.parse(body);

        console.log("📡 Python data received");

        // 🔥 SAVE LATEST DATA
        latestWaveData = data;

        // 🔥 EXISTING SOCKET FLOW (UNCHANGED)
        io.emit("wave-data", data);

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          status: "ok"
        }));

      } catch (err) {

        console.log("❌ JSON parse error:", err);

        res.writeHead(400);

        res.end("Invalid JSON");
      }
    });

    return;
  }
    // ------------------------------------
  // CONTINUOUS TELEMETRY DATA
  // ------------------------------------

  if (req.method === "POST" && req.url === "/continuous-data") {

    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {

      try {

        const data = JSON.parse(body);

        console.log("📈 Continuous telemetry received");

        // NEW SOCKET EVENT
        io.emit("continuous-wave-data", data);

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          status: "ok"
        }));

      } catch (err) {

        console.log("❌ Continuous JSON parse error:", err);

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