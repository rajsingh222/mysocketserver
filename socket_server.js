const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Socket server running");
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("CLIENT CONNECTED:", socket.id);

  socket.on("new-file", (data) => {
    console.log("FILE EVENT:", data);

    // broadcast to all dashboards
    io.emit("new-file", data);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Running on port", PORT);
});