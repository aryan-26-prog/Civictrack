const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket Connected:", socket.id);
  });

  return io;
}

module.exports = { initSocket };
