import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
//   console.log("socket connected", socket.id);

  socket.on("join", ({ username, roomId }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients,
        user: username,
        socketId: socket.id,
      });
    });
  });



//   socket.on("code-change", ({ roomId, code }) => {
//     console.log(code);
//     socket.in(roomId).emit("code-change", { code });
//   });

socket.on("code-change", ({ roomId, code }) => {
        //   console.log(code);
    socket.in(roomId).emit("code-change", { code });
});

socket.on("mssg", ({ user, mssg, roomId }) => {
          // console.log(user,mssg);
    socket.in(roomId).emit("mssg", { user,mssg });
});

socket.on("lang", ({ langInd, roomId }) => {
          // console.log(user,mssg);
    socket.in(roomId).emit("lang", { langInd });
});

socket.on("input-change", ({ inp, roomId }) => {
          // console.log(user,mssg);
    socket.in(roomId).emit("input-change", { inp });
});

socket.on("output-change", ({ out, roomId }) => {
          // console.log(user,mssg);
    socket.in(roomId).emit("output-change", { out });
});

socket.on("sync-code", ({ socketId, code }) => {
        //   console.log(code);
        //   console.log('here');
    io.to(socketId).emit("code-change", { code });
});

socket.on("sync-lang", ({ socketId, langInd }) => {
        //   console.log(code);
        //   console.log('here');
    io.to(socketId).emit("lang", { langInd });
});

socket.on("sync-input", ({ socketId, inp }) => {
        //   console.log(code);
        //   console.log('here');
    io.to(socketId).emit("input-change", { inp});
});

socket.on("sync-output", ({ socketId, out }) => {
        //   console.log(code);
        //   console.log('here');
    io.to(socketId).emit("output-change", { out});
});

socket.on("sync-mssg", ({ allMssg,socketId }) => {
          // console.log("allmssg",allMssg);
        //   console.log('here');
    io.to(socketId).emit("all-mssg", allMssg);
});

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.to(roomId).emit("disconnected", {
        socketId: socket.id,
        user: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
